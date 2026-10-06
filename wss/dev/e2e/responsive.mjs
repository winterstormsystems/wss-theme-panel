// Screenshots the WSS shell at representative widths and reports layout problems.
// Usage: node responsive.mjs [bot identifier]   (env: PW_PATH, OUT, PANEL_USER, PANEL_PASSWORD)
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH);

const base = 'http://127.0.0.1:8000';
const out = process.env.OUT ?? '.';
const bot = process.argv[2];
const viewports = [
    ['desktop', 1440, 900],
    ['laptop', 1280, 800],
    ['tablet', 820, 1180],
    ['mobile', 390, 844],
];

const browser = await chromium.launch();
const issues = [];
const consoleMessages = [];

for (const [name, width, height] of viewports) {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on(
        'console',
        (m) => ['error', 'warning'].includes(m.type()) && consoleMessages.push(`[${name}] ${m.type()}: ${m.text()}`)
    );
    page.on('pageerror', (e) => consoleMessages.push(`[${name}] pageerror: ${e}`));
    page.on('response', (r) => r.status() >= 400 && consoleMessages.push(`[${name}] HTTP ${r.status()} ${r.url()}`));

    await page.goto(`${base}/auth/login`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${out}/${name}-login.png` });
    await page
        .locator('input[type="text"]')
        .first()
        .fill(process.env.PANEL_USER ?? 'admin');
    await page.locator('input[type="password"]').first().fill(process.env.PANEL_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL((u) => !u.pathname.startsWith('/auth'));
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const pages = [['dashboard', '/']];
    if (bot) pages.push(['bot-console', `/server/${bot}`], ['bot-files', `/server/${bot}/files`]);
    pages.push(['account', '/account']);

    for (const [label, path] of pages) {
        if (path !== '/') {
            await page.goto(`${base}${path}`);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1500);
        }
        await page.screenshot({ path: `${out}/${name}-${label}.png`, fullPage: true });
        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        if (overflow > 0) issues.push(`${name} ${label}: horizontal overflow ${overflow}px`);
    }

    await page.goto(`${base}/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const card = page.locator('a[href^="/server/"]').first();
    if (await card.count()) await card.screenshot({ path: `${out}/${name}-bot-card.png` });

    await ctx.close();
    // Core limits websocket tokens to 5 per minute; each bot page requests one.
    if (bot) await new Promise((resolve) => setTimeout(resolve, 30000));
}

console.log('layout issues:', issues.length ? issues : 'none');
console.log('console/network problems:', consoleMessages.length ? consoleMessages : 'none');
await browser.close();
