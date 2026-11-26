import { isOnGround } from "./landing-gear.js";
import { spriteOrientation } from "./map-geometry.js";

const largestBodies = /^(A38[08]|B74[48]|A346|B77[39]|A35K)$/;
const wideBodies = /^(A30[36]|A31[0]|A3[345][0-9K]|B7[678][0-9X]|DC10|MD11|IL96|AN12|A124)$/;
const regionalBodies = /^(AT[47][0-9]|DH8[ABD]|E1[3479][0-9]|CRJ[0-9X]|SF34|F[57]0|B46[0-9]|RJ[0-9]+)/;

export function mapAircraftScale(aircraft, { icaoType = aircraft.t, category } = {}) {
  const type = String(icaoType ?? "").toUpperCase();
  const helicopter = category === "helicopter" || aircraft.category === "A7";
  const light = category === "general-aviation" || aircraft.category === "A1";
  const body = helicopter ? .65 : light ? .58 : largestBodies.test(type) ? 1.19
    : wideBodies.test(type) || aircraft.category === "A5" ? 1.05 : regionalBodies.test(type) ? .78 : .92;
  const altitude = [aircraft.alt_baro, aircraft.alt_geom].find(Number.isFinite);
  const height = isOnGround(aircraft) ? .58
    : altitude === undefined ? .86 : .65 + .35 * Math.min(1, Math.max(0, altitude / 14_000));
  return Math.max(.43, Math.min(1.2, body * height));
}

export function artworkEndpoints(pixels, width, height) {
  const profiles = Array.from({ length: width }, (_, x) => {
    let length = 0;
    let best = 0;
    let middle = height / 2;
    for (let y = 0; y < height; y++) {
      length = pixels[(y * width + x) * 4 + 3] >= 96 ? length + 1 : 0;
      if (length > best) {
        best = length;
        middle = y + 1 - length / 2;
      }
    }
    return { x, best, middle };
  });
  // Ignore isolated, thin rotor tips and shadows when finding the airframe ends.
  const minimum = Math.max(2, ...profiles.map(profile => profile.best * .15));
  const solid = profiles.filter(profile => profile.best >= minimum);
  const point = ({ x, middle }) => [(x + .5) / width, middle / height];
  return solid.length ? { nose: point(solid[0]), tail: point(solid.at(-1)) }
    : { nose: [0, .5], tail: [1, .5] };
}

export function artworkAnchor(x, y, track, width, height, anchor) {
  if (track === undefined || !anchor) return [x, y];
  const { rotation, mirror } = spriteOrientation(track);
  const angle = rotation * Math.PI / 180;
  const along = (anchor[0] - .5) * width * (mirror ? -1 : 1);
  const across = (anchor[1] - .5) * height;
  return [
    x + along * Math.cos(angle) - across * Math.sin(angle),
    y + along * Math.sin(angle) + across * Math.cos(angle),
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
