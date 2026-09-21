import Link from 'next/link';
import type { Metadata } from 'next';
import { eur, usd, priceRange } from '@/content/packages';
import { localisedCivicTiers, localisedCivicCapabilities } from '@/content/packages.i18n';
import { WORKS } from '@/content/portfolio';
import { SectionHead, CtaBand } from '@/components/Studio';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Election & civic systems',
  description:
    'Voter-roll verification, offline field registers and live vote tallying — priced from a single village at €6,000 to a national programme at €600,000+. Built, and running.',
  alternates: { canonical: '/election-systems' },
};

type Copy = {
  chip: string; h1a: string; h1b: string; heroLead: string; seeBtn: string; discussBtn: string;
  tiersEyebrow: string; tiersTitle: string; tiersLead: string;
  thNum: string; thTier: string; thScale: string; thCapacity: string; thTimeline: string; thPrice: string;
  mostRequested: string; discussTier: string; startsFrom: (v: string) => string;
  bringEyebrow: string; bringTitle: string; bringLead: string;
  demoStamp: string; demoTitle: string; demoLead: string;
  scopeTitle: string; scopeBody0: string; scopeLink: string; scopeBody1: string;
  ctaTitle: string; ctaLead: string; ctaPrimary: string; ctaSecondary: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    chip: 'Election & civic systems', h1a: 'Software that has to work', h1b: 'on one particular day',
    heroLead: 'Voter-roll verification, a field register that runs with no signal, and a tally that produces a defensible recapitulation the same evening. We have built and run this — the demos on our work page are the real applications, with every real person replaced by generated data.',
    seeBtn: 'See it running', discussBtn: 'Discuss a programme',
    tiersEyebrow: 'Pricing by scale', tiersTitle: 'From one village to a nation',
    tiersLead: 'Priced on administrative scale because that is what a buyer knows, and because scale is what actually drives the cost: polling stations, simultaneous field officers, and the audit obligations that come with each level.',
    thNum: '#', thTier: 'Tier', thScale: 'Scale', thCapacity: 'Capacity', thTimeline: 'Timeline', thPrice: 'Price (EUR)',
    mostRequested: 'Most requested', discussTier: 'Discuss this tier', startsFrom: (v) => `Starts from ${v} · 10% booking deposit`,
    bringEyebrow: 'What every tier includes', bringTitle: 'The parts that decide whether it survives election day',
    bringLead: 'These are not upsells. They are the difference between a system that produces a defensible result and one that produces an argument.',
    demoStamp: 'Demo · sampling only', demoTitle: 'Try the real applications',
    demoLead: 'These are the systems themselves, not mock-ups — with every name, national ID, address and account replaced by generated values, and only a sample of rows kept. The originals hold real citizen records and are not ours to publish.',
    scopeTitle: 'Scope, and what moves the price',
    scopeBody0: 'Ranges cover the honest span between adapting what we have already built and a programme with its own register format, its own legal obligations and its own integrations. The factors that move a figure inside its range: number of polling stations and field officers, the peak submission window, audit and chain-of-custody requirements, languages, accessibility obligations, whether a public results surface is in scope, and the operational cover you need around election day. Final pricing follows a scope review, as with every ',
    scopeLink: 'package we publish', scopeBody1: '.',
    ctaTitle: 'Running an election programme?',
    ctaLead: 'Tell us the scale — villages, polling stations, expected field officers — and we will come back with the tier it lands in and a realistic figure.',
    ctaPrimary: 'Send the requirements', ctaSecondary: 'See what we built',
  },
  es: {
    chip: 'Sistemas electorales y cívicos', h1a: 'Software que tiene que funcionar', h1b: 'un día en concreto',
    heroLead: 'Verificación del censo, un registro de campo que funciona sin señal, y un escrutinio que produce una recapitulación defendible la misma tarde. Lo hemos construido y operado — las demos de nuestra página de proyectos son las aplicaciones reales, con cada persona real reemplazada por datos generados.',
    seeBtn: 'Verlo en marcha', discussBtn: 'Hablar de un programa',
    tiersEyebrow: 'Precio por escala', tiersTitle: 'De una aldea a una nación',
    tiersLead: 'Con precio por escala administrativa porque es lo que un comprador conoce, y porque la escala es lo que realmente mueve el coste: mesas electorales, agentes de campo simultáneos y las obligaciones de auditoría que trae cada nivel.',
    thNum: '#', thTier: 'Nivel', thScale: 'Escala', thCapacity: 'Capacidad', thTimeline: 'Plazo', thPrice: 'Precio (EUR)',
    mostRequested: 'Más solicitado', discussTier: 'Hablar de este nivel', startsFrom: (v) => `Desde ${v} · 10% de depósito de reserva`,
    bringEyebrow: 'Lo que incluye cada nivel', bringTitle: 'Las partes que deciden si sobrevive al día electoral',
    bringLead: 'No son extras de venta. Son la diferencia entre un sistema que produce un resultado defendible y uno que produce una discusión.',
    demoStamp: 'Demo · solo muestreo', demoTitle: 'Prueba las aplicaciones reales',
    demoLead: 'Son los sistemas mismos, no maquetas — con cada nombre, DNI, dirección y cuenta reemplazados por valores generados, y solo una muestra de filas conservada. Los originales contienen datos reales de ciudadanos y no son nuestros para publicar.',
    scopeTitle: 'Alcance, y qué mueve el precio',
    scopeBody0: 'Los rangos cubren el intervalo honesto entre adaptar lo que ya hemos construido y un programa con su propio formato de registro, sus propias obligaciones legales y sus propias integraciones. Los factores que mueven una cifra dentro de su rango: número de mesas y agentes de campo, la ventana de envío pico, requisitos de auditoría y cadena de custodia, idiomas, obligaciones de accesibilidad, si una superficie pública de resultados entra en el alcance, y la cobertura operativa que necesitas en torno al día electoral. El precio final sigue a una revisión del alcance, como con cada ',
    scopeLink: 'paquete que publicamos', scopeBody1: '.',
    ctaTitle: '¿Diriges un programa electoral?',
    ctaLead: 'Dinos la escala — aldeas, mesas, agentes de campo esperados — y volvemos con el nivel que le corresponde y una cifra realista.',
    ctaPrimary: 'Enviar los requisitos', ctaSecondary: 'Ver lo que construimos',
  },
  id: {
    chip: 'Sistem pemilu & sipil', h1a: 'Perangkat lunak yang harus bekerja', h1b: 'pada satu hari tertentu',
    heroLead: 'Verifikasi daftar pemilih, register lapangan yang berjalan tanpa sinyal, dan penghitungan yang menghasilkan rekapitulasi yang dapat dipertahankan pada malam yang sama. Kami telah membangun dan menjalankannya — demo di halaman karya kami adalah aplikasi nyata, dengan tiap orang nyata diganti data buatan.',
    seeBtn: 'Lihat berjalan', discussBtn: 'Bahas sebuah program',
    tiersEyebrow: 'Harga per skala', tiersTitle: 'Dari satu desa ke satu negara',
    tiersLead: 'Dihargai per skala administratif karena itu yang diketahui pembeli, dan karena skala-lah yang benar-benar menggerakkan biaya: TPS, petugas lapangan serentak, dan kewajiban audit yang menyertai tiap tingkat.',
    thNum: '#', thTier: 'Tingkat', thScale: 'Skala', thCapacity: 'Kapasitas', thTimeline: 'Lini masa', thPrice: 'Harga (EUR)',
    mostRequested: 'Paling diminta', discussTier: 'Bahas tingkat ini', startsFrom: (v) => `Mulai dari ${v} · DP pemesanan 10%`,
    bringEyebrow: 'Yang termasuk di tiap tingkat', bringTitle: 'Bagian yang menentukan apakah ia bertahan di hari pemilihan',
    bringLead: 'Ini bukan jualan tambahan. Inilah beda antara sistem yang menghasilkan hasil yang dapat dipertahankan dan yang menghasilkan perdebatan.',
    demoStamp: 'Demo · hanya sampel', demoTitle: 'Coba aplikasi nyatanya',
    demoLead: 'Ini sistemnya sendiri, bukan maket — dengan tiap nama, NIK, alamat, dan akun diganti nilai buatan, dan hanya sampel baris yang disimpan. Aslinya memuat data warga nyata dan bukan milik kami untuk dipublikasikan.',
    scopeTitle: 'Ruang lingkup, dan apa yang menggerakkan harga',
    scopeBody0: 'Rentang mencakup jarak jujur antara mengadaptasi yang sudah kami bangun dan program dengan format register sendiri, kewajiban hukum sendiri, dan integrasi sendiri. Faktor yang menggerakkan angka dalam rentangnya: jumlah TPS dan petugas lapangan, jendela pengiriman puncak, syarat audit dan rantai penyimpanan, bahasa, kewajiban aksesibilitas, apakah permukaan hasil publik masuk lingkup, dan cakupan operasional yang Anda butuhkan seputar hari pemilihan. Harga final mengikuti tinjauan ruang lingkup, seperti tiap ',
    scopeLink: 'paket yang kami publikasikan', scopeBody1: '.',
    ctaTitle: 'Menjalankan program pemilu?',
    ctaLead: 'Beri tahu kami skalanya — desa, TPS, perkiraan petugas lapangan — dan kami kembali dengan tingkat yang cocok dan angka realistis.',
    ctaPrimary: 'Kirim persyaratan', ctaSecondary: 'Lihat yang kami bangun',
  },
};

