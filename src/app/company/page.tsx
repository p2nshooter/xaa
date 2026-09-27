import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { SectionHead, CtaBand } from '@/components/Studio';
import { PartnershipCertificate } from '@/components/PartnershipCertificate';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';
import { jsonLdHtml } from '@/lib/json-ld';
import { pageMetadata } from '@/lib/seo';
import { SEO } from '@/content/seo-copy';
import { Breadcrumbs } from '@/components/Breadcrumbs';

/**
 * Company profile — the legal entity behind the studio, its leadership, the
 * partnership agreement between them and what the company is registered to do.
 *
 * Deliberately published from the founding statement: company name, seat,
 * registered activities (KBLI) and capital. Deliberately NOT published: the
 * founder's national ID number (NIK), tax number (NPWP), date of birth and home
 * address, and the verification QR. Those are personal identifiers — useful to
 * an identity thief, useless to a client — so the document image on this page is
 * a copy with them masked out of the pixels.
 */

const PAGE_URL = `${SITE.url}/company`;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ path: '/company', copy: SEO.company, type: 'profile', image: { url: '/company/og-company-profile.jpg', width: 1200, height: 630, alt: 'XAA.ES Digital Global partnership agreement' } });
}

type Copy = {
  chip: string; h1a: string; h1b: string; lead: string;
  factsTitle: string;
  facts: { k: string; v: string }[];
  whoEyebrow: string; whoTitle: string; whoLead: string;
  ceoRole: string; ceoBio: string; ctoRole: string; ctoBio: string;
  brandsEyebrow: string; brandsTitle: string;
  brands: { name: string; href: string; b: string }[];
  agreementEyebrow: string; agreementTitle: string; agreementLead: string; hdLink: string;
  infaqTitle: string; infaqBody: string;
  kbliEyebrow: string; kbliTitle: string; kbliLead: string;
  legalEyebrow: string; legalTitle: string; legalLead: string; legalAlt: string;
  ctaTitle: string; ctaLead: string; ctaPrimary: string; ctaSecondary: string;
};

/** Registered business activities, as listed in the founding statement. */
const KBLI: { code: string; id: string; en: string; es: string }[] = [
  { code: '62012', id: 'Aktivitas Pengembangan Aplikasi Perdagangan Melalui Internet (E-Commerce)', en: 'Development of e-commerce applications', es: 'Desarrollo de aplicaciones de comercio electrónico' },
  { code: '62019', id: 'Aktivitas Pemrograman Komputer Lainnya', en: 'Other computer programming activities', es: 'Otras actividades de programación informática' },
  { code: '63111', id: 'Aktivitas Pengolahan Data', en: 'Data processing activities', es: 'Actividades de procesamiento de datos' },
  { code: '63122', id: 'Portal Web dan/atau Platform Digital dengan Tujuan Komersial', en: 'Commercial web portals and digital platforms', es: 'Portales web y plataformas digitales con fines comerciales' },
  { code: '80200', id: 'Aktivitas Jasa Sistem Keamanan', en: 'Security systems services', es: 'Servicios de sistemas de seguridad' },
];

