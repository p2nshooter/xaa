import Link from 'next/link';
import type { Metadata } from 'next';
import { WORKS, NETWORK, portfolioTotals, type Work } from '@/content/portfolio';
import { eur, usd } from '@/content/packages';
import { localisedSuperEnterprise } from '@/content/packages.i18n';
import { SectionHead, CtaBand } from '@/components/Studio';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Systems XAA has built and runs: an AI and security platform, a multi-module consumer platform, production management software, web applications and an editorial network — with the build price each one represents.',
  alternates: { canonical: '/portfolio' },
};

const fmtLoc = (n: number) => `${Math.round(n / 1000)}k`;

type Copy = {
  chip: string; h1a: string; h1b: string; heroLead: string;
  systemsLive: string; linesShipped: string; routes: string; buildValue: string;
  flagshipEyebrow: string; flagshipTitle: string; flagshipLead: string;
  alsoEyebrow: string; alsoTitle: string;
  sitesWord: (n: number) => string; perProgramme: string; engagements: string;
  whatCovers: string; builtFor: string; howRuns: string;
  seFlagship: string; enquire: string; howProgramme: string; contractedIn: (a: string, b: string) => string;
  pricesTitle: string; pricesBody0: string; pricesLink: string; pricesBody1: string;
  ctaTitle: string; ctaLead: string; ctaPrimary: string; ctaSecondary: string;
  lines: string; stack: string; domainsLine: (n: number) => string;
  demoStamp: string; demoNoteRow: string; demoNoteCard: string; internal: string;
  modulesTitle: string; modulesLead: string; thApp: string; thLoc: string; thBuild: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    chip: 'Work', h1a: 'Systems we built,', h1b: 'and still run',
    heroLead: "These are the studio's own platforms and products, not client commissions — which means we can show you the whole thing rather than a screenshot cleared by someone's legal team. Every figure below is measured from the source. The price beside each is what a comparable build costs at our published rates.",
    systemsLive: 'Systems live', linesShipped: 'Lines shipped', routes: 'Routes', buildValue: 'Build value',
    flagshipEyebrow: 'Flagship', flagshipTitle: 'The three largest',
    flagshipLead: 'Measured in routes and lines of TypeScript, read straight off the repositories.',
    alsoEyebrow: 'Also built', alsoTitle: 'Platforms and sites',
    sitesWord: (n) => `${n} sites`, perProgramme: 'per programme', engagements: 'engagements at a time',
    whatCovers: 'What it covers', builtFor: 'Built for', howRuns: 'How it runs',
    seFlagship: 'Flagship engagement', enquire: 'Enquire about a slot', howProgramme: 'How a programme runs',
    contractedIn: (a, b) => `Contracted in EUR (${a} – ${b}) · scope review before signature`,
    pricesTitle: 'About the prices on this page',
    pricesBody0: 'Each figure is what commissioning a comparable system costs at the rates published on ',
    pricesLink: 'our services page', pricesBody1: ' — it is an estimate of build value, not an invoice anyone received, and not a claim about revenue. The scope numbers (routes and lines of code) are counted from the repositories, and scope is only one input into a price: the rest are listed on the services page.',
    ctaTitle: 'Want something on this scale?',
    ctaLead: 'Send the brief. We will tell you which package it lands in, what it will realistically cost, and what we would cut from a first version.',
    ctaPrimary: 'Send a brief', ctaSecondary: 'See packages',
    lines: 'Lines', stack: 'Stack', domainsLine: (n) => `${n} production domains, one codebase`,
    demoStamp: 'Demo · sampling only',
    demoNoteRow: 'Not real data. Every name, ID and address in these is generated, and only a sample of rows is kept — the systems themselves run on records that are not ours to publish.',
    demoNoteCard: 'Not real data — names, IDs and addresses are generated and only a sample of rows is kept.',
    internal: 'Internal system',
    modulesTitle: 'Priced app by app', modulesLead: 'AXTO is not one app but a platform of them. Each module is measured from the repository and priced on its own, at the rates on our services page.', thApp: 'App / module', thLoc: 'Lines', thBuild: 'Build value (EUR)',
  },
  es: {
    chip: 'Proyectos', h1a: 'Sistemas que construimos,', h1b: 'y aún operamos',
    heroLead: 'Son las propias plataformas y productos del estudio, no encargos de clientes — lo que significa que podemos enseñarte la cosa entera y no una captura aprobada por el departamento legal de alguien. Cada cifra de abajo está medida desde el código. El precio junto a cada una es lo que cuesta un desarrollo comparable a nuestras tarifas publicadas.',
    systemsLive: 'Sistemas activos', linesShipped: 'Líneas escritas', routes: 'Rutas', buildValue: 'Valor de desarrollo',
    flagshipEyebrow: 'Insignia', flagshipTitle: 'Los tres mayores',
    flagshipLead: 'Medido en rutas y líneas de TypeScript, leídas directamente de los repositorios.',
    alsoEyebrow: 'También construido', alsoTitle: 'Plataformas y sitios',
    sitesWord: (n) => `${n} sitios`, perProgramme: 'por programa', engagements: 'proyectos a la vez',
    whatCovers: 'Qué cubre', builtFor: 'Construido para', howRuns: 'Cómo funciona',
    seFlagship: 'Proyecto insignia', enquire: 'Consultar por un cupo', howProgramme: 'Cómo funciona un programa',
    contractedIn: (a, b) => `Contratado en EUR (${a} – ${b}) · revisión del alcance antes de firmar`,
    pricesTitle: 'Sobre los precios de esta página',
    pricesBody0: 'Cada cifra es lo que cuesta encargar un sistema comparable a las tarifas publicadas en ',
    pricesLink: 'nuestra página de servicios', pricesBody1: ' — es una estimación del valor de desarrollo, no una factura que alguien recibió, ni una afirmación sobre ingresos. Las cifras de alcance (rutas y líneas de código) se cuentan desde los repositorios, y el alcance es solo una entrada en un precio: el resto se lista en la página de servicios.',
    ctaTitle: '¿Quieres algo de esta escala?',
    ctaLead: 'Envía el brief. Te diremos en qué paquete encaja, cuánto costará de forma realista, y qué recortaríamos de una primera versión.',
    ctaPrimary: 'Enviar un brief', ctaSecondary: 'Ver paquetes',
    lines: 'Líneas', stack: 'Tecnología', domainsLine: (n) => `${n} dominios en producción, un solo código`,
    demoStamp: 'Demo · solo muestreo',
    demoNoteRow: 'No son datos reales. Cada nombre, ID y dirección aquí está generado, y solo se conserva una muestra de filas — los sistemas mismos funcionan con datos que no son nuestros para publicar.',
    demoNoteCard: 'No son datos reales — nombres, ID y direcciones están generados y solo se conserva una muestra de filas.',
    internal: 'Sistema interno',
    modulesTitle: 'Con precio app por app', modulesLead: 'AXTO no es una app sino una plataforma de ellas. Cada módulo se mide desde el repositorio y se cotiza por su cuenta, a las tarifas de nuestra página de servicios.', thApp: 'App / módulo', thLoc: 'Líneas', thBuild: 'Valor de desarrollo (EUR)',
  },
  id: {
    chip: 'Karya', h1a: 'Sistem yang kami bangun,', h1b: 'dan masih kami jalankan',
    heroLead: 'Ini platform dan produk milik studio sendiri, bukan pesanan klien — artinya kami bisa menunjukkan semuanya, bukan tangkapan layar yang diloloskan tim legal seseorang. Tiap angka di bawah diukur dari kode sumber. Harga di sebelahnya adalah biaya build serupa pada tarif kami yang dipublikasikan.',
    systemsLive: 'Sistem aktif', linesShipped: 'Baris ditulis', routes: 'Rute', buildValue: 'Nilai build',
    flagshipEyebrow: 'Unggulan', flagshipTitle: 'Tiga terbesar',
    flagshipLead: 'Diukur dalam rute dan baris TypeScript, dibaca langsung dari repositori.',
    alsoEyebrow: 'Juga dibangun', alsoTitle: 'Platform dan situs',
    sitesWord: (n) => `${n} situs`, perProgramme: 'per program', engagements: 'proyek sekaligus',
    whatCovers: 'Yang dicakup', builtFor: 'Dibangun untuk', howRuns: 'Cara berjalannya',
    seFlagship: 'Proyek unggulan', enquire: 'Tanyakan slot', howProgramme: 'Cara sebuah program berjalan',
    contractedIn: (a, b) => `Berkontrak dalam EUR (${a} – ${b}) · tinjauan ruang lingkup sebelum tanda tangan`,
    pricesTitle: 'Tentang harga di halaman ini',
    pricesBody0: 'Tiap angka adalah biaya memesan sistem serupa pada tarif yang dipublikasikan di ',
    pricesLink: 'halaman layanan kami', pricesBody1: ' — ini perkiraan nilai build, bukan faktur yang diterima siapa pun, dan bukan klaim soal pendapatan. Angka ruang lingkup (rute dan baris kode) dihitung dari repositori, dan ruang lingkup hanya satu masukan ke harga: sisanya tercantum di halaman layanan.',
    ctaTitle: 'Ingin sesuatu pada skala ini?',
    ctaLead: 'Kirim brief-nya. Kami akan bilang paket mana yang cocok, berapa biaya realistisnya, dan apa yang akan kami pangkas dari versi pertama.',
    ctaPrimary: 'Kirim brief', ctaSecondary: 'Lihat paket',
    lines: 'Baris', stack: 'Teknologi', domainsLine: (n) => `${n} domain produksi, satu basis kode`,
    demoStamp: 'Demo · hanya sampel',
    demoNoteRow: 'Bukan data nyata. Tiap nama, ID, dan alamat di sini dibuat, dan hanya sampel baris yang disimpan — sistemnya sendiri berjalan pada data yang bukan milik kami untuk dipublikasikan.',
    demoNoteCard: 'Bukan data nyata — nama, ID, dan alamat dibuat dan hanya sampel baris yang disimpan.',
    internal: 'Sistem internal',
    modulesTitle: 'Dihargai app per app', modulesLead: 'AXTO bukan satu app melainkan platform berisi banyak app. Tiap modul diukur dari repositori dan dihargai sendiri, pada tarif di halaman layanan kami.', thApp: 'App / modul', thLoc: 'Baris', thBuild: 'Nilai build (EUR)',
  },
};

