import Link from 'next/link';
import type { Metadata } from 'next';
import { SETUP_PLANS, eur, priceRange } from '@/content/packages';
import { localisedSetupPlans, localisedCarePlans } from '@/content/packages.i18n';
import { SectionHead, CtaBand } from '@/components/Studio';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Setup & AI Backup / Recovery',
  description:
    'One-time setup from €149, plus an AI backup-and-recovery system installed into your site: one-click daily, weekly and monthly backups, restore, database reset and AI web-fix — self-served on your own AI key. No 24/7 SLA, no monthly retainer.',
  alternates: { canonical: '/care' },
};

type Copy = {
  chip: string; h1a: string; h1b: string; heroLead: string;
  btnSetup: string; btnCare: string;
  setupEyebrow: string; setupTitle: string; setupLead: string;
  whySeparate: string; whySeparateBody: string;
  oneTime: string; addToProject: string;
  careEyebrow: string; careTitle: string; careLead: string;
  install: string; mostChosen: string; upTo: (v: string) => string;
  aiScope: string; backups: string;
  howTitle: string; how: { n: string; t: string; b: string }[];
  opsTitle: string; ops: { t: string; b: string }[];
  notes: { t: string; b: string }[];
  ctaTitle: string; ctaLead: string; ctaPrimary: string; ctaSecondary: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    chip: 'Setup & AI Backup / Recovery',
    h1a: 'Set it up once.', h1b: 'Then your site backs up and repairs itself.',
    heroLead: "There is no 24/7 SLA and no monthly retainer. We install an AI backup-and-recovery system into your site once, at setup. After that you run it yourself from your project portal: back up daily, weekly or monthly, restore to any point, reset (empty) the database, and let an AI repair the site — all one click, all on your own AI API key with our premium repair prompt built in.",
    btnSetup: 'One-time setup', btnCare: 'AI backup & recovery',
    setupEyebrow: 'One-time · paid once', setupTitle: 'Setup service',
    setupLead: 'A single guided session where we configure everything around the build — domain, DNS, SSL, hosting, email, analytics — and install the AI backup-and-recovery system. You keep the accounts, the passwords and the recording.',
    whySeparate: 'Why it is separate',
    whySeparateBody: 'Plenty of clients already have a hosting provider, a domain registrar and an IT person. Charging every client for setup they do not need is how agencies quietly pad a quote. So it sits on its own line: choose it when you open the project, add it later, or never take it at all.',
    oneTime: 'One-time', addToProject: 'Add to a project',
    careEyebrow: 'Installed once · self-served', careTitle: 'AI Backup & Recovery',
    careLead: 'This replaces the old monthly SLA. Instead of paying us to sit on call, you get a system installed into the site that you drive yourself — sized by how much data it has to protect. The ongoing cost is your AI key, not a support contract.',
    install: 'One-time install', mostChosen: 'Most chosen', upTo: (v) => `up to ${v} depending on sites and databases`,
    aiScope: 'AI recovery', backups: 'Backups',
    howTitle: 'How it works',
    how: [
      { n: '1', t: 'We install it at setup', b: 'The backup-and-recovery system is built into your site during the one-time setup, wired to your database and hosting.' },
      { n: '2', t: 'You add your AI API key', b: 'Paste an AI API key into your project portal. It is stored encrypted, and our premium repair-and-recovery prompt is already baked in behind it.' },
      { n: '3', t: 'You click a button', b: 'Back up (daily, weekly, monthly), restore a saved point, reset the database, or run the AI web-fix — from the portal, whenever you need.' },
      { n: '4', t: 'Every action is logged', b: 'Each backup, restore, reset and AI fix is written to your project record — who ran it, when, and the result. Nothing is invisible.' },
    ],
    opsTitle: 'What you can do, any time',
    ops: [
      { t: 'Back up — daily, weekly, monthly', b: 'One click, or on an automatic schedule. Snapshots are kept per your tier and downloadable to keep off-site.' },
      { t: 'Restore (recovery)', b: 'Roll the site and its database back to any saved point. A safety snapshot is taken first, so a restore is never a one-way door.' },
      { t: 'Reset — empty the database', b: 'Wipe the database clean and start fresh — the whole thing, or selected tables — when you want a clean slate.' },
      { t: 'AI web-fix', b: 'When something breaks, the AI repairs the live site on your key, guided by our premium prompt, and records what it changed.' },
    ],
    notes: [
      { t: 'No 24/7 SLA, no retainer', b: 'You are not paying us monthly to be on call. The system is yours after setup, and it runs on your own AI key.' },
      { t: 'Your key, your control', b: 'The AI runs on the API key you provide. Use it, rotate it or remove it whenever you like — nothing runs without it.' },
      { t: 'Recorded and auditable', b: 'Every backup, restore, reset and repair is logged on the project, exportable if you ever need to show what happened.' },
    ],
    ctaTitle: 'Add setup or AI backup & recovery to a project',
    ctaLead: 'Both can be selected when you open a project, or added at any point afterwards. Neither is required to work with us.',
    ctaPrimary: 'Open a project', ctaSecondary: 'See build packages',
  },
  es: {
    chip: 'Puesta en marcha y backup/recuperación IA',
    h1a: 'Configúralo una vez.', h1b: 'Luego tu sitio se respalda y se repara solo.',
    heroLead: 'No hay SLA 24/7 ni retención mensual. Instalamos un sistema de backup y recuperación con IA en tu sitio una vez, en la puesta en marcha. Después lo gestionas tú desde tu portal: respalda a diario, semanal o mensual, restaura a cualquier punto, vacía (resetea) la base de datos y deja que una IA repare el sitio — todo con un clic, sobre tu propia API key de IA con nuestro prompt premium de reparación integrado.',
    btnSetup: 'Puesta en marcha', btnCare: 'Backup y recuperación IA',
    setupEyebrow: 'Única vez · se paga una vez', setupTitle: 'Servicio de puesta en marcha',
    setupLead: 'Una sola sesión guiada donde configuramos todo lo que rodea al desarrollo — dominio, DNS, SSL, hosting, correo, analítica — e instalamos el sistema de backup y recuperación con IA. Te quedas con las cuentas, las contraseñas y la grabación.',
    whySeparate: 'Por qué va aparte',
    whySeparateBody: 'Muchos clientes ya tienen proveedor de hosting, registrador de dominio y una persona de IT. Cobrar a todos por una puesta en marcha que no necesitan es como las agencias inflan un presupuesto. Por eso va en su propia línea: elígela al abrir el proyecto, añádela después, o no la tomes nunca.',
    oneTime: 'Única vez', addToProject: 'Añadir a un proyecto',
    careEyebrow: 'Instalado una vez · autogestionado', careTitle: 'Backup y Recuperación con IA',
    careLead: 'Esto reemplaza el antiguo SLA mensual. En vez de pagarnos por estar de guardia, obtienes un sistema instalado en el sitio que gestionas tú mismo — dimensionado por cuántos datos debe proteger. El coste continuo es tu API key de IA, no un contrato de soporte.',
    install: 'Instalación única', mostChosen: 'El más elegido', upTo: (v) => `hasta ${v} según sitios y bases de datos`,
    aiScope: 'Recuperación IA', backups: 'Backups',
    howTitle: 'Cómo funciona',
    how: [
      { n: '1', t: 'Lo instalamos en la puesta en marcha', b: 'El sistema de backup y recuperación se integra en tu sitio durante la puesta en marcha única, conectado a tu base de datos y hosting.' },
      { n: '2', t: 'Añades tu API key de IA', b: 'Pega una API key de IA en tu portal de proyecto. Se guarda cifrada, y nuestro prompt premium de reparación y recuperación ya está integrado detrás.' },
      { n: '3', t: 'Haces clic en un botón', b: 'Respalda (diario, semanal, mensual), restaura un punto guardado, resetea la base de datos o ejecuta el web-fix con IA — desde el portal, cuando lo necesites.' },
      { n: '4', t: 'Cada acción queda registrada', b: 'Cada backup, restauración, reseteo y reparación con IA se escribe en el registro de tu proyecto — quién lo ejecutó, cuándo y el resultado. Nada es invisible.' },
    ],
    opsTitle: 'Lo que puedes hacer, cuando quieras',
    ops: [
      { t: 'Respaldar — diario, semanal, mensual', b: 'Un clic, o en un horario automático. Las copias se conservan según tu nivel y se pueden descargar para guardar fuera del sitio.' },
      { t: 'Restaurar (recuperación)', b: 'Devuelve el sitio y su base de datos a cualquier punto guardado. Primero se toma una copia de seguridad, así una restauración nunca es una puerta de un solo sentido.' },
      { t: 'Resetear — vaciar la base de datos', b: 'Deja la base de datos limpia y empieza de cero — todo, o tablas seleccionadas — cuando quieras un borrón y cuenta nueva.' },
      { t: 'Web-fix con IA', b: 'Cuando algo se rompe, la IA repara el sitio en vivo con tu key, guiada por nuestro prompt premium, y registra lo que cambió.' },
    ],
    notes: [
      { t: 'Sin SLA 24/7, sin retención', b: 'No nos pagas cada mes por estar de guardia. El sistema es tuyo tras la puesta en marcha, y funciona con tu propia API key de IA.' },
      { t: 'Tu key, tu control', b: 'La IA funciona con la API key que tú proporcionas. Úsala, rótala o quítala cuando quieras — nada se ejecuta sin ella.' },
      { t: 'Registrado y auditable', b: 'Cada backup, restauración, reseteo y reparación queda registrado en el proyecto, exportable si alguna vez necesitas mostrar qué pasó.' },
    ],
    ctaTitle: 'Añade puesta en marcha o backup/recuperación IA a un proyecto',
    ctaLead: 'Ambos se pueden elegir al abrir un proyecto, o añadir en cualquier momento después. Ninguno es obligatorio para trabajar con nosotros.',
    ctaPrimary: 'Abrir un proyecto', ctaSecondary: 'Ver paquetes',
  },
  id: {
    chip: 'Setup & Backup/Recovery AI',
    h1a: 'Pasang sekali.', h1b: 'Lalu situs Anda mem-backup dan memperbaiki dirinya sendiri.',
    heroLead: 'Tidak ada SLA 24/7 dan tidak ada biaya bulanan. Kami memasang sistem backup dan recovery AI ke situs Anda sekali, saat setup. Setelah itu Anda menjalankannya sendiri dari portal proyek: backup harian, mingguan, atau bulanan, restore ke titik mana pun, mengosongkan (reset) database, dan membiarkan AI memperbaiki situs — semua satu klik, semua di atas API key AI Anda sendiri dengan prompt perbaikan premium kami tertanam di dalamnya.',
    btnSetup: 'Setup sekali bayar', btnCare: 'Backup & recovery AI',
    setupEyebrow: 'Sekali bayar', setupTitle: 'Layanan setup',
    setupLead: 'Satu sesi terpandu di mana kami mengonfigurasi semua yang mengelilingi pembuatan — domain, DNS, SSL, hosting, email, analitik — dan memasang sistem backup dan recovery AI. Anda menyimpan akun, kata sandi, dan rekamannya.',
    whySeparate: 'Kenapa terpisah',
    whySeparateBody: 'Banyak klien sudah punya penyedia hosting, registrar domain, dan orang IT. Menagih setiap klien untuk setup yang tak mereka butuhkan adalah cara agensi diam-diam menggelembungkan penawaran. Maka ini berdiri sendiri: pilih saat membuka proyek, tambahkan nanti, atau tidak sama sekali.',
    oneTime: 'Sekali bayar', addToProject: 'Tambahkan ke proyek',
    careEyebrow: 'Dipasang sekali · dijalankan sendiri', careTitle: 'Backup & Recovery AI',
    careLead: 'Ini menggantikan SLA bulanan yang lama. Alih-alih membayar kami untuk siaga, Anda mendapat sistem yang terpasang di situs dan Anda kendalikan sendiri — diukur dari seberapa banyak data yang harus dilindungi. Biaya berjalannya adalah API key AI Anda, bukan kontrak dukungan.',
    install: 'Pasang sekali', mostChosen: 'Paling dipilih', upTo: (v) => `hingga ${v} tergantung situs dan database`,
    aiScope: 'Recovery AI', backups: 'Backup',
    howTitle: 'Cara kerjanya',
    how: [
      { n: '1', t: 'Kami pasang saat setup', b: 'Sistem backup dan recovery dibangun ke dalam situs Anda selama setup sekali bayar, terhubung ke database dan hosting Anda.' },
      { n: '2', t: 'Anda masukkan API key AI', b: 'Tempel API key AI ke portal proyek Anda. Disimpan terenkripsi, dan prompt perbaikan-dan-recovery premium kami sudah tertanam di belakangnya.' },
      { n: '3', t: 'Anda klik tombol', b: 'Backup (harian, mingguan, bulanan), restore titik tersimpan, reset database, atau jalankan web-fix AI — dari portal, kapan pun Anda butuh.' },
      { n: '4', t: 'Tiap aksi tercatat', b: 'Tiap backup, restore, reset, dan perbaikan AI ditulis ke catatan proyek Anda — siapa yang menjalankan, kapan, dan hasilnya. Tak ada yang tersembunyi.' },
    ],
    opsTitle: 'Yang bisa Anda lakukan, kapan saja',
    ops: [
      { t: 'Backup — harian, mingguan, bulanan', b: 'Satu klik, atau pada jadwal otomatis. Snapshot disimpan sesuai tingkat Anda dan bisa diunduh untuk disimpan di luar.' },
      { t: 'Restore (recovery)', b: 'Kembalikan situs dan database-nya ke titik tersimpan mana pun. Snapshot pengaman diambil dulu, jadi restore tak pernah jadi pintu satu arah.' },
      { t: 'Reset — kosongkan database', b: 'Bersihkan database dan mulai dari awal — seluruhnya, atau tabel terpilih — saat Anda ingin lembaran baru.' },
      { t: 'Web-fix AI', b: 'Saat ada yang rusak, AI memperbaiki situs langsung di atas key Anda, dipandu prompt premium kami, dan mencatat apa yang diubahnya.' },
    ],
    notes: [
      { t: 'Tanpa SLA 24/7, tanpa biaya bulanan', b: 'Anda tak membayar kami tiap bulan untuk siaga. Sistemnya milik Anda setelah setup, dan berjalan di atas API key AI Anda sendiri.' },
      { t: 'Key Anda, kendali Anda', b: 'AI berjalan di atas API key yang Anda berikan. Pakai, ganti, atau cabut kapan saja — tak ada yang berjalan tanpanya.' },
      { t: 'Tercatat dan dapat diaudit', b: 'Tiap backup, restore, reset, dan perbaikan tercatat di proyek, bisa diekspor bila suatu saat Anda perlu menunjukkan apa yang terjadi.' },
    ],
    ctaTitle: 'Tambahkan setup atau backup/recovery AI ke proyek',
    ctaLead: 'Keduanya bisa dipilih saat membuka proyek, atau ditambah kapan saja setelahnya. Tak satu pun wajib untuk bekerja dengan kami.',
    ctaPrimary: 'Buka proyek', ctaSecondary: 'Lihat paket pembuatan',
  },
};

