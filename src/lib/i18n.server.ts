import { cookies } from 'next/headers';
import { DEFAULT_LANG, LANG_COOKIE, isLang, type Lang } from '@/lib/i18n';

/**
 * The visitor's chosen language, read from the sticky first-party cookie.
 *
 * Server-only: it touches `next/headers`, so it must never be pulled into a
 * client bundle. The language switcher writes the cookie in the browser and
 * calls router.refresh(); this is the read half that every server component
 * uses to render in the chosen language. Missing or unrecognised → English.
 */
export async function getLang(): Promise<Lang> {
  try {
    const v = (await cookies()).get(LANG_COOKIE)?.value;
    return isLang(v) ? v : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}
