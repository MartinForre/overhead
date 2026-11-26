import { distanceBetween } from "../flight-weather.js";
import { closestLongitude, destinationPoint, mapTrack } from "./map-geometry.js";
import { bearingTo } from "./route-progress.js";

const maximumPredictionMs = 8_000;
const correctionMs = 1_200;
const historyWindowMs = 90_000;
const maximumReports = 19;
const minimumDisplacementKm = .003;
const maximumSpeedKnots = 1_600;
const kmPerNauticalMile = 1.852;

export function updateMapMotion(previous, { item, observedAt }, now) {
  const before = previous?.report;
  if (before && observedAt < before.observedAt) return previous;

  const location = { longitude: item.lon, latitude: item.lat };
  const observation = {
    location,
    observedAt,
    track: mapTrack(item.track),
    speed: Number.isFinite(item.gs) && item.gs >= 0 && item.gs <= maximumSpeedKnots
      ? item.gs * kmPerNauticalMile : undefined,
    turn: Number.isFinite(item.track_rate) ? item.track_rate : undefined,
  };
  const last = previous?.observation;
  if (last && last.observedAt === observedAt && last.location.longitude === item.lon &&
    last.location.latitude === item.lat && last.speed === observation.speed &&
    last.track === observation.track && last.turn === observation.turn) return previous;

  const history = recordObservation(previous?.history ?? [], observation);
  const prior = history.at(-2);
  const travel = prior ? distanceBetween(prior.location, item) : 0;
  const moving = travel >= minimumDisplacementKm;
  const track = observation.track ?? (moving ? bearingTo(prior.location, location) : before?.track);
  const speed = observation.speed ?? speedFromHistory(history);
  const rate = history.length >= 3 && moving && before?.track !== undefined && track !== undefined
    ? (closestLongitude(track, before.track) - before.track) * 1_000 / (observedAt - prior.observedAt) : 0;
  const turn = speed >= 55 ? Math.max(-4, Math.min(4, observation.turn ?? rate)) : 0;
  const report = { location, observedAt, speed, track, turn, canPredict: moving };
  if (!before) return { observation, report, history };

  const current = sampleMapMotion(previous, now);
  const target = predict(report, now);
  const longitude = closestLongitude(current.position[0], target.position[0]) - target.position[0];
  const latitude = current.position[1] - target.position[1];
  const bearing = current.track === undefined || target.track === undefined ? 0
    : closestLongitude(current.track, target.track) - target.track;
  return { observation, report, history, correction: { startedAt: now, longitude, latitude, bearing } };
}

function recordObservation(history, observation) {
  const { location, observedAt } = observation;
  if (!Number.isFinite(observedAt)) return [];
  const recent = history.filter(sample => sample.observedAt < observedAt && observedAt - sample.observedAt <= historyWindowMs);
  const last = recent.at(-1);
  if (last) {
    const elapsed = observedAt - last.observedAt;
    const distance = distanceBetween(last.location, { lon: location.longitude, lat: location.latitude });
    // Break the trail across bad fixes or a gap too long to estimate a trajectory.
    if (elapsed > 30_000 || distance > maximumSpeedKnots * kmPerNauticalMile * elapsed / 3_600_000 + .03) {
      return [observation];
    }
  }
  return [...recent, observation].slice(-maximumReports);
}

function speedFromHistory(history) {
  const recent = history.slice(-3);
  if (recent.length < 2) return 0;
  let distance = 0;
  for (let i = 1; i < recent.length; i++) {
    const { longitude: lon, latitude: lat } = recent[i].location;
    distance += distanceBetween(recent[i - 1].location, { lon, lat });
  }
  return distance * 3_600_000 / (recent.at(-1).observedAt - recent[0].observedAt);
}

export function sampleMapMotion({ report, correction }, now, animate = true) {
  const { location, track } = report;
  if (!animate) return { position: [location.longitude, location.latitude], track, moving: false };
  const pose = predict(report, now);
  if (!correction) return pose;

  const amount = Math.max(0, Math.min(1, (now - correction.startedAt) / correctionMs));
  const remaining = 1 - amount * amount * (3 - 2 * amount);
  pose.position[0] += correction.longitude * remaining;
  pose.position[1] += correction.latitude * remaining;
  if (pose.track !== undefined) pose.track = (pose.track + correction.bearing * remaining + 360) % 360;
  pose.moving ||= remaining > 0 && Boolean(correction.latitude || correction.longitude || correction.bearing);
  return pose;
}

function predict({ location, observedAt, speed, track, turn, canPredict }, now) {
  if (!canPredict || track === undefined || !speed) {
    return { position: [location.longitude, location.latitude], track, moving: false };
  }
  const elapsed = Math.max(0, Math.min(maximumPredictionMs, now - observedAt));
  const turnDegrees = turn * Math.min(elapsed / 1_000, 4);
  const position = destinationPoint(location, speed * elapsed / 3_600_000, track + turnDegrees / 2);
  return { position, track: (track + turnDegrees + 360) % 360, moving: elapsed < maximumPredictionMs };
}
