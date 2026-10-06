// Creates real content for the bot management pages through the client API (as the owner):
// a backup, a schedule with a command task, a database, and a small bot file tree. Idempotent by name. Needs the
// admin to have raised the bot's backup/database limits and a database host on its node.
// Usage: node seed-content.mjs <bot identifier>   (env: PW_PATH, PANEL_USER, PANEL_PASSWORD)
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH);

const base = 'http://127.0.0.1:8000';
const bot = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.goto(`${base}/auth/login`);
await page.locator('input[type="text"]').first().fill(process.env.PANEL_USER ?? 'admin');
await page.locator('input[type="password"]').first().fill(process.env.PANEL_PASSWORD);
await page.locator('button[type="submit"]').first().click();
await page.waitForURL((u) => !u.pathname.startsWith('/auth'));

async function api(method, path, data) {
    const xsrf = decodeURIComponent((await ctx.cookies()).find((c) => c.name === 'XSRF-TOKEN').value);
    const res = await page.request.fetch(`${base}/api/client/servers/${bot}${path}`, {
        method,
        headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrf },
        ...(data ? { data } : {}),
    });
    const body = res.status() === 204 ? null : await res.json().catch(() => null);
    return { status: res.status(), body };
}

const names = (list) => (list.body?.data ?? []).map((item) => item.attributes.name);

if (!names(await api('GET', '/backups')).includes('Before update')) {
    console.log('backup', (await api('POST', '/backups', { name: 'Before update', is_locked: false })).status);
}

const schedules = await api('GET', '/schedules');
if (!names(schedules).includes('Nightly restart')) {
    const created = await api('POST', '/schedules', {
        name: 'Nightly restart',
        minute: '0',
        hour: '4',
        day_of_month: '*',
        month: '*',
        day_of_week: '*',
        is_active: true,
        only_when_online: true,
    });
    console.log('schedule', created.status);
    const id = created.body?.attributes?.id;
    if (id) {
        console.log(
            'task',
            (await api('POST', `/schedules/${id}/tasks`, { action: 'command', payload: 'say Restarting in 1 minute', time_offset: 0 }))
                .status
        );
        console.log(
            'task',
            (await api('POST', `/schedules/${id}/tasks`, { action: 'power', payload: 'restart', time_offset: 60 })).status
        );
    }
}

const databases = await api('GET', '/databases');
if (!(databases.body?.data ?? []).some((db) => db.attributes.name.endsWith('_botdata'))) {
    console.log('database', (await api('POST', '/databases', { database: 'botdata', remote: '%' })).status);
}

// A small, typical bot file tree (written through Wings like any upload; skipped if present).
const listing = await api('GET', '/files/list?directory=%2F');
const existing = new Set((listing.body?.data ?? []).map((f) => f.attributes.name));
if (!existing.has('config')) console.log('folder', (await api('POST', '/files/create-folder', { root: '/', name: 'config' })).status);
const files = {
    '/package.json': JSON.stringify({ name: 'wss-dev-bot', version: '1.0.0', main: 'index.js', private: true }, null, 2),
    '/README.md': '# wss-dev-bot\n\nLifecycle test bot for the WSS panel.\n',
    '/config/settings.yml': 'prefix: "!"\nlog_level: info\n',
    '/.env.example': 'BOT_TOKEN=\n',
};
for (const [path, content] of Object.entries(files)) {
    const name = path.split('/').pop();
    if (path.startsWith('/config/') || !existing.has(name)) {
        const xsrf = decodeURIComponent((await ctx.cookies()).find((c) => c.name === 'XSRF-TOKEN').value);
        const res = await page.request.post(
            `${base}/api/client/servers/${bot}/files/write?file=${encodeURIComponent(path)}`,
            { headers: { 'X-XSRF-TOKEN': xsrf, 'Content-Type': 'text/plain' }, data: content }
        );
        console.log('file', path, res.status());
    }
}

await browser.close();
