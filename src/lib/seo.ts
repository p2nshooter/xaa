import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { LANGS, type Lang } from '@/lib/i18n';
import { getLang, getUrlLang } from '@/lib/i18n.server';
import type { SeoCopy } from '@/content/seo-copy';

/**
 * One place that turns a page's path and copy into complete search metadata:
 * localised title and description, a canonical URL, hreflang alternates for
 * every language version, Open Graph and an X card.
 *
 * Language URLs: English lives at the plain path; Spanish and Indonesian at
 * `?lang=es` / `?lang=id` (see middleware). Crawlers carry no cookie, so a URL
 * always shows them the same language — which is what makes each version
 * indexable. The canonical follows the URL's language, never the cookie, so a
 * reader whose cookie says Spanish still sees a canonical that matches what a
 * crawler would get at that URL.
 */

const OG_LOCALE: Record<Lang, string> = { en: 'en_US', es: 'es_ES', id: 'id_ID' };

export const DEFAULT_OG_IMAGE = {
  url: '/og/xaa-og.jpg',
  width: 1200,
  height: 630,
  alt: 'XAA — web development studio: websites, SaaS and enterprise platforms',
};

/** The URL of `path` in `lang` (English is the plain path). */
export function langPath(path: string, lang: Lang): string {
  if (lang === 'en') return path;
  return `${path}${path.includes('?') ? '&' : '?'}lang=${lang}`;
}

/** Trim to `max` characters at a word boundary, for meta descriptions. */
export function clip(text: string, max = 158): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length).replace(/[,;:.—–-]+$/, '')}…`;
}

export function absUrl(path: string): string {
  return path.startsWith('http') ? path : `${SITE.url}${path === '/' ? '' : path}`;
}

type Image = { url: string; width?: number; height?: number; alt?: string };

export async function pageMetadata(opts: {
  path: string;
  copy: SeoCopy | { title: string; description: string };
  /** Use the title as-is, without the " · XAA" template. */
  absoluteTitle?: boolean;
  image?: Image;
  type?: 'website' | 'article' | 'profile';
  /** False for pages that exist in one language only (the football archive). */
  multilingual?: boolean;
  noindex?: boolean;
}): Promise<Metadata> {
  const { path, absoluteTitle = false, image = DEFAULT_OG_IMAGE, type = 'website', multilingual = true, noindex = false } = opts;
  const lang = await getLang();
  const urlLang = multilingual ? await getUrlLang() : null;
  const copy = 'en' in opts.copy ? opts.copy[lang] : opts.copy;
  const canonical = multilingual ? langPath(path, urlLang ?? 'en') : path;

  const languages = multilingual
    ? { ...Object.fromEntries(LANGS.map((l) => [l, langPath(path, l)])), 'x-default': path }
    : undefined;

  return {
    title: absoluteTitle ? { absolute: copy.title } : copy.title,
    description: copy.description,
    alternates: { canonical, languages },
    openGraph: {
      type,
      url: canonical,
      siteName: SITE.name,
      title: copy.title,
      description: copy.description,
      locale: OG_LOCALE[lang],
      alternateLocale: multilingual ? LANGS.filter((l) => l !== lang).map((l) => OG_LOCALE[l]) : undefined,
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: copy.title, description: copy.description, images: [image.url] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
