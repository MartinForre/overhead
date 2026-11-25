import { createAircraftPresentation } from "./flight-card.js";
import { createFlightBoard } from "./flight-board.js";
import { waitForMotion } from "./flight-readout-motion.js";
import { sampleFlights, sampleHandoff } from "./preview-flights.js";

const nearbyStatus = document.querySelector("#nearby-status");
const nearbyUpdated = document.querySelector("#nearby-updated");
const nearbyList = document.querySelector("#nearby-aircraft");
const nearbyRange = document.querySelector("#nearby-range");
const radiusForm = document.querySelector("#nearby-radius-form");
const radiusInput = document.querySelector("#nearby-radius");
const radiusStatus = document.querySelector("#nearby-radius-status");
const previewSelect = document.querySelector("#traffic-preview");
const previewIndicator = document.querySelector("#preview-indicator");
const previewHandoff = document.querySelector("#preview-handoff");
const board = createFlightBoard(nearbyList, setNearbyStatus);
const radiusStorageKey = "overhead.display.radiusKm";
const defaultRadiusKm = 50;
const kmPerNauticalMile = 1.852;
const searchPaddingKm = 40;
const maxSearchRadiusNm = 250;
const maxRadiusKm = Math.floor(maxSearchRadiusNm * kmPerNauticalMile - searchPaddingKm);
const refreshIntervalMs = 5_000;
const maxPositionAgeSeconds = 30;
const groundTargetTypes = new Set(["GND", "GRND", "SERV", "EMER", "TWR"]);

let radiusKm = readSavedRadius();
let nearbyLocation;
let previewCount = 0;
let displayController;
let refreshTimer;
let activeAircraft = new Map();
let displaying = [];
let displayStatus = "";
let preparing;

previewSelect.value = "0";
previewSelect.addEventListener("change", () => {
  const keepAircraft = previewCount > 0 && Number(previewSelect.value) > 0;
  setPreviewCount(Number(previewSelect.value));
  updateDisplay(keepAircraft);
});
previewHandoff.addEventListener("click", () => {
  previewHandoff.closest("dialog").close();
  previewSelect.value = "3";
  setPreviewCount(3);
  updateDisplay(false, true);
});

function setPreviewCount(count) {
  previewCount = count;
  previewIndicator.hidden = !previewCount;
  previewIndicator.closest("button").setAttribute("aria-label", previewCount ? "Settings (preview active)" : "Settings");
  nearbyList.setAttribute("aria-label", previewCount ? "Sample aircraft" : "Nearby aircraft");
}

radiusInput.max = maxRadiusKm;
radiusInput.value = radiusKm;
showRadius();
radiusForm.hidden = false;
radiusForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const requestedRadius = radiusInput.valueAsNumber;
  if (!isValidRadius(requestedRadius)) return;

  radiusStatus.textContent = "";
  try {
    localStorage.setItem(radiusStorageKey, String(requestedRadius));
  } catch {
    radiusStatus.textContent = "The radius will apply for this session. Browser storage could not save it.";
  }

  if (requestedRadius === radiusKm) return;
  radiusKm = requestedRadius;
  showRadius();
  if (nearbyLocation) watchNearbyAircraft(nearbyLocation);
});

function readSavedRadius() {
  try {
    const radius = Number(localStorage.getItem(radiusStorageKey));
    if (isValidRadius(radius)) return radius;
  } catch {
    // Use the default radius when browser storage is unavailable.
  }
  return defaultRadiusKm;
}

function isValidRadius(radius) {
  return Number.isInteger(radius) && radius >= 1 && radius <= maxRadiusKm;
}

function showRadius() {
  nearbyRange.textContent = `Within ${radiusKm} km`;
}

export function watchNearbyAircraft(location) {
  nearbyLocation = location;
  if (!previewCount) updateDisplay();
}

function updateDisplay(keepAircraft = false, playHandoff = false) {
  clearTimeout(refreshTimer);
  displayController?.abort();
  displayController = new AbortController();
  const { signal } = displayController;
  nearbyUpdated.textContent = "";
  if (!keepAircraft) {
    if (previewCount) resetDisplay("Loading sample aircraft…");
    else if (nearbyLocation) resetDisplay("Checking for nearby aircraft…");
    else resetDisplay("Set the display location in Settings.");
  }

  if (previewCount) {
    renderPreview(previewCount, playHandoff, signal);
  } else if (nearbyLocation) {
    refreshNearbyAircraft(nearbyLocation, radiusKm, signal);
  }
}

async function renderPreview(count, playHandoff, signal) {
  try {
    const [, airliner] = sampleFlights;
    const flights = count === 1 ? [airliner] : sampleFlights.slice(0, count);
    await renderAircraft(playHandoff ? sampleHandoff.before : flights, "", signal);
    if (playHandoff && !signal.aborted) {
      await waitForMotion(750, signal);
      if (!signal.aborted) await renderAircraft(sampleHandoff.after, "", signal);
    }
  } catch {
    if (!signal.aborted) resetDisplay("Sample aircraft unavailable.");
  }
}

