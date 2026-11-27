# Overhead apps

One Overhead server hosts the passive kiosk at `/display/` and its control app at `/companion/`. The companion works on phones, tablets, and desktops. The server pushes settings changes to both views without a reload.

From the repository root, install Vite and start the local development server. It reloads the browser as you edit the app files.

```sh
npm install
npm run dev
```

- [Display](http://127.0.0.1:8000/display/)
- [Companion](http://127.0.0.1:8000/companion/)

The companion opens on the same aircraft view as the kiosk. Select the gear in the upper-right corner to open settings. The **Live**, **Gallery**, and **Track** tabs switch both views. Live has a List or Map view, location, radius, and sample traffic controls. Gallery has previous and next aircraft controls. Theme, transitions, and regional formats apply across all modes. The settings footer lists the data sources.

Both pages mount the renderer in `apps/shared/display/`, which contains the aircraft card markup, styles, and rendering for each mode. The companion hosts the settings UI and accepts gallery input.

To open the companion on an iPad or phone, run `npm run dev -- --host 0.0.0.0` and open `http://<computer-ip>:8000/companion/` in its browser on the same trusted network. Local HTTP by IP supports manual coordinates and IP estimation. Browser device location requires HTTPS or localhost.

On an iPhone or iPad, open the companion in Safari and choose **Share → Add to Home Screen**. If Safari shows **Open as Web App**, leave it on and tap **Add**. The Overhead icon opens the aircraft display without Safari’s address bar and tabs. Keep the Overhead server running at the same address. [Apple’s Home Screen guide](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/27/ios/27)

The server saves settings in `overhead.config.json` in its working directory. Unset fields use defaults. To import legacy browser preferences, open the companion in the original browser profile at the same server address. Its saved browser preferences fill fields that are still unset on the server. Back up the JSON file to move a display’s settings to another machine. Restart the server after editing the file by hand.

## Portable Windows display

On the build machine, use Deno 2.9 or later and run this from the repository root. Deno downloads the Windows runtime on the first build.

```sh
deno task build:windows
```

Copy `dist/Overhead.exe` to the Windows x64 laptop. The executable includes the display, companion, and aircraft artwork. Double-click it, leave its console window open, and add `http://127.0.0.1:8000/display/` to the Chrome tab rotation. Set the office location in the companion the first time. Launch the executable again after a restart.

Chrome is the only other application the laptop needs. The server listens only on the laptop by default. To use the companion on a trusted local network, launch `Overhead.exe --lan` from its folder and open the laptop’s IPv4 address on port 8000. Use a writable working directory for the JSON config. Live traffic needs internet access. The executable is unsigned.

## Display settings and behavior

In **Settings → Display mode**, choose **Live**, **Gallery**, or **Track**. Live defaults to **List**, which shows up to three nearby aircraft. When a fresh feed reports no aircraft in range, List shows Gallery and keeps polling. The display returns to nearby traffic as soon as the first detected aircraft card is ready. A stale or unavailable feed shows **Flight data unavailable**.

Choose **Settings → Live → Map** to show every aircraft with a fresh position in the same radius. The map frames the saved location with a span of twice the radius along its longer side. A 1 km radius covers 2 km from top to bottom in portrait or from left to right in landscape. Aircraft size varies with class and altitude. Tap an aircraft or choose one from a nearby ground group in Companion to open its full flight card on both screens. Use **Clear aircraft selection** to dismiss it. The solid trail follows the tail and a dashed guide points from the nose to a known destination. MapLibre runs from the Overhead server. The detailed basemap uses OpenFreeMap vector tiles and the bundled Natural Earth coastline provides a fallback. Find the full map credits and licence links under **Companion → Settings → Data sources**.

Gallery shows one illustrated aircraft from the local collection and advances every ten minutes. In the companion, swipe left for the next aircraft or right for the previous one. You can also browse with the left and right arrow keys or the aircraft buttons in companion settings. In Gallery mode these controls advance connected views together. Selecting **Gallery** directly works without a saved location and pauses live polling.

In the companion, open **Settings → Live → Traffic preview** and choose one, two, or three sample aircraft. Use **Play sample handoff** to see a departure, two aircraft change slots, and an arrival. Preview appears on both views, works before you save a location, and pauses live traffic polling. Choose **Live traffic** or switch display modes to leave preview. Restarting the server also clears it.

Choose **Landing gear sequence** and close Settings to watch an AW101 and A320neo extend their gear on approach, roll with it down, and retract it after liftoff.

The **Track** queue holds up to three items and is shared between the display and companion. Track stacks the aircraft vertically using the Live card sizes. The airborne flight closest to landing is the larger card and sits between the other two when three are tracked. ADS-B watches are ordered by distance remaining. If FlightAware landing estimates are available, Track compares time instead, using distance and ground speed to estimate it for ADS-B watches. Flights without enough data to rank follow in queue order. Track shows a neutral aircraft and airport placeholders while the details load.

In the companion, tap an aircraft card in **Live** to add it to **Track** using adsb.fi. Live stays on screen. When the queue is full, the tap replaces its oldest entry. Tapping the same aircraft again keeps its place.

Airborne cards in Live and ADS-B Track can show an approximate takeoff time under the origin, in the display’s time zone. Overhead uses a ground-to-air transition when it sees one near the origin. Otherwise it works backward from the direct distance to the origin and current ground speed, so speed changes and detours can affect the estimate. A dated FlightAware card shows the reported takeoff time when available.

**Without a key**, enter an ADS-B callsign such as **SAS588**, then select **Find callsign → Watch**. Common Nordic flight numbers such as **SK588** map to their standard callsign. If a flight broadcasts a different callsign, enter it directly. Watches can be added ahead of time and display the aircraft once adsb.fi sees it. The card shows available artwork, altitude, ground speed, and track. When ADSBDB has a route for the callsign, the card shows the airports and a dashed arc. A hollow marker and solid arc show estimated progress when a fresh airborne position is close to the direct route between the airports. In Live and Track, an approximate landing time appears below the destination when there is enough data to estimate it. It uses the display’s local time and the aircraft’s remaining distance and ground speed. A watch follows the exact callsign whenever it broadcasts, which can include multiple occurrences. Remove the watch when finished. [adsb.fi API](https://github.com/adsbfi/opendata/blob/main/README.md) · [ADSBDB](https://www.adsbdb.com/)

**With a key**, **Find flights** searches current and upcoming departures within 36 hours when FlightAware has assigned a tracking ID. Pick the departure by route, date, and time to see the route arc and timing fields. For an existing callsign watch, use **Choose departure** to replace it with a dated flight in the same slot.

Set `OVERHEAD_AEROAPI_KEY` in the server process environment and restart Overhead to enable [FlightAware AeroAPI](https://www.flightaware.com/commercial/aeroapi/). For local development, export it before running `npm run dev`. On Windows, set it for the account that launches the portable server, then relaunch it. FlightAware charges per query. Its status and position requests use the FlightAware feed, and manually added callsign watches pause until replaced or until the key is removed. Aircraft added by tapping Live cards continue to use adsb.fi. Track stops polling outside Track mode. [FlightAware plans and query fees](https://www.flightaware.com/commercial/aeroapi/)

Under **Settings → Transitions**, choose the slot move duration and aircraft easing. The defaults are **1.1 seconds** and **Gentle**. Shorter departure and arrival phases scale with the move duration. **Off** and the browser’s reduced-motion preference skip the animations.

Open the companion’s **Settings → Live**. Use **Check device location** to look up your current device’s coordinates. If the browser lookup times out during initial setup, the companion asks GeoJS for an estimate based on the browser’s public IP. Use **Estimate from IP** to request the same estimate directly. Review the area and estimated radius before choosing **Save this estimate**. Under **Set display coordinates**, you can enter latitude and longitude manually. Both views reuse the coordinates saved on the server. [GeoJS](https://www.geojs.io/docs/v1/endpoints/geo/)

After you save a location, the display shows up to three aircraft within 50 km by default. In **Settings**, use **Radius (km)** and **Apply radius** to change the search range from 1 to 423 km. The saved radius applies immediately, subject to the provider’s retry window. Each flight card shows ground speed in km/h and true ground track on a north-up compass when available. The nearest aircraft marked as a helicopter becomes the primary card. Secondary cards use the same layout at 70% scale. With three aircraft, the primary card sits between the two secondary cards.

The apps check for nearby aircraft about every five seconds through the Overhead server. For the same search area, the server shares an in-flight adsb.fi request and reuses its fresh snapshot for five seconds after receiving it. The server tries adsb.fi first and uses adsb.lol when the primary feed is unavailable. It honors `Retry-After`, shares provider cooldowns across clients, and waits at least three minutes between adsb.lol requests. Each provider receives a search center rounded to the nearest half-degree and a padded radius. Each app calculates distances and filters by the chosen radius in the browser. [adsb.fi terms](https://github.com/adsbfi/opendata#terms) · [adsb.lol API](https://www.adsb.lol/docs/open-data/api)

The server caches regional METAR observations from the NOAA Aviation Weather Center for 15 minutes. Live and adsb.fi callsign watches use the closest station within 100 km of each aircraft with a report no more than 90 minutes old. The display applies the station's altimeter setting (QNH) to estimate altitude above mean sea level, rounded to the nearest 25 feet. In the companion, hover over the altitude to see the station and pressure. The display labels a raw pressure reading `PA` and a geometric height above the WGS84 ellipsoid `HAE`. FlightAware tracks show the altitude as reported because AeroAPI can mix altitude sources. [NOAA Aviation Weather Center](https://aviationweather.gov/data/api/) · [FlightAware altitude reference](https://discussions.flightaware.com/t/aero-api-altitude/82883)

Vite serves the repository’s `assets/` at the HTTP root. Live mode preloads the ready aircraft illustrations as compressed image files. Between polls it reuses the card slots and decoded artwork. Before a handoff, the display resolves the flight details and decodes the selected illustration. Polling continues while it prepares the handoff. A new aircraft taking over a slot triggers the scrambled readouts and split-flap airport codes. When the same aircraft stays in its slot, the numbers update directly and the compass turns smoothly. Artwork matches by confirmed airframe, then by a catalogued operator and type, then by neutral type or known category. Conflicting airframe identifiers fall through to the next match. Planned artwork and failed image loads also fall through. Unknown aircraft can still appear with their flight details.

Set `operatorIcaoCodes` on each representative livery in the artwork catalog. The display combines those codes with the entry’s `icaoType` once the entry is marked `ready`. For special liveries, set `airframeOnly` and record each matching aircraft under `airframes`. The display loads the catalogs once per page. Reload the display after editing them.

The display gets the make and model from the local type catalog, the live feed, or an ADSBDB airframe lookup. ADSBDB also provides airline and airport references by callsign. These routes are estimates because a callsign can be reused or the flight can be diverted. Lookups run only for displayed aircraft and use broadcast identifiers. The Overhead server shares concurrent lookups and caches responses in memory for all connected clients. Callsign lookups last 15 minutes, airline and airframe lookups last one day, and 404s last five minutes. [ADSBDB API](https://www.adsbdb.com/)

On a Linux desktop with Chromium installed, open the display in kiosk mode while the server is running.

```sh
chromium --kiosk http://127.0.0.1:8000/display/
```
