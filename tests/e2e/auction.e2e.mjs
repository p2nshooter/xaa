// The xaa.es auction end to end (docs/BLUEPRINT.md §10, requests 59 and 63) against a running Worker.
//
//   npx wrangler dev --local --port 8799 --var DOH_ENDPOINTS:http://127.0.0.1:8898/dns-query
//   ADMIN_PASS=… node auction.e2e.mjs [baseUrl]
//
// A stand-in DNS-over-HTTPS resolver runs on 127.0.0.1:8898 so the member's TXT proof can be set by the test.
// Proves: an admin lot (draft → start → 14 days, on /auction, filters and sorts); a member's domain (DNS record
// shown, check fails until the record exists, then verified; the brand/own-site guards; lot starts at once with
// the 30 % commission explained; the seller cannot bid on it; seller page lists it); bidding (exact next price,
// "you lead"); buy-now closes a lot; a bank payment needs the screenshot; the admin approves; the lot is sold;
// hand-over (code sent, domain received) releases the seller's 70 % payout; the admin reveals the encrypted
// payout details and marks it paid. No page throws.
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

// ── a stand-in DNS-over-HTTPS resolver ────────────────────────────────────
const txt = new Map();
const doh = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const name = (u.searchParams.get('name') || '').toLowerCase();
  const answers = (txt.get(name) || []).map((v) => ({ name, type: 16, TTL: 60, data: `"${v}"` }));
  res.writeHead(200, { 'content-type': 'application/dns-json' });
  res.end(JSON.stringify({ Status: 0, Answer: answers }));
});
await new Promise((r) => doh.listen(8898, '127.0.0.1', r));

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
async function page(tag) {
  const p = await (await browser.newContext()).newPage();
  p.on('pageerror', (e) => errors.push(`${tag} ${p.url()}: ${e.message}`));
  return p;
}
const settle = (p, testid) => p.locator(`[data-testid=${testid}] [role=status], [data-testid=${testid}] [role=alert]`).first().waitFor({ timeout: 30000 }).catch(() => {});
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
async function setName(p, name) {
  await p.goto(BASE + '/portal/auction', { waitUntil: 'networkidle' });
  await p.locator('[data-testid=auction-name] input[name=name]').fill(name);
  await p.locator('[data-testid=auction-name] button[type=submit]').click();
  await settle(p, 'auction-name');
}

const admin = await page('admin');
await adminLogin(admin);

// Payment destinations, so a manual payment can be made.
await admin.goto(BASE + '/portal/admin/payments', { waitUntil: 'networkidle' });
const importBtn = admin.getByRole('button', { name: /Import company accounts/ });
if (await importBtn.count()) { await importBtn.click(); await admin.waitForTimeout(2500); }

// ── 1. an admin lot: draft → start → live for 14 days ─────────────────────
const adminDomain = `studio${STAMP}.com`;
await admin.goto(BASE + '/portal/admin/auction', { waitUntil: 'networkidle' });
ok((await admin.locator('[data-testid=auto-products]').count()) === 1, 'desk shows the automatic products panel');
const af = admin.locator('[data-testid=admin-lot-form]').first();
await af.locator('select[name=type]').selectOption('domain');
await af.locator('select[name=category]').selectOption('domains');
await af.locator('input[name=title]').fill(adminDomain);
await af.locator('input[name=domain]').fill(adminDomain);
await af.locator('input[name=normal]').fill('2000');
await af.locator('input[name=buy_now]').fill('2000');
await af.locator('button[type=submit]').click();
await settle(admin, 'admin-lot-form');
await admin.goto(BASE + '/portal/admin/auction', { waitUntil: 'networkidle' });
const deskRow = admin.locator('[data-testid=desk-lots] li', { hasText: adminDomain }).first();
ok(/draft/i.test(await deskRow.innerText()), 'admin lot created as a draft', (await deskRow.innerText()).slice(0, 120));
ok(/opens €700 · \+€35/.test(await deskRow.innerText()), 'opening 35 % (€700) and +5 % of it (€35)', (await deskRow.innerText()).match(/opens[^·]*·[^·]*/)?.[0]);
await deskRow.getByRole('button', { name: /Start/ }).click();
await admin.waitForTimeout(2500);
await admin.goto(BASE + '/portal/admin/auction', { waitUntil: 'networkidle' });
const started = await admin.locator('[data-testid=desk-lots] li', { hasText: adminDomain }).first().innerText();
const m = started.match(/(\d{4}-\d\d-\d\d \d\d:\d\d) → (\d{4}-\d\d-\d\d \d\d:\d\d)/);
const days = m ? (Date.parse(m[2].replace(' ', 'T') + 'Z') - Date.parse(m[1].replace(' ', 'T') + 'Z')) / 86_400_000 : 0;
ok(/open/i.test(started) && Math.round(days) === 14, 'started lot runs 14 days', m ? `${m[1]} → ${m[2]}` : started.slice(0, 160));

