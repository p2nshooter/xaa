import Link from 'next/link';
import type { Metadata } from 'next';
import { TEMPLATES, TIER_ORDER, TIER_LABEL, type TemplateTier } from '@/content/templates';
import { eur } from '@/content/packages';
import { SectionHead, CtaBand } from '@/components/Studio';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Ready-made SaaS templates',
  description:
    'Production-ready SaaS you buy once and rebrand: full source code, database and setup guide, delivered as one downloadable bundle. From €390 starters to super-enterprise platforms whose source alone is worth hundreds of thousands to millions.',
  alternates: { canonical: '/templates' },
};

function price(t: { price: number; priceMax?: number }): string {
  return t.priceMax ? `${eur(t.price)} – ${eur(t.priceMax)}` : eur(t.price);
}

type Copy = {
  chip: string; h1a: string; h1b: string; heroLead: string;
  howBuy: string; whatGet: string;
  incBundle: string; incRebrand: string; incDemo: string; incZip: string;
  from: string; view: string; popular: string;
  tierBlurb: Record<TemplateTier, string>;
  ctaTitle: string; ctaLead: string; ctaPrimary: string; ctaSecondary: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    chip: 'Ready-made SaaS', h1a: 'Buy a finished SaaS,', h1b: 'rebrand it, ship it',
    heroLead: 'Complete, production-ready applications. You buy once, change the logo and name, and launch. You get the full source code, the database and a setup guide — delivered as a single downloadable bundle after payment. Prices run from cheap starters to super-enterprise platforms whose source alone is worth hundreds of thousands to millions.',
    howBuy: 'How buying works', whatGet: 'What you get',
    incBundle: 'Full 100% source code + database', incRebrand: 'Step-by-step rebrand guide (logo, name, colours)', incDemo: 'A live demo where one exists', incZip: 'One ZIP bundle to download after payment',
    from: 'from', view: 'View', popular: 'Popular',
    tierBlurb: {
      starter: 'Cheap, single-purpose apps you can ship this week.',
      business: 'Complete products for a real business, ready to rebrand.',
      enterprise: 'Platforms — tenancy, billing, roles — scoped and sized.',
      super: 'Source alone worth hundreds of thousands to millions.',
    },
    ctaTitle: 'Not sure which one fits?',
    ctaLead: 'Tell us your business and budget. We will point you to the template that fits, or scope a custom build.',
    ctaPrimary: 'Ask us', ctaSecondary: 'See custom packages',
  },
  es: {
    chip: 'SaaS listo para usar', h1a: 'Compra un SaaS terminado,', h1b: 'renómbralo, publícalo',
    heroLead: 'Aplicaciones completas y listas para producción. Compras una vez, cambias el logo y el nombre, y lanzas. Recibes el código fuente completo, la base de datos y una guía de instalación — entregados como un único paquete descargable tras el pago. Los precios van desde starters económicos hasta plataformas super-enterprise cuyo código por sí solo vale de cientos de miles a millones.',
    howBuy: 'Cómo comprar', whatGet: 'Qué recibes',
    incBundle: 'Código fuente 100% + base de datos', incRebrand: 'Guía de rebranding paso a paso (logo, nombre, colores)', incDemo: 'Una demo en vivo cuando existe', incZip: 'Un paquete ZIP para descargar tras el pago',
    from: 'desde', view: 'Ver', popular: 'Popular',
    tierBlurb: {
      starter: 'Apps económicas de un solo propósito que lanzas esta semana.',
      business: 'Productos completos para un negocio real, listos para renombrar.',
      enterprise: 'Plataformas — tenencia, facturación, roles — dimensionadas.',
      super: 'El código por sí solo vale de cientos de miles a millones.',
    },
    ctaTitle: '¿No sabes cuál encaja?',
    ctaLead: 'Dinos tu negocio y presupuesto. Te indicamos la plantilla que encaja, o dimensionamos un desarrollo a medida.',
    ctaPrimary: 'Pregúntanos', ctaSecondary: 'Ver paquetes a medida',
  },
  id: {
    chip: 'SaaS siap pakai', h1a: 'Beli SaaS yang sudah jadi,', h1b: 'ganti merek, luncurkan',
    heroLead: 'Aplikasi lengkap dan siap produksi. Anda beli sekali, ganti logo dan nama, lalu luncurkan. Anda mendapat kode sumber penuh, database, dan panduan setup — dikirim sebagai satu bundel yang bisa diunduh setelah pembayaran. Harga mulai dari starter murah hingga platform super-enterprise yang kode-nya saja bernilai ratusan ribu hingga jutaan.',
    howBuy: 'Cara membeli', whatGet: 'Yang Anda dapat',
    incBundle: 'Kode sumber 100% + database', incRebrand: 'Panduan ganti merek langkah demi langkah (logo, nama, warna)', incDemo: 'Demo langsung bila tersedia', incZip: 'Satu bundel ZIP untuk diunduh setelah bayar',
    from: 'mulai', view: 'Lihat', popular: 'Populer',
    tierBlurb: {
      starter: 'Aplikasi murah satu tujuan yang bisa Anda luncurkan minggu ini.',
      business: 'Produk lengkap untuk bisnis nyata, siap diganti merek.',
      enterprise: 'Platform — tenancy, penagihan, peran — dilingkup dan diukur.',
      super: 'Kode-nya saja bernilai ratusan ribu hingga jutaan.',
    },
    ctaTitle: 'Belum yakin mana yang cocok?',
    ctaLead: 'Beri tahu bisnis dan anggaran Anda. Kami tunjukkan template yang cocok, atau melingkup build khusus.',
    ctaPrimary: 'Tanya kami', ctaSecondary: 'Lihat paket khusus',
  },
};

