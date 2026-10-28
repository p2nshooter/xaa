/**
 * The auction of xaa.es itself — the rules (docs/BLUEPRINT.md §14, request 66; owner, 28 Oct 2026, with axto.io:
 * "minimal penawaran range random dari $10jt-$100jt, ubah bentuk penjualannya seperti lelang … segera ambil").
 *
 *   opening bid  drawn at random between US$10 million and US$100 million (to the nearest US$100,000) when a round
 *                opens, or set by the admin in that range; stored on the round, so every visitor sees the same figure
 *   bids         the first at least the opening bid, every later one at least the high bid plus one step; jump bids
 *                allowed; never against yourself
 *   anti-snipe   a bid in the last N minutes moves the end to N minutes after it
 *   no reserve   the highest valid bid at the deadline wins; the winner closes by agreement, proof of funds and a
 *                SWIFT wire or escrow (xaa.es is never sold through a card checkout), then the admin marks it sold
 *
 * Not the lot auction (auction-terms.ts): that one sells websites, scripts and domains in euros, every bid exactly
 * +5 % of the opening bid up to the lot's price. This one sells the whole of xaa.es in US dollars with open bids.
 * Pure (no storage); sale-auction-store.ts keeps rounds, bids and bidders in R2.
 */
import { cleanDisplayName, displayNameProblem, extendedEnd, maskName, type NameProblem } from './auction-terms.ts';

export { cleanDisplayName, displayNameProblem, extendedEnd, maskName, type NameProblem };

export const OPEN_MIN_USD = 10_000_000;
export const OPEN_MAX_USD = 100_000_000;
export const OPEN_ROUND_TO = 100_000;
/** A sanity ceiling on one bid: a typo with three extra zeros is refused, not recorded. */
export const MAX_BID_USD = 5_000_000_000;
const DAY = 86_400_000;

export interface SaleAuctionSettings {
  /** Draw a new random opening bid between US$10M and US$100M for every round. */
  randomOpen: boolean;
  /** The admin's own opening bid (used when randomOpen is off). */
  openUsd: number;
  stepUsd: number;
  days: number;
  snipeMinutes: number;
  payDays: number;
  /** A round that ends without a bid is followed by a new one at once. */
  autoRestart: boolean;
  /** The owner approves each bidder before they can bid. */
  approval: boolean;
}

export const SALE_AUCTION_DEFAULTS: SaleAuctionSettings = {
  randomOpen: true, openUsd: 0, stepUsd: 250_000, days: 14, snipeMinutes: 10, payDays: 7, autoRestart: true, approval: true,
};

const digits = (v: unknown) => Number(String(v ?? '').replace(/[^\d]/g, ''));
const within = (v: unknown, lo: number, hi: number, fallback: number) => {
  const n = digits(v);
  return String(v ?? '').trim() !== '' && Number.isFinite(n) && n >= lo && n <= hi ? n : fallback;
};
const yes = (v: unknown, fallback: boolean) => (v === 'yes' ? true : v === 'no' ? false : fallback);
const roundOpen = (n: number) => Math.min(OPEN_MAX_USD, Math.max(OPEN_MIN_USD, Math.round(n / OPEN_ROUND_TO) * OPEN_ROUND_TO));

/** The auction settings from the stored strings (Settings → Sale of xaa.es); anything unusable falls back to the default. */
export function parseSaleAuction(raw: Record<string, string>): SaleAuctionSettings {
  const d = SALE_AUCTION_DEFAULTS;
  const open = digits(raw.sale_auction_open_usd);
  return {
    randomOpen: yes(raw.sale_auction_random, d.randomOpen),
    openUsd: open >= OPEN_MIN_USD && open <= OPEN_MAX_USD ? roundOpen(open) : 0,
    stepUsd: within(raw.sale_auction_step_usd, 1_000, 10_000_000, d.stepUsd),
    days: within(raw.sale_auction_days, 1, 90, d.days),
    snipeMinutes: within(raw.sale_auction_snipe_minutes, 0, 120, d.snipeMinutes),
    payDays: within(raw.sale_auction_pay_days, 1, 60, d.payDays),
    autoRestart: yes(raw.sale_auction_restart, d.autoRestart),
    approval: yes(raw.sale_auction_approval, d.approval),
  };
}

/** A random opening bid in the owner's range, to the nearest US$100,000. */
export const randomOpening = (rand: () => number = Math.random) => roundOpen(OPEN_MIN_USD + rand() * (OPEN_MAX_USD - OPEN_MIN_USD));
/** The opening bid of a new round: drawn, or the admin's own figure. */
export const openingFor = (s: SaleAuctionSettings, rand: () => number = Math.random) => (s.randomOpen || !s.openUsd ? randomOpening(rand) : roundOpen(s.openUsd));
export const roundEnd = (startMs: number, s: Pick<SaleAuctionSettings, 'days'>) => startMs + s.days * DAY;
export const payBy = (closedMs: number, payDays: number) => new Date(closedMs + payDays * DAY).toISOString();