export default async function ElectionSystemsPage() {
  const lang = await getLang();
  const c = pick(lang, COPY);
  const tiers = localisedCivicTiers(lang);
  const caps = localisedCivicCapabilities(lang);
  const civic = WORKS.find((w) => w.slug === 'app-desa');

  return (
    <>
      <section className="hero relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <span className="chip">{c.chip}</span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            {c.h1a} <span className="accent-text">{c.h1b}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-steel-500">{c.heroLead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/portfolio#app-desa" className="btn btn-primary">{c.seeBtn}</Link>
            <Link href="/contact?tier=civic" className="btn btn-ghost">{c.discussBtn}</Link>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionHead eyebrow={c.tiersEyebrow} title={c.tiersTitle} lead={c.tiersLead} />

        <div className="mt-10 overflow-x-auto">
          <table className="data-table min-w-[820px]">
            <thead>
              <tr>
                <th>{c.thNum}</th>
                <th>{c.thTier}</th>
                <th>{c.thScale}</th>
                <th>{c.thCapacity}</th>
                <th>{c.thTimeline}</th>
                <th className="text-right">{c.thPrice}</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t) => (
                <tr key={t.slug}>
                  <td className="font-mono text-xs text-steel-400">{t.code}</td>
                  <td className="font-bold">
                    {t.name}
                    {t.popular ? <span className="ml-2 badge badge-blue">{c.mostRequested}</span> : null}
                  </td>
                  <td className="text-xs text-steel-500">{t.scale}</td>
                  <td className="whitespace-nowrap text-xs">{t.capacity}</td>
                  <td className="whitespace-nowrap text-xs">{t.timeline}</td>
                  <td className="whitespace-nowrap text-right font-display font-extrabold">
                    {priceRange(t.priceMin, t.priceMax, t.openEnded)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {tiers.map((t) => (
            <article key={t.slug} className={`premium-card flex h-full flex-col p-6 ${t.popular ? 'ring-2 ring-[color:var(--accent)]' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-steel-400">{t.code}</p>
                  <h3 className="mt-0.5 font-display text-xl font-extrabold">{t.name}</h3>
                  <p className="mt-1 text-xs text-steel-500">{t.scale}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-extrabold accent-text">
                    {priceRange(t.priceMin, t.priceMax, t.openEnded)}
                  </p>
                  <p className="text-xs text-steel-400">≈ {usd(t.priceMin)}+ · {t.timeline}</p>
                </div>
              </div>

              <p className="mt-3.5 text-sm leading-relaxed text-steel-500">{t.summary}</p>

              <ul className="mt-4 space-y-1.5">
                {t.includes.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-steel-500">
                    <span className="tick">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex gap-2 pt-6">
                <Link href={`/contact?tier=${t.slug}`} className="btn btn-primary btn-sm flex-1">{c.discussTier}</Link>
              </div>
              <p className="mt-2 text-center text-[11px] text-steel-400">{c.startsFrom(eur(Math.round(t.priceMin * 0.1)))}</p>
            </article>
          ))}
        </div>
      </section>

      {/* What we bring */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHead eyebrow={c.bringEyebrow} title={c.bringTitle} lead={c.bringLead} />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {caps.map((cap) => (
            <div key={cap.title} className="premium-card p-6">
              <h3 className="font-display text-base font-extrabold">{cap.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-500">{cap.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demos */}
      {civic?.demos ? (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="panel border-l-4 border-l-red-400 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="stamp-note">{c.demoStamp}</span>
              <h2 className="font-display text-xl font-extrabold">{c.demoTitle}</h2>
            </div>
            <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-steel-500">{c.demoLead}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {civic.demos.map((d) => (
                <a key={d.href} href={d.href} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" title={d.note}>
                  {d.label} ↗
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="panel border-l-4 border-l-[color:var(--accent)] p-6">
          <h2 className="font-display text-lg font-extrabold">{c.scopeTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-steel-500">
            {c.scopeBody0}<Link href="/services" className="text-gold-500 underline">{c.scopeLink}</Link>{c.scopeBody1}
          </p>
        </div>
      </section>

      <CtaBand
        title={c.ctaTitle}
        lead={c.ctaLead}
        primary={{ href: '/contact?tier=civic', label: c.ctaPrimary }}
        secondary={{ href: '/portfolio#app-desa', label: c.ctaSecondary }}
      />
    </>
  );
}
