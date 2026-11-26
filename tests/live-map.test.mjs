import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { test } from "node:test";
import { createSettingsApi } from "../apps/settings/settings-api.mjs";
import {
  clipDestinationLine, destinationPoint, mapDiameterBounds, mapTrack, projectFromCenter, spriteOrientation,
} from "../apps/shared/display/map-geometry.js";
import { artworkAnchor, artworkEndpoints, groupGroundAircraft, mapAircraftScale } from "../apps/shared/display/map-aircraft.js";
import { sampleMapMotion, updateMapMotion } from "../apps/shared/display/map-motion.js";
import { aircraftForList, selectNearbyAircraft } from "../apps/shared/display/nearby-aircraft.js";
import { distanceBetween } from "../apps/shared/flight-weather.js";
import { isMapAircraftKey, mapAircraftKey } from "../apps/shared/settings-schema.js";

test("Map keeps artwork upright across all bearings", () => {
  for (let step = 0; step < 3600; step++) {
    const track = step / 10;
    const { rotation, mirror } = spriteOrientation(track);
    const angle = rotation * Math.PI / 180;
    const bearing = track * Math.PI / 180;
    const facing = mirror ? 1 : -1;
    assert.ok(Math.abs(rotation) <= 90);
    assert.ok(Math.abs(facing * Math.cos(angle) - Math.sin(bearing)) < 1e-12);
    assert.ok(Math.abs(facing * Math.sin(angle) + Math.cos(bearing)) < 1e-12);
  }
  assert.equal(mapTrack(0), 0);
  assert.equal(mapTrack(360), undefined);
  assert.equal(mapTrack(null), undefined);
});

test("Destination guides start at the nose and end at the airport or viewport edge", () => {
  assert.deepEqual(artworkAnchor(40, 60, 0, 40, 20, [0, .5]), [40, 40]);
  assert.deepEqual(artworkAnchor(40, 60, 180, 40, 20, [0, .5]), [40, 80]);
  assert.deepEqual(artworkAnchor(40, 60, 0, 40, 20, [1, .5]), [40, 80]);
  assert.deepEqual(artworkAnchor(40, 60, 90, 40, 20, [.1, .7]), [56, 64]);
  assert.deepEqual(artworkAnchor(40, 60, undefined, 40, 20, [0, .5]), [40, 60]);
  assert.deepEqual(clipDestinationLine([40, 40], [70, 60], 100, 100), [70, 60]);
  assert.deepEqual(clipDestinationLine([40, 40], [40040, -39960], 100, 100), [80, 0]);
});

test("Aircraft size is bounded by airframe and altitude and close ground aircraft can share a pin", () => {
  const helicopter = { category: "A7", alt_baro: 500 };
  const airliner = { t: "A388", alt_baro: 28_000 };
  assert.ok(mapAircraftScale(helicopter) >= .43);
  assert.ok(mapAircraftScale(airliner) <= 1.2);
  assert.ok(mapAircraftScale(airliner) > 2 * mapAircraftScale(helicopter));
  assert.ok(mapAircraftScale({ ...airliner, alt_baro: "ground" }) < mapAircraftScale(airliner));
  const first = { x: 22, y: 10 };
  const next = { x: 35, y: 30 };
  const alone = { x: 100, y: 100 };
  assert.deepEqual(groupGroundAircraft([first, next, alone]), [[first, next]]);
});

test("Artwork anchors use the solid nose and tail past thin outlying pixels", () => {
  const width = 24;
  const height = 20;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let x = 4; x <= 19; x++) {
    for (let y = 10; y <= 15; y++) pixels[(y * width + x) * 4 + 3] = 255;
  }
  for (let x = 0; x < width; x++) pixels[(2 * width + x) * 4 + 3] = 255;
  assert.deepEqual(artworkEndpoints(pixels, width, height), {
    nose: [4.5 / width, 13 / height], tail: [19.5 / width, 13 / height],
  });
});

