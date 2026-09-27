// Verifies the xaa.es SEO work against a running Worker.
const BASE = process.argv[2] || 'http://localhost:8799';
const out = [];
const ok = (c, name, d = '') => out.push(`${c ? 'PASS' : 'FAIL'}  ${name}${d ? '  — ' + d : ''}`);
const UA = {
  chrome: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36',
  google: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  whatsapp: 'WhatsApp/2.23.20.0',
  claude: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0)',
};
const head = (h) => h.split(/<\/head>/i)[0];
const get = (path, headers = {}) => fetch(BASE + path, { headers, redirect: 'manual' });
const attr = (h, re) => { const v = (h.match(re) || [])[1]; return v && v.replace(/&amp;/g, '&'); };

// 1. Metadata in <head> for every client, localised per language URL.
for (const [who, ua] of Object.entries(UA)) {
  const h = head(await (await get('/services', { 'user-agent': ua })).text());
  ok(/<title>[^<]{10,}/.test(h) && /name="description"/.test(h) && /property="og:title"/.test(h) && /rel="canonical"/.test(h), `metadata in <head> for ${who}`);
}
const expect = {
  '': { title: 'Website & platform development packages', canon: 'https://xaa.es/services' },
  '?lang=es': { title: 'Paquetes y precios de desarrollo web', canon: 'https://xaa.es/services?lang=es' },
  '?lang=id': { title: 'Paket & harga jasa pembuatan website', canon: 'https://xaa.es/services?lang=id' },
};
for (const [q, e] of Object.entries(expect)) {
  const res = await get('/services' + q, { 'user-agent': UA.google });
  const h = head(await res.text());
  const title = attr(h, /<title>([^<]*)/);
  const canon = attr(h, /rel="canonical" href="([^"]*)"/);
  const langs = [...h.matchAll(/hrefLang="([^"]+)" href="([^"]+)"/g)].map((m) => `${m[1]}=${m[2].replace('https://xaa.es', '')}`);
  ok(title?.includes(e.title), `title for /services${q}`, title);
  ok(canon === e.canon, `canonical for /services${q}`, canon);
  ok(langs.length === 4, `hreflang alternates for /services${q}`, langs.join(' '));
  ok(/og:locale" content="(en_US|es_ES|id_ID)"/.test(h) && /twitter:card" content="summary_large_image"/.test(h) && /og:image" content="https:\/\/xaa\.es\/og\/xaa-og\.jpg"/.test(h), `og/twitter for /services${q}`);
  if (q) ok(/xaa_lang=/.test(res.headers.get('set-cookie') ?? ''), `?lang sets sticky cookie (${q})`);
}
const home = head(await (await get('/', { 'user-agent': UA.google })).text());
ok(attr(home, /<title>([^<]*)/) === 'XAA — Web development studio: websites, SaaS & platforms', 'home title (absolute)', attr(home, /<title>([^<]*)/));
ok(attr(home, /rel="canonical" href="([^"]*)"/) === 'https://xaa.es', 'home canonical', attr(home, /rel="canonical" href="([^"]*)"/));

// A spoofed language header must not change anything; only the URL can.
const spoof = head(await (await get('/services', { 'user-agent': UA.google, 'x-xaa-lang': 'es' })).text());
ok(attr(spoof, /<title>([^<]*)/)?.startsWith('Website'), 'client-supplied x-xaa-lang header ignored');

// 2. Canonical origin redirects — checked with curl, since fetch() drops a custom Host header.
import { execFileSync } from 'node:child_process';
const curl = (args) => execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code} %{redirect_url}', ...args]).toString();
ok(curl(['-H', 'Host: www.xaa.es', BASE + '/services?x=1']) === '301 https://xaa.es/services?x=1', 'www → apex 301');
ok(curl(['-H', 'Host: xaa.es', '-H', 'X-Forwarded-Proto: http', BASE + '/faq']) === '301 https://xaa.es/faq', 'http → https 301');
ok(curl(['-H', 'Host: xaa.es', '-H', 'X-Forwarded-Proto: https', BASE + '/faq']).startsWith('200'), 'https visit not redirected (no loop)');
// 3. Security headers.
let r = await get('/');
for (const hname of ['strict-transport-security', 'x-content-type-options', 'x-frame-options', 'referrer-policy', 'permissions-policy', 'content-security-policy']) ok(Boolean(r.headers.get(hname)), `header ${hname}`, r.headers.get(hname) ?? 'missing');

// 4. llms.txt, sitemap, robots, 404.
r = await get('/llms.txt'); const llms = await r.text();
ok(r.status === 200 && llms.startsWith('# XAA') && /Landing Page\]\(https:\/\/xaa\.es\/services\/landing-page\) — €500/.test(llms), 'llms.txt', `${r.status}, ${llms.length} chars`);
const sm = await (await get('/sitemap.xml')).text();
ok(/xhtml:link[^>]+hreflang="es"[^>]+href="https:\/\/xaa\.es\/services\?lang=es"/.test(sm), 'sitemap carries hreflang alternates');
ok(/<loc>https:\/\/xaa\.es\/company\?lang=id<\/loc>/.test(sm), 'sitemap lists language URLs');
ok(!/\/portal|\/login|\/api\//.test(sm), 'sitemap has no private URLs');
r = await get('/no-such-page-xyz'); ok(r.status === 404, 'real 404', String(r.status));

// 5. Breadcrumbs: visible and as structured data.
for (const p of ['/services/landing-page', '/templates/waitlist', '/faq', '/company', '/privacy']) {
  const h = await (await get(p + '?lang=id')).text();
  const ld = /"@type":"BreadcrumbList"/.test(h);
  const vis = /aria-label="Breadcrumb"/.test(h) && />Beranda</.test(h);
  const dup = (h.match(/"@type":"BreadcrumbList"/g) || []).length;
  ok(ld && vis && dup === 1, `breadcrumbs ${p}`, `ld=${ld} visible=${vis} count=${dup}`);
}

// 6. Unique titles across studio pages.
const titles = {};
for (const p of ['/', '/services', '/templates', '/portfolio', '/process', '/care', '/payments', '/capabilities', '/faq', '/about', '/contact', '/company', '/election-systems', '/privacy', '/terms', '/register']) {
  const h = head(await (await get(p, { 'user-agent': UA.google })).text());
  titles[p] = attr(h, /<title>([^<]*)/);
}
const vals = Object.values(titles);
ok(new Set(vals).size === vals.length && vals.every((t) => t && t.length <= 70), 'unique titles ≤70 chars on 16 pages', Object.entries(titles).filter(([, t]) => !t || t.length > 70).map(([p, t]) => `${p}:${t?.length}`).join(' ') || 'all good');

console.log(out.join('\n'));
const f = out.filter((l) => l.startsWith('FAIL')).length;
console.log(`\n${out.length - f}/${out.length} passed`);
process.exit(f ? 1 : 0);
