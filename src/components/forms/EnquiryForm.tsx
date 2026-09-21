'use client';

import { useActionState } from 'react';
import { enquiryAction, type ActionState } from '@/server/actions';
import { PACKAGES } from '@/content/packages';
import { pick, type Lang } from '@/lib/i18n';
import { Submit, Notice } from './Submit';

type Copy = {
  name: string; email: string; company: string; budget: string; selectRange: string;
  budgets: string[]; pkg: string; pkgNotSure: string; building: string;
  buildingPlaceholder: string; buildingHint: string; send: string; sending: string; footnote: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    name: 'Your name *', email: 'Email *', company: 'Company', budget: 'Budget', selectRange: 'Select a range',
    budgets: ['Under €1,000', '€1,000 – €5,000', '€5,000 – €15,000', '€15,000 – €50,000', '€50,000 – €150,000', '€150,000+', 'Not sure yet'],
    pkg: 'Package you are looking at', pkgNotSure: 'Not sure — advise me', building: 'What are you building? *',
    buildingPlaceholder: 'Tell us what the site or platform has to do, who uses it, what exists today, and when you need it live.',
    buildingHint: 'The more concrete this is, the more useful our reply will be.',
    send: 'Send brief', sending: 'Sending…', footnote: 'We reply within one business day. No sales sequence, no newsletter.',
  },
  es: {
    name: 'Tu nombre *', email: 'Email *', company: 'Empresa', budget: 'Presupuesto', selectRange: 'Elige un rango',
    budgets: ['Menos de 1.000 €', '1.000 € – 5.000 €', '5.000 € – 15.000 €', '15.000 € – 50.000 €', '50.000 € – 150.000 €', '150.000 €+', 'Aún no lo sé'],
    pkg: 'Paquete que estás mirando', pkgNotSure: 'No estoy seguro — aconséjame', building: '¿Qué estás construyendo? *',
    buildingPlaceholder: 'Cuéntanos qué debe hacer el sitio o la plataforma, quién lo usa, qué existe hoy y para cuándo lo necesitas en vivo.',
    buildingHint: 'Cuanto más concreto sea esto, más útil será nuestra respuesta.',
    send: 'Enviar brief', sending: 'Enviando…', footnote: 'Respondemos en un día hábil. Sin secuencia de ventas, sin newsletter.',
  },
  id: {
    name: 'Nama Anda *', email: 'Email *', company: 'Perusahaan', budget: 'Anggaran', selectRange: 'Pilih rentang',
    budgets: ['Di bawah €1.000', '€1.000 – €5.000', '€5.000 – €15.000', '€15.000 – €50.000', '€50.000 – €150.000', '€150.000+', 'Belum yakin'],
    pkg: 'Paket yang Anda pertimbangkan', pkgNotSure: 'Belum yakin — beri saran', building: 'Apa yang Anda bangun? *',
    buildingPlaceholder: 'Ceritakan apa yang harus dilakukan situs atau platformnya, siapa penggunanya, apa yang ada saat ini, dan kapan Anda butuh online.',
    buildingHint: 'Makin konkret ini, makin berguna jawaban kami.',
    send: 'Kirim brief', sending: 'Mengirim…', footnote: 'Kami membalas dalam satu hari kerja. Tanpa rangkaian sales, tanpa newsletter.',
  },
};

export function EnquiryForm({ defaultPackage = '', lang = 'en' }: { defaultPackage?: string; lang?: Lang }) {
  const [state, action] = useActionState<ActionState, FormData>(enquiryAction, {});
  const c = pick(lang, COPY);

  return (
    <form action={action} className="panel p-6">
      <Notice error={state.error} ok={state.ok} />
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
          <span>{c.budget}</span>
          <select name="budget" className="select" defaultValue="">
            <option value="">{c.selectRange}</option>
            {c.budgets.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span>{c.pkg}</span>
        <select name="package" className="select" defaultValue={defaultPackage}>
          <option value="">{c.pkgNotSure}</option>
          {PACKAGES.map((p) => (
            <option key={p.slug} value={p.slug}>{p.code} · {p.name}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>{c.building}</span>
        <textarea
          name="message"
          className="textarea"
          rows={6}
          required
          placeholder={c.buildingPlaceholder}
        />
        <span className="hint">{c.buildingHint}</span>
      </label>

      {/* Honeypot — real people never see it, bots fill it in. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <Submit pendingLabel={c.sending}>{c.send}</Submit>
      <p className="hint mt-3">{c.footnote}</p>
    </form>
  );
}
