import Link from 'next/link';
import type { Metadata } from 'next';
import { SectionHead, CtaBand } from '@/components/Studio';
import { jsonLdHtml } from '@/lib/json-ld';
import { eur } from '@/content/packages';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Common questions about XAA: pricing, the 10/40/50 milestone schedule, timelines, ownership of code, USDT and PayPal payments, setup and maintenance.',
  alternates: { canonical: '/faq' },
};

type Group = { group: string; qa: { q: string; a: string }[] };
type Copy = {
  chip: string; h1a: string; h1b: string;
  groups: Group[];
  stillTitle: string; stillBody: string; askBtn: string; readBtn: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    chip: 'FAQ', h1a: 'Questions people ask', h1b: 'before they commit',
    groups: [
      { group: 'Pricing', qa: [
        { q: 'Why is every price a range rather than one number?', a: 'Because the same package can be a lean build or a heavily customised one. The range is the honest span between those. After a scope review we fix a single figure in writing, and the milestone amounts recalculate from it — the number does not move afterwards unless you ask for something new.' },
        { q: 'Are the prices in euros?', a: 'Yes. Every contract and invoice is in EUR, at European market rates, before VAT where it applies. You can settle in USDT or PayPal; the conversion is shown on the payment screen.' },
        { q: 'What is not included in the build price?', a: 'Domain registration, third-party licences and subscriptions, payment gateway fees, external API usage, paid stock assets, and the optional setup and care services. All of these are either passed through at cost or quoted separately before you commit.' },
        { q: 'Do you charge for the quote?', a: 'No. Registration, the quote and the scope review are free. The first money that changes hands is the 10% booking deposit, and that is deducted from the total.' },
      ]},
      { group: 'Payments', qa: [
        { q: 'Why 10% / 40% / 50%?', a: 'The 10% reserves a production slot and filters out projects that were never real. The 40% covers the design and build phase. The final 50% falls due only when the work is 75–80% finished and you have seen it running — so you are never paying far ahead of what exists.' },
        { q: 'Can I pay more than 10% up front?', a: 'Yes. Anything above the minimum simply counts towards the next milestone. Some clients settle the first 50% in one transfer to move straight into production.' },
        { q: 'What happens at 80% progress?', a: 'Progress is capped there until the settlement clears. It is a deliberate stop: it protects you from paying for work that does not exist, and protects us from delivering work that has not been paid for. The moment the payment is confirmed the cap lifts automatically.' },
        { q: 'Which USDT networks do you accept?', a: 'TRC20, ERC20 and BEP20. TRC20 is cheapest and what most clients use. The receiving address is shown only on your signed-in project page — we never send an address by email or chat.' },
        { q: 'Can I pay by bank transfer?', a: 'The two standard rails are USDT and PayPal. For enterprise engagements with procurement requirements, ask us — we can usually accommodate SEPA against a formal contract.' },
      ]},
      { group: 'Timelines & process', qa: [
        { q: 'When do I get a delivery date?', a: 'The moment your concept files land. The portal fixes an estimate from the package timeline and shows it on your project page, and we confirm scope against what you uploaded within one business day.' },
        { q: 'How do I know what is happening during the build?', a: 'Your project page carries a live progress percentage, the seven-stage rail, the milestone ledger and a dated activity log. Every payment, upload and progress change is written there automatically.' },
        { q: 'What if I need changes during the build?', a: 'Small adjustments inside the agreed scope are part of the work. Anything that adds scope is quoted and scheduled as a change before it starts — so the date and the price stay honest.' },
        { q: 'What do you need from me?', a: 'A concept or brief, your brand assets, the content (copy, images, product data), and one person who can make decisions. Late content is the single most common cause of a late launch.' },
      ]},
      { group: 'After launch', qa: [
        { q: 'Do I own the code?', a: 'Yes. At handover the source code, design files, admin accounts and infrastructure are transferred to you. Nothing is held back to force you into a maintenance contract.' },
        { q: 'Is maintenance compulsory?', a: `No. Care plans start at ${eur(99)}/month and are month to month with 30 days' notice. Plenty of clients take the one-time setup, get the handover and run it themselves.` },
        { q: 'What is the difference between setup and maintenance?', a: 'Setup is a one-time service that gets you live: domain, DNS, SSL, hosting, email records, analytics, backups, plus a training call. Maintenance is the monthly work that keeps you live: updates, patching, backups, monitoring and a block of development hours.' },
        { q: 'Can you take over a site someone else built?', a: 'Usually, after a paid audit so we know what we are inheriting. The audit fee is credited against the work if you go ahead.' },
      ]},
    ],
    stillTitle: 'Still unsure about something?',
    stillBody: 'Ask before you pay anything. We would rather talk you out of the wrong package than take the order.',
    askBtn: 'Ask a question', readBtn: 'Read the process',
  },
  es: {
    chip: 'Preguntas', h1a: 'Lo que preguntan', h1b: 'antes de comprometerse',
    groups: [
      { group: 'Precios', qa: [
        { q: '¿Por qué cada precio es un rango y no una cifra única?', a: 'Porque el mismo paquete puede ser un desarrollo austero o uno muy personalizado. El rango es el intervalo honesto entre ambos. Tras una revisión del alcance fijamos una cifra única por escrito, y los importes de los hitos se recalculan a partir de ella — la cifra no se mueve después salvo que pidas algo nuevo.' },
        { q: '¿Los precios son en euros?', a: 'Sí. Cada contrato y factura es en EUR, a tarifas de mercado europeas, antes de IVA cuando aplica. Puedes pagar en USDT o PayPal; la conversión se muestra en la pantalla de pago.' },
        { q: '¿Qué no incluye el precio del desarrollo?', a: 'Registro de dominio, licencias y suscripciones de terceros, comisiones de pasarela de pago, uso de API externas, recursos de stock de pago, y los servicios opcionales de puesta en marcha y mantenimiento. Todo esto se traslada a coste o se cotiza aparte antes de que te comprometas.' },
        { q: '¿Cobráis por el presupuesto?', a: 'No. El registro, el presupuesto y la revisión del alcance son gratis. El primer dinero que cambia de manos es el 10% de depósito de reserva, y se descuenta del total.' },
      ]},
      { group: 'Pagos', qa: [
        { q: '¿Por qué 10% / 40% / 50%?', a: 'El 10% reserva un turno de producción y filtra proyectos que nunca fueron reales. El 40% cubre la fase de diseño y desarrollo. El 50% final vence solo cuando el trabajo está al 75–80% y lo has visto funcionar — así nunca pagas muy por delante de lo que existe.' },
        { q: '¿Puedo pagar más del 10% por adelantado?', a: 'Sí. Todo lo que supere el mínimo cuenta para el siguiente hito. Algunos clientes pagan el primer 50% en una sola transferencia para pasar directo a producción.' },
        { q: '¿Qué pasa al 80% de avance?', a: 'El avance se limita ahí hasta que se liquida. Es una parada deliberada: te protege de pagar por trabajo que no existe, y a nosotros de entregar trabajo que no se ha pagado. En cuanto se confirma el pago, el límite se levanta automáticamente.' },
        { q: '¿Qué redes de USDT aceptáis?', a: 'TRC20, ERC20 y BEP20. TRC20 es la más barata y la que usa la mayoría. La dirección de recepción se muestra solo en tu página de proyecto con sesión iniciada — nunca enviamos una dirección por email o chat.' },
        { q: '¿Puedo pagar por transferencia bancaria?', a: 'Las dos vías estándar son USDT y PayPal. Para proyectos enterprise con requisitos de compras, pregúntanos — normalmente podemos aceptar SEPA contra un contrato formal.' },
      ]},
      { group: 'Plazos y proceso', qa: [
        { q: '¿Cuándo recibo una fecha de entrega?', a: 'En cuanto llegan tus archivos de concepto. El portal fija una estimación según el plazo del paquete y la muestra en tu página de proyecto, y confirmamos el alcance frente a lo que subiste en un día hábil.' },
        { q: '¿Cómo sé qué pasa durante el desarrollo?', a: 'Tu página de proyecto lleva un porcentaje de avance en vivo, el recorrido de siete etapas, el libro de hitos y un registro de actividad fechado. Cada pago, subida y cambio de avance se escribe allí automáticamente.' },
        { q: '¿Y si necesito cambios durante el desarrollo?', a: 'Los pequeños ajustes dentro del alcance acordado son parte del trabajo. Todo lo que añade alcance se cotiza y programa como un cambio antes de empezar — así la fecha y el precio siguen siendo honestos.' },
        { q: '¿Qué necesitáis de mí?', a: 'Un concepto o brief, tus recursos de marca, el contenido (textos, imágenes, datos de producto) y una persona que pueda decidir. El contenido tardío es la causa más común de un lanzamiento tardío.' },
      ]},
      { group: 'Tras el lanzamiento', qa: [
        { q: '¿Soy dueño del código?', a: 'Sí. En la entrega, el código fuente, los archivos de diseño, las cuentas de administración y la infraestructura se te transfieren. No se retiene nada para forzar un contrato de mantenimiento.' },
        { q: '¿El mantenimiento es obligatorio?', a: `No. Los planes de mantenimiento empiezan en ${eur(99)}/mes y son mes a mes con 30 días de aviso. Muchos clientes toman la puesta en marcha única, reciben la entrega y lo gestionan ellos mismos.` },
        { q: '¿Cuál es la diferencia entre puesta en marcha y mantenimiento?', a: 'La puesta en marcha es un servicio único que te pone en vivo: dominio, DNS, SSL, hosting, registros de correo, analítica, backups, más una llamada de formación. El mantenimiento es el trabajo mensual que te mantiene en vivo: actualizaciones, parches, backups, monitorización y un bloque de horas de desarrollo.' },
        { q: '¿Podéis retomar un sitio que hizo otro?', a: 'Normalmente, tras una auditoría pagada para saber qué heredamos. El coste de la auditoría se descuenta del trabajo si sigues adelante.' },
      ]},
    ],
    stillTitle: '¿Sigues con dudas?',
    stillBody: 'Pregunta antes de pagar nada. Preferimos disuadirte del paquete equivocado que aceptar el pedido.',
    askBtn: 'Hacer una pregunta', readBtn: 'Leer el proceso',
  },
  id: {
    chip: 'FAQ', h1a: 'Pertanyaan yang diajukan orang', h1b: 'sebelum mereka memutuskan',
    groups: [
      { group: 'Harga', qa: [
        { q: 'Kenapa tiap harga berupa rentang, bukan satu angka?', a: 'Karena paket yang sama bisa jadi build ramping atau yang sangat dikustomisasi. Rentang adalah jarak jujur di antara keduanya. Setelah tinjauan ruang lingkup kami kunci satu angka tertulis, dan jumlah tiap termin dihitung ulang darinya — angkanya tak bergerak setelah itu kecuali Anda minta hal baru.' },
        { q: 'Apakah harga dalam euro?', a: 'Ya. Tiap kontrak dan faktur dalam EUR, dengan tarif pasar Eropa, belum termasuk PPN bila berlaku. Anda bisa bayar via USDT atau PayPal; konversinya tampil di layar pembayaran.' },
        { q: 'Apa yang tidak termasuk dalam harga pembuatan?', a: 'Registrasi domain, lisensi dan langganan pihak ketiga, biaya payment gateway, penggunaan API eksternal, aset stok berbayar, serta layanan setup dan perawatan opsional. Semua ini diteruskan sesuai biaya atau ditawar terpisah sebelum Anda menyetujui.' },
        { q: 'Apakah penawaran dikenai biaya?', a: 'Tidak. Pendaftaran, penawaran, dan tinjauan ruang lingkup gratis. Uang pertama yang berpindah tangan adalah DP pemesanan 10%, dan itu dipotong dari total.' },
      ]},
      { group: 'Pembayaran', qa: [
        { q: 'Kenapa 10% / 40% / 50%?', a: 'DP 10% mengunci slot produksi dan menyaring proyek yang tak pernah nyata. 40% menutup fase desain dan pembuatan. 50% terakhir jatuh tempo hanya saat pekerjaan 75–80% selesai dan Anda telah melihatnya berjalan — jadi Anda tak pernah membayar jauh di depan dari yang ada.' },
        { q: 'Bisakah saya bayar lebih dari 10% di depan?', a: 'Bisa. Apa pun di atas minimum dihitung ke termin berikutnya. Sebagian klien membayar 50% pertama dalam satu transfer untuk langsung masuk produksi.' },
        { q: 'Apa yang terjadi pada progres 80%?', a: 'Progres dibatasi di situ hingga pelunasan masuk. Ini penghentian yang disengaja: melindungi Anda dari membayar pekerjaan yang tak ada, dan melindungi kami dari menyerahkan pekerjaan yang belum dibayar. Begitu pembayaran dikonfirmasi, batas terangkat otomatis.' },
        { q: 'Jaringan USDT apa yang Anda terima?', a: 'TRC20, ERC20, dan BEP20. TRC20 paling murah dan paling banyak dipakai klien. Alamat penerima hanya tampil di halaman proyek Anda saat masuk — kami tak pernah mengirim alamat via email atau chat.' },
        { q: 'Bisakah saya bayar via transfer bank?', a: 'Dua jalur standar adalah USDT dan PayPal. Untuk proyek enterprise dengan syarat pengadaan, tanyakan kami — biasanya kami bisa mengakomodasi SEPA dengan kontrak formal.' },
      ]},
      { group: 'Lini masa & proses', qa: [
        { q: 'Kapan saya mendapat tanggal selesai?', a: 'Begitu berkas konsep Anda masuk. Portal menetapkan perkiraan dari lini masa paket dan menampilkannya di halaman proyek Anda, dan kami mengunci ruang lingkup terhadap yang Anda unggah dalam satu hari kerja.' },
        { q: 'Bagaimana saya tahu yang terjadi selama pembuatan?', a: 'Halaman proyek Anda memuat persentase progres langsung, rel tujuh tahap, buku termin, dan log aktivitas bertanggal. Tiap pembayaran, unggahan, dan perubahan progres tertulis di sana otomatis.' },
        { q: 'Bagaimana jika saya butuh perubahan selama pembuatan?', a: 'Penyesuaian kecil dalam ruang lingkup yang disepakati adalah bagian dari pekerjaan. Apa pun yang menambah ruang lingkup ditawar dan dijadwalkan sebagai perubahan sebelum dimulai — jadi tanggal dan harga tetap jujur.' },
        { q: 'Apa yang Anda butuhkan dari saya?', a: 'Konsep atau brief, aset brand Anda, konten (teks, gambar, data produk), dan satu orang yang bisa memutuskan. Konten yang terlambat adalah penyebab peluncuran terlambat paling umum.' },
      ]},
      { group: 'Setelah rilis', qa: [
        { q: 'Apakah saya memiliki kodenya?', a: 'Ya. Saat serah terima, kode sumber, berkas desain, akun admin, dan infrastruktur dipindahkan ke Anda. Tak ada yang ditahan untuk memaksa Anda ke kontrak perawatan.' },
        { q: 'Apakah perawatan wajib?', a: `Tidak. Paket perawatan mulai ${eur(99)}/bulan dan bersifat bulanan dengan pemberitahuan 30 hari. Banyak klien mengambil setup sekali bayar, menerima serah terima, dan menjalankannya sendiri.` },
        { q: 'Apa beda setup dan perawatan?', a: 'Setup adalah layanan sekali bayar yang membuat Anda online: domain, DNS, SSL, hosting, catatan email, analitik, backup, plus panggilan pelatihan. Perawatan adalah pekerjaan bulanan yang menjaga Anda online: pembaruan, patching, backup, monitoring, dan blok jam pengembangan.' },
        { q: 'Bisakah Anda mengambil alih situs buatan orang lain?', a: 'Biasanya bisa, setelah audit berbayar agar kami tahu yang kami warisi. Biaya audit dikreditkan ke pekerjaan bila Anda melanjutkan.' },
      ]},
    ],
    stillTitle: 'Masih ragu soal sesuatu?',
    stillBody: 'Tanyakan sebelum Anda membayar apa pun. Kami lebih suka mencegah Anda memilih paket yang salah daripada menerima pesanannya.',
    askBtn: 'Ajukan pertanyaan', readBtn: 'Baca prosesnya',
  },
};

