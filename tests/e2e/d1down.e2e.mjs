// With D1 throwing its quota error on every query: admin sign-in must still
// work, and data pages must show the explanatory boundary, not a crash.
import { chromium } from 'playwright-core';

const BASE = process.argv[2] || 'http://localhost:8799';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await (await browser.newContext()).newPage();
const out = [];
const log = (ok, name, d = '') => out.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${d ? '  — ' + d : ''}`);

const health = await (await page.request.get(BASE + '/api/health')).json();
log(health.signInReady === true, 'health: signInReady with D1 down', JSON.stringify(health.session));
log(health.d1 && health.d1.ok === false, 'health: reports D1 down', (health.d1?.error || '').slice(0, 80));

await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
for (let i = 0; i < 5; i += 1) await page.getByRole('button', { name: 'XAA' }).click();
const form = page.locator('form').filter({ has: page.locator('input[name="next"][value="/portal/admin"]') });
await form.locator('input[name="email"]').fill(process.env.ADMIN_EMAIL || 'alghoniy2026@gmail.com');
await form.locator('input[name="password"]').fill(process.env.ADMIN_PASS);
await form.getByRole('button', { name: /Enter studio desk/ }).click();
await page.waitForURL((u) => new URL(u).pathname.startsWith('/portal/admin'), { timeout: 15000 }).catch(() => {});
log(new URL(page.url()).pathname.startsWith('/portal/admin'), 'ADMIN LOGIN with D1 over quota', page.url());

await page.getByText(/daily database limit|not answering|could not load/).first().waitFor({ timeout: 15000 }).catch(() => {});
const body = await page.locator('body').innerText();
log(/Project data is paused until the daily database limit resets/.test(body), 'admin desk shows the quota explanation');
log(/Sign out/.test(body), 'portal chrome (and sign-out) still rendered');
await page.screenshot({ path: new URL('./shots/d1down-admin.png', import.meta.url).pathname, fullPage: true });

await browser.close();
console.log(out.join('\n'));
process.exit(out.some((l) => l.startsWith('FAIL')) ? 1 : 0);
