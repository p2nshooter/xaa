'use client';

import { useActionState, useState } from 'react';
import {
  savePaymentMethodAction, togglePaymentMethodAction, deletePaymentMethodAction,
  importEnvMethodsAction, saveSettingsAction, clearSettingAction,
  updateLeadAction, deleteLeadAction, type ActionState,
} from '@/server/actions';
import { Submit, Notice } from './Submit';

/* ───────────────── Payment destinations ───────────────── */

export interface MethodView {
  id: string;
  kind: 'crypto' | 'paypal' | 'bank';
  label: string;
  network: string | null;
  currency: string;
  masked: string;
  link: string | null;
  instructions: string | null;
  active: boolean;
  sortOrder: number;
  unreadable: boolean;
  hasMemo: boolean;
}

const NETWORKS = ['TRC20', 'ERC20', 'BEP20', 'Polygon', 'Solana', 'Arbitrum', 'Bitcoin', 'Other'];

export function PaymentMethodForm({ method, onDone }: { method?: MethodView; onDone?: () => void }) {
  const [state, action] = useActionState<ActionState, FormData>(savePaymentMethodAction, {});
  const [kind, setKind] = useState<MethodView['kind']>(method?.kind ?? 'crypto');
  const editing = Boolean(method);

  return (
    <form action={action} className="panel p-6">
      <Notice error={state.error} ok={state.ok} />
      {method ? <input type="hidden" name="id" value={method.id} /> : null}

      <div className="grid gap-x-5 sm:grid-cols-2">
        <label className="field">
          <span>Type *</span>
          <select name="kind" className="select" value={kind} onChange={(e) => setKind(e.target.value as MethodView['kind'])}>
            <option value="crypto">Crypto wallet</option>
            <option value="paypal">PayPal</option>
            <option value="bank">Bank transfer</option>
          </select>
        </label>
        <label className="field">
          <span>Label shown to the client *</span>
          <input
            name="label"
            className="input"
            required
            defaultValue={method?.label}
            placeholder={kind === 'crypto' ? 'USDT · TRC20' : kind === 'paypal' ? 'PayPal' : 'SEPA transfer'}
          />
        </label>

        {kind === 'crypto' ? (
          <>
            <label className="field">
              <span>Network *</span>
              <select name="network" className="select" defaultValue={method?.network ?? 'TRC20'}>
                {NETWORKS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="hint">A transfer sent on the wrong network cannot be recovered.</span>
            </label>
            <label className="field">
              <span>Token / currency</span>
              <input name="currency" className="input" defaultValue={method?.currency ?? 'USDT'} placeholder="USDT" />
            </label>
          </>
        ) : (
          <label className="field">
            <span>Currency</span>
            <input name="currency" className="input" defaultValue={method?.currency ?? 'EUR'} placeholder="EUR" />
          </label>
        )}
      </div>

      <label className="field">
        <span>
          {kind === 'crypto' ? 'Wallet address' : kind === 'paypal' ? 'PayPal email' : 'IBAN / account'}
          {editing ? '' : ' *'}
        </span>
        <input
          name="address"
          className="input font-mono text-sm"
          required={!editing}
          placeholder={editing ? 'Leave blank to keep the stored value' : ''}
          autoComplete="off"
          spellCheck={false}
        />
        <span className="hint">
          Encrypted before it is written. {editing ? `Currently stored: ${method?.masked}. ` : ''}
          It is never shown again in full on this screen — only on the client&apos;s payment page.
        </span>
      </label>

      <div className="grid gap-x-5 sm:grid-cols-2">
        {kind === 'crypto' ? (
          <label className="field">
            <span>Memo / destination tag</span>
            <input name="memo" className="input" placeholder={method?.hasMemo ? 'Stored — blank keeps it' : 'Only if your exchange requires one'} autoComplete="off" />
          </label>
        ) : (
          <label className="field">
            <span>Payment link</span>
            <input name="link" className="input" defaultValue={method?.link ?? ''} placeholder="https://paypal.me/…" />
          </label>
        )}
        <label className="field">
          <span>Order</span>
          <input name="sortOrder" type="number" className="input" defaultValue={method?.sortOrder ?? 0} />
          <span className="hint">Lower numbers appear first.</span>
        </label>
      </div>

      <label className="field">
        <span>Instructions for the client</span>
        <textarea
          name="instructions"
          className="textarea"
          rows={2}
          defaultValue={method?.instructions ?? ''}
          placeholder="e.g. Send only USDT on this network. Network fees are paid by the sender."
        />
      </label>

      <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={method ? method.active : true} />
        <span>Active — offered on client payment screens</span>
      </label>

      <div className="flex flex-wrap gap-2">
        <Submit pendingLabel="Saving…">{editing ? 'Save changes' : 'Add destination'}</Submit>
        {onDone ? (
          <button type="button" className="btn btn-ghost" onClick={onDone}>Cancel</button>
        ) : null}
      </div>
    </form>
  );
}

export function PaymentMethodRow({ method }: { method: MethodView }) {
  const [toggleState, toggle] = useActionState<ActionState, FormData>(togglePaymentMethodAction, {});
  const [delState, del] = useActionState<ActionState, FormData>(deletePaymentMethodAction, {});
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (editing) {
    return (
      <div className="mt-4">
        <PaymentMethodForm method={method} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-base font-bold">{method.label}</p>
            <span className={`badge ${method.active ? 'badge-green' : 'badge-grey'}`}>
              {method.active ? 'Active' : 'Hidden'}
            </span>
            {method.unreadable ? <span className="badge badge-red">Key changed — re-enter</span> : null}
          </div>
          <p className="mt-1.5 font-mono text-xs text-steel-500">{method.masked}</p>
          <p className="mt-1 text-xs text-steel-400">
            {method.kind === 'crypto' ? `${method.currency} · ${method.network}` : `${method.kind} · ${method.currency}`}
            {method.hasMemo ? ' · memo stored' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
          <form action={toggle}>
            <input type="hidden" name="id" value={method.id} />
            <input type="hidden" name="active" value={method.active ? '0' : '1'} />
            <button type="submit" className="btn btn-ghost btn-sm">{method.active ? 'Hide' : 'Activate'}</button>
          </form>
          <button type="button" className="btn btn-ghost btn-sm text-red-700" onClick={() => setConfirming((v) => !v)}>
            Delete
          </button>
        </div>
      </div>

      {toggleState.error ? <p className="form-error mt-3">{toggleState.error}</p> : null}

      {confirming ? (
        <form action={del} className="mt-4 rounded-lg border border-red-200 bg-red-50/60 p-4">
          <Notice error={delState.error} ok={delState.ok} />
          <input type="hidden" name="id" value={method.id} />
          <p className="text-sm text-ink-900">
            Deleting removes this destination from client payment screens. Payments already recorded against it are kept.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="field mb-0">
              <span>Type DELETE to confirm</span>
              <input name="confirm" className="input" autoComplete="off" />
            </label>
            <Submit className="btn btn-dark btn-sm" pendingLabel="Deleting…">Delete permanently</Submit>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

export function ImportEnvMethods() {
  const [state, action] = useActionState<ActionState, FormData>(importEnvMethodsAction, {});
  return (
    <form action={action}>
      <Notice error={state.error} ok={state.ok} />
      <Submit className="btn btn-ghost btn-sm" pendingLabel="Importing…">Import from Worker secrets</Submit>
    </form>
  );
}

/* ───────────────── Settings ───────────────── */

export interface SettingView {
  key: string;
  label: string;
  hint: string;
  secret: boolean;
  placeholder?: string;
  value: string;
  present: boolean;
  masked: string;
  unreadable: boolean;
}

export function SettingsGroupForm({
  group,
  title,
  blurb,
  fields,
}: {
  group: string;
  title: string;
  blurb: string;
  fields: SettingView[];
}) {
  const [state, action] = useActionState<ActionState, FormData>(saveSettingsAction, {});
  return (
    <form action={action} className="panel p-6">
      <input type="hidden" name="group" value={group} />
      <h3 className="font-display text-lg font-extrabold">{title}</h3>
      <p className="mt-1 text-sm text-steel-500">{blurb}</p>
      <div className="mt-5">
        <Notice error={state.error} ok={state.ok} />
        {fields.map((f) => (
          <label key={f.key} className="field">
            <span>
              {f.label}
              {f.secret ? <span className="ml-2 badge badge-blue">Encrypted</span> : null}
              {f.unreadable ? <span className="ml-2 badge badge-red">Unreadable</span> : null}
            </span>
            {f.key === 'company_address' || f.key === 'invoice_footer' || f.key === 'vat_note' ? (
              <textarea name={f.key} className="textarea" rows={3} defaultValue={f.value} placeholder={f.placeholder} />
            ) : (
              <input
                name={f.key}
                type={f.secret ? 'password' : 'text'}
                className="input"
                defaultValue={f.secret ? '' : f.value}
                placeholder={f.secret && f.present ? `Stored: ${f.masked} — blank keeps it` : f.placeholder}
                autoComplete="off"
              />
            )}
            <span className="hint">{f.hint}</span>
          </label>
        ))}
        <Submit pendingLabel="Saving…">Save {title.toLowerCase()}</Submit>
      </div>
    </form>
  );
}

export function ClearSetting({ settingKey }: { settingKey: string }) {
  const [state, action] = useActionState<ActionState, FormData>(clearSettingAction, {});
  return (
    <form action={action} className="inline">
      <input type="hidden" name="key" value={settingKey} />
      <button type="submit" className="text-xs text-steel-400 underline hover:text-red-700">clear</button>
      {state.error ? <span className="ml-2 text-xs text-red-700">{state.error}</span> : null}
    </form>
  );
}

/* ───────────────── Leads ───────────────── */

export function LeadActions({ id, status, note }: { id: string; status: string; note: string | null }) {
  const [state, action] = useActionState<ActionState, FormData>(updateLeadAction, {});
  const [delState, del] = useActionState<ActionState, FormData>(deleteLeadAction, {});
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen((v) => !v)}>
          {open ? 'Close' : 'Update'}
        </button>
      </div>
      {open ? (
        <div className="mt-3 space-y-3">
          <form action={action} className="rounded-lg border border-[color:var(--line)] p-4">
            <Notice error={state.error} ok={state.ok} />
            <input type="hidden" name="id" value={id} />
            <label className="field">
              <span>Status</span>
              <select name="status" className="select" defaultValue={status}>
                <option value="new">New</option>
                <option value="replied">Replied</option>
                <option value="won">Won</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="field">
              <span>Internal note</span>
              <textarea name="note" className="textarea" rows={2} defaultValue={note ?? ''} placeholder="What was agreed, what to follow up" />
            </label>
            <Submit className="btn btn-dark btn-sm" pendingLabel="Saving…">Save</Submit>
          </form>
          <form action={del}>
            <Notice error={delState.error} ok={delState.ok} />
            <input type="hidden" name="id" value={id} />
            <button type="submit" className="text-xs text-steel-400 underline hover:text-red-700">
              Delete this enquiry permanently
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
