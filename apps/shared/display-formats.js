import { norwegian } from "./norwegian.js";
import { defaultSettings } from "./settings-schema.js";

export const kmPerMile = 1.609344;
const metersPerFoot = 0.3048;
let { language, units, clock } = defaultSettings;
const staticText = new WeakMap();
const messages = new WeakMap();
const numbers = new Map();
const dates = new Map();

export function applyDisplayFormats(settings) {
  const nextLanguage = settings.language ?? defaultSettings.language;
  const nextUnits = settings.units ?? defaultSettings.units;
  const nextClock = settings.clock ?? defaultSettings.clock;
  if (language === nextLanguage && units === nextUnits && clock === nextClock) return false;
  language = nextLanguage;
  units = nextUnits;
  clock = nextClock;
  numbers.clear();
  dates.clear();
  document.documentElement.lang = language;
  localize(document);
  return true;
}

export function t(key, values = {}) {
  const translations = Object.hasOwn(norwegian, key) ? norwegian[key] : undefined;
  const translation = translations?.[language] ?? key;
  return translation.replace(/\{(\w+)\}/g, (token, name) => {
    const value = values[name];
    return (typeof value === "function" ? value() : value) ?? token;
  });
}

export function setMessage(element, key, values) {
  element.setAttribute("data-i18n-message", "");
  messages.set(element, { key, values });
  updateText(element, t(key, values));
}

function updateText(element, text) {
  if (element.textContent !== text) element.textContent = text;
}

export function localize(root) {
  for (const element of root.querySelectorAll("[data-i18n], [data-i18n-label]")) {
    let source = staticText.get(element);
    if (!source) {
      source = {
        text: element.hasAttribute("data-i18n") ? element.textContent : null,
        label: element.hasAttribute("data-i18n-label") ? element.getAttribute("aria-label") : null,
      };
      staticText.set(element, source);
    }
    if (source.text !== null) updateText(element, t(source.text));
    if (source.label !== null) element.setAttribute("aria-label", t(source.label));
  }
  for (const element of root.querySelectorAll("[data-i18n-message]")) {
    const { key, values } = messages.get(element);
    updateText(element, t(key, values));
  }
}

export function imperialUnits() {
  return units === "imperial";
}

export function formatNumber(value, precision = 0, minimumFractionDigits = 0) {
  const key = precision + "/" + minimumFractionDigits;
  if (!numbers.has(key)) {
    numbers.set(key, new Intl.NumberFormat(language, { maximumFractionDigits: precision, minimumFractionDigits }));
  }
  return numbers.get(key).format(value);
}

export function formatDistance(km, precision = 0, minimumFractionDigits = 0) {
  return imperialUnits()
    ? formatNumber(km / kmPerMile, precision, minimumFractionDigits) + " mi"
    : formatNumber(km, precision, minimumFractionDigits) + " km";
}

export function formatSpeed(kmh) {
  return imperialUnits() ? formatNumber(kmh / kmPerMile) + " mph" : formatNumber(kmh) + " km/h";
}

export function formatAltitude(feet) {
  return imperialUnits() ? formatNumber(feet) + " ft" : formatNumber(feet * metersPerFoot) + " m";
}

export function formatAccuracy(meters) {
  return imperialUnits() ? formatNumber(meters / metersPerFoot) + " ft" : formatNumber(meters) + " m";
}

export function formatClock(timestamp, options = {}) {
  if (!Number.isFinite(timestamp)) return "—";
  const format = { ...options, hour: "2-digit", minute: "2-digit", hourCycle: clock === "12-hour" ? "h12" : "h23" };
  const key = JSON.stringify(format);
  if (!dates.has(key)) {
    let formatter;
    try {
      formatter = new Intl.DateTimeFormat(language, format);
    } catch (error) {
      if (!(error instanceof RangeError) || !format.timeZone) throw error;
      formatter = new Intl.DateTimeFormat(language, { ...format, timeZone: "UTC" });
    }
    dates.set(key, formatter);
  }
  const formatter = dates.get(key);
  if (clock !== "12-hour" || language === "en") return formatter.format(timestamp);

  // Some browsers use English day periods for Norwegian locales.
  return formatter.formatToParts(timestamp).map(({ type, value }) => {
    if (type !== "dayPeriod") return value;
    const period = value.toLowerCase().replace(/[.\s]/g, "");
    return period === "am" ? "f.m." : period === "pm" ? "e.m." : value;
  }).join("");
}

