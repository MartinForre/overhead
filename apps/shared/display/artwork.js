const artworkDirectory = new URL("/aircrafts/", window.location.origin);
const imageFiles = new Map();
const catalogRetryMs = 30_000;
const loadAircraftTypes = cacheCatalog("aircraft-types.json");
const loadArtwork = cacheCatalog("artwork.json", indexArtwork);
const loadLandingGear = cacheCatalog("landing-gear/catalog.json", gearLayouts);

loadAircraftTypes();
loadArtwork();

function gearLayouts({ kits, illustrations }) {
  return new Map(Object.entries(illustrations).map(([path, { kit, groundPose, ...mounts }]) => {
    const parts = Object.entries(mounts).map(([part, [x, y, height]]) => {
      const sprite = kits[kit][part];
      return { ...sprite, x, y, height, url: new URL(`landing-gear/${sprite.file}`, artworkDirectory).href };
    });
    return [path, { parts, groundPose }];
  }));
}

export async function aircraftGear(image) {
  if (image) return (await loadLandingGear())?.get(image.dataset.artworkPath);
}

function cacheCatalog(path, prepare = (catalog) => catalog) {
  let result;
  let retryAt = 0;

  return function loadCatalog() {
    if (result) return result;
    if (Date.now() < retryAt) return null;

    result = fetchLocalFile(path).then((response) => response.json()).then((catalog) => {
      if (!catalog || typeof catalog !== "object" || Array.isArray(catalog)) {
        throw new Error(`Invalid catalog ${path}`);
      }
      return prepare(catalog);
    }).catch(() => {
      retryAt = Date.now() + catalogRetryMs;
      result = undefined;
      return null;
    });
    return result;
  };
}

function indexArtwork(catalog) {
  const ready = new Map(Object.entries(catalog.illustrations).filter(([, illustration]) =>
    illustration.status === "ready"));
  const registrations = new Map();
  for (const airframe of Object.values(catalog.airframes)) {
    const registration = registrationKey(airframe.registration);
    // Short numeric tail numbers need a confirmed airframe or operator.
    if (!/[A-Z]/.test(registration)) continue;
    registrations.set(registration, registrations.has(registration) ? null : airframe);
  }

  const operatorIllustrations = new Map();
  for (const illustration of ready.values()) {
    if (illustration.airframeOnly || !illustration.icaoType) continue;
    for (const operator of new Set(illustration.operatorIcaoCodes ?? [])) {
      const key = `${operator}/${illustration.icaoType}`;
      operatorIllustrations.set(key, operatorIllustrations.has(key) ? null : illustration);
    }
  }

  return { catalog, ready, registrations, operatorIllustrations };
}

export async function catalogAircraft(aircraft) {
  const [assets, types] = await Promise.all([loadArtwork(), loadAircraftTypes()]);
  const hex = identifier(aircraft.hex);
  const registration = registrationKey(aircraft.r);
  const feedType = identifier(aircraft.t);
  const reportedType = types?.[feedType]?.aliasFor ?? feedType;
  const hexMatch = /^[A-F0-9]{6}$/.test(hex) ? assets?.catalog.airframes[hex] : undefined;
  const registrationConflicts = hexMatch && registration && registration !== registrationKey(hexMatch.registration);
  const airframe = registrationConflicts ? undefined : hexMatch ?? assets?.registrations.get(registration);
  const illustration = assets?.catalog.illustrations[airframe?.illustration];
  const matchesType = !reportedType || reportedType === illustration?.icaoType ||
    reportedType === airframe?.misreportedIcaoType;
  const specific = matchesType ? illustration : undefined;
  const icaoType = specific?.icaoType ?? reportedType;
  const type = types?.[icaoType];
  return {
    icaoType,
    model: specific?.aircraft || formatAircraftType(type),
    category: aircraftCategory(type?.category, identifier(aircraft.category)),
    illustrationId: specific ? airframe.illustration : undefined,
  };
}

export async function aircraftImage({ icaoType, category, illustrationId }, operatorIcao, currentImage) {
  const [assets, types] = await Promise.all([loadArtwork(), loadAircraftTypes()]);
  if (!assets) return null;

  const { catalog, ready, operatorIllustrations } = assets;
  const specific = ready.get(illustrationId);
  const operator = operatorIllustrations.get(`${identifier(operatorIcao)}/${icaoType}`);
  const candidates = new Set([specific, operator]);
  const { byType, byCategory } = catalog.fallbacks;
  for (const id of [byType[icaoType], byCategory[category]]) {
    const fallback = ready.get(id);
    if (!fallback?.airframeOnly) candidates.add(fallback);
  }

  for (const illustration of candidates) {
    const image = await decodeIllustration(illustration, types, currentImage);
    if (image) return image;
  }
  return null;
}

export async function galleryAircraft(illustrationId) {
  const [assets, types] = await Promise.all([loadArtwork(), loadAircraftTypes()]);
  const illustration = assets?.ready.get(illustrationId);
  const name = illustration?.aircraft || formatAircraftType(types?.[illustration?.icaoType]);
  if (!name) return null;

  const image = await decodeIllustration(illustration, types);
  if (!image) return null;
  image.alt = "";
  return { image, name, detail: illustration.livery };
}

function identifier(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function registrationKey(value) {
  return identifier(value).replaceAll("-", "");
}

function aircraftCategory(catalogCategory, feedCategory) {
  if (catalogCategory === "general-aviation") return catalogCategory;
  if (catalogCategory === "airliner" || catalogCategory === "fixed-wing") return "fixed-wing";
  if (catalogCategory === "helicopter" || feedCategory === "A7") return "helicopter";
  if (feedCategory === "A1") return "general-aviation";
  return /^A[2-6]$/.test(feedCategory) ? "fixed-wing" : undefined;
}

async function decodeIllustration(illustration, types, currentImage) {
  if (!illustration) return null;
  const source = await loadImageFile(illustration.path);
  if (!source) return null;

  const label = illustration.aircraft || formatAircraftType(types?.[illustration.icaoType]) || illustration.category;
  const alt = [label, illustration.livery].filter(Boolean).join(", ");
  if (currentImage?.src === source) {
    if (currentImage.alt !== alt) currentImage.alt = alt;
    return currentImage;
  }

  const image = new Image();
  image.alt = alt;
  image.src = source;
  image.dataset.artworkPath = illustration.path;
  try {
    await image.decode();
    return image;
  } catch {
    return null;
  }
}

function formatAircraftType(type) {
  if (type) return [type.manufacturer, type.model].filter(Boolean).join(" ");
}

export async function preloadAircraftArtwork(signal) {
  const assets = await loadArtwork();
  if (!assets) return;

  // Selected aircraft can request their images ahead of this background pass.
  for (const { path } of assets.ready.values()) {
    if (signal.aborted) return;
    await loadImageFile(path);
  }
}

function loadImageFile(path) {
  if (!imageFiles.has(path)) {
    const file = fetchLocalFile(path)
      .then((response) => response.blob())
      .then((blob) => URL.createObjectURL(blob))
      .catch(() => {
        imageFiles.delete(path);
        return null;
      });
    imageFiles.set(path, file);
  }
  return imageFiles.get(path);
}

async function fetchLocalFile(path) {
  const url = new URL(path, artworkDirectory);
  const response = await fetch(url, { cache: "no-cache", signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`Could not load ${url.pathname}`);
  return response;
}
