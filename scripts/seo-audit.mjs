#!/usr/bin/env node
/**
 * SEO audit for every domain the company runs.
 *
 * Runs in GitHub Actions (the build sandbox cannot reach these sites; a runner
 * can), checks each domain live against the automatable items of the SEO
 * checklist, and writes:
 *   - src/content/seo-audit.json  — rendered in the admin portal (/portal/admin/seo)
 *   - docs/seo/REPORT.md          — the same, per site, as a checklist
 *
 * Every check is pass / fail / warn / manual / na. "manual" marks checklist
 * items no crawler can judge (backlink quality, Google Business Profile, content
 * value…): they stay on the list, clearly marked as work for a person, rather
 * than being quietly dropped or falsely ticked.
 *
 * No dependencies: Node 22 fetch + regex over <head>, which is all these checks
 * need. Usage: node scripts/seo-audit.mjs [domain ...]
 */
import { writeFileSync, mkdirSync } from 'node:fs';

export const DOMAINS = [
  { domain: 'xaa.es', repo: 'p2nshooter/xaa' },
  { domain: 'axto.io', repo: 'p2nshooter/guardian-ai' },
  { domain: 'axto.dev', repo: 'p2nshooter/axtodev' },
  { domain: 'axto.us', repo: 'p2nshooter/axto.us' },
  { domain: 'ulyah.com', repo: 'p2nshooter/ulyah.com' },
  { domain: 'xad.es', repo: 'p2nshooter/xad' },
  { domain: 'jai.lat', repo: 'p2nshooter/Jai' },
  { domain: 'lie.skin', repo: 'p2nshooter/Lie' },
  { domain: 'oldco.in', repo: 'p2nshooter/oldco.in' },
  { domain: 'profity.in', repo: 'p2nshooter/profity.in' },
  { domain: '1fr.fr', repo: null },
  { domain: 'dawa.es', repo: null },
  { domain: 'tilawa.de', repo: null },
];

