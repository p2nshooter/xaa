import Link from 'next/link';
import { translator } from '@/lib/i18n';
import { getLang, getUrlLang } from '@/lib/i18n.server';
import { jsonLdHtml } from '@/lib/json-ld';
import { absUrl, langPath } from '@/lib/seo';

/**
 * Visible breadcrumb trail plus the matching BreadcrumbList structured data.
 *
 * The two are emitted together on purpose: schema that describes something
 * the page does not show is what search engines call spammy markup. Labels
 * are either literal names (a package, a template) or dictionary keys, so the
 * trail reads in the visitor's language; the structured-data URLs follow the
 * language the URL itself names, so they match the canonical.
 */
export type Crumb = { label?: string; k?: string; href?: string };

export async function Breadcrumbs({ trail, className = '' }: { trail: Crumb[]; className?: string }) {
  const lang = await getLang();
  const urlLang = (await getUrlLang()) ?? 'en';
  const t = translator(lang);
  const items = [{ label: t('crumb.home'), href: '/' }, ...trail.map((c) => ({ label: c.label ?? t(c.k ?? ''), href: c.href }))];

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: absUrl(langPath(c.href, urlLang)) } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className={`mx-auto max-w-6xl px-4 pt-5 text-xs text-steel-500 ${className}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(ld) }} />
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 ? <span aria-hidden className="text-steel-400">›</span> : null}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="transition hover:text-gold-500">{c.label}</Link>
            ) : (
              <span aria-current={i === items.length - 1 ? 'page' : undefined} className="font-medium text-ink-800">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
