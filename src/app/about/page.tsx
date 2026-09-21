import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { SectionHead, CtaBand } from '@/components/Studio';
import { BrandMark } from '@/components/Site';
import { PACKAGES, eur } from '@/content/packages';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'About',
  description: `${SITE.name} — ${SITE.expansionPlain}. A European web development studio building websites, stores and platforms with milestone-based payments and a client portal that shows real progress.`,
  alternates: { canonical: '/about' },
};

type Section = { h: string; html: string[] };
type Copy = {
  chip: string; heroLead: string;
  sections: Section[];
  archiveH: string; archiveBefore: string; archiveLink: string; archiveAfter: string;
  commitEyebrow: string; commitTitle: string; commitments: { t: string; b: string }[];
  ctaTitle: string; ctaLead: string; ctaPrimary: string; ctaSecondary: string;
};

const lo = eur(PACKAGES[0]!.priceMin);
const hi = eur(PACKAGES[PACKAGES.length - 1]!.priceMin);

const COPY: Record<Lang, Copy> = {
  en: {
    chip: 'About the studio',
    heroLead: 'We build the websites, stores and platforms that businesses actually operate on — and we structure the engagement so the client can see, at any hour, exactly what they have paid for and what has been built.',
    sections: [
      { h: 'The name', html: [
        'XAA.ES stands for <strong>eXperience, Automation and Architecture — Ecosystem Services</strong>, which is the order the work actually happens in. <strong>Experience</strong> is what the visitor feels: interface, speed, clarity, trust. <strong>Automation</strong> is what removes the manual step — the payment that reconciles itself, the report nobody has to assemble, the status a client can read without asking. <strong>Architecture</strong> is what holds it up: data models, services, security, infrastructure. And <strong>Ecosystem Services</strong> is the part most studios skip: keeping the thing alive once it ships.',
        'The studio operates from the <strong>.es</strong> domain and works in English, Spanish and Indonesian with clients across Europe and internationally. Contracts are in euros; payment is by USDT or PayPal.',
      ]},
      { h: 'How we are different, concretely', html: [
        'Most development studios ask for 50% up front and then go quiet for six weeks. We split payment into <strong>10% / 40% / 50%</strong>, and the last half only falls due once the build is 75–80% finished and you have seen it running. Progress is capped at 80% until it clears, which means neither side is ever far ahead of the other.',
        'Everything runs through a client portal rather than a chain of emails. You register, choose a package, pay the deposit, upload your concept, and from that moment your project page carries a completion date, a live progress percentage, a milestone ledger and a dated activity log. There is nothing to chase.',
      ]},
      { h: 'What we build', html: [
        `Ten packages, from a ${lo} landing page to a ${hi}+ global enterprise ecosystem, covering corporate sites, business platforms, e-commerce, marketplaces, SaaS products and enterprise portals. The scope changes with the package; the engineering standard does not.`,
      ]},
      { h: 'Ownership', html: [
        'At handover you receive the source code, the design files, the admin accounts and the infrastructure. Setup and maintenance are separate, optional services — never a lock-in, and never a reason to withhold anything we built for you.',
      ]},
    ],
    archiveH: 'The archive',
    archiveBefore: 'Before it became a studio, xaa.es published an independent football magazine covering the road to World Cup 2026. Those articles are still online, still free, and still ours — ',
    archiveLink: 'read the archive',
    archiveAfter: '. It is also, in a small way, a portfolio: the content system, the performance work and the SEO behind it are the same ones we build for clients.',
    commitEyebrow: 'What we promise', commitTitle: 'Four commitments, in writing',
    commitments: [
      { t: 'A price before you talk to a salesperson', b: 'Every package range is published. We will tell you which one you are in before you send a euro.' },
      { t: 'A date you can hold us to', b: 'Fixed the moment your concept lands, visible on your project page for the life of the build.' },
      { t: 'Progress you can verify', b: 'A percentage, a ledger and an activity log — not a status email written on a Friday afternoon.' },
      { t: 'The keys at the end', b: 'Code, designs, accounts and infrastructure transfer to you at handover. Always.' },
    ],
    ctaTitle: 'Work with us',
    ctaLead: 'Send a brief, or open a project and see the exact milestone amounts for your package before anything is due.',
    ctaPrimary: 'Send a brief', ctaSecondary: 'Browse packages',
  },
  es: {
    chip: 'Sobre el estudio',
    heroLead: 'Construimos los sitios web, tiendas y plataformas con las que los negocios realmente operan — y estructuramos el trabajo para que el cliente vea, a cualquier hora, exactamente qué ha pagado y qué se ha construido.',
    sections: [
      { h: 'El nombre', html: [
        'XAA.ES significa <strong>eXperiencia, Automatización y Arquitectura — Servicios de Ecosistema</strong>, que es el orden en que ocurre el trabajo. La <strong>Experiencia</strong> es lo que siente el visitante: interfaz, velocidad, claridad, confianza. La <strong>Automatización</strong> elimina el paso manual — el pago que se concilia solo, el informe que nadie tiene que armar, el estado que un cliente lee sin preguntar. La <strong>Arquitectura</strong> es lo que lo sostiene: modelos de datos, servicios, seguridad, infraestructura. Y los <strong>Servicios de Ecosistema</strong> son la parte que la mayoría de los estudios omite: mantener la cosa viva una vez lanzada.',
        'El estudio opera desde el dominio <strong>.es</strong> y trabaja en inglés, español e indonesio con clientes en Europa e internacionalmente. Los contratos son en euros; el pago es por USDT o PayPal.',
      ]},
      { h: 'En qué somos distintos, en concreto', html: [
        'La mayoría de los estudios piden el 50% por adelantado y luego desaparecen seis semanas. Nosotros repartimos el pago en <strong>10% / 40% / 50%</strong>, y la última mitad solo vence cuando el desarrollo está al 75–80% y lo has visto funcionar. El avance se limita al 80% hasta que se paga, lo que significa que ninguna parte va nunca muy por delante de la otra.',
        'Todo pasa por un portal del cliente en lugar de una cadena de emails. Te registras, eliges un paquete, pagas el depósito, subes tu concepto, y desde ese momento tu página de proyecto lleva una fecha de entrega, un porcentaje de avance en vivo, un libro de hitos y un registro de actividad fechado. No hay nada que perseguir.',
      ]},
      { h: 'Qué construimos', html: [
        `Diez paquetes, desde una landing de ${lo} hasta un ecosistema empresarial global de ${hi}+, que cubren sitios corporativos, plataformas de negocio, e-commerce, marketplaces, productos SaaS y portales enterprise. El alcance cambia con el paquete; el estándar de ingeniería no.`,
      ]},
      { h: 'Propiedad', html: [
        'En la entrega recibes el código fuente, los archivos de diseño, las cuentas de administración y la infraestructura. La puesta en marcha y el mantenimiento son servicios aparte y opcionales — nunca una permanencia, y nunca una razón para retener nada de lo que construimos para ti.',
      ]},
    ],
    archiveH: 'El archivo',
    archiveBefore: 'Antes de ser un estudio, xaa.es publicaba una revista de fútbol independiente sobre el camino al Mundial 2026. Esos artículos siguen en línea, siguen siendo gratis, y siguen siendo nuestros — ',
    archiveLink: 'lee el archivo',
    archiveAfter: '. También es, en cierto modo, un portafolio: el sistema de contenido, el trabajo de rendimiento y el SEO detrás son los mismos que construimos para clientes.',
    commitEyebrow: 'Lo que prometemos', commitTitle: 'Cuatro compromisos, por escrito',
    commitments: [
      { t: 'Un precio antes de hablar con un comercial', b: 'Cada rango de paquete está publicado. Te diremos en cuál estás antes de que envíes un euro.' },
      { t: 'Una fecha que puedes exigirnos', b: 'Fijada en cuanto llega tu concepto, visible en tu página de proyecto durante toda la vida del desarrollo.' },
      { t: 'Un avance que puedes verificar', b: 'Un porcentaje, un libro y un registro de actividad — no un email de estado escrito un viernes por la tarde.' },
      { t: 'Las llaves al final', b: 'Código, diseños, cuentas e infraestructura se te transfieren en la entrega. Siempre.' },
    ],
    ctaTitle: 'Trabaja con nosotros',
    ctaLead: 'Envía un brief, o abre un proyecto y ve los importes exactos de cada hito para tu paquete antes de que venza nada.',
    ctaPrimary: 'Enviar un brief', ctaSecondary: 'Ver paquetes',
  },
  id: {
    chip: 'Tentang studio',
    heroLead: 'Kami membangun situs web, toko, dan platform yang benar-benar dijalankan bisnis — dan kami menyusun kerja samanya agar klien bisa melihat, kapan saja, persis apa yang mereka bayar dan apa yang telah dibangun.',
    sections: [
      { h: 'Nama', html: [
        'XAA.ES adalah singkatan dari <strong>eXperience, Automation and Architecture — Ecosystem Services</strong>, yaitu urutan pekerjaannya benar-benar terjadi. <strong>Experience</strong> adalah yang dirasakan pengunjung: antarmuka, kecepatan, kejelasan, kepercayaan. <strong>Automation</strong> menghapus langkah manual — pembayaran yang mencocokkan sendiri, laporan yang tak perlu disusun siapa pun, status yang bisa dibaca klien tanpa bertanya. <strong>Architecture</strong> adalah yang menopangnya: model data, layanan, keamanan, infrastruktur. Dan <strong>Ecosystem Services</strong> adalah bagian yang dilewatkan kebanyakan studio: menjaga sistem tetap hidup setelah rilis.',
        'Studio beroperasi dari domain <strong>.es</strong> dan bekerja dalam bahasa Inggris, Spanyol, dan Indonesia dengan klien di seluruh Eropa dan internasional. Kontrak dalam euro; pembayaran via USDT atau PayPal.',
      ]},
      { h: 'Bagaimana kami berbeda, secara konkret', html: [
        'Kebanyakan studio minta 50% di depan lalu diam selama enam minggu. Kami membagi pembayaran menjadi <strong>10% / 40% / 50%</strong>, dan separuh terakhir baru jatuh tempo saat build 75–80% selesai dan Anda telah melihatnya berjalan. Progres dibatasi 80% hingga lunas, artinya tak ada pihak yang jauh mendahului pihak lain.',
        'Semua berjalan lewat portal klien, bukan rantai email. Anda mendaftar, memilih paket, membayar DP, mengunggah konsep, dan sejak itu halaman proyek Anda memuat tanggal selesai, persentase progres langsung, buku termin, dan log aktivitas bertanggal. Tak ada yang perlu dikejar.',
      ]},
      { h: 'Yang kami bangun', html: [
        `Sepuluh paket, dari halaman arahan ${lo} hingga ekosistem enterprise global ${hi}+, mencakup situs korporat, platform bisnis, e-commerce, marketplace, produk SaaS, dan portal enterprise. Ruang lingkup berubah sesuai paket; standar rekayasa tidak.`,
      ]},
      { h: 'Kepemilikan', html: [
        'Saat serah terima Anda menerima kode sumber, berkas desain, akun admin, dan infrastruktur. Setup dan perawatan adalah layanan terpisah dan opsional — tak pernah mengikat, dan tak pernah jadi alasan menahan apa pun yang kami bangun untuk Anda.',
      ]},
    ],
    archiveH: 'Arsip',
    archiveBefore: 'Sebelum menjadi studio, xaa.es menerbitkan majalah sepak bola independen tentang jalan menuju Piala Dunia 2026. Artikel-artikel itu masih daring, masih gratis, dan masih milik kami — ',
    archiveLink: 'baca arsipnya',
    archiveAfter: '. Ini juga, dalam skala kecil, sebuah portofolio: sistem konten, pekerjaan performa, dan SEO di baliknya adalah yang sama yang kami bangun untuk klien.',
    commitEyebrow: 'Yang kami janjikan', commitTitle: 'Empat komitmen, tertulis',
    commitments: [
      { t: 'Harga sebelum Anda bicara dengan sales', b: 'Setiap rentang paket dipublikasikan. Kami akan bilang Anda ada di paket mana sebelum Anda mengirim satu euro.' },
      { t: 'Tanggal yang bisa Anda pegang', b: 'Dikunci begitu konsep Anda masuk, terlihat di halaman proyek Anda sepanjang masa pembuatan.' },
      { t: 'Progres yang bisa Anda verifikasi', b: 'Sebuah persentase, buku, dan log aktivitas — bukan email status yang ditulis Jumat sore.' },
      { t: 'Kuncinya di akhir', b: 'Kode, desain, akun, dan infrastruktur dipindahkan ke Anda saat serah terima. Selalu.' },
    ],
    ctaTitle: 'Bekerja dengan kami',
    ctaLead: 'Kirim brief, atau buka proyek dan lihat jumlah tiap termin untuk paket Anda sebelum ada yang jatuh tempo.',
    ctaPrimary: 'Kirim brief', ctaSecondary: 'Jelajahi paket',
  },
};

export default async function AboutPage() {
  const c = pick(await getLang(), COPY);
  return (
    <>
      <section className="hero relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="flex flex-wrap items-center gap-6">
            <BrandMark size={96} />
            <div>
              <span className="chip">{c.chip}</span>
              <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
                XAA — <span className="accent-text">{SITE.expansionPlain}</span>
              </h1>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-slate-600">{c.heroLead}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="article-body">
          {c.sections.map((s) => (
            <div key={s.h}>
              <h2>{s.h}</h2>
              {s.html.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>
          ))}
          <h2>{c.archiveH}</h2>
          <p>
            {c.archiveBefore}
            <a href={SITE.magazine.path}>{c.archiveLink}</a>
            {c.archiveAfter}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <SectionHead eyebrow={c.commitEyebrow} title={c.commitTitle} />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {c.commitments.map((x) => (
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
