import { waitForMotion } from "./flight-readout-motion.js";
import { featuredSamples, sampleFlights, sampleGearSequence, sampleHandoff } from "./preview-flights.js";

export async function renderTrafficPreview(mode, render, signal) {
  if (mode === "handoff") {
    await render(sampleHandoff.before);
    await waitForMotion(750, signal);
    if (!signal.aborted) await render(sampleHandoff.after);
    return;
  }

  if (mode === "gear") {
    for (const flights of sampleGearSequence) {
      if (signal.aborted) return;
      await render(flights);
      await waitForMotion(1800, signal);
    }
    return;
  }

  const [, airliner] = sampleFlights;
  const featured = featuredSamples[mode];
  const flights = featured ? [featured] : mode === "1" ? [airliner] : sampleFlights.slice(0, Number(mode));
  await render(flights);
}
