import { newId, nowIso } from './db';
import { data } from './data';
import { getSettings } from './settings';
import { revenueSince } from './revenue';

/**
 * The investor offering of xaa.es — and of xaa.es only.
 *
 * Owner, 19 Oct 2026, looking at the old "joint offering for AXTO and XAA"
 * line on /acquire: "Maksudnya masing2 web nyari investornya, bukan gabungan"
 * — each site raises from its own investors. So xaa.es runs its own raise:
 * investors apply on /invest, the studio verifies the capital it received in
 * Studio desk → Investors, and each verified investor follows the xaa.es
 * revenue share in the portal (/portal/investor). axto.io raises separately,
 * on its own site, from its own revenue; nothing is pooled between the two.
 *
 * Terms come from Settings → Investor offering. Until the owner changes them,
 * the defaults are the terms the owner set for the raise on 14 Oct 2026
 * (guardian-ai docs/REQUESTS.md row 55), now applied to xaa.es alone: a pool
 * of 30 % of every confirmed xaa.es revenue transaction, shared pro rata to
 * capital against a US$2,000,000 target (US$50,000 → 0.75 %), minimum ticket
 * US$50,000, paid monthly until a full acquisition of xaa.es, when the capital
 * is returned in full.
 *
 * A raise of this kind is closed by written agreement and a SWIFT wire, so the
 * capital is confirmed by a person (the bank-wire exception of the zero-touch
 * rule); everything after that — the share, each month's revenue, what is due
 * and what is still open — is computed, never typed.
 */

export type InvestStatus = 'open' | 'paused' | 'closed';
export type InvestorStatus = 'applied' | 'verified' | 'declined' | 'returned';

export interface InvestOffer {
  status: InvestStatus;
  targetUsd: number;
  minUsd: number;
  /** Percentage of every confirmed revenue transaction that goes to investors (0–100). */
  poolPct: number;
  /** Whether /invest may be indexed by search engines. Off unless the owner turns it on. */
  indexed: boolean;
  /**
   * Whether the offering is shown at all — the admin's show/hide switch
   * (guardian-ai docs/BLUEPRINT-V4.md §26.4). Owner, 27 Oct 2026: "Investor
   * defoultnya ganti jadi show" — shown by default. While hidden: no footer
   * link, no sitemap entry, /invest is a 404 and applications are refused;
   * investors already verified keep their statement in the portal.
   */
  visible: boolean;
}

export const INVEST_DEFAULTS: InvestOffer = { status: 'open', targetUsd: 2_000_000, minUsd: 50_000, poolPct: 30, indexed: false, visible: true };

const digits = (v: unknown) => Number(String(v ?? '').replace(/[^\d.]/g, ''));

/** Stored strings → a usable offer; anything missing or out of range falls back to the default. */
export function parseInvest(raw: Record<string, string>): InvestOffer {
  const status: InvestStatus = raw.invest_status === 'paused' || raw.invest_status === 'closed' ? raw.invest_status : 'open';
  const target = digits(raw.invest_target_usd);
  const min = digits(raw.invest_min_usd);
  const pool = digits(raw.invest_pool_pct);
  const targetUsd = Number.isFinite(target) && target >= 10_000 ? Math.round(target) : INVEST_DEFAULTS.targetUsd;
  const minUsd = Number.isFinite(min) && min >= 1_000 && min <= targetUsd ? Math.round(min) : Math.min(INVEST_DEFAULTS.minUsd, targetUsd);
  const poolPct = Number.isFinite(pool) && pool > 0 && pool <= 100 ? pool : INVEST_DEFAULTS.poolPct;
  return { status, targetUsd, minUsd, poolPct, indexed: raw.invest_indexed === 'yes', visible: raw.invest_visible !== 'no' };
}

export const INVEST_KEYS = ['invest_visible', 'invest_status', 'invest_target_usd', 'invest_min_usd', 'invest_pool_pct', 'invest_indexed'];

