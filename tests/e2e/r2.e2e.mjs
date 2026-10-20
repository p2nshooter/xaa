// End-to-end checks of the R2 data layer against a running Worker whose local D1
// was seeded with the OLD schema and a few records (see docs/BLUEPRINT.md):
// the one-time move, a migrated client signing in, invoice numbering, two
// sign-ups racing on one email, a payment confirmed by the admin, the legacy
// lead and chat, and the Data storage panel (backup, download, restore).
//   ADMIN_PASS='…' node r2.e2e.mjs http://localhost:8799
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:8799';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'alghoniy2026@gmail.com';
const ADMIN_PASS = process.env.ADMIN_PASS || '';
const LEGACY = { email: 'client@example.com', pass: 'client-pass-2026', paymentId: '33333333-3333-4333-8333-333333333333', ref: 'XAA-26ABC12' };
const SHOTS = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });

const out = [];
const ok = (c, name, d = '') => out.push({ ok: Boolean(c), name, d: String(d).slice(0, 240) });
const body = (page) => page.locator('body').innerText();

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errors = [];
const watch = (page) => {
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => { if (r.status() >= 500) errors.push(`HTTP ${r.status()} ${r.url()}`); });
};

async function clientLogin(page, email, pass) {
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  const form = page.locator('form').filter({ has: page.locator('input[name="next"]:not([value="/portal/admin"])') }).first();
  await form.locator('input[name="email"]').fill(email);
  await form.locator('input[name="password"]').fill(pass);
  await form.getByRole('button', { name: /^Sign in$/ }).click();
  await page.waitForURL((u) => new URL(u).pathname.startsWith('/portal'), { timeout: 15000 }).catch(() => {});
}

async function adminLogin(page) {
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  for (let i = 0; i < 5; i += 1) await page.getByRole('button', { name: 'XAA' }).click();
  const form = page.locator('form').filter({ has: page.locator('input[name="next"][value="/portal/admin"]') });
  await form.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await form.locator('input[name="password"]').fill(ADMIN_PASS);
  await form.getByRole('button', { name: /Enter studio desk/ }).click();
  await page.waitForURL((u) => new URL(u).pathname.startsWith('/portal/admin'), { timeout: 15000 }).catch(() => {});
}

async function register(page, email, pass) {
  await page.goto(BASE + '/register', { waitUntil: 'networkidle' });
  await page.fill('input[name="name"]', 'Race Client');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', pass);
  await page.fill('input[name="confirm"]', pass);
}

