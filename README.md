# Overhead on a Raspberry Pi

Use Raspberry Pi Imager to write **Raspberry Pi OS (64-bit) with Desktop** to the microSD card. Imager downloads and writes the OS for you. The desktop image includes the graphical session the Chromium kiosk needs.

Once Overhead is installed, the frame opens its display at boot. On the same home network, open [overhead.local:8000/companion/](http://overhead.local:8000/companion/) on a phone or computer to choose the location, display mode, and theme.

## 1. Write the microSD card on your Mac

1. Install [Raspberry Pi Imager](https://www.raspberrypi.com/software/) and insert the microSD card with a reader.
2. Select **Raspberry Pi 4** as the device, **Raspberry Pi OS (64-bit)** with Desktop as the OS, and the microSD card as storage. Check the card size and name carefully. Imager erases the selected storage.
3. Open **Customisation** and set these options:

   | Setting | Suggested value |
   | --- | --- |
   | Hostname | `overhead`. Imager may display the `.local` suffix automatically. |
   | Localisation | Your keyboard layout, **Europe/Oslo** time zone, and **NO** Wi-Fi country if the Pi is in Norway. |
   | User | Your own username, for example `martin`, and a password. The installer uses this account for the Chromium kiosk. The name `overhead` is reserved for the app's service account. |
   | Wi-Fi | Use your own network name (SSID) and password for setup at home. Add your parents' network after the Pi boots. |
   | Remote access | Enable **SSH**. Choose public-key authentication if you already have an SSH key, or use your account password for initial setup on the home network. |

4. Write the card, let verification finish, and eject it. With the Pi powered off, insert the card and connect the monitor. Connect power last and give first boot a few minutes.

[Raspberry Pi Imager setup and customisation](https://www.raspberrypi.com/documentation/computers/getting-started.html#install-using-imager)

## 2. Connect and configure the desktop

Open Terminal on the Mac. Use the username you set in Imager in place of `martin`.

```sh
ssh martin@overhead.local
```

Keep the Mac and Pi on the same home network. If the name fails, confirm the Pi joined Wi-Fi on the monitor or look up `overhead` in the router's connected devices. Use that IPv4 address for the first SSH connection. On the Pi, check the name with `hostname`. If you need to change it, run `sudo raspi-config`, open **System Options → Hostname**, and enter `overhead`. Reboot after changing it. Guest Wi-Fi often blocks access between devices, including discovery of `.local` names. [Raspberry Pi local hostname documentation](https://www.raspberrypi.com/documentation/computers/remote-access.html#resolve-raspberrypilocal-with-mdns)

### Save both Wi-Fi networks

Imager saves one network. Once the Pi has joined yours, save your parents' network on the Pi while you're still at home. You can create the profile while their network is out of range. [Raspberry Pi Imager Wi-Fi settings](https://www.raspberrypi.com/documentation/computers/imager.html#wi-fi) · [NetworkManager connection editor](https://www.networkmanager.dev/docs/api/latest/nmtui.html)

1. In your SSH session, or in Terminal on the Pi, run `sudo nmtui edit`.
2. Choose **Add → Wi-Fi**. Give the profile a name such as `Parents Wi-Fi`, then enter the exact network name in **SSID**. Leave **Device** blank.
3. Under **Security**, choose the option that matches their router, usually **WPA & WPA2 Personal** for a WPA2 home network. Enter the password. Leave **Automatically connect** and **Available to all users** checked, then select **OK** and exit.
4. Run `nmcli -f NAME,AUTOCONNECT connection show` and check that both Wi-Fi profiles are listed with autoconnect enabled.

At your parents' place, the Pi will try their saved network on boot. Once it joins, your dad can open [overhead.local:8000/companion/](http://overhead.local:8000/companion/) on a phone connected to the same home network.

### Set up the monitor in portrait

1. Turn the Raspberry Pi Monitor a quarter turn in the direction it will sit in the frame. Check which side gives the HDMI and power cables enough room.
2. On the Pi's desktop, open **Raspberry Pi menu → Preferences → Control Centre → Screens**.
3. Right-click the rectangle for the HDMI display and choose **Orientation → Left** or **Right**. Keep the monitor's native **1920 × 1080** resolution. Rotation makes the desktop **1080 × 1920** at 1× scaling.
4. Select **Apply** and **OK** when the desktop is upright. If it is upside down, let the change time out and choose the other direction.

Configure rotation while signed in as the desktop user that will run the kiosk. If Chromium is already full-screen, press **Alt+F4** with a keyboard connected to return to the desktop. [Raspberry Pi screen configuration](https://www.raspberrypi.com/documentation/computers/configuration.html#configure-display-settings) · [Raspberry Pi Monitor specifications](https://www.raspberrypi.com/documentation/accessories/monitor.html)

### Enable desktop autologin and keep the screen on

While connected to the Pi, run `sudo raspi-config`. Under **System Options → Boot / Auto Login** select **Desktop Autologin** for your user. Under **Display Options → Screen Blanking**, choose **No**. Finish and defer reboot until after installation. These settings let the frame start and stay visible without a keyboard. [Raspberry Pi kiosk guide](https://www.raspberrypi.com/tutorials/how-to-use-a-raspberry-pi-in-kiosk-mode/)

## 3. Publish the first build and install it

1. Once the release workflow is on `main`, open **Actions → Publish Overhead → Run workflow**. Choose `main` and leave **prerelease** unchecked. Wait for the release to appear under **Releases** with the `overhead-linux-arm64.gz` asset. The workflow assigns a tag such as `build-42` automatically.
2. The public Overhead repository can be used without a token. If the repository is private, create a [fine-grained personal access token](https://github.com/settings/personal-access-tokens/new) for the Pi. Select only the **Overhead** repository and grant repository **Contents → Read-only**.
3. From the Overhead checkout on your Mac, copy the installer directory and then connect to the Pi.

   ```sh
   scp -r deploy/pi martin@overhead.local:./
   ssh martin@overhead.local
   ```

4. On the Pi, run the installer. For a private repository, paste the token at the hidden prompt. Wait for the installer to print **Overhead is installed** before rebooting.

   ```sh
   sudo bash ~/pi/install.sh
   sudo reboot
   ```

The installer sets up Chromium, the Overhead services, and Avahi for the `.local` hostname. After reboot, open [the companion](http://overhead.local:8000/companion/) on the same home network. For Live mode, enter the display's location in **Settings → Live**. You can also choose **Gallery** to verify the screen using bundled artwork. In Safari on an iPhone, use **Share → Add to Home Screen** to give the companion an icon. Keep port 8000 on your home network.

Before handing the frame over, boot it at your place with the keyboard, mouse, and Ethernet unplugged. Check that Overhead opens full-screen and upright, then open the companion from your phone over Wi-Fi. Seeing both Wi-Fi profiles confirms they're saved. The first boot within range of your parents' router confirms their password and network discovery work there.

If the companion name worked before installation but fails afterwards, check `systemctl status avahi-daemon overhead-proxy` on the Pi. An IPv4 address printed by `hostname -I` also works for the companion if a device cannot resolve the `.local` name.

## 4. Try an update and enable automatic checks

Publish a second stable build and start a check from SSH while watching the display. The command waits for the update to finish.

```sh
sudo systemctl start overhead-update.service
sudo overheadctl status
```

The Pi downloads and verifies the release while the old build runs. It starts the new build on a spare port with copied settings, checks the app and settings API, and verifies that Chromium renders a Gallery aircraft. It then pauses edits briefly to copy the latest settings and switch the proxy. The kiosk and companion reload when they reconnect to the new build. If the candidate fails, the Pi keeps or restores the last working version. A reboot during an unconfirmed update starts the last confirmed build.

On the first Pi, exercise rollback after the second build has installed and verify that `overhead.local:8000/companion/` still works. Rollback marks the replaced build as rejected and restores the previous build's saved settings. Changes made after that upgrade will be available in the rolled-back-from build's settings directory.

```sh
sudo overheadctl rollback
sudo overheadctl status
```

After testing, enable unattended checks. The Pi checks daily at **04:00 local time** and catches up after a missed check. Publish a newer stable build to advance past a rejected one. Prereleases stay off the automatic update channel.

```sh
sudo systemctl enable --now overhead-update.timer
systemctl list-timers overhead-update.timer
```

## Troubleshooting

If an older kiosk install opens a keyring password dialog, connect over SSH and update the installed launcher with the commands below. This applies to the Overhead Chromium profile. [Chromium password storage options](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/password_storage.md)

```sh
sudo sed -i '/--password-store=basic/!s/^exec chromium /exec chromium --password-store=basic /' /usr/local/bin/overhead-kiosk
sudo reboot
```

If Chromium offers to translate the kiosk display, turn off its translation feature in the installed launcher over SSH. [Chromium translation feature](https://chromium.googlesource.com/chromium/src/+/master/components/translate/core/browser/translate_prefs.h)

```sh
sudo sed -i '/--disable-features=Translate/!s/^exec chromium /exec chromium --disable-features=Translate /' /usr/local/bin/overhead-kiosk
sudo reboot
```

| Task | Command on the Pi |
| --- | --- |
| See the active, previous, and rejected builds | `sudo overheadctl status` |
| Inspect the last update | `sudo journalctl -u overhead-update.service -n 80 --no-pager` |
| Inspect proxy or application logs | `sudo journalctl -u overhead-proxy -u overhead-slot@8101 -u overhead-slot@8102 -n 80 --no-pager` |
| Pause automatic updates | `sudo systemctl disable --now overhead-update.timer` |
| Replace an expired GitHub token for a private repository | `sudoedit /etc/overhead/github-token`, then replace the line with the new token and run `sudo systemctl start overhead-update.service`. |
| Restart or shut down before moving the frame | `sudo reboot` or `sudo poweroff`. |

Overhead updates cover the app and artwork. Raspberry Pi OS and Chromium receive updates through the OS package manager. The [app README](apps/README.md) covers development, Windows packaging, and display settings.
