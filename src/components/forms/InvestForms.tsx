'use client';

import { useActionState, useState } from 'react';
import {
  investApplyAction, verifyInvestorAction, investorStatusAction, recordPayoutAction, type ActionState,
} from '@/server/actions';
import { pick, type Lang } from '@/lib/i18n';
import { Submit, Notice } from './Submit';

type Copy = {
  name: string; email: string; company: string; country: string; amount: string; amountHint: (min: string) => string;
  method: string; wire: string; paypal: string; message: string; messagePlaceholder: string;
  ack: string; send: string; sending: string; footnote: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    name: 'Full name *', email: 'Email *', company: 'Company or fund', country: 'Country of residence',
    amount: 'Intended investment (USD) *', amountHint: (m) => `Whole dollars, from ${m}`,
    method: 'How you would send the capital', wire: 'Bank wire (USD or EUR)', paypal: 'PayPal',
    message: 'Questions or context', messagePlaceholder: 'Your background, timing, what you would like to see in the memorandum…',
    ack: 'I have read the risk notice above and understand that this is an application, not a payment.',
    send: 'Apply to invest', sending: 'Sending…',
    footnote: 'Confidential. Your details go only to the owner of xaa.es and are never shared or published.',
  },
  es: {
    name: 'Nombre completo *', email: 'Email *', company: 'Empresa o fondo', country: 'País de residencia',
    amount: 'Inversión prevista (USD) *', amountHint: (m) => `Dólares enteros, desde ${m}`,
    method: 'Cómo enviarías el capital', wire: 'Transferencia bancaria (USD o EUR)', paypal: 'PayPal',
    message: 'Preguntas o contexto', messagePlaceholder: 'Tu perfil, plazos, lo que te gustaría ver en el memorando…',
    ack: 'He leído el aviso de riesgos y entiendo que esto es una solicitud, no un pago.',
    send: 'Solicitar invertir', sending: 'Enviando…',
    footnote: 'Confidencial. Tus datos van solo al propietario de xaa.es y nunca se comparten ni se publican.',
  },
  id: {
    name: 'Nama lengkap *', email: 'Email *', company: 'Perusahaan atau fund', country: 'Negara domisili',
    amount: 'Rencana investasi (USD) *', amountHint: (m) => `Dolar bulat, mulai ${m}`,
    method: 'Cara Anda mengirim modal', wire: 'Transfer bank (USD atau EUR)', paypal: 'PayPal',
    message: 'Pertanyaan atau konteks', messagePlaceholder: 'Latar belakang Anda, jadwal, hal yang ingin Anda lihat di memorandum…',
    ack: 'Saya telah membaca pemberitahuan risiko di atas dan memahami bahwa ini pengajuan, bukan pembayaran.',
    send: 'Ajukan investasi', sending: 'Mengirim…',
    footnote: 'Rahasia. Data Anda hanya untuk pemilik xaa.es, tidak pernah dibagikan atau dipublikasikan.',
  },
};

/** Public application on /invest. Nothing is paid here. */
export function InvestForm({ lang = 'en', min, open = true }: { lang?: Lang; min: string; open?: boolean }) {
  const [state, action] = useActionState<ActionState, FormData>(investApplyAction, {});
  const c = pick(lang, COPY);
  // React resets a form after its action; after an error the fields come back with what was typed.
  const v = state.values ?? {};
  return (
    <form action={action} className="panel p-6 sm:p-8" aria-describedby="invest-note" data-testid="invest-form">
      <Notice error={state.error} ok={state.ok} />
      <input type="hidden" name="lang" value={lang} />
      <div className="hidden" aria-hidden>
        <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="grid gap-x-5 sm:grid-cols-2">
        <label className="field"><span>{c.name}</span><input name="name" className="input" required autoComplete="name" defaultValue={v.name} /></label>
        <label className="field"><span>{c.email}</span><input name="email" type="email" className="input" required autoComplete="email" defaultValue={v.email} /></label>
        <label className="field"><span>{c.company}</span><input name="company" className="input" autoComplete="organization" defaultValue={v.company} /></label>
        <label className="field"><span>{c.country}</span><input name="country" className="input" autoComplete="country-name" defaultValue={v.country} /></label>
      </div>
      <div className="grid gap-x-5 sm:grid-cols-2">
        <label className="field">
          <span>{c.amount}</span>
          <input name="amount" className="input" inputMode="numeric" required placeholder={c.amountHint(min)} defaultValue={v.amount} />
        </label>
        <label className="field">
          <span>{c.method}</span>
          <select name="method" className="select" defaultValue={v.method || 'wire'} key={v.method || 'wire'}>
            <option value="wire">{c.wire}</option>
            <option value="paypal">{c.paypal}</option>
          </select>
        </label>
      </div>
      <label className="field">
        <span>{c.message}</span>
        <textarea name="message" className="textarea" rows={4} placeholder={c.messagePlaceholder} defaultValue={v.message} />
      </label>
      <label className="mb-5 flex items-start gap-3 text-sm leading-relaxed text-steel-500">
        <input type="checkbox" name="ack" className="mt-1" required defaultChecked={Boolean(state.values)} />
        <span>{c.ack}</span>
      </label>
      <Submit disabled={!open} pendingLabel={c.sending} className="btn btn-primary w-full sm:w-auto">{c.send}</Submit>
      <p id="invest-note" className="mt-3 text-xs text-steel-500">{c.footnote}</p>
    </form>
  );
}

