'use client';

import { useActionState } from 'react';
import {
  uploadConceptAction, setProgressAction, setContractAction,
  postUpdateAction, confirmPaymentAction, uploadDeliverableAction, uploadBusinessDataAction,
  type ActionState,
} from '@/server/actions';
import { eur, usd } from '@/content/packages';
import { ManualPay } from './ManualPay';
import type { PayOption } from '@/server/manual-pay';
import type { Lang } from '@/lib/i18n';
import { Submit, Notice } from './Submit';
import { PayPalPay, type PayPalOffer } from './PayPalForms';

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

/**
 * The payment that is due now: PayPal Checkout when it is on, and the manual payment guide (ManualPay) with every
 * BNI currency account and company wallet, each quoted in its own currency.
 */
export function PaymentForm({
  projectId,
  projectRef,
  milestone,
  label,
  amount,
  options,
  paypal = null,
  lang,
}: {
  projectId: string;
  projectRef: string;
  milestone: string;
  label: string;
  amount: number;
  options: PayOption[];
  paypal?: PayPalOffer;
  lang: Lang;
}) {
  return (
    <div className="panel border-l-4 border-l-[color:var(--accent)] p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-extrabold">{label}</h3>
        <p className="font-display text-2xl font-extrabold accent-text">{eur(amount)}</p>
      </div>
      <p className="text-xs text-steel-400">≈ {usd(amount)}</p>
      {paypal ? <PayPalPay target="milestone" id={projectId} milestone={milestone} amount={amount} env={paypal.env} /> : null}
      {paypal && options.length ? <p className="pay-divider">or pay by bank transfer or crypto</p> : null}
      {options.length || !paypal ? (
        <div className="mt-4">
          <ManualPay
            lang={lang}
            options={options}
            reference={`${projectRef} ${label}`.slice(0, 60)}
            amountEur={amount}
            eurText={eur(amount)}
            target="milestone"
            hidden={{ projectId, milestone, label }}
            eurField
          />
        </div>
      ) : null}
    </div>
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
      <input name="reason" className="input !w-44 !py-1 text-xs" placeholder="Reason, if rejecting" aria-label="Reason shown to the client if you reject" />
      <button type="submit" name="decision" value="reject" className="btn btn-ghost btn-sm">Reject</button>
      {state.error ? <span className="text-xs text-red-700">{state.error}</span> : null}
      {state.ok ? <span className="text-xs text-green-700">{state.ok}</span> : null}
    </form>
  );
}

/* ───────────────────── Client: business data ───────────────────── */

/**
 * Company and member data the build needs — registration documents, team and
 * customer lists, product data. Separate from the concept upload because it
 * arrives later and for a different reason, and mixing the two made the
 * project page ambiguous about what was still owed.
 */
export function BusinessDataForm({ projectId }: { projectId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(uploadBusinessDataAction, {});
  return (
    <form action={action} className="panel p-6">
      <h3 className="font-display text-lg font-extrabold">Business &amp; member data</h3>
      <p className="mt-1 text-sm text-steel-500">
        Company registration, team or member lists, product data, price lists — whatever the build has to be loaded
        with. Private to your project: only you and the delivery team can open these.
      </p>
      <div className="mt-5">
        <Notice error={state.error} ok={state.ok} />
        <input type="hidden" name="projectId" value={projectId} />
        <label className="field">
          <span>Files</span>
          <input type="file" name="files" multiple className="input" />
          <span className="hint">
            Spreadsheets, documents, images or a ZIP. Up to 25 MB per file, 10 files at a time.
          </span>
        </label>
        <label className="field">
          <span>Notes</span>
          <textarea name="note" className="textarea" rows={3} placeholder="How the data is structured, what is missing, anything confidential we should handle carefully." />
        </label>
        <Submit pendingLabel="Uploading…">Send data</Submit>
      </div>
    </form>
  );
}
