import { formatNumber, formatSpeed, localize, setMessage, t } from "../display-formats.js";
import { distanceBetween } from "../flight-weather.js";
import { flightDate } from "../track-settings.js";
import { aircraftGear, aircraftImage, catalogAircraft } from "./artwork.js";
import { altitudeReadout, createAircraftArtwork, createAircraftMotion, createAirport, placeAircraftScenery, setRouteTime, setTrack } from "./flight-card.js";
import { callsignDetails } from "./flight-details.js";
import { fitFlightCards, flightCardOrder } from "./flight-layout.js";
import { trackedMapEntry } from "./map-aircraft.js";
import { estimateArrivalTime, estimateRouteProgress, estimateTakeoffTime, estimateTouchdown, hasCoordinates, isAtDestination } from "./route-progress.js";

const updateInterval = 15_000;
const landingPositionMaxAge = 60_000;
const approachMaxAge = 120_000;
const primaryLandingHold = 10_000;
const trackStateText = {
  waiting: "Waiting for ADS-B broadcast",
  ambiguous: "Multiple aircraft using this callsign",
  unavailable: "adsb.fi unavailable",
  "choose-departure": "Choose a dated departure in Companion settings",
  "key-required": "FlightAware key required",
};

export function startTrackedFlights(root, modeSignal, getMotion, interactive, map) {
  const list = root.querySelector("#tracked-aircraft");
  const status = root.querySelector("#track-status");
  const template = root.querySelector("#track-card-template");
  const sceneryLayer = document.createElement("div");
  sceneryLayer.className = "flight-scenery-layer";
  sceneryLayer.setAttribute("aria-hidden", "true");
  root.append(sceneryLayer);
  const cards = new Map();
  let queue = [];
  let queueKey;
  let controller;
  let timer;
  let layoutFrame;
  let primaryCard;
  let handoffTimer;
  let showingMap = false;
  let updatesUnavailable = false;
  const resize = new ResizeObserver(layout);
  resize.observe(root);
  resize.observe(list);
  if (interactive) {
    list.addEventListener("scroll", () => placeAircraftScenery(root, cards.values()), { passive: true, signal: modeSignal });
  }

  function layout() {
    if (showingMap) return;
    if (layoutFrame !== undefined) return;
    layoutFrame = requestAnimationFrame(() => {
      layoutFrame = undefined;
      if (showingMap) return;
      const scrollTop = list.scrollTop;
      const scrollable = !fitFlightCards(list) && interactive;
      list.toggleAttribute("data-scroll", scrollable);
      if (scrollable) list.tabIndex = 0;
      else list.removeAttribute("tabindex");
      list.scrollTop = scrollable ? scrollTop : 0;
      placeAircraftScenery(root, cards.values());
    });
  }

  function orderCards() {
    clearTimeout(handoffTimer);
    handoffTimer = undefined;
    if (showingMap) return;
    const now = Date.now();
    const ranked = queue.map(({ id }) => {
      const card = cards.get(id);
      return { card, ...card.arrivalPriority(now) };
    });
    // With provider ETAs in the mix, compare time to arrival across all cards.
    // Otherwise use the measured remaining distance for ADS-B watches.
    const metric = ranked.some(entry => entry.hasLandingEstimate) ? "minutes" : "distanceKm";
    ranked.sort((a, b) => (a[metric] ?? Infinity) - (b[metric] ?? Infinity));
    const heldIndex = ranked.findIndex(({ card }) => card === primaryCard);
    const holdMs = heldIndex < 0 ? 0 : primaryCard.remainingLandingHold();
    if (holdMs > 0) {
      ranked.unshift(...ranked.splice(heldIndex, 1));
      if (ranked.length > 1) handoffTimer = setTimeout(orderCards, Math.ceil(holdMs));
    }
    primaryCard = ranked[0]?.card;
    for (const [index, entry] of flightCardOrder(ranked).entries()) {
      const { element } = entry.card;
      element.toggleAttribute("data-primary", entry === ranked[0]);
      const atIndex = list.children[index];
      if (atIndex !== element) list.insertBefore(element, atIndex ?? null);
    }
    layout();
  }

  function setQueue(nextQueue) {
    const key = JSON.stringify(nextQueue.map(flight => flight.id));
    if (modeSignal.aborted || key === queueKey) return;
    queueKey = key;
    queue = nextQueue;
    clearTimeout(timer);
    controller?.abort();
    controller = new AbortController();
    const { signal } = controller;
    const selected = new Set(queue.map(flight => flight.id));
    for (const [id, card] of cards) {
      if (selected.has(id)) continue;
      card.remove();
      cards.delete(id);
    }
    for (const flight of queue) {
      if (cards.has(flight.id)) continue;
      const card = createTrackedCard(template, flight, getMotion, layout);
      cards.set(flight.id, card);
      sceneryLayer.append(...card.scenery);
    }
    list.dataset.count = queue.length;
    orderCards();
    if (queue.length) void refresh(signal);
  }

  function applySettings({ trackedFlights = [], trackView, mapAircraft, theme }) {
    const nextMap = trackView === "map";
    if (nextMap !== showingMap) {
      showingMap = nextMap;
      sceneryLayer.hidden = nextMap;
      if (!showingMap) {
        map.hide();
        orderCards();
      }
    }
    setQueue(trackedFlights);
    if (showingMap) {
      map.setTheme(theme);
      map.select(mapAircraft);
    }
    paintView();
  }

  function paintView() {
    if (showingMap) {
      const entries = queue.map(({ id }) => cards.get(id).mapEntry()).filter(Boolean);
      map.showTracked(entries);
      status.hidden = entries.length !== 0;
    } else {
      status.hidden = queue.length !== 0;
    }
    list.hidden = showingMap || queue.length === 0;
    setMessage(status, !queue.length ? "Add a flight or callsign in Companion settings → Track." :
      updatesUnavailable ? "Updates unavailable" : "No current positions for tracked flights.");
  }

  async function refresh(signal) {
    try {
      const response = await fetch("/api/track/status", { cache: "no-store",
        signal: AbortSignal.any([signal, AbortSignal.timeout(22000)]) });
      if (!response.ok) throw new Error("Track status unavailable");
      const { flights } = await response.json();
      if (signal.aborted) return;
      if (!Array.isArray(flights)) throw new Error("Track status unavailable");
      updatesUnavailable = false;
      const snapshots = new Map(flights.map(flight => [flight.id, flight]));
      const updates = [...cards].map(([id, card]) => {
        const snapshot = snapshots.get(id);
        return snapshot ? card.show(snapshot) : card.unavailable();
      });
      if (showingMap) paintView();
      await Promise.all(updates);
      if (!signal.aborted) {
        if (showingMap) paintView();
        else orderCards();
      }
    } catch {
      if (signal.aborted) return;
      updatesUnavailable = true;
      for (const card of cards.values()) card.unavailable();
      if (showingMap) paintView();
    } finally {
      if (!signal.aborted) timer = setTimeout(() => void refresh(signal), updateInterval);
    }
  }

  modeSignal.addEventListener("abort", () => {
    clearTimeout(timer);
    clearTimeout(handoffTimer);
    controller?.abort();
    if (showingMap) map.hide();
    cancelAnimationFrame(layoutFrame);
    resize.disconnect();
    for (const card of cards.values()) card.remove();
    sceneryLayer.remove();
    delete list.dataset.count;
    list.removeAttribute("data-scroll");
    list.removeAttribute("tabindex");
    list.style.removeProperty("--fitted-primary-size");
    list.hidden = true;
    status.hidden = true;
  }, { once: true });

  return {
    applySettings,
    refreshPresentation() {
      for (const card of cards.values()) card.refreshPresentation();
      if (showingMap) map.refresh();
      else layout();
    },
  };
}

