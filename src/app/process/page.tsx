import Link from 'next/link';
import type { Metadata } from 'next';
import { SectionHead, CtaBand } from '@/components/Studio';
import { localisedStages } from '@/content/process';
import { PACKAGES, eur } from '@/content/packages';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'How a project runs',
  description:
    'Register, choose a package, pay a 10% deposit, upload your concept, receive a completion date, pay 40% to start production, settle the final 50% at 75–80% progress, and take handover at 100%.',
  alternates: { canonical: '/process' },
};

type Step = { n: string; title: string; body: string; detail: string[] };
type Copy = {
  chip: string;
  h1a: string; h1b: string; heroLead: string;
  scheduleEyebrow: string; scheduleTitle: string; scheduleLead: string;
  bookingT: string; bookingB: string; prodT: string; prodB: string; setT: string; setB: string;
  example: string;
  rowContract: string; rowDeposit: string; rowProd: string; rowSettle: string; rowTotal: string;
  hint: (setupMin: string, setupMax: string, care: string) => string;
  stepsEyebrow: string; stepsTitle: string; steps: Step[];
  railTitle: string; railLead: string; stageWord: string;
  boundEyebrow: string; boundTitle: string; boundLead: string;
  boundaries: { t: string; b: string }[];
  boundClose: string; fullTerms: string;
  ctaTitle: string; ctaLead: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    chip: 'How it works',
    h1a: 'You pay in three steps.', h1b: 'You can watch every one of them.',
    heroLead: 'Most studios ask for half up front and go quiet. We split the money across the life of the build and put the progress bar where you can see it — so the incentive to finish stays with us, and the risk never all sits with you.',
    scheduleEyebrow: 'The payment schedule', scheduleTitle: '10% · 40% · 50%',
    scheduleLead: 'Three payments, tied to real events rather than to dates on a calendar.',
    bookingT: 'Booking deposit', bookingB: 'Paid at order. Reserves the slot, opens the concept upload.',
    prodT: 'Production', prodB: 'Paid once the scope is agreed. Starts the build; progress runs to 80%.',
    setT: 'Settlement', setB: 'Paid at 75–80% progress, after you have seen it working. Releases handover.',
    example: 'Worked example',
    rowContract: 'Contract value (scope agreed)', rowDeposit: '1. Booking deposit — 10%, at order',
    rowProd: '2. Production — 40%, build starts', rowSettle: '3. Settlement — 50%, at 75–80% progress',
    rowTotal: 'Total build cost',
    hint: (a, b, c) => `Setup (${a}–${b} one-time) and a care plan (from ${c}/month) are separate services, invoiced on their own. They are never bundled into the build price without you choosing them.`,
    stepsEyebrow: 'Step by step', stepsTitle: 'From registration to handover',
    steps: [
      { n: '01', title: 'Register and choose your package', body: 'Create an account in the client portal and pick the package that matches what you are building. Add any add-on services, a setup plan and a care plan if you want them. The portal shows the indicative quote and the exact milestone amounts before you commit to anything.', detail: ['Free to register', 'Ten packages to choose from', 'Add-ons optional and priced individually', 'Nothing is charged at this step'] },
      { n: '02', title: 'Pay the 10% booking deposit', body: 'A 10% deposit reserves your slot in the production queue and opens the concept upload. It is the minimum — you may pay more if you prefer, and the extra simply counts against the next milestone. Pay in USDT on TRC20, ERC20 or BEP20, or in EUR via PayPal.', detail: ['Minimum 10% of the contract value', 'USDT or PayPal', 'Confirmed within one business day', 'Deducted from the total, never an extra fee'] },
      { n: '03', title: 'Upload your concept', body: 'Once the deposit clears, the upload panel unlocks. Send whatever describes the website you want: a brief, a deck, screenshots of sites you like, your logo and brand files, copy, product data, wireframes. You can add more at any point during the build.', detail: ['PDF, images, office documents, design files, ZIP', 'Up to 25 MB per file', 'Written notes as well as files', 'Private — visible only to you and the delivery team'] },
      { n: '04', title: 'Your completion date appears', body: 'The moment your concept lands, the portal fixes a delivery estimate from the package timeline and publishes it on your project page. We review scope against what you uploaded and confirm the final contract value; the milestone amounts recalculate from that figure automatically.', detail: ['Estimate visible from day one', 'Scope review within one business day', 'Final contract value confirmed in writing', 'Milestones recalculated automatically'] },
      { n: '05', title: 'Pay 40% — production begins', body: 'The second payment brings you to 50% of the contract and starts the build. Design first, then implementation, with the progress bar and activity log updated as real work lands. Progress under this payment runs up to 80%.', detail: ['Cumulative 50% paid', 'Design, then build', 'Live progress percentage', 'Dated activity log on every change'] },
      { n: '06', title: 'Settle the final 50% at 75–80%', body: 'When the build reaches 75%, the settlement invoice is raised automatically and you get a working preview to check. Progress is capped at 80% until it clears — you never pay for work you cannot see, and we never hand over work that has not been paid for.', detail: ['Triggered at 75% progress', 'Preview environment to review', 'Hard cap at 80% until settled', 'Invoice generated by the portal'] },
      { n: '07', title: 'Handover at 100%', body: 'The last 20% is deployment, content loading, testing, performance and SEO passes, and training. At 100% you receive the source code, the design files, the admin accounts and the infrastructure — plus a walkthrough so your team can run it.', detail: ['Source code and design files transferred', 'Admin and infrastructure accounts handed over', 'Live deployment and final QA', 'Training session and documentation'] },
    ],
    railTitle: 'What your project page shows',
    railLead: 'Every project in the portal carries the same seven-stage rail. Stages light up from facts on record — a confirmed payment, an uploaded file, a progress update — never by hand.',
    stageWord: 'STAGE',
    boundEyebrow: 'The small print, said plainly', boundTitle: 'What can move a date',
    boundLead: 'Timelines are estimates drawn from the package, and they hold when both sides keep moving. These are the things that genuinely shift them.',
    boundaries: [
      { t: 'Content arriving late', b: 'The single most common cause of delay. Copy, photography, product data and legal text sit on your side; the clock effectively pauses while we wait for them.' },
      { t: 'Scope added mid-build', b: 'New features are welcome, but they are quoted and scheduled as a change, not absorbed silently into the same date.' },
      { t: 'Third parties', b: 'Payment providers, banks, identity checks and API approvals move at their own pace. We start those early and tell you the moment one is blocking.' },
      { t: 'Review cycles', b: 'Each review round we wait on adds to the timeline. Two named decision-makers on your side is usually the difference between weeks and months.' },
    ],
    boundClose: 'If a delay is ours, we say so on the activity log and we do not invoice a milestone we have not reached.',
    fullTerms: 'Full terms',
    ctaTitle: 'Open a project and see it for yourself',
    ctaLead: 'Registration is free. You will see the exact milestone amounts for your package before any payment is due.',
  },
  es: {
    chip: 'Cómo funciona',
    h1a: 'Pagas en tres pasos.', h1b: 'Puedes ver cada uno de ellos.',
    heroLead: 'La mayoría de los estudios piden la mitad por adelantado y desaparecen. Nosotros repartimos el pago a lo largo del desarrollo y ponemos la barra de progreso donde puedes verla — así el incentivo de terminar es nuestro, y el riesgo nunca recae todo sobre ti.',
    scheduleEyebrow: 'El calendario de pagos', scheduleTitle: '10% · 40% · 50%',
    scheduleLead: 'Tres pagos, ligados a hechos reales y no a fechas en un calendario.',
    bookingT: 'Depósito de reserva', bookingB: 'Se paga al hacer el pedido. Reserva el turno y abre la subida del concepto.',
    prodT: 'Producción', prodB: 'Se paga cuando se acuerda el alcance. Inicia el desarrollo; el avance llega al 80%.',
    setT: 'Liquidación', setB: 'Se paga al 75–80% de avance, tras verlo funcionando. Libera la entrega.',
    example: 'Ejemplo práctico',
    rowContract: 'Valor del contrato (alcance acordado)', rowDeposit: '1. Depósito de reserva — 10%, al pedir',
    rowProd: '2. Producción — 40%, empieza el desarrollo', rowSettle: '3. Liquidación — 50%, al 75–80% de avance',
    rowTotal: 'Coste total del desarrollo',
    hint: (a, b, c) => `La puesta en marcha (${a}–${b} única vez) y un plan de mantenimiento (desde ${c}/mes) son servicios aparte, facturados por separado. Nunca se incluyen en el precio del desarrollo sin que tú los elijas.`,
    stepsEyebrow: 'Paso a paso', stepsTitle: 'Del registro a la entrega',
    steps: [
      { n: '01', title: 'Regístrate y elige tu paquete', body: 'Crea una cuenta en el portal del cliente y elige el paquete que encaja con lo que vas a construir. Añade servicios adicionales, un plan de puesta en marcha y un plan de mantenimiento si los quieres. El portal muestra el presupuesto indicativo y los importes exactos de cada hito antes de que te comprometas a nada.', detail: ['Registro gratuito', 'Diez paquetes para elegir', 'Adicionales opcionales y con precio individual', 'No se cobra nada en este paso'] },
      { n: '02', title: 'Paga el 10% de depósito de reserva', body: 'Un depósito del 10% reserva tu turno en la cola de producción y abre la subida del concepto. Es el mínimo — puedes pagar más si prefieres, y lo extra simplemente cuenta para el siguiente hito. Paga en USDT por TRC20, ERC20 o BEP20, o en EUR por PayPal.', detail: ['Mínimo 10% del valor del contrato', 'USDT o PayPal', 'Confirmado en un día hábil', 'Se descuenta del total, nunca es un cargo extra'] },
      { n: '03', title: 'Sube tu concepto', body: 'Una vez confirmado el depósito, se desbloquea el panel de subida. Envía todo lo que describa el sitio que quieres: un brief, una presentación, capturas de sitios que te gustan, tu logo y archivos de marca, textos, datos de producto, wireframes. Puedes añadir más en cualquier momento del desarrollo.', detail: ['PDF, imágenes, documentos de oficina, archivos de diseño, ZIP', 'Hasta 25 MB por archivo', 'Notas escritas además de archivos', 'Privado — visible solo para ti y el equipo de entrega'] },
      { n: '04', title: 'Aparece tu fecha de entrega', body: 'En cuanto llega tu concepto, el portal fija una fecha estimada según el plazo del paquete y la publica en tu página de proyecto. Revisamos el alcance frente a lo que subiste y confirmamos el valor final del contrato; los importes de los hitos se recalculan a partir de esa cifra automáticamente.', detail: ['Estimación visible desde el primer día', 'Revisión del alcance en un día hábil', 'Valor final del contrato confirmado por escrito', 'Hitos recalculados automáticamente'] },
      { n: '05', title: 'Paga el 40% — empieza la producción', body: 'El segundo pago te lleva al 50% del contrato e inicia el desarrollo. Primero el diseño, luego la implementación, con la barra de progreso y el registro de actividad actualizados a medida que llega trabajo real. El avance bajo este pago llega hasta el 80%.', detail: ['Acumulado del 50% pagado', 'Diseño, luego desarrollo', 'Porcentaje de avance en vivo', 'Registro de actividad fechado en cada cambio'] },
      { n: '06', title: 'Liquida el 50% final al 75–80%', body: 'Cuando el desarrollo alcanza el 75%, la factura de liquidación se emite automáticamente y recibes una vista previa funcional para revisar. El avance se limita al 80% hasta que se paga — nunca pagas por trabajo que no puedes ver, y nunca entregamos trabajo que no se ha pagado.', detail: ['Se activa al 75% de avance', 'Entorno de vista previa para revisar', 'Límite firme del 80% hasta liquidar', 'Factura generada por el portal'] },
      { n: '07', title: 'Entrega al 100%', body: 'El último 20% es despliegue, carga de contenido, pruebas, rendimiento y SEO, y formación. Al 100% recibes el código fuente, los archivos de diseño, las cuentas de administración y la infraestructura — más una guía para que tu equipo lo gestione.', detail: ['Código fuente y archivos de diseño transferidos', 'Cuentas de administración e infraestructura entregadas', 'Despliegue en vivo y QA final', 'Sesión de formación y documentación'] },
    ],
    railTitle: 'Lo que muestra tu página de proyecto',
    railLead: 'Cada proyecto en el portal lleva el mismo recorrido de siete etapas. Las etapas se encienden a partir de hechos registrados — un pago confirmado, un archivo subido, una actualización de avance — nunca a mano.',
    stageWord: 'ETAPA',
    boundEyebrow: 'La letra pequeña, dicha claro', boundTitle: 'Qué puede mover una fecha',
    boundLead: 'Los plazos son estimaciones tomadas del paquete, y se cumplen cuando ambas partes siguen avanzando. Estas son las cosas que de verdad los desplazan.',
    boundaries: [
      { t: 'Contenido que llega tarde', b: 'La causa de retraso más común. Textos, fotografía, datos de producto y textos legales están de tu lado; el reloj se pausa mientras los esperamos.' },
      { t: 'Alcance añadido a mitad', b: 'Las nuevas funciones son bienvenidas, pero se cotizan y programan como un cambio, no se absorben en silencio en la misma fecha.' },
      { t: 'Terceros', b: 'Proveedores de pago, bancos, verificaciones de identidad y aprobaciones de API van a su propio ritmo. Los iniciamos pronto y te avisamos en cuanto uno bloquea.' },
      { t: 'Ciclos de revisión', b: 'Cada ronda de revisión que esperamos suma al plazo. Dos responsables con nombre de tu lado suele ser la diferencia entre semanas y meses.' },
    ],
    boundClose: 'Si un retraso es nuestro, lo decimos en el registro de actividad y no facturamos un hito que no hemos alcanzado.',
    fullTerms: 'Términos completos',
    ctaTitle: 'Abre un proyecto y compruébalo tú mismo',
    ctaLead: 'El registro es gratis. Verás los importes exactos de cada hito para tu paquete antes de que venza ningún pago.',
  },
  id: {
    chip: 'Cara kerja',
    h1a: 'Anda membayar dalam tiga langkah.', h1b: 'Anda bisa memantau setiap langkahnya.',
    heroLead: 'Kebanyakan studio minta separuh di depan lalu diam. Kami membagi pembayaran sepanjang masa pengerjaan dan menaruh bar progres di tempat yang Anda lihat — jadi dorongan untuk menyelesaikan ada di kami, dan risiko tak pernah menumpuk di Anda saja.',
    scheduleEyebrow: 'Jadwal pembayaran', scheduleTitle: '10% · 40% · 50%',
    scheduleLead: 'Tiga pembayaran, terkait peristiwa nyata, bukan tanggal di kalender.',
    bookingT: 'DP pemesanan', bookingB: 'Dibayar saat memesan. Mengunci slot, membuka unggah konsep.',
    prodT: 'Produksi', prodB: 'Dibayar setelah ruang lingkup disepakati. Memulai pengerjaan; progres berjalan hingga 80%.',
    setT: 'Pelunasan', setB: 'Dibayar pada progres 75–80%, setelah Anda melihatnya berjalan. Membuka serah terima.',
    example: 'Contoh perhitungan',
    rowContract: 'Nilai kontrak (ruang lingkup disepakati)', rowDeposit: '1. DP pemesanan — 10%, saat memesan',
    rowProd: '2. Produksi — 40%, pengerjaan mulai', rowSettle: '3. Pelunasan — 50%, pada progres 75–80%',
    rowTotal: 'Total biaya pembuatan',
    hint: (a, b, c) => `Setup (${a}–${b} sekali bayar) dan paket perawatan (mulai ${c}/bulan) adalah layanan terpisah, ditagih sendiri. Tidak pernah digabung ke harga pembuatan tanpa Anda memilihnya.`,
    stepsEyebrow: 'Langkah demi langkah', stepsTitle: 'Dari pendaftaran ke serah terima',
    steps: [
      { n: '01', title: 'Daftar dan pilih paket Anda', body: 'Buat akun di portal klien dan pilih paket yang sesuai dengan yang Anda bangun. Tambahkan layanan tambahan, paket setup, dan paket perawatan bila Anda mau. Portal menampilkan perkiraan biaya dan jumlah tiap termin secara persis sebelum Anda menyetujui apa pun.', detail: ['Gratis mendaftar', 'Sepuluh paket untuk dipilih', 'Tambahan opsional dan berharga sendiri', 'Tidak ada tagihan pada langkah ini'] },
      { n: '02', title: 'Bayar DP pemesanan 10%', body: 'DP 10% mengunci slot Anda di antrean produksi dan membuka unggah konsep. Ini minimum — Anda boleh membayar lebih, dan kelebihannya dihitung ke termin berikutnya. Bayar via USDT di TRC20, ERC20, atau BEP20, atau EUR via PayPal.', detail: ['Minimum 10% dari nilai kontrak', 'USDT atau PayPal', 'Dikonfirmasi dalam satu hari kerja', 'Dipotong dari total, bukan biaya tambahan'] },
      { n: '03', title: 'Unggah konsep Anda', body: 'Setelah DP masuk, panel unggah terbuka. Kirim apa pun yang menggambarkan situs yang Anda inginkan: brief, deck, tangkapan layar situs yang Anda suka, logo dan berkas brand, teks, data produk, wireframe. Anda bisa menambah kapan saja selama pengerjaan.', detail: ['PDF, gambar, dokumen kantor, berkas desain, ZIP', 'Hingga 25 MB per berkas', 'Catatan tertulis selain berkas', 'Privat — hanya terlihat oleh Anda dan tim pengerjaan'] },
      { n: '04', title: 'Tanggal selesai Anda muncul', body: 'Begitu konsep Anda masuk, portal menetapkan perkiraan selesai dari lini masa paket dan menampilkannya di halaman proyek Anda. Kami tinjau ruang lingkup terhadap yang Anda unggah dan mengunci nilai kontrak final; jumlah tiap termin dihitung ulang dari angka itu otomatis.', detail: ['Perkiraan terlihat sejak hari pertama', 'Tinjauan ruang lingkup dalam satu hari kerja', 'Nilai kontrak final dikonfirmasi tertulis', 'Termin dihitung ulang otomatis'] },
      { n: '05', title: 'Bayar 40% — produksi dimulai', body: 'Pembayaran kedua membawa Anda ke 50% kontrak dan memulai pengerjaan. Desain dulu, lalu implementasi, dengan bar progres dan log aktivitas diperbarui saat pekerjaan nyata masuk. Progres pada pembayaran ini berjalan hingga 80%.', detail: ['Total 50% dibayar', 'Desain, lalu bangun', 'Persentase progres langsung', 'Log aktivitas bertanggal di tiap perubahan'] },
      { n: '06', title: 'Lunasi 50% terakhir pada 75–80%', body: 'Saat pengerjaan mencapai 75%, faktur pelunasan terbit otomatis dan Anda mendapat pratinjau yang berjalan untuk diperiksa. Progres dibatasi 80% hingga lunas — Anda tak pernah membayar pekerjaan yang tak bisa Anda lihat, dan kami tak pernah menyerahkan pekerjaan yang belum dibayar.', detail: ['Terpicu pada progres 75%', 'Lingkungan pratinjau untuk ditinjau', 'Batas keras 80% hingga lunas', 'Faktur dibuat oleh portal'] },
      { n: '07', title: 'Serah terima pada 100%', body: '20% terakhir adalah deployment, pengisian konten, pengujian, performa dan SEO, serta pelatihan. Pada 100% Anda menerima kode sumber, berkas desain, akun admin, dan infrastruktur — plus panduan agar tim Anda bisa menjalankannya.', detail: ['Kode sumber dan berkas desain dipindahkan', 'Akun admin dan infrastruktur diserahkan', 'Deployment langsung dan QA final', 'Sesi pelatihan dan dokumentasi'] },
    ],
    railTitle: 'Apa yang ditampilkan halaman proyek Anda',
    railLead: 'Setiap proyek di portal memakai rel tujuh tahap yang sama. Tahap menyala dari fakta tercatat — pembayaran terkonfirmasi, berkas terunggah, pembaruan progres — tidak pernah manual.',
    stageWord: 'TAHAP',
    boundEyebrow: 'Ketentuan kecil, dikatakan terus terang', boundTitle: 'Apa yang bisa menggeser tanggal',
    boundLead: 'Lini masa adalah perkiraan dari paket, dan berlaku bila kedua pihak sama-sama bergerak. Inilah hal-hal yang benar-benar menggesernya.',
    boundaries: [
      { t: 'Konten datang terlambat', b: 'Penyebab keterlambatan paling umum. Teks, foto, data produk, dan teks legal ada di sisi Anda; jam praktis berhenti selama kami menunggunya.' },
      { t: 'Ruang lingkup ditambah di tengah', b: 'Fitur baru disambut, tetapi ditawar dan dijadwalkan sebagai perubahan, bukan diserap diam-diam ke tanggal yang sama.' },
      { t: 'Pihak ketiga', b: 'Penyedia pembayaran, bank, verifikasi identitas, dan persetujuan API bergerak dengan iramanya sendiri. Kami memulainya lebih awal dan memberi tahu Anda begitu salah satu menghambat.' },
      { t: 'Siklus peninjauan', b: 'Setiap putaran peninjauan yang kami tunggu menambah lini masa. Dua pengambil keputusan bernama di sisi Anda biasanya jadi beda antara minggu dan bulan.' },
    ],
    boundClose: 'Jika keterlambatan dari kami, kami sebutkan di log aktivitas dan kami tidak menagih termin yang belum kami capai.',
    fullTerms: 'Ketentuan lengkap',
    ctaTitle: 'Buka proyek dan lihat sendiri',
    ctaLead: 'Pendaftaran gratis. Anda akan melihat jumlah tiap termin untuk paket Anda sebelum ada pembayaran yang jatuh tempo.',
  },
};

