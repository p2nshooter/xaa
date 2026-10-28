// The auction of xaa.es itself (docs/BLUEPRINT.md §14, requests 66 and 67) end to end, against a running Worker.
//
//   npx wrangler dev --local --port 8799
//   ADMIN_PASS=… node sale-auction.e2e.mjs [baseUrl]
//
// Proves: the admin opens a round at the weekly ladder's opening bid (US$10M from 28 Oct 2026, +US$100,000 a week);
// a visitor sees the live board (that opening bid, the next weekly rise, gold countdown, no hidden reserve, the
// day's minimum in the structured data) and is sent back to the auction after
// creating an account; registration refuses a brand name and waits for the owner's approval; the admin approves
// in Studio desk → Site auction; bids at the exact next price; the leader is told, the outbid member is told; the
// public board masks names and never shows an email; the desk shows the bidders' contact details; admins cannot
// bid; cancelling ends the round and the next round opens at the same ladder price; no horizontal scroll at
// phone width; no page throws.
import { chromium } from 'playwright-core';

const BASE = process.argv[2] || 'http://localhost:8799';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'alghoniy2026@gmail.com';
const ADMIN_PASS = process.env.ADMIN_PASS || '';
if (!ADMIN_PASS) throw new Error('ADMIN_PASS env var not set');
const STAMP = Date.now().toString(36);
const out = [];
const ok = (c, name, d = '') => { out.push(`${c ? 'PASS' : 'FAIL'}  ${name}${d ? '  — ' + d : ''}`); console.log(out.at(-1)); };
const errors = [];
const usd = (n) => `$${n.toLocaleString('en-US')}`;
const amountOf = (text) => Number(String(text).replace(/[^\d]/g, ''));
// The ladder with the default settings: US$10M from 28 Oct 2026 00:00 WIB, +US$100,000 for every full week.
const OPEN = 10_000_000 + 100_000 * Math.max(0, Math.floor((Date.now() - Date.parse('2026-10-27T17:00:00Z')) / (7 * 86_400_000)));

const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
async function page(tag, viewport) {
  const p = await (await browser.newContext(viewport ? { viewport } : {})).newPage();
  p.on('pageerror', (e) => errors.push(`${tag} ${p.url()}: ${e.message}`));
  p.on('dialog', (d) => d.accept());
  return p;
}
const bodyText = (p) => p.locator('body').innerText();
const msg = async (p, testid) => {
  const l = p.locator(`[data-testid=${testid}] [role=status], [data-testid=${testid}] [role=alert]`).first();
  await l.waitFor({ timeout: 30000 }).catch(() => {});
  return (await l.count()) ? l.innerText() : '';
};

async function adminLogin(p) {
  await p.goto(BASE + '/login', { waitUntil: 'networkidle' });
  for (let i = 0; i < 5; i += 1) await p.getByRole('button', { name: 'XAA' }).click();
  const form = p.locator('form').filter({ has: p.locator('input[name="next"][value="/portal/admin"]') });
  await form.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await form.locator('input[name="password"]').fill(ADMIN_PASS);
  await form.getByRole('button', { name: /Enter studio desk/ }).click();
  await p.waitForURL((u) => new URL(u).pathname.startsWith('/portal/admin'), { timeout: 20000 });
}
/** Sign up from the auction's own link, and land back on /acquire. */
async function signUp(p, name) {
  const email = `${name.toLowerCase().replace(/\W/g, '')}-${STAMP}@example.com`;
  await p.goto(BASE + '/acquire', { waitUntil: 'networkidle' });
  await p.locator('[data-testid=sale-action] a[href^="/register"]').click();
  await p.waitForURL((u) => new URL(u).pathname === '/register', { timeout: 20000 });
  await p.fill('input[name="name"]', name);
  await p.fill('input[name="email"]', email);
  await p.fill('input[name="company"]', `${name} Co`);
  await p.fill('input[name="password"]', 'member-pass-123');
  await p.fill('input[name="confirm"]', 'member-pass-123');
  await p.getByRole('button', { name: /Create account/ }).click();
  await p.waitForURL((u) => new URL(u).pathname === '/acquire', { timeout: 20000 });
  return email;
}
async function registerBidder(p, displayName) {
  const f = p.locator('[data-testid=sale-register]');
  await f.locator('input[name=displayName]').fill(displayName);
  await f.locator('input[name=country]').fill('Spain');
  await f.locator('input[name=phone]').fill('+34 600 123 456');
  await f.locator('input[name=funds]').fill('Bank letter on request');
  await f.getByRole('button', { name: /Register as a bidder/ }).click();
}
async function approve(admin, displayName) {
  await admin.goto(BASE + '/portal/admin/sale', { waitUntil: 'networkidle' });
  const row = admin.locator('[data-testid=sale-desk-bidders] li', { hasText: displayName }).first();
  await row.getByRole('button', { name: 'Approve' }).click();
  return msg(admin, (await row.locator('form').getAttribute('data-testid')) || '');
}
async function bidAtNext(p) {
  await p.goto(BASE + '/acquire#bid', { waitUntil: 'networkidle' });
  const input = p.locator('[data-testid=sale-amount-input]');
  const value = amountOf(await input.inputValue());
  await p.locator('[data-testid=sale-bid] button[type=submit]').click();
  await p.locator('[data-testid=sale-msg]').waitFor({ timeout: 30000 }).catch(() => {});
  return { value, text: await p.locator('[data-testid=sale-msg]').innerText().catch(() => '') };
}

