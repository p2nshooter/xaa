// Manual payments end to end (docs/BLUEPRINT.md §12, request 61) against a running Worker.
//
//   npx wrangler dev --local --port 8799 --var FX_ORIGIN:http://127.0.0.1:8897
//   ADMIN_PASS=… node payments.e2e.mjs [baseUrl]
//
// A stand-in for the rate sources (ECB through Frankfurter, CoinGecko) runs on 127.0.0.1:8897.
// Proves: all 13 wondr by BNI currency accounts and the 5 company wallets are active; the admin's conversion
// board shows the day's rates; a buyer's order offers every currency with the amount converted and rounded up,
// IDR with its unique code, every coin (BNB beside USDT on BEP20) with a server-drawn QR code; the amount is
// held; a bank transfer needs the screenshot; a short amount is flagged to the buyer and the admin; the admin
// sends it back with a note the buyer sees in the tracker; the corrected payment is approved and the tracker
// reaches "approved". Desktop and phone widths, no page error.
import { chromium } from 'playwright-core';
import http from 'node:http';
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:8799';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'alghoniy2026@gmail.com';
const ADMIN_PASS = process.env.ADMIN_PASS || '';
if (!ADMIN_PASS) throw new Error('ADMIN_PASS env var not set');
const STAMP = Date.now().toString(36);
const out = [];
const ok = (c, name, d = '') => { out.push(`${c ? 'PASS' : 'FAIL'}  ${name}${d ? '  — ' + d : ''}`); console.log(out.at(-1)); };
const errors = [];

// ── a stand-in for the rate sources ────────────────────────────────────────
const RATES = { USD: 1.0812, IDR: 17512.35, SGD: 1.4421, AUD: 1.6533, GBP: 0.8457, CNY: 7.7621, HKD: 8.4102, JPY: 164.92, MYR: 4.8803, KRW: 1489.7, THB: 36.88 };
const fx = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  res.writeHead(200, { 'content-type': 'application/json' });
  if (u.pathname === '/v1/latest') return res.end(JSON.stringify({ amount: 1, base: 'EUR', date: '2026-10-27', rates: RATES }));
  if (u.pathname === '/api/v3/simple/price') return res.end(JSON.stringify({ bitcoin: { eur: 61234.5 }, binancecoin: { eur: 543.21 }, solana: { eur: 151.7 }, dogecoin: { eur: 0.1432 } }));
  res.end('{}');
});
await new Promise((r) => fx.listen(8897, '127.0.0.1', r));

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
async function page(tag, viewport) {
  const p = await (await browser.newContext(viewport ? { viewport } : {})).newPage();
  p.on('pageerror', (e) => errors.push(`${tag} ${p.url()}: ${e.message}`));
  return p;
}
const bodyText = (p) => p.locator('body').innerText();

async function adminLogin(p) {
  await p.goto(BASE + '/login', { waitUntil: 'networkidle' });
  for (let i = 0; i < 5; i += 1) await p.getByRole('button', { name: 'XAA' }).click();
  const form = p.locator('form').filter({ has: p.locator('input[name="next"][value="/portal/admin"]') });
  await form.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await form.locator('input[name="password"]').fill(ADMIN_PASS);
  await form.getByRole('button', { name: /Enter studio desk/ }).click();
  await p.waitForURL((u) => new URL(u).pathname.startsWith('/portal/admin'), { timeout: 20000 });
}
async function register(p, name) {
  const email = `${name.toLowerCase().replace(/\W/g, '')}-${STAMP}@example.com`;
  await p.goto(BASE + '/register', { waitUntil: 'networkidle' });
  await p.fill('input[name="name"]', name);
  await p.fill('input[name="email"]', email);
  await p.fill('input[name="company"]', `${name} Co`);
  await p.fill('input[name="password"]', 'member-pass-123');
  await p.fill('input[name="confirm"]', 'member-pass-123');
  await p.getByRole('button', { name: /Create account/ }).click();
  await p.waitForURL((u) => new URL(u).pathname.startsWith('/portal'), { timeout: 20000 });
}

