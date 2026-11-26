export const cloudThresholdFeet = 1_000;

const approachProfiles = {
  helicopter: { height: 750, speed: 95, descent: 125, departureHeight: 125 },
  fixedWing: { height: 2500, speed: 210, descent: 200, departureHeight: 250 },
};

export function isOnGround({ alt_baro, alt_geom, ground }) {
  return ground === true || alt_baro === "ground" || alt_geom === "ground";
}

export function createLandingGearState() {
  let down = false;
  let departingGround = false;
  let groundAltitude;

  return function update(item, { departure, destination }, isHelicopter, correctedAltitude) {
    const profile = isHelicopter ? approachProfiles.helicopter : approachProfiles.fixedWing;
    const altitude = correctedAltitude ?? (Number.isFinite(item.alt_baro) ? item.alt_baro : item.alt_geom);
    const rate = Number.isFinite(item.geom_rate) ? item.geom_rate : item.baro_rate;
    const descending = Number.isFinite(rate) ? rate <= -profile.descent : item.altitudeTrend === -1;
    if (isOnGround(item)) {
      if (!departingGround) groundAltitude = undefined;
      const airport = [departure, destination].find(candidate => nearAirport(item, candidate) === true);
      groundAltitude = airport?.elevation ?? (Number.isFinite(altitude) ? altitude : groundAltitude);
      departingGround = true;
      down = true;
      return down;
    }
    if (!Number.isFinite(altitude)) return down;
    if (altitude > cloudThresholdFeet) {
      down = false;
      departingGround = false;
      return down;
    }

    if (departingGround) {
      groundAltitude ??= altitude;
      const gain = altitude - groundAltitude;
      if (gain >= profile.departureHeight && (rate >= 100 || gain >= profile.departureHeight * 3)) {
        departingGround = false;
        down = false;
      }
      return down;
    }

    const nearDestination = nearAirport(item, destination);
    const height = altitude - (nearDestination === true ? destination.elevation ?? 0 : 0);
    if (down) {
      if (height > profile.height + 500 || rate >= 350) down = false;
    } else if (nearDestination !== false && height >= -300 && height <= profile.height &&
      descending && Number.isFinite(item.gs) && item.gs >= 0 && item.gs <= profile.speed) {
      down = true;
    }
    return down;
  };
}

function nearAirport(item, airport) {
  if (![item.lat, item.lon, airport?.latitude, airport?.longitude].every(Number.isFinite)) return undefined;
  const northKm = (item.lat - airport.latitude) * 111.2;
  const degreesEast = (item.lon - airport.longitude + 540) % 360 - 180;
  const eastKm = degreesEast * 111.2 * Math.cos(airport.latitude * Math.PI / 180);
  return Math.hypot(northKm, eastKm) <= 20;
}
