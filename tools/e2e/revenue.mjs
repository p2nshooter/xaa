// Revenue feed for the AXTO & XAA investor portal, end to end, against a local build.
// Run after paypal.mjs on the same local database, so sandbox payments exist:
//
//   node tools/e2e/paypal-mock.mjs &
//   npx wrangler dev --local --port 8821 --var PAYPAL_SANDBOX_API:http://127.0.0.1:8899 \
//     --var ADMIN_EMAIL:admin@xaa.es --var ADMIN_PASSWORD:supersecret123
//   node tools/e2e/paypal.mjs && node tools/e2e/revenue.mjs
//
// Proves: without a token the feed answers 401 (garbage tokens too); the admin
// turns it on in Settings and gets a token shown once; with it the feed returns
// exactly the confirmed payments and paid template orders of the database —
// never a PayPal sandbox payment nor a refunded one (fixture rows are written
// to the local D1 for this and removed afterwards) — as amounts and times only
// (no client, no project, no reference); a new token retires the old one;
// turning the feed off shuts it; no page throws.

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';

const BASE = process.env.BASE || 'http://127.0.0.1:8821';
const fails = [];
const errors = [];
function check(name, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
  if (!ok) fails.push(name);
}
// wrangler dev closes idle keep-alive sockets while the fixtures are written; a
// request that lands on such a socket is retried, the server itself is fine.
async function feed(token, since = '2020-01-01') {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(`${BASE}/api/revenue?since=${since}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
    } catch (err) {
      if (attempt >= 2 || err?.cause?.code !== 'UND_ERR_SOCKET') throw err;
      await new Promise((r) => setTimeout(r, 300));
    }
  }
}
/** Ground truth straight from the local D1 the dev server uses. */
function d1(sql) {
  const out = execFileSync('npx', ['wrangler', 'd1', 'execute', 'xaa-portal', '--local', '--json', '--command', sql], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  return JSON.parse(out)[0]?.results ?? [];
}

// ── Closed without a token ──────────────────────────────────────────────
check('no token → 401', (await feed('')).status === 401);
check('a made-up token → 401', (await feed(`xrf_${'0'.repeat(64)}`)).status === 401);
check('a malformed token → 401', (await feed('not-a-token')).status === 401);

// ── The admin turns the feed on ─────────────────────────────────────────
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ baseURL: BASE });
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push(`${page.url().replace(BASE, '')}: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error' && !/favicon|status of 404|ERR_TUNNEL_CONNECTION_FAILED|ERR_NAME_NOT_RESOLVED/.test(m.text())) errors.push(`${page.url().replace(BASE, '')} console: ${m.text()}`);
});
await page.goto('/login');
await page.fill('input[name=email]', 'admin@xaa.es');
await page.fill('input[name=password]', 'supersecret123');
await page.click('button[type=submit]');
await page.waitForURL('**/portal', { timeout: 20000 }).catch(() => {});
check('admin signs in', page.url().endsWith('/portal'), page.url());

async function newToken() {
  await page.goto('/portal/admin/settings#settings-revenue');
  const panel = page.locator('#settings-revenue');
  await panel.locator('button', { hasText: /create a new token|turn on and create a token/i }).click();
  await panel.locator('[data-testid=revenue-feed-token]').waitFor({ timeout: 15000 });
  return ((await panel.locator('[data-testid=revenue-feed-token]').textContent()) ?? '').trim();
}
const token = await newToken();
check('a token is shown once, in the expected form', /^xrf_[0-9a-f]{64}$/.test(token));
await page.goto('/portal/admin/settings');
check('the token is not shown again after a reload', !(await page.content()).includes(token));
check('the panel shows the feed as on', /On · token from/.test((await page.locator('[data-testid=revenue-feed-state]').textContent()) ?? ''));

// ── Fixtures: a real bank payment and template sale, and a refunded live PayPal payment ──
const STAMP = Date.now();
const at = new Date().toISOString();
const ids = { bank: `e2e-rev-bank-${STAMP}`, tpl: `e2e-rev-tpl-${STAMP}`, refunded: `e2e-rev-refund-${STAMP}`, checkout: `e2e-rev-co-${STAMP}` };
d1(`INSERT INTO payments (id, project_id, user_id, milestone, label, amount, method, status, created_at, confirmed_at)
      VALUES ('${ids.bank}', 'e2e-rev', 'e2e-rev', 'deposit', 'E2E bank', 1234, 'bank', 'confirmed', '${at}', '${at}'),
             ('${ids.refunded}', 'e2e-rev', 'e2e-rev', 'final', 'E2E refunded', 4321, 'paypal', 'confirmed', '${at}', '${at}')`);
