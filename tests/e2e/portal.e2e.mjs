// End-to-end walk through every admin and member portal menu against a running
// Worker. Usage: node portal.e2e.mjs [baseUrl]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:8799';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'alghoniy2026@gmail.com';
const ADMIN_PASS = process.env.ADMIN_PASS || '';
const SHOTS = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });

const results = [];
const pass = (name, detail = '') => results.push({ ok: true, name, detail });
const fail = (name, detail = '') => results.push({ ok: false, name, detail });

const ERROR_MARKERS = [
  'Something went wrong',
  'Application error',
  'Internal Server Error',
  'This page could not be found',
  'Sign-in failed',
  'D1_ERROR',
  'Unhandled Runtime Error',
];

async function checkPage(page, name, path, { expectPath } = {}) {
  const res = await page.goto(BASE + path, { waitUntil: 'networkidle' });
  const status = res ? res.status() : 0;
  const text = await page.locator('body').innerText().catch(() => '');
  const marker = ERROR_MARKERS.find((m) => text.includes(m));
  const url = new URL(page.url());
  if (status >= 400) return fail(name, `HTTP ${status} at ${url.pathname}`);
  if (marker) {
    await page.screenshot({ path: `${SHOTS}${name.replace(/\W+/g, '_')}.png`, fullPage: true });
    return fail(name, `error text on page: "${marker}"`);
  }
  if (expectPath && !url.pathname.startsWith(expectPath)) return fail(name, `landed on ${url.pathname}, expected ${expectPath}`);
  pass(name, `${status} ${url.pathname}`);
}

async function revealAdmin(page) {
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  const logo = page.getByRole('button', { name: 'XAA' });
  for (let i = 0; i < 5; i += 1) await logo.click();
  await page.getByText('Admin sign-in').waitFor({ timeout: 5000 });
}

async function adminForm(page) {
  return page.locator('form').filter({ has: page.locator('input[name="next"][value="/portal/admin"]') });
}

async function logout(page) {
  const btn = page.getByRole('button', { name: /sign out|log out|keluar/i });
  if (await btn.count()) {
    await btn.first().click();
    await page.waitForURL((u) => new URL(u).pathname === '/', { timeout: 15000 }).catch(() => {});
  } else {
    await page.context().clearCookies();
  }
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));
page.on('response', (r) => { if (r.status() >= 500) pageErrors.push(`HTTP ${r.status()} ${r.url()}`); });

