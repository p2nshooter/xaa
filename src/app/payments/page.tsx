import Link from 'next/link';
import type { Metadata } from 'next';
import { SectionHead, CtaBand } from '@/components/Studio';
import { eur, usd, USD_PER_EUR } from '@/content/packages';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Payments — USDT & PayPal',
  description:
    'XAA invoices in euros and accepts USDT (TRC20, ERC20, BEP20) and PayPal. Milestone payments of 10%, 40% and 50%, confirmed within one business day.',
  alternates: { canonical: '/payments' },
};

type Copy = {
  chip: string; h1a: string; h1b: string; heroLead: string;
  usdtSub: string; usdtBody: string; usdtList: string[];
  usdtHowT: string; usdtHow: (rate: string, e: string, u: string) => string; usdtFee: string;
  ppSub: string; ppBody: string; ppList: string[]; ppFeeT: string; ppFee: string; ppNote: string;
  stepsEyebrow: string; stepsTitle: string; steps: { n: string; t: string; b: string }[];
  invTitle: string; inv: string[];
  refTitle: string; ref: string[]; refFull0: string; refFullLink: string; refFull1: string;
  secTitle: string; secBody0: string; secOnly: string; secBody1: string;
  ctaTitle: string; ctaLead: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    chip: 'Payments', h1a: 'Invoiced in euros.', h1b: 'Paid in USDT or PayPal.',
    heroLead: 'Two rails, both settling worldwide, both confirmed within one business day. Every invoice is issued in EUR because that is the contract currency; how you send the money is your choice.',
    usdtSub: 'Tether, on three networks',
    usdtBody: "The fastest option, and the one most international clients use. We accept USDT on TRC20, ERC20 and BEP20. The exact receiving address for your network is shown on your project's payment screen — we never send an address by email, and you should never accept one that arrives that way.",
    usdtList: ['TRC20 (Tron) — lowest fees, recommended', 'ERC20 (Ethereum)', 'BEP20 (BNB Smart Chain)', 'Confirmed on-chain, usually within minutes'],
    usdtHowT: 'How the amount is worked out',
    usdtHow: (rate, e, u) => `Invoices are in EUR. Your project page converts the milestone into USDT at the rate on the day — currently about ${rate} USDT per euro, so ${e} ≈ ${u}. Send the USDT amount shown on the payment screen, paste the transaction hash, and the milestone clears once we verify it on-chain.`,
    usdtFee: 'Network fees are paid by the sender. Send only USDT on the network you selected — a transfer on the wrong network cannot be recovered.',
    ppSub: 'EUR, card or balance',
    ppBody: 'If you would rather pay from a company card or a PayPal balance, every milestone can be settled in euros through PayPal. The payment screen gives you the invoice reference to quote so the transfer is matched to your project automatically.',
    ppList: ['Paid in EUR, the contract currency', 'Card, bank or PayPal balance', 'Buyer protection on your side', 'Confirmed within one business day'],
    ppFeeT: 'A note on fees',
    ppFee: "PayPal's processing fee on cross-border commercial payments is charged to us and is already built into the published prices — you pay the invoice amount and nothing more. Currency conversion, if your account is not in EUR, is between you and PayPal.",
    ppNote: 'Always send as a payment for goods and services, quoting your project reference (XAA-…). Friends-and-family transfers remove your protection and we will ask you to resend.',
    stepsEyebrow: 'Every milestone, the same five steps', stepsTitle: 'How a payment clears',
    steps: [
      { n: '1', t: 'Milestone falls due', b: 'The portal raises it automatically when the stage is reached.' },
      { n: '2', t: 'Choose your rail', b: 'USDT on your network, or PayPal in EUR. The screen shows the exact amount.' },
      { n: '3', t: 'Send and record it', b: 'Paste the transaction hash or PayPal ID; attach a screenshot if you like.' },
      { n: '4', t: 'We verify', b: 'On-chain or in the PayPal account, within one business day.' },
      { n: '5', t: 'Stage unlocks', b: 'Status, progress cap and the activity log update by themselves.' },
    ],
    invTitle: 'Invoices, VAT and receipts',
    inv: [
      'Every milestone produces a numbered invoice in EUR.',
      'EU business clients: supply your VAT number and the reverse-charge rule is applied.',
      'Clients outside the EU are invoiced without EU VAT.',
      'Receipts are issued for USDT payments with the transaction hash on the document.',
      'Domain fees, third-party licences and gateway charges are passed through at cost.',
    ],
    refTitle: 'Refunds and cancellation',
    ref: [
      'Cancel before the concept review and the deposit is refunded less any work performed.',
      'Cancel during production and you are billed for the progress recorded on the activity log, no more.',
      'Work completed and paid for is yours, whatever happens next — code and design files are released.',
      'If we fail to deliver the agreed scope, unearned milestones are returned on the same rail you paid with.',
    ],
    refFull0: 'Full detail in the ', refFullLink: 'terms of engagement', refFull1: '.',
    secTitle: 'Security: how to know a payment request is really from us',
    secBody0: 'Payment details are shown ', secOnly: 'only', secBody1: ' inside your signed-in project page at xaa.es/portal. We will never email you a wallet address, never message you asking to redirect a payment to a "new" address, and never ask for your password. If you receive anything like that, it is not us — forward it to us and confirm the details on your project page before sending anything.',
    ctaTitle: 'Ready when you are',
    ctaLead: 'Open a project to see your exact milestone amounts in both EUR and USDT before anything is due.',
  },
  es: {
    chip: 'Pagos', h1a: 'Facturado en euros.', h1b: 'Pagado en USDT o PayPal.',
    heroLead: 'Dos vías, ambas liquidan en todo el mundo, ambas confirmadas en un día hábil. Cada factura se emite en EUR porque es la moneda del contrato; cómo envías el dinero es tu elección.',
    usdtSub: 'Tether, en tres redes',
    usdtBody: 'La opción más rápida, y la que usa la mayoría de clientes internacionales. Aceptamos USDT en TRC20, ERC20 y BEP20. La dirección exacta de recepción para tu red se muestra en la pantalla de pago de tu proyecto — nunca enviamos una dirección por email, y nunca deberías aceptar una que llegue así.',
    usdtList: ['TRC20 (Tron) — comisiones más bajas, recomendada', 'ERC20 (Ethereum)', 'BEP20 (BNB Smart Chain)', 'Confirmado on-chain, normalmente en minutos'],
    usdtHowT: 'Cómo se calcula el importe',
    usdtHow: (rate, e, u) => `Las facturas son en EUR. Tu página de proyecto convierte el hito a USDT al cambio del día — actualmente unos ${rate} USDT por euro, así que ${e} ≈ ${u}. Envía el importe de USDT que muestra la pantalla de pago, pega el hash de la transacción, y el hito se salda en cuanto lo verificamos on-chain.`,
    usdtFee: 'Las comisiones de red las paga quien envía. Envía solo USDT en la red que elegiste — una transferencia en la red equivocada no se puede recuperar.',
    ppSub: 'EUR, tarjeta o saldo',
    ppBody: 'Si prefieres pagar desde una tarjeta de empresa o un saldo de PayPal, cada hito se puede saldar en euros por PayPal. La pantalla de pago te da la referencia de factura a indicar para que la transferencia se asocie a tu proyecto automáticamente.',
    ppList: ['Pagado en EUR, la moneda del contrato', 'Tarjeta, banco o saldo de PayPal', 'Protección al comprador de tu lado', 'Confirmado en un día hábil'],
    ppFeeT: 'Una nota sobre comisiones',
    ppFee: 'La comisión de procesamiento de PayPal en pagos comerciales transfronterizos nos la cobran a nosotros y ya está incluida en los precios publicados — pagas el importe de la factura y nada más. La conversión de divisa, si tu cuenta no está en EUR, es entre tú y PayPal.',
    ppNote: 'Envía siempre como pago por bienes y servicios, indicando tu referencia de proyecto (XAA-…). Las transferencias entre amigos y familia eliminan tu protección y te pediremos que reenvíes.',
    stepsEyebrow: 'Cada hito, los mismos cinco pasos', stepsTitle: 'Cómo se salda un pago',
    steps: [
      { n: '1', t: 'El hito vence', b: 'El portal lo emite automáticamente al alcanzar la etapa.' },
      { n: '2', t: 'Elige tu vía', b: 'USDT en tu red, o PayPal en EUR. La pantalla muestra el importe exacto.' },
      { n: '3', t: 'Envíalo y regístralo', b: 'Pega el hash de la transacción o el ID de PayPal; adjunta una captura si quieres.' },
      { n: '4', t: 'Verificamos', b: 'On-chain o en la cuenta de PayPal, en un día hábil.' },
      { n: '5', t: 'La etapa se desbloquea', b: 'El estado, el límite de avance y el registro de actividad se actualizan solos.' },
    ],
    invTitle: 'Facturas, IVA y recibos',
    inv: [
      'Cada hito produce una factura numerada en EUR.',
      'Clientes empresa de la UE: aporta tu número de IVA y se aplica la inversión del sujeto pasivo.',
      'Los clientes fuera de la UE se facturan sin IVA de la UE.',
      'Se emiten recibos para los pagos en USDT con el hash de la transacción en el documento.',
      'Las tasas de dominio, licencias de terceros y cargos de pasarela se trasladan a coste.',
    ],
    refTitle: 'Reembolsos y cancelación',
    ref: [
      'Cancela antes de la revisión del concepto y se reembolsa el depósito menos el trabajo realizado.',
      'Cancela durante la producción y se te factura por el avance registrado en el registro de actividad, nada más.',
      'El trabajo terminado y pagado es tuyo, pase lo que pase — se liberan el código y los archivos de diseño.',
      'Si no entregamos el alcance acordado, los hitos no devengados se devuelven por la misma vía con la que pagaste.',
    ],
    refFull0: 'Todo el detalle en los ', refFullLink: 'términos de contratación', refFull1: '.',
    secTitle: 'Seguridad: cómo saber que una solicitud de pago es realmente nuestra',
    secBody0: 'Los datos de pago se muestran ', secOnly: 'solo', secBody1: ' dentro de tu página de proyecto con sesión iniciada en xaa.es/portal. Nunca te enviaremos una dirección de wallet por email, nunca te escribiremos pidiendo redirigir un pago a una dirección "nueva", y nunca te pediremos tu contraseña. Si recibes algo así, no somos nosotros — reenvíanoslo y confirma los datos en tu página de proyecto antes de enviar nada.',
    ctaTitle: 'Listos cuando tú lo estés',
    ctaLead: 'Abre un proyecto para ver los importes exactos de cada hito en EUR y USDT antes de que venza nada.',
  },
  id: {
    chip: 'Pembayaran', h1a: 'Difaktur dalam euro.', h1b: 'Dibayar via USDT atau PayPal.',
    heroLead: 'Dua jalur, keduanya menyelesaikan di seluruh dunia, keduanya dikonfirmasi dalam satu hari kerja. Tiap faktur terbit dalam EUR karena itu mata uang kontrak; bagaimana Anda mengirim uangnya adalah pilihan Anda.',
    usdtSub: 'Tether, di tiga jaringan',
    usdtBody: 'Opsi tercepat, dan yang paling banyak dipakai klien internasional. Kami menerima USDT di TRC20, ERC20, dan BEP20. Alamat penerima persis untuk jaringan Anda tampil di layar pembayaran proyek Anda — kami tak pernah mengirim alamat via email, dan Anda tak boleh menerima yang datang dengan cara itu.',
    usdtList: ['TRC20 (Tron) — biaya terendah, disarankan', 'ERC20 (Ethereum)', 'BEP20 (BNB Smart Chain)', 'Dikonfirmasi on-chain, biasanya dalam hitungan menit'],
    usdtHowT: 'Bagaimana jumlahnya dihitung',
    usdtHow: (rate, e, u) => `Faktur dalam EUR. Halaman proyek Anda mengonversi termin ke USDT pada kurs hari itu — saat ini sekitar ${rate} USDT per euro, jadi ${e} ≈ ${u}. Kirim jumlah USDT yang tampil di layar pembayaran, tempel hash transaksi, dan termin lunas begitu kami verifikasi on-chain.`,
    usdtFee: 'Biaya jaringan dibayar pengirim. Kirim hanya USDT di jaringan yang Anda pilih — transfer di jaringan yang salah tak bisa dipulihkan.',
    ppSub: 'EUR, kartu atau saldo',
    ppBody: 'Bila Anda lebih suka membayar dari kartu perusahaan atau saldo PayPal, tiap termin bisa dilunasi dalam euro lewat PayPal. Layar pembayaran memberi Anda referensi faktur untuk dicantumkan agar transfer otomatis dicocokkan ke proyek Anda.',
    ppList: ['Dibayar dalam EUR, mata uang kontrak', 'Kartu, bank, atau saldo PayPal', 'Perlindungan pembeli di sisi Anda', 'Dikonfirmasi dalam satu hari kerja'],
    ppFeeT: 'Catatan soal biaya',
    ppFee: 'Biaya pemrosesan PayPal untuk pembayaran komersial lintas negara ditagihkan ke kami dan sudah termasuk dalam harga yang dipublikasikan — Anda membayar jumlah faktur dan tak lebih. Konversi mata uang, bila akun Anda bukan EUR, adalah antara Anda dan PayPal.',
    ppNote: 'Selalu kirim sebagai pembayaran untuk barang dan jasa, mencantumkan referensi proyek Anda (XAA-…). Transfer teman-dan-keluarga menghilangkan perlindungan Anda dan kami akan minta Anda mengirim ulang.',
    stepsEyebrow: 'Tiap termin, lima langkah yang sama', stepsTitle: 'Bagaimana pembayaran lunas',
    steps: [
      { n: '1', t: 'Termin jatuh tempo', b: 'Portal menerbitkannya otomatis saat tahap tercapai.' },
      { n: '2', t: 'Pilih jalur Anda', b: 'USDT di jaringan Anda, atau PayPal dalam EUR. Layar menampilkan jumlah persis.' },
      { n: '3', t: 'Kirim dan catat', b: 'Tempel hash transaksi atau ID PayPal; lampirkan tangkapan layar bila mau.' },
      { n: '4', t: 'Kami verifikasi', b: 'On-chain atau di akun PayPal, dalam satu hari kerja.' },
      { n: '5', t: 'Tahap terbuka', b: 'Status, batas progres, dan log aktivitas memperbarui sendiri.' },
    ],
    invTitle: 'Faktur, PPN, dan tanda terima',
    inv: [
      'Tiap termin menghasilkan faktur bernomor dalam EUR.',
      'Klien bisnis UE: berikan nomor PPN Anda dan aturan reverse-charge diterapkan.',
      'Klien di luar UE difaktur tanpa PPN UE.',
      'Tanda terima diterbitkan untuk pembayaran USDT dengan hash transaksi pada dokumen.',
      'Biaya domain, lisensi pihak ketiga, dan biaya gateway diteruskan sesuai biaya.',
    ],
    refTitle: 'Pengembalian dan pembatalan',
    ref: [
      'Batalkan sebelum tinjauan konsep dan DP dikembalikan dikurangi pekerjaan yang telah dilakukan.',
      'Batalkan selama produksi dan Anda ditagih untuk progres yang tercatat di log aktivitas, tak lebih.',
      'Pekerjaan yang selesai dan dibayar adalah milik Anda, apa pun yang terjadi berikutnya — kode dan berkas desain dilepas.',
      'Jika kami gagal menyerahkan ruang lingkup yang disepakati, termin yang belum dikerjakan dikembalikan lewat jalur yang sama dengan pembayaran Anda.',
    ],
    refFull0: 'Detail lengkap di ', refFullLink: 'ketentuan kerja sama', refFull1: '.',
    secTitle: 'Keamanan: cara memastikan permintaan pembayaran benar-benar dari kami',
    secBody0: 'Detail pembayaran ', secOnly: 'hanya', secBody1: ' ditampilkan di dalam halaman proyek Anda saat masuk di xaa.es/portal. Kami tak pernah mengirim alamat wallet via email, tak pernah menghubungi Anda meminta mengalihkan pembayaran ke alamat "baru", dan tak pernah meminta kata sandi Anda. Jika Anda menerima hal semacam itu, itu bukan kami — teruskan ke kami dan konfirmasi detailnya di halaman proyek Anda sebelum mengirim apa pun.',
    ctaTitle: 'Siap kapan pun Anda siap',
    ctaLead: 'Buka proyek untuk melihat jumlah tiap termin Anda dalam EUR dan USDT sebelum ada yang jatuh tempo.',
  },
};

