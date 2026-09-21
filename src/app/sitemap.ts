import type { MetadataRoute } from 'next';
import { ARTICLES, CATEGORIES } from '@/content/articles';
import { PACKAGES } from '@/content/packages';
import { SITE } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const b = SITE.url;
  return [
    { url: b, changeFrequency: 'weekly', priority: 1 },
    // Studio
    { url: `${b}/services`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${b}/portfolio`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${b}/election-systems`, changeFrequency: 'monthly', priority: 0.85 },
    ...PACKAGES.map((p) => ({ url: `${b}/services/${p.slug}`, changeFrequency: 'monthly' as const, priority: 0.85 })),
    { url: `${b}/process`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${b}/care`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${b}/payments`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${b}/capabilities`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${b}/faq`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${b}/register`, priority: 0.5 },
    // Editorial archive
    { url: `${b}${SITE.magazine.path}`, changeFrequency: 'weekly', priority: 0.6 },
    ...CATEGORIES.map((c) => ({ url: `${b}/category/${c.slug}`, changeFrequency: 'weekly' as const, priority: 0.5 })),
    ...ARTICLES.map((a) => ({ url: `${b}/articles/${a.slug}`, lastModified: new Date(a.date), changeFrequency: 'monthly' as const, priority: 0.5 })),
    // Company
    { url: `${b}/about`, priority: 0.4 },
    { url: `${b}/contact`, priority: 0.4 },
    { url: `${b}/privacy`, priority: 0.2 },
    { url: `${b}/terms`, priority: 0.2 },
  ];
}
