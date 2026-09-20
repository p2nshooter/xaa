import type { Metadata } from 'next';
import { SectionHead, CtaBand } from '@/components/Studio';

export const metadata: Metadata = {
  title: 'Capabilities & stack',
  description:
    'What XAA builds with and how: modern web frameworks, edge deployment, relational data, payments, security and AI integration — and the engineering standards every build is held to.',
  alternates: { canonical: '/work' },
};

const STACK = [
  {
    area: 'Front end',
    items: ['React & Next.js', 'TypeScript', 'Tailwind CSS', 'Design systems & component libraries', 'Accessibility (WCAG 2.2 AA)', 'Core Web Vitals budgets'],
  },
  {
    area: 'Back end',
    items: ['Node.js & edge runtimes', 'REST and typed RPC APIs', 'Background jobs & schedulers', 'Webhooks and event handling', 'Caching strategies', 'Rate limiting & abuse control'],
  },
  {
    area: 'Data',
    items: ['PostgreSQL / MySQL', 'SQLite & D1 at the edge', 'Redis & KV caching', 'Object storage (S3 / R2)', 'Search indexing', 'Migrations, backups & restore drills'],
  },
  {
    area: 'Infrastructure',
    items: ['Cloudflare, Vercel, AWS', 'Containers & Kubernetes', 'Infrastructure as code', 'CI/CD with preview environments', 'CDN & global edge delivery', 'Monitoring, logging & alerting'],
  },
  {
    area: 'Commerce & payments',
    items: ['Stripe, Adyen, Mollie, PayPal', 'Crypto settlement (USDT)', 'Subscriptions & usage billing', 'Tax / VAT handling', 'Invoicing & reconciliation', 'Shipping & carrier APIs'],
  },
  {
    area: 'Security',
    items: ['SSO, OAuth2 & OIDC', 'MFA and session hardening', 'RBAC & permission modelling', 'Encryption at rest and in transit', 'Audit logging', 'Dependency & configuration scanning'],
  },
  {
    area: 'AI',
    items: ['Assistants over your own data', 'Retrieval pipelines', 'Document extraction & classification', 'Recommendation & ranking', 'Workflow automation', 'Evaluation and guardrails'],
  },
  {
    area: 'Growth',
    items: ['Technical SEO & schema', 'Analytics & conversion tracking', 'A/B testing', 'Email & lifecycle automation', 'Performance tuning', 'Migration without losing rankings'],
  },
];

const STANDARDS = [
  { t: 'Typed end to end', b: 'TypeScript across the stack with a shared model layer. If the data shape changes, the build tells us before the client does.' },
  { t: 'Reviewed, not just written', b: 'Every change goes through review and automated checks. Nothing reaches production because one person was confident on a Friday.' },
  { t: 'Deployed continuously', b: 'Preview environment per change, staging before production, and a rollback that takes a minute rather than an evening.' },
  { t: 'Measured in the open', b: 'Performance budgets, error tracking and uptime monitoring from day one, with the numbers visible to you, not just to us.' },
  { t: 'Documented for the next person', b: 'A runbook, an architecture note and an admin guide come with the handover — including the parts you would hire someone else to change.' },
  { t: 'Owned by you', b: 'Repositories, design files, cloud accounts and domains are transferred at handover. No hostage infrastructure, ever.' },
];

export default function WorkPage() {
  return (
    <>
      <section className="relative overflow-hidden metal-wash text-ivory-50">
        <div className="mk-grid-bg absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <span className="mk-chip border-white/25 text-ivory-100">Capabilities</span>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-black leading-tight sm:text-5xl">
            The same engineering standard <span className="accent-text">at every price point</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ivory-100/80">
            A landing page and an enterprise platform differ in scope, not in craft. Both are typed, reviewed, tested,
            monitored and documented — because the cheap build is usually the one a business grows out of fastest, and
            it should be ready when that happens.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionHead eyebrow="Stack" title="What we build with" lead="Chosen per project from this set. We do not start every brief with the same framework and call it a strategy." />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STACK.map((s) => (
            <div key={s.area} className="panel p-5">
              <h3 className="font-serif text-lg font-black">{s.area}</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-800/75">
                {s.items.map((i) => (
                  <li key={i} className="flex gap-2"><span className="text-gold-400">▸</span><span>{i}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHead eyebrow="Standards" title="What holds on every project" />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {STANDARDS.map((s) => (
            <div key={s.t} className="premium-card p-6">
              <h3 className="font-bold">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-800/70">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="panel-dark p-8 sm:p-10">
          <h2 className="font-serif text-2xl font-black">Industries we work in</h2>
          <p className="mt-3 max-w-2xl text-sm text-ivory-100/75">
            Sector experience matters less than people pretend — but it does shape the questions we know to ask early.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              'Professional services', 'Retail & D2C', 'B2B wholesale', 'Hospitality', 'Healthcare & clinics',
              'Education & training', 'Real estate', 'Logistics', 'Manufacturing', 'Financial services',
              'Travel', 'Media & publishing', 'Non-profit', 'Public sector', 'Technology & SaaS',
            ].map((i) => (
              <span key={i} className="mk-chip border-white/25 text-ivory-100">{i}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHead eyebrow="Honest answer" title="What we will not do" lead="Saying yes to everything is how studios miss dates. These are the jobs we turn down, and we will tell you on the first call." />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {[
            { t: 'A platform with no owner on your side', b: 'Every build needs one person who can decide. Without that, scope drifts and the date goes with it.' },
            { t: 'Rescue work we cannot inspect', b: 'We will happily take over an existing codebase — after a paid audit. Committing to fix code sight-unseen helps nobody.' },
            { t: 'Guaranteed search rankings', b: 'We build sites that rank well and we do the technical work properly. Anyone promising position one is selling something else.' },
            { t: 'Grey-area products', b: 'No systems whose purpose is to deceive users, harvest data without consent, or evade regulation in the market they operate in.' },
          ].map((x) => (
            <div key={x.t} className="panel p-5">
              <h3 className="font-bold">{x.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-800/70">{x.b}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand
        title="Tell us what you need built"
        lead="Send the brief and we will come back with the package it fits, a realistic number, and what we would cut from version one."
        primary={{ href: '/contact', label: 'Send a brief' }}
        secondary={{ href: '/services', label: 'Browse packages' }}
      />
    </>
  );
}
