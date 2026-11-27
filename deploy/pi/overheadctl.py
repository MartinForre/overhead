#!/usr/bin/env python3
import argparse
import fcntl
import gzip
import hashlib
import json
import os
import pwd
import re
import shutil
import signal
import socket
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import HTTPRedirectHandler, Request, build_opener, urlopen


DATA = Path("/var/lib/overhead")
RUN = Path("/run/overhead")
RELEASES = DATA / "releases"
SETTINGS = DATA / "settings"
STATE = DATA / "state.json"
TOKEN = Path("/etc/overhead/github-token")
REPOSITORY = "MartinForre/overhead"
ASSET = "overhead-linux-arm64.gz"
PORTS = (8101, 8102)
PUBLIC_PORT = 8000
SETTINGS_FILE = "overhead.config.json"
MAX_BINARY_BYTES = 1024 ** 3
TAG = re.compile(r"build-([1-9][0-9]*)")


def atomic_write(path, contents, mode=0o600, owner=None):
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as file:
        temporary = Path(file.name)
        try:
            os.fchmod(file.fileno(), mode)
            if owner:
                os.fchown(file.fileno(), owner.pw_uid, owner.pw_gid)
            file.write(contents)
            file.flush()
            os.fsync(file.fileno())
            os.replace(temporary, path)
            sync_directory(path.parent)
        finally:
            temporary.unlink(missing_ok=True)


def sync_directory(path):
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def save_state(state):
    atomic_write(STATE, (json.dumps(state) + "\n").encode())


def settings_directory(build):
    return SETTINGS / f"build-{build['number']}"


def executable(build):
    return RELEASES / f"build-{build['number']}" / "overhead"


def systemctl(*args):
    subprocess.run(["systemctl", *args], check=True, timeout=60)


def slot(port):
    return f"overhead-slot@{port}.service"


def start(build):
    port = build["port"]
    spec = RUN / f"{port}.build"
    number = f"{build['number']}\n".encode()
    if not spec.exists() or spec.read_bytes() != number:
        systemctl("stop", slot(port))
        atomic_write(spec, number, mode=0o644)
    systemctl("start", slot(port))


def local_request(port, path, method="GET"):
    headers = {"X-Overhead-Control": "1"} if method == "POST" else {}
    timeout = 15 if method == "POST" else 3
    return urlopen(Request(f"http://127.0.0.1:{port}{path}", headers=headers, method=method), timeout=timeout)


def control(build, action):
    with local_request(build["port"], f"/__overhead/{action}", "POST") as response:
        if response.status != 204:
            raise RuntimeError(f"Could not {action} build {build['number']}")


def check(build, port):
    with local_request(port, "/healthz") as response:
        if json.load(response)["number"] != build["number"]:
            raise RuntimeError("The running executable reported a different build number")
    with local_request(port, "/api/settings") as response:
        settings = json.load(response)
        if not isinstance(settings, dict) or settings.get("mode") not in {"gallery", "live", "track"}:
            raise RuntimeError("The running build could not read its settings")
    with local_request(port, "/display/") as response:
        if f'name="overhead-build" content="{build["number"]}"'.encode() not in response.read():
            raise RuntimeError("The display page reported a different build number")
    with local_request(port, "/companion/") as response:
        if f'name="overhead-build" content="{build["number"]}"'.encode() not in response.read():
            raise RuntimeError("The companion page reported a different build number")


def wait_healthy(build, port):
    deadline = time.monotonic() + (8 if port == PUBLIC_PORT else 20)
    while True:
        try:
            check(build, port)
            return
        except (OSError, ValueError, KeyError, RuntimeError) as error:
            if time.monotonic() >= deadline:
                raise RuntimeError(f"Build {build['number']} failed health checks on port {port}") from error
            time.sleep(1)


