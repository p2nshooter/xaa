import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PACKAGES, getPackage, getSetupPlan, getCarePlan, relatedAddons, eur, usd, priceRange } from '@/content/packages';
import { localisedPackage, localisedSetupPlans, localisedCarePlans, localisedAddon, tierLabel } from '@/content/packages.i18n';
import { SectionHead, CtaBand, PriceTag } from '@/components/Studio';
import { localisedStages } from '@/content/process';
import { SITE } from '@/lib/site';
import { jsonLdHtml } from '@/lib/json-ld';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';

interface Props { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return PACKAGES.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackage(slug);
  if (!pkg) return {};
  return {
    title: `${pkg.name} — ${priceRange(pkg.priceMin, pkg.priceMax, pkg.openEnded)}`,
    description: `${pkg.summary} Delivery in ${pkg.timeline}. Start with a 10% deposit, pay by USDT or PayPal.`,
    alternates: { canonical: `/services/${pkg.slug}` },
  };
}

type Copy = {
  services: string; buildPrice: string; timeline: string; scope: string;
  depositRow: string; productionRow: string; settlementRow: string; rangeNote: string;
  startToday: (v: string) => string; askFirst: string; usdtNote: (v: string) => string;
  includedEyebrow: string; includedTitle: string; optionalTitle: string;
  optionalNote0: string; optionalLink: string; optionalNote1: string;
  whoTitle: string; howTitle: string;
  recSetup: string; recCare: string; perMonth: string; setupCovers: string; compareCare: string;
  responseWord: string; addonsTitle: string;
  smaller: string; bigger: string;
  ctaTitle: (name: string) => string; ctaLead: (v: string) => string; ctaBtn: (v: string) => string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    services: 'Services', buildPrice: 'Build price', timeline: 'Timeline', scope: 'Scope',
    depositRow: 'Booking deposit (10%)', productionRow: 'Production (40%)', settlementRow: 'Settlement (50%)',
    rangeNote: 'Shown at the bottom of the range. Your real figure is fixed after the scope review and the milestones recalculate from it.',
    startToday: (v) => `Start — pay ${v} today`, askFirst: 'Ask a question first', usdtNote: (v) => `USDT ≈ ${v} · or PayPal in EUR`,
    includedEyebrow: 'Included in the build price', includedTitle: 'What you get', optionalTitle: 'Optional on this package',
    optionalNote0: 'Optional items are quoted during the scope review, or picked from the ', optionalLink: 'add-on catalogue', optionalNote1: ' when you open the project.',
    whoTitle: 'Who this is for', howTitle: 'How this project will run',
    recSetup: 'Recommended one-time setup', recCare: 'Recommended monthly care', perMonth: '/month', setupCovers: 'See what it covers', compareCare: 'Compare care plans',
    responseWord: 'response', addonsTitle: 'Add-ons for this build',
    smaller: '← Smaller', bigger: 'Bigger →',
    ctaTitle: (name) => `Start your ${name.toLowerCase()}`, ctaLead: (v) => `Open the project, pay the ${v} booking deposit and upload your concept. Your completion estimate appears the moment the concept lands.`, ctaBtn: (v) => `Start — ${v} deposit`,
  },
  es: {
    services: 'Servicios', buildPrice: 'Precio', timeline: 'Plazo', scope: 'Alcance',
    depositRow: 'Depósito de reserva (10%)', productionRow: 'Producción (40%)', settlementRow: 'Liquidación (50%)',
    rangeNote: 'Mostrado en el extremo bajo del rango. Tu cifra real se fija tras la revisión del alcance y los hitos se recalculan de ella.',
    startToday: (v) => `Empezar — paga ${v} hoy`, askFirst: 'Haz una pregunta primero', usdtNote: (v) => `USDT ≈ ${v} · o PayPal en EUR`,
    includedEyebrow: 'Incluido en el precio', includedTitle: 'Qué recibes', optionalTitle: 'Opcional en este paquete',
    optionalNote0: 'Los opcionales se cotizan durante la revisión del alcance, o se eligen del ', optionalLink: 'catálogo de adicionales', optionalNote1: ' al abrir el proyecto.',
    whoTitle: 'Para quién es', howTitle: 'Cómo se desarrollará este proyecto',
    recSetup: 'Puesta en marcha recomendada', recCare: 'Mantenimiento mensual recomendado', perMonth: '/mes', setupCovers: 'Ver qué cubre', compareCare: 'Comparar planes',
    responseWord: 'respuesta', addonsTitle: 'Adicionales para este desarrollo',
    smaller: '← Más pequeño', bigger: 'Más grande →',
    ctaTitle: (name) => `Empieza tu ${name.toLowerCase()}`, ctaLead: (v) => `Abre el proyecto, paga el depósito de reserva de ${v} y sube tu concepto. Tu fecha estimada aparece en cuanto llega el concepto.`, ctaBtn: (v) => `Empezar — depósito de ${v}`,
  },
  id: {
    services: 'Layanan', buildPrice: 'Harga', timeline: 'Lini masa', scope: 'Cakupan',
    depositRow: 'DP pemesanan (10%)', productionRow: 'Produksi (40%)', settlementRow: 'Pelunasan (50%)',
    rangeNote: 'Ditampilkan di ujung bawah rentang. Angka nyata Anda dikunci setelah tinjauan ruang lingkup dan termin dihitung ulang darinya.',
    startToday: (v) => `Mulai — bayar ${v} hari ini`, askFirst: 'Tanya dulu', usdtNote: (v) => `USDT ≈ ${v} · atau PayPal dalam EUR`,
    includedEyebrow: 'Termasuk dalam harga', includedTitle: 'Yang Anda dapat', optionalTitle: 'Opsional pada paket ini',
    optionalNote0: 'Item opsional ditawar selama tinjauan ruang lingkup, atau dipilih dari ', optionalLink: 'katalog tambahan', optionalNote1: ' saat Anda membuka proyek.',
    whoTitle: 'Untuk siapa ini', howTitle: 'Bagaimana proyek ini berjalan',
    recSetup: 'Setup sekali bayar yang disarankan', recCare: 'Perawatan bulanan yang disarankan', perMonth: '/bulan', setupCovers: 'Lihat cakupannya', compareCare: 'Bandingkan paket perawatan',
    responseWord: 'respons', addonsTitle: 'Tambahan untuk build ini',
    smaller: '← Lebih kecil', bigger: 'Lebih besar →',
    ctaTitle: (name) => `Mulai ${name.toLowerCase()} Anda`, ctaLead: (v) => `Buka proyek, bayar DP pemesanan ${v}, dan unggah konsep Anda. Perkiraan selesai Anda muncul begitu konsep masuk.`, ctaBtn: (v) => `Mulai — DP ${v}`,
  },
};

