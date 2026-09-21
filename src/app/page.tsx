import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { PACKAGES, eur, priceRange } from '@/content/packages';
import { localisedPackages, localisedAddons, localisedSetupPlans, localisedCarePlans } from '@/content/packages.i18n';
import { PackageCard, SectionHead, CtaBand, StatStrip, AddOnCard } from '@/components/Studio';
import { BrandMark } from '@/components/Site';
import { localisedStages } from '@/content/process';
import { translator } from '@/lib/i18n';
import { getLang } from '@/lib/i18n.server';

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: '/' },
};

const CAPABILITIES = [
  { icon: '◈', title: 'Websites that sell', body: 'Landing pages, portfolios, company profiles and corporate sites — fast, indexed, and written to convert rather than to decorate.' },
  { icon: '▦', title: 'Commerce', body: 'Stores from a first catalogue to multi-warehouse, multi-currency operations, with checkout, fulfilment and reconciliation that hold up.' },
  { icon: '◮', title: 'Products & SaaS', body: 'Multi-tenant applications with subscriptions, billing, roles and an API — the commercial plumbing that turns software into revenue.' },
  { icon: '◰', title: 'Enterprise systems', body: 'Portals, microservices, SSO, RBAC, audit trails and disaster recovery, delivered to an SLA your risk team can sign.' },
];

const PRINCIPLES = [
  { n: '01', title: 'You pay in steps, not up front', body: 'A 10% deposit opens the project. 40% starts production. The last 50% is only due once the build is 75–80% finished and you have seen it running.' },
  { n: '02', title: 'A real date, not "soon"', body: 'The moment your concept lands, the portal publishes a completion estimate drawn from the package timeline — and it is visible to you for the rest of the project.' },
  { n: '03', title: 'Progress you can check at 2am', body: 'Every project has a live progress percentage, a milestone ledger and a dated activity log. No status meetings required.' },
  { n: '04', title: 'You own what we build', body: 'Source code, design files, content and infrastructure accounts transfer to you at handover. Setup and maintenance are separate services, never a lock-in.' },
];

