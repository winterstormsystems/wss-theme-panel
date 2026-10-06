// Verifies the WSS extension bundle and theme stylesheet are served and loaded by the SPA.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH);
const base = 'http://127.0.0.1:8000';
const out = process.env.OUT ?? '.';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const loaded = [];
const errors = [];
page.on(
    'response',
    (r) => /extensions\/wss|assets\/theme/.test(r.url()) && loaded.push(`${r.status()} ${new URL(r.url()).pathname}`)
);
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(`${base}/auth/login`);
await page.waitForLoadState('networkidle');
await page.screenshot({ path: `${out}/20-login-themed.png` });
await page
    .locator('input[type="text"]')
    .first()
    .fill(process.env.PANEL_USER ?? 'admin');
await page.locator('input[type="password"]').first().fill(process.env.PANEL_PASSWORD);
await page.locator('button[type="submit"]').first().click();
await page.waitForURL((u) => !u.pathname.startsWith('/auth'));
await page.waitForLoadState('networkidle');
await page.screenshot({ path: `${out}/21-dashboard-themed.png` });

const status = await page.request.get(`${base}/api/client/extensions/wss/status`, {
    headers: { Accept: 'application/json' },
});
console.log('GET /api/client/extensions/wss/status ->', status.status(), await status.text());
const tokens = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
        primary: cs.getPropertyValue('--primary').trim(),
        themeColor: cs.getPropertyValue('--theme-color').trim(),
        dark: document.documentElement.classList.contains('dark'),
    };
});
console.log('live tokens:', JSON.stringify(tokens));
console.log('wss/theme requests:', loaded.length ? loaded : 'none');
console.log('page errors:', errors.length ? errors : 'none');
await browser.close();
