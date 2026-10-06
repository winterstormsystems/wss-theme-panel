# wss/dev (development only)

Nothing here is used in production.

| File | Purpose |
| --- | --- |
| `serve.sh` | Panel dev server with several PHP workers (required with Wings; see `../docs/DEV_ENVIRONMENT.md`). |
| `egg-wss-node-bot-dev.json` | Minimal Node.js bot egg for lifecycle testing. |
| `images/node-runtime/` | Local stand-ins for the GHCR Node.js yolk and installer images. |
| `e2e/login.mjs` | Logs in and screenshots the given paths: `node login.mjs /panel /account`. |
| `e2e/lifecycle.mjs` | Egg import → allocation → server → install → start → console → stats → files. `REINSTALL=1` reinstalls first. |
| `e2e/power.mjs` | `node power.mjs <identifier> start\|stop\|restart\|kill`. |
| `e2e/verify-wss.mjs` | Checks that the WSS extension bundle, its API route and the theme stylesheet load. |

The e2e scripts use Playwright and log in as a dev admin. Environment:

```sh
PANEL_USER=admin                    # default: admin
PANEL_PASSWORD=…                    # the password given to p:user:make (required)
PW_PATH=$(npm root -g)/playwright   # path to a playwright install
OUT=/tmp/screens                    # screenshot directory
EGG=wss/dev/egg-wss-node-bot-dev.json   # lifecycle.mjs only
```
