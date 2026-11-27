import { bindDisplayFormatSettings } from "../shared/display-format-settings.js";
import { setMessage } from "../shared/display-formats.js";
import { mountDisplay } from "../shared/display/index.js";
import { displayLandscape } from "../shared/display/markup.js";
import { migrateLegacySettings } from "../shared/legacy-settings.js";
import { bindLocationSettings } from "../shared/location-settings.js";
import { bindRadiusSettings } from "../shared/radius-settings.js";
import { connectSettings, saveSettings, selectMapAircraft, setTrafficPreview, trackLiveAircraft } from "../shared/settings-client.js";
import { defaultSettings, themes } from "../shared/settings-schema.js";
import { bindTrackSettings } from "../shared/track-settings.js";

const settingsButton = document.querySelector("#open-companion-settings");
const settingsDialog = document.querySelector("#companion-settings");
const themeColor = document.querySelector('meta[name="theme-color"]');
const connectionStatus = document.querySelector("#connection-status");
const modeStatus = document.querySelector("#mode-status");
const flightViews = [...document.querySelectorAll('input[name="liveView"], input[name="trackView"]')];
const themeStatus = document.querySelector("#theme-status");
const formatStatus = document.querySelector("#format-status");
const showFormats = bindDisplayFormatSettings(message => setMessage(formatStatus, message));
const galleryStatus = document.querySelector("#gallery-settings-status");
const trackStatus = document.querySelector("#live-track-status");
const nearbyUpdated = document.querySelector("#nearby-updated");
const previewSelect = document.querySelector("#traffic-preview");
const previewHandoff = document.querySelector("#preview-handoff");
const previewStatus = document.querySelector("#preview-status");
const motionStatus = document.querySelector("#motion-status");
const motionFields = [[document.querySelector("#motion-duration"), Number], [document.querySelector("#motion-easing"), String]];
const modeTabs = [...document.querySelectorAll(".mode-tabs [role=tab]")];
const modePanels = document.querySelectorAll(".mode-panel");
const themeGrid = document.querySelector("#theme-grid");
const themeTemplate = document.querySelector("#theme-card");
const showLocation = bindLocationSettings();
const showRadius = bindRadiusSettings();
const showTrackQueue = bindTrackSettings(document.querySelector("#track-settings"));
const displayRoot = document.querySelector("#aircraft-display");
let gallerySwipe;
const display = mountDisplay(displayRoot, {
  interactive: true,
  onGalleryVisibility: () => { gallerySwipe = undefined; },
  onNearbyUpdate: (message) => {
    if (nearbyUpdated.textContent !== message) nearbyUpdated.textContent = message;
  },
  onTrackAircraft: addLiveAircraft,
  onMapAircraft: showMapAircraft,
});
const gallery = displayRoot.querySelector("#aircraft-gallery");
let activeSettings = defaultSettings;
let trackRequest = 0;
let clearTrackStatus;
let selectionRequest = 0;

document.addEventListener("keydown", (event) => {
  if (gallery.hidden || settingsDialog.open || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  void display.requestGalleryStep(event.key === "ArrowLeft" ? -1 : 1);
});

displayRoot.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "touch") return;
  gallerySwipe = undefined;
  if (!event.isPrimary || gallery.hidden || settingsDialog.open) return;

  displayRoot.setPointerCapture(event.pointerId);
  gallerySwipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
});

displayRoot.addEventListener("pointerup", (event) => {
  if (gallerySwipe?.id !== event.pointerId) return;
  const x = event.clientX - gallerySwipe.x;
  const y = event.clientY - gallerySwipe.y;
  gallerySwipe = undefined;
  if (gallery.hidden || settingsDialog.open) return;

  if (Math.abs(x) >= 48 && Math.abs(x) > Math.abs(y) * 1.5) {
    void display.requestGalleryStep(x < 0 ? 1 : -1);
  }
});

displayRoot.addEventListener("lostpointercapture", (event) => {
  if (gallerySwipe?.id === event.pointerId) gallerySwipe = undefined;
});

// Safari also exposes native pinch gestures separately from touch-action.
for (const type of ["gesturestart", "gesturechange"]) {
  document.addEventListener(type, (event) => event.preventDefault(), { passive: false });
}
document.addEventListener("wheel", (event) => {
  if (event.ctrlKey) event.preventDefault();
}, { passive: false });

settingsButton.disabled = false;
settingsButton.addEventListener("click", () => settingsDialog.showModal());

for (const input of flightViews) {
  const status = input.closest("fieldset").querySelector(".status");
  const { name } = input;
  input.addEventListener("change", async () => {
    setMessage(status, "");
    try {
      await saveSettings({ [name]: input.value });
    } catch (error) {
      flightViews.find(view => view.name === name && view.value === (activeSettings[name] ?? defaultSettings[name])).checked = true;
      setMessage(status, error.message);
    }
  });
}

async function showMapAircraft(aircraft) {
  const request = ++selectionRequest;
  clearTimeout(clearTrackStatus);
  setMessage(trackStatus, "");
  try {
    await selectMapAircraft(aircraft);
  } catch (error) {
    if (request !== selectionRequest) return;
    setMessage(trackStatus, error.message);
    clearTrackStatus = setTimeout(() => { setMessage(trackStatus, ""); }, 4_000);
  }
}

