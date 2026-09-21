/**
 * Manual, sticky, three-language localisation.
 *
 * This module is import-safe from both client and server components: it holds
 * only data and pure helpers. The cookie read that needs `next/headers` lives
 * in `i18n.server.ts` so the client switcher can share these constants without
 * dragging a server-only API into the browser bundle.
 *
 * Three principles the owner set, and how each is met:
 *
 *  - "tiga bahasa: inggris, spanyol, indonesia" → LANGS below.
 *  - "translate manual, jangan auto" → every string is written by hand in
 *    DICT. Nothing is machine-translated at build or request time; a key with
 *    no translation falls back to English rather than being guessed.
 *  - "kalau pilih Indonesia, jangan balik ke Inggris saat pindah menu/refresh
 *    — lock sampai dipindah manual" → the choice is a first-party cookie
 *    (COOKIE, one year), read on the server for every page. It survives
 *    navigation and refresh and only changes when the visitor picks another
 *    language.
 */

export const LANGS = ['en', 'es', 'id'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';
export const LANG_COOKIE = 'xaa_lang';

export const LANG_LABEL: Record<Lang, string> = {
  en: 'English',
  es: 'Español',
  id: 'Indonesia',
};
/** Short code shown in the compact switcher. */
export const LANG_SHORT: Record<Lang, string> = { en: 'EN', es: 'ES', id: 'ID' };

export function isLang(v: string | undefined): v is Lang {
  return !!v && (LANGS as readonly string[]).includes(v);
}

/**
 * The dictionary. English is the complete source of truth; a missing Spanish
 * or Indonesian key falls back to English, so a half-translated page still
 * renders rather than showing a raw key.
 */
type Dict = Record<string, string>;

const EN: Dict = {
  // Chrome — promo strip
  'promo.slot': 'Taking projects for the next production slot — start from a 10% deposit',
  'promo.paid': 'Paid in USDT or PayPal',
  'promo.milestone': 'Milestone-based, never all up front',
  // Chrome — nav
  'nav.services': 'Services',
  'nav.work': 'Work',
  'nav.process': 'How it works',
  'nav.care': 'Setup & Care',
  'nav.payments': 'Payments',
  'nav.capabilities': 'Capabilities',
  'nav.election': 'Election systems',
  'nav.faq': 'FAQ',
  'nav.contact': 'Contact',
  'nav.portal': 'Client portal',
  'nav.start': 'Start a project',
  // Footer
  'footer.tagline': 'A European development studio. We design, build, deploy and maintain websites, stores and platforms — from a single landing page to an enterprise ecosystem.',
  'footer.services': 'Services',
  'footer.working': 'Working with us',
  'footer.studio': 'Studio',
  'footer.allPackages': 'All packages',
  'footer.workBuilt': 'Work we have built',
  'footer.superEnterprise': 'Super Enterprise',
  'footer.election': 'Election & civic systems',
  'footer.addons': 'Add-on services',
  'footer.setup': 'One-time setup',
  'footer.maintenance': 'Monthly maintenance',
  'footer.capabilities': 'Capabilities & stack',
  'footer.processRuns': 'How a project runs',
  'footer.usdtPaypal': 'USDT & PayPal',
  'footer.faqLong': 'Frequently asked questions',
  'footer.openProject': 'Open a project',
  'footer.about': 'About XAA',
  'footer.contact': 'Contact',
  'footer.archive': 'Football archive',
  'footer.terms': 'Terms',
  'footer.privacy': 'Privacy',
  'footer.legal': 'All prices are indicative European market rates in euros, quoted before VAT where applicable, and are confirmed in writing after a scope review. Setup and monthly maintenance are priced separately from the build. Domain registration, third-party licences, payment gateway fees and external API usage are billed at cost.',
  'footer.backToTop': '↑ Back to top',
  'lang.label': 'Language',

  // Home — hero
  'home.hero.lead': 'Custom websites and platforms,',
  'home.hero.accent': 'engineered to scale',
  'home.hero.body': 'XAA builds the website, the store or the platform your business actually runs on — from a €500 landing page to a €500,000+ global ecosystem. European engineering standards, milestone payments, and a client portal that shows you exactly where your build stands.',
  'home.hero.seePackages': 'See packages & pricing',
  'home.hero.openProject': 'Open a project',
  'home.hero.startFrom': 'Start from',
  'home.hero.deposit10': '10% deposit',
  'home.hero.paidIn': 'Paid in',
  'home.hero.deliveryFrom': 'Delivery from',
  'home.hero.days3': '3 days',
  // Home — meaning panel
  'home.mean.xWord': 'eXperience',
  'home.mean.xBody': 'What the visitor feels. Interface, speed, clarity, trust — the part that decides whether anything else you built ever gets used.',
  'home.mean.a1Word': 'Automation',
  'home.mean.a1Body': 'What removes the manual step. The payment that reconciles itself, the report nobody assembles by hand, the status a client reads without asking.',
  'home.mean.a2Word': 'Architecture',
  'home.mean.a2Body': 'What holds it up. Data models, services, security and infrastructure designed for the size you are growing into, not the size you are.',
  'home.mean.esWord': 'Ecosystem Services',
  'home.mean.esBody': 'What most studios skip: keeping the thing alive once it ships — setup, monitoring, patching and the hours that keep it current.',
  'home.mean.footnote': 'four disciplines, one delivery team.',
  // Home — sections
  'home.cap.eyebrow': 'What we build',
  'home.cap.title': 'Four kinds of work, one engineering standard',
  'home.cap.lead': 'The package you choose changes the scope, never the quality of the code underneath it. A €500 landing page is written to the same standards as a €500,000 platform — there is simply less of it.',
  'home.pkg.eyebrow': 'Packages',
  'home.pkg.title': 'Ten packages, priced at European market rates',
  'home.pkg.lead': 'Every price is a real range, published before you talk to anyone. The final figure is fixed in writing after a scope review — and it never moves afterwards without your signature.',
  'home.pkg.all': 'All ten packages →',
  'home.pkg.also': 'Also available:',
  'home.pkg.compare': 'Compare everything',
  'home.how.eyebrow': 'How it works',
  'home.how.title': 'Seven steps from order to handover',
  'home.how.lead': 'Register, choose a package, pay 10%, upload your concept — and from that moment the portal shows you a delivery date and a live progress bar. You settle the balance only when the build is 75–80% done.',
  'home.how.readFull': 'Read the full process →',
  'home.principles.eyebrow': 'Why clients stay',
  'home.principles.title': 'The terms are the product',
  'home.principles.lead': 'Anyone can show you a portfolio. What actually decides whether a build goes well is how it is paid for, how progress is reported, and who owns the result.',
  'home.after.eyebrow': 'After launch',
  'home.after.title': 'Setup and maintenance are priced separately — on purpose',
  'home.after.lead': 'The build price covers the build. Getting you live is a one-time setup service; keeping you live is a monthly care plan. You can take either, both or neither, and you can stop a care plan any month.',
  'home.addons.eyebrow': 'Add-ons',
  'home.addons.title': 'Bolt anything on, at any point',
  'home.addons.lead': 'Add-ons can be selected when you open the project or added later. Each is quoted on its own so you always know what you are paying for.',
  'home.addons.all': 'All add-on services →',
  'home.setup.oneTime': 'One-time',
  'home.setup.title': 'Setup service',
  'home.setup.body': 'We do the configuration with you, once: domain, DNS, SSL, hosting, email records, analytics, backups — then hand you the keys and a recorded walkthrough.',
  'home.setup.link': 'What setup includes →',
  'home.care.monthly': 'Monthly',
  'home.care.title': 'Care plans',
  'home.care.body': 'Updates, backups, monitoring, security patching and a monthly allowance of development hours, so the thing we built keeps working while you run your business.',
  'home.care.link': 'Compare care plans →',
  // Home — stat strip
  'home.stat.pkgL': 'Landing page → global ecosystem',
  'home.stat.splitV': '10 / 40 / 50', 'home.stat.splitL': 'Milestone payment split',
  'home.stat.railsL': 'Payment rails: USDT & PayPal',
  'home.stat.ownL': 'Code & assets transferred to you',
  'home.stat.pkgV': '10 packages',
  // CTA band (shared)
  'cta.title': 'Ready to start?',
  'cta.lead': 'Open a project, pay the 10% booking deposit and upload your concept. You will have a delivery date the same week.',
  'cta.primary': 'Open a project',
  'cta.secondary': 'Talk to us first',
  'cta.rails': 'USDT (TRC20 · ERC20 · BEP20) and PayPal accepted · invoices in EUR',
};

const ES: Dict = {
  'promo.slot': 'Aceptamos proyectos para el próximo turno de producción — desde un 10% de depósito',
  'promo.paid': 'Pago en USDT o PayPal',
  'promo.milestone': 'Por hitos, nunca todo por adelantado',
  'nav.services': 'Servicios',
  'nav.work': 'Proyectos',
  'nav.process': 'Cómo funciona',
  'nav.care': 'Puesta en marcha y mantenimiento',
  'nav.payments': 'Pagos',
  'nav.capabilities': 'Capacidades',
  'nav.election': 'Sistemas electorales',
  'nav.faq': 'Preguntas',
  'nav.contact': 'Contacto',
  'nav.portal': 'Portal del cliente',
  'nav.start': 'Iniciar un proyecto',
  'footer.tagline': 'Un estudio de desarrollo europeo. Diseñamos, construimos, desplegamos y mantenemos sitios web, tiendas y plataformas — desde una sola página de aterrizaje hasta un ecosistema empresarial.',
  'footer.services': 'Servicios',
  'footer.working': 'Trabajar con nosotros',
  'footer.studio': 'Estudio',
  'footer.allPackages': 'Todos los paquetes',
  'footer.workBuilt': 'Lo que hemos construido',
  'footer.superEnterprise': 'Super Enterprise',
  'footer.election': 'Sistemas electorales y cívicos',
  'footer.addons': 'Servicios adicionales',
  'footer.setup': 'Puesta en marcha (única vez)',
  'footer.maintenance': 'Mantenimiento mensual',
  'footer.capabilities': 'Capacidades y tecnología',
  'footer.processRuns': 'Cómo se desarrolla un proyecto',
  'footer.usdtPaypal': 'USDT y PayPal',
  'footer.faqLong': 'Preguntas frecuentes',
  'footer.openProject': 'Abrir un proyecto',
  'footer.about': 'Sobre XAA',
  'footer.contact': 'Contacto',
  'footer.archive': 'Archivo de fútbol',
  'footer.terms': 'Términos',
  'footer.privacy': 'Privacidad',
  'footer.legal': 'Todos los precios son tarifas de mercado europeas indicativas en euros, sin IVA cuando corresponda, y se confirman por escrito tras una revisión del alcance. La puesta en marcha y el mantenimiento mensual se cobran aparte del desarrollo. El registro de dominio, las licencias de terceros, las comisiones de pasarela de pago y el uso de API externas se facturan a coste.',
  'footer.backToTop': '↑ Volver arriba',
  'lang.label': 'Idioma',

  'home.hero.lead': 'Sitios web y plataformas a medida,',
  'home.hero.accent': 'diseñados para escalar',
  'home.hero.body': 'XAA construye el sitio web, la tienda o la plataforma con la que tu negocio realmente funciona — desde una página de aterrizaje de 500 € hasta un ecosistema global de más de 500 000 €. Estándares de ingeniería europeos, pagos por hitos y un portal del cliente que te muestra exactamente en qué punto está tu proyecto.',
  'home.hero.seePackages': 'Ver paquetes y precios',
  'home.hero.openProject': 'Abrir un proyecto',
  'home.hero.startFrom': 'Desde',
  'home.hero.deposit10': '10% de depósito',
  'home.hero.paidIn': 'Pago en',
  'home.hero.deliveryFrom': 'Entrega desde',
  'home.hero.days3': '3 días',
  'home.mean.xWord': 'eXperiencia',
  'home.mean.xBody': 'Lo que siente el visitante. Interfaz, velocidad, claridad, confianza — la parte que decide si todo lo demás que construiste llega a usarse.',
  'home.mean.a1Word': 'Automatización',
  'home.mean.a1Body': 'Lo que elimina el paso manual. El pago que se concilia solo, el informe que nadie arma a mano, el estado que un cliente consulta sin preguntar.',
  'home.mean.a2Word': 'Arquitectura',
  'home.mean.a2Body': 'Lo que lo sostiene. Modelos de datos, servicios, seguridad e infraestructura diseñados para el tamaño al que vas a crecer, no el que tienes hoy.',
  'home.mean.esWord': 'Servicios de ecosistema',
  'home.mean.esBody': 'Lo que la mayoría de los estudios omite: mantener la cosa viva una vez lanzada — puesta en marcha, monitorización, parches y las horas que la mantienen al día.',
  'home.mean.footnote': 'cuatro disciplinas, un solo equipo de entrega.',
  'home.cap.eyebrow': 'Lo que construimos',
  'home.cap.title': 'Cuatro tipos de trabajo, un mismo estándar de ingeniería',
  'home.cap.lead': 'El paquete que elijas cambia el alcance, nunca la calidad del código que hay debajo. Una página de aterrizaje de 500 € se escribe con los mismos estándares que una plataforma de 500 000 € — sencillamente hay menos.',
  'home.pkg.eyebrow': 'Paquetes',
  'home.pkg.title': 'Diez paquetes, con tarifas de mercado europeas',
  'home.pkg.lead': 'Cada precio es un rango real, publicado antes de hablar con nadie. La cifra final se fija por escrito tras una revisión del alcance — y no cambia después sin tu firma.',
  'home.pkg.all': 'Los diez paquetes →',
  'home.pkg.also': 'También disponibles:',
  'home.pkg.compare': 'Comparar todo',
  'home.how.eyebrow': 'Cómo funciona',
  'home.how.title': 'Siete pasos del pedido a la entrega',
  'home.how.lead': 'Regístrate, elige un paquete, paga el 10%, sube tu concepto — y desde ese momento el portal te muestra una fecha de entrega y una barra de progreso en vivo. Solo pagas el resto cuando el desarrollo está al 75–80%.',
  'home.how.readFull': 'Leer el proceso completo →',
  'home.principles.eyebrow': 'Por qué los clientes se quedan',
  'home.principles.title': 'Los términos son el producto',
  'home.principles.lead': 'Cualquiera puede enseñarte un portafolio. Lo que de verdad decide si un desarrollo va bien es cómo se paga, cómo se informa el progreso y quién es dueño del resultado.',
  'home.after.eyebrow': 'Tras el lanzamiento',
  'home.after.title': 'La puesta en marcha y el mantenimiento se cobran aparte — a propósito',
  'home.after.lead': 'El precio del desarrollo cubre el desarrollo. Ponerte en marcha es un servicio único; mantenerte en marcha es un plan mensual. Puedes contratar uno, ambos o ninguno, y cancelar el plan cualquier mes.',
  'home.addons.eyebrow': 'Adicionales',
  'home.addons.title': 'Añade lo que quieras, cuando quieras',
  'home.addons.lead': 'Los adicionales se pueden elegir al abrir el proyecto o añadir después. Cada uno se cotiza por separado para que siempre sepas por qué pagas.',
  'home.addons.all': 'Todos los servicios adicionales →',
  'home.setup.oneTime': 'Única vez',
  'home.setup.title': 'Servicio de puesta en marcha',
  'home.setup.body': 'Hacemos la configuración contigo, una vez: dominio, DNS, SSL, hosting, registros de correo, analítica, copias de seguridad — y luego te entregamos las llaves y una guía grabada.',
  'home.setup.link': 'Qué incluye la puesta en marcha →',
  'home.care.monthly': 'Mensual',
  'home.care.title': 'Planes de mantenimiento',
  'home.care.body': 'Actualizaciones, copias de seguridad, monitorización, parches de seguridad y una bolsa mensual de horas de desarrollo, para que lo que construimos siga funcionando mientras tú llevas tu negocio.',
  'home.care.link': 'Comparar planes →',
  'home.stat.pkgL': 'Landing → ecosistema global',
  'home.stat.splitV': '10 / 40 / 50', 'home.stat.splitL': 'Reparto de pagos por hitos',
  'home.stat.railsL': 'Vías de pago: USDT y PayPal',
  'home.stat.ownL': 'Código y activos transferidos a ti',
  'home.stat.pkgV': '10 paquetes',
  'cta.title': '¿Listo para empezar?',
  'cta.lead': 'Abre un proyecto, paga el 10% de depósito de reserva y sube tu concepto. Tendrás una fecha de entrega esa misma semana.',
  'cta.primary': 'Abrir un proyecto',
  'cta.secondary': 'Hablar primero con nosotros',
  'cta.rails': 'Aceptamos USDT (TRC20 · ERC20 · BEP20) y PayPal · facturas en EUR',
};

const ID: Dict = {
  'promo.slot': 'Menerima proyek untuk slot produksi berikutnya — mulai dari DP 10%',
  'promo.paid': 'Pembayaran via USDT atau PayPal',
  'promo.milestone': 'Berbasis termin, tidak pernah lunas di depan',
  'nav.services': 'Layanan',
  'nav.work': 'Karya',
  'nav.process': 'Cara kerja',
  'nav.care': 'Setup & Perawatan',
  'nav.payments': 'Pembayaran',
  'nav.capabilities': 'Kemampuan',
  'nav.election': 'Sistem pemilu',
  'nav.faq': 'FAQ',
  'nav.contact': 'Kontak',
  'nav.portal': 'Portal klien',
  'nav.start': 'Mulai proyek',
  'footer.tagline': 'Studio pengembangan Eropa. Kami mendesain, membangun, men-deploy, dan merawat situs web, toko, dan platform — dari satu halaman arahan hingga ekosistem enterprise.',
  'footer.services': 'Layanan',
  'footer.working': 'Bekerja dengan kami',
  'footer.studio': 'Studio',
  'footer.allPackages': 'Semua paket',
  'footer.workBuilt': 'Karya yang kami buat',
  'footer.superEnterprise': 'Super Enterprise',
  'footer.election': 'Sistem pemilu & sipil',
  'footer.addons': 'Layanan tambahan',
  'footer.setup': 'Setup sekali bayar',
  'footer.maintenance': 'Perawatan bulanan',
  'footer.capabilities': 'Kemampuan & teknologi',
  'footer.processRuns': 'Cara sebuah proyek berjalan',
  'footer.usdtPaypal': 'USDT & PayPal',
  'footer.faqLong': 'Pertanyaan yang sering diajukan',
  'footer.openProject': 'Buka proyek',
  'footer.about': 'Tentang XAA',
  'footer.contact': 'Kontak',
  'footer.archive': 'Arsip bola',
  'footer.terms': 'Ketentuan',
  'footer.privacy': 'Privasi',
  'footer.legal': 'Semua harga adalah perkiraan tarif pasar Eropa dalam euro, belum termasuk PPN bila berlaku, dan dikonfirmasi tertulis setelah tinjauan ruang lingkup. Setup dan perawatan bulanan dihitung terpisah dari biaya pembuatan. Registrasi domain, lisensi pihak ketiga, biaya payment gateway, dan penggunaan API eksternal ditagih sesuai biaya.',
  'footer.backToTop': '↑ Kembali ke atas',
  'lang.label': 'Bahasa',

  'home.hero.lead': 'Situs web dan platform khusus,',
  'home.hero.accent': 'dirancang untuk skala besar',
  'home.hero.body': 'XAA membangun situs web, toko, atau platform yang benar-benar menjalankan bisnis Anda — dari halaman arahan €500 hingga ekosistem global €500.000+. Standar rekayasa Eropa, pembayaran bertahap, dan portal klien yang menunjukkan persis di mana posisi proyek Anda.',
  'home.hero.seePackages': 'Lihat paket & harga',
  'home.hero.openProject': 'Buka proyek',
  'home.hero.startFrom': 'Mulai dari',
  'home.hero.deposit10': 'DP 10%',
  'home.hero.paidIn': 'Dibayar via',
  'home.hero.deliveryFrom': 'Pengerjaan dari',
  'home.hero.days3': '3 hari',
  'home.mean.xWord': 'eXperience',
  'home.mean.xBody': 'Yang dirasakan pengunjung. Antarmuka, kecepatan, kejelasan, kepercayaan — bagian yang menentukan apakah semua yang Anda bangun benar-benar dipakai.',
  'home.mean.a1Word': 'Automation',
  'home.mean.a1Body': 'Yang menghapus langkah manual. Pembayaran yang mencocokkan sendiri, laporan yang tak perlu disusun manual, status yang bisa dibaca klien tanpa bertanya.',
  'home.mean.a2Word': 'Architecture',
  'home.mean.a2Body': 'Yang menopangnya. Model data, layanan, keamanan, dan infrastruktur yang dirancang untuk ukuran yang Anda tuju, bukan ukuran sekarang.',
  'home.mean.esWord': 'Ecosystem Services',
  'home.mean.esBody': 'Yang dilewatkan kebanyakan studio: menjaga sistem tetap hidup setelah rilis — setup, monitoring, patching, dan jam kerja yang membuatnya tetap terkini.',
  'home.mean.footnote': 'empat disiplin, satu tim pengerjaan.',
  'home.cap.eyebrow': 'Yang kami bangun',
  'home.cap.title': 'Empat jenis pekerjaan, satu standar rekayasa',
  'home.cap.lead': 'Paket yang Anda pilih mengubah ruang lingkup, bukan kualitas kode di baliknya. Halaman arahan €500 ditulis dengan standar yang sama seperti platform €500.000 — hanya jumlahnya lebih sedikit.',
  'home.pkg.eyebrow': 'Paket',
  'home.pkg.title': 'Sepuluh paket, dengan tarif pasar Eropa',
  'home.pkg.lead': 'Setiap harga adalah rentang nyata, dipublikasikan sebelum Anda bicara dengan siapa pun. Angka final dikunci tertulis setelah tinjauan ruang lingkup — dan tak pernah berubah tanpa tanda tangan Anda.',
  'home.pkg.all': 'Semua sepuluh paket →',
  'home.pkg.also': 'Juga tersedia:',
  'home.pkg.compare': 'Bandingkan semua',
  'home.how.eyebrow': 'Cara kerja',
  'home.how.title': 'Tujuh langkah dari pesan sampai serah terima',
  'home.how.lead': 'Daftar, pilih paket, bayar 10%, unggah konsep — dan sejak itu portal menampilkan tanggal selesai dan bar progres langsung. Anda melunasi sisanya hanya saat pembuatan mencapai 75–80%.',
  'home.how.readFull': 'Baca proses lengkap →',
  'home.principles.eyebrow': 'Mengapa klien bertahan',
  'home.principles.title': 'Ketentuannya adalah produknya',
  'home.principles.lead': 'Siapa pun bisa menunjukkan portofolio. Yang benar-benar menentukan lancarnya sebuah proyek adalah cara membayarnya, cara melaporkan progres, dan siapa yang memiliki hasilnya.',
  'home.after.eyebrow': 'Setelah rilis',
  'home.after.title': 'Setup dan perawatan dihitung terpisah — memang sengaja',
  'home.after.lead': 'Harga pembuatan mencakup pembuatan. Membuat Anda online adalah layanan setup sekali bayar; menjaga Anda tetap online adalah paket perawatan bulanan. Anda bisa ambil salah satu, keduanya, atau tidak sama sekali, dan bisa berhenti kapan saja.',
  'home.addons.eyebrow': 'Tambahan',
  'home.addons.title': 'Tambahkan apa pun, kapan pun',
  'home.addons.lead': 'Tambahan bisa dipilih saat membuka proyek atau ditambah kemudian. Masing-masing ditawar terpisah agar Anda selalu tahu apa yang dibayar.',
  'home.addons.all': 'Semua layanan tambahan →',
  'home.setup.oneTime': 'Sekali bayar',
  'home.setup.title': 'Layanan setup',
  'home.setup.body': 'Kami lakukan konfigurasi bersama Anda, sekali: domain, DNS, SSL, hosting, catatan email, analitik, backup — lalu menyerahkan kunci dan panduan terekam.',
  'home.setup.link': 'Apa saja yang termasuk →',
  'home.care.monthly': 'Bulanan',
  'home.care.title': 'Paket perawatan',
  'home.care.body': 'Pembaruan, backup, monitoring, patch keamanan, dan jatah jam pengembangan bulanan, agar yang kami bangun tetap berjalan sementara Anda menjalankan bisnis.',
  'home.care.link': 'Bandingkan paket perawatan →',
  'home.stat.pkgL': 'Halaman arahan → ekosistem global',
  'home.stat.splitV': '10 / 40 / 50', 'home.stat.splitL': 'Pembagian pembayaran termin',
  'home.stat.railsL': 'Jalur pembayaran: USDT & PayPal',
  'home.stat.ownL': 'Kode & aset dipindahkan ke Anda',
  'home.stat.pkgV': '10 paket',
  'cta.title': 'Siap memulai?',
  'cta.lead': 'Buka proyek, bayar DP 10%, dan unggah konsep Anda. Tanggal selesai keluar minggu itu juga.',
  'cta.primary': 'Buka proyek',
  'cta.secondary': 'Bicara dulu dengan kami',
  'cta.rails': 'Menerima USDT (TRC20 · ERC20 · BEP20) dan PayPal · faktur dalam EUR',
};

const DICT: Record<Lang, Dict> = { en: EN, es: ES, id: ID };

/** Translate a key. Falls back to English, then to the key itself. */
export function tr(lang: Lang, key: string): string {
  return DICT[lang]?.[key] ?? EN[key] ?? key;
}

/** Bound translator for one language. */
export function translator(lang: Lang) {
  return (key: string) => tr(lang, key);
}

/**
 * Pick one language's copy from a hand-written {en, es, id} block. Content-heavy
 * pages keep their prose in a local object of this shape rather than in the
 * global dictionary, so the three translations sit next to each other and stay
 * easy to review. A missing language falls back to English — never a guess.
 */
export function pick<T>(lang: Lang, variants: Record<Lang, T>): T {
  return variants[lang] ?? variants.en;
}
