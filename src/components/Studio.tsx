import Link from 'next/link';
import { eur, usd, priceRange, type Package, type AddOn } from '@/content/packages';
import { tierLabel } from '@/content/packages.i18n';
import { pick, type Lang } from '@/lib/i18n';

/** Shared building blocks for the commercial pages. */

type CardCopy = {
  mostRequested: string; usdtNote: string; timeline: string; scope: string;
  moreIncluded: (n: number) => string; fullSpec: string; startFrom: string; deposit: string;
};
const CARD: Record<Lang, CardCopy> = {
  en: {
    mostRequested: 'Most requested', usdtNote: 'in USDT · one-time build cost', timeline: 'Timeline', scope: 'Scope',
    moreIncluded: (n) => `+ ${n} more included`, fullSpec: 'Full spec', startFrom: 'Start from', deposit: '10% booking deposit',
  },
  es: {
    mostRequested: 'Más solicitado', usdtNote: 'en USDT · coste único de desarrollo', timeline: 'Plazo', scope: 'Alcance',
    moreIncluded: (n) => `+ ${n} más incluidos`, fullSpec: 'Ficha completa', startFrom: 'Desde', deposit: '10% de depósito de reserva',
  },
  id: {
    mostRequested: 'Paling diminta', usdtNote: 'dalam USDT · biaya pembuatan sekali', timeline: 'Lini masa', scope: 'Cakupan',
    moreIncluded: (n) => `+ ${n} lagi termasuk`, fullSpec: 'Spesifikasi lengkap', startFrom: 'Mulai dari', deposit: 'DP pemesanan 10%',
  },
};

export function SectionHead({
  eyebrow,
  title,
  lead,
  center = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="mt-2.5 font-display text-3xl font-extrabold leading-[1.15] sm:text-[2.5rem]">{title}</h2>
      {lead ? <p className="mt-4 text-[15px] leading-relaxed text-steel-500">{lead}</p> : null}
    </div>
  );
}

export function PriceTag({ pkg, compact = false, lang = 'en' }: { pkg: Package; compact?: boolean; lang?: Lang }) {
  const c = pick(lang, CARD);
  return (
    <div>
      <p className={`font-display font-extrabold leading-none tracking-tight ${compact ? 'text-2xl' : 'text-[2rem]'}`}>
        {priceRange(pkg.priceMin, pkg.priceMax, pkg.openEnded)}
      </p>
      <p className="mt-1.5 text-xs text-steel-500">
        ≈ {usd(pkg.priceMin)} – {usd(pkg.priceMax)}{pkg.openEnded ? '+' : ''} {c.usdtNote}
      </p>
    </div>
  );
}

export function PackageCard({ pkg, lang = 'en' }: { pkg: Package; lang?: Lang }) {
  const c = pick(lang, CARD);
  return (
    <article className="premium-card relative flex h-full flex-col p-6">
      {pkg.popular ? <span className="badge badge-blue absolute right-5 top-5">{c.mostRequested}</span> : null}

      <div className="flex items-center gap-3">
        <span className="mk-icon-bubble">{pkg.icon}</span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-steel-400">
            {pkg.code} · {tierLabel(pkg.tier, lang)}
          </p>
          <h3 className="font-display text-lg font-bold leading-tight">{pkg.name}</h3>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-steel-500">{pkg.summary}</p>

      <div className="mt-5 border-t border-[color:var(--line)] pt-4">
        <PriceTag pkg={pkg} compact lang={lang} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[color:var(--surface)] p-3 text-xs">
        <div>
          <dt className="font-semibold uppercase tracking-wide text-steel-400">{c.timeline}</dt>
          <dd className="mt-0.5 font-semibold text-ink-900">{pkg.timeline}</dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-wide text-steel-400">{c.scope}</dt>
          <dd className="mt-0.5 font-semibold text-ink-900">{pkg.pages}</dd>
        </div>
      </dl>

      <ul className="mt-4 space-y-2 text-sm text-steel-500">
        {pkg.includes.slice(0, 5).map((f) => (
          <li key={f} className="flex gap-2">
            <span className="tick">✓</span>
            <span className="line-clamp-1">{f}</span>
          </li>
        ))}
        {pkg.includes.length > 5 ? (
          <li className="pl-5 text-xs text-steel-400">{c.moreIncluded(pkg.includes.length - 5)}</li>
        ) : null}
      </ul>

      <div className="mt-auto flex gap-2 pt-6">
        <Link href={`/services/${pkg.slug}`} className="btn btn-ghost btn-sm flex-1">{c.fullSpec}</Link>
        <Link href={`/portal/new?package=${pkg.slug}`} className="btn btn-primary btn-sm flex-1">
          {c.startFrom} {eur(Math.round(pkg.priceMin * 0.1))}
        </Link>
      </div>
      <p className="mt-2 text-center text-[11px] text-steel-400">{c.deposit}</p>
    </article>
  );
}

export function AddOnCard({ addon }: { addon: AddOn }) {
  return (
    <div className="premium-card p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="mk-icon-bubble">{addon.icon}</span>
        <p className="text-right font-display text-base font-bold leading-tight">
          {priceRange(addon.priceMin, addon.priceMax, addon.openEnded)}
        </p>
      </div>
      <h3 className="mt-3.5 font-display text-base font-bold">{addon.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-steel-500">{addon.blurb}</p>
    </div>
  );
}

export function CtaBand({
  title = 'Ready to start?',
  lead = 'Open a project, pay the 10% booking deposit and upload your concept. You will have a delivery date the same week.',
  primary = { href: '/portal/new', label: 'Open a project' },
  secondary = { href: '/contact', label: 'Talk to us first' },
}: {
  title?: string;
  lead?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="mx-auto mt-20 max-w-6xl px-4">
      <div className="panel-dark relative overflow-hidden px-6 py-16 text-center sm:px-10">
        <div className="mk-grid-bg absolute inset-0 opacity-20" />
        <div className="relative">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/85">{lead}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={primary.href} className="btn btn-primary">{primary.label}</Link>
            <Link href={secondary.href} className="btn btn-ghost">{secondary.label}</Link>
          </div>
          <p className="mt-6 text-xs text-white/70">
            USDT (TRC20 · ERC20 · BEP20) and PayPal accepted · invoices in EUR
          </p>
        </div>
      </div>
    </section>
  );
}

export function StatStrip({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="panel px-5 py-6 text-center">
          <p className="font-display text-2xl font-extrabold tracking-tight accent-text">{s.value}</p>
          <p className="mt-1.5 text-xs font-medium text-steel-500">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
