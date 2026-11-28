import { trackMapAircraftKey } from "../settings-schema.js";
import { isOnGround } from "./landing-gear.js";
import { hasCoordinates } from "./route-progress.js";

const largestBodies = /^(A38[08]|B74[248]|A346|B77[39]|A35K)$/;
const wideBodies = /^(A30[36]|A31[0]|A3[345][0-9K]|B7[678][0-9X]|DC10|MD11|IL96|AN12|A124)$/;
const regionalBodies = /^(AT[47][0-9]|DH8[ABD]|E1[3479][0-9]|CRJ[0-9X]|SF34|F[57]0|B46[0-9]|RJ[0-9]+)/;

export function trackedMapEntry(flight, selection, referenceDestination, now = Date.now()) {
  const position = flight?.position;
  if (!hasCoordinates(position) || flight.cancelled || flight.landed || flight.arrived) return;
  const watchingAdsb = Boolean(selection.callsign || selection.aircraftHex);
  const observedAt = position.timestamp ?? (watchingAdsb ? flight.updatedAt : undefined);
  if (!Number.isFinite(observedAt) || now - observedAt > (watchingAdsb ? 45_000 : 10 * 60_000)) return;
  return {
    key: trackMapAircraftKey(selection.id),
    label: selection.number,
    observedAt,
    predictionMs: watchingAdsb ? 15_000 : 0,
    historyWindowMs: watchingAdsb ? undefined : 45 * 60_000,
    reportGapMs: watchingAdsb ? undefined : 12 * 60_000,
    lookupRoute: !watchingAdsb && Boolean(flight.destination?.code),
    destinationCode: watchingAdsb ? undefined : flight.destination?.code,
    details: {
      destination: watchingAdsb ? referenceDestination : flight.destination,
      model: flight.model,
      operatorIcao: flight.operator,
    },
    item: {
      flight: selection.callsign || flight.callsign || selection.number,
      hex: flight.hex?.toUpperCase() ?? selection.aircraftHex,
      r: flight.registration,
      t: flight.aircraftType,
      category: flight.category,
      desc: flight.model,
      lat: position.latitude,
      lon: position.longitude,
      alt_baro: position.pressureAltitude ?? position.altitude,
      alt_geom: position.geometricAltitude,
      ground: position.ground,
      gs: position.speed / 1.852,
      track: position.heading,
      track_rate: position.trackRate,
    },
  };
}

export function mapAircraftScale(aircraft, { icaoType = aircraft.t, category } = {}) {
  const type = String(icaoType ?? "").toUpperCase();
  const helicopter = category === "helicopter" || aircraft.category === "A7";
  const light = category === "general-aviation" || aircraft.category === "A1";
  const body = helicopter ? .65 : light ? .58 : largestBodies.test(type) ? 1.19
    : wideBodies.test(type) || aircraft.category === "A5" ? 1.05 : regionalBodies.test(type) ? .78 : .92;
  const altitude = mapAircraftAltitude(aircraft);
  const height = isOnGround(aircraft) ? .58
    : altitude === undefined ? .86 : .65 + .35 * Math.min(1, Math.max(0, altitude / 14_000));
  return Math.max(.43, Math.min(1.2, body * height));
}

export function mapAircraftAltitude({ alt_baro, alt_geom }) {
  return Number.isFinite(alt_baro) ? alt_baro : Number.isFinite(alt_geom) ? alt_geom : undefined;
}

export function cropArtworkAnchor([x, y], [left, top, right, bottom]) {
  return [(x - left) / (right - left), (y - top) / (bottom - top)];
}

export function artworkAnchor(x, y, track, width, height, anchor) {
  if (track === undefined || !anchor) return [x, y];
  const angle = track * Math.PI / 180;
  const offsetX = (anchor[0] - .5) * width;
  const offsetY = (anchor[1] - .5) * height;
  return [
    x + offsetX * Math.cos(angle) - offsetY * Math.sin(angle),
    y + offsetX * Math.sin(angle) + offsetY * Math.cos(angle),
  ];
}

export function groupGroundAircraft(points, gap = 34) {
  const groups = [];
  const remaining = new Set(points);
  for (const point of points) {
    if (!remaining.delete(point)) continue;
    const members = [point];
    for (const member of members) {
      for (const other of remaining) {
        if (Math.hypot(member.x - other.x, member.y - other.y) > gap) continue;
        remaining.delete(other);
        members.push(other);
      }
    }
    if (members.length > 1) groups.push(members);
  }
  return groups;
}
