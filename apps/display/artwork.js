const artworkDirectory = new URL("/aircrafts/", window.location.origin);
const imageFiles = new Map();
const catalogRetryMs = 30_000;
const loadAircraftTypes = cacheCatalog("aircraft-types.json");
const loadArtwork = cacheCatalog("artwork.json", indexArtwork);

loadAircraftTypes();
loadArtwork();

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
    registrations.set(registration, registrations.has(registration) ? null : airframe.illustration);
  }

  const operatorIllustrations = new Map();
  for (const illustration of ready.values()) {
    if (illustration.airframeOnly || !illustration.icaoType) continue;
    for (const operator of new Set(illustration.operatorIcaoCodes ?? [])) {
      const key = `${operator}/${illustration.icaoType}`;
      operatorIllustrations.set(key, operatorIllustrations.has(key) ? null : illustration);
    }
  }

  preloadArtwork(ready.values());
  return { catalog, ready, registrations, operatorIllustrations };
}

export async function describeAircraftType(icaoType) {
  const types = await loadAircraftTypes();
  return formatAircraftType(types?.[icaoType]);
}

export async function aircraftImage(aircraft, operatorIcao, currentImage) {
  const [assets, types] = await Promise.all([loadArtwork(), loadAircraftTypes()]);
  if (!assets) return null;

  const { catalog, ready, registrations, operatorIllustrations } = assets;
  const hex = identifier(aircraft.hex);
  const registration = registrationKey(aircraft.r);
  const icaoType = identifier(aircraft.t);
  const type = types?.[icaoType];
  const category = aircraftCategory(type?.category, identifier(aircraft.category));

  const airframe = /^[A-F0-9]{6}$/.test(hex) ? catalog.airframes[hex] : undefined;
  const registrationConflicts = airframe && registration && registration !== registrationKey(airframe.registration);
  const specificId = registrationConflicts ? undefined : airframe?.illustration ?? registrations.get(registration);
  const specific = ready.get(specificId);
  const matchingAirframe = !icaoType || specific?.icaoType === icaoType ? specific : undefined;
  const operator = operatorIllustrations.get(`${identifier(operatorIcao)}/${icaoType}`);
  const candidates = new Set([matchingAirframe, operator]);
  for (const id of [catalog.fallbacks.byType[icaoType], catalog.fallbacks.byCategory[category]]) {
    const fallback = ready.get(id);
    if (!fallback?.airframeOnly) candidates.add(fallback);
  }

  for (const illustration of candidates) {
    const image = await decodeIllustration(illustration, types, currentImage);
    if (image) return image;
  }
  return null;
}

function identifier(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function registrationKey(value) {
  return identifier(value).replaceAll("-", "");
}

function aircraftCategory(catalogCategory, feedCategory) {
  if (catalogCategory === "airliner" || catalogCategory === "fixed-wing") return "fixed-wing";
  if (catalogCategory === "helicopter" || feedCategory === "A7") return "helicopter";
  return /^A[1-6]$/.test(feedCategory) ? "fixed-wing" : undefined;
}

async function decodeIllustration(illustration, types, currentImage) {
  if (!illustration) return null;
  const source = await loadImageFile(illustration.path);
  if (!source) return null;

  const label = formatAircraftType(types?.[illustration.icaoType]) || illustration.category;
  const alt = [label, illustration.livery].filter(Boolean).join(", ");
  if (currentImage?.src === source) {
    if (currentImage.alt !== alt) currentImage.alt = alt;
    return currentImage;
  }

  const image = new Image();
  image.alt = alt;
  image.src = source;
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

async function preloadArtwork(illustrations) {
  // Selected aircraft can request their images ahead of this background pass.
  for (const { path } of illustrations) {
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
