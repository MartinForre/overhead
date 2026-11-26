import { formatClock, setMessage, t } from "../display-formats.js";
import { defaultSettings, liveAircraftSelection, sameLocation } from "../settings-schema.js";
import { nearestMetar } from "../flight-weather.js";
import { createAircraftPresentation } from "./flight-card.js";
import { createFlightBoard } from "./flight-board.js";
import { createLiveMap } from "./live-map.js";
import { closestLongitude, destinationPoint } from "./map-geometry.js";
import { aircraftForList, selectNearbyAircraft } from "./nearby-aircraft.js";
import { renderTrafficPreview } from "./traffic-preview.js";

const kmPerNauticalMile = 1.852;
const searchPaddingKm = 40;
const refreshIntervalMs = 5_000;
const previewLocation = { latitude: 58.87667, longitude: 5.63778 };

export function createNearbyDisplay({ list, map, status, cardTemplate, getMotion, startGallery, onUpdate, onTrackAircraft, onMapAircraft }) {
  const board = createFlightBoard(list, cardTemplate, setNearbyStatus, getMotion, onTrackAircraft);
  const liveMap = createLiveMap(map, cardTemplate, getMotion, onMapAircraft);
  let radiusKm = defaultSettings.radiusKm;
  let nearbyLocation;
  let nearbyEnabled = false;
  let showingMap = false;
  let preview;
  let displayController;
  let refreshTimer;
  let activeAircraft = new Map();
  let preparing;
  let galleryFallback;
  let checkedAt;

  function applySettings({ location, radiusKm: radius, trafficPreview, liveView, mapAircraft, theme }) {
    const locationChanged = !sameLocation(nearbyLocation, location) || radiusKm !== radius;
    const previewChanged = preview?.id !== trafficPreview?.id;
    const viewChanged = showingMap !== (liveView === "map");
    showingMap = liveView === "map";
    const keepAircraft = Boolean(!viewChanged && !showingMap && preview && trafficPreview && trafficPreview.mode !== "handoff");
    nearbyLocation = location;
    radiusKm = radius;
    preview = trafficPreview;
    liveMap.setTheme(theme);
    liveMap.select(mapAircraft);
    if (nearbyEnabled && (viewChanged || previewChanged || (locationChanged && (showingMap || !preview)))) {
      updateDisplay(keepAircraft);
    }
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
    const mapLocation = nearbyLocation ?? (preview ? previewLocation : undefined);
    if (nearbyEnabled && showingMap) liveMap.setArea(mapLocation, radiusKm);
    else liveMap.hide();
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
      void renderPreview(preview.mode, mapLocation, signal);
    } else if (nearbyLocation) {
      refreshNearbyAircraft(nearbyLocation, radiusKm, signal);
    }
  }

  async function renderPreview(mode, location, signal) {
    try {
      await renderTrafficPreview(mode, (entries) => {
        if (!showingMap) return renderAircraft(entries, signal);
        if (signal.aborted) return;
        liveMap.show(entries.map((entry, index) => {
          const distanceKm = Math.min(entry.distanceKm, radiusKm * .77);
          const [longitude, lat] = destinationPoint(location, distanceKm, 40 + index * 125);
          return { ...entry, distanceKm, item: { ...entry.item, lat, lon: closestLongitude(longitude, 0) } };
        }));
        setNearbyStatus("");
      }, signal);
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

      const eligible = selectNearbyAircraft(feed.ac, location, radius, snapshotAgeSeconds);
      const nearby = showingMap ? eligible : aircraftForList(eligible);
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
      if (showingMap) {
        liveMap.show(nearby);
        setNearbyStatus("");
      } else if (nearby.length) {
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
    liveMap.show([]);
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
    liveMap.refresh();
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

function aircraftKey({ hex, r, flight }) {
  for (const [kind, value] of [["hex", hex], ["registration", r], ["callsign", flight]]) {
    if (typeof value === "string" && value.trim()) return `${kind}:${value.trim().toUpperCase()}`;
  }
  return "";
}
