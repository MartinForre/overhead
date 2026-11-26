const tiles = "https://tiles.openfreemap.org/planet";
const fonts = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";
let library;

export function loadMapLibre() {
  if (library) return library;
  library = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/maplibre/maplibre-gl.js";
    script.onload = () => window.maplibregl ? resolve(window.maplibregl) : reject(new Error("MapLibre unavailable"));
    script.onerror = () => reject(new Error("MapLibre unavailable"));
    document.head.append(script);
  }).catch(error => {
    library = undefined;
    throw error;
  });
  return library;
}

export function basemapStyle(element) {
  const style = getComputedStyle(element);
  const color = name => style.getPropertyValue(name).trim();
  const water = color("--map-water");
  const land = color("--map-land");
  const line = color("--map-line");
  const ink = color("--map-label");
  return {
    version: 8,
    glyphs: fonts,
    sources: {
      "world-land": { type: "geojson", data: new URL("./map-world.json", import.meta.url).href },
      tiles: { type: "vector", url: tiles },
    },
    layers: [
      { id: "water-background", type: "background", paint: { "background-color": water } },
      { id: "land", type: "fill", source: "world-land", paint: { "fill-color": land } },
      { id: "detailed-land", type: "background", layout: { visibility: "none" }, paint: { "background-color": land } },
      { id: "wood", type: "fill", source: "tiles", "source-layer": "landcover", minzoom: 9,
        filter: ["==", ["get", "class"], "wood"], paint: { "fill-color": line, "fill-opacity": .1 } },
      { id: "water", type: "fill", source: "tiles", "source-layer": "water",
        filter: ["==", ["geometry-type"], "Polygon"], paint: { "fill-color": water } },
      { id: "roads", type: "line", source: "tiles", "source-layer": "transportation", minzoom: 7,
        filter: ["match", ["get", "class"], ["motorway", "trunk", "primary"], true, false],
        paint: { "line-color": line, "line-opacity": .52, "line-width": ["interpolate", ["linear"], ["zoom"], 7, .6, 13, 1.6] } },
      { id: "runways", type: "line", source: "tiles", "source-layer": "aeroway", minzoom: 10,
        filter: ["all", ["==", ["geometry-type"], "LineString"], ["==", ["get", "class"], "runway"]],
        paint: { "line-color": line, "line-opacity": .75, "line-width": 1.5 } },
      { id: "places", type: "symbol", source: "tiles", "source-layer": "place", minzoom: 5,
        filter: ["match", ["get", "class"], ["city", "town"], true, false],
        layout: {
          "text-field": ["coalesce", ["get", "name"], ["get", "name_en"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 5, 11, 12, 15],
          "text-padding": 7,
          "symbol-sort-key": ["coalesce", ["get", "rank"], 100],
        },
        paint: { "text-color": ink, "text-halo-color": water, "text-halo-width": 1.2 },
      },
    ],
  };
}
