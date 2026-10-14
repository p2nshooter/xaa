// PayPal Checkout, end to end, against a local build and the PayPal stand-in.
//
//   node tools/e2e/paypal-mock.mjs &
//   npx wrangler dev --local --port 8821 --var PAYPAL_SANDBOX_API:http://127.0.0.1:8899
//   node tools/e2e/paypal.mjs
//
// Proves: the starter BNI EUR + USD accounts are there on a fresh database;
// the USD account quotes dollars; the admin can store Sandbox credentials,
// test them and switch checkout to Sandbox; a client pays a deposit with
// PayPal and it is confirmed on return with no admin action; cancelling
// charges nothing; a template order is paid and unlocked; a buyer who closes
// the tab is still booked by the webhook; the admin sees the ledger; a forged
// webhook for an unknown order is ignored; no page throws.

import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://127.0.0.1:8821';
const MOCK = process.env.MOCK || 'http://127.0.0.1:8899';
const fails = [];
const errors = [];
function check(name, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
  if (!ok) fails.push(name);
}

const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const STAMP = Date.now();
const watch = (page, who) => {
  page.on('pageerror', (e) => errors.push(`${who}@${page.url().replace(BASE, '')}: ${e.message}`));
  page.on('console', (m) => {
    // Third-party hosts (ads, analytics) are unreachable from an offline test box.
    if (m.type() === 'error' && !/favicon|status of 404|ERR_TUNNEL_CONNECTION_FAILED|ERR_NAME_NOT_RESOLVED/.test(m.text())) errors.push(`${who}@${page.url().replace(BASE, '')} console: ${m.text()}`);
  });
};

// ── Admin ───────────────────────────────────────────────────────────────
const admin = await browser.newContext({ baseURL: BASE });
const ap = await admin.newPage();
watch(ap, 'admin');
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
  await ap.waitForURL('**/portal', { timeout: 20000 }).catch(() => {});
}
check('admin signs in', ap.url().endsWith('/portal'), ap.url());

await ap.goto('/portal/admin/payments');
let text = (await ap.textContent('body')) ?? '';
check('starter BNI EUR account is in place', text.includes('BNI · EUR account'));
check('starter BNI USD account is in place', text.includes('BNI · USD account'));
check('PayPal Checkout shows as off before setup', /PayPal Checkout/.test(text) && /Off — credentials missing/.test(text));

// Store Sandbox credentials and switch checkout to Sandbox.
await ap.goto('/portal/admin/settings');
const ppForm = ap.locator('form', { has: ap.locator('input[name=paypal_sandbox_client_id]') });
await ppForm.locator('select[name=paypal_mode]').selectOption('sandbox');
await ppForm.locator('input[name=paypal_sandbox_client_id]').fill('mock-sandbox-client-id');
await ppForm.locator('input[name=paypal_sandbox_client_secret]').fill('mock-sandbox-secret');
await ppForm.locator('button[type=submit]').click();
await ap.waitForTimeout(2000);
check('PayPal settings saved', /Saved \d+ field/.test((await ppForm.textContent()) ?? ''));
const html = await ap.content();
check('the stored secret never comes back to the page', !html.includes('mock-sandbox-secret'));

await ap.goto('/portal/admin/settings');
// An admin can still reveal a stored secret on purpose (Show), from inside the settings form.
const secretField = ap.locator('label', { has: ap.locator('input[name=paypal_sandbox_client_secret]') });
await secretField.getByRole('button', { name: 'Show' }).click();
await ap.waitForTimeout(1500);
check('admin can reveal the stored secret on purpose', /mock-sandbox-secret/.test((await secretField.textContent()) ?? ''));
const testForm = ap.locator('form', { has: ap.locator('input[name=env][value=sandbox]') });
await testForm.locator('button[type=submit]').click();
await ap.waitForTimeout(2500);
check('Sandbox credentials test passes', /PayPal accepted these credentials/.test((await testForm.textContent()) ?? ''), (await testForm.textContent()) ?? '');
const liveTest = ap.locator('form', { has: ap.locator('input[name=env][value=live]') });
await liveTest.locator('button[type=submit]').click();
await ap.waitForTimeout(2000);
check('Live test says what is missing instead of calling PayPal', /enter the client ID and secret first/.test((await liveTest.textContent()) ?? ''));

// ── Client: deposit by PayPal ───────────────────────────────────────────
const client = await browser.newContext({ baseURL: BASE });
const cp = await client.newPage();
watch(cp, 'client');
await cp.goto('/register');
await cp.fill('input[name=name]', 'Pia Payer');
await cp.fill('input[name=email]', `pia${STAMP}@example.com`);
await cp.fill('input[name=company]', 'Payer Oy');
await cp.fill('input[name=password]', 'clientpass123');
await cp.fill('input[name=confirm]', 'clientpass123');
await cp.click('button[type=submit]');
await cp.waitForURL('**/portal', { timeout: 20000 }).catch(() => {});
check('client registers', cp.url().endsWith('/portal'), cp.url());

