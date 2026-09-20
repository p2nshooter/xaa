'use client';

import { useActionState, useState } from 'react';
import {
  uploadConceptAction, submitPaymentAction, setProgressAction, setContractAction,
  postUpdateAction, confirmPaymentAction, uploadDeliverableAction, type ActionState,
} from '@/server/actions';
import { eur, usd } from '@/content/packages';
import { Submit, Notice } from './Submit';

export interface PayTo {
  trc20?: string;
  erc20?: string;
  bep20?: string;
  paypalEmail?: string;
  paypalLink?: string;
}

/* ───────────────────── Client: concept upload ───────────────────── */

export function ConceptUploadForm({ projectId, locked }: { projectId: string; locked: boolean }) {
  const [state, action] = useActionState<ActionState, FormData>(uploadConceptAction, {});
  if (locked) {
    return (
      <div className="panel p-6">
        <h3 className="font-display text-lg font-extrabold">Concept upload</h3>
        <p className="mt-2 text-sm text-steel-500">
          The upload panel opens as soon as your 10% booking deposit is confirmed. Start the deposit above and this
          unlocks automatically — usually within one business day.
        </p>
      </div>
    );
  }
  return (
    <form action={action} className="panel p-6">
      <h3 className="font-display text-lg font-extrabold">Upload your concept</h3>
      <p className="mt-1 text-sm text-steel-500">
        Anything that describes the site you want: a brief, a deck, screenshots of sites you like, your logo and brand
        files, copy, product data, wireframes. You can add more at any time during the build.
      </p>
      <div className="mt-5">
        <Notice error={state.error} ok={state.ok} />
        <input type="hidden" name="projectId" value={projectId} />
        <label className="field">
          <span>Files</span>
          <input type="file" name="files" multiple className="input" />
          <span className="hint">PDF, images, office documents, design files or ZIP. Up to 25 MB per file, 10 files at a time.</span>
        </label>
        <label className="field">
          <span>Notes</span>
          <textarea name="note" className="textarea" rows={4} placeholder="Anything the files do not say — references you like, must-haves, deadlines, who the site is for." />
        </label>
        <Submit pendingLabel="Uploading…">Send to the studio</Submit>
      </div>
    </form>
  );
}

/* ───────────────────── Client: milestone payment ───────────────────── */

