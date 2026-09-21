import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://127.0.0.1:8821';
const log = (...a) => console.log('•', ...a);
const fails = [];
function check(name, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
  if (!ok) fails.push(name);
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

// Admin context (first account registered => admin)
const admin = await browser.newContext({ baseURL: BASE });
const ap = await admin.newPage();
ap.on('pageerror', (e) => console.log('  [admin pageerror]', e.message));

const STAMP = Date.now();

/** Confirm the pending payment on the row for `ref`, not whatever is first. */
async function confirmFor(ref) {
  await ap.goto('/portal/admin', { waitUntil: 'networkidle' });
  const row = ap.locator('tr', { hasText: ref }).filter({ has: ap.locator('button[value=confirm]') }).first();
  if (await row.count()) {
    await row.locator('button[value=confirm]').click();
  } else {
    await ap.locator('button[value=confirm]').first().click();
  }
  await ap.waitForTimeout(2500);
}
// Sign in if the studio account already exists, otherwise create it — the
// local D1 file is keyed off database_id, so it resets whenever that changes.
await ap.goto('/login');
await ap.fill('input[name=email]', 'admin@xaa.es');
await ap.fill('input[name=password]', 'supersecret123');
await ap.click('button[type=submit]');
await ap.waitForTimeout(2500);
if (!ap.url().endsWith('/portal')) {
  await ap.goto('/register');
  await ap.fill('input[name=name]', 'Studio Admin');
  await ap.fill('input[name=email]', 'admin@xaa.es');
  await ap.fill('input[name=password]', 'supersecret123');
  await ap.fill('input[name=confirm]', 'supersecret123');
  await ap.click('button[type=submit]');
}
await ap.waitForURL('**/portal', { timeout: 20000 }).catch(() => {});
check('admin signs in and lands in portal', ap.url().endsWith('/portal'), ap.url());
// A destination must exist before any client can pay — the portal now
// refuses to show a payment form without one, which is the point.
await ap.goto('/portal/admin/payments');
if (!(await ap.textContent('body') ?? '').includes('USDT · TRC20')) {
  await ap.selectOption('select[name=kind]', 'crypto');
  await ap.fill('input[name=label]', 'USDT · TRC20');
  await ap.selectOption('select[name=network]', 'TRC20');
  await ap.fill('input[name=address]', 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE');
  await ap.locator('form', { has: ap.locator('input[name=label]') }).locator('button[type=submit]').click();
  await ap.waitForTimeout(2500);
}
await ap.goto('/portal');
check('payment destination ready', (await ap.goto('/portal/admin/payments'), (await ap.textContent('body') ?? '').includes('USDT · TRC20')));
await ap.goto('/portal');

check('admin sees studio desk link', (await ap.content()).includes('studio desk') || (await ap.content()).includes('Studio desk'));

// Client context
const client = await browser.newContext({ baseURL: BASE });
const cp = await client.newPage();
cp.on('pageerror', (e) => console.log('  [client pageerror]', e.message));

await cp.goto('/register');
await cp.fill('input[name=name]', 'Ana Client');
await cp.fill('input[name=email]', `ana${STAMP}@example.com`);
await cp.fill('input[name=company]', 'Nordvik AB');
await cp.fill('input[name=password]', 'clientpass123');
await cp.fill('input[name=confirm]', 'clientpass123');
await cp.click('button[type=submit]');
await cp.waitForURL('**/portal', { timeout: 20000 }).catch(() => {});
check('client registers', cp.url().endsWith('/portal'), cp.url());

// Open a project
await cp.goto('/portal/new?package=company-profile');
await cp.waitForSelector('input[name=title]');
const quoteText = await cp.textContent('aside');
check('order form quotes the deposit', /Deposit \(10%\)/.test(quoteText ?? ''), (quoteText ?? '').slice(0, 0));
await cp.fill('input[name=title]', 'Nordvik Consulting site');
await cp.fill('textarea[name=scope]', 'Company site, 12 pages, Swedish + English.');
await cp.check('input[name=terms]');
await cp.click('aside button[type=submit]');
await cp.waitForURL('**/portal/projects/**', { timeout: 20000 }).catch(() => {});
const projectUrl = cp.url();
const projectRef = ((await cp.textContent('body')) ?? '').match(/XAA-[A-Z0-9]+/)?.[0] ?? '';
check('project created and opened', /\/portal\/projects\//.test(projectUrl), projectUrl);

let body = await cp.textContent('body');
check('starts awaiting deposit', /Awaiting 10% deposit/.test(body ?? ''));
check('deposit amount is 10% of 2500 = 250', /€250/.test(body ?? ''));
check('concept upload is locked before deposit', /opens as soon as your 10% booking deposit is confirmed/.test(body ?? ''));
check('no estimated completion before concept', /Fixed when your concept arrives/.test(body ?? ''));

// Try to underpay the deposit
await cp.fill('input[name=amount]', '100');
await cp.fill('input[name=reference]', 'TXUNDERPAY');
await cp.locator('form', { has: cp.locator('input[name=reference]') }).locator('button[type=submit]').click();
await cp.waitForTimeout(2500);
body = await cp.textContent('body');
check('underpaid deposit rejected', /booking deposit is €250/.test(body ?? ''));

// Pay the deposit properly
await cp.fill('input[name=amount]', '250');
await cp.fill('input[name=reference]', 'TX-DEPOSIT-0001');
await cp.locator('form', { has: cp.locator('input[name=reference]') }).locator('button[type=submit]').click();
await cp.waitForTimeout(2500);
body = await cp.textContent('body');
check('deposit recorded as pending', /pending/i.test(body ?? ''));
check('still awaiting deposit until confirmed', /Awaiting 10% deposit/.test(body ?? ''));

// Admin confirms
await ap.goto('/portal/admin');
body = await ap.textContent('body');
check('admin sees the pending payment', /TX-DEPOSIT-0001/.test(body ?? ''));
await confirmFor(projectRef);
await ap.waitForTimeout(2500);

await cp.reload();
body = await cp.textContent('body');
check('after deposit → awaiting concept', /Awaiting your concept files/.test(body ?? ''));
check('concept upload now unlocked', /Upload your concept/.test(body ?? ''));

// Upload a concept file
fs.writeFileSync('/tmp/concept.pdf', '%PDF-1.4 fake concept for the flow test');
// Scope to the concept form: the business-data form also carries
// input[name=files], so an unscoped selector is ambiguous now.
const conceptForm = cp.locator('form', { hasText: 'Upload your concept' }).first();
await conceptForm.locator('input[type=file][name=files]').setInputFiles('/tmp/concept.pdf');
await conceptForm.locator('textarea[name=note]').fill('Clean, blue, Swedish first.');
await conceptForm.locator('button[type=submit]').click();
await cp.waitForTimeout(3000);
await cp.reload();
body = await cp.textContent('body');
check('concept uploaded', /concept\.pdf/.test(body ?? ''));
check('delivery estimate now published', !/Fixed when your concept arrives/.test(body ?? ''));
check('status moves to scheduled (40% due)', /Scheduled — 40% due to start/.test(body ?? ''));

// Pay production
await cp.fill('input[name=amount]', '1000');
await cp.fill('input[name=reference]', 'TX-PRODUCTION-0002');
await cp.locator('form', { has: cp.locator('input[name=reference]') }).locator('button[type=submit]').click();
await cp.waitForTimeout(2500);
await confirmFor(projectRef);
await ap.waitForTimeout(2500);
await cp.reload();
body = await cp.textContent('body');
check('after 50% paid → in production', /In production/.test(body ?? ''));

// Admin pushes progress past the cap
await ap.goto(projectUrl);
await ap.fill('input[name=progress]', '95');
await ap.fill('input[name=note]', 'Trying to go past the cap');
await ap.locator('form', { has: ap.locator('input[name=progress]') }).locator('button[type=submit]').click();
await ap.waitForTimeout(2500);
await cp.reload();
body = await cp.textContent('body');
check('progress clamped to 80% while unpaid', /\b80%/.test(body ?? '') && !/\b95%/.test(body ?? ''));
check('settlement now due', /Awaiting final settlement/.test(body ?? ''));
check('cap explained to the client', /held at 80%/.test(body ?? ''));

// Final settlement
await cp.fill('input[name=amount]', '1250');
await cp.fill('input[name=reference]', 'TX-FINAL-0003');
await cp.locator('form', { has: cp.locator('input[name=reference]') }).locator('button[type=submit]').click();
await cp.waitForTimeout(2500);
await confirmFor(projectRef);
await ap.waitForTimeout(2500);
await cp.reload();
body = await cp.textContent('body');
check('paid in full → finalising', /Finalising/.test(body ?? ''));

// Complete
await ap.goto(projectUrl);
await ap.fill('input[name=progress]', '100');
await ap.fill('input[name=note]', 'Deployed and handed over');
await ap.locator('form', { has: ap.locator('input[name=progress]') }).locator('button[type=submit]').click();
await ap.waitForTimeout(2500);
await cp.reload();
body = await cp.textContent('body');
check('100% + paid → delivered', /Delivered/.test(body ?? ''));
check('progress shows 100%', /100%/.test(body ?? ''));

// Isolation: a third user must not see this project
const other = await browser.newContext({ baseURL: BASE });
const op = await other.newPage();
await op.goto('/register');
await op.fill('input[name=name]', 'Nosy Person');
await op.fill('input[name=email]', `nosy${STAMP}@example.com`);
await op.fill('input[name=password]', 'nosypass12345');
await op.fill('input[name=confirm]', 'nosypass12345');
await op.click('button[type=submit]');
await op.waitForTimeout(2000);
const resp = await op.goto(projectUrl);
check('other client cannot open the project', resp?.status() === 404, `status ${resp?.status()}`);

// Logged-out access
const anon = await browser.newContext({ baseURL: BASE });
const anonPage = await anon.newPage();
await anonPage.goto(projectUrl);
check('logged-out visitor is sent to sign in', /\/login/.test(anonPage.url()), anonPage.url());

// Public pages render
for (const path of ['/', '/services', '/services/ecommerce', '/process', '/care', '/payments', '/work', '/faq', '/about', '/contact', '/terms', '/privacy', '/insights']) {
  const r = await anonPage.goto(path);
  check(`public page ${path}`, r?.status() === 200, `status ${r?.status()}`);
}
// Ads must not appear on studio pages
await anonPage.goto('/services');
const svcHtml = await anonPage.content();
check('no ad units on /services', !svcHtml.includes('ad-wrap'));

await browser.close();
console.log(`\n${fails.length ? 'FAILURES: ' + fails.join(' | ') : 'ALL CHECKS PASSED'}`);
process.exit(fails.length ? 1 : 0);
