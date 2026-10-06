# WSS Bot Hosting Panel

Winter Storm Systems' bot-hosting panel, built on **Pterodactyl Panel v2** (`2.0-develop`).

The rule this layout exists to enforce: **WSS code lives beside the panel, never inside it.**
Upstream's own extension SDK and theme system are the integration points, so pulling a new
Pterodactyl release should not conflict with WSS work.

## Layout

| Path | What it is | Upstream touches it? |
| --- | --- | --- |
| `wss/extensions/wss/` | The WSS extension (React UI via `@pterodactyl/sdk`, PHP provider, API routes) | No |
| `themes/wss/` | The WSS theme: `theme.json`, `tokens.css`, `assets/` | No (upstream ships no `themes/`) |
| `wss/dev/` | Dev-only tooling: multi-worker server, test egg, stand-in runtime images, Playwright checks | No |
| `wss/docs/` | `DESIGN_SYSTEM.md` (tokens, colours, contrast), `ARCHITECTURE.md` (components, data, shell), `CAPABILITY_AUDIT.md`, `GAPS.md` (limits and upstream issues), dev environment and Wings notes | No |
| everything else | Upstream Pterodactyl, kept unmodified | Yes |

`extensions/` (the panel's install directory) is gitignored upstream; extensions are
*installed into* it from `wss/extensions/wss` and are not edited there.

## What goes where

- **Colours, typography, radius, density, layout widths, console/editor palettes, logos** →
  `themes/wss/tokens.css` and `themes/wss/assets/`. No rebuild; `php artisan p:theme:apply wss`.
- **Server/bot cards, file manager or editor presentation** → component replacements in the
  extension (`dashboard.serverCard`, `server.files.manager`, `server.files.editor`, `server.files.details`).
- **Extra content in core pages** (dashboard header, console, login, navigation) → extension slots.
- **New pages** (bot logs, deploy, billing link) → extension screens declared in `extension.json`.
- **Favicons, manifest, theme-color meta** → `registerHeadTags` in `WssProvider`.
- **Backend behaviour** (provisioning hooks, SSO for WHMS-lite) → the extension's PHP provider
  (`listenToServerOperations`, `wrapAction`, `registerRootRoutes`, `CompletesLogins`).

Things the SDK cannot do yet (top bar structure, core wording such as "Servers", the
dashboard empty state, logo placement) are listed in `docs/GAPS.md`. They are not patched;
any future core patch must be listed under **Core patches** below so it is re-checked on
every upstream update.

## Core patches

None. Keep this list current; every entry is a likely merge conflict.

## Working on the extension

```sh
cd wss/extensions/wss
npm install            # .npmrc sets legacy-peer-deps (npm 10 crashes resolving the file: SDK link otherwise)
npm run build && npm run typecheck && npm test   # tests need `npm run sdk:testing` once at the panel root
cd ../../..
php artisan p:extension:doctor wss/extensions/wss
php artisan p:extension:install wss/extensions/wss --enable   # re-run after rebuilding
# or: php artisan p:extension:dev wss/extensions/wss --watch --enable
```

Reload the browser after enabling or updating; evaluated extension code is not hot-swapped.

## Working on the theme

```sh
php artisan p:theme:apply wss    # publishes tokens.css -> public/assets/theme.css, assets/ -> public/assets/theme/
php artisan p:theme:reset        # back to stock
```

The panel forces dark mode, so colour roles go under `.dark` (see the notes in `tokens.css`).
Override tokens only; selectors on core class names are not a stable API.

## Updating from upstream

```sh
git remote add upstream https://github.com/pterodactyl/panel   # once
git fetch upstream 2.0-develop            # later: release tags, e.g. v2.0.0
git diff HEAD...upstream/2.0-develop --stat -- packages/sdk resources/scripts/assets/tailwind.css config/extensions.php
git merge upstream/2.0-develop            # merge, never rebase this branch
composer install && npm ci && npm run build
cd wss/extensions/wss && npm install && npm run build && npm run typecheck && npm test && cd -
php artisan migrate --force
php artisan p:extension:doctor wss/extensions/wss && php artisan p:extension:install wss/extensions/wss --enable
php artisan p:theme:apply wss
node wss/dev/e2e/verify-wss.mjs           # see wss/dev/README.md for env vars
```

Watch for: `sdk_version` in `config/extensions.php` (a major bump breaks the extension's
`requires.sdk`), token renames in `resources/scripts/assets/tailwind.css` and
`packages/sdk/theme-tokens.css`, and the slot/component lists in `packages/sdk/types/extensions/`.

## WHMS-lite boundary

WHMS-lite talks to this panel only through the v2 **Application API** (`/api/application`,
`ptla_` keys, restricted by allowed IPs), using `external_id` on users and servers. v2 has
no `/nests` endpoints (eggs are grouped by tags), so integrations written for v1 do not
carry over. The panel stays independently usable; nothing in it may depend on WHMS-lite.
