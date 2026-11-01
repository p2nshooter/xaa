import Link from 'next/link';
import type { Metadata } from 'next';
import { SectionHead } from '@/components/Studio';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { AcquireForm } from '@/components/forms/AcquireForm';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';
import { pageMetadata, absUrl } from '@/lib/seo';
import { jsonLdHtml } from '@/lib/json-ld';
import { SEO } from '@/content/seo-copy';
import { SITE } from '@/lib/site';
import { getSale, usdWhole, waLink } from '@/server/sale';
import { companyVisible } from '@/server/company';
import { currentUser } from '@/server/auth';
import { saleAuctionView } from '@/server/sale-auction';
import { ladderPrice, nextRiseAt, riseDate } from '@/server/sale-auction-terms';
import { GoldCountdown, SaleAuction } from '@/components/SaleAuction';

/**
 * /acquire — xaa.es itself is for sale.
 *
 * Owner, 18 Oct 2026: "buatkan menu husus di xaa.es untuk menjual lepas xaa.es
 * dengan bahasa profesional, elegan dan berkelas dengan harga $10jt seperti
 * axto.io". Price, status and the buyers' WhatsApp come from Admin → Settings →
 * Sale of xaa.es (server/sale.ts). Every statement below describes what the
 * site really is today; revenue and traffic figures are shown only in the data
 * room, under NDA, never estimated on a public page.
 */

export async function generateMetadata(): Promise<Metadata> {
  const sale = await getSale();
  return pageMetadata({ path: '/acquire', copy: sale.mode === 'auction' ? SEO.acquireAuction : SEO.acquire });
}