try {
  // ── 1. The move from D1 ───────────────────────────────────────────────
  const health = await (await fetch(BASE + '/api/health')).json();
  const tables = health.data?.tables ?? {};
  ok(health.data?.migration === 'done' && health.data?.source === 'd1', 'health: D1 → R2 move done', JSON.stringify({ m: health.data?.migration, s: health.data?.source }));
  const short = Object.entries(tables).filter(([, r]) => r.r2 < r.d1);
  ok(Object.keys(tables).length >= 18 && short.length === 0, 'every D1 table fully in R2', short.map(([t, r]) => `${t} ${r.r2}/${r.d1}`).join(', ') || `${Object.keys(tables).length} tables`);
  ok(health.bindings?.DATA_R2 === true, 'DATA bucket bound');

  // ── 2. A client migrated from D1 signs in with their old password ─────
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  watch(page);
  await clientLogin(page, LEGACY.email, LEGACY.pass);
  ok(new URL(page.url()).pathname.startsWith('/portal'), 'migrated client signs in (old password hash)', page.url());
  const portal = await body(page);
  ok(/Legacy project/.test(portal), 'migrated project listed');
  ok(/Waitlist/i.test(portal), 'migrated paid template order listed');

  // ── 3. Invoice numbered once, stable on reload ────────────────────────
  await page.goto(`${BASE}/portal/invoices/${LEGACY.paymentId}`, { waitUntil: 'networkidle' });
  const inv1 = (await body(page)).match(/XAA-INV-26ABC12-\d\d/)?.[0];
  await page.reload({ waitUntil: 'networkidle' });
  const inv2 = (await body(page)).match(/XAA-INV-26ABC12-\d\d/)?.[0];
  ok(inv1 && inv1 === inv2, 'invoice number allocated once and stable', `${inv1} / ${inv2}`);
  ok(/Receipt/.test(await body(page)), 'confirmed deposit renders as a receipt');
  await ctx.close();

  // ── 4. Two sign-ups racing on one email → one account ────────────────
  const email = `race${Date.now()}@example.com`;
  const a = await (await browser.newContext()).newPage();
  const b = await (await browser.newContext()).newPage();
  watch(a); watch(b);
  await Promise.all([register(a, email, 'race-pass-123'), register(b, email, 'race-pass-123')]);
  await Promise.all([a.getByRole('button', { name: /Create account/ }).click(), b.getByRole('button', { name: /Create account/ }).click()]);
  await Promise.all([a, b].map((p) => p.waitForURL((u) => new URL(u).pathname === '/portal', { timeout: 8000 }).catch(() => {})));
  await Promise.all([a, b].map((p) => p.getByText(/already exists/).waitFor({ timeout: 3000 }).catch(() => {})));
  const inPortal = [a, b].filter((p) => new URL(p.url()).pathname === '/portal').length;
  const refused = (await Promise.all([a, b].map(async (p) => /already exists/.test(await body(p))))).filter(Boolean).length;
  ok(inPortal === 1 && refused === 1, 'same email registered twice at once → exactly one account', `portal=${inPortal} refused=${refused}`);

  // ── 5. The winner opens a project and reports the deposit; admin confirms ──
  const client = inPortal && new URL(a.url()).pathname === '/portal' ? a : b;
  await client.goto(BASE + '/portal/new', { waitUntil: 'networkidle' });
  const pkg = client.locator('input[name="package"]').first();
  if (await pkg.count()) await pkg.check({ force: true });
  await client.fill('input[name="title"]', 'R2 race project');
  await client.locator('input[name="terms"]').check({ force: true });
  await client.locator('form button[type="submit"]').last().click();
  await client.waitForURL(/\/portal\/projects\//, { timeout: 15000 }).catch(() => {});
  const projectPath = new URL(client.url()).pathname;
  ok(/\/portal\/projects\//.test(projectPath), 'client opens a project', projectPath);
  const ref = client.locator('input[name="reference"]').first();
  if (await ref.count()) {
    await ref.fill('E2E-WIRE-777');
    await client.getByRole('button', { name: /I have sent this payment/ }).first().click();
    await client.getByText(/Payment submitted|pending|recorded/i).first().waitFor({ timeout: 15000 }).catch(() => {});
    ok(/Payment submitted|Awaiting confirmation|pending/i.test(await body(client)), 'deposit reported as pending');
  } else {
    ok(false, 'deposit form on the project page', 'no reference field (are payment destinations imported?)');
  }

  const admin = await (await browser.newContext()).newPage();
  watch(admin);
  await adminLogin(admin);
  ok(new URL(admin.url()).pathname.startsWith('/portal/admin'), 'admin signs in');
  const row = admin.locator('tr').filter({ hasText: email }).filter({ has: admin.getByRole('button', { name: 'Confirm' }) }).first();
  if (await row.count()) {
    await row.getByRole('button', { name: 'Confirm' }).click();
    await admin.waitForTimeout(1500);
    await client.goto(BASE + projectPath, { waitUntil: 'networkidle' });
    const p = await body(client);
    ok(/Payment confirmed/.test(p), 'admin confirmation lands on the client timeline');
    ok(/Awaiting your concept files|concept/i.test(p), 'project moves on after the deposit', p.match(/Awaiting[^\n]*/)?.[0]);
  } else {
    ok(false, 'pending payment shown on the admin desk', 'row not found');
  }

  // ── 6. Legacy lead and chat are on the desk ───────────────────────────
  await admin.goto(BASE + '/portal/admin/leads', { waitUntil: 'networkidle' });
  ok(/Hello from D1/.test(await body(admin)), 'lead copied from D1 shown in Leads');
  await admin.goto(BASE + '/portal/admin/support', { waitUntil: 'networkidle' });
  const desk = await body(admin);
  ok(/Visitor/.test(desk), 'chat copied from D1 shown in Support');

  // ── 7. Data storage: backup, download, restore ────────────────────────
  await admin.goto(BASE + '/portal/admin/settings#settings-storage', { waitUntil: 'networkidle' });
  const panel = admin.locator('#settings-storage');
  ok(/Move from D1: done/i.test(await panel.innerText()), 'storage panel: move done');
  ok(/users/.test(await panel.innerText()) && /support_messages/.test(await panel.innerText()), 'storage panel: per-table report');
  await panel.getByRole('button', { name: 'Back up now' }).click();
  await panel.getByText(/Backup saved/).waitFor({ timeout: 20000 }).catch(() => {});
  ok(/Backup saved: \d+ objects/.test(await panel.innerText()), 'Back up now', (await panel.innerText()).match(/Backup saved[^\n]*/)?.[0]);
  await admin.reload({ waitUntil: 'networkidle' });
  const dl = panel.getByRole('link', { name: 'Download' }).first();
  const href = await dl.getAttribute('href');
  const res = await admin.request.get(BASE + href);
  ok(res.status() === 200 && res.headers()['content-type'] === 'application/gzip', 'backup downloads as gzip (admin)', `${res.status()} ${res.headers()['content-type']}`);
  const anon = await fetch(BASE + href);
  ok(anon.status === 403, 'backup download refused to anyone else', anon.status);

  const key = await panel.locator('li[data-backup-key]').first().getAttribute('data-backup-key');
  const item = () => panel.locator(`li[data-backup-key="${key}"]`);
  await item().locator('summary').click();
  await item().locator('input[name="confirm"]').fill('restore');
  await item().getByRole('button', { name: 'Restore' }).click();
  await item().getByText(/Type RESTORE \(in capitals\)/).waitFor({ timeout: 10000 }).catch(() => {});
  ok(/Type RESTORE \(in capitals\)/.test(await item().innerText()), 'restore refuses without the confirmation word');
  await item().locator('input[name="confirm"]').fill('RESTORE');
  await item().getByRole('button', { name: 'Restore' }).click();
  await item().getByText(/Restored:/).waitFor({ timeout: 60000 }).catch(() => {});
  ok(/Restored: \d+ objects written/.test(await item().innerText()), 'restore from backup (safety backup first)', (await item().innerText()).match(/Restored[^\n]*/)?.[0]);
  ok(/before-restore by/i.test(await panel.innerText()), 'safety backup listed');
  await admin.goto(BASE + '/portal/admin', { waitUntil: 'networkidle' });
  ok(/R2 race project/.test(await body(admin)), 'records still there after restoring the latest backup');
  await admin.screenshot({ path: `${SHOTS}r2-admin.png`, fullPage: true });
} catch (e) {
  ok(false, 'script aborted', e.message);
} finally {
  await browser.close();
}

ok(errors.length === 0, 'no page errors or HTTP 5xx', errors.slice(0, 3).join(' | '));
for (const r of out) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.d ? '  — ' + r.d : ''}`);
const failed = out.filter((r) => !r.ok).length;
console.log(`\n${out.length - failed}/${out.length} passed`);
process.exit(failed ? 1 : 0);
