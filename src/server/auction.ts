import { bucket, newId, nowIso } from './db';
import { data } from './data';
import type { Data } from './r2/schema';
import type { User } from './auth';
import type { TemplateOrder } from './store';
import {
  AUCTION_ANCHOR_MS, DEFAULT_CATEGORIES, PAY_DAYS, bidProblem, cleanDisplayName, cycleEndAfter, cycleId, cycleStartOf,
  displayNameProblem, extendedEnd, hasCode, hasDomain, nextBid, outcomeOf,
  type AuctionCategory, type BidProblem, type LotStatus, type LotType, type NameProblem,
} from './auction-terms';

/**
 * The xaa.es auction of websites, scripts and domains (docs/BLUEPRINT.md §10; rules in auction-terms.ts).
 *
 * Every record is an R2 document (server/r2/schema.ts): auction_lots (one per lot, with a summary on its
 * index entries), auction_bids (one create-once document per bid, `<lot>.<seq>`), auction_bidders (the
 * name a member shows when they win) and auction_categories. A bid is a compare-and-swap on its lot, so
 * two bids at the same moment can never both take the same step. A lot that has ended is closed the
 * next time anyone looks (the pages, a bid, the Studio desk) — no clock needed.
 *
 * Paying a win is the normal template checkout: closing a lot creates a template order (id `auc-<lot>`,
 * deterministic, so two closes create one order) priced at the winning bid. PayPal confirms it by
 * itself; a bank or USDT payment needs the payment screenshot and the admin's approval (the owner,
 * 27 Oct 2026). The order turning paid marks the lot sold and opens its assets.
 */

