# WSS customer UI freeze (end of phase 4)

This is the reference for the customer-facing Winter Storm Systems Bot Hosting Panel. From here
on the customer UI is **frozen**: new work (WHMS-lite integration first) must fit into it, not
redesign it. A change to anything below needs a stated reason, an update to this file, and a
re-run of the checks at the end.

Baseline: branch `wss/v4-develop` on Pterodactyl Panel `2.0-develop@41150ca9f`, Wings 1.13.3.

## 1. Product boundary

| Area | Owner | Status |
| --- | --- | --- |
| Customer routes (`/`, `/account/*`, `/server/:id/*`, `/auth/*`) | WSS shell + core pages | **Frozen** |
| Admin (`/panel/*`) | Pterodactyl, stock | Out of scope; WSS never applies there |
| Backend, API, permissions, Wings, WebSocket | Pterodactyl / Wings | Untouched by WSS |
| Billing | Not in this panel | Optional external links only (`billing_url`, `support_url`) |

The panel works without WHMS-lite. WHMS-lite talks to the panel through the Pterodactyl
Application API; the customer UI does not depend on it.

## 2. Navigation

**Shell** (`wss/panel/shell`): sidebar (16rem) at `lg+`, drawer below `lg`; top bar with search
and account menu; footer "© {year} Winter Storm Systems · Powered by Pterodactyl".

- Main: **My Bots** (`/`), **Account** (`/account`), then optional **Billing** / **Support**
  (extension settings, HTTPS only, hidden when empty), then `nav.items.*` slots.
- Current bot (sidebar on desktop, tabs below `lg`), in this order: Overview, Console, Files,
  Runtime, Network, Backups, Schedules, Databases, Team Access, Settings, Activity. Entries come
  from core's route registry (`getAreaNav('server')`) and keep core's permission per entry;
  extension screens and unknown upstream pages appear after these.
- Account: Profile & security, API credentials, SSH keys, Activity.
- Account menu: Account settings, Administration (root admins only), Sign out.

## 3. Customer routes and the permissions they depend on

All checks are core's (`requireServerPermission`, `Can`, `usePermissions`); WSS adds none.

| Route | Page | Core permission |
| --- | --- | --- |
| `/server/:id/overview` | Overview (WSS screen) | server access; quick links per permission |
| `/server/:id` | Console | `websocket.connect`; power buttons `control.start/stop/restart` |
| `/server/:id/files`, `/files/:action` | Files, file editor | `file.*` (save needs `file.update`/`file.create`; read-only otherwise) |
| `/server/:id/startup` | Runtime | `startup.*` |
| `/server/:id/network` | Network | `allocation.*` |
| `/server/:id/backups` | Backups | `backup.*` |
| `/server/:id/schedules`, `/schedules/:scheduleId` | Schedules, schedule detail | `schedule.*` |
| `/server/:id/databases` | Databases | `database.*` (password view per core) |
| `/server/:id/users`, `/users/new` | Team Access | `user.*`, `user.create` |
| `/server/:id/settings` | Settings | `settings.*` or `file.sftp`; rename `settings.rename`, reinstall `settings.reinstall` |
| `/server/:id/activity` | Activity | `activity.*` |
| `/account`, `/account/api`, `/account/ssh`, `/account/activity` | Account | signed-in user |
| `/auth/login`, `/login/checkpoint`, `/password`, `/password/reset/:token` | Auth | public |

Rule: **navigation visibility is derived from core permissions only.** Never hide or show a
section with WSS logic; never add a WSS permission system.

## 4. Terminology (presentation only)

Source: `wss/panel/terminology.ts` (`terms`, `copy`, `permissionGroupTitle`, `permissionLabel`)
and `wss/panel/wording.ts` (`reword`, phrase maps). Code, routes, API objects and types keep
Pterodactyl names.

| Core | Customer UI |
| --- | --- |
| Server / Servers | Bot / Bots |
| Server Details, Server Name, Server Description | Bot Details, Bot Name, Bot Description |
| Reinstall Server | Reinstall Bot |
| Startup | Runtime ("Runtime Configuration") |
| Startup Command | Launch Command |
| Docker Image | Runtime Image |
| Variables | Environment Variables |
| Users / Subusers | Team Access / team member |
| Permission groups (`control`, `allocation`, …) | Console & power, Network, … (values unchanged) |
| CPU Load / Memory / Network | CPU Usage / Memory Usage / Network Traffic |
| Login / Return to Login | Sign in / Return to sign in |
| Failed to start server connection (and other socket titles) | Unable to connect to this bot (descriptions unchanged) |

Rewording applies only to core-authored text in the WSS shell: never to user data (bot names,
file names, console output), never inside quotes, and technical terms without a determiner
("SFTP server", `server:power.start`) stay.

