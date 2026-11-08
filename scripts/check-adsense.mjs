// Fails when public/ads.txt, the meta tags and the loader would name different AdSense accounts (src/lib/adsense.ts).
// Owner, 7 Nov 2026: sixteen accounts stacked on every site — one ads.txt line and one meta tag per account, ONE loader.
//   node scripts/check-adsense.mjs
import { readFileSync } from 'node:fs';
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const site = read('src/lib/site.ts');
const lib = read('src/lib/adsense.ts');
const layout = read('src/app/layout.tsx');
const primary = (/adClient: '(ca-pub-\d{16})'/.exec(site) || [])[1];
const stack = [...(/ADSENSE_STACK = \[([\s\S]*?)\]/.exec(lib) || ['', ''])[1].matchAll(/ca-pub-\d{16}/g)].map((m) => m[0]);
const accounts = [...new Set([primary, ...stack])];
const want = accounts.map((a) => `google.com, ${a.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0`).join('\n') + '\n';
let bad = 0;
const ok = (c, what) => { console.log(`${c ? 'ok  ' : 'FAIL'}  ${what}`); if (!c) bad++; };
ok(Boolean(primary), `primary account ${primary}`);
ok(stack.length === 17 && new Set(stack).size === 17, `seventeen distinct stacked accounts, 8 Nov 2026 (${stack.length})`);
ok(read('public/ads.txt') === want, `public/ads.txt has exactly the ${accounts.length} lines, primary first`);
ok(/AD_ACCOUNTS\.map\(\(account\) => \(\s*<meta key=\{account\} name="google-adsense-account" content=\{account\} \/>/.test(layout), 'layout renders one meta tag per account');
ok((layout.match(/adsbygoogle\.js\?client=/g) || []).length === 1 && layout.includes('adsbygoogle.js?client=${SITE.adClient}'), 'layout has exactly one loader, the primary account');
ok(!/ca-pub-\d/.test(layout), 'layout hard-codes no publisher id');
if (bad) { console.log(`${bad} AdSense check(s) failed`); process.exit(1); }
console.log('ALL OK');
