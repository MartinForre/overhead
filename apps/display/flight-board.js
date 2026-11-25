import { createFlightCard } from "./flight-card.js";
import { flightMotionSettings } from "./flight-motion-settings.js";
import { animateCompass, animateReadouts, compassChanged, playMotion } from "./flight-readout-motion.js";

const readoutDuration = 420;

export function createFlightBoard(list, setStatus) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const slots = [];
  let current;
  let pending;
  let active;

  function paint(snapshot) {
    setStatus(snapshot.status);
    while (slots.length > snapshot.items.length) slots.pop().element.remove();
    while (slots.length < snapshot.items.length) {
      const slot = createFlightCard();
      slots.push(slot);
      list.append(slot.element);
    }
    for (const [index, item] of snapshot.items.entries()) {
      slots[index].element.toggleAttribute("data-primary", item.primary);
      slots[index].paint(item.view);
    }
    const count = String(slots.length);
    if (list.dataset.count !== count) list.dataset.count = count;
    list.toggleAttribute("hidden", slots.length === 0);
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

  function reset(status = "") {
    cancel();
    current = undefined;
    pending = undefined;
    paint({ items: [], status });
  }

  function show(ranked, status = "") {
    const items = ranked.map((item, index) => ({ ...item, primary: index === 0 }));
    if (items.length === 3) [items[0], items[1]] = [items[1], items[0]];
    pending = { items, status };
    if (!active) void advance();
  }

  async function advance() {
    if (active || !pending) return;
    const next = pending;
    pending = undefined;
    const before = current;
    const settings = flightMotionSettings();
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
    const run = { controller, signal: controller.signal, next };
    active = run;
    try {
      if (sameSlots) {
        paint(next);
        await Promise.all(slots.map((slot, index) =>
          animateCompass(slot, before.items[index].view, next.items[index].view, 0, readoutDuration, run.signal)));
      } else {
        list.dataset.inTransition = "";
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
      const image = slots[index].art.firstElementChild;
      if (image) originals.set(item.key, { image, rect: image.getBoundingClientRect() });
    }

    const nextKeys = new Set(next.items.map(item => item.key));
    const departures = before.items.filter(item => !nextKeys.has(item.key) && originals.has(item.key));
    await Promise.all(departures.map(item => {
      const { image, rect } = originals.get(item.key);
      image.parentElement.dataset.airborne = "";
      return fly(run, image, rect, "exit", [
        { transform: "none" },
        { transform: `translateX(${-rect.right - 24}px)` },
      ], settings.exit, settings.easing.exit);
    }));
    if (run.signal.aborted) return;

    paint(next);
    const jobs = next.items.map((item, index) => {
      const slot = slots[index];
      const image = slot.art.firstElementChild;
      const original = originals.get(item.key);
      const rect = image?.getBoundingClientRect();
      const previous = before.items[index];
      const phase = !rect ? null : !original ? "enter" : moved(original.rect, rect) ? "transfer" : null;
      slot.art.toggleAttribute("data-airborne", Boolean(phase));
      return { slot, image, rect, original, phase, previous, item };
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
        await fly(run, job.image, job.rect, "enter", [
          { transform: `translateX(${window.innerWidth - job.rect.left + 24}px)` },
          { transform: "none" },
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

  window.addEventListener("resize", settleLatest);
  reducedMotion.addEventListener("change", settleLatest);
  document.addEventListener("visibilitychange", () => { if (document.hidden) settleLatest(); });
  return { show, reset };
}

function moved(from, to) {
  return ["left", "top", "width", "height"].some(property => Math.abs(from[property] - to[property]) > 1);
}

async function transfer(run, job, settings) {
  const { original, rect: to } = job;
  const from = original.rect;
  const dx = to.left + (to.width - from.width) / 2 - from.left;
  const dy = to.top + (to.height - from.height) / 2 - from.top;
  const direction = Math.abs(dy) < 6 ? 0 : Math.sign(dy);
  const lane = direction * Math.min(90, window.innerWidth * 0.12);
  const widthRatio = to.width / from.width;
  const heightRatio = to.height / from.height;
  await fly(run, job.image, from, "transfer", [
    { transform: "none" },
    { offset: 0.30, transform: `translate(${dx * 0.30 + lane}px, ${dy * 0.34}px) rotate(${direction * -12}deg) scale(${1 + (widthRatio - 1) * 0.28}, ${1 + (heightRatio - 1) * 0.28})` },
    { offset: 0.68, transform: `translate(${dx * 0.73 + lane * 0.7}px, ${dy * 0.75}px) rotate(${direction * -6}deg) scale(${1 + (widthRatio - 1) * 0.73}, ${1 + (heightRatio - 1) * 0.73})` },
    { transform: `translate(${dx}px, ${dy}px) rotate(0deg) scale(${widthRatio}, ${heightRatio})` },
  ], settings.transfer, settings.easing.transfer);
  if (!run.signal.aborted) job.slot.art.removeAttribute("data-airborne");
}

async function fly(run, image, rect, phase, frames, duration, easing) {
  if (run.signal.aborted || !rect.width || !rect.height) return;
  if (!run.layer) {
    run.layer = document.createElement("div");
    run.layer.className = "flight-motion-layer";
    run.layer.setAttribute("aria-hidden", "true");
    document.body.append(run.layer);
  }
  const copy = document.createElement("img");
  copy.src = image.src;
  copy.alt = "";
  copy.dataset.phase = phase;
  Object.assign(copy.style, {
    left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
  });
  run.layer.append(copy);
  try {
    await playMotion(copy, frames, { duration, easing }, run.signal);
  } finally {
    copy.remove();
  }
}