/** Studio desk: verify the capital received, decline, or mark repaid. */
export function InvestorDecision({ id, status, pledge }: { id: string; status: string; pledge: number }) {
  const [state, verify] = useActionState<ActionState, FormData>(verifyInvestorAction, {});
  const [closeState, close] = useActionState<ActionState, FormData>(investorStatusAction, {});
  const [open, setOpen] = useState(false);
  if (status === 'declined' || status === 'returned') return null;
  return (
    <div>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen((v) => !v)} data-testid="investor-manage">
        {open ? 'Close' : status === 'verified' ? 'Manage' : 'Verify / decline'}
      </button>
      {open ? (
        <div className="mt-3 space-y-3">
          {status === 'applied' ? (
            <form action={verify} className="rounded-lg border border-[color:var(--line)] p-4">
              <Notice error={state.error} ok={state.ok} />
              <input type="hidden" name="id" value={id} />
              <label className="field">
                <span>Capital received (USD)</span>
                <input name="capital" className="input" inputMode="numeric" defaultValue={String(pledge)} required />
              </label>
              <label className="field">
                <span>Received by</span>
                <select name="method" className="select" defaultValue="wire">
                  <option value="wire">Bank wire</option>
                  <option value="paypal">PayPal</option>
                </select>
              </label>
              <p className="mb-3 text-xs text-steel-500">Only after the signed agreement and the money are both in. The revenue share starts the moment you verify.</p>
              <Submit className="btn btn-dark btn-sm" pendingLabel="Verifying…">Verify capital</Submit>
            </form>
          ) : null}
          <form action={close} className="rounded-lg border border-[color:var(--line)] p-4">
            <Notice error={closeState.error} ok={closeState.ok} />
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value={status === 'verified' ? 'returned' : 'declined'} />
            <label className="field">
              <span>Note</span>
              <input name="note" className="input" placeholder={status === 'verified' ? 'e.g. capital returned at the acquisition, wire ref …' : 'Reason, for the record'} />
            </label>
            <Submit className="btn btn-ghost btn-sm" pendingLabel="Saving…">{status === 'verified' ? 'Mark capital returned' : 'Decline application'}</Submit>
          </form>
        </div>
      ) : null}
    </div>
  );
}

/** Studio desk: record a monthly revenue-share payment. */
export function PayoutForm({ id, period, due }: { id: string; period: string; due: string }) {
  const [state, action] = useActionState<ActionState, FormData>(recordPayoutAction, {});
  return (
    <form action={action} className="flex flex-wrap items-end gap-2" data-testid="payout-form">
      <input type="hidden" name="id" value={id} />
      <label className="field !mb-0">
        <span>Month</span>
        <input name="period" type="month" className="input" defaultValue={period} required />
      </label>
      <label className="field !mb-0">
        <span>Paid (EUR)</span>
        <input name="amount" className="input w-32" inputMode="decimal" defaultValue={due} required />
      </label>
      <label className="field !mb-0">
        <span>Reference</span>
        <input name="reference" className="input w-40" placeholder="wire / PayPal ref" />
      </label>
      <Submit className="btn btn-dark btn-sm" pendingLabel="Recording…">Record payout</Submit>
      <div className="w-full"><Notice error={state.error} ok={state.ok} /></div>
    </form>
  );
}