// ── 1. the admin: every company account active, today's rates on the board ─
const admin = await page('admin');
await adminLogin(admin);
await admin.goto(BASE + '/portal/admin/payments', { waitUntil: 'networkidle' });
await admin.getByRole('button', { name: /Refresh rates now/ }).click();
await admin.locator('[data-testid=rate-board] [role=status], [data-testid=rate-board] [role=alert]').first().waitFor({ timeout: 30000 }).catch(() => {});
await admin.goto(BASE + '/portal/admin/payments', { waitUntil: 'networkidle' });
const board = await admin.locator('[data-testid=rate-board]').innerText();
ok(/13\/13 BNI currency accounts active/i.test(board), 'all 13 BNI currency accounts are active', board.match(/\d+\/13[^\n]*/)?.[0]);
ok(/5 wallets/i.test(board), 'the 5 company wallets are active');
ok(/ECB 2026-10-27/i.test(board) && !/stale/i.test(board), 'the day\'s reference rate is on the board');
ok(/17,512\.35/.test(board) && /4\.0545/.test(board), 'IDR from the ECB and SAR from the 3.75 USD peg (1.0812 × 3.75)');

// ── 1b. only a template with its bundle is sold (owner, 29 Oct 2026; BLUEPRINT request 72) ─
const buyer = await page('buyer');
await register(buyer, 'Pembeli Satu');
await buyer.goto(BASE + '/templates/crm-starter', { waitUntil: 'networkidle' });
ok((await buyer.locator('[data-testid=bundle-state]').getAttribute('data-ready')) === '0', 'a template without its bundle says it is in development');
ok((await buyer.locator('form button[type=submit]', { hasText: /buy|order|get/i }).count()) === 0 && (await buyer.locator('[data-testid=notify-ready]').count()) === 1, 'it has no buy button, only "tell me when it is ready"');
await admin.goto(BASE + '/templates/waitlist', { waitUntil: 'networkidle' });
if ((await admin.locator('[data-testid=bundle-state]').getAttribute('data-ready')) !== '1') {
  const emptyZip = Buffer.from([0x50, 0x4b, 0x05, 0x06, ...new Array(18).fill(0)]);
  await admin.locator('input[name=bundle]').setInputFiles({ name: 'waitlist.zip', mimeType: 'application/zip', buffer: emptyZip });
  await admin.getByRole('button', { name: /Upload bundle/ }).click();
  await admin.locator('form [role=status], form [role=alert]').first().waitFor({ timeout: 20000 }).catch(() => {});
  await admin.goto(BASE + '/templates/waitlist', { waitUntil: 'networkidle' });
}
ok((await admin.locator('[data-testid=bundle-state]').getAttribute('data-ready')) === '1', 'the studio uploads the bundle and the template is ready');
await buyer.goto(BASE + '/templates', { waitUntil: 'networkidle' });
ok((await buyer.locator('[data-testid=template-state][data-slug=waitlist]').getAttribute('data-ready')) === '1'
  && (await buyer.locator('[data-testid=template-state][data-slug=crm-starter]').getAttribute('data-ready')) === '0', 'the catalogue marks ready and in-development templates');

