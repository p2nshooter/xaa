/**
 * Hand-written Spanish and Indonesian for the service catalogue.
 *
 * English stays the single source of truth in packages.ts — prices, slugs,
 * day-ranges and all logic live there and are never duplicated here. This file
 * only carries translated prose (summaries, feature lists, tier labels), keyed
 * by the same slugs, and the merge helpers below overlay it onto the canonical
 * objects. Anything missing a translation falls back to the English original,
 * so a half-translated entry still renders completely.
 *
 * Product names (e.g. "SaaS / Web Application", "Essential Care") are kept as
 * given — they read as proper product tiers in every language — while the words
 * around them are localised.
 */
import type { Lang } from '@/lib/i18n';
import type { Package, AddOn, SetupPlan, CarePlan, CivicTier, Tier } from '@/content/packages';
import {
  PACKAGES, ADDONS, SETUP_PLANS, CARE_PLANS, CIVIC_TIERS, CIVIC_CAPABILITIES, SUPER_ENTERPRISE, TIER_LABEL,
} from '@/content/packages';

type PkgT = Partial<Pick<Package, 'summary' | 'bestFor' | 'timeline' | 'pages' | 'includes' | 'optional'>>;
type Overlay = Record<Exclude<Lang, 'en'>, Record<string, PkgT>>;

