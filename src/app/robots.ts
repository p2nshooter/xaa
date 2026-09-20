import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    // The client portal is private by construction (every page checks the
    // session), but there is no reason for it to be crawled either.
    rules: { userAgent: '*', allow: '/', disallow: ['/portal', '/portal/', '/login', '/api/'] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
