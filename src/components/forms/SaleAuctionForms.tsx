'use client';

import { useActionState } from 'react';
import type { ActionState } from '@/server/actions';
import { saleAuctionAdminAction } from '@/server/sale-auction-actions';
import { Submit, Notice } from './Submit';

/**
 * Studio desk → Site auction (docs/BLUEPRINT.md §14): start a round, cancel, pass on, mark sold, approve bidders.
 * Each form stays mounted where it is even when its button no longer applies (`show`), so the result of what the
 * owner just did stays on screen after the page refreshes.
 */

export function SaleStartForm({ openUsd, show }: { openUsd: number; show: boolean }) {
  const [state, act] = useActionState<ActionState, FormData>(saleAuctionAdminAction, {});
  return (
    <div data-testid="sale-start">
      {show ? (
        <form action={act} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="action" value="start" />
          <p className="min-w-0 flex-1 text-sm text-steel-500">A new round opens at today’s opening bid of the weekly ladder, <b>${openUsd.toLocaleString('en-US')}</b> (Settings → Sale of xaa.es).</p>
          <Submit className="btn btn-primary" pendingLabel="Opening…">Open a new round</Submit>
        </form>
      ) : null}
      {/* The round just opened (form hidden), or why it could not open (form still there). */}
      <div className="mt-3"><Notice error={show ? state.error : undefined} ok={show ? undefined : state.ok} /></div>
    </div>
  );
}

export function SaleRoundButton({ id, action, label, show, confirm, note }: { id: string; action: 'cancel' | 'pass' | 'sold'; label: string; show: boolean; confirm?: string; note?: string }) {
  const [state, act] = useActionState<ActionState, FormData>(saleAuctionAdminAction, {});
  if (!show && !state.ok && !state.error) return null;
  return (
    <div className="inline-flex flex-col gap-2" data-testid={`sale-${action}`}>
      {show ? (
        <form action={act} className="inline-flex flex-col gap-2" onSubmit={(e) => { if (confirm && !window.confirm(confirm)) e.preventDefault(); }}>
          <input type="hidden" name="action" value={action} />
          <input type="hidden" name="id" value={id} />
          {note ? <input name="note" className="input" placeholder={note} /> : null}
          <Submit className={action === 'sold' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'} pendingLabel="…">{label}</Submit>
        </form>
      ) : null}
      <Notice error={state.error} ok={state.ok} />
    </div>
  );
}

export function SaleBidderButtons({ id, status }: { id: string; status: 'pending' | 'approved' | 'rejected' }) {
  const [state, act] = useActionState<ActionState, FormData>(saleAuctionAdminAction, {});
  return (
    <form action={act} className="inline-flex flex-wrap items-center gap-2" data-testid={`bidder-${id}`}>
      <input type="hidden" name="id" value={id} />
      {status !== 'approved' ? <button type="submit" name="action" value="approve" className="btn btn-primary btn-sm">Approve</button> : null}
      {status !== 'rejected' ? <button type="submit" name="action" value="reject" className="btn btn-ghost btn-sm">Reject</button> : null}
      <Notice error={state.error} ok={state.ok} />
    </form>
  );
}