const PACKAGE_T: Overlay = {
  es: {
    'landing-page': {
      summary: 'Una página, diseñada para convertir: una oferta, un público y una llamada a la acción, construida para la velocidad y medida desde el primer día.',
      bestFor: ['Lanzamientos de producto o campaña', 'Freelancers y marcas personales', 'Destinos de tráfico de pago', 'Listas de espera de prelanzamiento'],
      timeline: '3–10 días', pages: '1 página (multisección)',
      includes: ['Diseño moderno y totalmente responsive (móvil / tablet / escritorio)', 'Hero, sección de servicios o producto, precios, testimonios, FAQ', 'Formulario de contacto con protección antispam y envío por email', 'Estructura de copy y CTA orientada a la conversión', 'Optimización de Core Web Vitals', 'SEO on-page básico y tarjetas de vista previa social', 'SSL, despliegue y puesta en vivo', 'Instalación de analítica y seguimiento de objetivos'],
      optional: ['Redacción', 'Variante para test A/B', 'Versión multilingüe'],
    },
    'portfolio-website': {
      summary: 'Una plataforma personal con un verdadero sistema de contenido detrás, para que tu trabajo, tus textos y tus contactos sigan siendo tuyos y actualizables.',
      bestFor: ['Diseñadores, fotógrafos, arquitectos', 'Consultores y coaches', 'Creadores y ponentes', 'Marcas personales'],
      timeline: '1–3 semanas', pages: '5–10 páginas',
      includes: ['Diseño UI/UX a medida — sin plantilla comprada', 'Páginas de perfil, portafolio y casos de estudio', 'Blog con categorías y etiquetas', 'Gestor de contenidos, con formación de traspaso incluida', 'Formulario de contacto e integraciones sociales', 'Estructura SEO, sitemap y datos estructurados', 'Panel de analítica', 'Diseño responsive y revisión de accesibilidad'],
      optional: ['Integración de newsletter', 'Área de acceso para clientes', 'Tienda de impresiones o productos digitales'],
    },
    'company-profile': {
      summary: 'La web por la que se juzga a una empresa seria: posicionamiento claro, pruebas creíbles y un sistema de contenido que tu equipo puede manejar de verdad.',
      bestFor: ['Pymes y empresas en crecimiento', 'Firmas de servicios profesionales', 'Fabricantes y proveedores', 'Negocios locales multi-sede'],
      timeline: '2–6 semanas', pages: '8–20 páginas',
      includes: ['Homepage profesional y sistema de páginas interiores', 'Secciones de nosotros, servicios, productos, equipo y portafolio', 'Centro de blog / noticias', 'Páginas de contacto con Google Maps y soporte multi-oficina', 'CMS completo con roles editoriales', 'Base de SEO: metadatos, schema, enlazado interno, sitemap', 'Analítica y seguimiento de conversión', 'Endurecimiento de seguridad y optimización de rendimiento', 'Despliegue, SSL y soporte de puesta en vivo'],
      optional: ['Multilingüe', 'Integración con CRM', 'Sistema de newsletter', 'Programa de SEO avanzado'],
    },
    'corporate-website': {
      summary: 'Un gran sitio corporativo multi-audiencia — inversores, candidatos, prensa y clientes, cada uno atendido como es debido, en cada idioma en el que operas.',
      bestFor: ['Corporativos consolidados', 'Grupos con varias divisiones', 'Empresas cotizadas y de cara al inversor', 'Marcas internacionales'],
      timeline: '4–10 semanas', pages: '15–50+ páginas',
      includes: ['UI/UX a medida y un sistema de diseño documentado', 'CMS avanzado con flujo de trabajo y roles de publicación', 'Centro de noticias, sala de prensa y biblioteca de medios', 'Sección de empleo con gestión de vacantes', 'Páginas de relación con inversores y gobierno corporativo', 'Arquitectura de estructura de empresa y divisiones', 'Búsqueda en todo el sitio con filtros', 'Multilingüe con contenido por mercado', 'SEO avanzado y plan de migración con redirecciones', 'Integraciones con CRM y API', 'Endurecimiento de seguridad, monitorización y presupuesto de rendimiento'],
      optional: ['Certificación de accesibilidad (WCAG)', 'Feeds de datos para inversores', 'Portal de intranet'],
    },
    'business-platform': {
      summary: 'No un folleto — un sistema que funciona. Cuentas de clientes, reservas, un panel operativo y los informes con los que tu equipo dirige el negocio.',
      bestFor: ['Restaurantes y grupos de hostelería', 'Clínicas y consultas de salud', 'Escuelas y formación', 'Inmobiliarias y firmas de servicios'],
      timeline: '6–12 semanas', pages: 'Sitio público + aplicación',
      includes: ['Sitio web público más cuentas de cliente autenticadas', 'Panel de administración con gestión de usuarios por roles', 'Gestión de contenido para cada superficie pública', 'Motor de reservas con reglas de disponibilidad', 'Notificaciones por email y en la app', 'Informes operativos y analítica', 'Diseño de base de datos, migraciones y backups', 'Integración con CRM y API de terceros', 'Revisión y endurecimiento de seguridad', 'Aplicación web responsive en todos los dispositivos'],
      optional: ['Pagos online', 'Notificaciones SMS / WhatsApp', 'Modo multi-sede o franquicia'],
    },
    ecommerce: {
      summary: 'Una tienda construida en torno a tus márgenes: profundidad de catálogo, un checkout que no pierde ventas y el back office que mantiene honesta la logística.',
      bestFor: ['Marcas de retail y D2C', 'Mayoristas B2B', 'Productos por suscripción', 'Operaciones multi-almacén'],
      timeline: '8–16 semanas', pages: 'Escaparate + back office',
      includes: ['Gestión de productos, variantes y categorías', 'Búsqueda, filtros facetados y reglas de merchandising', 'Carrito y checkout optimizado para conversión', 'Cuentas de cliente, direcciones e historial de pedidos', 'Gestión de pedidos, estados de fulfilment y devoluciones', 'Integración de pasarela de pago', 'Integración de envíos y transportistas con tarifas en vivo', 'Facturación y gestión de impuestos/IVA', 'Descuentos, cupones y precios de campaña', 'Programa de emails transaccionales', 'Panel de administración, roles y registro de auditoría', 'Analítica de e-commerce y SEO para páginas de catálogo', 'Endurecimiento de seguridad y arquitectura PCI-aware'],
      optional: ['Suscripciones y membresías', 'Listas de precios B2B y presupuestos', 'Multi-vendedor', 'Multidivisa y multilingüe', 'Integración ERP / CRM'],
    },
    marketplace: {
      summary: 'Tres productos en un desarrollo — comprador, vendedor y operador — con la maquinaria de comisiones, pagos y disputas que hace que un marketplace sobreviva a sus primeras mil transacciones.',
      bestFor: ['Comercio multi-vendedor', 'Marketplaces de servicios y reservas', 'Plataformas de alquiler y anuncios', 'Redes de comercio regional'],
      timeline: '12–24 semanas', pages: 'Sistemas de comprador + vendedor + admin',
      includes: ['COMPRADOR: registro, perfil, búsqueda, carrito, checkout, pedidos, reseñas, lista de deseos, notificaciones', 'VENDEDOR: alta y verificación, panel de vendedor, gestión de productos e inventario, pedidos, ingresos, retiros, analítica', 'ADMIN: gestión de usuarios y vendedores, moderación de productos, monitorización de transacciones, motor de comisiones, informes, gestión de disputas, ajustes del sistema', 'Motor de reglas de comisiones, tarifas y pagos', 'Monedero y manejo de saldo tipo escrow', 'Infraestructura de búsqueda con ranking y filtros', 'Sistema de notificaciones por email y en la app', 'Diseño de base de datos escalable y estrategia de caché', 'Arquitectura de seguridad y controles de abuso', 'Despliegue en cloud con monitorización y backups'],
      optional: ['Recomendaciones con IA', 'Detección de fraude', 'Multipaís y multidivisa', 'API para app móvil', 'Integración de proveedor KYC'],
    },
    'saas-platform': {
      summary: 'Un producto por suscripción con tenencia, facturación y roles reales — la fontanería comercial que convierte el software en ingresos recurrentes.',
      bestFor: ['Plataformas CRM, ERP y RR. HH.', 'Herramientas de contabilidad y finanzas', 'Productos de gestión de proyectos', 'Plataformas de IA, marketing y soporte'],
      timeline: '14–28 semanas', pages: 'Producto completo + admin',
      includes: ['Autenticación, sesiones y recuperación de cuenta', 'Modelo de datos multi-tenant con roles de organización y usuario', 'Panel de producto y superficie principal de la aplicación', 'Planes de suscripción, pruebas, mejoras y gestión de impagos', 'Integración de facturación y proveedor de pago', 'Servicios backend, colas y tareas programadas', 'Diseño de base de datos relacional con migraciones', 'API pública e interna con documentación', 'Panel de administración y herramientas de soporte', 'Notificaciones, programa de emails y mensajería en la app', 'Analítica de producto, logging y seguimiento de errores', 'Revisión de seguridad, limitación de tasa y protección de datos', 'Despliegue en cloud, entorno de staging y CI/CD'],
      optional: ['Funciones de IA e integración de modelos', 'SSO para clientes enterprise', 'Facturación por uso', 'Aplicación móvil', 'Residencia de datos por región'],
    },
    'enterprise-platform': {
      summary: 'Portales de clientes, empleados y socios sobre una arquitectura gobernada, con la seguridad, la auditabilidad y el uptime que una empresa firma.',
      bestFor: ['Grandes empresas y grupos', 'Servicios financieros', 'Salud y logística', 'Sector público e industrias reguladas'],
      timeline: '24–40 semanas', pages: 'Sistema enterprise multi-portal',
      includes: ['Portal de clientes, portal de empleados y portal de socios', 'Arquitectura de microservicios tras un API gateway', 'Autenticación, autorización y RBAC completo', 'SSO, MFA e integración de identidad enterprise', 'Registros de auditoría e informes listos para cumplimiento', 'Infraestructura cloud como código', 'Balanceo de carga, CDN y clustering de base de datos', 'Plan de backup, retención y recuperación ante desastres', 'Arquitectura de seguridad, modelo de amenazas y endurecimiento', 'Stack de monitorización, alertas y observabilidad', 'Integraciones ERP, CRM, pagos y logística', 'Capa de integración con API de terceros', 'Soporte enterprise y onboarding para equipos internos'],
      optional: ['Data warehouse y capa BI', 'Programa de cumplimiento regulatorio', 'Entorno dedicado por región', 'Respuesta a incidentes 24/7'],
    },
    'global-ecosystem': {
      summary: 'Un ecosistema digital completo: plataformas de clientes, socios e internas, una capa de IA e infraestructura global operada con SLA.',
      bestFor: ['Grupos internacionales', 'Operaciones multipaís', 'Redes financieras y logísticas', 'Organizaciones que consolidan muchos sistemas'],
      timeline: '40–72 semanas', pages: 'Ecosistema de plataformas',
      includes: ['PLATAFORMA DE CLIENTES: cuentas, suscripciones, monedero, pedidos, soporte, fidelización', 'PLATAFORMA DE SOCIOS: cuentas de socio, paneles, motor de comisiones, acceso API', 'PLATAFORMA INTERNA: gestión de empleados, RR. HH., finanzas, operaciones, analítica', 'ECOSISTEMA DE IA: asistente, atención al cliente, analítica, recomendaciones, automatización', 'INFRAESTRUCTURA GLOBAL: arquitectura cloud, microservicios, Kubernetes, CDN, balanceo, monitorización, recuperación ante desastres', 'SEGURIDAD ENTERPRISE: SSO, MFA, RBAC, cifrado, registros de auditoría, monitorización de seguridad, arquitectura de cumplimiento', 'SOPORTE GLOBAL: monitorización 24/7, soporte técnico, mantenimiento, respuesta a incidentes, SLA', 'Gestión de programa, gobierno de arquitectura y documentación'],
      optional: ['Equipo de entrega dedicado', 'Residencia de datos multi-región', 'Entrenamiento de modelos de IA a medida', 'Centro de operaciones gestionado'],
    },
  },
  id: {
    'landing-page': {
      summary: 'Satu halaman, dirancang untuk konversi: satu tawaran, satu audiens, dan satu ajakan bertindak, dibangun untuk kecepatan dan diukur sejak hari pertama.',
      bestFor: ['Peluncuran produk atau kampanye', 'Freelancer dan brand personal', 'Tujuan trafik berbayar', 'Daftar tunggu pra-peluncuran'],
      timeline: '3–10 hari', pages: '1 halaman (multi-bagian)',
      includes: ['Desain modern, sepenuhnya responsif (ponsel / tablet / desktop)', 'Hero, bagian layanan atau produk, harga, testimoni, FAQ', 'Formulir kontak dengan proteksi spam dan pengiriman email', 'Tata letak copy dan struktur CTA fokus konversi', 'Optimasi Core Web Vitals', 'SEO on-page dasar dan kartu pratinjau sosial', 'SSL, deployment, dan go-live', 'Pemasangan analitik dan pelacakan tujuan'],
      optional: ['Penulisan naskah', 'Varian uji A/B', 'Versi multibahasa'],
    },
    'portfolio-website': {
      summary: 'Platform personal dengan sistem konten sungguhan di baliknya, agar karya, tulisan, dan titik kontak Anda tetap milik Anda untuk diperbarui.',
      bestFor: ['Desainer, fotografer, arsitek', 'Konsultan dan coach', 'Kreator dan pembicara', 'Brand personal'],
      timeline: '1–3 minggu', pages: '5–10 halaman',
      includes: ['Desain UI/UX khusus — tanpa template beli', 'Halaman profil, portofolio, dan studi kasus proyek', 'Blog dengan kategori dan tag', 'Sistem manajemen konten, serah terima terlatih termasuk', 'Formulir kontak dan integrasi sosial', 'Struktur SEO, sitemap, dan data terstruktur', 'Dasbor analitik', 'Desain responsif dan peninjauan aksesibilitas'],
      optional: ['Integrasi newsletter', 'Area login klien', 'Toko cetakan atau produk digital'],
    },
    'company-profile': {
      summary: 'Situs yang jadi penilaian perusahaan serius: posisi yang jelas, bukti yang kredibel, dan sistem konten yang benar-benar bisa dijalankan tim Anda.',
      bestFor: ['UKM dan perusahaan yang tumbuh', 'Firma jasa profesional', 'Produsen dan pemasok', 'Bisnis lokal multi-cabang'],
      timeline: '2–6 minggu', pages: '8–20 halaman',
      includes: ['Homepage profesional dan sistem halaman interior', 'Bagian tentang, layanan, produk, tim, dan portofolio', 'Pusat blog / berita', 'Halaman kontak dengan Google Maps dan dukungan multi-kantor', 'CMS lengkap dengan peran editorial', 'Fondasi SEO: metadata, schema, tautan internal, sitemap', 'Analitik dan pelacakan konversi', 'Penguatan keamanan dan optimasi performa', 'Deployment, SSL, dan dukungan go-live'],
      optional: ['Multibahasa', 'Integrasi CRM', 'Sistem newsletter', 'Program SEO lanjutan'],
    },
    'corporate-website': {
      summary: 'Situs korporat besar multi-audiens — investor, kandidat, pers, dan pelanggan masing-masing dilayani dengan benar, dalam tiap bahasa tempat Anda beroperasi.',
      bestFor: ['Korporat mapan', 'Grup dengan banyak divisi', 'Perusahaan terbuka dan menghadap investor', 'Brand internasional'],
      timeline: '4–10 minggu', pages: '15–50+ halaman',
      includes: ['UI/UX khusus dan design system terdokumentasi', 'CMS lanjutan dengan alur kerja dan peran penerbitan', 'Pusat berita, ruang pers, dan pustaka media', 'Bagian karier dengan manajemen lowongan', 'Halaman hubungan investor dan tata kelola korporat', 'Arsitektur struktur perusahaan dan divisi', 'Pencarian seluruh situs dengan filter', 'Multibahasa dengan konten per pasar', 'SEO lanjutan dan rencana migrasi dengan pengalihan', 'Integrasi CRM dan API', 'Penguatan keamanan, monitoring, dan anggaran performa'],
      optional: ['Sertifikasi aksesibilitas (WCAG)', 'Feed data investor', 'Portal intranet'],
    },
    'business-platform': {
      summary: 'Bukan brosur — sistem yang bekerja. Akun pelanggan, pemesanan, dasbor operasional, dan pelaporan yang dipakai tim Anda menjalankan bisnis.',
      bestFor: ['Restoran dan grup perhotelan', 'Klinik dan praktik kesehatan', 'Sekolah dan penyedia pelatihan', 'Firma properti dan jasa profesional'],
      timeline: '6–12 minggu', pages: 'Situs publik + aplikasi',
      includes: ['Situs web publik plus akun pelanggan terautentikasi', 'Dasbor admin dengan manajemen pengguna berbasis peran', 'Manajemen konten untuk tiap permukaan publik', 'Mesin pemesanan / reservasi dengan aturan ketersediaan', 'Notifikasi email dan dalam aplikasi', 'Laporan operasional dan analitik', 'Desain basis data, migrasi, dan backup', 'Integrasi CRM dan API pihak ketiga', 'Peninjauan dan penguatan keamanan', 'Aplikasi web responsif di semua perangkat'],
      optional: ['Pembayaran online', 'Notifikasi SMS / WhatsApp', 'Mode multi-cabang atau waralaba'],
    },
    ecommerce: {
      summary: 'Toko yang dibangun di sekitar margin Anda: kedalaman katalog, checkout yang tak bocor, dan back office yang menjaga pemenuhan tetap jujur.',
      bestFor: ['Brand ritel dan D2C', 'Grosir B2B', 'Produk langganan', 'Operasi multi-gudang'],
      timeline: '8–16 minggu', pages: 'Etalase + back office',
      includes: ['Manajemen produk, varian, dan kategori', 'Pencarian, filter faset, dan aturan merchandising', 'Keranjang dan checkout yang dioptimasi konversi', 'Akun pelanggan, alamat, dan riwayat pesanan', 'Manajemen pesanan, status pemenuhan, dan retur', 'Integrasi payment gateway', 'Integrasi pengiriman dan kurir dengan tarif langsung', 'Faktur dan penanganan pajak/PPN', 'Diskon, kupon, dan harga kampanye', 'Program email transaksional', 'Dasbor admin, peran, dan jejak audit', 'Analitik e-commerce dan SEO untuk halaman katalog', 'Penguatan keamanan dan arsitektur sadar-PCI'],
      optional: ['Langganan dan keanggotaan', 'Daftar harga B2B dan penawaran', 'Multi-vendor', 'Multi-mata uang dan multibahasa', 'Integrasi ERP / CRM'],
    },
    marketplace: {
      summary: 'Tiga produk dalam satu build — pembeli, penjual, dan operator — dengan mesin komisi, pencairan, dan sengketa yang membuat marketplace bertahan pada seribu transaksi pertamanya.',
      bestFor: ['Perdagangan multi-vendor', 'Marketplace jasa dan pemesanan', 'Platform sewa dan listing', 'Jaringan perdagangan regional'],
      timeline: '12–24 minggu', pages: 'Sistem pembeli + penjual + admin',
      includes: ['PEMBELI: registrasi, profil, pencarian, keranjang, checkout, pesanan, ulasan, wishlist, notifikasi', 'PENJUAL: onboarding dan verifikasi, dasbor penjual, manajemen produk dan stok, pesanan, pendapatan, penarikan, analitik', 'ADMIN: manajemen pengguna dan penjual, moderasi produk, pemantauan transaksi, mesin komisi, laporan, manajemen sengketa, pengaturan sistem', 'Mesin aturan komisi, biaya, dan pencairan', 'Dompet dan penanganan saldo bergaya escrow', 'Infrastruktur pencarian dengan peringkat dan filter', 'Sistem notifikasi via email dan dalam aplikasi', 'Desain basis data skalabel dan strategi caching', 'Arsitektur keamanan dan kendali penyalahgunaan', 'Deployment cloud dengan monitoring dan backup'],
      optional: ['Rekomendasi AI', 'Deteksi penipuan', 'Multi-negara dan multi-mata uang', 'API aplikasi seluler', 'Integrasi penyedia KYC'],
    },
    'saas-platform': {
      summary: 'Produk langganan dengan tenancy, penagihan, dan peran yang nyata — pipa komersial yang mengubah perangkat lunak menjadi pendapatan berulang.',
      bestFor: ['Platform CRM, ERP, dan HR', 'Alat akuntansi dan keuangan', 'Produk manajemen proyek', 'Platform AI, pemasaran, dan dukungan'],
      timeline: '14–28 minggu', pages: 'Produk lengkap + admin',
      includes: ['Autentikasi, sesi, dan pemulihan akun', 'Model data multi-tenant dengan peran organisasi dan pengguna', 'Dasbor produk dan permukaan aplikasi inti', 'Paket langganan, uji coba, peningkatan, dan dunning', 'Integrasi penagihan dan penyedia pembayaran', 'Layanan backend, antrean, dan tugas terjadwal', 'Desain basis data relasional dengan migrasi', 'API publik dan internal dengan dokumentasi', 'Panel admin dan perkakas dukungan', 'Notifikasi, program email, dan pesan dalam aplikasi', 'Analitik produk, logging, dan pelacakan error', 'Peninjauan keamanan, rate limiting, dan perlindungan data', 'Deployment cloud, lingkungan staging, dan CI/CD'],
      optional: ['Fitur AI dan integrasi model', 'SSO untuk pelanggan enterprise', 'Penagihan berbasis pemakaian', 'Aplikasi seluler', 'Residensi data per wilayah'],
    },
    'enterprise-platform': {
      summary: 'Portal pelanggan, karyawan, dan mitra pada satu arsitektur terkelola, dengan keamanan, auditabilitas, dan uptime yang ditandatangani sebuah enterprise.',
      bestFor: ['Perusahaan dan grup besar', 'Jasa keuangan', 'Kesehatan dan logistik', 'Sektor publik dan industri teregulasi'],
      timeline: '24–40 minggu', pages: 'Sistem enterprise multi-portal',
      includes: ['Portal pelanggan, portal karyawan, dan portal mitra', 'Arsitektur microservices di balik API gateway', 'Autentikasi, otorisasi, dan RBAC penuh', 'SSO, MFA, dan integrasi identitas enterprise', 'Log audit dan pelaporan siap-kepatuhan', 'Infrastruktur cloud sebagai kode', 'Load balancing, CDN, dan clustering basis data', 'Rencana backup, retensi, dan pemulihan bencana', 'Arsitektur keamanan, model ancaman, dan penguatan', 'Stack monitoring, alerting, dan observability', 'Integrasi ERP, CRM, pembayaran, dan logistik', 'Lapisan integrasi API pihak ketiga', 'Dukungan enterprise dan onboarding untuk tim internal'],
      optional: ['Data warehouse dan lapisan BI', 'Program kepatuhan regulasi', 'Lingkungan khusus per wilayah', 'Respons insiden 24/7'],
    },
    'global-ecosystem': {
      summary: 'Ekosistem digital lengkap: platform pelanggan, mitra, dan internal, lapisan AI, dan infrastruktur global yang dijalankan dengan SLA.',
      bestFor: ['Grup internasional', 'Operasi multi-negara', 'Jaringan keuangan dan logistik', 'Organisasi yang mengonsolidasi banyak sistem'],
      timeline: '40–72 minggu', pages: 'Ekosistem platform',
      includes: ['PLATFORM PELANGGAN: akun, langganan, dompet, pesanan, dukungan, loyalitas', 'PLATFORM MITRA: akun mitra, dasbor, mesin komisi, akses API', 'PLATFORM INTERNAL: manajemen karyawan, HR, keuangan, operasi, analitik', 'EKOSISTEM AI: asisten, dukungan pelanggan, analitik, rekomendasi, otomasi', 'INFRASTRUKTUR GLOBAL: arsitektur cloud, microservices, Kubernetes, CDN, load balancing, monitoring, pemulihan bencana', 'KEAMANAN ENTERPRISE: SSO, MFA, RBAC, enkripsi, log audit, monitoring keamanan, arsitektur kepatuhan', 'DUKUNGAN GLOBAL: monitoring 24/7, dukungan teknis, perawatan, respons insiden, SLA', 'Manajemen program, tata kelola arsitektur, dan dokumentasi'],
      optional: ['Tim pengerjaan khusus', 'Residensi data multi-wilayah', 'Pelatihan model AI khusus', 'Pusat operasi terkelola'],
    },
  },
};