/** All 13 are Domain properties in Search Console (owner's screenshot, 2026-09). */
const GSC_VERIFIED = new Set(DOMAINS.map((d) => d.domain));

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 XAA-SEO-Audit/1.0 (+https://xaa.es/company)';
const TIMEOUT = 25_000;

// ── tiny HTML helpers ────────────────────────────────────────────────────────
function attrs(s) {
  const out = {};
  for (const m of s.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return out;
}
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'gi'))].map((m) => attrs(m[1]));
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const meta = (html, key) => {
  const m = tags(html, 'meta').find((a) => (a.name || a.property || '').toLowerCase() === key);
  return m ? decode(m.content ?? '') : null;
};
const titleOf = (html) => { const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i); return m ? decode(m[1]) : null; };
function jsonLdTypes(html) {
  const types = new Set(); let invalid = 0;
  const walk = (n) => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) return n.forEach(walk);
    const t = n['@type']; if (t) (Array.isArray(t) ? t : [t]).forEach((x) => types.add(String(x)));
    Object.values(n).forEach(walk);
  };
  for (const m of html.matchAll(/<script[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { walk(JSON.parse(m[1].trim())); } catch { invalid += 1; }
  }
  return { types: [...types], invalid };
}

async function get(url, { redirect = 'follow', method = 'GET' } = {}) {
  const t0 = Date.now();
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { redirect, method, signal: ctrl.signal, headers: { 'user-agent': UA, 'accept-language': 'en,es;q=0.8,id;q=0.7', accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' } });
    const ttfb = Date.now() - t0;
    const body = method === 'HEAD' ? '' : await res.text();
    return { ok: true, status: res.status, url: res.url, headers: res.headers, body, ttfb };
  } catch (e) {
    return { ok: false, error: `${e.name}: ${e.cause?.code || e.cause?.message || e.message}`, ttfb: Date.now() - t0 };
  } finally { clearTimeout(timer); }
}

/** Follow redirects by hand to count hops and see the codes. */
async function hops(url, max = 6) {
  const chain = [];
  let cur = url;
  for (let i = 0; i < max; i += 1) {
    const r = await get(cur, { redirect: 'manual' });
    if (!r.ok) return { chain, error: r.error };
    chain.push({ url: cur, status: r.status });
    const loc = r.headers.get('location');
    if (r.status >= 300 && r.status < 400 && loc) { cur = new URL(loc, cur).toString(); continue; }
    return { chain, final: cur, status: r.status };
  }
  return { chain, final: cur, status: 0, error: 'too many redirects' };
}

async function pagespeed(url) {
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance${process.env.PSI_KEY ? `&key=${process.env.PSI_KEY}` : ''}`;
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 90_000);
  try {
    const r = await fetch(api, { signal: ctrl.signal });
    if (!r.ok) return { error: `PageSpeed API ${r.status}` };
    const j = await r.json();
    const a = j.lighthouseResult?.audits ?? {};
    const f = j.loadingExperience?.metrics ?? {};
    return {
      score: Math.round((j.lighthouseResult?.categories?.performance?.score ?? 0) * 100),
      lcp: a['largest-contentful-paint']?.numericValue, cls: a['cumulative-layout-shift']?.numericValue, tbt: a['total-blocking-time']?.numericValue,
      field: { lcp: f.LARGEST_CONTENTFUL_PAINT_MS?.percentile, inp: f.INTERACTION_TO_NEXT_PAINT?.percentile, cls: f.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile },
    };
  } catch (e) { return { error: e.message }; } finally { clearTimeout(timer); }
}

// ── the audit ────────────────────────────────────────────────────────────────
async function audit({ domain, repo }) {
  const checks = [];
  const add = (section, id, label, status, detail = '') => checks.push({ section, id, label, status, detail });
  const origin = `https://${domain}`;

  const home = await get(origin + '/');
  if (!home.ok || home.status >= 400) {
    add('1', 'https', 'Site reachable over HTTPS', 'fail', home.ok ? `HTTP ${home.status}` : home.error);
    return { domain, repo, reachable: false, checks, pages: [] };
  }
  const html = home.body;
  const head = html.split(/<\/head>/i)[0] ?? html;
  const finalUrl = new URL(home.url);
  const h = (k) => home.headers.get(k);

  // 1. Foundation
  add('1', 'https', 'HTTPS with a valid SSL certificate', 'pass', `${home.status} ${home.url}`);
  const httpHops = await hops(`http://${domain}/`);
  const toHttps = httpHops.chain[0] && httpHops.chain[0].status >= 300 && httpHops.chain[0].status < 400 && String(httpHops.final).startsWith('https://');
  add('1', 'http_redirect', 'HTTP redirects to HTTPS', toHttps ? ([301, 308].includes(httpHops.chain[0].status) ? 'pass' : 'warn') : 'fail',
    httpHops.error || httpHops.chain.map((c) => `${c.status} ${c.url}`).join(' → ') + ` → ${httpHops.final}`);
  add('2', 'redirect_chain', 'No redirect chains (≤1 hop to the final URL)', httpHops.chain.length <= 2 ? 'pass' : 'warn', `${Math.max(0, httpHops.chain.length - 1)} hop(s) from http://${domain}/`);
  const alt = finalUrl.hostname.startsWith('www.') ? domain : `www.${domain}`;
  const altHops = await hops(`https://${alt}/`);
  const sameHost = altHops.final && new URL(altHops.final).hostname === finalUrl.hostname;
  add('1', 'canonical_host', 'One canonical host (www ↔ apex redirect)', sameHost ? 'pass' : altHops.error ? 'warn' : 'fail',
    altHops.error ? `${alt}: ${altHops.error}` : `${alt} → ${altHops.final}`);
  add('1', 'gsc', 'Google Search Console', GSC_VERIFIED.has(domain) ? 'pass' : 'fail', GSC_VERIFIED.has(domain) ? 'Domain property verified' : 'not verified');
  const bingMeta = meta(head, 'msvalidate.01');
  const bingFile = bingMeta ? null : await get(`${origin}/BingSiteAuth.xml`);
  add('1', 'bing', 'Bing Webmaster Tools verification', bingMeta || (bingFile?.ok && bingFile.status === 200 && /<user>/i.test(bingFile.body)) ? 'pass' : 'manual',
    bingMeta ? 'msvalidate.01 meta found' : 'No meta/BingSiteAuth.xml — import the site from Search Console in Bing Webmaster Tools (DNS verification also works)');

  const robots = await get(`${origin}/robots.txt`);
  const robotsOk = robots.ok && robots.status === 200 && /user-agent/i.test(robots.body);
  add('1', 'robots', 'robots.txt present', robotsOk ? 'pass' : 'fail', robotsOk ? `${robots.body.split('\n').length} lines` : robots.ok ? `HTTP ${robots.status}` : robots.error);
  const sitemapRef = robotsOk ? (robots.body.match(/^\s*sitemap:\s*(\S+)/im)?.[1] ?? null) : null;
  add('16', 'robots_sitemap', 'robots.txt declares the sitemap', sitemapRef ? 'pass' : 'fail', sitemapRef ?? 'no Sitemap: line');
  const blocksAll = robotsOk && /user-agent:\s*\*[\s\S]*?disallow:\s*\/\s*$/im.test(robots.body);
  add('15', 'robots_open', 'robots.txt lets crawlers reach the site', blocksAll ? 'fail' : robotsOk ? 'pass' : 'warn', blocksAll ? 'Disallow: / for *' : '');
  const aiBlocked = robotsOk ? ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot'].filter((b) => new RegExp(`user-agent:\\s*${b}[\\s\\S]*?disallow:\\s*/\\s*$`, 'im').test(robots.body)) : [];
  add('18', 'ai_crawlers', 'AI / generative-search crawlers allowed', aiBlocked.length ? 'warn' : robotsOk ? 'pass' : 'warn', aiBlocked.length ? `blocked: ${aiBlocked.join(', ')}` : '');

  const smUrl = sitemapRef || `${origin}/sitemap.xml`;
  const sm = await get(smUrl);
  const smUrls = sm.ok && sm.status === 200 ? [...sm.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => decode(m[1])) : [];
  const isIndex = sm.ok && /<sitemapindex/i.test(sm.body);
  add('16', 'sitemap', 'XML sitemap', sm.ok && sm.status === 200 && (/<urlset/i.test(sm.body) || isIndex) ? 'pass' : 'fail',
    sm.ok ? `HTTP ${sm.status} ${smUrl} — ${smUrls.length} ${isIndex ? 'child sitemaps' : 'URLs'}` : sm.error);
  let pageUrls = smUrls;
  if (isIndex && smUrls[0]) { const child = await get(smUrls[0]); pageUrls = child.ok ? [...child.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => decode(m[1])) : []; }
  const offHost = pageUrls.filter((u) => { try { return new URL(u).hostname !== finalUrl.hostname; } catch { return true; } });
  add('16', 'sitemap_canonical', 'Sitemap lists only canonical-host URLs', pageUrls.length ? (offHost.length ? 'fail' : 'pass') : 'na', offHost.length ? `${offHost.length} URL(s) on another host, e.g. ${offHost[0]}` : '');
  const dirty = pageUrls.filter((u) => /[?&](p|page_id|id)=|\.php\b|\/index\.html?$/i.test(u));
  add('1', 'clean_urls', 'Clean, readable URLs', pageUrls.length ? (dirty.length ? 'warn' : 'pass') : 'na', dirty.length ? `${dirty.length} e.g. ${dirty[0]}` : '');

  const nf = await get(`${origin}/this-page-does-not-exist-${Date.now()}`);
  add('1', 'real_404', 'Missing pages return a real 404', nf.ok && nf.status === 404 ? 'pass' : 'fail', nf.ok ? `HTTP ${nf.status}${nf.status === 200 ? ' (soft 404)' : ''}` : nf.error);

  // 2. Technical
  const canonical = tags(head, 'link').find((a) => (a.rel || '').toLowerCase() === 'canonical')?.href ?? null;
  add('2', 'canonical', 'Canonical URL on the home page', canonical ? (/^https:\/\//.test(canonical) ? 'pass' : 'warn') : 'fail', canonical ?? 'missing');
  const viewport = meta(head, 'viewport');
  add('2', 'mobile', 'Mobile-friendly viewport', viewport && /width=device-width/.test(viewport) ? 'pass' : 'fail', viewport ?? 'no viewport meta');
  const enc = h('content-encoding');
  add('2', 'compression', 'GZIP / Brotli compression', enc && /br|gzip|zstd/.test(enc) ? 'pass' : 'fail', enc ?? 'none');
  const cdn = h('cf-ray') ? 'Cloudflare' : h('x-vercel-id') ? 'Vercel' : h('x-served-by') ? 'Fastly' : h('x-amz-cf-id') ? 'CloudFront' : h('server') ?? '';
  add('2', 'cdn', 'Served through a CDN', /Cloudflare|Vercel|Fastly|CloudFront|cloudflare/i.test(cdn) ? 'pass' : 'warn', cdn || 'unknown');
  add('2', 'ttfb', 'Server response time', home.ttfb < 800 ? 'pass' : home.ttfb < 1800 ? 'warn' : 'fail', `${home.ttfb} ms (from a GitHub runner)`);
  add('2', 'html_cache', 'Browser/edge caching headers', h('cache-control') ? 'pass' : 'warn', h('cache-control') ?? 'no cache-control');
  const blocking = tags(head, 'script').filter((a) => a.src && !('async' in a) && !('defer' in a) && a.type !== 'module').length;
  add('2', 'render_blocking', 'No render-blocking scripts in <head>', blocking === 0 ? 'pass' : blocking <= 2 ? 'warn' : 'fail', `${blocking} blocking script(s)`);
  const imgs = tags(html, 'img');
  const lazy = imgs.slice(1).filter((a) => a.loading === 'lazy').length;
  add('6', 'lazy', 'Lazy-loading below-the-fold images', imgs.length <= 1 ? 'na' : lazy / (imgs.length - 1) >= 0.5 ? 'pass' : 'warn', `${lazy}/${Math.max(0, imgs.length - 1)} lazy`);
  const modern = /\.(webp|avif)(\?|"|'|\s|$)/i.test(html) || /type=["']image\/(webp|avif)/i.test(html) || /\/_next\/image\?/i.test(html);
  add('6', 'webp', 'WebP / AVIF images', imgs.length === 0 ? 'na' : modern ? 'pass' : 'warn', modern ? '' : 'no WebP/AVIF found on the home page');
  const sized = imgs.filter((a) => a.width && a.height).length;
  add('6', 'img_dims', 'Images carry width & height (no layout shift)', imgs.length === 0 ? 'na' : sized / imgs.length >= 0.8 ? 'pass' : 'warn', `${sized}/${imgs.length}`);
  const fontsOk = /display=swap/.test(html) || tags(head, 'link').some((a) => a.rel === 'preload' && a.as === 'font') || /font-display:\s*swap/.test(html);
  add('2', 'fonts', 'Fonts optimised (preload / font-display: swap)', fontsOk ? 'pass' : 'warn');
  const robotsMeta = (meta(head, 'robots') ?? '') + ' ' + (h('x-robots-tag') ?? '');
  add('15', 'indexable', 'Home page is indexable (no noindex)', /noindex/i.test(robotsMeta) ? 'fail' : 'pass', robotsMeta.trim());

  // 3. On-page (home)
  const title = titleOf(head);
  add('3', 'title', 'Title tag (10–65 chars)', !title ? 'fail' : title.length >= 10 && title.length <= 65 ? 'pass' : 'warn', title ? `${title.length}: ${title}` : 'missing');
  const desc = meta(head, 'description');
  add('3', 'meta_description', 'Meta description (50–160 chars)', !desc ? 'fail' : desc.length >= 50 && desc.length <= 160 ? 'pass' : 'warn', desc ? `${desc.length}: ${desc.slice(0, 90)}…` : 'missing');
  const h1 = (html.match(/<h1\b/gi) ?? []).length;
  add('3', 'h1', 'Exactly one H1', h1 === 1 ? 'pass' : h1 === 0 ? 'fail' : 'warn', `${h1} H1`);
  const h2 = (html.match(/<h2\b/gi) ?? []).length;
  add('3', 'h2', 'H2–H6 structure', h2 > 0 ? 'pass' : 'warn', `${h2} H2`);
  const noAlt = imgs.filter((a) => !('alt' in a)).length;
  add('6', 'alt', 'Alt text on images', imgs.length === 0 ? 'na' : noAlt === 0 ? 'pass' : noAlt / imgs.length < 0.2 ? 'warn' : 'fail', `${noAlt}/${imgs.length} missing alt`);
  const hashy = imgs.filter((a) => /(^|\/)(IMG_\d+|DSC_?\d+|[0-9a-f]{16,}|image\d*)\.(jpe?g|png|webp)/i.test(a.src ?? '')).length;
  add('6', 'img_names', 'Descriptive image file names', imgs.length === 0 ? 'na' : hashy === 0 ? 'pass' : 'warn', hashy ? `${hashy} non-descriptive` : '');
  const links = tags(html, 'a').map((a) => a.href).filter(Boolean);
  const internal = links.filter((u) => { try { return new URL(u, origin).hostname === finalUrl.hostname; } catch { return false; } });
  add('9', 'internal_links', 'Internal links from the home page', internal.length >= 8 ? 'pass' : internal.length >= 3 ? 'warn' : 'fail', `${new Set(internal).size} unique`);
  const lang = (html.match(/<html\b([^>]*)>/i)?.[1] ?? '').match(/\blang=["']?([\w-]+)/i)?.[1] ?? null;
  add('8', 'lang_attr', 'Language declared (<html lang>)', lang ? 'pass' : 'fail', lang ?? 'missing');
  const hreflang = tags(head, 'link').filter((a) => a.rel === 'alternate' && a.hreflang);
  add('8', 'hreflang', 'hreflang for language versions', hreflang.length ? 'pass' : 'manual', hreflang.length ? hreflang.map((a) => a.hreflang).join(', ') : 'none — needed only if the site serves several languages');

  // 5. Structured data
  const ld = jsonLdTypes(html);
  add('5', 'jsonld', 'JSON-LD structured data', ld.types.length ? (ld.invalid ? 'warn' : 'pass') : 'fail', ld.types.length ? ld.types.join(', ') + (ld.invalid ? ` (${ld.invalid} invalid block)` : '') : 'none');
  add('5', 'org_schema', 'Organization schema', ld.types.some((t) => /Organization|LocalBusiness|ProfessionalService|Corporation/.test(t)) ? 'pass' : 'fail');
  add('5', 'website_schema', 'WebSite schema', ld.types.includes('WebSite') ? 'pass' : 'fail');

  // 17. Social
  for (const [k, id] of [['og:title', 'og_title'], ['og:description', 'og_description'], ['og:image', 'og_image'], ['og:url', 'og_url'], ['og:type', 'og_type']]) {
    const v = meta(head, k);
    add('17', id, k, v ? 'pass' : 'fail', v ? v.slice(0, 90) : 'missing');
  }
  const tw = meta(head, 'twitter:card');
  add('17', 'twitter_card', 'Twitter / X card', tw ? 'pass' : 'fail', tw ?? 'missing');

  // 14. Security
  const hsts = h('strict-transport-security');
  add('14', 'hsts', 'HSTS header', hsts ? 'pass' : 'fail', hsts ?? 'missing');
  add('14', 'nosniff', 'X-Content-Type-Options: nosniff', /nosniff/i.test(h('x-content-type-options') ?? '') ? 'pass' : 'fail');
  const csp = h('content-security-policy');
  add('14', 'frame', 'Clickjacking protection (X-Frame-Options / frame-ancestors)', h('x-frame-options') || /frame-ancestors/.test(csp ?? '') ? 'pass' : 'fail');
  add('14', 'referrer', 'Referrer-Policy', h('referrer-policy') ? 'pass' : 'fail', h('referrer-policy') ?? '');
  add('14', 'permissions', 'Permissions-Policy', h('permissions-policy') ? 'pass' : 'warn');
  add('14', 'csp', 'Content-Security-Policy', csp ? 'pass' : 'warn', csp ? csp.slice(0, 80) : 'none (optional, but recommended)');
  const mixed = [...html.matchAll(/(?:src|href)=["']http:\/\/(?!localhost)[^"']+\.(?:js|css|png|jpe?g|gif|webp|svg|woff2?)["']/gi)].length;
  add('14', 'mixed', 'No mixed content', mixed ? 'fail' : 'pass', mixed ? `${mixed} http:// asset(s)` : '');

  // 13. E-E-A-T
  const hrefs = links.join(' ').toLowerCase();
  for (const [id, label, re] of [['about', 'About page', /about|tentang|sobre|acerca|company|perusahaan|empresa/], ['contact', 'Contact page', /contact|kontak|contacto|hubungi/], ['privacy', 'Privacy policy', /privacy|privasi|privacidad/], ['terms', 'Terms & conditions', /terms|syarat|ketentuan|terminos|términos|legal/]]) {
    add('13', id, label, re.test(hrefs) ? 'pass' : 'fail');
  }

  // 19. Analytics
  const ga = /gtag\/js\?id=G-|googletagmanager\.com\/gtm\.js|google-analytics\.com\/(analytics|g\/collect)/i.test(html);
  const other = /plausible\.io|umami|cloudflareinsights\.com\/beacon|matomo|api\.ulyah\.com\/track|clarity\.ms|posthog/i.test(html);
  add('19', 'analytics', 'Analytics installed', ga ? 'pass' : other ? 'pass' : 'fail', ga ? 'Google Analytics / GTM' : other ? 'other analytics' : 'none detected');
  add('20', 'periodic', 'Periodic automated SEO audit', 'pass', 'this weekly audit');

  // 18. AI search extras
  const llms = await get(`${origin}/llms.txt`);
  add('18', 'llms_txt', 'llms.txt for AI assistants', llms.ok && llms.status === 200 && !/<html/i.test(llms.body) ? 'pass' : 'warn', llms.ok ? `HTTP ${llms.status}` : llms.error);

  // Inner pages: titles/descriptions unique, H1, canonical, breadcrumbs.
  const sample = [...new Set(pageUrls.filter((u) => { try { return new URL(u).hostname === finalUrl.hostname && new URL(u).pathname !== '/'; } catch { return false; } }))].slice(0, 8);
  const pages = [{ url: home.url, title, desc, h1 }];
  let crumbs = 0; let noCanon = 0; let broken = 0;
  for (const u of sample) {
    const r = await get(u);
    if (!r.ok || r.status >= 400) { broken += 1; pages.push({ url: u, status: r.ok ? r.status : r.error }); continue; }
    const hd = r.body.split(/<\/head>/i)[0] ?? r.body;
    const t = titleOf(hd); const d = meta(hd, 'description'); const n = (r.body.match(/<h1\b/gi) ?? []).length;
    if (jsonLdTypes(r.body).types.includes('BreadcrumbList') || /aria-label=["']breadcrumb/i.test(r.body)) crumbs += 1;
    if (!tags(hd, 'link').some((a) => (a.rel || '').toLowerCase() === 'canonical')) noCanon += 1;
    pages.push({ url: u, status: r.status, title: t, desc: d, h1: n });
  }
  const ok = pages.filter((p) => p.title !== undefined);
  const dupT = ok.length - new Set(ok.map((p) => p.title)).size;
  const dupD = ok.filter((p) => p.desc).length - new Set(ok.filter((p) => p.desc).map((p) => p.desc)).size;
  const missT = ok.filter((p) => !p.title).length; const missD = ok.filter((p) => !p.desc).length;
  const badH1 = ok.filter((p) => p.h1 !== 1).length;
  if (sample.length) {
    add('3', 'unique_titles', 'Unique title on every page', dupT || missT ? 'fail' : 'pass', `${ok.length} pages sampled; ${dupT} duplicate, ${missT} missing`);
    add('3', 'unique_descriptions', 'Unique meta description on every page', dupD || missD ? 'warn' : 'pass', `${dupD} duplicate, ${missD} missing`);
    add('3', 'h1_all', 'One H1 on every sampled page', badH1 ? 'warn' : 'pass', `${badH1} page(s) with 0 or several H1`);
    add('2', 'canonical_all', 'Canonical on every sampled page', noCanon ? 'warn' : 'pass', `${noCanon} without`);
    add('3', 'breadcrumbs', 'Breadcrumbs on inner pages', crumbs >= Math.ceil(sample.length / 2) ? 'pass' : 'warn', `${crumbs}/${sample.length}`);
    add('2', 'broken', 'Sitemap URLs load (no broken pages)', broken ? 'fail' : 'pass', `${broken}/${sample.length} failing`);
  } else {
    add('3', 'unique_titles', 'Unique title on every page', 'na', 'no sitemap URLs to sample');
  }

  // 2. Core Web Vitals (PageSpeed Insights, mobile).
  const ps = await pagespeed(home.url);
  if (ps.error) add('2', 'cwv', 'Core Web Vitals (PageSpeed, mobile)', 'manual', ps.error);
  else {
    const lcpS = ps.lcp / 1000;
    add('2', 'perf_score', 'PageSpeed performance score (mobile)', ps.score >= 90 ? 'pass' : ps.score >= 50 ? 'warn' : 'fail', `${ps.score}/100`);
    add('2', 'lcp', 'LCP ≤ 2.5 s', lcpS <= 2.5 ? 'pass' : lcpS <= 4 ? 'warn' : 'fail', `${lcpS.toFixed(2)} s lab${ps.field.lcp ? `, ${(ps.field.lcp / 1000).toFixed(2)} s field` : ''}`);
    add('2', 'cls', 'CLS ≤ 0.1', ps.cls <= 0.1 ? 'pass' : ps.cls <= 0.25 ? 'warn' : 'fail', `${ps.cls.toFixed(3)} lab`);
    add('2', 'inp', 'INP ≤ 200 ms (TBT as lab proxy)', ps.field.inp ? (ps.field.inp <= 200 ? 'pass' : ps.field.inp <= 500 ? 'warn' : 'fail') : ps.tbt <= 200 ? 'pass' : ps.tbt <= 600 ? 'warn' : 'fail', ps.field.inp ? `${ps.field.inp} ms field` : `TBT ${Math.round(ps.tbt)} ms lab (no field data yet)`);
  }

  // Items no crawler can judge — kept on the list for a person.
  for (const [section, id, label] of [
    ['4', 'content_quality', 'Original, useful content that answers search intent'],
    ['4', 'content_refresh', 'Old content updated; thin/duplicate content removed'],
    ['9', 'topic_clusters', 'Topic clusters: pillar pages + supporting articles'],
    ['10', 'backlinks', 'Quality, relevant backlinks; no spam/PBN'],
    ['10', 'digital_pr', 'Digital PR, brand mentions, official social profiles'],
    ['11', 'gbp', 'Google Business Profile + consistent NAP (if a physical location)'],
    ['13', 'authors', 'Author profiles, publish/update dates, sources'],
    ['19', 'monitoring', 'Monitor clicks, CTR, position, indexed pages in Search Console'],
  ]) add(section, id, label, 'manual');

  return { domain, repo, reachable: true, finalUrl: home.url, checks, pages };
}

function summarise(site) {
  const auto = site.checks.filter((c) => ['pass', 'fail', 'warn'].includes(c.status));
  const pass = auto.filter((c) => c.status === 'pass').length;
  const fail = auto.filter((c) => c.status === 'fail').length;
  const warn = auto.filter((c) => c.status === 'warn').length;
  return { ...site, score: auto.length ? Math.round(((pass + warn * 0.5) / auto.length) * 100) : 0, pass, fail, warn, manual: site.checks.filter((c) => c.status === 'manual').length };
}

const SECTION = { 1: 'Foundation', 2: 'Technical SEO', 3: 'On-page SEO', 4: 'Content SEO', 5: 'Structured data', 6: 'Image SEO', 8: 'Multilingual SEO', 9: 'Internal linking', 10: 'Off-page SEO', 11: 'Local SEO', 13: 'E-E-A-T', 14: 'Security', 15: 'Crawl & indexing', 16: 'Sitemap', 17: 'Social / sharing', 18: 'AI / generative search', 19: 'Analytics & monitoring', 20: 'Periodic audit' };
const ICON = { pass: '✅', fail: '❌', warn: '⚠️', manual: '📝', na: '—' };

function markdown(result) {
  const lines = [`# SEO audit — all domains`, '', `Generated ${result.generatedAt} by \`scripts/seo-audit.mjs\` (weekly, GitHub Actions). ✅ done · ❌ not done · ⚠️ partly done · 📝 manual work for a person · — not applicable.`, '', '| Domain | Score | ✅ | ❌ | ⚠️ | 📝 | Repo |', '|---|---|---|---|---|---|---|'];
  for (const s of result.sites) lines.push(`| [${s.domain}](https://${s.domain}) | ${s.reachable ? s.score + '%' : 'unreachable'} | ${s.pass} | ${s.fail} | ${s.warn} | ${s.manual} | ${s.repo ?? '—'} |`);
  for (const s of result.sites) {
    lines.push('', `## ${s.domain} — ${s.reachable ? s.score + '%' : 'unreachable'}`, '');
    const todo = s.checks.filter((c) => c.status === 'fail' || c.status === 'warn');
    lines.push(`**Not done yet (${todo.length}):** ${todo.length ? todo.map((c) => c.label).join('; ') : 'nothing automatable is outstanding'}`, '');
    let cur = null;
    for (const c of [...s.checks].sort((a, b) => Number(a.section) - Number(b.section))) {
      if (c.section !== cur) { cur = c.section; lines.push('', `**${c.section}. ${SECTION[c.section] ?? ''}**`, '', '| | Check | Detail |', '|---|---|---|'); }
      lines.push(`| ${ICON[c.status]} | ${c.label} | ${(c.detail || '').replace(/\|/g, '\\|').slice(0, 160)} |`);
    }
  }
  return lines.join('\n') + '\n';
}

const only = process.argv.slice(2);
const targets = only.length ? DOMAINS.filter((d) => only.includes(d.domain)) : DOMAINS;
const sites = [];
for (const d of targets) {
  process.stderr.write(`auditing ${d.domain}…\n`);
  try { sites.push(summarise(await audit(d))); } catch (e) { sites.push(summarise({ ...d, reachable: false, checks: [{ section: '1', id: 'error', label: 'Audit error', status: 'fail', detail: e.message }], pages: [] })); }
}
const result = { generatedAt: new Date().toISOString(), sites };
mkdirSync('docs/seo', { recursive: true });
writeFileSync('src/content/seo-audit.json', JSON.stringify(result, null, 1) + '\n');
writeFileSync('docs/seo/REPORT.md', markdown(result));
for (const s of sites) console.log(`${s.domain.padEnd(12)} ${s.reachable ? String(s.score).padStart(3) + '%' : ' n/a'}  ✅${s.pass} ❌${s.fail} ⚠️${s.warn} 📝${s.manual}`);