function createTrackedCard(template, selection, getMotion, layout) {
  const element = template.content.firstElementChild.cloneNode(true);
  localize(element);
  const field = selector => element.querySelector(selector);
  const picture = field(".track-picture");
  const artwork = createAircraftArtwork(picture, getMotion, field(".track-art"));
  const route = field(".track-route");
  const description = field(".flight-description");
  const status = field(".track-state");
  const instruments = field(".flight-instruments");
  const altitude = field("[data-altitude]");
  const altitudeLabel = field("[data-altitude-label]");
  const speed = field("[data-speed]");
  const bearing = field(".flight-track");
  const departure = field(".track-departure");
  const arrival = field(".track-arrival");
  const arc = field(".track-arc");
  const completed = field(".track-arc-complete");
  const marker = field(".track-arc-position");
  const times = field(".track-times");
  const airborne = field("[data-airborne]");
  const left = field("[data-time-left]");
  const fallback = {
    origin: { code: selection.origin, timezone: selection.timezone },
    destination: { code: selection.destination },
    scheduledDeparture: selection.departure,
  };
  let flight = fallback;
  let mapSnapshot;
  let displayedAltitudeFeet;
  let identity;
  let aircraftArt;
  let aircraftMotion = createAircraftMotion();
  let referenceAirports;
  let landedFlight;
  let landingShownAt;
  let expectedTouchdown;
  let lastRoutePosition;
  let observationKey;
  let referenceProgress;
  let latestNote;
  const controller = new AbortController();
  const { signal } = controller;
  const watchingAdsb = Boolean(selection.callsign || selection.aircraftHex);

  field(".flight-name").textContent = selection.number;
  if (watchingAdsb) {
    route.setAttribute("data-reference", "");
    route.setAttribute("role", "group");
    arc.setAttribute("aria-hidden", "true");
    completed.setAttribute("hidden", "");
    marker.hidden = true;
    times.hidden = true;
  }

  function paint(note) {
    latestNote = note;
    const { updatedAt, takeoff, landed, arrived, cancelled, diverted, position, estimatedArrival, scheduledArrival } = flight;
    const now = note ? (updatedAt ?? Date.now()) : Date.now();
    const finished = arrived ?? landed;
    const landing = landedFlight?.inferredLanding ? "Likely landed" : landedFlight || finished ? "Landed" : "";
    status.textContent = t(cancelled ? "Cancelled" : landing || note || (diverted ? "Diverted" : ""));
    status.hidden = !status.textContent;
    if (!aircraftArt?.description) description.textContent = t("N/A");
    description.hidden = !aircraftArt?.description && !status.hidden;
    if (watchingAdsb) {
      route.setAttribute("aria-label", t("Estimated route"));
      route.title = t("Estimated route from ADSBDB");
      paintReferenceAirports();
    } else {
      paintAirport(departure, flight.origin ?? fallback.origin, {
        timestamp: takeoff ?? flight.departed ?? flight.estimatedDeparture ?? flight.scheduledDeparture ?? selection.departure,
        kind: takeoff ? "Took off" : flight.departed ? "Actual" : flight.estimatedDeparture ? "Estimated" : "Scheduled",
      });
      paintAirport(arrival, flight.destination ?? fallback.destination, {
        timestamp: finished ?? estimatedArrival ?? scheduledArrival,
        kind: arrived ? "Actual" : landed ? "Landed" : estimatedArrival ? "Estimated" : "Scheduled",
      });
      const airborneTime = takeoff && (landed || !finished) ? (landed ?? now) - takeoff :
        !takeoff && !finished && flight.updatedAt ? 0 : null;
      airborne.textContent = formatDuration(airborneTime);
      const minutesLeft = finished ? 0 : takeoff && estimatedArrival && !cancelled ? estimatedArrival - now : null;
      left.textContent = formatDuration(minutesLeft, true);

      const estimatedLanding = flight.estimatedLanding ?? estimatedArrival;
      const elapsedFraction = takeoff && estimatedLanding > takeoff ? (now - takeoff) / (estimatedLanding - takeoff) : undefined;
      const estimate = flight.progress === undefined ? elapsedFraction : flight.progress / 100;
      const progress = finished ? 1 : !flight.updatedAt ? undefined : !takeoff ? 0 : Math.min(.99, estimate);
      paintArc(arc, completed, marker, progress, cancelled);
    }

    const displayAltitude = altitudeReadout(
      { alt_baro: position?.pressureAltitude, alt_geom: position?.geometricAltitude },
      position?.ground, flight.altimeter, position?.altitude);
    displayedAltitudeFeet = displayAltitude.altitudeFeet;
    const altitudeField = altitude.parentElement;
    altitudeField.hidden = !position?.ground && !Number.isFinite(displayedAltitudeFeet);
    if (!altitudeField.hidden) {
      altitude.textContent = displayAltitude.altitude;
      altitudeLabel.textContent = displayAltitude.altitudeLabel;
      altitudeField.title = displayAltitude.altitudeLabel;
    }
    speed.hidden = !Number.isFinite(position?.speed);
    if (!speed.hidden) speed.textContent = formatSpeed(position.speed);
    bearing.hidden = !Number.isFinite(position?.heading);
    if (!bearing.hidden) setTrack(bearing, position.heading);
    instruments.hidden = Boolean(finished || landedFlight?.inferredLanding || cancelled ||
      (altitudeField.hidden && speed.hidden && bearing.hidden));
    layout();
  }

  function paintArtwork() {
    if (!aircraftArt) return;
    const { position, cancelled, departed, takeoff, landed, arrived } = flight;
    const ground = position?.ground || Boolean(landed || arrived || (departed && !takeoff));
    const telemetry = {
      ground,
      alt_baro: position?.pressureAltitude,
      alt_geom: position?.geometricAltitude,
      lat: position?.latitude,
      lon: position?.longitude,
      gs: position?.speed / 1.852,
      geom_rate: position?.verticalRate,
      altitudeTrend: position?.altitudeTrend,
    };
    const airports = referenceAirports ?? { departure: flight.origin, destination: flight.destination };
    const motion = !cancelled && (ground || position)
      ? aircraftMotion(telemetry, airports, aircraftArt.isHelicopter, aircraftArt.gear, displayedAltitudeFeet) : {};
    artwork.paint({ ...aircraftArt, ...motion });
    layout();
  }

  async function updateArt({ aircraftType, model, operator, operatorIata, registration, hex, category }) {
    const fields = [aircraftType, model, operator, operatorIata, registration, hex, category];
    const key = fields.join("/");
    if (key === identity || !fields.some(Boolean)) {
      paintArtwork();
      return;
    }
    identity = key;
    try {
      const aircraft = await catalogAircraft({ t: aircraftType, r: registration, hex, category });
      const image = await aircraftImage(aircraft, operator);
      const gear = await aircraftGear(image);
      if (signal.aborted || identity !== key) return;
      if (hex !== aircraftArt?.hex || registration !== aircraftArt?.registration) aircraftMotion = createAircraftMotion();
      const label = [aircraft.model ?? model ?? aircraftType, operatorIata ?? operator].filter(Boolean).join(" · ");
      aircraftArt = { image, gear, hex, registration, description: label, isHelicopter: aircraft.category === "helicopter" };
      description.textContent = label || t("N/A");
      description.hidden = !label && !status.hidden;
      paintArtwork();
    } catch {
      if (identity === key) identity = undefined;
    }
  }

  function resetReferenceProgress({ keepObservation = false } = {}) {
    if (!keepObservation) {
      observationKey = undefined;
      lastRoutePosition = undefined;
    }
    referenceProgress = undefined;
    landedFlight = undefined;
    landingShownAt = undefined;
    expectedTouchdown = undefined;
    paintReferenceAirports();
    paintReferenceArc();
    layout();
  }

  async function updateReferenceRoute(snapshot) {
    if (!selection.callsign) return;
    if (snapshot.state !== "observed") {
      if (snapshot.state === "unavailable") return;
      // Surface broadcasts can return without coordinates after a brief gap.
      resetReferenceProgress({ keepObservation: snapshot.state === "waiting" });
      return;
    }
    const key = snapshot.hex?.toUpperCase() || snapshot.registration;
    if (key !== observationKey) resetReferenceProgress();
    observationKey = key;
    const details = await callsignDetails({ flight: selection.callsign, r: snapshot.registration }, signal).catch(() => ({}));
    if (signal.aborted || flight !== snapshot) return;
    if (details.departure || details.destination) referenceAirports = details;
    const { departure: origin, destination, hasIntermediateStop } = referenceAirports ?? {};
    const { position } = snapshot;
    if (hasCoordinates(position)) lastRoutePosition = { position, updatedAt: snapshot.updatedAt };
    const positionAge = snapshot.updatedAt - lastRoutePosition?.updatedAt;
    const arrivalPosition = positionAge >= 0 && positionAge <= landingPositionMaxAge ? lastRoutePosition.position : position;
    const atDestination = isAtDestination(origin, destination, arrivalPosition);
    const previouslyLanded = landedFlight;
    if (position?.ground && atDestination) {
      rememberLanding(snapshot);
    } else if (position?.ground === false || (hasCoordinates(position) && !atDestination)) {
      landedFlight = undefined;
      landingShownAt = undefined;
    }
    expectedTouchdown = !landedFlight && !hasIntermediateStop
      ? estimateTouchdown(origin, destination, position, displayedAltitudeFeet, snapshot.updatedAt) : undefined;
    referenceProgress = landedFlight ? 1 : hasIntermediateStop ? undefined : estimateRouteProgress(origin, destination, position);
    if (landedFlight && !position?.ground) flight = landedFlight;
    if (landedFlight || previouslyLanded) paint(latestNote);
    else paintReferenceAirports();
    paintArtwork();
    paintReferenceArc();
    layout();
  }

  function rememberLanding(snapshot, inferredLanding = false) {
    landingShownAt ??= performance.now();
    landedFlight = { ...snapshot, inferredLanding, position: { ground: true } };
    expectedTouchdown = undefined;
  }

  function paintReferenceAirports() {
    const origin = referenceAirports?.departure;
    const takeoff = !latestNote && !landedFlight && referenceAirports
      ? estimateTakeoffTime(referenceAirports, flight.position, flight.updatedAt, flight.observedTakeoff) : undefined;
    paintAirport(departure, origin, { reference: "takeoff", timestamp: takeoff });
    paintAirport(arrival, referenceAirports?.destination, { reference: "landing", timestamp: approximateArrival() });
  }

  function approximateArrival() {
    if (latestNote || landedFlight || !referenceAirports) return;
    return estimateArrivalTime(referenceAirports, flight.position, displayedAltitudeFeet, flight.updatedAt);
  }

  function paintReferenceArc() {
    const known = Number.isFinite(referenceProgress);
    completed.toggleAttribute("hidden", !known);
    arc.toggleAttribute("data-estimated", known && (!landedFlight || landedFlight.inferredLanding));
    if (known) arc.removeAttribute("aria-hidden");
    else arc.setAttribute("aria-hidden", "true");
    const landingLabel = landedFlight?.inferredLanding ? "Likely landed" : "Landed at destination";
    marker.title = t(landedFlight ? landingLabel : known ? "Estimated position along the route" : "");
    paintArc(arc, completed, marker, referenceProgress, false,
      landedFlight ? landingLabel : "Estimated progress along the route");
  }

  function arrivalPriority(now) {
    if (flight.cancelled || flight.diverted || flight.landed || flight.arrived || landedFlight) return;
    if (watchingAdsb) {
      const { position } = flight;
      const destination = referenceAirports?.destination;
      if (flight.state !== "observed" || position?.ground !== false || !hasCoordinates(position) || !hasCoordinates(destination)) return;
      const distanceKm = distanceBetween(destination, { lat: position.latitude, lon: position.longitude });
      const minutes = position.speed > 0 ? distanceKm / position.speed * 60 : undefined;
      return { distanceKm, minutes };
    }
    const time = flight.estimatedLanding ?? flight.estimatedArrival;
    if (!flight.takeoff || flight.error || !Number.isFinite(time)) return;
    return { minutes: Math.max(0, time - now) / 60_000, hasLandingEstimate: true };
  }

  paint("Finding flight status…");
  return {
    scenery: artwork.scenery,
    sceneryFrame: artwork.sceneryFrame,
    element,
    arrivalPriority,
    mapEntry() {
      const entry = trackedMapEntry(mapSnapshot, selection, referenceAirports?.destination);
      if (entry) entry.cardElement = element;
      return entry;
    },
    remainingLandingHold() {
      return landingShownAt === undefined ? 0 : landingShownAt + primaryLandingHold - performance.now();
    },
    refreshPresentation() {
      paint(latestNote);
      if (watchingAdsb) paintReferenceArc();
    },
    show(snapshot) {
      mapSnapshot = snapshot;
      const now = Date.now();
      if (snapshot.state === "waiting" && Number.isFinite(expectedTouchdown) && now - flight.updatedAt <= approachMaxAge) {
        if (now < expectedTouchdown) {
          paint(trackStateText.waiting);
          return;
        }
        rememberLanding(flight, true);
        referenceProgress = 1;
        paintReferenceArc();
      }
      const repeatedAirborne = landedFlight && snapshot.position?.ground === false &&
        snapshot.hex?.toUpperCase() === landedFlight.hex?.toUpperCase() && snapshot.updatedAt <= landedFlight.updatedAt;
      if (landedFlight && (snapshot.state === "waiting" || snapshot.state === "unavailable" || repeatedAirborne)) {
        flight = landedFlight;
        paint("");
        paintArtwork();
        return;
      }
      if (landedFlight && snapshot.state === "observed" && snapshot.position?.ground === false) resetReferenceProgress();
      if (!watchingAdsb) {
        if (snapshot.landed || snapshot.arrived) landingShownAt ??= performance.now();
        else landingShownAt = undefined;
      }
      flight = snapshot;
      const note = trackStateText[snapshot.state] ?? (snapshot.error ? (snapshot.updatedAt ? "Updates unavailable" : snapshot.error) : "");
      paint(note);
      void updateArt(snapshot);
      return updateReferenceRoute(snapshot);
    },
    unavailable() {
      mapSnapshot = undefined;
      if (landedFlight) {
        flight = landedFlight;
        paint("Updates unavailable");
        paintArtwork();
        return;
      }
      paint("Updates unavailable");
    },
    remove() {
      controller.abort();
      artwork.scenery.forEach(layer => layer.remove());
      element.remove();
    },
  };
}

