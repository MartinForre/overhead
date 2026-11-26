import { importSettings } from "./settings-client.js";
import { isValidSetting } from "./settings-schema.js";

export async function migrateLegacySettings() {
  const prefix = "overhead.display.";
  const keys = ["mode", "location", "radiusKm", "theme", "transitions"];
  const parse = (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  };

  try {
    const saved = Object.fromEntries(keys.map((key) => [key, localStorage.getItem(prefix + key)]));
    const motion = parse(saved.transitions);
    const candidates = {
      mode: saved.mode,
      location: saved.location === null ? undefined : parse(saved.location),
      radiusKm: Number(saved.radiusKm),
      theme: saved.theme,
      motionDuration: Number(motion?.duration),
      motionEasing: motion?.easing,
    };
    const patch = Object.fromEntries(Object.entries(candidates).filter(([key, value]) => isValidSetting(key, value)));
    if (!Object.keys(patch).length) return;

    await importSettings(patch);
    for (const key of keys) localStorage.removeItem(prefix + key);
  } catch {
    // Leave the browser values available for the next startup if the import failed.
  }
}