try {
  // ── Public pages ─────────────────────────────────────────────────────────
  for (const p of ['/', '/services', '/templates', '/portfolio', '/process', '/care', '/payments', '/capabilities', '/faq', '/about', '/contact', '/login', '/register']) {
    await checkPage(page, `public ${p}`, p);
  }

  // ── Admin sign-in ────────────────────────────────────────────────────────
  await revealAdmin(page);
  pass('admin panel revealed by 5 taps');
  let form = await adminForm(page);

  // Show/hide password toggle.
  await form.locator('input[name="password"]').fill('peek-test');
  await form.getByRole('button', { name: 'Show' }).click();
  const typeShown = await form.locator('input[name="password"]').getAttribute('type');
  await form.getByRole('button', { name: 'Hide' }).click();
  const typeHidden = await form.locator('input[name="password"]').getAttribute('type');
  typeShown === 'text' && typeHidden === 'password'
    ? pass('show/hide password toggle', `${typeShown} → ${typeHidden}`)
    : fail('show/hide password toggle', `${typeShown} → ${typeHidden}`);

  // Wrong password is rejected with the right message.
  await form.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await form.locator('input[name="password"]').fill('definitely-wrong');
  await form.getByRole('button', { name: /Enter studio desk/ }).click();
  await page.getByText('Email or password is incorrect.').waitFor({ timeout: 15000 }).catch(() => {});
  (await page.getByText('Email or password is incorrect.').count())
    ? pass('admin wrong password rejected')
    : fail('admin wrong password rejected', (await page.locator('body').innerText()).slice(0, 200));

  // Correct password.
  if (!ADMIN_PASS) throw new Error('ADMIN_PASS env var not set');
  await revealAdmin(page);
  form = await adminForm(page);
  await form.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await form.locator('input[name="password"]').fill(ADMIN_PASS);
  await form.getByRole('button', { name: /Enter studio desk/ }).click();
  await page.waitForURL((u) => new URL(u).pathname.startsWith('/portal/admin'), { timeout: 15000 }).catch(() => {});
  new URL(page.url()).pathname.startsWith('/portal/admin')
    ? pass('ADMIN LOGIN', page.url())
    : fail('ADMIN LOGIN', `${page.url()} — ${(await page.locator('body').innerText()).slice(0, 300)}`);

  for (const p of ['/portal/admin', '/portal/admin/payments', '/portal/admin/leads', '/portal/admin/settings', '/portal', '/portal/new', '/templates']) {
    await checkPage(page, `admin ${p}`, p, { expectPath: p });
  }
  // Session survives a reload.
  await page.reload({ waitUntil: 'networkidle' });
  new URL(page.url()).pathname.startsWith('/templates') && !(await page.getByText('Sign in').count() > 5)
    ? pass('admin session survives reload')
    : fail('admin session survives reload', page.url());
  await page.goto(BASE + '/portal/admin', { waitUntil: 'networkidle' });
  await logout(page);
  await page.goto(BASE + '/portal/admin', { waitUntil: 'networkidle' });
  new URL(page.url()).pathname.startsWith('/login')
    ? pass('admin logout clears session')
    : fail('admin logout clears session', page.url());

  // ── Member (client) journey ─────────────────────────────────────────────
  const clientEmail = `client${Date.now()}@example.com`;
  const clientPass = 'client-pass-123';
  await page.goto(BASE + '/register', { waitUntil: 'networkidle' });
  await page.fill('input[name="name"]', 'Test Client');
  await page.fill('input[name="email"]', clientEmail);
  await page.fill('input[name="company"]', 'Test Co');
  await page.fill('input[name="password"]', clientPass);
  await page.fill('input[name="confirm"]', clientPass);
  await page.getByRole('button', { name: /Create account/ }).click();
  await page.waitForURL((u) => new URL(u).pathname.startsWith('/portal'), { timeout: 15000 }).catch(() => {});
  new URL(page.url()).pathname === '/portal'
    ? pass('client register → portal', page.url())
    : fail('client register → portal', `${page.url()} — ${(await page.locator('body').innerText()).slice(0, 300)}`);

  await checkPage(page, 'client /portal', '/portal', { expectPath: '/portal' });
  await checkPage(page, 'client /portal/new', '/portal/new', { expectPath: '/portal/new' });

  // Open a project.
  const firstPackage = page.locator('input[name="package"]').first();
  if (await firstPackage.count()) await firstPackage.check({ force: true });
  await page.fill('input[name="title"]', 'E2E test project');
  await page.locator('input[name="terms"]').check({ force: true });
  await page.locator('form button[type="submit"]').last().click();
  await page.waitForURL(/\/portal\/projects\//, { timeout: 15000 }).catch(() => {});
  const projectUrl = page.url();
  /\/portal\/projects\//.test(projectUrl)
    ? pass('client opens a project', projectUrl)
    : fail('client opens a project', `${projectUrl} — ${(await page.locator('body').innerText()).slice(0, 300)}`);
  if (/\/portal\/projects\//.test(projectUrl)) await checkPage(page, 'client project page', new URL(projectUrl).pathname);

  // Buy a template.
  await page.goto(BASE + '/templates', { waitUntil: 'networkidle' });
  const tplLink = page.locator('a[href^="/templates/"]').first();
  const tplHref = await tplLink.getAttribute('href');
  await checkPage(page, `template detail ${tplHref}`, tplHref);
  const buy = page.getByRole('button', { name: /buy|order|beli|comprar/i }).first();
  if (await buy.count()) {
    await buy.click();
    await page.waitForURL(/\/portal\/orders\//, { timeout: 15000 }).catch(() => {});
    /\/portal\/orders\//.test(page.url())
      ? pass('client buys a template → order page', page.url())
      : fail('client buys a template → order page', `${page.url()} — ${(await page.locator('body').innerText()).slice(0, 300)}`);
    if (/\/portal\/orders\//.test(page.url())) await checkPage(page, 'client order page', new URL(page.url()).pathname);
  } else {
    fail('client buys a template', 'no buy button found');
  }

  await checkPage(page, 'client /portal lists work', '/portal', { expectPath: '/portal' });
  const listed = await page.getByText('E2E test project').count();
  listed ? pass('portal lists the new project') : fail('portal lists the new project');

  // Clients must not reach the admin desk.
  await page.goto(BASE + '/portal/admin', { waitUntil: 'networkidle' });
  !new URL(page.url()).pathname.startsWith('/portal/admin') || (await page.getByText(/not allowed|admins only|forbidden/i).count())
    ? pass('client blocked from admin desk', page.url())
    : fail('client blocked from admin desk', page.url());

  await logout(page);

  // Client signs back in through the normal form.
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  const clientForm = page.locator('form').filter({ has: page.locator('input[name="next"]:not([value="/portal/admin"])') }).first();
  await clientForm.locator('input[name="email"]').fill(clientEmail);
  await clientForm.locator('input[name="password"]').fill(clientPass);
  await clientForm.getByRole('button', { name: /^Sign in$/ }).click();
  await page.waitForURL((u) => new URL(u).pathname.startsWith('/portal'), { timeout: 15000 }).catch(() => {});
  new URL(page.url()).pathname.startsWith('/portal')
    ? pass('CLIENT LOGIN', page.url())
    : fail('CLIENT LOGIN', `${page.url()} — ${(await page.locator('body').innerText()).slice(0, 300)}`);
  await logout(page);

  // ── Admin sees the client's work ────────────────────────────────────────
  await revealAdmin(page);
  form = await adminForm(page);
  await form.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await form.locator('input[name="password"]').fill(ADMIN_PASS);
  await form.getByRole('button', { name: /Enter studio desk/ }).click();
  await page.waitForURL((u) => new URL(u).pathname.startsWith('/portal/admin'), { timeout: 15000 }).catch(() => {});
  await checkPage(page, 'admin desk after client activity', '/portal/admin', { expectPath: '/portal/admin' });
  (await page.getByText('E2E test project').count())
    ? pass('admin desk shows client project')
    : fail('admin desk shows client project');
  if (/\/portal\/projects\//.test(projectUrl)) await checkPage(page, 'admin opens client project', new URL(projectUrl).pathname);
} catch (e) {
  fail('script aborted', e.message);
  await page.screenshot({ path: `${SHOTS}aborted.png`, fullPage: true }).catch(() => {});
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  — ' + r.detail : ''}`);
if (pageErrors.length) {
  console.log('\nBrowser-side errors / 5xx:');
  for (const e of [...new Set(pageErrors)].slice(0, 20)) console.log('  ' + e);
}
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