def proxy_config(port):
    hostname = socket.gethostname().split(".")[0].lower()
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", hostname):
        raise RuntimeError("Set a valid hostname before installing Overhead")
    return f"""\
{{
    admin unix//run/overhead-proxy/admin.sock
    grace_period 1s
}}
http://:{PUBLIC_PORT} {{
    @local header_regexp Host (?i)^(localhost|{hostname}[.]local|([0-9]{{1,3}}[.]){{3}}[0-9]{{1,3}})(:{PUBLIC_PORT})?$
    route {{
        respond /__overhead/* 404
        reverse_proxy @local 127.0.0.1:{port} {{
            header_up -X-Overhead-Control
        }}
        respond 403
    }}
}}
""".encode()


def point_proxy(port):
    atomic_write(RUN / "Caddyfile", proxy_config(port), mode=0o644)
    systemctl("reload-or-restart", "overhead-proxy.service")


def copy_settings(source, target, gallery=False):
    path = settings_directory(source) / SETTINGS_FILE if source else None
    contents = path.read_bytes() if path and path.exists() else b"{}"
    if gallery:
        contents = json.dumps(dict(json.loads(contents), mode="gallery")).encode()
    owner = pwd.getpwnam("overhead")
    directory = settings_directory(target)
    directory.mkdir(mode=0o700, exist_ok=True)
    os.chown(directory, owner.pw_uid, owner.pw_gid)
    atomic_write(directory / SETTINGS_FILE, contents, owner=owner)
    sync_directory(SETTINGS)


