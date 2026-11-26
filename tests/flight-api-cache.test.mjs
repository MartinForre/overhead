import assert from "node:assert/strict";
import test from "node:test";
import { createFlightReference } from "../apps/adsb/flight-reference.mjs";
import { metarCache } from "../apps/adsb/metar.mjs";
import { createNearbyFeed } from "../apps/adsb/nearby-feed.mjs";
import { adsbFi, adsbLol } from "../apps/adsb/providers.mjs";

async function request(middleware, url, { method = "GET", response = {} } = {}) {
  const result = { status: 200, headers: {} };
  Object.assign(response, {
    statusCode: 200,
    setHeader(name, value) {
      result.headers[name] = value;
    },
    writeHead(status, headers) {
      this.statusCode = status;
      Object.assign(result.headers, headers);
      return this;
    },
    end(body) {
      result.status = this.statusCode;
      result.body = body;
    },
  });
  await middleware({ method, url }, response, () => assert.fail("Expected an API response"));
  return result;
}

function pendingResponse() {
  let resolve;
  const promise = new Promise((complete) => { resolve = complete; });
  return { promise, resolve };
}

test("nearby clients share an upstream request and get five seconds of reuse after it completes", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.UTC(2026, 0, 1) });
  t.mock.method(metarCache, "peek", () => []);
  const deferred = pendingResponse();
  const primary = t.mock.method(adsbFi, "fetchNearby", async () => ({ snapshot: { now: Date.now(), ac: [] } }));
  primary.mock.mockImplementationOnce(() => deferred.promise);
  const fallback = t.mock.method(adsbLol, "fetchNearby", async () => ({}));
  const nearby = createNearbyFeed();
  const path = "/api/aircraft/v2/lat/59.5/lon/11/dist/50";

  const first = request(nearby, path);
  const second = request(nearby, "/api/aircraft/v2/lat/059.5/lon/011/dist/050");
  assert.equal(primary.mock.callCount(), 1);
  t.mock.timers.tick(2_000);
  deferred.resolve({ snapshot: { now: Date.now(), ac: [{ hex: "AB1234" }] } });

  const initial = await first;
  assert.equal(initial.status, 200);
  assert.deepEqual(await second, initial);
  t.mock.timers.tick(4_999);
  assert.deepEqual(await request(nearby, path), initial);
  assert.equal(primary.mock.callCount(), 1);

  t.mock.timers.tick(1);
  assert.notEqual((await request(nearby, path)).body, initial.body);
  assert.equal(primary.mock.callCount(), 2);
  assert.equal(fallback.mock.callCount(), 0);
});

test("nearby queries keep separate snapshots and fallbacks respect their cooldown", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.UTC(2026, 0, 1) });
  t.mock.method(metarCache, "peek", () => []);
  const firstResult = pendingResponse();
  const primary = t.mock.method(adsbFi, "fetchNearby", async ({ latitude }) =>
    ({ snapshot: { now: Date.now(), ac: [{ lat: latitude }] } }));
  primary.mock.mockImplementationOnce(() => firstResult.promise);
  const fallback = t.mock.method(adsbLol, "fetchNearby", async () => ({ snapshot: { now: Date.now(), ac: [] } }));
  const nearby = createNearbyFeed();
  const area = (lat) => "/api/aircraft/v2/lat/" + lat + "/lon/11/dist/50";

  const first = request(nearby, area(59));
  t.mock.timers.tick(2_000);
  firstResult.resolve({ snapshot: { now: Date.now(), ac: [{ lat: 59 }] } });
  const initial = await first;
  t.mock.timers.tick(3_000);

  assert.equal(JSON.parse((await request(nearby, area(60))).body).ac[0].lat, 60);
  assert.deepEqual(await request(nearby, area(59)), initial);
  assert.equal(primary.mock.callCount(), 2);
  assert.equal(fallback.mock.callCount(), 0);

  primary.mock.mockImplementation(async () => ({ retryAfterMs: 30_000 }));
  const fallbackNearby = createNearbyFeed();
  const fallbackFirst = await request(fallbackNearby, area(59));
  t.mock.timers.tick(5_000);
  assert.deepEqual(await request(fallbackNearby, area(59)), fallbackFirst);
  assert.equal(primary.mock.callCount(), 3);
  assert.equal(fallback.mock.callCount(), 1);
  t.mock.timers.tick(60_000);
  assert.equal((await request(fallbackNearby, area(59))).status, 503);
  assert.equal(fallback.mock.callCount(), 1);
});