const TIER_T: Record<Exclude<Lang, 'en'>, Record<Tier, string>> = {
  es: { starter: 'Inicial', business: 'Negocio', advanced: 'Avanzado', enterprise: 'Enterprise' },
  id: { starter: 'Pemula', business: 'Bisnis', advanced: 'Lanjutan', enterprise: 'Enterprise' },
};

const ADDON_T: Record<Exclude<Lang, 'en'>, Record<string, { name?: string; blurb: string }>> = {
  es: {
    'ui-ux': { name: 'Diseño UI/UX', blurb: 'Investigación, wireframes, diseño de alta fidelidad y un sistema de diseño reutilizable.' },
    branding: { name: 'Branding', blurb: 'Logo, sistema de identidad, tipografía, color y guías de marca.' },
    seo: { name: 'Programa de SEO', blurb: 'SEO técnico, arquitectura de contenido, schema y optimización continua.' },
    ai: { name: 'Integración de IA', blurb: 'Asistentes, recuperación sobre tus propios datos, automatización y funciones de IA dentro de tu producto.' },
    api: { name: 'Integración de API', blurb: 'Conecta ERP, CRM, logística, contabilidad o cualquier sistema de terceros.' },
    payments: { name: 'Integración de Pagos', blurb: 'Flujos de pago con tarjeta, SEPA, monedero y cripto, con conciliación.' },
    'security-audit': { name: 'Auditoría de Seguridad', blurb: 'Modelo de amenazas, pruebas de penetración, revisión de dependencias y configuración.' },
    performance: { name: 'Optimización de Rendimiento', blurb: 'Core Web Vitals, caché, ajuste de consultas y dimensionado de infraestructura.' },
    migration: { name: 'Migración e Importación de Datos', blurb: 'Mueve contenido, catálogo, clientes e historial de tu plataforma antigua sin perder posiciones.' },
    copywriting: { name: 'Redacción y Localización', blurb: 'Copy comercial, y traducción a cada mercado en el que vendes.' },
  },
  id: {
    'ui-ux': { name: 'Desain UI/UX', blurb: 'Riset, wireframe, desain fidelitas tinggi, dan design system yang dapat dipakai ulang.' },
    branding: { name: 'Branding', blurb: 'Logo, sistem identitas, tipografi, warna, dan pedoman brand.' },
    seo: { name: 'Program SEO', blurb: 'SEO teknis, arsitektur konten, schema, dan optimasi berkelanjutan.' },
    ai: { name: 'Integrasi AI', blurb: 'Asisten, retrieval atas data Anda sendiri, otomasi, dan fitur AI di dalam produk Anda.' },
    api: { name: 'Integrasi API', blurb: 'Hubungkan ERP, CRM, logistik, akuntansi, atau sistem pihak ketiga mana pun.' },
    payments: { name: 'Integrasi Pembayaran', blurb: 'Alur pembayaran kartu, SEPA, dompet, dan kripto dengan rekonsiliasi.' },
    'security-audit': { name: 'Audit Keamanan', blurb: 'Model ancaman, penetration testing, peninjauan dependensi dan konfigurasi.' },
    performance: { name: 'Optimasi Performa', blurb: 'Core Web Vitals, caching, penyetelan kueri, dan penyesuaian ukuran infrastruktur.' },
    migration: { name: 'Migrasi & Impor Data', blurb: 'Pindahkan konten, katalog, pelanggan, dan riwayat dari platform lama tanpa kehilangan peringkat.' },
    copywriting: { name: 'Penulisan & Lokalisasi', blurb: 'Copy komersial, dan terjemahan ke tiap pasar tempat Anda berjualan.' },
  },
};