export interface AuctionLot {
  id: string;
  ref: string;
  type: LotType;
  category: string;
  title: string;
  summary: string;
  description: string;
  demo_url: string;
  stack: string;
  size_note: string;      // pages / articles / products, as the admin writes it
  age_note: string;       // how old the site is
  site_lang: string;
  domain: string;
  domain_note: string;    // registrar, age, renewal date
  traffic: string;        // only what is verified; empty = "no data yet"
  traffic_verified: boolean;
  handover: string[];     // what the winner receives, one line each
  images: string[];       // object keys in the uploads bucket (public screenshots)
  archive_key: string;    // the code archive, opened to the winner once paid
  archive_name: string;
  archive_size: number;
  normal_eur: number;
  open_eur: number;
  step_eur: number;
  reserve_eur: number;    // 0 = none; never shown
  buy_now_eur: number;    // 0 = none
  cycle: string;
  starts_at: string;
  ends_at: string;
  status: LotStatus;
  bids_count: number;
  high_eur: number;
  high_user: string;
  high_name: string;
  high_seq: number;
  winner_user: string;
  winner_name: string;
  winner_eur: number;
  passed: string[];       // users the win was handed on from
  order_id: string;
  pay_by: string;
  closed_at: string;
  paid_at: string;
  epp_sent_at: string;    // domain: transfer code sent by the admin
  domain_received_at: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface AuctionBid { id: string; lot_id: string; user_id: string; name: string; amount_eur: number; buy_now: boolean; created_at: string }
export interface AuctionBidder { id: string; display_name: string; created_at: string; updated_at: string }
export interface AuctionCategoryDoc extends AuctionCategory { id: string; hidden: boolean; order: number; updated_at: string }

/** A lot's summary on its index entries — lists read no lot documents. */
export const lotSummary = (l: AuctionLot) => ({
  ref: l.ref, type: l.type, category: l.category, title: l.title.slice(0, 90), status: l.status, cycle: l.cycle,
  normal: l.normal_eur, open: l.open_eur, high: l.high_eur, bids: l.bids_count, ends: l.ends_at,
  winner: l.winner_name.slice(0, 48), win: l.winner_eur, paid: l.paid_at ? 1 : 0, closed: l.closed_at,
});

const now = () => nowIso();
const pad6 = (n: number) => String(n).padStart(6, '0');
export const bidId = (lotId: string, seq: number) => `${lotId}.${pad6(seq)}`;
export const orderIdFor = (lot: AuctionLot) => `auc-${lot.id}${lot.passed.length ? `-p${lot.passed.length}` : ''}`;

function makeRef(): string {
  const y = new Date().getFullYear().toString().slice(-2);
  return `AUC-${y}${Math.floor(Math.random() * 1_679_616).toString(36).toUpperCase().padStart(4, '0')}`;
}

/* ---- categories ------------------------------------------------------------- */

export async function listCategories(d?: Data, withHidden = false): Promise<AuctionCategoryDoc[]> {
  const db = d ?? (await data());
  const saved = await db.auctionCategories.all(500);
  const bySlug = new Map(saved.map((c) => [c.slug, c]));
  const merged: AuctionCategoryDoc[] = DEFAULT_CATEGORIES.map((c, i) => bySlug.get(c.slug) ?? { ...c, id: c.slug, hidden: false, order: i, updated_at: '' });
  for (const c of saved) if (!DEFAULT_CATEGORIES.some((x) => x.slug === c.slug)) merged.push(c);
  return merged.filter((c) => withHidden || !c.hidden).sort((a, b) => a.order - b.order || a.en.localeCompare(b.en));
}

export async function saveCategory(c: Omit<AuctionCategoryDoc, 'id' | 'updated_at'>): Promise<void> {
  const db = await data();
  await db.auctionCategories.upsert(c.slug, () => ({ ...c, id: c.slug, updated_at: now() }));
}

/* ---- the calendar ----------------------------------------------------------- */

/** The auction a lot published now belongs to: this one, or — in its last day — the next one, which starts the moment this ends. */
export function joiningEnd(nowMs = Date.now()): number {
  const end = cycleEndAfter(Math.max(nowMs, AUCTION_ANCHOR_MS - 14 * 86_400_000));
  return end - nowMs < 86_400_000 ? end + 14 * 86_400_000 : end;
}

/* ---- the Studio desk -------------------------------------------------------- */

export type LotInput = Pick<AuctionLot,
  'type' | 'category' | 'title' | 'summary' | 'description' | 'demo_url' | 'stack' | 'size_note' | 'age_note' | 'site_lang' | 'domain' | 'domain_note' |
  'traffic' | 'traffic_verified' | 'handover' | 'normal_eur' | 'open_eur' | 'step_eur' | 'reserve_eur' | 'buy_now_eur'>;

/** A new lot, as a draft (the admin publishes it into an auction). */
export async function createLot(input: LotInput, by: string): Promise<AuctionLot> {
  const db = await data();
  const at = now();
  const lot: AuctionLot = {
    ...input, id: `lot_${newId().replace(/[^\w]/g, '').slice(0, 26)}`, ref: makeRef(), images: [], archive_key: '', archive_name: '', archive_size: 0,
    cycle: '', starts_at: '', ends_at: '', status: 'draft', bids_count: 0, high_eur: 0, high_user: '', high_name: '', high_seq: 0,
    winner_user: '', winner_name: '', winner_eur: 0, passed: [], order_id: '', pay_by: '', closed_at: '', paid_at: '', epp_sent_at: '', domain_received_at: '',
    created_at: at, updated_at: at, created_by: by,
  };
  await db.auctionLots.create(lot);
  return lot;
}

/** Change a lot's description and prices: everything while it is a draft; once bidding has started, the words only. */
export async function updateLot(id: string, input: LotInput): Promise<{ ok: true } | { error: string }> {
  const db = await data();
  let problem = '';
  await db.auctionLots.update(id, (l) => {
    problem = '';
    if (l.status !== 'draft' && l.status !== 'open') { problem = 'A closed lot cannot be changed.'; return null; }
    const pricesChange = ['normal_eur', 'open_eur', 'step_eur', 'reserve_eur', 'buy_now_eur', 'type'].some((k) => (l as any)[k] !== (input as any)[k]);
    if (l.bids_count > 0 && pricesChange) { problem = 'Bidding has started: the type and prices stay as they were.'; return null; }
    return { ...l, ...input, updated_at: now() };
  });
  return problem ? { error: problem } : { ok: true };
}

/** Put a draft into the running auction (or, in its last day, the next one). */
export async function publishLot(id: string, nowMs = Date.now()): Promise<{ ok: true; endsAt: string } | { error: string }> {
  const db = await data();
  const end = joiningEnd(nowMs);
  let problem = '';
  const after = await db.auctionLots.update(id, (l) => {
    problem = '';
    if (l.status !== 'draft') { problem = 'Only a draft can be published.'; return null; }
    if (hasDomain(l.type) && !l.domain) { problem = 'Add the domain name first.'; return null; }
    const starts = Math.max(nowMs, cycleStartOf(end));
    return { ...l, status: 'open', cycle: cycleId(end), starts_at: new Date(starts).toISOString(), ends_at: new Date(end).toISOString(), updated_at: now() };
  });
  return problem ? { error: problem } : { ok: true, endsAt: after.ends_at };
}

export async function cancelLot(id: string): Promise<{ ok: true } | { error: string }> {
  const db = await data();
  let problem = '';
  const lot = await db.auctionLots.update(id, (l) => {
    problem = '';
    if (l.status === 'sold' || l.status === 'cancelled') { problem = l.status === 'sold' ? 'A sold lot is refunded, not cancelled.' : 'Already cancelled.'; return null; }
    return { ...l, status: 'cancelled', updated_at: now() };
  });
  if (!problem && lot.order_id) await cancelOpenOrder(db, lot.order_id);
  return problem ? { error: problem } : { ok: true };
}

/** The admin hands an unpaid win to the next bidder, at that bidder's own bid (unsold when nobody is left above the reserve). */
export async function passLot(id: string): Promise<{ ok: true; to: string } | { error: string }> {
  const db = await data();
  const cur = await db.auctionLots.get(id);
  if (!cur) return { error: 'Lot not found.' };
  if (cur.status !== 'awaiting_payment') return { error: 'Only an unpaid win can be passed on.' };
  const bids = await db.auctionBids.listAllDocs('lot', id, 2000);
  const skip = new Set([...cur.passed, cur.winner_user]);
  const next = bids.find((b) => !skip.has(b.user_id) && b.amount_eur >= (cur.reserve_eur || 0));
  let problem = '';
  const after = await db.auctionLots.update(id, (l) => {
    problem = '';
    if (l.status !== 'awaiting_payment' || l.winner_user !== cur.winner_user) { problem = 'The lot changed — reload and try again.'; return null; }
    const passed = [...l.passed, l.winner_user];
    if (!next) return { ...l, status: 'unsold', passed, winner_user: '', winner_name: '', winner_eur: 0, order_id: '', updated_at: now() };
    return { ...l, passed, winner_user: next.user_id, winner_name: next.name, winner_eur: next.amount_eur, order_id: '', pay_by: payBy(), updated_at: now() };
  });
  if (problem) return { error: problem };
  if (cur.order_id) await cancelOpenOrder(db, cur.order_id);
  if (after.status === 'awaiting_payment') await openOrder(db, after);
  return { ok: true, to: after.winner_name };
}

/** Domain hand-over steps, by the admin: the transfer code went out, the buyer has the domain. */
export async function setHandover(id: string, step: 'epp' | 'received', on: boolean): Promise<void> {
  const db = await data();
  await db.auctionLots.update(id, (l) => (l.status === 'sold' ? { ...l, [step === 'epp' ? 'epp_sent_at' : 'domain_received_at']: on ? now() : '', updated_at: now() } : null));
}

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif']);
/** A screenshot shown on the lot page (public). */
export async function addImage(id: string, file: File): Promise<{ ok: true } | { error: string }> {
  if (!IMAGE_TYPES.has(file.type)) return { error: 'Use a PNG, JPG, WebP, AVIF or GIF image.' };
  if (file.size > 5 * 1024 * 1024) return { error: 'An image can be at most 5 MB.' };
  const store = await bucket();
  if (!store) return { error: 'File storage is not configured on this deployment yet.' };
  const db = await data();
  const lot = await db.auctionLots.get(id);
  if (!lot) return { error: 'Lot not found.' };
  if (lot.images.length >= 8) return { error: 'A lot shows at most 8 images.' };
  const key = `auction/${id}/img-${newId().replace(/[^\w]/g, '').slice(0, 20)}.${file.type.split('/')[1]}`;
  await store.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  await db.auctionLots.update(id, (l) => ({ ...l, images: [...l.images, key].slice(0, 8), updated_at: now() }));
  return { ok: true };
}

export async function removeImage(id: string, key: string): Promise<void> {
  const db = await data();
  await db.auctionLots.update(id, (l) => (l.images.includes(key) ? { ...l, images: l.images.filter((k) => k !== key), updated_at: now() } : null));
  const store = await bucket();
  if (store && key.startsWith(`auction/${id}/`)) await store.delete(key).catch(() => undefined);
}

/** The code archive the winner downloads once the win is paid (never shown before). */
export async function setArchive(id: string, file: File): Promise<{ ok: true } | { error: string }> {
  if (!/\.(zip|tar\.gz|tgz|7z)$/i.test(file.name)) return { error: 'Upload the code as a .zip, .tar.gz or .7z archive.' };
  if (file.size > 95 * 1024 * 1024) return { error: 'The archive can be at most 95 MB here — larger code goes out by link after payment.' };
  const store = await bucket();
  if (!store) return { error: 'File storage is not configured on this deployment yet.' };
  const db = await data();
  const lot = await db.auctionLots.get(id);
  if (!lot) return { error: 'Lot not found.' };
  if (!hasCode(lot.type)) return { error: 'A domain-only lot has no code archive.' };
  const name = file.name.replace(/[^\w.\-]/g, '_').slice(0, 120);
  const key = `auction/${id}/archive/${name}`;
  await store.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type || 'application/octet-stream' } });
  await db.auctionLots.update(id, (l) => ({ ...l, archive_key: key, archive_name: name, archive_size: file.size, updated_at: now() }));
  return { ok: true };
}

