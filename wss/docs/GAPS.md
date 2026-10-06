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

## Remaining stock presentation (customer area)

| Where | What still looks/reads like core | Route |
| --- | --- | --- |
| Schedule detail (`/schedules/:id`) | header block and the five cron boxes use core layout (WSS colours, sentence case) | composition seam like Settings |
| Performance history | core `ChartBlock` cards (larger title, lighter surface than WSS cards) | ChartBlock branch seam |
| File manager internals, file editor | core layout inside the WSS frame | file manager composition (next phase) |
| Toasts from the WebSocket handler | "Failed to start server connection", "We're having some trouble connecting to your server" | reword in `AppToaster` or `WebsocketHandler` strings seam |
| Forgot password / 2FA checkpoint | "Return to Login" link text (no longer uppercase) | strings seams in the two auth containers |
| Create backup dialog | field help ".pteroignore … server directory" (field props are not reworded) | strings seam in `CreateBackupButton` |
| Egg feature modals (Java version, EULA, disk space) | "This server …" | only shown for specific eggs; strings seams if those eggs are offered |
| Console terminal | Wings' own lines ("[Pterodactyl Daemon]: …") | Wings output; out of scope (no Wings changes) |
| Team Access avatars | Gravatar images (external; blocked in the dev sandbox) | core behaviour |
| "Egg" | not shown to customers | — |
| Admin (`/panel`) | stock by decision | out of scope |

## Data

- **No SDK hook for the server list.** The overview makes one extra `GET /api/client?per_page=1`
  for the total. Online/offline counts come from the cards on the current page.
- `useCurrentUser()` may lack `firstName` for some sessions (falls back to username).
- The WebSocket token endpoint is limited to 5/min per user (core). Fine for people; test
  scripts must pace themselves.

## Upstream bugs found

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