export default async function CarePage() {
  const lang = await getLang();
  const c = pick(lang, COPY);
  const setupPlans = localisedSetupPlans(lang);
  const carePlans = localisedCarePlans(lang);
  void SETUP_PLANS;
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
            <a href="#recovery" className="btn btn-ghost">{c.btnCare}</a>
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
          {setupPlans.map((s) => (
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

      {/* ───────── AI Backup & Recovery ───────── */}
      <section id="recovery" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <SectionHead eyebrow={c.careEyebrow} title={c.careTitle} lead={c.careLead} />

        {/* How it works */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.how.map((s) => (
            <div key={s.n} className="premium-card p-5">
              <span className="font-display text-2xl font-extrabold accent-text">{s.n}</span>
              <p className="mt-2 text-sm font-bold">{s.t}</p>
              <p className="mt-1 text-xs leading-relaxed text-steel-500">{s.b}</p>
            </div>
          ))}
        </div>

        {/* What you can do */}
        <div className="mt-10">
          <h3 className="font-display text-xl font-extrabold">{c.opsTitle}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {c.ops.map((o) => (
              <div key={o.t} className="panel p-5">
                <h4 className="font-bold">{o.t}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-steel-500">{o.b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Install tiers */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {carePlans.map((plan) => (
            <article key={plan.slug} className={`premium-card flex h-full flex-col p-6 ${plan.popular ? 'ring-2 ring-[color:var(--accent)]' : ''}`}>
              {plan.popular ? <span className="badge badge-blue absolute right-4 top-4">{c.mostChosen}</span> : null}
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-steel-500">{c.install}</p>
              <h3 className="mt-1 font-display text-lg font-extrabold">{plan.name}</h3>
              <p className="mt-3 font-display text-3xl font-extrabold accent-text">
                {plan.custom ? `from ${eur(plan.price)}` : eur(plan.price)}
              </p>
              {plan.priceMax ? <p className="text-xs text-steel-500">{c.upTo(eur(plan.priceMax))}</p> : null}
              <p className="mt-3 text-sm leading-relaxed text-steel-500">{plan.blurb}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-ivory-100/60 p-3 text-xs">
                <div>
                  <dt className="font-bold uppercase text-steel-500">{c.backups}</dt>
                  <dd className="mt-0.5 font-semibold">{plan.response}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase text-steel-500">{c.aiScope}</dt>
                  <dd className="mt-0.5 font-semibold">{plan.hours}</dd>
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

      <CtaBand
        title={c.ctaTitle}
        lead={c.ctaLead}
        primary={{ href: '/portal/new', label: c.ctaPrimary }}
        secondary={{ href: '/services', label: c.ctaSecondary }}
      />
    </>
  );
}
