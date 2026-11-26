import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { test } from "node:test";
import { callsignSelection, createCallsignTracker } from "../apps/adsb/callsign-tracker.mjs";
import { createSettingsApi } from "../apps/settings/settings-api.mjs";

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
