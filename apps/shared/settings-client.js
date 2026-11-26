const settingsPath = "/api/settings";
let pendingWrite = Promise.resolve();

export function saveSettings(patch) {
  return queueWrite(settingsPath, "PATCH", patch);
}

export function stepGallery(direction) {
  return queueWrite("/api/gallery/step", "POST", { direction });
}

export function setTrafficPreview(mode) {
  return queueWrite("/api/traffic-preview", "POST", { mode });
}

export function selectMapAircraft(aircraft) {
  return queueWrite("/api/map/selection", "POST", { aircraft });
}

export function updateTrackQueue(action, id, number, replaceId) {
  return queueWrite("/api/track/queue", "POST", { action, id, number, replaceId });
}

export function trackLiveAircraft({ aircraftHex, callsign, number }) {
  return queueWrite("/api/track/queue", "POST", {
    action: "add-live", hex: aircraftHex, callsign, registration: number,
  });
}

export function importSettings(patch) {
  return queueWrite(settingsPath + "/migrate", "POST", patch);
}

function queueWrite(path, method, data) {
  const result = pendingWrite.then(async () => {
    let response;
    try {
      response = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new Error("Couldn’t reach the display. Try again.");
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error ?? "The display couldn’t apply the change.");
    }
    if (path === "/api/track/queue") return response.json();
  });
  pendingWrite = result.catch(() => {});
  return result;
}

export function connectSettings({ onSettings, onConnection, onGalleryStep }) {
  const events = new EventSource(settingsPath + "/events");
  events.addEventListener("settings", (event) => {
    onSettings(JSON.parse(event.data));
    onConnection?.(true);
  });
  events.addEventListener("error", () => onConnection?.(false));
  if (onGalleryStep) {
    events.addEventListener("gallery-step", (event) => onGalleryStep(JSON.parse(event.data)));
  }
}
