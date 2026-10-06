# Phase 2 plan: WSS application shell and bot workspace

Goal: the customer UI should read as Winter Storm Systems Bot Hosting, not a themed
Pterodactyl. Backend, API, permissions, WebSocket and Wings behaviour stay untouched.

## Architecture: one bridge, few seams

```
upstream file (tiny seam)  ──►  resources/scripts/wss.ts (new file, re-export only)
                                   │
                                   ▼
                              wss/panel/  (WSS-owned UI compiled into the panel bundle)
                                   │ uses
                                   ▼
                     existing core logic: routing, nav registry, Can/ScreenGate,
                     PowerButtons, Console, websocket hooks, queries, mutations
```

- `wss/panel/` holds WSS UI that has to live inside the panel bundle because the SDK has no
  extension point for it (shell, auth layout, console composition). It imports core modules
  through the existing `@/` alias. Tailwind's automatic source detection already scans
  `wss/`, so no build config changes are needed.
- `resources/scripts/wss.ts` is a new file (no merge conflicts) re-exporting `wss/panel`, so
  every seam imports `@/wss`.
- `wss/extensions/wss/` keeps everything the SDK supports: bot card, dashboard summary,
  the bot Overview screen, nav links contributed through slots.
- Customer wording lives once in `wss/panel/terminology.ts`; the extension imports the same file.

The shell renders only for customer routes. `/panel` (admin) keeps the stock layout.

## Theme / extension only (no core change)

| Area | Mechanism |
| --- | --- |
| Colours, type, radius, console/editor palettes | theme tokens (unchanged from phase 1) |
| Bot cards, dashboard summary | `dashboard.serverCard` replacement, `dashboard.before` slot |
| Bot Overview page | extension screen (`ui.screens`, area `server`) using SDK hooks |
| Billing / Support links | extension settings + `nav.items.after` slot rendered by the shell; omitted while unset |
| Favicon / theme colour | `registerHeadTags` in the extension provider, logo from theme assets |

## Seams (upstream files), and why

| # | File | Change | Why the SDK cannot do it |
| --- | --- | --- | --- |
| 1 | `router/layouts/AuthenticatedLayout.tsx` | Render the WSS shell instead of `NavigationBar` for customer routes | The top bar is not replaceable; only right-side slots exist |
| 2 | `components/elements/SubNavigationLayout.tsx` | Inside the WSS shell, hand the account/bot area to the WSS workspace layout (bot header, sidebar section via portal) | No replacement for area layouts or sub-navigation |
| 3 | `components/elements/PageContentBlock.tsx` | Hide the stock footer inside the WSS shell (the shell has its own) | Footer is hardcoded markup |
| 4 | `router/layouts/AuthLayout.tsx` | Re-export the WSS auth layout | Auth layout not replaceable |
| 5 | `components/auth/LoginFormContainer.tsx` | Re-export the WSS auth card (no mascot) | Mascot and footer are hardcoded |
| 6 | `components/server/console/ServerConsoleContainer.tsx` | Re-export the WSS console workspace | Console page composition not replaceable (only before/after slots) |
| 7 | `components/server/settings/SettingsContainer.tsx` | Re-export the WSS settings workspace (Bot details, Reinstall, Danger zone, SFTP) | Page composition not replaceable |
| 8 | `components/dashboard/DashboardContainer.tsx` | Heading, description, admin toggle and empty-state wording | Hardcoded strings |
| 9 | `components/dashboard/search/SearchModal.tsx` | "Search servers" wording | Hardcoded strings |
| 10 | `components/server/settings/RenameServerBox.tsx` | "Server Name/Description/Details" wording | Hardcoded strings |
| 11 | `components/server/settings/ReinstallServerBox.tsx` | "Reinstall Server" wording | Hardcoded strings |

Seams 4–7 replace the whole file with a one-line re-export: easy to see and re-apply. Seams
1–3 add a small branch and keep the upstream code. Seams 8–11 only swap strings for
terminology constants. Every seam is listed in `wss/core-patches.json` with the upstream blob
hash it was made against; `wss/dev/check-core-patches.mjs` warns when upstream changes one.

## Customer experience

- Shell: left sidebar (logo, "Winter Storm Systems / Bot Hosting", My Bots, Account, contributed
  links, current-bot section), slim top bar (search, user menu with Account, Admin, Sign out),
  footer "© Winter Storm Systems · Powered by Pterodactyl". Tablet/mobile: off-canvas drawer.
- Dashboard: "My Bots" heading and subtitle, compact stat strip, bot cards.
- Login: split layout with gradient brand panel (lg+) and form card; single column on mobile.
- Bot workspace: bot header (name, status, address, power controls) on every bot page; bot
  navigation in the sidebar (desktop) and a scrollable tab strip (mobile); Startup shown as Runtime.
- Console: terminal first, resource panel beside it, history graphs below.

## Upgrade path

1. Merge upstream. 2. `node wss/dev/check-core-patches.mjs` lists changed seams. 3. Re-apply
those seams (each is a few lines). 4. Build, `tsc`, tests, `wss/dev/e2e/regression.mjs`.
`wss/panel/` uses internal core modules, so check it compiles after every merge; that is the
price of owning the shell.
