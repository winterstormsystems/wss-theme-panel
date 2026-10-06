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
| `e2e/regression.mjs` | UI regression through real clicks: login, card → bot, start/restart/stop buttons, console output, command, stats (from the page's own WebSocket frames), files, account, dashboard, logout. Bot must be stopped first. |
| `e2e/responsive.mjs` | Screenshots login, dashboard, bot console/files and account at 1440/1280/820/390 px; reports horizontal overflow and console/network errors. Paced for core's 5/min WebSocket token limit. |
| `e2e/screens.mjs` | The phase-2 screenshot set (login, dashboard, overview, console, files, runtime, settings, mobile drawer, empty account) at 1440/1280/820/390 px, using in-app navigation; reports overflow and console/network errors. `EMPTY_USER`/`EMPTY_PASSWORD` for the empty account. |
| `e2e/permissions.mjs` | Grants a limited subuser (console + file read) via the client API and checks the WSS shell hides other sections and power controls. Needs `SUBUSER_USER`/`SUBUSER_PASSWORD`. |
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
