import type { MetadataRoute } from 'next';
import { ARTICLES, CATEGORIES } from '@/content/articles';
import { PACKAGES } from '@/content/packages';
import { TEMPLATES } from '@/content/templates';
import { SITE } from '@/lib/site';
import { LANGS } from '@/lib/i18n';
import { langPath } from '@/lib/seo';

type Entry = MetadataRoute.Sitemap[number];
type Freq = Entry['changeFrequency'];

/**
 * Every studio page appears once per language (English at the plain path,
 * Spanish and Indonesian at ?lang=es / ?lang=id), each carrying the full set of
 * hreflang alternates — the pattern search engines use to index and serve the
 * right language. The football archive is English only and is listed once.
 * Only canonical, indexable URLs are listed: no portal, login or API routes.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const b = SITE.url;
  const abs = (p: string) => `${b}${p === '/' ? '' : p}`;

  const multilingual = (path: string, priority: number, changeFrequency: Freq): Entry[] => {
    const languages = { ...Object.fromEntries(LANGS.map((l) => [l, abs(langPath(path, l))])), 'x-default': abs(path) };
    return LANGS.map((l) => ({ url: abs(langPath(path, l)), changeFrequency, priority: l === 'en' ? priority : Math.round(priority * 90) / 100, alternates: { languages } }));
  };

  return [
    ...multilingual('/', 1, 'weekly'),
    // Studio
    ...multilingual('/services', 0.9, 'weekly'),
    ...PACKAGES.flatMap((p) => multilingual(`/services/${p.slug}`, 0.85, 'monthly')),
    ...multilingual('/templates', 0.85, 'weekly'),
    ...TEMPLATES.flatMap((t) => multilingual(`/templates/${t.slug}`, 0.75, 'monthly')),
    ...multilingual('/portfolio', 0.9, 'monthly'),
    ...multilingual('/election-systems', 0.85, 'monthly'),
    ...multilingual('/process', 0.8, 'monthly'),
    ...multilingual('/care', 0.8, 'monthly'),
    ...multilingual('/payments', 0.7, 'monthly'),
    ...multilingual('/capabilities', 0.7, 'monthly'),
    ...multilingual('/faq', 0.6, 'monthly'),
    ...multilingual('/company', 0.7, 'monthly'),
    ...multilingual('/about', 0.5, 'yearly'),
    ...multilingual('/contact', 0.5, 'yearly'),
    ...multilingual('/register', 0.4, 'yearly'),
    ...multilingual('/privacy', 0.2, 'yearly'),
    ...multilingual('/terms', 0.2, 'yearly'),
    // Editorial archive (English only)
    { url: abs(SITE.magazine.path), changeFrequency: 'weekly', priority: 0.6 },
    ...CATEGORIES.map((c) => ({ url: abs(`/category/${c.slug}`), changeFrequency: 'weekly' as const, priority: 0.5 })),
    ...ARTICLES.map((a) => ({ url: abs(`/articles/${a.slug}`), lastModified: new Date(a.date), changeFrequency: 'monthly' as const, priority: 0.5 })),
  ];
}