/* ---- documents ---------------------------------------------------------------- */

export type SaleRoundStatus = 'open' | 'awaiting_payment' | 'sold' | 'unsold' | 'cancelled';
/** One round. Every bid is a compare-and-swap on it; the next round's id "sr_<no>" is created once (claim nonce). */
export interface SaleRound {
  id: string; no: number; status: SaleRoundStatus; open_usd: number; step_usd: number; snipe_minutes: number; pay_days: number;
  starts_at: string; ends_at: string; bids_count: number; high_usd: number; high_seq: number; high_user: string; high_name: string;
  winner_user: string; winner_email: string; winner_name: string; winner_usd: number; pay_by: string; passed: string[];
  closed_at: string; sold_at: string; note: string; claim: string; created_by: string; created_at: string; updated_at: string;
}
/** One bid, created once under "<round>.<seq>" — never changed. */
export interface SaleBid { id: string; round_id: string; seq: number; user_id: string; email: string; display_name: string; company: string; amount_usd: number; created_at: string }
export type SaleBidderStatus = 'pending' | 'approved' | 'rejected';
/** A member registered to bid for xaa.es (id = user id). */
export interface SaleBidder {
  id: string; email: string; display_name: string; company: string; country: string; phone: string; funds: string; message: string;
  status: SaleBidderStatus; decided_by: string; decided_at: string; created_at: string; updated_at: string;
}
export const roundSummary = (r: SaleRound) => ({
  no: r.no, status: r.status, open_usd: r.open_usd, starts_at: r.starts_at, ends_at: r.ends_at, bids_count: r.bids_count,
  high_usd: r.high_usd, winner_usd: r.winner_usd, closed_at: r.closed_at, sold_at: r.sold_at,
});
export const roundId = (no: number) => `sr_${String(no).padStart(4, '0')}`;
export const bidId = (round: string, seq: number) => `${round}.${String(seq).padStart(6, '0')}`;

/* ---- bidding ---------------------------------------------------------------------- */

export type RoundState = Pick<SaleRound, 'status' | 'starts_at' | 'ends_at' | 'open_usd' | 'step_usd' | 'bids_count' | 'high_usd' | 'high_user'>;
/** The lowest bid accepted now. */
export const nextMinBid = (r: Pick<RoundState, 'bids_count' | 'high_usd' | 'open_usd' | 'step_usd'>) => (r.bids_count > 0 ? r.high_usd + r.step_usd : r.open_usd);

export type SaleBidProblem = 'closed' | 'not_started' | 'ended' | 'bad_amount' | 'too_low' | 'too_high' | 'already_highest';

/** Why a bid cannot be placed (null = it can). Decided again on every compare-and-swap attempt. */
export function saleBidProblem(r: RoundState, amount: number, userId: string, nowMs: number): SaleBidProblem | null {
  if (r.status !== 'open') return 'closed';
  if (nowMs < Date.parse(r.starts_at)) return 'not_started';
  if (nowMs >= Date.parse(r.ends_at)) return 'ended';
  if (!Number.isInteger(amount) || amount < 1) return 'bad_amount';
  if (r.bids_count > 0 && r.high_user === userId) return 'already_highest';
  if (amount > MAX_BID_USD) return 'too_high';
  if (amount < nextMinBid(r)) return 'too_low';
  return null;
}

/** Whole US dollars as typed ("42,250,000", "$ 42 250 000"); anything else is NaN. */
export const parseBid = (v: unknown) => {
  const s = String(v ?? '').replace(/[\s,$_.]/g, '');
  return /^\d{1,13}$/.test(s) ? Number(s) : NaN;
};

/* ---- what people see -------------------------------------------------------------- */

export interface PublicRound {
  no: number; status: SaleRoundStatus; openUsd: number; stepUsd: number; startsAt: string; endsAt: string; snipeMinutes: number; payDays: number;
  bidsCount: number; highUsd: number; nextMinUsd: number; leader: string; winnerName: string; winnerUsd: number;
  bids: { name: string; amountUsd: number; at: string }[];
}
/** The round as everyone sees it: no e-mail, no user id; names masked. */
export function publicRound(r: SaleRound, bids: SaleBid[]): PublicRound {
  const won = r.status === 'awaiting_payment' || r.status === 'sold';
  return {
    no: r.no, status: r.status, openUsd: r.open_usd, stepUsd: r.step_usd, startsAt: r.starts_at, endsAt: r.ends_at, snipeMinutes: r.snipe_minutes,
    payDays: r.pay_days, bidsCount: r.bids_count, highUsd: r.high_usd, nextMinUsd: nextMinBid(r), leader: r.bids_count ? maskName(r.high_name) : '',
    winnerName: won ? maskName(r.winner_name) : '', winnerUsd: won ? r.winner_usd : 0,
    bids: bids.map((b) => ({ name: maskName(b.display_name), amountUsd: b.amount_usd, at: b.created_at })),
  };
}