type Copy = {
  chip: string; h1a: string; h1b: string; lead: string; priceLabel: string; priceNote: string;
  ctaOffer: string; ctaWhatsapp: string; waText: string;
  soldTitle: string; soldBody: string; pausedTitle: string; pausedBody: string;
  whyEyebrow: string; whyTitle: string; whyLead: string; why: { t: string; b: string }[];
  incEyebrow: string; incTitle: string; inc: string[];
  stepsEyebrow: string; stepsTitle: string; steps: { t: string; b: string }[];
  payEyebrow: string; payTitle: string; pay: { t: string; b: string }[]; payNote: string;
  offerEyebrow: string; offerTitle: string; offerLead: string;
  faqTitle: string; faq: { q: string; a: string }[];
  investT: string; investB: string; investLink: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    chip: 'Acquisition',
    h1a: 'Own xaa.es.',
    h1b: 'The domain, the studio, the platform — outright.',
    lead: 'A rare three-letter Spanish domain carrying a working, multilingual software studio: client portal, live payment rails, a SaaS catalogue and an AI support desk, built on a lean edge stack. Offered once, to one buyer, with a complete and orderly handover.',
    priceLabel: 'Asking price', priceNote: 'Offers are welcome. Every serious enquiry is answered personally by the owner.',
    ctaOffer: 'Make an offer', ctaWhatsapp: 'Talk to the owner on WhatsApp',
    waText: 'Hello, I am interested in acquiring xaa.es.',
    soldTitle: 'xaa.es has been sold', soldBody: 'Thank you to everyone who expressed interest. The studio continues under its new owner.',
    pausedTitle: 'The sale is paused', pausedBody: 'The owner is not taking new offers at the moment. You can still write to hello@axto.io.',
    whyEyebrow: 'Why xaa.es', whyTitle: 'An asset that is already working',
    whyLead: 'Most domains for sale are a name and a promise. xaa.es is a name with a business already standing on it.',
    why: [
      { t: 'A three-letter .es name', b: 'Short, memorable and pronounceable in every European language — the kind of address that is almost never released, and gives any brand instant authority in Spain and the Spanish-speaking world.' },
      { t: 'A studio that sells from day one', b: 'Published service packages from landing pages to enterprise platforms, with milestone pricing, a project brief flow and a delivery process clients can follow step by step.' },
      { t: 'Payments already wired', b: 'PayPal Checkout that confirms itself, SWIFT wires in EUR and USD, and USDT on three networks — invoices, receipts and reconciliation included. No gateway project to start.' },
      { t: 'A client portal, not a contact form', b: 'Clients register, open projects, pay milestones, upload concepts and track progress. The admin side runs leads, invoices, payment destinations, support and backups.' },
      { t: 'Three languages, written by hand', b: 'English, Spanish and Indonesian across the studio pages, with hreflang, structured data and per-language canonicals — a search footprint that would take months to rebuild.' },
      { t: 'Lean to run', b: 'Built on Cloudflare Workers with R2 storage: no servers or databases to patch, global delivery, and running costs measured in tens of dollars a month rather than thousands.' },
      { t: 'Room to grow', b: 'A SaaS template catalogue ready to fill with products, an editorial archive that can carry advertising, and a revenue-share programme for xaa.es investors already running.' },
      { t: 'A clean, documented handover', b: 'A written blueprint of every system, automated tests and deployment pipelines, so your team understands exactly what it is taking over.' },
    ],
    incEyebrow: 'What changes hands', incTitle: 'Everything, in one transaction',
    inc: [
      'The domain xaa.es, transferred to your registrar account',
      'The complete source code and its full Git history',
      'The database: content, catalogue, settings and records, exported and imported for you',
      'The brand: name, marks, logos, colours and design system',
      'The client portal and admin, with every module and integration',
      'The SaaS template catalogue and the editorial archive',
      'Deployment pipelines, automated tests and the project blueprint',
      'A guided handover of hosting, payment and email accounts to your company',
      'An announcement to existing clients that the studio has a new owner',
      'Thirty days of handover support from the founding team',
    ],
    stepsEyebrow: 'How the purchase works', stepsTitle: 'Five calm steps, no surprises',
    steps: [
      { t: 'Offer or request', b: 'Send an offer or ask to buy at the asking price. The owner answers within one business day.' },
      { t: 'NDA and proof of funds', b: 'A mutual NDA is signed and you share proof of funds or financing, privately.' },
      { t: 'Due diligence', b: 'A data room with traffic, revenue and cost records, a code walkthrough and answers to every question.' },
      { t: 'Agreement and payment', b: 'A purchase agreement is signed and payment is made by SWIFT wire, USDT, or through an escrow service you choose.' },
      { t: 'Handover', b: 'Domain, code, database and accounts move to you on a written checklist, usually within fourteen days of cleared funds.' },
    ],
    payEyebrow: 'Payment', payTitle: 'Settled through established rails',
    pay: [
      { t: 'SWIFT bank wire', b: 'USD or EUR to the owner’s business account at Bank Negara Indonesia (SWIFT BNINIDJA). Account details are shared inside the signed agreement, never on a public page.' },
      { t: 'Escrow', b: 'For your protection, the purchase can run through a licensed escrow service of your choice: funds are released only when the handover is complete.' },
      { t: 'USDT', b: 'Part or all of the price can be settled in USDT on TRC20 or BEP20, confirmed on-chain.' },
      { t: 'PayPal', b: 'Available for a reservation deposit within PayPal’s own limits; the balance moves by wire or escrow.' },
    ],
    payNote: 'Send proof of funds and payment proof on WhatsApp. Never act on payment details that reach you by email or chat without being confirmed in the signed agreement.',
    offerEyebrow: 'Start the conversation', offerTitle: 'Make your offer',
    offerLead: 'Tell us who you are and what you have in mind. Your enquiry goes straight to the owner — not to a broker, and not to a mailing list.',
    faqTitle: 'Questions buyers ask',
    faq: [
      { q: 'Can I see revenue and traffic before making an offer?', a: 'Yes. After a mutual NDA you receive access to a data room with the real figures, cost records and analytics. We do not publish estimates on a public page.' },
      { q: 'Is the price negotiable?', a: 'The asking price reflects the domain, the platform and the business together. Reasoned offers are welcome and answered personally.' },
      { q: 'How long does the handover take?', a: 'Usually within fourteen days of cleared funds: domain transfer, repository, database, hosting and payment accounts, each ticked off on a written checklist.' },
      { q: 'Do I need technical staff to run it?', a: 'Not to keep it online: the platform runs on managed edge infrastructure. To grow it, any capable web team can work on the codebase; the blueprint documents every part.' },
      { q: 'Can the studio’s team stay on?', a: 'Thirty days of handover support are included. Longer arrangements can be agreed as part of the purchase.' },
      { q: 'Which law governs the sale?', a: 'The purchase agreement sets the governing law and jurisdiction; it is agreed between buyer and seller before any payment is made.' },
    ],
    investT: 'Prefer a stake to the whole?', investB: 'xaa.es runs its own investor round: a monthly share of xaa.es revenue, pro rata to your capital, until a full acquisition returns it.', investLink: 'See the xaa.es investor offering',
  },
  es: {
    chip: 'Adquisición',
    h1a: 'Sea dueño de xaa.es.',
    h1b: 'El dominio, el estudio, la plataforma — en propiedad.',
    lead: 'Un dominio español de tres letras, poco común, que sostiene un estudio de software multilingüe en funcionamiento: portal de clientes, pagos reales operativos, catálogo SaaS y un servicio de soporte con IA, sobre una infraestructura ligera en el edge. Se ofrece una sola vez, a un solo comprador, con un traspaso completo y ordenado.',
    priceLabel: 'Precio solicitado', priceNote: 'Se aceptan ofertas. El propietario responde personalmente a cada consulta seria.',
    ctaOffer: 'Hacer una oferta', ctaWhatsapp: 'Hablar con el propietario por WhatsApp',
    waText: 'Hola, me interesa adquirir xaa.es.',
    soldTitle: 'xaa.es ha sido vendido', soldBody: 'Gracias a todas las personas interesadas. El estudio continúa con su nuevo propietario.',
    pausedTitle: 'La venta está en pausa', pausedBody: 'El propietario no acepta nuevas ofertas por ahora. Puede escribir a hello@axto.io.',
    whyEyebrow: 'Por qué xaa.es', whyTitle: 'Un activo que ya funciona',
    whyLead: 'La mayoría de dominios en venta son un nombre y una promesa. xaa.es es un nombre con un negocio ya construido encima.',
    why: [
      { t: 'Un nombre .es de tres letras', b: 'Corto, memorable y pronunciable en cualquier idioma europeo: el tipo de dirección que casi nunca se libera y que da autoridad inmediata a cualquier marca en España y en el mundo hispanohablante.' },
      { t: 'Un estudio que vende desde el primer día', b: 'Paquetes de servicios publicados, desde landing pages hasta plataformas empresariales, con precios por hitos, flujo de brief y un proceso de entrega que el cliente sigue paso a paso.' },
      { t: 'Pagos ya conectados', b: 'PayPal Checkout que se confirma solo, transferencias SWIFT en EUR y USD, y USDT en tres redes, con facturas, recibos y conciliación. Ningún proyecto de pasarela por empezar.' },
      { t: 'Un portal de clientes, no un formulario', b: 'Los clientes se registran, abren proyectos, pagan hitos, suben conceptos y siguen el avance. La administración gestiona leads, facturas, destinos de pago, soporte y copias de seguridad.' },
      { t: 'Tres idiomas, escritos a mano', b: 'Inglés, español e indonesio en las páginas del estudio, con hreflang, datos estructurados y canónicas por idioma: una huella en buscadores que costaría meses reconstruir.' },
      { t: 'Ligero de operar', b: 'Construido sobre Cloudflare Workers con almacenamiento R2: sin servidores ni bases de datos que parchear, entrega global y costes de funcionamiento de decenas de dólares al mes, no de miles.' },
      { t: 'Margen para crecer', b: 'Un catálogo de plantillas SaaS listo para llenarse de productos, un archivo editorial que admite publicidad y un programa de reparto de ingresos para inversores de xaa.es ya en marcha.' },
      { t: 'Un traspaso limpio y documentado', b: 'Un blueprint escrito de cada sistema, pruebas automatizadas y pipelines de despliegue, para que su equipo sepa exactamente qué recibe.' },
    ],
    incEyebrow: 'Qué cambia de manos', incTitle: 'Todo, en una sola operación',
    inc: [
      'El dominio xaa.es, transferido a la cuenta de su registrador',
      'El código fuente completo con todo su historial de Git',
      'La base de datos: contenido, catálogo, ajustes y registros, exportados e importados por nosotros',
      'La marca: nombre, símbolos, logotipos, colores y sistema de diseño',
      'El portal de clientes y la administración, con todos sus módulos e integraciones',
      'El catálogo de plantillas SaaS y el archivo editorial',
      'Pipelines de despliegue, pruebas automatizadas y el blueprint del proyecto',
      'Un traspaso guiado de las cuentas de hosting, pagos y correo a su empresa',
      'Un aviso a los clientes actuales de que el estudio tiene nuevo propietario',
      'Treinta días de soporte de traspaso por parte del equipo fundador',
    ],
    stepsEyebrow: 'Cómo funciona la compra', stepsTitle: 'Cinco pasos serenos, sin sorpresas',
    steps: [
      { t: 'Oferta o solicitud', b: 'Envíe una oferta o pida comprar al precio solicitado. El propietario responde en un día hábil.' },
      { t: 'NDA y prueba de fondos', b: 'Se firma un NDA mutuo y usted comparte, en privado, la prueba de fondos o de financiación.' },
      { t: 'Due diligence', b: 'Una sala de datos con tráfico, ingresos y costes, un recorrido por el código y respuesta a cada pregunta.' },
      { t: 'Contrato y pago', b: 'Se firma el contrato de compraventa y se paga por transferencia SWIFT, en USDT o mediante el servicio de escrow que usted elija.' },
      { t: 'Traspaso', b: 'Dominio, código, base de datos y cuentas pasan a usted según una lista escrita, normalmente en catorce días desde la recepción de fondos.' },
    ],
    payEyebrow: 'Pago', payTitle: 'Liquidado por vías consolidadas',
    pay: [
      { t: 'Transferencia SWIFT', b: 'En USD o EUR a la cuenta empresarial del propietario en Bank Negara Indonesia (SWIFT BNINIDJA). Los datos de la cuenta se comparten dentro del contrato firmado, nunca en una página pública.' },
      { t: 'Escrow', b: 'Para su protección, la compra puede pasar por un servicio de escrow autorizado de su elección: los fondos se liberan solo cuando el traspaso está completo.' },
      { t: 'USDT', b: 'Parte o la totalidad del precio puede liquidarse en USDT en TRC20 o BEP20, confirmado on-chain.' },
      { t: 'PayPal', b: 'Disponible para una señal de reserva dentro de los límites de PayPal; el resto se paga por transferencia o escrow.' },
    ],
    payNote: 'Envíe la prueba de fondos y los justificantes de pago por WhatsApp. Nunca actúe sobre datos de pago que le lleguen por email o chat sin estar confirmados en el contrato firmado.',
    offerEyebrow: 'Inicie la conversación', offerTitle: 'Haga su oferta',
    offerLead: 'Cuéntenos quién es y qué tiene en mente. Su consulta llega directamente al propietario — no a un intermediario ni a una lista de correo.',
    faqTitle: 'Preguntas de los compradores',
    faq: [
      { q: '¿Puedo ver ingresos y tráfico antes de ofertar?', a: 'Sí. Tras un NDA mutuo recibe acceso a una sala de datos con las cifras reales, los costes y la analítica. No publicamos estimaciones en una página pública.' },
      { q: '¿El precio es negociable?', a: 'El precio solicitado refleja el dominio, la plataforma y el negocio en conjunto. Las ofertas razonadas son bienvenidas y se responden personalmente.' },
      { q: '¿Cuánto tarda el traspaso?', a: 'Normalmente catorce días desde la recepción de fondos: dominio, repositorio, base de datos, hosting y cuentas de pago, cada uno marcado en una lista escrita.' },
      { q: '¿Necesito personal técnico para operarlo?', a: 'No para mantenerlo en línea: la plataforma funciona sobre infraestructura edge gestionada. Para hacerlo crecer, cualquier equipo web competente puede trabajar sobre el código; el blueprint documenta cada parte.' },
      { q: '¿Puede quedarse el equipo del estudio?', a: 'Se incluyen treinta días de soporte de traspaso. Acuerdos más largos pueden pactarse dentro de la compra.' },
      { q: '¿Qué ley rige la venta?', a: 'El contrato de compraventa fija la ley aplicable y la jurisdicción; se acuerda entre comprador y vendedor antes de cualquier pago.' },
    ],
    investT: '¿Prefiere una participación en lugar del todo?', investB: 'xaa.es tiene su propia ronda para inversores: una parte mensual de los ingresos de xaa.es, proporcional a tu capital, hasta una adquisición completa que lo devuelve.', investLink: 'Ver la oferta para inversores de xaa.es',
  },
  id: {
    chip: 'Akuisisi',
    h1a: 'Miliki xaa.es.',
    h1b: 'Domainnya, studionya, platformnya — sepenuhnya.',
    lead: 'Domain Spanyol tiga huruf yang langka, membawa studio perangkat lunak multibahasa yang sudah berjalan: portal klien, jalur pembayaran live, katalog SaaS dan meja bantuan AI, di atas infrastruktur edge yang ramping. Ditawarkan sekali, kepada satu pembeli, dengan serah terima yang lengkap dan tertib.',
    priceLabel: 'Harga yang diminta', priceNote: 'Penawaran dipersilakan. Setiap pertanyaan serius dijawab langsung oleh pemilik.',
    ctaOffer: 'Ajukan penawaran', ctaWhatsapp: 'Bicara dengan pemilik lewat WhatsApp',
    waText: 'Halo, saya tertarik mengakuisisi xaa.es.',
    soldTitle: 'xaa.es telah terjual', soldBody: 'Terima kasih kepada semua yang berminat. Studio berlanjut di bawah pemilik barunya.',
    pausedTitle: 'Penjualan sedang dijeda', pausedBody: 'Pemilik sedang tidak menerima penawaran baru. Anda tetap bisa menulis ke hello@axto.io.',
    whyEyebrow: 'Mengapa xaa.es', whyTitle: 'Aset yang sudah bekerja',
    whyLead: 'Kebanyakan domain yang dijual hanyalah nama dan janji. xaa.es adalah nama dengan bisnis yang sudah berdiri di atasnya.',
    why: [
      { t: 'Nama .es tiga huruf', b: 'Pendek, mudah diingat dan mudah diucapkan dalam bahasa Eropa mana pun — jenis alamat yang hampir tidak pernah dilepas, dan langsung memberi wibawa bagi merek apa pun di Spanyol dan dunia berbahasa Spanyol.' },
      { t: 'Studio yang menjual sejak hari pertama', b: 'Paket layanan yang sudah terbit, dari landing page sampai platform enterprise, dengan harga bertahap, alur brief proyek, dan proses penyerahan yang bisa diikuti klien langkah demi langkah.' },
      { t: 'Pembayaran sudah tersambung', b: 'PayPal Checkout yang terkonfirmasi sendiri, transfer SWIFT dalam EUR dan USD, dan USDT di tiga jaringan — lengkap dengan invoice, kuitansi dan rekonsiliasi. Tidak perlu proyek payment gateway baru.' },
      { t: 'Portal klien, bukan sekadar formulir', b: 'Klien mendaftar, membuka proyek, membayar termin, mengunggah konsep, dan memantau progres. Sisi admin mengelola leads, invoice, tujuan pembayaran, support dan backup.' },
      { t: 'Tiga bahasa, ditulis manual', b: 'Inggris, Spanyol dan Indonesia di halaman-halaman studio, lengkap dengan hreflang, data terstruktur dan kanonis per bahasa — jejak mesin pencari yang butuh berbulan-bulan untuk dibangun ulang.' },
      { t: 'Ringan dijalankan', b: 'Dibangun di Cloudflare Workers dengan penyimpanan R2: tanpa server atau database yang perlu ditambal, pengiriman global, dan biaya operasional puluhan dolar per bulan, bukan ribuan.' },
      { t: 'Ruang untuk tumbuh', b: 'Katalog template SaaS yang siap diisi produk, arsip editorial yang bisa memuat iklan, dan program bagi hasil untuk pemodal xaa.es yang sudah berjalan.' },
      { t: 'Serah terima bersih dan terdokumentasi', b: 'Blueprint tertulis setiap sistem, tes otomatis dan pipeline deploy, sehingga tim Anda tahu persis apa yang diambil alih.' },
    ],
    incEyebrow: 'Yang berpindah tangan', incTitle: 'Semuanya, dalam satu transaksi',
    inc: [
      'Domain xaa.es, dipindahkan ke akun registrar Anda',
      'Kode sumber lengkap beserta seluruh riwayat Git-nya',
      'Database: konten, katalog, pengaturan dan catatan, diekspor dan diimpor untuk Anda',
      'Merek: nama, tanda, logo, warna dan design system',
      'Portal klien dan admin, dengan setiap modul dan integrasinya',
      'Katalog template SaaS dan arsip editorial',
      'Pipeline deploy, tes otomatis dan blueprint proyek',
      'Serah terima terpandu akun hosting, pembayaran dan email ke perusahaan Anda',
      'Pengumuman kepada klien yang ada bahwa studio memiliki pemilik baru',
      'Tiga puluh hari dukungan serah terima dari tim pendiri',
    ],
    stepsEyebrow: 'Cara pembelian', stepsTitle: 'Lima langkah tenang, tanpa kejutan',
    steps: [
      { t: 'Penawaran atau permintaan', b: 'Kirim penawaran atau minta membeli di harga yang diminta. Pemilik menjawab dalam satu hari kerja.' },
      { t: 'NDA dan bukti dana', b: 'NDA dua arah ditandatangani dan Anda berbagi bukti dana atau pembiayaan secara pribadi.' },
      { t: 'Due diligence', b: 'Data room berisi trafik, pendapatan dan biaya, penelusuran kode, dan jawaban untuk setiap pertanyaan.' },
      { t: 'Perjanjian dan pembayaran', b: 'Perjanjian jual beli ditandatangani, lalu pembayaran lewat transfer SWIFT, USDT, atau layanan escrow pilihan Anda.' },
      { t: 'Serah terima', b: 'Domain, kode, database dan akun berpindah kepada Anda sesuai daftar tertulis, biasanya dalam empat belas hari setelah dana diterima.' },
    ],
    payEyebrow: 'Pembayaran', payTitle: 'Diselesaikan lewat jalur yang mapan',
    pay: [
      { t: 'Transfer bank SWIFT', b: 'USD atau EUR ke rekening bisnis pemilik di Bank Negara Indonesia (SWIFT BNINIDJA). Detail rekening dibagikan di dalam perjanjian yang sudah ditandatangani, tidak pernah di halaman publik.' },
      { t: 'Escrow', b: 'Demi keamanan Anda, pembelian dapat melalui layanan escrow berizin pilihan Anda: dana baru dilepas setelah serah terima selesai.' },
      { t: 'USDT', b: 'Sebagian atau seluruh harga dapat dibayar dalam USDT di TRC20 atau BEP20, terkonfirmasi on-chain.' },
      { t: 'PayPal', b: 'Tersedia untuk uang muka pemesanan dalam batas PayPal; sisanya lewat transfer atau escrow.' },
    ],
    payNote: 'Kirim bukti dana dan bukti pembayaran lewat WhatsApp. Jangan pernah mengikuti detail pembayaran yang datang lewat email atau chat tanpa dikonfirmasi di perjanjian yang sudah ditandatangani.',
    offerEyebrow: 'Mulai percakapan', offerTitle: 'Ajukan penawaran Anda',
    offerLead: 'Ceritakan siapa Anda dan apa rencana Anda. Pertanyaan Anda langsung sampai ke pemilik — bukan ke broker, dan bukan ke milis.',
    faqTitle: 'Pertanyaan para pembeli',
    faq: [
      { q: 'Bisakah saya melihat pendapatan dan trafik sebelum menawar?', a: 'Bisa. Setelah NDA dua arah, Anda mendapat akses data room berisi angka sebenarnya, catatan biaya dan analitik. Kami tidak memajang perkiraan di halaman publik.' },
      { q: 'Apakah harganya bisa ditawar?', a: 'Harga yang diminta mencerminkan domain, platform dan bisnisnya sekaligus. Penawaran yang beralasan dipersilakan dan dijawab langsung.' },
      { q: 'Berapa lama serah terimanya?', a: 'Biasanya empat belas hari setelah dana diterima: transfer domain, repositori, database, hosting dan akun pembayaran, masing-masing dicentang di daftar tertulis.' },
      { q: 'Apakah saya butuh staf teknis untuk menjalankannya?', a: 'Tidak untuk sekadar tetap online: platform berjalan di infrastruktur edge terkelola. Untuk mengembangkannya, tim web mana pun yang cakap bisa bekerja di kodenya; blueprint mendokumentasikan setiap bagian.' },
      { q: 'Bisakah tim studio tetap membantu?', a: 'Tiga puluh hari dukungan serah terima sudah termasuk. Kerja sama lebih lama bisa disepakati sebagai bagian dari pembelian.' },
      { q: 'Hukum mana yang berlaku?', a: 'Perjanjian jual beli menentukan hukum yang berlaku dan yurisdiksinya; disepakati pembeli dan penjual sebelum ada pembayaran.' },
    ],
    investT: 'Lebih suka bagi hasil daripada membeli seluruhnya?', investB: 'xaa.es punya putaran pemodalnya sendiri: bagi hasil bulanan dari pendapatan xaa.es, sebanding dengan modal Anda, sampai akuisisi penuh mengembalikannya.', investLink: 'Lihat penawaran pemodal xaa.es',
  },
};

