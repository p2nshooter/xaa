import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SectionHead } from '@/components/Studio';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InvestForm } from '@/components/forms/InvestForms';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';
import { pageMetadata, absUrl } from '@/lib/seo';
import { jsonLdHtml } from '@/lib/json-ld';
import { SEO } from '@/content/seo-copy';
import { getInvest, raisedUsd, shareOf, pct, usd } from '@/server/invest';
import { getSale, waLink } from '@/server/sale';

/**
 * /invest — the investor offering of xaa.es, and of xaa.es alone.
 *
 * Owner, 19 Oct 2026, on the old "joint offering for AXTO and XAA" line:
 * "Maksudnya masing2 web nyari investornya, bukan gabungan." xaa.es raises
 * from its own investors on its own revenue; axto.io raises separately on its
 * own site. Terms, status, whether the offering is shown at all (hidden by
 * default since 26 Oct 2026) and whether search engines may index this page
 * come from Admin → Settings → Investor offering (server/invest.ts). Every statement
 * below describes the business as it is today and what the capital is for;
 * nothing promises a return.
 */

export async function generateMetadata(): Promise<Metadata> {
  const offer = await getInvest();
  return pageMetadata({ path: '/invest', copy: SEO.invest, noindex: !offer.indexed || !offer.visible });
}