export default async function PortfolioPage() {
  const lang = await getLang();
  const c = pick(lang, COPY);
  const se = localisedSuperEnterprise(lang);
  const t = portfolioTotals();
  const featured = WORKS.filter((w) => w.featured);
  const rest = WORKS.filter((w) => !w.featured);

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

          <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-6 border-t border-slate-200 pt-6 sm:grid-cols-4">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{c.systemsLive}</dt>
              <dd className="mt-1 font-display text-2xl font-extrabold">{t.systems}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{c.linesShipped}</dt>
              <dd className="mt-1 font-display text-2xl font-extrabold">{fmtLoc(t.loc)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{c.routes}</dt>
              <dd className="mt-1 font-display text-2xl font-extrabold">{t.routes}+</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{c.buildValue}</dt>
              <dd className="mt-1 font-display text-2xl font-extrabold">{eur(t.min)}+</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Flagship work */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionHead eyebrow={c.flagshipEyebrow} title={c.flagshipTitle} lead={c.flagshipLead} />
        <div className="mt-10 space-y-6">
          {featured.map((w) => (
            <WorkRow key={w.slug} work={w} c={c} />
          ))}
        </div>
      </section>

      {/* Everything else */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <SectionHead eyebrow={c.alsoEyebrow} title={c.alsoTitle} />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {rest.map((w) => (
            <WorkCard key={w.slug} work={w} c={c} />
          ))}
        </div>
      </section>

      {/* Editorial network */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="panel p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="eyebrow">{c.sitesWord(NETWORK.sites.length)}</p>
              <h2 className="mt-1.5 font-display text-2xl font-extrabold">{NETWORK.name}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-steel-500">{NETWORK.summary}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-extrabold accent-text">
                {eur(NETWORK.priceMin)} – {eur(NETWORK.priceMax)}
              </p>
              <p className="text-xs text-steel-400">{NETWORK.priceNote}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {NETWORK.sites.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                 className="mk-chip transition hover:border-[color:var(--accent)] hover:text-gold-500">
                {s.name} ↗
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Super Enterprise */}
      <section id="super-enterprise" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <div className="panel-dark relative overflow-hidden p-8 sm:p-12">
          <div className="mk-grid-bg absolute inset-0 opacity-20" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <span className="mk-chip">{se.code} · {c.seFlagship}</span>
                <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">{se.name}</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-white/85">{se.summary}</p>
              </div>
              <div className="shrink-0 rounded-xl bg-white/10 p-5 text-center">
                <p className="font-display text-3xl font-extrabold">{se.priceLabel}</p>
                <p className="mt-1 text-xs text-white/70">{c.perProgramme} · {se.timeline}</p>
                <p className="mt-3 border-t border-white/20 pt-3 text-2xl font-extrabold">{se.slots}</p>
                <p className="text-xs text-white/70">{c.engagements}</p>
              </div>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_.6fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">{c.whatCovers}</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {se.includes.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-white/90">
                      <span className="text-white/60">▸</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">{c.builtFor}</p>
                <ul className="mt-4 space-y-2">
                  {se.forWhom.map((f) => (
                    <li key={f} className="text-sm text-white/85">{f}</li>
                  ))}
                </ul>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-white/60">{c.howRuns}</p>
                <ul className="mt-3 space-y-1.5">
                  {se.terms.map((f) => (
                    <li key={f} className="text-xs text-white/75">{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/20 pt-7">
              <Link href="/contact?tier=super-enterprise" className="btn btn-primary">{c.enquire}</Link>
              <Link href="/process" className="btn btn-ghost">{c.howProgramme}</Link>
              <p className="text-xs text-white/70">{c.contractedIn(eur(se.priceEurMin), eur(se.priceEurMax))}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="panel border-l-4 border-l-[color:var(--accent)] p-6">
          <h2 className="font-display text-lg font-extrabold">{c.pricesTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-steel-500">
            {c.pricesBody0}<Link href="/services" className="text-gold-500 underline">{c.pricesLink}</Link>{c.pricesBody1}
          </p>
        </div>
      </section>

      <CtaBand
        title={c.ctaTitle}
        lead={c.ctaLead}
        primary={{ href: '/contact', label: c.ctaPrimary }}
        secondary={{ href: '/services', label: c.ctaSecondary }}
      />
    </>
  );
}

function WorkRow({ work, c }: { work: Work; c: Copy }) {
  return (
    <article className={`premium-card p-7 ${work.stamped ? 'stamped' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-2xl">
          <p className="eyebrow">{work.kind}</p>
          <h3 className="mt-1.5 font-display text-2xl font-extrabold">{work.name}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-steel-500">{work.summary}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-extrabold accent-text">
            {eur(work.priceMin)} – {eur(work.priceMax)}
          </p>
          <p className="text-xs text-steel-400">≈ {usd(work.priceMin)} – {usd(work.priceMax)}</p>
          <p className="mt-1.5 text-xs text-steel-500">{work.packageName}</p>
        </div>
      </div>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {work.highlights.map((h) => (
          <li key={h} className="flex gap-2 text-sm text-steel-500">
            <span className="tick">✓</span>
            <span>{h}</span>
          </li>
        ))}
      </ul>

      {work.modules ? (
        <div className="mt-6 rounded-xl bg-[color:var(--surface)] p-4">
          <p className="font-display text-base font-extrabold">{c.modulesTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-steel-500">{c.modulesLead}</p>
          <div className="mt-3 overflow-x-auto">
            <table className="data-table min-w-[560px]">
              <thead>
                <tr>
                  <th>{c.thApp}</th>
                  <th className="text-right">{c.thLoc}</th>
                  <th className="text-right">{c.thBuild}</th>
                </tr>
              </thead>
              <tbody>
                {work.modules.map((mod) => (
                  <tr key={mod.name}>
                    <td>
                      <span className="font-bold text-ink-900">{mod.name}</span>
                      <span className="block text-xs text-steel-500">{mod.purpose}</span>
                    </td>
                    <td className="whitespace-nowrap text-right text-xs">{fmtLoc(mod.loc)}</td>
                    <td className="whitespace-nowrap text-right font-serif font-extrabold">{eur(mod.priceMin)} – {eur(mod.priceMax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {work.demos ? (
        <div className="relative mt-6 rounded-xl border border-red-200 bg-red-50/40 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="stamp-note">{c.demoStamp}</span>
            <p className="text-xs text-steel-500">{c.demoNoteRow}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {work.demos.map((d) => (
              <a key={d.href} href={d.href} target="_blank" rel="noopener noreferrer"
                 className="btn btn-ghost btn-sm bg-white" title={d.note}>
                {d.label} ↗
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {work.tenants ? (
        <div className="mt-6 rounded-xl bg-[color:var(--surface)] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-steel-400">{c.domainsLine(work.tenants.length)}</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {work.tenants.map((tn) => (
              <a key={tn.domain} href={tn.url} target="_blank" rel="noopener noreferrer"
                 className="mk-chip bg-white transition hover:border-[color:var(--accent)] hover:text-gold-500">
                {tn.domain} <span className="ml-1 font-normal normal-case tracking-normal opacity-60">{tn.note}</span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--line)] pt-5">
        <dl className="flex flex-wrap gap-6 text-xs">
          <div>
            <dt className="font-semibold uppercase tracking-wide text-steel-400">{c.routes}</dt>
            <dd className="mt-0.5 font-display text-base font-extrabold">{work.routes}</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide text-steel-400">{c.lines}</dt>
            <dd className="mt-0.5 font-display text-base font-extrabold">{fmtLoc(work.loc)}</dd>
          </div>
          <div className="max-w-xs">
            <dt className="font-semibold uppercase tracking-wide text-steel-400">{c.stack}</dt>
            <dd className="mt-0.5 text-sm text-steel-500">{work.stack.join(' · ')}</dd>
          </div>
        </dl>
        <WorkLink work={work} c={c} />
      </div>
    </article>
  );
}

function WorkCard({ work, c }: { work: Work; c: Copy }) {
  return (
    <article className={`premium-card flex h-full flex-col p-6 ${work.stamped ? 'stamped' : ''}`}>
      <p className="eyebrow">{work.kind}</p>
      <h3 className="mt-1.5 font-display text-xl font-extrabold">{work.name}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-steel-500">{work.summary}</p>

      <ul className="mt-4 space-y-1.5">
        {work.highlights.slice(0, 4).map((h) => (
          <li key={h} className="flex gap-2 text-sm text-steel-500">
            <span className="tick">✓</span>
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl bg-[color:var(--surface)] p-4">
        <p className="font-display text-lg font-extrabold accent-text">
          {eur(work.priceMin)} – {eur(work.priceMax)}
        </p>
        <p className="text-xs text-steel-400">
          {work.packageName} · {work.routes} {c.routes.toLowerCase()} · {fmtLoc(work.loc)} {c.lines.toLowerCase()}
        </p>
      </div>

      {work.demos ? (
        <div className="relative mt-4 rounded-xl border border-red-200 bg-red-50/40 p-3">
          <span className="stamp-note">{c.demoStamp}</span>
          <p className="mt-2 text-xs leading-relaxed text-steel-500">{c.demoNoteCard}</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {work.demos.map((d) => (
              <a key={d.href} href={d.href} target="_blank" rel="noopener noreferrer"
                 className="btn btn-ghost btn-sm bg-white" title={d.note}>
                {d.label} ↗
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="relative mt-auto flex items-center justify-between gap-3 pt-5">
        <p className="text-xs text-steel-400">{work.stack.slice(0, 3).join(' · ')}</p>
        <WorkLink work={work} c={c} />
      </div>
    </article>
  );
}

function WorkLink({ work, c }: { work: Work; c: Copy }) {
  if (!work.url) {
    return <span className="badge badge-grey">{work.urlPending ?? c.internal}</span>;
  }
  return (
    <a href={work.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
      {work.urlLabel ?? work.url.replace('https://', '')} ↗
    </a>
  );
}