/** Current terms. A database that cannot be read shows the defaults, never an error page. */
export async function getInvest(): Promise<InvestOffer> {
  try {
    return parseInvest(await getSettings(INVEST_KEYS));
  } catch {
    return { ...INVEST_DEFAULTS };
  }
}

/** Only the show/hide switch — what the footer on every page needs (one read instead of six). */
export async function investVisible(): Promise<boolean> {
  try {
    return (await getSettings(['invest_visible'])).invest_visible !== 'no';
  } catch {
    return INVEST_DEFAULTS.visible;
  }
}

/** Fraction (0–1) of each revenue transaction owed to an investor with this much verified capital. */
export function shareOf(capitalUsd: number, offer: Pick<InvestOffer, 'poolPct' | 'targetUsd'>): number {
  if (!(capitalUsd > 0) || !(offer.targetUsd > 0)) return 0;
  return Math.min(offer.poolPct / 100, (offer.poolPct / 100) * (capitalUsd / offer.targetUsd));
}

/** "0.75 %" — the share as investors read it. */
export function pct(fraction: number): string {
  const p = fraction * 100;
  return `${p.toLocaleString('en-US', { maximumFractionDigits: p < 1 ? 3 : 2 })} %`;
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  company: string | null;
  country: string | null;
  pledge_usd: number;
  capital_usd: number;
  method: string | null;
  status: InvestorStatus;
  lang: string;
  message: string | null;
  note: string | null;
  created_at: string;
  verified_at: string | null;
  verified_by: string | null;
  returned_at: string | null;
}

export interface Payout {
  id: string;
  investor_id: string;
  period: string;
  amount_eur: number;
  reference: string | null;
  paid_at: string;
  created_by: string | null;
}

export async function applyInvestor(input: {
  name: string; email: string; company?: string; country?: string; pledgeUsd: number; method?: string; lang?: string; message?: string;
}): Promise<string> {
  const id = newId();
  await (await data()).investors.create({
    id,
    name: input.name.slice(0, 120),
    email: input.email,
    company: (input.company ?? '').slice(0, 160) || null,
    country: (input.country ?? '').slice(0, 80) || null,
    pledge_usd: Math.round(input.pledgeUsd),
    capital_usd: 0,
    method: input.method || null,
    status: 'applied',
    lang: input.lang || 'en',
    message: (input.message ?? '').slice(0, 5000) || null,
    note: null,
    created_at: nowIso(),
    verified_at: null,
    verified_by: null,
    returned_at: null,
  });
  return id;
}

export async function listInvestors(): Promise<Investor[]> {
  return (await data()).investors.listAllDocs('all', 'all');
}

export async function getInvestor(id: string): Promise<Investor | null> {
  return (await data()).investors.get(id);
}

/** The verified (or since repaid) stakes held under this email, newest first. */
export async function investorsByEmail(email: string): Promise<Investor[]> {
  const all = await (await data()).investors.listAllDocs('email', email.trim().toLowerCase());
  return all
    .filter((i) => i.status === 'verified' || i.status === 'returned')
    .sort((a, b) => (b.verified_at ?? '').localeCompare(a.verified_at ?? ''));
}

/** Capital the raise has actually received (verified stakes still running). */
export async function raisedUsd(): Promise<number> {
  const all = await listInvestors();
  return all.filter((i) => i.status === 'verified').reduce((sum, i) => sum + Number(i.capital_usd || 0), 0);
}

/** applied/verified → verified (a re-verification corrects the amount); a declined or repaid stake is never revived. */
export async function verifyInvestor(id: string, capitalUsd: number, method: string, adminName: string): Promise<void> {
  const d = await data();
  if (!(await d.investors.get(id))) return;
  await d.investors.update(id, (i) =>
    i.status === 'applied' || i.status === 'verified'
      ? { ...i, status: 'verified', capital_usd: Math.round(capitalUsd), method: method || null, verified_at: nowIso(), verified_by: adminName }
      : null,
  );
}