export default async function TemplatesPage() {
  const lang = await getLang();
  const c = pick(lang, COPY);
  return (
    <>
      <section className="hero relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <span className="chip">{c.chip}</span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            {c.h1a} <span className="accent-text">{c.h1b}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-600">{c.heroLead}</p>
          <ul className="mt-8 grid max-w-3xl gap-2 sm:grid-cols-2">
            {[c.incBundle, c.incRebrand, c.incDemo, c.incZip].map((x) => (
              <li key={x} className="flex gap-2 text-sm text-steel-600"><span className="tick">✓</span>{x}</li>
            ))}
          </ul>
        </div>
      </section>

      {TIER_ORDER.map((tier) => {
        const group = TEMPLATES.filter((t) => t.tier === tier);
        if (!group.length) return null;
        return (
          <section key={tier} className="mx-auto max-w-6xl px-4 py-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-500">{TIER_LABEL[tier]}</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold">{c.tierBlurb[tier]}</h2>
              </div>
              <p className="text-sm text-steel-500">{c.from} {eur(Math.min(...group.map((g) => g.price)))}</p>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {group.map((t) => (
                <article key={t.slug} className={`premium-card flex h-full flex-col p-6 ${t.popular ? 'ring-2 ring-[color:var(--accent)]' : ''}`}>
                  {t.popular ? <span className="badge badge-blue absolute right-5 top-5">{c.popular}</span> : null}
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-steel-400">{t.category}</p>
                  <h3 className="mt-1 font-display text-lg font-bold leading-tight">{t.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel-500">{t.tagline}</p>
                  <div className="mt-4 border-t border-[color:var(--line)] pt-3">
                    <p className="font-display text-2xl font-extrabold tracking-tight">{price(t)}</p>
                    <p className="mt-0.5 text-xs text-steel-500">{t.stack.slice(0, 3).join(' · ')}</p>
                  </div>
                  <div className="mt-auto flex gap-2 pt-5">
                    <Link href={`/templates/${t.slug}`} className="btn btn-primary btn-sm flex-1">{c.view}</Link>
                    {t.demoUrl ? (
                      <a href={t.demoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Demo ↗</a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <CtaBand
        title={c.ctaTitle}
        lead={c.ctaLead}
        primary={{ href: '/contact', label: c.ctaPrimary }}
        secondary={{ href: '/services', label: c.ctaSecondary }}
      />
    </>
  );
}
