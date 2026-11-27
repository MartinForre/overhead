import { formatAltitude, formatClock, formatDistance, formatNumber, formatSpeed, t } from "../display-formats.js";
import { aircraftGear, aircraftImage, catalogAircraft } from "./artwork.js";
import { callsignDetails, resolveAircraft } from "./flight-details.js";
import { cloudThresholdFeet, createLandingGearState, isOnGround } from "./landing-gear.js";
import { estimateArrivalTime, estimateTakeoffTime } from "./route-progress.js";

const trackDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const standardPressureHpa = 1_013.25;
const standardAtmosphereHeightFeet = 145_366.45;
const pressureExponent = 0.190284;
const maxArtworkTilt = 3;
const feetPerMinutePerKnot = 1852 / 0.3048 / 60;
const artworkBounds = new Map();
const routeTimeLabels = {
  takeoff: "Estimated takeoff time in the display’s time zone",
  landing: "Estimated landing time in the display’s time zone",
};
const sample = document.createElement("canvas");
sample.width = 144;
sample.height = 48;
const sampleContext = sample.getContext("2d", { willReadFrequently: true });

const readoutSelectors = {
  name: ".flight-name",
  description: ".flight-description",
  distance: ".flight-distance",
  altitude: ".flight-altitude-value",
  speed: ".flight-speed-value",
};

export function createAircraftPresentation() {
  const aircraftMotion = createAircraftMotion();
  let aircraftType;
  let model;
  let view = {};

  async function update({ item, distanceKm, details, altimeter, observedAt }, signal) {
    if (signal.aborted) return;
    const [identity, flight] = await Promise.all([
      details ? catalogAircraft(item) : resolveAircraft(item, signal),
      details ?? callsignDetails(item, signal),
    ]);
    if (signal.aborted) return;

    const artworkIdentity = details?.illustrationId
      ? { ...identity, illustrationId: details.illustrationId }
      : identity;
    const image = await aircraftImage(artworkIdentity, flight.operatorIcao, view.image);
    const gear = await aircraftGear(image);
    if (signal.aborted) return;

    const nextType = identifier(item.t);
    model = details?.model || identity.model || (aircraftType === nextType ? model : undefined);
    aircraftType = nextType;
    const flightIdentifier = [item.flight, item.r, item.hex]
      .find(value => typeof value === "string" && value.trim())?.trim();
    const { departure, destination } = flight;
    const isHelicopter = identity.category === "helicopter";
    const onGround = isOnGround(item);
    const altitude = altitudeReadout(item, onGround, altimeter);
    const position = {
      ground: onGround || (Number.isFinite(altitude.altitudeFeet) ? false : undefined),
      latitude: item.lat, longitude: item.lon,
      speed: Number.isFinite(item.gs) ? item.gs * 1.852 : undefined,
      heading: item.track,
      verticalRate: Number.isFinite(item.geom_rate) ? item.geom_rate : item.baro_rate,
    };
    const arrivalTime = estimateArrivalTime(flight, position, altitude.altitudeFeet, observedAt);
    const name = model || identity.icaoType;
    const description = [flightIdentifier, flight.airline].filter(Boolean).join(" · ");
    view = {
      get name() { return name || t("Unknown aircraft"); },
      get description() { return description || t("N/A"); },
      departure,
      destination,
      takeoffTime: estimateTakeoffTime(flight, position, observedAt, item.observedTakeoff),
      arrivalTime,
      routeKey: JSON.stringify([departure?.code, departure?.city, destination?.code, destination?.city]),
      get distance() { return formatDistance(distanceKm, 1, 1); },
      get altitude() { return altitude.altitude; },
      get altitudeLabel() { return altitude.altitudeLabel; },
      get speed() { return Number.isFinite(item.gs) && item.gs >= 0 ? formatSpeed(item.gs * 1.852) : t("N/A"); },
      track: Number.isFinite(item.track) && item.track >= 0 && item.track < 360 ? item.track : undefined,
      image,
      isHelicopter,
      gear,
      ...aircraftMotion(item, flight, isHelicopter, gear, altitude.altitudeFeet),
    };
  }

  return { get view() { return view; }, update };
}

