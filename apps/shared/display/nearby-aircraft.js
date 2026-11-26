import { distanceBetween } from "../flight-weather.js";

const maxPositionAgeSeconds = 30;
const groundTargetTypes = new Set(["GND", "GRND", "SERV", "EMER", "TWR"]);

export function selectNearbyAircraft(aircraft, location, radius, snapshotAgeSeconds) {
  return aircraft
    .filter((item) => Number.isFinite(item?.lat) && Math.abs(item.lat) <= 90 &&
      Number.isFinite(item.lon) && Math.abs(item.lon) <= 180 &&
      Number.isFinite(item.seen_pos) && item.seen_pos >= 0 &&
      item.seen_pos + snapshotAgeSeconds <= maxPositionAgeSeconds && !isGroundTarget(item))
    .map((item) => ({ item, distanceKm: distanceBetween(location, item) }))
    .filter((entry) => entry.distanceKm <= radius)
    .sort((first, second) => first.distanceKm - second.distanceKm);
}

export function aircraftForList(nearby) {
  const helicopter = nearby.find(({ item }) => item.category === "A7");
  return helicopter ? [helicopter, ...nearby.filter(entry => entry !== helicopter).slice(0, 2)] : nearby.slice(0, 3);
}

function isGroundTarget({ t, category }) {
  return (typeof t === "string" && groundTargetTypes.has(t.trim().toUpperCase())) ||
    (typeof category === "string" && /^C[1-5]$/i.test(category.trim()));
}