// ── 2. a member sells a domain: DNS proof, guards, live at once ───────────
const seller = await page('seller');
await register(seller, 'Seller Kopi');
await setName(seller, 'Kopi Domains');
const memberDomain = `kopi${STAMP}.com`;
let claims = 0;
async function claim(d) {
  // A fresh load each time, so the notice read below is this claim's, not the previous one's.
  claims += 1;
  await seller.goto(BASE + `/portal/auction?c=${claims}`, { waitUntil: 'networkidle' });
  await seller.locator('[data-testid=domain-claim] input[name=domain]').fill(d);
  await seller.locator('[data-testid=domain-claim] button[type=submit]').click();
  await settle(seller, 'domain-claim');
  return seller.locator('[data-testid=domain-claim]').innerText();
}
ok(/not for sale here/i.test(await claim('xaa.es')), 'the owner\'s own domains are refused');
ok(/brand/i.test(await claim(`paypal-deals${STAMP}.com`)), 'other people\'s brands are refused');
await claim(memberDomain);
await seller.goto(BASE + '/portal/auction', { waitUntil: 'networkidle' });
const claimRow = seller.locator('[data-testid=claims] li', { hasText: memberDomain }).first();
const recName = await claimRow.locator('[data-testid=txt-name]').innerText();
const recValue = await claimRow.locator('[data-testid=txt-value]').innerText();
ok(recName === `_xaa-verify.${memberDomain}` && /^xaa-verify=[0-9a-f]{32}$/.test(recValue), 'the TXT record to add is shown', `${recName} ${recValue}`);
await claimRow.locator('[data-testid=domain-verify] button').click();
await claimRow.locator('[data-testid=domain-verify] [role=alert], [data-testid=domain-verify] [role=status]').first().waitFor({ timeout: 30000 }).catch(() => {});
ok(/not visible yet/i.test(await claimRow.innerText()), 'check fails while the record is missing');
txt.set(recName, [recValue]);
await claimRow.locator('[data-testid=domain-verify] button').click();
await seller.waitForTimeout(2500);
await seller.goto(BASE + '/portal/auction', { waitUntil: 'networkidle' });
ok(/verified/i.test(await seller.locator('[data-testid=claims] li', { hasText: memberDomain }).first().innerText()), 'domain verified once both resolvers see the token');
ok(/30 % sales commission only if the domain sells/i.test(await seller.locator('[data-testid=commission-note]').innerText()), 'the 30 % sales commission is explained before listing');
const ml = seller.locator('[data-testid=member-lot]');
await ml.locator('select[name=domain]').selectOption(memberDomain);
await ml.locator('input[name=asking]').fill('1000');
await ml.locator('input[name=buy_now]').check();
await ml.locator('input[name=registrar]').fill('Namecheap');
await ml.locator('input[name=expires_on]').fill(new Date(Date.now() + 400 * 86_400_000).toISOString().slice(0, 10));
await ml.locator('input[name=summary]').fill('Short, brandable coffee domain.');
await ml.locator('input[name=declare]').check();
await ml.locator('button[type=submit]').click();
await settle(seller, 'member-lot');
ok(/is live until/i.test(await ml.innerText()), 'member lot starts at once', (await ml.innerText()).slice(-120));

await seller.goto(BASE + '/auction', { waitUntil: 'networkidle' });
const sellerCard = seller.locator('[data-testid=lot-card]', { hasText: `kopi${STAMP}` }).first();
ok((await sellerCard.count()) === 1 && /DNS verified/i.test(await sellerCard.innerText()), 'member lot on /auction with its DNS badge', (await sellerCard.innerText().catch(() => 'no card')).slice(0, 160));
await sellerCard.locator('a').first().click();
await seller.waitForURL(/\/auction\/AUC-/, { timeout: 20000 });
await seller.locator('[data-testid=lot-price]').waitFor({ timeout: 20000 });
const lotUrl = seller.url();
ok(/This is your lot/.test(await bodyText(seller)), 'the seller cannot bid on their own lot', (await seller.locator('aside').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200));
ok(/€350/.test(await seller.locator('[data-testid=lot-price]').innerText()), 'member lot opens at 35 % (€350)');