export function PaymentForm({
  projectId,
  milestone,
  label,
  amount,
  payTo,
}: {
  projectId: string;
  milestone: string;
  label: string;
  amount: number;
  payTo: PayTo;
}) {
  const [state, action] = useActionState<ActionState, FormData>(submitPaymentAction, {});
  const [method, setMethod] = useState<'usdt' | 'paypal'>('usdt');
  const [network, setNetwork] = useState<'TRC20' | 'ERC20' | 'BEP20'>('TRC20');

  const address = network === 'TRC20' ? payTo.trc20 : network === 'ERC20' ? payTo.erc20 : payTo.bep20;

  return (
    <form action={action} className="panel border-l-4 border-l-[color:var(--accent)] p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-extrabold">{label}</h3>
        <p className="font-display text-2xl font-extrabold accent-text">{eur(amount)}</p>
      </div>
      <p className="text-xs text-steel-500">≈ {usd(amount)} in USDT</p>

      <div className="mt-5">
        <Notice error={state.error} ok={state.ok} />
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="milestone" value={milestone} />
        <input type="hidden" name="label" value={label} />

        <div className="flex gap-2">
          {(['usdt', 'paypal'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={`btn btn-sm flex-1 ${method === m ? 'btn-primary' : 'btn-ghost'}`}
            >
              {m === 'usdt' ? 'Pay in USDT' : 'Pay with PayPal'}
            </button>
          ))}
        </div>
        <input type="hidden" name="method" value={method} />

        {method === 'usdt' ? (
          <div className="mt-5">
            <p className="text-xs font-extrabold uppercase tracking-wide text-steel-500">Network</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['TRC20', 'ERC20', 'BEP20'] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNetwork(n)}
                  className={`btn btn-sm ${network === n ? 'btn-dark' : 'btn-ghost'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <input type="hidden" name="network" value={network} />

            <div className="mt-4 rounded-lg bg-ivory-100/70 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-steel-500">Send {usd(amount)} USDT ({network}) to</p>
              {address ? (
                <code className="mt-2 block break-all rounded bg-white p-3 text-xs font-semibold">{address}</code>
              ) : (
                <p className="mt-2 text-sm text-steel-500">
                  The {network} address for this project has not been published yet. Choose another network, or email us
                  and we will enable it — never accept an address sent to you any other way.
                </p>
              )}
              <p className="hint mt-2">
                Send only USDT on {network}. A transfer on the wrong network cannot be recovered. Network fees are paid
                by the sender.
              </p>
            </div>

            <label className="field mt-4">
              <span>Transaction hash *</span>
              <input name="reference" className="input" required placeholder="0x… or the TRON txid" />
              <span className="hint">We verify it on-chain and confirm within one business day.</span>
            </label>
          </div>
        ) : (
          <div className="mt-5">
            <div className="rounded-lg bg-ivory-100/70 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-steel-500">Send {eur(amount)} via PayPal to</p>
              {payTo.paypalEmail || payTo.paypalLink ? (
                <>
                  {payTo.paypalEmail ? <code className="mt-2 block break-all rounded bg-white p-3 text-xs font-semibold">{payTo.paypalEmail}</code> : null}
                  {payTo.paypalLink ? (
                    <a href={payTo.paypalLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm mt-3">
                      Open PayPal
                    </a>
                  ) : null}
                </>
              ) : (
                <p className="mt-2 text-sm text-steel-500">PayPal has not been published for this deployment yet. Use USDT, or contact us.</p>
              )}
              <p className="hint mt-2">
                Send as a payment for goods and services and quote your project reference. Friends-and-family transfers
                remove your buyer protection.
              </p>
            </div>

            <label className="field mt-4">
              <span>PayPal transaction ID *</span>
              <input name="reference" className="input" required placeholder="e.g. 8XY12345AB678901C" />
            </label>
          </div>
        )}

        <div className="grid gap-x-5 sm:grid-cols-2">
          <label className="field">
            <span>Amount sent (EUR) *</span>
            <input name="amount" type="number" min={1} step={1} defaultValue={amount} className="input" required />
          </label>
          <label className="field">
            <span>Receipt / screenshot</span>
            <input type="file" name="proof" className="input" />
          </label>
        </div>
        <label className="field">
          <span>Note</span>
          <input name="note" className="input" placeholder="Anything we should know about this transfer" />
        </label>

        <Submit pendingLabel="Submitting…">I have sent this payment</Submit>
        <p className="hint mt-2">
          Submitting records the payment as pending. Your project status updates by itself once we have verified it.
        </p>
      </div>
    </form>
  );
}

/* ───────────────────── Studio: admin controls ───────────────────── */

export function AdminProjectControls({
  projectId,
  progress,
  contract,
  capped,
}: {
  projectId: string;
  progress: number;
  contract: number;
  capped: boolean;
}) {
  const [progressState, progressAction] = useActionState<ActionState, FormData>(setProgressAction, {});
  const [contractState, contractAction] = useActionState<ActionState, FormData>(setContractAction, {});
  const [updateState, updateAction] = useActionState<ActionState, FormData>(postUpdateAction, {});
  const [deliverState, deliverAction] = useActionState<ActionState, FormData>(uploadDeliverableAction, {});

  return (
    <div className="panel border-l-4 border-l-ink-900 p-6">
      <h3 className="font-display text-lg font-extrabold">Studio controls</h3>
      <p className="mt-1 text-xs text-steel-500">Visible to admins only. Every change is written to the client&apos;s activity log.</p>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <form action={progressAction}>
          <Notice error={progressState.error} ok={progressState.ok} />
          <input type="hidden" name="projectId" value={projectId} />
          <label className="field">
            <span>Progress %</span>
            <input name="progress" type="number" min={0} max={100} step={1} defaultValue={progress} className="input" />
            {capped ? <span className="hint">Capped at 80% — the settlement has not cleared yet.</span> : null}
          </label>
          <label className="field">
            <span>What changed</span>
            <input name="note" className="input" placeholder="Design approved, checkout built, staging deployed…" />
          </label>
          <Submit className="btn btn-dark btn-sm" pendingLabel="Saving…">Update progress</Submit>
        </form>

        <form action={contractAction}>
          <Notice error={contractState.error} ok={contractState.ok} />
          <input type="hidden" name="projectId" value={projectId} />
          <label className="field">
            <span>Contract value (EUR)</span>
            <input name="amount" type="number" min={1} step={1} defaultValue={contract} className="input" />
            <span className="hint">Set after the scope review. Milestone amounts recalculate from it.</span>
          </label>
          <Submit className="btn btn-dark btn-sm" pendingLabel="Saving…">Set contract value</Submit>
        </form>

        <form action={updateAction}>
          <Notice error={updateState.error} ok={updateState.ok} />
          <input type="hidden" name="projectId" value={projectId} />
          <label className="field">
            <span>Post an update</span>
            <input name="title" className="input" placeholder="Title" />
          </label>
          <label className="field">
            <span>Detail</span>
            <textarea name="body" className="textarea" rows={3} />
          </label>
          <Submit className="btn btn-dark btn-sm" pendingLabel="Posting…">Post update</Submit>
        </form>

        <form action={deliverAction}>
          <Notice error={deliverState.error} ok={deliverState.ok} />
          <input type="hidden" name="projectId" value={projectId} />
          <label className="field">
            <span>Upload deliverables</span>
            <input type="file" name="files" multiple className="input" />
            <span className="hint">Source archives, design exports, documentation.</span>
          </label>
          <Submit className="btn btn-dark btn-sm" pendingLabel="Uploading…">Upload</Submit>
        </form>
      </div>
    </div>
  );
}

export function PaymentDecision({ paymentId }: { paymentId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(confirmPaymentAction, {});
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="paymentId" value={paymentId} />
      <button type="submit" name="decision" value="confirm" className="btn btn-primary btn-sm">Confirm</button>
      <button type="submit" name="decision" value="reject" className="btn btn-ghost btn-sm">Reject</button>
      {state.error ? <span className="text-xs text-red-700">{state.error}</span> : null}
      {state.ok ? <span className="text-xs text-green-700">{state.ok}</span> : null}
    </form>
  );
}
