import { createNearbyFeed } from "./adsb/nearby-feed.mjs";
import { createFlightReference } from "./adsb/flight-reference.mjs";
import { createSettingsApi } from "./settings/settings-api.mjs";

function registerDisplayApi(server) {
  server.middlewares.use(createSettingsApi("overhead.config.json"));
  server.middlewares.use(createNearbyFeed());
  server.middlewares.use(createFlightReference());
}

export default {
  publicDir: "../assets",
  server: {
    fs: {
      deny: [
        ".env", ".env.*", "*.{crt,pem,key,p12,pfx,cer,der}", ".npmrc", ".yarnrc.yml", "**/.git/**",
        "overhead.config.json", "overhead.config.json.tmp",
      ],
    },
  },
  plugins: [{
    name: "overhead-display-api",
    configureServer: registerDisplayApi,
    configurePreviewServer: registerDisplayApi,
  }],
};
