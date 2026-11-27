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
  const latitudes = positions.map(([, lat]) => Math.max(-mercatorLatitude, Math.min(mercatorLatitude, lat)));
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
    const bounded = Math.max(-mercatorLatitude, Math.min(mercatorLatitude, latitude));
    return Math.log(Math.tan(Math.PI / 4 + bounded * radians / 2)) / radians;
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