export function createAircraftMotion() {
  const updateGear = createLandingGearState();
  return (item, airports, isHelicopter, gear, altitudeFeet) => {
    const onGround = isOnGround(item);
    return {
      scenery: onGround ? "runway" : altitudeFeet > cloudThresholdFeet ? "cloud" : "",
      gearDown: updateGear(item, airports, isHelicopter, altitudeFeet),
      artworkTilt: onGround ? gear?.groundPose?.tilt ?? 0 : isHelicopter ? 0 : artworkTilt(item),
    };
  };
}

export function createFlightCard(cardTemplate, getMotion) {
  const element = cardTemplate.content.firstElementChild.cloneNode(true);
  const readouts = Object.fromEntries(Object.entries(readoutSelectors).map(([key, selector]) =>
    [key, element.querySelector(selector)]));
  const altitudeLabel = element.querySelector(".flight-altitude-label");
  const track = element.querySelector(".flight-track");
  const picture = element.querySelector(".flight-picture");
  const route = picture.querySelector(".flight-route");
  const artwork = createAircraftArtwork(picture, getMotion);
  let routeKey;

  function paint(view) {
    for (const [key, field] of Object.entries(readouts)) setText(field, view[key]);
    setText(altitudeLabel, view.altitudeLabel);
    const altitude = altitudeLabel.parentElement;
    if (altitude.title !== view.altitudeLabel) altitude.title = view.altitudeLabel;
    setTrack(track, view.track);
    if (routeKey !== view.routeKey) {
      routeKey = view.routeKey;
      setRoute(route, view);
    }
    setRouteTime(route.querySelector("[data-takeoff-time]"), view.takeoffTime, "takeoff");
    setRouteTime(route.querySelector("[data-landing-time]"), view.arrivalTime, "landing");
    labelRoute(route, view);
    artwork.paint(view);
  }

  function alignRoute() {
    const width = picture.clientWidth;
    const right = width ? (route.offsetLeft + route.offsetWidth) / width : 0;
    const top = artwork.routeClearance(right);
    if (Number.isFinite(top)) picture.style.setProperty("--art-route-top", top);
    else picture.style.removeProperty("--art-route-top");
  }

  return { ...artwork, element, readouts, track, route, paint, alignRoute };
}

export function createAircraftArtwork(picture, getMotion, frame = picture) {
  const art = frame.querySelector(".flight-art");
  const scenery = ["cloud", "runway"].map(kind => {
    const layer = document.createElement("div");
    layer.className = "flight-scenery";
    layer.dataset.scenery = kind;
    layer.hidden = true;
    return layer;
  });
  let bounds;

  function paint(view) {
    const tiltLimit = Math.max(view.isHelicopter ? 0 : maxArtworkTilt, Math.abs(view.gear?.groundPose?.tilt ?? 0));
    bounds = view.image && measureArtwork(view.image, tiltLimit);
    const aircraft = setArtwork(picture, art, view.image, view.gear, bounds);
    if (aircraft && view.gear) {
      aircraft.toggleAttribute("data-gear-motion", getMotion().transfer > 0);
      aircraft.toggleAttribute("data-gear-down", Boolean(view.gearDown));
    }
    for (const layer of scenery) layer.hidden = !view.image || view.scenery !== layer.dataset.scenery;
    const tilt = `${view.artworkTilt ?? 0}deg`;
    if (art.style.getPropertyValue("--art-tilt") !== tilt) art.style.setProperty("--art-tilt", tilt);
  }

  function sceneryFrame() {
    const layer = scenery.find(layer => !layer.hidden);
    if (!layer) return null;
    const { top, height } = frame.getBoundingClientRect();
    const { left, width } = art.getBoundingClientRect();
    const contact = layer.dataset.scenery === "runway" ? picture.style.getPropertyValue("--gear-contact") : "";
    const bottom = Number(contact || picture.style.getPropertyValue("--art-bottom") || 0.92);
    return { layer, top: top + height * bottom, left, width };
  }

  return {
    art, scenery, sceneryFrame, paint,
    routeClearance(right) {
      return bounds?.profile.findLast(column => column.left <= right)?.top;
    },
  };
}

