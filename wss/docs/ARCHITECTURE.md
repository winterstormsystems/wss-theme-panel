# WSS architecture (Panel v2)

```
themes/wss/                    theme: tokens.css (colours, type, layout) + assets/fonts, assets/brand
resources/scripts/wss/         bridge: the only WSS paths upstream seams import (see CORE_PATCHES.md)
wss/panel/                     WSS application UI, compiled into the panel bundle
  terminology.ts               customer vocabulary (terms) and page copy (copy.*)
  brand.ts                     company/product names, logo asset paths
  shell/                       AppShell, Sidebar, UserMenu, Footer, BrandMark, routes, navStyles
  workspace/                   bot/account workspace: header, status pill, section nav, sections
  console/                     ConsoleWorkspace, ResourcePanel
  settings/                    SettingsWorkspace
  account/                     AccountOverview (2FA security card, email, password)
  schedules/                   ScheduleDetail (schedule detail page)
  auth/                        AuthLayout, AuthCard
  ui/                          WSS presentations of core primitives (DataTable, ListToolbar,
                               ActivityEntry, StateBlock, ContentBox, ChartBlock), Card/Badge,
                               primitives.ts (registry), useWssUiRoot (html data-wss-ui)
  wording.ts                   presentation wording for core-authored text (reword/rewordNode)
  vitest.config.mts            unit tests for wss/panel (*.spec.ts)
wss/extensions/wss/            SDK extension (id and Tailwind prefix: wss)
  extension.json               replacements: dashboard.serverCard, server.files.manager; screen: overview
  src/WssProvider.php          settings billing_url/support_url (HTTPS, optional), favicon head tags
  src/client/
    index.tsx                  registration only
    terminology.ts             re-exports wss/panel/terminology
    status.ts, botStates.ts    status model; statuses published by mounted bot cards
    components/                BotCard, StatusBadge, ResourceMeter, DashboardOverview,
                               FileManager (frame), FileRow (row details), FileEditor (editor
                               frame), fileTypes (icon/label hints), ExternalLinks (sidebar links)
    screens/OverviewScreen.tsx bot Overview page
wss/core-patches.json          registry of the 26 upstream seam files (frozen ceiling, see CUSTOMER_UI_FREEZE.md) + theme style dependencies
```

Preference order used: theme tokens → extension SDK (slots, replacements, screens, settings)
→ small registered core seams that delegate to `wss/panel/`. Admin (`/panel`) is untouched.

## How the shell is wired

1. `AuthenticatedLayout` asks `useWssCustomerRoute()` (false for `/panel`). Customer routes
   render `WssAppShell`; admin keeps core's `NavigationBar`.
2. `WssAppShell` provides `WssShellContext` (`sectionTarget`, `closeNavigation`). Core
   components that are reused everywhere (`PageContentBlock`, `TitledGreyBox`,
   `SubNavigationLayout`) check `useInWssShell()` and switch presentation only inside the shell.
3. `SubNavigationLayout` (used by the server and account route layouts) renders
   `WssWorkspaceLayout`, which detects the area and renders the bot header plus section
   navigation: portalled into the sidebar's section target at `lg+`, tabs below `lg`.
4. Section navigation reads core's route registry (`getAreaNav('server'|'account')`), so
   extension routes and screens appear automatically; each entry keeps core's `Can`
   permission and `ScreenGate`; `server.nav.*`/`account.nav.*` slots are rendered.
5. Shared primitives (phase 3): the shell provides `primitives` and `wording` through the same
   context; seams in `DataTable`, `ListToolbar`, `ActivityLogEntry`, `ScreenBlock`, `ContentBox`
   and `Dialog` render the WSS presentation or reword core text when inside the shell. One seam
   per primitive restyles every page that uses it, without copying page code.
6. Theme rules: `themes/wss/tokens.css` ends with rules scoped to `<html data-wss-ui>` (set by
   `useWssUiRoot` in the shell and auth layout): field fill/outline, sentence case, focus rings,
   validation icon. Admin never has the attribute.
7. Pages themselves are core routes. Console and Settings are composed by WSS (re-export
   seams) from core components; Files is a frame around core's manager via the SDK
   replacement; Overview is an SDK screen.

## Components

