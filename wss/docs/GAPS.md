# Gaps: what the v2 SDK/theme cannot do cleanly (yet)

Phases 2 and 3 resolved the shell, wording and page-level gaps through 26 registered core seams
and shell-scoped theme rules (`CORE_PATCHES.md`). What remains is listed here, honestly, with the
cleanest future route.

## Resolved

- Phase 2: top bar and sidebar (WSS shell), login mascot and footer, page footer, dashboard
  heading/empty state, search wording, settings wording, favicons and logo, sidebar mode.
- Phase 3: Startup Command/Docker Image (now Launch Command/Runtime Image), install-skipped
  notice, `ServerError`/access denied/not found/conflict screens, graph titles, Network,
  Backups, Schedules list, Databases, Team Access (including the permission dialog), Activity,
  Account (overview, API, SSH, activity), uppercase labels/buttons/captions, field contrast
  (outline 3.07:1 against cards), settings danger-zone double border, "LOGIN" → "Sign in".

## Resolved in phase 4

Schedule detail page, performance graph cards, file manager rows and frame, file editor frame,
connection toasts and reconnect banner, "Return to Login" and other auth texts, backup help
"server directory", Bot Details labels (without the old seam).

## Remaining (customer area)

| Where | What | Decision |
| --- | --- | --- |
| Toast titles raised directly by API hooks | e.g. "Server details updated", "Unable to reinstall server", "Unable to update subuser" | ~20 core files call sonner directly; no single seam. Descriptions are fine. Candidate for a future upstream i18n hook; not worth 20 patches |
| File manager toolbar and selection bar | breadcrumbs, New folder/Upload/New file, mass-action bar are core parts inside the WSS frame (WSS colours and case) | Kept: replacing them would duplicate core file logic |
| Editor breadcrumb indent | core breadcrumbs keep the checkbox gutter on the editor page | Minor; core markup |
| Console terminal | Wings' own lines (`[Pterodactyl Daemon]: …`) | Intentional: raw output stays authentic |
| Egg feature modals | Java / EULA / Steam disk / GSL / Hytale / PID limit | Only for eggs that declare them; WSS bot eggs declare none. Left for compatibility |
| Team Access avatars | Gravatar (external; blocked in the dev sandbox) | Core behaviour |
| Admin (`/panel`) | stock | Out of scope |

## Data

- **No SDK hook for the server list.** The overview makes one extra `GET /api/client?per_page=1`
  for the total. Online/offline counts come from the cards on the current page.
- `useCurrentUser()` may lack `firstName` for some sessions (falls back to username).
- The WebSocket token endpoint is limited to 5/min per user (core). Fine for people; test
  scripts must pace themselves.

## Upstream bugs found

0. **File manager queries the editor path as a directory.** Opening a file runs
   `GET /files/list?directory=/index.js` (Wings 500 "not a directory") while the lazy editor route
   loads: `FileManagerContainer` stays mounted and derives the directory from the new hash.
   Reproduced with the WSS extension disabled; harmless for users (no toast), visible in the
   network log and Wings log. Not patched.

1. **SDK Vite preset + lazy chunks:** base `/` makes Vite's modulepreload links point at
   `/chunk.*.js` (404, text/html, console errors) while the real import is relative.
   Workaround: `build.modulePreload: false` in `vite.config.mjs`. Fix upstream: set
   `base: './'` or `modulePreload: false` in `defineExtensionConfig`.
2. **npm 10 crashes** (`Cannot read properties of null (reading 'edgesOut')`) installing a
   scaffolded extension with the `file:` SDK link. Workaround: `.npmrc` `legacy-peer-deps=true`.
3. SDK test runtime prints `Accessing non-existent property 'replaceRouteChunk' … circular
   dependency` (Node warning; harmless).

## Upstream contributions that would retire seams

1. i18n for dashboard/server/settings wording.
2. Replaceable authenticated layout, auth layout and area (sub-navigation) layout.
3. `dashboard.empty` and `dashboard.heading` replacements; console/settings page compositions.
