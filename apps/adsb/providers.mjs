const requestTimeoutMs = 3_000;
const rateLimitBackoffMs = 30_000;
const maxSnapshotAgeMs = 60_000;
const adsbFiBase = "https://opendata.adsb.fi/api";
let adsbFiRequests = Promise.resolve();
let nextAdsbFiRequestAt = 0;
let adsbFiPausedUntil = 0;

export const adsbFi = {
  ...readsbProvider(adsbFiBase + "/v3", requestAdsbFi),
  fetchCallsign(callsign) {
    return getSnapshot(adsbFiBase + "/v2/callsign/" + encodeURIComponent(callsign), requestAdsbFi, true);
  },
  fetchHex(hex) {
    return getSnapshot(adsbFiBase + "/v2/hex/" + encodeURIComponent(hex), requestAdsbFi, true);
  },
};
export const adsbLol = readsbProvider("https://api.adsb.lol/v2", requestSnapshot);

export function isFreshSnapshot(snapshot) {
  return Number.isFinite(snapshot?.now) && Date.now() - snapshot.now <= maxSnapshotAgeMs;
}

// A provider accepts a point and radius in nautical miles and returns a readsb snapshot or a retry delay.
function readsbProvider(baseUrl, request) {
  return {
    fetchNearby({ latitude, longitude, radiusNm }) {
      return getSnapshot(`${baseUrl}/lat/${latitude}/lon/${longitude}/dist/${radiusNm}`, request);
    },
  };
}

function requestSnapshot(url) {
  return fetch(url, { signal: AbortSignal.timeout(requestTimeoutMs) });
}

function requestAdsbFi(url) {
  // Nearby and callsign lookups share the public adsb.fi request limit.
  const result = adsbFiRequests.then(async () => {
    const wait = nextAdsbFiRequestAt - Date.now();
    if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
    if (adsbFiPausedUntil > Date.now()) return new Response(null, {
      status: 429,
      headers: { "Retry-After": String(Math.ceil((adsbFiPausedUntil - Date.now()) / 1_000)) },
    });
    nextAdsbFiRequestAt = Date.now() + 1_050;
    const response = await requestSnapshot(url);
    if (response.status === 429) {
      adsbFiPausedUntil = Date.now() + Math.max(1_050, retryDelay(response.headers.get("Retry-After"), rateLimitBackoffMs));
    }
    return response;
  });
  adsbFiRequests = result.catch(() => {});
  return result;
}

async function getSnapshot(url, request, emptyOnNotFound = false) {
  const response = await request(url);
  if (!response.ok) {
    const retryAfter = response.headers.get("Retry-After");
    await response.body?.cancel();
    if (response.status === 404 && emptyOnNotFound) return { snapshot: { ac: [], now: Date.now() } };
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
}

function retryDelay(header, defaultDelay) {
  if (!header?.trim()) return defaultDelay;
  const seconds = Number(header);
  const delay = Number.isFinite(seconds) ? seconds * 1_000 : Date.parse(header) - Date.now();
  return Number.isFinite(delay) ? Math.max(0, delay) : defaultDelay;
}