/** What changes on this page while xaa.es is sold by auction (docs/BLUEPRINT.md §14, request 66). */
type AucCopy = {
  chip: string; from: string; opening: string; current: string; winning: string; endsIn: string; note: string; rises: string; cta: string;
  step1: { t: string; b: string }; priceQ: string; priceA: string;
};

const AUC: Record<Lang, AucCopy> = {
  en: {
    chip: 'Live auction · Round {n}', from: 'Bids from', opening: 'Opening bid', current: 'Current bid', winning: 'Winning bid', endsIn: 'Ends in',
    note: 'No hidden reserve: the highest bid when the clock stops buys xaa.es.', rises: 'The opening bid rises by {weekly} every week — next on {date}.', cta: 'Place a bid',
    step1: { t: 'Register and bid', b: 'Register as a bidder, and bid before the clock stops. The highest bid at the deadline wins — there is no hidden reserve.' },
    priceQ: 'How is the price set?',
    priceA: 'By the auction. The opening bid started at US$10 million on 28 October 2026 and rises by US$100,000 every week, the same for every bidder, and the highest bid when the clock stops buys xaa.es. A bid in the last minutes extends the round, so nobody is outbid by a last-second snipe.',
  },
  es: {
    chip: 'Subasta en directo · Ronda {n}', from: 'Pujas desde', opening: 'Puja de salida', current: 'Puja actual', winning: 'Puja ganadora', endsIn: 'Termina en',
    note: 'Sin precio de reserva oculto: la puja más alta al terminar el tiempo compra xaa.es.', rises: 'La puja de salida sube {weekly} cada semana: la próxima vez, el {date}.', cta: 'Pujar',
    step1: { t: 'Registro y puja', b: 'Regístrese como pujador y puje antes de que termine el tiempo. Gana la puja más alta al cierre: no hay precio de reserva oculto.' },
    priceQ: '¿Cómo se fija el precio?',
    priceA: 'Con la subasta. La puja de salida empezó en 10 millones de dólares el 28 de octubre de 2026 y sube 100.000 dólares cada semana, igual para todos, y la puja más alta al terminar el tiempo compra xaa.es. Una puja en los últimos minutos amplía la ronda, así que nadie pierde por una puja de último segundo.',
  },
  id: {
    chip: 'Lelang langsung · Putaran {n}', from: 'Tawaran mulai', opening: 'Tawaran pembuka', current: 'Tawaran saat ini', winning: 'Tawaran menang', endsIn: 'Berakhir dalam',
    note: 'Tanpa reserve tersembunyi: tawaran tertinggi saat waktu habis membeli xaa.es.', rises: 'Tawaran pembuka naik {weekly} setiap minggu — berikutnya pada {date}.', cta: 'Ajukan tawaran',
    step1: { t: 'Daftar dan menawar', b: 'Daftar sebagai penawar, lalu menawar sebelum waktu habis. Tawaran tertinggi saat tenggat menang — tanpa reserve tersembunyi.' },
    priceQ: 'Bagaimana harga ditentukan?',
    priceA: 'Lewat lelang. Tawaran pembuka dimulai dari US$10 juta pada 28 Oktober 2026 dan naik US$100.000 setiap minggu, sama untuk semua penawar, dan tawaran tertinggi saat waktu habis membeli xaa.es. Tawaran di menit-menit terakhir memperpanjang putaran, jadi tidak ada yang kalah oleh tawaran detik terakhir.',
  },
};

