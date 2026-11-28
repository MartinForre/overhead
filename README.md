<img src="apps/companion/apple-touch-icon.png" alt="Overhead Companion icon" width="96" height="96">

# Overhead

Overhead is a self-hosted aviation display for a spare monitor or a wall-mounted kiosk. It turns nearby flight data into illustrated aircraft cards and maps. Use a phone, tablet, or computer to control the display through the Companion.

- **Live** shows nearby aircraft as a list of up to three illustrated cards or on a map.
- **Gallery** cycles through bundled aircraft illustrations and works without a location or live flight data.
- **Track** follows up to three selected flights or ADS-B callsigns. An optional FlightAware AeroAPI key enables dated flight search.

## Try it locally

Install Git and Node.js 24, then run these commands in a terminal.

```sh
git clone https://github.com/MartinForre/overhead.git
cd overhead
npm ci
npm run dev
```

Open the [Display](http://127.0.0.1:8000/display/) for the passive kiosk and the [Companion](http://127.0.0.1:8000/companion/) for controls. In the Companion, open the gear menu and choose **Gallery** to see the bundled artwork, or set a location under **Settings → Live** to see nearby aircraft. Both views share the same settings.

## Install on a display

- Set up a **Raspberry Pi** kiosk with 64-bit Raspberry Pi OS, a release build, and automatic startup. [Raspberry Pi setup guide](docs/raspberry-pi.md)
- Build a standalone **Windows x64** executable that serves both views. [Portable Windows guide](apps/README.md#portable-windows-display)
- Configure the display, use the Companion over your local network, or add it to a phone’s home screen. [App guide](apps/README.md)

## Contribute

Feature ideas, bug reports, documentation fixes, and aircraft artwork are welcome. The contributor guide covers local tests, localization, and catalog changes. [Contributing guide](CONTRIBUTING.md) · [GitHub Issues](https://github.com/MartinForre/overhead/issues)

The design notes explain the display and aircraft matching, with separate references for landing gear and an overflight study. [Design](docs/design.md) · [Landing gear artwork](docs/landing-gear-artwork.md) · [Overflight study](docs/overflight-airlines.md)

## License and credits

Overhead’s code, documentation, and original artwork are available under the MIT License. Third-party software, data, and marks retain their own terms. [MIT License](LICENSE) · [Credits and data sources](docs/credits.md)
