'use client';

import { useActionState } from 'react';
import {
  buyTemplateAction, confirmOrderAction, orderAttentionAction, uploadBundleAction,
  type ActionState,
} from '@/server/actions';
import { Submit, Notice } from './Submit';
import { PayPalPay, type PayPalOffer } from './PayPalForms';
import { ManualPay } from './ManualPay';
import type { PayOption } from '@/server/manual-pay';
import type { Lang } from '@/lib/i18n';


export function BuyButton({ slug, label, className = 'btn btn-primary' }: { slug: string; label: string; className?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(buyTemplateAction, {});
  return (
    <form action={action} className="inline">
      <input type="hidden" name="slug" value={slug} />
      <Submit pendingLabel="Opening…" className={className}>{label}</Submit>
      {state.error ? <span className="ml-2 text-xs text-red-600">{state.error}</span> : null}
    </form>
  );
}

export function OrderPaymentForm({
  orderId,
  orderRef,
  price,
  eurText,
  options,
  paypal = null,
  lang,
}: {
  orderId: string;
  orderRef: string;
  price: number;
  eurText: string;
  options: PayOption[];
  paypal?: PayPalOffer;
  lang: Lang;
}) {
  return (
    <div className="space-y-4">
      {paypal ? (
        <div className="panel p-6">
          <h2 className="font-display text-lg font-extrabold">PayPal · card</h2>
          <PayPalPay target="order" id={orderId} amount={price} env={paypal.env} />
        </div>
      ) : null}
      {paypal && options.length ? <p className="pay-divider">or pay by bank transfer or crypto</p> : null}
      {options.length || !paypal ? (
        <ManualPay lang={lang} options={options} reference={orderRef} amountEur={price} eurText={eurText} target="order" hidden={{ orderId }} />
      ) : null}
    </div>
  );
}

export function ConfirmOrderControls({ orderId }: { orderId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(confirmOrderAction, {});
  return (
    <form action={action} className="panel p-5">
      <p className="text-xs font-extrabold uppercase tracking-wide text-steel-500">Studio — confirm order</p>
      <Notice error={state.error} ok={state.ok} />
      <input type="hidden" name="orderId" value={orderId} />
      <div className="mt-2 flex flex-wrap gap-2">
        <Submit pendingLabel="Working…" className="btn btn-primary btn-sm">Mark paid — unlock download</Submit>
        <button type="submit" name="decision" value="cancel" className="btn btn-ghost btn-sm">Cancel order</button>
      </div>
    </form>
  );
}

/** Studio: send the payment back with what to fix — the buyer sees the note in their tracker. */
export function OrderAttentionForm({ orderId }: { orderId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(orderAttentionAction, {});
  return (
    <form action={action} className="panel mt-3 p-5">
      <p className="text-xs font-extrabold uppercase tracking-wide text-steel-500">Studio — needs attention</p>
      <Notice error={state.error} ok={state.ok} />
      <input type="hidden" name="orderId" value={orderId} />
      <label className="field">
        <span>What the buyer should do</span>
        <input name="reason" className="input" placeholder="e.g. Rp 25.437 is missing — please transfer the difference and upload both receipts" />
      </label>
      <Submit pendingLabel="Sending…" className="btn btn-ghost btn-sm">Send back to the buyer</Submit>
    </form>
  );
}

export function BundleUploadForm({ slug, hasBundle }: { slug: string; hasBundle: boolean }) {
  const [state, action] = useActionState<ActionState, FormData>(uploadBundleAction, {});
  return (
    <form action={action} className="panel p-5">
      <p className="text-xs font-extrabold uppercase tracking-wide text-steel-500">Studio — bundle (.zip)</p>
      <p className="mt-1 text-xs text-steel-500">{hasBundle ? 'A bundle is uploaded. Uploading again replaces it.' : 'No bundle uploaded yet — buyers see a "preparing" state until you add one.'}</p>
      <Notice error={state.error} ok={state.ok} />
      <input type="hidden" name="slug" value={slug} />
      <input type="file" name="bundle" accept=".zip,application/zip" className="mt-2 block w-full text-sm" />
      <Submit pendingLabel="Uploading…" className="btn btn-ghost btn-sm mt-2">Upload bundle</Submit>
    </form>
  );
}