// ── 3. the public list: ending soonest first, filters ─────────────────────
await seller.goto(BASE + `/auction?tld=com&q=kopi${STAMP}&qmode=starts`, { waitUntil: 'networkidle' });
ok((await seller.locator('[data-testid=lot-card]').count()) === 1, 'keyword + TLD filter finds exactly the member lot');
await seller.goto(BASE + `/auction?q=${STAMP}`, { waitUntil: 'networkidle' });
const order = await seller.locator('[data-testid=lot-card] a').allInnerTexts();
ok(order.length === 2 && order[0].includes('studio') && order[1].includes('kopi'), 'ending soonest first (the admin lot started earlier)', order.join(' | '));
const head = await (await fetch(BASE + `/auction?q=x`)).text();
ok(/<meta name="robots" content="noindex/.test(head), 'filtered views are noindex');
const sitemap = await (await fetch(BASE + '/sitemap.xml')).text();
ok(sitemap.includes('https://xaa.es/auction<') || sitemap.includes('https://xaa.es/auction</loc>'), '/auction is in the sitemap');

// Seller page.
await seller.goto(BASE + '/portal/auction', { waitUntil: 'networkidle' });
const sellerLink = await seller.locator('a[href^="/auction/seller/"]').first().getAttribute('href');
await seller.goto(BASE + sellerLink, { waitUntil: 'networkidle' });
ok(/Kopi Domains/.test(await seller.locator('[data-testid=seller-title]').innerText()) && (await seller.locator('[data-testid=lot-card]').count()) === 1, 'seller page lists the member\'s live domain', sellerLink);

// ── 4. a bidder: exact next price, buy now, bank payment needs a screenshot ──
const bidder = await page('bidder');
await register(bidder, 'Buyer Satu');
await setName(bidder, 'Buyer Satu');
await bidder.goto(lotUrl, { waitUntil: 'networkidle' });
if (!(await bidder.locator('[data-testid=bid-box] button', { hasText: 'Bid €350' }).count())) console.log('BIDDER ASIDE:', (await bidder.locator('aside').innerText()).replace(/\s+/g, ' ').slice(0, 300), bidder.url());
await bidder.locator('[data-testid=bid-box] button', { hasText: 'Bid €350' }).click();
await settle(bidder, 'bid-box');
await bidder.goto(lotUrl, { waitUntil: 'networkidle' });
ok((await bidder.locator('[data-testid=you-lead]').count()) === 1 && /€350/.test(await bidder.locator('[data-testid=lot-price]').innerText()), 'first bid is the opening bid; the bidder leads');

// A second member outbids at exactly +€18, then the first buys now.
const second = await page('second');
await register(second, 'Buyer Dua');
await setName(second, 'Buyer Dua');
await second.goto(lotUrl, { waitUntil: 'networkidle' });
ok((await second.locator('[data-testid=bid-box] button', { hasText: 'Bid €368' }).count()) === 1, 'next price is the high bid + 5 % of the opening (€368)');
await second.locator('[data-testid=bid-box] button', { hasText: 'Bid €368' }).click();
await settle(second, 'bid-box');
await bidder.goto(lotUrl, { waitUntil: 'networkidle' });
await bidder.locator('[data-testid=bid-box] button', { hasText: /Buy now for €1,000/ }).click();
await settle(bidder, 'bid-box');
await bidder.goto(lotUrl, { waitUntil: 'networkidle' });
ok(/Won by Buyer Satu at €1,000 — not paid yet/.test(await bidder.locator('[data-testid=lot-outcome]').innerText()), 'buy-now closes the lot; the winner is listed as not paid yet');
const history = await bidder.locator('[data-testid=bid-history]').innerText();
ok(!/Buyer/.test(history) && /B•+/.test(history), 'bid history masks names', history.slice(0, 120));

await bidder.goto(BASE + '/portal/auction', { waitUntil: 'networkidle' });
await bidder.locator('[data-testid=pay-win]').first().click();
await bidder.waitForURL(/\/portal\/orders\//, { timeout: 20000 });
const orderUrl = bidder.url();
ok((await bidder.locator('[data-testid=auction-order]').count()) === 1, 'the win opens a checkout order');
const methodSel = bidder.locator('select[name=method]');
if (await methodSel.count()) await methodSel.selectOption('bank');
await bidder.locator('input[name=reference]').fill('BNI-TEST-1');
await bidder.getByRole('button', { name: /I have paid/ }).click();
await bidder.locator('[role=alert]').first().waitFor({ timeout: 30000 }).catch(() => {});
ok(/payment screenshot/i.test(await bodyText(bidder)), 'a bank transfer without a screenshot is refused');
mkdirSync('/tmp/auction-e2e', { recursive: true });
writeFileSync('/tmp/auction-e2e/receipt.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'));
await bidder.locator('input[name=reference]').fill('BNI-TEST-1');
await bidder.locator('input[name=receipt]').setInputFiles('/tmp/auction-e2e/receipt.png');
await bidder.getByRole('button', { name: /I have paid/ }).click();
await bidder.locator('[role=status]').first().waitFor({ timeout: 30000 }).catch(() => {});
ok(/Payment submitted/i.test(await bodyText(bidder)), 'with the screenshot the payment is submitted');

// ── 5. the admin approves → sold; hand-over → payout due → paid ───────────
await admin.goto(orderUrl, { waitUntil: 'networkidle' });
ok((await admin.locator('a[href^="/api/orders/receipt/"]').count()) === 1, 'the admin sees the payment screenshot');
const receiptHref = await admin.locator('a[href^="/api/orders/receipt/"]').getAttribute('href');
const rec = await admin.context().request.get(BASE + receiptHref);
ok(rec.status() === 200 && (rec.headers()['content-type'] || '').startsWith('image/'), 'the screenshot downloads for the admin', String(rec.status()));
const anon = await fetch(BASE + receiptHref);
ok(anon.status === 401, 'the screenshot is private', String(anon.status));
await admin.getByRole('button', { name: /Mark paid/ }).click();
await admin.waitForTimeout(3000);
await bidder.goto(lotUrl, { waitUntil: 'networkidle' });
ok(/Sold to Buyer Satu for €1,000/.test(await bidder.locator('[data-testid=lot-outcome]').innerText()), 'approval marks the lot sold');

await seller.goto(BASE + '/portal/auction', { waitUntil: 'networkidle' });
ok(/Final €1,000 · commission €300 · you receive €700 — released when the buyer confirms/.test(await seller.locator('[data-testid=payout-line]').first().innerText()), 'payout recorded: 30 % commission, 70 % to the seller, waiting for the hand-over');
await seller.locator('[data-testid=payout-details] select[name=method]').selectOption('bank');
await seller.locator('[data-testid=payout-details] textarea[name=details]').fill('BNI 0000000000 a.n. Seller Kopi, SWIFT BNINIDJA');
await seller.locator('[data-testid=payout-details] button[type=submit]').click();
await settle(seller, 'payout-details');
await seller.locator('[data-testid=handover-epp] button').first().click();
await seller.waitForTimeout(2500);
await bidder.goto(BASE + '/portal/auction', { waitUntil: 'networkidle' });
ok(/The seller sent the transfer code/.test(await bidder.locator('[data-testid=my-wins]').innerText()), 'the buyer sees that the code was sent');
await bidder.locator('[data-testid=handover-received] button').first().click();
await bidder.waitForTimeout(2500);
await seller.goto(BASE + '/portal/auction', { waitUntil: 'networkidle' });
ok(/being paid to you/.test(await seller.locator('[data-testid=payout-line]').first().innerText()), 'buyer confirmation makes the payout due');

await admin.goto(BASE + '/portal/admin/auction', { waitUntil: 'networkidle' });
const pay = admin.locator('[data-testid=desk-payouts] li', { hasText: memberDomain }).first();
await pay.getByRole('button', { name: /Reveal payout details/ }).click();
await pay.locator('pre').waitFor({ timeout: 20000 }).catch(() => {});
ok(/BNI 0000000000/.test(await pay.innerText()), 'the admin reveals the encrypted payout details');
await pay.locator('input[name=reference]').fill('PAYOUT-1');
await pay.getByRole('button', { name: /Mark paid/ }).click();
await admin.waitForTimeout(2500);
await seller.goto(BASE + '/portal/auction', { waitUntil: 'networkidle' });
ok(/— paid/.test(await seller.locator('[data-testid=payout-line]').first().innerText()), 'the seller sees the payout as paid');

// ── 6. admin view of the closed lot; pages without errors ─────────────────
for (const [p, path] of [[admin, '/portal/admin/auction'], [bidder, '/auction'], [bidder, '/portal/auction'], [seller, lotUrl.replace(BASE, '')]]) {
  const res = await p.goto(BASE + path, { waitUntil: 'networkidle' });
  ok((res?.status() ?? 0) < 400 && !/Application error|Something went wrong/.test(await bodyText(p)), `renders ${path}`);
}
ok(errors.length === 0, 'no page errors', errors.join(' | '));

await browser.close();
doh.close();
console.log(`\n${out.filter((l) => l.startsWith('PASS')).length}/${out.length} passed`);
process.exit(out.some((l) => l.startsWith('FAIL')) ? 1 : 0);
