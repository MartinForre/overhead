import { catalogAircraft } from "./artwork.js";
import { flightReferenceCallsign } from "../settings-schema.js";

const localAirlineNames = {
  BCY: "CityJet",
  BRX: "Braathens Regional Airways",
  EXS: "Jet2.com",
  FCM: "Nordic Regional Airlines",
  FIN: "Finnair",
  HKS: "CHC Helikopter Service",
  MSR: "EgyptAir",
  MSX: "EgyptAir Cargo",
  NOR: "Bristow Norway",
  SVA: "Saudia",
  SVS: "SAS Link",
  SZS: "SAS Connect",
};

export async function resolveAircraft(aircraft, signal) {
  const identity = await catalogAircraft(aircraft);
  const feedModel = text(aircraft.desc);
  const model = identity.model || feedModel;
  if (identity.icaoType && model) return { ...identity, model };

  const hex = identifier(aircraft.hex);
  const registration = identifier(aircraft.r);
  const lookupId = /^[0-9A-F]{6}$/.test(hex) ? hex :
    /^(?=.*[A-Z])[A-Z0-9-]{2,12}$/.test(registration) ? registration : "";
  if (!lookupId) return { ...identity, model };

  const result = await lookup(`aircraft/${lookupId}`, signal);
  const reference = result?.aircraft;
  const referenceType = identifier(reference?.icao_type);
  if (!reference || (identity.icaoType && referenceType !== identity.icaoType)) return { ...identity, model };

  const resolved = !identity.icaoType && /^[A-Z0-9]{2,4}$/.test(referenceType)
    ? await catalogAircraft({ ...aircraft, t: referenceType }) : identity;

  const manufacturer = text(reference.manufacturer);
  const typeName = text(reference.type);
  const referenceModel = typeName && identifier(typeName).startsWith(identifier(manufacturer) + " ")
    ? typeName : [manufacturer, typeName].filter(Boolean).join(" ");
  return { ...resolved, model: resolved.model || feedModel || referenceModel };
}

export async function callsignDetails(aircraft, signal) {
  const callsign = flightReferenceCallsign(aircraft);
  if (!callsign) return {};

  const result = await lookup(`callsign/${callsign}`, signal);
  const route = result?.flightroute;
  const rescueCode = /^(NOR)(?:SAR|RSC)\d{1,2}$/.exec(callsign)?.[1] ??
    /^(HKS)(?:SAR|R)(?=[A-Z0-9]*\d)[A-Z0-9]+$/.exec(callsign)?.[1];
  const standardCode = /^([A-Z]{3})\d[A-Z0-9]*$/.exec(callsign)?.[1];
  const localCode = rescueCode ?? standardCode;
  const localName = localAirlineNames[localCode];
  const airline = localName ? { name: localName, icao: localCode }
    : route?.airline?.name ? route.airline : await airlineFromCode(standardCode, signal);
  const airlineIcao = identifier(airline?.icao);
  return {
    airline: text(airline?.name),
    // Rescue callsigns identify the service. The rescue paint is matched by airframe.
    operatorIcao: !rescueCode && /^[A-Z]{3}$/.test(airlineIcao) && callsign.startsWith(airlineIcao)
      ? airlineIcao : undefined,
    departure: airportDetails(route?.origin),
    destination: airportDetails(route?.destination),
    ...(route?.midpoint ? { hasIntermediateStop: true } : {}),
  };
}

export async function callsignDestination(callsign, signal) {
  const response = await lookup(`callsign/${callsign}`, signal);
  return airportDetails(response?.flightroute?.destination);
}

async function airlineFromCode(airlineCode, signal) {
  if (!airlineCode) return null;

  const result = await lookup(`airline/${airlineCode}`, signal);
  if (!Array.isArray(result)) return null;
  const matchingAirlines = result.filter((airline) => identifier(airline?.icao) === airlineCode);
  return matchingAirlines.length === 1 ? matchingAirlines[0] : null;
}

function airportDetails(airport) {
  const code = identifier(airport?.iata_code) || identifier(airport?.icao_code);
  const city = text(airport?.municipality) || text(airport?.name);
  if (code || city) {
    const { elevation, latitude, longitude } = airport;
    return { code, city, elevation: Number.isFinite(elevation) ? elevation : undefined, latitude, longitude };
  }
}

function identifier(value) {
  return text(value).toUpperCase();
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function lookup(path, signal) {
  if (signal.aborted) return null;
  try {
    const response = await fetch("/api/flight-reference/" + path, {
      credentials: "omit",
      signal: AbortSignal.any([signal, AbortSignal.timeout(6_000)]),
    });
    return response.ok ? (await response.json())?.response : null;
  } catch {
    return null;
  }
}
