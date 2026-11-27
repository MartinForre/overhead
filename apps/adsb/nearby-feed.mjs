import { adsbFi, adsbLol, isFreshSnapshot } from "./providers.mjs";
import { metarCache, maxStationDistanceKm } from "./metar.mjs";
import { createTakeoffTracker } from "./takeoff-tracker.mjs";

const searchPath = /^\/api\/aircraft\/v2\/lat\/(-?\d+(?:\.5)?)\/lon\/(-?\d+(?:\.5)?)\/dist\/(\d+)$/;
const primaryIntervalMs = 5_000;
const fallbackIntervalMs = 180_000;
const maxCachedRegions = 8;

export function createNearbyFeed({ peekDestination, observeTakeoff = createTakeoffTracker() } = {}) {
  const primary = pollProvider(adsbFi, primaryIntervalMs);
  const fallback = pollProvider(adsbLol, fallbackIntervalMs);

  return async function nearbyFeed(request, response, next) {
    const match = request.method === "GET" && searchPath.exec(request.url);
    if (!match) return next();

    const [latitude, longitude, radiusNm] = match.slice(1).map(Number);
    response.setHeader("Cache-Control", "no-store");
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || radiusNm > 250) {
      response.statusCode = 400;
      response.end("Invalid aircraft search area");
      return;
    }

    const query = { latitude, longitude, radiusNm };
    const key = `${latitude}/${longitude}/${radiusNm}`;
    const snapshot = await primary(key, query) ?? await fallback(key, query);
    if (!snapshot) {
      response.statusCode = 503;
      response.end("Flight data unavailable");
      return;
    }

    response.setHeader("Content-Type", "application/json");
    const metars = metarCache.peek(key, query);
    const ac = snapshot.ac.map(item => {
      const destination = item && peekDestination?.(item);
      const takeoff = observeTakeoff(item, snapshot.now);
      return destination || takeoff ? { ...item, knownDestination: destination, observedTakeoff: takeoff } : item;
    });
    response.end(JSON.stringify({ ...snapshot, ac, metars, maxStationDistanceKm }));
  };
}

function pollProvider(provider, intervalMs) {
  let nextRequestAt = 0;
  let inFlight;
  const snapshots = new Map();

  return function poll(key, query) {
    if (inFlight?.key === key) return inFlight.result;
    const now = Date.now();
    const cached = snapshots.get(key);
    if (cached?.expiresAt > now && isFreshSnapshot(cached.snapshot)) return cached.snapshot;
    snapshots.delete(key);
    if (inFlight || now < nextRequestAt) return null;

    nextRequestAt = now + intervalMs;
    const result = provider.fetchNearby(query).then(({ snapshot, retryAfterMs = 0 }) => {
      nextRequestAt = Math.max(nextRequestAt, Date.now() + retryAfterMs);
      if (snapshot) {
        snapshots.set(key, { snapshot, expiresAt: Date.now() + intervalMs });
        if (snapshots.size > maxCachedRegions) snapshots.delete(snapshots.keys().next().value);
      }
      return snapshot;
    }).catch(() => null).finally(() => {
      inFlight = undefined;
    });
    inFlight = { key, result };
    return result;
  };
}
