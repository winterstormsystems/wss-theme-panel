// Captures the customer UI screenshot set and sweeps every customer page at several widths for
// horizontal overflow and console/network errors.
// Usage: node screens.mjs <bot identifier>   (env: PW_PATH, OUT, PANEL_USER, PANEL_PASSWORD;
//        optional EMPTY_USER / EMPTY_PASSWORD for an account without bots)
// Bot pages are reached by in-app navigation, so each session uses one WebSocket token (core
// allows five per minute); sessions are paced accordingly.
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

const botSections = [
    ['Overview', 'overview'],
    ['Console', 'console'],
    ['Files', 'files'],
    ['Runtime', 'runtime'],
    ['Network', 'network'],
    ['Backups', 'backups'],
    ['Schedules', 'schedules'],
    ['Databases', 'databases'],
    ['Team Access', 'team-access'],
    ['Settings', 'settings'],
    ['Activity', 'activity'],
];
const accountPages = [
    ['/account', 'account'],
    ['/account/api', 'account-api'],
    ['/account/ssh', 'account-ssh'],
    ['/account/activity', 'account-activity'],
];

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

async function checkOverflow(page, tag, name) {
    const x = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (x > 0) overflow.push(`${tag} ${name}: ${x}px`);
}

async function shot(page, tag, name, { fullPage = false, wait = 1500 } = {}) {
    await page.waitForTimeout(wait);
    await checkOverflow(page, tag, name);
    if (name) await page.screenshot({ path: `${out}/${name}.png`, fullPage });
}

async function goto(page, path) {
    await page.goto(`${base}${path}`);
    await page.waitForLoadState('networkidle');
}

/** Opens a bot section from the sidebar (desktop) or the section tabs (below lg). */
async function openSection(page, label) {
    const sidebar = page.locator('#wss-sidebar');
    const nav = (await sidebar.isVisible()) && (await page.viewportSize()).width >= 1024
        ? sidebar
        : page.getByRole('navigation', { name: 'Bot sections' });
    await nav.getByRole('link', { name: label, exact: true }).click();
    await page.waitForLoadState('networkidle');
}

// Logged-out login pages
for (const [name, width, height] of [
    ['01-login-desktop', 1440, 900],
    ['02-login-mobile', 390, 844],
]) {
    const page = await (await browser.newContext({ viewport: { width, height } })).newPage();
    await goto(page, '/auth/login');
    await shot(page, `${width}px`, name, { wait: 500 });
    await page.close();
}

// Desktop: every page
{
    const { ctx, page, tag } = await session(1440, 900);
    await shot(page, tag, '03-my-bots-desktop');
    if (bot) {
        await goto(page, `/server/${bot}/overview`);
        let index = 4;
        for (const [label, slug] of botSections) {
            if (label !== 'Overview') await openSection(page, label);
            const name = `${String(index++).padStart(2, '0')}-${slug}-desktop`;
            await shot(page, tag, name, { fullPage: true, wait: label === 'Console' ? 3000 : 1500 });
        }
    }
    for (const [path, slug] of accountPages) {
        await goto(page, path);
        await shot(page, tag, `x-${slug}-desktop`, { fullPage: true });
    }
    await ctx.close();
}

// Mobile set
if (bot) await sleep(15000);
{
    const { ctx, page, tag } = await session(390, 844);
    await shot(page, tag, '20-my-bots-mobile', { fullPage: true });
    if (bot) {
        await goto(page, `/server/${bot}`);
        await page.getByRole('button', { name: 'Open navigation' }).click();
        await shot(page, tag, '21-bot-navigation-mobile', { wait: 600 });
        await page.keyboard.press('Escape');
        await shot(page, tag, '22-console-mobile', { fullPage: true, wait: 2500 });
        await openSection(page, 'Backups');
        await shot(page, tag, '23-backups-mobile', { fullPage: true });
        await openSection(page, 'Team Access');
        await shot(page, tag, 'x-team-access-mobile', { fullPage: true });
        await openSection(page, 'Network');
        await shot(page, tag, 'x-network-mobile', { fullPage: true });
    }
    await goto(page, '/account');
    await shot(page, tag, '24-account-mobile', { fullPage: true });
    await ctx.close();
}

// Overflow sweep at the remaining widths (no screenshots)
for (const [width, height] of [
    [1280, 800],
    [1024, 768],
    [820, 1180],
    [768, 1024],
    [430, 932],
]) {
    if (bot) await sleep(15000);
    const { ctx, page, tag } = await session(width, height);
    await shot(page, tag, null, { wait: 800 });
    if (bot) {
        await goto(page, `/server/${bot}/overview`);
        for (const [label] of botSections) {
            if (label !== 'Overview') await openSection(page, label);
            await page.waitForTimeout(900);
            await checkOverflow(page, tag, label);
        }
    }
    for (const [path, slug] of accountPages) {
        await goto(page, path);
        await checkOverflow(page, tag, slug);
    }
    await ctx.close();
}

// Empty account
if (process.env.EMPTY_USER) {
    const { ctx, page, tag } = await session(1440, 900, process.env.EMPTY_USER, process.env.EMPTY_PASSWORD);
    await shot(page, tag, '25-empty-account');
    await ctx.close();
}

console.log('horizontal overflow:', overflow.length ? overflow : 'none');
console.log('console/network problems:', problems.length ? problems : 'none');
await browser.close();
