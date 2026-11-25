export const sampleFlights = [
  {
    item: { flight: "SAVER50", hex: "478129", t: "EH10", category: "A7", alt_baro: 1150, gs: 125, track: 315 },
    distanceKm: 8.4,
    details: { airline: "Norwegian Search and Rescue", model: "Leonardo AW101" },
  },
  {
    item: { flight: "SAS588", hex: "4CAD94", t: "A20N", alt_baro: 38025, gs: 446, track: 31 },
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
    item: { flight: "KLM43F", t: "E295", alt_baro: 21450, gs: 387, track: 193 },
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