def smoke_browser(build):
    with tempfile.TemporaryDirectory(prefix="chromium-", dir=RUN, ignore_cleanup_errors=True) as profile:
        owner = pwd.getpwnam("overhead")
        os.chown(profile, owner.pw_uid, owner.pw_gid)
        log = Path(profile) / "driver.log"
        with log.open("wb") as output:
            driver = subprocess.Popen([
                "runuser", "-u", "overhead", "--", "env", f"HOME={profile}", "chromedriver", "--port=0",
            ], stdout=output, stderr=subprocess.STDOUT, start_new_session=True)
        page = None
        try:
            for _ in range(50):
                match = re.search(r"started successfully on port ([0-9]+)", log.read_text())
                if match:
                    break
                if driver.poll() is not None:
                    break
                time.sleep(0.1)
            if not match:
                raise RuntimeError("ChromeDriver could not start: " + log.read_text().strip()[-1200:])
            address = f"http://127.0.0.1:{match[1]}"

            def browser(path, data):
                request = Request(address + path, data=json.dumps(data).encode(),
                                  headers={"Content-Type": "application/json"})
                try:
                    with urlopen(request, timeout=20) as response:
                        return json.load(response)["value"]
                except HTTPError as error:
                    raise RuntimeError(f"Chromium health check failed: {error.read().decode()[-1200:]}") from error

            session = browser("/session", {"capabilities": {"alwaysMatch": {
                "browserName": "chrome", "pageLoadStrategy": "eager",
                "timeouts": {"pageLoad": 15000},
                "goog:chromeOptions": {"binary": "/usr/bin/chromium", "args": [
                    "--headless", "--no-first-run", "--disable-background-networking",
                    "--disable-dev-shm-usage", f"--user-data-dir={profile}/profile",
                ]},
            }}})["sessionId"]
            page = f"/session/{session}"
            browser(page + "/url", {"url": f"http://127.0.0.1:{build['port']}/display/"})
            for _ in range(30):
                if browser(page + "/execute/sync", {"args": [], "script": """
                    const image = document.querySelector('.gallery-card:not([aria-hidden]) .gallery-art img');
                    return Boolean(image?.complete && image.naturalWidth > 0);
                """}):
                    return
                time.sleep(0.5)
            raise RuntimeError(f"Chromium could not render Gallery in build {build['number']}")
        finally:
            if page:
                try:
                    with urlopen(Request(address + page, method="DELETE"), timeout=5):
                        pass
                except OSError:
                    pass
            try:
                os.killpg(driver.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
            try:
                driver.wait(timeout=5)
            except subprocess.TimeoutExpired:
                os.killpg(driver.pid, signal.SIGKILL)
                driver.wait()


class SecureRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not newurl.startswith("https://"):
            raise RuntimeError("GitHub redirected the release download to a non-HTTPS URL")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def github(path, accept="application/vnd.github+json"):
    request = Request(f"https://api.github.com/repos/{REPOSITORY}/{path}", headers={
        "Accept": accept, "User-Agent": "Overhead-Pi-Updater",
    })
    try:
        token = TOKEN.read_text().strip()
    except FileNotFoundError:
        token = ""
    if token:
        # Unredirected headers stay with api.github.com when the asset redirects.
        request.add_unredirected_header("Authorization", f"Bearer {token}")
    return build_opener(SecureRedirect()).open(request, timeout=45)


def latest_release():
    with github("releases/latest") as response:
        release = json.load(response)
    tag = TAG.fullmatch(release["tag_name"])
    if not tag or release["draft"] or release["prerelease"]:
        return None
    asset = next((item for item in release["assets"] if item["name"] == ASSET), None)
    if not asset or asset["state"] != "uploaded":
        raise RuntimeError(f"{release['tag_name']} is missing {ASSET}")
    return int(tag[1]), asset


def download(build, asset):
    digest = re.fullmatch(r"sha256:([a-f0-9]{64})", asset.get("digest") or "")
    if not digest:
        raise RuntimeError("The release asset has no SHA-256 digest")
    size = asset["size"]
    if not 0 < size <= MAX_BINARY_BYTES or shutil.disk_usage(RELEASES).free < size + MAX_BINARY_BYTES:
        raise RuntimeError("Insufficient free space or unexpected release size")
    target = executable(build)
    with tempfile.TemporaryDirectory(prefix=".download-", dir=RELEASES) as staging:
        archive = Path(staging) / ASSET
        binary = Path(staging) / "overhead"
        checksum = hashlib.sha256()
        received = 0
        with github(f"releases/assets/{int(asset['id'])}", "application/octet-stream") as response:
            with archive.open("wb") as output:
                while chunk := response.read(1024 * 1024):
                    received += len(chunk)
                    if received > size:
                        raise RuntimeError("Downloaded more bytes than the release lists")
                    checksum.update(chunk)
                    output.write(chunk)
        if received != size or checksum.hexdigest() != digest[1]:
            raise RuntimeError("Release size or SHA-256 verification failed")
        unpacked = 0
        with gzip.open(archive, "rb") as source, binary.open("wb") as output:
            while chunk := source.read(1024 * 1024):
                unpacked += len(chunk)
                if unpacked > MAX_BINARY_BYTES:
                    raise RuntimeError("Overhead executable exceeds 1 GiB")
                output.write(chunk)
            os.fchmod(output.fileno(), 0o755)
            output.flush()
            os.fsync(output.fileno())
        target.parent.mkdir(exist_ok=True)
        os.replace(binary, target)
        sync_directory(target.parent)
        sync_directory(RELEASES)


def prune(state):
    keep = {f"build-{build['number']}" for build in (state["active"], state["previous"]) if build}
    for directory in (RELEASES, SETTINGS):
        for item in directory.iterdir():
            if item.name not in keep and (TAG.fullmatch(item.name) or item.name.startswith(".download-")):
                shutil.rmtree(item)


def restore(build):
    start(build)
    wait_healthy(build, build["port"])
    point_proxy(build["port"])
    wait_healthy(build, PUBLIC_PORT)
    control(build, "activate")


def promote(state, candidate):
    previous = state["active"]
    point_proxy(candidate["port"])
    wait_healthy(candidate, PUBLIC_PORT)
    time.sleep(3)
    check(candidate, PUBLIC_PORT)
    next_state = dict(state, active=candidate, previous=previous)
    save_state(next_state)
    control(candidate, "activate")
    if previous:
        try:
            systemctl("stop", slot(previous["port"]))
        except subprocess.SubprocessError as error:
            print(f"Could not stop the quiesced old build: {error}", file=sys.stderr)
    return next_state


def revert(state, candidate, restore_live):
    try:
        try:
            save_state(state)
        finally:
            if restore_live and state["active"]:
                restore(state["active"])
    finally:
        systemctl("stop", slot(candidate["port"]))


def update(state):
    release = latest_release()
    current = state["active"]
    if not release or (current and release[0] <= current["number"]) or release[0] in state["rejected"]:
        print("No newer eligible Overhead build")
        return
    port = PORTS[1] if current and current["port"] == PORTS[0] else PORTS[0]
    candidate = {"number": release[0], "port": port}
    systemctl("stop", slot(port))
    prune(state)
    download(candidate, release[1])
    handoff = False
    try:
        copy_settings(current, candidate, gallery=True)
        start(candidate)
        wait_healthy(candidate, port)
        smoke_browser(candidate)
        # Reread the latest real settings while both slots are read-only.
        systemctl("stop", slot(port))
        handoff = True
        if current:
            control(current, "quiesce")
        copy_settings(current, candidate)
        start(candidate)
        wait_healthy(candidate, port)
        next_state = promote(state, candidate)
    except (OSError, ValueError, KeyError, RuntimeError, subprocess.SubprocessError):
        state["rejected"] = sorted(set(state["rejected"]) | {candidate["number"]})
        revert(state, candidate, handoff)
        raise
    prune(next_state)
    print(f"Installed Overhead build {candidate['number']}")


def rollback(state):
    current, previous = state["active"], state["previous"]
    if not previous or previous["number"] in state["rejected"]:
        raise RuntimeError("There is no previous working Overhead build")
    start(previous)
    wait_healthy(previous, previous["port"])
    try:
        try:
            control(current, "quiesce")
        except OSError:
            systemctl("stop", slot(current["port"]))
        marked = dict(state, rejected=sorted(set(state["rejected"]) | {current["number"]}))
        promote(marked, previous)
    except (OSError, ValueError, KeyError, RuntimeError, subprocess.SubprocessError):
        revert(state, previous, True)
        raise
    print(f"Restored Overhead build {previous['number']}")


def recover(state):
    active = state["active"]
    if not active:
        return
    try:
        restore(active)
    except (OSError, ValueError, KeyError, RuntimeError, subprocess.SubprocessError):
        if not state["previous"] or state["previous"]["number"] in state["rejected"]:
            raise
        rollback(state)


def run_slot(port):
    number = (RUN / f"{port}.build").read_text().strip()
    if not re.fullmatch(r"[1-9][0-9]*", number):
        raise RuntimeError("Invalid slot build number")
    build = {"number": int(number), "port": port}
    os.chdir(settings_directory(build))
    binary = executable(build)
    os.execv(binary, [str(binary), "--managed", "--port", str(port)])


def main():
    parser = argparse.ArgumentParser(description="Install and recover Overhead releases")
    parser.add_argument("command", choices=["boot", "update", "watchdog", "rollback", "status", "slot"])
    parser.add_argument("port", type=int, nargs="?", choices=PORTS)
    args = parser.parse_args()
    if args.command == "slot":
        run_slot(args.port)
        return
    RUN.mkdir(mode=0o755, exist_ok=True)
    with (RUN / "lock").open("a") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | (fcntl.LOCK_NB if args.command == "watchdog" else 0))
        except BlockingIOError:
            return
        state = json.loads(STATE.read_text()) if STATE.exists() else {
            "active": None, "previous": None, "rejected": [],
        }
        if args.command == "update":
            update(state)
        elif args.command == "rollback":
            rollback(state)
        elif args.command == "boot":
            recover(state)
        elif args.command == "status":
            print(json.dumps(state, indent=2))
        elif state["active"]:
            try:
                if (RUN / "Caddyfile").read_bytes() != proxy_config(state["active"]["port"]):
                    raise RuntimeError("The proxy configuration differs from the confirmed build")
                check(state["active"], PUBLIC_PORT)
                control(state["active"], "activate")
            except (OSError, ValueError, KeyError, RuntimeError):
                recover(state)


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, RuntimeError, subprocess.SubprocessError) as error:
        print(f"Overhead: {error}", file=sys.stderr)
        if isinstance(error, HTTPError) and error.code in {401, 403, 404}:
            print("Check that a stable release is published and that the Pi can access it. "
                  "A private repository requires a read-only GitHub token.", file=sys.stderr)
        if error.__cause__:
            print(f"Cause: {error.__cause__}", file=sys.stderr)
        sys.exit(1)
