import { formatClock, setMessage, t } from "../display-formats.js";
import { defaultSettings, liveAircraftSelection, sameLocation } from "../settings-schema.js";
import { distanceBetween, nearestMetar } from "../flight-weather.js";
import { createAircraftPresentation } from "./flight-card.js";
import { createFlightBoard } from "./flight-board.js";
import { renderTrafficPreview } from "./traffic-preview.js";

const kmPerNauticalMile = 1.852;
const searchPaddingKm = 40;
const refreshIntervalMs = 5_000;
const maxPositionAgeSeconds = 30;
const groundTargetTypes = new Set(["GND", "GRND", "SERV", "EMER", "TWR"]);

export function createNearbyDisplay({ list, status, cardTemplate, getMotion, startGallery, onUpdate, onTrackAircraft }) {
  const board = createFlightBoard(list, cardTemplate, setNearbyStatus, getMotion, onTrackAircraft);
  let radiusKm = defaultSettings.radiusKm;
  let nearbyLocation;
  let nearbyEnabled = false;
  let preview;
  let displayController;
  let refreshTimer;
  let activeAircraft = new Map();
  let preparing;
  let galleryFallback;
  let checkedAt;

  function applySettings({ location, radiusKm: radius, trafficPreview }) {
    const locationChanged = !sameLocation(nearbyLocation, location) || radiusKm !== radius;
    const previewChanged = preview?.id !== trafficPreview?.id;
    const keepAircraft = Boolean(preview && trafficPreview && trafficPreview.mode !== "handoff");
    nearbyLocation = location;
    radiusKm = radius;
    preview = trafficPreview;
    if (nearbyEnabled && (previewChanged || (locationChanged && !preview))) updateDisplay(keepAircraft);
  }

  function setEnabled(enabled) {
    nearbyEnabled = enabled;
    if (!enabled) preview = undefined;
    updateDisplay();
  }

  function updateDisplay(keepAircraft = false) {
    clearTimeout(refreshTimer);
    displayController?.abort();
    checkedAt = undefined;
    showUpdateTime();
    updateListLabel();
    if (!nearbyEnabled) {
      resetDisplay("");
      return;
    }

    displayController = new AbortController();
    const { signal } = displayController;
    if (!keepAircraft) {
      if (preview) resetDisplay("Loading sample aircraft…");
      else if (nearbyLocation) resetDisplay("Checking for nearby aircraft…");
      else resetDisplay("Set the display location in Companion settings.");
    }

    if (preview) {
      void renderPreview(preview.mode, signal);
    } else if (nearbyLocation) {
      refreshNearbyAircraft(nearbyLocation, radiusKm, signal);
    }
  }

  async function renderPreview(mode, signal) {
    try {
      await renderTrafficPreview(mode, (entries) => renderAircraft(entries, signal), signal);
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
      for (const entry of nearby) entry.observedAt = feed.now - entry.item.seen_pos * 1_000;
      if (Array.isArray(feed.metars) && Number.isFinite(feed.maxStationDistanceKm)) {
        for (const entry of nearby) {
          if (Number.isFinite(entry.item.alt_baro)) {
            entry.altimeter = nearestMetar(entry.item, feed.metars, feed.maxStationDistanceKm);
          }
        }
      }
      void showLiveSnapshot(nearby, feed.now, signal);
    } catch {
      if (signal.aborted) return;
      resetDisplay("Flight data unavailable.");
    } finally {
      if (!signal.aborted) {
        refreshTimer = setTimeout(refresh, refreshIntervalMs);
      }
    }
  }

  async function showLiveSnapshot(nearby, timestamp, signal) {
    try {
      if (nearby.length) {
        if (!await renderAircraft(nearby, signal)) return;
      } else if (galleryFallback) {
        // A new empty snapshot supersedes any live card still being prepared.
        preparing?.abort();
      } else {
        resetDisplay("", { fadeScenery: true });
        galleryFallback = new AbortController();
        startGallery(galleryFallback.signal);
      }

      if (signal.aborted) return;
      checkedAt = timestamp;
      showUpdateTime();
    } catch {
      if (!signal.aborted) resetDisplay("Flight data unavailable.");
    }
  }

  function setNearbyStatus(message) {
    setMessage(status, message);
    status.toggleAttribute("hidden", !message);
  }

  async function renderAircraft(entries, signal) {
    preparing?.abort();
    const batch = new AbortController();
    const preparationSignal = AbortSignal.any([signal, batch.signal]);
    preparing = batch;
    try {
      const nextAircraft = new Map();
      const nextDisplay = entries.map(entry => {
        const key = aircraftKey(entry.item);
        const identity = key && !nextAircraft.has(key) ? key : Symbol();
        const presentation = activeAircraft.get(identity) ?? createAircraftPresentation();
        nextAircraft.set(identity, presentation);
        return { key: identity, presentation, entry };
      });
      await Promise.all(nextDisplay.map(({ presentation, entry }) => presentation.update(entry, preparationSignal)));
      if (preparationSignal.aborted) return false;
      stopGalleryFallback();
      activeAircraft = nextAircraft;
      board.show(nextDisplay.map(({ key, presentation, entry: { item } }) => ({
        key,
        view: presentation.view,
        trackFlight: onTrackAircraft && !preview ? liveAircraftSelection(item.hex, item.flight, item.r) : null,
      })));
      return true;
    } catch (error) {
      if (!preparationSignal.aborted) throw error;
      return false;
    } finally {
      if (preparing === batch) preparing = undefined;
    }
  }

  function resetDisplay(status, options) {
    stopGalleryFallback();
    preparing?.abort();
    preparing = undefined;
    activeAircraft.clear();
    board.reset(status, options);
  }

  function stopGalleryFallback() {
    galleryFallback?.abort();
    galleryFallback = undefined;
  }

  function showUpdateTime() {
    onUpdate?.(checkedAt === undefined ? "" : t("Updated at {time}", { time: formatClock(checkedAt) }));
  }

  function updateListLabel() {
    list.setAttribute("aria-label", t(preview ? "Sample aircraft" : "Nearby aircraft"));
  }

  function refreshPresentation() {
    updateListLabel();
    showUpdateTime();
    board.refreshPresentation();
  }

  return { applySettings, setEnabled, refreshPresentation };
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

function aircraftKey({ hex, r, flight }) {
  for (const [kind, value] of [["hex", hex], ["registration", r], ["callsign", flight]]) {
    if (typeof value === "string" && value.trim()) return `${kind}:${value.trim().toUpperCase()}`;
  }
  return "";
}
