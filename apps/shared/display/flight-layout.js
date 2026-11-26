export function flightCardOrder(ranked) {
  return ranked.length === 3 ? [ranked[1], ranked[0], ranked[2]] : ranked;
}

export function fitFlightCards(list, alignRoutes) {
  list.style.removeProperty("--fitted-primary-size");
  const cards = Array.from(list.children, card => card.firstElementChild);
  if (!cards.length || !list.clientHeight) {
    alignRoutes?.();
    return true;
  }

  const boardHeight = list.getBoundingClientRect().height;
  const { gridTemplateColumns, rowGap } = getComputedStyle(list);
  const singleRow = gridTemplateColumns.split(/\s+/).length === cards.length;
  const gap = parseFloat(rowGap);
  function fits() {
    alignRoutes?.();
    const heights = cards.map(card => card.getBoundingClientRect().height);
    const tallest = Math.max(...heights);
    if (singleRow) return tallest <= boardHeight;
    if (cards.length === 2) return tallest * 2 + gap <= boardHeight;
    const stackHeight = heights.reduce((sum, height) => sum + height, 0);
    return stackHeight + gap * (cards.length - 1) <= boardHeight;
  }
  if (fits()) return true;

  // Measure the cards themselves so decorative overflow cannot shrink the board.
  const naturalWidth = list.querySelector("[data-primary]").offsetWidth;
  let upper = naturalWidth - 1;
  let lower = upper;
  const step = Math.max(1, Math.round(naturalWidth * 0.06));
  // Narrow text can wrap, so start near the default width to find a range that fits.
  while (lower > 0) {
    list.style.setProperty("--fitted-primary-size", `${lower}px`);
    if (fits()) break;
    upper = lower - 1;
    lower -= step;
  }
  if (lower <= 0) {
    list.style.removeProperty("--fitted-primary-size");
    alignRoutes?.();
    return false;
  }
  let fitted = lower;
  while (lower <= upper) {
    const width = Math.floor((lower + upper) / 2);
    list.style.setProperty("--fitted-primary-size", `${width}px`);
    if (fits()) {
      fitted = width;
      lower = width + 1;
    } else {
      upper = width - 1;
    }
  }
  list.style.setProperty("--fitted-primary-size", `${fitted}px`);
  alignRoutes?.();
  return true;
}
