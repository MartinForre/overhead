import { createCallsignTracker } from "./adsb/callsign-tracker.mjs";
import { createNearbyFeed } from "./adsb/nearby-feed.mjs";
import { createFlightReference } from "./adsb/flight-reference.mjs";
import { createTakeoffTracker } from "./adsb/takeoff-tracker.mjs";
import { createSettingsApi } from "./settings/settings-api.mjs";
import { mapLibreAssets } from "./maplibre-assets.mjs";

function registerDisplayApi(server) {
  const flightReference = createFlightReference();
  const observeTakeoff = createTakeoffTracker();
  server.middlewares.use(mapLibreAssets);
  server.middlewares.use(createSettingsApi("overhead.config.json", undefined, createCallsignTracker({ observeTakeoff })));
  server.middlewares.use(createNearbyFeed({ peekDestination: flightReference.peekDestination, observeTakeoff }));
  server.middlewares.use(flightReference);
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
