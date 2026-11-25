import { createNearbyFeed } from "./adsb/nearby-feed.mjs";

function registerNearbyFeed(server) {
  server.middlewares.use(createNearbyFeed());
}

export default {
  publicDir: "../assets",
  plugins: [{
    name: "overhead-nearby-feed",
    configureServer: registerNearbyFeed,
    configurePreviewServer: registerNearbyFeed,
  }],
};
