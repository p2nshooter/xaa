'use client';

import { useActionState, useEffect, useMemo, useState, type ReactNode } from 'react';
import { submitOrderPaymentAction, submitPaymentAction, type ActionState } from '@/server/actions';
import type { Lang } from '@/lib/i18n';
import type { PayOption } from '@/server/manual-pay';
import { Submit, Notice } from './Submit';

/**
 * The manual payment guide (docs/BLUEPRINT.md §12.3, request 61): choose a BNI currency account or a company
 * wallet → copy the exact amount and details (QR for a wallet) → how to send it from where the money is → upload
 * the proof → the status tracker on the page above follows it to "approved". Plain English, Spanish or Indonesian.
 */

type T = typeof EN;
const EN = {
  step1: 'Choose how you pay', step2: 'Send exactly this', step3: 'How to send it', step4: 'Tell us it is sent',
  bank: 'Bank transfer', crypto: 'Crypto', bankHint: 'Pick the currency your money is in — a transfer in the same currency arrives without conversion fees. All 13 accounts are wondr by BNI, Indonesia.',
  cryptoHint: 'Send only the coin shown, on the network shown. A coin sent on another network cannot be recovered.',
  amount: 'Amount', copy: 'Copy', copied: 'Copied', account: 'Account number', holder: 'Account holder', bankName: 'Bank', swift: 'SWIFT / BIC',
  bankCode: 'Bank code (Indonesia)', country: 'Country', reference: 'Transfer reference', address: 'Wallet address', network: 'Network', memo: 'Memo / tag (required)',
  held: (t: ReactNode) => <>This amount is held for you until {t}. After that it is recalculated at the day&apos;s rate.</>,
  rate: 'Rate', stale: 'Today\'s rate source did not answer, so the latest stored rate is used — we check it when we approve.',
  noRate: (eur: string, ccy: string) => `No reference rate is available right now: send the equivalent of ${eur} in ${ccy}; your bank converts.`,
  rounded: 'Rounded up so the full price arrives. A difference of up to 2 % for bank or network fees is accepted, never refused.',
  idrCode: 'The last three digits are your payment code — send the amount exactly, so we can match your transfer at once.',
  wrong: 'Never pay to an account or address sent to you by e-mail or chat, even if it looks like ours — only this page.',
  howBankId: 'From a bank in Indonesia', howBankIdText: 'In your banking app choose transfer to another bank → Bank BNI (code 009) → the account number above. BI-FAST arrives within minutes; write the transfer reference in the news field.',
  howSwift: 'From a bank abroad (SWIFT)', howSwiftText: 'Send an international transfer in the account\'s currency to SWIFT BNINIDJA, Bank Negara Indonesia, Jakarta, with the account number and holder above. Choose the charge option "OUR" so fees do not come out of the amount. It usually arrives in 1–3 business days.',
  howWise: 'From Wise, Revolut or another app', howWiseText: 'Add a recipient in that currency with the account number, the holder\'s name and SWIFT BNINIDJA, send the amount shown and keep the confirmation screen for the next step.',
  howWallet: 'From a crypto wallet or exchange', howWalletText: 'Scan the QR code or paste the address, pick exactly the network shown, and send the amount. An exchange takes its withdrawal fee on top — make sure the amount received is the amount shown.',
  sentRef: 'Transaction reference', sentRefBank: 'The reference or number on your transfer receipt', sentRefCrypto: 'The transaction hash (txid)', sentRefPaypal: 'The PayPal transaction ID',
  paypalHint: 'Send as a payment for goods and services, in euros, with your reference.', howPaypal: 'From PayPal', howPaypalText: 'Open PayPal, send the amount in euros to the account above as goods and services (that keeps buyer protection), write the reference in the note and copy the transaction ID for the next step.',
  sentAmount: (c: string) => `Amount you sent (${c})`, proof: 'Payment screenshot or the bank\'s PDF', proofReq: '(required for a bank transfer)', note: 'Note (optional)',
  eurSettled: 'Amount this settles (EUR)', submit: 'I have sent it — submit', submitting: 'Submitting…',
  after: 'We check it against your screenshot within one business day — usually much sooner — and what you bought unlocks by itself. You can follow it in the tracker above.',
  noneTitle: 'No payment account is published yet', none: 'Please contact us to complete the purchase — and never act on payment details sent by e-mail or chat.',
};
const ES: T = {
  step1: 'Elige cómo pagar', step2: 'Envía exactamente esto', step3: 'Cómo enviarlo', step4: 'Avísanos que lo enviaste',
  bank: 'Transferencia bancaria', crypto: 'Cripto', bankHint: 'Elige la moneda en la que tienes el dinero: una transferencia en la misma moneda llega sin comisiones de cambio. Las 13 cuentas son de wondr by BNI, Indonesia.',
  cryptoHint: 'Envía solo la moneda indicada, por la red indicada. Una moneda enviada por otra red no se puede recuperar.',
  amount: 'Importe', copy: 'Copiar', copied: 'Copiado', account: 'Número de cuenta', holder: 'Titular', bankName: 'Banco', swift: 'SWIFT / BIC',
  bankCode: 'Código de banco (Indonesia)', country: 'País', reference: 'Concepto de la transferencia', address: 'Dirección del monedero', network: 'Red', memo: 'Memo / etiqueta (obligatorio)',
  held: (t: ReactNode) => <>Este importe se mantiene hasta {t}. Después se recalcula con el tipo del día.</>,
  rate: 'Tipo', stale: 'La fuente del tipo de hoy no respondió, así que usamos el último guardado; lo comprobamos al aprobar.',
  noRate: (eur: string, ccy: string) => `Ahora no hay tipo de referencia: envía el equivalente de ${eur} en ${ccy}; tu banco convierte.`,
  rounded: 'Redondeado hacia arriba para que llegue el precio completo. Se acepta una diferencia de hasta el 2 % por comisiones bancarias o de red.',
  idrCode: 'Las tres últimas cifras son tu código de pago: envía el importe exacto para que identifiquemos tu transferencia al instante.',
  wrong: 'Nunca pagues a una cuenta o dirección enviada por correo o chat, aunque parezca nuestra: solo a esta página.',
  howBankId: 'Desde un banco en Indonesia', howBankIdText: 'En tu app bancaria elige transferencia a otro banco → Bank BNI (código 009) → el número de cuenta de arriba. BI-FAST llega en minutos; escribe el concepto en el campo de noticia.',
  howSwift: 'Desde un banco en el extranjero (SWIFT)', howSwiftText: 'Envía una transferencia internacional en la moneda de la cuenta a SWIFT BNINIDJA, Bank Negara Indonesia, Yakarta, con el número de cuenta y el titular de arriba. Elige la opción de gastos «OUR» para que las comisiones no se descuenten del importe. Suele llegar en 1–3 días hábiles.',
  howWise: 'Desde Wise, Revolut u otra app', howWiseText: 'Añade un destinatario en esa moneda con el número de cuenta, el titular y SWIFT BNINIDJA, envía el importe indicado y guarda la pantalla de confirmación para el siguiente paso.',
  howWallet: 'Desde un monedero o un exchange', howWalletText: 'Escanea el código QR o pega la dirección, elige exactamente la red indicada y envía el importe. Un exchange cobra su comisión de retirada aparte: asegúrate de que el importe recibido sea el indicado.',
  sentRef: 'Referencia de la transacción', sentRefBank: 'La referencia o número de tu justificante', sentRefCrypto: 'El hash de la transacción (txid)', sentRefPaypal: 'El ID de transacción de PayPal',
  paypalHint: 'Envíalo como pago de bienes y servicios, en euros, con tu referencia.', howPaypal: 'Desde PayPal', howPaypalText: 'Abre PayPal, envía el importe en euros a la cuenta de arriba como bienes y servicios (así conservas la protección al comprador), escribe la referencia en la nota y copia el ID de transacción para el siguiente paso.',
  sentAmount: (c: string) => `Importe enviado (${c})`, proof: 'Captura del pago o PDF del banco', proofReq: '(obligatoria para una transferencia)', note: 'Nota (opcional)',
  eurSettled: 'Importe que liquida (EUR)', submit: 'Ya lo envié — enviar', submitting: 'Enviando…',
  after: 'Lo comprobamos con tu captura en un día hábil —normalmente mucho antes— y lo que compraste se desbloquea solo. Puedes seguirlo en el seguimiento de arriba.',
  noneTitle: 'Aún no hay cuentas de pago publicadas', none: 'Contáctanos para completar la compra, y nunca actúes sobre datos de pago enviados por correo o chat.',
};
const ID: T = {
  step1: 'Pilih cara bayar', step2: 'Kirim persis sejumlah ini', step3: 'Cara mengirimnya', step4: 'Beri tahu kami sudah dikirim',
  bank: 'Transfer bank', crypto: 'Kripto', bankHint: 'Pilih mata uang uang Anda — transfer dalam mata uang yang sama sampai tanpa biaya konversi. Ke-13 rekening adalah wondr by BNI, Indonesia.',
  cryptoHint: 'Kirim hanya koin yang tertera, lewat jaringan yang tertera. Koin yang dikirim lewat jaringan lain tidak bisa dikembalikan.',
  amount: 'Jumlah', copy: 'Salin', copied: 'Tersalin', account: 'Nomor rekening', holder: 'Atas nama', bankName: 'Bank', swift: 'SWIFT / BIC',
  bankCode: 'Kode bank', country: 'Negara', reference: 'Berita transfer', address: 'Alamat dompet', network: 'Jaringan', memo: 'Memo / tag (wajib)',
  held: (t: ReactNode) => <>Jumlah ini dikunci untuk Anda sampai {t}. Setelah itu dihitung ulang dengan kurs hari itu.</>,
  rate: 'Kurs', stale: 'Sumber kurs hari ini tidak menjawab, jadi kurs tersimpan terakhir yang dipakai — kami cek saat menyetujui.',
  noRate: (eur: string, ccy: string) => `Kurs acuan belum tersedia: kirim setara ${eur} dalam ${ccy}; bank Anda yang mengonversi.`,
  rounded: 'Dibulatkan ke atas agar harga penuh sampai. Selisih sampai 2 % karena biaya bank atau jaringan diterima, tidak ditolak.',
  idrCode: 'Tiga angka terakhir adalah kode pembayaran Anda — transfer persis jumlah ini agar pembayaran langsung cocok.',
  wrong: 'Jangan pernah membayar ke rekening atau alamat yang dikirim lewat e-mail atau chat, walau tampak seperti milik kami — hanya halaman ini.',
  howBankId: 'Dari bank di Indonesia', howBankIdText: 'Di m-banking pilih transfer antarbank → Bank BNI (kode 009) → nomor rekening di atas. BI-FAST masuk dalam hitungan menit; tulis berita transfer di kolom berita.',
  howSwift: 'Dari bank luar negeri (SWIFT)', howSwiftText: 'Kirim transfer internasional dalam mata uang rekening ke SWIFT BNINIDJA, Bank Negara Indonesia, Jakarta, dengan nomor rekening dan nama di atas. Pilih biaya "OUR" agar biaya tidak memotong jumlah. Biasanya masuk dalam 1–3 hari kerja.',
  howWise: 'Dari Wise, Revolut atau aplikasi lain', howWiseText: 'Tambahkan penerima dalam mata uang itu dengan nomor rekening, nama pemilik dan SWIFT BNINIDJA, kirim jumlah yang tertera dan simpan layar konfirmasinya untuk langkah berikutnya.',
  howWallet: 'Dari dompet kripto atau exchange', howWalletText: 'Pindai kode QR atau tempel alamatnya, pilih persis jaringan yang tertera, lalu kirim jumlahnya. Exchange memotong biaya penarikan sendiri — pastikan jumlah yang diterima sama dengan yang tertera.',
  sentRef: 'Referensi transaksi', sentRefBank: 'Nomor referensi di bukti transfer Anda', sentRefCrypto: 'Hash transaksi (txid)', sentRefPaypal: 'ID transaksi PayPal',
  paypalHint: 'Kirim sebagai pembayaran barang dan jasa, dalam euro, dengan berita referensi Anda.', howPaypal: 'Dari PayPal', howPaypalText: 'Buka PayPal, kirim jumlahnya dalam euro ke akun di atas sebagai barang dan jasa (agar perlindungan pembeli tetap ada), tulis referensi di catatan lalu salin ID transaksinya untuk langkah berikutnya.',
  sentAmount: (c: string) => `Jumlah yang Anda kirim (${c})`, proof: 'Screenshot pembayaran atau PDF dari bank', proofReq: '(wajib untuk transfer bank)', note: 'Catatan (opsional)',
  eurSettled: 'Jumlah yang dilunasi (EUR)', submit: 'Sudah saya kirim — kirim bukti', submitting: 'Mengirim…',
  after: 'Kami cocokkan dengan screenshot Anda dalam satu hari kerja — biasanya jauh lebih cepat — lalu yang Anda beli terbuka sendiri. Pantau di pelacak di atas.',
  noneTitle: 'Belum ada rekening pembayaran', none: 'Silakan hubungi kami untuk menyelesaikan pembelian — dan jangan pernah mengikuti data pembayaran yang dikirim lewat e-mail atau chat.',
};
const DICT: Record<Lang, T> = { en: EN, es: ES, id: ID };

