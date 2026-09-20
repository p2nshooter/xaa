import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PACKAGES, getPackage, getSetupPlan, getCarePlan, relatedAddons, eur, usd, priceRange, TIER_LABEL } from '@/content/packages';
import { SectionHead, CtaBand, PriceTag } from '@/components/Studio';
import { STAGES } from '@/content/process';
import { SITE } from '@/lib/site';
import { jsonLdHtml } from '@/lib/json-ld';

interface Props { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return PACKAGES.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackage(slug);
  if (!pkg) return {};
  return {
    title: `${pkg.name} — ${priceRange(pkg.priceMin, pkg.priceMax, pkg.openEnded)}`,
    description: `${pkg.summary} Delivery in ${pkg.timeline}. Start with a 10% deposit, pay by USDT or PayPal.`,
    alternates: { canonical: `/services/${pkg.slug}` },
  };
}

export default async function PackagePage({ params }: Props) {
  const { slug } = await params;
  const pkg = getPackage(slug);
  if (!pkg) notFound();

  const setup = getSetupPlan(pkg.recommendedSetup);
  const care = getCarePlan(pkg.recommendedCare);
  const deposit = Math.round(pkg.priceMin * 0.1);
  const production = Math.round(pkg.priceMin * 0.4);
  const settlement = pkg.priceMin - deposit - production;
  const index = PACKAGES.findIndex((p) => p.slug === pkg.slug);
  const lighter = PACKAGES[index - 1];
  const heavier = PACKAGES[index + 1];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: pkg.name,
            serviceType: 'Web development',
            provider: { '@id': `${SITE.url}#org` },
            description: pkg.summary,
            areaServed: ['EU', 'Worldwide'],
            offers: {
              '@type': 'Offer',
              priceCurrency: 'EUR',
              priceSpecification: { '@type': 'PriceSpecification', minPrice: pkg.priceMin, maxPrice: pkg.priceMax, priceCurrency: 'EUR' },
              url: `${SITE.url}/services/${pkg.slug}`,
            },
          }),
        }}
      />

      <section className="hero relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <nav className="text-xs text-slate-500">
            <Link href="/services" className="hover:text-gold-500">Services</Link>
            <span className="mx-2">/</span>
            <span>{pkg.name}</span>
          </nav>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <span className="chip">
                {pkg.code} · {TIER_LABEL[pkg.tier]}
              </span>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl">{pkg.name}</h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-600">{pkg.summary}</p>
              <dl className="mt-8 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200 pt-6 text-sm">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Build price</dt>
                  <dd className="mt-1 font-display text-lg font-extrabold">{priceRange(pkg.priceMin, pkg.priceMax, pkg.openEnded)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Timeline</dt>
                  <dd className="mt-1 font-display text-lg font-extrabold">{pkg.timeline}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Scope</dt>
                  <dd className="mt-1 font-display text-lg font-extrabold">{pkg.pages}</dd>
                </div>
              </dl>
            </div>

            <aside className="panel h-fit p-6 text-ink-900">
              <PriceTag pkg={pkg} />
              <div className="mt-5 space-y-2 border-t border-[color:var(--accent-soft)] pt-4 text-sm">
                <div className="flex justify-between"><span className="text-steel-500">Booking deposit (10%)</span><strong>{eur(deposit)}</strong></div>
                <div className="flex justify-between"><span className="text-steel-500">Production (40%)</span><strong>{eur(production)}</strong></div>
                <div className="flex justify-between"><span className="text-steel-500">Settlement (50%)</span><strong>{eur(settlement)}</strong></div>
                <p className="hint">Shown at the bottom of the range. Your real figure is fixed after the scope review and the milestones recalculate from it.</p>
              </div>
              <Link href={`/portal/new?package=${pkg.slug}`} className="btn btn-primary mt-5 w-full">
                Start — pay {eur(deposit)} today
              </Link>
              <Link href="/contact" className="btn btn-ghost mt-2 w-full">Ask a question first</Link>
              <p className="mt-3 text-center text-[11px] text-steel-500">USDT ≈ {usd(deposit)} · or PayPal in EUR</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_.7fr]">
          <div>
            <SectionHead eyebrow="Included in the build price" title="What you get" />
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {pkg.includes.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm leading-relaxed">
                  <span className="tick mt-0.5">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {pkg.optional?.length ? (
              <>
                <h3 className="mt-10 font-display text-xl font-extrabold">Optional on this package</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {pkg.optional.map((o) => (
                    <span key={o} className="mk-chip">{o}</span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-steel-500">
                  Optional items are quoted during the scope review, or picked from the{' '}
                  <Link href="/services#addons" className="text-gold-500 underline">add-on catalogue</Link> when you open the project.
                </p>
              </>
            ) : null}

            <h3 className="mt-10 font-display text-xl font-extrabold">Who this is for</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {pkg.bestFor.map((b) => (
                <li key={b} className="panel px-4 py-3 text-sm font-medium">{b}</li>
              ))}
            </ul>

            <h3 className="mt-10 font-display text-xl font-extrabold">How this project will run</h3>
            <ol className="mt-4 space-y-3">
              {STAGES.map((s, i) => (
                <li key={s.key} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs font-extrabold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{s.name}</p>
                    <p className="text-sm text-steel-500">{s.blurb}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="space-y-6">
            {setup ? (
              <div className="panel p-5">
                <p className="badge badge-blue">Recommended one-time setup</p>
                <h3 className="mt-3 font-display text-lg font-extrabold">{setup.name}</h3>
                <p className="mt-1 font-display text-xl font-extrabold accent-text">
                  {setup.custom ? `from ${eur(setup.price)}` : priceRange(setup.price, setup.priceMax ?? setup.price)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-steel-500">{setup.blurb}</p>
                <Link href="/care#setup" className="btn btn-ghost btn-sm mt-4 w-full">See what it covers</Link>
              </div>
            ) : null}

            {care ? (
              <div className="panel p-5">
                <p className="badge badge-green">Recommended monthly care</p>
                <h3 className="mt-3 font-display text-lg font-extrabold">{care.name}</h3>
                <p className="mt-1 font-display text-xl font-extrabold accent-text">
                  {care.custom ? `from ${eur(care.price)}` : eur(care.price)}
                  <span className="text-sm font-normal text-steel-500">/month</span>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-steel-500">{care.blurb}</p>
                <p className="mt-2 text-xs text-steel-500">{care.hours} · response {care.response}</p>
                <Link href="/care#maintenance" className="btn btn-ghost btn-sm mt-4 w-full">Compare care plans</Link>
              </div>
            ) : null}

            <div className="panel p-5">
              <h3 className="font-display text-lg font-extrabold">Add-ons for this build</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {relatedAddons(pkg.slug).map((a) => (
                  <li key={a.slug} className="flex items-baseline justify-between gap-3 border-b border-[color:var(--accent-soft)] pb-2">
                    <span>{a.name}</span>
                    <span className="whitespace-nowrap text-xs font-bold">{priceRange(a.priceMin, a.priceMax, a.openEnded)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Neighbours */}
      <section className="mx-auto max-w-6xl px-4 pb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {lighter ? (
            <Link href={`/services/${lighter.slug}`} className="panel mk-lift block p-5">
              <p className="text-xs uppercase tracking-wide text-steel-500">← Smaller</p>
              <p className="mt-1 font-display text-lg font-extrabold">{lighter.name}</p>
              <p className="text-sm text-steel-500">{priceRange(lighter.priceMin, lighter.priceMax, lighter.openEnded)}</p>
            </Link>
          ) : <span />}
          {heavier ? (
            <Link href={`/services/${heavier.slug}`} className="panel mk-lift block p-5 text-right">
              <p className="text-xs uppercase tracking-wide text-steel-500">Bigger →</p>
              <p className="mt-1 font-display text-lg font-extrabold">{heavier.name}</p>
              <p className="text-sm text-steel-500">{priceRange(heavier.priceMin, heavier.priceMax, heavier.openEnded)}</p>
            </Link>
          ) : null}
        </div>
      </section>

      <CtaBand
        title={`Start your ${pkg.name.toLowerCase()}`}
        lead={`Open the project, pay the ${eur(deposit)} booking deposit and upload your concept. Your completion estimate appears the moment the concept lands.`}
        primary={{ href: `/portal/new?package=${pkg.slug}`, label: `Start — ${eur(deposit)} deposit` }}
      />
    </>
  );
}