| Component | Purpose | Data | Reuses core |
| --- | --- | --- | --- |
| `AppShell` | Grid with sidebar, sticky top bar, main, footer; mobile drawer (`inert`, Esc, focus return, closes on navigation); skip link | route, `WssShellContext` | `SearchContainer` |
| `Sidebar` | Brand, My Bots, Account, `nav.items.*` slots, current-bot section target | — | `NavLink`, `Slot` |
| `UserMenu` | Account, Administration (root admin), Sign out | `useCurrentUser()` | `DropdownMenu`, `useLogout` |
| `Footer` | © year Winter Storm Systems · Powered by Pterodactyl | — | — |
| `BotHeader` | Name, live status, description, address (copy), admin link (root admin), power controls | `useCurrentServer()`, `useServerStatus()`, socket state | `PowerButtons`, `Can`, `CopyOnClick` |
| `BotStatusPill` | Status text + dot, `role="status"` | power state from WebSocket, server `status`, `is_transferring` | — |
| `AreaNav` (`BotNav`, `AccountNav`) | Section links, sidebar or tabs variant | `getAreaNav` | `Can`, `ScreenGate`, `ScreenBadge`, `Slot` |
| `ConsoleWorkspace` | Alerts, terminal, resource panel, performance history, features | core console state | `Console`, `StatGraphs`, `Features`, console slots |
| `ResourcePanel` | CPU, memory, disk meters, uptime, network | WebSocket `stats` (`parseServerStatsPayload`), server limits | `UptimeDuration` |
| `SettingsWorkspace` | Bot details, SFTP access, technical details, danger zone | `useCurrentServer()`, current user | `RenameServerBox`, `ReinstallServerBox`, `Can` |
| `AuthLayout`, `AuthCard` | Brand panel (lg+), form card, no mascot | site settings | `Form` props unchanged |
| `BotCard` | Dashboard bot row | core `ServerCardModel` | inside core's card link and polling |
| `DashboardOverview` | Bots / online / offline strip; hidden for empty accounts; error + retry | `GET /api/client?per_page=1`, `botStates` | `Button` |
| `OverviewScreen` | Resources, details, quick links | `useServerResources`, WebSocket `stats`, `useCurrentServer` | `useServerPermission` |
| `FileManager` | Card frame and folder/file/selection summary around core's manager | core file listing state | core manager |
| `ui/DataTable` | Responsive list for every core DataTable (rows wide, labelled stacked cards narrow) | the page's own TanStack table instance | core column defs, cells, `RowActions` |
| `ui/ActivityEntry` | Audit row: description, actor, event code, IP, time | activity log entries | `ActivityLogMetaButton`, `Tooltip`, i18n `activity` namespace |
| `ui/StateBlock` / `StatePanel` | Error, denied, not-found, conflict, offline states | core title/message | `Button` |
| `ui/Card`, `Badge` | Single-border WSS card; status badge with icon + text | — | — |
| `account/AccountOverview` | 2FA card with status, email, password | `useCurrentUser().useTotp` | core forms, dialogs, slots |
| `ExternalLinks` | Billing/Support sidebar links | extension settings (HTTPS only; hidden when unset) | `Slot` |

## Real data only

| Shown | Source |
| --- | --- |
| Bot list, name, description, address | core dashboard query / `useCurrentServer()` |
| Status | WebSocket power state; server `status` (installing, suspended, restoring); `is_transferring` |
| CPU, memory, disk, network, uptime | WebSocket `stats` (console, overview) or core resources polling (cards, overview fallback) |
| Limits, node, runtime image, internal ID | server attributes |
| Bots total | `meta.pagination.total` |
| Billing/Support links | extension settings; not rendered when empty |

Nothing static stands in for runtime data. Empty or unknown values render as "—" or are hidden.

## Terminology

Presentation only. `wss/panel/terminology.ts` holds `terms` and `copy`; seams and WSS
components read from it. Routes, API objects, TypeScript types and PHP stay "server".
Section titles: Startup → Runtime ("Runtime Configuration"). Remaining core wording: GAPS.md.

## Responsive decisions

- `lg+`: persistent sidebar (16rem) with the current-bot section list. Below `lg`: drawer from
  the menu button, section tabs under the bot header.
- Console: terminal and resource panel side by side from `lg`; stacked below. The terminal
  frame starts at `sm` because core's terminal uses negative margins on phones.
- Content width 72rem. Tested at 1440, 1280, 820, 390 px with no horizontal overflow.

## Build notes

- `wss/panel` is TypeScript compiled by the panel's Vite build (Tailwind scans `wss/`
  automatically); changes need `npm run build`. The bridge `index.ts` stays self-contained
  for SDK type generation.
- Extension CSS uses the `wss` prefix and semantic colours only; the panel's palette is reset,
  so neither side can use raw colours such as `bg-black`.
