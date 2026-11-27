import { readFile, rename, writeFile } from "node:fs/promises";
import { createFlightTracker } from "../adsb/tracked-flights.mjs";
import { callsignSelection, createCallsignTracker } from "../adsb/callsign-tracker.mjs";
import { trackedAltimeter } from "../adsb/metar.mjs";
import {
  defaultSettings, isCallsignSelection, isFlightId, isLiveAircraftSelection, isMapAircraftKey, isSettingsObject,
  isValidSetting, liveAircraftSelection, maxTrackedFlights, normalizeFlightNumber, sameLocation, trackMapAircraftKey,
} from "../shared/settings-schema.js";

const settingsPath = "/api/settings";
const trafficPreviewModes = new Set(["0", "1", "2", "3", "alaska", "airwolf", "top-gun", "concorde", "gear", "handoff"]);
const maxBodyBytes = 8 * 1024;
const routes = new Map([
  [settingsPath, ["GET", "PATCH"]],
  [settingsPath + "/events", ["GET"]],
  [settingsPath + "/migrate", ["POST"]],
  ["/api/gallery/step", ["POST"]],
  ["/api/traffic-preview", ["POST"]],
  ["/api/map/selection", ["POST"]],
  ["/api/track/search", ["GET"]],
  ["/api/track/status", ["GET"]],
  ["/api/track/queue", ["POST"]],
]);

