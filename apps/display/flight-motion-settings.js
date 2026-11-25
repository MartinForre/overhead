const durationInput = document.querySelector("#motion-duration");
const easingInput = document.querySelector("#motion-easing");
const storageKey = "overhead.display.transitions";

const curves = {
  gentle: {
    exit: "cubic-bezier(.46, .04, .82, .58)",
    transfer: "cubic-bezier(.38, .08, .29, 1)",
    enter: "cubic-bezier(.19, .65, .25, 1)",
  },
  "ease-in-out": { exit: "ease-in-out", transfer: "ease-in-out", enter: "ease-in-out" },
  linear: { exit: "linear", transfer: "linear", enter: "linear" },
};

try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  for (const [input, value] of [[durationInput, saved?.duration], [easingInput, saved?.easing]]) {
    if ([...input.options].some(option => option.value === value)) input.value = value;
  }
} catch {
  // The controls still apply when browser storage is unavailable.
}

for (const input of [durationInput, easingInput]) {
  input.addEventListener("change", () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ duration: durationInput.value, easing: easingInput.value }));
    } catch {
      // The controls still apply when browser storage is unavailable.
    }
  });
}

export function flightMotionSettings() {
  const transfer = Number(durationInput.value);
  return {
    transfer,
    exit: Math.round(transfer * 0.49),
    enter: Math.round(transfer * 0.78),
    easing: curves[easingInput.value],
  };
}
