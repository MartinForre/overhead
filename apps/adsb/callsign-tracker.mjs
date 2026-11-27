import { normalizeBroadcastCallsign, normalizeCallsign, normalizeFlightNumber } from "../shared/settings-schema.js";
import { adsbFi } from "./providers.mjs";
import { createTakeoffTracker } from "./takeoff-tracker.mjs";

const localDesignators = { AY: "FIN", D8: "NSZ", DY: "NOZ", SK: "SAS", WF: "WIF" };
const maxObservationAgeSeconds = 30;

export function callsignSelection(input) {
  const number = normalizeFlightNumber(input) || normalizeCallsign(input);
  const ticket = /^([A-Z0-9]{2})(\d{1,4}[A-Z]?)$/.exec(number);
  const operator = ticket && localDesignators[ticket[1]];
  const callsign = operator ? operator + ticket[2] : normalizeCallsign(number);
  if (!callsign) return null;
  return { id: "adsb-fi-" + callsign, number, callsign };
}

export function createCallsignTracker({
  lookup = adsbFi.fetchCallsign, lookupHex = adsbFi.fetchHex, now = Date.now, observeTakeoff = createTakeoffTracker({ now }),
} = {}) {
  const entries = new Map();

  async function status(selection) {
    const { id } = selection;
    let entry = entries.get(id);
    if (!entry || (!entry.pending && entry.nextAt <= now())) {
      entry = { pending: true, nextAt: 0 };
      entry.result = readAircraft(selection, entry).finally(() => { entry.pending = false; });
      entries.delete(id);
      entries.set(id, entry);
      while (entries.size > 32) entries.delete(entries.keys().next().value);
    }
    return { ...selection, ...await entry.result };
  }

  async function readAircraft({ callsign, aircraftHex }, entry) {
    try {
      const { snapshot, retryAfterMs } = await (aircraftHex ? lookupHex(aircraftHex) : lookup(callsign));
      if (!snapshot) {
        entry.nextAt = now() + Math.max(30_000, retryAfterMs ?? 0);
        return { state: "unavailable" };
      }
      const ageSeconds = Math.max(0, (now() - snapshot.now) / 1_000);
      const matches = new Map();
      for (const aircraft of snapshot.ac) {
        if (typeof aircraft?.hex !== "string" || !/^[a-f0-9]{6}$/i.test(aircraft.hex)) continue;
        const hex = aircraft.hex.toUpperCase();
        if (aircraftHex && hex !== aircraftHex) continue;
        if (callsign && normalizeBroadcastCallsign(aircraft.flight) !== callsign) continue;
        const age = aircraft.seen_pos ?? aircraft.seen;
        if (!Number.isFinite(age) || age < 0 || ageSeconds + age > maxObservationAgeSeconds) continue;
        const previous = matches.get(hex);
        if (!previous || age < previous.age) matches.set(hex, { aircraft, age });
      }
      entry.nextAt = now() + (matches.size === 1 ? 12_000 : 30_000);
      if (!matches.size) return { state: "waiting" };
      if (matches.size > 1) return { state: "ambiguous" };

      const [{ aircraft, age }] = matches.values();
      const hasPosition = Number.isFinite(aircraft.seen_pos);
      const ground = aircraft.alt_baro === "ground" || aircraft.alt_geom === "ground" || aircraft.ground === true;
      const hasAltitude = Number.isFinite(aircraft.alt_baro) || Number.isFinite(aircraft.alt_geom);
      return {
        state: "observed",
        aircraftType: typeof aircraft.t === "string" ? aircraft.t : undefined,
        model: typeof aircraft.desc === "string" ? aircraft.desc : undefined,
        registration: typeof aircraft.r === "string" ? aircraft.r : undefined,
        hex: aircraft.hex,
        category: typeof aircraft.category === "string" ? aircraft.category : undefined,
        operator: normalizeCallsign(callsign).slice(0, 3) || undefined,
        updatedAt: snapshot.now - age * 1_000,
        observedTakeoff: observeTakeoff(aircraft, snapshot.now),
        position: {
          latitude: hasPosition ? aircraft.lat : undefined,
          longitude: hasPosition ? aircraft.lon : undefined,
          pressureAltitude: Number.isFinite(aircraft.alt_baro) ? aircraft.alt_baro : undefined,
          geometricAltitude: Number.isFinite(aircraft.alt_geom) ? aircraft.alt_geom : undefined,
          ground: ground || (hasAltitude ? false : undefined),
          speed: Number.isFinite(aircraft.gs) && aircraft.gs >= 0 ? Math.round(aircraft.gs * 1.852) : undefined,
          heading: Number.isFinite(aircraft.track) && aircraft.track >= 0 && aircraft.track < 360 ? aircraft.track : undefined,
          trackRate: Number.isFinite(aircraft.track_rate) ? aircraft.track_rate : undefined,
          verticalRate: Number.isFinite(aircraft.geom_rate) ? aircraft.geom_rate :
            Number.isFinite(aircraft.baro_rate) ? aircraft.baro_rate : undefined,
        },
      };
    } catch {
      entry.nextAt = now() + 30_000;
      return { state: "unavailable" };
    }
  }

  return { status };
}
