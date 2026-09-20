import Link from 'next/link';
import type { Metadata } from 'next';
import { SETUP_PLANS, CARE_PLANS, eur, priceRange } from '@/content/packages';
import { SectionHead, CtaBand } from '@/components/Studio';

export const metadata: Metadata = {
  title: 'Setup & Care',
  description:
    'One-time setup from €149 and monthly maintenance plans from €99 — priced separately from the build, so you only pay for the help you actually want.',
  alternates: { canonical: '/care' },
};

export default function CarePage() {
  return (
    <>
      <section className="relative overflow-hidden metal-wash text-ivory-50">
        <div className="mk-grid-bg absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <span className="mk-chip border-white/25 text-ivory-100">Setup & Care</span>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-black leading-tight sm:text-5xl">
            Getting you live is one service. <span className="accent-text">Keeping you live is another.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ivory-100/80">
            Both are priced separately from the build, and both are optional. Take the setup once and run the site
            yourself; take a care plan and never think about an update again. Care plans are month to month — cancel
            with 30 days&apos; notice, and everything still belongs to you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#setup" className="btn btn-primary">One-time setup</a>
            <a href="#maintenance" className="btn btn-ghost">Monthly care plans</a>
          </div>
        </div>
      </section>

      {/* ───────── Setup ───────── */}
      <section id="setup" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <SectionHead
          eyebrow="One-time · paid once"
          title="Setup service"
          lead="A single guided session where we configure everything around the build and hand it over. You keep the accounts, the passwords and the recording."
        />

        <div className="mt-8 panel p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-steel-500">Why it is separate</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-800/75">
            Plenty of clients already have a hosting provider, a domain registrar and an IT person. Charging every
            client for setup they do not need is how agencies quietly pad a quote. So it sits on its own line: choose
            it when you open the project, add it later, or never take it at all.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SETUP_PLANS.map((s) => (
            <article key={s.slug} className="premium-card flex h-full flex-col p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-steel-500">One-time</p>
              <h3 className="mt-1 font-serif text-xl font-black">{s.name}</h3>
              <p className="mt-3 font-serif text-2xl font-black accent-text">
                {s.custom ? `from ${eur(s.price)}` : priceRange(s.price, s.priceMax ?? s.price)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-800/70">{s.blurb}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {s.includes.map((f) => (
                  <li key={f} className="flex gap-2"><span className="tick mt-0.5">✓</span><span>{f}</span></li>
                ))}
              </ul>
              <Link href={`/portal/new?setup=${s.slug}`} className="btn btn-ghost btn-sm mt-auto pt-2">Add to a project</Link>
            </article>
          ))}
        </div>
      </section>

      {/* ───────── Care ───────── */}
      <section id="maintenance" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <SectionHead
          eyebrow="Monthly · cancel any month"
          title="Care plans"
          lead="Software rots if nobody touches it. A care plan covers the patching, backups, monitoring and small changes that keep a site fast, secure and current — plus a block of development hours each month that roll nowhere but get used."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {CARE_PLANS.map((c) => (
            <article key={c.slug} className={`premium-card flex h-full flex-col p-6 ${c.popular ? 'ring-2 ring-[color:var(--accent)]' : ''}`}>
              {c.popular ? <span className="badge badge-blue absolute right-4 top-4">Most chosen</span> : null}
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-steel-500">Monthly</p>
              <h3 className="mt-1 font-serif text-xl font-black">{c.name}</h3>
              <p className="mt-3 font-serif text-3xl font-black accent-text">
                {c.custom ? `from ${eur(c.price)}` : eur(c.price)}
                <span className="text-sm font-normal text-steel-500">/mo</span>
              </p>
              {c.priceMax ? <p className="text-xs text-steel-500">up to {eur(c.priceMax)}/mo depending on scale and SLA</p> : null}
              <p className="mt-3 text-sm leading-relaxed text-ink-800/70">{c.blurb}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-ivory-100/60 p-3 text-xs">
                <div>
                  <dt className="font-bold uppercase text-steel-500">Included time</dt>
                  <dd className="mt-0.5 font-semibold">{c.hours}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase text-steel-500">Response</dt>
                  <dd className="mt-0.5 font-semibold">{c.response}</dd>
                </div>
              </dl>
              <ul className="mt-4 space-y-1.5 text-sm">
                {c.includes.map((f) => (
                  <li key={f} className="flex gap-2"><span className="tick mt-0.5">✓</span><span>{f}</span></li>
                ))}
              </ul>
              <Link href={`/portal/new?care=${c.slug}`} className="btn btn-ghost btn-sm mt-auto pt-2">Add to a project</Link>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { t: 'Billed monthly, in advance', b: 'Invoiced in EUR, payable in USDT or PayPal like everything else. The first month starts at handover, not at order.' },
            { t: 'Hours are real hours', b: 'Your monthly allowance covers content changes, small features and fixes. We log what was used and show it on the invoice.' },
            { t: 'No lock-in', b: 'Cancel with 30 days notice. You keep the code, the accounts and the data — a care plan buys attention, not custody.' },
          ].map((x) => (
            <div key={x.t} className="panel p-5">
              <h3 className="font-bold">{x.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-800/70">{x.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="panel overflow-x-auto p-2">
          <table className="data-table min-w-[640px]">
            <thead>
              <tr>
                <th>Care plan</th>
                <th>Monthly</th>
                <th>Dev time</th>
                <th>Response</th>
                <th>Best paired with</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="font-bold">Essential</td><td>{eur(99)}</td><td>2 h</td><td>2 business days</td><td>Landing page · Portfolio</td></tr>
              <tr><td className="font-bold">Growth</td><td>{eur(299)}</td><td>6 h</td><td>1 business day</td><td>Company profile</td></tr>
              <tr><td className="font-bold">Business</td><td>{eur(749)}</td><td>16 h</td><td>4 business hours</td><td>Corporate · Platform · E-commerce</td></tr>
              <tr><td className="font-bold">Enterprise</td><td>from {eur(2500)}</td><td>Dedicated</td><td>1 hour, 24/7 SLA</td><td>Marketplace · SaaS · Enterprise</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <CtaBand
        title="Add setup or care to a project"
        lead="Both can be selected when you open a project, or added at any point afterwards. Neither is required to work with us."
        primary={{ href: '/portal/new', label: 'Open a project' }}
        secondary={{ href: '/services', label: 'See build packages' }}
      />
    </>
  );
}
