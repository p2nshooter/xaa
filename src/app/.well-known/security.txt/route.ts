import { SITE } from '@/lib/site';

/**
 * /.well-known/security.txt (RFC 9116) — where to report a security problem (owner, 27 Oct 2026:
 * "perbaiki dulu seluruh SEO websitenya … file2 lain yg d butuhkan"). Built on every deploy, so the
 * expiry (just under a year) moves along. The address is the public one on /contact.
 */
export const dynamic = 'force-static';

export function GET() {
  const expires = new Date(Date.now() + 360 * 86_400_000).toISOString().replace(/\.\d{3}Z$/, '.000Z');
  const text = [
    `Contact: mailto:${SITE.email}`,
    `Contact: ${SITE.url}/contact`,
    `Expires: ${expires}`,
    'Preferred-Languages: en, es, id',
    `Canonical: ${SITE.url}/.well-known/security.txt`,
    '',
  ].join('\n');
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } });
}