export default async function HomePage() {
  const lang = await getLang();
  const t = translator(lang);
  const stages = localisedStages(lang);
  const pkgs = localisedPackages(lang);
  const addons = localisedAddons(lang);
  const setupPlans = localisedSetupPlans(lang);
  const carePlans = localisedCarePlans(lang);
  const featuredSlugs = ['landing-page', 'company-profile', 'business-platform', 'ecommerce', 'saas-platform', 'enterprise-platform'];
  const featured = pkgs.filter((p) => featuredSlugs.includes(p.slug));

  return (
    <>
      {/* ───────────────── Hero ───────────────── */}
      <section className="hero relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="mk-orb" style={{ width: 420, height: 420, left: -160, top: -200, background: '#bcd6ff', opacity: 0.55 }} />
        <div className="mk-orb mk-orb-2" style={{ width: 340, height: 340, right: -130, bottom: -200, background: '#b8f1fb', opacity: 0.55 }} />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.15fr_.85fr] lg:py-28">
          <div className="mk-fade-up">
            <span className="chip max-w-full text-[9px] sm:text-[0.7rem]">
              <span className="mk-live-dot" /> {SITE.expansion}
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              {t('home.hero.lead')}{' '}
              <span className="accent-text">{t('home.hero.accent')}</span>
            </h1>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-slate-600">
              {t('home.hero.body')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services" className="btn btn-primary">{t('home.hero.seePackages')}</Link>
              <Link href="/portal/new" className="btn btn-ghost">{t('home.hero.openProject')}</Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200 pt-6 text-sm">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('home.hero.startFrom')}</dt>
                <dd className="mt-1 font-display text-base font-extrabold sm:text-xl">{t('home.hero.deposit10')}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('home.hero.paidIn')}</dt>
                <dd className="mt-1 font-display text-base font-extrabold sm:text-xl">USDT · PayPal</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('home.hero.deliveryFrom')}</dt>
                <dd className="mt-1 font-display text-base font-extrabold sm:text-xl">{t('home.hero.days3')}</dd>
              </div>
            </dl>
          </div>

          <div className="mk-fade-up mk-d2 relative flex items-center justify-center">
            <div className="mk-ring" style={{ width: 330, height: 330 }} />
            <div className="mk-ring" style={{ width: 430, height: 430, animationDirection: 'reverse' }} />
            <BrandMark size={230} className="relative drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* ───────────────── What XAA stands for ───────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="panel overflow-hidden">
          <div className="grid gap-px bg-[color:var(--accent-soft)] sm:grid-cols-2 lg:grid-cols-4">
            {[
              { letter: 'X', word: t('home.mean.xWord'), body: t('home.mean.xBody') },
              { letter: 'A', word: t('home.mean.a1Word'), body: t('home.mean.a1Body') },
              { letter: 'A', word: t('home.mean.a2Word'), body: t('home.mean.a2Body') },
              { letter: 'ES', word: t('home.mean.esWord'), body: t('home.mean.esBody') },
            ].map((x, i) => (
              <div key={i} className="bg-white p-8">
                <p className="font-display text-5xl font-extrabold accent-text">{x.letter}</p>
                <p className="mt-2 font-display text-xl font-extrabold">{x.word}</p>
                <p className="mt-3 text-sm leading-relaxed text-steel-500">{x.body}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-steel-500">
          <strong className="text-ink-900">{SITE.expansionPlain}</strong> — {t('home.mean.footnote')}
        </p>
      </section>

      {/* ───────────────── Capabilities ───────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHead
          eyebrow={t('home.cap.eyebrow')}
          title={t('home.cap.title')}
          lead={t('home.cap.lead')}
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((c, i) => (
            <div key={c.title} className={`premium-card mk-fade-up mk-d${i + 1} p-6`}>
              <span className="mk-icon-bubble text-gold-500">{c.icon}</span>
              <h3 className="mt-4 font-display text-lg font-extrabold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-500">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── Packages ───────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead
            eyebrow={t('home.pkg.eyebrow')}
            title={t('home.pkg.title')}
            lead={t('home.pkg.lead')}
          />
          <Link href="/services" className="btn btn-ghost btn-sm shrink-0">{t('home.pkg.all')}</Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <PackageCard key={p.slug} pkg={p} lang={lang} />
          ))}
        </div>
        <div className="mt-8 panel flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="text-sm text-steel-500">
            {t('home.pkg.also')} {pkgs.filter((p) => !featuredSlugs.includes(p.slug)).map((p) => p.name).join(' · ')}.
          </p>
          <Link href="/services" className="btn btn-dark btn-sm">{t('home.pkg.compare')}</Link>
        </div>
      </section>

      {/* ───────────────── How payment works ───────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHead
          eyebrow={t('home.how.eyebrow')}
          title={t('home.how.title')}
          lead={t('home.how.lead')}
          center
        />
        <ol className="mt-12 grid gap-4 md:grid-cols-3 lg:grid-cols-7">
          {stages.map((s, i) => (
            <li key={s.key} className={`premium-card mk-fade-up mk-d${(i % 6) + 1} flex flex-col p-5`}>
              <span className="font-display text-2xl font-extrabold accent-text">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-2 text-sm font-bold leading-snug">{s.name}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-steel-500">{s.blurb}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex justify-center">
          <Link href="/process" className="btn btn-ghost btn-sm">{t('home.how.readFull')}</Link>
        </div>
      </section>

      {/* ───────────────── Principles ───────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <SectionHead
            eyebrow={t('home.principles.eyebrow')}
            title={t('home.principles.title')}
            lead={t('home.principles.lead')}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.n} className="panel p-5">
                <p className="font-display text-lg font-extrabold text-gold-500">{p.n}</p>
                <h3 className="mt-1 font-bold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel-500">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Setup & care ───────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHead
          eyebrow={t('home.after.eyebrow')}
          title={t('home.after.title')}
          lead={t('home.after.lead')}
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="panel p-6">
            <p className="badge badge-blue">{t('home.setup.oneTime')}</p>
            <h3 className="mt-3 font-display text-xl font-extrabold">{t('home.setup.title')}</h3>
            <p className="mt-2 text-sm leading-relaxed text-steel-500">
              {t('home.setup.body')}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {setupPlans.map((s) => (
                <li key={s.slug} className="flex items-baseline justify-between gap-4 border-b border-[color:var(--accent-soft)] pb-2">
                  <span className="font-semibold">{s.name}</span>
                  <span className="whitespace-nowrap font-serif font-extrabold">
                    {s.custom ? `from ${eur(s.price)}` : priceRange(s.price, s.priceMax ?? s.price)}
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/care#setup" className="btn btn-ghost btn-sm mt-5">{t('home.setup.link')}</Link>
          </div>
          <div className="panel p-6">
            <p className="badge badge-green">{t('home.care.monthly')}</p>
            <h3 className="mt-3 font-display text-xl font-extrabold">{t('home.care.title')}</h3>
            <p className="mt-2 text-sm leading-relaxed text-steel-500">
              {t('home.care.body')}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {carePlans.map((c) => (
                <li key={c.slug} className="flex items-baseline justify-between gap-4 border-b border-[color:var(--accent-soft)] pb-2">
                  <span className="font-semibold">{c.name}</span>
                  <span className="whitespace-nowrap font-serif font-extrabold">
                    {c.custom ? `from ${eur(c.price)}` : eur(c.price)}<span className="text-xs font-normal text-steel-500">/mo</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/care#maintenance" className="btn btn-ghost btn-sm mt-5">{t('home.care.link')}</Link>
          </div>
        </div>
      </section>

      {/* ───────────────── Add-ons ───────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHead eyebrow={t('home.addons.eyebrow')} title={t('home.addons.title')} lead={t('home.addons.lead')} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {addons.slice(0, 6).map((a) => (
            <AddOnCard key={a.slug} addon={a} />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/services#addons" className="btn btn-ghost btn-sm">{t('home.addons.all')}</Link>
        </div>
      </section>

      {/* ───────────────── Numbers ───────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <StatStrip
          items={[
            { value: t('home.stat.pkgV'), label: t('home.stat.pkgL') },
            { value: t('home.stat.splitV'), label: t('home.stat.splitL') },
            { value: '2', label: t('home.stat.railsL') },
            { value: '100%', label: t('home.stat.ownL') },
          ]}
        />
      </section>

      <CtaBand
        title={t('cta.title')}
        lead={t('cta.lead')}
        primary={{ href: '/portal/new', label: t('cta.primary') }}
        secondary={{ href: '/contact', label: t('cta.secondary') }}
      />
    </>
  );
}
