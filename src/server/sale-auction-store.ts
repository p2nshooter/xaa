/**
 * The auction of xaa.es — storage (docs/BLUEPRINT.md §14; the rules are in sale-auction-terms.ts).
 *
 *   round    "sr_<no>", created once with a claim nonce; it records the ladder's opening bid of the day; one at a time
 *   bidder   registers; the owner approves unless approval is off
 *   bid      one compare-and-swap on the round (validated again on every retry), then the bid created once
 *   settle   run whenever the auction is read: an ended round closes — to "awaiting_payment" by the top bidder, or
 *            "unsold" and (by default) the next round opens at once; the first round opens by itself
 *   sold     the admin marks a won round sold once the funds have arrived (wire or escrow)
 *
 * Everything lives in R2 (sale_rounds, sale_bids, sale_bidders); nothing in D1 or KV. Pure of the server context
 * (it takes the collections), so the unit tests run it on the in-memory R2.
 */
import type { Collection } from './r2/store.ts';
import {
  bidId, cleanDisplayName, displayNameProblem, extendedEnd, ladderPrice, nextMinBid, parseBid, payBy, roundEnd, roundId, saleBidProblem,
  type NameProblem, type SaleAuctionSettings, type SaleBid, type SaleBidder, type SaleBidProblem, type SaleRound,
} from './sale-auction-terms.ts';

export interface SaleData { saleRounds: Collection<SaleRound>; saleBids: Collection<SaleBid>; saleBidders: Collection<SaleBidder> }
export interface SaleState { mode: 'auction' | 'fixed'; status: 'open' | 'paused' | 'sold'; auction: SaleAuctionSettings }
type Actor = { id: string; email: string; role?: string };

const iso = (ms: number) => new Date(ms).toISOString();
const clean = (v: unknown, max: number) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

/** The newest round (the one that runs, or ran last). */
export async function latestRound(d: SaleData): Promise<SaleRound | null> {
  const page = await d.saleRounds.list('all', 'all', { limit: 1 });
  return page.entries[0] ? d.saleRounds.get(page.entries[0].id) : null;
}

/** Open the next round. Two callers racing for the same number make one round; the loser gets null. */
export async function startRound(d: SaleData, s: SaleAuctionSettings, by: string, nowMs = Date.now()): Promise<SaleRound | null> {
  const last = await latestRound(d);
  if (last && (last.status === 'open' || last.status === 'awaiting_payment')) return null;
  const no = (last?.no || 0) + 1;
  // For the record: the opening bid when the round opened. The bids themselves follow the ladder of the moment.
  const open = ladderPrice(s, nowMs);
  const at = iso(nowMs);
  const doc: SaleRound = {
    id: roundId(no), no, status: 'open', open_usd: open, step_usd: s.stepUsd, snipe_minutes: s.snipeMinutes, pay_days: s.payDays,
    starts_at: at, ends_at: iso(roundEnd(nowMs, s)), bids_count: 0, high_usd: 0, high_seq: 0, high_user: '', high_name: '',
    winner_user: '', winner_email: '', winner_name: '', winner_usd: 0, pay_by: '', passed: [], closed_at: '', sold_at: '', note: '',
    claim: crypto.randomUUID(), created_by: by, created_at: at, updated_at: at,
  };
  return (await d.saleRounds.createIfAbsent(doc)) ? doc : null;
}

/** Close the running round when its time is up. Compare-and-swap, once. */
export async function closeDueRound(d: SaleData, nowMs = Date.now()): Promise<SaleRound | null> {
  const cur = await latestRound(d);
  if (!cur || cur.status !== 'open' || Date.parse(cur.ends_at) > nowMs) return null;
  const top = cur.bids_count ? await d.saleBids.get(bidId(cur.id, cur.high_seq)) : null;
  let changed = false as boolean;
  const after = await d.saleRounds.update(cur.id, (r) => {
    changed = false;
    // A bid that landed after `top` was read: leave it to the next read.
    if (r.status !== 'open' || Date.parse(r.ends_at) > nowMs || r.high_seq !== cur.high_seq) return null;
    changed = true;
    const at = iso(nowMs);
    if (!r.bids_count) return { ...r, status: 'unsold', closed_at: at, updated_at: at };
    return { ...r, status: 'awaiting_payment', closed_at: at, winner_user: r.high_user, winner_email: top?.email || '', winner_name: r.high_name, winner_usd: r.high_usd, pay_by: payBy(nowMs, r.pay_days), updated_at: at };
  });
  return changed ? after : null;
}

