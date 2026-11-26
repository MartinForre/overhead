import { localize, t } from "../display-formats.js";
import { createFlightCard, placeAircraftScenery } from "./flight-card.js";
import { fitFlightCards, flightCardOrder } from "./flight-layout.js";
import { animateCompass, animateReadouts, compassChanged, playMotion } from "./flight-readout-motion.js";

const readoutDuration = 420;
const helicopterForwardTilt = -8; // The artwork faces left, so a negative rotation lowers the nose.

export function createFlightBoard(list, cardTemplate, setStatus, getMotion, onTrackAircraft) {
  const host = list.parentElement;
  const sceneryLayer = document.createElement("div");
  sceneryLayer.className = "flight-scenery-layer";
  sceneryLayer.setAttribute("aria-hidden", "true");
  host.append(sceneryLayer);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const slots = [];
  let current;
  let pending;
  let active;

  function paint(snapshot) {
    setStatus(snapshot.status);
    while (slots.length > snapshot.items.length) {
      const slot = slots.pop();
      slot.element.remove();
      slot.scenery.forEach(retireScenery);
    }
    while (slots.length < snapshot.items.length) {
      const slot = createFlightCard(cardTemplate, getMotion);
      localize(slot.element);
      if (onTrackAircraft) {
        const button = document.createElement("button");
        button.className = "sr-only flight-track-action";
        button.type = "button";
        slot.element.append(button);
        slot.trackButton = button;
        slot.element.addEventListener("click", () => {
          if (slot.trackFlight) onTrackAircraft(slot.trackFlight);
        });
      }
      slots.push(slot);
      list.append(slot.element);
      sceneryLayer.append(...slot.scenery);
    }
    for (const [index, item] of snapshot.items.entries()) {
      const slot = slots[index];
      slot.element.toggleAttribute("data-primary", item.primary);
      if (slot.trackButton) {
        slot.trackFlight = item.trackFlight;
        slot.trackButton.hidden = !item.trackFlight;
        if (item.trackFlight) slot.trackButton.textContent = t("Track {number}", { number: item.trackFlight.number });
      }
      slot.paint(item.view);
    }
    const count = String(slots.length);
    if (list.dataset.count !== count) list.dataset.count = count;
    list.toggleAttribute("hidden", slots.length === 0);
    layoutCards();
  }

  function layoutCards() {
    fitFlightCards(list, () => {
      for (const slot of slots) slot.alignRoute();
    });
    placeAircraftScenery(host, slots);
  }

  function cleanup(run) {
    run.layer?.remove();
    for (const slot of slots) {
      slot.art.removeAttribute("data-airborne");
      slot.element.querySelectorAll("[data-motion-value]").forEach(element => element.removeAttribute("data-motion-value"));
      slot.element.querySelectorAll(".flight-value-overlay").forEach(element => element.remove());
    }
    list.removeAttribute("data-in-transition");
  }

  function cancel() {
    if (!active) return;
    const run = active;
    active = undefined;
    run.controller.abort();
    cleanup(run);
  }

  function reset(status = "", { fadeScenery = false } = {}) {
    cancel();
    current = undefined;
    pending = undefined;
    if (!fadeScenery) sceneryLayer.replaceChildren();
    paint({ items: [], status });
  }

  function show(ranked, status = "") {
    const items = flightCardOrder(ranked.map((item, index) => ({ ...item, primary: index === 0 })));
    pending = { items, status };
    if (!active) void advance();
  }

  async function advance() {
    if (active || !pending) return;
    const next = pending;
    pending = undefined;
    const before = current;
    const settings = getMotion();
    const sameSlots = before?.items.length === next.items.length &&
      next.items.every((item, index) => item.key === before.items[index].key);
    if (!before || !settings.transfer || reducedMotion.matches || document.hidden ||
      typeof Element.prototype.animate !== "function" ||
      (sameSlots && !next.items.some((item, index) => compassChanged(before.items[index].view, item.view)))) {
      paint(next);
      current = next;
      return;
    }

    const controller = new AbortController();
    const run = { controller, signal: controller.signal, next, host };
    active = run;
    try {
      if (sameSlots) {
        paint(next);
        await Promise.all(slots.map((slot, index) =>
          animateCompass(slot, before.items[index].view, next.items[index].view, 0, readoutDuration, run.signal)));
      } else {
        await handoff(before, next, settings, run);
      }
    } catch (error) {
      console.error("Aircraft transition failed", error);
      controller.abort();
    } finally {
      if (active === run) {
        cleanup(run);
        paint(next);
        current = next;
        active = undefined;
        void advance();
      }
    }
  }

  async function handoff(before, next, settings, run) {
    const originals = new Map();
    for (const [index, item] of before.items.entries()) {
      const artwork = captureArtwork(slots[index].art);
      if (artwork) originals.set(item.key, artwork);
    }

    const nextKeys = new Set(next.items.map(item => item.key));
    const departures = before.items.filter(item => !nextKeys.has(item.key) && originals.has(item.key));
    await Promise.all(departures.map(item => {
      const artwork = originals.get(item.key);
      const { aircraft, rect, tilt } = artwork;
      const exitTilt = item.view.isHelicopter ? helicopterForwardTilt : tilt;
      aircraft.parentElement.dataset.airborne = "";
      return fly(run, artwork, rect, "exit", [
        { transform: `translateX(0px) rotate(${tilt}deg)` },
        { transform: `translateX(${-rect.right - 24}px) rotate(${exitTilt}deg)` },
      ], settings.exit, settings.easing.exit);
    }));
    if (run.signal.aborted) return;

    list.dataset.inTransition = "";
    paint(next);
    const jobs = next.items.map((item, index) => {
      const slot = slots[index];
      const artwork = captureArtwork(slot.art);
      const original = originals.get(item.key);
      const previous = before.items[index];
      const phase = !artwork ? null : !original ? "enter" : moved(original.rect, artwork.rect) ? "transfer" : null;
      slot.art.toggleAttribute("data-airborne", Boolean(phase));
      return { slot, artwork, original, phase, previous, item };
    });
    const transfers = jobs.filter(job => job.phase === "transfer");
    const transferTime = transfers.length ? settings.transfer : 0;
    const readings = jobs.map(job => {
      const duration = job.phase ? settings[job.phase] : readoutDuration;
      const delay = (job.phase === "enter" ? transferTime : 0) + Math.max(0, duration - readoutDuration);
      const animate = job.previous && job.previous.key !== job.item.key ? animateReadouts : animateCompass;
      return animate(job.slot, job.previous?.view, job.item.view, delay, Math.min(readoutDuration, duration), run.signal);
    });

    const movement = async () => {
      await Promise.all(transfers.map(job => transfer(run, job, settings)));
      if (run.signal.aborted) return;
      await Promise.all(jobs.filter(job => job.phase === "enter").map(async job => {
        const { rect, tilt } = job.artwork;
        const entryTilt = job.item.view.isHelicopter ? helicopterForwardTilt : tilt;
        await fly(run, job.artwork, rect, "enter", [
          { transform: `translateX(${window.innerWidth - rect.left + 24}px) rotate(${entryTilt}deg)` },
          { transform: `translateX(0px) rotate(${tilt}deg)` },
        ], settings.enter, settings.easing.enter);
        if (!run.signal.aborted) job.slot.art.removeAttribute("data-airborne");
      }));
    };
    await Promise.all([movement(), ...readings]);
  }

  function settleLatest() {
    if (!active) return;
    const latest = pending ?? active.next;
    cancel();
    pending = undefined;
    paint(latest);
    current = latest;
  }

  new ResizeObserver(layoutCards).observe(list);
  window.addEventListener("resize", () => {
    if (active) settleLatest();
    else layoutCards();
  });
  reducedMotion.addEventListener("change", settleLatest);
  document.addEventListener("visibilitychange", () => { if (document.hidden) settleLatest(); });

  function refreshPresentation() {
    if (active) settleLatest();
    else if (current) paint(current);
  }

  return { show, reset, refreshPresentation };
}

