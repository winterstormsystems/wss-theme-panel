// Dev lifecycle check: provision a bot through the v2 admin API, then drive it as a user
// (install -> start -> console -> stats -> files) against a real Wings node.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH);

const base = 'http://127.0.0.1:8000';
const out = process.env.OUT ?? '.';
const eggFile = process.env.EGG;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(`${base}/auth/login`);
await page
    .locator('input[type="text"]')
    .first()
    .fill(process.env.PANEL_USER ?? 'admin');
await page.locator('input[type="password"]').first().fill(process.env.PANEL_PASSWORD);
await page.locator('button[type="submit"]').first().click();
await page.waitForURL((u) => !u.pathname.startsWith('/auth'));

async function api(method, path, data, multipart) {
    const xsrf = decodeURIComponent((await ctx.cookies()).find((c) => c.name === 'XSRF-TOKEN')?.value ?? '');
    const res = await page.request.fetch(`${base}${path}`, {
        method,
        headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrf, 'X-Requested-With': 'XMLHttpRequest' },
        ...(multipart ? { multipart } : data ? { data } : {}),
    });
    const text = await res.text();
    let body;
    try {
        body = JSON.parse(text);
    } catch {
        body = text.slice(0, 300);
    }
    if (!res.ok()) throw new Error(`${method} ${path} -> ${res.status()}: ${JSON.stringify(body).slice(0, 600)}`);
    return body;
}
const attrs = (r) => r?.attributes ?? r?.data?.attributes ?? r?.data ?? r;

// 1. Egg
const eggs = await api('GET', '/api/admin/eggs?per_page=100');
let egg = (eggs.data ?? []).map(attrs).find((e) => e.name === 'WSS Node.js Bot (dev test)');
if (!egg) {
    egg = attrs(
        await api('POST', '/api/admin/eggs/import', null, {
            import_file: { name: 'egg.json', mimeType: 'application/json', buffer: readFileSync(eggFile) },
        })
    );
}
console.log('egg:', egg.id, egg.name);

// 2. Allocation
let allocs = (await api('GET', '/api/admin/nodes/1/allocations?per_page=100')).data.map(attrs);
if (!allocs.some((a) => a.port === 30001)) {
    await api('POST', '/api/admin/nodes/1/allocations', { ip: ['127.0.0.1'], ports: ['30001'] });
    allocs = (await api('GET', '/api/admin/nodes/1/allocations?per_page=100')).data.map(attrs);
}
const alloc = allocs.find((a) => a.port === 30001);
console.log(
    'allocation:',
    alloc.id,
    `${alloc.ip}:${alloc.port}`,
    'assigned:',
    alloc.assigned ?? alloc.server_id ?? null
);

// 3. Server
const servers = (await api('GET', '/api/admin/servers?per_page=100')).data.map(attrs);
let server = servers.find((s) => s.name === 'wss-dev-bot');
if (!server) {
    server = attrs(
        await api('POST', '/api/admin/servers', {
            name: 'wss-dev-bot',
            description: 'Lifecycle test bot',
            owner_id: 1,
            egg_id: egg.id,
            docker_image: 'wss-dev/yolk-node:22',
            startup: 'node {{BOT_FILE}}',
            environment: { BOT_FILE: 'index.js', BOT_NAME: 'wss-dev-bot' },
            memory: 256,
            swap: 0,
            disk: 1024,
            io: 500,
            cpu: 100,
            threads: null,
            oom_disabled: true,
            database_limit: 0,
            allocation_limit: 1,
            backup_limit: 0,
            primary_allocation_id: alloc.id,
        })
    );
}
console.log('server:', server.id, server.uuid, server.identifier);
const id = server.identifier ?? server.uuid.slice(0, 8);
if (process.env.REINSTALL) {
    await api('POST', `/api/client/servers/${id}/settings/reinstall`);
    console.log('reinstall requested');
    await sleep(3000);
}

// 4. Wait for install
for (let i = 0; i < 60; i++) {
    const s = attrs(await api('GET', `/api/client/servers/${id}`));
    if (!s.is_installing && s.status !== 'installing') {
        console.log('install finished; status =', s.status);
        break;
    }
    if (i % 5 === 0) console.log('installing...', s.status);
    await sleep(2000);
}

// 5. Console page, start, command
await page.goto(`${base}/server/${id}`);
await page.waitForLoadState('networkidle');
await api('POST', `/api/client/servers/${id}/power`, { signal: 'start' });
const term = page.locator('.xterm-rows, [class*="terminal"]').first();
for (let i = 0; i < 30; i++) {
    const t = await page.locator('body').innerText();
    if (t.includes('[bot] online') || (await term.innerText().catch(() => '')).includes('[bot] online')) {
        console.log('console shows "[bot] online"');
        break;
    }
    await sleep(1000);
}
await api('POST', `/api/client/servers/${id}/command`, { command: 'ping-from-panel' }).catch((e) =>
    console.log('command:', e.message)
);
await sleep(7000);
const termText = await page.evaluate(() =>
    [...document.querySelectorAll('.xterm-rows > div')].map((d) => d.textContent).join('\n')
);
console.log('--- console tail ---\n' + termText.trim().split('\n').filter(Boolean).slice(-6).join('\n'));
const res = attrs(await api('GET', `/api/client/servers/${id}/resources`));
console.log(
    'resources:',
    JSON.stringify({ state: res.current_state, mem: res.resources?.memory_bytes, cpu: res.resources?.cpu_absolute })
);
await page.screenshot({ path: `${out}/10-console.png` });

// 6. Files
await page.goto(`${base}/server/${id}/files`);
await page.waitForLoadState('networkidle');
await sleep(1500);
const files = (await api('GET', `/api/client/servers/${id}/files/list?directory=%2F`)).data
    .map(attrs)
    .map((f) => f.name);
console.log('files:', files);
await page.screenshot({ path: `${out}/11-files.png` });

// 7. Stop
await api('POST', `/api/client/servers/${id}/power`, { signal: 'stop' });
await sleep(4000);
console.log('after stop:', attrs(await api('GET', `/api/client/servers/${id}/resources`)).current_state);
console.log('page errors:', errors.length ? errors : 'none');
await browser.close();