export default async function PaymentsPage() {
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
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="panel p-7">
            <div className="flex items-center gap-3">
              <span className="mk-icon-bubble text-gold-500">₮</span>
              <div>
                <h2 className="font-display text-2xl font-extrabold">USDT</h2>
                <p className="text-sm text-steel-500">{c.usdtSub}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-steel-500">{c.usdtBody}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {c.usdtList.map((x) => (
                <li key={x} className="flex gap-2"><span className="tick">✓</span> {x}</li>
              ))}
            </ul>
            <div className="mt-5 rounded-lg bg-ivory-100/70 p-4 text-sm">
              <p className="font-bold">{c.usdtHowT}</p>
              <p className="mt-1 text-steel-500">{c.usdtHow(USD_PER_EUR.toFixed(2), eur(1000), usd(1000))}</p>
            </div>
            <p className="mt-4 text-xs text-steel-500">{c.usdtFee}</p>
          </article>

          <article className="panel p-7">
            <div className="flex items-center gap-3">
              <span className="mk-icon-bubble text-gold-500">₽</span>
              <div>
                <h2 className="font-display text-2xl font-extrabold">PayPal</h2>
                <p className="text-sm text-steel-500">{c.ppSub}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-steel-500">{c.ppBody}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {c.ppList.map((x) => (
                <li key={x} className="flex gap-2"><span className="tick">✓</span> {x}</li>
              ))}
            </ul>
            <div className="mt-5 rounded-lg bg-ivory-100/70 p-4 text-sm">
              <p className="font-bold">{c.ppFeeT}</p>
              <p className="mt-1 text-steel-500">{c.ppFee}</p>
            </div>
            <p className="mt-4 text-xs text-steel-500">{c.ppNote}</p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <SectionHead eyebrow={c.stepsEyebrow} title={c.stepsTitle} />
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {c.steps.map((s) => (
            <li key={s.n} className="premium-card p-5">
              <span className="font-display text-2xl font-extrabold accent-text">{s.n}</span>
              <p className="mt-2 text-sm font-bold">{s.t}</p>
              <p className="mt-1 text-xs leading-relaxed text-steel-500">{s.b}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="panel p-6">
            <h2 className="font-display text-xl font-extrabold">{c.invTitle}</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-steel-500">
              {c.inv.map((x) => (
                <li key={x} className="flex gap-2"><span className="tick">✓</span> {x}</li>
              ))}
            </ul>
          </div>
          <div className="panel p-6">
            <h2 className="font-display text-xl font-extrabold">{c.refTitle}</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-steel-500">
              {c.ref.map((x) => (
                <li key={x} className="flex gap-2"><span className="tick">✓</span> {x}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-steel-500">
              {c.refFull0}<Link href="/terms" className="underline">{c.refFullLink}</Link>{c.refFull1}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6">
        <div className="panel border-l-4 border-l-[color:var(--accent)] p-6">
          <h2 className="font-display text-lg font-extrabold">{c.secTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-steel-500">
            {c.secBody0}<strong>{c.secOnly}</strong>{c.secBody1}
          </p>
        </div>
      </section>

      <CtaBand title={c.ctaTitle} lead={c.ctaLead} />
    </>
  );
}