test("Artwork trails anchor to an upswept tailcone below an overhanging fin", () => {
  const width = 48;
  const height = 28;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let x = 4; x <= 42; x++) {
    const bodyBottom = Math.min(24, 59 - x);
    for (let y = 14; y < bodyBottom; y++) pixels[(y * width + x) * 4 + 3] = 255;
  }
  for (let x = 35; x <= 47; x++) {
    const finBottom = Math.max(9, 52 - x);
    for (let y = 4; y < finBottom; y++) pixels[(y * width + x) * 4 + 3] = 255;
  }
  const { nose, tail } = artworkEndpoints(pixels, width, height);
  assert.deepEqual(nose, [4.5 / width, 19 / height]);
  assert.deepEqual(tail, [42.5 / width, 15.5 / height]);
  assert.deepEqual(artworkAnchor(40, 60, 180, width, height, tail), [41.5, 41.5]);
});

test("Map provides a diameter for either axis and handles the date line", () => {
  const dateline = { latitude: 40, longitude: 179.9 };
  const { horizontal, vertical } = mapDiameterBounds(dateline, 50);
  assert.ok(horizontal[0][0] < 180 && horizontal[1][0] > 180);
  assert.equal(horizontal[0][1], horizontal[1][1]);
  assert.equal(vertical[0][0], vertical[1][0]);
  for (const [lon, lat] of [...horizontal, ...vertical]) {
    assert.ok(Math.abs(distanceBetween(dateline, { lat, lon }) - 50) < 1e-9);
  }
});

test("Fallback projection also uses the longer side for the diameter", () => {
  const pole = { latitude: 90, longitude: 8 };
  assert.equal(mapDiameterBounds(pole, 50), null);
  for (const [width, height] of [[300, 600], [600, 300]]) {
    const [x, y] = projectFromCenter(pole, destinationPoint(pole, 50, 75), 50, width, height);
    assert.ok(Math.abs(Math.hypot(x - width / 2, y - height / 2) - 300) < 1e-6);
  }
});

test("Map records only distinct reports and bounds its prediction and history", () => {
  const start = { latitude: 60, longitude: 5 };
  const observation = (n, bearing) => {
    const [lon, lat] = destinationPoint(start, n * .5, 90);
    return { item: { lon, lat, track: bearing, gs: 180 }, observedAt: n * 5_000 };
  };
  const first = updateMapMotion(undefined, observation(0, 359), 0);
  assert.equal(first.history.length, 1);
  assert.equal(sampleMapMotion(first, 2_000).moving, false);
  assert.strictEqual(updateMapMotion(first, observation(0, 359), 1_000), first);
  const next = updateMapMotion(first, observation(1, 1), 5_000);
  assert.equal(next.history.length, 2);
  assert.equal(sampleMapMotion(next, 5_000).track, 359);
  assert.ok(Math.abs(sampleMapMotion(next, 5_600).track % 360) < 1e-6);
  assert.equal(sampleMapMotion(next, 6_200).track, 1);
  assert.equal(sampleMapMotion(next, 6_200).moving, true);
  assert.equal(sampleMapMotion(next, 6_200, false).moving, false);
  assert.equal(sampleMapMotion(next, 14_000).moving, false);
  assert.deepEqual(sampleMapMotion(next, 20_000).position, sampleMapMotion(next, 14_000).position);

  let state = next;
  for (let n = 2; n <= 24; n++) state = updateMapMotion(state, observation(n, 90), n * 5_000);
  assert.equal(state.history.length, 19);
  assert.equal(state.history[0].observedAt, 30_000);
  const returned = updateMapMotion(undefined, observation(25, 90), 125_000);
  assert.equal(returned.history.length, 1);
  assert.equal(sampleMapMotion(returned, 126_000).moving, false);
});

test("Map estimates velocity from observed positions when feed speed and track are missing", () => {
  const first = updateMapMotion(undefined, { item: { lat: 0, lon: 179.999 }, observedAt: 1_000 }, 1_000);
  const next = updateMapMotion(first, { item: { lat: 0, lon: -179.999 }, observedAt: 6_000 }, 6_000);
  const pose = sampleMapMotion(next, 8_000);
  assert.equal(pose.track, 90);
  assert.ok(pose.position[0] > -179.999);
  const badFix = updateMapMotion(next, { item: { lat: 0, lon: 130 }, observedAt: 11_000 }, 11_000);
  assert.equal(badFix.history.length, 1);
});

