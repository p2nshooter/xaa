import Link from 'next/link';
import type { Metadata } from 'next';
import { HomeContent } from '@/components/Article';
import { ARCHIVE, SITE } from '@/lib/site';
import { ARTICLES } from '@/content/articles';

export const metadata: Metadata = {
  title: `${SITE.magazine.name} — ${ARCHIVE.tagline}`,
  description: ARCHIVE.description,
  alternates: { canonical: '/insights' },
};

/**
 * The editorial archive. xaa.es began as a World Cup 2026 magazine and every
 * one of those articles is still published — they simply moved off the front
 * page when the domain became the studio's.
 */
export default function InsightsPage() {
  return (
    <>
      <div className="border-b border-[color:var(--accent-soft)] bg-ivory-100/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
          <p className="text-ink-800/70">
            <strong className="font-bold text-ink-900">{ARTICLES.length} articles</strong> · {ARCHIVE.note}
          </p>
          <Link href="/services" className="btn btn-ghost btn-sm">See what we build →</Link>
        </div>
      </div>
      <HomeContent />
    </>
  );
}