type Copy = {
  crumb: string; chip: string; h1a: string; h1b: string; lead: string;
  termsLabel: string; target: string; min: string; pool: string; poolNote: string; payout: string; payoutV: string; until: string; untilV: string;
  raised: string; apply: string; whatsapp: string; waText: string;
  closedT: string; closedB: string; pausedT: string; pausedB: string;
  howEyebrow: string; howTitle: string; howLead: (pool: number, target: string) => string;
  exHead: [string, string, string]; exNote: string;
  countEyebrow: string; countTitle: string; counts: { t: string; b: string }[];
  todayEyebrow: string; todayTitle: string; today: string[]; buildTitle: string; build: string[];
  stepsEyebrow: string; stepsTitle: string; steps: { t: string; b: string }[];
  aloneT: string; aloneB: string;
  riskEyebrow: string; riskTitle: string; risks: string[];
  applyEyebrow: string; applyTitle: string; applyLead: string;
  faqTitle: string; faq: { q: string; a: string }[];
  wholeT: string; wholeB: string; wholeLink: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    crumb: 'Invest', chip: 'Investor offering · xaa.es only',
    h1a: 'Invest in xaa.es.',
    h1b: 'A share of the studio’s revenue, from the first euro after your capital arrives.',
    lead: 'xaa.es is a working, multilingual software studio on a rare three-letter .es domain: published packages, a client portal, live payment rails and a SaaS catalogue. This round funds what comes next — and pays investors a monthly share of every confirmed xaa.es sale, until the business is acquired and the capital is returned.',
    termsLabel: 'Terms of the round', target: 'Raise', min: 'Minimum ticket', pool: 'Revenue pool', poolNote: 'of every confirmed xaa.es revenue transaction',
    payout: 'Paid', payoutV: 'Monthly, in euros', until: 'Until', untilV: 'A full acquisition of xaa.es — then 100 % of the capital is returned',
    raised: 'Raised so far', apply: 'Apply to invest', whatsapp: 'Speak to the owner on WhatsApp', waText: 'Hello, I am interested in the xaa.es investor offering.',
    closedT: 'The round is complete', closedB: 'Thank you to everyone who took part. New applications are no longer accepted.',
    pausedT: 'Applications are paused', pausedB: 'The owner is not taking new applications at the moment. You can still write to hello@xaa.es.',
    howEyebrow: 'The revenue share', howTitle: 'Simple, proportional and computed for you',
    howLead: (pool, target) => `Investors share ${pool} % of every confirmed xaa.es revenue transaction. Your part of that pool is your capital divided by the ${target} round — so every dollar earns the same, whether you are the first investor or the last.`,
    exHead: ['Capital', 'Your share of each sale', 'On €10,000 of revenue'], exNote: 'Illustration of the formula only. Revenue varies month to month and can be nil; nothing here is a forecast or a promise.',
    countEyebrow: 'What counts', countTitle: 'Revenue, defined once and never typed by hand',
    counts: [
      { t: 'Counted', b: 'Confirmed project milestones and paid template orders, in euros, on the day they are confirmed.' },
      { t: 'Never counted', b: 'PayPal test (sandbox) payments, payments that are refunded or reversed, anything pending or rejected.' },
      { t: 'Your statement', b: 'A private page in the client portal shows each month’s revenue total, your share, what has been paid and what is still due — no client data, ever.' },
    ],
    todayEyebrow: 'Where the money goes', todayTitle: 'Built today, built with the round',
    today: [
      'Service packages from landing pages to enterprise platforms, with milestone pricing and a guided brief',
      'A client portal: projects, milestone payments, uploads, progress, invoices and receipts',
      'PayPal Checkout that confirms itself, SWIFT wires in EUR and USD, and USDT',
      'An AI support desk and a studio admin with leads, payments, settings and backups',
      'English, Spanish and Indonesian across the studio pages',
    ],
    buildTitle: 'What the capital is for',
    build: [
      'Building the SaaS templates of the catalogue into finished products, each with a live demo — starting with the best sellers',
      'The enterprise tier: multi-tenant SaaS kit, marketplace, ERP suite and AI SaaS platform',
      'Faster pages on mobile and edge caching, so every visit converts better',
      'Sales and marketing in Spain, Latin America and South-East Asia',
    ],
    stepsEyebrow: 'How it works', stepsTitle: 'From application to your first statement',
    steps: [
      { t: 'Apply', b: 'Tell us who you are and how much you intend to invest. It takes two minutes and commits you to nothing.' },
      { t: 'Memorandum and agreement', b: 'Within one business day you receive the investor memorandum, an NDA and the draft investment agreement.' },
      { t: 'Sign', b: 'Questions answered, terms agreed, the agreement is signed by both sides.' },
      { t: 'Send the capital', b: 'By bank wire in USD or EUR to the company account given in your agreement, or by PayPal. Payment details are never published on this page.' },
      { t: 'Verified — your share starts', b: 'The studio confirms receipt. From that day, your share of every confirmed sale is computed and appears in your portal.' },
      { t: 'Paid monthly', b: 'Each month’s share is paid out and recorded, so your statement always shows what is earned, paid and open.' },
      { t: 'Acquisition', b: 'When xaa.es is acquired in full, your capital is returned in full and the revenue share ends.' },
    ],
    aloneT: 'xaa.es, and only xaa.es',
    aloneB: 'This round concerns xaa.es alone. It shares no revenue, capital or obligations with any other site or company project — each business of the group raises separately, on its own merits.',
    riskEyebrow: 'Please read', riskTitle: 'Risk notice',
    risks: [
      'This is a private placement in an early-stage business. Your capital is at risk.',
      'Revenue can rise, fall or be nil in any month; the revenue share is not a fixed return and nothing on this page is a forecast.',
      'Capital is returned at a full acquisition of xaa.es. An acquisition may not happen, or may take longer than you expect.',
      'Your written agreement governs every term; where it differs from this page, the agreement prevails.',
      'This page is not an offer of securities where such an offer would be unlawful. You confirm that you may invest under the laws of your country, and you should take independent financial, legal and tax advice.',
    ],
    applyEyebrow: 'Apply', applyTitle: 'Start the conversation', applyLead: 'Applications go to the owner personally. You will hear back within one business day.',
    faqTitle: 'Questions investors ask',
    faq: [
      { q: 'Am I buying shares in a company?', a: 'The round is a revenue-sharing investment governed by a written agreement, as described above. The exact legal form, and any security over your capital, is set out in the agreement you receive before anything is signed.' },
      { q: 'How is my share calculated?', a: 'Your capital divided by the round target, multiplied by the revenue pool. With the current terms, the minimum ticket corresponds to the share shown in the table above, and the full round to the whole pool.' },
      { q: 'When does my share start?', a: 'On the day the studio verifies that your capital has arrived. Revenue confirmed before that day is not shared.' },
      { q: 'Can I see the figures?', a: 'Yes. Your portal statement shows confirmed revenue month by month and your share of it. Detailed accounts are available in the data room under NDA.' },
      { q: 'Is this connected to axto.io?', a: 'No. xaa.es raises on its own and shares its own revenue only. axto.io runs a separate offering on its own site.' },
      { q: 'Can I buy the whole of xaa.es instead?', a: 'Yes — the business itself is offered for acquisition on a separate page.' },
    ],
    wholeT: 'Prefer the whole to a share?', wholeB: 'xaa.es itself — domain, studio and platform — is offered for outright acquisition.', wholeLink: 'See the acquisition offer',
  },
  es: {
    crumb: 'Invertir', chip: 'Oferta para inversores · solo xaa.es',
    h1a: 'Invierte en xaa.es.',
    h1b: 'Una participación en los ingresos del estudio, desde el primer euro tras la llegada de tu capital.',
    lead: 'xaa.es es un estudio de software multilingüe en funcionamiento, sobre un dominio .es de tres letras poco común: paquetes publicados, portal de clientes, pagos reales y un catálogo SaaS. Esta ronda financia la siguiente etapa y paga a los inversores, cada mes, una parte de cada venta confirmada de xaa.es, hasta que el negocio sea adquirido y se devuelva el capital.',
    termsLabel: 'Condiciones de la ronda', target: 'Ronda', min: 'Inversión mínima', pool: 'Fondo de ingresos', poolNote: 'de cada ingreso confirmado de xaa.es',
    payout: 'Pago', payoutV: 'Mensual, en euros', until: 'Hasta', untilV: 'La adquisición completa de xaa.es; entonces se devuelve el 100 % del capital',
    raised: 'Captado hasta ahora', apply: 'Solicitar invertir', whatsapp: 'Habla con el propietario por WhatsApp', waText: 'Hola, me interesa la oferta para inversores de xaa.es.',
    closedT: 'La ronda está completa', closedB: 'Gracias a todos los que participaron. Ya no se aceptan nuevas solicitudes.',
    pausedT: 'Las solicitudes están en pausa', pausedB: 'El propietario no acepta nuevas solicitudes por ahora. Puedes escribir a hello@xaa.es.',
    howEyebrow: 'El reparto de ingresos', howTitle: 'Sencillo, proporcional y calculado para ti',
    howLead: (pool, target) => `Los inversores comparten el ${pool} % de cada ingreso confirmado de xaa.es. Tu parte de ese fondo es tu capital dividido entre la ronda de ${target}: cada dólar rinde lo mismo, seas el primer inversor o el último.`,
    exHead: ['Capital', 'Tu parte de cada venta', 'Sobre 10.000 € de ingresos'], exNote: 'Ilustración de la fórmula. Los ingresos varían cada mes y pueden ser nulos; nada de esto es una previsión ni una promesa.',
    countEyebrow: 'Qué cuenta', countTitle: 'Ingresos definidos una vez y nunca tecleados a mano',
    counts: [
      { t: 'Cuenta', b: 'Hitos de proyecto confirmados y pedidos de plantillas pagados, en euros, el día en que se confirman.' },
      { t: 'Nunca cuenta', b: 'Pagos de prueba de PayPal (sandbox), pagos reembolsados o revertidos, y todo lo pendiente o rechazado.' },
      { t: 'Tu extracto', b: 'Una página privada en el portal de clientes muestra el total de ingresos de cada mes, tu parte, lo pagado y lo pendiente; nunca datos de clientes.' },
    ],
    todayEyebrow: 'Destino del dinero', todayTitle: 'Lo que ya existe y lo que construye la ronda',
    today: [
      'Paquetes de servicios desde landing pages hasta plataformas enterprise, con precios por hitos y brief guiado',
      'Portal de clientes: proyectos, pagos por hitos, archivos, avance, facturas y recibos',
      'PayPal Checkout que se confirma solo, transferencias SWIFT en EUR y USD, y USDT',
      'Un servicio de soporte con IA y un panel de estudio con leads, pagos, ajustes y copias de seguridad',
      'Inglés, español e indonesio en todas las páginas del estudio',
    ],
    buildTitle: 'Para qué es el capital',
    build: [
      'Convertir las plantillas SaaS del catálogo en productos terminados, cada uno con demo en vivo, empezando por las más vendidas',
      'El nivel enterprise: kit SaaS multi-tenant, marketplace, suite ERP y plataforma SaaS con IA',
      'Páginas más rápidas en móvil y caché en el edge, para que cada visita convierta mejor',
      'Ventas y marketing en España, Latinoamérica y el Sudeste Asiático',
    ],
    stepsEyebrow: 'Cómo funciona', stepsTitle: 'De la solicitud a tu primer extracto',
    steps: [
      { t: 'Solicita', b: 'Cuéntanos quién eres y cuánto piensas invertir. Son dos minutos y no te compromete a nada.' },
      { t: 'Memorando y contrato', b: 'En un día hábil recibes el memorando para inversores, un NDA y el borrador del contrato de inversión.' },
      { t: 'Firma', b: 'Resueltas las dudas y acordadas las condiciones, ambas partes firman el contrato.' },
      { t: 'Envía el capital', b: 'Por transferencia en USD o EUR a la cuenta de la empresa indicada en tu contrato, o por PayPal. Los datos de pago nunca se publican en esta página.' },
      { t: 'Verificado: empieza tu parte', b: 'El estudio confirma la recepción. Desde ese día se calcula tu parte de cada venta confirmada y aparece en tu portal.' },
      { t: 'Pago mensual', b: 'La parte de cada mes se paga y se registra, de modo que tu extracto muestra siempre lo ganado, lo pagado y lo pendiente.' },
      { t: 'Adquisición', b: 'Cuando xaa.es se adquiere por completo, se te devuelve todo el capital y termina el reparto de ingresos.' },
    ],
    aloneT: 'xaa.es, y solo xaa.es',
    aloneB: 'Esta ronda se refiere únicamente a xaa.es. No comparte ingresos, capital ni obligaciones con ningún otro sitio o proyecto: cada negocio del grupo capta por separado, por sus propios méritos.',
    riskEyebrow: 'Léelo, por favor', riskTitle: 'Aviso de riesgos',
    risks: [
      'Se trata de una colocación privada en un negocio en fase temprana. Tu capital está en riesgo.',
      'Los ingresos pueden subir, bajar o ser nulos cualquier mes; el reparto no es una rentabilidad fija y nada de esta página es una previsión.',
      'El capital se devuelve con la adquisición completa de xaa.es. Esa adquisición puede no producirse o tardar más de lo esperado.',
      'Tu contrato escrito rige todas las condiciones; si difiere de esta página, prevalece el contrato.',
      'Esta página no es una oferta de valores allí donde sería ilegal. Confirmas que puedes invertir según las leyes de tu país y deberías obtener asesoramiento financiero, legal y fiscal independiente.',
    ],
    applyEyebrow: 'Solicitud', applyTitle: 'Empieza la conversación', applyLead: 'Las solicitudes llegan personalmente al propietario. Tendrás respuesta en un día hábil.',
    faqTitle: 'Preguntas de los inversores',
    faq: [
      { q: '¿Compro acciones de una empresa?', a: 'La ronda es una inversión con reparto de ingresos regida por un contrato escrito, como se describe arriba. La forma jurídica exacta, y cualquier garantía sobre tu capital, se detallan en el contrato que recibes antes de firmar nada.' },
      { q: '¿Cómo se calcula mi parte?', a: 'Tu capital dividido entre el objetivo de la ronda, multiplicado por el fondo de ingresos. Con las condiciones actuales, la inversión mínima corresponde a la parte que muestra la tabla y la ronda completa al fondo entero.' },
      { q: '¿Cuándo empieza mi parte?', a: 'El día en que el estudio verifica que tu capital ha llegado. Los ingresos confirmados antes de ese día no se reparten.' },
      { q: '¿Puedo ver las cifras?', a: 'Sí. El extracto de tu portal muestra los ingresos confirmados mes a mes y tu parte. Las cuentas detalladas están en la sala de datos, bajo NDA.' },
      { q: '¿Tiene relación con axto.io?', a: 'No. xaa.es capta por su cuenta y reparte solo sus propios ingresos. axto.io tiene una oferta distinta en su propio sitio.' },
      { q: '¿Puedo comprar xaa.es entero?', a: 'Sí: el negocio completo se ofrece en adquisición en otra página.' },
    ],
    wholeT: '¿Prefieres el todo a una parte?', wholeB: 'xaa.es — dominio, estudio y plataforma — se ofrece en adquisición completa.', wholeLink: 'Ver la oferta de adquisición',
  },
  id: {
    crumb: 'Investasi', chip: 'Penawaran pemodal · khusus xaa.es',
    h1a: 'Berinvestasi di xaa.es.',
    h1b: 'Bagian dari pendapatan studio, sejak euro pertama setelah modal Anda masuk.',
    lead: 'xaa.es adalah studio perangkat lunak multibahasa yang sudah berjalan, di atas domain .es tiga huruf yang langka: paket layanan yang terbit, portal klien, pembayaran live, dan katalog SaaS. Putaran ini membiayai tahap berikutnya dan membayar pemodal setiap bulan dari setiap penjualan xaa.es yang terkonfirmasi, sampai bisnis ini diakuisisi dan modal dikembalikan.',
    termsLabel: 'Ketentuan putaran', target: 'Target', min: 'Investasi minimum', pool: 'Pool pendapatan', poolNote: 'dari setiap pendapatan xaa.es yang terkonfirmasi',
    payout: 'Dibayar', payoutV: 'Bulanan, dalam euro', until: 'Sampai', untilV: 'Akuisisi penuh xaa.es — saat itu 100 % modal dikembalikan',
    raised: 'Terkumpul sejauh ini', apply: 'Ajukan investasi', whatsapp: 'Bicara dengan pemilik lewat WhatsApp', waText: 'Halo, saya tertarik dengan penawaran pemodal xaa.es.',
    closedT: 'Putaran sudah penuh', closedB: 'Terima kasih kepada semua yang ikut serta. Pengajuan baru tidak lagi diterima.',
    pausedT: 'Pengajuan sedang dijeda', pausedB: 'Pemilik belum menerima pengajuan baru saat ini. Anda tetap bisa menulis ke hello@xaa.es.',
    howEyebrow: 'Bagi hasil', howTitle: 'Sederhana, proporsional, dan dihitung untuk Anda',
    howLead: (pool, target) => `Pemodal berbagi ${pool} % dari setiap pendapatan xaa.es yang terkonfirmasi. Bagian Anda dari pool itu adalah modal Anda dibagi target putaran ${target} — jadi setiap dolar menghasilkan sama, baik Anda pemodal pertama maupun terakhir.`,
    exHead: ['Modal', 'Bagian Anda dari setiap penjualan', 'Dari pendapatan €10.000'], exNote: 'Hanya ilustrasi rumus. Pendapatan berubah tiap bulan dan bisa nol; tidak ada di sini yang merupakan proyeksi atau janji.',
    countEyebrow: 'Yang dihitung', countTitle: 'Pendapatan didefinisikan sekali, tidak pernah diketik manual',
    counts: [
      { t: 'Dihitung', b: 'Termin proyek yang terkonfirmasi dan pesanan template yang lunas, dalam euro, pada hari dikonfirmasi.' },
      { t: 'Tidak pernah dihitung', b: 'Pembayaran uji PayPal (sandbox), pembayaran yang di-refund atau dibatalkan, dan semua yang tertunda atau ditolak.' },
      { t: 'Laporan Anda', b: 'Halaman pribadi di portal klien menampilkan total pendapatan tiap bulan, bagian Anda, yang sudah dibayar dan yang masih terutang — tanpa data klien sama sekali.' },
    ],
    todayEyebrow: 'Ke mana dana mengalir', todayTitle: 'Yang sudah ada, dan yang dibangun dengan putaran ini',
    today: [
      'Paket layanan dari landing page sampai platform enterprise, dengan harga per termin dan brief terpandu',
      'Portal klien: proyek, pembayaran termin, unggahan, progres, faktur dan kuitansi',
      'PayPal Checkout yang terkonfirmasi otomatis, transfer SWIFT EUR dan USD, serta USDT',
      'Layanan dukungan AI dan panel studio dengan leads, pembayaran, pengaturan dan backup',
      'Bahasa Inggris, Spanyol dan Indonesia di seluruh halaman studio',
    ],
    buildTitle: 'Untuk apa modal ini',
    build: [
      'Membangun template SaaS di katalog menjadi produk jadi, masing-masing dengan demo langsung — mulai dari yang paling laku',
      'Tingkat enterprise: SaaS kit multi-tenant, marketplace, suite ERP dan platform SaaS berbasis AI',
      'Halaman yang lebih cepat di ponsel dan cache di edge, agar setiap kunjungan lebih banyak menghasilkan',
      'Penjualan dan pemasaran di Spanyol, Amerika Latin dan Asia Tenggara',
    ],
    stepsEyebrow: 'Cara kerjanya', stepsTitle: 'Dari pengajuan sampai laporan pertama Anda',
    steps: [
      { t: 'Ajukan', b: 'Ceritakan siapa Anda dan berapa yang ingin Anda investasikan. Dua menit, tanpa kewajiban apa pun.' },
      { t: 'Memorandum dan perjanjian', b: 'Dalam satu hari kerja Anda menerima memorandum pemodal, NDA dan draf perjanjian investasi.' },
      { t: 'Tanda tangan', b: 'Pertanyaan terjawab, ketentuan disepakati, perjanjian ditandatangani kedua pihak.' },
      { t: 'Kirim modal', b: 'Lewat transfer bank dalam USD atau EUR ke rekening perusahaan yang tercantum di perjanjian, atau lewat PayPal. Rincian pembayaran tidak pernah dipublikasikan di halaman ini.' },
      { t: 'Terverifikasi — bagian Anda dimulai', b: 'Studio mengonfirmasi dana diterima. Sejak hari itu bagian Anda dari setiap penjualan terkonfirmasi dihitung dan tampil di portal Anda.' },
      { t: 'Dibayar bulanan', b: 'Bagian setiap bulan dibayarkan dan dicatat, sehingga laporan Anda selalu menunjukkan yang diperoleh, dibayar dan masih terbuka.' },
      { t: 'Akuisisi', b: 'Saat xaa.es diakuisisi penuh, modal Anda dikembalikan seluruhnya dan bagi hasil berakhir.' },
    ],
    aloneT: 'xaa.es, dan hanya xaa.es',
    aloneB: 'Putaran ini hanya menyangkut xaa.es. Tidak ada pendapatan, modal atau kewajiban yang dibagi dengan situs atau proyek lain — setiap bisnis dalam grup menghimpun modalnya sendiri, atas kekuatannya sendiri.',
    riskEyebrow: 'Mohon dibaca', riskTitle: 'Pemberitahuan risiko',
    risks: [
      'Ini penempatan privat pada bisnis tahap awal. Modal Anda mengandung risiko.',
      'Pendapatan bisa naik, turun atau nol di bulan mana pun; bagi hasil bukan imbal hasil tetap dan tidak ada di halaman ini yang merupakan proyeksi.',
      'Modal dikembalikan saat akuisisi penuh xaa.es. Akuisisi itu mungkin tidak terjadi, atau lebih lama dari yang Anda harapkan.',
      'Perjanjian tertulis Anda mengatur semua ketentuan; bila berbeda dengan halaman ini, perjanjian yang berlaku.',
      'Halaman ini bukan penawaran efek di wilayah yang melarangnya. Anda memastikan boleh berinvestasi menurut hukum negara Anda, dan sebaiknya meminta nasihat keuangan, hukum dan pajak yang independen.',
    ],
    applyEyebrow: 'Pengajuan', applyTitle: 'Mulai percakapan', applyLead: 'Pengajuan langsung diterima pemilik. Anda mendapat balasan dalam satu hari kerja.',
    faqTitle: 'Pertanyaan yang sering diajukan pemodal',
    faq: [
      { q: 'Apakah saya membeli saham perusahaan?', a: 'Putaran ini adalah investasi bagi hasil yang diatur perjanjian tertulis, seperti dijelaskan di atas. Bentuk hukum yang tepat, dan jaminan apa pun atas modal Anda, dirinci di perjanjian yang Anda terima sebelum apa pun ditandatangani.' },
      { q: 'Bagaimana bagian saya dihitung?', a: 'Modal Anda dibagi target putaran, dikali pool pendapatan. Dengan ketentuan saat ini, investasi minimum setara dengan bagian di tabel di atas, dan seluruh putaran setara dengan seluruh pool.' },
      { q: 'Kapan bagian saya mulai?', a: 'Pada hari studio memverifikasi bahwa modal Anda sudah diterima. Pendapatan yang terkonfirmasi sebelum hari itu tidak dibagi.' },
      { q: 'Bisakah saya melihat angkanya?', a: 'Bisa. Laporan di portal Anda menampilkan pendapatan terkonfirmasi per bulan dan bagian Anda. Laporan keuangan rinci tersedia di data room di bawah NDA.' },
      { q: 'Apakah ini terkait axto.io?', a: 'Tidak. xaa.es menghimpun modal sendiri dan hanya membagi pendapatannya sendiri. axto.io memiliki penawaran terpisah di situsnya sendiri.' },
      { q: 'Bisakah saya membeli xaa.es seluruhnya?', a: 'Bisa — bisnisnya sendiri ditawarkan untuk diakuisisi di halaman terpisah.' },
    ],
    wholeT: 'Lebih suka seluruhnya daripada sebagian?', wholeB: 'xaa.es sendiri — domain, studio dan platform — ditawarkan untuk diakuisisi penuh.', wholeLink: 'Lihat penawaran akuisisi',
  },
};