test("Map sees all eligible traffic and List still prioritizes one helicopter", () => {
  const center = { latitude: 0, longitude: 0 };
  const rows = [1, 2, 3, 4, 5, 6].map((distance, i) => {
    const [lon, lat] = destinationPoint(center, distance, 90);
    return { lat, lon, hex: (123456 + i).toString(16).padStart(6, "0"), seen_pos: 5, category: i === 5 ? "A7" : "A3" };
  });
  const entries = selectNearbyAircraft([
    ...rows,
    { lat: 0, lon: 2, seen_pos: 0 },
    { lat: 0, lon: 0, seen_pos: 27 },
    { lat: 0, lon: 0, seen_pos: 0, t: " GND " },
    { lat: 0, lon: 0, seen_pos: 0, category: "C2" },
    { lat: null, lon: 0, seen_pos: 0 },
  ], center, 50, 4);
  assert.deepEqual(entries.map(entry => entry.item), rows);
  assert.deepEqual(aircraftForList(entries).map(entry => entry.item), [rows[5], rows[0], rows[1]]);
  assert.ok(isMapAircraftKey(mapAircraftKey({ hex: "~abc123" })));
  assert.ok(isMapAircraftKey(mapAircraftKey({ r: "LN-ABC" })));
  assert.ok(isMapAircraftKey(mapAircraftKey({ flight: " KLM 12 " })));
  assert.ok(isMapAircraftKey(mapAircraftKey({ lat: -85, lon: 180 })));
});

test("Map selection synchronizes and clears when its shared scope changes", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "overhead-live-map-"));
  const path = join(directory, "config.json");
  await writeFile(path, JSON.stringify({ mode: "live", radiusKm: 80 }));
  const api = createSettingsApi(path, { configured: false }, {});
  const subscribers = [];
  t.after(async () => {
    for (const subscriber of subscribers) subscriber.emit("close");
    await rm(directory, { recursive: true, force: true });
  });

  async function request(url, method = "GET", data) {
    const request = Object.assign(Readable.from(data ? [Buffer.from(JSON.stringify(data))] : []), {
      url, method, headers: data ? { "content-type": "application/json" } : {},
    });
    const response = Object.assign(new EventEmitter(), {
      setHeader() {},
      messages: [],
      writeHead(status) { this.status = status; return this; },
      write(chunk) { this.messages.push(chunk); },
      end(body) { this.body = body === undefined ? undefined : JSON.parse(body); },
    });
    await api(request, response, () => assert.fail(`Unexpected route ${url}`));
    if (url.endsWith("/events")) subscribers.push(response);
    return response;
  }

  const select = aircraft => request("/api/map/selection", "POST", { aircraft });
  const patch = settings => request("/api/settings", "PATCH", settings);
  const snapshot = subscriber => JSON.parse(subscriber.messages.at(-1).split("data: ")[1]);
  const aircraft = "hex:478129";
  assert.equal((await request("/api/settings")).body.liveView, "list");
  assert.equal((await select(aircraft)).status, 409);
  assert.equal((await patch({ liveView: "map" })).status, 200);
  const companion = await request("/api/settings/events");
  const display = await request("/api/settings/events");
  assert.equal((await select("not-an-aircraft")).status, 400);
  assert.equal((await select(aircraft)).status, 204);
  assert.equal(snapshot(companion).mapAircraft, aircraft);
  assert.equal(snapshot(display).mapAircraft, aircraft);
  assert.equal(snapshot(await request("/api/settings/events")).mapAircraft, aircraft);
  await patch({ theme: "serengeti-safari" });
  assert.equal(snapshot(display).mapAircraft, aircraft);
  await patch({ radiusKm: 50 });
  assert.equal(snapshot(display).mapAircraft, null);
  await select(aircraft);
  await request("/api/traffic-preview", "POST", { mode: "2" });
  assert.equal(snapshot(display).mapAircraft, null);
  await select(aircraft);
  await select(null);
  assert.equal(snapshot(companion).mapAircraft, null);
  await select(aircraft);
  await patch({ mode: "gallery" });
  assert.equal(snapshot(display).mapAircraft, null);
  const saved = JSON.parse(await readFile(path, "utf8"));
  assert.equal(saved.liveView, "map");
  assert.equal(Object.hasOwn(saved, "mapAircraft"), false);
});
