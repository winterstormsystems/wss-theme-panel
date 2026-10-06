// Usage: node power.mjs <server identifier> <start|stop|restart|kill>
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH);
const [id, signal] = process.argv.slice(2);
const base = 'http://127.0.0.1:8000';

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.goto(`${base}/auth/login`);
await page.locator('input[type="text"]').first().fill(process.env.PANEL_USER ?? 'admin');
await page.locator('input[type="password"]').first().fill(process.env.PANEL_PASSWORD);
await page.locator('button[type="submit"]').first().click();
await page.waitForURL((u) => !u.pathname.startsWith('/auth'));
const xsrf = decodeURIComponent((await ctx.cookies()).find((c) => c.name === 'XSRF-TOKEN').value);
const headers = { Accept: 'application/json', 'X-XSRF-TOKEN': xsrf };
const r = await page.request.post(`${base}/api/client/servers/${id}/power`, { headers, data: { signal } });
console.log(signal, '->', r.status());
await new Promise((res) => setTimeout(res, 4000));
const s = await page.request.get(`${base}/api/client/servers/${id}/resources`, { headers });
console.log('state:', (await s.json()).attributes.current_state);
await browser.close();
