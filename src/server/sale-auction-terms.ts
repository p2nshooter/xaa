/**
 * The auction of xaa.es itself — the rules (docs/BLUEPRINT.md §14, requests 66 and 67; owner, 28 Oct 2026, with
 * axto.io: "ubah bentuk penjualannya seperti lelang … segera ambil", then "Start $10jt, setiap minggu naikin $100k").
 *
 *   opening bid  a weekly ladder, the same for everyone: US$10 million from 28 Oct 2026 (00:00 WIB), plus US$100,000
 *                for every full week since — through every round, so the price never starts over
 *   bids         every bid at least the opening bid of the moment; after the first, also at least the high bid plus
 *                one step; jump bids allowed; never against yourself
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

/** The owner's floor: the ladder never starts below US$10 million. */
export const OPEN_MIN_USD = 10_000_000;
export const OPEN_MAX_USD = 100_000_000;
/** A sanity ceiling on one bid: a typo with three extra zeros is refused, not recorded. */
export const MAX_BID_USD = 5_000_000_000;
const DAY = 86_400_000;
const WEEK = 7 * DAY;
/** Day one of the ladder, 00:00 in Jakarta (WIB, UTC+7), where the owner is. */
const WIB_MS = 7 * 3_600_000;

export interface SaleAuctionSettings {
  /** The opening bid on day one of the ladder. */
  startUsd: number;
  /** Added to the opening bid at the end of every full week. */
  weeklyUsd: number;
  /** Day one of the ladder (YYYY-MM-DD, from 00:00 WIB). */
  from: string;
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
  startUsd: 10_000_000, weeklyUsd: 100_000, from: '2026-10-28', stepUsd: 250_000, days: 14, snipeMinutes: 10, payDays: 7, autoRestart: true, approval: true,
};

const digits = (v: unknown) => Number(String(v ?? '').replace(/[^\d]/g, ''));
const within = (v: unknown, lo: number, hi: number, fallback: number) => {
  const n = digits(v);
  return String(v ?? '').trim() !== '' && Number.isFinite(n) && n >= lo && n <= hi ? n : fallback;
};
const yes = (v: unknown, fallback: boolean) => (v === 'yes' ? true : v === 'no' ? false : fallback);
const isDay = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));

/** The auction settings from the stored strings (Settings → Sale of xaa.es); anything unusable falls back to the default. */
export function parseSaleAuction(raw: Record<string, string>): SaleAuctionSettings {
  const d = SALE_AUCTION_DEFAULTS;
  const from = String(raw.sale_auction_from ?? '').trim();
  return {
    startUsd: within(raw.sale_auction_start_usd, OPEN_MIN_USD, OPEN_MAX_USD, d.startUsd),
    weeklyUsd: within(raw.sale_auction_weekly_usd, 0, 10_000_000, d.weeklyUsd),
    from: isDay(from) ? from : d.from,
    stepUsd: within(raw.sale_auction_step_usd, 1_000, 10_000_000, d.stepUsd),
    days: within(raw.sale_auction_days, 1, 90, d.days),
    snipeMinutes: within(raw.sale_auction_snipe_minutes, 0, 120, d.snipeMinutes),
    payDays: within(raw.sale_auction_pay_days, 1, 60, d.payDays),
    autoRestart: yes(raw.sale_auction_restart, d.autoRestart),
    approval: yes(raw.sale_auction_approval, d.approval),
  };
}

type Ladder = Pick<SaleAuctionSettings, 'startUsd' | 'weeklyUsd' | 'from'>;
/** 00:00 WIB on day one of the ladder. */
export const ladderStart = (s: Pick<Ladder, 'from'>) => Date.parse(`${s.from}T00:00:00Z`) - WIB_MS;
const weeksIn = (s: Ladder, nowMs: number) => Math.max(0, Math.floor((nowMs - ladderStart(s)) / WEEK));
/** The opening bid at a moment: the start plus one weekly rise for every full week since day one. */
export const ladderPrice = (s: Ladder, nowMs = Date.now()) => s.startUsd + s.weeklyUsd * weeksIn(s, nowMs);
/** When the opening bid next rises ('' when it does not). */
export const nextRiseAt = (s: Ladder, nowMs = Date.now()) =>
  s.weeklyUsd > 0 ? new Date(ladderStart(s) + (weeksIn(s, nowMs) + 1) * WEEK).toISOString() : '';