function CopyButton({ value, t }: { value: string; t: T }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm shrink-0 !px-2 !py-1 text-[11px]"
      onClick={async () => {
        try { await navigator.clipboard.writeText(value); } catch {
          const el = document.createElement('textarea'); el.value = value; document.body.appendChild(el); el.select();
          try { document.execCommand('copy'); } finally { el.remove(); }
        }
        setDone(true); setTimeout(() => setDone(false), 1600);
      }}
      aria-label={`${t.copy}: ${value}`}
    >
      {done ? `✓ ${t.copied}` : t.copy}
    </button>
  );
}

function Line({ k, v, copy, mono, t }: { k: string; v: string; copy?: string; mono?: boolean; t: T }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--line)] py-2 last:border-0">
      <dt className="text-xs uppercase tracking-wide text-steel-500">{k}</dt>
      <dd className="flex min-w-0 items-center gap-2">
        <span className={`break-all text-right text-sm font-semibold ${mono ? 'font-mono' : ''}`}>{v}</span>
        {copy ? <CopyButton value={copy} t={t} /> : null}
      </dd>
    </div>
  );
}

/** A UTC moment, shown in the reader's own time zone once the page is in their browser. */
function LocalTime({ iso }: { iso: string }) {
  const [text, setText] = useState(`${iso.slice(0, 16).replace('T', ' ')} UTC`);
  useEffect(() => {
    setText(new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }));
  }, [iso]);
  return <time dateTime={iso}>{text}</time>;
}