function retireScenery(layer) {
  layer.hidden = true;
  const animations = layer.getAnimations?.() ?? [];
  if (!animations.length) {
    layer.remove();
    return;
  }
  void Promise.allSettled(animations.map(animation => animation.finished)).then(() => layer.remove());
}

function captureArtwork(art) {
  const aircraft = art.firstElementChild;
  if (aircraft) return {
    aircraft,
    rect: art.getBoundingClientRect(),
    tilt: parseFloat(getComputedStyle(aircraft).rotate) || 0,
    gearDown: aircraft.hasAttribute("data-gear-down"),
  };
}

function moved(from, to) {
  return ["left", "top", "width", "height"].some(property => Math.abs(from[property] - to[property]) > 1);
}

async function transfer(run, job, settings) {
  const { original, artwork } = job;
  const { rect: to, tilt } = artwork;
  const from = original.rect;
  const dx = to.left + (to.width - from.width) / 2 - from.left;
  const dy = to.top + (to.height - from.height) / 2 - from.top;
  const direction = job.item.view.isHelicopter || Math.abs(dy) < 6 ? 0 : Math.sign(dy);
  const lane = direction * Math.min(90, window.innerWidth * 0.12);
  const widthRatio = to.width / from.width;
  const heightRatio = to.height / from.height;
  const tiltChange = tilt - original.tilt;
  await fly(run, artwork, from, "transfer", [
    { transform: `translate(0px, 0px) rotate(${original.tilt}deg) scale(1, 1)` },
    { offset: 0.30, transform: `translate(${dx * 0.30 + lane}px, ${dy * 0.34}px) rotate(${original.tilt + tiltChange * 0.30 - direction * 12}deg) scale(${1 + (widthRatio - 1) * 0.28}, ${1 + (heightRatio - 1) * 0.28})` },
    { offset: 0.68, transform: `translate(${dx * 0.73 + lane * 0.7}px, ${dy * 0.75}px) rotate(${original.tilt + tiltChange * 0.68 - direction * 6}deg) scale(${1 + (widthRatio - 1) * 0.73}, ${1 + (heightRatio - 1) * 0.73})` },
    { transform: `translate(${dx}px, ${dy}px) rotate(${tilt}deg) scale(${widthRatio}, ${heightRatio})` },
  ], settings.transfer, settings.easing.transfer, original.gearDown);
  if (!run.signal.aborted) job.slot.art.removeAttribute("data-airborne");
}

async function fly(run, { aircraft, gearDown }, rect, phase, frames, duration, easing, initialGearDown = gearDown) {
  if (run.signal.aborted || !rect.width || !rect.height) return;
  if (!run.layer) {
    run.layer = document.createElement("div");
    run.layer.className = "flight-motion-layer";
    run.layer.setAttribute("aria-hidden", "true");
    run.host.append(run.layer);
  }
  const copy = aircraft.cloneNode(true);
  copy.dataset.phase = phase;
  copy.toggleAttribute("data-gear-down", initialGearDown);
  Object.assign(copy.style, {
    left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
  });
  run.layer.append(copy);
  if (initialGearDown !== gearDown) {
    // Establish the starting pose before the style change triggers a transition on the overlay.
    copy.getBoundingClientRect();
    copy.toggleAttribute("data-gear-down", gearDown);
  }
  try {
    await playMotion(copy, frames, { duration, easing }, run.signal);
  } finally {
    copy.remove();
  }
}
