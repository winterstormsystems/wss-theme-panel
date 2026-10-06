// Permission check: grants a limited subuser (console + file read only) through the client
// API, then verifies the WSS shell shows only what core permissions allow.
// Usage: node permissions.mjs <bot identifier> <subuser email>
//   env: PW_PATH, OUT, PANEL_PASSWORD (owner/admin), SUBUSER_USER, SUBUSER_PASSWORD
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH);

const base = 'http://127.0.0.1:8000';
const [bot, email] = process.argv.slice(2);
const browser = await chromium.launch();
const results = [];

async function login(user, password) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(`${base}/auth/login`);
    await page.locator('input[type="text"]').first().fill(user);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL((u) => !u.pathname.startsWith('/auth'));
    return { ctx, page };
}

async function api(ctx, page, method, path, data) {
    const xsrf = decodeURIComponent((await ctx.cookies()).find((c) => c.name === 'XSRF-TOKEN').value);
    return page.request.fetch(`${base}${path}`, {
        method,
        headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrf },
        ...(data ? { data } : {}),
    });
}

// 1. Owner grants a limited subuser (idempotent: reuse an existing grant).
const owner = await login(process.env.PANEL_USER ?? 'admin', process.env.PANEL_PASSWORD);
const permissions = ['websocket.connect', 'file.read', 'file.read-content'];
const list = await (await api(owner.ctx, owner.page, 'GET', `/api/client/servers/${bot}/users`)).json();
let existing = list.data.find((u) => u.attributes.email === email);
if (!existing) {
    const res = await api(owner.ctx, owner.page, 'POST', `/api/client/servers/${bot}/users`, { email, permissions });
    results.push(`grant subuser -> ${res.status()}`);
    existing = (await res.json());
} else {
    const res = await api(owner.ctx, owner.page, 'POST', `/api/client/servers/${bot}/users/${existing.attributes.uuid}`, { permissions });
    results.push(`update subuser -> ${res.status()}`);
}
await owner.ctx.close();

// 2. Subuser view.
const sub = await login(process.env.SUBUSER_USER, process.env.SUBUSER_PASSWORD);
await sub.page.goto(`${base}/server/${bot}`);
await sub.page.waitForLoadState('networkidle');
await sub.page.waitForTimeout(2500);
const links = await sub.page.locator('#wss-sidebar nav').last().getByRole('link').allInnerTexts();
const powerButtons = await sub.page.getByRole('button', { name: /^(Start|Stop|Restart|Kill)$/ }).count();
await sub.page.screenshot({ path: `${process.env.OUT ?? '.'}/permissions-subuser.png` });
const settings = await sub.page.goto(`${base}/server/${bot}/settings`).then(() => sub.page.waitForTimeout(1500)).then(() => sub.page.locator('#wss-main').innerText());

// Direct URLs to sections the subuser may not use: core's route guard must still deny them,
// and no management control may render.
const controls = /^(New allocation|New backup|New database|New schedule|Invite member|Make Primary|Save|Reinstall Bot|Start|Restart|Stop|Kill)$/;
for (const section of ['network', 'backups', 'schedules', 'databases', 'users', 'startup', 'activity']) {
    await sub.page.goto(`${base}/server/${bot}/${section}`);
    await sub.page.waitForTimeout(1500);
    const main = await sub.page.locator('#wss-main').innerText();
    const visible = (await sub.page.locator('#wss-main').getByRole('button').allInnerTexts()).filter((t) => controls.test(t.trim()));
    results.push(`direct /${section}: ${/Access denied|permission/i.test(main) ? 'denied' : 'RENDERED'}; management controls: ${visible.length ? visible.join(', ') : 'none'}`);
}
await sub.page.screenshot({ path: `${process.env.OUT ?? '.'}/permissions-subuser-denied.png` });

// Read-only file access: the editor opens, shows "Read only" and offers no save.
await sub.page.goto(`${base}/server/${bot}/files/edit#/index.js`);
await sub.page.waitForTimeout(2500);
const editorText = await sub.page.locator('#wss-main').innerText();
const saveButtons = await sub.page.locator('#wss-main').getByRole('button', { name: /^(Save|Create file|Save Content)$/ }).count();
results.push(`editor read-only badge: ${/Read only/.test(editorText)}; save buttons: ${saveButtons}`);
const schedulesText = await sub.page
    .goto(`${base}/server/${bot}/schedules/1`)
    .then(() => sub.page.waitForTimeout(1500))
    .then(() => sub.page.locator('#wss-main').innerText());
results.push(`direct schedule detail: ${/Access denied|permission/i.test(schedulesText) ? 'denied' : 'RENDERED'}`);

results.push(`subuser bot sections: ${links.join(', ')}`);
results.push(`subuser power buttons visible: ${powerButtons}`);
results.push(`settings page shows rename/reinstall: ${/Bot Details|Reinstall Bot/.test(settings)}`);
console.log(results.join('\n'));
await browser.close();
