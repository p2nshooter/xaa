import Link from 'next/link';
import type { Metadata } from 'next';
import { SETUP_PLANS, CARE_PLANS, eur, priceRange } from '@/content/packages';
import { SectionHead, CtaBand } from '@/components/Studio';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Setup & Care',
  description:
    'One-time setup from €149 and monthly maintenance plans from €99 — priced separately from the build, so you only pay for the help you actually want.',
  alternates: { canonical: '/care' },
};

type Copy = {
  chip: string; h1a: string; h1b: string; heroLead: string;
  btnSetup: string; btnCare: string;
  setupEyebrow: string; setupTitle: string; setupLead: string;
  whySeparate: string; whySeparateBody: string;
  oneTime: string; addToProject: string;
  careEyebrow: string; careTitle: string; careLead: string;
  monthly: string; mostChosen: string; upTo: (v: string) => string;
  includedTime: string; response: string;
  notes: { t: string; b: string }[];
  cmpPlan: string; cmpMonthly: string; cmpDev: string; cmpResponse: string; cmpPaired: string;
  cmpRows: { name: string; dev: string; resp: string; paired: string }[];
  ctaTitle: string; ctaLead: string; ctaPrimary: string; ctaSecondary: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    chip: 'Setup & Care',
    h1a: 'Getting you live is one service.', h1b: 'Keeping you live is another.',
    heroLead: "Both are priced separately from the build, and both are optional. Take the setup once and run the site yourself; take a care plan and never think about an update again. Care plans are month to month — cancel with 30 days' notice, and everything still belongs to you.",
    btnSetup: 'One-time setup', btnCare: 'Monthly care plans',
    setupEyebrow: 'One-time · paid once', setupTitle: 'Setup service',
    setupLead: 'A single guided session where we configure everything around the build and hand it over. You keep the accounts, the passwords and the recording.',
    whySeparate: 'Why it is separate',
    whySeparateBody: 'Plenty of clients already have a hosting provider, a domain registrar and an IT person. Charging every client for setup they do not need is how agencies quietly pad a quote. So it sits on its own line: choose it when you open the project, add it later, or never take it at all.',
    oneTime: 'One-time', addToProject: 'Add to a project',
    careEyebrow: 'Monthly · cancel any month', careTitle: 'Care plans',
    careLead: 'Software rots if nobody touches it. A care plan covers the patching, backups, monitoring and small changes that keep a site fast, secure and current — plus a block of development hours each month that roll nowhere but get used.',
    monthly: 'Monthly', mostChosen: 'Most chosen', upTo: (v) => `up to ${v}/mo depending on scale and SLA`,
    includedTime: 'Included time', response: 'Response',
    notes: [
      { t: 'Billed monthly, in advance', b: 'Invoiced in EUR, payable in USDT or PayPal like everything else. The first month starts at handover, not at order.' },
      { t: 'Hours are real hours', b: 'Your monthly allowance covers content changes, small features and fixes. We log what was used and show it on the invoice.' },
      { t: 'No lock-in', b: 'Cancel with 30 days notice. You keep the code, the accounts and the data — a care plan buys attention, not custody.' },
    ],
    cmpPlan: 'Care plan', cmpMonthly: 'Monthly', cmpDev: 'Dev time', cmpResponse: 'Response', cmpPaired: 'Best paired with',
    cmpRows: [
      { name: 'Essential', dev: '2 h', resp: '2 business days', paired: 'Landing page · Portfolio' },
      { name: 'Growth', dev: '6 h', resp: '1 business day', paired: 'Company profile' },
      { name: 'Business', dev: '16 h', resp: '4 business hours', paired: 'Corporate · Platform · E-commerce' },
      { name: 'Enterprise', dev: 'Dedicated', resp: '1 hour, 24/7 SLA', paired: 'Marketplace · SaaS · Enterprise' },
    ],
    ctaTitle: 'Add setup or care to a project',
    ctaLead: 'Both can be selected when you open a project, or added at any point afterwards. Neither is required to work with us.',
    ctaPrimary: 'Open a project', ctaSecondary: 'See build packages',
  },
  es: {
    chip: 'Puesta en marcha y mantenimiento',
    h1a: 'Ponerte en marcha es un servicio.', h1b: 'Mantenerte en marcha es otro.',
    heroLead: 'Ambos se cobran aparte del desarrollo, y ambos son opcionales. Contrata la puesta en marcha una vez y gestiona el sitio tú mismo; contrata un plan de mantenimiento y no vuelvas a pensar en una actualización. Los planes son mes a mes — cancela con 30 días de aviso, y todo sigue siendo tuyo.',
    btnSetup: 'Puesta en marcha', btnCare: 'Planes mensuales',
    setupEyebrow: 'Única vez · se paga una vez', setupTitle: 'Servicio de puesta en marcha',
    setupLead: 'Una sola sesión guiada donde configuramos todo lo que rodea al desarrollo y te lo entregamos. Te quedas con las cuentas, las contraseñas y la grabación.',
    whySeparate: 'Por qué va aparte',
    whySeparateBody: 'Muchos clientes ya tienen proveedor de hosting, registrador de dominio y una persona de IT. Cobrar a todos por una puesta en marcha que no necesitan es como las agencias inflan un presupuesto sin decirlo. Por eso va en su propia línea: elígela al abrir el proyecto, añádela después, o no la tomes nunca.',
    oneTime: 'Única vez', addToProject: 'Añadir a un proyecto',
    careEyebrow: 'Mensual · cancela cualquier mes', careTitle: 'Planes de mantenimiento',
    careLead: 'El software se pudre si nadie lo toca. Un plan de mantenimiento cubre los parches, copias de seguridad, monitorización y pequeños cambios que mantienen un sitio rápido, seguro y al día — más un bloque de horas de desarrollo cada mes que no se acumulan pero sí se usan.',
    monthly: 'Mensual', mostChosen: 'El más elegido', upTo: (v) => `hasta ${v}/mes según escala y SLA`,
    includedTime: 'Tiempo incluido', response: 'Respuesta',
    notes: [
      { t: 'Facturado mensualmente, por adelantado', b: 'Facturado en EUR, pagadero en USDT o PayPal como todo lo demás. El primer mes empieza en la entrega, no en el pedido.' },
      { t: 'Las horas son horas reales', b: 'Tu bolsa mensual cubre cambios de contenido, pequeñas funciones y arreglos. Registramos lo usado y lo mostramos en la factura.' },
      { t: 'Sin permanencia', b: 'Cancela con 30 días de aviso. Te quedas con el código, las cuentas y los datos — un plan compra atención, no custodia.' },
    ],
    cmpPlan: 'Plan', cmpMonthly: 'Mensual', cmpDev: 'Horas dev', cmpResponse: 'Respuesta', cmpPaired: 'Mejor combina con',
    cmpRows: [
      { name: 'Essential', dev: '2 h', resp: '2 días hábiles', paired: 'Landing · Portafolio' },
      { name: 'Growth', dev: '6 h', resp: '1 día hábil', paired: 'Perfil de empresa' },
      { name: 'Business', dev: '16 h', resp: '4 horas hábiles', paired: 'Corporativo · Plataforma · E-commerce' },
      { name: 'Enterprise', dev: 'Dedicado', resp: '1 hora, SLA 24/7', paired: 'Marketplace · SaaS · Enterprise' },
    ],
    ctaTitle: 'Añade puesta en marcha o mantenimiento a un proyecto',
    ctaLead: 'Ambos se pueden elegir al abrir un proyecto, o añadir en cualquier momento después. Ninguno es obligatorio para trabajar con nosotros.',
    ctaPrimary: 'Abrir un proyecto', ctaSecondary: 'Ver paquetes',
  },
  id: {
    chip: 'Setup & Perawatan',
    h1a: 'Membuat Anda online adalah satu layanan.', h1b: 'Menjaga Anda online adalah layanan lain.',
    heroLead: 'Keduanya dihitung terpisah dari pembuatan, dan keduanya opsional. Ambil setup sekali dan jalankan situs sendiri; ambil paket perawatan dan tak perlu memikirkan pembaruan lagi. Paket perawatan bersifat bulanan — batalkan dengan pemberitahuan 30 hari, dan semuanya tetap milik Anda.',
    btnSetup: 'Setup sekali bayar', btnCare: 'Paket perawatan bulanan',
    setupEyebrow: 'Sekali bayar', setupTitle: 'Layanan setup',
    setupLead: 'Satu sesi terpandu di mana kami mengonfigurasi semua yang mengelilingi pembuatan dan menyerahkannya. Anda menyimpan akun, kata sandi, dan rekamannya.',
    whySeparate: 'Kenapa terpisah',
    whySeparateBody: 'Banyak klien sudah punya penyedia hosting, registrar domain, dan orang IT. Menagih setiap klien untuk setup yang tak mereka butuhkan adalah cara agensi diam-diam menggelembungkan penawaran. Maka ini berdiri sendiri: pilih saat membuka proyek, tambahkan nanti, atau tidak sama sekali.',
    oneTime: 'Sekali bayar', addToProject: 'Tambahkan ke proyek',
    careEyebrow: 'Bulanan · batalkan kapan saja', careTitle: 'Paket perawatan',
    careLead: 'Software lapuk bila tak ada yang menyentuhnya. Paket perawatan mencakup patching, backup, monitoring, dan perubahan kecil yang menjaga situs tetap cepat, aman, dan terkini — plus blok jam pengembangan tiap bulan yang tak diakumulasi tapi terpakai.',
    monthly: 'Bulanan', mostChosen: 'Paling dipilih', upTo: (v) => `hingga ${v}/bulan tergantung skala dan SLA`,
    includedTime: 'Waktu termasuk', response: 'Respons',
    notes: [
      { t: 'Ditagih bulanan, di muka', b: 'Ditagih dalam EUR, dibayar via USDT atau PayPal seperti lainnya. Bulan pertama mulai saat serah terima, bukan saat memesan.' },
      { t: 'Jam adalah jam nyata', b: 'Jatah bulanan Anda mencakup perubahan konten, fitur kecil, dan perbaikan. Kami catat yang terpakai dan tampilkan di faktur.' },
      { t: 'Tanpa ikatan', b: 'Batalkan dengan pemberitahuan 30 hari. Anda menyimpan kode, akun, dan data — paket perawatan membeli perhatian, bukan hak asuh.' },
    ],
    cmpPlan: 'Paket', cmpMonthly: 'Bulanan', cmpDev: 'Jam dev', cmpResponse: 'Respons', cmpPaired: 'Paling cocok dengan',
    cmpRows: [
      { name: 'Essential', dev: '2 j', resp: '2 hari kerja', paired: 'Landing · Portofolio' },
      { name: 'Growth', dev: '6 j', resp: '1 hari kerja', paired: 'Profil perusahaan' },
      { name: 'Business', dev: '16 j', resp: '4 jam kerja', paired: 'Korporat · Platform · E-commerce' },
      { name: 'Enterprise', dev: 'Khusus', resp: '1 jam, SLA 24/7', paired: 'Marketplace · SaaS · Enterprise' },
    ],
    ctaTitle: 'Tambahkan setup atau perawatan ke proyek',
    ctaLead: 'Keduanya bisa dipilih saat membuka proyek, atau ditambah kapan saja setelahnya. Tak satu pun wajib untuk bekerja dengan kami.',
    ctaPrimary: 'Buka proyek', ctaSecondary: 'Lihat paket pembuatan',
  },
};