const UNITS: Record<Lang, [string, string, string, string]> = { en: ['d', 'h', 'm', 's'], es: ['d', 'h', 'm', 's'], id: ['h', 'j', 'm', 'd'] };

export default async function AcquirePage() {
  const lang = await getLang();
  const company = await companyVisible();
  const base = pick(lang, COPY);
  const viewer = await currentUser();
  // A storage hiccup never takes the page down: it then shows the sale without the live board.
  const { sale, round, me, approval } = await saleAuctionView(viewer).catch(async (err) => {
    console.error('acquire: auction view failed:', err);
    const s = await getSale();
    return { sale: s, round: null, me: null, approval: s.auction.approval };
  });
  const auction = sale.mode === 'auction';
  const a = pick(lang, AUC);
  // In an auction the first step is to bid, and the price is the auction's, not an asking price.
  const c = auction
    ? { ...base, steps: [a.step1, ...base.steps.slice(1)], faq: base.faq.map((f, i) => (i === 1 ? { q: a.priceQ, a: a.priceA } : f)) }
    : base;
  const price = usdWhole(sale.priceUsd);
  const open = sale.status === 'open';
  const url = absUrl('/acquire');
  const live = auction && round?.status === 'open';
  const won = auction && (round?.status === 'awaiting_payment' || round?.status === 'sold');
  const shown = !round ? 0 : won ? round.winnerUsd : round.bidsCount ? round.highUsd : round.openUsd;
  const rise = auction ? nextRiseAt(sale.auction) : '';

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'xaa.es — domain, studio platform and brand',
      description: SEO.acquire.en.description,
      brand: { '@type': 'Brand', name: SITE.name },
      url,
      offers: auction
        ? {
          // Sold by auction (§14): the lowest bid accepted today is the weekly ladder's opening bid.
          '@type': 'Offer',
          priceCurrency: 'USD',
          priceSpecification: { '@type': 'PriceSpecification', minPrice: ladderPrice(sale.auction), priceCurrency: 'USD' },
          availability: sale.status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
          url: `${url}#bid`,
          seller: { '@type': 'Organization', name: 'PT AXTO DIGITAL GLOBAL', url: SITE.url },
        }
        : {
          '@type': 'Offer',
          price: sale.priceUsd,
          priceCurrency: 'USD',
          availability: sale.status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
          url,
          seller: { '@type': 'Organization', name: 'PT AXTO DIGITAL GLOBAL', url: SITE.url },
        },
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

      <Breadcrumbs trail={[{ label: c.chip }]} className="pb-4" />
      <section className={`${auction ? 'sauc-house' : 'acq-hero'} relative overflow-hidden border-b border-[color:var(--line)] text-white`}>
        {auction ? <div className="sauc-grid pointer-events-none absolute inset-0" aria-hidden /> : <div className="mk-grid-bg absolute inset-0 opacity-15" aria-hidden />}
        <div className={auction ? 'sauc-glow pointer-events-none absolute inset-0' : 'acq-glow'} aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:pb-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
            <div>
              <p className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${auction ? 'border-[#e0b44d]/40 text-[#f3d98b]' : 'border-white/25 text-white/80'}`}>
                <span className="mk-live-dot" /> {live && round ? a.chip.replace('{n}', String(round.no)) : c.chip}
              </p>
              {auction ? (
                <h1 className="sauc-serif mt-5 text-4xl font-semibold leading-[1.05] sm:text-6xl">
                  <span className="sauc-gold italic">{c.h1a}</span>
                  <span className="mt-3 block text-2xl font-normal leading-snug text-[#f9eccb]/85 sm:text-3xl">{c.h1b}</span>
                </h1>
              ) : (
                <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
                  {c.h1a}
                  <span className="mt-2 block text-2xl font-bold leading-snug text-white/85 sm:text-3xl">{c.h1b}</span>
                </h1>
              )}
              <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/85">{c.lead}</p>
            </div>
            {auction ? (
              <div className="sauc-glass relative rounded-[28px] p-7" data-testid="sale-hero">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#f3d98b]/75">{!round ? a.from : won ? a.winning : round.bidsCount ? a.current : a.opening}</p>
                <p className="sauc-gold sauc-shimmer sauc-serif sauc-nums mt-2 text-4xl font-semibold leading-none tracking-tight sm:text-5xl">{usdWhole(shown || ladderPrice(sale.auction))}</p>
                {live && round ? (
                  <div className="mt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#f3d98b]/75">{a.endsIn}</p>
                    <div className="mt-2"><GoldCountdown to={round.endsAt} units={UNITS[lang] || UNITS.en} /></div>
                  </div>
                ) : null}
                {live && rise ? <p className="mt-5 text-sm font-semibold text-[#f3d98b]" data-testid="sale-hero-rise"><span className="mr-1.5" aria-hidden>▲</span>{a.rises.replace('{weekly}', usdWhole(sale.auction.weeklyUsd)).replace('{date}', riseDate(rise, lang))}</p> : null}
                <p className="mt-3 text-sm leading-relaxed text-[#f9eccb]/85"><span className="mr-1.5 text-[#ecc96a]" aria-hidden>✦</span>{a.note}</p>
                {sale.status === 'sold' ? (
                  <p className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm"><strong>{c.soldTitle}.</strong> {c.soldBody}</p>
                ) : sale.status === 'paused' ? (
                  <p className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm"><strong>{c.pausedTitle}.</strong> {c.pausedBody}</p>
                ) : (
                  <div className="mt-6 flex flex-col gap-2.5">
                    <a href="#bid" className="sauc-btn">{a.cta}</a>
                    <a href={waLink(sale.whatsapp, c.waText)} className="sauc-btn-ghost text-center" rel="noopener" target="_blank">
                      {c.ctaWhatsapp} · {sale.whatsapp}
                    </a>
                  </div>
                )}
              </div>
            ) : (
            <div className="acq-price rounded-3xl border border-white/20 bg-white/10 p-7 backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">{c.priceLabel}</p>
              <p className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{price}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/80">{c.priceNote}</p>
              {sale.status === 'sold' ? (
                <p className="mt-6 rounded-xl bg-white/15 p-4 text-sm"><strong>{c.soldTitle}.</strong> {c.soldBody}</p>
              ) : sale.status === 'paused' ? (
                <p className="mt-6 rounded-xl bg-white/15 p-4 text-sm"><strong>{c.pausedTitle}.</strong> {c.pausedBody}</p>
              ) : (
                <div className="mt-6 flex flex-col gap-2.5">
                  <a href="#offer" className="btn btn-primary justify-center">{c.ctaOffer}</a>
                  <a href={waLink(sale.whatsapp, c.waText)} className="btn justify-center border border-white/40 bg-transparent text-center !text-white hover:bg-white/10" rel="noopener" target="_blank">
                    {c.ctaWhatsapp} · {sale.whatsapp}
                  </a>
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </section>

      {auction && sale.status !== 'paused' ? (
        <SaleAuction lang={lang} round={round} me={me} approval={approval} signedIn={!!viewer} />
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHead eyebrow={c.whyEyebrow} title={c.whyTitle} lead={c.whyLead} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.why.map((w, i) => (
            <article key={w.t} className="panel acq-card p-6" style={{ ['--i' as string]: i }}>
              <p className="font-display text-3xl font-extrabold text-gold-500">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-3 font-display text-lg font-extrabold leading-snug">{w.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-500">{w.b}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[color:var(--line)] bg-[color:var(--surface)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow={c.incEyebrow} title={c.incTitle} />
            <ul className="mt-8 space-y-3 text-[15px] text-ink-800">
              {c.inc.map((x) => (
                <li key={x} className="flex gap-3"><span className="tick">✓</span> {x}</li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHead eyebrow={c.stepsEyebrow} title={c.stepsTitle} />
            <ol className="mt-8 space-y-4">
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
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHead eyebrow={c.payEyebrow} title={c.payTitle} />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {c.pay.map((p) => (
            <div key={p.t} className="panel p-6">
              <h3 className="font-display text-lg font-extrabold">{p.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-500">{p.b}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 panel border-l-4 border-l-[color:var(--accent)] p-5 text-sm leading-relaxed text-steel-500">
          {c.payNote} <a className="font-semibold underline" href={waLink(sale.whatsapp, c.waText)} target="_blank" rel="noopener">WhatsApp {sale.whatsapp}</a>
        </p>
      </section>

      {auction ? (
        <section className="mx-auto max-w-6xl px-4 py-6">
          <div className="panel p-6">
            <p className="font-display text-lg font-extrabold">{c.investT}</p>
            <p className="mt-2 text-sm text-steel-500">{c.investB}</p>
            <Link href="/invest" className="mt-3 inline-block text-sm font-semibold underline">{c.investLink} →</Link>
          </div>
        </section>
      ) : (
      <section id="offer" className="mx-auto grid max-w-6xl scroll-mt-28 gap-10 px-4 py-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHead eyebrow={c.offerEyebrow} title={c.offerTitle} lead={c.offerLead} />
          <div className="mt-8 panel p-6">
            <p className="font-display text-lg font-extrabold">{c.investT}</p>
            <p className="mt-2 text-sm text-steel-500">{c.investB}</p>
            <Link href="/invest" className="mt-3 inline-block text-sm font-semibold underline">{c.investLink} →</Link>
          </div>
        </div>
        {open ? (
          <AcquireForm lang={lang} price={price} open={open} />
        ) : (
          <div className="panel p-8 text-sm text-steel-500">
            <p className="font-display text-xl font-extrabold text-ink-900">{sale.status === 'sold' ? c.soldTitle : c.pausedTitle}</p>
            <p className="mt-2">{sale.status === 'sold' ? c.soldBody : c.pausedBody}</p>
          </div>
        )}
      </section>
      )}

      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="font-display text-3xl font-extrabold">{c.faqTitle}</h2>
        <div className="mt-8 space-y-3">
          {c.faq.map((f) => (
            <details key={f.q} className="panel group p-5">
              <summary className="cursor-pointer list-none font-display font-extrabold">
                <span className="mr-2 text-gold-500 transition group-open:rotate-45 inline-block">+</span>{f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-steel-500">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-10 text-sm text-steel-500">
          {company ? <Link href="/company" className="underline">PT AXTO DIGITAL GLOBAL</Link> : 'PT AXTO DIGITAL GLOBAL'} · <Link href="/terms" className="underline">Terms</Link> · <Link href="/privacy" className="underline">Privacy</Link>
        </p>
      </section>
    </>
  );
}
