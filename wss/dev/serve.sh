#!/usr/bin/env bash
# Dev only: serve the panel on http://127.0.0.1:8000 with several PHP workers.
#
# Do not use `php artisan serve` with a Wings node attached. It answers one request at a
# time, and when the panel calls Wings (e.g. creating a server) Wings calls back into the
# panel (/api/remote/...) inside that same request, so the two deadlock until timeout.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/public"
PHP_CLI_SERVER_WORKERS="${PHP_CLI_SERVER_WORKERS:-6}" nohup php -S "${HOST:-127.0.0.1}:${PORT:-8000}" \
    ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php \
    > "$ROOT/storage/logs/dev-serve.log" 2>&1 &
echo "panel dev server pid $! (log: storage/logs/dev-serve.log)"