/* ---- bidders ---------------------------------------------------------------- */

/** A signed-in member bids once they have chosen the name shown when they win — no e-mailed code (as on axto.io, owner 27 Oct 2026). */
export async function setDisplayName(user: Pick<User, 'id'>, raw: unknown): Promise<{ ok: true; name: string } | { error: NameProblem }> {
  const problem = displayNameProblem(raw);
  if (problem) return { error: problem };
  const name = cleanDisplayName(raw);
  const db = await data();
  await db.auctionBidders.upsert(user.id, (cur) => ({ id: user.id, display_name: name, created_at: cur?.created_at || now(), updated_at: now() }));
  // The name follows the member onto the lots they have won.
  for (const l of await db.auctionLots.listAllDocs('winner', user.id, 200)) {
    await db.auctionLots.update(l.id, (c) => (c.winner_user === user.id && c.winner_name !== name ? { ...c, winner_name: name, updated_at: now() } : null));
  }
  return { ok: true, name };
}

export async function getBidder(userId: string) {
  return (await data()).auctionBidders.get(userId);
}

/* ---- bidding ---------------------------------------------------------------- */

export type BidResult = { ok: true; lot: AuctionLot; seq: number; extended: boolean } | { error: BidProblem | 'not_found' | 'no_name' | 'admin' | 'no_buy_now' };

