import gzip
import hashlib
import io
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, call, patch

import overheadctl as deploy


class UpdateTests(unittest.TestCase):
    def setUp(self):
        self.current = {"number": 41, "port": 8101}
        self.candidate = {"number": 42, "port": 8102}
        self.state = {"active": self.current, "previous": None, "rejected": []}
        names = (
            "latest_release", "download", "start", "systemctl", "prune",
            "copy_settings", "wait_healthy", "smoke_browser", "control",
            "point_proxy", "check", "save_state", "restore",
        )
        self.actions = Mock()
        overrides = {name: getattr(self.actions, name) for name in names}
        self.enterContext(patch.multiple(deploy, **overrides))
        self.enterContext(patch.object(deploy.time, "sleep"))
        deploy.latest_release.return_value = 42, {"id": 42}

    def test_candidate_must_pass_browser_check_before_touching_live_settings(self):
        deploy.smoke_browser.side_effect = RuntimeError("blank gallery")
        with self.assertRaisesRegex(RuntimeError, "blank gallery"):
            deploy.update(self.state)
        deploy.point_proxy.assert_not_called()
        deploy.control.assert_not_called()
        deploy.restore.assert_not_called()
        deploy.save_state.assert_called_once_with({
            "active": self.current, "previous": None, "rejected": [42],
        })

    def test_live_settings_are_copied_after_draining_writes(self):
        deploy.update(self.state)
        deploy.save_state.assert_called_once_with({
            "active": self.candidate, "previous": self.current, "rejected": [],
        })
        self.actions.assert_has_calls([
            call.smoke_browser(self.candidate),
            call.systemctl("stop", "overhead-slot@8102.service"),
            call.control(self.current, "quiesce"),
            call.copy_settings(self.current, self.candidate),
            call.start(self.candidate),
            call.wait_healthy(self.candidate, 8102),
            call.point_proxy(8102),
            call.wait_healthy(self.candidate, 8000),
            call.check(self.candidate, 8000),
            call.save_state({"active": self.candidate, "previous": self.current, "rejected": []}),
            call.control(self.candidate, "activate"),
            call.systemctl("stop", "overhead-slot@8101.service"),
        ])

    def test_failed_post_switch_check_restores_previous_build(self):
        deploy.check.side_effect = RuntimeError("failed through proxy")
        with self.assertRaisesRegex(RuntimeError, "failed through proxy"):
            deploy.update(self.state)
        deploy.restore.assert_called_once_with(self.current)
        deploy.control.assert_called_once_with(self.current, "quiesce")
        deploy.save_state.assert_called_once_with({
            "active": self.current, "previous": None, "rejected": [42],
        })

    def test_watchdog_can_roll_back_when_current_process_is_down(self):
        self.state["previous"] = {"number": 40, "port": 8102}
        deploy.restore.side_effect = RuntimeError("current build failed to start")
        deploy.control.side_effect = [ConnectionRefusedError(), None]
        deploy.recover(self.state)
        deploy.save_state.assert_called_once_with({
            "active": self.state["previous"], "previous": self.current, "rejected": [41],
        })

    def test_rejected_release_is_not_downloaded_again(self):
        self.state["rejected"] = [42]
        deploy.update(self.state)
        deploy.download.assert_not_called()


class DownloadTests(unittest.TestCase):
    def test_verifies_the_archive_before_installing(self):
        binary = b"Overhead release"
        archive = gzip.compress(binary)
        build = {"number": 42, "port": 8101}
        asset = {"id": 42, "size": len(archive), "digest": "sha256:" + "0" * 64}
        with tempfile.TemporaryDirectory() as directory, \
                patch.object(deploy, "RELEASES", Path(directory)), \
                patch.object(deploy, "MAX_BINARY_BYTES", 1024), \
                patch.object(deploy, "github", side_effect=lambda *_: io.BytesIO(archive)):
            with self.assertRaisesRegex(RuntimeError, "SHA-256"):
                deploy.download(build, asset)
            self.assertEqual(list(Path(directory).iterdir()), [])
            asset["digest"] = "sha256:" + hashlib.sha256(archive).hexdigest()
            deploy.download(build, asset)
            self.assertEqual(deploy.executable(build).read_bytes(), binary)
