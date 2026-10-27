import { appEnv, bucket, newId, nowIso } from './db';
import { data } from './data';
import type { Data } from './r2/schema';
import type { User } from './auth';
import type { TemplateOrder } from './store';
import { decryptValue, encryptValue } from './crypto';
import { TEMPLATES } from '@/content/templates';
import {
  CYCLE_MS, DEFAULT_CATEGORIES, DEFAULT_OPEN_PCT, DNS_PROOF_DAYS, DNS_TOKEN_DAYS, MEMBER_COMMISSION_PCT, PAY_DAYS, bidProblem,
  cleanDisplayName, cleanDomain, cycleEndAfter, cycleId, cycleStartOf, defaultOpening, defaultStep, displayNameProblem, dnsRecordName,
  dnsRecordValue, domainProblem, extendedEnd, hasCode, hasDomain, lotEndFor, lotSummary, nextBid, outcomeOf, priceProblem, saleSplit,
  sellerMaySell, txtHasToken,
  type AuctionCategory, type BidProblem, type DomainProblem, type LotCard, type LotStatus, type LotType, type NameProblem, type Seller,
} from './auction-terms';

/**
 * The xaa.es auction of websites, scripts and domains (docs/BLUEPRINT.md §10; rules in auction-terms.ts).
 *
 * Every record is an R2 document (server/r2/schema.ts): auction_lots (one per lot, with its summary on every
 * index entry, so the public list reads no lot documents), auction_bids (one create-once document per bid,
 * `<lot>.<seq>`), auction_bidders (the name a member shows, their seller page and their payout details,
 * encrypted), auction_domains (a member's proof that a domain is theirs) and auction_payouts (what a sold
 * member lot owes its seller). A bid is a compare-and-swap on its lot, so two bids at the same moment can
 * never both take the same step; a domain can be in one live lot at a time (a guard on the lot). A lot that
 * has ended is closed the next time anyone looks (the pages, a bid, the Studio desk) — no clock needed.
 *
 * Paying a win is the normal template checkout: closing a lot creates a template order (id `auc-<lot>`,
 * deterministic, so two closes create one order) priced at the winning bid. PayPal confirms it by itself; a
 * bank or USDT payment needs the payment screenshot and the admin's approval (owner, 27 Oct 2026). The
 * order turning paid marks the lot sold, opens its assets and, for a member's domain, records the payout
 * (70 % to the seller, 30 % sales commission to xaa.es) once the buyer has the domain.
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
  size_note: string;      // pages / articles / products, as the seller writes it
  age_note: string;       // how old the site or domain is
  site_lang: string;      // two letters, '' = not stated
  domain: string;
  domain_note: string;    // registrar, age, renewal date (admin lots)
  registrar: string;      // member lots
  expires_on: string;     // member lots: the domain's expiry date (YYYY-MM-DD)
  traffic: string;        // only what is verified; empty = "no data yet"
  traffic_verified: boolean;
  handover: string[];     // what the winner receives, one line each
  images: string[];       // object keys in the uploads bucket (public screenshots)
  archive_key: string;    // the code archive, opened to the winner once paid
  archive_name: string;
  archive_size: number;
  seller: Seller;
  seller_user: string;    // member lots: the seller's user id
  seller_name: string;    // the name shown ("XAA.es" for the studio's own lots)
  product_slug: string;   // xaa.es's automatic lots: the catalogue template
  commission_pct: number; // 30 on a member's lot, 0 otherwise
  normal_eur: number;     // the reference price: catalogue price, admin price or the member's asking price
  open_eur: number;
  step_eur: number;
  reserve_eur: number;    // 0 = none; never shown
  buy_now_eur: number;    // 0 = none
  cycle: string;          // xaa.es's automatic lots: the round they belong to
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
  epp_sent_at: string;    // domain: transfer code sent by the seller or the admin
  domain_received_at: string;
  relist_count: number;
  relisted_from: string;
  relisted_to: string;
  cancel_reason: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface AuctionBid { id: string; lot_id: string; user_id: string; name: string; amount_eur: number; buy_now: boolean; created_at: string }
export interface AuctionBidder {
  id: string;
  display_name: string;
  /** The seller page: /auction/seller/<handle>. */
  handle: string;
  seller_page: boolean;
  /** Where a seller's 70 % goes: "bank" | "paypal" | "usdt", details encrypted (never shown back in full). */
  payout_method: string;
  payout_enc: string;
  created_at: string;
  updated_at: string;
}
export interface AuctionCategoryDoc extends AuctionCategory { id: string; hidden: boolean; order: number; updated_at: string }
/** A member's claim on a domain: the token they put in DNS and when DNS last showed it. Id: `<user>|<domain>`. */
export interface AuctionDomainClaim {
  id: string; user_id: string; domain: string; token: string; token_at: string;
  status: 'pending' | 'verified'; verified_at: string; checked_at: string; checks: number; created_at: string;
}
/** What a sold member lot owes its seller. Id: the lot id. */
export interface AuctionPayout {
  id: string; lot_id: string; lot_ref: string; domain: string; seller_user: string; final_eur: number; commission_eur: number; seller_eur: number;
  status: 'awaiting_handover' | 'due' | 'paid'; method: string; reference: string; paid_at: string; paid_by: string; created_at: string; updated_at: string;
}

