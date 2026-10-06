# Pterodactyl v2 capability audit (for the WSS UI)

Against `2.0-develop` @ `41150ca9f`, SDK `2.0.0-beta.4`.

## Theme

- Theme = `themes/<id>/theme.json` + `tokens.css` (+ `assets/`), published by `p:theme:apply`
  to `public/assets/theme.css`, linked after the panel CSS. No rebuild. Content is not validated.
- Colour roles (shadcn naming) under `:root` (light scaffold) and `.dark` (shipping theme; forced):
  background, foreground, card, popover, primary, secondary, muted, accent, destructive, border,
  input, ring, success, warning, caution, state-foreground, chart-1…5, sidebar-*.
- Extras: `--sunken` (derived), `--selection`, `--terminal-*` (canvas console, re-read on theme
  change), `--editor-*`, `--scrollbar-*`, `--color-scheme`, `--theme-color` (meta kept in sync).
- Layout/shape/type: `--layout-content-width`, `--layout-auth-width`, `--layout-sidebar-width`,
  `--radius` (scale derived), `--spacing` (density), `--font-sans`, `--font-header`.

## Navigation / layout

- Top bar (`NavigationBar`): site name, search, Dashboard, Admin (root admin), Account, Sign out.
  Slots `nav.items.before/after` only; not replaceable.
- Sub-navigation (account, server/bot area): horizontal tabs; `data-sub-navigation="side"` on
  `<html>` turns them into a sticky sidebar from `lg`. Nav entries come from core routes plus
  extension screens (`ui.screens`, with label, icon, group, order, badge, permission, `when`).
- Admin area (`/panel`) has its own sidebar.

## Slots relevant to this phase

| Area | Slots |
| --- | --- |
| Global nav | `nav.items.before`, `nav.items.after` |
| Login / auth | `auth.login.before/after/form.after`, `auth.checkpoint.*`, `auth.password.*`, `auth.passwordReset.*` |
| Dashboard | `dashboard.before`, `dashboard.after`, `dashboard.serverRow.before/after/name.after/metrics.after` |
| Bot pages | `server.navigation.before/after`, `server.console.before/after`, `server.console.power.before/after`, `server.files.*`, `server.startup.*`, … |
| Account | `account.navigation.before/after`, `account.overview.before/after`, `account.api.*`, `account.ssh.*`, `account.activity.*` |

Component replacements: `dashboard.serverCard`, `server.files.manager`, `server.files.editor`,
`server.files.details`.

## Hooks / data

| Need | SDK |
| --- | --- |
| Server list | **none** (core's `useAccountServers` is not exported) |
| One server (in server area) | `useCurrentServer`, `useCurrentServerRequired`, `serverQueryOptions(id)` |
| State + CPU/RAM/disk | `useServerResources(uuid)` / `serverResourcesQueryOptions` (shares the dashboard cards' cache); `useServerWebsocketEvent('stats'\|'status')` inside the server area; `ServerCardModel.state` in the card replacement |
| Power / commands | `useSendServerPower`, `useSendServerCommand` (client API, permission-checked) |
| Current user / site | `useCurrentUser`, `useSiteSettings` |
| Permissions | `usePermissions`, `useServerPermission`, `Can` |
| Navigation | `PanelLink`, `usePanelNavigate`, `usePanelLocation` |
| Transport | `http` (panel axios, session + CSRF), `queryClient` |
| Theme | `readThemeToken`, `onThemeChange`, `notifyThemeChange` |

## Reusable components (SDK exports)

`Button` (+ Text/Danger, LinkButton), `Spinner`, `Icon`, `NamedIcon`, `Can`, `ContentBox`,
`PageContentBlock`, `ServerContentBlock`, `TitledGreyBox`, `CopyOnClick`, `ScreenBlock`/`ServerError`/`NotFound`,
`Label`, form controls (`Form`, `useAppForm`, `Input`, `Select`, `Checkbox`, `Switch`), `Alert`,
`Dialog`, `toast`, `DropdownMenu`, `Pagination`, `Table`, `Tooltip`, `Empty*`.

## Achievable without core changes (and done)

Colours, type, radius, layout widths, console/editor palettes (theme); bot cards with status
and usage, dashboard overview, login identity band (extension); sidebar sub-navigation (switch).

## Not achievable without core changes

See GAPS.md.
