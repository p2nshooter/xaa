import Link from 'next/link';
import { eur, usd, priceRange, TIER_LABEL, type Package, type AddOn } from '@/content/packages';

/** Shared building blocks for the commercial pages. */

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
      {eyebrow ? <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gold-500">{eyebrow}</p> : null}
      <h2 className="mt-2 font-serif text-3xl font-black leading-tight sm:text-4xl">{title}</h2>
      {lead ? <p className="mt-4 text-[15px] leading-relaxed text-ink-800/75">{lead}</p> : null}
    </div>
  );
}

export function PriceTag({ pkg, compact = false }: { pkg: Package; compact?: boolean }) {
  return (
    <div>
      <p className={`font-serif font-black leading-none ${compact ? 'text-2xl' : 'text-3xl'}`}>
        {priceRange(pkg.priceMin, pkg.priceMax, pkg.openEnded)}
      </p>
      <p className="mt-1 text-xs text-steel-500">
        ≈ {usd(pkg.priceMin)} – {usd(pkg.priceMax)}{pkg.openEnded ? '+' : ''} in USDT · one-time build cost
      </p>
    </div>
  );
}

export function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <article className="premium-card relative flex h-full flex-col p-6">
      {pkg.popular ? (
        <span className="badge badge-blue absolute right-4 top-4">Most requested</span>
      ) : null}
      <div className="flex items-center gap-3">
        <span className="mk-icon-bubble text-gold-500">{pkg.icon}</span>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-steel-500">
            {pkg.code} · {TIER_LABEL[pkg.tier]}
          </p>
          <h3 className="font-serif text-xl font-black leading-tight">{pkg.name}</h3>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink-800/75">{pkg.summary}</p>

      <div className="mt-5 border-t border-[color:var(--accent-soft)] pt-4">
        <PriceTag pkg={pkg} compact />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="font-bold uppercase tracking-wide text-steel-500">Timeline</dt>
          <dd className="mt-0.5 font-semibold">{pkg.timeline}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase tracking-wide text-steel-500">Scope</dt>
          <dd className="mt-0.5 font-semibold">{pkg.pages}</dd>
        </div>
      </dl>

      <ul className="mt-4 space-y-1.5 text-sm text-ink-800/80">
        {pkg.includes.slice(0, 5).map((f) => (
          <li key={f} className="flex gap-2">
            <span className="tick">✓</span>
            <span className="line-clamp-1">{f}</span>
          </li>
        ))}
        {pkg.includes.length > 5 ? (
          <li className="pl-5 text-xs text-steel-500">+ {pkg.includes.length - 5} more included</li>
        ) : null}
      </ul>

      <div className="mt-auto flex gap-2 pt-6">
        <Link href={`/services/${pkg.slug}`} className="btn btn-ghost btn-sm flex-1">
          Full spec
        </Link>
        <Link href={`/portal/new?package=${pkg.slug}`} className="btn btn-primary btn-sm flex-1">
          Start from {eur(Math.round(pkg.priceMin * 0.1))}
        </Link>
      </div>
      <p className="mt-2 text-center text-[11px] text-steel-500">10% booking deposit</p>
    </article>
  );
}

export function AddOnCard({ addon }: { addon: AddOn }) {
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="mk-icon-bubble text-gold-500">{addon.icon}</span>
        <p className="text-right font-serif text-lg font-black leading-tight">
          {priceRange(addon.priceMin, addon.priceMax, addon.openEnded)}
        </p>
      </div>
      <h3 className="mt-3 font-serif text-lg font-black">{addon.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-800/70">{addon.blurb}</p>
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
    <section className="relative mt-20 overflow-hidden metal-wash">
      <div className="mk-grid-bg absolute inset-0" />
      <div className="relative mx-auto max-w-4xl px-4 py-16 text-center text-ivory-50">
        <h2 className="font-serif text-3xl font-black sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-ivory-100/80">{lead}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={primary.href} className="btn btn-primary">{primary.label}</Link>
          <Link href={secondary.href} className="btn btn-ghost">{secondary.label}</Link>
        </div>
        <p className="mt-6 text-xs text-ivory-100/60">USDT (TRC20 · ERC20 · BEP20) and PayPal accepted · invoices in EUR</p>
      </div>
    </section>
  );
}

export function StatStrip({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-[color:var(--accent-soft)] bg-[color:var(--accent-soft)] sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="bg-white px-5 py-6 text-center">
          <p className="font-serif text-2xl font-black accent-text">{s.value}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-steel-500">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
