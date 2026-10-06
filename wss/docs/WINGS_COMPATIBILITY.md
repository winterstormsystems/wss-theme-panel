# Wings compatibility with Panel v2

**Conclusion: Panel v2 uses the existing Wings 1.x. No Wings fork or upgrade is needed; run
the latest Wings release (v1.13.3 as of 2026-10-06).**

## Evidence

**Upstream statement.** Wings `develop` README (2026-10-05): *"Wings is stable and remains
the daemon for Pterodactyl: the same Wings is used with the upcoming Panel v2."* Wings has no
2.x branch; its `v2` branch is a stale 2022 experiment.

**Protocol diff (panel v1.15.1 → 2.0-develop).**
- `routes/api-remote.php`, the endpoints Wings calls, has the same paths and methods. The
  only change is controller import style. Wings v1.13.3's `remote/` client calls
  `/servers`, `/servers/{uuid}`, `/servers/{uuid}/install`, `/servers/{uuid}/transfer/*`,
  `/backups/{id}`, `/backups/{id}/restore`, `/sftp/auth` and `/activity`, and all of them exist.
- The server configuration payload (`ServerConfigurationStructureService`) has the same keys;
  the changes are refactors.

**Live test** (this repo's dev environment, panel `2.0-develop` @ `41150ca9f` + Wings v1.13.3 built from source):

| Step | Result |
| --- | --- |
| Wings boot: fetch config and server list from panel | ✅ |
| Panel → Wings: node status in `/panel/nodes` | ✅ Online |
| Admin API: import egg, create allocation, create server | ✅ |
| Wings → panel: install script run and install status reported back | ✅ |
| Power start via client API | ✅ |
| Browser → Wings console WebSocket (panel-issued JWT) | ✅ live output |
| Console command round-trip | ✅ |
| Live stats (CPU, memory, network) | ✅ |
| File listing (panel → Wings) | ✅ |
| Kill via client API | ✅ |

Not exercised here: SFTP login, backups, transfers, file upload/download through
signed URLs, and TLS (`https`) nodes. Test those on a staging node before launch.

## Notes

- Panel v1.12.3+ attaches scopes to the JWTs it issues to Wings. The v2 panel's console tokens
  worked with Wings v1.13.3 unchanged.
- Wings hardcodes IPv6 on its Docker network; hosts without IPv6 need the workaround in
  `DEV_ENVIRONMENT.md`.
- Runtime and installer images are pulled from GHCR (`ghcr.io/pterodactyl/yolks`,
  `ghcr.io/pterodactyl/installers`). Nodes need access to it, or a mirror, for real eggs. If an
  image exists locally and the pull fails, Wings falls back to the local copy.