const LOCALE: Record<string, string> = { en: 'en-GB', es: 'es-ES', id: 'id-ID' };
/** The day of a rise in Jakarta time, where the ladder is counted — the same on the server and in every browser. */
export const riseDate = (iso: string, lang: string) =>
  new Date(iso).toLocaleDateString(LOCALE[lang] || 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
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
/** The lowest bid accepted now: the opening bid of the moment (`floorUsd`, the ladder), and after the first bid also the high bid plus a step. */
export const nextMinBid = (r: Pick<RoundState, 'bids_count' | 'high_usd' | 'step_usd'>, floorUsd: number) =>
  Math.max(floorUsd, r.bids_count > 0 ? r.high_usd + r.step_usd : 0);

export type SaleBidProblem = 'closed' | 'not_started' | 'ended' | 'bad_amount' | 'too_low' | 'too_high' | 'already_highest';

/** Why a bid cannot be placed (null = it can). Decided again on every compare-and-swap attempt. */
export function saleBidProblem(r: RoundState, amount: number, userId: string, nowMs: number, floorUsd: number): SaleBidProblem | null {
  if (r.status !== 'open') return 'closed';
  if (nowMs < Date.parse(r.starts_at)) return 'not_started';
  if (nowMs >= Date.parse(r.ends_at)) return 'ended';
  if (!Number.isInteger(amount) || amount < 1) return 'bad_amount';
  if (r.bids_count > 0 && r.high_user === userId) return 'already_highest';
  if (amount > MAX_BID_USD) return 'too_high';
  if (amount < nextMinBid(r, floorUsd)) return 'too_low';
  return null;
}

/** Whole US dollars as typed ("42,250,000", "$ 42 250 000"); anything else is NaN. */
export const parseBid = (v: unknown) => {
  const s = String(v ?? '').replace(/[\s,$_.]/g, '');
  return /^\d{1,13}$/.test(s) ? Number(s) : NaN;
};

/* ---- what people see -------------------------------------------------------------- */

export interface PublicRound {
  /** openUsd is the opening bid of the moment (the ladder); weeklyUsd and nextRiseAt say when and by how much it rises. */
  no: number; status: SaleRoundStatus; openUsd: number; weeklyUsd: number; nextRiseAt: string; stepUsd: number; startsAt: string; endsAt: string; snipeMinutes: number; payDays: number;
  bidsCount: number; highUsd: number; nextMinUsd: number; leader: string; winnerName: string; winnerUsd: number;
  bids: { name: string; amountUsd: number; at: string }[];
}
/** The round as everyone sees it: no e-mail, no user id; names masked. */
export function publicRound(r: SaleRound, bids: SaleBid[], s: Ladder, nowMs = Date.now()): PublicRound {
  const won = r.status === 'awaiting_payment' || r.status === 'sold';
  const floor = ladderPrice(s, nowMs);
  return {
    no: r.no, status: r.status, openUsd: floor, weeklyUsd: s.weeklyUsd, nextRiseAt: nextRiseAt(s, nowMs), stepUsd: r.step_usd, startsAt: r.starts_at, endsAt: r.ends_at, snipeMinutes: r.snipe_minutes,
    payDays: r.pay_days, bidsCount: r.bids_count, highUsd: r.high_usd, nextMinUsd: nextMinBid(r, floor), leader: r.bids_count ? maskName(r.high_name) : '',
    winnerName: won ? maskName(r.winner_name) : '', winnerUsd: won ? r.winner_usd : 0,
    bids: bids.map((b) => ({ name: maskName(b.display_name), amountUsd: b.amount_usd, at: b.created_at })),
  };
}
