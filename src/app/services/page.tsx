import Link from 'next/link';
import type { Metadata } from 'next';
import { eur, priceRange, type Tier } from '@/content/packages';
import { localisedPackages, localisedAddons, localisedSuperEnterprise, tierLabel } from '@/content/packages.i18n';
import { PackageCard, AddOnCard, SectionHead, CtaBand } from '@/components/Studio';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Services & pricing',
  description:
    'Ten website and platform development packages, from a €500 landing page to a €1.5M global enterprise ecosystem. European pricing, published up front, paid in milestones via USDT or PayPal.',
  alternates: { canonical: '/services' },
};

const TIER_ORDER: Tier[] = ['starter', 'business', 'advanced', 'enterprise'];

type Copy = {
  chip: string; h1a: string; h1b: string; heroLead: string; openBtn: string; howBtn: string;
  superOnly: (n: number) => string; superFull: string; superEnquire: string; perProgramme: string;
  glanceEyebrow: string; glanceTitle: string; glanceLead: string;
  thNum: string; thPackage: string; thBestFor: string; thTimeline: string; thPrice: string; thDeposit: string;
  from: string; start: string;
  tierBlurb: Record<Tier, string>; packagesWord: (n: number) => string;
  electionEyebrow: string; electionTitle: string; electionBody: (a: string, b: string) => string; electionBtn: string;
  addonsEyebrow: string; addonsTitle: string; addonsLead: string;
  movesTitle: string; movesLead: string; moves: string[];
  ctaTitle: string; ctaLead: string; ctaPrimary: string; ctaSecondary: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    chip: 'Services & pricing', h1a: 'Every package, every price,', h1b: 'published before you ask',
    heroLead: 'These are real European development rates, in euros, before VAT where it applies. Each range covers the honest span between a lean build and a heavily customised one; your figure is fixed in writing after a scope review, and the milestone schedule is calculated from it automatically.',
    openBtn: 'Open a project', howBtn: 'How payment works',
    superOnly: (n) => `Only ${n} at a time`, superFull: 'Full specification', superEnquire: 'Enquire about a slot', perProgramme: 'per programme',
    glanceEyebrow: 'At a glance', glanceTitle: 'All ten packages', glanceLead: 'Prices are one-time build costs. Setup and the AI backup & recovery install are separate — see Setup & Care.',
    thNum: '#', thPackage: 'Package', thBestFor: 'Best for', thTimeline: 'Timeline', thPrice: 'Build price (EUR)', thDeposit: '10% deposit',
    from: 'from', start: 'Start',
    tierBlurb: {
      starter: 'One person or one offer. Fast to build, cheap to run, built properly.',
      business: 'The site a company is judged by — content system, credibility, search visibility.',
      advanced: 'Working software: accounts, bookings, catalogues, dashboards, payments.',
      enterprise: 'Multi-audience platforms, marketplaces and systems with AI backup and recovery built in.',
    },
    packagesWord: (n) => `${n} package${n > 1 ? 's' : ''}`,
    electionEyebrow: 'Specialist vertical', electionTitle: 'Election & civic systems',
    electionBody: (a, b) => `Voter-roll verification, offline field registers and live tallying, priced by administrative scale — from a single village at ${a} to a national programme at ${b}+.`,
    electionBtn: 'See the tiers',
    addonsEyebrow: 'Add-on services', addonsTitle: 'Quoted separately, added whenever you need them',
    addonsLead: 'Select add-ons when you open the project and they are folded into the quote and the milestone schedule. Add them later and they are invoiced on their own.',
    movesTitle: 'What moves a price inside its range',
    movesLead: 'Nothing here is a surprise charge. These are the factors we weigh during the scope review, and the ones we will walk you through line by line before anything is signed.',
    moves: ['Number of unique page or screen designs', 'Depth of the content or product catalogue', 'Custom UI/UX versus adapting our system', 'Number of user roles and permission rules', 'Integrations with existing systems', 'Payment, tax and invoicing complexity', 'Languages, currencies and regions', 'Expected traffic and concurrency', 'Security, audit and compliance obligations', 'Data migration from an existing platform', 'Cloud infrastructure and environments', 'Backup, recovery and support scope'],
    ctaTitle: 'Not sure which package fits?',
    ctaLead: 'Send us what you are trying to build. We will tell you which package it lands in, what it will realistically cost, and what we would leave out of a first version.',
    ctaPrimary: 'Send a brief', ctaSecondary: 'Open a project',
  },
  es: {
    chip: 'Servicios y precios', h1a: 'Cada paquete, cada precio,', h1b: 'publicado antes de que preguntes',
    heroLead: 'Son tarifas de desarrollo europeas reales, en euros, antes de IVA cuando aplica. Cada rango cubre el intervalo honesto entre un desarrollo austero y uno muy personalizado; tu cifra se fija por escrito tras una revisión del alcance, y el calendario de hitos se calcula de ahí automáticamente.',
    openBtn: 'Abrir un proyecto', howBtn: 'Cómo funciona el pago',
    superOnly: (n) => `Solo ${n} a la vez`, superFull: 'Especificación completa', superEnquire: 'Consultar por un cupo', perProgramme: 'por programa',
    glanceEyebrow: 'De un vistazo', glanceTitle: 'Los diez paquetes', glanceLead: 'Los precios son costes de desarrollo únicos. La puesta en marcha y la instalación de backup y recuperación con IA van aparte — ver Puesta en marcha.',
    thNum: '#', thPackage: 'Paquete', thBestFor: 'Ideal para', thTimeline: 'Plazo', thPrice: 'Precio (EUR)', thDeposit: '10% depósito',
    from: 'desde', start: 'Empezar',
    tierBlurb: {
      starter: 'Una persona o una oferta. Rápido de construir, barato de mantener, hecho como es debido.',
      business: 'El sitio por el que se juzga a una empresa — sistema de contenido, credibilidad, visibilidad en búsqueda.',
      advanced: 'Software que funciona: cuentas, reservas, catálogos, paneles, pagos.',
      enterprise: 'Plataformas multi-audiencia, marketplaces y sistemas con backup y recuperación por IA integrados.',
    },
    packagesWord: (n) => `${n} paquete${n > 1 ? 's' : ''}`,
    electionEyebrow: 'Vertical especializado', electionTitle: 'Sistemas electorales y cívicos',
    electionBody: (a, b) => `Verificación del censo, registros de campo offline y escrutinio en vivo, con precio por escala administrativa — desde una sola aldea a ${a} hasta un programa nacional a ${b}+.`,
    electionBtn: 'Ver los niveles',
    addonsEyebrow: 'Servicios adicionales', addonsTitle: 'Cotizados aparte, añadidos cuando los necesites',
    addonsLead: 'Elige los adicionales al abrir el proyecto y se integran en el presupuesto y el calendario de hitos. Añádelos después y se facturan por su cuenta.',
    movesTitle: 'Qué mueve un precio dentro de su rango',
    movesLead: 'Nada aquí es un cargo sorpresa. Son los factores que sopesamos durante la revisión del alcance, y los que te explicaremos línea por línea antes de firmar nada.',
    moves: ['Número de diseños únicos de página o pantalla', 'Profundidad del catálogo de contenido o producto', 'UI/UX a medida frente a adaptar nuestro sistema', 'Número de roles de usuario y reglas de permiso', 'Integraciones con sistemas existentes', 'Complejidad de pago, impuestos y facturación', 'Idiomas, divisas y regiones', 'Tráfico y concurrencia esperados', 'Obligaciones de seguridad, auditoría y cumplimiento', 'Migración de datos desde una plataforma existente', 'Infraestructura cloud y entornos', 'Backup, recuperación y alcance del soporte'],
    ctaTitle: '¿No sabes qué paquete encaja?',
    ctaLead: 'Cuéntanos qué intentas construir. Te diremos en qué paquete encaja, cuánto costará de forma realista, y qué dejaríamos fuera de una primera versión.',
    ctaPrimary: 'Enviar un brief', ctaSecondary: 'Abrir un proyecto',
  },
  id: {
    chip: 'Layanan & harga', h1a: 'Tiap paket, tiap harga,', h1b: 'dipublikasikan sebelum Anda bertanya',
    heroLead: 'Ini tarif pengembangan Eropa nyata, dalam euro, belum termasuk PPN bila berlaku. Tiap rentang mencakup jarak jujur antara build ramping dan yang sangat dikustomisasi; angka Anda dikunci tertulis setelah tinjauan ruang lingkup, dan jadwal termin dihitung darinya otomatis.',
    openBtn: 'Buka proyek', howBtn: 'Cara pembayaran bekerja',
    superOnly: (n) => `Hanya ${n} sekaligus`, superFull: 'Spesifikasi lengkap', superEnquire: 'Tanyakan slot', perProgramme: 'per program',
    glanceEyebrow: 'Sekilas', glanceTitle: 'Sepuluh paket', glanceLead: 'Harga adalah biaya pembuatan sekali bayar. Setup dan pemasangan backup & recovery AI terpisah — lihat Setup & Perawatan.',
    thNum: '#', thPackage: 'Paket', thBestFor: 'Cocok untuk', thTimeline: 'Lini masa', thPrice: 'Harga (EUR)', thDeposit: 'DP 10%',
    from: 'mulai', start: 'Mulai',
    tierBlurb: {
      starter: 'Satu orang atau satu tawaran. Cepat dibangun, murah dijalankan, dibuat dengan benar.',
      business: 'Situs yang jadi penilaian perusahaan — sistem konten, kredibilitas, visibilitas pencarian.',
      advanced: 'Perangkat lunak yang bekerja: akun, pemesanan, katalog, dasbor, pembayaran.',
      enterprise: 'Platform multi-audiens, marketplace, dan sistem dengan backup dan pemulihan AI bawaan.',
    },
    packagesWord: (n) => `${n} paket`,
    electionEyebrow: 'Vertikal khusus', electionTitle: 'Sistem pemilu & sipil',
    electionBody: (a, b) => `Verifikasi daftar pemilih, register lapangan offline, dan penghitungan langsung, dihargai per skala administratif — dari satu desa di ${a} hingga program nasional di ${b}+.`,
    electionBtn: 'Lihat tingkatannya',
    addonsEyebrow: 'Layanan tambahan', addonsTitle: 'Ditawar terpisah, ditambah kapan pun Anda butuh',
    addonsLead: 'Pilih tambahan saat membuka proyek dan langsung dilipat ke penawaran dan jadwal termin. Tambahkan nanti dan ditagih sendiri.',
    movesTitle: 'Apa yang menggerakkan harga dalam rentangnya',
    movesLead: 'Tak ada biaya kejutan di sini. Inilah faktor yang kami timbang selama tinjauan ruang lingkup, dan yang akan kami jelaskan baris demi baris sebelum apa pun ditandatangani.',
    moves: ['Jumlah desain halaman atau layar unik', 'Kedalaman katalog konten atau produk', 'UI/UX khusus versus mengadaptasi sistem kami', 'Jumlah peran pengguna dan aturan izin', 'Integrasi dengan sistem yang ada', 'Kompleksitas pembayaran, pajak, dan faktur', 'Bahasa, mata uang, dan wilayah', 'Trafik dan konkurensi yang diharapkan', 'Kewajiban keamanan, audit, dan kepatuhan', 'Migrasi data dari platform yang ada', 'Infrastruktur cloud dan lingkungan', 'Backup, pemulihan, dan cakupan dukungan'],
    ctaTitle: 'Belum yakin paket mana yang cocok?',
    ctaLead: 'Beri tahu kami yang ingin Anda bangun. Kami akan bilang paket mana yang cocok, berapa biaya realistisnya, dan apa yang akan kami tinggalkan dari versi pertama.',
    ctaPrimary: 'Kirim brief', ctaSecondary: 'Buka proyek',
  },
};

