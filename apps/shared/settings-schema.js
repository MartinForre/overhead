export const modes = {
  live: "Live",
  gallery: "Gallery",
  track: "Track",
};

export const themes = {
  "forest-green": "Forest Green",
  "deep-blue": "Deep Blue",
  "deep-red": "Deep Red",
  "sky-gradient": "Sky Gradient",
  "nordic-linen": "Nordic Linen",
  blueprint: "Blueprint",
  "serengeti-safari": "Serengeti Safari",
  "zanzibar-coast": "Zanzibar Coast",
};

export const motionDurations = [0, 700, 900, 1100, 1300, 1600];
export const motionEasings = {
  gentle: "Gentle",
  "ease-in-out": "Ease in and out",
  linear: "Linear",
};

export const maxRadiusKm = 423;
export const maxTrackedFlights = 3;
export const defaultSettings = Object.freeze({
  mode: "live",
  location: null,
  radiusKm: 50,
  theme: "forest-green",
  language: "en",
  units: "metric",
  clock: "24-hour",
  motionDuration: 1100,
  motionEasing: "gentle",
  trackedFlights: Object.freeze([]),
  trackProvider: "adsb-fi",
});

export function normalizeFlightNumber(value) {
  if (typeof value !== "string") return "";
  const number = value.trim().toUpperCase().replace(/\s+/g, "");
  return /^[A-Z0-9]{2,3}[0-9]{1,4}[A-Z]?$/.test(number) && /[A-Z]/.test(number.slice(0, 3)) ? number : "";
}

export function isFlightId(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);
}

export function normalizeCallsign(value) {
  const callsign = normalizeBroadcastCallsign(value);
  return /^[A-Z]{3}[A-Z0-9]{1,5}$/.test(callsign) && /\d/.test(callsign) ? callsign : "";
}

export function normalizeBroadcastCallsign(value) {
  const callsign = typeof value === "string" ? value.toUpperCase().replace(/\s+/g, "") : "";
  return /^[A-Z0-9]{1,8}$/.test(callsign) ? callsign : "";
}

export function liveAircraftSelection(hex, flight, registration) {
  const aircraftHex = typeof hex === "string" ? hex.trim().toUpperCase() : "";
  if (!/^[A-F0-9]{6}$/.test(aircraftHex)) return null;
  const callsign = normalizeBroadcastCallsign(flight);
  const tail = typeof registration === "string" ? registration.trim().toUpperCase() : "";
  const number = callsign || (/^[A-Z0-9-]{1,12}$/.test(tail) ? tail : aircraftHex);
  return { id: `adsb-fi-${aircraftHex}${callsign ? "-" + callsign : ""}`, number, callsign, aircraftHex };
}

export function isLiveAircraftSelection(value) {
  if (!isSettingsObject(value) || Object.keys(value).length !== 4) return false;
  const expected = liveAircraftSelection(value.aircraftHex, value.callsign, value.number);
  return expected !== null && Object.entries(expected).every(([key, field]) => value[key] === field);
}

export function isCallsignSelection(value) {
  return isSettingsObject(value) && Object.keys(value).length === 3 &&
    Boolean(value.callsign) && normalizeCallsign(value.callsign) === value.callsign &&
    value.id === "adsb-fi-" + value.callsign &&
    Boolean(value.number) && (normalizeFlightNumber(value.number) === value.number ||
      normalizeCallsign(value.number) === value.number);
}

export function isSettingsObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isValidLocation(location) {
  return isSettingsObject(location) &&
    Object.keys(location).length === 2 &&
    Number.isFinite(location.latitude) && Math.abs(location.latitude) <= 90 &&
    Number.isFinite(location.longitude) && Math.abs(location.longitude) <= 180;
}

export function sameLocation(first, second) {
  return first?.latitude === second?.latitude && first?.longitude === second?.longitude;
}

export function isValidRadius(radius) {
  return Number.isInteger(radius) && radius >= 1 && radius <= maxRadiusKm;
}

const settingValidators = {
  mode: (value) => typeof value === "string" && Object.hasOwn(modes, value),
  location: (value) => value === null || isValidLocation(value),
  radiusKm: isValidRadius,
  theme: (value) => typeof value === "string" && Object.hasOwn(themes, value),
  language: (value) => ["en", "nb", "nn"].includes(value),
  units: (value) => ["metric", "imperial"].includes(value),
  clock: (value) => ["12-hour", "24-hour"].includes(value),
  motionDuration: (value) => motionDurations.includes(value),
  motionEasing: (value) => typeof value === "string" && Object.hasOwn(motionEasings, value),
  trackedFlights: (value) => Array.isArray(value) && value.length <= maxTrackedFlights &&
    value.every(flight => isCallsignSelection(flight) || isLiveAircraftSelection(flight) ||
      (isSettingsObject(flight) && Object.keys(flight).length === 6 &&
      isFlightId(flight.id) && Boolean(flight.number) && normalizeFlightNumber(flight.number) === flight.number &&
      [flight.origin, flight.destination, flight.timezone].every(text => typeof text === "string" && text.length <= 128) &&
      Number.isFinite(flight.departure))) &&
    new Set(value.map(flight => flight.id)).size === value.length,
};

export function isValidSetting(key, value) {
  return Object.hasOwn(settingValidators, key) && settingValidators[key](value);
}
