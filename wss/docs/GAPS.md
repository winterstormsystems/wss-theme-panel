# Gaps: what the v2 SDK/theme cannot do cleanly (yet)

Core patches implemented: **none**. Each item lists the cleanest future route.

## Terminology (core strings are hardcoded; 1 of ~300 core components uses i18n)

| Where | Text | Route |
| --- | --- | --- |
| Dashboard heading | "Servers" | Upstream i18n, or a `dashboard.heading` slot/replacement |
| Dashboard admin toggle | "Showing your servers" / "Showing others' servers" | Same (admins only) |
| Dashboard empty state | "No servers yet" / "Servers you own or are invited to will appear here." | Ask upstream for a `dashboard.empty` replacement. A WSS empty panel in `dashboard.before` was tried and removed: it stacked a second empty panel above core's |
| Global search | "Search servers" dialog title | Upstream i18n |
| Bot Settings page | "Reinstall Server", "Change Server Details", "Server Name", "Server Description", "Server Address", "Server ID" | Upstream i18n (redesign phase may add WSS slots around them) |
| Bot area tabs | "Startup", "Network" (acceptable wording), `ServerError` messages | Upstream i18n |
| "Egg" | Not shown to customers in the client UI (only in `/panel` admin) | — |
| Admin (`/panel`) | "Servers", "Eggs" | Out of scope (staff only) |
| Login | "Login to Continue" heading | Upstream i18n |

## Shell and branding

- **Top bar is not replaceable.** Only `nav.items.*` slots (right side). No logo slot left of the
  site name; on mobile core truncates the site name ("Winter Storm …").
- **Sidebar mode truncates core console stats** at 1280–1440px (address port, memory limit),
  so it is off until the bot detail redesign. Not a bug in the switch; a layout consequence.
- **Login mascot** (Pterodactyl SVG) and the "© Pterodactyl Software" line are core markup.
- **Footer** "Pterodactyl® © 2015 - 2026" on every page is core markup. Keep it unless legal
  review says otherwise; removing it would need a core patch.
- **Favicons / manifest**: replaceable with `registerHeadTags`, but **no production WSS logo is
  available locally**, so the Pterodactyl favicons remain. Provide logo files to finish this.
- Dashboard and "Bots" are one page; a separate "Bots" nav item would duplicate Dashboard.

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

## Potential future core patches (only if upstream does not provide a route)

1. i18n of dashboard/server wording ("Server" → "Bot") — prefer contributing upstream.
2. A logo slot or replacement in the top bar.
3. `dashboard.empty` and `dashboard.heading` replacements — prefer contributing upstream.
