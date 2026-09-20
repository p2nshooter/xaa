import Link from 'next/link';
import type { Metadata } from 'next';
import { PACKAGES, ADDONS, TIER_LABEL, eur, priceRange, type Tier } from '@/content/packages';
import { PackageCard, AddOnCard, SectionHead, CtaBand } from '@/components/Studio';

export const metadata: Metadata = {
  title: 'Services & pricing',
  description:
    'Ten website and platform development packages, from a €500 landing page to a €1.5M global enterprise ecosystem. European pricing, published up front, paid in milestones via USDT or PayPal.',
  alternates: { canonical: '/services' },
};

const TIERS: { tier: Tier; blurb: string }[] = [
  { tier: 'starter', blurb: 'One person or one offer. Fast to build, cheap to run, built properly.' },
  { tier: 'business', blurb: 'The site a company is judged by — content system, credibility, search visibility.' },
  { tier: 'advanced', blurb: 'Working software: accounts, bookings, catalogues, dashboards, payments.' },
  { tier: 'enterprise', blurb: 'Multi-audience platforms, marketplaces and systems run to an SLA.' },
];

export default function ServicesPage() {
  return (
    <>
      <section className="hero relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <span className="chip">Services & pricing</span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Every package, every price, <span className="accent-text">published before you ask</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-600">
            These are real European development rates, in euros, before VAT where it applies. Each range covers the
            honest span between a lean build and a heavily customised one; your figure is fixed in writing after a scope
            review, and the milestone schedule is calculated from it automatically.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/portal/new" className="btn btn-primary">Open a project</Link>
            <Link href="/process" className="btn btn-ghost">How payment works</Link>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionHead eyebrow="At a glance" title="All ten packages" lead="Prices are one-time build costs. Setup and monthly maintenance are separate — see Setup & Care." />
        <div className="mt-8 panel overflow-x-auto p-2">
          <table className="data-table min-w-[720px]">
            <thead>
              <tr>
                <th>#</th>
                <th>Package</th>
                <th>Best for</th>
                <th>Timeline</th>
                <th className="text-right">Build price (EUR)</th>
                <th className="text-right">10% deposit</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {PACKAGES.map((p) => (
                <tr key={p.slug}>
                  <td className="font-mono text-xs text-steel-500">{p.code}</td>
                  <td>
                    <Link href={`/services/${p.slug}`} className="font-bold text-ink-900 hover:text-gold-500">{p.name}</Link>
                    <span className="ml-2 badge badge-grey">{TIER_LABEL[p.tier]}</span>
                  </td>
                  <td className="max-w-[220px] text-xs text-steel-500">{p.bestFor.slice(0, 2).join(' · ')}</td>
                  <td className="whitespace-nowrap text-xs">{p.timeline}</td>
                  <td className="whitespace-nowrap text-right font-serif font-extrabold">{priceRange(p.priceMin, p.priceMax, p.openEnded)}</td>
                  <td className="whitespace-nowrap text-right text-xs font-semibold text-gold-500">from {eur(Math.round(p.priceMin * 0.1))}</td>
                  <td className="text-right">
                    <Link href={`/portal/new?package=${p.slug}`} className="btn btn-primary btn-sm">Start</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Cards, grouped by tier */}
      {TIERS.map(({ tier, blurb }) => {
        const group = PACKAGES.filter((p) => p.tier === tier);
        if (!group.length) return null;
        return (
          <section key={tier} className="mx-auto max-w-6xl px-4 py-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-500">{TIER_LABEL[tier]}</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold">{blurb}</h2>
              </div>
              <p className="text-sm text-steel-500">{group.length} package{group.length > 1 ? 's' : ''}</p>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {group.map((p) => (
                <PackageCard key={p.slug} pkg={p} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Add-ons */}
      <section id="addons" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <SectionHead
          eyebrow="Add-on services"
          title="Quoted separately, added whenever you need them"
          lead="Select add-ons when you open the project and they are folded into the quote and the milestone schedule. Add them later and they are invoiced on their own."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ADDONS.map((a) => (
            <AddOnCard key={a.slug} addon={a} />
          ))}
        </div>
      </section>

      {/* What decides the final figure */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="panel-dark p-8 sm:p-10">
          <h2 className="font-display text-2xl font-extrabold">What moves a price inside its range</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory-100/75">
            Nothing here is a surprise charge. These are the factors we weigh during the scope review, and the ones we
            will walk you through line by line before anything is signed.
          </p>
          <div className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Number of unique page or screen designs',
              'Depth of the content or product catalogue',
              'Custom UI/UX versus adapting our system',
              'Number of user roles and permission rules',
              'Integrations with existing systems',
              'Payment, tax and invoicing complexity',
              'Languages, currencies and regions',
              'Expected traffic and concurrency',
              'Security, audit and compliance obligations',
              'Data migration from an existing platform',
              'Cloud infrastructure and environments',
              'SLA, support window and response targets',
            ].map((f) => (
              <p key={f} className="flex gap-2 text-sm text-ivory-100/85">
                <span className="text-gold-300">▸</span> {f}
              </p>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Not sure which package fits?"
        lead="Send us what you are trying to build. We will tell you which package it lands in, what it will realistically cost, and what we would leave out of a first version."
        primary={{ href: '/contact', label: 'Send a brief' }}
        secondary={{ href: '/portal/new', label: 'Open a project' }}
      />
    </>
  );
}
