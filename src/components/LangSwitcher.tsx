'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { LANGS, LANG_COOKIE, LANG_LABEL, LANG_SHORT, type Lang } from '@/lib/i18n';

/**
 * Manual, sticky language picker.
 *
 * The chosen language is written to a first-party cookie that lasts a year.
 * Because every server component reads that cookie (getLang), the choice holds
 * across navigation and refresh — it never quietly reverts to English. Only
 * clicking another language changes it. router.refresh() re-renders the current
 * route on the server with the new cookie, so the whole page re-localises
 * without a full reload and without losing scroll.
 *
 * There is no auto-detection and no machine translation anywhere: the visitor
 * decides, and every string they see was written by hand in the dictionary.
 */
export function LangSwitcher({ current, label }: { current: Lang; label: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const pick = (lang: Lang) => {
    if (lang === current) return;
    // One year, site-wide, survives refresh and navigation.
    document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
    // A language URL (?lang=es, from search results or a shared link) outranks
    // the cookie, so it has to change with the choice — otherwise the URL would
    // keep forcing the old language. English is the plain URL.
    const url = new URL(window.location.href);
    if (url.searchParams.has('lang')) {
      if (lang === 'en') url.searchParams.delete('lang');
      else url.searchParams.set('lang', lang);
      startTransition(() => router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false }));
      return;
    }
    startTransition(() => router.refresh());
  };

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-[color:var(--line)] bg-white/70 p-0.5"
      role="group"
      aria-label={label}
      data-pending={pending ? '' : undefined}
    >
      {LANGS.map((lang) => {
        const active = lang === current;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => pick(lang)}
            aria-pressed={active}
            title={LANG_LABEL[lang]}
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide transition ${
              active ? 'bg-[color:var(--accent-ink)] text-white' : 'text-steel-500 hover:text-gold-500'
            }`}
          >
            {LANG_SHORT[lang]}
          </button>
        );
      })}
    </div>
  );
}
