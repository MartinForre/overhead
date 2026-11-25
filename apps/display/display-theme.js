const themeSelect = document.querySelector("#display-theme");
const storageKey = "overhead.display.theme";

try {
  const savedTheme = localStorage.getItem(storageKey);
  if ([...themeSelect.options].some(option => option.value === savedTheme)) {
    themeSelect.value = savedTheme;
  }
} catch {
  // Fall back to the default when browser storage is unavailable.
}

document.documentElement.dataset.theme = themeSelect.value;

themeSelect.addEventListener("change", () => {
  const theme = themeSelect.value;
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // The chosen theme still applies until the page reloads.
  }
});
