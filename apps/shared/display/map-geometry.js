import { distanceBetween } from "../flight-weather.js";
import { bearingTo } from "./route-progress.js";

const earthRadiusKm = 6_371;
const radians = Math.PI / 180;
const mercatorLatitude = 85.05112878;

export function destinationPoint({ latitude, longitude }, distanceKm, bearing) {
  const lat = latitude * radians;
  const arc = distanceKm / earthRadiusKm;
  const angle = bearing * radians;
  const next = Math.asin(Math.sin(lat) * Math.cos(arc) + Math.cos(lat) * Math.sin(arc) * Math.cos(angle));
  const delta = Math.atan2(Math.sin(angle) * Math.sin(arc) * Math.cos(lat), Math.cos(arc) - Math.sin(lat) * Math.sin(next));
  return [longitude + delta / radians, next / radians];
}

export function closestLongitude(longitude, center) {
  const offset = (longitude - center + 180) % 360;
  return center + (offset + 360) % 360 - 180;
}

export function clampMercatorLatitude(latitude) {
  return Math.max(-mercatorLatitude, Math.min(mercatorLatitude, latitude));
}

export function mapDiameterBounds({ latitude, longitude }, radiusKm) {
  const arc = radiusKm / earthRadiusKm;
  const latitudeOffset = arc / radians;
  if (Math.abs(latitude) + latitudeOffset >= mercatorLatitude) return null;

  // Invert the great-circle distance between points at the same latitude.
  const longitudeOffset = 2 * Math.asin(Math.sin(arc / 2) / Math.cos(latitude * radians)) / radians;
  return {
    horizontal: [[longitude - longitudeOffset, latitude], [longitude + longitudeOffset, latitude]],
    vertical: [[longitude, latitude - latitudeOffset], [longitude, latitude + latitudeOffset]],
  };
}

export function trackedAircraftBounds(positions) {
  const longitudes = positions.map(([lon]) => (lon + 360) % 360).sort((a, b) => a - b);
  let widestGap = -1;
  let west, east;
  // Use the complement of the largest gap so flights on either side of the date line stay together.
  for (let i = 0; i < longitudes.length; i++) {
    const end = longitudes[i];
    const start = longitudes[i + 1] ?? longitudes[0] + 360;
    if (start - end <= widestGap) continue;
    widestGap = start - end;
    west = start;
    east = end + 360;
  }
  const latitudes = positions.map(([, lat]) => clampMercatorLatitude(lat));
  const south = Math.min(...latitudes);
  const north = Math.max(...latitudes);
  const latitude = (south + north) / 2;
  const midLongitude = (west + east) / 2;
  const longitude = closestLongitude(midLongitude, 0);
  // Keep a neighborhood around a single aircraft and give its trail room to show.
  const halfHeight = Math.max((north - south) / 2, .15);
  const halfWidth = Math.max((east - west) / 2, .15 / Math.cos(latitude * radians));
  return {
    center: { latitude, longitude },
    bounds: [[longitude - halfWidth, Math.max(-mercatorLatitude, latitude - halfHeight)],
      [longitude + halfWidth, Math.min(mercatorLatitude, latitude + halfHeight)]],
  };
}

export function projectTrackBounds({ center, bounds: [[west, south], [east, north]] }, width, height, padding) {
  const mercatorY = latitude => {
    return Math.log(Math.tan(Math.PI / 4 + clampMercatorLatitude(latitude) * radians / 2)) / radians;
  };
  const top = mercatorY(north);
  const bottom = mercatorY(south);
  const scale = Math.min((width - padding.left - padding.right) / (east - west),
    (height - padding.top - padding.bottom) / (top - bottom));
  const centerX = (width + padding.left - padding.right) / 2;
  const centerY = (height + padding.top - padding.bottom) / 2;
  return ([lon, lat], reference = center.longitude) => [
    centerX + (closestLongitude(lon, reference) - center.longitude) * scale,
    centerY - (mercatorY(lat) - (top + bottom) / 2) * scale,
  ];
}

// Preserve distance and bearing from the display location when Web Mercator cannot be used.
export function projectFromCenter({ latitude, longitude }, [lon, lat], radiusKm, width, height) {
  const centerLat = latitude * radians;
  const pointLat = lat * radians;
  const delta = (lon - longitude) * radians;
  const east = Math.cos(pointLat) * Math.sin(delta);
  const north = Math.cos(centerLat) * Math.sin(pointLat) - Math.sin(centerLat) * Math.cos(pointLat) * Math.cos(delta);
  const dot = Math.sin(centerLat) * Math.sin(pointLat) + Math.cos(centerLat) * Math.cos(pointLat) * Math.cos(delta);
  const offset = Math.hypot(east, north);
  const distance = Math.atan2(offset, dot) * earthRadiusKm;
  const scale = Math.max(width, height) / (2 * radiusKm);
  const factor = offset ? scale * distance / offset : 0;
  return [width / 2 + east * factor, height / 2 - north * factor];
}