// The board shares a scenery layer so clouds can extend beyond their aircraft card.
export function placeAircraftScenery(host, cards) {
  const frames = Array.from(cards, card => card.sceneryFrame());
  if (!frames.some(Boolean)) return;
  const { top, left } = host.getBoundingClientRect();
  for (const frame of frames) {
    if (!frame) continue;
    const { style } = frame.layer;
    style.top = `${frame.top - top}px`;
    style.setProperty("--aircraft-center", `${frame.left + frame.width / 2 - left}px`);
    style.setProperty("--aircraft-width", `${frame.width}px`);
  }
}

function identifier(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

export function altitudeReadout({ alt_baro, alt_geom }, onGround, altimeter, reportedAltitude) {
  if (onGround) return { get altitude() { return t("On ground"); }, get altitudeLabel() { return t("Altitude"); } };
  if (Number.isFinite(alt_baro)) {
    if (altimeter) {
      const { station, qnhHpa } = altimeter;
      // Convert the standard-pressure indication to the local altimeter setting.
      const pressureRatio = (standardPressureHpa / qnhHpa) ** pressureExponent;
      const corrected = standardAtmosphereHeightFeet - (standardAtmosphereHeightFeet - alt_baro) * pressureRatio;
      const rounded = Math.round(corrected / 25) * 25 + 0;
      return {
        altitudeFeet: rounded,
        get altitude() { return "≈" + formatAltitude(rounded); },
        get altitudeLabel() {
          return t("Altitude above mean sea level using {station} QNH {pressure} hPa", { station, pressure: formatNumber(qnhHpa, 2) });
        },
      };
    }
    return { altitudeFeet: alt_baro, get altitude() { return formatAltitude(alt_baro) + " PA"; },
      get altitudeLabel() { return t("Pressure altitude"); } };
  }
  if (Number.isFinite(alt_geom)) {
    return { altitudeFeet: alt_geom, get altitude() { return formatAltitude(alt_geom) + " HAE"; },
      get altitudeLabel() { return t("Geometric altitude above the WGS84 ellipsoid"); } };
  }
  if (Number.isFinite(reportedAltitude)) {
    return {
      altitudeFeet: reportedAltitude,
      get altitude() { return formatAltitude(reportedAltitude); },
      get altitudeLabel() { return t("FlightAware reported altitude"); },
    };
  }
  return { get altitude() { return t("N/A"); }, get altitudeLabel() { return t("Altitude"); } };
}

function artworkTilt(item) {
  const { gs, geom_rate, baro_rate, altitudeTrend } = item;
  const verticalRate = Number.isFinite(geom_rate) ? geom_rate : baro_rate;
  if (!Number.isFinite(gs) || gs < 30) return 0;
  // A direction-only report gets a small visual tilt without assuming a vertical speed.
  if (!Number.isFinite(verticalRate)) return (altitudeTrend ?? 0) * 1.5;

  // This is the ground-relative flight path angle. A positive CSS rotation lifts a left-facing nose.
  const degrees = Math.atan2(verticalRate, gs * feetPerMinutePerKnot) * 180 / Math.PI;
  return Math.max(-maxArtworkTilt, Math.min(maxArtworkTilt, Math.round(degrees * 10) / 10));
}

function setText(element, value) {
  if (element.textContent !== value) element.textContent = value;
}

export function setTrack(element, track) {
  const available = Number.isFinite(track) && track >= 0 && track < 360;
  const bearing = available ? `${String(Math.round(track) % 360).padStart(3, "0")}°` : "";
  const cardinal = available ? t(trackDirections[Math.round(track / 45) % trackDirections.length]) : "";
  const rotation = available ? `${track}deg` : "";
  const label = available ? t("Ground track {bearing} {cardinal}", { bearing, cardinal }) : t("Ground track unavailable");
  element.toggleAttribute("data-track-unavailable", !available);
  if (element.style.getPropertyValue("--bearing") !== rotation) element.style.setProperty("--bearing", rotation);
  if (element.getAttribute("aria-label") !== label) element.setAttribute("aria-label", label);
}

function setRoute(element, { departure, destination }) {
  const arrow = document.createElement("span");
  arrow.className = "flight-route-arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "→";
  const origin = createAirport(departure, { time: "takeoff" });
  const arrival = createAirport(destination, { time: "landing" });
  element.replaceChildren(origin, arrow, arrival);
}

function labelRoute(element, { departure, destination, takeoffTime, arrivalTime }) {
  const airportName = (airport) => [airport?.city, airport?.code].filter(Boolean).join(" ") || t("unknown airport");
  let label = t("{origin} to {destination}", { origin: airportName(departure), destination: airportName(destination) });
  if (Number.isFinite(takeoffTime)) label += `. ${t(routeTimeLabels.takeoff)} ${formatClock(takeoffTime)}`;
  if (Number.isFinite(arrivalTime)) label += `. ${t(routeTimeLabels.landing)} ${formatClock(arrivalTime)}`;
  if (element.getAttribute("aria-label") !== label) element.setAttribute("aria-label", label);
}

export function setRouteTime(time, timestamp, kind) {
  time.hidden = !Number.isFinite(timestamp);
  if (time.hidden) {
    time.removeAttribute("datetime");
    time.removeAttribute("title");
    setText(time, "");
  } else {
    time.dateTime = new Date(timestamp).toISOString();
    time.title = t(routeTimeLabels[kind]);
    setText(time, formatClock(timestamp));
  }
}

export function createAirport(airport, { knownOnly = false, time } = {}) {
  const airportElement = document.createElement("div");
  airportElement.className = "flight-airport";
  airportElement.setAttribute("aria-hidden", "true");
  const flaps = document.createElement("div");
  flaps.className = "flight-flaps";
  const code = /^[A-Z0-9]{3,4}$/.test(airport?.code) ? airport.code : knownOnly ? "" : "N/A";
  for (const letter of code) {
    const flap = document.createElement("span");
    flap.textContent = letter;
    flaps.append(flap);
  }
  const city = document.createElement("span");
  city.className = "flight-city";
  city.textContent = airport?.city ?? "";
  if (code) airportElement.append(flaps);
  airportElement.append(city);
  if (time) {
    const clock = document.createElement("time");
    clock.className = "flight-route-time";
    clock.setAttribute(`data-${time}-time`, "");
    clock.hidden = true;
    airportElement.append(clock);
  }
  return airportElement;
}

function setArtwork(picture, art, image, gear, bounds) {
  const current = art.firstElementChild;
  const parts = gear?.parts ?? [];
  if (current && current.lastElementChild === image && current.childElementCount === parts.length + 1) return current;
  if (!image) {
    picture.removeAttribute("style");
    art.replaceChildren();
    return;
  }
  picture.style.setProperty("--image-ratio", image.naturalWidth / image.naturalHeight);
  if (bounds) {
    picture.style.setProperty("--art-top", bounds.top);
    picture.style.setProperty("--art-bottom", bounds.bottom);
    picture.style.setProperty("--art-left", `${bounds.left}%`);
    picture.style.setProperty("--art-front-top", bounds.frontTop);
    picture.style.setProperty("--art-inset", `${bounds.inset}%`);
  } else {
    picture.style.removeProperty("--art-top");
    picture.style.removeProperty("--art-bottom");
    picture.style.removeProperty("--art-left");
    picture.style.removeProperty("--art-front-top");
    picture.style.removeProperty("--art-inset");
  }
  if (parts.length) {
    const contact = gear.groundPose?.contact ?? Math.max(...parts.map(({ y, height, pivot }) => y + height * (1 - pivot[1])));
    const inset = (bounds?.inset ?? 0) / 100;
    picture.style.setProperty("--gear-contact", inset + (1 - 2 * inset) * contact);
  } else {
    picture.style.removeProperty("--gear-contact");
  }
  const aircraft = document.createElement("div");
  aircraft.className = "flight-aircraft";
  for (const part of parts) aircraft.append(gearSprite(part, image));
  image.className = "flight-airframe";
  aircraft.append(image);
  art.replaceChildren(aircraft);
  return aircraft;
}

function gearSprite(part, image) {
  const { x, y, height, aspect, pivot, rotation, foldedScale, url } = part;
  const width = height * aspect * image.naturalHeight / image.naturalWidth;
  const sprite = document.createElement("img");
  sprite.className = "flight-gear-part";
  sprite.src = url;
  sprite.alt = "";
  Object.assign(sprite.style, {
    left: `${(x - width * pivot[0]) * 100}%`, top: `${(y - height * pivot[1]) * 100}%`,
    width: `${width * 100}%`, height: `${height * 100}%`,
    transformOrigin: `${pivot[0] * 100}% ${pivot[1] * 100}%`,
  });
  sprite.style.setProperty("--gear-rotation", `${rotation}deg`);
  sprite.style.setProperty("--gear-folded-scale", foldedScale);
  if (part.overBody) {
    sprite.setAttribute("data-over-airframe", "");
    sprite.style.setProperty("--gear-clip", `${(pivot[1] + 0.05) * 100}%`);
  }
  return sprite;
}

export function measureArtwork(image, maxTilt) {
  const key = `${image.src}/${maxTilt}`;
  if (artworkBounds.has(key)) return artworkBounds.get(key);
  if (!sampleContext) return null;

  const { width, height } = sample;
  sampleContext.clearRect(0, 0, width, height);
  sampleContext.drawImage(image, 0, 0, width, height);
  const pixels = sampleContext.getImageData(0, 0, width, height).data;
  let left = width;
  let right = 0;
  let top = height;
  let bottom = 0;
  let visibleBottom = 0;
  const columnTops = new Uint8Array(width).fill(height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = pixels[(y * width + x) * 4 + 3];
      if (alpha === 0) continue;
      left = Math.min(left, x);
      right = Math.max(right, x + 1);
      top = Math.min(top, y);
      bottom = y + 1;
      if (alpha >= 96) visibleBottom = y + 1;
      columnTops[x] = Math.min(columnTops[x], y);
    }
  }

  // Bound the silhouette throughout the full tilt range, including during interpolation.
  const ratio = image.naturalWidth / image.naturalHeight;
  const tiltRadians = maxTilt * Math.PI / 180;
  const sine = Math.sin(tiltRadians);
  const cosineLoss = (1 - Math.cos(tiltRadians)) / 2;
  const horizontalShift = sine / (2 * ratio) + cosineLoss;
  const halfWidth = Math.max(0.5 - (left - 1) / width, (right + 1) / width - 0.5);
  const halfHeight = Math.max(0.5 - (top - 1) / height, (bottom + 1) / height - 0.5);
  const scale = Math.min(1, 0.5 / (halfWidth + horizontalShift),
    0.5 / (halfHeight + ratio * sine / 2 + cosineLoss));
  const inset = (1 - scale) / 2;
  let tiltedTop = 1;
  let frontTop = 1;
  const profile = [];
  for (const [x, y] of columnTops.entries()) {
    if (y === height) continue;
    const fromCenter = Math.abs((x + 0.5) / width - 0.5) + 1.5 / width;
    const safeTop = inset + scale * ((y - 1) / height - fromCenter * ratio * sine - cosineLoss);
    tiltedTop = Math.min(tiltedTop, safeTop);
    const safeLeft = inset + scale * ((x - 1) / width - horizontalShift);
    profile.push({ left: safeLeft, top: tiltedTop });
    // The route spans at most the first 80% of regular-width cards.
    if (safeLeft <= 0.8) frontTop = Math.min(frontTop, safeTop);
  }

  const bounds = top === height ? null : {
    top: tiltedTop,
    bottom: inset + scale * (visibleBottom || bottom) / height,
    left: Math.min(9, (inset + scale * left / width) * 100),
    frontTop,
    profile,
    crop: [
      Math.max(0, left - 1) / width,
      Math.max(0, top - 1) / height,
      Math.min(width, right + 1) / width,
      Math.min(height, bottom + 1) / height,
    ],
    inset: inset * 100,
  };
  artworkBounds.set(key, bounds);
  return bounds;
}
