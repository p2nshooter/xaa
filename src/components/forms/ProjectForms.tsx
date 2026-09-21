'use client';

import { useActionState, useState } from 'react';
import {
  uploadConceptAction, submitPaymentAction, setProgressAction, setContractAction,
  postUpdateAction, confirmPaymentAction, uploadDeliverableAction, uploadBusinessDataAction,
  type ActionState,
} from '@/server/actions';
import { eur, usd } from '@/content/packages';
import { Submit, Notice } from './Submit';

/** A destination as the client sees it, resolved from the admin's list. */
export interface PayDestination {
  id: string;
  kind: 'crypto' | 'paypal' | 'bank';
  label: string;
  network: string | null;
  currency: string;
  address: string;
  memo: string;
  link: string | null;
  instructions: string | null;
  holder?: string | null;
  bankName?: string | null;
  swift?: string | null;
  branch?: string | null;
  bankCountry?: string | null;
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

/** One labelled line in the bank-details box. */
function Row({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex flex-wrap justify-between gap-2">
      <dt className="text-steel-400">{k}</dt>
      <dd className={`text-right font-semibold text-ink-900 ${mono ? 'break-all font-mono' : ''}`}>{v}</dd>
    </div>
  );
}

/* ───────────────────── Client: milestone payment ───────────────────── */

export function PaymentForm({
  projectId,
  milestone,
  label,
  amount,
  destinations,
}: {
  projectId: string;
  milestone: string;
  label: string;
  amount: number;
  destinations: PayDestination[];
}) {
  const [state, action] = useActionState<ActionState, FormData>(submitPaymentAction, {});
  const [selectedId, setSelectedId] = useState(destinations[0]?.id ?? '');
  const selected = destinations.find((d) => d.id === selectedId) ?? destinations[0];

  if (destinations.length === 0) {
    return (
      <div className="panel border-l-4 border-l-amber-400 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-extrabold">{label}</h3>
          <p className="font-display text-2xl font-extrabold accent-text">{eur(amount)}</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-steel-500">
          No payment destination is published yet, so there is nowhere for us to honestly ask you to send this. We have
          been notified. Please hold — and never act on a wallet address sent to you by email or chat, from us or
          anyone claiming to be us.
        </p>
      </div>
    );
  }

  const isCrypto = selected?.kind === 'crypto';
  const isBank = selected?.kind === 'bank';
  const methodValue = isCrypto ? 'usdt' : isBank ? 'bank' : 'paypal';

  return (
    <form action={action} className="panel border-l-4 border-l-[color:var(--accent)] p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-extrabold">{label}</h3>
        <p className="font-display text-2xl font-extrabold accent-text">{eur(amount)}</p>
      </div>
      <p className="text-xs text-steel-400">≈ {usd(amount)} in USDT</p>

      <div className="mt-5">
        <Notice error={state.error} ok={state.ok} />
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="milestone" value={milestone} />
        <input type="hidden" name="label" value={label} />
        <input type="hidden" name="methodId" value={selected?.id ?? ''} />
        <input type="hidden" name="method" value={methodValue} />
        <input type="hidden" name="network" value={selected?.network ?? ''} />

        <p className="text-xs font-bold uppercase tracking-wide text-steel-400">Choose how to pay</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {destinations.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedId(d.id)}
              className={`btn btn-sm ${selectedId === d.id ? 'btn-primary' : 'btn-ghost'}`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {selected ? (
          <div className="mt-4 rounded-xl bg-[color:var(--surface)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-steel-400">
              Send {isCrypto ? `${usd(amount)} ${selected.currency}` : `${eur(amount)}${isBank && selected.currency !== 'EUR' ? ` (${selected.currency})` : ''}`} to
            </p>

            {isBank ? (
              <div className="mt-2 rounded-lg bg-white p-3 text-xs">
                <dl className="grid gap-1.5">
                  {selected.bankName ? <Row k="Bank" v={selected.bankName} /> : null}
                  {selected.swift ? <Row k="SWIFT / BIC" v={selected.swift} mono /> : null}
                  {selected.holder ? <Row k="Account holder" v={selected.holder} /> : null}
                  <Row k="Account number" v={selected.address} mono />
                  {selected.branch ? <Row k="Branch" v={selected.branch} /> : null}
                  {selected.bankCountry ? <Row k="Country" v={selected.bankCountry} /> : null}
                  <Row k="Currency" v={selected.currency} />
                </dl>
              </div>
            ) : (
              <code className="mt-2 block break-all rounded-lg bg-white p-3 text-xs font-semibold">
                {selected.address}
              </code>
            )}

            {selected.memo ? (
              <p className="mt-2 text-xs">
                <strong>Memo / tag (required):</strong>{' '}
                <code className="rounded bg-white px-1.5 py-0.5">{selected.memo}</code>
              </p>
            ) : null}
            {selected.link ? (
              <a href={selected.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm mt-3">
                Open {selected.label}
              </a>
            ) : null}

            {selected.instructions ? (
              <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-white p-3 text-[11px] leading-relaxed text-ink-800">
                {selected.instructions}
              </pre>
            ) : (
              <p className="hint mt-2">
                {isCrypto
                  ? `Send only ${selected.currency} on ${selected.network}. A transfer on the wrong network cannot be recovered, and network fees are paid by the sender.`
                  : 'Send as a payment for goods and services and quote your project reference.'}
              </p>
            )}
          </div>
        ) : null}

        <label className="field mt-4">
          <span>{isCrypto ? 'Transaction hash *' : isBank ? 'Wire reference / receipt no. *' : 'Transaction ID *'}</span>
          <input
            name="reference"
            className="input font-mono text-sm"
            required
            autoComplete="off"
            spellCheck={false}
            placeholder={isCrypto ? '0x… or the TRON txid' : isBank ? 'The reference on your wire receipt' : 'e.g. 8XY12345AB678901C'}
          />
          <span className="hint">We verify it against the transfer and confirm within one business day.</span>
        </label>

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
