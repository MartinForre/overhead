# Southwest Norway cruise overflights and airline fleets

Fleet snapshot and queue update on 24 November 2026.

## How the airlines were selected

The shortlist ranks international passenger airlines by observed cruise traffic in the southwest coastal area. The sample covered 58.0–60.8° N and 4.7–7.4° E, including nearby offshore airspace, with tracks at or above 28,000 ft. It covers four 14-day windows in February, May, August and November 2026. The aircraft filter includes widebodies and Boeing 757s. The A321neo designator is shared by standard, LR and XLR variants, so this type is listed in the verified fleets only. Flights were grouped by the first three ICAO callsign characters and counted once per UTC date, airframe and callsign. [ADS-B dataset and methodology](https://github.com/ClickHouse/adsb.exposed) · [ICAO aircraft type designators](https://www.icao.int/operational-safety/doc-8643-aircraft-type-designators/search)

This is an archive sample. Coverage, seasonal schedules and daily routings affect the counts. Some callsigns cover wet-leased aircraft, and some flights may cross midnight or reuse a callsign in a day. EUROCONTROL documented a southwestward shift in transatlantic flows in 2025, so the ranking is worth refreshing as routes change. [EUROCONTROL overflight trends](https://www.eurocontrol.int/sites/default/files/2026-03/eurocontrol-seven-year-forecast-2026-2032-report.pdf)

| Rank | Airline | ICAO callsign prefix | Sampled passes | Types observed |
| ---: | --- | --- | ---: | --- |
| 1 | Turkish Airlines | `THY` | 909 | `A333`, `A359`, `B77W`, `B789` |
| 2 | Scandinavian Airlines | `SAS` | 538 | `A333`, `A359` |
| 3 | LOT Polish Airlines | `LOT` | 523 | `B772`, `B788`, `B789` |
| 4 | Qatar Airways | `QTR` | 389 | `A359`, `A35K`, `B77L`, `B77W` |
| 5 | Emirates | `UAE` | 355 | `A359`, `A388`, `B77L`, `B77W` |
| 6 | Etihad Airways | `ETD` | 260 | `A35K`, `A388`, `B789` |
| 7 | Air Canada | `ACA` | 166 | `A333`, `B77L`, `B77W`, `B788`, `B789` |
| 8 | Lufthansa | `DLH` | 136 | `A343`, `A359`, `A388`, `B744`, `B748`, `B789` |
| 9 | Icelandair | `ICE` | 119 | `B752`, `B763` |
| 10 | Hainan Airlines | `CHH` | 106 | `A332`, `A333`, `B789` |

Observed examples include Turkish Airlines TK7 from Istanbul to Washington Dulles, Lufthansa LH456 from Frankfurt to Los Angeles, Emirates EK216 from Los Angeles to Dubai, and Hainan HU407 from Beijing to Edinburgh. [TK7](https://www.flightaware.com/live/flight/THY7) · [LH456](https://www.lufthansa.com/lhg/us/en/o-d/cy-cy/frankfurt-los-angeles) · [EK216](https://www.emirates.com/us/english/destinations/lax/dxb/flights-from-los-angeles-to-dubai/) · [HU407](https://www.flightradar24.com/data/playback/42968343)

## Passenger aircraft by airline

The artwork catalog lists one representative livery per airline and aircraft type, plus one neutral fallback per ICAO type. The type catalog provides readable aircraft names. The queue prioritizes aircraft types seen in the sample, followed by the other fleet aircraft. Air Canada Express, Air Canada Rouge and KLM Cityhopper each have their own entries. [Artwork catalog](../assets/aircrafts/artwork.json) · [Aircraft type catalog](../assets/aircrafts/aircraft-types.json)

| Airline | Aircraft | Fleet sources |
| --- | --- | --- |
| Turkish Airlines | Airbus A319 (`A319`), Airbus A320 (`A320`), Airbus A321 (`A321`), Airbus A321neo (`A21N`), Boeing 737-800 (`B738`), Boeing 737-900ER (`B739`), Boeing 737 MAX 8 (`B38M`), Boeing 737 MAX 9 (`B39M`), Airbus A330-200 (`A332`), Airbus A330-300 (`A333`), Airbus A350-900 (`A359`), Boeing 777-300ER (`B77W`), Boeing 787-9 (`B789`) | [Turkish Airlines fleet](https://www.turkishairlines.com/en-ch/flights/fly-different/fleet/aircraft-type/) · [Mainline fleet by type](https://www.flightradar24.com/data/airlines/tk-thy/fleet) |
| Scandinavian Airlines | Airbus A319 (`A319`), Airbus A320 (`A320`), Airbus A320neo (`A20N`), Airbus A321LR (`A21N`), Airbus A330-300 (`A333`), Airbus A350-900 (`A359`), Embraer E195 (`E195`), Bombardier CRJ900 (`CRJ9`), ATR 72-600 (`AT76`) | [SAS fleet](https://www.sasgroup.net/about-sas/the-fleet/) · [SAS operations](https://www.sasgroup.net/career/teams/operations/pilot-jobs/Fleet-Operations/) |
| LOT Polish Airlines | Embraer E175 (short wing) (`E75S`), Embraer E190 (`E190`), Embraer E195 (`E195`), Embraer E195-E2 (`E295`), Boeing 737-800 (`B738`), Boeing 737 MAX 8 (`B38M`), Boeing 787-8 (`B788`), Boeing 787-9 (`B789`) | [LOT fleet](https://www.lot.com/us/en/explore/about-lot/fleet) · [LOT E175 designator](https://www.flightradar24.com/data/airlines/lo-lot/fleet) |
| Qatar Airways | Airbus A320 (`A320`), Airbus A321neo (`A21N`), Boeing 737 MAX 8 (`B38M`), Airbus A330-200 (`A332`), Airbus A330-300 (`A333`), Airbus A350-900 (`A359`), Airbus A350-1000 (`A35K`), Airbus A380-800 (`A388`), Boeing 777-200LR (`B77L`), Boeing 777-300ER (`B77W`), Boeing 787-8 (`B788`), Boeing 787-9 (`B789`) | [Qatar passenger fleet](https://www.qatarairways.com/en-us/fleet.html) · [737 MAX and other active types](https://www.flightradar24.com/data/airlines/qr-qtr/fleet) |
| Emirates | Airbus A350-900 (`A359`), Airbus A380-800 (`A388`), Boeing 777-200LR (`B77L`), Boeing 777-300ER (`B77W`) | [Emirates fleet](https://www.emirates.com/us/english/experience/our-fleet/) · [Emirates annual report](https://c.ekstatic.net/ecl/documents/annual-report/2025-2026.pdf) |
| Etihad Airways | Airbus A320 (`A320`), Airbus A320neo (`A20N`), Airbus A321 (`A321`), Airbus A321neo (`A21N`), Airbus A350-1000 (`A35K`), Airbus A380-800 (`A388`), Boeing 777-300ER (`B77W`), Boeing 787-9 (`B789`), Boeing 787-10 (`B78X`) | [Etihad fleet](https://www.etihad.com/en-gb/plan/fly-with-etihad/our-fleet) · [Current A320neo records](https://www.flightradar24.com/data/airlines/ey-etd/fleet) |
| Air Canada | Airbus A220-300 (`BCS3`), Airbus A320 (`A320`), Airbus A321 (`A321`), Airbus A321XLR (`A21N`), Boeing 737 MAX 8 (`B38M`), Airbus A330-300 (`A333`), Boeing 777-200LR (`B77L`), Boeing 777-300ER (`B77W`), Boeing 787-8 (`B788`), Boeing 787-9 (`B789`) | [Air Canada fleet](https://www.aircanada.com/ca/en/aco/home/fly/onboard/fleet.html) · [September 2026 fleet and transfer plan](https://content.presspage.com/uploads/3167/d2235e88-f49d-43ac-87d2-4d481f60caae/q32026aircanadamdampa-english.pdf) |
| Lufthansa | Airbus A319 (`A319`), Airbus A320 (`A320`), Airbus A320neo (`A20N`), Airbus A321 (`A321`), Airbus A321neo (`A21N`), Airbus A330-300 (`A333`), Airbus A340-300 (`A343`), Airbus A350-900 (`A359`), Airbus A350-1000 (`A35K`), Airbus A380-800 (`A388`), Boeing 747-400 (`B744`), Boeing 747-8 (`B748`), Boeing 787-9 (`B789`) | [Lufthansa fleet](https://www.lufthansa.com/de/en/seat-maps) · [A350-1000 entry into service](https://newsroom.lufthansagroup.com/en/new-lufthansa-airbus-a350-1000-to-fly-first-to-tokyo/) |
| Icelandair | De Havilland Canada Dash 8-200 (`DH8B`), De Havilland Canada Dash 8-Q400 (`DH8D`), Boeing 737 MAX 8 (`B38M`), Boeing 737 MAX 9 (`B39M`), Airbus A321LR (`A21N`), Boeing 757-200 (`B752`), Boeing 767-300ER (`B763`) | [Icelandair fleet](https://www.icelandair.com/about/our-fleet/) · [MAX 8 and MAX 9](https://www.icelandair.com/pl-pl/o-icelandair/nasza-flota/boeing-737-max/) |
| Hainan Airlines | Airbus A320neo (`A20N`), Airbus A321neo (`A21N`), Boeing 737-800 (`B738`), Boeing 737 MAX 8 (`B38M`), Airbus A330-200 (`A332`), Airbus A330-300 (`A333`), Airbus A330-900 (`A339`), Boeing 787-9 (`B789`) | [Hainan passenger fleet](https://www.hainanairlines.com/HUPortal/dyn/portal/DisplayPage?COUNTRY_SITE=GB&LANGUAGE=GB&PAGE=FLET&SITE=CBHZCBHZ) · [Tracked fleet](https://planefinder.net/data/airline/CHH/fleet) · [A330-900 in service](https://www.flightradar24.com/data/aircraft/B-32MU) |

### Existing airlines and additional liveries

| Airline | Aircraft | Fleet sources |
| --- | --- | --- |
| KLM Royal Dutch Airlines | Airbus A321neo (`A21N`), Boeing 737-700 (`B737`), Boeing 737-800 (`B738`), Boeing 737-900 (`B739`), Airbus A330-200 (`A332`), Airbus A330-300 (`A333`), Airbus A350-900 (`A359`), Boeing 777-200ER (`B772`), Boeing 777-300ER (`B77W`), Boeing 787-9 (`B789`), Boeing 787-10 (`B78X`) | [KLM fleet](https://www.klm.com/information/travel-class-extra-options/aircraft-types) · [September 2026 group fleet report](https://www.airfranceklm.com/sites/default/files/2026-11/2026-q3-afklm-press-release.pdf) · [October A350 debut](https://news.klm.com/klms-first-airbus-a350-flight-to-toronto/) |
| KLM Cityhopper | Embraer E175 (long wing) (`E75L`), Embraer E190 (`E190`), Embraer E195-E2 (`E295`) | [KLM fleet](https://www.klm.com/information/travel-class-extra-options/aircraft-types) · [E175 long-wing designator](https://www.flightradar24.com/data/airlines/kl-klm/fleet) |
| Air Canada Express | De Havilland Canada Dash 8-Q400 (`DH8D`), Bombardier CRJ900 (`CRJ9`), Embraer E175 (short wing) (`E75S`) | [Jazz aircraft operated as Air Canada Express](https://flyjazz.com/en/operations/air-canada-express/) · [E75S designator](https://www.faa.gov/sites/faa.gov/files/2026-04/NAARMO_Canada_RVSM_Approvals.pdf) |
| Air Canada Rouge | Airbus A319 (`A319`), Airbus A320 (`A320`), Airbus A321 (`A321`), Boeing 737 MAX 8 (`B38M`) | [Air Canada Rouge MAX transition](https://www.aircanada.com/ca/en/aco/home/book/routes-and-partners/flying-rouge.html) · [September 2026 fleet](https://content.presspage.com/uploads/3167/d2235e88-f49d-43ac-87d2-4d481f60caae/q32026aircanadamdampa-english.pdf) |
| Widerøe | De Havilland Canada Dash 8-100 (`DH8A`), De Havilland Canada Dash 8-200 (`DH8B`), De Havilland Canada Dash 8-300 (`DH8C`), De Havilland Canada Dash 8-Q400 (`DH8D`), Embraer E190-E2 (`E290`) | [Widerøe fleet](https://www.wideroe.no/en/about-wideroe/fleet) |
| Norwegian | Boeing 737-800 (`B738`), Boeing 737 MAX 8 (`B38M`) | [Norwegian fleet](https://www.norwegian.com/en/about/our-story/our-aircraft/) |
| Saudia (`SVA`) | Airbus A320-200 (`A320`), A321-200 (`A321`), A321neo and A321XLR (`A21N`), A330-300 (`A333`), Boeing 777-300ER (`B77W`), 787-9 (`B789`), 787-10 (`B78X`) | [Saudia fleet](https://www.flightradar24.com/data/airlines/sv-sva/fleet) · [A321XLR delivery](https://ww.spa.gov.sa/en/N2604350) |
| EgyptAir (`MSR`) | Airbus A320neo (`A20N`), A321neo (`A21N`), A330-200 (`A332`), A330-300 (`A333`), A350-900 (`A359`), Boeing 737-800 (`B738`), 737 MAX 8 (`B38M`), 777-300ER (`B77W`), 787-9 (`B789`) | [EgyptAir fleet](https://www.egyptair.com/en/about-egyptair/fleet/Pages/default.aspx) · [A330-200 passenger operation](https://bea.aero/en/investigation-reports/notified-events/detail/serious-incident-to-the-airbus-a330-registered-su-gci-operated-by-egyptair-on-24-08-2026-at-jeddah/) · [A350-900 delivery](https://www.airbus.com/en/newsroom/press-releases/2026-02-egyptair-takes-delivery-of-its-first-of-16-airbus-a350-900-aircraft) · [737 MAX delivery](https://investors.boeing.com/investors/news/press-release-details/2026/EgyptAir-Takes-Delivery-of-First-Boeing-737-MAX-Jet/default.aspx) |
| EgyptAir Cargo (`MSX`) | Airbus A330-200P2F (`A332`), Boeing 737-800SF (`B738`) | [A330-200P2F conversions](https://www.elbeflugzeugwerke.com/en/news/news-detail/efw-marks-latest-a330p2f-programme-milestone-with-egyptair-cargo/) · [EgyptAir group annual report](https://www.egyptair.com/en/about-egyptair/Documents/ANNUAL%20REPORT%202022-2023.pdf) |
| Jet2.com (`EXS`) | Airbus A321-200 (`A321`), A321neo (`A21N`), Boeing 737-300 (`B733`), 737-800 (`B738`) | [November 2026 Jet2 fleet report](https://www.jet2plc.com/-/media/Jet2/Jet2plc/Jet2Plc_Redesign2025/Reports/2026/Interim_results/Jet2_plc_Interim_Results_Presentation_2026.pdf) |

The Saudia catalog also covers the 777F (`B77L`) flown under the Saudia callsign. The anniversary 777-300ER HZ-AK28 and the five verified A321XLRs use airframe matches. Other `SVA` flights reporting `A21N` use the representative A321neo artwork. [Saudia Cargo fleet](https://cms.saudiacargo.com/getmedia/cc777931-54c1-4a7c-8c74-126e3a382d01/Our-Fleet.pdf?ext=.pdf) · [HZ-AK28](https://www.planespotters.net/airframe/boeing-777-300er-hz-ak28-saudia/e9jg4d) · [Saudi aircraft records](https://midrma.com/en/rvsm/approvalList/sa)

EgyptAir Cargo aircraft match by registration or ICAO address when they fly under a mainline callsign. Jet2 uses the silver-and-red Jet2.com livery for its representative 737-800 and Jet2holidays paint for the 737-300 and both A321 versions. [EgyptAir Cargo airframes](https://planefinder.net/data/airline/MSX/fleet) · [Jet2.com 737-800](https://www.jetphotos.com/photo/11690008) · [Jet2holidays A321neo](https://www.jet2.com/news/2026/07/Jet2_welcomes_the_30th_brand_new_Airbus_A321neo_aircraft_into_its_fleet)

### Fleet changes and wet leases

- SAS’s current widebodies are the A330-300 and A350-900. The A340 appears in the queue as Lufthansa’s A340-300. Lufthansa retired its A340-600 in October 2026 and has planned the first passenger flight of its centenary A350-1000 for 3 December. [SAS fleet](https://www.sasgroup.net/about-sas/the-fleet/) · [Lufthansa A340-600 retirement](https://newsroom.lufthansagroup.com/en/lufthansa-bids-farewell-to-its-last-airbus-a340-600-and-continues-its-fleet-renewal/) · [Lufthansa A350-1000 debut](https://newsroom.lufthansagroup.com/en/new-lufthansa-airbus-a350-1000-to-fly-first-to-tokyo/)
- KLM’s A350-900 entered passenger service on 30 October 2026. The catalog includes the first aircraft, PH-ZNA (`486905`), as a reference for the planned illustration. [KLM inaugural flight](https://news.klm.com/klms-first-airbus-a350-flight-to-toronto/) · [PH-ZNA ADS-B address](https://planefinder.net/data/aircraft/PH-ZNA)
- LOT’s observed Boeing 777-200ER services used partner aircraft. Its own long-haul entries are the two Dreamliner variants. [LOT’s partner-operated aircraft](https://www.lot.com/fr/en/explore/about-lot/fleet/aircraft-operating-for-lot-polish-airlines) · [euroAtlantic fleet](https://www.euroatlantic.pt/en/fleet-eaa/)
- Icelandair’s 757-200 and 767-300ER were both observed. Both passenger types are scheduled to leave the fleet in January 2027. Air Canada is transferring its MAX 8s to Rouge through 2026. [Icelandair interim report](https://attachment.news.eu.nasdaq.com/a162f5a4069698aca969541d0def64d4b) · [Air Canada Rouge plan](https://www.aircanada.com/ca/en/aco/home/book/routes-and-partners/flying-rouge.html)
- Hainan publishes a 787-8 cabin layout. The latest corroborated 787-8 flight was in October, followed by a storage report. The queue uses the active types verified for this update. [Hainan fleet guide](https://www.hainanairlines.com/HUPortal/dyn/portal/DisplayPage?COUNTRY_SITE=GB&LANGUAGE=GB&PAGE=FLET&SITE=CBHZCBHZ) · [Example 787-8 flight record](https://www.flightera.net/en/planes/B-2750) · [Storage record](https://mail.b787register.co.uk/airframe.php?ln=262)

## KLM and Ryanair fleet coverage

Standard livery artwork is ready for all 11 KLM mainline passenger types and all three KLM Cityhopper types. The KLM 737-700, 737-800 and 737-900 use PH-BGI, PH-BXV and PH-BXR as examples for matching ADS-B data. The A320neo was dropped from KLM's fleet plan in November 2026. [KLM aircraft types](https://www.klm.com/information/travel-class-extra-options/aircraft-types) · [KLM's November fleet update](https://news.klm.com/klm-takes-action-to-strengthen-its-position-and-keep-the-netherlands-connected-to-the-world/)

The SkyTeam 737-900 PH-BXO is ready. The SkyTeam Cityhopper E190 PH-EZX, Orange Pride 777-300ER PH-BVA, and KLM Cargo 747-400ERFs PH-CKA, PH-CKB and PH-CKC operated by Martinair are queued. Those paint schemes resolve by airframe. [737-900 SkyTeam photo](https://www.jetphotos.com/photo/12175957) · [E190 SkyTeam photo](https://flightcatcherpro.com/photos/reg/PH-EZX) · [Orange Pride photo](https://www.jetphotos.com/photo/12271635) · [Current KLM Cargo photos](https://www.planespotters.net/photos/airline/KLM-Cargo)

Ryanair Group was outside the scope of the original long-haul shortlist. These entries cover its passenger fleet and distinct group paint schemes as of November 2026. Ryanair lists the MAX 10 on order for delivery starting in spring 2027. [Ryanair Group fleet](https://corporate.ryanair.com/about-us/our-fleet/) · [Ryanair's 2026 annual filing](https://www.sec.gov/Archives/edgar/data/1038683/000110465926076131/tmb-20260331x20f.htm)

All six Ryanair Group illustrations below are ready.

| Paint | Aircraft | Lookup |
| --- | --- | --- |
| Standard Ryanair | Boeing 737-800 (`B738`), 737 MAX 8-200 (`B38M`) | Ryanair DAC, Ryanair UK, Buzz and Malta Air as the representative livery. [737-800 photo](https://www.jetphotos.com/photo/12254161) · [737-8200 photo](https://www.planespotters.net/photo/1995030/ei-ill-ryanair-boeing-737-8200-max) · [Ryanair UK 737-8200 photo](https://www.planespotters.net/photo/1952433/g-ryma-ryanair-uk-boeing-737-8200-max) |
| Ryanair paint operated by Buzz | Boeing 737-700 (`B737`) | SP-RUM. [Photograph](https://www.jetphotos.com/photo/12251287) · [ADS-B address](https://www.flightradar24.com/data/aircraft/sp-rum) |
| Buzz | Boeing 737 MAX 8-200 (`B38M`) | SP-RZA through SP-RZH. [Buzz paint on SP-RZA](https://www.jetphotos.com/photo/12253268) · [Buzz fleet](https://www.flightradar24.com/data/airlines/rr-rys/fleet) |
| Malta Air | Boeing 737 MAX 8-200 (`B38M`) | 9H-VUA through 9H-VUF. [Malta Air paint on 9H-VUA](https://www.jetphotos.com/photo/12248563) · [Registrations in Malta Air colors](https://www.planetrackapp.com/airlines/malta/malta-air) |
| Lauda Europe | Airbus A320-200 (`A320`) | Lauda Europe (`LDA`), with 9H-LOB as an example. [Photograph](https://www.jetphotos.com/photo/12237972) · [Lauda fleet](https://www.planespotters.net/airline/Lauda-Europe) |

Both the standard 737 MAX 8 and the higher-capacity 737-8200 use the ICAO type code `B38M`. The Ryanair Group references show the 737-8200's additional exit behind the wing. The existing neutral MAX 8 remains the fallback for this shared type code. [ICAO designator reference](https://www.icao.int/sites/default/files/APAC/Meetings/2024/2024%20RASMAG-29/3-Working%20Papers/WP03-Outcomes-of-RASMAG-MAWG-and-RMACG-Meetings.pdf)

## Reproducing the sample

This ClickHouse query uses the visualizer’s public `planes_mercator` table. The Mercator bounds correspond to the coordinates above. The cargo exclusions cover known freighter types or registration series for Turkish Airlines, Emirates, and Qatar Airways. The passenger airline shortlist was then selected from the ranked prefixes. [Public query interface and schema](https://github.com/ClickHouse/adsb.exposed#database-and-queries)

```sql
SELECT substring(trim(aircraft_flight), 1, 3) AS operator,
       uniqExact(tuple(toDate(time), icao, trim(aircraft_flight))) AS observed,
       arraySort(groupUniqArray(t)) AS types,
       arraySort(groupUniqArray(8)(trim(aircraft_flight))) AS example_callsigns
FROM planes_mercator
WHERE mercator_x BETWEEN 2203556831 AND 2235769086 AND mercator_y BETWEEN 1227932965 AND 1293600827
  AND ((time >= '2026-02-09' AND time < '2026-02-23')
    OR (time >= '2026-05-11' AND time < '2026-05-25')
    OR (time >= '2026-08-10' AND time < '2026-08-24')
    OR (time >= '2026-11-09' AND time < '2026-11-23'))
  AND altitude >= 28000
  AND match(trim(aircraft_flight), '^[A-Z]{3}[0-9]')
  AND t IN ('A332','A333','A338','A339','A342','A343','A345','A346','A359','A35K','A388','B742','B743','B744','B748','B752','B753','B762','B763','B764','B772','B773','B77L','B77W','B788','B789','B78X')
  AND NOT (
    (operator = 'THY' AND (t = 'B77L' OR r IN ('TC-JOY','TC-JOZ')))
    OR (operator = 'UAE' AND (t = 'B744' OR startsWith(r, 'A6-EF')))
    OR (operator = 'QTR' AND t = 'B77L' AND startsWith(r, 'A7-BF'))
  )
GROUP BY operator
ORDER BY observed DESC, operator
LIMIT 30
FORMAT TSVWithNames
```

## First overflight artwork batch

These three left-facing profiles use the approved [SAS A320neo illustration](../assets/aircrafts/airliners/a320neo-sas.png) as the style reference. Each saved file is a 2172 × 724 transparent PNG. The profiles were checked on light and dark backgrounds. The catalog includes an exact aircraft match for each photographed registration.

| Illustration | Aircraft | References |
| --- | --- | --- |
| [SAS Airbus A330-300](../assets/aircrafts/airliners/a330-300-sas.png) | LN-RKT (`47880D`) | [Livery photo](https://www.flickr.com/photos/shanair/55325447520) · [ICAO address](https://planetrack.ai/aircraft/ln-rkt) |
| [Turkish Airlines Airbus A350-900](../assets/aircrafts/airliners/a350-900-turkish-airlines.png) | TC-LGE (`4BB0E5`) | [Livery photo](https://www.euronews.com/travel/2022/09/27/qatar-airways-singapore-airlines-emirates-whats-the-worlds-top-rated-airline) · [Current livery](https://www.jetphotos.com/photo/12222234) · [ICAO address](https://www.flightradar24.com/data/aircraft/tc-lge/) |
| [LOT Polish Airlines Boeing 787-8](../assets/aircrafts/airliners/787-8-lot-polish-airlines.png) | SP-LRC (`48AE02`) | [Livery photo](https://higherthanjumbojets.pl/galeria/476/lot-polish-airlines-boeing-787-dreamliner-sp-lrc-sp-lra-warsaw-chopin-international-airport-17-01-2020) · [Current livery](https://www.jetphotos.com/photo/12054358) · [ICAO address](https://www.planespotters.net/hex/48AE02) |

### Generation prompts

Each first render used the shared prompt followed by the corresponding aircraft paragraph.

> Draw one original aircraft illustration for the Overhead e-paper poster. Attachment 1 supplies the approved painted illustration style, level nose-left port-side angle, understated realistic shading and clean outlines. Attachment 2 is the aircraft and paint reference. Redraw the exact model in a true port-side elevation, nose left, wings and fuselage level in flight, clean cruise configuration with landing gear and flaps stowed. Keep the whole aircraft and all extremities inside a wide 3:1 canvas with clear margins. Match the large readable markings, paint boundaries and airframe proportions. Use matte, smooth closed contours and subtle gradients wholly inside the aircraft. Omit the individual registration and tiny stencils. Use genuine transparent alpha with very clean, crisp edges and clear space around the aircraft. No ground, sky, shadow, backdrop, keyline, outer glow, halo, speckles or caption.

#### SAS Airbus A330-300

> Airbus A330-300 (A330-343) in the modern standard silver and blue SAS livery pictured on LN-RKT after its June 2026 repaint. Retain the A330-300's long widebody fuselage, traditional Airbus cockpit windows, four paired cabin doors, twin underwing Rolls-Royce Trent 700 nacelles, swept A330 wings and short distinct upward winglets painted deep blue. Match matte silver-white paint, very large subtle pale silver ‘SAS’ on the front fuselage, the blue tail sweeping down onto the aft fuselage and large white italic ‘SAS’ on the fin. Preserve the small Scandinavian flags in the aft cabin area and the silver engine cowling with a thin deep blue front band and small legible ‘Scandinavian’ in dark gray. The aircraft has the standard livery on LN-RKT, with no anniversary paint. Use the photo's shape and color details, with the aircraft turned nose-left and the gear stowed.

> Correct the cabin-door layout in this finished SAS A330-300 side-profile illustration. Attachment 1 is the edit target and attachment 2 is LN-RKT in the new SAS colors. The A330 has four full-size rectangular passenger doors spaced apart along the visible side. Keep the first door behind the cockpit and the last door near the aft end. Remove the two adjacent short overwing hatches at mid-fuselage and restore the window line there. Add one full-sized door just ahead of the wing root, at about one third of the fuselage length, and a second full-sized door behind the wing root, at about two thirds of the fuselage length. Follow the photo's A330 door spacing from nose to tail. Keep the existing LN-RKT silver and blue paint, exact SAS lettering and flags, nacelle lettering, cruise pose and proportions. Preserve the complete wide image with true transparency around the aircraft and clean smooth edges. Keep each flag in its correct Scandinavian colors.

> Make a framing-only revision of this transparent SAS Airbus A330-300 illustration. Preserve the existing depiction and left-facing side profile, including the exact silver-blue paint layout, four separate full-size cabin doors, two engines, conventional A330-300 triangular wingtip fence, shape, lighting, and markings. Zoom out so the aircraft takes up about 87 percent of the canvas width and is centered horizontally. Leave a broad strip of fully transparent empty space on every edge, with at least 100 pixels of transparent padding beyond the nose on the left and the complete tail and horizontal stabilizer on the right. Every part of the aircraft needs to be whole and well inside the canvas. Use the same aspect ratio, real transparent background, no ground, no backdrop, no borders. Only revise the framing.

## Second overflight artwork batch

The built-in image tool produced six standard airline liveries and seven unmarked model fallbacks. All 13 files are 2172 × 724 transparent PNGs with left-facing profiles. The saved images were checked on light and dark backgrounds, and the kiosk resolves the liveries by operator and aircraft type and the unmarked profiles by aircraft type.

| Illustration | Paint | Reference |
| --- | --- | --- |
| [Airbus A330-300](../assets/aircrafts/airliners/a330-300-neutral.png) | Unmarked | [Geometry reference](../assets/aircrafts/airliners/a330-300-sas.png) |
| [Airbus A350-900](../assets/aircrafts/airliners/a350-900-neutral.png) | Unmarked | [Geometry reference](../assets/aircrafts/airliners/a350-900-turkish-airlines.png) |
| [Boeing 787-8](../assets/aircrafts/airliners/787-8-neutral.png) | Unmarked | [Geometry reference](../assets/aircrafts/airliners/787-8-lot-polish-airlines.png) |
| [Boeing 787-9](../assets/aircrafts/airliners/787-9-turkish-airlines.png) | Turkish Airlines | [Reference photograph](https://commons.wikimedia.org/wiki/File:Turkish_Airlines,_TC-LLC,_Boeing_787-9_Dreamliner_(49566382111).jpg) |
| [Boeing 787-9](../assets/aircrafts/airliners/787-9-neutral.png) | Unmarked | [Geometry reference](../assets/aircrafts/airliners/787-9-turkish-airlines.png) |
| [Boeing 777-300ER](../assets/aircrafts/airliners/777-300er-turkish-airlines.png) | Turkish Airlines | [Reference photograph](https://commons.wikimedia.org/wiki/File:Turkish_Airlines,_TC-JJU,_Boeing_777-3F2_ER_(43482227390).jpg) |
| [Boeing 777-300ER](../assets/aircrafts/airliners/777-300er-neutral.png) | Unmarked | [Geometry reference](../assets/aircrafts/airliners/777-300er-turkish-airlines.png) |
| [Airbus A350-1000](../assets/aircrafts/airliners/a350-1000-qatar-airways.png) | Qatar Airways | [Reference photograph](https://commons.wikimedia.org/wiki/File:Qatar_Airways_Airbus_A350-1000_(A7-ANA).jpg) · [Airline](https://www.qatarairways.com/en-us/fleet.html) |
| [Airbus A350-1000](../assets/aircrafts/airliners/a350-1000-neutral.png) | Unmarked | [Geometry reference](../assets/aircrafts/airliners/a350-1000-qatar-airways.png) |
| [Airbus A350-900](../assets/aircrafts/airliners/a350-900-sas.png) | Scandinavian Airlines | [Reference photograph](https://commons.wikimedia.org/wiki/File:Scandinavian_Airlines_Airbus_A350-900_SE-RSF_departing_SFO,_4-20-2026.jpg) · [Airline](https://www.sasgroup.net/newsroom/press-releases/2019/sas-presents-new-livery/) |
| [Boeing 787-9](../assets/aircrafts/airliners/787-9-lot-polish-airlines.png) | LOT Polish Airlines | [Reference photograph](https://commons.wikimedia.org/wiki/File:LOT,_SP-LSA,_Boeing_787-9_Dreamliner_(47630812361).jpg) |
| [Airbus A380-800](../assets/aircrafts/airliners/a380-800-emirates.png) | Emirates | [Reference photograph](https://www.jetphotos.com/photo/12050668) · [Airline](https://www.emirates.com/media-centre/emirates-unveils-new-signature-livery-for-its-fleet/) |
| [Airbus A380-800](../assets/aircrafts/airliners/a380-800-neutral.png) | Unmarked | [Geometry reference](../assets/aircrafts/airliners/a380-800-emirates.png) |

### Generation prompts

Most illustrations used the shared prompt followed by the relevant aircraft paragraph. The delivery prompts for the unmarked 777-300ER and LOT 787-9 used additional catalog references to get a clean cutout.

> Create an original aircraft recognition illustration for the Overhead color e-paper poster. Use a strict level port-side profile with the nose facing left, gear and flaps fully stowed. Match the catalog's painted realism with soft matte shading, readable large forms and clean antialiased edges. Keep the complete aircraft inside a wide 3:1 canvas, centered and occupying about 87–90% of its width, with generous clear margins. Use genuine transparent alpha and smooth clean contours. The sole subject is the aircraft: no ground, backdrop, cast shadow, glow, tiny exterior specks, captions, frame, or readable registration.

#### Airbus A330-300 · Unmarked

> The attached approved same-model profile supplies both the style and the exact aircraft geometry. Keep the fuselage length, wing and tip shapes, cockpit glazing, door spacing, engine and tail shapes. Repaint the entire aircraft in pale neutral gray-white with restrained cool gray shading. Remove all branding, emblems, flags, letters, colored accents and livery fields. Preserve dark windows and realistic seams. Long A330-300 body with four full-size doors along the side, classic Airbus cockpit window outline, short triangular A330 wingtip fence, conventional engines and tail.

#### Airbus A350-900 · Unmarked

> The attached approved same-model profile supplies both the style and the exact aircraft geometry. Keep the fuselage length, wing and tip shapes, cockpit glazing, door spacing, engine and tail shapes. Repaint the entire aircraft in pale neutral gray-white with restrained cool gray shading. Remove all branding, emblems, flags, letters, colored accents and livery fields. Preserve dark windows and realistic seams. Broad dark wraparound cockpit mask, long curved upturned wingtip merging smoothly into the wing, four cabin doors, and wide white Trent XWB nacelles.

#### Boeing 787-8 · Unmarked

> The attached approved same-model profile supplies both the style and the exact aircraft geometry. Keep the fuselage length, wing and tip shapes, cockpit glazing, door spacing, engine and tail shapes. Repaint the entire aircraft in pale neutral gray-white with restrained cool gray shading. Remove all branding, emblems, flags, letters, colored accents and livery fields. Preserve dark windows and realistic seams. Short Dreamliner body, swept raked wingtip, compact dark cockpit glazing smoothly following the sloping rounded nose, and scalloped nacelles.

#### Boeing 787-9 · Turkish Airlines

> Attachment 1 is the approved art style and nose-left side-profile composition. Attachment 2 is the exact model and standard livery reference photo. Use its proportions and paint with gear retracted. Boeing 787-9 Dreamliner in standard Turkish Airlines paint on TC-LLC. Give the -9 its long fuselage, distinct smooth sloping Boeing 787 cockpit, two white scalloped nacelles, four widely spaced doors, and long swept wings with smoothly raked tips. Use white paint, bold dark navy “TURKISH AIRLINES” above the forward windows, small Turkish flag by the lettering, faint pale gray tulip flourishes at the rear, and a red fin with the white circular flying-bird emblem. Match that layout from the photo and reverse the aircraft's direction. Keep text readable left to right.

#### Boeing 787-9 · Unmarked

> The attached approved same-model profile supplies both the style and the exact aircraft geometry. Keep the fuselage length, wing and tip shapes, cockpit glazing, door spacing, engine and tail shapes. Repaint the entire aircraft in pale neutral gray-white with restrained cool gray shading. Remove all branding, emblems, flags, letters, colored accents and livery fields. Preserve dark windows and realistic seams. Keep the longer 787-9 fuselage and clean cockpit slope, both raked wing tips and the engine chevrons.

#### Boeing 777-300ER · Turkish Airlines

> Attachment 1 is the approved art style and nose-left side-profile composition. Attachment 2 is the exact model and standard livery reference photo. Use its proportions and paint with gear retracted. Boeing 777-300ER in standard Turkish Airlines paint as shown on TC-JJU. Draw the very long widebody fuselage with classic Boeing 777 nose and cockpit windows, five separate full-height doors along the port side, very large white GE90-115B turbofans with smooth round nacelle trailing edges, raked wingtips with no upright winglets, and a long tapering tail cone. Match white body, dark navy “TURKISH AIRLINES”, small Turkish flag, light gray tulip aft, and red fin with its large white circular flying-bird emblem. The secondary aircraft in the photo is not part of the illustration.

#### Boeing 777-300ER · Unmarked

> Make an isolated transparent PNG of an unmarked Boeing 777-300ER to match the Overhead aviation illustration catalog. Image 1 is the approved Turkish 777-300ER for the exact aircraft geometry. Image 2 is the approved neutral A330 for the pale white-gray finish and genuine cutout treatment. Keep the 777, with its distinctly long fuselage, five full-size doors, classic Boeing cockpit, large smooth-ended GE90 engine nacelles and raked wings, all airborne nose-left in strict level port-side profile. Repaint only the aircraft itself in blank pale gray-white, with dark glazing and crisp outlines. No letters, emblems, flags, accents or livery fields. Keep a wide 3:1 composition and clear space around all aircraft extremities. The complete exterior of the aircraft contour should have pixel alpha 0. Preserve fully transparent corners and clear space with no wash, ground, shadow, fog, gradient, paper texture or edge tint. Clean, dry background cutout only.

#### Airbus A350-1000 · Qatar Airways

> Attachment 1 is the approved art style and nose-left side-profile composition. Attachment 2 is the exact model and standard livery reference photo. Use its proportions and paint with gear retracted. Airbus A350-1000 in standard Qatar Airways livery as shown on A7-ANA. Distinctively stretched -1000 fuselage, wraparound dark cockpit mask, four widely spaced full-height doors, smoothly bending and tapered wing tips swept upward with burgundy accent, twin wide Trent XWB-97 nacelles. Copy the photographed pale gray upper fuselage and white underside, large burgundy serif “QATAR” forward with small burgundy Arabic “القطرية” placed as in the photo, light gray fin with sweeping bands and the burgundy oryx, and small burgundy oryx on the nacelle. Keep the visible right side of the aircraft out of the final view.

#### Airbus A350-1000 · Unmarked

> The attached approved same-model profile supplies both the style and the exact aircraft geometry. Keep the fuselage length, wing and tip shapes, cockpit glazing, door spacing, engine and tail shapes. Repaint the entire aircraft in pale neutral gray-white with restrained cool gray shading. Remove all branding, emblems, flags, letters, colored accents and livery fields. Preserve dark windows and realistic seams. Keep the particularly long A350-1000 fuselage, black cockpit mask, softly curved wingtip and large Trent XWB engines.

#### Airbus A350-900 · Scandinavian Airlines

> Attachment 1 is the approved art style and nose-left side-profile composition. Attachment 2 is the exact model and standard livery reference photo. Use its proportions and paint with gear retracted. Airbus A350-900 in SAS's standard modern silver-and-blue livery on SE-RSF. Preserve the A350-900's smoothly tapered nose with black wraparound cockpit mask, long gray nacelles, broad curved upward dark blue wingtips, and four separately spaced full-size doors. Match the standard blue swept paint field from the tail fin to the lower aft fuselage, white italic 'SAS' tail mark, understated large pale silver 'SAS' across the forward body below the cabin-window line, small Scandinavian flags near the rear, and thin blue bands around the light gray engine intakes with 'Scandinavian' on the nacelle. Use neutral daylight and pale matte silver-white paint, even though the photo was shot under a dark cloud.

#### Boeing 787-9 · LOT Polish Airlines

> Both attached images are clean transparent artwork. Image 1 is the precise Boeing 787-9 geometry and size reference. Image 2 is the existing Boeing 787-8 artwork for LOT paint and branding. Match Image 1's -9 length and doors, using Image 2's colors and readable paint marks. Boeing 787-9 Dreamliner in standard LOT Polish Airlines livery on SP-LSA. Show the stretched, longer -9 proportions, four separate full-size doors, characteristic sloping cockpit glazing, long swept raked wing, and chevrons at the nacelle trailing edge. The white fuselage carries the large dark navy stylized “LOT” forward across the windows and smaller “POLISH AIRLINES” above them. Match the photographed rich navy tail with the white outlined crane in a circle and thin red stripe at its base. Keep the small navy LOT nacelle mark as shown. Deliver a fully isolated airplane cutout, with the complete external background at zero alpha including all canvas edges and corners. Aircraft only.

#### Airbus A380-800 · Emirates

> Attachment 1 is the approved art style and nose-left side-profile composition. Attachment 2 is the exact model and standard livery reference photo. Use its proportions and paint with gear retracted. Airbus A380-800 in Emirates' standard 2023 refreshed livery. Attachment 2 shows the refresh on A6-EVG before any promotional livery. Draw the complete double deck, two continuous staggered window rows, rounded high A380 cockpit and deep blunt fuselage, tall fin, broad wings with distinct small tip fences, and four separate engines in geometry with the far-side engines naturally occluded in strict side profile. White body, large metallic gold “Emirates” and corresponding gold Arabic branding in the photographed positions, red A380 tip fences, flowing UAE red, green, white and black flag on the tail with shading inside its boundaries. Keep the aircraft side entirely free of campaign paint, slogans and promotional graphics.

#### Airbus A380-800 · Unmarked

> The attached approved same-model profile supplies both the style and the exact aircraft geometry. Keep the fuselage length, wing and tip shapes, cockpit glazing, door spacing, engine and tail shapes. Repaint the entire aircraft in pale neutral gray-white with restrained cool gray shading. Remove all branding, emblems, flags, letters, colored accents and livery fields. Preserve dark windows and realistic seams. Keep the A380's two complete cabin window rows, high cockpit and deep wide fuselage, tall fin and four-engine arrangement. In this direct side view, both near-side engines are visible and both far-side engines are hidden by the fuselage or foreground engines. Preserve the small wingtip fence shape.

#### Turkish Airlines Airbus A350-900

> Airbus A350-900 (A350-941) in standard Turkish Airlines livery as photographed on TC-LGE. Preserve the A350-900's rounded tapered nose with characteristic black wraparound cockpit window mask, two large white Rolls-Royce Trent XWB nacelles, long flexed swept wings with smoothly curved upward wingtip and red outer paint, conventional tailplane and widebody four-door cabin. Draw the exact white fuselage, bold dark navy uppercase ‘TURKISH AIRLINES’ above the forward cabin windows, small Turkish flag by the front, very pale gray stylized tulip sweeping across the rear cabin, red fin and large white circle with the airline's stylized flying-bird emblem. Match the tail logo and red wingtip marking from the photo. Draw level and nose left.

> Refine the existing Turkish Airlines Airbus A350-900 side profile in attachment 1. Attachment 2 shows the correct real TC-LGE nose and cabin. Make the characteristic Airbus A350 wraparound black cockpit mask clear around the side glazing, extending as a dark tapered sweep behind the windows under the smooth contoured windscreen, visually distinguish it from an A330 nose. Make the four separately spaced full-size boarding doors match the photo. Keep the forward door near the nose, one forward of the wing, one aft of the wing with some outline visible near the tulip motif, and one in front of the tail. Keep the clean nose-left, gear-up profile, painted style and whole aircraft from attachment 1. Match the real red wingtip, rear pale tulip, flag, deep navy text exactly ‘TURKISH AIRLINES’, red fin and white emblem. Keep the transparent alpha, clear margins and exact closed aircraft contour.

#### LOT Polish Airlines Boeing 787-8

> Boeing 787-8 Dreamliner in standard LOT Polish Airlines livery as photographed on SP-LRC. Preserve the distinctive rounded Boeing 787 stepped sloping nose, -8 short widebody proportions, four paired cabin doors, long flexed swept wing with a smooth raked tip, large white Rolls-Royce Trent 1000 engines with chevron trailing edges, and clean closed wing and gear surfaces. Paint the white body with the huge dark navy stylized ‘LOT’ forward spanning the cabin-window line, smaller dark ‘POLISH AIRLINES’ above the forward window line, and navy fin containing the white outlined circular crane emblem. Keep the thin red-and-white paint accent at the base of the fin, the small LOT engine mark and other large livery details visible in the reference. Keep all type and branding readable and the aircraft flying nose-left.

> Refine the finished LOT Polish Airlines Boeing 787-8 illustration in attachment 1. The side photograph in attachment 2 shows the correct short 787-8 body and the real livery. Keep the approved artwork's full gear-up nose-left side profile, navy LOT fuselage logo, exact small ‘POLISH AIRLINES’ and ‘LOT’ nacelle mark, dark navy tail with white crane, thin red tail trim, and smoothly raked wings and scalloped nacelles. Make the port-side cabin door layout accurate: four full-height door outlines spaced along the body, one behind the cockpit, one just behind the forward LOT marking and immediately before the wing root, a third immediately behind the wing root, and a fourth toward the tail. Keep the flowing 787 nose and cockpit outline, clean alpha around all extremities and an authentic painted finish with restrained shading.

## KLM 737s and Ryanair Group artwork

The built-in image tool generated ten left-facing aircraft profiles. Each is a 2172 × 724 PNG with transparent alpha. The artwork was checked on light and dark backgrounds and matched through the kiosk’s artwork lookup.

| Illustration | Paint | Source |
| --- | --- | --- |
| [Boeing 737-700](../assets/aircrafts/airliners/737-700-klm.png) | KLM Royal Dutch Airlines | [Photograph](https://commons.wikimedia.org/wiki/File:KLM_Boeing_737-700_PH-BGI_(31076095737).jpg) |
| [Boeing 737-800](../assets/aircrafts/airliners/737-800-klm.png) | KLM Royal Dutch Airlines | [Photograph](https://commons.wikimedia.org/wiki/File:KLM_Boeing_737_PH-BXV_Oslo_Gardermoen_2024_(02).jpg) |
| [Boeing 737-900](../assets/aircrafts/airliners/737-900-klm.png) | KLM Royal Dutch Airlines | [Photograph](https://www.aeroinside.com/16541/klm-b739-at-amsterdam-on-jan-2nd-2021-rejected-takeoff-due-to-door-indication) · [Additional reference](https://commons.wikimedia.org/wiki/File:KLM_-_Royal_Dutch_Airlines_Boeing_737-9K2_PH-BXR_(21516991318).jpg) |
| [Boeing 737-900](../assets/aircrafts/airliners/737-900-klm-skyteam.png) | KLM SkyTeam | [Photograph](https://commons.wikimedia.org/wiki/File:Boeing_737-900_(KLM)_(5101789224).jpg) · [Additional reference](https://www.jetphotos.com/photo/12175957) |
| [Boeing 737-800](../assets/aircrafts/airliners/737-800-ryanair.png) | Ryanair | [Photograph](https://www.aeroinside.com/20520/ryanair-b738-near-prague-on-mar-12th-2025-smoke-on-board) |
| [Boeing 737 MAX 8-200](../assets/aircrafts/airliners/737-max-8-200-ryanair.png) | Ryanair | [Photograph](https://www.jetphotos.com/photo/11850981) |
| [Boeing 737-700](../assets/aircrafts/airliners/737-700-buzz-ryanair.png) | Ryanair livery (Buzz) | [Photograph](https://commons.wikimedia.org/wiki/File:SP-RUM_B737-700_Buzz_(Ryanair)%2C_Palma_de_Mallorca_09-06-26.jpg) |
| [Boeing 737 MAX 8-200](../assets/aircrafts/airliners/737-max-8-200-buzz.png) | Buzz | [Photograph](https://commons.wikimedia.org/wiki/File:SP-RZF_-_Boeing_737_MAX_8-200_-_Buzz_STN_050926.jpg) |
| [Boeing 737 MAX 8-200](../assets/aircrafts/airliners/737-max-8-200-malta-air.png) | Malta Air | [Photograph](https://commons.wikimedia.org/wiki/File:Malta_Air_Boeing_737_9H-VUC_Milan_Bergamo_2024_(01).jpg) |
| [Airbus A320-200](../assets/aircrafts/airliners/a320-lauda-europe.png) | Lauda Europe | [Photograph](https://commons.wikimedia.org/wiki/File:Lauda_Europe%2C_9H-LOB%2C_Airbus_A320-232_(52267575870).jpg) · [Additional reference](https://www.aeroinside.com/20839/lauda-europe-a320-near-marseille-on-jun-23rd-2025-smoke-on-board) |

### Generation prompts

Each first render used the shared prompt followed by the corresponding aircraft paragraph.

> Create an original aircraft recognition illustration for the Overhead color e-paper display. Attachment 1 shows the approved side-profile artwork style: clean painted realism, matte soft shading, and crisp edges. Draw a strict level left-facing port-side elevation, airborne in clean cruise configuration with gear and flaps fully stowed. Keep the entire aircraft horizontally centered with ample clear margin at both ends on a wide 3:1 canvas. Use a genuine transparent alpha background. Every part outside the aircraft should be fully clear, with no sky, ground, gradient, haze, shadow, glow, labels or other objects. Omit individual registrations and tiny stencils. Match the specific airframe and visible livery details.

#### Boeing 737-700 · KLM Royal Dutch Airlines

> Attachment 2 shows KLM PH-BGI and supplies both livery and airframe geometry. Reflect the view to nose-left while keeping all lettering readable left to right. Boeing 737-700, distinctly short 33.6 m Next Generation airframe with a compact cabin, two main cabin doors and exactly one small overwing exit outline on the visible side. Preserve the angular 737NG cockpit, twin CFM56-7B turbofans with subtly flattened lower nacelles and conventional non-serrated exhausts, and tall simple blended wingtips. Apply KLM’s current livery with a vivid sky-blue upper fuselage, white underside and a thin dark-navy boundary stripe curved downward near the radome. Keep the white tail and blue KLM crown and lettering, and the white crown and KLM titles with smaller “Royal Dutch Airlines” just above the forward cabin windows. Keep any small readable markings from the photo subordinate to those titles.

#### Boeing 737-800 · KLM Royal Dutch Airlines

> Attachment 2 supplies KLM livery on PH-BXV. Attachment 3 is a catalogue Boeing 737-800 for its correct 39.5 m body and level profile geometry. Paint the specific KLM Boeing 737-800, with the longer 737NG cabin and two adjacent small overwing exit outlines visibly above the wing. Preserve the angular 737NG cockpit, twin CFM56-7B turbofans with subtly flattened lower nacelles and conventional non-serrated exhausts, and tall simple blended wingtips. Apply KLM’s current livery with a vivid sky-blue upper fuselage, white underside and a thin dark-navy boundary stripe curved downward near the radome. Keep the white tail and blue KLM crown and lettering, and the white crown and KLM titles with smaller “Royal Dutch Airlines” just above the forward cabin windows. Keep any small readable markings from the photo subordinate to those titles.

#### Boeing 737-900 · KLM Royal Dutch Airlines

> Attachment 2 is a standard KLM Boeing 737-900; use it for the current paint, proportions and angles. Attachment 3 shows the mapped PH-BXR airframe as a near side-profile geometry reference. Draw the very long 42.1 m Boeing 737-900 with angular 737NG glazing, two small adjacent overwing exits, forward and aft boarding doors, tall blended winglets and slightly flattened CFM56-7B underwing nacelles. Match the standard current KLM livery: vivid sky-blue fuselage above a white underside with a slim navy boundary stripe curved down towards the radome, white fin with blue crown and KLM marks, white KLM titles with ‘Royal Dutch Airlines’ above the forward windows, and clean white nacelles with small blue marks. Match the color and stripe placement in Attachment 2.

#### Boeing 737-900 · KLM SkyTeam

> Attachment 2 shows PH-BXO for the actual elongated 42 m Boeing 737-900 and SkyTeam paint. Draw the early 737-900 with two main cabin doors and two adjacent little overwing exits, no extra aft mid-cabin door. Preserve the angular 737NG cockpit, twin CFM56-7B turbofans with subtly flattened lower nacelles and conventional non-serrated exhausts, and tall simple blended wingtips. Reproduce the KLM SkyTeam special paint: light pearlescent silver-gray airframe with a slightly darker gray underside, thin wide-spaced dark blue “SKYTEAM” titles forward above the windows, small blue KLM crown and “KLM” just behind the front door below the window line, broad dark-blue looping SkyTeam ribbon across the aft fuselage, and a deep navy fin with its white spiral SkyTeam emblem. Match the complete ribbon arrangement in the reference. Do not use the standard KLM sky-blue upper fuselage.

#### Boeing 737-800 · Ryanair

> Attachment 2 shows standard paint on a Ryanair Boeing 737-800. Attachment 3 is an existing 737-800 for its side-profile geometry. Show the 39.5 m 737 Next Generation airframe nose left, with angular cockpit, slightly flattened CFM56-7B nacelles with smooth non-serrated edges, two adjacent small overwing exit outlines, no extra post-wing exit, and the blended wingtip shape in the photo. Keep the white upper fuselage and deep navy belly, the fine bright yellow dividing stripe, large dark navy ‘RYANAIR’ ahead of the wing with its small blue harp ahead of the titles on this port side, and the gold winged harp centered on the deep navy fin. Retain the white engine tops, thin yellow band and navy undersides. Lettering must read normally when the photo's direction is reversed.

#### Boeing 737 MAX 8-200 · Ryanair

> Attachment 2 shows the correct Boeing 737 MAX 8-200 in standard Ryanair livery. Draw the 39.5 m 737-8200, with two adjacent small overhead wing exit outlines and the distinctive extra full-height emergency exit behind the wing but forward of the rear boarding door. Draw tall split-tip MAX winglets and rounded CFM LEAP-1B nacelles with a row of small scallops at their rear. Follow the white upper fuselage, deep navy underside and tail, hairline bright yellow stripe between the white and navy, large dark navy uppercase ‘RYANAIR’ forward with its small navy harp, and large gold winged harp on the navy fin. Keep the specific white nacelle with navy underside and thin yellow boundary band. Paint the winglets deep navy with a small yellow marking, matching the picture.

#### Boeing 737-700 · Ryanair livery (Buzz)

> Attachment 2 shows the exact Buzz-operated aircraft SP-RUM. Reproduce the noticeably short 33.6-m Boeing 737-700, one small overwing exit visible on the near side, tall navy blended winglet with the small yellow Raynair-style detail visible in the photo, two conventional CFM56 nacelles with flattened bottoms, and distinctive compact cabin. Standard Ryanair livery with white upper fuselage, deep navy lower fuselage and tail, a thin gold-yellow stripe above the navy belly, large dark navy uppercase “RYANAIR” on the forward cabin, and the large correctly shaped gold winged harp emblem on the navy tail. Match SP-RUM's white forward nacelle with its thin yellow stripe and navy bottom, and paint the aircraft in the Ryanair colors photographed on this registration.

#### Boeing 737 MAX 8-200 · Buzz

> Attachment 2 shows Buzz SP-RZF in its own paint, and supplies the airframe shape and all paint. Draw a Boeing 737 MAX 8-200, also called 737-8200, with the 39.5-m MAX 8 body, angular 737 cockpit windows, two small adjacent overwing exits, and the distinct extra full-height emergency exit behind the wing but clearly forward of the rear boarding door. Use the correct taller split-tip MAX winglets, very rounded CFM LEAP-1B nacelles, and short scallops at their trailing edge. Preserve those three major visible differences from a 737-800. Match the clean white upper fuselage, subtle gray lower fuselage with a yellow boundary stripe, oversized playful slab-serif yellow “BUZZ” with bold black outline above the forward windows, the yellow tail that sweeps onto the lower rear fuselage and its large friendly black-and-yellow cartoon bee mascot with white wings in the photo. Paint the wingtip segments with black-and-yellow bands. Reproduce the small yellow and black “BUZZ” engine marking visible in the reference.

#### Boeing 737 MAX 8-200 · Malta Air

> Attachment 2 shows real Malta Air paint on 9H-VUC. Draw a Boeing 737 MAX 8-200, also called 737-8200, with the 39.5-m MAX 8 body, angular 737 cockpit windows, two small adjacent overwing exits, and the distinct extra full-height emergency exit behind the wing but clearly forward of the rear boarding door. Use the correct taller split-tip MAX winglets, very rounded CFM LEAP-1B nacelles, and short scallops at their trailing edge. Preserve those three major visible differences from a 737-800. Reproduce the white fuselage with large deep red “MALTA AIR” above the forward cabin window line, a dark red belly with its sloped boundary at the ends, and the light-gray and white repeating decorative tail pattern with the distinct dark red eight-point Maltese cross as shown. Keep the small red title on the light gray engines and the reference’s red and yellow wingtip accents. Maintain a sober matte finish and match the red Maltese cross on the fin.

#### Airbus A320-200 · Lauda Europe

> Attachment 2 shows Lauda Europe 9H-LOB and provides the real geometry and paint. Airbus A320-232 CEO, with a compact rounded classic Airbus nose and conventional cockpit glazing, two adjacent small overwing exits, small classic Airbus wingtip fences and smooth IAE V2500 nacelles. Turn nose-left while keeping all lettering readable. Use the photographed white and subtle light-gray fuselage, large bright red uppercase “LAUDA” above the forward windows, large simple red angular bent-ribbon shape on the white vertical fin, small matching “LAUDA” title on each engine, thin red line on the belly and the small red aft doorside livery mark. Keep the visible subject clean and airborne.

> Make a small accuracy edit to Attachment 1, the existing illustrated transparent Lauda Europe Airbus A320-232. In the second attachment the actual 9H-LOB clearly has the original Airbus A320-200 wingtip fence. Replace the tall red upturned wingtip in the illustration with the very short red two-sided A320ceo wingtip fence shown on that aircraft, a tiny upward triangle and even smaller downward triangle exactly at the end of the wing. Its vertical height should be about one-quarter of the previous tall red wingtip. Remove the extra small red arrow-shaped graphic hovering midway up the aft fuselage so the side matches the photographed port side. Preserve the large LAUDA titles, the original red tail logo and thin red belly stripe, the clean strict nose-left side profile, engine shape, two overwing exits, and the matching painted style. Keep the illustration entirely in frame with fully transparent alpha surrounding the complete aircraft.

## Remaining standard KLM and Cityhopper artwork

The built-in image tool completed nine standard-livery profiles. Each file is a 2172 × 724 transparent PNG with a left-facing side profile. The saved files were checked on light and dark backgrounds and verified through the kiosk artwork lookup.

| Illustration | Livery | Reference aircraft |
| --- | --- | --- |
| [Airbus A330-200](../assets/aircrafts/airliners/a330-200-klm.png) | KLM Royal Dutch Airlines | PH-AOM · [Photograph](https://airlinersnow.com/Airbus-A330/a3302-008-Airbus-A330-KLM.htm) |
| [Airbus A330-300](../assets/aircrafts/airliners/a330-300-klm.png) | KLM Royal Dutch Airlines | PH-AKB · [Photograph](https://www.flugzeug-bild.de/bild/fluggesellschaften~europa~klm-royal-dutch-airlines-kl-klm/137814/klm-airbus-a330-300-ph-akb-21082020-amsterdam-schiphol.html) |
| [Airbus A350-900](../assets/aircrafts/airliners/a350-900-klm.png) | KLM Royal Dutch Airlines | PH-ZNA · [Photograph](https://www.airbus.com/en/newsroom/press-releases/2026-10-klm-royal-dutch-airlines-takes-delivery-of-its-first-airbus-a350-900) |
| [Boeing 777-200ER](../assets/aircrafts/airliners/777-200er-klm.png) | KLM Royal Dutch Airlines | PH-BQO · [Photograph](https://www.flugzeug-bild.de/bild/fluggesellschaften~europa~klm-royal-dutch-airlines-kl-klm/159189/klm-royal-dutch-airlines-ph-bqo-boeing.html) |
| [Boeing 777-300ER](../assets/aircrafts/airliners/777-300er-klm.png) | KLM Royal Dutch Airlines | PH-BVK · [Photograph](https://www.flugzeug-bild.de/bild/fluggesellschaften~europa~klm-royal-dutch-airlines-kl-klm/158656/klm-royal-dutch-airlines-ph-bvk-boeing.html) |
| [Boeing 787-9](../assets/aircrafts/airliners/787-9-klm.png) | KLM Royal Dutch Airlines | PH-BHD · [Photograph](https://www.aeroinside.com/15186/klm-b789-over-atlantic-on-dec-26th-2020-cracked-windshield) |
| [Boeing 787-10](../assets/aircrafts/airliners/787-10-klm.png) | KLM Royal Dutch Airlines | PH-BKF · [Photograph](https://www.flugzeug-bild.de/bild/fluggesellschaften~europa~klm-royal-dutch-airlines-kl-klm/160024/klm-royal-dutch-airlines-ph-bkf-boeing.html) |
| [Airbus A321neo](../assets/aircrafts/airliners/a321neo-klm.png) | KLM Royal Dutch Airlines | PH-AXC · [Photograph](https://www.planespotters.net/photo/1811554/ph-axc-klm-royal-dutch-airlines-airbus-a321-252nx) |
| [Embraer E175 (long wing)](../assets/aircrafts/airliners/e175-long-wing-klm-cityhopper.png) | KLM Cityhopper | PH-EXG · [Photograph](https://www.flugzeug-bild.de/bild/flughaefen~niederlande~amsterdam-schiphol-ams/160117/klm-cityhopper-ph-exg-embraer-erj-175std-msn.html) |

### Generation prompts

Each first render used the shared prompt followed by the corresponding aircraft paragraph.

> Create an original aircraft recognition illustration for Overhead’s color e-paper poster. Attachment 1 supplies only the existing catalogue’s matte painted finish, restrained shading and clear contour detail. Attachment 2 is a real photograph of the exact aircraft model and paint. Draw a strict level nose-left port-side elevation with all gear and flaps completely stowed. Rotate a nose-right photo as needed and make the visible lettering read normally. Keep the complete aircraft centered on a wide 3:1 canvas, occupying roughly 90 percent of the width with clear padding at the nose, tail and wing tips. Use real transparent alpha, zero opacity around the isolated aircraft, crisp antialiased edges, no ground, scenery, captions, haze or shadows. Use typical aircraft markings and omit legible registrations, tiny stencils and commemorative markings.

#### Airbus A330-200

> Draw the Airbus A330-200 on PH-AOM, the compact 58.8 m A330 with a noticeably shorter distance between the four passenger doors and a slightly taller tail relative to the fuselage. Preserve the classic Airbus cockpit, short upright triangular wingtip fences, rounded smooth-ended gray-white GE CF6 nacelles, and typical A330 tailcone. Ignore the other aircraft and ground equipment. Use current standard KLM paint as in Attachment 2: vivid sky-blue body above a white lower fuselage with a fine dark-navy boundary stripe that sweeps downward near the nose, a white tail with the blue KLM crown and letters, white KLM titles and smaller “Royal Dutch Airlines” high on the forward blue fuselage, and white engine nacelles with the appropriate small blue mark if shown. Keep the white tail, blue body boundaries, nose shape, contours and unmistakable type differences from the photo.

> Correct one aircraft geometry detail in the first image, a KLM Airbus A330-200 in our existing painted catalogue style. The A330-200 has four separately spaced full-size passenger doors along the visible fuselage. Keep the first door close to the cockpit, the second door just ahead of the wing root and the rear door in place. Add the missing third full-size door immediately behind the wing root, at roughly two-thirds of the length of the fuselage, just beyond the near wingtip in this side elevation. Match its top and height to the existing rectangular door outlines and route the cabin windows around it naturally. Refer to the actual A330-200 in attachment 2. Preserve the short 58.8 m fuselage, color, readable KLM marks, scale, airframe silhouette, and clean left-facing profile. Keep the full aircraft comfortably in frame and the surrounding pixels truly transparent. Deliver only the complete corrected aircraft.

#### Airbus A330-300

> Draw the Airbus A330-300 on PH-AKB, the 63.7 m A330 with a visibly longer middle fuselage and four full-size doors per side spaced apart. Preserve the classic Airbus nose shape, short upright triangular wingtip fences, twin smooth-ended GE CF6 engines and low-set wings. Omit the pale KLM centenary ‘100’ badge seen in the historic photo. Use current standard KLM paint as in Attachment 2: vivid sky-blue body above a white lower fuselage with a fine dark-navy boundary stripe that sweeps downward near the nose, a white tail with the blue KLM crown and letters, white KLM titles and smaller “Royal Dutch Airlines” high on the forward blue fuselage, and white engine nacelles with the appropriate small blue mark if shown. Keep the white tail, blue body boundaries, nose shape, contours and unmistakable type differences from the photo.

#### Airbus A350-900

> Draw the 66.8 m Airbus A350-900 on PH-ZNA, matching its rounded tapering nose and characteristic black wraparound cockpit mask, four full-size cabin doors, the tall smoothly blended upward curved tips of its swept wings, broad Rolls-Royce Trent XWB nacelles with smooth rear cowls, and A350 fin shape. Match Airbus’s photo of the first KLM aircraft and keep its full registration off the rendered profile. Use current standard KLM paint as in Attachment 2: vivid sky-blue body above a white lower fuselage with a fine dark-navy boundary stripe that sweeps downward near the nose, a white tail with the blue KLM crown and letters, white KLM titles and smaller “Royal Dutch Airlines” high on the forward blue fuselage, and white engine nacelles with the appropriate small blue mark if shown. Keep the white tail, blue body boundaries, nose shape, contours and unmistakable type differences from the photo.

#### Boeing 777-200ER

> Draw KLM’s Boeing 777-200ER on PH-BQO. Preserve the 63.7 m standard 777 early widebody length, four separately spaced full-size doors, angular 777 cockpit, round smooth-ended GE90 nacelles, standard tapered tips with no upward winglets or long -300ER rake, and long flattened 777 tailcone. Keep the shorter fore and aft fuselage lengths consistent with the photo. Show the standard blue KLM markings. Use current standard KLM paint as in Attachment 2: vivid sky-blue body above a white lower fuselage with a fine dark-navy boundary stripe that sweeps downward near the nose, a white tail with the blue KLM crown and letters, white KLM titles and smaller “Royal Dutch Airlines” high on the forward blue fuselage, and white engine nacelles with the appropriate small blue mark if shown. Keep the white tail, blue body boundaries, nose shape, contours and unmistakable type differences from the photo.

> Correct the port-side door layout of the first attachment, a completed KLM Boeing 777-200ER illustration. Preserve its classic short-body 777-200ER geometry, smooth GE90 nacelles, shape, livery lettering, and matte painted finish. It has four separately spaced full-size passenger doors from nose to tail, as seen in the second attachment. In the first illustration, preserve the doors behind the nose, just ahead of the wing, and by the rear cabin. Add the missing third door aft of the wing root in the blue cabin, with the top visible above the upper edge of the near wing and the lower portion naturally hidden behind the wing if they overlap. Match the height and rectangular outlines of the existing doors, with gaps in the passenger window line at door positions. Keep the complete left-facing aircraft in a centered wide 3:1 profile and preserve genuine transparent alpha in all space around the aircraft.

#### Boeing 777-300ER

> Draw KLM’s Boeing 777-300ER on PH-BVK, with the visibly longer 73.9 m hull, five separately spaced full-size doors, the normal 777 cockpit outline, extra-large smooth-ended GE90-115B engines, long swept raked wingtip extensions and the older-style flattened 777 tailcone. Match the distinct stretch against the clearly measured fuselage in the photograph. Use standard blue KLM paint only. Use current standard KLM paint as in Attachment 2: vivid sky-blue body above a white lower fuselage with a fine dark-navy boundary stripe that sweeps downward near the nose, a white tail with the blue KLM crown and letters, white KLM titles and smaller “Royal Dutch Airlines” high on the forward blue fuselage, and white engine nacelles with the appropriate small blue mark if shown. Keep the white tail, blue body boundaries, nose shape, contours and unmistakable type differences from the photo.

#### Boeing 787-9

> Draw KLM’s Boeing 787-9 Dreamliner on PH-BHD, the 62.8 m Dreamliner. Preserve the distinctly smooth sloping 787 nose, wide rounded cockpit glazing, four separately spaced full-size doors, the swept gently raked wing beginning to bend up in cruise, and two GEnx nacelles with clearly visible short exhaust chevrons. Keep the -9 proportions and standard KLM paint. Use current standard KLM paint as in Attachment 2: vivid sky-blue body above a white lower fuselage with a fine dark-navy boundary stripe that sweeps downward near the nose, a white tail with the blue KLM crown and letters, white KLM titles and smaller “Royal Dutch Airlines” high on the forward blue fuselage, and white engine nacelles with the appropriate small blue mark if shown. Keep the white tail, blue body boundaries, nose shape, contours and unmistakable type differences from the photo.

#### Boeing 787-10

> Draw KLM’s Boeing 787-10 Dreamliner on PH-BKF, the long 68.3 m Dreamliner with visibly greater fore and aft cabin lengths than the -9. Preserve the gently sloped Dreamliner nose and cockpit, four full-size door openings spaced farther apart, long flexible swept raked wing tips, and white GEnx nacelles with clear chevron edges. Render the photographed standard KLM blue aircraft without special anniversary paint. Use current standard KLM paint as in Attachment 2: vivid sky-blue body above a white lower fuselage with a fine dark-navy boundary stripe that sweeps downward near the nose, a white tail with the blue KLM crown and letters, white KLM titles and smaller “Royal Dutch Airlines” high on the forward blue fuselage, and white engine nacelles with the appropriate small blue mark if shown. Keep the white tail, blue body boundaries, nose shape, contours and unmistakable type differences from the photo.

#### Airbus A321neo

> Draw KLM’s stretched 44.5 m Airbus A321-252NX A321neo on PH-AXC. Preserve the longer 321 body behind and ahead of the wing, angular A320-family cockpit, large smooth white LEAP-1A engines and tall triangular sharklets. Match the delivered A321neo Airbus Cabin Flex arrangement in the photograph with its front and aft boarding doors, two adjacent small overwing exits and a separate visible aft emergency door between the wing and the rear boarding door. Use current standard KLM paint as in Attachment 2: vivid sky-blue body above a white lower fuselage with a fine dark-navy boundary stripe that sweeps downward near the nose, a white tail with the blue KLM crown and letters, white KLM titles and smaller “Royal Dutch Airlines” high on the forward blue fuselage, and white engine nacelles with the appropriate small blue mark if shown. Keep the white tail, blue body boundaries, nose shape, contours and unmistakable type differences from the photo.

#### Embraer E175 (long wing)

> Draw the compact 31.7 m first-generation Embraer E175 with enhanced long-wing geometry on PH-EXG in standard KLM Cityhopper paint. Preserve the short regional fuselage, sloping Embraer nose, two main boarding door outlines on the visible side and no small overwing hatch, low-geared aerial position with wheels retracted, the long swept outward winglets from the photo and two small smooth-ended CF34 nacelles. The compact forward white marking reads “KLM cityhopper” with the crown, not the larger ‘Royal Dutch Airlines’ line. The white fin carries the blue KLM crown and mark. Use current standard KLM paint as in Attachment 2: vivid sky-blue body above a white lower fuselage with a fine dark-navy boundary stripe that sweeps downward near the nose, a white tail with the blue KLM crown and letters, white KLM cityhopper titles high on the forward blue fuselage, and white engine nacelles with the appropriate small blue mark if shown. Keep the white tail, blue body boundaries, nose shape, contours and unmistakable type differences from the photo.

## SAS mainline and regional artwork

The built-in image tool completed the five remaining SAS profiles. All nine in-service types in the SAS fleet table now have ready artwork, including the SAS Link E195, CityJet CRJ900, and Braathens-operated ATR 72-600. The five new PNGs are 2172 × 724 with left-facing profiles and transparent alpha. [SAS fleet](https://www.sasgroup.net/about-sas/the-fleet/) · [SAS and Braathens partnership](https://www.sasgroup.net/newsroom/press-releases/2024/sas-and-bra-sign-long-term-partnership-to-strengthen-domestic-connectivity-in-sweden/)

The A319 shows the plain black-tailed SAS scheme worn by several fleet aircraft after the alliance branding was removed. The A320ceo follows the earlier red-engine SAS scheme photographed on OY-KAS. The A321LR illustration shows both overwing exits. Its 157-seat configuration deactivates the exit aft of the wing. [A319 paint history](https://www.aerotelegraph.com/flugzeuge/allianzwechsel-beschert-airbus-a319-von-sas-sonderbemalung/s24ntkr) · [SAS A321LR configuration](https://runwaygirlnetwork.com/2021/12/sas-a321lr-longhaul-narrowbody-premium-economy/)

| Illustration | Livery | Reference aircraft |
| --- | --- | --- |
| [Airbus A319](../assets/aircrafts/airliners/a319-sas.png) | Scandinavian Airlines | OY-KBP · [Photograph](https://www.jetphotos.com/photo/11481763) |
| [Airbus A320ceo](../assets/aircrafts/airliners/a320-sas.png) | Scandinavian Airlines | OY-KAS · [Photograph](https://abpic.co.uk/pictures/view/1942715) |
| [Airbus A321LR](../assets/aircrafts/airliners/a321lr-sas.png) | Scandinavian Airlines | SE-DMS · [Photograph](https://www.aeroinside.com/19041/sas-a21n-at-copenhagen-on-dec-20th-2023-electrical-odour) |
| [Embraer E195](../assets/aircrafts/airliners/e195-sas.png) | Scandinavian Airlines, operated by SAS Link | SE-RSK · [Photograph](https://www.aeroinside.com/20875/sas-e195-at-bergen-on-jul-3rd-2025-bird-strike) |
| [ATR 72-600](../assets/aircrafts/airliners/atr72-600-sas.png) | Scandinavian Airlines, operated by Braathens Regional Airways | SE-MNU · [Photograph](https://www.jetphotos.com/photo/12036860) |

### Generation prompts

Each first render used the shared prompt followed by the corresponding aircraft paragraph. The final A321LR door layout follows the reference photograph.

> Draw one original aircraft recognition illustration for the Overhead color e-paper display. Attachment 1 gives the established painted catalogue style with matte realistic color, restrained shading and crisp clean outlines. Attachment 2 is a real photograph for the exact aircraft geometry and paint. Draw the entire aircraft in a strict level nose-left port-side elevation, gear and flaps stowed, centered in a wide 3:1 frame with visible empty margin around the nose, tail and wing extremities. Flip a nose-right reference as needed while keeping all text readable left to right. Use a genuinely transparent alpha background. All space outside the aircraft should be fully clear, with no scenery, ground, shadow, glow, background wash, framing or caption. Omit individual registrations, tiny stencils and promotional markings.

#### Airbus A319

> Illustrate the SAS Airbus A319-132 photographed as OY-KBP in the everyday current unadorned SAS operating colors shown, shared by several fleet A319s. Draw the distinctly short 33.8 m A319 with classic Airbus flat cockpit glazing, two main boarding doors and precisely one small overwing hatch on the visible side, small original twin triangular wingtip fences and twin thin smooth V2500 nacelles. Its fuselage is white or light gray, with a small dark navy italic ‘SAS’ low on the forward cabin. Match the real plain solid dark charcoal tail, small blue wingtip details and silver-white engines with blue inlet rims. The tail is plain with no logos or graphics, the belly is plain light gray-white, and the aircraft has no alliance decals, retro stripes or large faux silver titles. Follow the exact SAS aircraft photo.

#### Airbus A320ceo

> Illustrate the Airbus A320-232 flown by SAS as OY-KAS. This is the 37.6 m A320ceo with small original two-sided blue Airbus wingtip fences, two adjacent small overwing escape hatches, classic Airbus cockpit glazing and slim smooth IAE V2500 engines. Draw the regular SAS paint still worn by this aircraft as photographed. Warm light-gray fuselage and silver ‘Scandinavian’ titles, red-orange engine cowls, a dark blue tail with large white italic ‘SAS’ letters, and the small Scandinavian flags near the rear. The blue stays on the fin and does not sweep down onto the fuselage. Match the pictured shape, smaller older engines and tiny original A320 wingtip fences. Preserve the SAS livery lettering in the correct orientation.

#### Airbus A321LR

> Draw the actual SAS Airbus A321LR (A321-253NX) photographed as SE-DMS. Keep its long 44.5 m fuselage, classic Airbus cockpit, tall upward sharklets and larger round twin CFM LEAP-1A nacelles with smooth conventional rear edges. Preserve the photographed Airbus Cabin Flex door layout, with the foremost and rearmost passenger doors, the two small adjacent overwing emergency exits and the full-height door aft of the wing. Use the modern standard SAS paint in the photograph: matte silver-white fuselage, very large understated light-silver SAS letters on the forward fuselage, saturated deep blue fin and sweeping wedge down onto the rear fuselage, white italic SAS lettering on the fin and the small Danish, Norwegian and Swedish flags on the rear cabin. Use silver engine nacelles with a narrow blue band around the leading rim and small dark “Scandinavian” lettering on the side.

#### Embraer E195

> Draw SAS Link’s first-generation Embraer E195 (ERJ-190-200LR) photographed as SE-RSK. Follow its slender 38.7 m regional jet fuselage, characteristic sloping pointed Embraer nose, two small GE CF34 nacelles under the low wings, slender upright winglets, two full-size passenger doors and the small emergency exits exactly as seen on the cabin side. Use the modern standard SAS paint in the photograph: matte silver-white fuselage, very large understated light-silver SAS letters on the forward fuselage, saturated deep blue fin and sweeping wedge down onto the rear fuselage, white italic SAS lettering on the fin and the small Danish, Norwegian and Swedish flags on the rear cabin. Preserve the thin dark blue leading bands on the white-silver nacelles.

> Make a precise airframe edit to the finished SAS Link Embraer E195 portrait in the first image. This first-generation E195 has exactly ONE small overwing exit on the visible side. In the aircraft illustration, replace the two adjacent small escape-hatch outlines above the wing with one small rectangular outline at their midpoint and restore the regular dark cabin windows on either side. Keep the two larger entry doors at the ends in place. Preserve the same nose-left strict level side elevation, distinctly pointed Embraer nose, normal E195 low wings and slender winglets, narrow CF34 engines, realistic proportions, light gray and dark blue SAS paint, markings and color. The entire aircraft and all extremities must fit inside the same wide 3:1 transparent canvas. Keep the alpha outside the aircraft truly clear. Image 2 shows the actual SAS Link E195 airframe.

#### ATR 72-600

> Draw the SAS-branded Braathens Regional Airways ATR 72-600 in the photograph of SE-MNU. Keep the long turboprop cabin, high straight-tapered wing, T-tail, angular wrap cockpit windows, two high-mounted slim PW127 nacelles and dark six-bladed propellers with their blue spinners. Depict the propellers as distinct static black blades with small light tips, like the existing illustrated turboprops. Show the main rear passenger door and the small front-side emergency door as they appear in the photo. Use the modern standard SAS paint in the photograph: matte silver-white fuselage, very large understated light-silver SAS letters on the forward fuselage, saturated deep blue fin and sweeping wedge down onto the rear fuselage, white italic SAS lettering on the fin and the small Danish, Norwegian and Swedish flags on the rear cabin. Match the photographed SAS arrangement on the tail and the larger subtle gray SAS on the front half.

> Make a localized correction to the propellers of this completed transparent SAS ATR 72-600 artwork. Image 1 is the illustration to edit. Image 2 is a photograph of the actual SAS Braathens aircraft. The ATR 72-600 uses a six-blade Hamilton Standard 568F propeller on each engine. Redraw the visible blue-hub propeller with exactly SIX distinct dark tapered blades with pale tips spaced evenly around the blue spinner. Clearly show each of the six tips by using a subtle elliptical perspective around the hub: two tips above, two tips below, and one tip projecting on either side of the center. All six blades must join the same spinner and visually belong to one propeller. If the other propeller is naturally hidden at this angle, let it remain hidden. Preserve the existing near-side engine mounting position, entire ATR airframe, true level left side view, T-tail, proportions, SAS livery, soft painted finish and framing. The surrounding canvas needs a genuinely transparent alpha background with no haze, no external pixels, and clear margins. Change only the count and shape of the propeller blades.

## Turkish Airlines standard artwork

The built-in image tool generated the ten remaining mainline passenger profiles. All 13 mainline passenger types now have standard liveries ready. The new illustrations are 2172 × 724 transparent, left-facing profiles.

The group fleet report combines A320neo and A321neo numbers. The carrier’s mainline passenger fleet lists the A321neo, while the A320neo examples operate for AJet. The former Turkish Airlines A320neo entry was removed from the artwork queue. [Turkish Airlines mainline fleet](https://www.flightradar24.com/data/airlines/tk-thy/fleet) · [Group fleet report](https://investor.turkishairlines.com/documents/ir-presentation-3q26.pdf) · [AJet A320neo lease](https://www.smbc.aero/news/2025/smbc-aviation-capital-signs-lease-agreements-turkish-airlines-fully-owned-subsidiary-ajet)

The A321ceo has separate doors ahead of and behind the wing. The A321neo profile follows the Cabin Flex layout photographed on TC-LSL. [Airbus Cabin Flex delivery](https://www.airbus.com/en/newsroom/press-releases/2018-07-airbus-delivers-the-first-a321neo-in-cabin-flex-configuration-to)

| Illustration | Reference aircraft |
| --- | --- |
| [Airbus A330-300](../assets/aircrafts/airliners/a330-300-turkish-airlines.png) | TC-JNK · [Photograph](https://www.planespotters.net/photo/1496200/tc-jnk-turkish-airlines-airbus-a330-343) |
| [Airbus A319](../assets/aircrafts/airliners/a319-turkish-airlines.png) | TC-JLR · [Photograph](https://www.flugzeug-bild.de/bild/passagierflugzeuge~airbus~a-319/56804/turkish-airlines-airbus-a319-132-tc-jlr-aufgenommen.html) |
| [Airbus A320ceo](../assets/aircrafts/airliners/a320-turkish-airlines.png) | TC-JPN · [Photograph](https://www.flugzeug-bild.de/1200/turkish-airlines-tk-thy-tc-jpn-mardin-109356.jpg) |
| [Airbus A321ceo](../assets/aircrafts/airliners/a321-turkish-airlines.png) | TC-JSI · [Photograph](https://www.aeroinside.com/19929/thy-a321-at-istanbul-on-sep-11th-2024-bird-strike) |
| [Airbus A321neo](../assets/aircrafts/airliners/a321neo-turkish-airlines.png) | TC-LSL · [Photograph](https://www.aeroinside.com/18615/thy-a21n-at-bishkek-on-sep-14th-2023-engine-vibrations) |
| [Boeing 737-800](../assets/aircrafts/airliners/737-800-turkish-airlines.png) | TC-JVO · [Photograph](https://commons.wikimedia.org/wiki/File:Turkish_Airlines,_TC-JVO,_Boeing_737-8F2_(31928158366).jpg) |
| [Boeing 737-900ER](../assets/aircrafts/airliners/737-900-turkish-airlines.png) | TC-JYJ · [Photograph](https://www.aeroinside.com/7570/thy-b739-at-istanbul-on-may-18th-2016-flap-problem) |
| [Boeing 737 MAX 8](../assets/aircrafts/airliners/737-max-8-turkish-airlines.png) | TC-LCA · [Photograph](https://commons.wikimedia.org/wiki/File:Turkish_Airlines,_TC-LCA,_Boeing_737-8_MAX_(44575165144).jpg) |
| [Boeing 737 MAX 9](../assets/aircrafts/airliners/737-max-9-turkish-airlines.png) | TC-LYE · [Photograph](https://www.planespotters.net/photo/1415349/tc-lye-turkish-airlines-boeing-737-9-max) |
| [Airbus A330-200](../assets/aircrafts/airliners/a330-200-turkish-airlines.png) | TC-JIR · [Photograph](https://aviationweek.com/air-transport/airlines-lessors/turkish-airlines-outlines-network-priorities) |

### Generation prompts

Each first render used the shared prompt followed by the corresponding aircraft paragraph.

> Create one original aircraft recognition portrait for the Overhead color e-paper display. Attachment 1 supplies the catalog’s clean realistic painted side-profile style, matte color, soft shading, and crisp contours. Attachment 2 is an actual photograph for the requested airframe and Turkish Airlines’ standard paint. Draw an accurate level left-facing port-side elevation, airborne with landing gear and flaps fully stowed. Put the complete aircraft at the center of a wide 3:1 canvas and give the nose, tail, and wingtips comfortable clear margin. Use a genuine transparent alpha background and keep every area outside the aircraft fully clear. No sky, ground, shadows, haze, borders, captions, promotional graphics or legible individual registration.

#### Airbus A330-300

> Draw the Airbus A330-343 on TC-JNK, a long 63.7 m A330-300 with four separately spaced passenger doors: at the nose, ahead of the wing, behind the wing, and near the tail. Keep the traditional A330 cockpit outline, narrow upright triangular tip fences, smooth Rolls-Royce Trent 700 nacelles and the longer narrow tailcone. Keep the differences from the shorter A330-200 visible. Match the photographic white fuselage and nacelles, big dark-navy uppercase ‘TURKISH AIRLINES’ high on the forward cabin, small Turkish flag near that title, subtle pale-gray tulip motif on the rear fuselage as shown, and red fin with the exact large white circular stylized flying-bird emblem. Keep the real red wingtip details where visible. If the source aircraft faces right, reverse the orientation while keeping the port-side text readable.

#### Airbus A319

> Draw the compact 33.8 m Airbus A319-132 on TC-JLR. Classic Airbus cockpit, a much shorter squat fuselage than the A320, main forward and rear boarding doors, exactly one small overwing escape hatch on the visible side, original short up-and-down Airbus tip fences and smooth slim IAE V2500 engines. Match the photographic white fuselage and nacelles, big dark-navy uppercase ‘TURKISH AIRLINES’ high on the forward cabin, small Turkish flag near that title, subtle pale-gray tulip motif on the rear fuselage as shown, and red fin with the exact large white circular stylized flying-bird emblem. Keep the real red wingtip details where visible. If the source aircraft faces right, reverse the orientation while keeping the port-side text readable.

#### Airbus A320ceo

> Draw the classic 37.6 m Airbus A320-232 on TC-JPN. Match the conventional geometry: forward and aft cabin doors, exactly two adjacent small overwing escape hatches, small original red two-sided wingtip fences, older slim IAE V2500 nacelles, and conventional A320 cockpit. Use the visible gray tulip pattern from the photo. Match the photographic white fuselage and nacelles, big dark-navy uppercase ‘TURKISH AIRLINES’ high on the forward cabin, small Turkish flag near that title, subtle pale-gray tulip motif on the rear fuselage as shown, and red fin with the exact large white circular stylized flying-bird emblem. Keep the real red wingtip details where visible. If the source aircraft faces right, reverse the orientation while keeping the port-side text readable.

#### Airbus A321ceo

> Draw the traditional 44.5 m Airbus A321-231 on TC-JSI. Keep the older, slimmer smooth IAE V2500 engines and tall red wingtip sharklets shown. Correctly show four separate tall doors on the visible side: one near the nose, one ahead of the wing root, one behind the wing, and one near the tail. The two middle A321ceo exit doors are separate tall doors, never a pair of little overwing hatches. Match the photographic white fuselage and nacelles, big dark-navy uppercase ‘TURKISH AIRLINES’ high on the forward cabin, small Turkish flag near that title, subtle pale-gray tulip motif on the rear fuselage as shown, and red fin with the exact large white circular stylized flying-bird emblem. Keep the real red wingtip details where visible. If the source aircraft faces right, reverse the orientation while keeping the port-side text readable.

#### Airbus A321neo

> Draw the stretched 44.5 m Airbus A321-271NX A321neo on TC-LSL, preserving the tall sharklets and larger rounded white Pratt & Whitney geared turbofan nacelles. Use the Airbus Cabin Flex configuration visible on TC-LSL, with two main doors near the ends, paired smaller overwing hatches and the aft-of-wing door outline as shown in the reference. The farther aft door sits separately from the main rear door. Match the gray tulip on the rear. No separate large exit directly ahead of the wing. Match the photographic white fuselage and nacelles, big dark-navy uppercase ‘TURKISH AIRLINES’ high on the forward cabin, small Turkish flag near that title, subtle pale-gray tulip motif on the rear fuselage as shown, and red fin with the exact large white circular stylized flying-bird emblem. Keep the real red wingtip details where visible. If the source aircraft faces right, reverse the orientation while keeping the port-side text readable.

> Make a very small correction in the first attachment, the completed Turkish Airlines A321neo illustration. Remove the tiny extra rectangular outline directly ahead of the rearmost large boarding door just under the aft cabin window line. Match the clean fuselage panel in that area of the actual TC-LSL photograph in attachment 2. The final visible side has the large forward and rear boarding doors and the two small overwing emergency hatches. Preserve the rest precisely, including the tall red sharklet, Pratt & Whitney geared nacelles, correct long A321neo geometry, Turkish Airlines titles, gray tulip and red tail, strict level left side profile, and the same painted style. Keep genuine transparent alpha outside the complete aircraft and maintain clear margin at all edges.

#### Boeing 737-800

> Draw the 39.5 m Boeing 737-8F2 on TC-JVO, with conventional angular Boeing 737NG cockpit glazing, short flat-bottom CFM56-7B nacelles with smooth exhaust edge, tall red blended winglets and two small adjacent overwing exits. Keep the forward and aft boarding doors and the standard 737-800 cabin with no separate extra door behind the wing. Match the photographic white fuselage and nacelles, big dark-navy uppercase ‘TURKISH AIRLINES’ high on the forward cabin, small Turkish flag near that title, subtle pale-gray tulip motif on the rear fuselage as shown, and red fin with the exact large white circular stylized flying-bird emblem. Keep the real red wingtip details where visible. If the source aircraft faces right, reverse the orientation while keeping the port-side text readable.

#### Boeing 737-900ER

> Draw the long 42.1 m Boeing 737-9F2ER on TC-JYJ. Preserve its thinner, visibly stretched 737-900ER cabin, angular 737NG cockpit, twin slim flattened CFM56-7B engines with smooth nacelle edges, tall blended red winglets, and two small adjacent overwing exits between the forward and aft passenger doors. Where the optional aft exit is plugged, preserve the faint seam as seen in the photograph, with no extra active exit markings. Match the photographic white fuselage and nacelles, big dark-navy uppercase ‘TURKISH AIRLINES’ high on the forward cabin, small Turkish flag near that title, subtle pale-gray tulip motif on the rear fuselage as shown, and red fin with the exact large white circular stylized flying-bird emblem. Keep the real red wingtip details where visible. If the source aircraft faces right, reverse the orientation while keeping the port-side text readable.

#### Boeing 737 MAX 8

> Draw the standard 39.5 m Boeing 737 MAX 8 on TC-LCA, with angular MAX cockpit, large rounder higher-mounted LEAP-1B nacelles with scalloped nacelle trailing edges, modern red split-tip MAX winglets, and two small adjacent overwing exits. Use the forward and rear passenger doors and the photographed regular MAX 8 cabin. Preserve the separate 737 MAX 8 geometry without the 737-8200’s high-density extra exit. Match the photographic white fuselage and nacelles, big dark-navy uppercase ‘TURKISH AIRLINES’ high on the forward cabin, small Turkish flag near that title, subtle pale-gray tulip motif on the rear fuselage as shown, and red fin with the exact large white circular stylized flying-bird emblem. Keep the real red wingtip details where visible. If the source aircraft faces right, reverse the orientation while keeping the port-side text readable.

#### Boeing 737 MAX 9

> Draw the elongated 42.2 m Boeing 737 MAX 9 on TC-LYE, with visibly stretched cabin, larger rounder LEAP-1B nacelles with neat scallops at the rear edges, contemporary split-tip red MAX winglets and angular 737 cockpit. Show two small adjacent overwing escape hatches plus the main boarding doors at either end. Follow the photograph for the optional aft-of-wing emergency exit or flush door blank. Match the photographic white fuselage and nacelles, big dark-navy uppercase ‘TURKISH AIRLINES’ high on the forward cabin, small Turkish flag near that title, subtle pale-gray tulip motif on the rear fuselage as shown, and red fin with the exact large white circular stylized flying-bird emblem. Keep the real red wingtip details where visible. If the source aircraft faces right, reverse the orientation while keeping the port-side text readable.

#### Airbus A330-200

> Draw the compact 58.8 m Airbus A330-200 on TC-JIR. Keep its shorter fuselage and relatively tall fin, traditional Airbus cockpit, small triangular tip fences, and smooth twin Pratt & Whitney PW4000 nacelles. The four full-size doors should be individually legible along the visible side: near the nose, ahead of the wing, aft of the wing and near the rear. Make the shorter -200 proportions distinct from the A330-300. Match the photographic white fuselage and nacelles, big dark-navy uppercase ‘TURKISH AIRLINES’ high on the forward cabin, small Turkish flag near that title, subtle pale-gray tulip motif on the rear fuselage as shown, and red fin with the exact large white circular stylized flying-bird emblem. Keep the real red wingtip details where visible. If the source aircraft faces right, reverse the orientation while keeping the port-side text readable.

> Correct the cabin-door layout in the first attachment, a completed Turkish Airlines Airbus A330-200 side-profile illustration. The real A330-200 in attachment 2 has four full-size passenger doors on the visible side. Preserve the three currently drawn doors near the nose, ahead of the wing, and near the tail. Add the missing third full-size rectangular door at about two thirds of the fuselage immediately aft of the wing root. The top of its outline should be visibly above the wing where these overlap, with the lower part occluded by the wing if appropriate. Keep the compact A330-200 geometry, exact completed Turkish paint and lettering, nacelles, original wingtip fence, whole left-facing profile and crisp edges. Preserve generous clear margin and genuine transparent alpha outside the entire aircraft.

## Lufthansa standard artwork

The 12 queued Lufthansa mainline passenger types now have standard-livery artwork ready. All files are 2172 × 724 RGBA PNGs with left-facing aircraft and transparent backgrounds. The display matches these artwork entries by `DLH` and ICAO aircraft type.

The A321ceo artwork covers both the A321-100 and A321-200 under `A321`. The A350-1000 centenary entry remains queued. Lufthansa’s first A350-1000, D-AIFA, wears the anniversary paint and is scheduled to begin passenger service on 3 December 2026. [Lufthansa seat maps](https://www.lufthansa.com/de/en/seat-maps) · [A350-1000 delivery](https://newsroom.lufthansagroup.com/en/lufthansas-first-airbus-a350-1000-welcome-to-munich/) · [First scheduled A350-1000 flight](https://newsroom.lufthansagroup.com/en/new-lufthansa-airbus-a350-1000-to-fly-first-to-tokyo/)

| Illustration | Reference aircraft |
| --- | --- |
| [Airbus A319](../assets/aircrafts/airliners/a319-lufthansa.png) | D-AILD · [Photograph](https://www.planespotters.net/photo/1096658/d-aild-lufthansa-airbus-a319-114) |
| [Airbus A320ceo](../assets/aircrafts/airliners/a320-lufthansa.png) | D-AIZI · [Photograph](https://www.planespotters.net/photo/951953/d-aizi-lufthansa-airbus-a320-214) |
| [Airbus A320neo](../assets/aircrafts/airliners/a320neo-lufthansa.png) | D-AINK · [Photograph](https://www.planespotters.net/photo/1428338/d-aink-lufthansa-airbus-a320-271n) |
| [Airbus A321ceo](../assets/aircrafts/airliners/a321-lufthansa.png) | D-AISI · [Photograph](https://www.jetphotos.com/photo/11496417) |
| [Airbus A321neo](../assets/aircrafts/airliners/a321neo-lufthansa.png) | D-AIEP · [Photograph](https://www.planespotters.net/photo/1435780/d-aiep-lufthansa-airbus-a321-271nx) |
| [Airbus A330-300](../assets/aircrafts/airliners/a330-300-lufthansa.png) | D-AIKR · [Photograph](https://www.planespotters.net/photo/999354/d-aikr-lufthansa-airbus-a330-343) |
| [Airbus A340-300](../assets/aircrafts/airliners/a340-300-lufthansa.png) | D-AIGU · [Photograph](https://commons.wikimedia.org/wiki/File:D-AIGU_Airbus_A340-300_Lufthansa_FRA_2019-08-10_(19a).JPG) |
| [Airbus A350-900](../assets/aircrafts/airliners/a350-900-lufthansa.png) | D-AIXQ · [Photograph](https://www.netairspace.cc/photos/D-AIXQ/Lufthansa/Airbus_A350-941/HAM_EDDH_Hamburg_Fuhlsbuettel_Helmut_Schmidt/photo_667348/) |
| [Airbus A380-800](../assets/aircrafts/airliners/a380-800-lufthansa.png) | D-AIMD · [Photograph](https://www.aerotelegraph.com/airlines/hier-steht-der-erste-lufthansa-a380-im-neuen-kleid/x2dhx5q) |
| [Boeing 747-400](../assets/aircrafts/airliners/747-400-lufthansa.png) | D-ABVY · [Photograph](https://www.planespotters.net/photo/1552780/d-abvy-lufthansa-boeing-747-430) |
| [Boeing 747-8](../assets/aircrafts/airliners/747-8-lufthansa.png) | D-ABYA · [Photograph](https://www.aerotelegraph.com/galerie/der-erste-auftritt-der-neuen-lufthansa-bemalung/kghq09b) · D-ABYH [airframe proportions](https://www.aeroinside.com/21012/lufthansa-b748-at-chicago-on-aug-13th-2025-gear-problem-on-departure) |
| [Boeing 787-9](../assets/aircrafts/airliners/787-9-lufthansa.png) | D-ABPD · [Photograph](https://www.planespotters.net/photo/1737761/d-abpd-lufthansa-boeing-787-9-dreamliner) |

### Generation prompts

First renders used the [SAS A320neo illustration](../assets/aircrafts/airliners/a320neo-sas.png) for rendering style and the aircraft photographs above for shape and livery. The shared opening below was used except for the A350-900 and 787-9.

> Draw one original aircraft recognition illustration for the Overhead color e-paper display. Attachment 1 gives the catalog’s softly painted, realistic side-profile style with matte color and clean edges. Attachment 2 supplies the actual Lufthansa aircraft’s geometry and paint. Draw a strict level left-facing port-side elevation with the landing gear and flaps fully stowed. Reverse a nose-right reference where necessary while keeping text readable. Center the complete aircraft on a wide 3:1 canvas with clear margin outside nose, tail and wingtips. Use genuine transparent alpha, with fully clear space around the isolated aircraft and no shadows, glow, sky, ground, other aircraft, borders or captions. Omit the readable airframe registration, tiny stencils, and special markings.

#### A319, A320 and A321

Each detail prompt below was followed by the same livery prompt.

> Match present-day standard Lufthansa paint: matte white fuselage and white engine nacelles, a deep dark navy tail that sweeps diagonally down onto the aft fuselage, a clean white thin-rim circular crane logo on the navy fin, and large dark-navy ‘Lufthansa’ titles forward just above the windows. Preserve a small German flag near the aft registration area. The crane and its rim are white, with no yellow tail disc or anniversary decoration.

**Airbus A319**

> Draw Lufthansa Airbus A319-114 D-AILD. The compact A319 fuselage is 33.8 m, distinctly shorter and stouter than the A320. Place one small overwing exit only on the near side plus one forward and one aft full-size door. Use the short two-sided original Airbus wingtip fences from the photo, classic Airbus A319 cockpit and smooth older CFM56 nacelles.

**Airbus A320ceo**

> Draw Lufthansa Airbus A320-214 D-AIZI, in the conventional 37.6 m A320ceo shape. Classic Airbus cockpit, two adjacent small overwing hatches, one large forward and rear door, slim smooth older CFM56-5B nacelles and the tiny original Airbus two-sided wingtip fences (one small blade above and one below each wing tip). Use the real proportions and paint from the reference.

**Airbus A320neo**

> Draw Lufthansa Airbus A320-271N D-AINK, the 37.6 m A320neo. Preserve the rounder larger Pratt & Whitney geared-turbofan nacelles, modern tall swept sharklets, classic Airbus cockpit form, main forward and rear doors, and the two adjacent small overwing hatches. Follow the photographed dark ring detail on the white nacelle subtly.

**Airbus A321ceo**

> Draw Lufthansa's conventional 44.5 m Airbus A321-231 D-AISI. Make the longer slender A321ceo with slim smooth IAE V2500 engines and classic small two-sided Airbus wingtip fences as in the exact aircraft photo. Show the four separate tall doors on the near side: foremost, immediately ahead of wing root, immediately behind the wing and rearmost. The classic A321 uses two separate cabin exit doors around the wing.

**Airbus A321neo**

> Draw Lufthansa Airbus A321-271NX D-AIEP in the typical Airbus Cabin Flex geometry. It has the long 44.5 m A321 fuselage, large white Pratt & Whitney geared-fan nacelles and tall upward sharklets. Match the real windows and doors: two adjacent small overwing hatch outlines and a separate taller door aft of the wing, with the normal large forward and rear boarding doors in their correct locations, just as on the photographed configuration.

#### A330, A340, A380 and 747

Each detail prompt below was followed by the same reference guidance.

> The SAS illustration controls composition and paint rendering only. The Lufthansa photos are factual references for model and ordinary livery. Render an original illustration with level fuselage and landing gear retracted, even if the photo shows the aircraft in a different pose.

**Airbus A330-300**

> Airbus A330-300, 63.7 m long, conventional clear Airbus cockpit glazing without the black mask, four full-size port cabin doors (L1 nose, L2 well forward of wing, L3 immediately aft of wing, L4 tail), two wide smooth Rolls-Royce Trent 700 nacelles (one prominent on the near wing and the far one naturally occluded). Use triangular A330ceo tip fences, no large swept neo sharklets.

**Airbus A340-300**

> Airbus A340-300, 63.7 m long, classic clear Airbus cockpit windows without black raccoon mask, four full-size port cabin doors (L1 nose, L2 well ahead of wing, L3 just aft of wing, L4 tail), four slender and visibly long CFM56-5C engines (two clearly visible on the near wing) and classic small wingtip fences.

**Airbus A380-800**

> Airbus A380-800, 72.7 m long, recognizably tall full-length double-deck fuselage, two rows of cabin windows from near nose to near tail, cockpit forward between both rows, four very large smooth engine nacelles (two prominent on the near side) and a small wingtip fence. Avoid centenary decals or other special schemes.

**Boeing 747-400**

> Boeing 747-400, 70.7 m long. Distinctive upper-deck hump and high cockpit, second window row limited to the forward hump, comparatively short hump and body, four smooth non-chevroned CF6 turbofans, two prominent port nacelles with rear-wing engines naturally occluded in strict side view, and classic tall upright canted winglet at the near wing tip.

**Boeing 747-8**

> Boeing 747-8 Intercontinental, 76.3 m long. Extended upper-deck hump and longer body, high cockpit, raked wing tips without upright winglets. Four GEnx turbofans, the two visible near-side nacelles have clearly scalloped nozzle chevrons and size differences explained by position. Rear-wing nacelles naturally occluded in strict side view. Use the third reference photo only for exact airframe proportions, use the second reference for the standard livery.

#### A350-900 and 787-9

> Draw a single crisp realistic digital painted aviation profile illustration for the Overhead poster. The illustration is an exact left-facing planar side elevation, level fuselage, no perspective, retracted gear, entire aircraft set comfortably away from all canvas edges. Consistent subtle shading, crisp thin contours, restrained details, real transparent alpha, no background or shadows. Match SAS style reference. Lufthansa modern standard dark navy tail and aft sweep with thin white ring and stylized white crane, white body and engines, standard upright Lufthansa title and small German flag. No celebratory graphics, tags, banners or added text.

The following guidance came after the detail prompt for each aircraft.

> Use second reference photo solely as exact identity and Lufthansa standard livery. Match side profile pose and matte white finish of illustration first.

**Airbus A350-900**

> Airbus A350-900, exactly four distinctive cabin doors per side, black modern raccoon-eye cockpit mask, 66.8m long fuselage, two smooth Trent XWB turbofan engines, rising curved blended wingtip, rounded tailcone.

**Boeing 787-9**

> Boeing 787-9, 62.8m long cabin with four entries, distinctive slender descending Dreamliner cockpit nose, two GEnx engines with scalloped chevrons, swept raked wings only.

#### Selected revisions

The A320neo used its photograph as the lettering reference. The 747s also used the [finished Lufthansa 787-9](../assets/aircrafts/airliners/787-9-lufthansa.png) as a second reference for the current paint.

**Airbus A320neo**

> Make a small localized correction in the first attached Lufthansa Airbus A320neo illustration. The word Lufthansa just behind the cockpit is slanted. Redraw just that word with the correct upright non-italic Lufthansa lettering, using the photograph in the second attachment for type and placement. Leave the lettering navy and sufficiently small to sit above the cabin windows. Preserve the livery, matte colors, aircraft geometry and details of the current artwork, including the large PW1100G nacelles and tall sharklets. Keep the exact left-facing side elevation, retracted gear, and genuinely transparent alpha exterior with a clear border.

**Boeing 747-400**

> Make a localized change to the Lufthansa lettering in attachment 1, the completed Boeing 747-400 artwork. Set Lufthansa in correct upright non-italic dark navy letters as in attachments 2 and 3. Keep type small enough to fit between the two rows of cabin windows. Leave the fin and swept aft navy field, the compact 747-400 shape, high hump, smooth four engines and distinctive upright navy winglet as drawn. Preserve the full isolated left-facing level profile, clean shaded style and genuine transparent alpha all around.

**Boeing 747-8**

> Update the Lufthansa paint on the first attachment, a finished left-facing Boeing 747-8 Intercontinental illustration. Keep the exact model, long distinctive upper-deck hump, long fuselage, port engines with chevrons, raked wingtips, level port profile and retracted gear. Apply the current regular Lufthansa paint as seen in attachments 2 and 3. Delete the yellow disc. Paint the whole fin deep dark navy with a white stylized Lufthansa crane inside a thin outlined white circle. The navy area extends down the rear fuselage and tail cone in a straight diagonal sweep from the fin leading edge to the lower aft fuselage. The white remainder, white engines, small German flag and upright navy Lufthansa lettering are preserved. Keep the whole isolated aircraft and actual transparent alpha outside its edges. No other changes.

## British Airways standard artwork

The standard British Airways Chatham Dockyard livery is ready for 12 Airbus and Boeing types and the BA CityFlyer Embraer E190. The display matches the mainline entries by `BAW` and ICAO aircraft type, with `EFW` also mapped to the shared A320ceo and A321ceo artwork. The E190 uses `CFE`. [British Airways fleet facts](https://www.britishairways.com/content/en/information/about-ba/fleet-facts) · [BA Euroflyer fleet](https://www.planespotters.net/airline/BA-Euroflyer) · [BA CityFlyer fleet](https://www.planespotters.net/airline/BA-CityFlyer)

All 13 files are 2172 × 724 RGBA PNGs. Each left-facing profile was inspected on light and dark backgrounds and checked for transparency and clear edges.

| Illustration | Reference aircraft | Geometry reference |
| --- | --- | --- |
| [Airbus A319](../assets/aircrafts/airliners/a319-british-airways.png) | [G-EUPP](https://www.flugzeug-bild.de/bild/passagierflugzeuge~airbus~a-319/162943/british-airways-g-eupp-airbus-a319-131-msn.html) | [a319-lufthansa](../assets/aircrafts/airliners/a319-lufthansa.png) |
| [Airbus A320ceo](../assets/aircrafts/airliners/a320-british-airways.png) | [G-EUUL](https://www.planespotters.net/photo/1384167/g-euul-british-airways-airbus-a320-232) | [a320-turkish-airlines](../assets/aircrafts/airliners/a320-turkish-airlines.png) |
| [Airbus A320neo](../assets/aircrafts/airliners/a320neo-british-airways.png) | [G-TTNA](https://commons.wikimedia.org/wiki/File%3ABritish_Airways_Airbus_A320Neo_G-TTNA_%2827919173938%29.jpg) | [a320neo-sas](../assets/aircrafts/airliners/a320neo-sas.png) |
| [Airbus A321ceo](../assets/aircrafts/airliners/a321-british-airways.png) | [G-EUXD](https://www.flugzeug-bild.de/bild/passagierflugzeuge~airbus~a-321/147664/british-airways-g-euxd-airbus-a321-231-msn.html) | [a321-lufthansa](../assets/aircrafts/airliners/a321-lufthansa.png) |
| [Airbus A321neo](../assets/aircrafts/airliners/a321neo-british-airways.png) | [G-NEOP](https://www.planespotters.net/photo/1331182/g-neop-british-airways-airbus-a321-251nx) | [a321neo-lufthansa](../assets/aircrafts/airliners/a321neo-lufthansa.png) |
| [Airbus A350-1000](../assets/aircrafts/airliners/a350-1000-british-airways.png) | [G-XWBA](https://commons.wikimedia.org/wiki/File:G-XWBA_A350-1000_British_Airways_LHR_4.11.20.jpg) | [a350-1000-qatar-airways](../assets/aircrafts/airliners/a350-1000-qatar-airways.png) |
| [Airbus A380-800](../assets/aircrafts/airliners/a380-800-british-airways.png) | [G-XLEA](https://www.flugzeug-bild.de/bild/passagierflugzeuge~airbus~a-380/57398/british-airways-g-xlea-airbus-a380-841-05092013.html) | [a380-800-lufthansa](../assets/aircrafts/airliners/a380-800-lufthansa.png) |
| [Boeing 777-200ER](../assets/aircrafts/airliners/777-200er-british-airways.png) | [G-VIIM](https://www.aeroinside.com/18239/british-airways-b772-near-new-york-on-jun-13th-2023-smell-of-fumes-in-cockpit) | [777-200er-klm](../assets/aircrafts/airliners/777-200er-klm.png) |
| [Boeing 777-300ER](../assets/aircrafts/airliners/777-300er-british-airways.png) | [G-STBL](https://www.flugzeug-bild.de/bild/flughaefen~deutschland~frankfurt-am-main-fra/113409/g-stbl-british-airways-boeing-777-336er-.html) | [777-300er-klm](../assets/aircrafts/airliners/777-300er-klm.png) |
| [Boeing 787-8](../assets/aircrafts/airliners/787-8-british-airways.png) | [G-ZBJD](https://commons.wikimedia.org/wiki/File%3ABoeing_787-8_G-ZBJD_British_Airways_%2810497409623%29.jpg) | [787-8-lot-polish-airlines](../assets/aircrafts/airliners/787-8-lot-polish-airlines.png) |
| [Boeing 787-9](../assets/aircrafts/airliners/787-9-british-airways.png) | [G-ZBKA](https://www.planespotters.net/photo/1418409/g-zbka-british-airways-boeing-787-9-dreamliner) | [787-9-lufthansa](../assets/aircrafts/airliners/787-9-lufthansa.png) |
| [Boeing 787-10](../assets/aircrafts/airliners/787-10-british-airways.png) | [G-ZBLB](https://www.planespotters.net/photo/1213188/g-zblb-british-airways-boeing-787-10-dreamliner) | [787-10-klm](../assets/aircrafts/airliners/787-10-klm.png) |
| [Embraer E190 (BA CityFlyer)](../assets/aircrafts/airliners/e190-ba-cityflyer.png) | [G-LCYO](https://www.flickr.com/photos/ghbhd/51818919052/) | [e190-klm-cityhopper](../assets/aircrafts/airliners/e190-klm-cityhopper.png) |

### Generation prompts

The built-in image tool used the [SAS A320neo](../assets/aircrafts/airliners/a320neo-sas.png) for style. It used the photographs and geometry illustrations listed above to distinguish livery and airframe details. The A320neo used the SAS artwork for both style and geometry.

> Create one original painted aircraft recognition asset for the Overhead color e-paper display. Attachment 1 is the approved painting style. Attachment 2 is the British Airways photograph for standard livery and aircraft model. Attachment 3, if present, is an existing geometry illustration to help render a true port-side elevation, regardless of its paint. Create a fully isolated, strictly horizontal nose-left side profile with gear and flaps retracted and the whole airframe in a wide 3:1 canvas. Leave fully clear alpha margins on all sides, especially nose and tail. Render crisp edges, matte soft realistic shading, no sky, ground, cast shadow, color wash, text outside the aircraft, or legible registration. Make the airframe recognizably accurate at kiosk scale.

The detail prompts below follow that shared opening. Each render ends with the same livery prompt.

> Use the current ordinary British Airways Chatham Dockyard Union Flag livery shown in the photograph: predominantly clean white upper fuselage with a level dark midnight blue belly to the lower nose and fuselage and matching dark blue engine nacelles. The fin is white with the recognizable actual broad red and midnight-blue stylized Union Flag flowing diagonally, separated by white, with no letters on the fin. Small red tailcone paint only as in the photo. Include the navy serif-style single-line titles “BRITISH AIRWAYS” on the forward white fuselage, normally below the forward cabin window line, with the familiar red and blue two-color curved Speedmarque just forward and higher near the cockpit, as seen in the BA photograph. Keep lettering readable and correctly spelled nose-left. Omit special and anniversary graphics.

#### Airbus A319

> Draw the compact 33.8 m Airbus A319-131 with one small overwing exit, main front and rear doors, small classic two-sided wingtip fences, conventional A320-family cockpit and older slim smooth IAE V2500 engines. Photograph: G-EUPP.

#### Airbus A320ceo

> Draw the 37.6 m Airbus A320-232. Show two closely spaced small overwing exits, larger main doors near the nose and tail, narrow smooth IAE V2500 engines and small classic two-sided wingtip fences. Photograph: G-EUUL.

#### Airbus A320neo

> Draw the 37.6 m Airbus A320-251N with two adjacent small overwing exits, large forward and aft boarding doors, tall modern upturned sharklets and the larger rounder CFM LEAP-1A nacelles. Use smooth exhaust edges as seen on this BA Airbus. Photograph: G-TTNA.

#### Airbus A321ceo

> Draw the elongated 44.5 m Airbus A321-231, slim smooth IAE V2500 nacelles and classic small two-sided wingtip fences. Show the four distinct full-size doors on the visible side, at the nose, just ahead of wing root, just aft of wing root and near the tail. Never substitute small paired overwing hatches on this ceo. Photograph: G-EUXD.

#### Airbus A321neo

> Draw the long 44.5 m Airbus A321-251NX with large rounded CFM LEAP-1A engines and tall upward sharklets. Follow the Cabin Flex configuration in the British Airways photo for the doors and overwing hatches. The two rows of small exit markings beside the wing are not large doors. Use large main doors at the nose and tail, two small overwing exits, and the separate aft-of-wing door outline if visible on the reference. Photograph: G-NEOP.

#### Airbus A350-1000

> Draw the elongated 73.8 m Airbus A350-1000 in the real photograph. Match the long A350-1000 geometry from the third attachment only, without using its paint. Preserve the -1000’s stretched cabin and wider smooth Trent XWB-97 nacelles, long smoothly curved wings with rising tips (no separate vertical plate), tapered front, black modern cockpit mask and four distinct full-size cabin doors. Photograph: G-XWBA.

#### Airbus A380-800

> Draw the 72.7 m Airbus A380-841. Preserve the tall full-length double-deck fuselage with two long rows of windows from near the front to near the rear, cockpit nestled between the decks, four large smooth Rolls-Royce Trent 900 nacelles, two clearly visible on the near wing, and a small wingtip fence. No 747-style front-only hump. Photograph: G-XLEA.

#### Boeing 777-200ER

> Draw the 63.7 m Boeing 777-236ER, noticeably compact versus a -300ER, with four main doors per side. Classic nose and cockpit with no black window mask, smooth trailing edges to the twin large GE90 turbofan nacelles, and flat swept tips on original 777-200ER wings, without tall upright winglets. Photograph: G-VIIM.

#### Boeing 777-300ER

> Draw the very long 73.9 m Boeing 777-336ER with five full-size doors on the visible side. Match the elongated tubular body, conventional Boeing 777 cockpit, very large smooth-edged GE90-115B turbofans and raked wing tips well separated from the tail. Keep five passenger doors visibly different from the shorter -200ER. Photograph: G-STBL.

#### Boeing 787-8

> Draw the compact 56.7 m Boeing 787-8. Use the shortest noticeably compact cabin in the 787 range. Preserve its steeply tapered Dreamliner flight deck, four full-size cabin doors, rising smoothly raked wings with no vertical winglets, and two visibly scalloped Rolls-Royce Trent 1000 nacelles. Photograph: G-ZBJD.

#### Boeing 787-9

> Draw the 62.8 m Boeing 787-9. Keep the medium-length passenger cabin across four main doors, slender dropping Dreamliner nose and swept smoothly raked wing tips. Enlarge the length relative to the -8, keeping it clearly shorter than the -10. Use distinct scalloped chevrons on the Trent 1000 nacelles. Photograph: G-ZBKA.

#### Boeing 787-10

> Draw the very long 68.3 m Boeing 787-10 with an especially stretched cabin on both sides of the wing and relatively low fin compared with the fuselage length. Retain four cabin doors, the steep rounded Dreamliner cockpit, long smoothly raked wings without upright blades and two large Trent 1000 nacelles with distinct scalloped chevrons. Photograph: G-ZBLB.

#### Embraer E190

> Draw BA CityFlyer's 36.2 m Embraer ERJ 190-100SR, the classic E190. Use the small narrow fuselage, modest oval windows, conventional Embraer cockpit, one small overwing exit and main front and rear doors, two small thin GE CF34 nacelles with smooth rear edges, and short upright winglets. Match the pictured BA CityFlyer paint. It uses the same main title BRITISH AIRWAYS. Photograph: G-LCYO.

#### Selected revisions

**Airbus A319**

> Clean the transparency of the first attached British Airways A319 illustration. Keep the fully drawn isolated aircraft precisely, including the short A319 airframe and all British Airways paint, letters, geometry and matte colors. Remove the faint white halo directly above and around the tail and any other soft residue outside the aircraft. Leave the entire outer background at zero alpha, with only a thin anti-aliased aircraft edge. Retain the exact nose-left level side elevation and the retracted gear. Give the nose and tail clear breathing room on a wide 3:1 canvas. Attachment 2 is the real aircraft for identity and color.

**Airbus A350-1000**

> Refine the first attached long-bodied Airbus A350-1000 British Airways illustration. Draw the upper part of the missing third full-size cabin-door outline just aft of the wing root, around two-thirds of the way from nose to tail. Match the thin outline and height of the other three main doors and use the second attachment for geometry. Let the wing occlude the lower part of this door if it crosses there. Interrupt the window row at the outline. Preserve the long-bodied Airbus A350-1000 silhouette, exact British Airways livery and titles, wing, engine treatment, crisp level nose-left pose and clean margins. Deliver the entire aircraft, with genuinely transparent alpha at zero opacity everywhere outside the clean antialiased aircraft. Attachment 2 is an airframe reference only.

**Boeing 787-8**

> Refine the first attached compact Boeing 787-8 British Airways illustration. Draw the upper part of the missing third full-size cabin-door outline just aft of the wing root, around two-thirds of the way from nose to tail. Match the thin outline and height of the other three main doors and use the second attachment for geometry. Let the wing occlude the lower part of this door if it crosses there. Interrupt the window row at the outline. Preserve the compact Boeing 787-8 silhouette, exact British Airways livery and titles, wing, engine treatment, crisp level nose-left pose and clean margins. Deliver the entire aircraft, with genuinely transparent alpha at zero opacity everywhere outside the clean antialiased aircraft. Attachment 2 is an airframe reference only.


## Wizz Air standard artwork

Standard-livery artwork is ready for all five passenger variants in Wizz Air Holdings’ November interim report. Wizz Air Hungary (`WZZ`), Wizz Air Malta (`WMT`), and Wizz Air UK (`WUK`) share the current Wizz Air livery. The artwork mappings cover the operators that use each variant. [Wizz Air F27 interim report](https://filemanager-cdn.mziq.com/published/f33cff8c-9600-4e77-8b65-b797eb10bc4e/c3c4ccc7-bc86-4681-9823-8aa0edd19efe) · [Wizz Air Hungary fleet](https://www.planespotters.net/airline/Wizz-Air-Hungary) · [Wizz Air Malta fleet](https://www.planespotters.net/airline/Wizz-Air-Malta) · [Wizz Air UK fleet](https://www.planespotters.net/airline/Wizz-Air-UK)

All five illustrations are 2172 × 724 transparent RGBA PNGs. The A321XLR profile includes its extended belly fairing. [Airbus A321XLR design details](https://www.airbus.com/en/newsroom/stories/2024-05-preparing-for-the-a321xlrs-entry-into-service)

| Illustration | ICAO type | Match | Reference aircraft |
| --- | --- | --- | --- |
| [Airbus A320ceo](../assets/aircrafts/airliners/a320-wizz-air.png) | `A320` | `WZZ`, `WMT` | [HA-LYQ](https://www.flugzeug-bild.de/bild/passagierflugzeuge~airbus~a-320/120481/wizz-air-ha-lyq-airbus-a320-232-msn.html) |
| [Airbus A320neo](../assets/aircrafts/airliners/a320neo-wizz-air.png) | `A20N` | `WMT` | [9H-WAN](https://www.aeroinside.com/21646/wizz-malta-a20n-at-cluj-on-mar-19th-2026-bird-strike) |
| [Airbus A321ceo](../assets/aircrafts/airliners/a321-wizz-air.png) | `A321` | `WZZ`, `WMT` | [HA-LXL](https://www.flugzeug-bild.de/bild/passagierflugzeuge~airbus~a-321/177255/wizz-air-ha-lxl-airbus-a321-231-msn.html) |
| [Airbus A321neo](../assets/aircrafts/airliners/a321neo-wizz-air.png) | `A21N` | `WZZ`, `WMT`, `WUK` | [HA-LZI](https://www.planespotters.net/photo/1790375/ha-lzi-wizz-air-airbus-a321-271nx) |
| [Airbus A321XLR](../assets/aircrafts/airliners/a321xlr-wizz-air.png) | `A21N` | Airframe | [9H-XLB](https://xfw-spotter.blogspot.com/2025/08/a321-271ny-wizz-air-d-avzp-9h-xlb-msn.html) |

The A321neo and A321XLR share `A21N`. The ten Maltese XLR registrations have exact airframe mappings to select their own artwork. A Wizz flight with `A21N` and an unrecognized airframe uses the standard A321neo artwork when the operator matches. [ICAO aircraft designators](https://www.icao.int/operational-safety/doc-8643-aircraft-type-designators/search)

| A321XLR registration | ADS-B hex |
| --- | --- |
| 9H-XLA | [`4D2064`](https://www.planespotters.net/hex/4D2064) |
| 9H-XLB | [`4D20DC`](https://www.planespotters.net/hex/4D20DC) |
| 9H-XLC | [`4D213B`](https://www.planespotters.net/hex/4D213B) |
| 9H-XLD | [`4D2168`](https://www.planespotters.net/hex/4D2168) |
| 9H-XLE | [`4D216A`](https://www.planespotters.net/hex/4D216A) |
| 9H-XLF | [`4D2186`](https://www.planespotters.net/hex/4D2186) |
| 9H-XLG | [`4D2187`](https://www.planespotters.net/hex/4D2187) |
| 9H-XLH | [`4D21DA`](https://www.planespotters.net/hex/4D21DA) |
| 9H-XLI | [`4D21DD`](https://www.planespotters.net/hex/4D21DD) |
| 9H-XLJ | [`4D229E`](https://www.planespotters.net/hex/4D229E) |

### Generation prompts

The built-in image tool used the [SAS A320neo](../assets/aircrafts/airliners/a320neo-sas.png) for style and the photos above for paint and airframe details. The A321XLR also used the [SAS A321LR](../assets/aircrafts/airliners/a321lr-sas.png) for the pose and family proportions.

> Draw one original recognition illustration for Overhead’s color e-paper aircraft catalog. Attachment 1 sets the catalog’s matte painted realism, restrained shading, and crisp outlines. Attachment 2 is a real Wizz Air aircraft for its exact type and current ordinary livery. Attachment 3, if included, helps with a level airframe profile. Draw a strictly horizontal left-facing port-side elevation, with landing gear and flaps completely stowed and no perspective tilt. Isolate the entire aircraft on a wide 3:1 transparent PNG with clean, generous clear margins. Use actual zero-alpha background pixels outside the crisp anti-aliased aircraft. No halo, scenery, ground, shadow, text outside the aircraft, or visible individual registration.

The detail prompts below follow that opening. Each render ends with this shared livery prompt.

> Copy the current standard Wizz Air color blocking from the aircraft photo. The nose and forward fuselage are white. The vivid magenta middle and rear band starts as a diagonal cut rising toward the tail over the wing area. A second slanted boundary leads into royal blue on the aft fuselage and tail cone. The fin is royal blue on the lower and trailing area with a large vivid magenta diagonal field on its top and leading side. Use magenta engine nacelles and colored wingtip faces exactly as in the photograph. On the forward white fuselage put the large outlined Wizz wordmark, reading “W!ZZ” in its stylized slanted lettering across the window line, with thin magenta upper outlines and blue lower outlines and white counters. Put small white, lowercase “wizzair.com” on the magenta aft side above the windows and on visible engine nacelles. Keep typography legible and one coherent version of the standard scheme. No large XLR text, anniversary decals, promotional stickers, test marks or badges.

#### Airbus A320ceo

> Draw the 37.6 m Airbus A320-232 HA-LYQ in attachment 2. Its conventional A320 cockpit, two main passenger doors, two close overwing exit hatches, and slimmer smooth-sided IAE V2500 nacelles distinguish it from the neo. Use the tall swept sharklets installed on this photographed A320ceo, even if attachment 3 has smaller classic wingtip fences. Show the original V2500’s long slim nacelle rather than the heavier neo fan shape.

#### Airbus A320neo

> Draw the 37.6 m Airbus A320-271N 9H-WAN. Preserve the familiar A320 nose, front and rear main doors, two adjacent smaller overwing exit hatches, tall swept sharklets, and large rounded smooth Pratt & Whitney PW1100G nacelles. Keep the length compact next to the A321. If the photographed aircraft faces right, redraw it nose-left and keep all lettering readable.

#### Airbus A321ceo

> Draw the 44.5 m Airbus A321-231 HA-LXL, with a noticeably stretched cabin and older, slender smooth IAE V2500 engine nacelles. Use the tall sharklets fitted to the exact Wizz Air aircraft in attachment 2. The conventional A321ceo shows four separated full-size doors, at the nose, ahead of the wing, behind the wing, and near the tail. The two intermediate doors have full-height outlines instead of paired window-sized overwing hatches.

#### Airbus A321neo

> Draw the 44.5 m Airbus A321-271NX HA-LZI with tall swept sharklets and large smooth-edged Pratt & Whitney PW1100G fan nacelles. The real Airbus Cabin Flex photo shows two small overwing hatch outlines, one taller exit just aft of the wing, and main doors at the nose and tail. Keep the ordinary A321neo’s smooth standard belly fairing in this view.

#### Airbus A321XLR

> Draw the 44.5 m Airbus A321-271NY XLR 9H-XLB. Retain the long A321 body, upgraded large Pratt & Whitney GTF nacelles, tall swept sharklets, and the Cabin Flex pattern photographed on this plane, with two small nearby overwing exits, a separate aft-of-wing door outline, and main doors at each end. Give the center and aft lower fuselage the subtly extended and deeper XLR belly fairing covering the rear center tank, as seen under and just behind the wing in attachment 2, with a smooth tapered transition. The third attachment is an A321LR for pose and simplified family geometry only. Render attachment 2’s ordinary pink, blue and white livery and port side even though the photo is nose-right.

#### Selected revisions

The A321neo and A321XLR each received this prompt with the relevant variant name and reference photo.

> Make a localized door-layout correction to the first attached Wizz Air Airbus A321neo illustration. It already has the main forward and aft boarding doors and the two small adjacent overwing exits. Add the missing separate rectangular full-height Cabin Flex emergency exit in the magenta fuselage just aft of the wing root, about 61 percent of the way from nose to tail, roughly below the left edge of the aft “wizzair.com” title or just ahead of it. Attachment 2 shows the actual third tall door, outlined in pale paint. Draw a very thin plausible outline the same height as the existing main doors, with its top above the row of cabin windows and visibly clear of the wing. Let the near wing hide the bottom if those surfaces overlap. Keep the exact Wizz Air current livery and logos, all other doors and existing aircraft geometry as rendered, including the belly fairing, level nose-left pose and matte finish. Preserve the complete aircraft and clean surrounding zero-alpha transparency on the same broad canvas.

The A321neo received two further passes to clean up the exit outline and transparency.

> Make exactly one very small local correction in attachment 1, the Wizz Air Airbus A321neo illustration. There are two pale rectangular door outlines near the sharklet, one to its left and one to its right. Erase the duplicate door outline immediately to the RIGHT of the sharklet, directly before the lowercase white wizzair.com title. Replace only that narrow duplicate outline with matching pink fuselage and the normal horizontal row of cabin windows. KEEP the intended larger exit outline immediately to the LEFT of the sharklet, as shown in the photograph in attachment 2. The rear end boarding door in the blue fuselage also stays, and so do the two tiny gray overwing exits near the white and magenta boundary. Preserve the isolated nose-left model, aircraft paint, geometry, lighting, padding and real fully transparent background precisely.

> Finalize the first attached Wizz Air Airbus A321neo as a clean transparent aircraft asset. Keep the level port side facing left, Wizz livery and markings and the same aircraft geometry. Clean away the faint ghost line in the magenta paint immediately to the right of the near sharklet, just below and ahead of the wizzair.com text. The true tall emergency exit to the LEFT of the sharklet remains outlined, plus the two main doors at the ends and the two small adjacent overwing exits, like the real aircraft in attachment 2. Make the whole aircraft occupy only about 90 percent of the wide 3:1 frame to leave clean transparent breathing room around its nose and all the way around the tailplane on the right. Every pixel outside the aircraft’s sharp antialiased silhouette should be truly alpha 0. Preserve the matte painted catalog look. No halo, glow, faint background noise, crop or ground shadow.

## Emirates and Norwegian standard artwork

All four Emirates passenger types and both Norwegian passenger types have standard artwork ready. This batch added three Emirates widebodies and the plain-tail Norwegian MAX 8. The existing Emirates A380 and Norwegian 737-800 complete the passenger coverage.

| Illustration | Reference aircraft |
| --- | --- |
| [Emirates Airbus A350-900](../assets/aircrafts/airliners/a350-900-emirates.png) | A6-EXA · [Airbus photograph](https://www.paddleyourownkanoo.com/2024/11/25/emirates-finally-takes-delivery-of-the-first-of-65-next-generation-airbus-a350-900-aircraft/) · [Emirates delivery](https://www.emirates.com/media-centre/emirates-takes-delivery-of-its-first-a350-set-for-take-off-today/) |
| [Emirates Airbus A380-800](../assets/aircrafts/airliners/a380-800-emirates.png) | A6-EVG · [Photograph](https://www.jetphotos.com/photo/12050668) |
| [Emirates Boeing 777-200LR](../assets/aircrafts/airliners/777-200lr-emirates.png) | A6-EWB · [Airframe photograph](https://www.flugzeug-bild.de/1024/emirates-a6-ewb-boeing-777-200-lr-24765.jpg) · [Refreshed livery](https://www.emirates.com/media-centre/emirates-unveils-new-signature-livery-for-its-fleet/) |
| [Emirates Boeing 777-300ER](../assets/aircrafts/airliners/777-300er-emirates.png) | A6-ENV · [Photograph](https://djsaviation.net/first-emirates-777-with-new-livery/) |
| [Norwegian Boeing 737-800](../assets/aircrafts/airliners/737-800-norwegian-red-nose.png) | LN-NGD · [Norwegian fleet](https://www.norwegian.com/en/about/our-story/our-aircraft/) |
| [Norwegian Boeing 737 MAX 8](../assets/aircrafts/airliners/737-max-8-norwegian-red-nose.png) | SE-NAD · [Delivery photograph](https://media.no.norwegian.com/pressreleases/norwegian-henter-hjem-det-foerste-av-80-nye-boeing-737-max-8-3413554) · [Red fin cap and winglets on LN-FGI](https://abpic.co.uk/pictures/construction-number/65185) |

The Emirates passenger 777-200LR and SkyCargo 777F share the `UAE` operator and `B77L` type. The display uses the 777-200LR artwork for matches based on that pair alone. Norwegian's exact LN-FGF match continues to select the Karin Boye tail. [FAA type designators](https://www.faa.gov/documentLibrary/media/Order/2024-04-29_FAA_Order_JO_7360.1J_Aircraft_Type_Designators--post.pdf) · [Tracked SkyCargo 777F](https://www.flightradar24.com/data/aircraft/A6-EFW)

### Generation prompts

The built-in image tool used the [SAS A320neo](../assets/aircrafts/airliners/a320neo-sas.png) as its style reference. The A350-900 also used the [Lufthansa A350-900](../assets/aircrafts/airliners/a350-900-lufthansa.png) for geometry, the 777-300ER used the [British Airways 777-300ER](../assets/aircrafts/airliners/777-300er-british-airways.png), and the MAX 8 used the [neutral MAX 8](../assets/aircrafts/airliners/737-max-8-neutral.png). The four saved left-facing profiles are 2172 × 724 RGBA PNGs.

All four first renders used this shared opening.

> Draw one original aircraft recognition illustration for the Overhead color e-paper catalog. Use the first attachment for the catalog’s accurate matte paint, crisp clean lines and restrained shaded realism. Use the second attachment as a factual aircraft and livery reference. Use additional attachments for the explicitly stated roles. Draw a strict level port-side elevation facing left, with landing gear and flaps fully stowed. Put the entire aircraft comfortably in the center of a wide 3:1 frame, with breathing room around nose, tail and the wing tips. True fully transparent alpha outside the isolated aircraft, clean antialiased edges, no halo, shadow, terrain, sky, border, watermarks or exterior caption. Omit individual registrations and small service stencils.

The A350-900 and 777-300ER used this shared paint instruction after their individual detail prompts.

> Use Emirates’ 2023 refreshed standard livery. Matte white fuselage and white nacelles with small gold Emirates emblems on the engine sides. Use large stylized metallic-gold “Emirates” titles across the forward fuselage over the window line, followed immediately aft by the much smaller gold Arabic Emirates calligraphy “الإمارات”, as on the port-side photograph. Use an authentic flowing United Arab Emirates flag on the fin. The broad red curved band sweeps diagonally from the top of the fin down to the fin root, with the green, white and black flag sections flowing smoothly behind it and subtle shading suggesting fabric. Preserve the red wingtip treatment and white Arabic motif on the outside where visible, keeping the tips true to the aircraft model. No URL on the fuselage and no event, sponsor, route or commemorative paint.

#### Emirates Airbus A350-900

> Draw the 66.8 m Airbus A350-900 as photographed on A6-EXA. Preserve the sleek tapered nose, black cockpit-window mask, two large smooth Rolls-Royce Trent XWB-84 nacelles, long gently rising curved wings, and four full-sized passenger doors along the visible side. The upper outline of the third door just aft of the wing root must be distinct above the wing. Attachment 3 shows the exact A350-900 family geometry only, as a check on the side elevation. Use continuous curved A350 tips and keep the A350-900 cabin visibly shorter than the -1000.

#### Emirates Boeing 777-300ER

> Draw the elongated 73.9 m Boeing 777-300ER based on A6-ENV, the first 777-300ER in the refreshed Emirates scheme. Attachment 3 supplies exact long 777-300ER geometry in a clean level profile only. Keep five distinct full-height doors on the near side, the classic Boeing 777 cockpit and rounded nose, one near-side massive smooth-edged GE90-115B nacelle, and the flat raked wingtip without an upright winglet. The far-side engine is naturally hidden in strict side projection. Do not adopt the foreshortening or deployed gear in the aircraft photograph.

#### Emirates Boeing 777-200LR

> Draw the 63.7 m Boeing 777-200LR in passenger configuration, with four full size cabin doors on its near side, a noticeably shorter cabin than the 777-300ER, the traditional Boeing 777 rounded nose and angular cockpit with no black window mask, large smooth-ended GE90-110B/-115B nacelles and long raked wingtips with no upright winglets. Show the visible upper outline of the third door just behind the wing root and the paired foremost and second full-size doors, plus the full-size door near the tail. Keep cabin windows across the fuselage, no freighter cargo doors. The far engine may be occluded by the near engine in side view.

> Use the new ordinary Emirates paint on the -200LR. Attachment 2 shows A6-EWB in earlier paint and supplies ONLY its airframe shape; attachment 3 shows the current everyday Emirates paint on A6-ENV and supplies the markings only. White body and white nacelles with small gold Emirates logos. Large metallic-gold stylized “Emirates” across the forward fuselage over the window line, followed aft by its much smaller gold Arabic script “الإمارات”. Use the flowing contemporary red, green, white and black UAE flag on the tail. The red diagonal curves down the fin root, with flag fabric shading inside the color fields. Red painted raked wingtips with a subtle white Arabic motif where visible. No web address, event decals or special campaign graphics.

#### Norwegian Boeing 737 MAX 8

> Draw the 39.5 m Boeing 737 MAX 8. Match the standard-density two adjacent small overwing exits and the two main doors near the nose and tail. No extra MAX 8-200 door. Use the scimitar split-tip winglets with both upper and lower red blades, the traditional angular Boeing cockpit and noticeably larger rounded CFM LEAP-1B nacelles with distinct serrated chevrons at the exhaust edge. Keep the sill and low stance visually correct with the gear stowed.

> Use Norwegian’s standard plain-tail red-nose paint. Attachment 2 is Norwegian’s SE-NAD delivery photograph for the actual current rounded white lowercase “norwegian” titles and small white aircraft-shaped mark immediately after them, on the red nose BELOW the cabin windows. Attachment 3 is the exact 737 MAX 8 geometry in a neutral paint. Attachment 4 is a current red-nose MAX 8 for placement of the standard red fin cap, very thin dark blue and white accents under the cap, red split winglet treatment, white nacelles and separation of the red nose section from the white cabin by a slim dark navy stripe. Ignore this fourth photo’s portrait and draw the entire fin white below the small red cap and separator stripes, with smooth matte gray shading only. Keep the fuselage white aft of the red forebody and the actual wing paint. No person, portrait, promotional markings, web address or individual registration.

#### Selected revisions

The [existing Emirates A380](../assets/aircrafts/airliners/a380-800-emirates.png) was the transparency reference for the A350-900 and 777-300ER.

**Emirates Airbus A350-900**

> Precisely isolate the Emirates Airbus A350-900 in attachment 1 as a clean aviation cutout. Attachment 2 demonstrates the target transparent edges and absence of background only, and depicts a different model. Keep the exact completed Airbus A350-900 body, engine, paint, all gold titles and the UAE flag, in the same level nose-left position. Erase all translucent gray or white haze and any soft glow around the perimeter of the aircraft, including above the fuselage, all around the tail and below the engines. Background pixel alpha is exactly zero everywhere outside the sharp antialiased aircraft contour, including all four canvas edges and the area immediately around the aircraft. Give the complete aircraft a wide 3:1 canvas and very clear margins around the nose, tail, and wingtips. Preserve the crisp matte painted finish and never add a background, wash, texture, shadow, or glow.

> Add one missing detail to attachment 1, the clean transparent Emirates Airbus A350-900 profile. Use attachment 2 only to locate the second main passenger door of this exact model, in the forward cabin well ahead of the wing, around 28 percent of the distance from nose to tail. On the Emirates aircraft this door is painted through with the gold word “Emirates”, so retain the word exactly and draw the thin, subtle rectangular door seal and a small clear break in the cabin window row over that paint. This creates 4 door positions total on the visible side. Leave the existing door by the nose and every existing middle and rear aircraft door exactly as they are. Retain the precise shape, attitude, engine, wing and colors. Preserve clean antialiasing and the original full transparent alpha, including clear space all the way around the aircraft. No haze or other adjustments.

> Refine one small paint detail on the first attached Emirates Airbus A350-900 illustration. The second passenger door is outlined in the middle of the gold Emirates wordmark, where its white fill has broken part of the gold lettering. Continue the gold stroke of the existing word THROUGH the surface of that door exactly as in the real aircraft in attachment 2. Keep the thin rectangular door seam legible over the paint, like a faint pencil outline, and preserve the cabin window gap. The full single word still reads Emirates in its original metallic-gold serif lettering. Do not add or move any doors or letters. Preserve absolutely every other part of the airframe, paint, pose, size, translucent-edge treatment and fully clear alpha background. Leave the same wide, genuinely transparent canvas with no halo.

**Emirates Boeing 777-300ER**

> Precisely isolate the Emirates Boeing 777-300ER in attachment 1 as a clean aviation cutout. Attachment 2 demonstrates the target transparent edges and absence of background only, and depicts a different model. Keep the exact completed Boeing 777-300ER body, engine, paint, all gold titles and the UAE flag, in the same level nose-left position. Erase all translucent gray or white haze and any soft glow around the perimeter of the aircraft, including above the fuselage, all around the tail and below the engines. Background pixel alpha is exactly zero everywhere outside the sharp antialiased aircraft contour, including all four canvas edges and the area immediately around the aircraft. Give the complete aircraft a wide 3:1 canvas and very clear margins around the nose, tail, and wingtips. Preserve the crisp matte painted finish and never add a background, wash, texture, shadow, or glow.

> Add one missing detail to attachment 1, the clean transparent Emirates Boeing 777-300ER profile. Use attachment 2 only to locate the second main passenger door of this exact model, in the forward cabin well ahead of the wing, around 28 percent of the distance from nose to tail. On the Emirates aircraft this door is painted through with the gold word “Emirates”, so retain the word exactly and draw the thin, subtle rectangular door seal and a small clear break in the cabin window row over that paint. This creates 5 door positions total on the visible side. Leave the existing door by the nose and every existing middle and rear aircraft door exactly as they are. Retain the precise shape, attitude, engine, wing and colors. Preserve clean antialiasing and the original full transparent alpha, including clear space all the way around the aircraft. No haze or other adjustments.

**Emirates Boeing 777-200LR**

> Make one localized geometry adjustment to the first attached Emirates Boeing 777-200LR. Add the second of its four full-size passenger doors along the visible side. It is well ahead of the wing root and around 31 percent of the length measured from nose to tail, within the latter half of the large gold Emirates lettering. An aircraft’s gold paint continues over the door itself. Draw a thin subtle door seal over the paint matching the height of the first door, with a small interruption in the cabin windows. Preserve the first door near the nose, existing third door just aft of the wing and fourth door near the tail. Attachments 2 and 3 show the four main door positions. Keep all original current Emirates paint, gold Arabic and English titles, fin and wing treatment, body proportions, level nose-left position and fully transparent clean wide canvas. No other modifications or faint opaque glow.

## Air France standard artwork

Standard-livery artwork is ready for ten Air France mainline passenger types, the two HOP regional types, and Air France Cargo’s Boeing 777F. The A318 and A319 were still flying in late November 2026. [Air France–KLM Q3 fleet report](https://www.airfranceklm.com/sites/default/files/2026-11/q3_2026-afklm-press-release.pdf) · [A318 flight history](https://www.flightradar24.com/data/aircraft/f-gugn) · [A319 flight history](https://www.flightradar24.com/data/aircraft/f-grxf/)

| Aircraft | ICAO type | Operator match | Standard-livery reference |
| --- | --- | --- | --- |
| [Airbus A220-300](../assets/aircrafts/airliners/a220-300-air-france.png) | `BCS3` | `AFR` | [F-HZUK](https://www.planespotters.net/photo/1308292/f-hzuk-air-france-airbus-a220-300-bd-500-1a11) |
| [Airbus A318](../assets/aircrafts/airliners/a318-air-france.png) | `A318` | `AFR` | [F-GUGN](https://www.planespotters.net/photo/1286206/f-gugn-air-france-airbus-a318-111) |
| [Airbus A319](../assets/aircrafts/airliners/a319-air-france.png) | `A319` | `AFR` | [F-GRXF](https://www.baaa-acro.com/spotting/f-grxf-1) |
| [Airbus A320](../assets/aircrafts/airliners/a320-air-france.png) | `A320` | `AFR` | [F-HEPF](https://www.planespotters.net/photo/1735449/f-hepf-air-france-airbus-a320-214-wl) |
| [Airbus A321](../assets/aircrafts/airliners/a321-air-france.png) | `A321` | `AFR` | [F-GTAZ](https://www.aeroinside.com/18810/france-a321-at-birmingham-on-nov-7th-2023-rejected-takeoff-with-aircraft-on-short-final) |
| [Airbus A330-200](../assets/aircrafts/airliners/a330-200-air-france.png) | `A332` | `AFR` | [F-GZCN](https://www.planespotters.net/photo/1401780/f-gzcn-air-france-airbus-a330-203) |
| [Airbus A350-900](../assets/aircrafts/airliners/a350-900-air-france.png) | `A359` | `AFR` | [F-HTYT](https://www.aeroinside.com/21307/france-a359-at-buenos-aires-on-nov-20th-2025-smell-of-smoke-on-board) |
| [Boeing 777-200ER](../assets/aircrafts/airliners/777-200er-air-france.png) | `B772` | `AFR` | [F-GSPG](https://www.planespotters.net/photo/1724600/f-gspg-air-france-boeing-777-228er) |
| [Boeing 777-300ER](../assets/aircrafts/airliners/777-300er-air-france.png) | `B77W` | `AFR` | [F-GSQO](https://www.aeroinside.com/21586/france-b773-at-fort-de-france-on-feb-21st-2026-engine-surges) |
| [Boeing 787-9](../assets/aircrafts/airliners/787-9-air-france.png) | `B789` | `AFR` | [F-HRBJ](https://worldairlinenews.com/2021/02/28/air-france-revises-its-livery-with-larger-titles-and-other-subtle-changes/) |
| [Embraer E170](../assets/aircrafts/airliners/e170-air-france-hop.png) | `E170` | `HOP`, `AFR` | [F-HBXI](https://www.flugzeug-bild.de/1200/air-france-hopembraer-e170stdf-hbxiham-eddhhamburg210724--167098.jpg) |
| [Embraer E190](../assets/aircrafts/airliners/e190-air-france-hop.png) | `E190` | `HOP`, `AFR` | [F-HBLY](https://www.planespotters.net/photo/1906108/f-hbly-air-france-hop-embraer-erj-190std-erj-190-100) |
| [Boeing 777F](../assets/aircrafts/airliners/777f-air-france-cargo.png) | `B77L` | `AFR` | [F-GUOB](https://www.planespotters.net/photo/1436996/f-guob-air-france-boeing-777-f28) |

The A220-300 uses the `BCS3` designator seen in flight tracking. The HOP profiles use the Air France paint with the small HOP marking. The cargo profile uses the windowless 777F fuselage and CARGO titles shown on F-GUOB. [Aircraft type designators](https://www.faa.gov/documentLibrary/media/Order/2021-10-07_Order_JO_7360.1F_Aircraft_Type_Designators.pdf) · [Air France A220 press kit](https://corporate.airfrance.com/sites/default/files/media-document/2025/01/af_dossier-de-presse_a220_en_0.pdf) · [HOP fleet](https://www.planespotters.net/airline/Air-France-Hop?refresh=1) · [F-GUOB flight record](https://www.flightradar24.com/data/aircraft/F-GUOB)

### Generation prompts

The built-in image tool made 13 left-facing 2172 × 724 RGBA PNGs. It used the [SAS A320neo](../assets/aircrafts/airliners/a320neo-sas.png) for style and the photos above for the real aircraft and paint.

> Create one original aircraft recognition illustration for the Overhead aviation kiosk. Attachment 1 shows the catalog’s soft realistic digital paint, matte surfaces, sharp coherent contours and restrained details. Attachment 2 is the factual photo of this aircraft and its actual standard livery. Attachment 3, if supplied, helps with the aircraft's airframe geometry and exact side-on pose; ignore that attachment’s livery. Render a strictly level orthographic left-facing port-side elevation of the complete aircraft, gear and flaps stowed. Use a broad 3:1 canvas, aircraft approximately 89 percent of frame width, generous clear margin at every extremity. Include only the aircraft. Actual zero alpha outside its antialiased silhouette. No haze, floor, shadow, sky, glow, frame, extra markings, captions, watermarks or readable individual registration.

Each aircraft prompt below used the shared Air France livery instructions.

> Match the standard Air France livery as it appears in the photo. Matte white fuselage and typically white engines. Use uppercase single navy wordmark “AIRFRANCE” above the forward cabin windows, followed by the small red swept Air France accent. Use the exact Air France tricolor diagonal stripe pattern on the white fin with parallel dark navy stripes and the red lower band. Follow the photographed color of any wingtip fences or winglets and add the small winged seahorse near the nose or nacelle only where the photo shows it. Subtle details and clean precise real-world lettering; no SkyTeam full-body or commemorative paint.

The regional HOP aircraft used this additional instruction.

> The regional E-Jet has a small red “HOP!” under the forward cabin windows below the main Air France title, as in the photo. No large red HOP titles or red HOP tail.

The freighter used this additional instruction.

> Draw the large dark standard “CARGO” subtitle underneath the forward AIRFRANCE title, as on the photographed freighter. No passenger window row.

#### Airbus A220-300

> Draw the 38.7 m Airbus A220-300, the former CS300. Preserve its low sloped pointed A220 nose and cockpit windshield, long narrow-body cabin, modern PW1500G fan nacelles, modest upward winglets, full forward and rear doors and its overwing hatch pattern from the actual F-HZUK photo. Preserve the dark blue sharklet color and the small winged seahorse on white engines and near the nose where visible.

#### Airbus A318

> Draw the very compact 31.4 m Airbus A318-111 with its unusually tall prominent fin in proportion to its short body, conventional A320-family cockpit, two main passenger doors, one small overwing hatch and proper classic short two-sided wingtip fences. Keep the compact CFM56-5B engines and short tailcone. Distinguish this Baby Bus from the slightly longer A319.

#### Airbus A319

Geometry reference [a319-lufthansa.png](../assets/aircrafts/airliners/a319-lufthansa.png).

> Draw the 33.8 m Airbus A319-111 exactly, relatively compact but longer than the A318. Keep the actual F-GRXF classic small two-sided wingtip fences, two main boarding doors and single overwing exit. Use smooth slim CFM56-5B nacelles and the familiar blunt A320-family nose.

#### Airbus A320

> Draw this exact 37.6 m Airbus A320-214 with tall swept dark blue sharklets as shown on F-HEPF, slim smooth older CFM56-5B nacelles, main boarding doors at the ends and two adjacent small overwing exits. Use the classic A320-family cockpit and ordinary A320ceo proportions.

#### Airbus A321

> Draw this exact 44.5 m Airbus A321-212 ceo, with long stretched classic Airbus body, small original two-sided wingtip fences and two slim smooth CFM56-5B nacelles. The visible passenger door layout has four distinct full-height doors, at both ends and immediately ahead of and behind the wing. No adjacent tiny overwing hatches on this ceo.

#### Airbus A330-200

Geometry reference [a330-200-klm.png](../assets/aircrafts/airliners/a330-200-klm.png).

> Draw the shorter 58.8 m Airbus A330-203 with a conventional widebody Airbus cockpit and the short core fuselage of the -200. Use two smooth GE CF6-80E1 nacelles and classic small triangular A330ceo tip fences. Four full-size cabin doors on the visible side at the nose, ahead of the wing, just aft of it and near the tail. Show the top of the third door above the wing if the lower portion is hidden.

#### Airbus A350-900

Geometry reference [a350-900-neutral.png](../assets/aircrafts/airliners/a350-900-neutral.png).

> Draw the 66.8 m Airbus A350-900 with its tapered nose and black contemporary cockpit window mask, long smoothly rising blended wings and two large smooth Rolls-Royce Trent XWB nacelles. Preserve its four full-size cabin doors including clearly marked door outlines just ahead of and behind the wing. Show the dark blue blended wingtips as in the Air France photo.

#### Boeing 777-200ER

Geometry reference [777-200er-british-airways.png](../assets/aircrafts/airliners/777-200er-british-airways.png).

> Draw the 63.7 m Boeing 777-228ER with classic rounded 777 nose, four individually visible cabin doors, comparatively short widebody passenger cabin, two smooth GE90 turbofans and traditional swept wingtips without upright winglets. Show the second door before the wing and the upper part of the third door just beyond the wing root.

#### Boeing 777-300ER

Geometry reference [777-300er-neutral.png](../assets/aircrafts/airliners/777-300er-neutral.png).

> Draw the 73.9 m Boeing 777-328ER with its distinct very long stretched passenger cabin on either side of the wing, conventional Boeing cockpit, huge smooth-edged GE90-115B nacelles, and long raked wingtips. Show five full-size doors along the visible side. Keep clearly separate the two ahead of the wing, the center door, the door farther aft and the rearmost door.

#### Boeing 787-9

Geometry reference [787-9-klm.png](../assets/aircrafts/airliners/787-9-klm.png).

> Draw the 62.8 m Boeing 787-9 as on F-HRBJ, using ordinary Air France paint from the aircraft photo. Preserve the Dreamliner’s tapered sloped cockpit, medium-length cabin, four full-size passenger doors and long gently raked wing tips without upright winglets. Use large white GEnx nacelles with distinct scalloped chevrons at the outer rear edges. Show the third door immediately aft of the wing, partially occluded if necessary.

#### Embraer E170

> Draw the compact 29.9 m first-generation Embraer ERJ-170-100 with slender tapered Embraer nose, low short wings with distinctive small upright winglets, clean slim narrowbody cabin and two small smooth GE CF34 nacelles. Follow the F-HBXI passenger door layout exactly, with normal full-size doors forward and aft. Its compact length and clean cabin side distinguish it from the E190.

#### Embraer E190

Geometry reference [e190-klm-cityhopper.png](../assets/aircrafts/airliners/e190-klm-cityhopper.png).

> Draw the longer 36.2 m first-generation Embraer ERJ-190-100. Preserve the slender small-fuselage proportions, the two small CF34 nacelles, upright small winglets and the original E190 nose. Place the two end boarding doors and one small overwing escape hatch as seen on F-HBLY. Draw this first-generation E190, not the newer E190-E2.

#### Boeing 777F

Geometry reference [777-200lr-emirates.png](../assets/aircrafts/airliners/777-200lr-emirates.png).

> Draw the Boeing 777-F28 standard freighter on F-GUOB. Use the compact 63.7 m 777F airframe with huge smooth-edged GE90 nacelles, long swept raked wing and classic 777 nose. The airframe has one small crew entry near the nose, an unbroken white cabin without a passenger window row or regular passenger doors, and the outline of the large rectangular MAIN DECK CARGO DOOR on the left aft fuselage, well behind the wing. Match the exact cargo geometry of the reference photograph. If attachment 3 shows a passenger version, use it only for overall length and wing/engine geometry.

#### Selected revisions

The 777F door dimensions come from Boeing’s airport planning documentation. [Boeing 777F technical reference](https://www.boeing.com/content/dam/boeing/boeingdotcom/commercial/airports/acaps/777_2lr_3er_f.pdf)

**Airbus A220-300**

> Correct two recognizability details in the first attached Air France Airbus A220-300 profile. Attachment 2 is the real F-HZUK A220-300 in a nearly side-on photo. The A220 has exactly one small overwing emergency hatch on the visible side, around the middle of the cabin just in front of the main wing. Of the two adjacent small outlined hatches on the drawing, keep one and replace the other with a normal cabin window. Keep both large end doors in place. Make the cockpit and nose follow the photo’s distinct smooth, sloping A220 nose and smaller dark windscreen instead of a blunt conventional A320 front. The nose still faces left, with landing gear and flaps stowed. Preserve the original dark-blue A220 winglet, large PW1500G nacelle, all Air France standard paint, lettering, proportions, matte finish and wide canvas. Keep opacity exactly zero outside the crisp aircraft silhouette, with clear margins and no halo.

**Boeing 777F**

> Correct the size and vertical placement of the single main-deck cargo door on the aft left fuselage in attachment 1. This is an Air France Cargo Boeing 777F. About 73 percent of the way back from the nose, the illustrated low narrow baggage-hatch rectangle is in approximately the right horizontal position. Replace that one outline with the real 777F main-deck cargo door, a much taller approximately 3.7 m wide and 3.05 m high rectangular panel with subtly rounded corners. The fine door seal occupies about half of the full fuselage height, centered vertically on the cabin level with its upper edge high on the upper sidewall. Render it closed and painted white as part of the aircraft. The main-deck panel is clearly distinguishable even with light gray seams. The forward crew door, AIRFRANCE and CARGO titles, windowless fuselage, full side-on silhouette, engine and dark blue and red tail markings stay intact. Keep the complete aircraft isolated in the same wide 3:1 frame and genuinely zero alpha in the surrounding pixels, with no haze.

## China Eastern Airlines standard artwork queue

The queue covers 15 aircraft types flown under China Eastern Airlines’ `CES` operator code. China Eastern’s October operations filing confirms the aircraft families. The tracked fleet supplies the individual variants. The COMAC C909 is the ARJ21-700, which joined China Eastern’s mainline fleet when the airline absorbed OTT Airlines. [October 2026 fleet filing](https://static.cninfo.com.cn/finalpage/2026-11-17/1225673070.PDF) · [Tracked fleet by aircraft type](https://www.flightradar24.com/data/airlines/mu-ces/fleet) · [OTT integration](https://english.shanghai.gov.cn/en-Latest-WhatsNew/20240925/f2fe9dfd4ff2412e8445a871eabd3eb4.html)

| Aircraft | ICAO type | Reference aircraft |
| --- | --- | --- |
| Airbus A319 | `A319` | [B-6427](https://www.planespotters.net/photo/1899523/b-6427-china-eastern-airlines-airbus-a319-133-wl) |
| Airbus A320 | `A320` | [B-9945](https://www.planespotters.net/photo/1329943/b-9945-china-eastern-airlines-airbus-a320-232-wl) |
| Airbus A320neo | `A20N` | [B-307J](https://www.planespotters.net/photo/1647645/b-307j-china-eastern-airlines-airbus-a320-251n) |
| Airbus A321 | `A321` | [B-9971](https://www.planespotters.net/photo/1982317/b-9971-china-eastern-airlines-airbus-a321-231-wl) |
| Airbus A321neo | `A21N` | [B-32LH](https://www.planespotters.net/photo/1898244/b-32lh-china-eastern-airlines-airbus-a321-251nx) |
| Airbus A330-200 | `A332` | [B-5962](https://www.flugzeug-bild.de/bild/fluggesellschaften~asien~china-eastern-airlines-mu-ces/91441/china-eastern-airlines-b-5962-airbus-a330-243e.html) |
| Airbus A330-300 | `A333` | [B-6506](https://www.planespotters.net/photo/1271518/b-6506-china-eastern-airlines-airbus-a330-343) |
| Airbus A350-900 | `A359` | [B-304D](https://www.planespotters.net/photo/1567987/b-304d-china-eastern-airlines-airbus-a350-941) |
| Boeing 737-700 | `B737` | [B-5298](https://www.planespotters.net/photo/1087951/b-5298-china-eastern-yunnan-airlines-boeing-737-79p-wl) |
| Boeing 737-800 | `B738` | [B-5493](https://media.abpic.co.uk/pictures/full_size_0416/1628201-large.jpg) |
| Boeing 737 MAX 8 | `B38M` | [B-1380](https://commons.wikimedia.org/wiki/File:B-1380@KMG_(20180213173137).jpg) |
| Boeing 777-300ER | `B77W` | [B-2003](https://www.flugzeug-bild.de/bild/Passagierflugzeuge~Boeing~777/114323/b-2003-boeing-777-39p-china-eastern-melbourne.html) |
| Boeing 787-9 | `B789` | [B-206K](https://www.planespotters.net/photo/897062/b-206k-china-eastern-yunnan-airlines-boeing-787-9-dreamliner) |
| COMAC C909 (ARJ21-700) | `AJ27` | [B-656Y](https://www.planespotters.net/photo/1820577/b-656y-china-eastern-airlines-comac-arj21-700) |
| COMAC C919 | `C919` | [B-919G](https://k.sina.com.cn/article_5787187353_158f1789902001p0ta.html) |

Use the current standard white livery with the red-and-blue swallow on the fin, red Chinese titles and dark-blue CHINA EASTERN titles. The B-9945 A320 photograph supplies its airframe geometry. B-307J supplies the current paint layout for that profile. Use the current standard titles on the Boeing 737-700. Both COMAC aircraft use their ICAO tracking designators, `AJ27` for the C909 and `C919` for the C919. [China Eastern’s brand description](https://tw.ceair.com/newCMS/tw/hk/content/hk_Footer/Support/201903/W020190510545701930275.pdf) · [Aircraft type designators](https://www.faa.gov/documentLibrary/media/Order/2021-10-07_Order_JO_7360.1F_Aircraft_Type_Designators.pdf)

## Additional standard liveries from the overflight audit

Finnair and Atlantic Airways lead this set of 40 jobs. The narrowbody audit used tracks from 9–22 November 2026. The long-haul and cargo audit used the four cruise sampling windows above. The aircraft below are the initial coverage for this set. [ADS-B archive](https://github.com/ClickHouse/adsb.exposed) · [Artwork catalog and livery references](../assets/aircrafts/artwork.json)

| Operator | Queued aircraft |
| --- | --- |
| Finnair | A319, A320, E190 |
| Atlantic Airways | A320, A320neo |
| easyJet Group | A319, A320, A320neo, A321neo |
| Austrian Airlines | 767-300ER, 777-200ER, 787-9 |
| Royal Jordanian | 787-8, 787-9 |
| United Airlines | 767-300ER, 777-200ER, 777-300ER, 787-8, 787-9, 787-10 |
| Delta Air Lines | A330-900, 767-300ER |
| EL AL | 777-200ER, 787-8, 787-9 |
| Air Greenland | A330-800 |
| American Airlines | 777-200ER, 777-300ER, 787-8, 787-9 |
| Air China Cargo | A330-200P2F, 777F |
| Emirates SkyCargo | 777F, 777-300ERSF |
| Lufthansa Cargo | A321P2F, 777F |
| Air Canada Cargo | 767-300ER(BDSF) |
| Icelandair | A320-200 |
| Jettime | 737-800 |
| Airlift | AS350 B3 Écureuil |

Emirates SkyCargo and Air Canada Cargo use airframe-only matches because their type and operator combinations overlap with passenger aircraft or can be reused. The Jettime 737-800 has airframe matches for aircraft observed under other airlines’ callsigns. Airlift’s AS350 uses `AS50` and operator code `ALI`. [Emirates freighter records](https://planefinder.net/data/airline/UAE/fleet) · [Air Canada freighter records](https://planefinder.net/data/airline/ACA/fleet) · [Finnair’s Jettime service](https://www.finnair.com/fi-en/flight-information/travel-updates/jettime-operates-some-finnair-short-haul-flights-from-february-2025-to-march-2027-3680562) · [Airlift reference aircraft](https://aircraftregister.net/aircraft/LN-OXP)

### Finnair ATR 72-500

The [Finnair ATR 72-500 illustration](../assets/aircrafts/airliners/atr72-500-finnair.png) matches `AT75` with a `FIN` or `FCM` callsign. Other `AT75` aircraft can use the existing neutral ATR profile. Finnair’s ATR 72-500s are operated by Nordic Regional Airlines. [Finnair fleet](https://www.finnair.com/en/flight-information/finnair-fleet)

ImageGen prompt, with the neutral ATR 72-600 and Finnair E190 as references.

> Create a new Overhead aircraft illustration, a Finnair ATR 72-500 (ATR 72-212A) as operated by Norra. Reference image 1 is the existing Overhead neutral ATR 72-600, for near-identical turboprop geometry, scale, orthographic nose-left side view, shading and belly/wing layout. Reference image 2 is the Overhead Finnair E190, only for Finnair's lettering and tail logo. Draw the white ATR turboprop with the -500's black cockpit-window mask, long cabin, high wing, T-tail, two compact high-mounted engine nacelles and six slim stationary black propeller blades with light tips on the visible engine. Put bold, dark navy, italic "FINNAIR" above the forward passenger windows and the dark navy Finnair F logo on the white vertical fin. Render subtle painted realism, matching the neutral ATR's matte surfaces, level attitude and restrained highlights. Single aircraft in flight with its landing gear fully retracted. Widescreen 3:1 composition, with clean margins on every side and no clipping. True transparent RGBA PNG with zero-alpha background, no shadow, checkerboard, scenery, registration, captions or extra objects.

## DHL and Compass Air Cargo artwork queue

Added 21 profiles on 25 November 2026. The DHL set covers the publicly documented DHL-branded network, including dedicated regional aircraft and partner aircraft carrying DHL paint. A partner's other aircraft need their own livery references. [DHL fleet and capacity report](https://reporting-hub.group.dhl.com/2025-fy/en/combined-management-report/report-on-economic-position/express-division-1/) · [Tracked DHL-branded fleet](https://www.flightradar24.com/data/airlines/d0-dhk/fleet) · [Artwork catalog](../assets/aircrafts/artwork.json)

| Artwork | Queued profiles |
| --- | --- |
| DHL Airbus freighters | A300-600F, A330-200F with Air Hong Kong titles, A330-300P2F |
| DHL Boeing freighters | 737-400SF, 737-800BCF, 757-200F, 767-200BDSF, 767-300F, 777F |
| DHL regional aircraft | ATR 42-300F, ATR 72-200F, ATR 72-500F, Cessna 208B Super Cargomaster, Reims-Cessna F406 Caravan II, Bell 206B JetRanger II |
| DHL partner liveries | Kalitta Air 747-400BCF and 777F, Polar Air Cargo 747-8F |
| Compass Air Cargo | 737-800SF, 747-400F, 747-400ERF |

Compass Air Cargo's seven aircraft are mapped by registration and ADS-B address. The four 737s also match `ADZ` with `B738`. The two 747 variants share `B744` and are matched by airframe. On services such as Bergen–Stavanger, the `BCS` callsign can belong to a wet-leased Compass 737. For example, `LZ-CXC` (`452112`) selects Compass artwork even when the flight broadcasts a DHL callsign. An unidentified `BCS` 737 uses the neutral fallback. [Compass fleet](https://compasscargo.eu/) · [Tracked registrations](https://www.flightradar24.com/data/airlines/hq-adz/fleet) · [LZ-CXC in Bergen](https://www.jetphotos.com/photo/12205986) · [European Air Transport ICAO code](https://www.iata.org/en/about/members/airline-list/european-air-transport/534/)

Use the catalog's photo for each profile. The Air Hong Kong A330-200F is a factory freighter with the nose gear blister. The A330-300P2F is a passenger conversion. The DHL ATR 72-200F has a photographed livery reference and is available for gallery use once generated. Live matching is pending confirmation of a current registration in that paint. [Air Hong Kong fleet modernization](https://www.dhl.com/hk-en/home/press/press-archive/2025/dhl-express-completes-the-modernization-of-its-air-hong-kong-operated-fleet.html) · [ATR 72-200F reference](https://commons.wikimedia.org/wiki/File:DHLATRinDGAA.jpg)

## FedEx and UPS artwork queue

Added 21 standard-livery profiles on 25 November 2026. The queue covers the active mainline fleet types for both carriers and the documented FedEx-branded feeder and contracted fleet types. UPS feeder operators use their own liveries in the records reviewed for this update. [FedEx fleet filing](https://www.sec.gov/Archives/edgar/data/1048911/000104891126000105/fdx-20260531.htm) · [Mountain Air Cargo fleet](https://mtaircargo.com/fleet/) · [UPS fleet filing](https://investors.ups.com/sec-filings/all-sec-filings/content/0001628280-26-049912/0001628280-26-049912.pdf)

| Fleet | Queued profiles |
| --- | --- |
| FedEx Express | Airbus A300-600F, Boeing 757-200SF, 767-300F and 777F, McDonnell Douglas MD-11F |
| FedEx Feeder | ATR 42-300F / 42-320F, ATR 72-202F, ATR 72-212F, ATR 72-600F, Cessna 208B Super Cargomaster, Cessna 408 SkyCourier Freighter |
| FedEx-branded contract aircraft | Boeing 737-800BCF |
| UPS Airlines | Airbus A300-600F, Boeing 757-200PF, 767-300F, 767-300F with blended winglets, 767-300ER(BCF), 767-300ER(BDSF), 747-400F, 747-400BCF, 747-8F |

FedEx returned most of its MD-11 fleet to active service by September 2026. UPS permanently retired its MD-11s in late 2025. [FedEx September filing](https://www.sec.gov/Archives/edgar/data/1048911/000104891126000131/fdx-20260930.htm) · [UPS September filing](https://www.sec.gov/Archives/edgar/data/1090727/000162828026070246/ups-20260930.htm)

The eight contracted FedEx 737-800BCFs are matched by ADS-B address or registration. FedEx feeder artwork also supports the Mountain Air Cargo callsign `MTN`. The classic ATR 72 variants use `AT72` for the -202 and `AT73` for the -212. [Tracked FedEx fleet](https://www.flightradar24.com/data/airlines/fx-fdx/fleet) · [FAA callsign assignments](https://www.faa.gov/air_traffic/publications/atpubs/cnt_html/chap3_section_1.html) · [ICAO type designators](https://cfapps.icao.int/doc8643/reports/ATD_Changes_In_Last_Editon.pdf)

UPS's 747-400BCFs have a longer upper deck than its factory 747-400Fs. Airframe matches cover both 747 conversions, the six Boeing 767 conversions, the four IAI Bedek 767 conversions and two verified winglet-equipped factory 767s. These aircraft share their type designators with the factory aircraft. [Tracked UPS fleet](https://www.flightradar24.com/data/airlines/5x-ups/fleet) · [UPS filing on the Bedek fleet](https://downloads.regulations.gov/FAA-2024-1699-0005/attachment_1.pdf) · [UPS 767 with winglets](https://www.planespotters.net/hex/A3F1C2)




