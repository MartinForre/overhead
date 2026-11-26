import { flightReferenceCallsign } from "../shared/settings-schema.js";

const referenceApi = "https://api.adsbdb.com/v0";
const routePrefix = "/api/flight-reference/";
const lookupPath = /^(aircraft|airline|callsign)\/([a-zA-Z0-9-]{2,12})$/;
const identifiers = {
  aircraft: /^(?:[0-9A-F]{6}|(?=.*[A-Z])[A-Z0-9-]{2,12})$/,
  airline: /^[A-Z]{3}$/,
  callsign: /^[A-Z0-9]{3,8}$/,
};
const maxCachedLookups = 256;
const routeCacheMs = 15 * 60_000;
const referenceCacheMs = 24 * 60 * 60_000;
const missingCacheMs = 5 * 60_000;
const failedCacheMs = 30_000;

export function createFlightReference({ fetcher = fetch, now = Date.now } = {}) {
  const cached = new Map();
  const pending = new Map();

  function lookup(kind, identifier) {
    const key = kind + "/" + identifier;
    const entry = cached.get(key);
    if (entry?.expiresAt > now()) return entry;
    if (pending.has(key)) return pending.get(key);

    cached.delete(key);
    const result = fetchReference(kind, key).then(({ cacheMs, ...result }) => {
      const entry = { ...result, expiresAt: now() + cacheMs };
      cached.set(key, entry);
      if (cached.size > maxCachedLookups) cached.delete(cached.keys().next().value);
      return entry;
    }).finally(() => { pending.delete(key); });
    pending.set(key, result);
    return result;
  }

  async function fetchReference(kind, key) {
    try {
      const upstream = await fetcher(referenceApi + "/" + key, {
        redirect: "error",
        signal: AbortSignal.timeout(5000),
      });
      if (!upstream.ok) {
        await upstream.body?.cancel();
        if (upstream.status === 404) return { status: 404, cacheMs: missingCacheMs };
      } else {
        const data = (await upstream.json())?.response;
        if (data && typeof data === "object") {
          return {
            status: 200, data,
            cacheMs: kind === "callsign" ? routeCacheMs : referenceCacheMs,
          };
        }
      }
    } catch {
      // Reuse a short failure window so each display can retry together.
    }
    return { status: 502, cacheMs: failedCacheMs };
  }

  async function flightReference(request, response, next) {
    const [pathname] = request.url.split("?");
    if (!pathname.startsWith(routePrefix)) return next();
    response.setHeader("Cache-Control", "no-store");
    if (request.method !== "GET") {
      response.writeHead(405, { Allow: "GET" }).end();
      return;
    }
    const [, kind, rawIdentifier] = lookupPath.exec(pathname.slice(routePrefix.length)) ?? [];
    const identifier = rawIdentifier?.toUpperCase();
    if (!kind || !identifiers[kind].test(identifier)) {
      response.writeHead(400).end();
      return;
    }

    const { status, data, expiresAt } = await lookup(kind, identifier);
    if (response.destroyed) return;
    const remainingSeconds = Math.max(0, Math.floor((expiresAt - now()) / 1000));
    response.writeHead(status, {
      "Content-Type": "application/json",
      "Cache-Control": `private, max-age=${remainingSeconds}`,
    });
    response.end(JSON.stringify({ response: data ?? null }));
  }

  flightReference.peekDestination = (aircraft) => {
    const callsign = flightReferenceCallsign(aircraft);
    if (!callsign) return;
    const entry = cached.get("callsign/" + callsign);
    if (!(entry?.expiresAt > now())) return;
    const { latitude, longitude } = entry.data?.flightroute?.destination ?? {};
    if (Number.isFinite(latitude) && Math.abs(latitude) <= 90 &&
      Number.isFinite(longitude) && Math.abs(longitude) <= 180) {
      return { latitude, longitude };
    }
  };

  return flightReference;
}
