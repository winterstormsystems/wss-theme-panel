# Gaps: what the v2 SDK/theme cannot do cleanly (yet)

Phase 2 resolved most of the shell and wording gaps through 12 registered core seams
(`CORE_PATCHES.md`). What remains is listed here with the cleanest future route.

## Resolved in phase 2 (via core seams)

Top bar and sidebar (WSS shell), login mascot and footer, page footer, dashboard heading,
admin toggle and empty state, search dialog wording, settings wording (Bot Details, Reinstall
Bot), favicons and logo (provided logo, `themes/wss/assets/brand`), "Startup" → "Runtime"
(section title), sidebar mode on the bot workspace (console stats redesigned, no truncation).

## Remaining core wording and style (customer area)

| Where | Text / style | Route |
| --- | --- | --- |
| Startup page | box titles "Startup Command", "Docker Image" | strings seam or upstream i18n |
| Console | install-skipped notice "This server is configured…"; `ServerError` messages | strings seam / upstream i18n |
| Performance history | core `StatGraphs` titles | replacement or upstream i18n |
| Network, Backups, Schedules, Databases, Users, Activity | page internals stock (restyled by tokens and boxes) | next phase, page by page |
| Account page | content stock | next phase |
| Forms | core `Label` uppercase, button labels uppercase ("LOGIN") | token-level CSS or a small seam |
| Inputs | field boundary 1.31:1 against cards: core uses `--input` as fill and border | seam on `Input` or upstream separate token |
| Settings danger zone | double border (WSS card around core box) | style reinstall box like rename |
| Search | icon tooltip text | strings seam |
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
