# Winter Storm Systems

A Pterodactyl panel extension, scaffolded by `p:extension:make`.

## Layout

- `extension.json` — the manifest; `provider` is the boot entry point.
- `src/` — PSR-4 PHP (`Wss\`), booted through `src/WssProvider.php`.
  Runs fully trusted, in-process, with the same middleware stacks core uses.
- `routes/client.php` — mounted at `/api/client/extensions/wss`. Add
  `routes/admin.php` / `routes/application.php` for the other API surfaces.
- `database/migrations/` — extension-owned migrations. Prefix tables with
  `ext_wss_` by convention.

## Frontend

The UI entry (`src/client/index.tsx`) is compiled against `@pterodactyl/sdk` to a
single prebuilt ESM file — the panel dynamic-imports it at boot and resolves
React, TanStack Query, and the SDK through its import map, so the bundle stays
tiny and shares the panel's runtime.

```sh
npm install
npm run build        # or: npm run dev (rebuild on change)
npm run typecheck
npm test
```

`dist/client.js` must exist before the extension is enabled; it is published to
`/assets/extensions/wss/` on install/enable.

A `file:` SDK dependency is a link into the panel checkout. `preserveSymlinks` in
`tsconfig.json` makes the SDK's types use this package's React and TanStack Query
instead of the panel's copies; keep it.


Screen metadata is declared in `extension.json` under `ui.screens`. The client entry registers the implementation with `screens.register('main', importer)`. Keep both IDs in sync. The panel renders while extensions load; errors and loading are isolated per mount. Reload the panel after enabling, disabling, updating, or changing extension configuration.

Tests use the real SDK with `createExtensionTestHost`, including the host query cache,
router, permissions, and websocket events. CI runs types, tests, and a production build.

To generate a client for this extension, export its routes from the panel after Scribe
generation, then run the generator in this package:

```sh
php /path/to/panel/scripts/generate-extension-openapi.php wss /path/to/panel/storage/app/private/scribe/openapi.yaml /path/to/wss/openapi.yaml
npm run api:generate
```

The generated client uses `@pterodactyl/sdk/api` and the panel's shared authentication
and transport. Commit generated sources and the OpenAPI input with your extension.
Use `p:extension:doctor`, `p:extension:dev --watch`, and `p:extension:pack` from the panel
for validation, successful-build publishing, and runtime-only packaging.

`src/client/styles.css` compiles Tailwind with this extension's own prefix, `wss`
(`ui.prefix` in `extension.json`), and without resetting the panel, so its utilities never
collide with the panel's or another extension's: write `wss:flex`, `wss:lg:hidden`,
`wss:hover:bg-accent`, `wss:mt-4!` and `@apply wss:flex`. Unprefixed classes are not in
the extension's stylesheet, and `p:extension:doctor` and the installer reject a build whose
prefix is not the declared one. The SDK theme maps the same live tokens as core, so use
`wss:bg-card`, `wss:text-foreground`, and `wss:border-border` instead of palette
colors. Pass `prefix: 'wss'` to the SDK test hosts when a test asserts merged classes.
CSS loads before extension setup.

Run `php artisan p:extension:types /path/to/wss` to generate literal screen ids and
configuration keys after loading the provider. Declare frontend settings with
`->frontend()->frontendType('string')` and add `->public()` to those guests may read; use
`defineConfiguredExtension` with a runtime
parser and the generated types. Secret definitions use `->secret()` and stay backend-only.
## Install

```sh
php artisan p:extension:install /path/to/wss --enable
```

Package for distribution by zipping the directory as `wss.pteroext`
(exclude `node_modules/`; include `dist/`).
