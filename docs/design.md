# Overhead design

Overhead is a wall-mounted aviation poster for a home on the southwest coast of Norway. It shows up to three nearby aircraft and gives helicopters priority. The poster combines FlightPortrait’s large side profiles with the airport-board route codes and compass cues seen in avioframe.

## Nearby view

Consider aircraft within the configured radius that have a fresh position. Exclude targets identified as ground vehicles or obstacles. Taxiing and parked aircraft can still qualify. Choose the closest qualifying helicopter as the priority aircraft when one is present. Otherwise, choose the closest aircraft. Fill the remaining slots with the closest other qualifying aircraft.

| Aircraft shown | Layout |
| --- | --- |
| 0 | Show “No aircraft nearby” when the feed is healthy. Show “Flight data unavailable” if the feed is stale or unavailable. |
| 1 | Give the priority aircraft the full poster layout. |
| 2 | Place the primary card near the top and the secondary card near the bottom. Use larger outer insets and center the divider between the cards. |
| 3 | Center the primary card vertically with secondary cards at the top and bottom insets. Center a divider in each gap. |

Use one flight card for all aircraft. The primary card uses full scale and secondary cards use 70%. Place the route above the forward part of the illustration and the altitude, speed and compass in the upper-right corner. Open display settings from a fixed button in the upper-right corner of the screen.

Each entry shows the following fields when available.

