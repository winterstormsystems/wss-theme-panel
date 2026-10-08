# WSS brand reskin on Pterodactyl Panel v1 (stage 1)

Baseline: branch `wss/v1-develop` on `release/v1.15.1@7d9bd9fea`. Panel v1 has no extension
SDK, slots or theme system, so the reskin is a small set of registered core edits
(`wss/core-patches.json`, checked by `node wss/dev/check-core-patches.mjs`) plus WSS-owned assets.
Backend, API, permissions, auth and Wings are untouched. Admin (`/admin`) uses its own AdminLTE
CSS and is not affected.

## What changed

| Area | Files |
| --- | --- |
| Palette, fonts | `tailwind.config.js`, `assets/css/GlobalStylesheet.ts` |
| Favicons, theme colour, zoom | `views/templates/wrapper.blade.php`, `public/wss/brand/` |
| Login / auth pages | `auth/LoginFormContainer.tsx`, `elements/Input.tsx`, `elements/Label.tsx` |
| Buttons | `elements/Button.tsx`, `elements/button/style.module.css` |
| Top bar, footer | `NavigationBar.tsx`, `elements/PageContentBlock.tsx` |
| Terminal colours | `server/console/Console.tsx` |

WSS-owned: `public/wss/brand/` (logo marks, favicons, manifest),
`resources/scripts/assets/wss/fonts/` (Inter, self-hosted, OFL licence included).

## Palette mapping

Core components use Tailwind scale names (`neutral-700`, `primary-500`, `red-500`, …) everywhere,
so `tailwind.config.js` keeps those names and replaces their values. No component needs to know
about WSS colours.

| Core scale | WSS value |
| --- | --- |
| `gray`, `neutral` | dark ladder from `#2c3e50`: 900 `#0d141b` (top bar, auth), 800 `#121b24` (page), 700 `#18232e` (cards), 600 `#1f2c39` (raised, fields), 500 `#6c7d8f` (borders), 400 → 50 text |
| `primary`, `blue`, `cyan` | brand `#3498db` (500) |
| `green` / `red` / `yellow` | success `#2ecc71` / danger `#e74c3c` / warning `#f39c12` |
| `black` | `#0a1016` (terminal background) |

## Contrast decisions

- White on `#3498db` is 3.15:1, so filled blue, green and red buttons use dark text
  (`#0d141b`): 5.9:1 on blue, 8.8:1 on green, 4.8:1 on red (all AA).
- Muted text (`neutral-400`, `#8b9aab`) is 5.5:1 on cards.
- Grey buttons are `neutral-600` with a `neutral-500` border: the border is 3.8:1 against cards, and
  the label (`neutral-100`) is above 12:1.

## Configuration (not code)

- Site name: Admin → Settings → Company Name = `Winter Storm Systems` (shown in the top bar and
  page titles).
- "Powered by Pterodactyl" stays in the footer and on the login card (MIT attribution).

## Known remaining core presentation (stage 2/3 candidates)

- Wording: "Login to Continue", "Forgot password?" (uppercase link), "Servers", "Startup",
  "Subusers" and other core strings. Stage 2 would add a terminology layer and shell changes;
  stage 3 would restyle individual pages (dashboard rows, file manager, server sub-navigation).
- Console lines from Wings (`[Pterodactyl Daemon]: …`) stay as raw output.

## Upgrade procedure

1. Merge the new upstream release; run `node wss/dev/check-core-patches.mjs <ref>` and re-apply
   any file flagged as changed, then update its `upstreamBlob`.
2. `yarn lint`, `yarn tsc --noEmit`, `yarn build:production`.
3. Check login, dashboard, console, files and account at desktop and phone widths.

## Dev notes

`php -S` serves `/locales/locale.json` as a static file and returns 404; through Laravel (nginx,
or the framework's router script) the route returns 200. It is not a reskin issue.
