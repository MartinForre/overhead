export function nearestMetar({ lat, lon }, metars, maxDistanceKm) {
  let nearest;
  let nearestDistance = maxDistanceKm;
  for (const report of metars) {
    const distance = distanceBetween({ latitude: lat, longitude: lon }, report);
    if (distance < nearestDistance || (distance === nearestDistance &&
      (!nearest || report.observedAt > nearest.observedAt))) {
      nearest = report;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export function distanceBetween({ latitude, longitude }, { lat, lon }) {
  const radiansPerDegree = Math.PI / 180;
  const halfLatDifference = (lat - latitude) * radiansPerDegree / 2;
  const halfLonDifference = (lon - longitude) * radiansPerDegree / 2;
  const haversine = Math.sin(halfLatDifference) ** 2 + Math.sin(halfLonDifference) ** 2 *
    Math.cos(latitude * radiansPerDegree) * Math.cos(lat * radiansPerDegree);
  return 2 * 6_371 * Math.asin(Math.sqrt(Math.min(1, haversine)));
}