export async function placeBid(user: Pick<User, 'id' | 'role'>, lotId: string, amountIn: unknown, nowMs = Date.now()): Promise<BidResult> {
  if (user.role === 'admin') return { error: 'admin' };
  const db = await data();
  const bidder = await db.auctionBidders.get(user.id);
  if (!bidder?.display_name) return { error: 'no_name' };
  if (!(await db.auctionLots.get(lotId))) return { error: 'not_found' };
  const amount = Math.round(Number(String(amountIn ?? '').replace(/[^\d.]/g, '')) || 0);
  let problem = null as BidProblem | null;
  let seq = 0;
  let extended = false as boolean;
  let outbid = '';
  const after = await db.auctionLots.update(lotId, (l) => {
    problem = bidProblem(l, amount, user.id, nowMs);
    if (problem) return null;
    seq = l.high_seq + 1;
    outbid = l.high_user;
    const ends = extendedEnd(l.ends_at, nowMs);
    extended = ends !== l.ends_at;
    return { ...l, bids_count: l.bids_count + 1, high_eur: amount, high_user: user.id, high_name: bidder.display_name, high_seq: seq, ends_at: ends, updated_at: now() };
  });
  if (problem) return { error: problem };
  await db.auctionBids.createIfAbsent({ id: bidId(lotId, seq), lot_id: lotId, user_id: user.id, name: bidder.display_name, amount_eur: amount, buy_now: false, created_at: now() });
  void outbid; // outbid members see it on their portal page (xaa.es sends no e-mail of its own yet).
  return { ok: true, lot: after, seq, extended };
}