const SETUP_T: Record<Exclude<Lang, 'en'>, Record<string, { blurb: string; includes: string[] }>> = {
  es: {
    'setup-launch': { blurb: 'Una única sesión de puesta en marcha guiada para una web. Hacemos la configuración contigo, una vez, y te entregamos las llaves.', includes: ['Configuración de dominio y DNS', 'Certificado SSL y forzado de HTTPS', 'Configuración del entorno de hosting y despliegue', 'Registros de email de empresa (SPF, DKIM, DMARC)', 'Google Analytics y Search Console', 'Envío de sitemap y comprobación de indexación', 'Programación de backups', '1 llamada de traspaso / formación (60 min)'] },
    'setup-business': { blurb: 'Todo lo de Launch Setup más el cableado de tracking, correo e integraciones que necesita el sitio de una empresa en marcha.', includes: ['Todo lo de Launch Setup', 'Entorno de staging', 'Configuración de proveedor de email transaccional', 'Seguimiento de conversión y gestor de etiquetas', 'Conexión con CRM o newsletter', 'Configuración de CDN y caché', 'Monitorización de uptime y alertas', '2 sesiones de formación para tu equipo'] },
    'setup-platform': { blurb: 'Puesta en marcha de nivel aplicación: entornos, pagos, jobs, observabilidad y un runbook documentado.', includes: ['Todo lo de Business Setup', 'Entornos de producción, staging y vista previa', 'Configuración de pasarela de pago y webhooks', 'Jobs en segundo plano y tareas programadas', 'Backup de base de datos, prueba de restauración y política de retención', 'Seguimiento de errores y agregación de logs', 'Configuración de roles y permisos', 'Runbook de operaciones y documentación de administración'] },
    'setup-enterprise': { blurb: 'Aprovisionamiento de infraestructura, identidad, línea base de seguridad y gobierno de puesta en vivo para programas enterprise. Se dimensiona por proyecto.', includes: ['Estructura de cuentas cloud e infraestructura como código', 'Red, firewall y gestión de secretos', 'SSO / MFA e integración de directorio', 'Pipelines CI/CD con puertas de aprobación', 'Stack de observabilidad y enrutado de guardia', 'Simulacro de recuperación ante desastres', 'Línea base de seguridad y documentación de cumplimiento', 'Plan de puesta en vivo, ensayo de cutover y ventana de soporte'] },
  },
  id: {
    'setup-launch': { blurb: 'Satu sesi setup terpandu untuk sebuah situs web. Kami lakukan konfigurasi bersama Anda, sekali, dan menyerahkan kuncinya.', includes: ['Konfigurasi domain dan DNS', 'Sertifikat SSL dan pemaksaan HTTPS', 'Konfigurasi lingkungan hosting dan deploy', 'Catatan email bisnis (SPF, DKIM, DMARC)', 'Google Analytics dan Search Console', 'Pengiriman sitemap dan pemeriksaan pengindeksan', 'Penjadwalan backup', '1 panggilan serah terima / pelatihan (60 mnt)'] },
    'setup-business': { blurb: 'Semua di Launch Setup plus perkabelan tracking, surel, dan integrasi yang dibutuhkan situs perusahaan yang berjalan.', includes: ['Semua di Launch Setup', 'Lingkungan staging', 'Konfigurasi penyedia email transaksional', 'Pelacakan konversi dan tag manager', 'Koneksi CRM atau newsletter', 'Konfigurasi CDN dan caching', 'Monitoring uptime dan peringatan', '2 sesi pelatihan untuk tim Anda'] },
    'setup-platform': { blurb: 'Setup kelas aplikasi: lingkungan, pembayaran, job, observability, dan runbook terdokumentasi.', includes: ['Semua di Business Setup', 'Lingkungan produksi, staging, dan pratinjau', 'Konfigurasi payment gateway dan webhook', 'Job latar dan tugas terjadwal', 'Backup basis data, uji pemulihan, dan kebijakan retensi', 'Pelacakan error dan agregasi log', 'Konfigurasi peran dan izin', 'Runbook operasi dan dokumentasi admin'] },
    'setup-enterprise': { blurb: 'Penyediaan infrastruktur, identitas, baseline keamanan, dan tata kelola go-live untuk program enterprise. Dilingkup per kerja sama.', includes: ['Struktur akun cloud dan infrastructure as code', 'Jaringan, firewall, dan manajemen secret', 'SSO / MFA dan integrasi direktori', 'Pipeline CI/CD dengan gerbang persetujuan', 'Stack observability dan perutean on-call', 'Latihan pemulihan bencana', 'Baseline keamanan dan dokumentasi kepatuhan', 'Rencana go-live, gladi cutover, dan jendela dukungan'] },
  },
};