## 5. Theme tokens

`themes/wss/tokens.css` is the single source (published to `public/assets/theme.css`).
Canonical palette: primary `#3498db`, secondary `#2c3e50`, accent `#1abc9c`, success `#2ecc71`,
warning `#f39c12`, danger `#e74c3c`. Dark neutrals derived from `#2c3e50` (app `#0d141b`, card
`#121b24`, elevated `#18232e`, hover `#1f2c39`, border `#243240`, strong border `#56697d`).
Customer fields: fill `#0f1720`, outline `#56697d` (3.07:1 against cards). Text on filled buttons
`#0b1620` (AA). Radius 0.5rem, Inter (self-hosted), content width 72rem.

The file ends with **WSS customer UI rules**, active only under `<html data-wss-ui>` (set by the
WSS shell and auth layout): field fill/outline, natural case, focus rings, validation icon,
empty-state tile. Details: `DESIGN_SYSTEM.md`.

## 6. Shared components (use these; do not add parallel ones)

| Need | Use |
| --- | --- |
| Card / panel | `wss/panel/ui/Card.tsx` (`Card`, `Badge`) |
| Lists | core `DataTable` (rendered as `wss/panel/ui/DataTable.tsx` in the shell) |
| Usage summary + actions | core `ListToolbar` (WSS presentation) |
| Error / denied / not found / offline | core `ServerError`/`ScreenBlock` → `StatePanel` |
| Dialogs | core `Dialog` (WSS wording) |
| Forms | core form fields (WSS wording, theme rules) |
| Status | `BotStatusPill` (workspace), extension `StatusBadge` (cards) |
| Wording | `copy.*`, `reword` — never hardcode "server"/"bot" in new UI |

Extension components (`wss/extensions/wss`): `BotCard` (`dashboard.serverCard`),
`DashboardOverview` (`dashboard.before`), Overview screen, `FileManager`
(`server.files.manager`), `FileRow` (`server.files.details`), `FileEditor`
(`server.files.editor`), `ExternalLinks` (`nav.items.after`).

## 7. Extension slots kept available

All core slots still mount, including those inside WSS compositions: `nav.items.before/after`,
`dashboard.before/after`, `server.console.before/after`, `server.console.power.before/after`
(console page, in the bot header), `server.files.*`, `server.users.permissions.before`,
`account.overview.before/after`, `auth.login.*`. Future integrations (WHMS-lite links, notices)
should use slots or extension settings first.

## 8. Core patch inventory

26 registered upstream files, all presentation (`wss/core-patches.json`, `CORE_PATCHES.md`).
Phase 4 kept the count at 26 while closing seven gaps: 4 patches removed (LoginContainer,
PowerButtons, StatGraphs, RenameServerBox), 4 added (ChartBlock, ScheduleEditContainer,
WebsocketHandler, fields.tsx). **Budget: 26 is the ceiling.** A new seam needs a removed or
consolidated one, or a written justification in `CORE_PATCHES.md`.

## 9. Intentional upstream / Pterodactyl exceptions

| What | Why it stays |
| --- | --- |
| "Powered by Pterodactyl" (footer, login) | Honest attribution; MIT licence notice is in `LICENSE.md` |
| Console lines from Wings (`[Pterodactyl Daemon]: …`) | Raw terminal output stays authentic |
| Egg feature modals (Java, EULA, Steam disk, GSL, Hytale, PID limit) | Mount only when an egg declares the feature; WSS bot eggs declare none. Kept for compatibility |
| Wings / API error descriptions inside toasts and error panels | Shown in full so customers and support can act on them |
| Some success/error toast titles from API hooks ("Server details updated") | Emitted directly through sonner in ~20 core files; no single seam. Listed in `GAPS.md` |
| Admin area (`/panel`) | Stock by decision |

## 10. Responsive expectations

Checked at 1440, 1280, 1024, 820, 768, 430, 390 px: no horizontal page scrolling on any customer
page; lists become labelled stacked rows below ~42rem of content width; sidebar becomes a drawer
below 1024 px; dialogs stay inside the viewport; zoom is allowed (WSS restores
`user-scalable` that core's template disables).

## 11. Upgrade procedure

1. Merge upstream; `node wss/dev/check-core-patches.mjs <ref>`: re-apply changed seams, update
   `upstreamBlob`, review any flagged style dependency.
2. `npx tsc --noEmit`, `npm run build` (SDK typings must not change), core `npx vitest run`,
   `npx vitest run --config wss/panel/vitest.config.mts`, extension `npm test`.
3. `wss/dev/e2e/regression.mjs`, `permissions.mjs`, `screens.mjs`, plus an axe pass.
4. Rebuild/reinstall the extension and `php artisan p:theme:apply wss`.
