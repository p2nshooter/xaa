// The Company menu switch (docs/BLUEPRINT.md §11, request 60) against a running Worker.
// Usage: ADMIN_PASS=… node company.e2e.mjs [baseUrl]
//
// Proves: hidden by default (no menu or footer link, /company is a 404, not in the sitemap or
// llms.txt); the Studio desk switch shows it everywhere and the change is in the audit log;
// switching back hides it again. No page throws.
import { chromium } from 'playwright-core';

const BASE = process.argv[2] || 'http://localhost:8799';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'alghoniy2026@gmail.com';
const ADMIN_PASS = process.env.ADMIN_PASS || '';
if (!ADMIN_PASS) throw new Error('ADMIN_PASS env var not set');

const out = [];
const ok = (c, name, d = '') => out.push(`${c ? 'PASS' : 'FAIL'}  ${name}${d ? '  — ' + d : ''}`);
const errors = [];

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const admin = await (await browser.newContext()).newPage();
const visitor = await (await browser.newContext()).newPage();
for (const [tag, p] of [['admin', admin], ['visitor', visitor]]) p.on('pageerror', (e) => errors.push(`${tag} ${p.url()}: ${e.message}`));

/** What a visitor sees: the /company status, a Company link in the header or footer, the sitemap and llms.txt. */
async function publicState() {
  const res = await visitor.goto(BASE + '/company', { waitUntil: 'networkidle' });
  await visitor.goto(BASE + '/faq', { waitUntil: 'networkidle' });
  const links = await visitor.locator('a[href="/company"]').count();
  const sitemap = await (await fetch(BASE + '/sitemap.xml')).text();
  const llms = await (await fetch(BASE + '/llms.txt')).text();
  return { status: res?.status() ?? 0, links, inSitemap: /xaa\.es\/company[?<"]/.test(sitemap), inLlms: /xaa\.es\/company\)/.test(llms) };
}

let s = await publicState();
ok(s.status === 404 && s.links === 0 && !s.inSitemap && !s.inLlms, 'hidden by default', JSON.stringify(s));

// Studio desk sign-in (the admin form appears after five taps on the logo).
await admin.goto(BASE + '/login', { waitUntil: 'networkidle' });
for (let i = 0; i < 5; i += 1) await admin.getByRole('button', { name: 'XAA' }).click();
const form = admin.locator('form').filter({ has: admin.locator('input[name="next"][value="/portal/admin"]') });
await form.locator('input[name="email"]').fill(ADMIN_EMAIL);
await form.locator('input[name="password"]').fill(ADMIN_PASS);
await form.getByRole('button', { name: /Enter studio desk/ }).click();
await admin.waitForURL((u) => new URL(u).pathname.startsWith('/portal/admin'), { timeout: 20000 });
await admin.goto(BASE + '/portal/admin', { waitUntil: 'networkidle' });
const sw = admin.locator('[data-testid=company-visibility]');
ok(/hidden/i.test(await sw.locator('.badge').innerText()), 'Studio desk shows the switch as Hidden');

await sw.locator('button[type=submit]').click();
await admin.locator('[data-testid=company-visibility] [role=status]').waitFor({ timeout: 30000 }).catch(() => {});
s = await publicState();
ok(s.status === 200 && s.links >= 2 && s.inSitemap && s.inLlms, 'shown → page, menu + footer links, sitemap, llms.txt', JSON.stringify(s));
await admin.goto(BASE + '/portal/admin', { waitUntil: 'networkidle' });
ok(/shown/i.test(await admin.locator('[data-testid=company-visibility] .badge').innerText()), 'Studio desk shows the switch as Shown');
ok((await admin.locator('[data-testid=company-visibility-log] li').count()) > 0, 'the change is in the audit log');

await admin.locator('[data-testid=company-visibility] button[type=submit]').click();
await admin.locator('[data-testid=company-visibility] [role=status]').waitFor({ timeout: 30000 }).catch(() => {});
s = await publicState();
ok(s.status === 404 && s.links === 0 && !s.inSitemap && !s.inLlms, 'hidden again', JSON.stringify(s));
ok(errors.length === 0, 'no page errors', errors.join(' | '));

await browser.close();
console.log(out.join('\n'));
const f = out.filter((l) => l.startsWith('FAIL')).length;
console.log(`\n${out.length - f}/${out.length} passed`);
process.exit(f ? 1 : 0);
