import { aircraftImage } from "./artwork.js";
import { aircraftModel, callsignDetails } from "./flight-details.js";

const cardTemplate = document.querySelector("#flight-card-template");
const trackDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const artworkBounds = new Map();
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

export function createAircraftPresentation(notify) {
  let revision = 0;
  let callsign;
  let flightIdentifier;
  let flight = {};
  let aircraftType;
  let model;
  let view = {};

  function setView(next) {
    if (Object.keys(next).every(key => Object.is(view[key], next[key]))) return;
    view = { ...view, ...next };
    notify();
  }

  function updateFlight(details) {
    flight = details;
    const { departure, destination } = details;
    const routeKey = JSON.stringify([departure?.code, departure?.city, destination?.code, destination?.city]);
    setView({
      ...(view.routeKey === routeKey ? {} : { routeKey, departure, destination }),
      description: [flightIdentifier, details.airline].filter(Boolean).join(" · ") || "N/A",
    });
  }

  async function update({ item, distanceKm, details }, signal, waitForDetails) {
    if (signal.aborted) return;
    const currentRevision = ++revision;
    const isCurrent = () => !signal.aborted && revision === currentRevision;
    const nextCallsign = identifier(item.flight);
    const nextType = identifier(item.t);
    if (aircraftType !== nextType || details) model = details?.model;
    if (callsign !== nextCallsign || details) flight = details ?? {};
    callsign = nextCallsign;
    aircraftType = nextType;

    flightIdentifier = [item.flight, item.r, item.hex]
      .find(value => typeof value === "string" && value.trim())?.trim();
    const altitude = item.alt_baro ?? item.alt_geom;
    setView({
      name: model || aircraftType || "Unknown aircraft",
      distance: `${distanceKm.toFixed(1)} km`,
      altitude: altitude === "ground" ? "On ground" :
        Number.isFinite(altitude) ? `${altitude.toLocaleString()} ft` : "N/A",
      speed: Number.isFinite(item.gs) && item.gs >= 0
        ? `${Math.round(item.gs * 1.852).toLocaleString()} km/h` : "N/A",
      track: Number.isFinite(item.track) && item.track >= 0 && item.track < 360 ? item.track : undefined,
    });
    updateFlight(flight);

    const flightDetails = details ? null : callsignDetails(item, signal);
    const modelLookup = details ? null : aircraftModel(item, signal).then(value => {
      if (!isCurrent() || !value) return;
      model = value;
      setView({ name: model });
    });
    if (waitForDetails && flightDetails) {
      const [result] = await Promise.all([flightDetails, modelLookup]);
      if (!isCurrent()) return;
      updateFlight(result);
    }

    const operator = flight.operatorIcao;
    const image = await aircraftImage(item, operator, view.image);
    if (!isCurrent()) return;
    setView({ image });

    if (waitForDetails) return;
    flightDetails?.then(async (result) => {
      if (!isCurrent()) return;
      updateFlight(result);
      if (flight.operatorIcao === operator) return;

      const livery = await aircraftImage(item, flight.operatorIcao, view.image);
      if (isCurrent()) setView({ image: livery });
    });
  }

  return { get view() { return view; }, update };
}

export function createFlightCard() {
  const element = cardTemplate.content.firstElementChild.cloneNode(true);
  const readouts = Object.fromEntries(Object.entries(readoutSelectors).map(([key, selector]) =>
    [key, element.querySelector(selector)]));
  const track = element.querySelector(".flight-track");
  const picture = element.querySelector(".flight-picture");
  const art = picture.querySelector(".flight-art");
  const route = picture.querySelector(".flight-route");
  let routeKey;

  function paint(view) {
    for (const [key, field] of Object.entries(readouts)) setText(field, view[key]);
    setTrack(track, view.track);
    if (routeKey !== view.routeKey) {
      routeKey = view.routeKey;
      setRoute(route, view);
    }
    setArtwork(picture, art, view.image);
  }

  return { element, readouts, track, art, route, paint };
}

function identifier(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function setText(element, value) {
  if (element.textContent !== value) element.textContent = value;
}

function setTrack(element, track) {
  const available = Number.isFinite(track) && track >= 0 && track < 360;
  const bearing = available ? `${String(Math.round(track) % 360).padStart(3, "0")}°` : "";
  const cardinal = available ? trackDirections[Math.round(track / 45) % trackDirections.length] : "";
  const rotation = available ? `${track}deg` : "";
  const label = available ? `Ground track ${bearing} ${cardinal}` : "Ground track unavailable";
  element.toggleAttribute("data-track-unavailable", !available);
  if (element.style.getPropertyValue("--bearing") !== rotation) element.style.setProperty("--bearing", rotation);
  if (element.getAttribute("aria-label") !== label) element.setAttribute("aria-label", label);
}

function setRoute(element, { departure, destination }) {
  const arrow = document.createElement("span");
  arrow.className = "flight-route-arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "→";
  element.replaceChildren(createAirport(departure), arrow, createAirport(destination));
  const airportName = (airport) => [airport?.city, airport?.code].filter(Boolean).join(" ") || "unknown airport";
  element.setAttribute("aria-label", `${airportName(departure)} to ${airportName(destination)}`);
}

function createAirport(airport) {
  const airportElement = document.createElement("div");
  airportElement.className = "flight-airport";
  airportElement.setAttribute("aria-hidden", "true");
  const flaps = document.createElement("div");
  flaps.className = "flight-flaps";
  const code = /^[A-Z0-9]{3,4}$/.test(airport?.code) ? airport.code : "N/A";
  for (const letter of code) {
    const flap = document.createElement("span");
    flap.textContent = letter;
    flaps.append(flap);
  }
  const city = document.createElement("span");
  city.className = "flight-city";
  city.textContent = airport?.city ?? "";
  airportElement.append(flaps, city);
  return airportElement;
}

function setArtwork(picture, art, image) {
  if (image === art.firstElementChild) return;
  if (!image) {
    picture.removeAttribute("style");
    art.replaceChildren();
    return;
  }
  picture.style.setProperty("--image-ratio", image.naturalWidth / image.naturalHeight);
  const bounds = measureArtwork(image);
  if (bounds) {
    picture.style.setProperty("--art-top", bounds.top);
    picture.style.setProperty("--art-left", `${bounds.left}%`);
    picture.style.setProperty("--art-front-top", bounds.frontTop);
  } else {
    picture.style.removeProperty("--art-top");
    picture.style.removeProperty("--art-left");
    picture.style.removeProperty("--art-front-top");
  }
  art.replaceChildren(image);
}

function measureArtwork(image) {
  if (artworkBounds.has(image.src)) return artworkBounds.get(image.src);
  if (!sampleContext) return null;

  const { width, height } = sample;
  sampleContext.clearRect(0, 0, width, height);
  sampleContext.drawImage(image, 0, 0, width, height);
  const pixels = sampleContext.getImageData(0, 0, width, height).data;
  let left = width;
  let top = height;
  let frontTop = height;
  // Sample the forward area so flap tiles stay above the fuselage and propellers.
  const frontWidth = width * 0.73;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] < 96) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      if (x < frontWidth) frontTop = Math.min(frontTop, y);
    }
  }

  const bounds = top === height ? null : {
    top: Math.max(0, top - 1) / height,
    left: Math.min(9, left * 100 / width),
    frontTop: Math.max(0, frontTop - 1) / height,
  };
  artworkBounds.set(image.src, bounds);
  return bounds;
}
