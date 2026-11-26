import { formatAccuracy, formatDistance, formatNumber, setMessage, t } from "./display-formats.js";
import { saveSettings } from "./settings-client.js";
import { isValidLocation, sameLocation } from "./settings-schema.js";

export function bindLocationSettings() {
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
  let savedLocation;
  let ipEstimate;

  locationSettings.hidden = false;
  locationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void saveLocation({
      latitude: latitudeInput.valueAsNumber,
      longitude: longitudeInput.valueAsNumber,
    });
  });

  checkIpLocationButton.disabled = false;
  checkIpLocationButton.addEventListener("click", checkIpLocation);
  saveIpLocationButton.addEventListener("click", () => {
    if (ipEstimate) void saveLocation(ipEstimate);
  });

  if (!window.isSecureContext) {
    setMessage(locationStatus, "Browser location requires HTTPS or localhost. You can enter coordinates or estimate from IP.");
  } else if (!navigator.geolocation) {
    setMessage(locationStatus, "This browser does not provide location.");
  } else {
    checkLocationButton.disabled = false;
    checkLocationButton.addEventListener("click", checkLocation);
  }

  function showLocation(location) {
    if (savedLocation !== undefined && sameLocation(savedLocation, location)) return;
    if (savedLocation === undefined) locationSettings.open = !location;
    savedLocation = location;
    latitudeInput.value = location?.latitude ?? "";
    longitudeInput.value = location?.longitude ?? "";
    if (window.isSecureContext && navigator.geolocation) setMessage(locationStatus, "");
    setMessage(ipLocationStatus, "");
    ipEstimate = null;
    saveIpLocationButton.hidden = true;
    if (location) showSavedCoordinates(location);
    else setMessage(savedLocationStatus, "No display location saved.");
  }

  function showSavedCoordinates({ latitude, longitude }) {
    setMessage(savedLocationStatus, "Display location saved at {coordinates}.", {
      coordinates: () => displayCoordinates(latitude, longitude),
    });
  }

  function displayCoordinates(latitude, longitude) {
    return [latitude, longitude].map(value => formatNumber(value, 8)).join(" / ");
  }

  async function saveLocation(location) {
    if (!isValidLocation(location)) return;

    setMessage(savedLocationStatus, "Saving location…");
    try {
      await saveSettings({ location });
      if (sameLocation(savedLocation, location)) {
        showSavedCoordinates(location);
      } else {
        setMessage(savedLocationStatus, "Location saved.");
      }
    } catch (error) {
      setMessage(savedLocationStatus, error.message);
    }
  }

  function checkLocation() {
    const locationAtStart = savedLocation;
    const latitudeAtStart = latitudeInput.value;
    const longitudeAtStart = longitudeInput.value;
    checkLocationButton.disabled = true;
    setMessage(locationStatus, "Checking location…");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        checkLocationButton.disabled = false;
        if (savedLocation !== locationAtStart) return;
        const latitude = coords.latitude.toFixed(5);
        const longitude = coords.longitude.toFixed(5);
        setMessage(locationStatus, "{coordinates} (estimated accuracy ±{accuracy})", {
          coordinates: () => displayCoordinates(Number(latitude), Number(longitude)),
          accuracy: () => formatAccuracy(coords.accuracy),
        });
        if (latitudeInput.value === latitudeAtStart && longitudeInput.value === longitudeAtStart) {
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
        setMessage(locationStatus, messages[code] ?? "Location could not be determined.");
        if (code === 3 && !savedLocation && !ipEstimate && !locationSettings.closest("[hidden]")) {
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
    setMessage(ipLocationStatus, "Looking up an approximate location with GeoJS…");

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
      setMessage(ipLocationStatus, "Approximate IP location from GeoJS — {place}.{radius} Save it only if it’s close enough.", {
        place: () => {
          const coordinates = displayCoordinates(location.latitude, location.longitude);
          return area ? `${area} (${coordinates})` : coordinates;
        },
        radius: () => Number.isFinite(data.accuracy) && data.accuracy > 0
          ? " " + t("Estimated radius {distance}.", { distance: formatDistance(data.accuracy, 1) })
          : "",
      });
      saveIpLocationButton.hidden = false;
    } catch {
      if (savedLocation !== locationAtStart) return;
      setMessage(ipLocationStatus, "IP location is unavailable. You can enter coordinates manually.");
      locationSettings.open = true;
    } finally {
      checkIpLocationButton.disabled = false;
    }
  }

  return showLocation;
}
