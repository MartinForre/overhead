import { formatClock, setMessage, t } from "./display-formats.js";
import { updateTrackQueue } from "./settings-client.js";
import { isCallsignSelection, maxTrackedFlights, normalizeCallsign, normalizeFlightNumber } from "./settings-schema.js";

export function flightDate(timestamp, timezone, options) {
  return formatClock(timestamp, { ...options, timeZone: timezone || "UTC" });
}

export function bindTrackSettings(container) {
  container.innerHTML = `
    <form class="track-search">
      <label><span data-track-input-label>Flight number or callsign</span>
        <input name="number" maxlength="12" placeholder="SK588" autocomplete="off" autocapitalize="characters" required>
      </label>
      <button type="submit" class="button primary">Find callsign</button>
    </form>
    <p class="track-settings-status" data-track-hint>Live callsign tracking starts when adsb.fi receives the broadcast.</p>
    <button type="button" class="button" data-cancel-replacement data-i18n hidden>Cancel replacement</button>
    <p class="track-settings-status" role="status"></p>
    <ul class="track-results" aria-label="Matching departures" data-i18n-label hidden></ul>
    <h3 class="track-queue-title" data-i18n>Tracked flights</h3>
    <ul class="track-queue" aria-label="Tracked flights" data-i18n-label></ul>
  `;
  const form = container.querySelector("form");
  const input = form.elements.number;
  const findButton = form.querySelector("button");
  const inputLabel = form.querySelector("[data-track-input-label]");
  const hint = container.querySelector("[data-track-hint]");
  const cancelReplacement = container.querySelector("[data-cancel-replacement]");
  const status = container.querySelector("[role=status]");
  const results = container.querySelector(".track-results");
  const queueList = container.querySelector(".track-queue");
  let queue = [];
  let matches = [];
  let searching = false;
  let writing = false;
  let provider = "adsb-fi";
  let replaceId;

  cancelReplacement.addEventListener("click", () => {
    replaceId = undefined;
    matches = [];
    setMessage(status, "");
    render();
    input.focus();
  });

  function flightRow({ id, number, origin, destination, departure, timezone, callsign, aircraftHex }, action, text) {
    const row = document.createElement("li");
    const identity = document.createElement("div");
    const title = document.createElement("strong");
    const details = document.createElement("span");
    title.textContent = [number, [origin, destination].filter(Boolean).join(" → ")].filter(Boolean).join(" · ");
    details.textContent = aircraftHex ? t("ADS-B aircraft") : callsign ?? flightDate(departure, timezone, {
      weekday: "short", month: "short", day: "numeric", timeZoneName: "short",
    });
    identity.append(title, details);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "button";
    button.textContent = t(text);
    button.setAttribute("aria-label", `${button.textContent} ${title.textContent}, ${details.textContent}`);
    button.disabled = !action || writing;
    if (action) button.addEventListener("click", () => void changeQueue(action, id, number));
    const actions = document.createElement("div");
    actions.className = "track-row-actions";
    if (callsign && !aircraftHex && provider === "flightaware" && action === "remove") {
      const choose = document.createElement("button");
      choose.type = "button";
      choose.className = "button";
      choose.textContent = t("Choose departure");
      choose.setAttribute("aria-label", t("Choose departure for {number}", { number }));
      choose.disabled = searching || writing;
      choose.addEventListener("click", () => {
        replaceId = id;
        input.value = number;
        matches = [];
        setMessage(status, "Find the dated departure for {number}.", { number });
        render();
        input.focus();
      });
      actions.append(choose);
    }
    actions.append(button);
    row.append(identity, actions);
    return row;
  }

  function render() {
    const full = queue.length >= maxTrackedFlights;
    const atCapacity = full && !replaceId;
    findButton.disabled = atCapacity || searching || writing;
    findButton.textContent = t(provider === "flightaware" ? "Find flights" : "Find callsign");
    inputLabel.textContent = t(provider === "flightaware" ? "Flight number" : "Flight number or callsign");
    hint.hidden = provider === "flightaware" && !replaceId;
    hint.textContent = replaceId ? t("Choose a departure to replace the {number} callsign watch.", {
      number: queue.find(flight => flight.id === replaceId)?.number,
    }) : t("Live callsign tracking starts when adsb.fi receives the broadcast.");
    cancelReplacement.hidden = !replaceId;
    cancelReplacement.disabled = searching || writing;
    results.replaceChildren(...matches.map(flight => {
      const queued = queue.some(item => item.id === flight.id);
      return flightRow({
        id: flight.id, number: flight.number, callsign: flight.callsign, origin: flight.origin?.code, destination: flight.destination?.code,
        departure: flight.scheduledDeparture ?? flight.estimatedDeparture ?? flight.departed ?? flight.takeoff,
        timezone: flight.origin?.timezone,
      }, queued || atCapacity ? null : "add", queued ? "Added" : replaceId ? "Replace watch" : flight.callsign ? "Watch" : "Track");
    }));
    results.hidden = matches.length === 0;
    queueList.replaceChildren(...queue.map(flight => flightRow(flight, "remove", "Remove")));
  }

  function applyQueue(next, nextProvider = provider, formatsChanged = false) {
    if (nextProvider !== provider) {
      provider = nextProvider;
      matches = [];
      replaceId = undefined;
      setMessage(status, "");
    } else if (!formatsChanged && next.length === queue.length && next.every((flight, index) => flight.id === queue[index].id)) {
      return;
    }
    queue = next;
    if (replaceId && !queue.some(flight => flight.id === replaceId && isCallsignSelection(flight))) replaceId = undefined;
    render();
  }

  async function changeQueue(action, id, number) {
    const previousQueue = queue;
    const replacement = action === "add" ? replaceId : undefined;
    writing = true;
    setMessage(status, "");
    render();
    try {
      const settings = await updateTrackQueue(action, id, number, replacement);
      if (queue === previousQueue) applyQueue(settings.trackedFlights, settings.trackProvider);
      if (replacement) {
        replaceId = undefined;
        matches = [];
      }
      setMessage(status, action === "add"
        ? queue.length === maxTrackedFlights ? "3 flights tracked. Remove one to add another." : "Flight added."
        : "Flight removed.");
    } catch (error) {
      setMessage(status, error.message);
    } finally {
      writing = false;
      render();
      (findButton.disabled ? queueList.querySelector("button") : input)?.focus();
    }
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (findButton.disabled) return;

    const number = normalizeFlightNumber(input.value) || (provider === "adsb-fi" ? normalizeCallsign(input.value) : "");
    if (!number) {
      setMessage(status, provider === "flightaware" ? "Enter a flight number such as SK588."
        : "Enter a flight number or callsign such as SAS588.");
      input.focus();
      return;
    }
    searching = true;
    matches = [];
    const searchProvider = provider;
    setMessage(status, provider === "flightaware" ? "Finding departures…" : "Finding callsign…");
    render();
    try {
      const response = await fetch("/api/track/search?" + new URLSearchParams({ number }), { signal: AbortSignal.timeout(12000) });
      const body = await response.json();
      if (searchProvider !== provider) return;
      if (!response.ok) throw new Error(body.error ?? "Flight lookup is unavailable.");
      if (!Array.isArray(body.flights)) throw new Error("Flight lookup is unavailable.");
      matches = body.flights;
      setMessage(status, matches.length ? "" : "No current or upcoming departures found.");
    } catch (error) {
      if (searchProvider === provider) {
        setMessage(status, error.name === "TimeoutError" ? "Flight lookup timed out. Try again." : error.message);
      }
    } finally {
      searching = false;
      render();
    }
  });

  return applyQueue;
}