await cp.goto('/portal/new?package=company-profile');
await cp.waitForSelector('input[name=title]');
await cp.fill('input[name=title]', 'PayPal deposit test');
await cp.fill('textarea[name=scope]', 'Small company site.');
await cp.check('input[name=terms]');
await cp.click('aside button[type=submit]');
await cp.waitForURL('**/portal/projects/**', { timeout: 20000 }).catch(() => {});
const projectUrl = cp.url();
text = (await cp.textContent('body')) ?? '';
check('project opened awaiting deposit', /Awaiting 10% deposit/.test(text), projectUrl);
check('PayPal button offered with the deposit amount', /Pay €250 with/.test(text));
check('Sandbox is labelled as test money', /Test mode · PayPal sandbox/.test(text));
check('bank transfer offered alongside', /or pay by bank transfer/.test(text));

await cp.getByRole('button', { name: 'BNI · USD account' }).click();
text = (await cp.textContent('body')) ?? '';
check('USD account quotes dollars, rounded up', /Send \$270 \(USD\) to/.test(text), (text.match(/Send [^\n]{0,30} to/) ?? [''])[0]);
check('USD account shows SWIFT BNINIDJA', /BNINIDJA/.test(text));
await cp.getByRole('button', { name: 'BNI · EUR account' }).click();
text = (await cp.textContent('body')) ?? '';
check('EUR account quotes the exact euro amount', /Send €250 to/.test(text));

// Cancel first: nothing may be charged or booked.
await cp.locator('.btn-paypal').click();
await cp.waitForURL(`${MOCK}/checkoutnow**`, { timeout: 20000 });
await cp.click('#cancel');
await cp.waitForURL('**/portal/projects/**', { timeout: 20000 });
text = (await cp.textContent('body')) ?? '';
check('cancel returns to the project with a plain notice', /PayPal payment cancelled/.test(text) && cp.url().includes('paypal=cancelled'));
check('cancel leaves the deposit unpaid', /Awaiting 10% deposit/.test(text));

// A crafted link cannot put its own words on the payment page.
await cp.goto(`${projectUrl}?paypal=failed&reason=evil&msg=${encodeURIComponent('Wire the money to IBAN XX00 EVIL')}`);
text = await cp.innerText('body');
check('a crafted ?msg= is never shown', !/EVIL/.test(text) && /Nothing was booked/.test(text));
await cp.goto(projectUrl);

// Now pay.
await cp.locator('.btn-paypal').click();
await cp.waitForURL(`${MOCK}/checkoutnow**`, { timeout: 20000 });
check('PayPal page asks for exactly €250', /Pay 250\.00 EUR/.test((await cp.textContent('body')) ?? ''));
await cp.click('#approve');
await cp.waitForURL('**/portal/projects/**', { timeout: 30000 });
text = (await cp.textContent('body')) ?? '';
check('return confirms the payment on the spot', /Payment received/.test(text) && cp.url().includes('paypal=done'), cp.url());
check('deposit no longer awaited — status moved on by itself', !/Awaiting 10% deposit/.test(text));
check('timeline credits PayPal with an automatic confirmation', /verified automatically/.test(text));

// Re-opening the return link must not book the money twice.
const orders = await (await fetch(`${MOCK}/__orders`)).json();
// The stand-in keeps orders across runs: take this run's deposit, the newest one.
const paid = orders.filter((o) => o.status === 'COMPLETED' && o.purchase_units[0].amount.value === '250.00').pop();
const returnHit = await cp.request.get(`/api/paypal/return?c=${encodeURIComponent(paid.purchase_units[0].custom_id)}&token=${paid.id}`, { maxRedirects: 0 });
check('a repeated return is answered without re-booking', returnHit.status() === 303 && /paypal=done/.test(returnHit.headers().location ?? ''));
await cp.goto(projectUrl);
text = await cp.innerText('body'); // visible text only — textContent also holds the RSC payload
check('deposit booked exactly once', (text.match(/Payment confirmed — €250/g) ?? []).length === 1);

// ── Client: template order by PayPal ────────────────────────────────────
await cp.goto('/templates/waitlist');
await cp.locator('form', { has: cp.locator('input[name=slug]') }).locator('button[type=submit]').first().click();
await cp.waitForURL('**/portal/orders/**', { timeout: 20000 });
const orderUrl = cp.url();
text = (await cp.textContent('body')) ?? '';
check('template order offers PayPal', /Pay €390 with/.test(text));
await cp.locator('.btn-paypal').click();
await cp.waitForURL(`${MOCK}/checkoutnow**`, { timeout: 20000 });
await cp.click('#approve');
await cp.waitForURL('**/portal/orders/**', { timeout: 30000 });
text = (await cp.textContent('body')) ?? '';
check('template order is paid on return', /Paid — download ready/.test(text) && /Payment received/.test(text), orderUrl);