const admin = await page('admin');
await adminLogin(admin);

// ── 1. the admin opens a round at the ladder's opening bid ────────────────
await admin.goto(BASE + '/portal/admin/sale', { waitUntil: 'networkidle' });
ok((await admin.locator('nav a[href="/portal/admin/sale"]').count()) === 1, 'the studio desk links to Site auction');
if (await admin.locator('[data-testid=sale-cancel]').count()) {
  await admin.locator('[data-testid=sale-cancel] input[name=note]').fill('e2e: fresh round');
  await admin.locator('[data-testid=sale-cancel] button[type=submit]').click();
  await msg(admin, 'sale-cancel');
  await admin.goto(BASE + '/portal/admin/sale', { waitUntil: 'networkidle' });
}
ok(amountOf(await admin.locator('[data-testid=desk-floor]').innerText()) === OPEN, 'the desk shows today\'s opening bid of the ladder', usd(OPEN));
await admin.locator('[data-testid=sale-start] button[type=submit]').click();
ok(new RegExp(`is open with an opening bid of \\${usd(OPEN)}`).test(await msg(admin, 'sale-start')), 'the admin opens a round at the ladder\'s opening bid');

// ── 2. a visitor sees the live board ──────────────────────────────────────
const guest = await page('guest');
await guest.goto(BASE + '/acquire', { waitUntil: 'networkidle' });
ok(amountOf(await guest.locator('[data-testid=sale-amount]').innerText()) === OPEN, 'the board shows the opening bid');
ok((await guest.locator('[data-testid=sale-rise]').innerText()).includes(usd(OPEN + 100_000)), 'the board says when the opening bid rises, and to what');
ok(/rises by \$100,000 every week/.test(await guest.locator('[data-testid=sale-hero-rise]').innerText()), 'the hero says the opening bid rises every week');
ok((await guest.locator('[data-testid=sale-auction] [data-testid=sale-countdown] .sauc-tile').count()) === 4, 'gold countdown tiles');
ok((await guest.locator('[data-testid=sale-hero] [data-testid=sale-countdown]').count()) === 1, 'the hero carries the countdown too');
ok(/No hidden reserve/.test(await bodyText(guest)), 'no hidden reserve is stated');
const ld = await guest.locator('script[type="application/ld+json"]').allInnerTexts();
ok(ld.some((t) => t.includes(`"minPrice":${OPEN}`)) && !ld.some((t) => /"price":10000000\b/.test(t)), 'structured data gives the day\'s minimum, not a fixed price');
ok(/at auction/.test(await guest.title()), 'the title says it is an auction', await guest.title());
ok(await guest.locator('[data-testid=sale-action] a[href="/register?next=%2Facquire%23bid"]').count() === 1, 'a visitor is asked to sign up or sign in');

// ── 3. members register, the admin approves, they bid ─────────────────────
const ana = await page('ana');
const anaEmail = await signUp(ana, 'Ana Lopez');
ok(new URL(ana.url()).pathname === '/acquire', 'sign-up returns to the auction');
await registerBidder(ana, 'Amazon Spain');
ok((await ana.locator('[data-testid=sale-msg]').innerText().catch(() => '')).length > 0, 'a brand name is refused');
ok((await ana.locator('[data-testid=sale-register] input[name=country]').inputValue()) === 'Spain', 'the form keeps what was typed');
await registerBidder(ana, 'Ana Capital');
await ana.locator('[data-testid=sale-pending]').waitFor({ timeout: 30000 }).catch(() => {});
ok((await ana.locator('[data-testid=sale-pending]').count()) === 1, 'registration waits for the owner\'s approval');
ok(/Ana Capital: approved/.test(await approve(admin, 'Ana Capital')), 'the admin approves the bidder');

const a1 = await bidAtNext(ana);
ok(a1.value === OPEN && /you hold the highest bid/.test(a1.text), 'the first bid at the opening bid leads', `${a1.value} ${a1.text}`);
ok(/You hold the highest bid/.test(await ana.locator('[data-testid=sale-action]').innerText()), 'the leader is told and the form steps aside');

