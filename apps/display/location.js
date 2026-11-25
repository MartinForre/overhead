import { watchNearbyAircraft } from "./nearby.js";

const settingsButton = document.querySelector("#open-display-settings");
const settingsDialog = document.querySelector("#display-settings");
const checkLocationButton = document.querySelector("#check-location");
const locationStatus = document.querySelector("#location-status");
const checkIpLocationButton = document.querySelector("#check-ip-location");
const ipLocationStatus = document.querySelector("#ip-location-status");
const saveIpLocationButton = document.querySelector("#save-ip-location");
const locationSettings = document.querySelector("#location-settings");
const locationForm = document.querySelector("#location-form");
const latitudeInput = document.querySelector("#latitude");
const longitudeInput = document.querySelector("#longitude");
const savedLocationStatus = document.querySelector("#saved-location-status");
const storageKey = "overhead.display.location";
let savedLocation = readSavedLocation();
let ipEstimate = null;

settingsButton.disabled = false;
settingsButton.addEventListener("click", () => settingsDialog.showModal());
locationSettings.hidden = false;
if (savedLocation) {
  latitudeInput.value = savedLocation.latitude;
  longitudeInput.value = savedLocation.longitude;
  showSavedLocation();
  watchNearbyAircraft(savedLocation);
}

locationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveLocation({
    latitude: latitudeInput.valueAsNumber,
    longitude: longitudeInput.valueAsNumber,
  });
});

checkIpLocationButton.disabled = false;
checkIpLocationButton.addEventListener("click", checkIpLocation);
saveIpLocationButton.addEventListener("click", () => {
  if (ipEstimate) saveLocation(ipEstimate);
});

if (!window.isSecureContext) {
  locationStatus.textContent = "Open the display over HTTPS or on localhost to check location.";
} else if (!navigator.geolocation) {
  locationStatus.textContent = "This browser does not provide location.";
} else {
  checkLocationButton.disabled = false;
  checkLocationButton.addEventListener("click", checkLocation);
  if (!savedLocation) {
    checkGrantedLocation();
  }
}

function readSavedLocation() {
  try {
    const location = JSON.parse(localStorage.getItem(storageKey));
    if (isValidLocation(location)) return location;
  } catch {
    // A new location can still be entered if storage is unavailable or invalid.
  }
  return null;
}

function isValidLocation(location) {
  return Number.isFinite(location?.latitude) && Math.abs(location.latitude) <= 90 &&
    Number.isFinite(location.longitude) && Math.abs(location.longitude) <= 180;
}

function saveLocation(location) {
  if (!isValidLocation(location)) return;

  try {
    localStorage.setItem(storageKey, JSON.stringify(location));
  } catch {
    savedLocationStatus.textContent = "The browser couldn’t save the location. Check its site storage settings.";
    return;
  }

  savedLocation = location;
  latitudeInput.value = location.latitude;
  longitudeInput.value = location.longitude;
  locationStatus.textContent = "";
  ipLocationStatus.textContent = "";
  ipEstimate = null;
  saveIpLocationButton.hidden = true;
  showSavedLocation();
  watchNearbyAircraft(savedLocation);
}

function showSavedLocation() {
  const { latitude, longitude } = savedLocation;
  savedLocationStatus.textContent = `Display location saved at ${latitude}, ${longitude}.`;
}

async function checkGrantedLocation() {
  try {
    const permission = await navigator.permissions?.query({ name: "geolocation" });
    if (permission?.state === "granted" && !savedLocation && !checkLocationButton.disabled) {
      checkLocation();
    }
  } catch {
    // The button still works when the browser cannot report permission state.
  }
}

function checkLocation() {
  const locationAtStart = savedLocation;
  checkLocationButton.disabled = true;
  locationStatus.textContent = "Checking location…";

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      checkLocationButton.disabled = false;
      if (savedLocation !== locationAtStart) return;
      const latitude = coords.latitude.toFixed(5);
      const longitude = coords.longitude.toFixed(5);
      const accuracy = Math.round(coords.accuracy).toLocaleString();
      locationStatus.textContent = `${latitude}, ${longitude} (estimated accuracy ±${accuracy} m)`;
      if (latitudeInput.value === "" && longitudeInput.value === "") {
        latitudeInput.value = latitude;
        longitudeInput.value = longitude;
        locationSettings.open = true;
      }
    },
    ({ code }) => {
      checkLocationButton.disabled = false;
      if (savedLocation !== locationAtStart) return;
      const messages = {
        1: "Location permission was denied.",
        2: "This device could not determine its location.",
        3: "Automatic location timed out.",
      };
      locationStatus.textContent = messages[code] ?? "Location could not be determined.";
      if (code === 3 && !savedLocation && !ipEstimate) {
        checkIpLocation();
      } else if (!savedLocation && !ipEstimate) {
        locationSettings.open = true;
      }
    },
    { timeout: 30_000 },
  );
}

async function checkIpLocation() {
  if (checkIpLocationButton.disabled) return;

  const locationAtStart = savedLocation;
  checkIpLocationButton.disabled = true;
  ipEstimate = null;
  saveIpLocationButton.hidden = true;
  ipLocationStatus.textContent = "Looking up an approximate location with GeoJS…";

  try {
    const response = await fetch("https://get.geojs.io/v1/ip/geo.json", {
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error("IP lookup failed");
    const data = await response.json();
    const location = {
      latitude: Number(String(data.latitude ?? "").trim() || NaN),
      longitude: Number(String(data.longitude ?? "").trim() || NaN),
    };
    if (!isValidLocation(location)) throw new Error("IP lookup returned invalid coordinates");
    if (savedLocation !== locationAtStart) return;

    ipEstimate = location;
    const area = [...new Set([data.city, data.region, data.country].filter(Boolean))].join(", ");
    const coordinates = `${location.latitude}, ${location.longitude}`;
    const place = area ? `${area} (${coordinates})` : coordinates;
    const radius = Number.isFinite(data.accuracy) && data.accuracy > 0
      ? ` Estimated radius ${data.accuracy.toLocaleString()} km.`
      : "";
    ipLocationStatus.textContent = `Approximate IP location from GeoJS — ${place}.${radius} Save it only if it’s close enough.`;
    saveIpLocationButton.hidden = false;
  } catch {
    if (savedLocation !== locationAtStart) return;
    ipLocationStatus.textContent = "IP location is unavailable. You can enter coordinates manually.";
    locationSettings.open = true;
  } finally {
    checkIpLocationButton.disabled = false;
  }
}