const now = () => nowIso();
const DAY = 86_400_000;
const pad6 = (n: number) => String(n).padStart(6, '0');
export const bidId = (lotId: string, seq: number) => `${lotId}.${pad6(seq)}`;
export const orderIdFor = (lot: AuctionLot) => `auc-${lot.id}${lot.passed.length ? `-p${lot.passed.length}` : ''}`;
export const STUDIO_NAME = 'XAA.es';

function makeRef(): string {
  const y = new Date().getFullYear().toString().slice(-2);
  return `AUC-${y}${Math.floor(Math.random() * 1_679_616).toString(36).toUpperCase().padStart(4, '0')}`;
}
const lotId = () => `lot_${newId().replace(/[^\w]/g, '').slice(0, 26)}`;

/** A lot as stored, filled with every field's empty value (older documents may lack a field added later). */
export function blankLot(over: Partial<AuctionLot>): AuctionLot {
  const at = now();
  return {
    id: lotId(), ref: makeRef(), type: 'domain', category: 'domains', title: '', summary: '', description: '', demo_url: '', stack: '', size_note: '', age_note: '',
    site_lang: '', domain: '', domain_note: '', registrar: '', expires_on: '', traffic: '', traffic_verified: false, handover: [], images: [],
    archive_key: '', archive_name: '', archive_size: 0, seller: 'admin', seller_user: '', seller_name: STUDIO_NAME, product_slug: '', commission_pct: 0,
    normal_eur: 0, open_eur: 0, step_eur: 0, reserve_eur: 0, buy_now_eur: 0, cycle: '', starts_at: '', ends_at: '', status: 'draft',
    bids_count: 0, high_eur: 0, high_user: '', high_name: '', high_seq: 0, winner_user: '', winner_name: '', winner_eur: 0, passed: [], order_id: '',
    pay_by: '', closed_at: '', paid_at: '', epp_sent_at: '', domain_received_at: '', relist_count: 0, relisted_from: '', relisted_to: '', cancel_reason: '',
    created_at: at, updated_at: at, created_by: '', ...over,
  };
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

/* ---- xaa.es's own products: automatic, every round (request 59) ------------- */

interface AuctionConfig { products_off: string[]; updated_at: string; updated_by: string }
const CONFIG_DOC = 'auction/config';

export async function auctionConfig(d?: Data): Promise<AuctionConfig> {
  const db = d ?? (await data());
  return db.store.getDoc<AuctionConfig>(CONFIG_DOC, { products_off: [], updated_at: '', updated_by: '' });
}

/** The studio's products that go up by themselves: catalogue templates whose code bundle is uploaded (nothing unbuilt is sold), minus those the admin switched off. */
export async function autoProducts(d?: Data): Promise<{ slug: string; name: string; price: number; category: string; on: boolean }[]> {
  const db = d ?? (await data());
  const [bundles, cfg] = await Promise.all([db.bundles.all(500), auctionConfig(db)]);
  const ready = new Set(bundles.map((b) => b.slug));
  return TEMPLATES.filter((t) => ready.has(t.slug)).map((t) => ({ slug: t.slug, name: t.name, price: t.price, category: 'saas', on: !cfg.products_off.includes(t.slug) }));
}

export async function setProductAuto(slug: string, on: boolean, by: string): Promise<void> {
  const db = await data();
  await db.store.updateDoc<AuctionConfig>(CONFIG_DOC, { products_off: [], updated_at: '', updated_by: '' }, (c) => ({
    products_off: on ? c.products_off.filter((s) => s !== slug) : [...new Set([...c.products_off, slug])], updated_at: now(), updated_by: by,
  }));
  await syncProductLots(Date.now(), true);
}

/**
 * Open this round's lot for every automatic product (create-once: the lot id is the product + the round).
 * A marker document per round keeps this to one read per page view once the round is open.
 */
export async function syncProductLots(nowMs = Date.now(), force = false): Promise<number> {
  const db = await data();
  const end = cycleEndAfter(nowMs);
  const round = cycleId(end);
  if (!force && (await db.store.getDoc<{ at: string } | null>(`auction/round-${round}`, null))) return 0;
  let opened = 0;
  for (const p of await autoProducts(db)) {
    if (!p.on) continue;
    const open = defaultOpening(p.price);
    const lot = blankLot({
      id: `lot-p-${p.slug}-${round}`, type: 'script', category: p.category, title: `${p.name} — full source code`, seller: 'xaa', seller_name: STUDIO_NAME,
      product_slug: p.slug, summary: `The ${p.name} template from the xaa.es catalogue: complete source code, database schema and setup guide.`,
      demo_url: `https://xaa.es/templates/${p.slug}`, handover: ['Complete source code (signed archive)', 'Database schema and seed data', 'Setup and deployment guide'],
      normal_eur: p.price, open_eur: open, step_eur: defaultStep(open), cycle: round, status: 'open',
      starts_at: new Date(Math.max(cycleStartOf(end), Math.min(nowMs, end))).toISOString(), ends_at: new Date(end).toISOString(), created_by: 'auction',
    });
    if (await db.auctionLots.createIfAbsent(lot)) opened += 1;
  }
  await db.store.createDoc(`auction/round-${round}`, { at: now() }).catch(() => undefined);
  return opened;
}

/* ---- the Studio desk: lots of every type -------------------------------------- */

export type LotInput = Pick<AuctionLot,
  'type' | 'category' | 'title' | 'summary' | 'description' | 'demo_url' | 'stack' | 'size_note' | 'age_note' | 'site_lang' | 'domain' | 'domain_note' |
  'traffic' | 'traffic_verified' | 'handover' | 'normal_eur' | 'open_eur' | 'step_eur' | 'reserve_eur' | 'buy_now_eur'>;

function inputProblem(input: LotInput, seller: Seller): string | null {
  if (!sellerMaySell(seller, input.type)) return seller === 'member' ? 'Members sell domain names only.' : 'This seller cannot sell that type.';
  if (input.title.trim().length < 3) return 'Give the lot a title.';
  if (hasDomain(input.type) && !cleanDomain(input.domain)) return 'Add a valid domain name.';
  return priceProblem({ normal: input.normal_eur, open: input.open_eur, step: input.step_eur, reserve: input.reserve_eur, buyNow: input.buy_now_eur });
}

/** A new lot from the admin, as a draft (the admin starts it; it then runs 14 days). */
export async function createLot(input: LotInput, by: string): Promise<{ ok: true; lot: AuctionLot } | { error: string }> {
  const problem = inputProblem(input, 'admin');
  if (problem) return { error: problem };
  const db = await data();
  const lot = blankLot({ ...input, domain: hasDomain(input.type) ? cleanDomain(input.domain)! : '', seller: 'admin', seller_name: STUDIO_NAME, created_by: by });
  await db.auctionLots.create(lot);
  return { ok: true, lot };
}

/** Change a lot's description and prices: everything while it is a draft; once bidding has started, the words only. */
export async function updateLot(id: string, input: LotInput): Promise<{ ok: true } | { error: string }> {
  const db = await data();
  let problem = '';
  await db.auctionLots.update(id, (l) => {
    problem = '';
    if (l.status !== 'draft' && l.status !== 'open') { problem = 'A closed lot cannot be changed.'; return null; }
    const pricesChange = (['normal_eur', 'open_eur', 'step_eur', 'reserve_eur', 'buy_now_eur', 'type', 'domain'] as const).some((k) => l[k] !== input[k]);
    if (l.bids_count > 0 && pricesChange) { problem = 'Bidding has started: the type, domain and prices stay as they were.'; return null; }
    const p = inputProblem(input, l.seller === 'member' ? 'member' : 'admin');
    if (p) { problem = p; return null; }
    return { ...l, ...input, domain: hasDomain(input.type) ? cleanDomain(input.domain)! : '', updated_at: now() };
  });
  return problem ? { error: problem } : { ok: true };
}

/** Start a draft: it runs from now for 14 days. */
export async function startLot(id: string, nowMs = Date.now()): Promise<{ ok: true; endsAt: string } | { error: string }> {
  const db = await data();
  let problem = '';
  try {
    const after = await db.auctionLots.update(id, (l) => {
      problem = '';
      if (l.status !== 'draft') { problem = 'Only a draft can be started.'; return null; }
      if (hasDomain(l.type) && !l.domain) { problem = 'Add the domain name first.'; return null; }
      return { ...l, status: 'open', starts_at: new Date(nowMs).toISOString(), ends_at: new Date(lotEndFor(l.seller, nowMs)).toISOString(), updated_at: now() };
    });
    return problem ? { error: problem } : { ok: true, endsAt: after.ends_at };
  } catch (err) {
    if (err instanceof Error && /already in use/.test(err.message)) return { error: 'That domain is already in a live lot.' };
    throw err;
  }
}

export async function cancelLot(id: string, reason: string): Promise<{ ok: true } | { error: string }> {
  const db = await data();
  let problem = '';
  const lot = await db.auctionLots.update(id, (l) => {
    problem = '';
    if (l.status === 'sold' || l.status === 'cancelled') { problem = l.status === 'sold' ? 'A sold lot is refunded, not cancelled.' : 'Already cancelled.'; return null; }
    return { ...l, status: 'cancelled', cancel_reason: reason.slice(0, 300), updated_at: now() };
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

/** Domain hand-over: the transfer code went out (seller or admin), the buyer has the domain (buyer or admin). */
export async function setHandover(id: string, step: 'epp' | 'received', on: boolean): Promise<void> {
  const db = await data();
  const lot = await db.auctionLots.update(id, (l) => (l.status === 'sold' ? { ...l, [step === 'epp' ? 'epp_sent_at' : 'domain_received_at']: on ? now() : '', updated_at: now() } : null));
  if (step === 'received' && lot.seller === 'member') {
    await db.auctionPayouts.update(id, (p) => (p.status === 'paid' ? null : { ...p, status: on ? 'due' : 'awaiting_handover', updated_at: now() })).catch(() => undefined);
  }
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

/* ---- bidders and sellers ------------------------------------------------------- */

const handleOf = (name: string) =>
  cleanDisplayName(name).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'seller';

/** A signed-in member bids once they have chosen the name shown when they win — no e-mailed code (as on axto.io, owner 27 Oct 2026). */
export async function setDisplayName(user: Pick<User, 'id'>, raw: unknown): Promise<{ ok: true; name: string } | { error: NameProblem }> {
  const problem = displayNameProblem(raw);
  if (problem) return { error: problem };
  const name = cleanDisplayName(raw);
  const db = await data();
  await db.auctionBidders.upsert(user.id, (cur) => ({
    id: user.id, display_name: name, handle: cur?.handle || `${handleOf(name)}-${user.id.replace(/[^a-z0-9]/gi, '').slice(0, 6).toLowerCase()}`,
    seller_page: cur?.seller_page ?? true, payout_method: cur?.payout_method ?? '', payout_enc: cur?.payout_enc ?? '',
    created_at: cur?.created_at || now(), updated_at: now(),
  }));
  // The name follows the member onto the lots they have won and the lots they sell.
  for (const l of await db.auctionLots.listAllDocs('winner', user.id, 200)) {
    await db.auctionLots.update(l.id, (c) => (c.winner_user === user.id && c.winner_name !== name ? { ...c, winner_name: name, updated_at: now() } : null));
  }
  for (const l of await db.auctionLots.listAllDocs('seller', user.id, 500)) {
    await db.auctionLots.update(l.id, (c) => (c.seller_user === user.id && c.seller_name !== name ? { ...c, seller_name: name, updated_at: now() } : null));
  }
  return { ok: true, name };
}

export async function getBidder(userId: string) {
  return (await data()).auctionBidders.get(userId);
}

/** Where a seller's 70 % is sent. The details are encrypted and only shown masked; the admin reveals them when paying. */
export async function setPayoutDetails(user: Pick<User, 'id'>, method: string, details: string): Promise<{ ok: true } | { error: string }> {
  if (!['bank', 'paypal', 'usdt'].includes(method)) return { error: 'Choose bank transfer, PayPal or USDT.' };
  const text = details.replace(/\r/g, '').trim().slice(0, 600);
  if (text.length < 6) return { error: 'Add the account details we pay to.' };
  const db = await data();
  if (!(await db.auctionBidders.get(user.id))) return { error: 'Choose the name you sell under first.' };
  const enc = await encryptValue(text);
  await db.auctionBidders.update(user.id, (b) => ({ ...b, payout_method: method, payout_enc: enc, updated_at: now() }));
  return { ok: true };
}

/** The admin, paying a seller: the details in full. */
export async function revealPayoutDetails(userId: string): Promise<{ method: string; details: string } | null> {
  const b = await (await data()).auctionBidders.get(userId);
  if (!b?.payout_enc) return null;
  return { method: b.payout_method, details: await decryptValue(b.payout_enc).catch(() => '(unreadable)') };
}

/* ---- a member's domain: the DNS proof (request 59) ------------------------------- */

const claimId = (userId: string, domain: string) => `${userId}|${domain}`;
const randomToken = () => [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');

/** Start (or resume) proving a domain: the TXT record to add. A token is offered for 7 days. */
export async function claimDomain(user: Pick<User, 'id'>, raw: unknown): Promise<{ ok: true; claim: AuctionDomainClaim; record: { name: string; value: string } } | { error: DomainProblem }> {
  const problem = domainProblem(raw);
  if (problem) return { error: problem };
  const domain = cleanDomain(raw)!;
  const db = await data();
  const claim = (await db.auctionDomains.upsert(claimId(user.id, domain), (cur) => {
    const fresh = !cur || Date.now() - Date.parse(cur.token_at) > DNS_TOKEN_DAYS * DAY;
    if (cur && !fresh) return null;
    return {
      id: claimId(user.id, domain), user_id: user.id, domain, token: randomToken(), token_at: now(), status: cur?.status === 'verified' ? 'verified' : 'pending',
      verified_at: cur?.verified_at ?? '', checked_at: cur?.checked_at ?? '', checks: cur?.checks ?? 0, created_at: cur?.created_at || now(),
    };
  })) ?? (await db.auctionDomains.get(claimId(user.id, domain)))!;
  return { ok: true, claim, record: { name: dnsRecordName(domain), value: dnsRecordValue(claim.token) } };
}

/** TXT answers for a name from one DNS-over-HTTPS resolver ([] when it does not answer). */
async function dohTxt(endpoint: string, name: string): Promise<string[]> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(`${endpoint}?name=${encodeURIComponent(name)}&type=TXT`, { headers: { accept: 'application/dns-json' }, signal: ctrl.signal });
    if (!r.ok) return [];
    const j = (await r.json()) as { Answer?: { type: number; data: string }[] };
    return (j.Answer ?? []).filter((a) => a.type === 16).map((a) => a.data);
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

/** Both resolvers (Cloudflare and Google) must see the token. Injectable for the tests. */
export type DnsLookup = (name: string) => Promise<string[][]>;
const RESOLVERS = ['https://cloudflare-dns.com/dns-query', 'https://dns.google/resolve'];
const liveLookup: DnsLookup = async (name) => {
  // A local test run points this at a stand-in resolver; production always asks Cloudflare and Google.
  const local = (await appEnv().catch(() => ({}) as { DOH_ENDPOINTS?: string })).DOH_ENDPOINTS;
  const endpoints = local ? local.split(',').map((s) => s.trim()).filter((s) => /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(s)) : RESOLVERS;
  return Promise.all((endpoints.length ? endpoints : RESOLVERS).map((e) => dohTxt(e, name)));
};

/** Check DNS now. A pass marks the claim verified; a miss keeps it pending (the member checks again). */
export async function verifyDomain(user: Pick<User, 'id'>, rawDomain: unknown, lookup: DnsLookup = liveLookup): Promise<{ ok: true; verified: boolean; claim: AuctionDomainClaim } | { error: 'no_claim' }> {
  const domain = cleanDomain(rawDomain);
  const db = await data();
  const cur = domain ? await db.auctionDomains.get(claimId(user.id, domain)) : null;
  if (!domain || !cur) return { error: 'no_claim' };
  const answers = await lookup(dnsRecordName(domain));
  const verified = answers.length > 0 && answers.every((set) => txtHasToken(set, cur.token));
  const claim = await db.auctionDomains.update(cur.id, (c) => ({
    ...c, checked_at: now(), checks: c.checks + 1, ...(verified ? { status: 'verified' as const, verified_at: now() } : {}),
  }));
  return { ok: true, verified, claim };
}

/** A proof younger than 7 days counts as is; an older one is checked again. */
async function freshProof(userId: string, domain: string, lookup: DnsLookup): Promise<boolean> {
  const db = await data();
  const c = await db.auctionDomains.get(claimId(userId, domain));
  if (!c || c.status !== 'verified') return false;
  if (Date.now() - Date.parse(c.verified_at) <= DNS_PROOF_DAYS * DAY) return true;
  const r = await verifyDomain({ id: userId }, domain, lookup);
  return 'ok' in r && r.verified;
}

export async function memberDomains(userId: string): Promise<AuctionDomainClaim[]> {
  return (await data()).auctionDomains.listAllDocs('user', userId, 200);
}

/* ---- a member's domain lot (request 59; 30 % sales commission, request 63) -------- */

export interface MemberLotInput {
  domain: string; category: string; summary: string; description: string; site_lang: string; registrar: string; expires_on: string; age_note: string;
  asking_eur: number; open_pct: number; reserve_eur: number; buy_now: boolean; declare: boolean;
}
export type MemberLotProblem = 'no_name' | 'no_proof' | 'domain' | 'price' | 'open_pct' | 'reserve' | 'expiry' | 'declare' | 'live' | 'registrar';

/** A member's domain goes up at once and runs 14 days. The member chose the opening (10–100 %, default 35 %); every bid is +5 % of it. */
export async function createMemberLot(user: Pick<User, 'id' | 'role'>, input: MemberLotInput, nowMs = Date.now(), lookup: DnsLookup = liveLookup): Promise<{ ok: true; lot: AuctionLot } | { error: MemberLotProblem }> {
  const db = await data();
  const bidder = await db.auctionBidders.get(user.id);
  if (!bidder?.display_name) return { error: 'no_name' };
  const domain = cleanDomain(input.domain);
  if (!domain || domainProblem(domain)) return { error: 'domain' };
  if (!input.declare) return { error: 'declare' };
  if (input.registrar.trim().length < 2) return { error: 'registrar' };
  const asking = Math.round(input.asking_eur);
  if (!Number.isInteger(asking) || asking < 10 || asking > 10_000_000) return { error: 'price' };
  const pct = Math.round(input.open_pct || DEFAULT_OPEN_PCT);
  if (pct < 10 || pct > 100) return { error: 'open_pct' };
  const reserve = Math.round(input.reserve_eur || 0);
  const open = Math.max(1, Math.ceil((asking * pct) / 100));
  if (reserve && (reserve < open || reserve > asking)) return { error: 'reserve' };
  const ends = nowMs + CYCLE_MS;
  const expiry = Date.parse(`${input.expires_on}T00:00:00Z`);
  if (!Number.isFinite(expiry) || expiry < ends + 30 * DAY) return { error: 'expiry' };
  if (!(await freshProof(user.id, domain, lookup))) return { error: 'no_proof' };
  const lot = blankLot({
    type: 'domain', category: input.category || 'domains', title: domain, domain, summary: input.summary.slice(0, 300), description: input.description.slice(0, 5000),
    site_lang: input.site_lang, registrar: input.registrar.trim().slice(0, 80), expires_on: input.expires_on, age_note: input.age_note.slice(0, 80),
    seller: 'member', seller_user: user.id, seller_name: bidder.display_name, commission_pct: MEMBER_COMMISSION_PCT,
    handover: ['The domain name, pushed or transferred to your registrar account'],
    normal_eur: asking, open_eur: open, step_eur: defaultStep(open), reserve_eur: reserve, buy_now_eur: input.buy_now ? asking : 0,
    status: 'open', starts_at: new Date(nowMs).toISOString(), ends_at: new Date(ends).toISOString(), created_by: user.id,
  });
  try {
    await db.auctionLots.create(lot);
  } catch (err) {
    if (err instanceof Error && /already in use/.test(err.message)) return { error: 'live' };
    throw err;
  }
  return { ok: true, lot };
}

/**
 * Relist a lot that ended unsold for another 14 days (free, as often as the seller likes): a new lot with the
 * same description, a lower price allowed, the DNS proof checked again for a member's domain.
 */
export async function relistLot(actor: Pick<User, 'id' | 'role'>, id: string, prices: { asking_eur?: number; open_pct?: number; reserve_eur?: number } = {}, nowMs = Date.now(), lookup: DnsLookup = liveLookup): Promise<{ ok: true; lot: AuctionLot } | { error: string }> {
  const db = await data();
  const old = await db.auctionLots.get(id);
  if (!old) return { error: 'Lot not found.' };
  const mine = old.seller === 'member' ? old.seller_user === actor.id : actor.role === 'admin';
  if (!mine && actor.role !== 'admin') return { error: 'Only the seller can relist this lot.' };
  if (old.status !== 'unsold') return { error: 'Only a lot that ended unsold can be relisted.' };
  if (old.relisted_to) return { error: 'This lot was already relisted.' };
  if (old.seller === 'xaa') return { error: 'xaa.es products go up again by themselves in the next round.' };
  if (old.seller === 'member' && !(await freshProof(old.seller_user, old.domain, lookup))) return { error: 'The DNS record no longer shows your token — check the domain again first.' };
  const asking = Math.round(prices.asking_eur || old.normal_eur);
  const pct = Math.round(prices.open_pct || Math.round((old.open_eur / old.normal_eur) * 100) || DEFAULT_OPEN_PCT);
  if (asking < 1 || asking > old.normal_eur) return { error: 'A relisted lot keeps or lowers its price.' };
  const open = Math.max(1, Math.ceil((asking * Math.min(100, Math.max(10, pct))) / 100));
  const reserve = prices.reserve_eur === undefined ? Math.min(old.reserve_eur, asking) : Math.round(prices.reserve_eur);
  if (reserve && (reserve < open || reserve > asking)) return { error: 'The reserve must sit between the opening bid and the asking price.' };
  const fresh = blankLot({
    ...old, id: lotId(), ref: makeRef(), normal_eur: asking, open_eur: open, step_eur: defaultStep(open), reserve_eur: reserve, buy_now_eur: old.buy_now_eur ? asking : 0,
    status: 'open', starts_at: new Date(nowMs).toISOString(), ends_at: new Date(lotEndFor(old.seller, nowMs)).toISOString(),
    bids_count: 0, high_eur: 0, high_user: '', high_name: '', high_seq: 0, winner_user: '', winner_name: '', winner_eur: 0, passed: [], order_id: '', pay_by: '',
    closed_at: '', paid_at: '', epp_sent_at: '', domain_received_at: '', relist_count: old.relist_count + 1, relisted_from: old.id, relisted_to: '', cancel_reason: '',
    created_at: now(), updated_at: now(), created_by: actor.id,
  });
  // The old lot is unsold, so it no longer holds the domain's live-lot guard.
  await db.auctionLots.create(fresh);
  await db.auctionLots.update(old.id, (l) => ({ ...l, relisted_to: fresh.id, updated_at: now() }));
  return { ok: true, lot: fresh };
}

/* ---- bidding ---------------------------------------------------------------- */

export type BidResult = { ok: true; lot: AuctionLot; seq: number; extended: boolean } | { error: BidProblem | 'not_found' | 'no_name' | 'admin' | 'no_buy_now' | 'own_lot' };

export async function placeBid(user: Pick<User, 'id' | 'role'>, lotIdIn: string, amountIn: unknown, nowMs = Date.now()): Promise<BidResult> {
  if (user.role === 'admin') return { error: 'admin' };
  const db = await data();
  const bidder = await db.auctionBidders.get(user.id);
  if (!bidder?.display_name) return { error: 'no_name' };
  const cur = await db.auctionLots.get(lotIdIn);
  if (!cur) return { error: 'not_found' };
  if (cur.seller_user && cur.seller_user === user.id) return { error: 'own_lot' };
  const amount = Math.round(Number(String(amountIn ?? '').replace(/[^\d.]/g, '')) || 0);
  let problem = null as BidProblem | null;
  let seq = 0;
  let extended = false as boolean;
  const after = await db.auctionLots.update(lotIdIn, (l) => {
    problem = bidProblem(l, amount, user.id, nowMs);
    if (problem) return null;
    seq = l.high_seq + 1;
    const ends = extendedEnd(l.ends_at, nowMs);
    extended = ends !== l.ends_at;
    return { ...l, bids_count: l.bids_count + 1, high_eur: amount, high_user: user.id, high_name: bidder.display_name, high_seq: seq, ends_at: ends, updated_at: now() };
  });
  if (problem) return { error: problem };
  await db.auctionBids.createIfAbsent({ id: bidId(lotIdIn, seq), lot_id: lotIdIn, user_id: user.id, name: bidder.display_name, amount_eur: amount, buy_now: false, created_at: now() });
  return { ok: true, lot: after, seq, extended };
}

/** Buy now: the lot closes at once to this member at the buy-now price (while the bidding is below it). */
export async function buyNow(user: Pick<User, 'id' | 'role'>, lotIdIn: string, nowMs = Date.now()): Promise<BidResult> {
  if (user.role === 'admin') return { error: 'admin' };
  const db = await data();
  const bidder = await db.auctionBidders.get(user.id);
  if (!bidder?.display_name) return { error: 'no_name' };
  const cur = await db.auctionLots.get(lotIdIn);
  if (!cur) return { error: 'not_found' };
  if (cur.seller_user && cur.seller_user === user.id) return { error: 'own_lot' };
  let problem: BidProblem | 'no_buy_now' | null = null;
  let seq = 0;
  const after = await db.auctionLots.update(lotIdIn, (l) => {
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
  await db.auctionBids.createIfAbsent({ id: bidId(lotIdIn, seq), lot_id: lotIdIn, user_id: user.id, name: bidder.display_name, amount_eur: after.buy_now_eur, buy_now: true, created_at: now() });
  await openOrder(db, after);
  return { ok: true, lot: (await db.auctionLots.get(lotIdIn)) ?? after, seq, extended: false };
}

/* ---- closing and paying -------------------------------------------------------- */

const payBy = () => new Date(Date.now() + PAY_DAYS * DAY).toISOString();

/** Close every lot whose time is up (idempotent: the compare-and-swap lets one caller close each lot). */
export async function settleDue(nowMs = Date.now()): Promise<number> {
  const db = await data();
  const open = await db.auctionLots.list('status', 'open', { limit: 1000 });
  const due = open.entries.filter((e) => Date.parse(String(e.meta.ends ?? '')) <= nowMs);
  let closed = 0;
  for (const entry of due) {
    let changed = false as boolean;
    const after = await db.auctionLots.update(entry.id, (l) => {
      changed = false;
      if (l.status !== 'open' || Date.parse(l.ends_at) > nowMs) return null;
      changed = true;
      const outcome = outcomeOf(l);
      const at = now();
      return outcome === 'awaiting_payment'
        ? { ...l, status: outcome, winner_user: l.high_user, winner_name: l.high_name, winner_eur: l.high_eur, closed_at: at, pay_by: payBy(), updated_at: at }
        : { ...l, status: outcome, closed_at: at, updated_at: at };
    }).catch(() => null);
    if (after && changed) {
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
 * An auction order turned paid (the admin approved it, or PayPal confirmed it): the lot is sold and its assets
 * open; a member's sold domain records what is owed — 70 % to the seller once the buyer has the domain, 30 % sales
 * commission to xaa.es. A payment for a lot that was passed on or cancelled meanwhile is kept and flagged — the
 * money is real, the admin settles it by hand.
 */
export async function auctionOrderPaid(order: Pick<TemplateOrder, 'id' | 'auction_lot_id' | 'user_id'>): Promise<'sold' | 'already' | 'late' | 'none'> {
  if (!order.auction_lot_id) return 'none';
  const db = await data();
  let outcome = 'late' as 'sold' | 'already' | 'late';
  const lot = await db.auctionLots.update(order.auction_lot_id, (l) => {
    if (l.status === 'sold' && l.order_id === order.id) { outcome = 'already'; return null; }
    if (l.status !== 'awaiting_payment' || l.order_id !== order.id || l.winner_user !== order.user_id) { outcome = 'late'; return null; }
    outcome = 'sold';
    return { ...l, status: 'sold', paid_at: now(), updated_at: now() };
  });
  if (outcome !== 'late' && lot.seller === 'member') {
    const split = saleSplit(lot.winner_eur);
    await db.auctionPayouts.createIfAbsent({
      id: lot.id, lot_id: lot.id, lot_ref: lot.ref, domain: lot.domain, seller_user: lot.seller_user, final_eur: lot.winner_eur,
      commission_eur: split.commission, seller_eur: split.seller, status: lot.domain_received_at ? 'due' : 'awaiting_handover',
      method: '', reference: '', paid_at: '', paid_by: '', created_at: now(), updated_at: now(),
    });
  }
  return outcome;
}

/** The admin records that the seller's 70 % went out. */
export async function markPayoutPaid(lotIdIn: string, method: string, reference: string, by: string): Promise<{ ok: true } | { error: string }> {
  const db = await data();
  const cur = await db.auctionPayouts.get(lotIdIn);
  if (!cur) return { error: 'No payout for this lot.' };
  if (cur.status === 'paid') return { error: 'Already paid.' };
  if (cur.status !== 'due') return { error: 'The buyer has not confirmed the domain yet.' };
  await db.auctionPayouts.update(lotIdIn, (p) => (p.status === 'paid' ? null : { ...p, status: 'paid', method: method.slice(0, 40), reference: reference.slice(0, 120), paid_at: now(), paid_by: by, updated_at: now() }));
  return { ok: true };
}

/* ---- what people see ---------------------------------------------------------- */

/** The public list and the winners — from index summaries only (no lot documents read). */
export async function auctionCards(nowMs = Date.now()): Promise<{ live: LotCard[]; winners: LotCard[]; roundEndsAt: string }> {
  await Promise.all([settleDue(nowMs).catch(() => 0), syncProductLots(nowMs).catch(() => 0)]);
  const db = await data();
  const [open, won] = await Promise.all([db.auctionLots.list('status', 'open', { limit: 1000 }), db.auctionLots.list('won', 'all', { limit: 30 })]);
  const card = (e: { id: string; meta: Record<string, unknown> }) => ({ ...(e.meta as unknown as LotCard), id: e.id });
  return { live: open.entries.map(card), winners: won.entries.map(card), roundEndsAt: new Date(cycleEndAfter(nowMs)).toISOString() };
}

export async function getLot(id: string): Promise<AuctionLot | null> {
  return (await data()).auctionLots.get(id);
}

export async function getLotByRef(ref: string): Promise<AuctionLot | null> {
  if (!/^AUC-[A-Z0-9]{4,10}$/.test(ref)) return null;
  return (await data()).auctionLots.find('ref', ref);
}

export async function lotBids(lotIdIn: string): Promise<AuctionBid[]> {
  return (await data()).auctionBids.listAllDocs('lot', lotIdIn, 2000);
}

/** A seller page: the member's live lots and what they have sold (only while their page is switched on). */
export async function sellerPage(handle: string): Promise<{ name: string; since: string; live: LotCard[]; sold: number } | null> {
  if (!/^[a-z0-9-]{3,40}$/.test(handle)) return null;
  const db = await data();
  const bidder = await db.auctionBidders.find('handle', handle);
  if (!bidder || !bidder.seller_page) return null;
  const lots = await db.auctionLots.list('seller', bidder.id, { limit: 1000 });
  const cards = lots.entries.map((e) => ({ ...(e.meta as unknown as LotCard), id: e.id }));
  return { name: bidder.display_name, since: bidder.created_at, live: cards.filter((c) => c.status === 'open'), sold: cards.filter((c) => c.status === 'sold').length };
}

/** The member's side: their name, bids, wins, and what they sell (domains, lots, payouts). */
export async function memberAuction(userId: string) {
  await settleDue().catch(() => 0);
  const db = await data();
  const [bidder, bids, won, selling, domains, payouts] = await Promise.all([
    db.auctionBidders.get(userId), db.auctionBids.listAllDocs('user', userId, 1000), db.auctionLots.listAllDocs('winner', userId, 200),
    db.auctionLots.listAllDocs('seller', userId, 500), db.auctionDomains.listAllDocs('user', userId, 200), db.auctionPayouts.listAllDocs('seller', userId, 500),
  ]);
  const best = new Map<string, number>();
  for (const b of bids) best.set(b.lot_id, Math.max(best.get(b.lot_id) ?? 0, b.amount_eur));
  const bidLots = (await db.auctionLots.getMany([...best.keys()])).filter((l): l is AuctionLot => !!l);
  return {
    displayName: bidder?.display_name ?? '', handle: bidder?.handle ?? '', sellerPage: bidder?.seller_page ?? true, payoutMethod: bidder?.payout_method ?? '',
    bids: bidLots.map((l) => ({ lot: l, mine: best.get(l.id) ?? 0, leading: l.high_user === userId, next: nextBid(l) })),
    wins: won.filter((l) => l.winner_user === userId && (l.status === 'awaiting_payment' || l.status === 'sold')),
    selling, domains, payouts,
  };
}

export async function setSellerPage(userId: string, on: boolean): Promise<void> {
  const db = await data();
  if (await db.auctionBidders.get(userId)) await db.auctionBidders.update(userId, (b) => ({ ...b, seller_page: on, updated_at: now() }));
}

/** The Studio desk: every lot (closing due ones first), newest first; payouts. */
export async function deskLots(): Promise<AuctionLot[]> {
  await settleDue().catch(() => 0);
  return (await data()).auctionLots.listAllDocs('all', 'all', 2000);
}

export async function deskPayouts(): Promise<AuctionPayout[]> {
  return (await data()).auctionPayouts.listAllDocs('all', 'all', 2000);
}

export const lotSummaryOf = lotSummary;