const bruno = await page('bruno');
const brunoEmail = await signUp(bruno, 'Bruno Diaz');
await registerBidder(bruno, 'Bruno Ventures');
await bruno.locator('[data-testid=sale-pending]').waitFor({ timeout: 30000 }).catch(() => {});
await approve(admin, 'Bruno Ventures');
const b1 = await bidAtNext(bruno);
ok(b1.value === OPEN + 250_000 && /highest bid/.test(b1.text), 'the next bid is the high bid plus the raise', `${b1.value}`);

await ana.goto(BASE + '/acquire', { waitUntil: 'networkidle' });
ok(new RegExp(`outbid — your best bid was \\${usd(OPEN)}`).test(await ana.locator('[data-testid=sale-action]').innerText()), 'the outbid member is told');
ok(amountOf(await ana.locator('[data-testid=sale-amount-input]').inputValue()) === OPEN + 500_000, 'the amount moves to the new minimum');

// ── 4. what the public sees, and what the owner sees ──────────────────────
await guest.goto(BASE + '/acquire', { waitUntil: 'networkidle' });
const board = await guest.locator('[data-testid=sale-auction]').innerText();
ok(amountOf(await guest.locator('[data-testid=sale-amount]').innerText()) === OPEN + 250_000 && /Bids: 2/.test(board), 'the board shows the current bid and the count');
ok(/B•+/.test(board) && !/Bruno Ventures/.test(board), 'names are masked on the board');
const html = await guest.content();
ok(!html.includes(anaEmail) && !html.includes(brunoEmail) && !html.includes('+34 600'), 'no email or phone on the public page');

await admin.goto(BASE + '/portal/admin/sale', { waitUntil: 'networkidle' });
const bidsTable = await admin.locator('[data-testid=sale-desk-bids]').innerText();
ok(bidsTable.includes(brunoEmail) && bidsTable.includes(anaEmail) && bidsTable.includes(usd(OPEN + 250_000)), 'the desk lists the bids with the bidders\' emails');
ok(/\+34 600 123 456/.test(await admin.locator('[data-testid=sale-desk-bidders]').innerText()), 'the desk shows the bidders\' phones');
await admin.goto(BASE + '/acquire', { waitUntil: 'networkidle' });
ok(/Administrators run the auction and cannot bid/.test(await admin.locator('[data-testid=sale-action]').innerText()), 'admins cannot bid');

// ── 5. cancel, then the next round opens on the same ladder ───────────────
await admin.goto(BASE + '/portal/admin/sale', { waitUntil: 'networkidle' });
await admin.locator('[data-testid=sale-cancel] input[name=note]').fill('e2e: cancel');
await admin.locator('[data-testid=sale-cancel] button[type=submit]').click();
ok(/Round cancelled/.test(await msg(admin, 'sale-cancel')), 'the admin cancels the round');
await guest.goto(BASE + '/acquire', { waitUntil: 'networkidle' });
ok(/This round has ended/.test(await guest.locator('[data-testid=sale-auction]').innerText()), 'the board says the round ended');
await admin.goto(BASE + '/portal/admin/sale', { waitUntil: 'networkidle' });
await admin.locator('[data-testid=sale-start] button[type=submit]').click();
const opened = await msg(admin, 'sale-start');
const drawn = amountOf((opened.match(/\$[\d,]+/) || [''])[0]);
ok(drawn === OPEN, 'the next round opens at the ladder\'s price, not from scratch', usd(drawn));
await guest.goto(BASE + '/acquire', { waitUntil: 'networkidle' });
ok(amountOf(await guest.locator('[data-testid=sale-amount]').innerText()) === drawn, 'every visitor sees that same opening bid');

// ── 6. phone width, and no page errors ────────────────────────────────────
const phone = await page('phone', { width: 390, height: 844 });
for (const path of ['/acquire', '/register?next=%2Facquire%23bid']) {
  await phone.goto(BASE + path, { waitUntil: 'networkidle' });
  const over = await phone.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(over <= 0, `no horizontal scroll on ${path} at 390 px`, `${over}px`);
}
const phoneAdmin = await page('phone-admin', { width: 390, height: 844 });
await adminLogin(phoneAdmin);
await phoneAdmin.goto(BASE + '/portal/admin/sale', { waitUntil: 'networkidle' });
const overAdmin = await phoneAdmin.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
ok(overAdmin <= 0, 'no horizontal scroll on the desk at 390 px', `${overAdmin}px`);
for (const [p, path] of [[admin, '/portal/admin/sale'], [ana, '/acquire'], [guest, '/']]) {
  const res = await p.goto(BASE + path, { waitUntil: 'networkidle' });
  ok((res?.status() ?? 0) < 400 && !/Application error|Something went wrong/.test(await bodyText(p)), `renders ${path}`);
}
ok(errors.length === 0, 'no page errors', errors.join(' | '));

await browser.close();
console.log(`\n${out.filter((l) => l.startsWith('PASS')).length}/${out.length} passed`);
process.exit(out.some((l) => l.startsWith('FAIL')) ? 1 : 0);