export function createSettingsApi(configPath, tracker = createFlightTracker(), callsigns = createCallsignTracker()) {
  const clients = new Set();
  const trackProvider = tracker.configured ? "flightaware" : "adsb-fi";
  const temporaryPath = configPath + ".tmp";
  let storedSettings;
  let trafficPreview = null;
  let mapAircraft = null;
  let pending = Promise.resolve();

  // Serialize reads and edits so each patch merges with the latest saved values.
  function withSettings(operation) {
    const result = pending.then(async () => {
      storedSettings ??= await readSettings(configPath);
      return operation();
    });
    pending = result.catch(() => {});
    return result;
  }

  function snapshot() {
    return { ...defaultSettings, ...storedSettings, trackProvider, trafficPreview, mapAircraft };
  }

  async function trackedStatus(flight) {
    const callsignWatch = isCallsignSelection(flight);
    if (callsignWatch && tracker.configured) return { ...flight, state: "choose-departure" };
    if (!callsignWatch && !isLiveAircraftSelection(flight)) {
      return tracker.configured ? tracker.status(flight) : { id: flight.id, number: flight.number, state: "key-required" };
    }
    const status = await callsigns.status(flight);
    if (status.position?.ground || !Number.isFinite(status.position?.pressureAltitude)) return status;
    return { ...status, altimeter: await trackedAltimeter(status.position) };
  }

  function broadcast(event, data) {
    const message = eventMessage(event, data);
    for (const client of clients) client.write(message);
  }

  async function applyPatch(patch, migration) {
    const nextSettings = { ...storedSettings };
    let changed = false;
    for (const [key, value] of Object.entries(patch)) {
      const exists = Object.hasOwn(storedSettings, key);
      if (migration && exists) continue;
      if (exists && (key === "location" ? sameLocation(storedSettings[key], value) : storedSettings[key] === value)) continue;
      nextSettings[key] = value;
      changed = true;
    }

    if (changed) {
      const before = snapshot();
      const after = { ...defaultSettings, ...nextSettings };
      const changedMapScope = before.mode !== after.mode ||
        (after.mode === "live" && (before.liveView !== after.liveView || before.radiusKm !== after.radiusKm ||
          !sameLocation(before.location, after.location))) ||
        (after.mode === "track" && (before.trackView !== after.trackView ||
          (mapAircraft && !after.trackedFlights.some(flight => trackMapAircraftKey(flight.id) === mapAircraft))));
      await writeFile(temporaryPath, JSON.stringify(nextSettings, null, 2) + "\n", { mode: 0o600 });
      await rename(temporaryPath, configPath);
      storedSettings = nextSettings;
      if ((storedSettings.mode ?? defaultSettings.mode) !== "live") trafficPreview = null;
      if (changedMapScope) mapAircraft = null;
      broadcast("settings", snapshot());
    }
    return snapshot();
  }

  return async function settingsApi(request, response, next) {
    const [pathname, query] = request.url.split("?", 2);
    const methods = routes.get(pathname);
    if (!methods) return next();

    try {
      response.setHeader("Cache-Control", "no-store");
      if (!isSameOrigin(request)) throw new HttpError(403, "Use the same origin as the display.");
      if (!methods.includes(request.method)) {
        response.setHeader("Allow", methods.join(", "));
        throw new HttpError(405, "Method not allowed.");
      }

      if (pathname === "/api/track/search") {
        const number = new URLSearchParams(query).get("number");
        if (tracker.configured) {
          return sendJson(response, 200, { flights: await tracker.search(normalizeFlightNumber(number)) });
        }
        const selection = callsignSelection(number);
        if (!selection) throw new HttpError(400, "Enter a broadcast callsign such as SAS588.");
        return sendJson(response, 200, { flights: [selection] });
      }
      if (pathname === "/api/track/status") {
        const selections = await withSettings(() => snapshot().mode === "track" ? snapshot().trackedFlights : []);
        return sendJson(response, 200, { flights: await Promise.all(selections.map(trackedStatus)) });
      }
      if (request.method === "GET") {
        await withSettings(() => {
          if (response.destroyed) return;
          if (pathname === settingsPath) return sendJson(response, 200, snapshot());

          response.writeHead(200, {
            "Content-Type": "text/event-stream",
            "X-Accel-Buffering": "no",
          });
          response.write("retry: 1000\n" + eventMessage("settings", snapshot()));
          clients.add(response);
          const heartbeat = setInterval(() => response.write(": keepalive\n\n"), 20_000);
          response.on("close", () => {
            clearInterval(heartbeat);
            clients.delete(response);
          });
        });
        return;
      }

      const body = await readBody(request);
      if (pathname === "/api/track/queue") {
        const { id, action, replaceId } = body;
        if (action === "add-live") {
          const flight = liveAircraftSelection(body.hex, body.callsign, body.registration);
          if (!flight) throw new HttpError(400, "This aircraft does not have a trackable ADS-B address.");
          const result = await withSettings(async () => {
            const settings = snapshot();
            const queue = settings.trackedFlights;
            if (queue.some(item => item.id === flight.id)) return { ...settings, added: false };
            const watch = queue.find(item => item.callsign === flight.callsign && isCallsignSelection(item));
            const replaced = !watch && queue.length >= maxTrackedFlights ? queue[0].number : undefined;
            const next = watch ? queue.map(item => item === watch ? flight : item)
              : [...queue.slice(-(maxTrackedFlights - 1)), flight];
            return { ...await applyPatch({ trackedFlights: next }, false), added: true, replaced };
          });
          return sendJson(response, 200, result);
        }
        if (!isFlightId(id) || !["add", "remove"].includes(action)) throw new HttpError(400, "Choose a flight departure.");
        const settings = await withSettings(async () => {
          const queue = snapshot().trackedFlights;
          const exists = queue.some(flight => flight.id === id);
          if (action === "remove") {
            return exists ? applyPatch({ trackedFlights: queue.filter(flight => flight.id !== id) }, false) : snapshot();
          }
          if (replaceId !== undefined) {
            const watch = queue.find(flight => flight.id === replaceId);
            if (!tracker.configured || !isCallsignSelection(watch)) throw new HttpError(409, "This callsign watch is no longer available.");
            if (exists) throw new HttpError(409, "This departure is already tracked.");
          } else {
            if (exists) return snapshot();
            if (queue.length >= maxTrackedFlights) throw new HttpError(409, "Remove a flight before adding another.");
          }
          const flight = tracker.configured
            ? await tracker.selection(id, normalizeFlightNumber(body.number)) : callsignSelection(body.number);
          if (!flight || flight.id !== id) throw new HttpError(409, "Search again to find this flight.");
          const next = replaceId === undefined ? [...queue, flight] : queue.map(item => item.id === replaceId ? flight : item);
          return applyPatch({ trackedFlights: next }, false);
        });
        return sendJson(response, 200, settings);
      }
      if (pathname === "/api/gallery/step") {
        const { direction } = body;
        if (![-1, 1].includes(direction)) throw new HttpError(400, "Choose the previous or next aircraft.");
        await withSettings(() => {
          if (snapshot().mode !== "gallery") throw new HttpError(409, "Switch to Gallery first.");
          broadcast("gallery-step", direction);
          response.writeHead(204).end();
        });
        return;
      }
      if (pathname === "/api/traffic-preview") {
        const { mode } = body;
        if (!trafficPreviewModes.has(mode)) throw new HttpError(400, "Invalid display settings.");
        await withSettings(() => {
          if (snapshot().mode !== "live") throw new HttpError(409, "Switch to Live first.");
          trafficPreview = mode === "0" ? null : { mode, id: crypto.randomUUID() };
          mapAircraft = null;
          broadcast("settings", snapshot());
          response.writeHead(204).end();
        });
        return;
      }
      if (pathname === "/api/map/selection") {
        const { aircraft } = body;
        if (aircraft !== null && !isMapAircraftKey(aircraft)) throw new HttpError(400, "Invalid aircraft selection.");
        await withSettings(() => {
          const { mode, liveView, trackView, trackedFlights } = snapshot();
          const tracking = mode === "track" && trackView === "map";
          if (!tracking && (mode !== "live" || liveView !== "map")) throw new HttpError(409, "Switch to Map first.");
          const invalidScope = aircraft !== null && (tracking
            ? !trackedFlights.some(flight => trackMapAircraftKey(flight.id) === aircraft)
            : aircraft.startsWith("track:"));
          if (invalidScope) throw new HttpError(409, "This aircraft is no longer on the map.");
          if (mapAircraft !== aircraft) {
            mapAircraft = aircraft;
            broadcast("settings", snapshot());
          }
          response.writeHead(204).end();
        });
        return;
      }

      validatePatch(body);
      const settings = await withSettings(() => applyPatch(body, pathname.endsWith("/migrate")));
      sendJson(response, 200, settings);
    } catch (error) {
      if (!error.status) console.error("Overhead settings:", error);
      if (!response.headersSent && !response.destroyed) {
        sendJson(response, error.status ?? 500, { error: error.status ? error.message : "Settings could not be read or saved." });
      }
    }
  };
}