export default async function CarePage() {
  const c = pick(await getLang(), COPY);
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
            <a href="#setup" className="btn btn-primary">{c.btnSetup}</a>
            <a href="#maintenance" className="btn btn-ghost">{c.btnCare}</a>
          </div>
        </div>
      </section>

      {/* ───────── Setup ───────── */}
      <section id="setup" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <SectionHead eyebrow={c.setupEyebrow} title={c.setupTitle} lead={c.setupLead} />

        <div className="mt-8 panel p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-steel-500">{c.whySeparate}</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-steel-500">{c.whySeparateBody}</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SETUP_PLANS.map((s) => (
            <article key={s.slug} className="premium-card flex h-full flex-col p-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-steel-500">{c.oneTime}</p>
              <h3 className="mt-1 font-display text-xl font-extrabold">{s.name}</h3>
              <p className="mt-3 font-display text-2xl font-extrabold accent-text">
                {s.custom ? `from ${eur(s.price)}` : priceRange(s.price, s.priceMax ?? s.price)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-steel-500">{s.blurb}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {s.includes.map((f) => (
                  <li key={f} className="flex gap-2"><span className="tick mt-0.5">✓</span><span>{f}</span></li>
                ))}
              </ul>
              <Link href={`/portal/new?setup=${s.slug}`} className="btn btn-ghost btn-sm mt-auto pt-2">{c.addToProject}</Link>
            </article>
          ))}
        </div>
      </section>

      {/* ───────── Care ───────── */}
      <section id="maintenance" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <SectionHead eyebrow={c.careEyebrow} title={c.careTitle} lead={c.careLead} />

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {CARE_PLANS.map((plan) => (
            <article key={plan.slug} className={`premium-card flex h-full flex-col p-6 ${plan.popular ? 'ring-2 ring-[color:var(--accent)]' : ''}`}>
              {plan.popular ? <span className="badge badge-blue absolute right-4 top-4">{c.mostChosen}</span> : null}
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-steel-500">{c.monthly}</p>
              <h3 className="mt-1 font-display text-xl font-extrabold">{plan.name}</h3>
              <p className="mt-3 font-display text-3xl font-extrabold accent-text">
                {plan.custom ? `from ${eur(plan.price)}` : eur(plan.price)}
                <span className="text-sm font-normal text-steel-500">/mo</span>
              </p>
              {plan.priceMax ? <p className="text-xs text-steel-500">{c.upTo(eur(plan.priceMax))}</p> : null}
              <p className="mt-3 text-sm leading-relaxed text-steel-500">{plan.blurb}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-ivory-100/60 p-3 text-xs">
                <div>
                  <dt className="font-bold uppercase text-steel-500">{c.includedTime}</dt>
                  <dd className="mt-0.5 font-semibold">{plan.hours}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase text-steel-500">{c.response}</dt>
                  <dd className="mt-0.5 font-semibold">{plan.response}</dd>
                </div>
              </dl>
              <ul className="mt-4 space-y-1.5 text-sm">
                {plan.includes.map((f) => (
                  <li key={f} className="flex gap-2"><span className="tick mt-0.5">✓</span><span>{f}</span></li>
                ))}
              </ul>
              <Link href={`/portal/new?care=${plan.slug}`} className="btn btn-ghost btn-sm mt-auto pt-2">{c.addToProject}</Link>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {c.notes.map((x) => (
            <div key={x.t} className="panel p-5">
              <h3 className="font-bold">{x.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-500">{x.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="panel overflow-x-auto p-2">
          <table className="data-table min-w-[640px]">
            <thead>
              <tr>
                <th>{c.cmpPlan}</th>
                <th>{c.cmpMonthly}</th>
                <th>{c.cmpDev}</th>
                <th>{c.cmpResponse}</th>
                <th>{c.cmpPaired}</th>
              </tr>
            </thead>
            <tbody>
              {c.cmpRows.map((r, i) => (
                <tr key={r.name}>
                  <td className="font-bold">{r.name}</td>
                  <td>{i === 3 ? `from ${eur(2500)}` : eur([99, 299, 749][i]!)}</td>
                  <td>{r.dev}</td>
                  <td>{r.resp}</td>
                  <td>{r.paired}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <CtaBand
        title={c.ctaTitle}
        lead={c.ctaLead}
        primary={{ href: '/portal/new', label: c.ctaPrimary }}
        secondary={{ href: '/services', label: c.ctaSecondary }}
      />
    </>
  );
}