async function refreshNearbyAircraft(location, radius, signal) {
  if (signal.aborted) return;
  const refresh = () => refreshNearbyAircraft(location, radius, signal);

  try {
    const response = await fetch(searchPath(location, radius), {
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]),
    });
    if (signal.aborted) return;

    if (!response.ok) throw new Error("Aircraft lookup failed");

    const feed = await response.json();
    if (signal.aborted) return;

    const snapshotAgeSeconds = Math.max(0, (Date.now() - feed.now) / 1_000);
    if (!Array.isArray(feed.ac) || !Number.isFinite(feed.now) || snapshotAgeSeconds > 60) {
      throw new Error("Aircraft feed is malformed or stale");
    }

    const nearby = selectNearbyAircraft(feed.ac, location, radius, snapshotAgeSeconds);
    const checkedAt = new Date(feed.now).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    renderAircraft(nearby, nearby.length ? "" : "No aircraft nearby.", signal).then(rendered => {
      if (!rendered || signal.aborted) return;
      const lastUpdated = `Updated at ${checkedAt}.`;
      if (nearbyUpdated.textContent !== lastUpdated) nearbyUpdated.textContent = lastUpdated;
    }).catch(() => {
      if (!signal.aborted) resetDisplay("Flight data unavailable.");
    });
  } catch {
    if (signal.aborted) return;
    resetDisplay("Flight data unavailable.");
  } finally {
    if (!signal.aborted) {
      refreshTimer = setTimeout(refresh, refreshIntervalMs);
    }
  }
}

function searchPath({ latitude, longitude }, radius) {
  const regionLatitude = Math.round(latitude * 2) / 2;
  const regionLongitude = Math.round(longitude * 2) / 2;
  // Rounding to a half-degree can move the center by up to 40 km.
  const searchRadiusNm = Math.ceil((radius + searchPaddingKm) / kmPerNauticalMile);
  return `/api/aircraft/v2/lat/${regionLatitude}/lon/${regionLongitude}/dist/${searchRadiusNm}`;
}

function selectNearbyAircraft(aircraft, location, radius, snapshotAgeSeconds) {
  const nearby = aircraft
    .filter((item) => Number.isFinite(item?.lat) && Math.abs(item.lat) <= 90 &&
      Number.isFinite(item.lon) && Math.abs(item.lon) <= 180 &&
      Number.isFinite(item.seen_pos) && item.seen_pos >= 0 &&
      item.seen_pos + snapshotAgeSeconds <= maxPositionAgeSeconds && !isGroundTarget(item))
    .map((item) => ({ item, distanceKm: distanceBetween(location, item) }))
    .filter((entry) => entry.distanceKm <= radius)
    .sort((first, second) => first.distanceKm - second.distanceKm);

  const helicopterIndex = nearby.findIndex(({ item }) => item.category === "A7");
  if (helicopterIndex > 0) nearby.unshift(nearby.splice(helicopterIndex, 1)[0]);
  return nearby.slice(0, 3);
}

function isGroundTarget({ t, category }) {
  return (typeof t === "string" && groundTargetTypes.has(t.trim().toUpperCase())) ||
    (typeof category === "string" && /^C[1-5]$/i.test(category.trim()));
}

function distanceBetween({ latitude, longitude }, { lat, lon }) {
  const radiansPerDegree = Math.PI / 180;
  const halfLatDifference = (lat - latitude) * radiansPerDegree / 2;
  const halfLonDifference = (lon - longitude) * radiansPerDegree / 2;
  const haversine = Math.sin(halfLatDifference) ** 2 + Math.sin(halfLonDifference) ** 2 *
    Math.cos(latitude * radiansPerDegree) * Math.cos(lat * radiansPerDegree);
  return 2 * 6_371 * Math.asin(Math.sqrt(Math.min(1, haversine)));
}

function setNearbyStatus(message) {
  if (nearbyStatus.textContent !== message) nearbyStatus.textContent = message;
  nearbyStatus.toggleAttribute("hidden", !message);
}

function aircraftKey({ hex, r, flight }) {
  for (const [kind, value] of [["hex", hex], ["registration", r], ["callsign", flight]]) {
    if (typeof value === "string" && value.trim()) return `${kind}:${value.trim().toUpperCase()}`;
  }
  return "";
}

async function renderAircraft(entries, status, signal) {
  preparing?.abort();
  const batch = new AbortController();
  const preparationSignal = AbortSignal.any([signal, batch.signal]);
  preparing = batch;
  try {
    const nextAircraft = new Map();
    const nextDisplay = entries.map(entry => {
      const key = aircraftKey(entry.item);
      const identity = key && !nextAircraft.has(key) ? key : Symbol();
      let presentation = activeAircraft.get(identity);
      if (!presentation) {
        presentation = createAircraftPresentation(() => {
          if (!preparing && activeAircraft.get(identity) === presentation) publishDisplay();
        });
      }
      nextAircraft.set(identity, presentation);
      return { key: identity, presentation, entry };
    });
    const changesSlots = nextDisplay.length !== displaying.length ||
      nextDisplay.some(({ key }, index) => key !== displaying[index].key);
    await Promise.all(nextDisplay.map(({ presentation, entry }) => presentation.update(entry, preparationSignal, changesSlots)));
    if (preparationSignal.aborted) return false;
    activeAircraft = nextAircraft;
    displaying = nextDisplay;
    displayStatus = status;
    publishDisplay();
    return true;
  } catch (error) {
    if (!preparationSignal.aborted) throw error;
    return false;
  } finally {
    if (preparing === batch) preparing = undefined;
  }
}

function publishDisplay() {
  board.show(displaying.map(({ key, presentation }) => ({ key, view: presentation.view })), displayStatus);
}

function resetDisplay(status) {
  preparing?.abort();
  preparing = undefined;
  activeAircraft.clear();
  displaying = [];
  board.reset(status);
}
