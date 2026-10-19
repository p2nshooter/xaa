'use client';

import { useActionState, useState } from 'react';
import { acquireAction, type ActionState } from '@/server/actions';
import { pick, type Lang } from '@/lib/i18n';
import { Submit, Notice } from './Submit';

type Copy = {
  offer: string; buy: string; offerHint: string; buyHint: (price: string) => string;
  name: string; email: string; company: string; country: string; amount: string; amountHint: string;
  funds: string; fundsPlaceholder: string; message: string; messagePlaceholder: string;
  sendOffer: string; sendBuy: string; sending: string; footnote: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    offer: 'Make an offer', buy: 'Buy at asking price',
    offerHint: 'Name your price. Every serious offer is answered personally by the owner, usually within one business day.',
    buyHint: (p) => `Reserve the acquisition at ${p}. You receive the NDA, the data room and the purchase agreement first; nothing is paid before you have reviewed them.`,
    name: 'Full name *', email: 'Business email *', company: 'Company or fund', country: 'Country',
    amount: 'Your offer (USD) *', amountHint: 'Whole dollars, e.g. 7,500,000',
    funds: 'Proof of funds or financing', fundsPlaceholder: 'e.g. bank letter available, own funds, fund commitment, escrow preferred',
    message: 'Anything we should know', messagePlaceholder: 'Your plans for xaa.es, timing, questions for due diligence…',
    sendOffer: 'Send my offer', sendBuy: 'Request the purchase', sending: 'Sending…',
    footnote: 'Confidential. Your details go only to the owner and are never shared or published.',
  },
  es: {
    offer: 'Hacer una oferta', buy: 'Comprar al precio pedido',
    offerHint: 'Pon tu precio. El propietario responde personalmente a cada oferta seria, normalmente en un día hábil.',
    buyHint: (p) => `Reserva la adquisición por ${p}. Primero recibes el NDA, la sala de datos y el contrato de compraventa; no se paga nada antes de que los hayas revisado.`,
    name: 'Nombre completo *', email: 'Email profesional *', company: 'Empresa o fondo', country: 'País',
    amount: 'Tu oferta (USD) *', amountHint: 'Dólares enteros, p. ej. 7.500.000',
    funds: 'Prueba de fondos o financiación', fundsPlaceholder: 'p. ej. carta bancaria disponible, fondos propios, compromiso de un fondo, prefiero escrow',
    message: 'Algo que debamos saber', messagePlaceholder: 'Tus planes para xaa.es, plazos, preguntas para la due diligence…',
    sendOffer: 'Enviar mi oferta', sendBuy: 'Solicitar la compra', sending: 'Enviando…',
    footnote: 'Confidencial. Tus datos van solo al propietario y nunca se comparten ni se publican.',
  },
  id: {
    offer: 'Ajukan penawaran', buy: 'Beli di harga yang diminta',
    offerHint: 'Sebutkan harga Anda. Setiap penawaran serius dijawab langsung oleh pemilik, biasanya dalam satu hari kerja.',
    buyHint: (p) => `Pesan akuisisi seharga ${p}. Anda menerima NDA, data room dan perjanjian jual beli lebih dulu; tidak ada pembayaran sebelum semuanya Anda tinjau.`,
    name: 'Nama lengkap *', email: 'Email bisnis *', company: 'Perusahaan atau fund', country: 'Negara',
    amount: 'Penawaran Anda (USD) *', amountHint: 'Dolar bulat, mis. 7.500.000',
    funds: 'Bukti dana atau pembiayaan', fundsPlaceholder: 'mis. surat bank tersedia, dana sendiri, komitmen fund, lebih suka escrow',
    message: 'Hal yang perlu kami ketahui', messagePlaceholder: 'Rencana Anda untuk xaa.es, jadwal, pertanyaan untuk due diligence…',
    sendOffer: 'Kirim penawaran', sendBuy: 'Ajukan pembelian', sending: 'Mengirim…',
    footnote: 'Rahasia. Data Anda hanya untuk pemilik, tidak pernah dibagikan atau dipublikasikan.',
  },
};

export function AcquireForm({ lang = 'en', price, open = true }: { lang?: Lang; price: string; open?: boolean }) {
  const [state, action] = useActionState<ActionState, FormData>(acquireAction, {});
  const [kind, setKind] = useState<'offer' | 'buy'>('offer');
  const c = pick(lang, COPY);

  return (
    <form action={action} className="panel p-6 sm:p-8" aria-describedby="acquire-note">
      <div role="tablist" aria-label={`${c.offer} / ${c.buy}`} className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-[color:var(--surface)] p-1">
        {(['offer', 'buy'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={kind === k}
            onClick={() => setKind(k)}
            className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${kind === k ? 'bg-white text-ink-900 shadow-sm' : 'text-steel-500 hover:text-ink-900'}`}
          >
            {k === 'offer' ? c.offer : c.buy}
          </button>
        ))}
      </div>
      <p className="mb-5 text-sm leading-relaxed text-steel-500">{kind === 'offer' ? c.offerHint : c.buyHint(price)}</p>
      <Notice error={state.error} ok={state.ok} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="lang" value={lang} />
      <div className="hidden" aria-hidden>
        <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="grid gap-x-5 sm:grid-cols-2">
        <label className="field">
          <span>{c.name}</span>
          <input name="name" className="input" required autoComplete="name" />
        </label>
        <label className="field">
          <span>{c.email}</span>
          <input name="email" type="email" className="input" required autoComplete="email" />
        </label>
        <label className="field">
          <span>{c.company}</span>
          <input name="company" className="input" autoComplete="organization" />
        </label>
        <label className="field">
          <span>{c.country}</span>
          <input name="country" className="input" autoComplete="country-name" />
        </label>
      </div>
      {kind === 'offer' ? (
        <label className="field">
          <span>{c.amount}</span>
          <input name="amount" className="input" inputMode="numeric" required placeholder={c.amountHint} />
        </label>
      ) : null}
      <label className="field">
        <span>{c.funds}</span>
        <input name="funds" className="input" placeholder={c.fundsPlaceholder} />
      </label>
      <label className="field">
        <span>{c.message}</span>
        <textarea name="message" className="textarea" rows={4} placeholder={c.messagePlaceholder} />
      </label>
      <Submit disabled={!open} pendingLabel={c.sending} className="btn btn-primary w-full sm:w-auto">{kind === 'offer' ? c.sendOffer : c.sendBuy}</Submit>
      <p id="acquire-note" className="mt-3 text-xs text-steel-500">{c.footnote}</p>
    </form>
  );
}
