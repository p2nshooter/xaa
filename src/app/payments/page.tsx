import Link from 'next/link';
import type { Metadata } from 'next';
import { SectionHead, CtaBand } from '@/components/Studio';
import { eur, usd, USD_PER_EUR } from '@/content/packages';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { SEO } from '@/content/seo-copy';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ path: '/payments', copy: SEO.payments });
}

type Copy = {
  chip: string; h1a: string; h1b: string; heroLead: string;
  usdtSub: string; usdtBody: string; usdtList: string[];
  usdtHowT: string; usdtHow: (rate: string, e: string, u: string) => string; usdtFee: string;
  ppSub: string; ppBody: string; ppList: string[]; ppFeeT: string; ppFee: string; ppNote: string;
  bankTitle: string; bankSub: string; bankBody: string; bankList: string[]; bankFeeT: string; bankFee: string; bankNote: string;
  stepsEyebrow: string; stepsTitle: string; steps: { n: string; t: string; b: string }[];
  invTitle: string; inv: string[];
  refTitle: string; ref: string[]; refFull0: string; refFullLink: string; refFull1: string;
  secTitle: string; secBody0: string; secOnly: string; secBody1: string;
  ctaTitle: string; ctaLead: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    chip: 'Payments', h1a: 'Invoiced in euros.', h1b: 'Paid by PayPal, bank wire or USDT.',
    heroLead: 'Three rails, all settling worldwide. PayPal confirms the moment you pay; a bank wire or USDT within one business day. Every invoice is issued in EUR because that is the contract currency; how you send the money is your choice.',
    usdtSub: 'Tether, on three networks',
    usdtBody: "The fastest option, and the one most international clients use. We accept USDT on TRC20, ERC20 and BEP20. The exact receiving address for your network is shown on your project's payment screen — we never send an address by email, and you should never accept one that arrives that way.",
    usdtList: ['TRC20 (Tron) — lowest fees, recommended', 'ERC20 (Ethereum)', 'BEP20 (BNB Smart Chain)', 'Confirmed on-chain, usually within minutes'],
    usdtHowT: 'How the amount is worked out',
    usdtHow: (rate, e, u) => `Invoices are in EUR. Your project page converts the milestone into USDT at the rate on the day — currently about ${rate} USDT per euro, so ${e} ≈ ${u}. Send the USDT amount shown on the payment screen, paste the transaction hash, and the milestone clears once we verify it on-chain.`,
    usdtFee: 'Network fees are paid by the sender. Send only USDT on the network you selected — a transfer on the wrong network cannot be recovered.',
    ppSub: 'Card or balance · confirmed instantly',
    ppBody: 'Pay from a PayPal balance or any debit or credit card through PayPal. Press “Pay with PayPal” on your project page, approve on paypal.com, and you land back on your project with the milestone already confirmed — no transaction ID to copy and nothing to wait for.',
    ppList: ['Charged in EUR, the contract currency', 'PayPal balance or any major card', 'Buyer protection on your side', 'Confirmed automatically, the moment you pay'],
    ppFeeT: 'A note on fees',
    ppFee: "PayPal's processing fee on cross-border commercial payments is charged to us and is already built into the published prices — you pay the invoice amount and nothing more. Currency conversion, if your account is not in EUR, is between you and PayPal.",
    ppNote: 'The amount comes from your project record, not from anyone typing it, so the charge always matches the invoice. Pay only from your project page — never from a PayPal request that arrives by email or chat.',
    bankTitle: 'Bank wire',
    bankSub: 'SWIFT wire in EUR or USD',
    bankBody: 'Prefer your bank? Wire the milestone to our multi-currency account at Bank Negara Indonesia (BNI): euros to the EUR account, dollars to the USD account, so no conversion is forced on you. The account details appear only inside your signed-in project page.',
    bankList: ['EUR account — the invoice amount, exactly', 'USD account — at our published reference rate', 'SWIFT / BIC BNINIDJA, from any bank, Wise or Revolut', 'Confirmed within one business day of arrival'],
    bankFeeT: 'Getting the full amount there',
    bankFee: 'Choose “OUR” for charges so the sender pays the fees and the full amount arrives. If your bank only offers “SHA”, say so in the note and we reconcile the small shortfall instead of refusing the payment.',
    bankNote: 'Quote your project reference (XAA-…) on the wire, then paste your bank’s reference on the payment screen so we can match it.',
    stepsEyebrow: 'Every milestone, the same five steps', stepsTitle: 'How a payment clears',
    steps: [
      { n: '1', t: 'Milestone falls due', b: 'The portal raises it automatically when the stage is reached.' },
      { n: '2', t: 'Choose your rail', b: 'PayPal, a bank wire in EUR or USD, or USDT. The screen shows the exact amount.' },
      { n: '3', t: 'Pay', b: 'PayPal confirms itself. For a wire or USDT, paste the reference or the transaction hash.' },
      { n: '4', t: 'We verify', b: 'PayPal at once; wires and USDT within one business day.' },
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
    ctaLead: 'Open a project to see your exact milestone amounts in EUR, USD and USDT before anything is due.',
  },
  es: {
    chip: 'Pagos', h1a: 'Facturado en euros.', h1b: 'Pagado con PayPal, transferencia o USDT.',
    heroLead: 'Tres vías, todas liquidan en todo el mundo. PayPal se confirma en el momento en que pagas; una transferencia o USDT, en un día hábil. Cada factura se emite en EUR porque es la moneda del contrato; cómo envías el dinero es tu elección.',
    usdtSub: 'Tether, en tres redes',
    usdtBody: 'La opción más rápida, y la que usa la mayoría de clientes internacionales. Aceptamos USDT en TRC20, ERC20 y BEP20. La dirección exacta de recepción para tu red se muestra en la pantalla de pago de tu proyecto — nunca enviamos una dirección por email, y nunca deberías aceptar una que llegue así.',
    usdtList: ['TRC20 (Tron) — comisiones más bajas, recomendada', 'ERC20 (Ethereum)', 'BEP20 (BNB Smart Chain)', 'Confirmado on-chain, normalmente en minutos'],
    usdtHowT: 'Cómo se calcula el importe',
    usdtHow: (rate, e, u) => `Las facturas son en EUR. Tu página de proyecto convierte el hito a USDT al cambio del día — actualmente unos ${rate} USDT por euro, así que ${e} ≈ ${u}. Envía el importe de USDT que muestra la pantalla de pago, pega el hash de la transacción, y el hito se salda en cuanto lo verificamos on-chain.`,
    usdtFee: 'Las comisiones de red las paga quien envía. Envía solo USDT en la red que elegiste — una transferencia en la red equivocada no se puede recuperar.',
    ppSub: 'Tarjeta o saldo · confirmado al instante',
    ppBody: 'Paga con tu saldo de PayPal o con cualquier tarjeta de débito o crédito a través de PayPal. Pulsa “Pagar con PayPal” en tu página de proyecto, aprueba en paypal.com y vuelves a tu proyecto con el hito ya confirmado — sin ID de transacción que copiar y sin esperas.',
    ppList: ['Cobrado en EUR, la moneda del contrato', 'Saldo de PayPal o cualquier tarjeta', 'Protección al comprador de tu lado', 'Confirmado automáticamente al pagar'],
    ppFeeT: 'Una nota sobre comisiones',
    ppFee: 'La comisión de procesamiento de PayPal en pagos comerciales transfronterizos nos la cobran a nosotros y ya está incluida en los precios publicados — pagas el importe de la factura y nada más. La conversión de divisa, si tu cuenta no está en EUR, es entre tú y PayPal.',
    ppNote: 'El importe sale del registro de tu proyecto, no de lo que alguien escriba, así que el cargo siempre coincide con la factura. Paga solo desde tu página de proyecto — nunca desde una solicitud de PayPal que llegue por email o chat.',
    bankTitle: 'Transferencia',
    bankSub: 'Transferencia SWIFT en EUR o USD',
    bankBody: '¿Prefieres tu banco? Transfiere el hito a nuestra cuenta multidivisa en Bank Negara Indonesia (BNI): euros a la cuenta en EUR, dólares a la cuenta en USD, así nadie te impone una conversión. Los datos de la cuenta solo aparecen dentro de tu página de proyecto con sesión iniciada.',
    bankList: ['Cuenta en EUR — el importe exacto de la factura', 'Cuenta en USD — a nuestro tipo de referencia publicado', 'SWIFT / BIC BNINIDJA, desde cualquier banco, Wise o Revolut', 'Confirmado en un día hábil desde su llegada'],
    bankFeeT: 'Que llegue el importe completo',
    bankFee: 'Elige “OUR” en los gastos para que el ordenante pague las comisiones y llegue el importe completo. Si tu banco solo ofrece “SHA”, indícalo en la nota y conciliamos la pequeña diferencia en lugar de rechazar el pago.',
    bankNote: 'Indica tu referencia de proyecto (XAA-…) en la transferencia y pega la referencia de tu banco en la pantalla de pago para que podamos casarla.',
    stepsEyebrow: 'Cada hito, los mismos cinco pasos', stepsTitle: 'Cómo se salda un pago',
    steps: [
      { n: '1', t: 'El hito vence', b: 'El portal lo emite automáticamente al alcanzar la etapa.' },
      { n: '2', t: 'Elige tu vía', b: 'PayPal, una transferencia en EUR o USD, o USDT. La pantalla muestra el importe exacto.' },
      { n: '3', t: 'Paga', b: 'PayPal se confirma solo. Para una transferencia o USDT, pega la referencia o el hash de la transacción.' },
      { n: '4', t: 'Verificamos', b: 'PayPal al instante; transferencias y USDT en un día hábil.' },
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
    ctaLead: 'Abre un proyecto para ver los importes exactos de cada hito en EUR, USD y USDT antes de que venza nada.',
  },
  id: {
    chip: 'Pembayaran', h1a: 'Difaktur dalam euro.', h1b: 'Dibayar via PayPal, transfer bank, atau USDT.',
    heroLead: 'Tiga jalur, semuanya bisa dari seluruh dunia. PayPal terkonfirmasi saat Anda membayar; transfer bank atau USDT dalam satu hari kerja. Tiap faktur diterbitkan dalam EUR karena itu mata uang kontrak; cara Anda mengirim uang adalah pilihan Anda.',
    usdtSub: 'Tether, di tiga jaringan',
    usdtBody: 'Opsi tercepat, dan yang paling banyak dipakai klien internasional. Kami menerima USDT di TRC20, ERC20, dan BEP20. Alamat penerima persis untuk jaringan Anda tampil di layar pembayaran proyek Anda — kami tak pernah mengirim alamat via email, dan Anda tak boleh menerima yang datang dengan cara itu.',
    usdtList: ['TRC20 (Tron) — biaya terendah, disarankan', 'ERC20 (Ethereum)', 'BEP20 (BNB Smart Chain)', 'Dikonfirmasi on-chain, biasanya dalam hitungan menit'],
    usdtHowT: 'Bagaimana jumlahnya dihitung',
    usdtHow: (rate, e, u) => `Faktur dalam EUR. Halaman proyek Anda mengonversi termin ke USDT pada kurs hari itu — saat ini sekitar ${rate} USDT per euro, jadi ${e} ≈ ${u}. Kirim jumlah USDT yang tampil di layar pembayaran, tempel hash transaksi, dan termin lunas begitu kami verifikasi on-chain.`,
    usdtFee: 'Biaya jaringan dibayar pengirim. Kirim hanya USDT di jaringan yang Anda pilih — transfer di jaringan yang salah tak bisa dipulihkan.',
    ppSub: 'Kartu atau saldo · terkonfirmasi seketika',
    ppBody: 'Bayar dari saldo PayPal atau kartu debit/kredit apa pun lewat PayPal. Tekan “Bayar dengan PayPal” di halaman proyek, setujui di paypal.com, dan Anda kembali ke proyek dengan termin yang sudah terkonfirmasi — tanpa ID transaksi yang perlu disalin dan tanpa menunggu.',
    ppList: ['Ditagih dalam EUR, mata uang kontrak', 'Saldo PayPal atau kartu apa pun', 'Perlindungan pembeli di sisi Anda', 'Terkonfirmasi otomatis saat Anda membayar'],
    ppFeeT: 'Catatan soal biaya',
    ppFee: 'Biaya pemrosesan PayPal untuk pembayaran komersial lintas negara ditagihkan ke kami dan sudah termasuk dalam harga yang dipublikasikan — Anda membayar jumlah faktur dan tak lebih. Konversi mata uang, bila akun Anda bukan EUR, adalah antara Anda dan PayPal.',
    ppNote: 'Jumlahnya diambil dari catatan proyek Anda, bukan ketikan siapa pun, sehingga tagihan selalu sama dengan faktur. Bayar hanya dari halaman proyek Anda — jangan pernah dari permintaan PayPal yang datang lewat email atau chat.',
    bankTitle: 'Transfer bank',
    bankSub: 'Transfer SWIFT dalam EUR atau USD',
    bankBody: 'Lebih suka lewat bank? Transfer termin ke rekening multi-mata-uang kami di Bank Negara Indonesia (BNI): euro ke rekening EUR, dolar ke rekening USD, jadi tak ada konversi yang dipaksakan. Detail rekening hanya tampil di halaman proyek Anda setelah masuk.',
    bankList: ['Rekening EUR — persis sejumlah faktur', 'Rekening USD — dengan kurs acuan yang kami cantumkan', 'SWIFT / BIC BNINIDJA, dari bank mana pun, Wise, atau Revolut', 'Dikonfirmasi dalam satu hari kerja sejak dana tiba'],
    bankFeeT: 'Agar jumlahnya tiba utuh',
    bankFee: 'Pilih biaya “OUR” agar pengirim menanggung biaya dan jumlah penuh tiba. Bila bank Anda hanya menawarkan “SHA”, tulis di catatan dan kami cocokkan selisih kecilnya, bukan menolak pembayaran.',
    bankNote: 'Cantumkan referensi proyek Anda (XAA-…) pada transfer, lalu tempel referensi dari bank Anda di layar pembayaran agar bisa kami cocokkan.',
    stepsEyebrow: 'Tiap termin, lima langkah yang sama', stepsTitle: 'Bagaimana pembayaran lunas',
    steps: [
      { n: '1', t: 'Termin jatuh tempo', b: 'Portal menerbitkannya otomatis saat tahap tercapai.' },
      { n: '2', t: 'Pilih jalur Anda', b: 'PayPal, transfer bank dalam EUR atau USD, atau USDT. Layar menampilkan jumlah persis.' },
      { n: '3', t: 'Bayar', b: 'PayPal terkonfirmasi sendiri. Untuk transfer atau USDT, tempel referensi atau hash transaksinya.' },
      { n: '4', t: 'Kami verifikasi', b: 'PayPal seketika; transfer dan USDT dalam satu hari kerja.' },
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
    ctaLead: 'Buka proyek untuk melihat jumlah tiap termin Anda dalam EUR, USD, dan USDT sebelum ada yang jatuh tempo.',
  },
};

export default async function PaymentsPage() {
  const c = pick(await getLang(), COPY);
  return (
    <>
      <Breadcrumbs trail={[{ k: 'nav.payments' }]} />
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
        <div className="grid gap-6 lg:grid-cols-3">
          <article className="panel p-7">
            <div className="flex items-center gap-3">
              <span className="mk-icon-bubble" aria-hidden>
                <span className="pp-word"><b>P</b></span>
              </span>
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

          <article className="panel p-7">
            <div className="flex items-center gap-3">
              <span className="mk-icon-bubble text-gold-500" aria-hidden>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9.5 12 4l9 5.5" /><path d="M4.5 10v8M9.5 10v8M14.5 10v8M19.5 10v8" /><path d="M3 20h18" />
                </svg>
              </span>
              <div>
                <h2 className="font-display text-2xl font-extrabold">{c.bankTitle}</h2>
                <p className="text-sm text-steel-500">{c.bankSub}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-steel-500">{c.bankBody}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {c.bankList.map((x) => (
                <li key={x} className="flex gap-2"><span className="tick">✓</span> {x}</li>
              ))}
            </ul>
            <div className="mt-5 rounded-lg bg-ivory-100/70 p-4 text-sm">
              <p className="font-bold">{c.bankFeeT}</p>
              <p className="mt-1 text-steel-500">{c.bankFee}</p>
            </div>
            <p className="mt-4 text-xs text-steel-500">{c.bankNote}</p>
          </article>

          <article className="panel p-7">
            <div className="flex items-center gap-3">
              <span className="mk-icon-bubble text-gold-500" aria-hidden>₮</span>
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