/** Buy now: the lot closes at once to this member at the buy-now price (while the bidding is below it). */
export async function buyNow(user: Pick<User, 'id' | 'role'>, lotId: string, nowMs = Date.now()): Promise<BidResult> {
  if (user.role === 'admin') return { error: 'admin' };
  const db = await data();
  const bidder = await db.auctionBidders.get(user.id);
  if (!bidder?.display_name) return { error: 'no_name' };
  if (!(await db.auctionLots.get(lotId))) return { error: 'not_found' };
  let problem = null as BidResult extends { error: infer E } ? E | null : never;
  let seq = 0;
  const after = await db.auctionLots.update(lotId, (l) => {
    problem = null;
    if (!l.buy_now_eur) { problem = 'no_buy_now'; return null; }
    if (l.status !== 'open') { problem = 'closed'; return null; }
    if (nowMs < Date.parse(l.starts_at)) { problem = 'not_started'; return null; }
    if (nowMs >= Date.parse(l.ends_at)) { problem = 'ended'; return null; }
    if (l.high_eur >= l.buy_now_eur) { problem = 'too_high'; return null; }
    seq = l.high_seq + 1;
    const at = now();
    return {
      ...l, bids_count: l.bids_count + 1, high_eur: l.buy_now_eur, high_user: user.id, high_name: bidder.display_name, high_seq: seq,
      status: 'awaiting_payment', winner_user: user.id, winner_name: bidder.display_name, winner_eur: l.buy_now_eur, closed_at: at, pay_by: payBy(), updated_at: at,
    };
  });
  if (problem) return { error: problem };
  await db.auctionBids.createIfAbsent({ id: bidId(lotId, seq), lot_id: lotId, user_id: user.id, name: bidder.display_name, amount_eur: after.buy_now_eur, buy_now: true, created_at: now() });
  await openOrder(db, after);
  return { ok: true, lot: (await db.auctionLots.get(lotId)) ?? after, seq, extended: false };
}

/* ---- closing and paying -------------------------------------------------------- */

const payBy = () => new Date(Date.now() + PAY_DAYS * 86_400_000).toISOString();

/** Close every lot whose time is up (idempotent: the compare-and-swap lets one caller close each lot). */
export async function settleDue(nowMs = Date.now()): Promise<number> {
  const db = await data();
  const due = (await db.auctionLots.listAllDocs('status', 'open', 1000)).filter((l) => Date.parse(l.ends_at) <= nowMs);
  let closed = 0;
  for (const lot of due) {
    let changed = false as boolean;
    const after = await db.auctionLots.update(lot.id, (l) => {
      changed = false;
      if (l.status !== 'open' || Date.parse(l.ends_at) > nowMs) return null;
      changed = true;
      const outcome = outcomeOf(l);
      const at = now();
      return outcome === 'awaiting_payment'
        ? { ...l, status: outcome, winner_user: l.high_user, winner_name: l.high_name, winner_eur: l.high_eur, closed_at: at, pay_by: payBy(), updated_at: at }
        : { ...l, status: outcome, closed_at: at, updated_at: at };
    });
    if (changed) {
      closed += 1;
      if (after.status === 'awaiting_payment') await openOrder(db, after);
    }
  }
  return closed;
}

/** The win's order: a template order at the winning bid, created once (deterministic id), then linked to the lot. */
async function openOrder(db: Data, lot: AuctionLot): Promise<void> {
  const id = orderIdFor(lot);
  const order: TemplateOrder = {
    id, ref: lot.ref, slug: `auction-${lot.id}`, name: lot.title, user_id: lot.winner_user, price: lot.winner_eur, status: 'pending',
    method: null, reference: null, note: null, created_at: now(), confirmed_at: null, auction_lot_id: lot.id, receipt_key: null,
  };
  await db.templateOrders.createIfAbsent(order);
  await db.auctionLots.update(lot.id, (l) => (l.winner_user === lot.winner_user && l.order_id !== id ? { ...l, order_id: id, updated_at: now() } : null));
}

async function cancelOpenOrder(db: Data, orderId: string): Promise<void> {
  if (!(await db.templateOrders.get(orderId))) return;
  await db.templateOrders.update(orderId, (o) => (o.status === 'pending' || o.status === 'submitted' ? { ...o, status: 'cancelled' } : null));
}

/**
 * An auction order turned paid (the admin approved it, or PayPal confirmed it): the lot is sold and its
 * assets open. A payment for a lot that was passed on or cancelled meanwhile is kept and flagged — the money
 * is real, the admin settles it by hand.
 */
