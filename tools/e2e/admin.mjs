import { chromium } from 'playwright';
const BASE = 'http://127.0.0.1:8820';
const fails = [];
const check = (n, ok, x = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? ' — ' + x : ''}`); if (!ok) fails.push(n); };

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

// Admin = first account on a clean DB
const ac = await b.newContext({ baseURL: BASE }); const ap = await ac.newPage();
ap.on('pageerror', e => console.log('  [admin err]', e.message));
await ap.goto('/register');
await ap.fill('input[name=name]', 'Studio Admin');
await ap.fill('input[name=email]', 'admin@xaa.es');
await ap.fill('input[name=password]', 'supersecret123');
await ap.fill('input[name=confirm]', 'supersecret123');
await ap.click('button[type=submit]');
await ap.waitForURL('**/portal', { timeout: 20000 }).catch(() => {});
check('admin registered', ap.url().endsWith('/portal'));

// ── Payment destinations CRUD ──────────────────────────────────────────
await ap.goto('/portal/admin/payments', { waitUntil: 'networkidle' });
let body = await ap.textContent('body');
check('encryption self-test passes', /Self-test passed/.test(body ?? ''));
check('warns when no destination exists', /clients cannot pay/i.test(body ?? ''));

const ADDR = 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE';
await ap.selectOption('select[name=kind]', 'crypto');
await ap.fill('input[name=label]', 'USDT · TRC20');
await ap.selectOption('select[name=network]', 'TRC20');
await ap.fill('input[name=address]', ADDR);
await ap.fill('textarea[name=instructions]', 'Send only USDT on TRC20.');
await ap.locator('form', { has: ap.locator('input[name=label]') }).locator('button[type=submit]').click();
await ap.waitForTimeout(2500);
await ap.goto('/portal/admin/payments', { waitUntil: 'networkidle' });
body = await ap.textContent('body');
check('destination created', /USDT · TRC20/.test(body ?? ''));
check('address is masked in admin list', body.includes('TQn9Y2') && !body.includes(ADDR), 'full address must not appear');

// PayPal too
await ap.selectOption('select[name=kind]', 'paypal');
await ap.fill('input[name=label]', 'PayPal');
await ap.fill('input[name=address]', 'billing@xaa.es');
await ap.locator('form', { has: ap.locator('input[name=label]') }).locator('button[type=submit]').click();
await ap.waitForTimeout(2500);
await ap.goto('/portal/admin/payments', { waitUntil: 'networkidle' });
check('second destination created', /PayPal/.test(await ap.textContent('body') ?? ''));

// ── Encrypted settings ────────────────────────────────────────────────
await ap.goto('/portal/admin/settings', { waitUntil: 'networkidle' });
await ap.fill('input[name=company_name]', 'XAA Studio SL');
await ap.fill('input[name=company_tax_id]', 'ESB12345678');
await ap.locator('form', { has: ap.locator('input[name=company_name]') }).locator('button[type=submit]').click();
await ap.waitForTimeout(2500);
// a secret
await ap.goto('/portal/admin/settings', { waitUntil: 'networkidle' });
await ap.fill('input[name=smtp_api_key]', 'super-secret-api-key-123456');
await ap.locator('form', { has: ap.locator('input[name=smtp_api_key]') }).locator('button[type=submit]').click();
await ap.waitForTimeout(2500);
await ap.goto('/portal/admin/settings', { waitUntil: 'networkidle' });
body = await ap.textContent('body');
const html = await ap.content();
check('plain setting persisted', /XAA Studio SL/.test(html));
check('secret stored', /1 secret stored|secrets stored/.test(body ?? ''));
check('secret never returned to the browser', !html.includes('super-secret-api-key-123456'), 'plaintext must not be in the page');

// ── Client journey with DB-backed destinations ────────────────────────
const cc = await b.newContext({ baseURL: BASE }); const cp = await cc.newPage();
cp.on('pageerror', e => console.log('  [client err]', e.message));
const S = Date.now();
await cp.goto('/register');
await cp.fill('input[name=name]', 'Ana Client');
await cp.fill('input[name=email]', `ana${S}@example.com`);
await cp.fill('input[name=company]', 'Nordvik AB');
await cp.fill('input[name=password]', 'clientpass123');
await cp.fill('input[name=confirm]', 'clientpass123');
await cp.click('button[type=submit]');
await cp.waitForTimeout(2500);

await cp.goto('/portal/new?package=company-profile');
await cp.fill('input[name=title]', 'Nordvik site');
await cp.check('input[name=terms]');
await cp.click('aside button[type=submit]');
await cp.waitForURL('**/portal/projects/**', { timeout: 20000 }).catch(() => {});
const projectUrl = cp.url();
check('project opened', /\/portal\/projects\//.test(projectUrl));

body = await cp.textContent('body');
check('client sees the admin-entered destination', /USDT · TRC20/.test(body ?? ''));
check('client sees the real address in full', (await cp.content()).includes(ADDR));
check('both destinations offered', /PayPal/.test(body ?? ''));
check('business data upload present', /Business & member data|Business &amp; member data/.test(await cp.content()));

await cp.fill('input[name=reference]', 'TX-DEPOSIT-0001');
await cp.fill('input[name=amount]', '250');
await cp.locator('form', { has: cp.locator('input[name=reference]') }).locator('button[type=submit]').click();
await cp.waitForTimeout(2500);
await cp.reload();
check('payment recorded', /pending/i.test(await cp.textContent('body') ?? ''));

// ── Invoice ───────────────────────────────────────────────────────────
const invLink = await cp.locator('a[href^="/portal/invoices/"]').first().getAttribute('href');
check('invoice link on the project page', Boolean(invLink), invLink ?? 'none');
if (invLink) {
  await cp.goto(invLink, { waitUntil: 'networkidle' });
  const inv = await cp.content();
  check('invoice renders', /Invoice|Receipt/.test(inv));
  check('invoice is numbered', /XAA-INV-/.test(inv));
  check('invoice uses the company name from settings', /XAA Studio SL/.test(inv));
  check('invoice shows the tax number', /ESB12345678/.test(inv));
  const num1 = (inv.match(/XAA-INV-[A-Z0-9-]+/) ?? [''])[0];
  await cp.reload();
  const num2 = ((await cp.content()).match(/XAA-INV-[A-Z0-9-]+/) ?? [''])[0];
  check('invoice number is stable across views', num1 === num2 && num1 !== '', `${num1} vs ${num2}`);
}

// ── Leads inbox ───────────────────────────────────────────────────────
const anon = await b.newContext({ baseURL: BASE }); const np = await anon.newPage();
await np.goto('/contact');
await np.fill('input[name=name]', 'Prospect Person');
await np.fill('input[name=email]', 'prospect@example.com');
await np.fill('textarea[name=message]', 'We need a marketplace for 300 vendors.');
await np.locator('form', { has: np.locator('textarea[name=message]') }).locator('button[type=submit]').click();
await np.waitForTimeout(2500);
check('enquiry accepted', /Thank you/i.test(await np.textContent('body') ?? ''));

await ap.goto('/portal/admin/leads', { waitUntil: 'networkidle' });
body = await ap.textContent('body');
check('lead appears in the inbox', /Prospect Person/.test(body ?? ''));
check('lead message readable', /300 vendors/.test(body ?? ''));
check('unread counter works', /1 unread/.test(body ?? ''));

// client must not reach admin
const r = await cp.goto('/portal/admin/payments');
check('client cannot open admin payments', !cp.url().includes('/admin'), cp.url());

await b.close();
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(' | ')}` : '\nALL ADMIN CHECKS PASSED');
process.exit(fails.length ? 1 : 0);
