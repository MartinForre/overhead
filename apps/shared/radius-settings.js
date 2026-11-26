import { formatDistance, imperialUnits, kmPerMile, setMessage, t } from "./display-formats.js";
import { saveSettings } from "./settings-client.js";
import { isValidRadius, maxRadiusKm } from "./settings-schema.js";

export function bindRadiusSettings() {
  const form = document.querySelector("#nearby-radius-form");
  const input = document.querySelector("#nearby-radius");
  const label = form.querySelector('label[for="nearby-radius"]');
  const range = document.querySelector("#nearby-range");
  const status = document.querySelector("#nearby-radius-status");
  let currentRadius;
  let displayedImperial;

  function inputDistance(km) {
    return imperialUnits() ? (km / kmPerMile).toFixed(2) : km;
  }

  form.hidden = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const distance = input.valueAsNumber;
    const radiusKm = imperialUnits() ? Math.round(distance * kmPerMile) : distance;
    if (!isValidRadius(radiusKm)) return;

    setMessage(status, "Saving radius…");
    try {
      await saveSettings({ radiusKm });
      if (currentRadius === radiusKm) input.value = inputDistance(radiusKm);
      setMessage(status, "");
    } catch (error) {
      setMessage(status, error.message);
    }
  });

  return function showRadius(radiusKm) {
    const imperial = imperialUnits();
    if (currentRadius !== radiusKm || displayedImperial !== imperial) {
      currentRadius = radiusKm;
      displayedImperial = imperial;
      input.min = inputDistance(1);
      input.max = inputDistance(maxRadiusKm);
      input.step = imperial ? "any" : "1";
      input.inputMode = imperial ? "decimal" : "numeric";
      input.value = inputDistance(radiusKm);
    }
    label.textContent = t("Radius ({unit})", { unit: imperial ? "mi" : "km" });
    range.textContent = t("Within {distance}", { distance: formatDistance(radiusKm, 2) });
  };
}