export default async function ProcessPage() {
  const lang = await getLang();
  const c = pick(lang, COPY);
  const stages = localisedStages(lang);
  const example = PACKAGES.find((p) => p.slug === 'company-profile')!;
  const contract = example.priceMin;

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

      {/* The money, in one picture */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionHead eyebrow={c.scheduleEyebrow} title={c.scheduleTitle} lead={c.scheduleLead} />
        <div className="mt-8 panel p-6 sm:p-8">
          <div className="flex h-12 w-full overflow-hidden rounded-lg text-xs font-extrabold text-white">
            <div className="flex items-center justify-center bg-[#0a52bd]" style={{ width: '10%' }}>10%</div>
            <div className="flex items-center justify-center bg-[#0b6fe8]" style={{ width: '40%' }}>40%</div>
            <div className="flex items-center justify-center bg-[#2f9dff]" style={{ width: '50%' }}>50%</div>
          </div>
          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            <div>
              <p className="font-display text-lg font-extrabold">{c.bookingT}</p>
              <p className="text-sm text-steel-500">{c.bookingB}</p>
            </div>
            <div>
              <p className="font-display text-lg font-extrabold">{c.prodT}</p>
              <p className="text-sm text-steel-500">{c.prodB}</p>
            </div>
            <div>
              <p className="font-display text-lg font-extrabold">{c.setT}</p>
              <p className="text-sm text-steel-500">{c.setB}</p>
            </div>
          </div>

          <div className="mt-8 rounded-lg bg-ivory-100/70 p-5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-steel-500">{c.example} — {example.name}</p>
            <table className="data-table mt-3">
              <tbody>
                <tr><td>{c.rowContract}</td><td className="text-right font-bold">{eur(contract)}</td></tr>
                <tr><td>{c.rowDeposit}</td><td className="text-right font-bold">{eur(Math.round(contract * 0.1))}</td></tr>
                <tr><td>{c.rowProd}</td><td className="text-right font-bold">{eur(Math.round(contract * 0.4))}</td></tr>
                <tr><td>{c.rowSettle}</td><td className="text-right font-bold">{eur(Math.round(contract * 0.5))}</td></tr>
                <tr><td className="font-bold">{c.rowTotal}</td><td className="text-right font-extrabold">{eur(contract)}</td></tr>
              </tbody>
            </table>
            <p className="hint mt-3">{c.hint(eur(149), eur(399), eur(99))}</p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <SectionHead eyebrow={c.stepsEyebrow} title={c.stepsTitle} />
        <div className="mt-10 space-y-6">
          {c.steps.map((s) => (
            <article key={s.n} className="panel grid gap-6 p-6 sm:grid-cols-[auto_1fr_260px] sm:items-start">
              <span className="font-display text-4xl font-extrabold accent-text">{s.n}</span>
              <div>
                <h3 className="font-display text-xl font-extrabold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel-500">{s.body}</p>
              </div>
              <ul className="space-y-1.5 rounded-lg bg-ivory-100/60 p-4 text-xs">
                {s.detail.map((d) => (
                  <li key={d} className="flex gap-2"><span className="tick">✓</span><span>{d}</span></li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Stage rail */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="panel-dark p-8">
          <h2 className="font-display text-2xl font-extrabold">{c.railTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm text-ivory-100/75">{c.railLead}</p>
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stages.map((s, i) => (
              <li key={s.key} className="rounded-lg border border-white/15 bg-white/5 p-4">
                <p className="text-[11px] font-extrabold text-gold-300">{c.stageWord} {i + 1}</p>
                <p className="mt-1 text-sm font-bold">{s.name}</p>
                <p className="mt-1 text-xs text-ivory-100/65">{s.blurb}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Honest boundaries */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHead eyebrow={c.boundEyebrow} title={c.boundTitle} lead={c.boundLead} />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {c.boundaries.map((x) => (
            <div key={x.t} className="panel p-5">
              <h3 className="font-bold">{x.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-500">{x.b}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-steel-500">
          {c.boundClose}{' '}
          <Link href="/terms" className="text-gold-500 underline">{c.fullTerms}</Link>.
        </p>
      </section>

      <CtaBand title={c.ctaTitle} lead={c.ctaLead} />
    </>
  );
}
