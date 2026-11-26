import { applyDisplayFormats } from "../display-formats.js";
import { stepGallery } from "../settings-client.js";
import { defaultSettings } from "../settings-schema.js";
import { startAircraftGallery } from "./aircraft-gallery.js";
import { preloadAircraftArtwork } from "./artwork.js";
import { displayContents } from "./markup.js";
import { flightMotionSettings } from "./motion.js";
import { createNearbyDisplay } from "./nearby.js";
import { startTrackedFlights } from "./tracked-flights.js";

export function mountDisplay(root, { interactive = false, onNearbyUpdate, onGalleryVisibility, onTrackAircraft } = {}) {
  root.innerHTML = displayContents;
  const galleryElement = root.querySelector("#aircraft-gallery");
  const galleryTemplate = root.querySelector("#gallery-card-template");
  const previewIndicator = root.querySelector("#traffic-preview-indicator");
  let settings = defaultSettings;
  let activeMode;
  let modeController;
  let gallery;
  let tracked;

  const getMotion = () => flightMotionSettings(settings);
  const nearby = createNearbyDisplay({
    list: root.querySelector("#nearby-aircraft"),
    status: root.querySelector("#nearby-status"),
    cardTemplate: root.querySelector("#flight-card-template"),
    getMotion,
    startGallery,
    onUpdate: onNearbyUpdate,
    onTrackAircraft,
  });

  function startGallery(signal) {
    gallery = startAircraftGallery(galleryElement, galleryTemplate, getMotion, signal);
    onGalleryVisibility?.(true);
    signal.addEventListener("abort", () => {
      gallery = undefined;
      onGalleryVisibility?.(false);
    }, { once: true });
  }

  function applyGalleryStep(direction) {
    if (activeMode === "gallery") void gallery?.step(direction);
  }

  async function requestGalleryStep(direction, onError) {
    const currentGallery = gallery;
    if (!currentGallery) return false;
    if (activeMode === "live") {
      void currentGallery.step(direction);
      return true;
    }

    try {
      await stepGallery(direction);
      return true;
    } catch (error) {
      if (onError) onError(error.message);
      else if (gallery === currentGallery) currentGallery.setStatus(error.message);
      return false;
    }
  }

  function applySettings(nextSettings) {
    const formatsChanged = applyDisplayFormats(nextSettings);
    settings = nextSettings;
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.toggleAttribute("data-motion-off", settings.motionDuration === 0);
    const live = settings.mode === "live";
    previewIndicator.hidden = !live || !settings.trafficPreview;

    if (activeMode === settings.mode) {
      if (live) nearby.applySettings(settings);
      tracked?.setQueue(settings.trackedFlights ?? []);
      if (formatsChanged) {
        nearby.refreshPresentation();
        tracked?.refreshPresentation();
      }
      return formatsChanged;
    }

    activeMode = settings.mode;
    modeController?.abort();
    modeController = new AbortController();
    const { signal } = modeController;
    tracked = undefined;

    if (!live) nearby.setEnabled(false);
    if (live) {
      nearby.applySettings(settings);
      nearby.setEnabled(true);
      void preloadAircraftArtwork(signal);
    } else if (activeMode === "gallery") {
      startGallery(signal);
    } else if (activeMode === "track") {
      tracked = startTrackedFlights(root, signal, getMotion, interactive);
      tracked.setQueue(settings.trackedFlights ?? []);
    }
    return formatsChanged;
  }

  return {
    applyGalleryStep,
    applySettings,
    requestGalleryStep,
  };
}
