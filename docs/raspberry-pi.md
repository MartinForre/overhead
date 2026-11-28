# Raspberry Pi kiosk setup

Overhead’s Raspberry Pi installer runs the app and Chromium kiosk on the same device. Use a Raspberry Pi that supports **64-bit Raspberry Pi OS with Desktop**, a microSD card, and a monitor. The desktop provides the graphical session the kiosk needs.

## 1. Prepare the microSD card

1. Install Raspberry Pi Imager on your computer and insert the microSD card. [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. Select your Pi model, **Raspberry Pi OS (64-bit)** with Desktop, and the microSD card. Check the card’s size and name carefully because Imager erases the selected storage.
3. Open **Customisation** and set the following options.

   | Setting | Suggested value |
   | --- | --- |
   | Hostname | `overhead`. Devices on the same network can typically reach it as `overhead.local`. |
   | Localisation | The time zone, keyboard layout, and Wi-Fi country for the installation. |
   | User | A desktop username such as `kiosk` and a password. The installer reserves `overhead` for its service account. |
   | Wi-Fi | The network name (SSID) and password for the network the Pi will use at first boot. |
   | Remote access | Enable **SSH**. Use public-key authentication if you already have an SSH key, or set up password authentication for use on the local network. |

4. Write the card, wait for verification, and eject it. With the Pi powered off, insert the card and connect the monitor. Connect power and allow a few minutes for first boot.

[Raspberry Pi Imager setup and customisation](https://www.raspberrypi.com/documentation/computers/getting-started.html#install-using-imager)

## 2. Set up the desktop

Open a terminal on a computer on the same network as the Pi. Replace `kiosk` with the desktop username you set in Imager.

```sh
ssh kiosk@overhead.local
```

If the name fails, confirm the Pi joined the network and look up its IPv4 address in the router’s connected devices. The `hostname` command shows the configured hostname. To change it, run `sudo raspi-config`, open **System Options → Hostname**, and reboot after saving. Guest Wi-Fi may block access between devices, including discovery of `.local` names. [Local hostname and mDNS documentation](https://www.raspberrypi.com/documentation/computers/remote-access.html#resolve-raspberrypilocal-with-mdns)

### Optional Wi-Fi profile for a second network

If the Pi will move between networks, add a second profile before you move it.

1. Run `sudo nmtui edit` on the Pi.
2. Choose **Add → Wi-Fi**. Give the profile a name, enter the exact network name in **SSID**, and leave **Device** blank.
3. Select the security type that matches the router and enter the password. Leave **Automatically connect** and **Available to all users** checked, then save.
4. Run `nmcli -f NAME,AUTOCONNECT connection show` to confirm both profiles are listed. Test on the second network once the Pi is in range.

[NetworkManager connection editor](https://www.networkmanager.dev/docs/api/latest/nmtui.html)

### Optional portrait orientation

Turn the monitor a quarter turn and leave room for its cables. On the Pi’s desktop, open **Raspberry Pi menu → Preferences → Control Centre → Screens**, right-click the monitor, and choose **Orientation → Left** or **Right**. Keep the monitor’s native resolution. Apply and confirm when the desktop is upright.

Configure rotation as the desktop user who will run the kiosk. With a keyboard attached, press **Alt+F4** to close a running full-screen Chromium window. [Raspberry Pi display settings](https://www.raspberrypi.com/documentation/computers/configuration.html#configure-display-settings)

### Enable desktop autologin

On the Pi, run `sudo raspi-config`. Under **System Options → Boot / Auto Login**, choose **Desktop Autologin** for your user. Under **Display Options → Screen Blanking**, choose **No**. Defer the reboot until after installation. [Raspberry Pi kiosk guide](https://www.raspberrypi.com/tutorials/how-to-use-a-raspberry-pi-in-kiosk-mode/)

## 3. Install Overhead

The installer downloads the latest stable ARM64 build from the public repository. Check that the release lists an `overhead-linux-arm64.gz` asset. [Overhead releases](https://github.com/MartinForre/overhead/releases)

From a computer with Git and SSH installed, clone the repository and copy the installer to the Pi. Substitute your Pi’s username and hostname or IP address as needed.

```sh
git clone https://github.com/MartinForre/overhead.git
cd overhead
scp -r deploy/pi kiosk@overhead.local:./
ssh kiosk@overhead.local
```

On the Pi, run the installer as the desktop user with `sudo`. Wait for it to print **Overhead is installed**, then reboot.

```sh
sudo bash ~/pi/install.sh
sudo reboot
```

Chromium should open the display full-screen after desktop login. On the same local network, open the Companion at [overhead.local:8000/companion/](http://overhead.local:8000/companion/). Choose **Gallery** to verify the display or set its location under **Settings → Live**. Keep port 8000 on the trusted local network. The [app guide](../apps/README.md) covers phone shortcuts and location options.

For a Wi-Fi kiosk, verify startup with Ethernet, keyboard, and mouse disconnected. Check that the display opens full-screen and upright and that another device can reach the Companion over Wi-Fi.

## 4. Test updates and rollback

When a newer stable build is available, run a manual update from SSH. The service command waits for the update to finish.

```sh
sudo systemctl start overhead-update.service
sudo overheadctl status
```

The updater verifies the download and starts the candidate on a spare port with copied settings. It checks the app, settings API, and Chromium Gallery rendering before switching the proxy. The kiosk and Companion reconnect to the active build. If the candidate fails or the Pi reboots before confirmation, the last confirmed build remains available.

After a second build has installed, exercise rollback and verify the display and Companion. Rollback marks the replaced build as rejected and restores the previous build’s saved settings. Settings made after the update remain in the rejected build’s settings directory.

```sh
sudo overheadctl rollback
sudo overheadctl status
```

Once you have verified both operations, you can enable unattended checks. The Pi checks daily at 04:00 local time and catches up after a missed check. A rejected build is skipped until a newer stable build is available. The updater checks stable releases.

```sh
sudo systemctl enable --now overhead-update.timer
systemctl list-timers overhead-update.timer
```

## Troubleshooting

If `overhead.local` does not resolve, run `hostname -I` on the Pi and use its LAN IPv4 address in place of the hostname. Check `systemctl status avahi-daemon overhead-proxy` if the name or page stops working.

If an older kiosk launcher shows a keyring or translation prompt, copy an up-to-date launcher from the repository checkout.

```sh
scp deploy/pi/overhead-kiosk.sh kiosk@overhead.local:./
```

Then install it on the Pi and reboot.

```sh
sudo install -m 0755 ~/overhead-kiosk.sh /usr/local/bin/overhead-kiosk
sudo reboot
```

| Task | Command on the Pi |
| --- | --- |
| See the active, previous, and rejected builds | `sudo overheadctl status` |
| Inspect the last update | `sudo journalctl -u overhead-update.service -n 80 --no-pager` |
| Inspect proxy or app logs | `sudo journalctl -u overhead-proxy -u overhead-slot@8101 -u overhead-slot@8102 -n 80 --no-pager` |
| Pause automatic updates | `sudo systemctl disable --now overhead-update.timer` |
| Shut down before moving the kiosk | `sudo poweroff` |

Overhead releases update the app and its artwork. Use Raspberry Pi OS’s package manager to update the operating system and Chromium.
