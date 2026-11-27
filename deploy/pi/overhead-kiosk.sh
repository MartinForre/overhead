#!/bin/sh
set -eu

# Start with the last confirmed release even when the internet is unavailable.
while ! curl --silent --fail --max-time 2 http://127.0.0.1:8000/healthz >/dev/null; do
    sleep 2
done

# The dedicated display profile runs under desktop autologin without a keyring.
exec chromium --kiosk --noerrdialogs --no-first-run --password-store=basic \
    --disable-features=Translate --user-data-dir="$HOME/.config/overhead-chromium" \
    http://127.0.0.1:8000/display/