export async function setInvestorStatus(id: string, status: 'declined' | 'returned', note: string, adminName: string): Promise<void> {
  const d = await data();
  if (!(await d.investors.get(id))) return;
  const stamp = nowIso();
  await d.investors.update(id, (i) => ({
    ...i,
    status,
    note: note.slice(0, 2000) || null,
    returned_at: status === 'returned' ? stamp : i.returned_at,
    verified_by: i.verified_by ?? adminName,
  }));
}

export async function recordPayout(investorId: string, period: string, amountEur: number, reference: string, adminName: string): Promise<void> {
  await (await data()).payouts.create({
    id: newId(),
    investor_id: investorId,
    period,
    amount_eur: Math.round(amountEur * 100) / 100,
    reference: reference.slice(0, 200) || null,
    paid_at: nowIso(),
    created_by: adminName,
  });
}

export async function listPayouts(investorId?: string): Promise<Payout[]> {
  const d = await data();
  return investorId ? d.payouts.listAllDocs('investor', investorId) : d.payouts.listAllDocs('all', 'all');
}

export interface StatementMonth {
  period: string;
  revenueEur: number;
  dueEur: number;
  paidEur: number;
}

export interface Statement {
  share: number;
  months: StatementMonth[];
  totalRevenueEur: number;
  totalDueEur: number;
  totalPaidEur: number;
  balanceEur: number;
}

const cents = (n: number) => Math.round(n * 100) / 100;

/**
 * Month by month, from the day the capital was verified (to the day it was
 * returned, if it has been): the confirmed xaa.es revenue, the investor's
 * share of it, and what has been paid. Revenue is the same definition
 * everywhere (server/revenue.ts): confirmed milestones and paid template
 * orders, never a PayPal sandbox payment nor a refunded or reversed one.
 */
export function buildStatement(
  investor: Pick<Investor, 'capital_usd' | 'verified_at' | 'returned_at'>,
  offer: Pick<InvestOffer, 'poolPct' | 'targetUsd'>,
  revenue: { at: string; amount: number }[],
  payouts: Pick<Payout, 'period' | 'amount_eur'>[],
): Statement {
  const share = shareOf(investor.capital_usd, offer);
  const from = investor.verified_at ?? '';
  const until = investor.returned_at ?? '9999';
  const byMonth = new Map<string, StatementMonth>();
  const month = (period: string) => {
    let m = byMonth.get(period);
    if (!m) byMonth.set(period, (m = { period, revenueEur: 0, dueEur: 0, paidEur: 0 }));
    return m;
  };
  if (from) {
    for (const tx of revenue) {
      if (tx.at < from || tx.at >= until) continue;
      month(tx.at.slice(0, 7)).revenueEur += tx.amount;
    }
  }
  for (const p of payouts) month(p.period).paidEur += Number(p.amount_eur);
  const months = [...byMonth.values()]
    .map((m) => ({ ...m, revenueEur: cents(m.revenueEur), dueEur: cents(m.revenueEur * share), paidEur: cents(m.paidEur) }))
    .sort((a, b) => a.period.localeCompare(b.period));
  const totalRevenueEur = cents(months.reduce((s, m) => s + m.revenueEur, 0));
  const totalDueEur = cents(months.reduce((s, m) => s + m.dueEur, 0));
  const totalPaidEur = cents(months.reduce((s, m) => s + m.paidEur, 0));
  return { share, months, totalRevenueEur, totalDueEur, totalPaidEur, balanceEur: cents(totalDueEur - totalPaidEur) };
}

/** The statement of one stake, read from the database. */
export async function statementFor(investor: Investor, offer?: InvestOffer): Promise<Statement> {
  const terms = offer ?? (await getInvest());
  const revenue = investor.verified_at ? await revenueSince(investor.verified_at) : [];
  return buildStatement(investor, terms, revenue, await listPayouts(investor.id));
}

export const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
export const eurAmount = (n: number) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