export default async function PackagePage({ params }: Props) {
  const { slug } = await params;
  const base = getPackage(slug);
  if (!base) notFound();

  const lang = await getLang();
  const c = pick(lang, COPY);
  const pkg = localisedPackage(base, lang);
  const setup = localisedSetupPlans(lang).find((s) => s.slug === base.recommendedSetup) ?? getSetupPlan(base.recommendedSetup);
  const care = localisedCarePlans(lang).find((p) => p.slug === base.recommendedCare) ?? getCarePlan(base.recommendedCare);
  const stages = localisedStages(lang);
  const deposit = Math.round(pkg.priceMin * 0.1);
  const production = Math.round(pkg.priceMin * 0.4);
  const settlement = pkg.priceMin - deposit - production;
  const index = PACKAGES.findIndex((p) => p.slug === base.slug);
  const lighter = PACKAGES[index - 1] ? localisedPackage(PACKAGES[index - 1]!, lang) : undefined;
  const heavier = PACKAGES[index + 1] ? localisedPackage(PACKAGES[index + 1]!, lang) : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: base.name,
            serviceType: 'Web development',
            provider: { '@id': `${SITE.url}#org` },
            description: base.summary,
            areaServed: ['EU', 'Worldwide'],
            offers: {
              '@type': 'Offer',
              priceCurrency: 'EUR',
              priceSpecification: { '@type': 'PriceSpecification', minPrice: pkg.priceMin, maxPrice: pkg.priceMax, priceCurrency: 'EUR' },
              url: `${SITE.url}/services/${pkg.slug}`,
            },
          }),
        }}
      />

      <section className="hero relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <nav className="text-xs text-slate-500">
            <Link href="/services" className="hover:text-gold-500">{c.services}</Link>
            <span className="mx-2">/</span>
            <span>{pkg.name}</span>
          </nav>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <span className="chip">
                {pkg.code} · {tierLabel(pkg.tier, lang)}
              </span>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl">{pkg.name}</h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-600">{pkg.summary}</p>
              <dl className="mt-8 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-200 pt-6 text-sm">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{c.buildPrice}</dt>
                  <dd className="mt-1 font-display text-lg font-extrabold">{priceRange(pkg.priceMin, pkg.priceMax, pkg.openEnded)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{c.timeline}</dt>
                  <dd className="mt-1 font-display text-lg font-extrabold">{pkg.timeline}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{c.scope}</dt>
                  <dd className="mt-1 font-display text-lg font-extrabold">{pkg.pages}</dd>
                </div>
              </dl>
            </div>

            <aside className="panel h-fit p-6 text-ink-900">
              <PriceTag pkg={pkg} lang={lang} />
              <div className="mt-5 space-y-2 border-t border-[color:var(--accent-soft)] pt-4 text-sm">
                <div className="flex justify-between"><span className="text-steel-500">{c.depositRow}</span><strong>{eur(deposit)}</strong></div>
                <div className="flex justify-between"><span className="text-steel-500">{c.productionRow}</span><strong>{eur(production)}</strong></div>
                <div className="flex justify-between"><span className="text-steel-500">{c.settlementRow}</span><strong>{eur(settlement)}</strong></div>
                <p className="hint">{c.rangeNote}</p>
              </div>
              <Link href={`/portal/new?package=${pkg.slug}`} className="btn btn-primary mt-5 w-full">
                {c.startToday(eur(deposit))}
              </Link>
              <Link href="/contact" className="btn btn-ghost mt-2 w-full">{c.askFirst}</Link>
              <p className="mt-3 text-center text-[11px] text-steel-500">{c.usdtNote(usd(deposit))}</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_.7fr]">
          <div>
            <SectionHead eyebrow={c.includedEyebrow} title={c.includedTitle} />
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {pkg.includes.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm leading-relaxed">
                  <span className="tick mt-0.5">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {pkg.optional?.length ? (
              <>
                <h3 className="mt-10 font-display text-xl font-extrabold">{c.optionalTitle}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {pkg.optional.map((o) => (
                    <span key={o} className="mk-chip">{o}</span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-steel-500">
                  {c.optionalNote0}<Link href="/services#addons" className="text-gold-500 underline">{c.optionalLink}</Link>{c.optionalNote1}
                </p>
              </>
            ) : null}

            <h3 className="mt-10 font-display text-xl font-extrabold">{c.whoTitle}</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {pkg.bestFor.map((b) => (
                <li key={b} className="panel px-4 py-3 text-sm font-medium">{b}</li>
              ))}
            </ul>

            <h3 className="mt-10 font-display text-xl font-extrabold">{c.howTitle}</h3>
            <ol className="mt-4 space-y-3">
              {stages.map((s, i) => (
                <li key={s.key} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs font-extrabold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{s.name}</p>
                    <p className="text-sm text-steel-500">{s.blurb}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="space-y-6">
            {setup ? (
              <div className="panel p-5">
                <p className="badge badge-blue">{c.recSetup}</p>
                <h3 className="mt-3 font-display text-lg font-extrabold">{setup.name}</h3>
                <p className="mt-1 font-display text-xl font-extrabold accent-text">
                  {setup.custom ? `from ${eur(setup.price)}` : priceRange(setup.price, setup.priceMax ?? setup.price)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-steel-500">{setup.blurb}</p>
                <Link href="/care#setup" className="btn btn-ghost btn-sm mt-4 w-full">{c.setupCovers}</Link>
              </div>
            ) : null}

            {care ? (
              <div className="panel p-5">
                <p className="badge badge-green">{c.recCare}</p>
                <h3 className="mt-3 font-display text-lg font-extrabold">{care.name}</h3>
                <p className="mt-1 font-display text-xl font-extrabold accent-text">
                  {care.custom ? `from ${eur(care.price)}` : eur(care.price)}
                  <span className="text-sm font-normal text-steel-500">{c.perMonth}</span>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-steel-500">{care.blurb}</p>
                <p className="mt-2 text-xs text-steel-500">{care.hours} · {c.responseWord} {care.response}</p>
                <Link href="/care#maintenance" className="btn btn-ghost btn-sm mt-4 w-full">{c.compareCare}</Link>
              </div>
            ) : null}

            <div className="panel p-5">
              <h3 className="font-display text-lg font-extrabold">{c.addonsTitle}</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {relatedAddons(base.slug).map((a) => localisedAddon(a, lang)).map((a) => (
                  <li key={a.slug} className="flex items-baseline justify-between gap-3 border-b border-[color:var(--accent-soft)] pb-2">
                    <span>{a.name}</span>
                    <span className="whitespace-nowrap text-xs font-bold">{priceRange(a.priceMin, a.priceMax, a.openEnded)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Neighbours */}
      <section className="mx-auto max-w-6xl px-4 pb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {lighter ? (
            <Link href={`/services/${lighter.slug}`} className="panel mk-lift block p-5">
              <p className="text-xs uppercase tracking-wide text-steel-500">{c.smaller}</p>
              <p className="mt-1 font-display text-lg font-extrabold">{lighter.name}</p>
              <p className="text-sm text-steel-500">{priceRange(lighter.priceMin, lighter.priceMax, lighter.openEnded)}</p>
            </Link>
          ) : <span />}
          {heavier ? (
            <Link href={`/services/${heavier.slug}`} className="panel mk-lift block p-5 text-right">
              <p className="text-xs uppercase tracking-wide text-steel-500">{c.bigger}</p>
              <p className="mt-1 font-display text-lg font-extrabold">{heavier.name}</p>
              <p className="text-sm text-steel-500">{priceRange(heavier.priceMin, heavier.priceMax, heavier.openEnded)}</p>
            </Link>
          ) : null}
        </div>
      </section>

      <CtaBand
        title={c.ctaTitle(pkg.name)}
        lead={c.ctaLead(eur(deposit))}
        primary={{ href: `/portal/new?package=${pkg.slug}`, label: c.ctaBtn(eur(deposit)) }}
      />
    </>
  );
}
