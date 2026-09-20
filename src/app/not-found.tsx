import Link from 'next/link';
import type { Metadata } from 'next';
import { PACKAGES, priceRange } from '@/content/packages';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

/**
 * A 404 that does something. The default is a dead end; this one says plainly
 * what happened and puts the three pages a lost visitor most likely wanted
 * within one click, plus the package list underneath.
 */
export default function NotFound() {
  const popular = PACKAGES.filter((p) => p.popular);

  return (
    <div className="hero relative overflow-hidden">
      <div className="hero-grid absolute inset-0" />
      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:py-28">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
          That page isn&apos;t here
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-steel-500">
          The link may be out of date, or the address mistyped. Nothing is broken on your side — here is where most
          people are heading.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/services" className="btn btn-primary">Packages &amp; pricing</Link>
          <Link href="/process" className="btn btn-ghost">How a project runs</Link>
          <Link href="/contact" className="btn btn-ghost">Contact the studio</Link>
        </div>

        <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
          {popular.map((p) => (
            <Link key={p.slug} href={`/services/${p.slug}`} className="premium-card block p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-steel-400">{p.code}</p>
              <p className="mt-1 font-display text-base font-bold">{p.name}</p>
              <p className="mt-1 text-sm text-steel-500">{priceRange(p.priceMin, p.priceMax, p.openEnded)} · {p.timeline}</p>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-sm text-steel-500">
          Already a client? Your build is in the{' '}
          <Link href="/portal" className="text-gold-500 underline">client portal</Link>. Looking for the old football
          writing? It is still published in the{' '}
          <Link href={SITE.magazine.path} className="text-gold-500 underline">archive</Link>.
        </p>
      </div>
    </div>
  );
}
