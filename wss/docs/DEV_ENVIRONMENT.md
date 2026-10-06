# Dev environment (Panel v2 + Wings)

Verified on 2026-10-06 against `2.0-develop` @ `41150ca9f` and Wings `v1.13.3`, in a Linux
container (PHP 8.3, Node 22, Docker 29, MariaDB 11.4, Redis 7, Go 1.24).

## Requirements

- PHP **8.3+** (Laravel 13) with `bcmath`, `intl`, `mbstring`, `pdo_mysql`, `posix`, `zip`, `redis`.
- The `mysql`/`mariadb` **client binary**: the first migration loads `database/schema/mysql-schema.sql` through it.
- Node 22 (`.nvmrc`), npm (the panel uses `package-lock.json`, not yarn).
- MariaDB/MySQL and Redis.
- Docker, for Wings.

## Panel

```sh
docker run -d --name wss-mariadb -p 127.0.0.1:3306:3306 \
  -e MARIADB_ROOT_PASSWORD=root -e MARIADB_DATABASE=panel \
  -e MARIADB_USER=pterodactyl -e MARIADB_PASSWORD=pterodactyl mariadb:11.4
redis-server --daemonize yes

composer install
npm ci && npm run build

cp .env.example .env    # then set:
#   APP_ENV=local  APP_DEBUG=true  APP_URL=http://127.0.0.1:8000  APP_ENVIRONMENT_ONLY=false
#   DB_PASSWORD=pterodactyl  CACHE_DRIVER=redis  SESSION_DRIVER=redis  MAIL_MAILER=log
#   HASHIDS_SALT=<random 20 chars>
#   RECAPTCHA_ENABLED=false   # otherwise the login form waits on Google's invisible reCAPTCHA
#   APP_KEY=base64:<32 random bytes, base64>   # see note below

php artisan migrate --seed --force
php artisan p:user:make --email=admin@wss.test --username=admin --name-first=WSS --name-last=Admin --password='…' --admin=1 -n
php artisan queue:work --queue=high,standard,low &
wss/dev/serve.sh
```

The admin area is at **`/panel`** in v2 (`/admin` is gone).

### Gotchas found while setting this up

- **`php artisan key:generate` fails on a fresh `.env`**: something resolves the encrypter
  while the app boots, before the command runs. Write `APP_KEY` yourself
  (`echo "base64:$(head -c 32 /dev/urandom | base64)"`).
- **Don't use `php artisan serve` once Wings is attached.** It answers one request at a time.
  Creating a server makes the panel call Wings, and Wings calls back into
  `/api/remote/servers/{uuid}` inside that same request, which deadlocks until the 15 s timeout
  (`DaemonConnectionException`). `wss/dev/serve.sh` runs PHP's server with 6 workers. Production
  (nginx + php-fpm) is unaffected.
- `composer install` without GitHub API access: `phpstan/phpstan` is dist-only (no git source),
  so it needs `codeload.github.com`. `--no-dev` avoids it but also drops the PHP test tooling.
- The extension's tests need the SDK test runtime: run `npm run sdk:testing` at the panel root once.

## Wings

```sh
php artisan p:location:make --short=dev --long="WSS dev" -n
php artisan p:node:make --name=dev-node-1 --locationId=1 --fqdn=127.0.0.1 --public=1 --scheme=http \
  --proxy=0 --maintenance=0 --maxMemory=8192 --overallocateMemory=0 --maxDisk=20480 --overallocateDisk=0 \
  --uploadSize=100 --daemonListeningPort=8080 --daemonSFTPPort=2022 --daemonBase=/var/lib/pterodactyl/volumes -n
php artisan p:node:configuration 1 --format=yaml > /etc/pterodactyl/config.yml
wings --config /etc/pterodactyl/config.yml     # official binary/image, or `go build` from pterodactyl/wings
```

Containers without IPv6 (some sandboxes and CI runners): Wings creates its `pterodactyl_nw`
network with IPv6 hardcoded on and exits with `Cannot read IPv6 setup for bridge pterodactyl0`.
Pre-create the network IPv4-only and Wings reuses it:

```sh
docker network create --driver bridge --subnet 172.18.0.0/16 --gateway 172.18.0.1 \
  -o com.docker.network.bridge.name=pterodactyl0 pterodactyl_nw
```

Real hosting nodes don't need this.

## Bot lifecycle check

`wss/dev/egg-wss-node-bot-dev.json` is a minimal Node.js bot egg. It refers to two
locally built images (`wss/dev/images/node-runtime`), which stand in for Pterodactyl's
GHCR yolks when GHCR is unreachable:

```sh
docker build -t wss-dev/yolk-node:22 wss/dev/images/node-runtime
docker build -t wss-dev/installer-node:22 -f wss/dev/images/node-runtime/Dockerfile.installer wss/dev/images/node-runtime
```

Then `wss/dev/e2e/lifecycle.mjs` imports the egg, creates an allocation and server through
`/api/admin`, waits for the install, starts the bot, sends a console command and reads
stats and files. See `wss/dev/README.md`.

The stand-in runtime `exec`s the startup command, so the bot is PID 1 and the egg's `^C`
stop reaches it. Don't use these images in production.

## After a container restart

Files survive; processes don't. Start `dockerd`, `docker start wss-mariadb`, `redis-server`,
`wss/dev/serve.sh`, the queue worker and Wings again (the `pterodactyl_nw` network persists).
The dashboard reads resource state through the panel's cache, so a just-started bot can show
its previous state for up to ~20 seconds.
