# wss/dev (development only)

Nothing here is used in production.

| File | Purpose |
| --- | --- |
| `serve.sh` | Panel dev server with several PHP workers (required with Wings; see `../docs/DEV_ENVIRONMENT.md`). |
| `egg-wss-node-bot-dev.json` | Minimal Node.js bot egg for lifecycle testing. |
| `images/node-runtime/` | Local stand-ins for the GHCR Node.js yolk and installer images (the runtime `exec`s the bot so the `^C` stop works). |
| `e2e/login.mjs` | Logs in and screenshots the given paths: `node login.mjs /panel /account`. |
| `e2e/lifecycle.mjs` | Egg import → allocation → server → install → start → console → stats → files. `REINSTALL=1` reinstalls first. |
| `e2e/power.mjs` | `node power.mjs <identifier> start\|stop\|restart\|kill`. |
| `e2e/verify-wss.mjs` | Checks that the WSS extension bundle, its API route and the theme stylesheet load. |
| `e2e/regression.mjs` | UI regression through real clicks: login, card → bot, start/restart/stop buttons, console output, command, stats (from the page's own WebSocket frames), files, file editor save, schedule detail, every other bot section (overview, runtime, network, backups, schedules, databases, team access, settings, activity), account pages, dashboard, logout. Bot must be stopped first. |
| `e2e/responsive.mjs` | Screenshots login, dashboard, bot console/files and account at 1440/1280/820/390 px; reports horizontal overflow and console/network errors. Paced for core's 5/min WebSocket token limit. |
| `e2e/screens.mjs` | Screenshot set (login, every bot section and account page at 1440 px; mobile set at 390 px; empty account) plus an overflow sweep of every customer page at 1280/1024/820/768/430 px, using in-app navigation; reports overflow and console/network errors. `EMPTY_USER`/`EMPTY_PASSWORD` for the empty account. |
| `e2e/seed-content.mjs` | Creates real content through the client API (a backup, a schedule with two tasks, a database, a small bot file tree) so management pages can be reviewed with data. Needs raised limits and a database host. |
| `e2e/permissions.mjs` | Grants a limited subuser (console + file read) via the client API and checks the WSS shell hides other sections and power controls, that direct URLs to network/backups/schedules/schedule detail/databases/users/startup/activity are denied with no management controls, and that the editor is read-only (no save) for a read-only member. Needs `SUBUSER_USER`/`SUBUSER_PASSWORD`. |
| `check-core-patches.mjs` | Upgrade guard for `wss/core-patches.json` (see `../docs/CORE_PATCHES.md`). |
| `e2e/dashboard-states.mjs` | Dashboard as a given user, plus the overview's error (request failed in-browser) and loading states. |

The e2e scripts use Playwright and log in as a dev admin. Environment:

```sh
PANEL_USER=admin                    # default: admin
PANEL_PASSWORD=…                    # the password given to p:user:make (required)
PW_PATH=$(npm root -g)/playwright   # path to a playwright install
OUT=/tmp/screens                    # screenshot directory
EGG=wss/dev/egg-wss-node-bot-dev.json   # lifecycle.mjs only
```

Unit tests for WSS panel code (`wss/panel/*.spec.ts`): `npx vitest run --config wss/panel/vitest.config.mts`.
