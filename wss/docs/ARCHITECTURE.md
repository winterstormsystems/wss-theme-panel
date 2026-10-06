# WSS extension architecture

```
themes/wss/                    theme: tokens.css (all colours, type, layout) + assets/fonts
wss/extensions/wss/            SDK extension (id and Tailwind prefix: wss)
  extension.json               manifest; declares the dashboard.serverCard replacement
  vite.config.mjs              SDK preset + modulepreload off (see GAPS.md)
  src/client/
    index.tsx                  registration only (slots, replacement, shell switch)
    terminology.ts             customer-facing vocabulary
    status.ts                  status model, usage banding, formatting, tone classes
    botStates.ts               tiny store: statuses published by mounted bot cards
    styles.css                 Tailwind (wss: prefix) + WSS semantic utilities
    components/
      BotCard.tsx              dashboard.serverCard replacement
      StatusBadge.tsx          dot + label
      ResourceMeter.tsx        compact usage bar with role="meter"
      DashboardOverview.tsx    dashboard.before slot
      LoginBrand.tsx           auth.login.before slot
```

Layering: theme tokens → extension components → SDK slots/replacements → existing panel
components (`Empty`, `Button`, `NamedIcon`). No core file is modified or copied.

## Components

| Component | Purpose | Data | Reuses core | Used in |
| --- | --- | --- | --- | --- |
| `BotCard` | Bot row on the dashboard | `ServerCardModel` from the panel (name, description, address, live state with CPU/RAM/disk values, limits and alarm flags) | Lives inside core's card link, polling, pagination and status bar; icons via `NamedIcon` | `dashboard.serverCard` |
| `StatusBadge` | Status as dot + text | `botStatus(state)` | — | BotCard |
| `ResourceMeter` | Compact usage bar | model metrics | — | BotCard |
| `DashboardOverview` | Welcome, brand accent, summary (bots / online / offline), error + retry | `useCurrentUser()`, one `http.get('/api/client', {page:1, per_page:1})` via TanStack Query (SDK `http` and shared `queryClient`), statuses from `botStates` | `Button` | `dashboard.before` |
| `LoginBrand` | WSS identity above the login form | `useSiteSettings().name` | — | `auth.login.before` |

Considered and not built (no value yet): PageHeader/SectionHeader (core `PageHeading` and
slot placement cover it), StatTile/EmptyState components (removed: inline stat is enough;
a second empty panel duplicated core's), ActionButton/ConfirmationDialog (no WSS actions yet;
the SDK exports `Button` and `Dialog`).

## Real data only

| Shown | Source | Freshness |
| --- | --- | --- |
| Bot list, name, description, address | core dashboard query (`/api/client`) | core |
| Status, CPU, RAM, disk | core per-card `/api/client/servers/{uuid}/resources` polling (30 s; Wings caches ≤20 s) | core |
| Bots total | `GET /api/client?page=1&per_page=1` → `meta.pagination.total` | 30 s stale time |
| Online / offline counts | statuses of the cards currently mounted (`botStates`) | live with the cards |
| Welcome name | `useCurrentUser()` (first name, else username) | session |
| Site name on login | `useSiteSettings()` (`APP_NAME` / admin setting) | page load |

Nothing static stands in for runtime data. When the account has more bots than one page
shows, the overview says the online/offline counts cover the bots on the page.

## Terminology

`terminology.ts` holds every customer-facing noun used by WSS components (`terms.bot`,
`terms.bots`, …) plus `count()`/`lower()` helpers. Components never hardcode "Bot".
Core screens keep their wording; remaining instances are listed in GAPS.md.

## Shell

- Global navigation: core top bar (site name, search, Dashboard, Admin, Account, Sign out),
  restyled by tokens. "Dashboard" is the bot list, so Dashboard and Bots are one destination.
- Sub-navigation: core horizontal tabs for the bot and account areas.
- Sidebar mode is implemented (`SIDE_NAVIGATION` in `index.tsx`, the SDK's documented
  `data-sub-navigation="side"` switch, `lg`+) but **off**: with a sidebar, core's console stat
  column truncates the address port and memory limit at 1280–1440px. Enable it together with
  the bot detail redesign. Screens below `lg` always use tabs.
- Billing: not added. When WHMS-lite exists, add it as a `nav.items.*` slot whose URL is an
  extension setting (`->frontend()`), never a hardcoded URL.

## Responsive decisions

- BotCard: one row from `md` (identity | metrics | Manage); below `md` it stacks identity,
  a 3-column metric grid and the Manage hint. Metrics stay visible on mobile (core hides them).
- Overview: text and figures side by side from `lg`; stacked below with a 3-column stat row.
- Tested at 1440, 1280, 820, 390 px: no horizontal overflow.

## Build notes

- Extension CSS is compiled with the `wss` prefix; only semantic colours exist, so components
  cannot drift onto raw palette values. Brand values come from theme tokens with canonical fallbacks.
- `@tanstack/react-query`, React and the SDK are shared with the panel (import map); icons
  come from the panel via `NamedIcon`, so lucide is not bundled. Output: ~6 KB entry + ~4 KB card chunk.
