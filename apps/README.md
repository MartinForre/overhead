# Overhead apps

Each app has a standalone `index.html`. Serve `apps/` as the HTTP root to give the display and companion their own URLs without a build step.

From the repository root, install Vite and start the local development server. It reloads the browser as you edit the app files.

```sh
npm install
npm run dev
```

- [Display](http://127.0.0.1:8000/display/)
- [Companion](http://127.0.0.1:8000/companion/)

The companion app lists the data sources. You can also reach the credits from **Data sources** in Display Settings.

## Portable Windows display

On the build machine, use Deno 2.9 or later and run this from the repository root. Deno downloads the Windows runtime on the first build.

```sh
deno task build:windows
```

Copy `dist/Overhead.exe` to the Windows x64 laptop. The executable includes the display, companion, and aircraft artwork. Double-click it, leave its console window open, and add `http://127.0.0.1:8000/display/` to the Chrome tab rotation. Save the office location in Display Settings the first time. Launch the executable again after a restart.

Chrome is the only other application the laptop needs. The server listens only on the laptop, and live traffic still needs internet access. The executable is unsigned.

## Display settings and behavior

In Chrome, open **Settings → Traffic preview** and choose one, two, or three sample aircraft. Use **Play sample handoff** to see a departure, two aircraft change slots, and an arrival. Preview works before you save a location and pauses live traffic polling. Choose **Live traffic** or reload the page to leave preview.

Under **Settings → Transitions**, choose the slot move duration and aircraft easing. The defaults are **1.1 seconds** and **Gentle**. Shorter departure and arrival phases scale with the move duration. **Off** and the browser’s reduced-motion preference skip the animations. The display saves these settings in the browser.

Open **Settings** from the top-right button. Use **Check location** to look up the display’s coordinates. If the browser lookup times out during initial setup, the display asks [GeoJS](https://www.geojs.io/docs/v1/endpoints/geo/) for an estimate based on the browser’s public IP. Use **Estimate from IP** to request the same estimate directly. Review the area and estimated radius before choosing **Save this estimate**. Under **Set display location**, you can enter latitude and longitude manually. The display reuses confirmed coordinates in the same browser profile and on the same origin.

After you save a location, the display shows up to three aircraft within 50 km by default. In **Settings**, use **Radius (km)** and **Apply radius** to change the search range from 1 to 423 km. The display saves that preference in the browser and applies it immediately, subject to the provider’s retry window. Each flight card shows ground speed in km/h and true ground track on a north-up compass when available. The nearest aircraft marked as a helicopter becomes the primary card. Secondary cards use the same layout at 70% scale. With three aircraft, the primary card sits between the two secondary cards.

The display checks for aircraft about every five seconds through the local Vite server. The server tries [adsb.fi](https://github.com/adsbfi/opendata#terms) first and uses [adsb.lol](https://www.adsb.lol/docs/open-data/api) when the primary feed is unavailable. It shares provider cooldowns across display tabs, honors `Retry-After`, and waits at least three minutes between adsb.lol requests to stay within the fallback quota for one server. Each provider receives a search center rounded to the nearest half-degree and a padded radius. The display calculates distances and filters by the chosen radius in the browser.

Vite serves the repository’s `assets/` at the HTTP root. The display preloads the ready aircraft illustrations as compressed image files. Between polls it reuses the card slots and decoded artwork. Before a handoff, the display resolves the flight details and decodes the selected illustration. Polling continues while it prepares the handoff. A new aircraft taking over a slot triggers the scrambled readouts and split-flap airport codes. When the same aircraft stays in its slot, the numbers update directly and the compass turns smoothly. Artwork matches by confirmed airframe, then by a catalogued operator and type, then by neutral type or known category. Conflicting airframe identifiers fall through to the next match. Planned artwork and failed image loads also fall through. Unknown aircraft can still appear with their flight details.

Set `operatorIcaoCodes` on each representative livery in the artwork catalog. The display combines those codes with the entry’s `icaoType` once the entry is marked `ready`. For special liveries, set `airframeOnly` and record each matching aircraft under `airframes`. The display loads the catalogs once per page. Reload the display after editing them.

The display gets the make and model from the local type catalog, the live feed, or an [ADSBDB](https://www.adsbdb.com/) airframe lookup. ADSBDB also provides airline and airport references by callsign. These routes are estimates because a callsign can be reused or the flight can be diverted. Lookups run only for displayed aircraft and use broadcast identifiers. The display keeps a temporary cache in browser memory and shares requests for the same lookup. Successful callsign lookups last 15 minutes, airline and airframe lookups last up to a day, and 404s last five minutes.

On a Linux desktop with Chromium installed, open the display in kiosk mode while the server is running.

```sh
chromium --kiosk http://127.0.0.1:8000/display/
```
