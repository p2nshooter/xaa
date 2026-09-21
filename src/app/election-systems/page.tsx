import Link from 'next/link';
import type { Metadata } from 'next';
import { CIVIC_TIERS, CIVIC_CAPABILITIES, eur, usd, priceRange } from '@/content/packages';
import { WORKS } from '@/content/portfolio';
import { SectionHead, CtaBand } from '@/components/Studio';

export const metadata: Metadata = {
  title: 'Election & civic systems',
  description:
    'Voter-roll verification, offline field registers and live vote tallying — priced from a single village at €6,000 to a national programme at €600,000+. Built, and running.',
  alternates: { canonical: '/election-systems' },
};

export default function ElectionSystemsPage() {
  const civic = WORKS.find((w) => w.slug === 'app-desa');

  return (
    <>
      <section className="hero relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <span className="chip">Election &amp; civic systems</span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Software that has to work <span className="accent-text">on one particular day</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-steel-500">
            Voter-roll verification, a field register that runs with no signal, and a tally that produces a defensible
            recapitulation the same evening. We have built and run this — the demos on our work page are the real
            applications, with every real person replaced by generated data.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/portfolio#app-desa" className="btn btn-primary">See it running</Link>
            <Link href="/contact?tier=civic" className="btn btn-ghost">Discuss a programme</Link>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionHead
          eyebrow="Pricing by scale"
          title="From one village to a nation"
          lead="Priced on administrative scale because that is what a buyer knows, and because scale is what actually drives the cost: polling stations, simultaneous field officers, and the audit obligations that come with each level."
        />

        <div className="mt-10 overflow-x-auto">
          <table className="data-table min-w-[820px]">
            <thead>
              <tr>
                <th>#</th>
                <th>Tier</th>
                <th>Scale</th>
                <th>Capacity</th>
                <th>Timeline</th>
                <th className="text-right">Price (EUR)</th>
              </tr>
            </thead>
            <tbody>
              {CIVIC_TIERS.map((t) => (
                <tr key={t.slug}>
                  <td className="font-mono text-xs text-steel-400">{t.code}</td>
                  <td className="font-bold">
                    {t.name}
                    {t.popular ? <span className="ml-2 badge badge-blue">Most requested</span> : null}
                  </td>
                  <td className="text-xs text-steel-500">{t.scale}</td>
                  <td className="whitespace-nowrap text-xs">{t.capacity}</td>
                  <td className="whitespace-nowrap text-xs">{t.timeline}</td>
                  <td className="whitespace-nowrap text-right font-display font-extrabold">
                    {priceRange(t.priceMin, t.priceMax, t.openEnded)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {CIVIC_TIERS.map((t) => (
            <article key={t.slug} className={`premium-card flex h-full flex-col p-6 ${t.popular ? 'ring-2 ring-[color:var(--accent)]' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-steel-400">{t.code}</p>
                  <h3 className="mt-0.5 font-display text-xl font-extrabold">{t.name}</h3>
                  <p className="mt-1 text-xs text-steel-500">{t.scale}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-extrabold accent-text">
                    {priceRange(t.priceMin, t.priceMax, t.openEnded)}
                  </p>
                  <p className="text-xs text-steel-400">≈ {usd(t.priceMin)}+ · {t.timeline}</p>
                </div>
              </div>

              <p className="mt-3.5 text-sm leading-relaxed text-steel-500">{t.summary}</p>

              <ul className="mt-4 space-y-1.5">
                {t.includes.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-steel-500">
                    <span className="tick">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex gap-2 pt-6">
                <Link href={`/contact?tier=${t.slug}`} className="btn btn-primary btn-sm flex-1">Discuss this tier</Link>
              </div>
              <p className="mt-2 text-center text-[11px] text-steel-400">
                Starts from {eur(Math.round(t.priceMin * 0.1))} · 10% booking deposit
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* What we bring */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHead
          eyebrow="What every tier includes"
          title="The parts that decide whether it survives election day"
          lead="These are not upsells. They are the difference between a system that produces a defensible result and one that produces an argument."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CIVIC_CAPABILITIES.map((c) => (
            <div key={c.title} className="premium-card p-6">
              <h3 className="font-display text-base font-extrabold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-500">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demos */}
      {civic?.demos ? (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="panel border-l-4 border-l-red-400 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="stamp-note">Demo · sampling only</span>
              <h2 className="font-display text-xl font-extrabold">Try the real applications</h2>
            </div>
            <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-steel-500">
              These are the systems themselves, not mock-ups — with every name, national ID, address and account
              replaced by generated values, and only a sample of rows kept. The originals hold real citizen records and
              are not ours to publish.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {civic.demos.map((d) => (
                <a key={d.href} href={d.href} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" title={d.note}>
                  {d.label} ↗
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="panel border-l-4 border-l-[color:var(--accent)] p-6">
          <h2 className="font-display text-lg font-extrabold">Scope, and what moves the price</h2>
          <p className="mt-2 text-sm leading-relaxed text-steel-500">
            Ranges cover the honest span between adapting what we have already built and a programme with its own
            register format, its own legal obligations and its own integrations. The factors that move a figure inside
            its range: number of polling stations and field officers, the peak submission window, audit and
            chain-of-custody requirements, languages, accessibility obligations, whether a public results surface is in
            scope, and the SLA you need around election day. Final pricing follows a scope review, as with every{' '}
            <Link href="/services" className="text-gold-500 underline">package we publish</Link>.
          </p>
        </div>
      </section>

      <CtaBand
        title="Running an election programme?"
        lead="Tell us the scale — villages, polling stations, expected field officers — and we will come back with the tier it lands in and a realistic figure."
        primary={{ href: '/contact?tier=civic', label: 'Send the requirements' }}
        secondary={{ href: '/portfolio#app-desa', label: 'See what we built' }}
      />
    </>
  );
}
