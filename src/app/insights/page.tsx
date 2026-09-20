import Link from 'next/link';
import type { Metadata } from 'next';
import { HomeContent } from '@/components/Article';
import { ARCHIVE, SITE } from '@/lib/site';
import { ARTICLES, CATEGORIES } from '@/content/articles';

export const metadata: Metadata = {
  title: `${SITE.magazine.name} — ${ARCHIVE.tagline}`,
  description: ARCHIVE.description,
  alternates: { canonical: '/insights' },
};

/**
 * The editorial archive. xaa.es began as a World Cup 2026 magazine and every
 * one of those articles is still published.
 *
 * The banner is doing real work: this is football writing sitting under a
 * development studio's chrome, and a visitor who lands here from search
 * deserves to know immediately whose site they are on and what else is here.
 */
export default function InsightsPage() {
  return (
    <>
      <div className="border-b border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="eyebrow">Editorial archive</p>
              <p className="mt-1.5 font-display text-xl font-extrabold">
                {ARTICLES.length} football articles, still online
              </p>
              <p className="mt-2 text-sm leading-relaxed text-steel-500">
                xaa.es is a web development studio. Before that it was an independent World Cup 2026 magazine, and we
                kept the writing up rather than deleting it — {CATEGORIES.length} sections, free to read, no paywall.
                It is not a portfolio piece and it is not about software.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link href="/services" className="btn btn-primary btn-sm">What we build</Link>
              <Link href="/" className="btn btn-ghost btn-sm">Studio home</Link>
            </div>
          </div>
        </div>
      </div>
      <HomeContent />
    </>
  );
}
