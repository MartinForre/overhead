import { setMessage } from "../display-formats.js";
import { galleryAircraft } from "./artwork.js";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const rotationMs = 10 * 60 * 1_000;
const playlist = [
  { id: "a350-1000-lufthansa-centenary" },
  { id: "bell-222-airwolf" },
  { id: "lockheed-sr71a-blackbird-nasa-844", detail: "NASA 844 · Mach 3+" },
  { id: "f14a-tomcat-us-navy", detail: "U.S. Navy" },
  { id: "boeing-vc25a-air-force-one" },
  { id: "wallis-wa116-little-nellie", detail: "You Only Live Twice · Little Nellie" },
  { id: "douglas-dc3-buffalo-airways", detail: "Ice Pilots NWT · Buffalo Airways · C-GPNR" },
  { id: "zeppelin-lz129-hindenburg", detail: "D-LZ129 · 1936" },
  { id: "antonov-an225-mriya", detail: "Antonov Airlines · UR-82060" },
  { id: "saturn-v-apollo-11", detail: "Apollo 11 · SA-506" },
  { id: "aw101-sar-queen-norwegian-rescue" },
  { id: "concorde-british-airways-g-boag", detail: "British Airways · G-BOAG" },
  { id: "boeing-747-shuttle-carrier-enterprise", detail: "Space Shuttle Enterprise · NASA 905" },
  { id: "north-american-xb70a-valkyrie", detail: "NASA 20001 · AV-1" },
  { id: "h135-norsk-luftambulanse" },
  { id: "piper-pa18-super-cub-n7883d", detail: "Marty Meierotto · N7883D" },
  { id: "douglas-c47-dalton-air", detail: "MacGyver · Dalton Air · N3FY" },
  { id: "f14a-tomcat-top-gun", detail: "Top Gun · Maverick and Goose" },
  { id: "douglas-c53d-dakota-norway-ln-wnd", detail: "Dakota Norway · Little Egypt · LN-WND" },
  { id: "north-american-x15", detail: "Rocket research aircraft · 66671" },
  { id: "space-shuttle-discovery", detail: "NASA · OV-103" },
  { id: "f35a-royal-norwegian-air-force", detail: "Royal Norwegian Air Force" },
  { id: "apollo-11-lunar-module-eagle", detail: "Apollo 11 · LM-5" },
  { id: "hughes-500d-island-hoppers", detail: "Magnum, P.I. · T.C.’s Island Hoppers" },
];

export function startAircraftGallery(gallery, template, getMotion, signal) {
  const status = gallery.querySelector("#gallery-status");
  let index = -1;
  let currentCard;
  let outgoingCard;
  let timer;
  let changing = false;
  const queuedSteps = [];

  function setStatus(message) {
    setMessage(status, message);
    status.hidden = !message;
  }

  function paint({ image, name, detail }) {
    const card = template.content.firstElementChild.cloneNode(true);
    card.querySelector(".gallery-art").append(image);
    setMessage(card.querySelector(".gallery-name"), name);
    const detailElement = card.querySelector(".gallery-detail");
    setMessage(detailElement, detail ?? "");
    detailElement.hidden = !detail;

    outgoingCard?.remove();
    const previous = currentCard;
    currentCard = card;
    gallery.append(card);

    if (!previous) return;
    if (reducedMotion.matches || document.hidden || !getMotion().transfer ||
      typeof card.animate !== "function") {
      previous.remove();
      return;
    }

    outgoingCard = previous;
    previous.setAttribute("aria-hidden", "true");
    const options = { duration: 460, easing: "ease-in-out" };
    previous.animate([{ opacity: 1 }, { opacity: 0 }], options).finished
      .then(() => previous.remove(), () => previous.remove());
    card.animate([{ opacity: 0 }, { opacity: 1 }], options);
  }

  async function step(direction) {
    if (signal.aborted) return;
    if (changing) {
      queuedSteps.push(direction);
      return;
    }
    changing = true;
    clearTimeout(timer);

    const count = playlist.length;
    for (let offset = 1; offset <= count; offset++) {
      const candidate = index < 0 ? offset - 1 : (index + direction * offset + count) % count;
      if (candidate === index) break;

      const { id, detail } = playlist[candidate];
      const profile = await galleryAircraft(id);
      if (signal.aborted) return;
      if (!profile) continue;

      paint({ ...profile, detail: detail ?? profile.detail });
      setStatus("");
      index = candidate;
      break;
    }

    if (!currentCard) setStatus("Aircraft artwork unavailable.");
    changing = false;
    if (queuedSteps.length) void step(queuedSteps.shift());
    else timer = setTimeout(() => void step(1), rotationMs);
  }

  signal.addEventListener("abort", () => {
    clearTimeout(timer);
    gallery.hidden = true;
    currentCard?.remove();
    outgoingCard?.remove();
    setStatus("");
  }, { once: true });

  setStatus("Loading aircraft artwork…");
  gallery.hidden = false;
  void step(1);
  return { setStatus, step };
}
