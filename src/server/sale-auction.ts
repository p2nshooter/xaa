import { data } from './data';
import { addLead } from './leads';
import { createThread } from './support';
import { getSale, usdWhole, type Sale } from './sale';
import { latestRound, myAuction, roundBids, settle, type MySaleAuction } from './sale-auction-store';
import { publicRound, roundSummary, type PublicRound, type SaleBid, type SaleBidder, type SaleRound } from './sale-auction-terms';

/**
 * The auction of xaa.es — what the pages read (docs/BLUEPRINT.md §14, request 66). Every read first brings the
 * auction up to date (settle: open the first round, close an ended one, open the next after an unsold one), the way
 * the lot auction settles on read: xaa.es has no per-minute heartbeat. A closed round is reported to the owner in
 * Leads and Support, where offers for xaa.es have always arrived.
 */

type Viewer = { id: string; email: string; role?: string } | null;

export interface SaleAuctionView { sale: Sale; round: PublicRound | null; me: MySaleAuction | null; approval: boolean }

export async function saleAuctionView(viewer: Viewer): Promise<SaleAuctionView> {
  const sale = await getSale();
  if (sale.mode !== 'auction') return { sale, round: null, me: null, approval: sale.auction.approval };
  const d = await data();
  await settleAndReport(sale);
  const round = await latestRound(d);
  const [bids, me] = await Promise.all([
    round ? roundBids(d, round.id, 10) : Promise.resolve([]),
    viewer ? myAuction(d, viewer, round) : Promise.resolve(null),
  ]);
  return { sale, round: round ? publicRound(round, bids, sale.auction) : null, me, approval: sale.auction.approval };
}

export interface SaleAuctionDesk {
  sale: Sale; round: SaleRound | null; bids: SaleBid[];
  rounds: (ReturnType<typeof roundSummary> & { id: string })[];
  bidders: { pending: SaleBidder[]; approved: SaleBidder[]; rejected: SaleBidder[] };
}

/** Studio desk → Site auction: everything the owner runs the sale with, contact details included (admin only). */
export async function saleAuctionDesk(): Promise<SaleAuctionDesk> {
  const sale = await getSale();
  if (sale.mode === 'auction') await settleAndReport(sale);
  const d = await data();
  const round = await latestRound(d);
  const [bids, rounds, pending, approved, rejected] = await Promise.all([
    round ? roundBids(d, round.id, 100) : Promise.resolve([]),
    d.saleRounds.list('all', 'all', { limit: 50 }).then((p) => p.entries.map((e) => ({ ...(e.meta as ReturnType<typeof roundSummary>), id: e.id }))),
    d.saleBidders.listDocs('status', 'pending', { limit: 200 }).then((p) => p.docs),
    d.saleBidders.listDocs('status', 'approved', { limit: 200 }).then((p) => p.docs),
    d.saleBidders.listDocs('status', 'rejected', { limit: 50 }).then((p) => p.docs),
  ]);
  return { sale, round, bids, rounds, bidders: { pending, approved, rejected } };
}

/** Settle, and tell the owner when a round has just closed with a winner. */
export async function settleAndReport(sale?: Sale): Promise<void> {
  const s = sale || (await getSale());
  const out = await settle(await data(), s).catch((err) => { console.error('sale auction settle failed:', err); return {}; });
  const r = 'closed' in out ? out.closed : undefined;
  if (r?.status === 'awaiting_payment') {
    await tellOwner({
      name: r.winner_name, email: r.winner_email, budget: usdWhole(r.winner_usd), packageSlug: 'site-auction-won',
      message: `[xaa.es auction] Round ${r.no} ended with ${r.bids_count} bids. Winner: ${r.winner_name} (${r.winner_email}) at ${usdWhole(r.winner_usd)}. ` +
        `Asked to close by ${r.pay_by.slice(0, 10)}: NDA, proof of funds, then SWIFT wire or escrow. Mark it sold in Studio desk → Site auction once the funds arrive.`,
      thread: true,
    });
  }
}

/** A note for the owner in Leads (and, for a person to answer, in Support). A failure never blocks the auction. */
export async function tellOwner(input: { name: string; email: string; company?: string; budget?: string; packageSlug: string; message: string; thread?: boolean; lang?: string }): Promise<void> {
  try {
    await addLead({ name: input.name.slice(0, 120) || 'Bidder', email: input.email, company: input.company || null, budget: input.budget || null, packageSlug: input.packageSlug, message: input.message.slice(0, 5000) });
  } catch (err) {
    console.error('sale auction lead failed:', err);
  }
  if (!input.thread || !input.email) return;
  try {
    await createThread({ name: input.name || 'Bidder', email: input.email, topic: 'negotiate', lang: input.lang || 'en', source: 'contact', firstMessage: input.message });
  } catch (err) {
    console.error('sale auction support thread failed (lead kept):', err);
  }
}
