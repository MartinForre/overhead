import { mountDisplay } from "../shared/display/index.js";
import { connectSettings } from "../shared/settings-client.js";

const display = mountDisplay(document.querySelector("#aircraft-display"));

connectSettings({
  onSettings: display.applySettings,
  onGalleryStep: display.applyGalleryStep,
});