// ── Webhook: the buyer approves and closes the tab ──────────────────────
await cp.goto('/templates/linkinbio');
await cp.locator('form', { has: cp.locator('input[name=slug]') }).locator('button[type=submit]').first().click();
await cp.waitForURL('**/portal/orders/**', { timeout: 20000 });
const order2Url = cp.url();
await cp.locator('.btn-paypal').click();
await cp.waitForURL(`${MOCK}/checkoutnow**`, { timeout: 20000 });
const token = new URL(cp.url()).searchParams.get('token');
await cp.click('#approve-close');
await cp.waitForSelector('#closed');
const hook = await fetch(`${BASE}/api/paypal/webhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ event_type: 'CHECKOUT.ORDER.APPROVED', resource: { id: token, status: 'APPROVED' } }),
});
const hookBody = await hook.json().catch(() => ({}));
check('webhook captures an approved order nobody returned from', hook.ok && /completed/.test(hookBody.note ?? ''), JSON.stringify(hookBody));
await cp.goto(order2Url);
check('order paid through the webhook', /Paid — download ready/.test((await cp.textContent('body')) ?? ''));

// No webhook at all: the buyer approves, closes the tab, and comes back to the
// order a minute later — the page itself asks PayPal and confirms the payment.
await cp.goto('/templates/crm-starter');
await cp.locator('form', { has: cp.locator('input[name=slug]') }).locator('button[type=submit]').first().click();
await cp.waitForURL('**/portal/orders/**', { timeout: 20000 });
const order3Url = cp.url();
await cp.locator('.btn-paypal').click();
await cp.waitForURL(`${MOCK}/checkoutnow**`, { timeout: 20000 });
await cp.click('#approve-close');
await cp.waitForSelector('#closed');
await cp.goto(order3Url);
// innerText follows CSS (badges are upper-cased), hence the i flag.
check('a fresh approval is not captured behind the buyer\'s back within the first minute', !/Paid — download ready/i.test(await cp.innerText('body')) && /Awaiting payment/i.test(await cp.innerText('body')));
await cp.waitForTimeout(61_000);
await cp.goto(order3Url);
check('revisiting the order confirms a tab-closed payment without any webhook', /Paid — download ready/i.test(await cp.innerText('body')));

const forged = await fetch(`${BASE}/api/paypal/webhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ event_type: 'PAYMENT.CAPTURE.COMPLETED', resource: { id: 'X', supplementary_data: { related_ids: { order_id: 'NOT-OURS' } } } }),
});
check('a webhook for an unknown order is ignored', forged.ok && /not ours/.test(JSON.stringify(await forged.json())));

// ── Admin ledger ────────────────────────────────────────────────────────
await ap.goto('/portal/admin/payments');
text = (await ap.textContent('body')) ?? '';
check('admin sees PayPal on in Sandbox', /On · Sandbox \(test money\)/.test(text));
check('admin ledger lists completed checkouts', (text.match(/completed/g) ?? []).length >= 4);
check('admin ledger lists the cancelled one', /cancelled/.test(text));

// ── Mobile width: the PayPal button fits ────────────────────────────────
const phone = await browser.newContext({ baseURL: BASE, viewport: { width: 375, height: 800 }, storageState: await client.storageState() });
const pp = await phone.newPage();
watch(pp, 'mobile');
for (const path of [projectUrl, '/payments']) {
  await pp.goto(path, { waitUntil: 'networkidle' });
  const wide = await pp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check(`no horizontal scroll at 375px: ${path.replace(BASE, '')}`, !wide);
}
await pp.goto('/templates/formbuilder');
await pp.locator('form', { has: pp.locator('input[name=slug]') }).locator('button[type=submit]').first().click();
await pp.waitForURL('**/portal/orders/**', { timeout: 20000 });
const box = await pp.locator('.btn-paypal').boundingBox();
await pp.waitForLoadState('networkidle');
const overflow = await pp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
check('PayPal button fits a 375px screen', !!box && box.width <= 375 && box.x >= 0, JSON.stringify(box));
check('no horizontal scroll on mobile', !overflow);
await pp.screenshot({ path: process.env.SHOT || '/tmp/xaa-paypal-mobile.png', fullPage: false });

check('no page or console errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join('; ')}` : '\nALL PASS');
process.exit(fails.length ? 1 : 0);