export default async function FaqPage() {
  const c = pick(await getLang(), COPY);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: c.groups.flatMap((g) =>
              g.qa.map((x) => ({
                '@type': 'Question',
                name: x.q,
                acceptedAnswer: { '@type': 'Answer', text: x.a },
              }))
            ),
          }),
        }}
      />

      <section className="hero relative overflow-hidden">
        <div className="hero-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <span className="chip">{c.chip}</span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            {c.h1a} <span className="accent-text">{c.h1b}</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        {c.groups.map((g) => (
          <div key={g.group} className="mb-12">
            <SectionHead title={g.group} />
            <div className="mt-6 space-y-3">
              {g.qa.map((x) => (
                <details key={x.q} className="panel group p-5">
                  <summary className="cursor-pointer list-none font-bold marker:hidden">
                    <span className="mr-2 text-gold-500 transition group-open:rotate-90 inline-block">▸</span>
                    {x.q}
                  </summary>
                  <p className="mt-3 pl-6 text-sm leading-relaxed text-steel-500">{x.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}

        <div className="panel p-6 text-center">
          <p className="font-display text-xl font-extrabold">{c.stillTitle}</p>
          <p className="mt-2 text-sm text-steel-500">{c.stillBody}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn btn-primary">{c.askBtn}</Link>
            <Link href="/process" className="btn btn-ghost">{c.readBtn}</Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