async function readSettings(path) {
  let contents;
  try {
    contents = await readFile(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }

  const settings = JSON.parse(contents);
  if (settings?.theme === "walnut-and-brass") settings.theme = defaultSettings.theme;
  if (!isSettingsObject(settings) || Object.entries(settings).some(([key, value]) => !isValidSetting(key, value))) {
    throw new Error("Invalid settings in " + path);
  }
  return settings;
}

function validatePatch(patch) {
  const entries = Object.entries(patch);
  if (!entries.length || entries.some(([key, value]) => key === "trackedFlights" || !isValidSetting(key, value))) {
    throw new HttpError(400, "Invalid display settings.");
  }
}

function isSameOrigin(request) {
  const { host, origin, "sec-fetch-site": fetchSite } = request.headers;
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return false;
  if (!origin) return true;
  return origin === "http://" + host || origin === "https://" + host;
}

async function readBody(request) {
  if (request.headers["content-type"]?.split(";")[0].trim() !== "application/json") {
    throw new HttpError(415, "Send settings as JSON.");
  }

  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes <= maxBodyBytes) chunks.push(chunk);
  }
  if (bytes > maxBodyBytes) throw new HttpError(413, "Settings request is too large.");

  try {
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (isSettingsObject(body)) return body;
  } catch {
    // Report malformed JSON the same way as an invalid JSON value.
  }
  throw new HttpError(400, "Send a JSON object.");
}

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function eventMessage(event, data) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
