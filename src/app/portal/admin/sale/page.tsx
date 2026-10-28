import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { portalReady } from '@/server/db';
import { countNewLeads } from '@/server/leads';
import { AdminNav } from '@/components/AdminNav';
import { DbNotice } from '@/components/DbNotice';
import { soft, type Problems } from '@/server/soft';
import { getSale, usdWhole } from '@/server/sale';
import { saleAuctionDesk, type SaleAuctionDesk } from '@/server/sale-auction';
import { ladderPrice, ladderStart, nextMinBid, nextRiseAt, type SaleBidder } from '@/server/sale-auction-terms';
import { SaleBidderButtons, SaleRoundButton, SaleStartForm } from '@/components/forms/SaleAuctionForms';

export const metadata: Metadata = { title: 'Site auction', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const STATUS_BADGE: Record<string, string> = { open: 'badge-blue', awaiting_payment: 'badge-amber', sold: 'badge-green', unsold: 'badge-grey', cancelled: 'badge-grey' };
const when = (iso: string) => (iso ? iso.slice(0, 16).replace('T', ' ') : '—');

/**
 * Studio desk → Site auction (docs/BLUEPRINT.md §14, request 66): the auction of xaa.es itself. The running round,
 * its bids with the bidders' contact details, passing an unpaid win to the next bidder, marking the round sold once
 * the funds arrive, starting a round, approving bidders and the earlier rounds. The settings (the weekly ladder,
 * raise, length, anti-snipe, approval) are in Settings → Sale of xaa.es.
 */
export default async function SaleAuctionDeskPage() {
  if (!(await portalReady())) redirect('/portal');
  const user = await currentUser();
  if (!user) redirect('/login?next=/portal/admin/sale');
  if (user.role !== 'admin') redirect('/portal');

  const problems: Problems = [];
  const empty: SaleAuctionDesk = { sale: await getSale(), round: null, bids: [], rounds: [], bidders: { pending: [], approved: [], rejected: [] } };
  const [desk, newLeads] = await Promise.all([soft(problems, () => saleAuctionDesk(), empty), soft(problems, () => countNewLeads(), 0)]);
  const { sale, round: r, bids, rounds, bidders } = desk;
  const a = sale.auction;
  const running = r && (r.status === 'open' || r.status === 'awaiting_payment');
  const floor = ladderPrice(a);
  const rise = nextRiseAt(a);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="eyebrow">Studio desk</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">Site auction — xaa.es</h1>
      <p className="mt-2 text-sm text-steel-500">
        Mode <b>{sale.mode}</b> · sale <b>{sale.status}</b> · opening bid now <b data-testid="desk-floor">{usdWhole(floor)}</b> ({usdWhole(a.startUsd)} from {when(new Date(ladderStart(a)).toISOString())} UTC, +{usdWhole(a.weeklyUsd)} a week{rise ? `, next rise ${when(rise)} UTC` : ''}) · raise {usdWhole(a.stepUsd)} · {a.days} days ·
        anti-snipe {a.snipeMinutes} min · close within {a.payDays} days · {a.approval ? 'bidders approved by you' : 'any member may bid'} · {a.autoRestart ? 'new round after an unsold one' : 'no automatic new round'}.{' '}
        <Link href="/portal/admin/settings" className="underline">Settings → Sale of xaa.es</Link> · <Link href="/acquire#bid" className="underline">Public page</Link>
      </p>
      <div className="mt-8"><AdminNav current="/portal/admin/sale" newLeads={newLeads} /></div>
      <DbNotice problems={problems} />

      {sale.mode !== 'auction' ? (
        <p className="panel p-5 text-sm">xaa.es is sold at a fixed asking price ({usdWhole(sale.priceUsd)}) right now. Switch “How xaa.es is sold” to Auction in Settings to run rounds here.</p>
      ) : null}

      <section className="panel p-5" data-testid="sale-round">
        <h2 className="font-display text-xl font-extrabold">{r ? `Round ${r.no}` : 'No round yet'}</h2>
        {r ? (
          <>
            <p className="mt-2 text-sm">
              <span className={`badge ${STATUS_BADGE[r.status]}`}>{r.status.replace('_', ' ')}</span>{' '}
              opened at <b>{usdWhole(r.open_usd)}</b> · +{usdWhole(r.step_usd)} · {r.bids_count} bid(s){r.bids_count ? <> · high <b>{usdWhole(r.high_usd)}</b> by {r.high_name}</> : null} · {when(r.starts_at)} → {when(r.ends_at)} UTC
              {r.status === 'open' ? <> · next bid from {usdWhole(nextMinBid(r, floor))}</> : null}
            </p>
            {r.winner_user ? (
              <p className="mt-2 text-sm">
                Winner <b>{r.winner_name}</b> ({r.winner_email}) at <b>{usdWhole(r.winner_usd)}</b>{r.pay_by ? ` · to close by ${r.pay_by.slice(0, 10)}` : ''}{r.sold_at ? ` · sold ${when(r.sold_at)}` : ''}
                {r.passed.length ? ` · passed over: ${r.passed.length}` : ''}
              </p>
            ) : null}
            {r.note ? <p className="mt-1 text-xs text-steel-500">Note: {r.note}</p> : null}
            {/* Keyed by round: a new round starts with clean buttons; within a round, the last result stays shown. */}
            <div key={r.id} className="mt-4 flex flex-wrap items-start gap-3">
              <SaleRoundButton id={r.id} action="sold" show={r.status === 'awaiting_payment'} label="Mark sold (funds received)" note="Wire / escrow reference" confirm={`Mark round ${r.no} sold to ${r.winner_name} at ${usdWhole(r.winner_usd)}? The sale of xaa.es is then closed.`} />
              <SaleRoundButton id={r.id} action="pass" show={r.status === 'awaiting_payment'} label="Pass to the next bidder" confirm={`${r.winner_name} has not closed: pass round ${r.no} to the next highest bidder?`} />
              <SaleRoundButton id={r.id} action="cancel" show={!!running} label="Cancel the round" note="Reason (kept on the round)" confirm={`Cancel round ${r.no}? Its bids stay on record; no one wins.`} />
            </div>
          </>
        ) : <p className="mt-2 text-sm text-steel-500">The first round opens by itself the first time /acquire is opened in auction mode, or open one below.</p>}
        <div className="mt-5 border-t border-[color:var(--line)] pt-5">
          <SaleStartForm openUsd={floor} show={sale.mode === 'auction' && sale.status === 'open' && !running} />
        </div>
      </section>

      <section className="mt-10" data-testid="sale-desk-bids">
        <h2 className="font-display text-xl font-extrabold">Bids{r ? ` — round ${r.no}` : ''} ({bids.length})</h2>
        {bids.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-steel-500"><tr><th className="py-2">Amount</th><th>Bidder</th><th>Company</th><th>Email</th><th>When (UTC)</th></tr></thead>
              <tbody className="divide-y divide-[color:var(--line)]">
                {bids.map((b, i) => (
                  <tr key={b.id}><td className="py-2 font-semibold">{usdWhole(b.amount_usd)}{i === 0 ? ' ♛' : ''}</td><td>{b.display_name}</td><td>{b.company || '—'}</td><td className="font-mono text-xs">{b.email}</td><td>{when(b.created_at)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="mt-2 text-sm text-steel-500">No bids yet.</p>}
      </section>

      <section className="mt-10" data-testid="sale-desk-bidders">
        <h2 className="font-display text-xl font-extrabold">Bidders</h2>
        <p className="mt-1 text-sm text-steel-500">{bidders.pending.length} waiting · {bidders.approved.length} approved · {bidders.rejected.length} refused. Contact details are seen only here; the public board shows masked names.</p>
        {/* One keyed list, waiting first: a bidder who is approved moves up the list with their result still shown. */}
        <BidderList list={[...bidders.pending, ...bidders.approved, ...bidders.rejected]} />
      </section>

      <section className="mt-10" data-testid="sale-desk-rounds">
        <h2 className="font-display text-xl font-extrabold">Rounds ({rounds.length})</h2>
        {rounds.length ? (
          <ul className="mt-4 space-y-2">
            {rounds.map((x) => (
              <li key={x.id} className="panel flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                <span><b>Round {x.no}</b> <span className={`badge ${STATUS_BADGE[x.status]}`}>{x.status.replace('_', ' ')}</span> · opened at {usdWhole(x.open_usd)} · {x.bids_count} bid(s){x.bids_count ? ` · high ${usdWhole(x.high_usd)}` : ''}{x.winner_usd ? ` · won at ${usdWhole(x.winner_usd)}` : ''}</span>
                <span className="text-xs text-steel-500">{when(x.starts_at)} → {when(x.closed_at || x.ends_at)} UTC</span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-steel-500">No rounds yet.</p>}
      </section>
    </div>
  );
}

const BIDDER_BADGE: Record<string, [string, string]> = { pending: ['badge-amber', 'waiting'], approved: ['badge-green', 'approved'], rejected: ['badge-grey', 'refused'] };

function BidderList({ list }: { list: SaleBidder[] }) {
  if (!list.length) return <p className="mt-3 text-sm text-steel-500">No bidder has registered yet.</p>;
  return (
    <div className="mt-5">
      <ul className="space-y-2">
        {list.map((b) => (
          <li key={b.id} className="panel p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span><span className={`badge ${BIDDER_BADGE[b.status]![0]}`}>{BIDDER_BADGE[b.status]![1]}</span> <b>{b.display_name}</b>{b.company ? ` · ${b.company}` : ''} · {b.country} · <span className="font-mono text-xs">{b.email}</span> · {b.phone}</span>
              <SaleBidderButtons id={b.id} status={b.status} />
            </div>
            {b.funds || b.message ? <p className="mt-2 text-xs text-steel-500">{b.funds ? `Funds: ${b.funds}` : ''}{b.funds && b.message ? ' · ' : ''}{b.message ? `Message: ${b.message}` : ''}</p> : null}
            <p className="mt-1 text-xs text-steel-500">Registered {when(b.created_at)} UTC{b.decided_at ? ` · ${b.status} by ${b.decided_by} ${when(b.decided_at)}` : ''}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