const CARE_T: Record<Exclude<Lang, 'en'>, Record<string, { blurb: string; hours: string; response: string; includes: string[] }>> = {
  es: {
    'care-essential': { blurb: 'Mantiene una web segura, actualizada y en línea. Para landings y sitios de portafolio.', hours: '2 horas / mes', response: '2 días hábiles', includes: ['Actualizaciones de plataforma, dependencias y seguridad', 'Backups diarios con retención de 30 días', 'Monitorización de uptime', 'Renovación de SSL y cuidado de DNS', 'Escaneo de malware y vulnerabilidades', 'Informe de salud mensual', '2 horas de contenido o pequeños cambios', 'Soporte por email'] },
    'care-growth': { blurb: 'Mantenimiento más mejora continua para un sitio de empresa que tiene que rendir.', hours: '6 horas / mes', response: '1 día hábil', includes: ['Todo lo de Essential Care', 'Backups diarios con retención de 90 días', 'Monitorización de rendimiento y ajuste trimestral', 'Chequeos y correcciones de SEO', 'Informes de analítica con comentario', '6 horas de cambios, contenido o nuevas secciones', 'Entorno de staging para revisión', 'Soporte por email y chat'] },
    'care-business': { blurb: 'Para plataformas y tiendas donde la caída cuesta dinero. Proactivo, monitorizado, de guardia en horario laboral.', hours: '16 horas / mes', response: '4 horas hábiles', includes: ['Todo lo de Growth Care', 'Monitorización de aplicación y base de datos con alertas', 'Respuesta a incidentes en horario laboral', 'Ciclo de releases mensual para mejoras', 'Monitorización de pagos, integraciones y webhooks', 'Revisión de seguridad trimestral', '16 horas de desarrollo al mes', 'Contacto de cuenta dedicado'] },
    'care-enterprise': { blurb: 'SLA contratado, monitorización 24/7 y un equipo con nombre. Dimensionado a tu arquitectura y obligaciones de cumplimiento.', hours: 'Capacidad dedicada', response: '1 hora, 24/7 bajo SLA', includes: ['Todo lo de Business Care', 'Monitorización y respuesta a incidentes 24/7', 'SLA contractual con objetivos de respuesta y resolución', 'Ingenieros con nombre y un delivery manager', 'Planificación de capacidad y optimización de coste', 'Simulacros de recuperación ante desastres', 'Soporte de cumplimiento y auditoría', 'Revisiones de roadmap y arquitectura', 'Equipo de desarrollo dedicado opcional'] },
  },
  id: {
    'care-essential': { blurb: 'Menjaga situs aman, terkini, dan online. Untuk landing dan situs portofolio.', hours: '2 jam / bulan', response: '2 hari kerja', includes: ['Pembaruan platform, dependensi, dan keamanan', 'Backup harian dengan retensi 30 hari', 'Monitoring uptime', 'Perpanjangan SSL dan perawatan DNS', 'Pemindaian malware dan kerentanan', 'Laporan kesehatan bulanan', '2 jam konten atau perubahan kecil', 'Dukungan email'] },
    'care-growth': { blurb: 'Perawatan plus peningkatan berkelanjutan untuk situs perusahaan yang harus berkinerja.', hours: '6 jam / bulan', response: '1 hari kerja', includes: ['Semua di Essential Care', 'Backup harian dengan retensi 90 hari', 'Monitoring performa dan penyetelan triwulanan', 'Pemeriksaan dan perbaikan kesehatan SEO', 'Pelaporan analitik dengan ulasan', '6 jam perubahan, konten, atau bagian baru', 'Lingkungan staging untuk peninjauan', 'Dukungan email dan chat'] },
    'care-business': { blurb: 'Untuk platform dan toko yang downtime-nya merugikan. Proaktif, dipantau, siaga di jam kerja.', hours: '16 jam / bulan', response: '4 jam kerja', includes: ['Semua di Growth Care', 'Monitoring aplikasi dan basis data dengan alerting', 'Respons insiden selama jam kerja', 'Siklus rilis bulanan untuk peningkatan', 'Monitoring pembayaran, integrasi, dan webhook', 'Peninjauan keamanan triwulanan', '16 jam pengembangan tiap bulan', 'Kontak akun khusus'] },
    'care-enterprise': { blurb: 'SLA berkontrak, monitoring 24/7, dan tim bernama. Dilingkup sesuai arsitektur dan kewajiban kepatuhan Anda.', hours: 'Kapasitas khusus', response: '1 jam, 24/7 di bawah SLA', includes: ['Semua di Business Care', 'Monitoring dan respons insiden 24/7', 'SLA kontraktual dengan target respons dan resolusi', 'Insinyur bernama dan delivery manager', 'Perencanaan kapasitas dan optimasi biaya', 'Latihan pemulihan bencana', 'Dukungan kepatuhan dan audit', 'Peninjauan roadmap dan arsitektur', 'Tim pengembangan khusus opsional'] },
  },
};

