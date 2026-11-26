import { nearestMetar } from "../shared/flight-weather.js";

const metarUrl = "https://aviationweather.gov/api/data/metar";
const refreshIntervalMs = 15 * 60_000;
const retryIntervalMs = 2 * 60_000;
const maxCachedRegions = 8;
export const maxStationDistanceKm = 100;
const maxObservationAgeMs = 90 * 60_000;

function createMetarCache() {
  const regions = new Map();

  function regionFor(key, query) {
    const entry = regions.get(key) ?? { reports: [], nextRequestAt: 0 };
    regions.delete(key);
    regions.set(key, entry);
    if (regions.size > maxCachedRegions) regions.delete(regions.keys().next().value);
    if (!entry.pending && Date.now() >= entry.nextRequestAt) {
      entry.pending = fetchMetars(query).then(reports => {
        entry.reports = reports;
        entry.nextRequestAt = Date.now() + refreshIntervalMs;
      }).catch(() => {
        entry.nextRequestAt = Date.now() + retryIntervalMs;
      }).finally(() => {
        entry.pending = undefined;
      });
    }
    return entry;
  }

  function freshReports(entry) {
    const now = Date.now();
    return entry.reports.filter(({ observedAt }) => now - observedAt <= maxObservationAgeMs);
  }

  return {
    peek(key, query) {
      return freshReports(regionFor(key, query));
    },
    async read(key, query) {
      const entry = regionFor(key, query);
      let reports = freshReports(entry);
      if (!reports.length && entry.pending) {
        await entry.pending;
        reports = freshReports(entry);
      }
      return reports;
    },
  };
}

export const metarCache = createMetarCache();

export async function trackedAltimeter({ latitude, longitude }) {
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 ||
      !Number.isFinite(longitude) || Math.abs(longitude) > 180) return;
  // Cache on a one-degree grid, with enough padding to reach every station
  // within range of an aircraft anywhere in the cell.
  const regionLatitude = Math.round(latitude);
  const regionLongitude = (Math.round(longitude) + 540) % 360 - 180;
  const radiusNm = 43;
  const key = `${regionLatitude}/${regionLongitude}/${radiusNm}`;
  const reports = await metarCache.read(key, { latitude: regionLatitude, longitude: regionLongitude, radiusNm });
  return nearestMetar({ lat: latitude, lon: longitude }, reports, maxStationDistanceKm);
}

async function fetchMetars(query) {
  const results = await Promise.all(metarBounds(query).map(async bounds => {
    const url = new URL(metarUrl);
    url.search = new URLSearchParams({ bbox: bounds.join(","), format: "json" });
    const response = await fetch(url, {
      headers: { "User-Agent": "Overhead/1.0 (+https://github.com/MartinForre/overhead)" },
      signal: AbortSignal.timeout(3_000),
    });
    if (response.status === 204) return [];
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`METAR provider returned HTTP ${response.status}`);
    }
    return response.json();
  }));

  const now = Date.now();
  return results.flatMap(reports => {
    if (!Array.isArray(reports)) throw new Error("METAR response is malformed");
    return reports.filter(report =>
      /^[A-Z0-9]{4}$/.test(report?.icaoId ?? "") &&
      Number.isFinite(report.lat) && Math.abs(report.lat) <= 90 &&
      Number.isFinite(report.lon) && Math.abs(report.lon) <= 180 &&
      Number.isFinite(report.altim) && report.altim >= 800 && report.altim <= 1_100 &&
      Number.isFinite(report.obsTime) && report.obsTime * 1_000 <= now &&
      now - report.obsTime * 1_000 <= maxObservationAgeMs
    ).map(({ icaoId, lat, lon, altim, obsTime }) => ({
      station: icaoId, lat, lon, qnhHpa: altim, observedAt: obsTime * 1_000,
    }));
  });
}

function metarBounds({ latitude, longitude, radiusNm }) {
  // Include stations within range even for aircraft near the edge of the ADS-B search.
  const radians = Math.PI / 180;
  const reach = (radiusNm * 1.852 + maxStationDistanceKm) / 6_371;
  const south = Math.max(-90, latitude - reach / radians);
  const north = Math.min(90, latitude + reach / radians);
  if (south === -90 || north === 90) return [[south, -180, north, 180]];

  const longitudeReach = Math.asin(Math.sin(reach) / Math.cos(latitude * radians)) / radians;
  const west = longitude - longitudeReach;
  const east = longitude + longitudeReach;
  if (west < -180) return [[south, west + 360, north, 180], [south, -180, north, east]];
  if (east > 180) return [[south, west, north, 180], [south, -180, north, east - 360]];
  return [[south, west, north, east]];
}

