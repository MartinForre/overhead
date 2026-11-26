export const sampleFlights = [
  {
    item: { flight: "SAVER50", hex: "478129", t: "EH10", category: "A7", alt_baro: 1150, gs: 125, track: 315 },
    distanceKm: 8.4,
    details: { airline: "Norwegian Search and Rescue", model: "Leonardo AW101" },
  },
  {
    item: { flight: "SAS588", hex: "4CAD94", t: "A20N", alt_baro: 38025, gs: 446, geom_rate: 1500, track: 31 },
    distanceKm: 21.6,
    details: {
      airline: "Scandinavian Airlines",
      operatorIcao: "SAS",
      model: "Airbus A320neo",
      departure: { code: "AGP", city: "Málaga" },
      destination: { code: "CPH", city: "Copenhagen" },
    },
  },
  {
    item: { flight: "KLM43F", t: "E295", alt_baro: 21450, gs: 387, baro_rate: -2300, track: 193 },
    distanceKm: 34.2,
    details: {
      airline: "KLM Cityhopper",
      operatorIcao: "KLM",
      model: "Embraer E195-E2",
      departure: { code: "AMS", city: "Amsterdam" },
      destination: { code: "NCE", city: "Nice" },
    },
  },
];

export const featuredSamples = {
  alaska: {
    item: { r: "N7883D", hex: "AAB103", t: "PA18", alt_baro: 1900, gs: 78, geom_rate: 650, track: 332 },
    distanceKm: 5.8,
    details: { model: "Piper PA-18 Super Cub" },
  },
  airwolf: {
    item: { flight: "AIRWOLF", t: "B222", category: "A7", alt_baro: 900, gs: 118, track: 289 },
    distanceKm: 6.4,
    details: { model: "Bell 222 Airwolf" },
  },
  "top-gun": {
    item: { flight: "MAVERICK", t: "F14", alt_baro: 2700, gs: 420, track: 109 },
    distanceKm: 11.4,
    details: { model: "Grumman F-14A Tomcat", illustrationId: "f14a-tomcat-top-gun" },
  },
  concorde: {
    item: { flight: "BA002", r: "G-BOAG", t: "CONC", alt_baro: 55000, gs: 1150, track: 67 },
    distanceKm: 8.5,
    details: {
      model: "Concorde",
      airline: "British Airways",
      illustrationId: "concorde-british-airways-g-boag",
      departure: { code: "JFK", city: "New York" },
      destination: { code: "LHR", city: "London" },
    },
  },
};

export const sampleGearSequence = [
  [{ alt_baro: 1400, gs: 105, geom_rate: -300 }, { alt_baro: 1600, gs: 145, geom_rate: -600 }],
  [{ alt_baro: 420, gs: 45, geom_rate: -300 }, { alt_baro: 1000, gs: 145, geom_rate: -600 }],
  [{ alt_baro: "ground", alt_geom: 0, gs: 0 }, { alt_baro: "ground", alt_geom: 0, gs: 50 }],
  [{ alt_baro: "ground", alt_geom: 0, gs: 8 }, { alt_baro: "ground", alt_geom: 0, gs: 125 }],
  [{ alt_baro: 45, gs: 16, geom_rate: 400 }, { alt_baro: 100, gs: 141, geom_rate: 1000 }],
  [{ alt_baro: 260, gs: 50, geom_rate: 450 }, { alt_baro: 490, gs: 165, geom_rate: 1250 }],
].map(stage => stage.map((motion, index) => {
  const flight = sampleFlights[index];
  return { ...flight, item: { ...flight.item, ...motion } };
}));

const [, sas, klm] = sampleFlights;
const wideroe = {
  item: { flight: "WIF541", hex: "4785C0", t: "DH8D", alt_baro: 4850, gs: 220, track: 191 },
  distanceKm: 33.1,
  details: {
    airline: "Widerøe", operatorIcao: "WIF", model: "De Havilland Canada Dash 8-Q400",
    departure: { code: "BGO", city: "Bergen" }, destination: { code: "SVG", city: "Stavanger" },
  },
};
const norwegian = {
  item: { flight: "NOZ123", hex: "4787B3", t: "B738", alt_baro: 16300, gs: 352, track: 266 },
  distanceKm: 32.7,
  details: {
    airline: "Norwegian", operatorIcao: "NOZ", model: "Boeing 737-800",
    departure: { code: "OSL", city: "Oslo" }, destination: { code: "SVG", city: "Stavanger" },
  },
};

export const sampleHandoff = {
  before: [sas, klm, wideroe],
  after: [
    { ...klm, item: { ...klm.item, alt_baro: 20900, gs: 383, track: 196 }, distanceKm: 18.2 },
    { ...wideroe, item: { ...wideroe.item, alt_baro: 5050, gs: 225, track: 203 }, distanceKm: 22.3 },
    norwegian,
  ],
};
