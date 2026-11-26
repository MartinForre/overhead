import { localize, setMessage, t } from "../display-formats.js";
import { flightReferenceCallsign, mapAircraftKey, sameLocation } from "../settings-schema.js";
import { aircraftImage, catalogAircraft } from "./artwork.js";
import { createAircraftPresentation, createFlightCard, measureArtwork } from "./flight-card.js";
import { callsignDestination } from "./flight-details.js";
import { fitFlightCards } from "./flight-layout.js";
import { isOnGround } from "./landing-gear.js";
import { artworkAnchor, artworkEndpoints, groupGroundAircraft, mapAircraftScale } from "./map-aircraft.js";
import { basemapStyle, loadMapLibre } from "./map-basemap.js";
import {
  clipDestinationLine, closestLongitude, mapDiameterBounds, projectFromCenter, spriteOrientation,
} from "./map-geometry.js";
import { sampleMapMotion, updateMapMotion } from "./map-motion.js";
import { hasCoordinates } from "./route-progress.js";

const spriteCache = new Map();
const routeLookupSpacingMs = 1_500;
const routeLifetimeMs = 15 * 60_000;

export function createLiveMap(element, cardTemplate, getMotion, onSelect) {
  const root = element.parentElement;
  const stage = element.querySelector(".live-map-stage");
  const basemap = element.querySelector(".live-map-basemap");
  const trails = element.querySelector(".live-map-trails");
  const destinations = element.querySelector(".live-map-destinations");
  const center = element.querySelector(".live-map-center");
  const mapCredit = element.querySelector(".live-map-credit");
  const caption = element.querySelector(".live-map-caption");
  const markerLayer = element.querySelector(".live-map-markers");
  const footer = element.querySelector(".live-map-footer");
  const details = createMapDetails(footer, cardTemplate, getMotion, (marker, entry, destination) => {
    if (marker.entry !== entry || !hasCoordinates(destination)) return;
    marker.destination = destination;
    redraw();
  });
  const markers = new Map();
  const clusters = new Map();
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let location, radiusKm, theme, diameter, selected, map, loading;
  let projector;
  let width = 0;
  let height = 0;
  let animationFrame;
  let overlayColor;
  let routesDrawn = false;
  let lookupTimer, lookupController;
  let close;

  if (onSelect) {
    close = document.createElement("button");
    close.type = "button";
    close.className = "live-map-close";
    close.textContent = "×";
    close.addEventListener("click", () => {
      markers.get(selected)?.node.focus();
      onSelect(null);
    });
    footer.append(close);
  }

  new ResizeObserver(fit).observe(stage);
  new ResizeObserver(() => element.style.setProperty("--map-detail-height", footer.offsetHeight + "px")).observe(footer);
  reducedMotion.addEventListener("change", () => redraw());

  async function load() {
    const request = {};
    loading = request;
    try {
      const library = await loadMapLibre();
      if (loading !== request || !diameter) return;
      map = new library.Map({
        container: basemap,
        style: basemapStyle(element),
        center: [location.longitude, location.latitude],
        interactive: false,
        attributionControl: false,
        trackResize: false,
      });
      map.getCanvas().removeAttribute("tabindex");
      let tileError = false;
      let hasHostedTiles = false;
      map.on("style.load", () => { tileError = false; });
      map.on("sourcedata", ({ sourceId, tile }) => {
        if (sourceId === "tiles" && tile) {
          hasHostedTiles = true;
          mapCredit.hidden = false;
        }
      });
      map.on("idle", () => {
        if (!tileError && map.getSource("tiles") && map.isSourceLoaded("tiles")) {
          showDetailedLand(true);
        }
      });
      map.on("error", ({ sourceId }) => {
        if (sourceId === "world-land") caption.hidden = false;
        if (sourceId === "tiles") {
          tileError = true;
          showDetailedLand(false);
        }
      });
      map.on("webglcontextlost", () => {
        caption.hidden = false;
        mapCredit.hidden = true;
        fit();
      });
      map.on("webglcontextrestored", () => {
        caption.hidden = true;
        mapCredit.hidden = !hasHostedTiles;
        fit();
      });
      caption.hidden = true;
      fit();
    } catch {
      if (loading !== request) return;
      mapCredit.hidden = true;
      caption.hidden = false;
    } finally {
      if (loading === request) loading = undefined;
    }
  }

  function setArea(nextLocation, nextRadius) {
    if (!nextLocation) {
      hide();
      return;
    }
    if (sameLocation(location, nextLocation) && radiusKm === nextRadius) return;
    location = nextLocation;
    radiusKm = nextRadius;
    diameter = mapDiameterBounds(location, radiusKm);
    element.hidden = false;
    root.dataset.liveView = "map";
    if (!diameter) {
      removeMap();
      caption.hidden = false;
    } else if (!map && !loading) {
      void load();
    } else {
      showDetailedLand(false);
    }
    fit();
    refresh();
  }

  function setTheme(nextTheme) {
    if (theme === nextTheme) return;
    theme = nextTheme;
    overlayColor = getComputedStyle(element).getPropertyValue("--flap").trim();
    if (map) map.setStyle(basemapStyle(element));
    drawTrails();
    drawDestinations();
  }

  function showDetailedLand(visible) {
    const visibility = visible ? "visible" : "none";
    if (map?.getLayer("detailed-land") && map.getLayoutProperty("detailed-land", "visibility") !== visibility) {
      map.setLayoutProperty("detailed-land", "visibility", visibility);
    }
  }

  function hide() {
    if (element.hidden) return;
    element.hidden = true;
    delete root.dataset.liveView;
    location = undefined;
    diameter = undefined;
    projector = undefined;
    clearTimeout(lookupTimer);
    lookupTimer = undefined;
    lookupController?.abort();
    lookupController = undefined;
    removeMap();
    show([]);
  }

  function removeMap() {
    loading = undefined;
    map?.remove();
    map = undefined;
    mapCredit.hidden = true;
    caption.hidden = true;
  }

  function fit() {
    if (!location || element.hidden) return;
    width = stage.clientWidth;
    height = stage.clientHeight;
    if (!width || !height) return;
    if (map && diameter && caption.hidden) {
      map.resize();
      // Pass only the longer axis so the shorter side does not limit zoom.
      map.fitBounds(width > height ? diameter.horizontal : diameter.vertical, { padding: 0, animate: false });
      projector = ([longitude, latitude], reference = location.longitude) => {
        const point = map.project([closestLongitude(longitude, reference), latitude]);
        return [point.x, point.y];
      };
    } else {
      projector = coordinates => projectFromCenter(location, coordinates, radiusKm, width, height);
    }
    const [x, y] = projector([location.longitude, location.latitude]);
    center.style.left = x + "px";
    center.style.top = y + "px";
    for (const marker of markers.values()) measureMarker(marker);
    layoutClusters();
    redrawMap();
    details.alignRoute();
  }

  function measureMarker(marker) {
    marker.inset = marker.node.offsetWidth / 2;
    marker.artWidth = marker.image.offsetWidth;
    marker.artHeight = marker.image.offsetHeight;
  }

  function scaleMarker(marker) {
    const scale = mapAircraftScale(marker.entry.item, marker.identity);
    if (scale === marker.scale) return;
    marker.scale = scale;
    marker.node.style.setProperty("--aircraft-scale", scale);
    measureMarker(marker);
  }

  function paintMarker(marker, pose) {
    const { node } = marker;
    const [x, y] = projector(pose.position);
    const hasTrack = pose.track !== undefined;
    if (marker.hasTrack !== hasTrack) {
      marker.hasTrack = hasTrack;
      node.toggleAttribute("data-track", hasTrack);
      paintSprite(marker);
      measureMarker(marker);
    }
    const { inset, artWidth, artHeight } = marker;
    let artworkX = 0;
    let artworkY = 0;
    if (hasTrack) {
      const { rotation, mirror } = spriteOrientation(pose.track);
      node.style.setProperty("--aircraft-bearing", pose.track.toFixed(2) + "deg");
      node.style.setProperty("--aircraft-rotation", rotation.toFixed(2) + "deg");
      node.style.setProperty("--aircraft-mirror", mirror ? "-1" : "1");
      if (marker.sprite && artWidth) {
        const angle = rotation * Math.PI / 180;
        const cos = Math.abs(Math.cos(angle));
        const sin = Math.abs(Math.sin(angle));
        artworkX = (artWidth * cos + artHeight * sin) / 2;
        artworkY = (artWidth * sin + artHeight * cos) / 2;
      }
    }
    const focused = node === document.activeElement && node.matches(":focus-visible");
    const ring = marker.key === selected || focused
      ? Math.max(inset, Math.hypot(artWidth, artHeight) / 2 + 5) : 0;
    const insetX = Math.min(width / 2, Math.max(inset, artworkX, ring));
    const insetY = Math.min(height / 2, Math.max(inset, artworkY, ring));
    const left = Math.max(insetX, Math.min(width - insetX, x));
    const top = Math.max(insetY, Math.min(height - insetY, y));
    node.style.setProperty("--marker-x", left.toFixed(2) + "px");
    node.style.setProperty("--marker-y", top.toFixed(2) + "px");
    if (hasCoordinates(marker.destination)) {
      const reference = closestLongitude(pose.position[0], location.longitude);
      marker.destinationEnd = projector([marker.destination.longitude, marker.destination.latitude], reference);
      marker.nose = artworkAnchor(left, top, pose.track, artWidth, artHeight, marker.sprite?.nose);
      // Short guides would cross the artwork when the aircraft reaches the airport.
      marker.showDestination = Math.hypot(marker.destinationEnd[0] - left, marker.destinationEnd[1] - top) > artWidth / 2 + 4;
    } else {
      marker.showDestination = false;
    }
    marker.tail = artworkAnchor(left, top, pose.track, artWidth, artHeight, marker.sprite?.tail);
    if (ring) {
      node.style.setProperty("--selection-size", ring * 2 + "px");
      node.style.setProperty("--label-offset", (Math.max(37, Math.min(width - 37, left)) - left) + "px");
      node.style.setProperty("--label-distance", insetY + "px");
      node.toggleAttribute("data-label-above", top > height - insetY - 28);
    }
  }

  function redraw(refreshAll = true) {
    if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
    animationFrame = undefined;
    if (!projector || element.hidden) return;
    const now = Date.now();
    let moving = false;
    for (const marker of markers.values()) {
      const pose = sampleMapMotion(marker.motion, now, !reducedMotion.matches);
      if (refreshAll || pose.moving || marker.moving) paintMarker(marker, pose);
      marker.moving = pose.moving;
      moving ||= pose.moving;
    }
    drawDestinations();
    if (moving) animationFrame = requestAnimationFrame(() => redraw(false));
  }

  function redrawMap() {
    drawTrails();
    redraw();
  }

  function drawTrails() {
    const context = clearOverlay(trails);
    if (!context) return;
    context.lineCap = "round";

    for (const marker of markers.values()) {
      marker.trailEnd = undefined;
      if (marker.clustered) continue;
      const { history } = marker.motion;
      if (history.length < 2) continue;
      const highlighted = marker.key === selected;
      context.lineWidth = highlighted ? 2.6 : 1.65;
      for (let index = 1; index < history.length; index++) {
        const from = history[index - 1].location;
        const to = history[index].location;
        if (from.latitude === to.latitude && from.longitude === to.longitude) continue;
        const [startX, startY] = historyTail(marker, history[index - 1]);
        const [endX, endY] = historyTail(marker, history[index]);
        if (Math.hypot(endX - startX, endY - startY) < .5) continue;
        marker.trailEnd = [endX, endY];
        context.globalAlpha = (.25 + .75 * index / (history.length - 1)) * (highlighted ? .96 : .75);
        drawLine(context, [startX, startY], marker.trailEnd);
      }
    }
  }

  function historyTail(marker, report) {
    const { longitude, latitude } = report.location;
    const [x, y] = projector([longitude, latitude]);
    return artworkAnchor(x, y, report.track ?? marker.motion.report.track,
      marker.artWidth, marker.artHeight, marker.sprite?.tail);
  }

  function drawDestinations() {
    if (!projector || element.hidden) return;
    let context;
    for (const marker of markers.values()) {
      if (marker.clustered || (!marker.showDestination && !marker.trailEnd)) continue;
      context ??= clearOverlay(destinations);
      if (!context) return;
      const highlighted = marker.key === selected;
      if (marker.trailEnd && marker.tail && Math.hypot(
        marker.tail[0] - marker.trailEnd[0], marker.tail[1] - marker.trailEnd[1],
      ) < marker.artWidth + 35) {
        context.lineWidth = highlighted ? 2.6 : 1.65;
        context.globalAlpha = highlighted ? .96 : .75;
        context.setLineDash([]);
        drawLine(context, marker.trailEnd, marker.tail);
      }
      if (marker.showDestination) {
        context.lineWidth = highlighted ? 1.6 : 1.1;
        context.globalAlpha = highlighted ? .83 : .53;
        context.setLineDash([6, 5]);
        drawLine(context, marker.nose, clipDestinationLine(marker.nose, marker.destinationEnd, width, height));
      }
    }
    if (routesDrawn && !context) clearOverlay(destinations);
    routesDrawn = Boolean(context);
  }

  function drawLine(context, start, end) {
    context.beginPath();
    context.moveTo(...start);
    context.lineTo(...end);
    context.stroke();
  }

  function clearOverlay(canvas) {
    if (!projector || element.hidden) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const scale = Math.min(2, devicePixelRatio);
    const pixelsWide = Math.round(width * scale);
    const pixelsHigh = Math.round(height * scale);
    if (canvas.width !== pixelsWide) canvas.width = pixelsWide;
    if (canvas.height !== pixelsHigh) canvas.height = pixelsHigh;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, width, height);
    if (overlayColor) context.strokeStyle = overlayColor;
    return context;
  }

  function show(entries) {
    const remaining = new Set(markers.keys());
    const seen = new Set();
    const now = Date.now();
    for (const entry of entries) {
      const key = mapAircraftKey(entry.item);
      if (seen.has(key)) continue;
      seen.add(key);
      remaining.delete(key);
      const marker = markers.get(key) ?? addMarker(key);
      marker.entry = entry;
      const callsign = flightReferenceCallsign(entry.item);
      if (marker.callsign !== callsign) {
        marker.callsign = callsign;
        marker.lookedUpRoute = false;
        marker.route = undefined;
      }
      marker.destination = entry.details?.destination ?? entry.item.knownDestination ??
        (marker.route?.expiresAt > now ? marker.route.destination : undefined);
      marker.motion = updateMapMotion(marker.motion, entry, now);
      scaleMarker(marker);
      updateArtwork(marker);
      paintSprite(marker);
    }
    for (const key of remaining) {
      markers.get(key).node.remove();
      markers.delete(key);
    }
    refresh();
    queueRoutes();
  }

  function addMarker(key) {
    const node = document.createElement(onSelect ? "button" : "span");
    node.className = "live-map-marker";
    node.dataset.aircraft = key;
    if (onSelect) {
      node.type = "button";
      node.addEventListener("click", () => onSelect(key));
      node.addEventListener("focus", () => redraw());
      node.addEventListener("blur", () => redraw());
    } else {
      node.setAttribute("role", "img");
    }
    const image = document.createElement("img");
    image.alt = "";
    image.hidden = true;
    const label = document.createElement("span");
    label.className = "live-map-marker-label";
    label.setAttribute("aria-hidden", "true");
    node.append(image, label);
    markerLayer.append(node);
    const marker = { key, node, image, label };
    measureMarker(marker);
    image.addEventListener("load", () => {
      measureMarker(marker);
      redrawMap();
    });
    markers.set(key, marker);
    return marker;
  }

  function paintSprite({ node, image, sprite }) {
    const visible = Boolean(sprite && node.hasAttribute("data-track"));
    if (visible && image.getAttribute("src") !== sprite.src) image.src = sprite.src;
    image.hidden = !visible;
    node.toggleAttribute("data-sprite", visible);
  }

  function updateArtwork(marker) {
    const { item, details } = marker.entry;
    const lookup = JSON.stringify([item.hex, item.r, item.t, item.category, item.flight, item.desc, details?.illustrationId]);
    if (marker.lookup === lookup) return;
    marker.lookup = lookup;
    marker.sprite = undefined;
    marker.model = undefined;
    const operator = details?.operatorIcao ?? /^([A-Z]{3})\d/.exec(String(item.flight ?? "").trim().toUpperCase())?.[1];
    void (async () => {
      const identity = await catalogAircraft(item);
      if (details?.illustrationId) identity.illustrationId = details.illustrationId;
      const image = await aircraftImage(identity, operator);
      if (markers.get(marker.key) !== marker || marker.lookup !== lookup) return;
      marker.identity = identity;
      marker.model = details?.model || identity.model || item.desc || identity.icaoType;
      marker.sprite = image ? sprite(image) : undefined;
      scaleMarker(marker);
      paintSprite(marker);
      labelMarker(marker);
    })().catch(() => {
      if (marker.lookup === lookup) marker.lookup = undefined;
    });
  }

  function select(key) {
    if (selected === key) return;
    selected = key;
    refresh();
  }

  function labelMarker(marker) {
    const callsign = identifier(marker.entry.item);
    setText(marker.label, callsign);
    marker.node.setAttribute("aria-label", [callsign, marker.model].filter(Boolean).join(" · "));
  }

  function refresh() {
    for (const marker of markers.values()) {
      const active = marker.key === selected;
      marker.node.toggleAttribute("data-selected", active);
      if (onSelect) marker.node.setAttribute("aria-pressed", active);
      labelMarker(marker);
    }
    if (close) close.setAttribute("aria-label", t("Clear aircraft selection"));
    details.show(markers.get(selected));
    layoutClusters();
    redrawMap();
  }

  function queueRoutes() {
    if (lookupTimer !== undefined || lookupController || element.hidden) return;
    if (nextRouteMarker()) lookupTimer = setTimeout(lookupNextRoute, routeLookupSpacingMs);
  }

  function nextRouteMarker() {
    return [...markers.values()].find(marker =>
      marker.callsign && Number.isFinite(marker.entry.observedAt) && !marker.lookedUpRoute && !hasCoordinates(marker.destination));
  }

  async function lookupNextRoute() {
    lookupTimer = undefined;
    const marker = nextRouteMarker();
    if (!marker || element.hidden) return;
    const callsign = marker.callsign;
    const request = new AbortController();
    lookupController = request;
    marker.lookedUpRoute = true;
    try {
      const destination = await callsignDestination(callsign, request.signal);
      if (request.signal.aborted || markers.get(marker.key) !== marker || marker.callsign !== callsign || !hasCoordinates(destination)) return;
      marker.route = { destination, expiresAt: Date.now() + routeLifetimeMs };
      marker.destination = destination;
      redraw();
    } finally {
      if (lookupController === request) {
        lookupController = undefined;
        queueRoutes();
      }
    }
  }

  function layoutClusters() {
    const remaining = new Set(clusters.keys());
    const grouped = new Set();
    if (projector && !element.hidden) {
      const points = [...markers.values()].filter(marker => marker.key !== selected && isOnGround(marker.entry.item)).map(marker => {
        const { lon, lat } = marker.entry.item;
        const [x, y] = projector([lon, lat]);
        return { marker, x, y };
      });
      for (const group of groupGroundAircraft(points)) {
        const members = group.map(({ marker }) => marker);
        for (const marker of members) grouped.add(marker);
        const key = JSON.stringify(members.map(marker => marker.key).sort());
        const cluster = clusters.get(key) ?? createCluster(members);
        clusters.set(key, cluster);
        (cluster.firstElementChild ?? cluster).setAttribute("aria-label", t("{count} aircraft on the ground", { count: members.length }));
        remaining.delete(key);
        const x = group.reduce((sum, point) => sum + point.x, 0) / group.length;
        const y = group.reduce((sum, point) => sum + point.y, 0) / group.length;
        const left = Math.max(22, Math.min(width - 22, x));
        cluster.style.left = left + "px";
        cluster.style.top = Math.max(22, Math.min(height - 22, y)) + "px";
        cluster.toggleAttribute("data-menu-above", y > height * .68);
        cluster.style.setProperty("--cluster-menu-x", Math.max(86, Math.min(width - 86, x)) - left + "px");
      }
    }
    for (const key of remaining) {
      clusters.get(key).remove();
      clusters.delete(key);
    }
    for (const marker of markers.values()) {
      marker.clustered = grouped.has(marker);
      marker.node.toggleAttribute("data-clustered", marker.clustered);
    }
  }

  function createCluster(members) {
    const cluster = document.createElement(onSelect ? "details" : "span");
    cluster.className = "live-map-cluster";
    const label = onSelect ? document.createElement("summary") : cluster;
    label.textContent = members.length;
    if (onSelect) {
      const list = document.createElement("div");
      list.className = "live-map-cluster-list";
      for (const marker of members) {
        const choice = document.createElement("button");
        choice.type = "button";
        choice.textContent = identifier(marker.entry.item);
        choice.addEventListener("click", () => {
          cluster.open = false;
          onSelect(marker.key);
        });
        list.append(choice);
      }
      cluster.append(label, list);
    }
    markerLayer.append(cluster);
    return cluster;
  }

  return { hide, refresh, select, setArea, setTheme, show };
}

