// The xaa.es investor offering, end to end, against a local build:
//
//   npx wrangler dev --local --port 8821 --var ADMIN_EMAIL:admin@xaa.es --var ADMIN_PASSWORD:supersecret123
//   node tools/e2e/invest.mjs
//
// Proves: /invest renders in EN/ES/ID with the default terms (US$2,000,000
// round, US$50,000 minimum, 30 % pool), is noindex and out of the sitemap by
// default; it names xaa.es alone and never a joint AXTO & XAA offering; /acquire
// and the footer point at it; the old cross-site feed /api/revenue is gone. An
// application below the minimum is refused, a valid one lands in Studio desk →
// Investors and in Enquiries. The admin verifies the capital; the statement
// then counts exactly the confirmed revenue after verification — not a PayPal
// sandbox payment, not a refunded one, not revenue from before — at 0.75 %
// for US$50,000; a recorded payout reduces the balance. The investor, signed
// in with the email they applied with, sees the same statement in the portal.
// Settings change the page: indexing on → in the sitemap and indexable;
// paused → no form; the admin's show/hide switch (shown by default) hides the
// page, the footer link and the sitemap entry, and is in the audit log. No page throws.

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';

const BASE = process.env.BASE || 'http://127.0.0.1:8821';
const fails = [];
const errors = [];
function check(name, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
  if (!ok) fails.push(name);
}
function d1(sql) {
  const out = execFileSync('npx', ['wrangler', 'd1', 'execute', 'xaa-portal', '--local', '--json', '--command', sql], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  return JSON.parse(out)[0]?.results ?? [];
}
const STAMP = Date.now();
const INVESTOR = `investor-${STAMP}@example.com`;

const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
function watch(page, tag) {
  page.on('pageerror', (e) => errors.push(`${tag} ${page.url().replace(BASE, '')}: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|status of 404|ERR_TUNNEL_CONNECTION_FAILED|ERR_NAME_NOT_RESOLVED|googlesyndication|fonts\.g/.test(m.text())) errors.push(`${tag} ${page.url().replace(BASE, '')} console: ${m.text()}`);
  });
}

// ── The public page ─────────────────────────────────────────────────────
const vctx = await browser.newContext({ baseURL: BASE });
const v = await vctx.newPage();
watch(v, 'visitor');
await v.goto('/invest', { waitUntil: 'networkidle' });
let html = await v.content();
check('/invest renders', /Invest in xaa\.es\./.test(html));
check('default terms: US$2,000,000 round, US$50,000 minimum, 30 % pool', /\$2,000,000/.test(html) && /\$50,000/.test(html) && /30 %/.test(await v.locator('[data-testid=invest-terms]').textContent()));
check('US$50,000 is shown as 0.75 % of each sale', /0\.75 %/.test(await v.locator('[data-testid=invest-examples]').textContent()));
check('it is xaa.es only — no joint AXTO & XAA offering', !/AXTO (&|&amp;|and|y|dan) XAA/i.test(html) && !/axto\.io\/invest/.test(html));
check('noindex by default', /<meta name="robots" content="noindex/.test(html));
check('a risk notice is on the page', /Risk notice/.test(html) && /capital is at risk/i.test(html));
for (const [lang, word] of [['es', 'Invierte en xaa.es'], ['id', 'Berinvestasi di xaa.es']]) {
  await v.goto(`/invest?lang=${lang}`, { waitUntil: 'networkidle' });
  check(`/invest?lang=${lang} is translated`, (await v.content()).includes(word));
}
// Visiting ?lang= remembers the language (a cookie); come back to English for the rest.
await v.goto('/invest?lang=en', { waitUntil: 'networkidle' });
check('?lang=en switches back to English', (await v.content()).includes('Invest in xaa.es.'));
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
check('/invest is not in the sitemap by default', !sitemap.includes('/invest'));
check('the old cross-site revenue feed is gone', (await fetch(`${BASE}/api/revenue?since=2020-01-01`)).status === 404);
await v.goto('/acquire', { waitUntil: 'networkidle' });
html = await v.content();
check('/acquire points at the xaa.es investor page, not a joint one', html.includes('href="/invest"') && !/axto\.io\/invest/.test(html) && !/AXTO (&|&amp;|and) XAA/.test(html));
check('the footer links to /invest', (await v.locator('footer a[href="/invest"]').count()) > 0);

// ── Applying ────────────────────────────────────────────────────────────
await v.goto('/invest#apply', { waitUntil: 'networkidle' });
const form = v.locator('[data-testid=invest-form]');
async function apply(amount, expect) {
  await form.locator('input[name=name]').fill('Ines Investor');
  await form.locator('input[name=email]').fill(INVESTOR);
  await form.locator('input[name=company]').fill('Ines Capital');
  await form.locator('input[name=amount]').fill(amount);
  await form.locator('input[name=ack]').check();
  await form.locator('button[type=submit]').click();
  // Wait for this submission's answer, not a fixed time: the first server action of a cold build is slow.
  return form.locator('[role=alert], [role=status]').filter({ hasText: expect }).first().waitFor({ timeout: 30000 }).then(() => true, () => false);
}
check('below the minimum is refused', await apply('20000', /minimum ticket is \$50,000/i));
check('after the error the form keeps what was typed', (await form.locator('input[name=name]').inputValue()) === 'Ines Investor' && (await form.locator('input[name=amount]').inputValue()) === '20000');
check('a valid application is accepted', await apply('50000', /your application for \$50,000 is with the owner/i));

// ── The studio verifies ─────────────────────────────────────────────────
const actx = await browser.newContext({ baseURL: BASE });
const a = await actx.newPage();
watch(a, 'admin');
await a.goto('/login');
await a.fill('input[name=email]', 'admin@xaa.es');
await a.fill('input[name=password]', 'supersecret123');
await a.click('button[type=submit]');
await a.waitForURL('**/portal', { timeout: 20000 }).catch(() => {});
check('admin signs in', a.url().endsWith('/portal'), a.url());

await a.goto('/portal/admin/leads', { waitUntil: 'networkidle' });
check('the application is in Enquiries, badged', (await a.content()).includes(INVESTOR) && /xaa\.es investor/.test(await a.content()));
await a.goto('/portal/admin/investors', { waitUntil: 'networkidle' });
const app = a.locator('[data-testid=investor-application]', { hasText: INVESTOR });
check('the application is in Studio desk → Investors', (await app.count()) === 1);

// Revenue confirmed BEFORE verification must not be shared.
const before = new Date(Date.now() - 86_400_000).toISOString();
const ids = { before: `e2e-inv-before-${STAMP}`, bank: `e2e-inv-bank-${STAMP}`, refunded: `e2e-inv-ref-${STAMP}`, sandbox: `e2e-inv-sbx-${STAMP}`, tpl: `e2e-inv-tpl-${STAMP}`, co1: `e2e-inv-co1-${STAMP}`, co2: `e2e-inv-co2-${STAMP}` };
d1(`INSERT INTO payments (id, project_id, user_id, milestone, label, amount, method, status, created_at, confirmed_at)
      VALUES ('${ids.before}', 'e2e-inv', 'e2e-inv', 'deposit', 'E2E before', 9999, 'bank', 'confirmed', '${before}', '${before}')`);

await app.locator('[data-testid=investor-manage]').click();
await app.locator('input[name=capital]').fill('50000');
await app.locator('button', { hasText: 'Verify capital' }).click();
await a.waitForTimeout(2500);
await a.goto('/portal/admin/investors', { waitUntil: 'networkidle' });
const card = a.locator('[data-testid=investor-verified]', { hasText: INVESTOR });
check('verified: the stake moves to Verified investors', (await card.count()) === 1);
check('its share is 0.75 %', ((await card.locator('[data-testid=investor-share]').textContent()) ?? '').includes('0.75 %'));

// After verification: a bank payment (counts), a template sale (counts), a refunded live PayPal payment and a sandbox one (do not).
const at = new Date(Date.now() + 2000).toISOString();
d1(`INSERT INTO payments (id, project_id, user_id, milestone, label, amount, method, status, created_at, confirmed_at) VALUES
      ('${ids.bank}', 'e2e-inv', 'e2e-inv', 'deposit', 'E2E bank', 8000, 'bank', 'confirmed', '${at}', '${at}'),
      ('${ids.refunded}', 'e2e-inv', 'e2e-inv', 'final', 'E2E refunded', 5000, 'paypal', 'confirmed', '${at}', '${at}'),
      ('${ids.sandbox}', 'e2e-inv', 'e2e-inv', 'final', 'E2E sandbox', 7000, 'paypal', 'confirmed', '${at}', '${at}')`);
d1(`INSERT INTO template_orders (id, ref, slug, name, user_id, price, status, method, created_at, confirmed_at)
      VALUES ('${ids.tpl}', 'E2E-INV-${STAMP}', 'e2e', 'E2E template', 'e2e-inv', 2000, 'paid', 'bank', '${at}', '${at}')`);
d1(`INSERT INTO paypal_checkouts (id, paypal_order_id, env, kind, user_id, project_id, milestone, amount, status, payment_id, detail, created_at, updated_at) VALUES
      ('${ids.co1}', 'E2E-INV-R-${STAMP}', 'live', 'milestone', 'e2e-inv', 'e2e-inv', 'final', 5000, 'completed', '${ids.refunded}', 'PayPal refunded this payment.', '${at}', '${at}'),
      ('${ids.co2}', 'E2E-INV-S-${STAMP}', 'sandbox', 'milestone', 'e2e-inv', 'e2e-inv', 'final', 7000, 'completed', '${ids.sandbox}', 'Sandbox capture', '${at}', '${at}')`);

// Every other confirmed sale after verification counts too (other suites may have left some): read the truth.
const [{ v: verifiedAt }] = d1(`SELECT verified_at AS v FROM investors WHERE email = '${INVESTOR}'`);
const truth = [
  ...d1(`SELECT p.amount AS amount, c.env AS env, c.detail AS detail FROM payments p LEFT JOIN paypal_checkouts c ON c.payment_id = p.id
           WHERE p.status = 'confirmed' AND p.confirmed_at >= '${verifiedAt}'`),
  ...d1(`SELECT t.price AS amount, c.env AS env, c.detail AS detail FROM template_orders t LEFT JOIN paypal_checkouts c ON c.template_order_id = t.id
           WHERE t.status = 'paid' AND t.confirmed_at >= '${verifiedAt}'`),
].filter((r) => r.env !== 'sandbox' && !/^PayPal (refunded|reversed)/.test(r.detail || ''));
const revenue = truth.reduce((s, r) => s + Number(r.amount), 0);
const due = Math.round(revenue * 0.0075 * 100) / 100;
check('the fixtures count 10,000 of new revenue (bank 8,000 + template 2,000)', revenue >= 10_000, String(revenue));
const eur = (n) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(n);

await a.goto('/portal/admin/investors', { waitUntil: 'networkidle' });
const bal = (await card.locator('[data-testid=investor-balance]').textContent()) ?? '';
check('the balance is 0.75 % of exactly the counted revenue (no sandbox, refund or pre-verification money)', bal.includes(eur(due)), `${bal} vs ${eur(due)}`);

await card.locator('[data-testid=payout-form] input[name=amount]').fill('50');
await card.locator('[data-testid=payout-form] button[type=submit]').click();
await a.waitForTimeout(2500);
await a.goto('/portal/admin/investors', { waitUntil: 'networkidle' });
const bal2 = (await card.locator('[data-testid=investor-balance]').textContent()) ?? '';
check('a recorded payout reduces the balance', bal2.includes(eur(Math.round((due - 50) * 100) / 100)), bal2);

// ── The investor's own view ─────────────────────────────────────────────
await v.goto('/register');
await v.fill('input[name=name]', 'Ines Investor');
await v.fill('input[name=email]', INVESTOR);
await v.fill('input[name=password]', 'investor-pass-123');
await v.fill('input[name=confirm]', 'investor-pass-123');
await v.click('button[type=submit]');
await v.waitForURL('**/portal', { timeout: 20000 }).catch(() => {});
check('the portal home shows the investment', (await v.locator('[data-testid=portal-investor-card]').count()) === 1);
await v.goto('/portal/investor', { waitUntil: 'networkidle' });
check('the investor sees the 0.75 % share', ((await v.locator('[data-testid=statement-share]').textContent()) ?? '').includes('0.75 %'));
check('…and the same open balance as the studio', ((await v.locator('[data-testid=statement-balance]').textContent()) ?? '').includes(eur(Math.round((due - 50) * 100) / 100)));
check('no client data in the statement', !(await v.content()).includes('E2E bank'));

// A different account sees nothing.
const octx = await browser.newContext({ baseURL: BASE });
const o = await octx.newPage();
watch(o, 'other');
await o.goto('/register');
await o.fill('input[name=name]', 'Someone Else');
await o.fill('input[name=email]', `other-${STAMP}@example.com`);
await o.fill('input[name=password]', 'other-pass-123');
await o.fill('input[name=confirm]', 'other-pass-123');
await o.click('button[type=submit]');
await o.waitForURL('**/portal', { timeout: 20000 }).catch(() => {});
await o.goto('/portal/investor', { waitUntil: 'networkidle' });
check('another account sees no stake', (await o.locator('[data-testid=investor-none]').count()) === 1);

// ── Settings drive the page ─────────────────────────────────────────────
await a.goto('/portal/admin/settings#settings-invest', { waitUntil: 'networkidle' });
const sform = a.locator('form', { has: a.locator('select[name=invest_indexed]') });
await sform.locator('select[name=invest_indexed]').selectOption('yes');
await sform.locator('select[name=invest_status]').selectOption('paused');
await sform.locator('button[type=submit]').click();
await sform.locator('[role=status], [role=alert]').filter({ hasText: /\S/ }).first().waitFor({ timeout: 30000 }).catch(() => {});
console.log('  settings:', (await sform.locator('[role=status], [role=alert]').allTextContents()).join(' '));
await v.goto('/invest', { waitUntil: 'networkidle' });
html = await v.content();
check('indexing on → no noindex', !/<meta name="robots" content="noindex/.test(html));
check('indexing on → /invest in the sitemap', (await (await fetch(`${BASE}/sitemap.xml`)).text()).includes('/invest'));
check('paused → no application form', (await v.locator('[data-testid=invest-form]').count()) === 0 && /Applications are paused/.test(html));
await sform.locator('select[name=invest_indexed]').selectOption('no');
await sform.locator('select[name=invest_status]').selectOption('open');
await sform.locator('button[type=submit]').click();
await a.waitForTimeout(2500);

// ── Show / hide (guardian-ai BLUEPRINT-V4 §26.4; shown by default since 27 Oct 2026) ──
await a.goto('/portal/admin/investors', { waitUntil: 'networkidle' });
check('the offering is shown by default', /Shown/.test(await a.locator('[data-testid=invest-visibility]').innerText()));
await a.locator('[data-testid=invest-visibility] button[type=submit]').click();
await a.locator('[data-testid=invest-visibility] [role=status]').waitFor({ timeout: 30000 }).catch(() => {});
const hidden = await v.goto('/invest', { waitUntil: 'networkidle' });
check('hidden → /invest is a 404', hidden?.status() === 404);
await v.goto('/', { waitUntil: 'networkidle' });
check('hidden → no footer link', (await v.locator('footer a[href="/invest"]').count()) === 0);
check('hidden → not in the sitemap', !(await (await fetch(`${BASE}/sitemap.xml`)).text()).includes('/invest'));
await a.goto('/portal/admin/investors', { waitUntil: 'networkidle' });
check('the change is in the audit log', (await a.locator('[data-testid=invest-visibility-log] li').count()) > 0);
await a.locator('[data-testid=invest-visibility] button[type=submit]').click();
await a.waitForTimeout(2500);
check('shown again → /invest renders', (await v.goto('/invest', { waitUntil: 'networkidle' }))?.status() === 200);

// Leave the database as it was found.
d1(`DELETE FROM paypal_checkouts WHERE id IN ('${ids.co1}', '${ids.co2}')`);
d1(`DELETE FROM payments WHERE id IN ('${ids.before}', '${ids.bank}', '${ids.refunded}', '${ids.sandbox}')`);
d1(`DELETE FROM template_orders WHERE id = '${ids.tpl}'`);
d1(`DELETE FROM investor_payouts WHERE investor_id IN (SELECT id FROM investors WHERE email = '${INVESTOR}')`);
d1(`DELETE FROM investors WHERE email = '${INVESTOR}'`);

check('no page errors', errors.length === 0, errors.join(' | ').slice(0, 500));
await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASS');
process.exit(fails.length ? 1 : 0);
