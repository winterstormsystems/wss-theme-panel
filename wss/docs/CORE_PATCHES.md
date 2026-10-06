# WSS core patches

Pterodactyl stays the engine; these are the only upstream files WSS changes, all presentation.
Machine-readable list: `wss/core-patches.json`. Check after every upstream merge:

```sh
node wss/dev/check-core-patches.mjs            # against origin/2.0-develop (or pass a ref, e.g. upstream/2.0-develop)
```

It reports, per file: changed upstream since the patch (blob differs), patch still present,
any modified upstream file that is not registered, and any core class name the WSS theme rules
depend on that disappeared upstream (`styleDependencies`). Exit code 1 means look.

**Count: 26 upstream files** (12 after phase 2, 26 after phase 3, still 26 after phase 4: four
removed, four added; see "Phase 4" below). 26 is the ceiling (`CUSTOMER_UI_FREEZE.md`).

**Backend, API, permissions, WebSocket and Wings behaviour: unchanged.** No PHP, route,
migration or API contract is touched.

## The bridge

`resources/scripts/wss/` is a new, WSS-owned directory inside the upstream tree (upstream has
no such path, so it never conflicts). Seams import only from it:

| File | Exposes | Note |
| --- | --- | --- |
| `index.ts` | `WssShellContext`, `useInWssShell`, `useWssPrimitive`, `useWssWording` | Self-contained on purpose: SDK-exported components (`PageContentBlock`, `TitledGreyBox`) import it, and `npm run build` regenerates SDK types with `rootDir: resources/scripts`. An import that leaves that directory breaks the build (found during this phase). |
| `shell.ts` | `WssAppShell`, `WssWorkspaceLayout`, `useWssCustomerRoute` | → `wss/panel/` |
| `auth.ts`, `console.ts`, `settings.ts`, `account.ts`, `copy.ts` | auth layout/card, console, settings, account overview, wording | → `wss/panel/` (split so the console stays in its lazy chunk) |

**Runtime registry (phase 3).** Several primitives are SDK-exported (`ScreenBlock`, `Dialog`), so
they cannot import `wss/panel` statically. The WSS shell puts its presentations and its wording
function into `WssShellContext`; seams read them with `useWssPrimitive<Props>('DataTable')` and
`useWssWording()`. Outside the shell (admin) both return `undefined` and core renders unchanged.
Generated SDK typings stay identical because the seams keep their exported signatures.

The UI itself lives in `wss/panel/` and uses core modules through the `@/` alias (Tailwind's
automatic source detection already scans `wss/`, so no build configuration changes).

## Patches

Kinds: **reexport** = whole file replaced by a commented one-line re-export (re-apply by
re-creating the line); **branch** = small conditional added, upstream code kept;
**strings** = literals swapped for `copy.*` constants from `wss/panel/terminology.ts`.