for (const [select, parse] of motionFields) {
  select.addEventListener("change", async () => {
    setMessage(motionStatus, "");
    try {
      await saveSettings({ [select.name]: parse(select.value) });
    } catch (error) {
      select.value = activeSettings[select.name];
      setMessage(motionStatus, error.message);
    }
  });
}

previewSelect.addEventListener("change", () => void updatePreview(previewSelect.value));
previewHandoff.addEventListener("click", () => void updatePreview("handoff"));

function showPreview(preview) {
  previewSelect.value = preview?.mode ?? "0";
}

async function updatePreview(mode) {
  setMessage(previewStatus, "");
  try {
    await setTrafficPreview(mode);
    if (mode === "handoff") settingsDialog.close();
  } catch (error) {
    showPreview(activeSettings.trafficPreview);
    setMessage(previewStatus, error.message);
  }
}

for (const [id, name] of Object.entries(themes)) {
  const card = themeTemplate.content.cloneNode(true);
  const input = card.querySelector("input");
  input.value = id;
  input.checked = id === defaultSettings.theme;
  const preview = card.querySelector(".theme-preview");
  preview.dataset.theme = id;
  preview.insertAdjacentHTML("afterbegin", displayLandscape);
  setMessage(card.querySelector(".theme-name"), name);
  input.addEventListener("change", async () => {
    setMessage(themeStatus, "");
    try {
      await saveSettings({ theme: id });
    } catch (error) {
      showTheme(activeSettings.theme);
      setMessage(themeStatus, error.message);
    }
  });
  themeGrid.append(card);
}

for (const [index, tab] of modeTabs.entries()) {
  tab.addEventListener("click", async () => {
    setMessage(modeStatus, "");
    setMessage(galleryStatus, "");
    setMessage(previewStatus, "");
    try {
      await saveSettings({ mode: tab.id.replace("-tab", "") });
    } catch (error) {
      setMessage(modeStatus, error.message);
    }
  });
  tab.addEventListener("keydown", (event) => {
    const count = modeTabs.length;
    const targets = {
      ArrowLeft: (index + count - 1) % count,
      ArrowRight: (index + 1) % count,
      Home: 0,
      End: count - 1,
    };
    const target = modeTabs[targets[event.key]];
    if (!target) return;
    event.preventDefault();
    target.focus();
    target.click();
  });
}

for (const [id, direction] of [["#previous-aircraft", -1], ["#next-aircraft", 1]]) {
  document.querySelector(id).addEventListener("click", () => {
    setMessage(galleryStatus, "");
    void display.requestGalleryStep(direction, (message) => setMessage(galleryStatus, message));
  });
}

async function addLiveAircraft(flight) {
  const request = ++trackRequest;
  clearTimeout(clearTrackStatus);
  const values = { number: flight.number };
  setMessage(trackStatus, "Adding {number}…", values);
  let message;
  try {
    const { added, replaced } = await trackLiveAircraft(flight);
    message = replaced ? "Tracking {number}. Replaced {replaced}." : added ? "Tracking {number}." : "Already tracking {number}.";
    values.replaced = replaced;
  } catch (error) {
    message = error.message;
  }
  if (request !== trackRequest) return;
  setMessage(trackStatus, message, values);
  clearTrackStatus = setTimeout(() => { setMessage(trackStatus, ""); }, 4_000);
}

function showTheme(id) {
  themeGrid.querySelector(`input[value="${id}"]`).checked = true;
}

function applySettings(settings) {
  const formatsChanged = display.applySettings(settings);
  showFormats(settings);
  if (activeSettings.theme !== settings.theme) {
    themeColor.content = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();
  }
  activeSettings = settings;
  for (const tab of modeTabs) {
    const selected = tab.id === settings.mode + "-tab";
    tab.setAttribute("aria-selected", selected);
    tab.tabIndex = selected ? 0 : -1;
  }
  for (const panel of modePanels) panel.hidden = panel.id !== settings.mode + "-panel";
  for (const view of flightViews) view.checked = view.value === (settings[view.name] ?? defaultSettings[view.name]);
  showLocation(settings.location);
  showRadius(settings.radiusKm);
  showTrackQueue(settings.trackedFlights ?? [], settings.trackProvider, formatsChanged);
  showTheme(settings.theme);
  for (const [select] of motionFields) select.value = settings[select.name];
  showPreview(settings.trafficPreview);
}

const dataSources = document.querySelector("#data-sources");
function revealSources() {
  if (location.hash !== "#data-sources") return;

  if (!settingsDialog.open) settingsDialog.showModal();
  dataSources.open = true;
  dataSources.scrollIntoView({ block: "nearest" });
}
window.addEventListener("hashchange", revealSources);
revealSources();

await migrateLegacySettings();
connectSettings({
  onSettings: applySettings,
  onConnection: (online) => {
    connectionStatus.dataset.online = online;
    setMessage(connectionStatus, online ? "Connected" : "Reconnecting…");
  },
  onGalleryStep: display.applyGalleryStep,
});
