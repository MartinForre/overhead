#!/usr/bin/env bash
set -euo pipefail

if [[ "$EUID" != 0 || -z "${SUDO_USER:-}" || "$SUDO_USER" == root ]]; then
    echo "From the Raspberry Pi desktop user's terminal, run: sudo bash $0" >&2
    exit 1
fi
if [[ "$(dpkg --print-architecture)" != arm64 ]]; then
    echo "Install Raspberry Pi OS (64-bit) with Desktop first." >&2
    exit 1
fi

source_dir="$(cd "$(dirname "$0")" && pwd)"
kiosk_user="$SUDO_USER"
kiosk_home="$(getent passwd "$kiosk_user" | cut -d: -f6)"
if [[ -z "$kiosk_home" || "$kiosk_user" == overhead ]]; then
    echo "Use the Pi's desktop account, with a username other than overhead." >&2
    exit 1
fi

# The regular Caddy service gets enabled by apt. A fresh Pi only needs the
# Overhead-specific service; leave any pre-existing Caddy installation alone.
existing_caddy=false
if command -v caddy >/dev/null; then existing_caddy=true; fi
apt-get update
apt-get install -y --no-install-recommends avahi-daemon caddy ca-certificates chromium chromium-driver chromium-sandbox curl python3
if [[ "$existing_caddy" == false ]]; then
    systemctl disable --now caddy.service
fi
systemctl enable --now avahi-daemon.service
if ! id overhead >/dev/null 2>&1; then
    useradd --system --user-group --home-dir /var/lib/overhead --shell /usr/sbin/nologin overhead
fi
install -d -m 0755 /var/lib/overhead/releases /var/lib/overhead/settings
install -d -m 0700 /etc/overhead
install -m 0755 "$source_dir/overheadctl.py" /usr/local/sbin/overheadctl
install -m 0755 "$source_dir/overhead-kiosk.sh" /usr/local/bin/overhead-kiosk
install -m 0644 "$source_dir"/overhead*.service "$source_dir"/overhead*.timer /etc/systemd/system/

if [[ ! -s /etc/overhead/github-token ]] &&
    [[ "$(curl -sS --max-time 15 -o /dev/null -w '%{http_code}' \
        https://api.github.com/repos/MartinForre/overhead)" == 404 ]]; then
    read -r -s -p 'Paste the read-only GitHub token, then press Enter: ' token
    printf '\n'
    if [[ "$token" != github_pat_* ]]; then
        echo "Use a fine-grained GitHub personal access token." >&2
        exit 1
    fi
    (umask 077; printf '%s\n' "$token" > /etc/overhead/github-token)
    unset token
fi

# Run as the desktop user so their existing autostart file stays user-owned.
runuser -u "$kiosk_user" -- sh -eu -c '
    directory="$1/.config/labwc"
    mkdir -p "$directory"
    if [ ! -e "$directory/autostart" ] && [ -r /etc/xdg/labwc/autostart ]; then
        cp /etc/xdg/labwc/autostart "$directory/autostart"
    fi
    if ! grep -Fxq "/usr/local/bin/overhead-kiosk &" "$directory/autostart" 2>/dev/null; then
        printf "\n%s\n" "/usr/local/bin/overhead-kiosk &" >> "$directory/autostart"
    fi
' sh "$kiosk_home"

systemctl daemon-reload
systemctl enable --now overhead.service overhead-watchdog.timer
systemctl start overhead-update.service
echo "Overhead is installed. Reboot after enabling desktop autologin in raspi-config."