const CIVIC_T: Record<Exclude<Lang, 'en'>, Record<string, Partial<Pick<CivicTier, 'name' | 'scale' | 'summary' | 'capacity' | 'timeline' | 'includes'>>>> = {
  es: {
    'civic-village': { name: 'Aldea', scale: 'Una aldea · hasta ~30 mesas', summary: 'Verificación del censo, un registro de campo que funciona sin señal, y un escrutinio que produce una recapitulación imprimible la misma tarde.', capacity: 'Hasta 25.000 registros', timeline: '3–6 semanas', includes: ['Importación, limpieza y detección de duplicados del censo', 'Agrupación por hogar y marcado por registro con notas', 'Registro de campo offline-first — sin conexión requerida', 'Exportación de archivos y fusión entre agentes', 'Escrutinio en vivo con entrada por mesa', 'Recapitulación imprimible y hojas de detalle por mesa', 'Separación de roles: administrador, subárea, mesa, observador', 'Acceso por PIN con una hoja de acceso impresa'] },
    'civic-district': { name: 'Distrito / Municipio', scale: 'Muchas aldeas · cientos de mesas', summary: 'Todo lo del nivel aldea, agregado entre aldeas, con una capa de coordinación, conciliación entre agentes y un registro de auditoría en cada corrección.', capacity: '25.000 – 400.000 registros', timeline: '6–12 semanas', includes: ['Todo lo del nivel Aldea', 'Agregación multi-aldea con paneles por nivel', 'Jerarquía de coordinadores y administración delegada', 'Resolución de conflictos cuando dos agentes editan el mismo registro', 'Registro de auditoría completo: quién cambió qué, cuándo y desde dónde', 'Importación masiva y validación contra formatos de censo oficiales', 'Monitorización de progreso por área, por agente, por día', 'Subida de evidencia fotográfica por cada acta', 'Conjuntos de datos exportables para verificación externa'] },
    'civic-provincial': { name: 'Provincial', scale: 'Muchos municipios · miles de mesas', summary: 'Agregación en tiempo real de toda una provincia, hecha para absorber a cada agente reportando dentro de las mismas dos horas sin degradarse.', capacity: '400.000 – 5.000.000 registros', timeline: '12–20 semanas', includes: ['Todo lo del nivel Distrito', 'Agregación en tiempo real con propagación en menos de un minuto', 'Pruebas de carga contra el volumen de envíos en hora punta', 'Detección de anomalías en escrutinios inverosímiles y correcciones tardías', 'Página pública de resultados, cacheada en el edge, separada del sistema operativo', 'Acceso de observadores y prensa con vistas de solo lectura acotadas', 'Despliegue regional redundante con failover automático', 'Implementación de política de retención y archivado de datos', 'Revisión de seguridad y pruebas de penetración antes de la puesta en vivo', 'Cobertura de ingeniería de guardia para el día electoral'] },
    'civic-national': { name: 'Nacional', scale: 'Multiprovincia · operación de campo nacional', summary: 'Un programa nacional: infraestructura multirregión, obligaciones formales de cumplimiento y auditoría, recuperación ante desastres ensayada, y un SLA contratado que cubre el día electoral mismo.', capacity: '5.000.000+ registros', timeline: '20–40 semanas', includes: ['Todo lo del nivel Provincial', 'Infraestructura multirregión activo-activo', 'Auditoría de seguridad independiente y remediación publicada', 'Plan formal de recuperación ante desastres, ensayado bajo carga', 'Integridad criptográfica en los escrutinios enviados', 'Registros de cadena de custodia aptos para un recurso legal', 'Cumplimiento de accesibilidad en interfaces de campo y públicas', 'Interfaces de campo y públicas multilingües', 'Programa y materiales de formación para agentes de campo', 'Centro de operaciones dedicado y SLA 24/7 en torno a la ventana electoral', 'Exportación de auditoría post-electoral y soporte de conciliación independiente'] },
  },
  id: {
    'civic-village': { name: 'Desa', scale: 'Satu desa · hingga ~30 TPS', summary: 'Verifikasi daftar pemilih, register lapangan yang bekerja tanpa sinyal, dan penghitungan yang menghasilkan rekapitulasi siap cetak pada malam yang sama.', capacity: 'Hingga 25.000 data', timeline: '3–6 minggu', includes: ['Impor, pembersihan, dan deteksi duplikat daftar pemilih', 'Pengelompokan rumah tangga dan penandaan per-data dengan catatan', 'Register lapangan offline-first — tanpa koneksi', 'Ekspor berkas dan penggabungan antar-petugas', 'Penghitungan suara langsung dengan entri per-TPS', 'Rekapitulasi siap cetak dan lembar rincian per-TPS', 'Pemisahan peran: administrator, sub-wilayah, TPS, pengawas', 'Akses berbasis PIN dengan lembar akses cetak'] },
    'civic-district': { name: 'Kabupaten / Kota', scale: 'Banyak desa · ratusan TPS', summary: 'Semua yang dilakukan tingkat desa, diagregasi lintas desa, dengan lapisan koordinator, rekonsiliasi antar-petugas, dan jejak audit di tiap koreksi.', capacity: '25.000 – 400.000 data', timeline: '6–12 minggu', includes: ['Semua di tingkat Desa', 'Agregasi multi-desa dengan dasbor per-tingkat', 'Hierarki koordinator dan administrasi terdelegasi', 'Resolusi konflik saat dua petugas menyunting data yang sama', 'Jejak audit penuh: siapa mengubah apa, kapan, dan dari mana', 'Impor massal dan validasi terhadap format daftar resmi', 'Pemantauan progres per-wilayah, per-petugas, per-hari', 'Unggah bukti foto untuk tiap lembar penghitungan', 'Dataset yang dapat diekspor untuk verifikasi eksternal'] },
    'civic-provincial': { name: 'Provinsi', scale: 'Banyak kabupaten · ribuan TPS', summary: 'Agregasi real-time se-provinsi, dibangun untuk menyerap tiap petugas lapangan yang melapor dalam dua jam yang sama tanpa menurun.', capacity: '400.000 – 5.000.000 data', timeline: '12–20 minggu', includes: ['Semua di tingkat Kabupaten', 'Agregasi real-time dengan propagasi di bawah satu menit', 'Uji beban terhadap volume pengiriman jam puncak', 'Deteksi anomali pada penghitungan janggal dan koreksi terlambat', 'Halaman hasil publik, di-cache di edge, terpisah dari sistem operasional', 'Akses pengawas dan pers dengan tampilan baca-saja terbatas', 'Deployment regional redundan dengan failover otomatis', 'Implementasi kebijakan retensi dan pengarsipan data', 'Peninjauan keamanan dan penetration testing sebelum go-live', 'Cakupan teknik on-call untuk hari pemilihan'] },
    'civic-national': { name: 'Nasional', scale: 'Multi-provinsi · operasi lapangan nasional', summary: 'Program nasional: infrastruktur multi-wilayah, kewajiban kepatuhan dan audit formal, pemulihan bencana yang digladi, dan SLA berkontrak yang mencakup hari pemilihan itu sendiri.', capacity: '5.000.000+ data', timeline: '20–40 minggu', includes: ['Semua di tingkat Provinsi', 'Infrastruktur multi-wilayah aktif-aktif', 'Audit keamanan independen dan remediasi yang dipublikasikan', 'Rencana pemulihan bencana formal, digladi di bawah beban', 'Integritas kriptografis pada penghitungan yang dikirim', 'Catatan rantai penyimpanan yang layak untuk gugatan hukum', 'Kepatuhan aksesibilitas di antarmuka lapangan dan publik', 'Antarmuka lapangan dan publik multibahasa', 'Program dan materi pelatihan untuk petugas lapangan', 'Pusat operasi khusus dan SLA 24/7 seputar jendela pemilihan', 'Ekspor audit pasca-pemilihan dan dukungan rekonsiliasi independen'] },
  },
};

