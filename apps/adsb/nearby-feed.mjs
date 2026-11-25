import { adsbFi, adsbLol, isFreshSnapshot } from "./providers.mjs";

const searchPath = /^\/api\/aircraft\/v2\/lat\/(-?\d+(?:\.5)?)\/lon\/(-?\d+(?:\.5)?)\/dist\/(\d+)$/;
const primaryIntervalMs = 5_000;
const fallbackIntervalMs = 180_000;

export function createNearbyFeed() {
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
    response.end(JSON.stringify(snapshot));
  };
}

function pollProvider(provider, intervalMs) {
  let nextRequestAt = 0;
  let inFlight;
  let cached;

  return function poll(key, query) {
    const now = Date.now();
    if (inFlight?.key === key) return inFlight.result;
    if (inFlight || now < nextRequestAt) {
      return cached?.key === key && isFreshSnapshot(cached.snapshot) ? cached.snapshot : null;
    }

    nextRequestAt = now + intervalMs;
    const result = provider.fetchNearby(query).then(({ snapshot, retryAfterMs = 0 }) => {
      nextRequestAt = Math.max(nextRequestAt, Date.now() + retryAfterMs);
      cached = snapshot ? { key, snapshot } : undefined;
      return snapshot;
    }).catch(() => {
      cached = undefined;
      return null;
    }).finally(() => {
      inFlight = undefined;
    });
    inFlight = { key, result };
    return result;
  };
}