d1(`INSERT INTO template_orders (id, ref, slug, name, user_id, price, status, method, created_at, confirmed_at)
      VALUES ('${ids.tpl}', 'E2E-REV', 'e2e', 'E2E template', 'e2e-rev', 77, 'paid', 'bank', '${at}', '${at}')`);
d1(`INSERT INTO paypal_checkouts (id, paypal_order_id, env, kind, user_id, project_id, milestone, amount, status, payment_id, detail, created_at, updated_at)
      VALUES ('${ids.checkout}', 'E2E-ORDER-${STAMP}', 'live', 'milestone', 'e2e-rev', 'e2e-rev', 'final', 4321, 'completed', '${ids.refunded}', 'PayPal refunded this payment.', '${at}', '${at}')`);

// ── With the token: exactly the confirmed revenue, nothing else ─────────
const r = await feed(token);
check('with the token → 200', r.status === 200, String(r.status));
const body = await r.json();
const tx = body.transactions ?? [];
check('every row is an amount, a time and a kind — nothing about clients', tx.every((t) => Object.keys(t).sort().join() === 'amount,at,currency,kind' && t.currency === 'EUR'));

const truth = [
  ...d1(`SELECT p.id, p.confirmed_at AS at, p.amount AS amount, c.env AS env, c.detail AS detail
           FROM payments p LEFT JOIN paypal_checkouts c ON c.payment_id = p.id WHERE p.status = 'confirmed' AND p.confirmed_at IS NOT NULL`),
  ...d1(`SELECT t.id, t.confirmed_at AS at, t.price AS amount, c.env AS env, c.detail AS detail
           FROM template_orders t LEFT JOIN paypal_checkouts c ON c.template_order_id = t.id WHERE t.status = 'paid' AND t.confirmed_at IS NOT NULL`),
];
const excluded = (t) => t.env === 'sandbox' || /^PayPal (refunded|reversed)/.test(t.detail || '');
const sandbox = truth.filter((t) => t.env === 'sandbox');
const real = truth.filter((t) => !excluded(t));
check('the database holds sandbox payments to leave out (from paypal.mjs)', sandbox.length > 0, `${sandbox.length}`);
const key = (t) => `${t.at}|${Number(t.amount)}`;
const fedKeys = tx.map(key);
check('no sandbox payment is in the feed', sandbox.every((t) => !fedKeys.includes(key(t))));
check('a refunded PayPal payment is not in the feed', !tx.some((t) => t.at === at && t.amount === 4321));
check('a confirmed bank payment is in the feed', tx.some((t) => t.at === at && t.amount === 1234 && t.kind === 'milestone'));
check('a paid template order is in the feed', tx.some((t) => t.at === at && t.amount === 77 && t.kind === 'template'));
check('the feed is exactly the real confirmed revenue', tx.length === real.length && real.every((t) => fedKeys.includes(key(t))), `${tx.length} fed / ${real.length} real`);
check('rows come oldest first', tx.every((t, i) => i === 0 || tx[i - 1].at <= t.at));
const later = await (await feed(token, '2999-01-01')).json();
check('since filters by date', Array.isArray(later.transactions) && later.transactions.length === 0);
check('a bad date → 400', (await feed(token, 'yesterday')).status === 400);

// ── Rotation and switching off ──────────────────────────────────────────
const second = await newToken();
check('a new token works', (await feed(second)).status === 200);
check('the old token stopped working', (await feed(token)).status === 401);
await page.goto('/portal/admin/settings#settings-revenue');
await page.locator('#settings-revenue button', { hasText: /turn the feed off/i }).click();
await page.waitForTimeout(2500);
check('turning the feed off shuts it', (await feed(second)).status === 401);

// Leave the database as it was found.
d1(`DELETE FROM paypal_checkouts WHERE id = '${ids.checkout}'`);
d1(`DELETE FROM payments WHERE id IN ('${ids.bank}', '${ids.refunded}')`);
d1(`DELETE FROM template_orders WHERE id = '${ids.tpl}'`);

check('no page errors', errors.length === 0, errors.join(' | ').slice(0, 400));
await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASS');
process.exit(fails.length ? 1 : 0);
