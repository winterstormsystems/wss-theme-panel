// Smoke test: log into the dev panel and capture the dashboard + admin area.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH);

const base = process.env.BASE ?? 'http://127.0.0.1:8000';
const out = process.env.OUT ?? '.';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

await page.goto(`${base}/auth/login`);
await page.waitForLoadState('networkidle');
await page.screenshot({ path: `${out}/01-login.png` });
await page
    .locator('input[name="username"], input[type="text"]')
    .first()
    .fill(process.env.PANEL_USER ?? 'admin');
await page.locator('input[type="password"]').first().fill(process.env.PANEL_PASSWORD);
await page.locator('button[type="submit"]').first().click();
await page.waitForURL((u) => !u.pathname.startsWith('/auth'), { timeout: 15000 });
await page.waitForLoadState('networkidle');
await page.screenshot({ path: `${out}/02-dashboard.png` });
console.log('after login:', page.url(), '| title:', await page.title());

for (const path of process.argv.slice(2)) {
    await page.goto(`${base}${path}`);
    await page.waitForLoadState('networkidle');
    const name = path.replace(/[^a-z0-9]+/gi, '_');
    await page.screenshot({ path: `${out}/page${name}.png` });
    console.log('visited', path, '->', page.url());
}
console.log('console/page errors:', errors.length ? errors : 'none');
await browser.close();
