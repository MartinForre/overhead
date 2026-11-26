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
  return center + ((longitude - center + 540) % 360) - 180;
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

export function spriteOrientation(track) {
  // Face the nose along the track while keeping the top of the source image above its body.
  const angle = ((track + 270) % 360) - 180;
  const mirror = Math.abs(angle) > 90;
  return { rotation: mirror ? angle - 180 * Math.sign(angle) : angle, mirror };
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