function paintAirport(side, airport, { timestamp, kind, reference = false } = {}) {
  const airportContainer = side.querySelector("[data-airport]");
  const key = JSON.stringify([airport?.code, airport?.city]);
  if (airportContainer.dataset.airport !== key) {
    const airportElement = createAirport(airport, { knownOnly: reference && Boolean(airport?.city) });
    airportElement.removeAttribute("aria-hidden");
    airportContainer.replaceChildren(airportElement);
    airportContainer.dataset.airport = key;
  }
  const time = side.querySelector("time");
  const timeKind = side.querySelector("[data-time-kind]");
  timeKind.hidden = Boolean(reference);
  if (reference) {
    setRouteTime(time, timestamp, reference);
    return;
  }
  time.hidden = false;
  time.textContent = flightDate(timestamp, airport?.timezone);
  if (Number.isFinite(timestamp)) time.dateTime = new Date(timestamp).toISOString();
  else time.removeAttribute("datetime");
  timeKind.textContent = Number.isFinite(timestamp) ? t(kind) : "";
}

function paintArc(arc, completed, marker, progress, cancelled, progressLabel) {
  const known = Number.isFinite(progress) && !cancelled;
  const fraction = known ? Math.min(1, Math.max(0, progress)) : 0;
  const x = 2 + 596 * fraction;
  const y = 51 - 184 * fraction * (1 - fraction);
  completed.setAttribute("d", `M 2 51 Q ${2 + 298 * fraction} ${51 - 92 * fraction} ${x} ${y}`);
  arc.style.setProperty("--track-arc-x", x / 6 + "%");
  arc.style.setProperty("--track-arc-y", y / .56 + "%");
  arc.setAttribute("aria-label", t(!known ? "Route progress unavailable" :
    progressLabel ?? (fraction === 1 ? "Route completed" : fraction === 0 ? "Waiting to depart" : "Flight in progress")));
  marker.hidden = !known;
}

function formatDuration(milliseconds, roundUp = false) {
  if (!Number.isFinite(milliseconds)) return "—";
  const minutes = Math.max(0, (roundUp ? Math.ceil : Math.floor)(milliseconds / 60_000));
  const hours = Math.floor(minutes / 60);
  return hours ? t("{hours} h {minutes} min", { hours: formatNumber(hours), minutes: String(minutes % 60).padStart(2, "0") }) :
    t("{minutes} min", { minutes: formatNumber(minutes) });
}