const CIVIC_CAP_T: Record<Exclude<Lang, 'en'>, { title: string; body: string }[]> = {
  es: [
    { title: 'Funciona sin señal', body: 'Las herramientas de campo corren enteramente en el navegador sin ida y vuelta al servidor, guardan su estado localmente y se fusionan limpiamente cuando los agentes vuelven a tener cobertura. Un salón comunal con una barra de señal es el caso normal, no la excepción.' },
    { title: 'Correcto bajo contención', body: 'Dos agentes editando el mismo registro es rutina. Los conflictos se detectan y resuelven de forma explícita en vez de sobrescribirse en silencio, y cada corrección conserva el valor que reemplazó.' },
    { title: 'Auditable por construcción', body: 'Cada cambio lleva quién, qué, cuándo y desde dónde. El registro de auditoría es una tabla de primera clase, no una ocurrencia de depuración, y se exporta en un formato que un tercero puede leer.' },
    { title: 'Hecho para un día difícil', body: 'La capacidad se prueba con tests de carga modelados sobre la curva real de envíos — miles de agentes reportando dentro de las mismas dos horas — no sobre tráfico medio.' },
    { title: 'Privado por defecto', body: 'Los datos personales se minimizan, el acceso se acota al área más pequeña que un agente necesita, y las superficies públicas se sirven desde agregados que no pueden revertirse a individuos.' },
    { title: 'Entregado por completo', body: 'Código, infraestructura, datos y documentación se transfieren al final. Nada de un sistema electoral debería depender de la buena voluntad continuada de su proveedor.' },
  ],
  id: [
    { title: 'Bekerja tanpa sinyal', body: 'Perkakas lapangan berjalan sepenuhnya di browser tanpa bolak-balik ke server, menyimpan statusnya secara lokal, dan bergabung rapi saat petugas kembali ke jangkauan. Balai desa dengan sinyal satu bar adalah kasus normal, bukan pengecualian.' },
    { title: 'Benar di bawah kontensi', body: 'Dua petugas menyunting data yang sama adalah hal rutin. Konflik dideteksi dan diselesaikan secara eksplisit alih-alih ditimpa diam-diam, dan tiap koreksi menyimpan nilai yang digantikannya.' },
    { title: 'Dapat diaudit sejak rancangan', body: 'Tiap perubahan membawa siapa, apa, kapan, dan dari mana. Log audit adalah tabel kelas satu, bukan renungan debugging, dan diekspor dalam bentuk yang bisa dibaca pihak luar.' },
    { title: 'Dibangun untuk satu hari berat', body: 'Kapasitas dibuktikan dengan uji beban yang dimodelkan pada kurva pengiriman nyata — ribuan petugas melapor dalam dua jam yang sama — bukan pada trafik rata-rata.' },
    { title: 'Privat secara bawaan', body: 'Data pribadi diminimalkan, akses dibatasi ke wilayah terkecil yang dibutuhkan petugas, dan permukaan publik disajikan dari agregat yang tak bisa dibalik menjadi individu.' },
    { title: 'Diserahkan sepenuhnya', body: 'Kode, infrastruktur, data, dan dokumentasi dipindahkan di akhir. Tak ada bagian dari sistem pemilihan yang boleh bergantung pada niat baik vendornya yang berkelanjutan.' },
  ],
};

