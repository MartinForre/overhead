# Contributing to Overhead

Bug fixes, documentation, aircraft illustrations, and improvements to the display and Companion are welcome. For a larger change, open an issue first so contributors can discuss the behavior and scope. For a bug, include the Overhead build or commit, platform and browser, affected mode, steps to reproduce, and what you expected to see. Remove API keys and precise personal coordinates from logs, configuration snippets, and screenshots. [GitHub Issues](https://github.com/MartinForre/overhead/issues) · [Security reporting](SECURITY.md) · [Code of conduct](CODE_OF_CONDUCT.md)

## Develop locally

Use Git and Node.js 24. Fork the repository, clone your fork, and run these commands from the checkout.

```sh
npm ci
npm run dev
```

- Use the [Display](http://127.0.0.1:8000/display/) as a passive kiosk and the [Companion](http://127.0.0.1:8000/companion/) to change shared settings.
- Gallery and the sample traffic controls in **Companion → Settings → Live → Traffic preview** let you exercise layouts without live data.
- See the [app guide](apps/README.md) for configuration and Windows packaging, and the [design notes](docs/design.md) for display behavior and art matching.

## Run checks

Run the JavaScript tests from the repository root.

```sh
node --test
```

For Raspberry Pi installer or updater changes, also run the Python 3 tests on macOS or Linux.

```sh
python3 -B -m unittest discover -s deploy/pi -p 'test_*.py'
```

For display changes, check the affected mode in both views. For shared settings changes, check that an open Display updates when you change the setting in Companion. For user-facing text, include Bokmål (`nb`) and Nynorsk (`nn`) in [norwegian.js](apps/shared/norwegian.js), including accessible names and status messages. Use the English source string as the key and take English theme names from [settings-schema.js](apps/shared/settings-schema.js). Verify English, Bokmål, and Nynorsk by switching languages without reloading.

## Add aircraft artwork

Use a transparent PNG and match the existing side profiles in angle, scale, and shading. Cite the sources used to verify the airframe and livery in the catalog. Submit original artwork that you can contribute under the project’s license.

Update the [artwork catalog](assets/aircrafts/artwork.json) and, if needed, the [aircraft type catalog](assets/aircrafts/aircraft-types.json). Use an airframe match for a specific paint scheme or configuration that cannot be identified by operator and aircraft type. Check the rendered result, including any landing gear mounts or map anchors you changed. [Artwork and matching guide](docs/design.md#aircraft-artwork) · [Landing gear artwork](docs/landing-gear-artwork.md)

## Open a pull request

Describe the change and why it is needed, link related issues, and list the checks you ran. Include screenshots for visible changes when they help review.

The `Publish Overhead` GitHub Actions workflow publishes Raspberry Pi releases from `main`. It builds and verifies the ARM64 executable and assigns a `build-N` tag. The prerelease option is available for builds intended for manual testing. [Release workflow](.github/workflows/publish-overhead.yml)