export function mapTrack(value) {
  return Number.isFinite(value) && value >= 0 && value < 360 ? value : undefined;
}

export function clipDestinationLine([x, y], [destinationX, destinationY], width, height) {
  const dx = destinationX - x;
  const dy = destinationY - y;
  // Limit the dashed path to the viewport even when its airport is far away.
  const horizontal = dx ? ((dx > 0 ? width : 0) - x) / dx : Infinity;
  const vertical = dy ? ((dy > 0 ? height : 0) - y) / dy : Infinity;
  const limit = Math.min(1, horizontal, vertical);
  return [x + dx * limit, y + dy * limit];
}

export function curvedDestinationGuide({ position, center, markerCenter, track, nose, destination, reference, project, width, height }) {
  const [longitude, latitude] = position;
  const start = { longitude, latitude };
  const distance = distanceBetween(start, { lon: destination.longitude, lat: destination.latitude });
  if (!distance) return;
  const bearing = bearingTo(start, destination);
  const pointAt = (km, previousLongitude) => {
    const [lon, lat] = km === distance ? [destination.longitude, destination.latitude]
      : destinationPoint(start, km, bearing);
    const unwrapped = closestLongitude(lon, previousLongitude);
    return { point: project([unwrapped, lat], unwrapped), longitude: unwrapped };
  };

  const probeKm = Math.min(1, distance / 2);
  const [nearX, nearY] = pointAt(probeKm, reference).point;
  const pixelsPerKm = Math.hypot(nearX - center[0], nearY - center[1]) / probeKm;
  if (!(pixelsPerKm > 0 && Number.isFinite(pixelsPerKm))) return;

  // Keep the turn legible at the current zoom and give the nose room to clear the artwork.
  const noseOffset = Math.hypot(nose[0] - markerCenter[0], nose[1] - markerCenter[1]);
  const turnPixels = Math.max(2 * noseOffset + 12, Math.min(130, .22 * Math.min(width, height)));
  const joinKm = Math.min(distance, turnPixels / pixelsPerKm);
  const before = pointAt(Math.max(0, joinKm - probeKm), reference);
  const join = pointAt(joinKm, before.longitude);
  const [x, y] = join.point;
  const dx = x - before.point[0];
  const dy = y - before.point[1];
  const tangent = Math.hypot(dx, dy);
  const chord = Math.hypot(x - nose[0], y - nose[1]);
  if (!(tangent > 0 && chord > 0)) return;

  const forward = [Math.sin(track * radians), -Math.cos(track * radians)];
  const out = [dx / tangent, dy / tangent];
  const reach = Math.min(turnPixels, chord) * .45;
  const first = [nose[0] + reach * forward[0], nose[1] + reach * forward[1]];
  const last = [x - reach * out[0], y - reach * out[1]];
  const alignment = forward[0] * out[0] + forward[1] * out[1];
  const cross = out[0] * forward[1] - out[1] * forward[0];
  const sideways = (cross < -1e-8 ? -1 : 1) * Math.max(0, -alignment - .5) * reach * 2;
  const curves = sideways ? splitTurn(nose, first, last, join.point, [-out[1] * sideways, out[0] * sideways])
    : [[first, last, join.point]];

  const points = [];
  const airportOnscreen = inViewport(project([destination.longitude, destination.latitude], reference), width, height);
  const step = Math.min(160, 64 / pixelsPerKm);
  let sample = join;
  for (let km = joinKm; km < distance && (airportOnscreen || inViewport(sample.point, width, height));) {
    km = Math.min(distance, km + step);
    sample = pointAt(km, sample.longitude);
    points.push(sample.point);
  }
  return { curves, points };
}

function inViewport([x, y], width, height) {
  return x >= 0 && x <= width && y >= 0 && y <= height;
}

function splitTurn(start, first, last, end, offset) {
  // Split at the midpoint so a reversal has room to go around the aircraft with continuous tangents.
  const midpoint = ([x, y], [otherX, otherY]) => [(x + otherX) / 2, (y + otherY) / 2];
  const shift = ([x, y]) => [x + offset[0], y + offset[1]];
  const a = midpoint(start, first);
  const b = midpoint(first, last);
  const c = midpoint(last, end);
  const d = midpoint(a, b);
  const e = midpoint(b, c);
  return [[a, shift(d), shift(midpoint(d, e))], [shift(e), c, end]];
}
