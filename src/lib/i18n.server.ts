import { cookies, headers } from 'next/headers';
import { DEFAULT_LANG, LANG_COOKIE, isLang, type Lang } from '@/lib/i18n';

/**
 * Header the middleware sets when the URL itself names a language (`?lang=es`).
 * Every language version of a page therefore has its own crawlable URL — what
 * hreflang needs — while the sticky cookie keeps working for people.
 */
export const URL_LANG_HEADER = 'x-xaa-lang';

/** The language named by the URL (`?lang=`), or null when the URL names none. */
export async function getUrlLang(): Promise<Lang | null> {
  try {
    const v = (await headers()).get(URL_LANG_HEADER) ?? undefined;
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
}

/**
 * The language to render in.
 *
 * An explicit `?lang=` in the URL wins (search engines and shared links carry
 * it, and the middleware also stores it in the cookie so it stays sticky).
 * Otherwise the visitor's sticky first-party cookie decides; missing or
 * unrecognised → English. Server-only: it touches `next/headers`, so it must
 * never be pulled into a client bundle.
 */
export async function getLang(): Promise<Lang> {
  const fromUrl = await getUrlLang();
  if (fromUrl) return fromUrl;
  try {
    const v = (await cookies()).get(LANG_COOKIE)?.value;
    return isLang(v) ? v : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}