// ── 2. a buyer's order: every currency, converted, IDR code, coins with QR ─
await buyer.goto(BASE + '/templates/waitlist', { waitUntil: 'networkidle' });
await buyer.locator('form button[type=submit]', { hasText: /buy|order|get/i }).first().click();
await buyer.waitForURL(/\/portal\/orders\//, { timeout: 20000 });
const orderUrl = buyer.url();
const price = Number((await buyer.locator('dd').first().innerText()).replace(/[^\d.]/g, ''));
ok(price > 0, 'the order shows its euro price', String(price));
ok((await buyer.locator('[data-testid=pay-tracker]').getAttribute('data-stage')) === 'due', 'the tracker starts at "invoice ready"');
const bankChoices = buyer.locator('[data-testid=pay-choices] button');
ok((await bankChoices.count()) === 13, 'the buyer can pay into any of the 13 currency accounts', String(await bankChoices.count()));

await buyer.locator('[data-testid=pay-choices] button[data-asset=USD]').click();
const usdShown = await buyer.locator('[data-testid=pay-amount]').innerText();
const usdExpected = Math.ceil(price * 1.0812 * 100) / 100;
ok(usdShown.replace(/,/g, '').includes(usdExpected.toFixed(2)), 'USD is converted at the day\'s rate and rounded up', `${usdShown} vs ${usdExpected}`);
ok(/held for you until/.test(await buyer.locator('[data-testid=pay-held]').innerText()), 'the amount is held for the buyer');

await buyer.locator('[data-testid=pay-choices] button[data-asset=IDR]').click();
const idrShown = await buyer.locator('[data-testid=pay-amount]').innerText();
const idr = Number(idrShown.replace(/\D/g, ''));
const idrBase = Math.ceil((price * 17512.35) / 1000) * 1000;
ok(/^Rp /.test(idrShown) && idr > idrBase && idr < idrBase + 1000, 'IDR is rounded to thousands plus a unique 3-digit code', `${idrShown} (base ${idrBase})`);
const details = await buyer.locator('[data-testid=manual-pay]').innerText();
ok(/BNINIDJA/.test(details) && /009/.test(details), 'SWIFT BNINIDJA and bank code 009 are shown');
ok(/Bank BNI \(code 009\)/.test(details), 'the guide explains a transfer from an Indonesian bank');

await buyer.getByRole('tab', { name: 'Crypto' }).click();
const coinChoices = await buyer.locator('[data-testid=pay-choices] button').allInnerTexts();
ok(coinChoices.length === 6, 'six ways to pay in crypto (USDT TRC20 + BEP20, BNB, BTC, SOL, DOGE)', coinChoices.map((c) => c.split('\n')[0]).join(', '));
await buyer.locator('[data-testid=pay-choices] button[data-asset=BTC]').click();
ok((await buyer.locator('[data-testid=pay-qr] svg path').count()) === 1, 'a QR code is drawn for the wallet');
const btcShown = await buyer.locator('[data-testid=pay-amount]').innerText();
ok(/^0\.00\d+ BTC$/.test(btcShown.trim()), 'BTC is priced at the hourly market price', btcShown);
await buyer.locator('[data-testid=pay-choices] button[data-asset=BNB]').click();
ok(/BEP20/.test(await buyer.locator('[data-testid=manual-pay]').innerText()), 'BNB is offered on BNB Smart Chain beside USDT');

// ── 3. submit: the screenshot is required, a short amount is flagged ───────
await buyer.getByRole('tab', { name: 'Bank transfer' }).click();
await buyer.locator('[data-testid=pay-choices] button[data-asset=IDR]').click();
await buyer.locator('input[name=reference]').fill('BIFAST-TEST-1');
await buyer.locator('input[name=receipt]').evaluate((el) => el.removeAttribute('required'));
await buyer.getByRole('button', { name: /I have sent it/ }).click();
await buyer.locator('[data-testid=manual-pay] [role=alert]').first().waitFor({ timeout: 30000 }).catch(() => {});
ok(/payment screenshot/i.test(await bodyText(buyer)), 'a bank transfer without a screenshot is refused by the server');
mkdirSync('/tmp/payments-e2e', { recursive: true });
writeFileSync('/tmp/payments-e2e/receipt.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'));
await buyer.locator('input[name=reference]').fill('BIFAST-TEST-1');
await buyer.locator('input[name=paidAmount]').fill(String(Math.floor(idr * 0.9)));
await buyer.locator('input[name=receipt]').setInputFiles('/tmp/payments-e2e/receipt.png');
await buyer.getByRole('button', { name: /I have sent it/ }).click();
await buyer.locator('[data-testid=manual-pay] [role=status]').first().waitFor({ timeout: 30000 }).catch(() => {});
ok(/below the invoice/.test(await bodyText(buyer)), 'a short amount is flagged to the buyer');
await buyer.goto(orderUrl, { waitUntil: 'networkidle' });
ok((await buyer.locator('[data-testid=pay-tracker]').getAttribute('data-stage')) === 'sent', 'the tracker moves to "payment sent"');

