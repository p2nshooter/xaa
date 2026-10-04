import type { Lang } from '@/lib/i18n';
import { PACKAGES, SETUP_PLANS, eur } from '@/content/packages';
import { TEMPLATES } from '@/content/templates';

/**
 * Search titles and descriptions for every studio page, in all three languages.
 *
 * Written by hand per language (no machine translation), aimed at what people
 * in each market actually type: "web development studio" / "estudio de
 * desarrollo web" / "jasa pembuatan website". Titles stay under ~55 characters
 * so " · XAA" still fits a search result; descriptions stay within 160.
 * Prices are computed from the catalogue so they can never drift from the page.
 */

export type SeoCopy = Record<Lang, { title: string; description: string }>;

const lo = eur(PACKAGES[0]!.priceMin);
const hi = eur(PACKAGES[PACKAGES.length - 1]!.priceMin);
const tlo = eur(Math.min(...TEMPLATES.map((t) => t.price)));
const setupLo = eur(Math.min(...SETUP_PLANS.map((p) => p.price)));

export const SEO: Record<string, SeoCopy> = {
  home: {
    en: { title: 'XAA — Web development studio: websites, SaaS & platforms', description: `European web development studio: landing pages, company websites, e-commerce, SaaS and enterprise platforms from ${lo}. Milestone payments in USDT or PayPal.` },
    es: { title: 'XAA — Estudio de desarrollo web: webs, SaaS y plataformas', description: `Estudio europeo de desarrollo web: landing pages, webs corporativas, tiendas online, SaaS y plataformas empresariales desde ${lo}. Pago por hitos en USDT o PayPal.` },
    id: { title: 'XAA — Jasa pembuatan website, aplikasi SaaS & platform', description: `Studio pengembangan web: landing page, website perusahaan, toko online, SaaS dan platform enterprise mulai ${lo}. Pembayaran bertahap via USDT atau PayPal.` },
  },
  services: {
    en: { title: 'Website & platform development packages and prices', description: `Ten development packages, from a ${lo} landing page to a ${hi}+ enterprise ecosystem. Prices published up front, paid in 10/40/50 milestones.` },
    es: { title: 'Paquetes y precios de desarrollo web y plataformas', description: `Diez paquetes de desarrollo, desde una landing page de ${lo} hasta un ecosistema empresarial de ${hi}+. Precios publicados y pago por hitos 10/40/50.` },
    id: { title: 'Paket & harga jasa pembuatan website dan platform', description: `Sepuluh paket pengembangan, dari landing page ${lo} hingga ekosistem enterprise ${hi}+. Harga dipublikasikan di awal, dibayar bertahap 10/40/50.` },
  },
  templates: {
    en: { title: 'Ready-made SaaS templates with full source code', description: `Production-ready SaaS you buy once and rebrand: full source code, database and setup guide in one download. From ${tlo} starters to enterprise platforms.` },
    es: { title: 'Plantillas SaaS listas con código fuente completo', description: `SaaS listos para producción que compras una vez y personalizas: código fuente, base de datos y guía de instalación en una descarga. Desde ${tlo}.` },
    id: { title: 'Template SaaS siap pakai dengan source code lengkap', description: `SaaS siap produksi yang dibeli sekali lalu diganti merek: source code lengkap, database dan panduan setup dalam satu unduhan. Mulai ${tlo}.` },
  },
  portfolio: {
    en: { title: 'Portfolio — platforms and software built by XAA', description: 'Systems XAA has built and runs: an AI and security platform, consumer platforms, production management software, web applications and an editorial network.' },
    es: { title: 'Portafolio — plataformas y software creados por XAA', description: 'Sistemas que XAA ha construido y opera: una plataforma de IA y seguridad, plataformas de consumo, software de gestión de producción y aplicaciones web.' },
    id: { title: 'Portofolio — platform dan software buatan XAA', description: 'Sistem yang dibangun dan dijalankan XAA: platform AI dan keamanan, platform konsumen, software manajemen produksi, aplikasi web dan jaringan media.' },
  },
  process: {
    en: { title: 'How a web project runs: deposit, milestones, delivery', description: 'Register, choose a package, pay a 10% deposit and upload your concept. Get a delivery date, pay 40% to start and the final 50% at 75–80% progress.' },
    es: { title: 'Cómo funciona un proyecto: depósito, hitos y entrega', description: 'Regístrate, elige un paquete, paga un depósito del 10% y sube tu concepto. Recibe una fecha de entrega, paga el 40% al empezar y el 50% final al 75–80%.' },
    id: { title: 'Alur proyek website: DP, milestone dan serah terima', description: 'Daftar, pilih paket, bayar DP 10% dan unggah konsep Anda. Dapatkan tanggal selesai, bayar 40% untuk mulai produksi dan 50% terakhir di progres 75–80%.' },
  },
  care: {
    en: { title: 'Website setup and AI backup & recovery', description: `One-time setup from ${setupLo} plus an AI backup-and-recovery system: one-click daily, weekly and monthly backups, restore, database reset and AI web fixes.` },
    es: { title: 'Instalación web y backup y recuperación con IA', description: `Instalación única desde ${setupLo} y un sistema de backup y recuperación con IA: copias diarias, semanales y mensuales con un clic, restauración y reparación.` },
    id: { title: 'Setup website dan AI backup & recovery', description: `Setup sekali bayar mulai ${setupLo} plus sistem AI backup & recovery: backup harian, mingguan dan bulanan sekali klik, restore, reset database dan perbaikan AI.` },
  },
  payments: {
    en: { title: 'Payments in USDT and PayPal, milestone-based', description: 'XAA invoices in euros and accepts USDT (TRC20, ERC20, BEP20) and PayPal. Milestone payments of 10%, 40% and 50%, confirmed within one business day.' },
    es: { title: 'Pagos en USDT y PayPal, por hitos', description: 'XAA factura en euros y acepta USDT (TRC20, ERC20, BEP20) y PayPal. Pagos por hitos del 10%, 40% y 50%, confirmados en un día laborable.' },
    id: { title: 'Pembayaran USDT dan PayPal, bertahap per milestone', description: 'XAA menagih dalam euro dan menerima USDT (TRC20, ERC20, BEP20) serta PayPal. Pembayaran bertahap 10%, 40% dan 50%, dikonfirmasi dalam satu hari kerja.' },
  },
  capabilities: {
    en: { title: 'Capabilities & tech stack for web and SaaS builds', description: 'What XAA builds with: modern web frameworks, edge deployment, relational data, payments, security and AI integration, and the standards behind every build.' },
    es: { title: 'Capacidades y tecnología para webs y SaaS', description: 'Con qué construye XAA: frameworks web modernos, despliegue en el edge, bases de datos relacionales, pagos, seguridad e integración de IA.' },
    id: { title: 'Kemampuan & teknologi untuk website dan SaaS', description: 'Teknologi yang dipakai XAA: framework web modern, deployment di edge, database relasional, pembayaran, keamanan dan integrasi AI di setiap proyek.' },
  },
  faq: {
    en: { title: 'FAQ — pricing, milestones, timelines and ownership', description: 'Answers about XAA: pricing, the 10/40/50 milestone schedule, timelines, code ownership, USDT and PayPal payments, setup and AI backup & recovery.' },
    es: { title: 'Preguntas frecuentes: precios, hitos, plazos y código', description: 'Respuestas sobre XAA: precios, el calendario de hitos 10/40/50, plazos, propiedad del código, pagos en USDT y PayPal, instalación y backup con IA.' },
    id: { title: 'FAQ — harga, milestone, durasi dan kepemilikan kode', description: 'Jawaban seputar XAA: harga, jadwal pembayaran 10/40/50, durasi pengerjaan, kepemilikan source code, pembayaran USDT dan PayPal, setup dan AI backup.' },
  },
  about: {
    en: { title: 'About XAA — eXperience, Automation & Architecture', description: 'XAA is a web development studio building websites, stores and platforms with milestone-based payments and a client portal that shows real progress.' },
    es: { title: 'Sobre XAA — eXperience, Automation & Architecture', description: 'XAA es un estudio de desarrollo web que crea webs, tiendas y plataformas con pagos por hitos y un portal de cliente que muestra el progreso real.' },
    id: { title: 'Tentang XAA — eXperience, Automation & Architecture', description: 'XAA adalah studio pengembangan web yang membangun website, toko online dan platform dengan pembayaran bertahap dan portal klien yang menampilkan progres nyata.' },
  },
  contact: {
    en: { title: 'Contact XAA — get a price and a delivery estimate', description: 'Send XAA a brief. We reply within one business day with the package your project fits, a realistic price and a delivery estimate.' },
    es: { title: 'Contacto — pide precio y plazo de entrega', description: 'Envía tu briefing a XAA. Respondemos en un día laborable con el paquete que encaja con tu proyecto, un precio realista y un plazo de entrega.' },
    id: { title: 'Kontak XAA — minta harga dan estimasi waktu', description: 'Kirim brief ke XAA. Kami balas dalam satu hari kerja dengan paket yang cocok, harga yang realistis dan estimasi waktu pengerjaan.' },
  },
  company: {
    en: { title: 'Company profile — PT AXTO DIGITAL GLOBAL', description: 'PT AXTO DIGITAL GLOBAL, the company behind XAA.es and AXTO: leadership (CEO Ulyah Munayah, CTO Yusron Efendi), partnership agreement and legal entity.' },
    es: { title: 'Perfil de empresa — PT AXTO DIGITAL GLOBAL', description: 'PT AXTO DIGITAL GLOBAL, la empresa detrás de XAA.es y AXTO: dirección (CEO Ulyah Munayah, CTO Yusron Efendi), acuerdo de asociación y datos legales.' },
    id: { title: 'Profil perusahaan — PT AXTO DIGITAL GLOBAL', description: 'PT AXTO DIGITAL GLOBAL, perusahaan di balik XAA.es dan AXTO: pimpinan (CEO Ulyah Munayah, CTO Yusron Efendi), perjanjian kemitraan dan legalitas.' },
  },
  election: {
    en: { title: 'Election & civic systems: voter rolls and tallying', description: 'Voter-roll verification, offline field registers and live vote tallying — priced from a single village at €6,000 to a national programme at €600,000+.' },
    es: { title: 'Sistemas electorales y cívicos: censo y recuento', description: 'Verificación del censo electoral, registros de campo sin conexión y recuento en vivo, desde €6.000 para un pueblo hasta €600.000+ para un programa nacional.' },
    id: { title: 'Sistem pemilu & layanan publik: DPT dan rekapitulasi', description: 'Verifikasi DPT, pendataan lapangan offline dan rekapitulasi suara real-time — mulai €6.000 untuk satu desa hingga €600.000+ untuk program nasional.' },
  },
  privacy: {
    en: { title: 'Privacy policy — how XAA handles personal data', description: 'How XAA collects, uses and protects personal data across the studio site, the client portal and the editorial archive.' },
    es: { title: 'Política de privacidad — datos personales en XAA', description: 'Cómo XAA recoge, usa y protege los datos personales en la web del estudio, el portal de clientes y el archivo editorial.' },
    id: { title: 'Kebijakan privasi — pengelolaan data pribadi XAA', description: 'Cara XAA mengumpulkan, menggunakan dan melindungi data pribadi di situs studio, portal klien dan arsip editorial.' },
  },
  cookies: {
    en: { title: 'Cookie policy — which cookies XAA uses and why', description: 'Which cookies are set on xaa.es, which are strictly necessary for the client portal, how Google AdSense uses advertising cookies and how to control them.' },
    es: { title: 'Política de cookies — qué cookies usa XAA y por qué', description: 'Qué cookies se usan en xaa.es, cuáles son necesarias para el portal de clientes, cómo usa Google AdSense las cookies publicitarias y cómo gestionarlas.' },
    id: { title: 'Kebijakan kuki — kuki yang dipakai XAA dan alasannya', description: 'Kuki apa saja yang dipakai di xaa.es, mana yang wajib untuk portal klien, bagaimana Google AdSense memakai kuki iklan dan cara mengaturnya.' },
  },
  disclaimer: {
    en: { title: 'Disclaimer — the limits of the guides and examples on XAA', description: 'What the guides, estimates and code examples published by XAA are and are not, and when to get professional advice for your own project.' },
    es: { title: 'Aviso de responsabilidad — límites de las guías de XAA', description: 'Qué son y qué no son las guías, estimaciones y ejemplos de código que publica XAA, y cuándo pedir asesoramiento profesional para tu proyecto.' },
    id: { title: 'Penafian — batas panduan dan contoh di XAA', description: 'Apa yang dimaksud dan tidak dimaksud dari panduan, estimasi dan contoh kode yang diterbitkan XAA, dan kapan perlu nasihat profesional.' },
  },
  editorial: {
    en: { title: 'Editorial policy — how XAA researches and writes its guides', description: 'The standards, sources, review process and corrections policy behind every guide and article published by XAA.' },
    es: { title: 'Política editorial — cómo investiga y escribe XAA sus guías', description: 'Los criterios, fuentes, revisión y política de correcciones detrás de cada guía y artículo que publica XAA.' },
    id: { title: 'Kebijakan editorial — cara XAA meneliti dan menulis panduannya', description: 'Standar, sumber, proses tinjauan dan kebijakan koreksi di balik setiap panduan dan artikel yang diterbitkan XAA.' },
  },
  terms: {
    en: { title: 'Terms of engagement for web development projects', description: 'The terms under which XAA accepts, builds and delivers website and platform projects — payments, timelines, ownership, cancellation and liability.' },
    es: { title: 'Condiciones de contratación de proyectos web', description: 'Las condiciones con las que XAA acepta, desarrolla y entrega proyectos web y de plataforma: pagos, plazos, propiedad, cancelación y responsabilidad.' },
    id: { title: 'Syarat & ketentuan proyek pengembangan website', description: 'Ketentuan XAA dalam menerima, mengerjakan dan menyerahkan proyek website dan platform — pembayaran, durasi, kepemilikan, pembatalan dan tanggung jawab.' },
  },
  register: {
    en: { title: 'Create a client portal account', description: 'Register for the XAA client portal — free, and nothing is charged until you open a project and choose to pay the deposit.' },
    es: { title: 'Crea tu cuenta en el portal de clientes', description: 'Regístrate en el portal de clientes de XAA: es gratis y no se cobra nada hasta que abras un proyecto y elijas pagar el depósito.' },
    id: { title: 'Buat akun portal klien XAA', description: 'Daftar ke portal klien XAA — gratis, tanpa biaya sampai Anda membuka proyek dan memilih membayar DP.' },
  },
  login: {
    en: { title: 'Sign in to the client portal', description: 'Sign in to the XAA client portal to see your project progress, milestones and invoices.' },
    es: { title: 'Accede al portal de clientes', description: 'Accede al portal de clientes de XAA para ver el progreso, los hitos y las facturas de tu proyecto.' },
    id: { title: 'Masuk ke portal klien', description: 'Masuk ke portal klien XAA untuk melihat progres proyek, milestone dan tagihan Anda.' },
  },
};
