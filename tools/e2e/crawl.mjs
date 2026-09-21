// Crawl every internal link reachable from the studio pages and report
// anything that does not answer 200.
const BASE = 'http://127.0.0.1:8820';
const seen = new Set(), queue = ['/'], results = [];
const skip = (u) => u.startsWith('mailto:') || u.startsWith('#') || u.startsWith('http') || u.startsWith('/api/');

while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  let res, html = '';
  try {
    res = await fetch(BASE + path, { redirect: 'manual' });
    if (res.status === 200) html = await res.text();
  } catch (e) { results.push([path, 'ERR ' + e.message]); continue; }
  results.push([path, res.status]);
  if (!html) continue;
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    let href = m[1];
    if (skip(href)) continue;
    href = href.split('#')[0];
    if (!href.startsWith('/')) continue;
    if (!seen.has(href)) queue.push(href);
  }
}
results.sort((a, b) => a[0].localeCompare(b[0]));
const bad = results.filter(([, s]) => s !== 200 && s !== 307 && s !== 308);
console.log(`crawled ${results.length} internal URLs`);
console.log('--- non-200 ---');
for (const [p, s] of results.filter(([, s]) => s !== 200)) console.log(` ${s}  ${p}`);
console.log(bad.length ? `\n${bad.length} BROKEN` : '\nno broken links');
