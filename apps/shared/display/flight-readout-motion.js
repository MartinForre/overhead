const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";
const numericReadouts = new Set(["distance", "altitude", "speed"]);
const readingKeys = ["name", "description", "distance", "altitude", "speed", "track", "routeKey"];

export function compassChanged(before, after) {
  return after.track !== undefined && before?.track !== after.track;
}

export function waitForMotion(delay, signal) {
  if (delay <= 0 || signal.aborted) return Promise.resolve();
  return new Promise(resolve => {
    const timer = setTimeout(done, delay);
    signal.addEventListener("abort", done, { once: true });
    function done() {
      clearTimeout(timer);
      signal.removeEventListener("abort", done);
      resolve();
    }
  });
}

export async function playMotion(element, frames, options, signal) {
  if (signal.aborted) return;
  const animation = element.animate(frames, { fill: "both", ...options });
  const cancel = () => animation.cancel();
  signal.addEventListener("abort", cancel, { once: true });
  try {
    await animation.finished;
  } catch (error) {
    if (!signal.aborted) throw error;
  } finally {
    signal.removeEventListener("abort", cancel);
    animation.cancel();
  }
}

export async function animateReadouts(slot, before, after, delay, duration, signal) {
  if (signal.aborted || !readingKeys.some(key => !Object.is(before?.[key], after[key]))) return;
  const fields = Object.entries(slot.readouts).map(([key, element]) => ({
    element, old: before?.[key] ?? "–", value: after[key], numeric: numericReadouts.has(key),
  }));
  const airportMotion = [...slot.route.querySelectorAll(".flight-airport")].map((airport, index) => {
    const key = index === 0 ? "departure" : "destination";
    fields.push({
      element: airport.querySelector(".flight-city"), old: before?.[key]?.city ?? "",
      value: after[key]?.city ?? "", numeric: false,
    });
    const old = airportCode(before?.[key]);
    const next = airportCode(after[key]);
    return [...airport.querySelectorAll(".flight-flaps > span")].map((tile, tileIndex) =>
      animateFlap(tile, old[tileIndex] ?? "–", next[tileIndex], delay, duration, index * 14 + tileIndex * 18, signal));
  }).flat();

  await Promise.all([
    animateFields(fields, delay, duration, signal),
    animateCompass(slot, before, after, delay, duration, signal),
    ...airportMotion,
  ]);
}

function airportCode(airport) {
  return /^[A-Z0-9]{3,4}$/.test(airport?.code) ? airport.code : "N/A";
}

function overlayFor(element, value) {
  const overlay = document.createElement("span");
  overlay.className = "flight-value-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.textContent = value;
  element.dataset.motionValue = "";
  element.append(overlay);
  return overlay;
}

function uncover(overlay) {
  overlay.parentElement?.removeAttribute("data-motion-value");
  overlay.remove();
}

async function animateFields(fields, delay, duration, signal) {
  const animated = fields.filter(field => field.old !== field.value).map(field => ({
    ...field,
    overlay: overlayFor(field.element, field.old),
    seed: [...field.value].reduce((sum, character) => sum + character.codePointAt(0), 0),
  }));
  if (!animated.length) return;
  try {
    await waitForMotion(delay, signal);
    if (signal.aborted) return;
    await new Promise(resolve => {
      const started = performance.now();
      let lastTick = -1;
      let frameId;
      function done() {
        cancelAnimationFrame(frameId);
        signal.removeEventListener("abort", done);
        resolve();
      }
      function frame(now) {
        const elapsed = now - started;
        if (elapsed >= duration) return done();
        const tick = Math.floor(elapsed / 48);
        if (tick !== lastTick) {
          for (const field of animated) field.overlay.textContent = scrambledValue(field, elapsed / duration, tick);
          lastTick = tick;
        }
        frameId = requestAnimationFrame(frame);
      }
      signal.addEventListener("abort", done, { once: true });
      frameId = requestAnimationFrame(frame);
    });
  } finally {
    animated.forEach(({ overlay }) => uncover(overlay));
  }
}

function scrambledValue({ value, numeric, seed }, progress, tick) {
  const revealed = Math.floor(value.length * Math.max(0, progress * 1.6 - 0.6));
  return [...value].map((character, index) => {
    if (index < revealed) return character;
    if (/\d/.test(character)) return numbers[(seed + tick * 7 + index * 11) % numbers.length];
    if (numeric || !/\p{L}/u.test(character)) return character;
    const letter = letters[(seed + tick * 13 + index * 7) % letters.length];
    return character === character.toUpperCase() ? letter : letter.toLowerCase();
  }).join("");
}

async function animateFlap(tile, first, last, delay, duration, offset, signal) {
  if (first === last) return;
  const overlay = overlayFor(tile, first);
  const dropDuration = 100;
  const firstDrop = duration * 0.12;
  const secondDrop = duration - dropDuration - 68;
  try {
    await waitForMotion(delay + firstDrop + offset, signal);
    await dropFlap(overlay, letters[(last.charCodeAt(0) + offset) % letters.length], dropDuration, signal);
    await waitForMotion(secondDrop - firstDrop - dropDuration, signal);
    await dropFlap(overlay, last, dropDuration, signal);
  } finally {
    uncover(overlay);
  }
}

async function dropFlap(overlay, next, duration, signal) {
  if (signal.aborted) return;
  const flap = overlay.cloneNode(true);
  flap.classList.add("flight-flap-drop");
  overlay.after(flap);
  overlay.textContent = next;
  try {
    await playMotion(flap, [
      { transform: "perspective(60px) rotateX(0deg)", opacity: 1 },
      { transform: "perspective(60px) translate(1px, 8px) rotateX(-82deg)", opacity: 0.45 },
    ], { duration, easing: "cubic-bezier(.35, .02, .69, .55)" }, signal);
  } finally {
    flap.remove();
  }
}

export function animateCompass(slot, before, after, delay, duration, signal) {
  if (!compassChanged(before, after)) return;
  const needle = slot.track.querySelector(".flight-needle");
  const from = before?.track ?? 0;
  const rotation = (after.track - from + 540) % 360 - 180;
  return playMotion(needle, [{ transform: `rotate(${from}deg)` }, { transform: `rotate(${from + rotation}deg)` }],
    { delay, duration, easing: "ease-in-out" }, signal);
}
