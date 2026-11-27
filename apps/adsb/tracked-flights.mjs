import { env } from "node:process";
import { isFlightId, normalizeFlightNumber } from "../shared/settings-schema.js";

const endpoint = "https://aeroapi.flightaware.com/aeroapi/";
const minute = 60_000;
const hour = 60 * minute;
export function createFlightTracker({ key = env.OVERHEAD_AEROAPI_KEY, fetcher = fetch, now = Date.now } = {}) {
  key = key?.trim();
  const flights = new Map();
  const searches = new Map();
  const requestTimes = [];
  let cooldownUntil = 0;

  async function get(path, parameters) {
    if (!key) throw new TrackingError(503, "FlightAware is not configured on the display server.");
    if (now() < cooldownUntil) throw new TrackingError(429, "FlightAware has paused requests. Try again shortly.");
    const requestedAt = now();
    while (requestTimes.length && requestTimes[0] <= requestedAt - minute) requestTimes.shift();
    if (requestTimes.length >= 10) throw new TrackingError(429, "Flight lookup is busy. Try again in a minute.");
    requestTimes.push(requestedAt);

    const url = new URL(path, endpoint);
    if (parameters) url.search = new URLSearchParams(parameters);
    let response;
    try {
      response = await fetcher(url, {
        headers: { "x-apikey": key, Accept: "application/json" },
        redirect: "error",
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      throw new TrackingError(502, "FlightAware could not be reached.");
    }
    if (response.status === 404) return null;
    if (response.status === 429) {
      const retry = response.headers.get("Retry-After");
      const wait = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 : Date.parse(retry) - now();
      cooldownUntil = now() + Math.max(minute, Number.isFinite(wait) ? wait : minute);
      throw new TrackingError(429, "FlightAware has paused requests. Try again shortly.");
    }
    if ([401, 403].includes(response.status)) {
      cooldownUntil = now() + 5 * minute;
      throw new TrackingError(503, "FlightAware rejected the server’s access.");
    }
    if (!response.ok) throw new TrackingError(502, "FlightAware flight data is unavailable.");
    return response.json().catch(() => { throw new TrackingError(502, "FlightAware returned unreadable flight data."); });
  }

  async function search(number) {
    if (!normalizeFlightNumber(number)) throw new TrackingError(400, "Enter a flight number such as SK588.");
    const cached = searches.get(number);
    if (cached && (cached.pending || cached.expiresAt > now())) return cached.result;

    const entry = { pending: true, expiresAt: 0 };
    entry.result = (async () => {
      const start = new Date(now() - 24 * hour).toISOString();
      const end = new Date(now() + 36 * hour).toISOString();
      const payload = await get("flights/" + encodeURIComponent(number), { ident_type: "designator", start, end, max_pages: "1" });
      const matches = readFlights(payload).filter(row => matchesFlightNumber(row, number))
        .map(normalizeFlight).filter(flight => flight && !flight.cancelled &&
        !flight.arrived && !flight.landed && (flight.takeoff || flight.departed || flight.estimatedDeparture || flight.scheduledDeparture));
      const unique = [...new Map(matches.map(flight => [flight.id, flight])).values()];
      unique.sort((a, b) => departureTime(a) - departureTime(b));
      for (const flight of unique) {
        if (!flights.has(flight.id)) remember(flights, flight.id, {
          flight, updatedAt: now(), nextAt: now() + refreshInterval(flight, now()),
        });
      }
      entry.expiresAt = now() + 5 * minute;
      return unique.map(flight => ({ ...flight, number }));
    })().finally(() => { entry.pending = false; });
    remember(searches, number, entry);
    return entry.result;
  }

  async function status(selection) {
    const { id, number } = selection;
    let entry = flights.get(id);
    if (!entry) entry = { nextAt: 0 };
    remember(flights, id, entry);
    if (entry.pending) await entry.pending;
    else if (entry.nextAt <= now()) {
      entry.pending = refresh(entry, id).finally(() => { entry.pending = undefined; });
      await entry.pending;
    }
    return { ...entry.flight, id, number, updatedAt: entry.updatedAt, error: entry.error };
  }

  async function refresh(entry, id) {
    try {
      const payload = await get("flights/" + encodeURIComponent(id), { ident_type: "fa_flight_id", max_pages: "1" });
      const legs = readFlights(payload).filter(row => row?.fa_flight_id === id).map(normalizeFlight);
      legs.sort((a, b) => (departureTime(b) ?? 0) - (departureTime(a) ?? 0));
      const flight = legs[0];
      if (!flight) throw new TrackingError(404, "This departure is no longer available from FlightAware.");
      if (legs.length > 1) flight.diverted = true;
      entry.flight = flight;
      entry.updatedAt = now();
      entry.nextAt = now() + refreshInterval(flight, now());
      entry.error = undefined;

      if (flight.takeoff && !flight.landed && !flight.arrived && !flight.cancelled) {
        if ((entry.positionNextAt ?? 0) <= now()) {
          entry.positionNextAt = now() + 5 * minute;
          entry.position = await get("flights/" + encodeURIComponent(id) + "/position")
            .then(payload => normalizePosition(payload?.last_position)).catch(() => undefined);
        }
        if (entry.position && entry.position.timestamp >= now() - 10 * minute) flight.position = entry.position;
      }
    } catch (error) {
      entry.error = error.message;
      entry.nextAt = Math.max(now() + 2 * minute, cooldownUntil);
    }
  }

  return {
    configured: Boolean(key),
    search,
    status,
    async selection(id, number) {
      const entry = searches.get(number);
      if (!entry || entry.expiresAt <= now()) return null;
      const flight = (await entry.result).find(flight => flight.id === id);
      return flight ? {
        id, number, origin: flight.origin.code ?? "", destination: flight.destination.code ?? "",
        timezone: flight.origin.timezone ?? "",
        departure: flight.scheduledDeparture ?? flight.estimatedDeparture ?? flight.departed ?? flight.takeoff,
      } : null;
    },
  };
}

function remember(map, key, value) {
  map.delete(key);
  map.set(key, value);
  while (map.size > 128) map.delete(map.keys().next().value);
}

function readFlights(payload) {
  if (payload === null) return [];
  if (!Array.isArray(payload?.flights)) throw new TrackingError(502, "FlightAware returned unreadable flight data.");
  return payload.flights;
}

function refreshInterval(flight, now) {
  if (flight.cancelled || flight.arrived) return Infinity;
  if (flight.landed && now - flight.landed >= 30 * minute) return Infinity;
  const departure = flight.estimatedDeparture ?? flight.scheduledDeparture;
  // Stop polling old records that never get a terminal update.
  if (now - (flight.takeoff ?? flight.departed ?? departure ?? now) > 36 * hour) return Infinity;
  if (flight.takeoff || flight.departed || flight.landed) return 2 * minute;
  if (departure && departure - now > hour) return Math.min(30 * minute, departure - now - hour);
  return 5 * minute;
}

function departureTime(flight) {
  return flight.departed ?? flight.takeoff ?? flight.estimatedDeparture ?? flight.scheduledDeparture;
}

function matchesFlightNumber(row, number) {
  if (!row) return false;
  const codeshares = [row.codeshares, row.codeshares_iata].filter(Array.isArray).flat();
  return [row.ident, row.ident_icao, row.ident_iata, ...codeshares].some(value => normalizeFlightNumber(value) === number);
}

function normalizeFlight(row) {
  if (!isFlightId(row?.fa_flight_id)) return null;
  return {
    id: row.fa_flight_id,
    callsign: clean(row.ident_icao ?? row.ident),
    aircraftType: clean(row.aircraft_type),
    registration: clean(row.registration),
    operator: clean(row.operator_icao ?? row.operator),
    operatorIata: clean(row.operator_iata),
    origin: normalizeAirport(row.origin),
    destination: normalizeAirport(row.destination),
    scheduledDeparture: timestamp(row.scheduled_out) ?? timestamp(row.scheduled_off),
    estimatedDeparture: timestamp(row.estimated_out) ?? timestamp(row.estimated_off),
    departed: timestamp(row.actual_out) ?? timestamp(row.actual_off),
    takeoff: timestamp(row.actual_off),
    scheduledArrival: timestamp(row.scheduled_in) ?? timestamp(row.scheduled_on),
    estimatedArrival: timestamp(row.estimated_in) ?? timestamp(row.estimated_on),
    landed: timestamp(row.actual_on),
    arrived: timestamp(row.actual_in),
    estimatedLanding: timestamp(row.estimated_on),
    cancelled: row.cancelled === true,
    diverted: row.diverted === true,
    progress: Number.isFinite(row.progress_percent) && row.progress_percent >= 0 && row.progress_percent <= 100
      ? row.progress_percent : undefined,
  };
}

function normalizeAirport(airport) {
  return {
    code: clean(airport?.code_iata ?? airport?.code_icao ?? airport?.code),
    city: clean(airport?.city ?? airport?.name),
    timezone: clean(airport?.timezone),
    ...coordinates(airport),
  };
}

function normalizePosition(position) {
  if (!position) return;
  return {
    timestamp: timestamp(position.timestamp),
    ...coordinates(position),
    altitude: Number.isFinite(position.altitude) ? position.altitude * 100 : undefined,
    altitudeTrend: position.altitude_change === "C" ? 1 : position.altitude_change === "D" ? -1 : undefined,
    speed: Number.isFinite(position.groundspeed) && position.groundspeed >= 0 ? Math.round(position.groundspeed * 1.852) : undefined,
    heading: Number.isFinite(position.heading) && position.heading >= 0 && position.heading < 360 ? position.heading : undefined,
  };
}

function coordinates(point) {
  if (Number.isFinite(point?.latitude) && Math.abs(point.latitude) <= 90 &&
      Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180) {
    return { latitude: point.latitude, longitude: point.longitude };
  }
}

function clean(value) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 128) : undefined;
}

function timestamp(value) {
  const millis = typeof value === "string" ? Date.parse(value) : NaN;
  return Number.isFinite(millis) ? millis : undefined;
}

class TrackingError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
