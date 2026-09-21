import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const fails = [];
const check = (n, ok, x='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${x?' — '+x:''}`); if(!ok) fails.push(n); };
const base = 'file:///home/user/xaa/public/demos/';

// 1. Voter register — login + features
let p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push(e.message));
await p.goto(base + 'voter-list-demo.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(900);
check('voter-list: stamp visible', await p.locator('.xaa-demo-stamp').isVisible());
check('voter-list: demo hint shown', await p.locator('#xaa-demo-hint').count() > 0);
const pin = await p.locator('#m-sandi').inputValue();
check('voter-list: PIN auto-filled', pin === '12345', `got "${pin}"`);
const opts = await p.locator('#m-username option').count();
check('voter-list: accounts in dropdown', opts > 0, `${opts} options`);
await p.locator('#m-kirim').click();
await p.waitForTimeout(1200);
const appVisible = await p.locator('#aplikasi').evaluate(el => !el.classList.contains('sembunyi')).catch(() => false);
check('voter-list: login works', appVisible);
let body = await p.textContent('body');
check('voter-list: English UI', /Dashboard|Voter records|Sign in/.test(body ?? ''));
check('voter-list: data rendered', /DEMOPUTRA|SIMULINDO|CONTOHSARI|UJICOBAWAN|DUMIYANA|0000/.test(body ?? ''));
check('voter-list: no JS errors', errs.length === 0, errs.slice(0,2).join(' | '));
await p.screenshot({ path: '/tmp/demo-voter.png', fullPage: false });

// 2. DPT verification
const p2 = await ctx.newPage(); const e2 = [];
p2.on('pageerror', e => e2.push(e.message));
await p2.goto(base + 'dpt-verification-demo.html', { waitUntil: 'networkidle' });
await p2.waitForTimeout(900);
body = await p2.textContent('body');
check('dpt: stamp visible', await p2.locator('.xaa-demo-stamp').isVisible());
check('dpt: rows rendered', /DEMOPUTRA|SIMULINDO|CONTOHSARI|0000/.test(body ?? ''));
check('dpt: demo village label', /DEMO VILLAGE/i.test(body ?? ''));
check('dpt: no JS errors', e2.length === 0, e2.slice(0,2).join(' | '));
await p2.screenshot({ path: '/tmp/demo-dpt.png', fullPage: false });

// 3. Real count
const p3 = await ctx.newPage(); const e3 = [];
p3.on('pageerror', e => e3.push(e.message));
await p3.goto(base + 'real-count-demo.html', { waitUntil: 'networkidle' });
await p3.waitForTimeout(900);
body = await p3.textContent('body');
check('realcount: stamp visible', await p3.locator('.xaa-demo-stamp').isVisible());
check('realcount: demo candidates', /CANDIDATE DEMO A|Candidate Demo A/i.test(body ?? ''));
check('realcount: no JS errors', e3.length === 0, e3.slice(0,2).join(' | '));
await p3.screenshot({ path: '/tmp/demo-count.png', fullPage: false });

await b.close();
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(' | ')}` : '\nALL DEMO CHECKS PASSED');
process.exit(fails.length ? 1 : 0);