const COPY: Record<Lang, Copy> = {
  en: {
    chip: 'Company profile',
    h1a: 'PT AXTO DIGITAL GLOBAL',
    h1b: 'the company behind XAA.es and AXTO',
    lead: 'XAA.es is the web development studio of PT AXTO DIGITAL GLOBAL, an Indonesian limited liability company. The same team builds and runs AXTO, the company’s security and AI platform. This page sets out who we are, who is responsible, and what the company is registered to do.',
    factsTitle: 'At a glance',
    facts: [
      { k: 'Legal name', v: 'PT AXTO DIGITAL GLOBAL' },
      { k: 'Legal form', v: 'Perseroan Perorangan — individual limited liability company under Indonesian law' },
      { k: 'Registered seat', v: 'Bekasi, West Java (Jawa Barat), Indonesia' },
      { k: 'Paid-up capital', v: 'Rp50.000.000' },
      { k: 'Founder & CEO', v: 'Ulyah Munayah' },
      { k: 'CTO', v: 'Yusron Efendi' },
      { k: 'Brands', v: 'XAA.es (studio) · AXTO (platform)' },
      { k: 'Clients', v: 'Europe and international; contracts in euros' },
    ],
    whoEyebrow: 'Leadership', whoTitle: 'The people accountable for your project',
    whoLead: 'Two people sign for the company. Between them they answer for the strategy and the engineering — so when you ask who is responsible, there is a name.',
    ceoRole: 'Founder & Chief Executive Officer',
    ceoBio: 'Founded PT AXTO DIGITAL GLOBAL and leads the company: strategy, partnerships and management, and final responsibility for every commitment the studio makes to a client.',
    ctoRole: 'Chief Technology Officer',
    ctoBio: 'Leads development and operations with the technical team — the architecture, engineering and infrastructure behind every XAA build and the AXTO platform.',
    brandsEyebrow: 'Brands', brandsTitle: 'One company, two products',
    brands: [
      { name: 'XAA.es', href: '/', b: 'The studio: websites, stores, SaaS and enterprise platforms, built to a milestone plan with a client portal that shows real progress.' },
      { name: 'AXTO', href: '/portfolio', b: 'The platform: security operations, threat intelligence, compliance and AI studio modules — the company’s own product, and proof of the engineering we sell.' },
    ],
    agreementEyebrow: 'Partnership agreement', agreementTitle: 'How the company is shared, in writing',
    agreementLead: 'The partnership agreement between the CEO and the CTO sets out the parties, their responsibilities and how profit is allocated. It is reproduced below as text, so it stays sharp at any size.',
    hdLink: 'Open the original scan (high resolution)',
    infaqTitle: '10% to charity, before anyone is paid',
    infaqBody: 'One tenth of profit is set aside as infaq — charitable giving and social welfare — and a further tenth is held as an operational reserve, so the company can keep its promises in a bad month.',
    kbliEyebrow: 'Registered activities', kbliTitle: 'What the company is licensed to do',
    kbliLead: 'Business activity codes (KBLI) listed in the company’s founding statement.',
    legalEyebrow: 'Legal registration', legalTitle: 'Founding statement',
    legalLead: 'The founding statement of PT AXTO DIGITAL GLOBAL (Pernyataan Pendirian Perseroan Perorangan). Personal identifiers — ID number, tax number, date of birth, home address and the verification code — are masked; verification is available to clients on request.',
    legalAlt: 'Founding statement of PT AXTO DIGITAL GLOBAL with personal identifiers masked',
    ctaTitle: 'Work with the company, not a freelancer',
    ctaLead: 'A registered company, named leadership and a written agreement behind every project. Open a project and see your milestone amounts before anything is due.',
    ctaPrimary: 'Open a project', ctaSecondary: 'Contact us',
  },
  es: {
    chip: 'Perfil de empresa',
    h1a: 'PT AXTO DIGITAL GLOBAL',
    h1b: 'la empresa detrás de XAA.es y AXTO',
    lead: 'XAA.es es el estudio de desarrollo web de PT AXTO DIGITAL GLOBAL, una sociedad de responsabilidad limitada indonesia. El mismo equipo construye y opera AXTO, la plataforma de seguridad e IA de la empresa. Esta página explica quiénes somos, quién responde y qué actividades tiene registradas la empresa.',
    factsTitle: 'En resumen',
    facts: [
      { k: 'Razón social', v: 'PT AXTO DIGITAL GLOBAL' },
      { k: 'Forma jurídica', v: 'Perseroan Perorangan — sociedad de responsabilidad limitada unipersonal según la ley indonesia' },
      { k: 'Domicilio social', v: 'Bekasi, Java Occidental (Jawa Barat), Indonesia' },
      { k: 'Capital', v: 'Rp50.000.000' },
      { k: 'Fundadora y CEO', v: 'Ulyah Munayah' },
      { k: 'CTO', v: 'Yusron Efendi' },
      { k: 'Marcas', v: 'XAA.es (estudio) · AXTO (plataforma)' },
      { k: 'Clientes', v: 'Europa e internacional; contratos en euros' },
    ],
    whoEyebrow: 'Dirección', whoTitle: 'Las personas que responden de tu proyecto',
    whoLead: 'Dos personas firman por la empresa. Entre ambas responden de la estrategia y de la ingeniería: cuando preguntas quién es el responsable, hay un nombre.',
    ceoRole: 'Fundadora y directora ejecutiva (CEO)',
    ceoBio: 'Fundó PT AXTO DIGITAL GLOBAL y dirige la empresa: estrategia, alianzas y gestión, con la responsabilidad final de cada compromiso que el estudio adquiere con un cliente.',
    ctoRole: 'Director de tecnología (CTO)',
    ctoBio: 'Dirige el desarrollo y las operaciones con el equipo técnico: la arquitectura, la ingeniería y la infraestructura de cada proyecto de XAA y de la plataforma AXTO.',
    brandsEyebrow: 'Marcas', brandsTitle: 'Una empresa, dos productos',
    brands: [
      { name: 'XAA.es', href: '/', b: 'El estudio: webs, tiendas, SaaS y plataformas empresariales, construidas por hitos con un portal de cliente que muestra el progreso real.' },
      { name: 'AXTO', href: '/portfolio', b: 'La plataforma: operaciones de seguridad, inteligencia de amenazas, cumplimiento y módulos de IA; el producto propio de la empresa y la prueba de la ingeniería que vendemos.' },
    ],
    agreementEyebrow: 'Acuerdo de asociación', agreementTitle: 'Cómo se reparte la empresa, por escrito',
    agreementLead: 'El acuerdo entre la CEO y el CTO fija las partes, sus responsabilidades y el reparto de beneficios. Se reproduce abajo como texto, así se lee nítido a cualquier tamaño.',
    hdLink: 'Abrir el original escaneado (alta resolución)',
    infaqTitle: 'El 10% a caridad, antes de pagar a nadie',
    infaqBody: 'Una décima parte del beneficio se destina a infaq —donaciones y bienestar social— y otra décima se guarda como reserva operativa, para que la empresa cumpla sus compromisos también en un mal mes.',
    kbliEyebrow: 'Actividades registradas', kbliTitle: 'Qué está autorizada a hacer la empresa',
    kbliLead: 'Códigos de actividad (KBLI) que figuran en la declaración de constitución.',
    legalEyebrow: 'Registro legal', legalTitle: 'Declaración de constitución',
    legalLead: 'Declaración de constitución de PT AXTO DIGITAL GLOBAL (Pernyataan Pendirian Perseroan Perorangan). Los datos personales —número de identidad, número fiscal, fecha de nacimiento, domicilio y el código de verificación— están ocultos; la verificación está disponible para clientes que la soliciten.',
    legalAlt: 'Declaración de constitución de PT AXTO DIGITAL GLOBAL con los datos personales ocultos',
    ctaTitle: 'Trabaja con una empresa, no con un freelance',
    ctaLead: 'Una sociedad registrada, una dirección con nombre y un acuerdo escrito detrás de cada proyecto. Abre un proyecto y verás tus importes por hito antes de pagar nada.',
    ctaPrimary: 'Abrir un proyecto', ctaSecondary: 'Contactar',
  },
  id: {
    chip: 'Profil perusahaan',
    h1a: 'PT AXTO DIGITAL GLOBAL',
    h1b: 'perusahaan di balik XAA.es dan AXTO',
    lead: 'XAA.es adalah studio pengembangan web milik PT AXTO DIGITAL GLOBAL, perseroan terbatas Indonesia. Tim yang sama membangun dan menjalankan AXTO, platform keamanan dan AI milik perusahaan. Halaman ini menjelaskan siapa kami, siapa yang bertanggung jawab, dan kegiatan usaha apa yang terdaftar.',
    factsTitle: 'Sekilas',
    facts: [
      { k: 'Nama perseroan', v: 'PT AXTO DIGITAL GLOBAL' },
      { k: 'Bentuk badan hukum', v: 'Perseroan Perorangan (PT Perorangan)' },
      { k: 'Kedudukan', v: 'Bekasi, Jawa Barat, Indonesia' },
      { k: 'Modal usaha', v: 'Rp50.000.000' },
      { k: 'Pendiri & CEO', v: 'Ulyah Munayah' },
      { k: 'CTO', v: 'Yusron Efendi' },
      { k: 'Merek', v: 'XAA.es (studio) · AXTO (platform)' },
      { k: 'Klien', v: 'Eropa dan internasional; kontrak dalam euro' },
    ],
    whoEyebrow: 'Kepemimpinan', whoTitle: 'Orang yang bertanggung jawab atas proyek Anda',
    whoLead: 'Dua orang menandatangani atas nama perusahaan. Keduanya menanggung strategi dan rekayasa teknis — jadi saat Anda bertanya siapa yang bertanggung jawab, ada namanya.',
    ceoRole: 'Pendiri & Chief Executive Officer (CEO)',
    ceoBio: 'Mendirikan PT AXTO DIGITAL GLOBAL dan memimpin perusahaan: strategi, kemitraan dan manajemen, serta tanggung jawab akhir atas setiap komitmen studio kepada klien.',
    ctoRole: 'Chief Technology Officer (CTO)',
    ctoBio: 'Memimpin pengembangan dan operasional bersama tim teknis — arsitektur, rekayasa dan infrastruktur di balik setiap proyek XAA dan platform AXTO.',
    brandsEyebrow: 'Merek', brandsTitle: 'Satu perusahaan, dua produk',
    brands: [
      { name: 'XAA.es', href: '/', b: 'Studio: website, toko online, SaaS dan platform enterprise, dikerjakan per milestone dengan portal klien yang menampilkan progres nyata.' },
      { name: 'AXTO', href: '/portfolio', b: 'Platform: operasi keamanan, intelijen ancaman, kepatuhan dan modul AI studio — produk milik perusahaan sendiri, sekaligus bukti kualitas rekayasa yang kami jual.' },
    ],
    agreementEyebrow: 'Perjanjian kemitraan', agreementTitle: 'Pembagian perusahaan, tertulis',
    agreementLead: 'Perjanjian kemitraan antara CEO dan CTO mengatur para pihak, tanggung jawabnya, dan pembagian keuntungan. Ditampilkan di bawah sebagai teks asli, sehingga tetap tajam di ukuran apa pun.',
    hdLink: 'Buka pindaian asli (resolusi tinggi)',
    infaqTitle: '10% untuk infaq, sebelum siapa pun dibayar',
    infaqBody: 'Sepersepuluh keuntungan disisihkan untuk infaq — sedekah dan kesejahteraan sosial — dan sepersepuluh lagi menjadi dana cadangan operasional, agar perusahaan tetap menepati janji di bulan yang sulit.',
    kbliEyebrow: 'Kegiatan usaha terdaftar', kbliTitle: 'Bidang usaha yang diizinkan',
    kbliLead: 'Kode kegiatan usaha (KBLI) sesuai pernyataan pendirian perseroan.',
    legalEyebrow: 'Legalitas', legalTitle: 'Pernyataan pendirian',
    legalLead: 'Pernyataan Pendirian Perseroan Perorangan PT AXTO DIGITAL GLOBAL. Data pribadi — NIK, NPWP, tanggal lahir, alamat rumah dan kode verifikasi — disamarkan; verifikasi dapat diberikan kepada klien atas permintaan.',
    legalAlt: 'Pernyataan pendirian PT AXTO DIGITAL GLOBAL dengan data pribadi disamarkan',
    ctaTitle: 'Bekerja dengan perusahaan, bukan freelancer',
    ctaLead: 'Badan usaha terdaftar, pimpinan yang jelas, dan perjanjian tertulis di balik setiap proyek. Buka proyek dan lihat nominal tiap milestone sebelum ada yang harus dibayar.',
    ctaPrimary: 'Buka proyek', ctaSecondary: 'Hubungi kami',
  },
};

