'use client';

import { useActionState } from 'react';
import { enquiryAction, type ActionState } from '@/server/actions';
import { PACKAGES } from '@/content/packages';
import { Submit, Notice } from './Submit';

const BUDGETS = [
  'Under €1,000',
  '€1,000 – €5,000',
  '€5,000 – €15,000',
  '€15,000 – €50,000',
  '€50,000 – €150,000',
  '€150,000+',
  'Not sure yet',
];

export function EnquiryForm({ defaultPackage = '' }: { defaultPackage?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(enquiryAction, {});

  return (
    <form action={action} className="panel p-6">
      <Notice error={state.error} ok={state.ok} />
      <div className="grid gap-x-5 sm:grid-cols-2">
        <label className="field">
          <span>Your name *</span>
          <input name="name" className="input" required autoComplete="name" />
        </label>
        <label className="field">
          <span>Email *</span>
          <input name="email" type="email" className="input" required autoComplete="email" />
        </label>
        <label className="field">
          <span>Company</span>
          <input name="company" className="input" autoComplete="organization" />
        </label>
        <label className="field">
          <span>Budget</span>
          <select name="budget" className="select" defaultValue="">
            <option value="">Select a range</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span>Package you are looking at</span>
        <select name="package" className="select" defaultValue={defaultPackage}>
          <option value="">Not sure — advise me</option>
          {PACKAGES.map((p) => (
            <option key={p.slug} value={p.slug}>{p.code} · {p.name}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>What are you building? *</span>
        <textarea
          name="message"
          className="textarea"
          rows={6}
          required
          placeholder="Tell us what the site or platform has to do, who uses it, what exists today, and when you need it live."
        />
        <span className="hint">The more concrete this is, the more useful our reply will be.</span>
      </label>

      {/* Honeypot — real people never see it, bots fill it in. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <Submit pendingLabel="Sending…">Send brief</Submit>
      <p className="hint mt-3">We reply within one business day. No sales sequence, no newsletter.</p>
    </form>
  );
}