/** Bring the auction up to date (called on every read): open the first round, close an ended one, open the next after an unsold one. */
export async function settle(d: SaleData, sale: SaleState, nowMs = Date.now()): Promise<{ closed?: SaleRound; opened?: SaleRound }> {
  if (sale.mode !== 'auction' || sale.status !== 'open') return {};
  const out: { closed?: SaleRound; opened?: SaleRound } = {};
  let cur = await latestRound(d);
  if (cur?.status === 'open') {
    const closed = await closeDueRound(d, nowMs);
    if (closed) { out.closed = closed; cur = closed; }
  }
  if (!cur || (cur.status === 'unsold' && sale.auction.autoRestart)) {
    const r = await startRound(d, sale.auction, 'system', nowMs);
    if (r) out.opened = r;
  }
  return out;
}

/* ---- bidders ------------------------------------------------------------------------ */

export interface BidderInput { displayName?: unknown; company?: unknown; country?: unknown; phone?: unknown; funds?: unknown; message?: unknown }
export type BidderProblem = NameProblem | 'phone' | 'country';

/** Register (or update) a member as a bidder. A decision stays: an approved bidder stays approved, a refused one refused. */
export async function registerBidder(d: SaleData, user: Actor, input: BidderInput, approval: boolean, nowMs = Date.now()): Promise<{ ok: true; bidder: SaleBidder; isNew: boolean } | { error: BidderProblem }> {
  const nameProblem = displayNameProblem(input.displayName);
  if (nameProblem) return { error: nameProblem };
  const phone = clean(input.phone, 40);
  if (!/^\+?[\d\s()-]{6,40}$/.test(phone)) return { error: 'phone' };
  const country = clean(input.country, 60);
  if (country.length < 2) return { error: 'country' };
  let isNew = false;
  const at = iso(nowMs);
  const doc = await d.saleBidders.upsert(user.id, (cur) => {
    isNew = !cur;
    const status = cur?.status === 'approved' || cur?.status === 'rejected' ? cur.status : approval ? 'pending' : 'approved';
    return {
      id: user.id, email: user.email, display_name: cleanDisplayName(input.displayName), company: clean(input.company, 160), country, phone,
      funds: clean(input.funds, 300), message: clean(input.message, 1000), status,
      decided_by: cur?.decided_by || (status === 'approved' && !approval ? 'auto' : ''), decided_at: cur?.decided_at || (status === 'approved' && !approval ? at : ''),
      created_at: cur?.created_at || at, updated_at: at,
    };
  });
  return { ok: true, bidder: doc!, isNew };
}

export async function decideBidder(d: SaleData, id: string, approve: boolean, by: string, nowMs = Date.now()): Promise<SaleBidder | { error: string }> {
  if (!(await d.saleBidders.get(id))) return { error: 'Bidder not found.' };
  return d.saleBidders.update(id, (b) => ({ ...b, status: approve ? 'approved' : 'rejected', decided_by: by, decided_at: iso(nowMs), updated_at: iso(nowMs) }));
}

/* ---- bidding ------------------------------------------------------------------------- */

export type SaleBidError = SaleBidProblem | 'not_found' | 'not_registered' | 'pending' | 'rejected' | 'admin' | 'sale_closed';
export type SaleBidResult = { ok: true; round: SaleRound; bid: SaleBid; extended: boolean; outbid: { user: string; usd: number } | null } | { error: SaleBidError };

export async function placeSaleBid(d: SaleData, user: Actor, amountIn: unknown, sale: SaleState, nowMs = Date.now()): Promise<SaleBidResult> {
  if (user.role === 'admin') return { error: 'admin' };
  if (sale.mode !== 'auction' || sale.status !== 'open') return { error: 'sale_closed' };
  const bidder = await d.saleBidders.get(user.id);
  if (!bidder) return { error: 'not_registered' };
  if (bidder.status === 'pending') return { error: 'pending' };
  if (bidder.status !== 'approved') return { error: 'rejected' };
  const amount = parseBid(amountIn);
  const cur = await latestRound(d);
  if (!cur) return { error: 'not_found' };
  let problem = null as SaleBidProblem | null;
  let seq = 0, extended = false as boolean, prev = { user: '', usd: 0 };
  const after = await d.saleRounds.update(cur.id, (r) => {
    // Decided again on every compare-and-swap attempt: a bid that lost a race is checked against the new high bid.
    problem = saleBidProblem(r, amount, user.id, nowMs, ladderPrice(sale.auction, nowMs));
    if (problem) return null;
    seq = r.bids_count + 1;
    prev = { user: r.high_user, usd: r.high_usd };
    const ends = extendedEnd(r.ends_at, nowMs, r.snipe_minutes);
    extended = ends !== r.ends_at;
    return { ...r, bids_count: seq, high_usd: amount, high_seq: seq, high_user: user.id, high_name: bidder.display_name, ends_at: ends, updated_at: iso(nowMs) };
  });
  if (problem) return { error: problem };
  const bid: SaleBid = { id: bidId(after.id, seq), round_id: after.id, seq, user_id: user.id, email: user.email, display_name: bidder.display_name, company: bidder.company, amount_usd: amount, created_at: iso(nowMs) };
  await d.saleBids.createIfAbsent(bid);
  return { ok: true, round: after, bid, extended, outbid: prev.user && prev.user !== user.id ? prev : null };
}