- A side-profile illustration, sized to be the main visual element.
- Origin and destination as split-flap-style airport codes with city names underneath when available. Show `N/A` across three tiles for each missing airport code, including on helicopter cards.
- Aircraft make and model as the card title. Show the flight number and operator underneath when available.
- Altitude in feet, ground speed in km/h, and a north-up compass with an unlabelled dial. The red needle tip shows ground track and the muted tail points in the opposite direction. Screen readers can announce the bearing and cardinal direction. Show `N/A` for missing altitude or speed and an empty dial for missing ground track. [Flight data field definitions](https://github.com/wiedehopf/readsb/blob/dev/README-json.md)

### Card styling and dividers

Source or generate a logo for each airline. One option is to let the logo fill the aircraft card as a faint watermark behind the illustration and readouts. Try low opacity and different blend modes across themes to see which treatments keep the aircraft and text easy to read.

Give military and general aviation aircraft distinct card treatments. A category label and subtle accent can make them recognizable while keeping the flight details in the same positions across cards.

Create cloud-layer and runway artwork as options for the gaps between aircraft cards. Either graphic could replace the horizontal divider when two or three cards are visible.

### Aircraft transitions

Use the existing entrance, exit, and slot-change animations for fixed-wing aircraft. Give helicopters their own motion. Pitch the nose down slightly as they fly forward into or out of view, and bring the nose back to level as they settle into a card. Keep the body level as they rise or descend between card slots.

### Display themes

Forest Green is the default. Display Settings also offers Deep Blue with yellow airport tiles, solid Deep Red, Sky Gradient, Nordic Linen, Blueprint, Walnut and Brass, Serengeti Safari, and Zanzibar Coast. The selection applies immediately and is saved in the browser.

All themes share the same aircraft card layout. Serengeti Safari puts low ridges and an acacia at the bottom of the display. Zanzibar Coast uses a strip of shallow water and sand in the same area.

## Linux runtime and display

Build the poster in HTML, CSS, and JavaScript. Keep the app and artwork on disk and serve them over local HTTP. The same page should be usable in a development browser and renderable at a panel’s native dimensions. Use sample data to preview the empty sky and the one-, two-, and three-aircraft layouts before choosing hardware. The candidate resolutions discussed are 800 × 480 and 1600 × 1200.

- For a display connected as a monitor, Linux can automatically launch Chromium in kiosk mode and open `/display`. [Raspberry Pi kiosk guide](https://www.raspberrypi.com/tutorials/how-to-use-a-raspberry-pi-in-kiosk-mode/)
- For an SPI e-paper panel, a Linux boot service can render `/display` with headless Chromium, capture a PNG, and pass it to the panel driver. Raspberry Pi OS Lite and `systemd` are the proposed setup for that path. Benchmark rendering and memory on the chosen Pi. [Playwright screenshots](https://playwright.dev/docs/screenshots) · [Pimoroni Inky driver](https://github.com/pimoroni/inky)

Poll for flight data independently of the display refresh cycle. When the display is ready and its configured interval has elapsed, draw the latest available state and skip older queued updates. Panel dimensions and refresh timing belong to the display configuration. A short flyover can finish before a slow e-paper update completes. [Waveshare 7.3-inch Spectra 6 manual](https://www.waveshare.com/wiki/7.3inch_e-Paper_HAT_%28E%29_Manual)

## Companion and view modes

Keep the display renderer open to multiple modes. Nearby is the default. The Pi owns the active mode and its settings so the frame can continue independently of the phone.

Expose a mobile-friendly configuration and companion page on the Pi’s home network. The proposed entry point is `/companion`, with a local name such as `overhead.local`. The page should work from a phone’s home-screen shortcut. [Apple’s Home Screen guide](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/27/ios/27)

### Nearby polling hours

Default to polling from **06:00 to 23:00** each day in the Pi’s local time zone. The companion app lets the person using the display change the start and end times. Pause Nearby flight-data requests outside that window.

During active hours, start with a **five-second polling interval** for the primary provider, adsb.fi. If the primary is unavailable, try adsb.lol at most once every three minutes. This caps fallback traffic from one Pi at about 480 requests per 24 hours. Share provider cooldowns across display clients on the Pi and honor the provider’s `Retry-After` header. [adsb.fi API limits](https://github.com/adsbfi/opendata#limits) · [adsb.lol API schema](https://api.adsb.lol/api/openapi.json)

### Future view modes

Follow a flight is a future mode. The proposed flow is to enter a flight number, confirm the date and route, and show that flight on the frame. The follow lookup works independently of the Nearby radius. Both modes should reuse the display components and aircraft illustrations. Flight lookup and the companion controls can be designed when the mode is scheduled for implementation.

Aircraft gallery is a future mode that can also be enabled as the empty-sky view. At a configurable interval in minutes, randomly select up to three distinct ready illustrations with known aircraft types. Show the make, model, and livery, and label the view “Aircraft gallery” so the frame makes clear that these are catalog entries. Respect the panel’s refresh interval. When used as the empty-sky view, resume Nearby on the next allowed refresh after a qualifying aircraft appears. A stale or unavailable feed still shows its availability status.

A fighter-jet gallery can use the catalog’s `fighter-jet` role to select up to three ready profiles at a time and cycle them on the same interval. Prefer distinct aircraft types when several liveries are available for the same type. Ready artwork with an exact airframe requirement is eligible for the gallery. Use the illustration’s `aircraft` label where it names a more specific variant.

### April 1 easter egg

On April 1, have UFOs appear at random times using the same card slots and transitions as other aircraft. Randomize how long each UFO stays on the poster.

## Aircraft artwork

Store transparent illustrations locally and add liveries over time. Match a confirmed airframe by ICAO address or unambiguous registration, then use a verified operator and type match when the operator has a known livery and the airframe has no specific match. Fall back to a neutral profile for the type, then to an unmarked illustration for the known aircraft category. This applies to helicopters as well as fixed-wing aircraft.

Use the six-character ICAO address (`hex`) to resolve a known airframe. A readsb-style feed can enrich the observation with a registration or tail number (`r`) and ICAO type designator (`t`). Treat the callsign (`flight`) as contextual information because it can be reused. For example, a tracker recorded the Norwegian SAR Queen `0275` with hex `478129`, type `EH10`, and callsign `SAVER50`. Use the Norwegian rescue artwork when the airframe or operator and type are confirmed. With `EH10` alone, use neutral AW101 artwork when available. Check the selected feed for fresh positions during low flyovers near the installation. [readsb fields](https://github.com/wiedehopf/readsb/blob/dev/README-json.md) · [Recorded SAR Queen example](https://www.planetrack.ai/aircraft/478129) · [FAA type designators](https://www.faa.gov/documentLibrary/media/Order/FAA_Order_JO_7360.1K_Aircraft_Type_Designators.pdf)

Keep descriptive filenames and use the two local catalogs for lookups and gallery captions.

The [southwest Norway overflight list](overflight-airlines.md) records the sampled cruise traffic, current passenger fleets, and artwork priorities for the international catalog expansion.

- [Artwork catalog](../assets/aircrafts/artwork.json) stores illustration IDs, type codes or generic categories, livery names, paths relative to the catalog, and `ready` or `planned` status. Set `aircraft` to give the generation queue the exact variant name when a type code covers several variants. For representative liveries, add the accepted three-letter codes in `operatorIcaoCodes`. Use `airframeOnly` for liveries or equipment that require a confirmed airframe and add airframe records when the match is verified. The airframes table is keyed by the uppercased, six-character ICAO address and contains the registration and illustration ID. A registration lookup can be built from the same records. Use the reported type to validate matches and use the ICAO address for short numeric military tail numbers. Recheck the match after a change of operator, paint or configuration.
- [Aircraft type catalog](../assets/aircrafts/aircraft-types.json) maps uppercase ICAO type codes to a readable manufacturer, model, category and optional role. The gallery can join illustrations to this catalog without live flight data. [FAA aircraft type designators](https://www.faa.gov/documentLibrary/media/Order/FAA_Order_JO_7360.1K_Aircraft_Type_Designators.pdf)

Every level of the artwork lookup selects ready images only. The `fallbacks.byType` map selects an unbranded profile by exact ICAO type. The `fallbacks.byCategory` map selects a shaded, unmarked illustration when the aircraft is known to be fixed-wing or a helicopter. Airliner types use the fixed-wing illustration at that level. If the category is also unknown or all matches are still planned, render the entry with available text.

| ICAO type | Livery | Example airframe | Illustration |
| --- | --- | --- | --- |
| `EH10` | Norwegian SAR Queen | `0275` with ICAO address `478129` | [AW101](../assets/aircrafts/helicopters/aw101-sar-queen-norwegian-rescue.png) |
| `EC35` | Norsk Luftambulanse | [LN-OUD, 47C01E](https://www.flightradar24.com/data/aircraft/ln-oud/) | [H135](../assets/aircrafts/helicopters/h135-norsk-luftambulanse.png) |
| `S92` | Bristow Norway offshore passenger | [LN-ONA, 47807D](https://www.flightradar24.com/data/aircraft/LN-ONA) | [S-92A](../assets/aircrafts/helicopters/s92-bristow-norway-offshore.png) |
| `A20N` | Scandinavian Airlines standard silver and blue | [EI-SCD, 4CAD94](https://www.planespotters.net/hex/4CAD94) | [A320neo](../assets/aircrafts/airliners/a320neo-sas.png) |
| `B738` | Norwegian Air Shuttle red nose with plain tail | [LN-NGD, 4787B3](https://www.flightradar24.com/data/aircraft/LN-NGD) | [737-800](../assets/aircrafts/airliners/737-800-norwegian-red-nose.png) |

The Bristow illustration uses the paint scheme shown on the historical photo of `LN-ONV`. That airframe now flies with CHC, so the catalog links the illustration to `LN-ONA`, which was photographed in Bristow’s offshore livery. [Current LN-ONV operator](https://www.flightradar24.com/data/aircraft/ln-onv) · [LN-ONA photograph](https://www.jetphotos.com/photo/11837373)

Use ChatGPT image generation to try an illustration style ahead of time. Use visual references for the exact model and livery, review the shape and markings, and keep the final transparent PNG for reuse. A consistent side angle, lighting, and shading should let images sit together on the same poster. Existing artwork is also an option where its usage terms fit.

### Illustration styles

Keep the current realistically shaded side profiles as the default and explore flat and hand-drawn alternatives. The illustration style could be selected independently of the display theme.

### Landing gear animation

Create one reusable landing gear layer per airframe variant and align it to the nose and main gear attachment points across that variant’s liveries. Use CSS stacking (`z-index`) to let the body hide the gear as it retracts, and move both layers together during card transitions. Fixed gear and floats stay visible.

Extend retractable gear on final approach. Keep it down through touchdown, taxi, parking, and the takeoff roll, then retract it after liftoff. Use the reported on-ground state when available. Approach and liftoff timing would be inferred from the available flight data.

### MVP artwork queue

Complete one standard livery for each in-service aircraft type in an airline's fleet before generating its special liveries. Apply the same priority to regional subsidiaries such as KLM Cityhopper. Use the verified standard profiles as geometry references for the existing model-specific fallback jobs.

The first queue adds Widerøe’s Dash 8‑Q400 and E190‑E2, Norwegian’s 737 MAX 8 with Karin Boye tail art, KLM Cityhopper’s E190, Norsk Luftambulanse’s H145, and CHC Helikopter Service’s offshore S‑92. Each has an example airframe and a livery reference in the catalog. The queue also includes one unbranded profile per catalog type and two generic aircraft illustrations. Use sightings near the installation to guide the next additions. [Widerøe fleet](https://www.wideroe.no/en/about-wideroe/fleet) · [Norwegian fleet](https://www.norwegian.com/en/about/our-story/our-aircraft/) · [KLM Cityhopper fleet](https://estonia.klm.com/information/travel-class-extra-options/aircraft-types) · [Norwegian air ambulance fleet](https://www.luftambulanse.no/basene-vare/fartoyene-vare) · [CHC offshore S‑92 example](https://www.aircraftregister.net/aircraft/LN-OQU)

Run `node scripts/artwork-queue.mjs` to print the planned artwork as JSON. Each job gives Codex the intended filename, an approved style reference, and a livery or aircraft geometry reference where available. Use the built-in image tool once per entry marked `generate`. Jobs marked `wait-for-reference` become available after their reference illustration is ready. Jobs marked `review` already have a file at the intended path. For neutral profiles, keep the exact airframe shape and apply plain light paint with no operator markings. For every new image, check the side profile, livery where applicable, and alpha channel before marking it `ready`. Run the queue again to pick up the next jobs.

### General aviation, seaplanes and military aircraft

Continue adding small general aviation aircraft such as Cessnas, seaplanes, and military aircraft. The catalog already includes ready illustrations in all three groups. [Artwork catalog](../assets/aircrafts/artwork.json)

The expansion starts with floatplanes and amphibians, followed by trainer and touring aircraft, light helicopters, and military types. The civil shortlist draws on Norwegian club and training fleets and documented seaplane examples. It also includes representative common international types for the gallery. [Volda Ørsta Flyklubb fleet](https://voldaorstaflyklubb.no/flyparken/) · [University flight training fleet](https://www.luftfartsfag.no/en/vare-fly) · [Norwegian seaplane records](https://seabee.info/seaplanes/seaplanes_current.htm)

The Cessna 172, 185 and 206 and Piper Super Cub have both type-level wheeled profiles and floatplane entries that require an airframe match for live use. Start with the documented LN-ABO Skywagon and LN-AAI Stationair. Use the same airframe rule for the Husky and Beaver float variants. The Lake Buccaneer and SeaRey have amphibious hulls and can use type-level artwork. [LN-ABO airframe record](https://aircraftregister.net/aircraft/LN-ABO) · [LN-AAI airframe record](https://aircraftregister.net/aircraft/LN-AAI) · [Norwegian Safety Investigation Authority Beaver report](https://aibn.no/Aviation/Aviation/Published-reports/2025-02)

Use representative service colors for each military type, including camouflage where it was part of the paint scheme. Leave off insignia, lettering and serial numbers. Type-level matches use the representative scheme. Confirmed operator or airframe matches can select a more specific service scheme. A P-8A Poseidon can appear as `B738` in the feed, so the Norwegian Poseidon illustration requires a confirmed airframe. The fighter-jet role covers aircraft such as the Tomcat, Fighting Falcon, Lightning II, Gripen and Viggen. Propeller fighters have their own role. [Royal Norwegian Air Force](https://www.forsvaret.no/en/organisation/air-force) · [P-8A type and airframe record](https://planefinder.net/data/aircraft/9582) · [Swedish Air Force Museum](https://flygvapenmuseum.se/kunskapsbank/flygplan-och-helikoptrar-i-samlingarna/jaktflygplan/) · [U.S. Naval Aviation Museum F-14A](https://www.history.navy.mil/content/history/museums/nnam/explore/collections/aircraft/f/f-14a-tomcat.html)

## Open decisions

The panel, Linux hardware, flight-data provider, radius, position freshness limit, and panel refresh cadence are still open.

## AW101 illustration

The [SAR Queen illustration](../assets/aircrafts/helicopters/aw101-sar-queen-norwegian-rescue.png) is the approved first artwork. It is a 2172 × 724 PNG with a transparent background, generated with ChatGPT’s built-in image tool. The reference shows the Norwegian rescue livery at Sola. [Leonardo’s reference photo](https://uk.leonardo.com/en/news-and-stories-detail/-/detail/sar-queen-operating-across-norway)

### Generation prompt

> Create one standalone aircraft illustration for Overhead, a color e-paper aviation poster. Depict the Leonardo AW101-612 SAR Queen in the actual Norwegian 330 Squadron rescue livery, in a level, strict orthographic port-side profile, nose pointing left. Use the attached Leonardo photo as a reference for the airframe, the paint boundaries, and the markings. Draw a new illustration from the side, with the helicopter airborne and the landing gear retracted. Preserve the AW101’s long cabin and tail boom, prominent angular cockpit, bulky engine cowling, side windows and sponsons, main rotor and separate tail rotor, and the black nose radome. Match the light grey-white sides and high-visibility red-orange nose, rear fuselage band, and upper tail. Retain the dark upper rear fuselage and put “RESCUE” low on the cabin and “REDNINGSTJENESTE” with smaller “LUFTFORSVARET” above the cabin windows. Omit the individual tail number so the illustration can represent the fleet. Render a crisp hand-drawn aviation profile with confident edges, restrained two-tone shading, and only the details that read at small poster sizes. Frame the complete helicopter and all rotor tips with a modest clear margin in a wide composition. Output a genuine transparent background with crisp alpha around the aircraft and rotors. The final asset contains just the helicopter. Keep the background fully transparent with no ground, shadow, sky, people, framing, or labels outside the aircraft.

## H135 illustration

The [Norsk Luftambulanse H135](../assets/aircrafts/helicopters/h135-norsk-luftambulanse.png) is a 2172 × 724 PNG with a transparent background, generated with ChatGPT’s built-in image tool. The AW101 illustration supplied the style reference, and the national air ambulance service’s H135 photograph supplied the aircraft and livery reference. [Luftambulansetjenesten fleet photos](https://www.luftambulanse.no/basene-vare/fartoyene-vare)

### Generation prompt

> Draw a polished aviation recognition illustration for a colour e-paper poster, with a clean factory-style painted finish. First attachment is the approved SAR Queen artwork, a reference only for the realistic painted shading and graphic style. Second attachment shows the actual Norsk Luftambulanse Airbus H135, a reference for this aircraft’s geometry and livery. Create one new H135 asset in strict level orthographic port profile, nose left, taking up the centre of a wide image with clear margins on all sides. Preserve the short rounded cabin, four-blade main rotor seen edge-on, fixed landing skids, slender tail boom and shrouded Fenestron tail rotor. Accurately depict the yellow Norwegian air ambulance livery with red diagonal stripes on the upper fairing, tail boom and lower cabin, fine blue-green checker stripe, the fin emblem, and two lines of dark blue text, “LEGE” and “LUFTAMBULANSETJENESTEN”, on the side. Omit the registration. Use controlled areas of shading and simplified, dark windows. The cutout should look like precisely clipped profile art. Put all artwork in the aircraft’s silhouette, with smooth contour edges and fully transparent pixels outside the aircraft, between the skids, and through the tail rotor openings. The subject floats alone on an actual transparent RGBA background with crisp edges, without glow, grain, spatter, reflections outside the silhouette, terrain or shadows.

## S-92A illustration

The [Bristow Norway offshore S-92A](../assets/aircrafts/helicopters/s92-bristow-norway-offshore.png) is a 2172 × 724 PNG with a transparent background, generated with ChatGPT’s built-in image tool. The AW101 illustration supplied the style reference, and Alan Wilson’s photograph of LN-ONV at Sola supplied the aircraft and paint reference. The photo is licensed under CC BY-SA 2.0. [Alan Wilson’s photograph](https://commons.wikimedia.org/wiki/File:Sikorsky_S-92A_%E2%80%98LN-ONV%E2%80%99_(28588810188).jpg) · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)

### Generation prompt

> Create one standalone Sikorsky S-92A profile illustration for Overhead, a color e-paper aviation poster. Attachment 1 is the approved AW101 SAR Queen artwork. Match its sharply drawn silhouette, restrained realistic shading, level nose-left composition, and amount of panel detail. Attachment 2, Alan Wilson’s S-92A photo at Sola, is the reference for the exact aircraft and paint. Draw a true level orthographic port-side profile of the Bristow Norway offshore passenger S-92A, nose left and airborne, with retractable landing gear stowed. Preserve the S-92A’s heavy passenger fuselage, angular cockpit glazing, rectangular cabin windows, raised blue engine deck, white main-gear sponson, upswept tail pylon and external tail rotor. Preserve the four-blade main rotor seen edge-on and the four-blade tail rotor in the correct location, partially occluded by the fin as in the port-side reference. Precisely follow the blue upper fuselage and tail, white nose and lower fuselage, and the red diagonal sweep under the cabin windows and on the white sponson. Keep the small red-and-blue Bristow emblem and black “Bristow” wordmark on the forward white cabin. Omit the individual registration so the art can serve as a representative fleet livery. Use a wide canvas with comfortable clear space around the complete aircraft and all rotor tips. The PNG needs a fully transparent background with clean, antialiased aircraft edges and zero exterior texture or speckles. Only the helicopter should appear, with no cast shadow, ground, airport details, people, or captions.

## A320neo illustration

The [SAS A320neo](../assets/aircrafts/airliners/a320neo-sas.png) is a 2172 × 724 transparent PNG generated with ChatGPT’s built-in image tool. The SAR Queen supplied the illustration style, and SAS’s official A320neo fleet profile supplied the aircraft and standard silver-and-blue paint scheme. [SAS fleet profile](https://www.sasgroup.net/about-sas/the-fleet/a320neo-a321lr/)

### Generation prompt

> Create one standalone Airbus A320neo illustration for Overhead, a color e-paper aviation poster. Attachment 1 is the approved SAR Queen artwork, used for the crisp aviation-illustration style, lifelike painted shading, viewing angle, and level of detail. Attachment 2 is SAS’s official A320neo fleet profile, used for exact A320neo proportions and the current standard silver-and-blue Scandinavian Airlines livery. Draw a new aircraft illustration in a strict level port-side profile with the nose facing left, airborne with landing gear stowed. Preserve the A320neo’s compact single-aisle fuselage length, the two overwing exits visible in the reference, CFM LEAP-1A nacelle silhouette, swept wing and tall blue sharklet. Reproduce the subtly oversized silver “SAS” lettering on the forward light silver-gray fuselage, the deep blue tail field that sweeps down onto the aft fuselage, large white italic “SAS” on the blue fin, three small Scandinavian flags near the rear cabin, and a slim blue band and dark “Scandinavian” lettering on the silver engine nacelle. Omit the individual registration and small alliance badge. Render solid, clean painted surfaces and restrained gradients like the helicopter series. Fit the full aircraft, from radome to tail and all visible wingtips, inside a wide image with clear margins. Deliver a true transparent RGBA cutout, with clean silhouette edges and all exterior pixels transparent. The aircraft is the sole subject, without sky, ground, shadow, framing, or captions.

### Engine lettering correction

> Make a localized text correction to this completed transparent SAS Airbus A320neo illustration. Correct the small dark word on the visible silver engine cowling so it reads exactly “Scandinavian” (S-c-a-n-d-i-n-a-v-i-a-n). Use the same modest lettering, size, position, and angle as the existing engine label. Preserve the entire original A320neo contour, gear-up left profile, painted shading, flags, silver forward SAS logo and white tail SAS lettering. Preserve the clean transparent background and full canvas margins, including all the wings and tail. The only visible content change should be the corrected engine word.

## Norwegian 737-800 illustration

The [Norwegian 737-800](../assets/aircrafts/airliners/737-800-norwegian-red-nose.png) is a 2172 × 724 transparent PNG generated with ChatGPT’s built-in image tool. The SAS A320neo supplied the style reference, and a photo of LN-NGD supplied the 737-800 airframe and red-nose livery with a plain tail. [LN-NGD livery photo](https://www.aeroinside.com/20486/norwegian-b738-at-stavanger-on-mar-1st-2025-flaps-up-landing) · [Norwegian fleet](https://www.norwegian.com/en/about/our-story/our-aircraft/)

### Generation prompt

> Create one standalone aviation illustration for Overhead’s color e-paper poster. Attachment 1, the finished SAS A320neo PNG, supplies the illustrated finish, edge quality, framing, and soft painted shading. Attachment 2, the photograph of Norwegian Air Shuttle LN-NGD, supplies the aircraft and exact red-nose livery reference. Draw a new Boeing 737-800 Next Generation in a strictly level port-side profile, nose left and airborne with wheels retracted. Follow the photographed 737-800 proportions, long narrow fuselage, sloped Boeing cockpit windows, twin overwing exits, CFM56-7B nacelle with a subtly flattened underside, and the swept wing with a tall red blended winglet. Match LN-NGD’s red forward fuselage through the first cabin section, narrow white and dark-navy bands at the red-white boundary, white main fuselage, and white tail fin with a red cap above a thin dark-navy stripe. Keep the white lowercase wordmark “norwegian.com” on the red nose section, spelled n-o-r-w-e-g-i-a-n-dot-c-o-m, and the small navy Norwegian swoosh. Use the photographed plain white fin without portrait artwork. Omit the individual registration and tiny secondary lettering. Draw the complete aircraft with comfortable margins on a wide genuinely transparent RGBA canvas. Preserve crisp silhouette edges, clean colors and restrained realistic shading, matching the existing SAS poster asset. All space around the subject is fully transparent, with no sky, ground, labels or shadows outside the aircraft.

## First artwork batch

The [generic fixed-wing aircraft](../assets/aircrafts/fallbacks/generic-fixed-wing.png), [generic helicopter](../assets/aircrafts/fallbacks/generic-helicopter.png), and [Widerøe Dash 8-Q400](../assets/aircrafts/airliners/dash-8-q400-wideroe.png) are 2172 × 724 PNGs generated with ChatGPT’s built-in image tool. All three PNGs have fully transparent pixels surrounding their subjects. The generic aircraft have pale gray paint, dark windows, and understated shading. The Q400 uses the green-and-white livery shown on LN-WDH. [Niclas Rebbelmund’s LN-WDH photo](https://www.planespotters.net/photo/1639254/ln-wdh-wideroe-bombardier-dhc-8-402-dash-8-q400)

### Generic fixed-wing generation prompt

> Create a standalone illustrated generic fixed-wing aircraft for the Overhead e-paper poster. The reference is for the wide nose-left side profile and clean painted aviation style. Draw a new believable unmarked civilian passenger jet in level flight, exact orthographic side view, with retracted gear, simple dark cabin windows, angular cockpit glazing, a swept wing, an underwing engine and conventional tail. Keep it model-neutral. Paint it matte pale dove gray with a slightly darker cool gray underside and restrained metallic shading. Keep shapes crisp, simplified and smoothly filled. Use broad restrained gradients fully contained within clean, closed contours, with no texture or exterior effects. An unmarked plane only, with no branding, lettering, flags, registration or accent stripe. Keep the complete shape comfortably inside a wide canvas, with minimal antialiasing and true zero-alpha transparency in every exterior area. No backdrop, cast shadow, scenery, speckles or stray pixels.

### Generic helicopter generation prompt

> Create a standalone illustrated generic civilian helicopter for the Overhead e-paper poster. The reference is for the wide nose-left side profile and clean painted aviation style. Draw a new believable model-neutral utility helicopter in level flight, exact orthographic side view, with a rounded cabin, dark slate windows, slender tail boom, conventional open tail rotor, level main rotor seen edge-on and fixed landing skids. Paint it matte pale dove gray with a slightly darker cool gray underside and charcoal rotors. Keep shapes crisp, simplified and smoothly filled. Use broad restrained gradients fully contained within clean, closed contours, with no texture or exterior effects. An unmarked helicopter only, with no branding, letters, flags, registration, rescue markings or accent stripe. Keep the entire silhouette, skids and rotor tips comfortably inside a wide canvas, with minimal antialiasing and true zero-alpha transparency in every exterior area, including the gap between the skids and body. No backdrop, cast shadow, scenery, speckles or stray pixels.

### Widerøe Dash 8-Q400 generation prompt

> Draw one crisp aircraft illustration for a color e-paper poster. Use attachment 1 (SAS illustration) for level nose-left placement and overall painted aircraft style. Use attachment 2 (LN-WDH) for Widerøe’s exact green-and-white livery and the Dash 8-Q400 airframe. Make a strict left-side elevation, level in flight, with gear stowed. Recognizable elongated Q400 fuselage, high straight wing, two green turboprop nacelles and swept propellers, tall green T-tail. Copy the green geometry, pale blue diamond and white bird on the fin, the dark green fuselage word “widerøe”, and the white nacelle word “wideroe.no”. Leave off the registration. Render smoothly filled closed shapes, with polished matte painted surfaces, modest shaded gradients entirely inside the silhouette, no grain and minimal detail. The entire aircraft is isolated on a true transparent RGBA canvas. Make the boundary clean and precise like a hard-edged vector mask with minimal antialiasing, crisp propeller edges, generous clear margins and no glows, mist, backdrop, silhouettes of objects behind it, or shadow. Include the entire nose, propeller tips and tail.

## Norwegian MAX 8, Widerøe E190-E2, and Norsk Luftambulanse H145

These three nose-left side profiles are 2172 × 724 PNGs with transparent backgrounds. They were generated with ChatGPT’s built-in image tool, using the SAS A320neo as the style reference for the airliners and the AW101 SAR Queen for the H145.

- The [Norwegian 737 MAX 8](../assets/aircrafts/airliners/737-max-8-norwegian-karin-boye.png) shows LN-FGF with its red nose and Karin Boye tail portrait. [LN-FGF photograph](https://www.aeroinside.com/21316/norwegian-b38m-at-malaga-on-nov-22nd-2025-another-aircraft-on-landing-runway)
- The [Widerøe E190-E2](../assets/aircrafts/airliners/e190-e2-wideroe.png) shows LN-WEA with its green nacelles and patterned green tail. [LN-WEA photograph by Valentin Hintikka](https://commons.wikimedia.org/wiki/File:Wider%C3%B8e,_LN-WEA,_Embraer_E190-E2_@_HEL.jpg) · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)
- The [Norsk Luftambulanse H145](../assets/aircrafts/helicopters/h145-norsk-luftambulanse.png) depicts the red-and-yellow five-blade H145 of the Norwegian Air Ambulance Foundation, cataloged as LN-OOA. [Airbus H145 delivery announcement and photograph](https://www.airbus.com/en/newsroom/press-releases/2020-09-norwegian-air-ambulance-foundation-receives-first-ever-five-bladed)

### Generation prompts

Each initial prompt used the following shared instructions, followed by the aircraft-specific paragraph.

> Create one original isolated aircraft illustration for the Overhead aviation display. The first attached artwork is the style reference only: copy its scale of detail, clean illustrated realism, slightly muted colors, dimensional soft shading, crisp outlines and understated highlights. The second attached photograph is the source for the requested airframe's paint and visual identity. Use a true orthographic port-side profile, nose pointing left, level in flight, with the complete aircraft and all slender features contained in frame. Keep an elongated horizontal composition with the subject centered and about 6% margin at either end. Use a genuine transparent alpha background with matte, smoothly filled shapes, restrained shading only inside clean closed contours and minimal edge antialiasing. No ground, sky, horizon, drop shadow, fake checkerboard, loose pixels, labels, frame, or embellishment. Match the photographic livery's colors, paint boundaries, recognizable markings and wordmark typography. Omit unreadable tiny lettering.

**Norwegian 737 MAX 8**

> Subject: Norwegian Air Shuttle Boeing 737 MAX 8 (737-8), LN-FGF, Karin Boye tail. The glossy red nose section stops abruptly behind the front cabin door, with a narrow dark divider and a white main fuselage. The lower forward red section carries the exact white lowercase wordmark ‘norwegian’. White and gray CFM LEAP-1B nacelles with serrated rear chevrons and MAX split-tip winglets with red tips. The white fin has a narrow red cap and navy stripe, a blue-gray illustrated portrait of the real Swedish poet Karin Boye, and a small red Karin Boye name strip matching the reference. Keep both landing gear and high-lift devices fully retracted. Give the real 737-8 its elongated fuselage, 737 nose glazing and proportions. The underside view and open landing gear in the photo are not the target pose.

**Widerøe E190-E2**

> Subject: Widerøe Embraer E190-E2, LN-WEA. White fuselage with the exact lowercase green ‘widerøe’ lettering with the slashed ø forward, dark forest-green nacelles (small white ‘wideroe.no’ text), and exact green tail design from the photo with angular green facets, white flying-bird mark and light turquoise diamond. Include the E2's smoothly up-swept raked wing tips, large PW1900G geared turbofans, distinctive narrow passenger jet proportions and conventional low-set horizontal tailplanes. Keep the landing gear and flaps fully retracted, cruise configuration. The underside view and open landing gear in the photo are not the target pose.

The final Widerøe artwork used this edit prompt to correct the wingtip.

> Edit the attached original Widerøe E190-E2 illustration for the Overhead aviation display. Keep its exact orthographic, level nose-left position, close aircraft proportions, white fuselage, visible PW1900G turbofan, ‘widerøe’ wordmark, green nacelle with small ‘wideroe.no’, small LN-WEA registration, and green tail with diamond and bird. Correct the exaggerated wing tip using the real E190-E2 geometry: the long gently flexed wing finishes in a shallow tapered tip that extends rearward at a low angle. Remove the tall upward fin. Refine the profile with smooth matte filled shapes and slight shadows entirely inside clean closed contours. Keep the whole plane on the same wide canvas with margin at the outer edges. Every area outside the complete aircraft is zero-alpha transparent. The aircraft must have a crisp vector-like outside silhouette with minimal antialiasing. Remove every detached white or colored fleck and haze from the surrounding empty space.

**Norsk Luftambulanse H145**

> Subject: Norsk Luftambulanse Norwegian Air Ambulance Foundation Airbus H145 D-3 LN-OOA, five-blade SmartLAB aircraft. Match exact red-and-yellow research aircraft shown in the photo: bright red fuselage and tail boom, dark panoramic glazing, prominent plain yellow ‘LEGE’ below the forward side glazing, thin diagonal fluorescent yellow safety stripes sweeping over the lower red body and along the tail boom, yellow vertical fin tips around a red ducted fan housing. Retain the H145 silhouette: compact round nose, broad side cabin with dark windows and closed doors, high slender tail boom, circular eight/ten-blade ducted Fenestron tail rotor within the fin, and two dark landing skids. Depict the bearingless five-blade main rotor assembly with sharply delineated thin blades as seen nearly edge-on, normal lighting without rotor blur, one hub. No people visible. The front-quarter view in the photo is not the target pose.

## Remaining artwork queue

ChatGPT’s built-in image tool generated 12 more level nose-left side profiles as transparent 2172 × 724 PNGs. The 10 model-specific fallbacks use unmarked pearl-gray paint and the closest ready illustration for airframe geometry.

### Model-specific fallback prompts

Each fallback used the shared prompt below, followed by its aircraft-specific instruction.

> Create one isolated illustration for the Overhead e-paper poster. Use the first attached image as the exact aircraft geometry reference and the second image, if present, as the reference for the poster's clean painted style. Draw the same airframe as a wide strictly level port-side elevation, nose to the left, full aircraft in frame with comfortable clear margins. Use smooth matte pearl-gray paint, a gently shaded cool gray underside, dark glazing, subtly distinct metal parts, and understated highlights. The entire aircraft wears plain, unmarked paint. Omit logos, text, flags, registrations, accent bands, and previous livery markings. Retain the cockpit, fuselage proportions, wing or rotor geometry, engines, tail, and other identifying details. Match the geometry reference's flight configuration. Use crisp smoothly filled contours, shading fully inside the silhouette, clear alpha around every edge and opening, and no exterior haze or flecks. Genuine transparent background, no scenery, shadow, text, or frame. Wide 3:1 composition.

**[Boeing 737-800](../assets/aircrafts/airliners/737-800-neutral.png)**

> Boeing 737-800 NG. Preserve the long narrow 737 fuselage, angular cockpit windows, fuselage window/door layout with two overwing exit doors, flattened CFM56 nacelle lower profile and clean rear edge, tall blended winglet in neutral gray, and tail. Wheels and flaps stowed for flight.

**[Airbus A320neo](../assets/aircrafts/airliners/a320neo-neutral.png)**

> Airbus A320neo. Retain the A320-family cockpit windows and rounded nose, long but compact narrowbody proportions, oversized LEAP-style nacelle from the reference, wing with recognizable swept raised sharklet, and conventional low tailplanes. Wheels and flaps stowed for flight. Keep the fuselage and engine cowling uniformly unmarked.

**[Leonardo AW101](../assets/aircrafts/helicopters/aw101-neutral.png)**

> Leonardo AW101. Retain the long tall utility cabin, tapered tail boom, five-blade main rotor with angular tips in side elevation, conventional multi-blade open tail rotor, main-gear sponson and characteristic upper engine fairing. Retain the exact AW101 airframe and gear configuration visible in the reference. Remove rescue, service and military lettering and all bright rescue paint.

**[Airbus H135](../assets/aircrafts/helicopters/h135-neutral.png)**

> Airbus H135. Preserve the compact rounded cockpit and short light cabin, two broad glazings forward, sculpted slim raised tail boom and distinctly small enclosed Fenestron fan in the vertical fin, a crisply drawn four-blade main rotor seen edge-on, and fixed black landing skids with an open gap beneath the body. Paint the whole aircraft a light neutral pearl gray, including the tail and upper body.

**[Sikorsky S-92](../assets/aircrafts/helicopters/s92-neutral.png)**

> Sikorsky S-92A. Preserve the long rectangular cabin, angled multi-pane nose windows, prominent main gear sponson, raised tapered tail boom, open tail rotor, main rotor and high transmission housing. Preserve the S-92A airframe and wheels-up configuration from the geometry illustration. Paint plain pearl gray with dark glass and gray rotor blades. Draw the four tail rotor blades clearly in an X, keeping all four tips within the image.

**[De Havilland Canada Dash 8-Q400](../assets/aircrafts/airliners/dash-8-q400-neutral.png)**

> De Havilland Canada Dash 8-Q400. Retain the unusually long fuselage, straight high wing, twin underwing turboprops with thin dark six-blade swept propellers, narrow gear nacelles, and tall T-tail. Aircraft in flight with gear stowed. The smooth opaque blades are visible without a motion-blur disc. Keep the entire nose, tail, and propellers in frame.

**[Boeing 737 MAX 8](../assets/aircrafts/airliners/737-max-8-neutral.png)**

> Boeing 737 MAX 8. Preserve the elongated 737 profile, angular nose glazing, split-tip MAX winglet with an upper and a smaller lower branch, larger LEAP-1B nacelle with distinctive serrated chevrons, and twin overwing exits. Gear stowed. Remove the reference's red nose and tail portrait and keep even unmarked pearl-gray paint.

**[Airbus H145](../assets/aircrafts/helicopters/h145-neutral.png)**

> Airbus H145 D-3. Preserve the rounded nose and long broad H145 cabin, panoramic dark glazing and separate doors, wide red-livery reference tail boom geometry, large circular shrouded Fenestron fan, bearingless five-blade main rotor seen edge-on, and fixed landing skids. Render the entire red/yellow areas as plain pearl-gray bodywork. Keep the H145 slightly more substantial visually than the H135.

**[Embraer E190-E2](../assets/aircrafts/airliners/e190-e2-neutral.png)**

> Embraer E190-E2. Preserve the characteristic forward cockpit and E2 regional-jet proportions, the prominent PW1900G geared turbofan and smooth, long slender tapered wingtip that continues the wing profile at a shallow angle. Retain the shallow E2 wing from the Widerøe reference, and keep its nacelles and tail in plain pearl gray. Wheels stowed.

**[Embraer E190](../assets/aircrafts/airliners/e190-neutral.png)**

> First-generation Embraer E190-100. Preserve the KLM reference's regional-jet proportions, small narrow CF34-10E turbofan, visible compact upward winglet, and conventional low tailplanes. Keep its fuselage, nacelle and tail entirely unmarked in pearl-gray paint. Stow gear and flaps.

### Operator livery prompts

Each livery used the shared prompt below, followed by its aircraft-specific instruction.

> Create one portrait illustration of an aircraft for the Overhead e-paper poster. The first attached PNG gives the clean painted style and the geometry if it shows the same airframe. The last attachment is a photograph for the requested aircraft's exact colors, markings, and model cues. Paint the complete aircraft in level flight in an orthographic port-side elevation, nose left, wide 3:1 frame, generous margins, smoothly filled contours, and restrained shading like the PNG. Keep all aircraft parts and rotor or wing tips within the frame. Transparent RGBA with a genuinely clear background around the aircraft. Omit sky, runway, backdrop, diffuse effects, cast shadows, watermarks or labels, and detached pixels. Clean silhouette with minimal antialiasing and all shading inside the outlines. Set tiny or illegible aircraft stencils aside.

**[KLM Cityhopper E190](../assets/aircrafts/airliners/e190-klm-cityhopper.png)**

The PH-EXV livery reference is a photograph by Alec Wilson. [PH-EXV photograph](https://commons.wikimedia.org/wiki/File:PH-EXV_(41742506571).jpg) · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)

> First-generation Embraer E190-100STD in KLM Cityhopper livery of PH-EXV. Match the photo’s azure-blue upper fuselage, thin dark navy dividing cheatline, silver-white lower fuselage, white tail fin with blue ‘KLM’ and its blue crown mark, white forward ‘KLM Cityhopper’ wordmark (KLM and crown prominent), and light gray nacelles. Include small registration PH-EXV aft if readable. Use the first-generation E190's relatively slender fuselage, short upturned winglets, swept wings and the smaller GE CF34-10E underwing nacelles. Wheels and flaps stowed for flight. Keep the nose pointing left, correctly oriented text. The roughly side-on photograph faces the other way and shows lowered gear.

**[CHC Helikopter Service S-92A](../assets/aircrafts/helicopters/s92-chc-helikopter-service.png)**

The LN-OQU livery reference is a photograph by DLFferozz. [LN-OQU photograph](https://www.jetphotos.com/photo/11670646)

> Sikorsky S-92A LN-OQU in CHC Helikopter Service's Norwegian offshore transport livery. Preserve the S-92A illustration's squared cabin, cockpit glazing, thick side sponsons, slightly raised tail boom, four-blade main rotor with crisp blades, open tail rotor and S-92A contours. Use retracted wheeled gear to match the reference illustration. Use the photograph only for livery: bright helicopter red on the roof and upper cabin, white on the lower fuselage, navy blue along the windows and on the tail boom and fin, a narrow white dividing stripe, and the small contrasting red fin accent. Reproduce the reference placement of dark ‘CHC HELIKOPTER SERVICE’ on the lower fuselage, small CHC emblem near the cockpit, and small white ‘LN-OQU’ on the navy tail boom. Paint a civilian offshore helicopter with no rescue title or extra equipment. Keep the nose pointing left with correctly oriented text.

The CHC illustration received this edit to correct the tail rotor.

> Make one localized correction to the attached finished transparent Sikorsky S-92A CHC Helikopter Service illustration. Correct the open tail rotor at the far right to exactly four blades on two diagonals that cross through the center of the hub, forming a clear X. The current top left, top right and lower right blades are joined by a matching fourth blade pointing down-left at about seven o’clock, opposite the upper-right blade. All four have matching gray shape and yellow tips. Preserve the entire existing nose-left S-92A composition, body geometry, fuselage and rotor-head details, full main rotor, rich red over white with blue tail livery, all markings and lettering, registration ‘LN-OQU’, and the original transparent background. Keep the complete aircraft and all four tail rotor blade tips within the 3:1 canvas. Smooth subtle shading within clean contours and genuine alpha around the aircraft.

## Southwest Norway artwork expansion

ChatGPT’s built-in image tool generated six operator liveries and four unmarked model fallbacks for this expansion. The side profiles are 2172 × 724 PNGs with transparent backgrounds. Aircraft type descriptions and neutral artwork are available for the Leonardo AW139 and AW189, Bombardier CRJ900, and Embraer E195-E2.

The yellow H145 depicts operational air ambulance aircraft, including LN-OOU photographed in Bergen. The red-and-yellow H145 artwork continues to depict the Foundation’s research aircraft LN-OOA. [Luftambulansetjenesten fleet and bases](https://www.luftambulanse.no/basene-vare/fartoyene-vare/)

### Livery references

| Illustration | ICAO type | Reference airframe | Sources |
| --- | --- | --- | --- |
| [Lufttransport AW139 offshore](../assets/aircrafts/helicopters/aw139-lufttransport-offshore.png) | `A139` | LN-OLK · `47AA2B` | [Stord Lufthamn photograph by Jan Morten Myklebust](https://www.stordlufthamn.no/nyhende/helikopter-pa-treningsflyging/) · [Address](https://aircraftregister.net/aircraft/LN-OLK) |
| [Lufttransport AW139 rescue](../assets/aircrafts/helicopters/aw139-lufttransport-rescue.png) | `A139` | LN-OLA · `47804B` | [Aircraft Register photograph by Martin Alexander Skaatun](https://aircraftregister.net/aircraft/LN-OLA) · [Address](https://aircraftregister.net/aircraft/LN-OLA) |
| [Lufttransport AW189 offshore](../assets/aircrafts/helicopters/aw189-lufttransport-offshore.png) | `A189` | LN-OEA · `47C2B5` | [Styrke photograph by Atle Espen Helgesen](https://styrke.no/nyhet/equinor-har-kjopt-helikoptre-med-darlig-stoydemping-i-kabinen/) · [Address](https://aircraftregister.net/aircraft/LN-OEA) · [Second view by Nils Mosberg](https://www.flickr.com/photos/nilsmosberg/54702224819/) |
| [Norsk Luftambulanse H145 yellow](../assets/aircrafts/helicopters/h145-norsk-luftambulanse-yellow.png) | `EC45` | LN-OOU · `47A2F4` | [JetPhotos photograph by Planespotter_livar](https://www.jetphotos.com/photo/11999535) · [Address](https://www.flightradar24.com/data/aircraft/ln-oou) |
| [SAS CRJ900 operated by CityJet](../assets/aircrafts/airliners/crj900-sas-cityjet.png) | `CRJ9` | EI-HSC · `4CAF13` | [JetPhotos photograph by R.Rimestad](https://www.jetphotos.com/photo/11822990) · [Address](https://www.airnavradar.com/data/registration/EI-HSC/2867242824) |
| [KLM Cityhopper E195-E2](../assets/aircrafts/airliners/e195-e2-klm-cityhopper.png) | `E295` | PH-NXU · `486802` | [AeroInside photograph by usf1fan2](https://www.aeroinside.com/21352/klm-cityhopper-e295-enroute-on-dec-1st-2025-avionics-or-electrical-problems) · [Address](https://adsbhive.org/aircraft/486802) · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |

### Additional airframe matches

| Aircraft | ICAO address | Artwork | Sources |
| --- | --- | --- | --- |
| LN-OEB | `4784ED` | [Lufttransport AW189 offshore](../assets/aircrafts/helicopters/aw189-lufttransport-offshore.png) | [Livery photograph](https://www.luftfahrtclubbraunschweig.de/picdb/photo/25540) · [Address](https://aircraftregister.net/aircraft/LN-OEB) |
| LN-OOX | `4786E7` | [Norsk Luftambulanse H145 yellow](../assets/aircrafts/helicopters/h145-norsk-luftambulanse-yellow.png) | [Livery photograph](https://www.saman.no/492342/contentassets/ed4e21b1e25e4812865f1cb33171686f/2024/mote-1-2024-i-ou-bergen-29.01.2024/sak-9-24---presentasjon---prehospital-plan.pdf) · [Address](https://www.flightradar24.com/data/aircraft/ln-oox) |
| EI-SCE | `4CAD95` | [SAS A320neo](../assets/aircrafts/airliners/a320neo-sas.png) | [Livery photograph](https://www.jetphotos.com/photo/11998432) · [Address](https://www.planespotters.net/airframe/airbus-a320neo-ei-sce-sas-scandinavian-airlines/3wpvj0) |

### Generation prompts

Each operator livery used the shared prompt below, followed by its aircraft-specific paragraph.

> Generate an original isolated painted aircraft illustration for the Overhead e-paper display. Attachment 1 shows the existing illustration style and, when it matches the aircraft, airframe geometry. Attachment 2 is a photograph of the exact aircraft and livery. The result is a strict port-side profile, nose left and level, with the complete airframe and hard-edged rotor blades fully in frame, 3:1 aspect ratio and generous clear margins. Match the reference illustration's crisp restrained realism, subtle internal shading and closed contours. Reconstruct the photographed paint scheme in side profile, using correctly oriented lettering. Transparent RGBA background, with clean pixels around the full contour and through any openings. Omit all scenery, people, captioning, blur, exterior shading, and detached flecks. Use shape and color for small graphics and keep only prominent readable lettering.

**Lufttransport AW139 offshore**

> Leonardo AW139 medium utility helicopter in the Lufttransport offshore passenger configuration of LN-OLK. Preserve the rounded stepped nose and glazing, four squarish side cabin windows, swept narrow tail boom, open four-blade tail rotor at the top of the tall swept fin, five-blade main rotor seen nearly edge-on, twin-turbine upper fairing and stowed retractable wheeled undercarriage. Use the photo's predominantly white fuselage, dark red sweep along the front upper cabin and down over its rear, white tail boom and fin, dark ‘LUFTTRANSPORT’ below the windows, and restrained matching rotor markings. Omit the registration. Keep the offshore aircraft's exact outline and paint distinct.

**Lufttransport AW139 rescue**

> Lufttransport Leonardo AW139 LN-OLA offshore search-and-rescue configuration. Use the branded reference only for its exact red-and-white paint and the SAR aircraft's full geometry. Red long nose and lower forward fuselage, red roof fairing and upper engine fairing, red tall swept tail and boom with a small Norwegian flag at the upper fin, broad white cabin band with a dark red Lufttransport round logo and white ‘RESCUE’ below the side cabin windows. Retain characteristic long nose with black sensor details, compact tall cabin, door with hoist and low small sponson where the photo shows them. Open four-blade tail rotor, five-blade main rotor nearly edge-on. Retract the wheels, close the doors, and omit visible people and registration.

**Lufttransport AW189 offshore**

> Leonardo AW189 in Lufttransport's blue and white offshore paint as carried by LN-OEA. Attachment 2 supplies the exact side markings. Attachment 3 shows the same helicopter in the air to clarify its body contours. Render the longer AW189 cabin and angular low nose, distinct swept tall fin and tapered tail boom, open four-blade tail rotor, large five-blade main rotor nearly edge-on, two turbines with their fairings, broad horizontal stabilizer and fully stowed wheeled gear. Match the bright white cabin, dark blue tail, blue stripe across the cabin and upper engine area, blue rear underside and small three red chevrons low along the forward fuselage where visible. Match the dark window placement across four cabin windows. Reverse the photograph's pose only, for a level nose-left side profile, and omit registration.

**Norsk Luftambulanse H145 yellow**

> Draw the operational Norsk Luftambulanse Airbus H145 D-2 LN-OOU in full bright yellow air ambulance livery. Compact blunt nose, broad wrap-around dark windshield, twin-engine roof, long cabin with closed doors, fixed dark skids, four-blade bearingless main rotor with blades seen edge-on, low tailplane and circular enclosed Fenestron tail fan. Closely follow the photo's dark glazing band, yellow main surfaces, small red anti-collision markings over top and tail, blue check pattern along the lower fuselage, and small blue ‘LEGE’ and ‘LUFTAMBULANSETJENESTEN’ below the side windows. Blue medical emblem on upper vertical fin if visible. Omit the registration to serve matching yellow fleet aircraft. Use a complete crisp side elevation, nose left.

**SAS CRJ900 operated by CityJet**

> Show the Bombardier CRJ900 in the SAS Scandinavian Airlines livery used by CityJet on EI-HSC. Use the exact reference proportions and paint. A long slender regional jet, distinctive pointed stepped CRJ nose and cockpit glazing, swept low wing with short upright blue winglet, two small rear-mounted engines flanking the aft fuselage, and horizontal stabilizers high on top of a blue T-tail. Wheels and flaps stowed. Follow the silver-white body, huge pale silver ‘SAS’ across the forward fuselage, three small Scandinavian flags aft above the windows, and big italic white ‘SAS’ on the deep blue tail. Include the exact small dark engine lettering only if readable. Omit registration and tiny stencils. Ensure the full T-tail and jet fit in frame and the fuselage is horizontal.

**KLM Cityhopper E195-E2**

> Draw the KLM Cityhopper Embraer E195-E2 of PH-NXU. The existing Widerøe E190-E2 illustration at attachment 3 is a reference for common E2 architecture and angle. The E195-E2 has a visibly stretched slim fuselage with a longer cabin and two adjacent overwing emergency exits, extended tapered gently flexed E2 wing tip at a shallow angle, no tall vertical winglet, two large underwing PW1900G geared turbofans, and a low-set conventional tailplane. Wheels and flaps stowed. Match PH-NXU's sky-blue upper fuselage with white ‘KLM Cityhopper’ at the forward cabin, a dark blue narrow dividing band, white underside and engine nacelles, and white tail with the blue KLM name and crown. Omit registration and tiny markings. Complete thin, level profile with a transparent background.

Each unmarked profile used the ready operator illustration for its geometry. The shared prompt below was followed by its aircraft-specific paragraph.

> Create an Overhead e-paper illustration of the same airframe as the attached geometry reference, in level nose-left port-side profile. Retain the precise silhouette, proportions, cockpit and dark glazing, flight configuration, and rotor or wing geometry. Repaint the aircraft in smooth pearl gray with restrained realistic shading, a cool gray underside and natural dark transparencies and blades. Omit operator marks, paint stripes, text, flags and registrations. Wide 3:1 frame, generous clear margins around every extremity, genuine transparent alpha background around the subject and through openings. Paint within precisely closed contours. No scenery, shadow, halo, debris, labels, motion blur or exterior effects.

**[AW139 neutral](../assets/aircrafts/helicopters/aw139-neutral.png)**

> Leonardo AW139 offshore passenger configuration. Keep the rounded stepped nose, the medium-size cabin and squarish windows, narrow swept tail boom, small open four-blade tail rotor, five-blade main rotor, and stowed wheel geometry from the illustration. Paint the dark red areas pearl gray.

**[AW189 neutral](../assets/aircrafts/helicopters/aw189-neutral.png)**

> Leonardo AW189 as drawn in the reference profile. Keep the long flat cabin with four large passenger windows, angular low nose, deep engine fairing, long swept blue-livery reference tail boom with open four-blade fan, crisp side-view main rotor and stowed wheels. Render the blue and red painted surfaces as smooth neutral bodywork.

**[CRJ900 neutral](../assets/aircrafts/airliners/crj900-neutral.png)**

> Bombardier CRJ900. Keep the very long and thin fuselage, angular nose, two overwing exits, the characteristic low swept wing, small winglet, rear-mounted turbofans, and tall T-tail. Wheels stowed. Paint all surfaces plain pearl gray and keep the silver body clear of any faint logos, even where the original logos are silver-on-silver.

**[E195-E2 neutral](../assets/aircrafts/airliners/e195-e2-neutral.png)**

> Embraer E195-E2. Keep the long stretched cabin with two adjacent overwing exit doors, low conventional horizontal tailplane, large geared turbofans, and the E2's long tapered wing with shallow wingtip and no upright winglet. Wheel doors closed for flight. Remove the blue paint, KLM markings and any colored accents.
