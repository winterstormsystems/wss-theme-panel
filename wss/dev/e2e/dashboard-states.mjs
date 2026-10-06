// Screenshots the dashboard's loading, error and empty states for a given user.
// Usage: PANEL_USER=… PANEL_PASSWORD=… node dashboard-states.mjs   (env: PW_PATH, OUT)
// The error state is produced by failing the overview's own request in the browser only.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH);

const base = 'http://127.0.0.1:8000';
const out = process.env.OUT ?? '.';
const user = process.env.PANEL_USER ?? 'admin';
const browser = await chromium.launch();
const errors = [];

async function login(page) {
    await page.goto(`${base}/auth/login`);
    await page.locator('input[type="text"]').first().fill(user);
    await page.locator('input[type="password"]').first().fill(process.env.PANEL_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL((u) => !u.pathname.startsWith('/auth'));
}

for (const [variant, width] of [
    ['desktop', 1440],
    ['mobile', 390],
]) {
    const page = await (await browser.newContext({ viewport: { width, height: 900 } })).newPage();
    page.on('pageerror', (e) => errors.push(String(e)));
    await login(page);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}/${variant}-${user}-dashboard.png`, fullPage: true });

    // Error state: only the WSS overview request (per_page=1) fails.
    await page.route(/\/api\/client\?.*per_page=1/, (route) => route.fulfill({ status: 500, body: '{"errors":[]}' }));
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${out}/${variant}-${user}-overview-error.png`, fullPage: true });
    const retry = page.getByRole('button', { name: 'Retry' });
    console.log(`${variant}: error state shows Retry button:`, (await retry.count()) > 0);
    await page.unroute(/\/api\/client\?.*per_page=1/);

    // Loading state: hold the overview request.
    await page.route(/\/api\/client\?.*per_page=1/, () => {});
    await page.reload();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}/${variant}-${user}-overview-loading.png` });
    await page.close();
}
console.log('page errors:', errors.length ? errors : 'none');
await browser.close();