test("flight reference lookups share in-flight work, survive a disconnected client, and expire by resource type", async (t) => {
  let now = Date.UTC(2026, 0, 1);
  const deferred = pendingResponse();
  const fetcher = t.mock.fn(async () => Response.json({ response: { aircraft: { type: "A320" } } }));
  fetcher.mock.mockImplementationOnce(() => deferred.promise);
  const reference = createFlightReference({ fetcher, now: () => now });
  const firstClient = {};
  const callsignPath = "/api/flight-reference/callsign/SAS588";
  const first = request(reference, callsignPath, { response: firstClient });
  const second = request(reference, "/api/flight-reference/callsign/sas588");
  assert.equal(fetcher.mock.callCount(), 1);
  assert.equal(fetcher.mock.calls[0].arguments[0], "https://api.adsbdb.com/v0/callsign/SAS588");
  firstClient.destroyed = true;
  deferred.resolve(Response.json({ response: { flightroute: { callsign: "SAS588" } } }));

  assert.equal((await first).body, undefined);
  const result = await second;
  assert.equal(result.status, 200);
  assert.equal(result.headers["Cache-Control"], "private, max-age=900");
  assert.deepEqual(result, await request(reference, callsignPath));
  now += 20_000;
  assert.equal((await request(reference, callsignPath)).headers["Cache-Control"], "private, max-age=880");
  assert.equal(fetcher.mock.callCount(), 1);

  const aircraftPath = "/api/flight-reference/aircraft/ABC123";
  assert.equal((await request(reference, aircraftPath)).headers["Cache-Control"], "private, max-age=86400");
  now += 880_000;
  await request(reference, callsignPath);
  await request(reference, aircraftPath);
  assert.equal(fetcher.mock.callCount(), 3);
});

test("flight reference lookup validates identifiers and shares not-found and failure windows", async (t) => {
  let now = Date.UTC(2026, 0, 1);
  const fetcher = t.mock.fn(async (url) => new Response(null, {
    status: url.endsWith("/ABC") ? 404 : 503,
  }));
  const reference = createFlightReference({ fetcher, now: () => now });
  const missing = "/api/flight-reference/airline/ABC";
  const failed = "/api/flight-reference/airline/XYZ";

  assert.equal((await request(reference, "/api/flight-reference/aircraft/https:%2f%2fexample.net")).status, 400);
  assert.equal((await request(reference, missing, { method: "POST" })).status, 405);
  assert.equal(fetcher.mock.callCount(), 0);
  assert.equal((await request(reference, missing)).status, 404);
  assert.equal((await request(reference, missing)).headers["Cache-Control"], "private, max-age=300");
  assert.equal((await request(reference, failed)).status, 502);
  assert.equal((await request(reference, failed)).headers["Cache-Control"], "private, max-age=30");
  assert.equal(fetcher.mock.callCount(), 2);

  now += 30_000;
  await request(reference, missing);
  await request(reference, failed);
  assert.equal(fetcher.mock.callCount(), 3);
  now += 270_000;
  await request(reference, missing);
  assert.equal(fetcher.mock.callCount(), 4);
});

test("nearby maps get already-known destinations without adding reference lookups", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.UTC(2026, 0, 1) });
  t.mock.method(metarCache, "peek", () => []);
  const ac = [{ flight: "  sas588  " }, { flight: "SAS123" }, { flight: "SAS588", r: "SAS-588" }];
  t.mock.method(adsbFi, "fetchNearby", async () => ({ snapshot: { now: Date.now(), ac } }));
  const destination = { latitude: 58.8767, longitude: 5.6378 };
  const fetcher = t.mock.fn(async () => Response.json({ response: { flightroute: { destination } } }));
  const reference = createFlightReference({ fetcher });
  const nearby = createNearbyFeed({ peekDestination: reference.peekDestination });
  const observed = async () => JSON.parse((await request(nearby, "/api/aircraft/v2/lat/59/lon/5.5/dist/50")).body).ac;

  assert.deepEqual(await observed(), ac);
  assert.equal(fetcher.mock.callCount(), 0);
  await request(reference, "/api/flight-reference/callsign/SAS588");
  assert.deepEqual(await observed(), [{ ...ac[0], knownDestination: destination }, ...ac.slice(1)]);
  assert.equal(fetcher.mock.callCount(), 1);
  t.mock.timers.tick(15 * 60_000);
  assert.deepEqual(await observed(), ac);
  assert.equal(fetcher.mock.callCount(), 1);
});