/** A round's bids, highest first. */
export const roundBids = (d: SaleData, id: string, limit = 50) => d.saleBids.listDocs('round', id, { limit }).then((p) => p.docs);

/* ---- after the close ------------------------------------------------------------------- */

/** Admin: give an unpaid win to the next bidder (a different member, at their own highest bid), or end the round unsold. */
export async function passRound(d: SaleData, id: string, nowMs = Date.now()): Promise<SaleRound | { error: string }> {
  const cur = await d.saleRounds.get(id);
  if (!cur || cur.status !== 'awaiting_payment') return { error: 'Only a round awaiting the winner can be passed on.' };
  const skip = new Set([...cur.passed, cur.winner_user]);
  const next = (await roundBids(d, id, 500)).find((b) => !skip.has(b.user_id)) || null;
  let changed = false as boolean;
  const after = await d.saleRounds.update(id, (r) => {
    changed = false;
    if (r.status !== 'awaiting_payment' || r.winner_user !== cur.winner_user) return null;
    changed = true;
    const at = iso(nowMs), passed = [...r.passed, r.winner_user];
    if (!next) return { ...r, status: 'unsold', passed, updated_at: at };
    return { ...r, passed, winner_user: next.user_id, winner_email: next.email, winner_name: next.display_name, winner_usd: next.amount_usd, pay_by: payBy(nowMs, r.pay_days), updated_at: at };
  });
  return changed ? after : { error: 'The round changed meanwhile — reload and try again.' };
}

export async function cancelRound(d: SaleData, id: string, note: string, nowMs = Date.now()): Promise<SaleRound | { error: string }> {
  const cur = await d.saleRounds.get(id);
  if (!cur) return { error: 'Round not found.' };
  if (cur.status === 'sold') return { error: 'A sold round cannot be cancelled.' };
  return d.saleRounds.update(id, (r) => (r.status === 'sold' || r.status === 'cancelled' ? null : { ...r, status: 'cancelled', note: note.slice(0, 500), closed_at: r.closed_at || iso(nowMs), updated_at: iso(nowMs) }));
}

/** Admin: the funds have arrived (wire or escrow) — the won round is sold. */
export async function markRoundSold(d: SaleData, id: string, note: string, nowMs = Date.now()): Promise<SaleRound | { error: string }> {
  const cur = await d.saleRounds.get(id);
  if (!cur || cur.status !== 'awaiting_payment') return { error: 'Only a won round awaiting payment can be marked sold.' };
  return d.saleRounds.update(id, (r) => (r.status !== 'awaiting_payment' ? null : { ...r, status: 'sold', sold_at: iso(nowMs), note: note.slice(0, 500), updated_at: iso(nowMs) }));
}

/* ---- the member's side ------------------------------------------------------------------- */

export interface MySaleAuction {
  bidder: { status: string; displayName: string } | null;
  admin: boolean; leading: boolean; myBestUsd: number; winner: boolean; payBy: string; amountUsd: number;
}
export async function myAuction(d: SaleData, user: Actor, r: SaleRound | null): Promise<MySaleAuction> {
  const [bidder, mine] = await Promise.all([
    d.saleBidders.get(user.id),
    r ? d.saleBids.listDocs('user', user.id, { limit: 50 }).then((p) => p.docs.filter((b) => b.round_id === r.id)) : Promise.resolve([] as SaleBid[]),
  ]);
  const winner = !!r && (r.status === 'awaiting_payment' || r.status === 'sold') && r.winner_user === user.id;
  return {
    bidder: bidder ? { status: bidder.status, displayName: bidder.display_name } : null,
    admin: user.role === 'admin', leading: !!r && r.status === 'open' && r.bids_count > 0 && r.high_user === user.id,
    myBestUsd: mine.reduce((m, b) => Math.max(m, b.amount_usd), 0), winner, payBy: winner ? r!.pay_by : '', amountUsd: winner ? r!.winner_usd : 0,
  };
}

export { nextMinBid };
