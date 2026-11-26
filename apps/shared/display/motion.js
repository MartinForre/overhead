const curves = {
  gentle: {
    exit: "cubic-bezier(.46, .04, .82, .58)",
    transfer: "cubic-bezier(.38, .08, .29, 1)",
    enter: "cubic-bezier(.19, .65, .25, 1)",
  },
  "ease-in-out": { exit: "ease-in-out", transfer: "ease-in-out", enter: "ease-in-out" },
  linear: { exit: "linear", transfer: "linear", enter: "linear" },
};

export function flightMotionSettings({ motionDuration: transfer, motionEasing }) {
  return {
    transfer,
    exit: Math.round(transfer * 0.49),
    enter: Math.round(transfer * 0.78),
    easing: curves[motionEasing],
  };
}
