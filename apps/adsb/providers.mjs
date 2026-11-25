export const adsbFi = readsbProvider("https://opendata.adsb.fi/api/v3");
export const adsbLol = readsbProvider("https://api.adsb.lol/v2");

const requestTimeoutMs = 3_000;
const rateLimitBackoffMs = 30_000;
const maxSnapshotAgeMs = 60_000;

export function isFreshSnapshot(snapshot) {
  return Number.isFinite(snapshot?.now) && Date.now() - snapshot.now <= maxSnapshotAgeMs;
}

// A provider accepts a point and radius in nautical miles and returns a readsb snapshot or a retry delay.
function readsbProvider(baseUrl) {
  return {
    async fetchNearby({ latitude, longitude, radiusNm }) {
      const response = await fetch(`${baseUrl}/lat/${latitude}/lon/${longitude}/dist/${radiusNm}`, {
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
      if (!response.ok) {
        const retryAfter = response.headers.get("Retry-After");
        await response.body?.cancel();
        if (response.status === 429 || response.status === 503) {
          return { retryAfterMs: retryDelay(retryAfter, response.status === 429 ? rateLimitBackoffMs : 0) };
        }
        throw new Error(`Aircraft provider returned HTTP ${response.status}`);
      }

      const snapshot = await response.json();
      if (!isFreshSnapshot(snapshot) || !Array.isArray(snapshot.ac)) {
        throw new Error("Aircraft feed is malformed or stale");
      }
      return { snapshot };
    },
  };
}

function retryDelay(header, defaultDelay) {
  if (!header?.trim()) return defaultDelay;
  const seconds = Number(header);
  const delay = Number.isFinite(seconds) ? seconds * 1_000 : Date.parse(header) - Date.now();
  return Number.isFinite(delay) ? Math.max(0, delay) : defaultDelay;
}
