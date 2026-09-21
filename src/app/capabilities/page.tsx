import type { Metadata } from 'next';
import { SectionHead, CtaBand } from '@/components/Studio';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Capabilities & stack',
  description:
    'What XAA builds with and how: modern web frameworks, edge deployment, relational data, payments, security and AI integration — and the engineering standards every build is held to.',
  alternates: { canonical: '/capabilities' },
};

// Stack items keep their product/framework names in every language; only the
// area label and any descriptive phrase is localised.
type Stack = { area: string; items: string[] };
type Copy = {
  chip: string; h1a: string; h1b: string; heroLead: string;
  stackEyebrow: string; stackTitle: string; stackLead: string;
  stack: Stack[];
  stdEyebrow: string; stdTitle: string; standards: { t: string; b: string }[];
  indTitle: string; indLead: string; industries: string[];
  noEyebrow: string; noTitle: string; noLead: string; wontDo: { t: string; b: string }[];
  ctaTitle: string; ctaLead: string; ctaPrimary: string; ctaSecondary: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    chip: 'Capabilities',
    h1a: 'The same engineering standard', h1b: 'at every price point',
    heroLead: 'A landing page and an enterprise platform differ in scope, not in craft. Both are typed, reviewed, tested, monitored and documented — because the cheap build is usually the one a business grows out of fastest, and it should be ready when that happens.',
    stackEyebrow: 'Stack', stackTitle: 'What we build with',
    stackLead: 'Chosen per project from this set. We do not start every brief with the same framework and call it a strategy.',
    stack: [
      { area: 'Front end', items: ['React & Next.js', 'TypeScript', 'Tailwind CSS', 'Design systems & component libraries', 'Accessibility (WCAG 2.2 AA)', 'Core Web Vitals budgets'] },
      { area: 'Back end', items: ['Node.js & edge runtimes', 'REST and typed RPC APIs', 'Background jobs & schedulers', 'Webhooks and event handling', 'Caching strategies', 'Rate limiting & abuse control'] },
      { area: 'Data', items: ['PostgreSQL / MySQL', 'SQLite & D1 at the edge', 'Redis & KV caching', 'Object storage (S3 / R2)', 'Search indexing', 'Migrations, backups & restore drills'] },
      { area: 'Infrastructure', items: ['Cloudflare, Vercel, AWS', 'Containers & Kubernetes', 'Infrastructure as code', 'CI/CD with preview environments', 'CDN & global edge delivery', 'Monitoring, logging & alerting'] },
      { area: 'Commerce & payments', items: ['Stripe, Adyen, Mollie, PayPal', 'Crypto settlement (USDT)', 'Subscriptions & usage billing', 'Tax / VAT handling', 'Invoicing & reconciliation', 'Shipping & carrier APIs'] },
      { area: 'Security', items: ['SSO, OAuth2 & OIDC', 'MFA and session hardening', 'RBAC & permission modelling', 'Encryption at rest and in transit', 'Audit logging', 'Dependency & configuration scanning'] },
      { area: 'AI', items: ['Assistants over your own data', 'Retrieval pipelines', 'Document extraction & classification', 'Recommendation & ranking', 'Workflow automation', 'Evaluation and guardrails'] },
      { area: 'Growth', items: ['Technical SEO & schema', 'Analytics & conversion tracking', 'A/B testing', 'Email & lifecycle automation', 'Performance tuning', 'Migration without losing rankings'] },
    ],
    stdEyebrow: 'Standards', stdTitle: 'What holds on every project',
    standards: [
      { t: 'Typed end to end', b: 'TypeScript across the stack with a shared model layer. If the data shape changes, the build tells us before the client does.' },
      { t: 'Reviewed, not just written', b: 'Every change goes through review and automated checks. Nothing reaches production because one person was confident on a Friday.' },
      { t: 'Deployed continuously', b: 'Preview environment per change, staging before production, and a rollback that takes a minute rather than an evening.' },
      { t: 'Measured in the open', b: 'Performance budgets, error tracking and uptime monitoring from day one, with the numbers visible to you, not just to us.' },
      { t: 'Documented for the next person', b: 'A runbook, an architecture note and an admin guide come with the handover — including the parts you would hire someone else to change.' },
      { t: 'Owned by you', b: 'Repositories, design files, cloud accounts and domains are transferred at handover. No hostage infrastructure, ever.' },
    ],
    indTitle: 'Industries we work in',
    indLead: 'Sector experience matters less than people pretend — but it does shape the questions we know to ask early.',
    industries: ['Professional services', 'Retail & D2C', 'B2B wholesale', 'Hospitality', 'Healthcare & clinics', 'Education & training', 'Real estate', 'Logistics', 'Manufacturing', 'Financial services', 'Travel', 'Media & publishing', 'Non-profit', 'Public sector', 'Technology & SaaS'],
    noEyebrow: 'Honest answer', noTitle: 'What we will not do',
    noLead: 'Saying yes to everything is how studios miss dates. These are the jobs we turn down, and we will tell you on the first call.',
    wontDo: [
      { t: 'A platform with no owner on your side', b: 'Every build needs one person who can decide. Without that, scope drifts and the date goes with it.' },
      { t: 'Rescue work we cannot inspect', b: 'We will happily take over an existing codebase — after a paid audit. Committing to fix code sight-unseen helps nobody.' },
      { t: 'Guaranteed search rankings', b: 'We build sites that rank well and we do the technical work properly. Anyone promising position one is selling something else.' },
      { t: 'Grey-area products', b: 'No systems whose purpose is to deceive users, harvest data without consent, or evade regulation in the market they operate in.' },
    ],
    ctaTitle: 'Tell us what you need built',
    ctaLead: 'Send the brief and we will come back with the package it fits, a realistic number, and what we would cut from version one.',
    ctaPrimary: 'Send a brief', ctaSecondary: 'Browse packages',
  },
  es: {
    chip: 'Capacidades',
    h1a: 'El mismo estándar de ingeniería', h1b: 'en cada nivel de precio',
    heroLead: 'Una landing y una plataforma empresarial difieren en alcance, no en oficio. Ambas están tipadas, revisadas, probadas, monitorizadas y documentadas — porque el desarrollo barato suele ser el que un negocio supera más rápido, y debe estar listo cuando eso ocurra.',
    stackEyebrow: 'Tecnología', stackTitle: 'Con qué construimos',
    stackLead: 'Elegido por proyecto de este conjunto. No empezamos cada brief con el mismo framework y lo llamamos estrategia.',
    stack: [
      { area: 'Front end', items: ['React & Next.js', 'TypeScript', 'Tailwind CSS', 'Sistemas de diseño y librerías de componentes', 'Accesibilidad (WCAG 2.2 AA)', 'Presupuestos de Core Web Vitals'] },
      { area: 'Back end', items: ['Node.js y runtimes en el edge', 'APIs REST y RPC tipadas', 'Trabajos en segundo plano y programadores', 'Webhooks y manejo de eventos', 'Estrategias de caché', 'Limitación de tasa y control de abuso'] },
      { area: 'Datos', items: ['PostgreSQL / MySQL', 'SQLite y D1 en el edge', 'Caché Redis y KV', 'Almacenamiento de objetos (S3 / R2)', 'Indexación de búsqueda', 'Migraciones, backups y simulacros de restauración'] },
      { area: 'Infraestructura', items: ['Cloudflare, Vercel, AWS', 'Contenedores y Kubernetes', 'Infraestructura como código', 'CI/CD con entornos de vista previa', 'CDN y entrega global en el edge', 'Monitorización, logging y alertas'] },
      { area: 'Comercio y pagos', items: ['Stripe, Adyen, Mollie, PayPal', 'Liquidación en cripto (USDT)', 'Suscripciones y facturación por uso', 'Gestión de impuestos / IVA', 'Facturación y conciliación', 'APIs de envío y transportistas'] },
      { area: 'Seguridad', items: ['SSO, OAuth2 y OIDC', 'MFA y endurecimiento de sesión', 'RBAC y modelado de permisos', 'Cifrado en reposo y en tránsito', 'Registro de auditoría', 'Escaneo de dependencias y configuración'] },
      { area: 'IA', items: ['Asistentes sobre tus propios datos', 'Pipelines de recuperación', 'Extracción y clasificación de documentos', 'Recomendación y ranking', 'Automatización de flujos', 'Evaluación y guardarraíles'] },
      { area: 'Crecimiento', items: ['SEO técnico y schema', 'Analítica y seguimiento de conversión', 'Tests A/B', 'Automatización de email y ciclo de vida', 'Ajuste de rendimiento', 'Migración sin perder posiciones'] },
    ],
    stdEyebrow: 'Estándares', stdTitle: 'Lo que se cumple en cada proyecto',
    standards: [
      { t: 'Tipado de extremo a extremo', b: 'TypeScript en toda la pila con una capa de modelo compartida. Si cambia la forma de los datos, el build nos avisa antes que el cliente.' },
      { t: 'Revisado, no solo escrito', b: 'Cada cambio pasa por revisión y comprobaciones automáticas. Nada llega a producción porque alguien estaba seguro un viernes.' },
      { t: 'Desplegado en continuo', b: 'Un entorno de vista previa por cambio, staging antes de producción, y un rollback que tarda un minuto, no una tarde.' },
      { t: 'Medido a la vista', b: 'Presupuestos de rendimiento, seguimiento de errores y monitorización de uptime desde el primer día, con los números visibles para ti, no solo para nosotros.' },
      { t: 'Documentado para el siguiente', b: 'Un runbook, una nota de arquitectura y una guía de administración llegan con la entrega — incluidas las partes que contratarías a otro para cambiar.' },
      { t: 'Tuyo en propiedad', b: 'Repositorios, archivos de diseño, cuentas cloud y dominios se transfieren en la entrega. Nunca infraestructura como rehén.' },
    ],
    indTitle: 'Sectores en los que trabajamos',
    indLead: 'La experiencia sectorial importa menos de lo que se pretende — pero sí moldea las preguntas que sabemos hacer pronto.',
    industries: ['Servicios profesionales', 'Retail y D2C', 'Mayorista B2B', 'Hostelería', 'Salud y clínicas', 'Educación y formación', 'Inmobiliaria', 'Logística', 'Fabricación', 'Servicios financieros', 'Viajes', 'Medios y editorial', 'ONG', 'Sector público', 'Tecnología y SaaS'],
    noEyebrow: 'Respuesta honesta', noTitle: 'Lo que no haremos',
    noLead: 'Decir sí a todo es como los estudios incumplen fechas. Estos son los trabajos que rechazamos, y te lo diremos en la primera llamada.',
    wontDo: [
      { t: 'Una plataforma sin responsable de tu lado', b: 'Cada desarrollo necesita una persona que pueda decidir. Sin eso, el alcance deriva y la fecha se va con él.' },
      { t: 'Rescate que no podemos inspeccionar', b: 'Con gusto retomamos un código existente — tras una auditoría pagada. Comprometerse a arreglar código a ciegas no ayuda a nadie.' },
      { t: 'Posiciones de búsqueda garantizadas', b: 'Construimos sitios que posicionan bien y hacemos el trabajo técnico como corresponde. Quien promete el puesto uno vende otra cosa.' },
      { t: 'Productos de zona gris', b: 'Ningún sistema cuyo fin sea engañar a usuarios, recolectar datos sin consentimiento o evadir la regulación del mercado donde opera.' },
    ],
    ctaTitle: 'Cuéntanos qué necesitas construir',
    ctaLead: 'Envía el brief y volvemos con el paquete que encaja, una cifra realista y qué recortaríamos de la versión uno.',
    ctaPrimary: 'Enviar un brief', ctaSecondary: 'Ver paquetes',
  },
  id: {
    chip: 'Kemampuan',
    h1a: 'Standar rekayasa yang sama', h1b: 'di setiap tingkat harga',
    heroLead: 'Halaman arahan dan platform enterprise berbeda dalam ruang lingkup, bukan keahlian. Keduanya tertype, ditinjau, diuji, dipantau, dan didokumentasikan — karena build murah biasanya yang paling cepat dilampaui bisnis, dan harus siap saat itu terjadi.',
    stackEyebrow: 'Teknologi', stackTitle: 'Yang kami pakai membangun',
    stackLead: 'Dipilih per proyek dari kumpulan ini. Kami tak memulai setiap brief dengan framework yang sama lalu menyebutnya strategi.',
    stack: [
      { area: 'Front end', items: ['React & Next.js', 'TypeScript', 'Tailwind CSS', 'Design system & pustaka komponen', 'Aksesibilitas (WCAG 2.2 AA)', 'Anggaran Core Web Vitals'] },
      { area: 'Back end', items: ['Node.js & runtime edge', 'API REST dan RPC bertype', 'Job latar & penjadwal', 'Webhook dan penanganan event', 'Strategi caching', 'Rate limiting & kendali penyalahgunaan'] },
      { area: 'Data', items: ['PostgreSQL / MySQL', 'SQLite & D1 di edge', 'Caching Redis & KV', 'Penyimpanan objek (S3 / R2)', 'Pengindeksan pencarian', 'Migrasi, backup & latihan pemulihan'] },
      { area: 'Infrastruktur', items: ['Cloudflare, Vercel, AWS', 'Container & Kubernetes', 'Infrastructure as code', 'CI/CD dengan lingkungan pratinjau', 'CDN & pengiriman edge global', 'Monitoring, logging & alerting'] },
      { area: 'Perdagangan & pembayaran', items: ['Stripe, Adyen, Mollie, PayPal', 'Penyelesaian kripto (USDT)', 'Langganan & tagihan pemakaian', 'Penanganan pajak / PPN', 'Faktur & rekonsiliasi', 'API pengiriman & kurir'] },
      { area: 'Keamanan', items: ['SSO, OAuth2 & OIDC', 'MFA dan penguatan sesi', 'RBAC & pemodelan izin', 'Enkripsi saat diam dan transit', 'Log audit', 'Pemindaian dependensi & konfigurasi'] },
      { area: 'AI', items: ['Asisten atas data Anda sendiri', 'Pipeline retrieval', 'Ekstraksi & klasifikasi dokumen', 'Rekomendasi & pemeringkatan', 'Otomasi alur kerja', 'Evaluasi dan guardrail'] },
      { area: 'Pertumbuhan', items: ['SEO teknis & schema', 'Analitik & pelacakan konversi', 'Pengujian A/B', 'Otomasi email & siklus hidup', 'Penyetelan performa', 'Migrasi tanpa kehilangan peringkat'] },
    ],
    stdEyebrow: 'Standar', stdTitle: 'Yang berlaku di setiap proyek',
    standards: [
      { t: 'Bertype ujung ke ujung', b: 'TypeScript di seluruh tumpukan dengan lapisan model bersama. Bila bentuk data berubah, build memberi tahu kami sebelum klien.' },
      { t: 'Ditinjau, bukan sekadar ditulis', b: 'Setiap perubahan lewat peninjauan dan pemeriksaan otomatis. Tak ada yang sampai produksi karena satu orang pede di hari Jumat.' },
      { t: 'Dideploy berkelanjutan', b: 'Lingkungan pratinjau per perubahan, staging sebelum produksi, dan rollback yang butuh semenit, bukan semalam.' },
      { t: 'Diukur terbuka', b: 'Anggaran performa, pelacakan error, dan monitoring uptime sejak hari pertama, dengan angkanya terlihat oleh Anda, bukan hanya kami.' },
      { t: 'Didokumentasikan untuk yang berikutnya', b: 'Runbook, catatan arsitektur, dan panduan admin ikut saat serah terima — termasuk bagian yang Anda akan sewa orang lain untuk mengubahnya.' },
      { t: 'Dimiliki oleh Anda', b: 'Repositori, berkas desain, akun cloud, dan domain dipindahkan saat serah terima. Tak pernah ada infrastruktur sandera.' },
    ],
    indTitle: 'Industri tempat kami bekerja',
    indLead: 'Pengalaman sektor tak sepenting yang dikira orang — tapi ia membentuk pertanyaan yang kami tahu perlu diajukan lebih awal.',
    industries: ['Jasa profesional', 'Ritel & D2C', 'Grosir B2B', 'Perhotelan', 'Kesehatan & klinik', 'Pendidikan & pelatihan', 'Properti', 'Logistik', 'Manufaktur', 'Jasa keuangan', 'Perjalanan', 'Media & penerbitan', 'Nirlaba', 'Sektor publik', 'Teknologi & SaaS'],
    noEyebrow: 'Jawaban jujur', noTitle: 'Yang tidak kami kerjakan',
    noLead: 'Mengiyakan segalanya adalah cara studio melewatkan tenggat. Inilah pekerjaan yang kami tolak, dan kami akan bilang di panggilan pertama.',
    wontDo: [
      { t: 'Platform tanpa penanggung jawab di sisi Anda', b: 'Setiap build butuh satu orang yang bisa memutuskan. Tanpa itu, ruang lingkup melebar dan tanggal ikut melebar.' },
      { t: 'Pekerjaan penyelamatan yang tak bisa kami periksa', b: 'Kami senang mengambil alih basis kode yang ada — setelah audit berbayar. Berjanji memperbaiki kode tanpa melihat tak membantu siapa pun.' },
      { t: 'Peringkat pencarian yang dijamin', b: 'Kami membangun situs yang berperingkat baik dan mengerjakan sisi teknis dengan benar. Siapa pun yang menjanjikan posisi satu sedang menjual hal lain.' },
      { t: 'Produk area abu-abu', b: 'Tidak ada sistem yang tujuannya menipu pengguna, memanen data tanpa persetujuan, atau mengelak regulasi di pasar tempatnya beroperasi.' },
    ],
    ctaTitle: 'Beri tahu kami apa yang perlu dibangun',
    ctaLead: 'Kirim brief-nya dan kami kembali dengan paket yang cocok, angka realistis, dan apa yang akan kami pangkas dari versi satu.',
    ctaPrimary: 'Kirim brief', ctaSecondary: 'Jelajahi paket',
  },
};

export default async function CapabilitiesPage() {
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
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionHead eyebrow={c.stackEyebrow} title={c.stackTitle} lead={c.stackLead} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.stack.map((s) => (
            <div key={s.area} className="panel p-5">
              <h3 className="font-display text-lg font-extrabold">{s.area}</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-steel-500">
                {s.items.map((i) => (
                  <li key={i} className="flex gap-2"><span className="text-gold-400">▸</span><span>{i}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHead eyebrow={c.stdEyebrow} title={c.stdTitle} />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {c.standards.map((s) => (
            <div key={s.t} className="premium-card p-6">
              <h3 className="font-bold">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-500">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="panel-dark p-8 sm:p-10">
          <h2 className="font-display text-2xl font-extrabold">{c.indTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm text-ivory-100/75">{c.indLead}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {c.industries.map((i) => (
              <span key={i} className="mk-chip border-white/25 text-ivory-100">{i}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHead eyebrow={c.noEyebrow} title={c.noTitle} lead={c.noLead} />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {c.wontDo.map((x) => (
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
        primary={{ href: '/contact', label: c.ctaPrimary }}
        secondary={{ href: '/services', label: c.ctaSecondary }}
      />
    </>
  );
}
