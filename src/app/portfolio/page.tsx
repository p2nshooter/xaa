import Link from 'next/link';
import type { Metadata } from 'next';
import { WORKS, NETWORK, portfolioTotals, type Work } from '@/content/portfolio';
import { SUPER_ENTERPRISE, eur, usd } from '@/content/packages';
import { SectionHead, CtaBand } from '@/components/Studio';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Systems XAA has built and runs: an AI and security platform, a multi-module consumer platform, production management software, web applications and an editorial network — with the build price each one represents.',
  alternates: { canonical: '/portfolio' },
};

const fmtLoc = (n: number) => `${Math.round(n / 1000)}k`;

export default function PortfolioPage() {
  const t = portfolioTotals();
  const featured = WORKS.filter((w) => w.featured);
  const rest = WORKS.filter((w) => !w.featured);

  return (
    <>
      <section className="hero relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <span className="chip">Work</span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Systems we built, <span className="accent-text">and still run</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-steel-500">
            These are the studio&apos;s own platforms and products, not client commissions — which means we can show you
            the whole thing rather than a screenshot cleared by someone&apos;s legal team. Every figure below is
            measured from the source. The price beside each is what a comparable build costs at our published rates.
          </p>

          <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-6 border-t border-slate-200 pt-6 sm:grid-cols-4">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Systems live</dt>
              <dd className="mt-1 font-display text-2xl font-extrabold">{t.systems}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Lines shipped</dt>
              <dd className="mt-1 font-display text-2xl font-extrabold">{fmtLoc(t.loc)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Routes</dt>
              <dd className="mt-1 font-display text-2xl font-extrabold">{t.routes}+</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Build value</dt>
              <dd className="mt-1 font-display text-2xl font-extrabold">{eur(t.min)}+</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Flagship work */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionHead
          eyebrow="Flagship"
          title="The three largest"
          lead="Measured in routes and lines of TypeScript, read straight off the repositories."
        />
        <div className="mt-10 space-y-6">
          {featured.map((w) => (
            <WorkRow key={w.slug} work={w} />
          ))}
        </div>
      </section>

      {/* Everything else */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <SectionHead eyebrow="Also built" title="Platforms and sites" />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {rest.map((w) => (
            <WorkCard key={w.slug} work={w} />
          ))}
        </div>
      </section>

      {/* Editorial network */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="panel p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="eyebrow">{NETWORK.sites.length} sites</p>
              <h2 className="mt-1.5 font-display text-2xl font-extrabold">{NETWORK.name}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-steel-500">{NETWORK.summary}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-extrabold accent-text">
                {eur(NETWORK.priceMin)} – {eur(NETWORK.priceMax)}
              </p>
              <p className="text-xs text-steel-400">{NETWORK.priceNote}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {NETWORK.sites.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mk-chip transition hover:border-[color:var(--accent)] hover:text-gold-500"
              >
                {s.name} ↗
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Super Enterprise */}
      <section id="super-enterprise" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <div className="panel-dark relative overflow-hidden p-8 sm:p-12">
          <div className="mk-grid-bg absolute inset-0 opacity-20" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <span className="mk-chip">{SUPER_ENTERPRISE.code} · Flagship engagement</span>
                <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">{SUPER_ENTERPRISE.name}</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-white/85">{SUPER_ENTERPRISE.summary}</p>
              </div>
              <div className="shrink-0 rounded-xl bg-white/10 p-5 text-center">
                <p className="font-display text-3xl font-extrabold">{SUPER_ENTERPRISE.priceLabel}</p>
                <p className="mt-1 text-xs text-white/70">per programme · {SUPER_ENTERPRISE.timeline}</p>
                <p className="mt-3 border-t border-white/20 pt-3 text-2xl font-extrabold">
                  {SUPER_ENTERPRISE.slots}
                </p>
                <p className="text-xs text-white/70">engagements at a time</p>
              </div>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_.6fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">What it covers</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {SUPER_ENTERPRISE.includes.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-white/90">
                      <span className="text-white/60">▸</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">Built for</p>
                <ul className="mt-4 space-y-2">
                  {SUPER_ENTERPRISE.forWhom.map((f) => (
                    <li key={f} className="text-sm text-white/85">{f}</li>
                  ))}
                </ul>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-white/60">How it runs</p>
                <ul className="mt-3 space-y-1.5">
                  {SUPER_ENTERPRISE.terms.map((f) => (
                    <li key={f} className="text-xs text-white/75">{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/20 pt-7">
              <Link href="/contact?tier=super-enterprise" className="btn btn-primary">Enquire about a slot</Link>
              <Link href="/process" className="btn btn-ghost">How a programme runs</Link>
              <p className="text-xs text-white/70">
                Contracted in EUR ({eur(SUPER_ENTERPRISE.priceEurMin)} – {eur(SUPER_ENTERPRISE.priceEurMax)}) ·
                scope review before signature
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="panel border-l-4 border-l-[color:var(--accent)] p-6">
          <h2 className="font-display text-lg font-extrabold">About the prices on this page</h2>
          <p className="mt-2 text-sm leading-relaxed text-steel-500">
            Each figure is what commissioning a comparable system costs at the rates published on{' '}
            <Link href="/services" className="text-gold-500 underline">our services page</Link> — it is an estimate of
            build value, not an invoice anyone received, and not a claim about revenue. The scope numbers (routes and
            lines of code) are counted from the repositories, and scope is only one input into a price: the rest are
            listed on the services page.
          </p>
        </div>
      </section>

      <CtaBand
        title="Want something on this scale?"
        lead="Send the brief. We will tell you which package it lands in, what it will realistically cost, and what we would cut from a first version."
        primary={{ href: '/contact', label: 'Send a brief' }}
        secondary={{ href: '/services', label: 'See packages' }}
      />
    </>
  );
}

function WorkRow({ work }: { work: Work }) {
  return (
    <article className={`premium-card p-7 ${work.stamped ? 'stamped' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-2xl">
          <p className="eyebrow">{work.kind}</p>
          <h3 className="mt-1.5 font-display text-2xl font-extrabold">{work.name}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-steel-500">{work.summary}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-extrabold accent-text">
            {eur(work.priceMin)} – {eur(work.priceMax)}
          </p>
          <p className="text-xs text-steel-400">≈ {usd(work.priceMin)} – {usd(work.priceMax)}</p>
          <p className="mt-1.5 text-xs text-steel-500">{work.packageName}</p>
        </div>
      </div>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {work.highlights.map((h) => (
          <li key={h} className="flex gap-2 text-sm text-steel-500">
            <span className="tick">✓</span>
            <span>{h}</span>
          </li>
        ))}
      </ul>


      {work.demos ? (
        <div className="relative mt-6 rounded-xl border border-red-200 bg-red-50/40 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="stamp-note">Demo · sampling only</span>
            <p className="text-xs text-steel-500">
              Not real data. Every name, ID and address in these is generated, and only a sample of rows is kept —
              the systems themselves run on records that are not ours to publish.
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {work.demos.map((d) => (
              <a
                key={d.href}
                href={d.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm bg-white"
                title={d.note}
              >
                {d.label} ↗
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {work.tenants ? (
        <div className="mt-6 rounded-xl bg-[color:var(--surface)] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-steel-400">
            {work.tenants.length} production domains, one codebase
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {work.tenants.map((t) => (
              <a
                key={t.domain}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mk-chip bg-white transition hover:border-[color:var(--accent)] hover:text-gold-500"
              >
                {t.domain} <span className="ml-1 font-normal normal-case tracking-normal opacity-60">{t.note}</span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--line)] pt-5">
        <dl className="flex flex-wrap gap-6 text-xs">
          <div>
            <dt className="font-semibold uppercase tracking-wide text-steel-400">Routes</dt>
            <dd className="mt-0.5 font-display text-base font-extrabold">{work.routes}</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide text-steel-400">Lines</dt>
            <dd className="mt-0.5 font-display text-base font-extrabold">{fmtLoc(work.loc)}</dd>
          </div>
          <div className="max-w-xs">
            <dt className="font-semibold uppercase tracking-wide text-steel-400">Stack</dt>
            <dd className="mt-0.5 text-sm text-steel-500">{work.stack.join(' · ')}</dd>
          </div>
        </dl>
        <WorkLink work={work} />
      </div>
    </article>
  );
}

function WorkCard({ work }: { work: Work }) {
  return (
    <article className={`premium-card flex h-full flex-col p-6 ${work.stamped ? 'stamped' : ''}`}>
      <p className="eyebrow">{work.kind}</p>
      <h3 className="mt-1.5 font-display text-xl font-extrabold">{work.name}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-steel-500">{work.summary}</p>

      <ul className="mt-4 space-y-1.5">
        {work.highlights.slice(0, 4).map((h) => (
          <li key={h} className="flex gap-2 text-sm text-steel-500">
            <span className="tick">✓</span>
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl bg-[color:var(--surface)] p-4">
        <p className="font-display text-lg font-extrabold accent-text">
          {eur(work.priceMin)} – {eur(work.priceMax)}
        </p>
        <p className="text-xs text-steel-400">
          {work.packageName} · {work.routes} routes · {fmtLoc(work.loc)} lines
        </p>
      </div>

      {work.demos ? (
        <div className="relative mt-4 rounded-xl border border-red-200 bg-red-50/40 p-3">
          <span className="stamp-note">Demo · sampling only</span>
          <p className="mt-2 text-xs leading-relaxed text-steel-500">
            Not real data — names, IDs and addresses are generated and only a sample of rows is kept.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {work.demos.map((d) => (
              <a key={d.href} href={d.href} target="_blank" rel="noopener noreferrer"
                 className="btn btn-ghost btn-sm bg-white" title={d.note}>
                {d.label} ↗
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="relative mt-auto flex items-center justify-between gap-3 pt-5">
        <p className="text-xs text-steel-400">{work.stack.slice(0, 3).join(' · ')}</p>
        <WorkLink work={work} />
      </div>
    </article>
  );
}

function WorkLink({ work }: { work: Work }) {
  if (!work.url) {
    return <span className="badge badge-grey">{work.urlPending ?? 'Internal system'}</span>;
  }
  return (
    <a href={work.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
      {work.urlLabel ?? work.url.replace('https://', '')} ↗
    </a>
  );
}
