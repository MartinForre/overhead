import { distanceBetween } from "../flight-weather.js";

const earthRadiusKm = 6_371;
const radiansPerDegree = Math.PI / 180;
const airportVicinityKm = 5;

export function estimateTakeoffTime({ departure, hasIntermediateStop }, position, observedAt, observedTakeoff) {
  const age = Date.now() - observedAt;
  if (position?.ground !== false || !hasCoordinates(departure) || !(age >= 0 && age <= 60_000)) return;
  if (hasCoordinates(observedTakeoff) && Number.isFinite(observedTakeoff.timestamp)) {
    const { latitude: lat, longitude: lon, timestamp } = observedTakeoff;
    if (timestamp <= observedAt && distanceBetween(departure, { lat, lon }) <= airportVicinityKm) return timestamp;
    return;
  }

  if (hasIntermediateStop || !hasCoordinates(position) || !Number.isFinite(position.speed) || position.speed < 55) return;
  const distance = distanceBetween(departure, { lat: position.latitude, lon: position.longitude });
  const elapsed = distance / position.speed * 3_600_000;
  const interval = elapsed > 15 * 60_000 ? 5 * 60_000 : 60_000;
  const estimate = Math.round((observedAt - elapsed) / interval) * interval;
  return Math.min(estimate, Math.floor(observedAt / 60_000) * 60_000);
}

export function isAtDestination(departure, destination, position) {
  if (![departure, destination, position].every(hasCoordinates)) return false;
  const point = { lat: position.latitude, lon: position.longitude };
  return distanceBetween(destination, point) <= airportVicinityKm &&
    distanceBetween(departure, point) > airportVicinityKm;
}

export function estimateTouchdown(departure, destination, position, altitudeFeet, observedAt) {
  if (position?.ground !== false || !isAtDestination(departure, destination, position) ||
      ![altitudeFeet, destination.elevation, position.verticalRate, position.speed, observedAt].every(Number.isFinite)) return;

  const height = altitudeFeet - destination.elevation;
  const { verticalRate, speed, heading } = position;
  if (height < -100 || height > 600 || verticalRate > -150 || speed < 55 || speed > 390) return;
  const descentMs = Math.max(0, height) / -verticalRate * 60_000;
  const distance = distanceBetween(destination, { lat: position.latitude, lon: position.longitude });
  const runwayOffsetKm = 1.5;
  const travelMs = Math.max(0, distance - runwayOffsetKm) / speed * 3_600_000;
  const remainingMs = Math.max(20_000, descentMs, travelMs);
  if (remainingMs > 90_000) return;

  // The airport reference point can be offset from the runway touchdown zone.
  if (distance > runwayOffsetKm) {
    const bearing = bearingTo(position, destination);
    if (!Number.isFinite(heading) || heading < 0 || heading >= 360) return;
    const difference = (heading - bearing + 540) % 360 - 180;
    if (Math.abs(difference) > 75) return;
  }
  return observedAt + remainingMs;
}

export function estimateArrivalTime({ departure, destination, hasIntermediateStop }, position, altitudeFeet, observedAt) {
  const now = Date.now();
  const age = now - observedAt;
  if (hasIntermediateStop || position?.ground !== false || !Number.isFinite(position.speed) || position.speed < 55 ||
      !(age >= 0 && age <= 60_000) || !Number.isFinite(estimateRouteProgress(departure, destination, position))) return;

  const distance = distanceBetween(destination, { lat: position.latitude, lon: position.longitude });
  const touchdown = estimateTouchdown(departure, destination, position, altitudeFeet, observedAt) ??
    observedAt + distance / position.speed * 3_600_000;
  if (touchdown <= now) return;
  const interval = touchdown - now > 15 * 60_000 ? 5 * 60_000 : 60_000;
  return Math.round(touchdown / interval) * interval;
}

export function estimateRouteProgress(departure, destination, position) {
  if (position?.ground || ![departure, destination, position].every(hasCoordinates)) return;

  const start = unitVector(departure);
  const end = unitVector(destination);
  const aircraft = unitVector(position);
  const plane = cross(start, end);
  const planeLength = Math.hypot(...plane);
  const routeAngle = Math.atan2(planeLength, dot(start, end));
  const routeKm = routeAngle * earthRadiusKm;
  if (routeKm < 1 || Math.PI - routeAngle < 1e-6) return;

  // Project the observation onto the oriented great circle through the airports.
  const normal = plane.map(component => component / planeLength);
  const forward = cross(normal, start);
  const alongAngle = Math.atan2(dot(aircraft, forward), dot(aircraft, start));
  const crossKm = Math.asin(Math.min(1, Math.abs(dot(aircraft, normal)))) * earthRadiusKm;
  const alongKm = alongAngle * earthRadiusKm;

  // Allow for departure and arrival paths while rejecting large detours and mismatched routes.
  const corridorKm = Math.min(150, Math.max(25, routeKm * .25));
  if (crossKm > corridorKm || alongKm < -corridorKm || alongKm > routeKm + corridorKm) return;

  // The broadcast position alone cannot confirm arrival.
  return Math.min(.99, Math.max(0, alongAngle / routeAngle));
}

export function hasCoordinates(point) {
  return Number.isFinite(point?.latitude) && Math.abs(point.latitude) <= 90 &&
    Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180;
}

export function bearingTo(from, to) {
  const latitude = from.latitude * radiansPerDegree;
  const destinationLatitude = to.latitude * radiansPerDegree;
  const longitudeDifference = (to.longitude - from.longitude) * radiansPerDegree;
  const east = Math.sin(longitudeDifference) * Math.cos(destinationLatitude);
  const north = Math.cos(latitude) * Math.sin(destinationLatitude) -
    Math.sin(latitude) * Math.cos(destinationLatitude) * Math.cos(longitudeDifference);
  return (Math.atan2(east, north) / radiansPerDegree + 360) % 360;
}

function unitVector({ latitude, longitude }) {
  const lat = latitude * radiansPerDegree;
  const lon = longitude * radiansPerDegree;
  return [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)];
}

function cross([x, y, z], [a, b, c]) {
  return [y * c - z * b, z * a - x * c, x * b - y * a];
}

function dot([x, y, z], [a, b, c]) {
  return x * a + y * b + z * c;
}