export default async function InvestPage() {
  const lang = await getLang();
  const c = pick(lang, COPY);
  const [offer, sale] = await Promise.all([getInvest(), getSale()]);
  // Hidden by default (§26.4): until the admin shows the offering, /invest is a 404 like any unknown URL.
  if (!offer.visible) notFound();
  const raised = await raisedUsd().catch(() => 0);
  const open = offer.status === 'open';
  const url = absUrl('/invest');
  const examples = [...new Set([offer.minUsd, 250_000, 500_000, offer.targetUsd])].filter((n) => n >= offer.minUsd && n <= offer.targetUsd).sort((a, b) => a - b);
  const eurFmt = (n: number) => new Intl.NumberFormat(lang === 'en' ? 'en-IE' : lang === 'es' ? 'es-ES' : 'id-ID', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n);

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: SEO.invest[lang].title,
      description: SEO.invest[lang].description,
      url,
      inLanguage: lang,
      about: { '@type': 'Organization', name: 'xaa.es', url: absUrl('/') },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: c.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(ld) }} />

      <Breadcrumbs trail={[{ label: c.crumb }]} className="pb-4" />
      <section className="acq-hero relative overflow-hidden border-b border-[color:var(--line)] text-white">
        <div className="mk-grid-bg absolute inset-0 opacity-15" aria-hidden />
        <div className="acq-glow" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:pb-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                <span className="mk-live-dot" /> {c.chip}
              </p>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
                {c.h1a}
                <span className="mt-2 block text-2xl font-bold leading-snug text-white/85 sm:text-3xl">{c.h1b}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/85">{c.lead}</p>
            </div>
            <div className="acq-price rounded-3xl border border-white/20 bg-white/10 p-7 backdrop-blur-md" data-testid="invest-terms">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">{c.termsLabel}</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-baseline justify-between gap-4"><dt className="text-white/75">{c.target}</dt><dd className="font-display text-2xl font-extrabold">{usd(offer.targetUsd)}</dd></div>
                <div className="flex items-baseline justify-between gap-4"><dt className="text-white/75">{c.min}</dt><dd className="font-bold">{usd(offer.minUsd)}</dd></div>
                <div className="flex items-baseline justify-between gap-4"><dt className="text-white/75">{c.pool}</dt><dd className="text-right font-bold">{offer.poolPct} % <span className="block text-xs font-normal text-white/70">{c.poolNote}</span></dd></div>
                <div className="flex items-baseline justify-between gap-4"><dt className="text-white/75">{c.payout}</dt><dd className="font-bold">{c.payoutV}</dd></div>
                <div className="flex items-baseline justify-between gap-4"><dt className="text-white/75">{c.until}</dt><dd className="max-w-[60%] text-right text-xs leading-snug text-white/85">{c.untilV}</dd></div>
              </dl>
              {raised > 0 ? (
                <div className="mt-4">
                  <p className="text-xs text-white/75">{c.raised}: <strong className="text-white">{usd(raised)}</strong></p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, (raised / offer.targetUsd) * 100)}%` }} />
                  </div>
                </div>
              ) : null}
              {offer.status === 'closed' ? (
                <p className="mt-6 rounded-xl bg-white/15 p-4 text-sm"><strong>{c.closedT}.</strong> {c.closedB}</p>
              ) : offer.status === 'paused' ? (
                <p className="mt-6 rounded-xl bg-white/15 p-4 text-sm"><strong>{c.pausedT}.</strong> {c.pausedB}</p>
              ) : (
                <div className="mt-6 flex flex-col gap-2.5">
                  <a href="#apply" className="btn btn-primary justify-center">{c.apply}</a>
                  <a href={waLink(sale.whatsapp, c.waText)} className="btn justify-center border border-white/40 bg-transparent text-center !text-white hover:bg-white/10" rel="noopener" target="_blank">
                    {c.whatsapp} · {sale.whatsapp}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHead eyebrow={c.howEyebrow} title={c.howTitle} lead={c.howLead(offer.poolPct, usd(offer.targetUsd))} />
        <div className="panel mt-10 overflow-x-auto p-2 sm:p-4">
          <table className="w-full min-w-[480px] text-left text-sm" data-testid="invest-examples">
            <thead className="text-xs uppercase tracking-wider text-steel-400">
              <tr>{c.exHead.map((h) => <th key={h} className="px-3 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {examples.map((n) => {
                const share = shareOf(n, offer);
                return (
                  <tr key={n} className="border-t border-[color:var(--line)]">
                    <td className="px-3 py-3 font-display font-extrabold">{usd(n)}</td>
                    <td className="px-3 py-3 font-semibold">{pct(share)}</td>
                    <td className="px-3 py-3">{eurFmt(10_000 * share)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-steel-500">{c.exNote}</p>
      </section>

      <section className="border-y border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionHead eyebrow={c.countEyebrow} title={c.countTitle} />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {c.counts.map((x, i) => (
              <article key={x.t} className="panel acq-card p-6" style={{ ['--i' as string]: i }}>
                <h3 className="font-display text-lg font-extrabold">{x.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel-500">{x.b}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2">
        <div>
          <SectionHead eyebrow={c.todayEyebrow} title={c.todayTitle} />
          <ul className="mt-8 space-y-3 text-[15px] text-ink-800">
            {c.today.map((x) => <li key={x} className="flex gap-3"><span className="tick">✓</span> {x}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-2xl font-extrabold">{c.buildTitle}</h3>
          <ol className="mt-8 space-y-3">
            {c.build.map((x, i) => (
              <li key={x} className="panel flex gap-4 p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-ink)] font-bold text-white">{i + 1}</span>
                <span className="text-sm leading-relaxed text-steel-500">{x}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectionHead eyebrow={c.stepsEyebrow} title={c.stepsTitle} />
          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {c.steps.map((s, i) => (
              <li key={s.t} className="panel flex gap-4 p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-ink)] font-bold text-white">{i + 1}</span>
                <span>
                  <span className="block font-display font-extrabold">{s.t}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-steel-500">{s.b}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="panel mt-8 border-l-4 border-l-[color:var(--accent)] p-6">
            <p className="font-display text-lg font-extrabold">{c.aloneT}</p>
            <p className="mt-2 text-sm leading-relaxed text-steel-500">{c.aloneB}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16" aria-labelledby="risk">
        <p className="eyebrow">{c.riskEyebrow}</p>
        <h2 id="risk" className="mt-1 font-display text-3xl font-extrabold">{c.riskTitle}</h2>
        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-steel-500">
          {c.risks.map((r) => <li key={r} className="flex gap-3"><span className="mt-1 text-gold-500">◆</span> {r}</li>)}
        </ul>
      </section>

      <section id="apply" className="mx-auto grid max-w-6xl scroll-mt-28 gap-10 px-4 py-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHead eyebrow={c.applyEyebrow} title={c.applyTitle} lead={c.applyLead} />
          <div className="mt-8 panel p-6">
            <p className="font-display text-lg font-extrabold">{c.wholeT}</p>
            <p className="mt-2 text-sm text-steel-500">{c.wholeB}</p>
            <Link href="/acquire" className="mt-3 inline-block text-sm font-semibold underline">{c.wholeLink} →</Link>
          </div>
        </div>
        {open ? (
          <InvestForm lang={lang} min={usd(offer.minUsd)} open={open} />
        ) : (
          <div className="panel p-8 text-sm text-steel-500">
            <p className="font-display text-xl font-extrabold text-ink-900">{offer.status === 'closed' ? c.closedT : c.pausedT}</p>
            <p className="mt-2">{offer.status === 'closed' ? c.closedB : c.pausedB}</p>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="font-display text-3xl font-extrabold">{c.faqTitle}</h2>
        <div className="mt-8 space-y-3">
          {c.faq.map((f) => (
            <details key={f.q} className="panel group p-5">
              <summary className="cursor-pointer list-none font-display font-extrabold">
                <span className="mr-2 inline-block text-gold-500 transition group-open:rotate-45">+</span>{f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-steel-500">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-10 text-sm text-steel-500">
          <Link href="/company" className="underline">PT AXTO DIGITAL GLOBAL</Link> · <Link href="/terms" className="underline">Terms</Link> · <Link href="/privacy" className="underline">Privacy</Link> · <Link href="/disclaimer" className="underline">Disclaimer</Link>
        </p>
      </section>
    </>
  );
}