export function ManualPay({
  lang, options, reference, amountEur, eurText, target, hidden, eurField = false,
}: {
  lang: Lang;
  options: PayOption[];
  reference: string;
  amountEur: number;
  eurText: string;
  target: 'order' | 'milestone';
  hidden: Record<string, string>;
  /** Project milestones also say which euro amount the transfer settles. */
  eurField?: boolean;
}) {
  const t = DICT[lang] ?? EN;
  const [state, action] = useActionState<ActionState, FormData>(target === 'order' ? submitOrderPaymentAction : submitPaymentAction, {});
  const banks = useMemo(() => options.filter((o) => o.kind === 'bank'), [options]);
  const coins = useMemo(() => options.filter((o) => o.kind === 'crypto'), [options]);
  const paypals = useMemo(() => options.filter((o) => o.kind === 'paypal'), [options]);
  const [tab, setTab] = useState<'bank' | 'crypto' | 'paypal'>(banks.length ? 'bank' : coins.length ? 'crypto' : 'paypal');
  const list = tab === 'bank' ? banks : tab === 'crypto' ? coins : paypals;
  const defaultKey = (tab === 'bank' ? banks.find((o) => o.asset === (lang === 'id' ? 'IDR' : 'EUR')) ?? banks[0] : list[0])?.key ?? '';
  const [key, setKey] = useState(defaultKey);
  const sel = list.find((o) => o.key === key) ?? list.find((o) => o.key === defaultKey) ?? list[0];

  if (!options.length) {
    return (
      <div className="panel border-l-4 border-l-amber-400 p-6" data-testid="manual-pay">
        <h3 className="font-display text-lg font-extrabold">{t.noneTitle}</h3>
        <p className="mt-2 text-sm text-steel-500">{t.none}</p>
      </div>
    );
  }

  const isBank = sel?.kind === 'bank';
  const isPaypal = sel?.kind === 'paypal';
  const how = isBank
    ? [[t.howBankId, t.howBankIdText], [t.howSwift, t.howSwiftText], [t.howWise, t.howWiseText]]
    : isPaypal ? [[t.howPaypal, t.howPaypalText]] : [[t.howWallet, t.howWalletText]];
  const stepCls = 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs font-extrabold text-white';

  return (
    <form action={action} className="panel p-6" data-testid="manual-pay">
      <Notice error={state.error} ok={state.ok} />
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <input type="hidden" name="payKey" value={sel?.key ?? ''} />
      <input type="hidden" name="method" value={isBank ? 'bank' : isPaypal ? 'paypal' : 'usdt'} />
      <input type="hidden" name="methodId" value={sel?.destId ?? ''} />
      <input type="hidden" name="network" value={sel?.network ?? ''} />

      <ol className="space-y-8">
        {/* 1 — choose */}
        <li>
          <div className="flex items-center gap-3"><span className={stepCls}>1</span><h3 className="font-display text-lg font-extrabold">{t.step1}</h3></div>
          <div className="mt-3 inline-flex rounded-full bg-[color:var(--surface)] p-1" role="tablist">
            {banks.length ? <button type="button" role="tab" aria-selected={tab === 'bank'} onClick={() => { setTab('bank'); setKey(''); }} className={`btn btn-sm ${tab === 'bank' ? 'btn-primary' : 'btn-ghost'}`}>{t.bank}</button> : null}
            {coins.length ? <button type="button" role="tab" aria-selected={tab === 'crypto'} onClick={() => { setTab('crypto'); setKey(''); }} className={`btn btn-sm ${tab === 'crypto' ? 'btn-primary' : 'btn-ghost'}`}>{t.crypto}</button> : null}
            {paypals.length ? <button type="button" role="tab" aria-selected={tab === 'paypal'} onClick={() => { setTab('paypal'); setKey(''); }} className={`btn btn-sm ${tab === 'paypal' ? 'btn-primary' : 'btn-ghost'}`}>PayPal</button> : null}
          </div>
          <p className="mt-2 text-xs text-steel-500">{tab === 'bank' ? t.bankHint : tab === 'crypto' ? t.cryptoHint : t.paypalHint}</p>
          <div className="mt-3 flex flex-wrap gap-2" data-testid="pay-choices">
            {list.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => setKey(o.key)}
                aria-pressed={sel?.key === o.key}
                data-asset={o.asset}
                className={`rounded-xl border px-3 py-2 text-left text-xs transition motion-reduce:transition-none ${sel?.key === o.key ? 'border-[color:var(--accent)] bg-[color:var(--surface)] font-bold shadow-sm' : 'border-[color:var(--line)] hover:border-[color:var(--accent)]'}`}
              >
                <span className="block font-mono text-sm font-extrabold">{o.kind === 'bank' ? o.asset : o.title}</span>
                {o.amountText ? <span className="block text-steel-500">{o.amountText}</span> : null}
              </button>
            ))}
          </div>
        </li>

        {/* 2 — exact amount and details */}
        {sel ? (
          <li>
            <div className="flex items-center gap-3"><span className={stepCls}>2</span><h3 className="font-display text-lg font-extrabold">{t.step2}</h3></div>
            <div className="mt-3 grid gap-4 rounded-2xl bg-[color:var(--surface)] p-4 sm:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-steel-500">{t.amount}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <p className="font-display text-3xl font-extrabold" data-testid="pay-amount">{sel.amountText ?? eurText}</p>
                  {sel.plain ? <CopyButton value={sel.plain} t={t} /> : null}
                </div>
                {sel.amountText ? null : <p className="mt-1 text-xs text-amber-700">{t.noRate(eurText, sel.asset)}</p>}
                {sel.asset === 'IDR' && sel.amount ? <p className="mt-1 text-xs text-steel-600">{t.idrCode}</p> : null}
                {sel.rate ? <p className="mt-1 text-xs text-steel-500">{t.rate}: {sel.rate}{sel.asset !== 'EUR' ? ` · ${eurText}` : ''}</p> : null}
                {sel.stale ? <p className="mt-1 text-xs text-amber-700">{t.stale}</p> : null}
                {sel.until ? <p className="mt-1 text-xs text-steel-500" data-testid="pay-held">{t.held(<LocalTime iso={sel.until} />)}</p> : null}
                <p className="mt-1 text-[11px] text-steel-400">{t.rounded}</p>

                <dl className="mt-3 rounded-xl bg-white/80 px-3 dark:bg-black/20">
                  {isBank ? (
                    <>
                      <Line k={t.account} v={sel.address} copy={sel.address} mono t={t} />
                      {sel.holder ? <Line k={t.holder} v={sel.holder} copy={sel.holder} t={t} /> : null}
                      {sel.bankName ? <Line k={t.bankName} v={sel.bankName} t={t} /> : null}
                      {sel.swift ? <Line k={t.swift} v={sel.swift} copy={sel.swift} mono t={t} /> : null}
                      {sel.bankCode ? <Line k={t.bankCode} v={sel.bankCode} copy={sel.bankCode} mono t={t} /> : null}
                      {sel.branch ? <Line k="Branch" v={sel.branch} t={t} /> : null}
                      {sel.bankCountry ? <Line k={t.country} v={sel.bankCountry} t={t} /> : null}
                      <Line k={t.reference} v={reference} copy={reference} mono t={t} />
                    </>
                  ) : isPaypal ? (
                    <>
                      <Line k="PayPal" v={sel.address} copy={sel.address} mono t={t} />
                      <Line k={t.reference} v={reference} copy={reference} mono t={t} />
                    </>
                  ) : (
                    <>
                      <Line k={t.network} v={sel.network ?? sel.asset} t={t} />
                      <Line k={t.address} v={sel.address} copy={sel.address} mono t={t} />
                      {sel.memo ? <Line k={t.memo} v={sel.memo} copy={sel.memo} mono t={t} /> : null}
                    </>
                  )}
                </dl>
              </div>
              {sel.qr ? (
                <figure className="mx-auto w-44 sm:w-48">
                  <p className="mb-1 text-center text-xs font-extrabold uppercase tracking-wide">{sel.asset} · {sel.network}</p>
                  <div className="overflow-hidden rounded-xl border border-[color:var(--line)] bg-white p-2" data-testid="pay-qr" dangerouslySetInnerHTML={{ __html: sel.qr }} />
                  <figcaption className="mt-1 text-center text-[11px] text-steel-500">{t.cryptoHint}</figcaption>
                </figure>
              ) : null}
            </div>
            {isPaypal && sel.link ? <a href={sel.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm mt-3">PayPal ↗</a> : null}
            <p className="mt-2 text-xs font-semibold text-red-700">{t.wrong}</p>
          </li>
        ) : null}

        {/* 3 — how to send it */}
        <li>
          <div className="flex items-center gap-3"><span className={stepCls}>3</span><h3 className="font-display text-lg font-extrabold">{t.step3}</h3></div>
          <div className="mt-3 space-y-2">
            {how.map(([title, text], i) => (
              <details key={title} className="group rounded-xl border border-[color:var(--line)] p-3" open={i === 0 && (sel?.asset === 'IDR' || !isBank)}>
                <summary className="cursor-pointer text-sm font-bold">{title}</summary>
                <p className="mt-2 text-sm leading-relaxed text-steel-600">{text}</p>
              </details>
            ))}
          </div>
        </li>

        {/* 4 — tell us */}
        <li>
          <div className="flex items-center gap-3"><span className={stepCls}>4</span><h3 className="font-display text-lg font-extrabold">{t.step4}</h3></div>
          <div className="mt-3 grid gap-x-5 sm:grid-cols-2">
            <label className="field sm:col-span-2">
              <span>{t.sentRef} *</span>
              <input name="reference" className="input font-mono text-sm" required autoComplete="off" spellCheck={false} placeholder={isBank ? t.sentRefBank : isPaypal ? t.sentRefPaypal : t.sentRefCrypto} />
            </label>
            <label className="field">
              <span>{t.sentAmount(sel?.asset ?? 'EUR')}</span>
              <input key={sel?.key} name="paidAmount" className="input font-mono" inputMode="decimal" defaultValue={sel?.plain ?? ''} />
            </label>
            {eurField ? (
              <label className="field">
                <span>{t.eurSettled} *</span>
                <input name="amount" type="number" min={1} step={1} defaultValue={amountEur} className="input" required />
              </label>
            ) : null}
            <label className="field sm:col-span-2">
              <span>{t.proof} {isBank ? t.proofReq : ''}</span>
              <input type="file" name={target === 'order' ? 'receipt' : 'proof'} accept="image/png,image/jpeg,image/webp,application/pdf" className="text-sm" required={isBank} />
            </label>
            <label className="field sm:col-span-2">
              <span>{t.note}</span>
              <input name="note" className="input" />
            </label>
          </div>
          <Submit pendingLabel={t.submitting}>{t.submit}</Submit>
          <p className="hint mt-2">{t.after}</p>
        </li>
      </ol>
    </form>
  );
}