function Portrait({ file, name, role, bio, eager = false }: { file: string; name: string; role: string; bio: string; eager?: boolean }) {
  return (
    <figure className="panel mk-lift overflow-hidden" itemScope itemType="https://schema.org/Person">
      <picture>
        <source srcSet={`/company/${file}.webp`} type="image/webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/company/${file}.jpg`}
          alt={`${name} — ${role}, PT AXTO DIGITAL GLOBAL`}
          width={800}
          height={1000}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="aspect-[4/5] w-full object-cover"
          itemProp="image"
        />
      </picture>
      <figcaption className="p-5">
        <p className="font-display text-xl font-extrabold" itemProp="name">{name}</p>
        <p className="text-sm font-semibold text-gold-500" itemProp="jobTitle">{role}</p>
        <p className="mt-2 text-sm leading-relaxed text-steel-500" itemProp="description">{bio}</p>
      </figcaption>
    </figure>
  );
}

export default async function CompanyPage() {
  const lang = await getLang();
  const c = pick(lang, COPY);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${PAGE_URL}#axto`,
        name: 'PT AXTO DIGITAL GLOBAL',
        legalName: 'PT AXTO DIGITAL GLOBAL',
        alternateName: ['AXTO Digital Global', 'AXTO'],
        url: PAGE_URL,
        logo: `${SITE.url}/company/axto-digital-global-logo-800.webp`,
        slogan: 'One Ecosystem. Endless Possibilities.',
        address: { '@type': 'PostalAddress', addressLocality: 'Bekasi', addressRegion: 'Jawa Barat', addressCountry: 'ID' },
        founder: { '@id': `${PAGE_URL}#ceo` },
        employee: [{ '@id': `${PAGE_URL}#ceo` }, { '@id': `${PAGE_URL}#cto` }],
        brand: [{ '@id': `${SITE.url}#org` }, { '@type': 'Brand', name: 'AXTO', url: 'https://axto.io' }],
        isicV4: '6201',
        knowsAbout: KBLI.map((k) => k.en),
      },
      { '@id': `${SITE.url}#org`, parentOrganization: { '@id': `${PAGE_URL}#axto` } },
      {
        '@type': 'Person',
        '@id': `${PAGE_URL}#ceo`,
        name: 'Ulyah Munayah',
        jobTitle: 'Chief Executive Officer',
        image: `${SITE.url}/company/ulyah-munayah-ceo-axto-digital-global.jpg`,
        worksFor: { '@id': `${PAGE_URL}#axto` },
      },
      {
        '@type': 'Person',
        '@id': `${PAGE_URL}#cto`,
        name: 'Yusron Efendi',
        jobTitle: 'Chief Technology Officer',
        image: `${SITE.url}/company/yusron-efendi-cto-axto-digital-global.jpg`,
        worksFor: { '@id': `${PAGE_URL}#axto` },
      },
      {
        '@type': ['WebPage', 'AboutPage'],
        '@id': `${PAGE_URL}#page`,
        url: PAGE_URL,
        name: 'Company profile — PT AXTO DIGITAL GLOBAL',
        inLanguage: lang,
        isPartOf: { '@id': `${SITE.url}#site` },
        about: { '@id': `${PAGE_URL}#axto` },
        primaryImageOfPage: { '@id': `${PAGE_URL}#agreement` },
      },
      {
        '@type': 'ImageObject',
        '@id': `${PAGE_URL}#agreement`,
        contentUrl: `${SITE.url}/company/partnership-agreement-xaa-es-digital-global-hd.webp`,
        name: 'Partnership Agreement — XAA.ES Digital Global',
        caption: 'Partnership agreement between Ulyah Munayah (CEO) and Yusron Efendi (CTO), PT AXTO DIGITAL GLOBAL',
        width: 3072,
        height: 2048,
      },
    ],
  };

  return (
    <>
      <Breadcrumbs trail={[{ k: 'nav.company' }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />

      <section className="hero relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <span className="chip">{c.chip}</span>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              {c.h1a} — <span className="accent-text">{c.h1b}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-slate-600">{c.lead}</p>
          </div>
          <picture className="mx-auto w-full max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/company/axto-digital-global-logo-800.webp"
              srcSet="/company/axto-digital-global-logo-400.webp 400w, /company/axto-digital-global-logo-800.webp 800w"
              sizes="(min-width: 1024px) 384px, 90vw"
              alt="AXTO Digital Global logo — One Ecosystem. Endless Possibilities."
              width={800}
              height={800}
              fetchPriority="high"
              className="w-full rounded-3xl shadow-2xl"
            />
          </picture>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-2xl font-extrabold">{c.factsTitle}</h2>
        <dl className="panel mt-5 grid gap-x-8 gap-y-4 p-6 sm:grid-cols-2">
          {c.facts.map((f) => (
            <div key={f.k} className="border-b border-[color:var(--line)] pb-3 last:border-0 sm:[&:nth-last-child(2)]:border-0">
              <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">{f.k}</dt>
              <dd className="mt-1 font-semibold">{f.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8" id="leadership">
        <SectionHead eyebrow={c.whoEyebrow} title={c.whoTitle} lead={c.whoLead} />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:max-w-4xl">
          <Portrait file="ulyah-munayah-ceo-axto-digital-global" name="Ulyah Munayah" role={c.ceoRole} bio={c.ceoBio} />
          <Portrait file="yusron-efendi-cto-axto-digital-global" name="Yusron Efendi" role={c.ctoRole} bio={c.ctoBio} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" id="brands">
        <SectionHead eyebrow={c.brandsEyebrow} title={c.brandsTitle} />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {c.brands.map((b) => (
            <Link key={b.name} href={b.href} className="panel mk-lift block p-6">
              <p className="font-display text-xl font-extrabold">{b.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-steel-500">{b.b}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" id="partnership-agreement">
        <SectionHead eyebrow={c.agreementEyebrow} title={c.agreementTitle} lead={c.agreementLead} />
        <div className="mt-8">
          <PartnershipCertificate />
        </div>
        <p className="mt-4 text-sm">
          <a
            href="/company/partnership-agreement-xaa-es-digital-global-hd.webp"
            className="font-semibold text-gold-500 underline"
            target="_blank"
            rel="noopener"
          >
            {c.hdLink} ↗
          </a>
        </p>
        <div className="panel mt-8 border-l-4 border-l-gold-500 p-6">
          <h3 className="font-display text-lg font-extrabold">{c.infaqTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-steel-500">{c.infaqBody}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" id="registered-activities">
        <SectionHead eyebrow={c.kbliEyebrow} title={c.kbliTitle} lead={c.kbliLead} />
        <div className="panel mt-8 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[color:var(--line)] text-xs uppercase tracking-wide text-steel-500">
                <th className="p-4">KBLI</th>
                <th className="p-4">{lang === 'id' ? 'Kegiatan usaha' : lang === 'es' ? 'Actividad' : 'Activity'}</th>
              </tr>
            </thead>
            <tbody>
              {KBLI.map((k) => (
                <tr key={k.code} className="border-b border-[color:var(--line)] last:border-0">
                  <td className="p-4 font-mono font-bold">{k.code}</td>
                  <td className="p-4">
                    <span className="font-semibold">{lang === 'id' ? k.id : lang === 'es' ? k.es : k.en}</span>
                    {lang !== 'id' ? <span className="block text-xs text-steel-500">{k.id}</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" id="legal">
        <SectionHead eyebrow={c.legalEyebrow} title={c.legalTitle} lead={c.legalLead} />
        <figure className="panel mx-auto mt-8 max-w-2xl p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/company/pt-axto-digital-global-pendirian-redacted.webp"
            alt={c.legalAlt}
            width={1412}
            height={1928}
            loading="lazy"
            decoding="async"
            className="w-full rounded-md"
          />
        </figure>
      </section>

      <CtaBand
        title={c.ctaTitle}
        lead={c.ctaLead}
        primary={{ href: '/portal/new', label: c.ctaPrimary }}
        secondary={{ href: '/contact', label: c.ctaSecondary }}
      />
    </>
  );
}