| # | Upstream file | Kind | Behaviour changed | Why the SDK/theme could not | Upstream code replaced | WSS owner | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `router/layouts/AuthenticatedLayout.tsx` | branch | Customer routes render the WSS shell (sidebar, top bar with search + account menu, mobile drawer, footer) instead of `NavigationBar`. `/panel` unchanged. | Top bar is not replaceable; only right-side `nav.items.*` slots | 11-line layout (NavigationBar + Outlet), kept for admin | `wss/panel/shell/AppShell.tsx` | low |
| 2 | `components/elements/SubNavigationLayout.tsx` | branch | In the shell, account/bot areas get the WSS workspace: bot header (identity, live status, address, power controls), section navigation portalled into the sidebar (desktop) or tabs (mobile), section headings. Core's tab bar is not rendered. | No replacement for area layouts or sub-navigation | 18-line flex layout, kept outside the shell | `wss/panel/workspace/*` | low |
| 3 | `components/elements/PageContentBlock.tsx` | branch | Stock footer hidden inside the shell | Footer is hardcoded markup | footer `<ContentContainer>` wrapped in a condition | `wss/panel/shell/Footer.tsx` | medium |
| 4 | `components/elements/TitledGreyBox.tsx` | branch | In the shell, boxes render as WSS panels (border, sentence-case title) instead of grey uppercase header bars | Component styling is hardcoded classes | class choice made conditional | bridge `useInWssShell` | medium |
| 5 | `router/layouts/AuthLayout.tsx` | reexport | WSS authentication layout: gradient brand panel with logo (lg+), form column, mobile brand header | Auth layout not replaceable | 9-line padded `<Outlet/>` wrapper | `wss/panel/auth/AuthLayout.tsx` | low |
| 6 | `components/auth/LoginFormContainer.tsx` | reexport | WSS auth card, same props and `Form`; no mascot, no Pterodactyl footer; "Login to Continue" shown as "Welcome back" | Mascot and footer hardcoded | ~45-line card with `pterodactyl.svg` | `wss/panel/auth/AuthCard.tsx` | low |
| 7 | `components/server/console/ServerConsoleContainer.tsx` | reexport | Console page: terminal first, WSS resource panel beside it (WebSocket `stats`), history graphs below; identity/power moved to the bot header | Only before/after slots around a fixed composition | ~70-line composition; core `Console`, `StatGraphs`, `Features`, slots reused | `wss/panel/console/*` | medium |
| 8 | `components/server/settings/SettingsContainer.tsx` | reexport | Settings page: Bot details, SFTP access, technical details, danger zone; each block behind the same `Can` permission as before | Page composition not replaceable | ~80-line composition; core rename/reinstall boxes reused | `wss/panel/settings/SettingsWorkspace.tsx` | medium |
| 9 | `components/dashboard/DashboardContainer.tsx` | strings | "Servers" → "My Bots" + subtitle; admin toggle and empty state wording; empty icon Server → Bot | Hardcoded strings, no i18n | 6 literals, 1 icon | `copy.dashboard` | medium |
| 10 | `components/dashboard/search/SearchModal.tsx` | strings | "Search bots", hint, "No bots found" | Hardcoded strings | 3 literals | `copy.search` | low |
| 11 | `components/server/settings/RenameServerBox.tsx` | strings | **Removed in phase 4** (see below). Bot Details / Bot Name / Bot Description | Hardcoded strings | 3 literals | `copy.settings` | low |
| 12 | `components/server/settings/ReinstallServerBox.tsx` | strings | Reinstall Bot title, button, explanation, confirmation | Hardcoded strings | 6 literals | `copy.settings` | low |

### Phase 3

Kinds as above, plus **style** = one presentational attribute.

| # | Upstream file | Kind | Behaviour changed | Why the SDK/theme could not | WSS owner | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| 13 | `components/elements/table/DataTable.tsx` | branch | Every customer list renders as the WSS responsive list (table when wide, labelled stacked rows when narrow, no horizontal scroll); empty states reworded | No list replacement; one primitive serves 8 pages | `wss/panel/ui/DataTable.tsx` | low |
| 14 | `components/elements/ListToolbar.tsx` | branch | Usage summary + actions in WSS style, summary reworded | Summaries are core strings | `wss/panel/ui/ListToolbar.tsx` | low |
| 15 | `components/elements/activity/ActivityLogEntry.tsx` | branch | Activity as audit rows (description, actor, event code, IP, time); "server" wording in translations | Hardcoded markup | `wss/panel/ui/ActivityEntry.tsx` | low |
| 16 | `components/elements/ScreenBlock.tsx` | branch | Error/denied/not-found/conflict screens as WSS state panels, no Pterodactyl illustration | Hardcoded markup + SVG | `wss/panel/ui/StateBlock.tsx` | low |
| 17 | `components/elements/ContentBox.tsx` | branch | Account API/SSH boxes as single-border WSS cards | Hardcoded markup | `wss/panel/ui/ContentBox.tsx` | low |
| 18 | `components/elements/dialog/Dialog.tsx` | branch | Dialog text through presentation wording (quoted user data excluded) | Dialog texts spread over ~10 files | `wss/panel/wording.ts` | medium |
| 19 | `components/dashboard/AccountOverviewContainer.tsx` | reexport | Account overview: 2FA security card with status, email and password cards; core forms and slots | Page composition | `wss/panel/account/AccountOverview.tsx` | low |
| 20 | `components/server/console/PowerButtons.tsx` | style | **Removed in phase 4** (see below). Start uses the success colour | Button colour is a prop | — | low |
| 21 | `components/server/console/StatGraphs.tsx` | strings | **Removed in phase 4** (see below). CPU Usage, Memory Usage, Network Traffic | Hardcoded strings | `copy.graphs` | low |
| 22 | `components/server/startup/StartupContainer.tsx` | strings | Launch Command, Runtime Image, Environment Variables, help texts | Hardcoded strings | `copy.runtime` | medium |
| 23 | `components/auth/LoginContainer.tsx` | strings | **Removed in phase 4** (see below). "Sign in" | Hardcoded string | `copy.auth.signIn` | low |
| 24 | `components/server/users/AddSubuserButton.tsx` | strings | "Invite member" | Hardcoded string | `copy.team` | low |
| 25 | `components/server/users/EditSubuserModal.tsx` | strings | Team member dialog wording; group titles; sentence-case labels; title clear of the close button. Permission keys/values unchanged | Hardcoded strings | `copy.team`, `permissionGroupTitle` | medium |
| 26 | `packages/sdk/slot-coverage.spec.ts` | test | Upstream slot-coverage test also reads the WSS compositions that mount `server.console.*` and `account.overview.*` (the containers it read are now re-exports). Fixes 4 failures introduced in phase 2 and 2 from phase 3 | The test hardcodes where slots live | — | low |