export default async function ServicesPage() {
  const lang = await getLang();
  const c = pick(lang, COPY);
  const pkgs = localisedPackages(lang);
  const addons = localisedAddons(lang);
  const se = localisedSuperEnterprise(lang);

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
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/portal/new" className="btn btn-primary">{c.openBtn}</Link>
            <Link href="/process" className="btn btn-ghost">{c.howBtn}</Link>
          </div>
        </div>
      </section>

      {/* Super Enterprise — above the catalogue, capacity-limited. */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="panel-dark relative overflow-hidden p-8 sm:p-10">
          <div className="mk-grid-bg absolute inset-0 opacity-20" />
          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <span className="mk-chip">{se.code} · {c.superOnly(se.slots)}</span>
              <h2 className="mt-4 font-display text-3xl font-extrabold">{se.name}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/85">{se.summary}</p>
              <ul className="mt-5 grid gap-1.5 sm:grid-cols-2">
                {se.includes.slice(0, 6).map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-white/85">
                    <span className="text-white/60">▸</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/portfolio#super-enterprise" className="btn btn-primary">{c.superFull}</Link>
                <Link href="/contact?tier=super-enterprise" className="btn btn-ghost">{c.superEnquire}</Link>
              </div>
            </div>
            <div className="shrink-0 rounded-xl bg-white/10 p-5 text-center">
              <p className="font-display text-2xl font-extrabold">{se.priceLabel}</p>
              <p className="mt-1 text-xs text-white/70">{c.perProgramme}</p>
              <p className="mt-3 border-t border-white/20 pt-3 text-xs text-white/70">{se.timeline}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionHead eyebrow={c.glanceEyebrow} title={c.glanceTitle} lead={c.glanceLead} />
        <div className="mt-8 panel overflow-x-auto p-2">
          <table className="data-table min-w-[720px]">
            <thead>
              <tr>
                <th>{c.thNum}</th>
                <th>{c.thPackage}</th>
                <th>{c.thBestFor}</th>
                <th>{c.thTimeline}</th>
                <th className="text-right">{c.thPrice}</th>
                <th className="text-right">{c.thDeposit}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pkgs.map((p) => (
                <tr key={p.slug}>
                  <td className="font-mono text-xs text-steel-500">{p.code}</td>
                  <td>
                    <Link href={`/services/${p.slug}`} className="font-bold text-ink-900 hover:text-gold-500">{p.name}</Link>
                    <span className="ml-2 badge badge-grey">{tierLabel(p.tier, lang)}</span>
                  </td>
                  <td className="max-w-[220px] text-xs text-steel-500">{p.bestFor.slice(0, 2).join(' · ')}</td>
                  <td className="whitespace-nowrap text-xs">{p.timeline}</td>
                  <td className="whitespace-nowrap text-right font-serif font-extrabold">{priceRange(p.priceMin, p.priceMax, p.openEnded)}</td>
                  <td className="whitespace-nowrap text-right text-xs font-semibold text-gold-500">{c.from} {eur(Math.round(p.priceMin * 0.1))}</td>
                  <td className="text-right">
                    <Link href={`/portal/new?package=${p.slug}`} className="btn btn-primary btn-sm">{c.start}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Cards, grouped by tier */}
      {TIER_ORDER.map((tier) => {
        const group = pkgs.filter((p) => p.tier === tier);
        if (!group.length) return null;
        return (
          <section key={tier} className="mx-auto max-w-6xl px-4 py-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-500">{tierLabel(tier, lang)}</p>
                <h2 className="mt-1 font-display text-2xl font-extrabold">{c.tierBlurb[tier]}</h2>
              </div>
              <p className="text-sm text-steel-500">{c.packagesWord(group.length)}</p>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {group.map((p) => (
                <PackageCard key={p.slug} pkg={p} lang={lang} />
              ))}
            </div>
          </section>
        );
      })}

      {/* A vertical with its own scaling law, so it gets its own page. */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="panel flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="max-w-2xl">
            <p className="eyebrow">{c.electionEyebrow}</p>
            <h2 className="mt-1.5 font-display text-xl font-extrabold">{c.electionTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-steel-500">{c.electionBody(eur(6000), eur(600000))}</p>
          </div>
          <Link href="/election-systems" className="btn btn-dark btn-sm shrink-0">{c.electionBtn}</Link>
        </div>
      </section>

      {/* Add-ons */}
      <section id="addons" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <SectionHead eyebrow={c.addonsEyebrow} title={c.addonsTitle} lead={c.addonsLead} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {addons.map((a) => (
            <AddOnCard key={a.slug} addon={a} />
          ))}
        </div>
      </section>

      {/* What decides the final figure */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="panel-dark p-8 sm:p-10">
          <h2 className="font-display text-2xl font-extrabold">{c.movesTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory-100/75">{c.movesLead}</p>
          <div className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {c.moves.map((f) => (
              <p key={f} className="flex gap-2 text-sm text-ivory-100/85">
                <span className="text-gold-300">▸</span> {f}
              </p>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title={c.ctaTitle}
        lead={c.ctaLead}
        primary={{ href: '/contact', label: c.ctaPrimary }}
        secondary={{ href: '/portal/new', label: c.ctaSecondary }}
      />
    </>
  );
}
