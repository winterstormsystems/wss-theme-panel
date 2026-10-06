// UI regression: drives the panel like a customer and checks the live WebSocket traffic.
// Usage: node regression.mjs <bot name>   (env: PW_PATH, OUT, PANEL_USER, PANEL_PASSWORD)
// Expects the bot to be stopped first. The console renders to a canvas, so console output,
// status and stats are verified from the WebSocket frames the page itself receives.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH);

const base = 'http://127.0.0.1:8000';
const out = process.env.OUT ?? '.';
const botName = process.argv[2] ?? 'wss-dev-bot';
const results = [];
const problems = [];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => problems.push(`pageerror: ${e}`));
page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
page.on('response', (r) => r.status() >= 400 && problems.push(`HTTP ${r.status()} ${r.url()}`));

const frames = [];
page.on('websocket', (ws) =>
    ws.on('framereceived', ({ payload }) => {
        try {
            frames.push({ at: Date.now(), ...JSON.parse(String(payload)) });
        } catch {}
    })
);

async function step(name, fn) {
    try {
        const detail = await fn();
        results.push(`PASS ${name}${detail ? ` (${detail})` : ''}`);
    } catch (error) {
        results.push(`FAIL ${name}: ${error.message.split('\n')[0]}`);
    }
}

async function waitFrame(predicate, timeout, since = 0) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
        const frame = frames.find((f) => f.at >= since && predicate(f));
        if (frame) return frame;
        await page.waitForTimeout(250);
    }
    throw new Error('expected websocket frame not received');
}
const status = (value) => (f) => f.event === 'status' && f.args?.[0] === value;
const output = (text) => (f) => f.event === 'console output' && String(f.args?.[0]).includes(text);

await step('login', async () => {
    await page.goto(`${base}/auth/login`);
    await page
        .locator('input[type="text"]')
        .first()
        .fill(process.env.PANEL_USER ?? 'admin');
    await page.locator('input[type="password"]').first().fill(process.env.PANEL_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL((u) => !u.pathname.startsWith('/auth'), { timeout: 15000 });
});

await step('dashboard shows the bot card', async () => {
    await page.getByRole('link', { name: botName }).waitFor({ timeout: 15000 });
    await page.getByRole('heading', { name: 'My Bots' }).waitFor();
});

await step('bot page opens from the card', async () => {
    await page.getByRole('link', { name: botName }).click();
    await page.waitForURL(/\/server\/[a-z0-9]+$/);
    await waitFrame((f) => f.event === 'auth success', 15000);
    return 'websocket authenticated';
});

let startedAt = 0;
await step('start (button)', async () => {
    startedAt = Date.now();
    await page.getByRole('button', { name: 'Start', exact: true }).click();
    await waitFrame(status('running'), 60000, startedAt);
});

await step('live console output', async () => {
    const frame = await waitFrame(output('[bot] online'), 30000, startedAt);
    return String(frame.args[0]).trim();
});

await step('live CPU/RAM stats', async () => {
    const frame = await waitFrame(
        (f) => f.event === 'stats' && JSON.parse(f.args[0]).memory_bytes > 0,
        30000,
        startedAt
    );
    const stats = JSON.parse(frame.args[0]);
    return `cpu ${stats.cpu_absolute}%, memory ${(stats.memory_bytes / 1048576).toFixed(1)} MiB`;
});

await step('console command', async () => {
    const sentAt = Date.now();
    const input = page.getByPlaceholder(/Type a command/i);
    await input.fill('wss-regression-ping');
    await input.press('Enter');
    await waitFrame(output('received command: wss-regression-ping'), 15000, sentAt);
});
await page.screenshot({ path: `${out}/regression-console.png` });

await step('restart (button)', async () => {
    const restartAt = Date.now();
    await page.getByRole('button', { name: 'Restart', exact: true }).click();
    await waitFrame((f) => f.event === 'status' && ['stopping', 'offline'].includes(f.args?.[0]), 30000, restartAt);
    await waitFrame(status('running'), 60000, restartAt);
});

await step('stop (button)', async () => {
    const stopAt = Date.now();
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
    await waitFrame(status('offline'), 45000, stopAt);
    await waitFrame(output('[bot] shutting down'), 5000, stopAt).catch(() => {});
});

await step('file manager lists files', async () => {
    await page.getByRole('link', { name: 'Files', exact: true }).click();
    await page.getByText('index.js', { exact: true }).waitFor({ timeout: 15000 });
});
await page.screenshot({ path: `${out}/regression-files.png` });

await step('account navigation', async () => {
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Account' }).click();
    await page.waitForURL(/\/account$/);
});

await step('dashboard navigation', async () => {
    await page.getByRole('link', { name: 'My Bots' }).click();
    await page.getByRole('link', { name: botName }).waitFor({ timeout: 15000 });
});

await step('logout', async () => {
    await page.getByRole('button', { name: /Open account menu/ }).click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await page.waitForURL(/\/auth\/login/, { timeout: 15000 });
});

console.log(results.join('\n'));
console.log('browser problems:', problems.length ? problems : 'none');
await browser.close();
process.exitCode = results.some((r) => r.startsWith('FAIL')) ? 1 : 0;
