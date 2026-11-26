import { saveSettings } from "./settings-client.js";
import { defaultSettings } from "./settings-schema.js";

export function bindDisplayFormatSettings(showStatus) {
  const section = document.querySelector(".display-formats");
  section.innerHTML = `
    <label><span data-i18n>Language</span>
      <select name="language" id="display-language" autocomplete="off">
        <option value="en" lang="en">English</option>
        <option value="nb" lang="nb">Norsk (bokmål)</option>
        <option value="nn" lang="nn">Norsk (nynorsk)</option>
      </select>
    </label>
    <label><span data-i18n>Units</span>
      <select name="units" id="display-units" autocomplete="off">
        <option value="metric" data-i18n>Metric</option>
        <option value="imperial" data-i18n>Imperial</option>
      </select>
    </label>
    <label><span data-i18n>Clock format</span>
      <select name="clock" id="display-clock" autocomplete="off">
        <option value="24-hour" data-i18n>24-hour</option>
        <option value="12-hour" data-i18n>12-hour</option>
      </select>
    </label>
  `;
  const fields = [...section.querySelectorAll("select")];
  let applied = defaultSettings;
  for (const select of fields) {
    const key = select.name;
    select.addEventListener("change", async () => {
      showStatus("");
      try {
        await saveSettings({ [key]: select.value });
      } catch (error) {
        select.value = applied[key] ?? defaultSettings[key];
        showStatus(error.message);
      }
    });
  }
  return (settings) => {
    applied = settings;
    for (const select of fields) select.value = settings[select.name] ?? defaultSettings[select.name];
  };
}