export async function auctionOrderPaid(order: Pick<TemplateOrder, 'id' | 'auction_lot_id' | 'user_id'>): Promise<'sold' | 'already' | 'late' | 'none'> {
  if (!order.auction_lot_id) return 'none';
  const db = await data();
  let outcome = 'late' as 'sold' | 'already' | 'late';
  await db.auctionLots.update(order.auction_lot_id, (l) => {
    if (l.status === 'sold' && l.order_id === order.id) { outcome = 'already'; return null; }
    if (l.status !== 'awaiting_payment' || l.order_id !== order.id || l.winner_user !== order.user_id) { outcome = 'late'; return null; }
    outcome = 'sold';
    return { ...l, status: 'sold', paid_at: now(), updated_at: now() };
  });
  return outcome;
}

/* ---- what people see ---------------------------------------------------------- */

export interface LotView {
  id: string; ref: string; type: LotType; category: string; title: string; summary: string; status: LotStatus;
  normal: number; open: number; step: number; next: number; buyNow: number; high: number; bids: number; leader: string;
  startsAt: string; endsAt: string; image: string; domain: string; winner: string; winnerEur: number; paid: boolean; closedAt: string;
}

export function lotView(l: AuctionLot): LotView {
  return {
    id: l.id, ref: l.ref, type: l.type, category: l.category, title: l.title, summary: l.summary, status: l.status,
    normal: l.normal_eur, open: l.open_eur, step: l.step_eur, next: nextBid(l), buyNow: l.buy_now_eur && l.high_eur < l.buy_now_eur ? l.buy_now_eur : 0,
    high: l.high_eur, bids: l.bids_count, leader: l.high_name ? `${[...l.high_name][0]}•••` : '',
    startsAt: l.starts_at, endsAt: l.ends_at, image: l.images[0] ? `/api/auction/image/${l.id}/0` : '', domain: hasDomain(l.type) ? l.domain : '',
    winner: l.status === 'awaiting_payment' || l.status === 'sold' ? l.winner_name : '', winnerEur: l.winner_eur, paid: l.status === 'sold', closedAt: l.closed_at,
  };
}

export async function getLot(id: string): Promise<AuctionLot | null> {
  return (await data()).auctionLots.get(id);
}

/** The public board: the running auction's lots (closing any that are due first) and the recent winners. */
export async function board(nowMs = Date.now()) {
  await settleDue(nowMs).catch(() => 0);
  const db = await data();
  const [open, won] = await Promise.all([db.auctionLots.listAllDocs('status', 'open', 1000), db.auctionLots.listAllDocs('won', 'all', 30)]);
  const live = open.filter((l) => Date.parse(l.starts_at) <= nowMs).sort((a, b) => a.ends_at.localeCompare(b.ends_at));
  const upcoming = open.filter((l) => Date.parse(l.starts_at) > nowMs).length;
  return { endsAt: new Date(cycleEndAfter(nowMs)).toISOString(), lots: live.map(lotView), upcoming, winners: won.map(lotView) };
}

export async function lotBids(lotId: string): Promise<AuctionBid[]> {
  return (await data()).auctionBids.listAllDocs('lot', lotId, 2000);
}

/** The member's side: their name, their bids and their wins. */
export async function memberAuction(userId: string) {
  await settleDue().catch(() => 0);
  const db = await data();
  const [bidder, bids, won] = await Promise.all([db.auctionBidders.get(userId), db.auctionBids.listAllDocs('user', userId, 1000), db.auctionLots.listAllDocs('winner', userId, 200)]);
  const best = new Map<string, number>();
  for (const b of bids) best.set(b.lot_id, Math.max(best.get(b.lot_id) ?? 0, b.amount_eur));
  const lots = (await db.auctionLots.getMany([...best.keys()])).filter((l): l is AuctionLot => !!l);
  return {
    displayName: bidder?.display_name ?? '',
    bids: lots.map((l) => ({ ...lotView(l), mine: best.get(l.id) ?? 0, leading: l.high_user === userId })),
    wins: won.filter((l) => l.winner_user === userId && (l.status === 'awaiting_payment' || l.status === 'sold'))
      .map((l) => ({ ...lotView(l), orderId: l.order_id, payBy: l.pay_by, archive: !!l.archive_key && l.status === 'sold', eppSentAt: l.epp_sent_at, domainReceivedAt: l.domain_received_at })),
  };
}

/** The Studio desk: every lot (closing due ones first), newest first. */
export async function deskLots(): Promise<AuctionLot[]> {
  await settleDue().catch(() => 0);
  return (await data()).auctionLots.listAllDocs('all', 'all', 2000);
}
