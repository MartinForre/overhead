import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { test } from "node:test";
import { callsignSelection, createCallsignTracker } from "../apps/adsb/callsign-tracker.mjs";
import { createFlightTracker } from "../apps/adsb/tracked-flights.mjs";
import { createSettingsApi } from "../apps/settings/settings-api.mjs";
import { sampleMapMotion, updateMapMotion } from "../apps/shared/display/map-motion.js";
import { trackedMapEntry } from "../apps/shared/display/map-aircraft.js";

async function fixture(t, { tracker = { configured: false }, callsigns, stored } = {}) {
  const directory = await mkdtemp(join(tmpdir(), "overhead-live-track-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, "config.json");
  if (stored) await writeFile(path, JSON.stringify(stored));
  let api = createSettingsApi(path, tracker, callsigns);

  async function request(url, method = "GET", data) {
    const post = data && Buffer.from(JSON.stringify(data));
    const request = Object.assign(Readable.from(post ? [post] : []), {
      url, method, headers: post ? { "content-type": "application/json" } : {},
    });
    const response = {
      setHeader() {},
      writeHead(status) { this.status = status; },
      end(body) { this.body = JSON.parse(body); },
    };
    await api(request, response, () => assert.fail(`Unexpected route ${url}`));
    return response;
  }

  const add = (hex, callsign, registration) => request("/api/track/queue", "POST", {
    action: "add-live", hex, callsign, registration,
  });
  return { add, request, reopen: () => { api = createSettingsApi(path, tracker, callsigns); } };
}

test("Live taps persist in FIFO order and concurrent duplicate taps leave the queue alone", async (t) => {
  const { add, request, reopen } = await fixture(t);
  await add("4cad94", " SAS588 ");
  await add("4ca850", "WIF541");
  const third = await add("478129", "SAVER50");
  assert.equal(third.body.replaced, undefined);
  assert.deepEqual(third.body.trackedFlights.map(flight => flight.number), ["SAS588", "WIF541", "SAVER50"]);

  const duplicate = await add("4cad94", "SAS588");
  assert.equal(duplicate.body.added, false);
  assert.deepEqual(duplicate.body.trackedFlights, third.body.trackedFlights);
  assert.equal((await add("invalid", "NSZ22")).status, 400);

  const results = await Promise.all([add("47abc0", "", "LN-ABC"), add("47abc0", "", "LN-ABC")]);
  assert.ok(results.every(result => result.status === 200));
  assert.deepEqual(results.map(result => result.body.added).sort(), [false, true]);
  assert.equal(results.find(result => result.body.added).body.replaced, "SAS588");
  reopen();
  const { body: settings } = await request("/api/settings");
  assert.equal(settings.mode, "live");
  assert.deepEqual(settings.trackedFlights.map(flight => flight.number), ["WIF541", "SAVER50", "LN-ABC"]);
});

test("Live entries observe the selected aircraft with FlightAware configured", async (t) => {
  let now = 1_700_000_000_000;
  let broadcast = "SAS5AZ";
  let queried = 0;
  const callsigns = createCallsignTracker({
    now: () => now,
    lookupHex: async (hex) => {
      assert.equal(hex, "4CAD94");
      queried++;
      return { snapshot: { now, ac: [
        { hex: "4ca850", flight: "SAS5AZ", seen_pos: 0 },
        { hex: "4cad94", flight: broadcast, seen_pos: 0 },
      ] } };
    },
  });
  const { add, request } = await fixture(t, {
    tracker: { configured: true }, callsigns,
    stored: { trackedFlights: [callsignSelection("WIF541")] },
  });
  const { body: settings } = await add("4cad94", "SAS5AZ");
  assert.equal(settings.trackProvider, "flightaware");
  assert.equal(queried, 0);
  await request("/api/settings", "PATCH", { mode: "track" });
  const { body: { flights } } = await request("/api/track/status");
  assert.equal(flights[0].state, "choose-departure");
  assert.equal(flights[1].state, "observed");
  assert.equal(flights[1].hex, "4cad94");
  broadcast = "SAS593";
  assert.equal((await callsigns.status(settings.trackedFlights[1])).state, "observed");
  assert.equal(queried, 1);
  now += 15_000;
  const changed = await request("/api/track/status");
  assert.equal(changed.body.flights[1].state, "waiting");
  assert.equal(queried, 2);
});

test("Dated Track flights retain real position timestamps and form trails across slower reports", async () => {
  let now = Date.UTC(2025, 10, 26, 12);
  let longitude = 5;
  const id = "SAS588-departure";
  const selection = { id, number: "SK588" };
  const tracker = createFlightTracker({ key: "fixture", now: () => now, fetcher: async url => {
    if (url.pathname.endsWith("/position")) {
      return Response.json({ last_position: {
        latitude: 59, longitude, timestamp: new Date(now - 2_000).toISOString(), heading: 90, groundspeed: 430,
      } });
    }
    return Response.json({ flights: [{
      fa_flight_id: id, ident_icao: "SAS588", destination: { code_iata: "OSL" },
      actual_off: new Date(now - 60 * 60_000).toISOString(),
    }] });
  } });
  const first = trackedMapEntry(await tracker.status(selection), selection, undefined, now);
  assert.equal(first.observedAt, now - 2_000);
  assert.equal(first.item.flight, "SAS588");
  assert.equal(first.destinationCode, "OSL");
  assert.equal(first.item.lon, 5);
  assert.equal(first.item.lat, 59);
  const initial = updateMapMotion(undefined, first, now);
  now += 5 * 60_000;
  longitude = 6;
  const latest = await tracker.status(selection);
  const second = trackedMapEntry(latest, selection, undefined, now);
  const moving = updateMapMotion(initial, second, now);
  assert.equal(moving.history.length, 2);
  assert.deepEqual(sampleMapMotion(moving, now + 30_000).position, [6, 59]);
  assert.equal(trackedMapEntry(latest, selection, undefined, now + 10 * 60_000), undefined);
  assert.equal(trackedMapEntry({ ...latest, landed: now }, selection, undefined, now), undefined);
});
