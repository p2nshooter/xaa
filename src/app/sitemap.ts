import type { MetadataRoute } from 'next';
import { ARTICLES, CATEGORIES } from '@/content/articles';
import { SITE } from '@/lib/site';
export default function sitemap(): MetadataRoute.Sitemap {
  const b = SITE.url;
  return [
    { url: b, changeFrequency: 'daily', priority: 1 },
    ...CATEGORIES.map((c) => ({ url: `${b}/category/${c.slug}`, changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...ARTICLES.map((a) => ({ url: `${b}/articles/${a.slug}`, lastModified: new Date(a.date), changeFrequency: 'monthly' as const, priority: 0.8 })),
    { url: `${b}/about`, priority: 0.3 }, { url: `${b}/contact`, priority: 0.3 },
    { url: `${b}/privacy`, priority: 0.2 }, { url: `${b}/terms`, priority: 0.2 }
  ];
}
