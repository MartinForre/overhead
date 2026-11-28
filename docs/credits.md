# Credits and data sources

The project’s code, documentation, and original illustrations and app icon are available under the MIT License. Third-party software, data, and marks retain their own terms. Aircraft and airline names and logos identify the subjects depicted. The aircraft catalog and artwork notes cite reference photography and fleet records. [MIT License](../LICENSE) · [Aircraft artwork catalog](../assets/aircrafts/artwork.json) · [Artwork notes](design.md#aircraft-artwork)

## Flight data

- Nearby aircraft positions and callsign watches use adsb.fi. [adsb.fi](https://adsb.fi/) · [Terms](https://github.com/adsbfi/opendata#terms)
- The nearby feed can fall back to adsb.lol, which publishes its data under the Open Database License 1.0. [adsb.lol API](https://www.adsb.lol/docs/open-data/api) · [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/)
- Aircraft, airline, and route reference data comes from ADSBDB. [ADSBDB](https://www.adsbdb.com/)
- METAR observations come from the NOAA Aviation Weather Center. [Aviation Weather Center API](https://aviationweather.gov/data/api/)
- Dated flight tracking uses FlightAware AeroAPI when configured. [FlightAware AeroAPI](https://www.flightaware.com/commercial/aeroapi/)
- The optional IP-based location estimate uses GeoJS. [GeoJS geolocation API](https://www.geojs.io/docs/v1/endpoints/geo/)

## Maps

- The browser map uses MapLibre GL JS. Overhead serves the bundled library’s license at `/maplibre/LICENSE.txt`. [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js)
- The detailed basemap uses tiles from OpenFreeMap and OpenMapTiles, with data from OpenStreetMap. [OpenFreeMap](https://openfreemap.org/) · [OpenMapTiles](https://openmaptiles.org/) · [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright)
- The fallback coastline uses Natural Earth. [Natural Earth terms of use](https://www.naturalearthdata.com/about/terms-of-use/)

Provider credits are also available in **Companion → Settings → Data sources**.