function createMapDetails(footer, cardTemplate, getMotion, showDestination) {
  const list = footer.querySelector(".live-map-details");
  const status = footer.querySelector(".live-map-detail-status");
  let marker, card, presentation, latestEntry, controller;
  let ready = false;

  function show(nextMarker) {
    if (marker !== nextMarker) {
      controller?.abort();
      marker = nextMarker;
      controller = undefined;
      latestEntry = undefined;
      ready = false;
      list.hidden = true;
      footer.hidden = !marker;
      if (!marker) return;
      presentation = createAircraftPresentation();
      card = createFlightCard(cardTemplate, getMotion);
      card.element.dataset.primary = "";
      localize(card.element);
      list.replaceChildren(card.element);
      status.hidden = false;
      setMessage(status, "Loading aircraft details…");
    }
    if (!marker) return;
    if (ready) paint();
    if (!controller && marker.entry !== latestEntry) void update(marker.entry);
  }

  async function update(entry) {
    latestEntry = entry;
    const request = new AbortController();
    controller = request;
    try {
      await presentation.update(entry, request.signal);
      if (request.signal.aborted) return;
      ready = true;
      status.hidden = true;
      list.hidden = false;
      paint();
      showDestination(marker, entry, presentation.view.destination);
    } catch {
      if (!request.signal.aborted && !ready) setMessage(status, "Flight data unavailable.");
    } finally {
      if (controller === request) {
        controller = undefined;
        if (marker.entry !== entry) void update(marker.entry);
      }
    }
  }

  function paint() {
    card.paint(presentation.view);
    fitFlightCards(list, card.alignRoute);
  }

  return { show, alignRoute: () => { if (marker && ready) fitFlightCards(list, card.alignRoute); } };
}

function identifier({ flight, r, hex }) {
  return [flight, r, hex].find(value => typeof value === "string" && value.trim())?.trim() ?? t("Unknown aircraft");
}

function setText(element, value) {
  if (element.textContent !== value) element.textContent = value;
}

function sprite(image) {
  const key = image.src;
  if (spriteCache.has(key)) return spriteCache.get(key);
  const bounds = measureArtwork(image, 0);
  if (!bounds) return { src: image.src };
  const [left, top, right, bottom] = bounds.crop;
  const width = (right - left) * image.naturalWidth;
  const height = (bottom - top) * image.naturalHeight;
  const scale = Math.min(1, 320 / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d");
  if (!context) return { src: image.src };
  context.drawImage(image, left * image.naturalWidth, top * image.naturalHeight, width, height, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const data = { src: canvas.toDataURL("image/webp", .9), ...artworkEndpoints(pixels, canvas.width, canvas.height) };
  spriteCache.set(key, data);
  return data;
}
