import { ARTICLES } from '@/content/articles';
import { SITE } from '@/lib/site';

// RSS 2.0 feed at /feed.xml — lets readers, aggregators and search engines
// discover new articles automatically (the autonomous writer keeps it fresh).
export const dynamic = 'force-static';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function GET() {
  const items = [...ARTICLES]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 50)
    .map((a) => {
      const link = `${SITE.url}/articles/${a.slug}`;
      return `    <item>
      <title>${esc(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(a.date).toUTCString()}</pubDate>
      <category>${esc(a.category)}</category>
      <description>${esc(a.excerpt)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)} — ${esc(SITE.tagline)}</title>
    <link>${SITE.url}</link>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${esc(SITE.description)}</description>
    <language>${SITE.locale}</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}