`ReinstallServerBox.tsx` (phase 2 seam) also shows the skipped-install-script notice in WSS wording.

**Why 14 more and not fewer.** Eight are shared primitives: each one changes every page that
uses it (DataTable alone covers network, backups, schedules, tasks, databases, team, API keys,
SSH keys), which is far less than patching or copying each page. Alternatives rejected: copying
page containers into WSS (duplicates business logic, larger upgrade surface) and CSS selectors
on core layout classes (invisible coupling). The remaining five are short string swaps where the
text is not reachable any other way, plus the upstream slot-coverage test, which must know where
the re-exported compositions mount their slots.

### Phase 4 (count unchanged: 26)

Removed (file restored to upstream, behaviour now reached another way):

| Was | Now |
| --- | --- |
| `components/auth/LoginContainer.tsx` (Sign in) | WSS `AuthCard` (already a seam target) maps core's auth texts by exact match on all four auth screens |
| `components/server/console/PowerButtons.tsx` (green Start) | `BotHeader` scopes `--primary` to the success colour around core's `PowerButtons` (style dependency recorded) |
| `components/server/console/StatGraphs.tsx` (graph titles) | `ChartBlock` seam maps the titles |
| `components/server/settings/RenameServerBox.tsx` (labels) | `fields.tsx` and `TitledGreyBox` seams reword labels and box titles |

Added:

| # | Upstream file | Kind | Behaviour changed | Why not SDK/theme | WSS owner | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| P4-1 | `components/server/console/ChartBlock.tsx` | branch | Performance cards as WSS cards, WSS titles, offline note | Chart card markup hardcoded | `wss/panel/ui/ChartBlock.tsx` | low |
| P4-2 | `components/server/schedules/ScheduleEditContainer.tsx` | reexport | Schedule detail as a WSS composition (core query, task columns, actions) | Page composition not replaceable | `wss/panel/schedules/ScheduleDetail.tsx` | low |
| P4-3 | `components/server/WebsocketHandler.tsx` | strings | Connection toast titles and the reconnect banner ("Unable to connect to this bot") | Strings hardcoded; toasts are raised here | `copy.connection` | medium |
| P4-4 | `components/form/fields.tsx` | branch | Field labels, help and validation text through wording in the shell | Field text passes through render-props no other seam reaches | `wss/panel/wording.ts` | medium |

`TitledGreyBox` (phase 2 seam) now also rewords its title and body in the shell.

The file manager rows (`server.files.details`), the file manager frame (`server.files.manager`,
using core's own `parts.list`) and the editor frame (`server.files.editor`, core `parts` with a
WSS save action calling `model.save()` and a labelled language picker) are **extension
replacements**: no core patch.

### Theme rules (no core file changed)

`themes/wss/tokens.css` ("WSS customer UI rules") applies only while `<html data-wss-ui>` is set
by the WSS shell or auth layout: field fill/outline split (`--input` fill + `border-input`
outline), sentence-case buttons/labels/captions, focus rings, validation icon, empty-state tile.
The core class names they rely on are listed in `styleDependencies` and checked by the script.

Risk = likelihood that an upstream change to the file conflicts with the patch.

## Verifying after an upstream merge

1. `node wss/dev/check-core-patches.mjs <new upstream ref>`; for each `CHANGED upstream`, read
   the printed diff and re-apply the seam (reexport: re-create the line; branch/strings: re-add).
2. Update `upstreamBlob` in `wss/core-patches.json` to the new blob.
3. `npx tsc --noEmit && npm run build` (also catches internal APIs `wss/panel` uses changing).
4. `node wss/dev/e2e/regression.mjs`, `screens.mjs`, `permissions.mjs` (see `wss/dev/README.md`).

## Licence and attribution

Pterodactyl is MIT licensed. The licence requires the copyright and permission notice to be
included "in all copies or substantial portions of the Software", which `LICENSE.md` in the
distributed source satisfies; it does not require attribution in the user interface.
"Pterodactyl®" is a trademark, so WSS does not present it as the product name. As honest,
nominative attribution the customer footer and login keep a subtle "Powered by Pterodactyl"
link. The admin area is unchanged and keeps the stock footer.