const SUPER_T: Record<Exclude<Lang, 'en'>, { summary: string; forWhom: string[]; includes: string[]; terms: string[] }> = {
  es: {
    summary: 'Un ecosistema digital completo entregado por un equipo sénior dedicado: arquitectura a medida, múltiples plataformas, una capa de IA e infraestructura global, operado con un SLA contratado desde el primer día.',
    forWhom: ['Grupos internacionales que consolidan muchos sistemas en uno', 'Redes financieras, logísticas y de salud', 'Gobierno y organizaciones reguladas', 'Empresas que construyen una plataforma sobre la que operará todo su mercado'],
    includes: ['Equipo sénior dedicado durante toda la vida del programa', 'Gobierno de arquitectura, documentado y revisado trimestralmente', 'Plataformas de clientes, socios e internas', 'Infraestructura de API móvil y pública', 'Capa de IA: asistentes, recuperación, automatización y evaluación', 'Arquitectura cloud global con despliegue multirregión', 'Seguridad enterprise: SSO, MFA, RBAC, cifrado, registros de auditoría', 'Arquitectura de cumplimiento y soporte de auditoría', 'Recuperación ante desastres con failover ensayado', 'Monitorización y respuesta a incidentes 24/7 bajo SLA', 'Integración de pagos, ERP, CRM y logística', 'Traspaso completo de código, infraestructura y documentación'],
    terms: ['Revisión de alcance y arquitectura antes de firmar nada', 'Calendario de hitos acordado por programa, no de una plantilla', 'Contratado en EUR; liquidado en USDT o por acuerdo', 'Delivery manager con nombre y vía de escalado'],
  },
  id: {
    summary: 'Ekosistem digital lengkap yang dikerjakan tim senior khusus: arsitektur khusus, banyak platform, lapisan AI, dan infrastruktur global, dijalankan dengan SLA berkontrak sejak hari pertama.',
    forWhom: ['Grup internasional yang mengonsolidasi banyak sistem jadi satu', 'Jaringan keuangan, logistik, dan kesehatan', 'Pemerintah dan organisasi teregulasi', 'Perusahaan yang membangun platform yang akan dijalankan seluruh pasarnya'],
    includes: ['Tim pengerjaan senior khusus sepanjang masa program', 'Tata kelola arsitektur, terdokumentasi dan ditinjau triwulanan', 'Platform pelanggan, mitra, dan internal', 'Infrastruktur API seluler dan publik', 'Lapisan AI: asisten, retrieval, otomasi, dan evaluasi', 'Arsitektur cloud global dengan deployment multi-wilayah', 'Keamanan enterprise: SSO, MFA, RBAC, enkripsi, log audit', 'Arsitektur kepatuhan dan dukungan audit', 'Pemulihan bencana dengan failover yang digladi', 'Monitoring dan respons insiden 24/7 di bawah SLA', 'Integrasi pembayaran, ERP, CRM, dan logistik', 'Serah terima penuh kode sumber, infrastruktur, dan dokumentasi'],
    terms: ['Peninjauan ruang lingkup dan arsitektur sebelum apa pun ditandatangani', 'Jadwal termin disepakati per program, bukan dari template', 'Berkontrak dalam EUR; diselesaikan via USDT atau kesepakatan', 'Delivery manager bernama dan jalur eskalasi'],
  },
};

/* ─────────────────────────── merge helpers ─────────────────────────── */

export function localisedPackage(pkg: Package, lang: Lang): Package {
  if (lang === 'en') return pkg;
  const t = PACKAGE_T[lang]?.[pkg.slug];
  return t ? { ...pkg, ...t } : pkg;
}

export function localisedPackages(lang: Lang): Package[] {
  return PACKAGES.map((p) => localisedPackage(p, lang));
}

export function tierLabel(tier: Tier, lang: Lang): string {
  if (lang === 'en') return TIER_LABEL[tier];
  return TIER_T[lang]?.[tier] ?? TIER_LABEL[tier];
}

export function localisedAddon(a: AddOn, lang: Lang): AddOn {
  if (lang === 'en') return a;
  const t = ADDON_T[lang]?.[a.slug];
  return t ? { ...a, name: t.name ?? a.name, blurb: t.blurb } : a;
}

export function localisedAddons(lang: Lang): AddOn[] {
  return ADDONS.map((a) => localisedAddon(a, lang));
}

export function localisedSetupPlans(lang: Lang): SetupPlan[] {
  if (lang === 'en') return SETUP_PLANS;
  return SETUP_PLANS.map((s) => {
    const t = SETUP_T[lang]?.[s.slug];
    return t ? { ...s, ...t } : s;
  });
}

export function localisedCarePlans(lang: Lang): CarePlan[] {
  if (lang === 'en') return CARE_PLANS;
  return CARE_PLANS.map((c) => {
    const t = CARE_T[lang]?.[c.slug];
    return t ? { ...c, ...t } : c;
  });
}

export function localisedCivicTiers(lang: Lang): CivicTier[] {
  if (lang === 'en') return CIVIC_TIERS;
  return CIVIC_TIERS.map((c) => {
    const t = CIVIC_T[lang]?.[c.slug];
    return t ? { ...c, ...t } : c;
  });
}

export function localisedCivicCapabilities(lang: Lang): { title: string; body: string }[] {
  if (lang === 'en') return CIVIC_CAPABILITIES;
  return CIVIC_CAP_T[lang] ?? CIVIC_CAPABILITIES;
}

export function localisedSuperEnterprise(lang: Lang) {
  if (lang === 'en') return SUPER_ENTERPRISE;
  const t = SUPER_T[lang];
  return t ? { ...SUPER_ENTERPRISE, ...t } : SUPER_ENTERPRISE;
}

/** Related add-ons for a package, localised. */
export function localisedRelatedAddons(slugs: AddOn[], lang: Lang): AddOn[] {
  return slugs.map((a) => localisedAddon(a, lang));
}
