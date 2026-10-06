# WSS core patches

Pterodactyl stays the engine; these are the only upstream files WSS changes, all presentation.
Machine-readable list: `wss/core-patches.json`. Check after every upstream merge:

```sh
node wss/dev/check-core-patches.mjs            # against origin/2.0-develop (or pass a ref, e.g. upstream/2.0-develop)
```

It reports, per file: changed upstream since the patch (blob differs), patch still present,
and any modified upstream file that is not registered. Exit code 1 means look.

**Backend, API, permissions, WebSocket and Wings behaviour: unchanged.** No PHP, route,
migration or API contract is touched.

## The bridge

`resources/scripts/wss/` is a new, WSS-owned directory inside the upstream tree (upstream has
no such path, so it never conflicts). Seams import only from it:

| File | Exposes | Note |
| --- | --- | --- |
| `index.ts` | `WssShellContext`, `useInWssShell` | Self-contained on purpose: SDK-exported components (`PageContentBlock`, `TitledGreyBox`) import it, and `npm run build` regenerates SDK types with `rootDir: resources/scripts`. An import that leaves that directory breaks the build (found during this phase). |
| `shell.ts` | `WssAppShell`, `WssWorkspaceLayout`, `useWssCustomerRoute` | → `wss/panel/` |
| `auth.ts`, `console.ts`, `settings.ts`, `copy.ts` | auth layout/card, console, settings, wording | → `wss/panel/` (split so the console stays in its lazy chunk) |

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
| 11 | `components/server/settings/RenameServerBox.tsx` | strings | Bot Details / Bot Name / Bot Description | Hardcoded strings | 3 literals | `copy.settings` | low |
| 12 | `components/server/settings/ReinstallServerBox.tsx` | strings | Reinstall Bot title, button, explanation, confirmation | Hardcoded strings | 6 literals | `copy.settings` | low |

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
