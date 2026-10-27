'use client';

import { useActionState } from 'react';
import {
  buyTemplateAction, submitOrderPaymentAction, confirmOrderAction, uploadBundleAction,
  type ActionState,
} from '@/server/actions';
import { Submit, Notice } from './Submit';
import { PayPalPay, type PayPalOffer } from './PayPalForms';
import { wireAmount } from './ProjectForms';

type Dest = {
  id: string; kind: string; label: string; network: string | null; currency: string;
  address: string; memo: string | null; link: string | null; instructions: string | null;
  holder?: string | null; bankName?: string | null; swift?: string | null; branch?: string | null; bankCountry?: string | null;
};

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
  price,
  destinations,
  paypal = null,
}: {
  orderId: string;
  price: number;
  destinations: Dest[];
  paypal?: PayPalOffer;
}) {
  const [state, action] = useActionState<ActionState, FormData>(submitOrderPaymentAction, {});
  const crypto = destinations.filter((d) => d.kind === 'crypto');
  // With PayPal Checkout on, a manual PayPal destination is a slower copy of it.
  const paypalManual = paypal ? [] : destinations.filter((d) => d.kind === 'paypal');
  const bank = destinations.filter((d) => d.kind === 'bank');
  const manualCount = crypto.length + paypalManual.length + bank.length;
  const method = crypto.length ? 'usdt' : paypalManual.length ? 'paypal' : bank.length ? 'bank' : 'usdt';

  return (
    <div className="panel p-6">
      <h2 className="font-display text-lg font-extrabold">Pay for your bundle</h2>

      {paypal ? <PayPalPay target="order" id={orderId} amount={price} env={paypal.env} /> : null}

      {manualCount === 0 && !paypal ? (
        <p className="mt-3 text-sm text-steel-500">
          Payment destinations are not configured yet. Please <a href="/contact" className="text-gold-500 underline">contact us</a> to complete the purchase.
        </p>
      ) : null}

      {manualCount > 0 ? (
        <form action={action}>
          {paypal ? <p className="pay-divider">or pay by bank transfer{crypto.length ? ' or crypto' : ''}</p> : null}
          <Notice error={state.error} ok={state.ok} />
          <div className="mt-4 space-y-3">
            {crypto.map((d) => (
              <Dest key={d.id} title={`${d.currency}${d.network ? ` · ${d.network}` : ''}`} rows={[['Address', d.address], d.memo ? ['Memo/Tag', d.memo] : null]} instructions={d.instructions} />
            ))}
            {paypalManual.map((d) => (
              <Dest key={d.id} title="PayPal" rows={[['Account', d.address], d.link ? ['Link', d.link] : null]} instructions={d.instructions} />
            ))}
            {bank.map((d) => {
              const wire = wireAmount(price, d.currency);
              return (
                <Dest
                  key={d.id}
                  title={`Bank transfer · ${d.currency}${d.bankName ? ` · ${d.bankName}` : ''}`}
                  rows={[
                    ['Send', wire.main],
                    ['Account', d.address],
                    d.holder ? ['Holder', d.holder] : null,
                    d.swift ? ['SWIFT/BIC', d.swift] : null,
                    d.branch ? ['Branch', d.branch] : null,
                  ]}
                  instructions={[wire.note, d.instructions].filter(Boolean).join('\n') || null}
                />
              );
            })}
          </div>

          <input type="hidden" name="orderId" value={orderId} />
          <label className="field mt-4">
            <span>Method</span>
            <select name="method" className="select" defaultValue={method}>
              {crypto.length ? <option value="usdt">Crypto</option> : null}
              {paypalManual.length ? <option value="paypal">PayPal</option> : null}
              {bank.length ? <option value="bank">Bank transfer</option> : null}
            </select>
          </label>
          <label className="field">
            <span>Transaction reference *</span>
            <input name="reference" className="input" required placeholder="Transaction hash / PayPal ID / wire reference" />
          </label>
          <label className="field">
            <span>Payment screenshot{bank.length ? ' (required for a bank transfer)' : ''}</span>
            <input type="file" name="receipt" accept="image/png,image/jpeg,image/webp,application/pdf" className="text-sm" />
          </label>
          <label className="field">
            <span>Note (optional)</span>
            <input name="note" className="input" />
          </label>
          <Submit pendingLabel="Submitting…">I have paid — submit</Submit>
          <p className="hint mt-2">We confirm within one business day from your screenshot and what you bought unlocks automatically.</p>
        </form>
      ) : null}
    </div>
  );
}

function Dest({ title, rows, instructions }: { title: string; rows: (readonly [string, string] | null)[]; instructions: string | null }) {
  return (
    <div className="rounded-lg bg-[color:var(--surface)] p-3 text-sm">
      <p className="font-bold">{title}</p>
      <dl className="mt-1 space-y-1">
        {rows.filter(Boolean).map((r) => (
          <div key={(r as [string, string])[0]} className="flex flex-wrap justify-between gap-2">
            <dt className="text-xs uppercase tracking-wide text-steel-500">{(r as [string, string])[0]}</dt>
            <dd className="break-all font-mono text-xs">{(r as [string, string])[1]}</dd>
          </div>
        ))}
      </dl>
      {instructions ? <pre className="mt-2 whitespace-pre-wrap font-sans text-xs text-steel-500">{instructions}</pre> : null}
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
