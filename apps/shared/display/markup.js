export const displayLandscape = `
  <span class="display-landscape" aria-hidden="true">
    <span class="landscape-kilimanjaro"></span>
    <span class="landscape-silhouette landscape-acacia landscape-acacia--distant"></span>
    <span class="landscape-silhouette landscape-rounded-tree"></span>
    <span class="landscape-silhouette landscape-giraffe"></span>
    <span class="landscape-silhouette landscape-elephant"></span>
    <span class="landscape-silhouette landscape-acacia"></span>
    <span class="landscape-the-rock">
      <span class="the-rock-islet"></span>
      <span class="the-rock-trees"></span>
      <span class="the-rock-building"></span>
      <span class="the-rock-roof"></span>
      <span class="the-rock-stairs"></span>
    </span>
  </span>
`;

export const displayContents = `
  ${displayLandscape}
  <p id="traffic-preview-indicator" class="traffic-preview-indicator" data-i18n hidden>Preview</p>
  <p id="nearby-status" class="display-status" role="status">Set the display location in Companion settings.</p>
  <ul id="nearby-aircraft" class="flight-list" aria-label="Nearby aircraft" hidden></ul>
  <section id="live-map" class="live-map" aria-label="Nearby aircraft map" data-i18n-label hidden>
    <div class="live-map-stage">
      <div class="live-map-basemap" aria-hidden="true"></div>
      <canvas class="live-map-trails" aria-hidden="true"></canvas>
      <canvas class="live-map-destinations" aria-hidden="true"></canvas>
      <div class="live-map-center" aria-hidden="true"></div>
      <div class="live-map-markers" role="group" aria-label="Nearby aircraft" data-i18n-label></div>
      <p class="live-map-caption" hidden data-i18n>Basemap unavailable.</p>
      <p class="live-map-credit" hidden>© OpenMapTiles · © OpenStreetMap</p>
    </div>
    <div class="live-map-footer" hidden>
      <p class="live-map-detail-status" role="status" hidden></p>
      <ul class="live-map-details" aria-label="Selected aircraft" data-i18n-label hidden></ul>
    </div>
  </section>
  <section id="aircraft-gallery" class="aircraft-gallery" aria-label="Aircraft gallery" data-i18n-label aria-live="polite" hidden>
    <p id="gallery-status" class="display-status" hidden></p>
  </section>
  <p id="track-status" class="display-status" role="status" hidden></p>
  <ul id="tracked-aircraft" class="flight-list track-list" aria-label="Tracked flights" data-i18n-label hidden></ul>

  <template id="track-card-template">
    <li class="flight-card track-card">
      <article class="flight-card-content">
        <header class="flight-topline">
          <div class="flight-identity">
            <h2 class="flight-name"></h2>
            <p class="flight-description"></p>
            <p class="track-state" hidden></p>
          </div>
          <div class="flight-instruments" hidden>
            <div class="flight-values">
              <span class="flight-altitude"><span class="sr-only" data-altitude-label></span> <span data-altitude></span></span>
              <span data-speed></span>
            </div>
            <div class="flight-track" role="img"><span class="flight-needle" aria-hidden="true"></span></div>
          </div>
        </header>
        <div class="track-picture">
          <div class="track-route">
            <div class="track-departure" role="group" aria-label="Departure" data-i18n-label>
              <div data-airport></div>
              <time></time><span data-time-kind></span>
            </div>
            <div class="track-arc" role="img" aria-label="Route progress">
              <svg viewBox="0 0 600 56" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <path class="track-arc-remaining" d="M 2 51 Q 300 -41 598 51" vector-effect="non-scaling-stroke" />
                <path class="track-arc-complete" vector-effect="non-scaling-stroke" />
              </svg>
              <span class="track-arc-position" aria-hidden="true"></span>
            </div>
            <dl class="track-times">
              <div><dt data-i18n>In the air</dt><dd data-airborne></dd></div>
              <div><dt data-i18n>Time left</dt><dd data-time-left></dd></div>
            </dl>
            <div class="track-arrival" role="group" aria-label="Arrival" data-i18n-label>
              <div data-airport></div>
              <time></time><span data-time-kind></span>
            </div>
          </div>
          <div class="track-art">
            <img class="track-placeholder" src="/aircrafts/airliners/a320neo-neutral.png" alt="" width="2172" height="724">
            <div class="flight-art"></div>
          </div>
        </div>
      </article>
    </li>
  </template>

  <template id="gallery-card-template">
    <figure class="gallery-card">
      <div class="gallery-art"></div>
      <figcaption>
        <h2 class="gallery-name"></h2>
        <p class="gallery-detail"></p>
      </figcaption>
    </figure>
  </template>

  <template id="flight-card-template">
    <li class="flight-card">
      <article class="flight-card-content">
        <header class="flight-topline">
          <div class="flight-identity">
            <strong class="flight-name"></strong>
            <p class="flight-description"></p>
          </div>
          <div class="flight-instruments">
            <div class="flight-readout">
              <span class="flight-distance"></span>
              <div class="flight-values">
                <span class="flight-altitude"><span class="sr-only flight-altitude-label"></span> <span class="flight-altitude-value"></span></span>
                <span class="flight-speed"><span class="sr-only" data-i18n>Ground speed</span> <span class="flight-speed-value"></span></span>
              </div>
            </div>
            <div class="flight-track" role="img">
              <span class="flight-needle" aria-hidden="true"></span>
            </div>
          </div>
        </header>
        <div class="flight-picture">
          <div class="flight-art"></div>
          <div class="flight-route" role="img"></div>
        </div>
      </article>
    </li>
  </template>
`;