await admin.goto(orderUrl, { waitUntil: 'networkidle' });
const expected = await admin.locator('[data-testid=admin-expected]').innerText();
ok(expected.includes(idrShown) && /short Rp/.test(expected), 'the admin sees the expected IDR amount and the shortfall', expected);
await admin.locator('input[name=reason]').fill('Rp ' + (idr - Math.floor(idr * 0.9)) + ' is missing — please transfer the difference and upload both receipts');
await admin.getByRole('button', { name: /Send back to the buyer/ }).click();
await admin.waitForTimeout(2500);

await buyer.goto(orderUrl, { waitUntil: 'networkidle' });
ok((await buyer.locator('[data-testid=pay-tracker]').getAttribute('data-stage')) === 'attention', 'the tracker shows "needs your attention"');
ok(/please transfer the difference/.test(await buyer.locator('[data-testid=pay-attention]').innerText()), 'the buyer reads the admin\'s note');
const idrAgain = await (async () => { await buyer.locator('[data-testid=pay-choices] button[data-asset=IDR]').click(); return buyer.locator('[data-testid=pay-amount]').innerText(); })();
ok(idrAgain === idrShown, 'the held IDR amount (and its code) is unchanged on the next visit', idrAgain);
await buyer.locator('input[name=reference]').fill('BIFAST-TEST-2');
await buyer.locator('input[name=receipt]').setInputFiles('/tmp/payments-e2e/receipt.png');
await buyer.getByRole('button', { name: /I have sent it/ }).click();
await buyer.locator('[data-testid=manual-pay] [role=status]').first().waitFor({ timeout: 30000 }).catch(() => {});
ok(/Payment submitted\. We will confirm/.test(await bodyText(buyer)), 'the exact amount submits cleanly');

await admin.goto(orderUrl, { waitUntil: 'networkidle' });
ok(!/short/.test(await admin.locator('[data-testid=admin-expected]').innerText()), 'the admin sees the corrected amount without a shortfall');
await admin.getByRole('button', { name: /Mark paid/ }).click();
await admin.waitForTimeout(2500);
await buyer.goto(orderUrl, { waitUntil: 'networkidle' });
ok((await buyer.locator('[data-testid=pay-tracker]').getAttribute('data-stage')) === 'approved', 'the tracker reaches "approved"');

// ── 4. phone width, Indonesian ─────────────────────────────────────────────
const phone = await page('phone', { width: 390, height: 844 });
await register(phone, 'Pembeli Dua');
await phone.goto(BASE + '/templates/waitlist?lang=id', { waitUntil: 'networkidle' });
await phone.locator('form button[type=submit]').first().click();
await phone.waitForURL(/\/portal\/orders\//, { timeout: 20000 });
await phone.goto(phone.url().split('?')[0] + '?lang=id', { waitUntil: 'networkidle' });
const idText = await phone.locator('[data-testid=manual-pay]').innerText();
ok(/Pilih cara bayar/.test(idText) && /Kirim persis sejumlah ini/.test(idText), 'the guide reads in Indonesian');
ok(/^Rp /.test(await phone.locator('[data-testid=pay-amount]').innerText()), 'Indonesian buyers start on the IDR account');
const overflow = await phone.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
ok(overflow <= 1, 'no sideways scrolling at phone width', String(overflow));
await phone.screenshot({ path: '/tmp/payments-e2e/phone.png', fullPage: true });
await buyer.screenshot({ path: '/tmp/payments-e2e/desktop.png', fullPage: true });

ok(errors.length === 0, 'no page errors', errors.slice(0, 3).join(' | '));
await browser.close();
fx.close();
const failed = out.filter((l) => l.startsWith('FAIL'));
console.log(`\n${out.length - failed.length}/${out.length} passed`);
process.exit(failed.length ? 1 : 0);
