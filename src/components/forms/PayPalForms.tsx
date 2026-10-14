'use client';

import { useActionState } from 'react';
import { startPaypalMilestoneAction, startPaypalOrderAction, testPaypalAction, type ActionState } from '@/server/actions';
import { eur } from '@/content/packages';
import { Submit, Notice } from './Submit';

export type PayPalOffer = { env: 'live' | 'sandbox' } | null;

/**
 * "Pay with PayPal" for a project milestone or a template order. The form
 * carries only which thing is being paid — the amount is looked up again on
 * the server, so nothing typed or tampered with in the browser can change it.
 */
export function PayPalPay({
  target,
  id,
  milestone,
  amount,
  env,
}: {
  target: 'milestone' | 'order';
  id: string;
  milestone?: string;
  amount: number;
  env: 'live' | 'sandbox';
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    target === 'milestone' ? startPaypalMilestoneAction : startPaypalOrderAction,
    {}
  );
  return (
    <form action={action} className="paypal-box">
      <input type="hidden" name={target === 'milestone' ? 'projectId' : 'orderId'} value={id} />
      {milestone ? <input type="hidden" name="milestone" value={milestone} /> : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-steel-400">Fastest · confirmed automatically</p>
        {env === 'sandbox' ? <span className="badge badge-amber">Test mode · PayPal sandbox, no real money</span> : null}
      </div>
      <Notice error={state.error} ok={state.ok} />
      <Submit className="btn-paypal mt-3" pendingLabel="Opening PayPal…">
        <span>Pay {eur(amount)} with</span>
        <span className="pp-word" aria-label="PayPal">
          <b>Pay</b>Pal
        </span>
      </Submit>
      <p className="hint mt-2">
        PayPal balance, or any debit or credit card through PayPal. You come straight back here and the payment is
        confirmed on the spot — no transaction ID to copy.
      </p>
    </form>
  );
}

/** Fixed wording per failure code — the URL carries a code, never text. */
const FAILED: Record<string, string> = {
  not_approved: 'The payment was not approved on PayPal, so nothing was charged.',
  declined: 'PayPal declined that card or balance. Please try again and choose another way to pay inside PayPal.',
  mismatch: 'PayPal reported a different amount than this invoice, so nothing was booked. Please contact us and we will sort it out.',
  unavailable: 'PayPal could not be reached just now. Nothing was booked — please try again in a moment.',
  unknown: 'Nothing was booked. Please try again or choose another way to pay.',
};

/** Outcome of a trip to PayPal, read from the return redirect. */
export function PayPalOutcome({ outcome, reason }: { outcome?: string; reason?: string }) {
  if (!outcome) return null;
  const view: Record<string, { cls: string; title: string; body: string }> = {
    done: { cls: 'form-ok', title: 'Payment received', body: 'PayPal confirmed it and your record has been updated.' },
    pending: {
      cls: 'paypal-note',
      title: 'PayPal is reviewing this payment',
      body: 'PayPal has taken the payment but is holding it for a routine check. It confirms here automatically once PayPal releases it — there is nothing else for you to do.',
    },
    processing: { cls: 'paypal-note', title: 'Almost there', body: 'Your payment is being confirmed. Refresh this page in a moment.' },
    cancelled: { cls: 'paypal-note', title: 'PayPal payment cancelled', body: 'Nothing was charged. You can pay again whenever you are ready.' },
    failed: { cls: 'form-error', title: 'PayPal did not complete the payment', body: FAILED[reason ?? ''] ?? FAILED.unknown },
  };
  const v = view[outcome];
  if (!v) return null;
  return (
    <div className={`${v.cls} paypal-outcome`} role={outcome === 'failed' ? 'alert' : 'status'}>
      <strong>{v.title}.</strong> {v.body}
    </div>
  );
}

/** Admin: sign in to PayPal with the stored credentials of one environment. */
export function TestPayPal({ env }: { env: 'live' | 'sandbox' }) {
  const [state, action] = useActionState<ActionState, FormData>(testPaypalAction, {});
  return (
    <form action={action} className="inline-flex flex-col gap-1">
      <input type="hidden" name="env" value={env} />
      <Submit className="btn btn-ghost btn-sm" pendingLabel="Checking…">
        Test {env === 'live' ? 'Live' : 'Sandbox'} credentials
      </Submit>
      <Notice error={state.error} ok={state.ok} />
    </form>
  );
}
