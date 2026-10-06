// Captures the customer UI screenshot set at several widths and reports overflow and errors.
// Usage: node screens.mjs <bot identifier>   (env: PW_PATH, OUT, PANEL_USER, PANEL_PASSWORD;
//        optional EMPTY_USER / EMPTY_PASSWORD for an account without bots)
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH);

const base = 'http://127.0.0.1:8000';
const out = process.env.OUT ?? '.';
const bot = process.argv[2];
const problems = [];
const overflow = [];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await chromium.launch();

async function session(width, height, user = process.env.PANEL_USER ?? 'admin', password = process.env.PANEL_PASSWORD) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const page = await ctx.newPage();
    const tag = `${width}px`;
    page.on('console', (m) => ['error', 'warning'].includes(m.type()) && problems.push(`[${tag}] ${m.type()}: ${m.text()}`));
    page.on('pageerror', (e) => problems.push(`[${tag}] pageerror: ${e}`));
    page.on('response', (r) => r.status() >= 400 && problems.push(`[${tag}] HTTP ${r.status()} ${r.url()}`));
    await page.goto(`${base}/auth/login`);
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="text"]').first().fill(user);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL((u) => !u.pathname.startsWith('/auth'));
    await page.waitForLoadState('networkidle');
    return { ctx, page, tag };
}

async function shot(page, tag, name, path, { fullPage = false, wait = 1500 } = {}) {
    if (path) {
        await page.goto(`${base}${path}`);
        await page.waitForLoadState('networkidle');
    }
    await page.waitForTimeout(wait);
    await page.screenshot({ path: `${out}/${name}.png`, fullPage });
    const x = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (x > 0) overflow.push(`${tag} ${name}: ${x}px`);
}

// Logged-out login pages
for (const [name, width, height] of [
    ['01-login-desktop', 1440, 900],
    ['02-login-mobile', 390, 844],
]) {
    const page = await (await browser.newContext({ viewport: { width, height } })).newPage();
    await page.goto(`${base}/auth/login`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${out}/${name}.png` });
    await page.close();
}

// Desktop
{
    const { ctx, page, tag } = await session(1440, 900);
    await shot(page, tag, '03-dashboard-desktop', null);
    if (bot) {
        // One page load, then in-app navigation through the sidebar (one websocket token).
        await shot(page, tag, '05-bot-overview-desktop', `/server/${bot}/overview`);
        const nav = page.locator('#wss-sidebar');
        await nav.getByRole('link', { name: 'Console', exact: true }).click();
        await shot(page, tag, '06-bot-console-desktop', null, { wait: 3000 });
        await nav.getByRole('link', { name: 'Files', exact: true }).click();
        await shot(page, tag, '08-files-desktop', null);
        await nav.getByRole('link', { name: 'Runtime', exact: true }).click();
        await shot(page, tag, '09-runtime-desktop', null);
        await nav.getByRole('link', { name: 'Settings', exact: true }).click();
        await shot(page, tag, '10-settings-desktop', null, { fullPage: true });
        await nav.getByRole('link', { name: 'Account', exact: true }).click();
        await shot(page, tag, 'x-account-desktop', null);
    } else {
        await shot(page, tag, 'x-account-desktop', '/account');
    }
    await ctx.close();
}
await sleep(bot ? 30000 : 0); // core allows 5 websocket tokens per minute

// Laptop and tablet
for (const [width, height] of [
    [1280, 800],
    [820, 1180],
]) {
    const { ctx, page, tag } = await session(width, height);
    await shot(page, tag, `x-dashboard-${width}`, null);
    if (bot) await shot(page, tag, `x-bot-console-${width}`, `/server/${bot}`, { wait: 2500 });
    await ctx.close();
    if (bot) await sleep(20000);
}

// Mobile
{
    const { ctx, page, tag } = await session(390, 844);
    await shot(page, tag, '04-dashboard-mobile', null, { fullPage: true });
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await shot(page, tag, '11-mobile-navigation', null, { wait: 600 });
    await page.keyboard.press('Escape');
    if (bot) {
        await shot(page, tag, '07-bot-console-mobile', `/server/${bot}`, { wait: 3000, fullPage: true });
        await page.getByRole('button', { name: 'Open navigation' }).click();
        await shot(page, tag, 'x-mobile-navigation-bot', null, { wait: 600 });
        await page.keyboard.press('Escape');
        await page.getByRole('navigation', { name: 'Bot sections' }).getByRole('link', { name: 'Files', exact: true }).click();
        await shot(page, tag, 'x-files-mobile', null, { fullPage: true });
    }
    await ctx.close();
}

// Empty account
if (process.env.EMPTY_USER) {
    const { ctx, page, tag } = await session(1440, 900, process.env.EMPTY_USER, process.env.EMPTY_PASSWORD);
    await shot(page, tag, '12-empty-account', null);
    await ctx.close();
}

console.log('horizontal overflow:', overflow.length ? overflow : 'none');
console.log('console/network problems:', problems.length ? problems : 'none');
await browser.close();
