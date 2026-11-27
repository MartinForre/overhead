#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p dist/pi
export OVERHEAD_BUILD_NUMBER="${OVERHEAD_BUILD_NUMBER:-1}"
export OVERHEAD_BUILD_COMMIT="${OVERHEAD_BUILD_COMMIT:-$(git rev-parse HEAD)}"
node --input-type=module <<'JS'
import { writeFileSync } from "node:fs";

const number = Number(process.env.OVERHEAD_BUILD_NUMBER);
const commit = process.env.OVERHEAD_BUILD_COMMIT;
if (!Number.isSafeInteger(number) || number < 1 || !/^[a-f0-9]{40}$/.test(commit)) {
  throw new Error("Invalid Overhead build metadata");
}
writeFileSync("dist/pi/build-info.json", JSON.stringify({ number, commit }) + "\n");
JS

deno compile --no-config --target aarch64-unknown-linux-gnu \
  --allow-net=127.0.0.1:8101,127.0.0.1:8102,opendata.adsb.fi:443,api.adsb.lol:443,api.adsbdb.com:443,aviationweather.gov:443,aeroapi.flightaware.com:443 \
  --allow-env=OVERHEAD_AEROAPI_KEY \
  --allow-read=overhead.config.json,overhead.config.json.tmp \
  --allow-write=overhead.config.json,overhead.config.json.tmp \
  --include dist/pi/build-info.json \
  --include node_modules/maplibre-gl/dist/maplibre-gl.js \
  --include node_modules/maplibre-gl/dist/LICENSE.txt \
  --include apps/shared --include apps/display --include apps/companion \
  --include assets/aircrafts --include assets/dividers --exclude '**/.DS_Store' \
  --output dist/pi/overhead-linux-arm64 apps/portable/server.mjs
gzip -n -1 -c dist/pi/overhead-linux-arm64 > dist/pi/overhead-linux-arm64.gz
