import { isOnGround } from "../shared/display/landing-gear.js";
import { hasCoordinates } from "../shared/display/route-progress.js";
import { distanceBetween } from "../shared/flight-weather.js";
import { normalizeBroadcastCallsign } from "../shared/settings-schema.js";

const maxObservationAgeMs = 30_000;
const maxTakeoffGapMs = 60_000;
const maxFlightGapMs = 20 * 60_000;
const maxAircraft = 4_096;

export function createTakeoffTracker({ now = Date.now } = {}) {
  const aircraftStates = new Map();

  return function observeTakeoff(aircraft, snapshotAt) {
    if (typeof aircraft?.hex !== "string" || !/^[a-f0-9]{6}$/i.test(aircraft.hex)) return;
    const callsign = normalizeBroadcastCallsign(aircraft.flight);
    const position = { latitude: aircraft.lat, longitude: aircraft.lon };
    const timestamp = snapshotAt - aircraft.seen_pos * 1_000;
    const age = now() - timestamp;
    if (!callsign || !hasCoordinates(position) || !Number.isFinite(aircraft.seen_pos) || aircraft.seen_pos < 0 ||
        !(age >= 0 && age <= maxObservationAgeMs)) return;

    const ground = isOnGround(aircraft);
    if (!ground && !Number.isFinite(aircraft.alt_baro) && !Number.isFinite(aircraft.alt_geom)) return;

    const hex = aircraft.hex.toUpperCase();
    const previous = aircraftStates.get(hex);
    if (previous && timestamp <= previous.timestamp) {
      const takeoff = previous.takeoff;
      return !ground && previous.callsign === callsign && timestamp >= takeoff?.timestamp ? takeoff : undefined;
    }

    let takeoff;
    const gap = timestamp - previous?.timestamp;
    if (!ground && previous?.callsign === callsign && gap <= maxFlightGapMs) {
      takeoff = previous.takeoff;
      if (previous.ground && gap <= maxTakeoffGapMs && distanceBetween(previous.position, aircraft) <= 10) {
        // Liftoff happened between the last surface position and the first airborne position.
        takeoff = { ...previous.position, timestamp: previous.timestamp + gap / 2 };
      }
    }

    aircraftStates.delete(hex);
    aircraftStates.set(hex, { callsign, position, ground, timestamp, takeoff });
    if (aircraftStates.size > maxAircraft) aircraftStates.delete(aircraftStates.keys().next().value);
    return takeoff;
  };
}
