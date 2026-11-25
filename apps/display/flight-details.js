import { describeAircraftType } from "./artwork.js";

const referenceApi = "https://api.adsbdb.com/v0";
const referenceCache = new Map();
const maxCachedLookups = 256;
const routeCacheMs = 15 * 60_000;
const referenceCacheMs = 24 * 60 * 60_000;
const missingCacheMs = 5 * 60_000;
const failedCacheMs = 30_000;

export async function aircraftModel(aircraft, signal) {
  const icaoType = identifier(aircraft.t);
  const catalogModel = await describeAircraftType(icaoType);
  const feedModel = text(aircraft.desc);
  if (catalogModel || feedModel) return catalogModel || feedModel;

  const hex = identifier(aircraft.hex);
  const registration = identifier(aircraft.r);
  const lookupId = /^[0-9A-F]{6}$/.test(hex) ? hex :
    /^(?=.*[A-Z])[A-Z0-9-]{2,12}$/.test(registration) ? registration : "";
  if (!lookupId) return "";

  const result = await lookup(`aircraft/${lookupId}`, signal);
  const reference = result?.aircraft;
  if (!reference || (icaoType && identifier(reference.icao_type) !== icaoType)) return "";

  const manufacturer = text(reference.manufacturer);
  const model = text(reference.type);
  if (model && identifier(model).startsWith(identifier(manufacturer) + " ")) return model;
  return [manufacturer, model].filter(Boolean).join(" ");
}

export async function callsignDetails(aircraft, signal) {
  const callsign = identifier(aircraft.flight);
  const registration = identifier(aircraft.r).replaceAll("-", "");
  if (!/^[A-Z0-9]{3,8}$/.test(callsign) || callsign === registration) return {};

  const result = await lookup(`callsign/${callsign}`, signal);
  const route = result?.flightroute;
  const airline = route?.airline?.name ? route.airline : await airlineFromCallsign(callsign, signal);
  const airlineIcao = identifier(airline?.icao);
  return {
    airline: text(airline?.name),
    operatorIcao: /^[A-Z]{3}$/.test(airlineIcao) && callsign.startsWith(airlineIcao) ? airlineIcao : undefined,
    departure: airportDetails(route?.origin),
    destination: airportDetails(route?.destination),
  };
}

async function airlineFromCallsign(callsign, signal) {
  const airlineCode = /^([A-Z]{3})\d[A-Z0-9]*$/.exec(callsign)?.[1];
  if (!airlineCode) return null;

  const result = await lookup(`airline/${airlineCode}`, signal);
  if (!Array.isArray(result)) return null;
  const matchingAirlines = result.filter((airline) => identifier(airline?.icao) === airlineCode);
  return matchingAirlines.length === 1 ? matchingAirlines[0] : null;
}

function airportDetails(airport) {
  const code = identifier(airport?.iata_code) || identifier(airport?.icao_code);
  const city = text(airport?.municipality) || text(airport?.name);
  if (code || city) return { code, city };
}

function identifier(value) {
  return text(value).toUpperCase();
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function lookup(path, signal) {
  if (signal.aborted) return null;

  let entry = referenceCache.get(path);
  if (!entry || Date.now() >= entry.expiresAt) {
    entry = { expiresAt: Infinity };
    entry.result = fetchReference(path, entry);
    referenceCache.delete(path);
    referenceCache.set(path, entry);
    if (referenceCache.size > maxCachedLookups) {
      referenceCache.delete(referenceCache.keys().next().value);
    }
  }

  const result = await entry.result;
  return signal.aborted ? null : result;
}

async function fetchReference(path, entry) {
  let cacheMs = failedCacheMs;
  try {
    // Several cards or refreshes can share this request even if one is canceled.
    const response = await fetch(`${referenceApi}/${path}`, {
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.timeout(5_000),
    });
    if (response.status === 404) cacheMs = missingCacheMs;
    if (!response.ok) return null;

    const result = (await response.json())?.response;
    if (result != null) cacheMs = path.startsWith("callsign/") ? routeCacheMs : referenceCacheMs;
    return result;
  } catch {
    return null;
  } finally {
    entry.expiresAt = Date.now() + cacheMs;
  }
}
