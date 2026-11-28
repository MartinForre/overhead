import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const assetDirectory = new URL("../assets/", import.meta.url);
const fetchBlob = globalThis.fetch;
const lightProfile = "general-aviation/vans-rv7-neutral.png";
const fixedWingProfile = "fallbacks/generic-fixed-wing.png";

globalThis.window = { location: { origin: "http://example.test" } };
globalThis.Image = class {
  dataset = {};

  async decode() {
    const bytes = await (await fetchBlob(this.src)).bytes();
    if (Buffer.from(bytes).toString("ascii", 1, 4) !== "PNG") throw new Error("Invalid PNG");
  }
};

async function loadArtwork(t, { missing = [], corrupt = [] } = {}) {
  t.mock.method(globalThis, "fetch", async (url) => {
    const path = new URL(url).pathname.slice(1);
    if (missing.includes(path)) return new Response(null, { status: 404 });
    if (corrupt.includes(path)) return new Response("Invalid PNG");
    return new Response(await readFile(new URL(path, assetDirectory)));
  });
  const { aircraftImage, aircraftTopDown, catalogAircraft } = await import(`../apps/shared/display/artwork.js?${t.name}`);
  return async (observation, operator, topDown = false) => {
    const identity = await catalogAircraft(observation);
    if (topDown) {
      const artwork = await aircraftTopDown(identity, operator);
      return { path: artwork?.image.dataset.artworkPath, nose: artwork?.nose, tail: artwork?.tail };
    }
    const image = await aircraftImage(identity, operator);
    return { model: identity.model, path: image?.dataset.artworkPath };
  };
}

test("aircraft with incomplete details receive neutral artwork", async (t) => {
  const lookup = await loadArtwork(t);
  assert.deepEqual(await lookup({ t: "CP32" }), { model: "Piel Super Emeraude", path: lightProfile });
  assert.equal((await lookup({ category: "A1" })).path, lightProfile);
  assert.equal((await lookup({ t: "ZZZZ", category: "A0" })).path, fixedWingProfile);
  assert.equal((await lookup({})).path, fixedWingProfile);
});

test("artwork lookup preserves catalogue priority and skips unusable images", async (t) => {
  const lookup = await loadArtwork(t, {
    missing: ["aircrafts/airliners/a320neo-neutral.png"],
    corrupt: ["aircrafts/airliners/a320neo-sas.png"],
  });
  assert.equal((await lookup({ t: "A20N" }, "SAS")).path, fixedWingProfile);
  assert.equal((await lookup({ t: "B739" }, "KLM")).path, "airliners/737-900-klm.png");
  assert.equal((await lookup({ category: "A7" })).path, "helicopters/bell-222-airwolf.png");
});

test("bundled fallback artwork loads without the artwork catalogue", async (t) => {
  const lookup = await loadArtwork(t, { missing: ["aircrafts/artwork.json"] });
  assert.equal((await lookup({ t: "CP32" })).path, lightProfile);
  assert.equal((await lookup({ category: "A7" })).path, "fallbacks/generic-helicopter.png");
  assert.equal((await lookup({})).path, fixedWingProfile);
  assert.equal((await lookup({ category: "A1" }, null, true)).path, `top-down/${lightProfile}`);
  assert.equal((await lookup({ category: "A7" }, null, true)).path, "top-down/fallbacks/generic-helicopter.png");
  assert.equal((await lookup({}, null, true)).path, `top-down/${fixedWingProfile}`);
});

test("top-down artwork uses its own fallback chain and returns the chosen airframe's anchors", async (t) => {
  const lookup = await loadArtwork(t, {
    missing: ["aircrafts/top-down/airliners/a320neo-sas.png"],
    corrupt: ["aircrafts/top-down/airliners/a320neo-neutral.png"],
  });
  const rescue = { hex: "478129", t: "EH10" };
  const { illustrations } = JSON.parse(await readFile(new URL("aircrafts/artwork.json", assetDirectory)));
  assert.deepEqual(await lookup(rescue, null, true), illustrations["aw101-sar-queen-norwegian-rescue"].topDown);
  assert.equal((await lookup(rescue)).path, "helicopters/aw101-sar-queen-norwegian-rescue.png");
  assert.equal((await lookup({ t: "B739" }, "KLM", true)).path, "top-down/airliners/737-900-klm.png");
  assert.equal((await lookup({ t: "A20N" }, "SAS", true)).path, `top-down/${fixedWingProfile}`);
  assert.equal((await lookup({ t: "A20N" }, "SAS")).path, "airliners/a320neo-sas.png");
});
