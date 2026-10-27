import { data } from './data';
import { appEnv } from './db';
import { COINS, COIN_INFO, FIAT, SAR_PER_USD, isCoin, type Coin, type Fiat } from '@/lib/pay-money';
import { buildQuote, type CoinPrices, type FiatRates, type QuoteLine } from './fx-quote';

export type { CoinPrices, FiatRates, QuoteLine };

/**
 * Reference rates and the amounts an invoice is quoted in (docs/BLUEPRINT.md §12.2).
 *
 * - Fiat: the ECB reference rates (through Frankfurter) once a day, one R2 document per day `fx/day-<date>`; SAR
 *   from the 3.75/USD peg. Coins: market prices (CoinGecko) once an hour, `fx/coins-<hour>`. Neither is a hot key.
 * - When a source is down, the latest stored rate of the last ten days (coins: six hours) is used and flagged as
 *   stale for the admin. With no rate at all, a currency is simply not quoted — the screen then says the bank
 *   converts from euros — rather than guessing.
 * - An invoice's quote is one document `payquote/<invoice>`: each currency's amount, the rate and the moment it
 *   expires (bank and USDT 72 hours, BTC/BNB/SOL/DOGE one hour). The IDR amount carries a 3-digit code no other open
 *   invoice holds, guarded by a create-once document `payidr/<amount>`.
 */

const FIAT_TARGETS = FIAT.filter((c) => c !== 'EUR' && c !== 'SAR');
const day = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const hour = (ms: number) => new Date(ms).toISOString().slice(0, 13);
// A source that just failed is not asked again on every page view for ten minutes.
const failedAt: { fiat: number; coins: number } = { fiat: 0, coins: 0 };
const RETRY_MS = 10 * 60_000;

/** Where the rates come from; a local test run may point both at a stand-in on localhost, nothing else. */
async function origins(): Promise<{ fiat: string; coins: string }> {
  const local = (await appEnv().catch(() => ({}) as { FX_ORIGIN?: string })).FX_ORIGIN;
  if (local && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(local.replace(/\/+$/, ''))) {
    const o = local.replace(/\/+$/, '');
    return { fiat: o, coins: o };
  }
  return { fiat: 'https://api.frankfurter.dev', coins: 'https://api.coingecko.com' };
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'xaa.es payments (+https://xaa.es)' }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`${new URL(url).host} answered ${res.status}`);
  return res.json();
}

async function fetchFiat(now: number): Promise<FiatRates> {
  const { fiat } = await origins();
  const body = (await getJson(`${fiat}/v1/latest?base=EUR&symbols=${FIAT_TARGETS.join(',')}`)) as { date?: string; rates?: Record<string, number> };
  const rates: Partial<Record<Fiat, number>> = { EUR: 1 };
  for (const c of FIAT_TARGETS) {
    const r = Number(body.rates?.[c]);
    if (r > 0) rates[c] = r;
  }
  if (!rates.USD) throw new Error('The reference rates came back without USD.');
  rates.SAR = Number((rates.USD * SAR_PER_USD).toFixed(6));
  return { date: String(body.date || day(now)).slice(0, 10), rates, source: 'ECB reference rates (Frankfurter); SAR at the 3.75 USD peg', fetched_at: new Date(now).toISOString() };
}

async function fetchCoins(now: number): Promise<CoinPrices> {
  const { coins } = await origins();
  const ids = COINS.filter((c) => !COIN_INFO[c].stable).map((c) => COIN_INFO[c].gecko);
  const body = (await getJson(`${coins}/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=eur`)) as Record<string, { eur?: number }>;
  const eur: Partial<Record<Coin, number>> = {};
  for (const c of COINS) {
    if (COIN_INFO[c].stable) continue;
    const p = Number(body[COIN_INFO[c].gecko]?.eur);
    if (p > 0) eur[c] = p;
  }
  if (!Object.keys(eur).length) throw new Error('The coin prices came back empty.');
  return { hour: hour(now), eur, source: 'CoinGecko market price', fetched_at: new Date(now).toISOString() };
}

/** Today's reference rates (EUR base), fetched once a day; the last stored day when the source is down. */
export async function fiatRates(now = Date.now(), opts: { refresh?: boolean } = {}): Promise<FiatRates | null> {
  const d = await data();
  const key = `fx/day-${day(now)}`;
  const stored = opts.refresh ? null : await d.store.getDoc<FiatRates | null>(key, null);
  if (stored) return stored;
  if (opts.refresh || now - failedAt.fiat > RETRY_MS) {
    try {
      const fresh = await fetchFiat(now);
      if (opts.refresh) return await d.store.updateDoc<FiatRates | null>(key, null, () => fresh) as FiatRates;
      return (await d.store.createDoc(key, fresh)).doc;
    } catch (err) {
      failedAt.fiat = now;
      console.error('reference rates unavailable, using the last stored day:', err);
    }
  }
  for (let i = 1; i <= 10; i += 1) {
    const prev = await d.store.getDoc<FiatRates | null>(`fx/day-${day(now - i * 86_400_000)}`, null);
    if (prev) return { ...prev, stale: true };
  }
  return null;
}

/** This hour's coin prices in EUR; the last stored hour (up to six back) when the source is down. */
export async function coinPrices(now = Date.now(), opts: { refresh?: boolean } = {}): Promise<CoinPrices | null> {
  const d = await data();
  const key = `fx/coins-${hour(now)}`;
  const stored = opts.refresh ? null : await d.store.getDoc<CoinPrices | null>(key, null);
  if (stored) return stored;
  if (opts.refresh || now - failedAt.coins > RETRY_MS) {
    try {
      const fresh = await fetchCoins(now);
      if (opts.refresh) return await d.store.updateDoc<CoinPrices | null>(key, null, () => fresh) as CoinPrices;
      return (await d.store.createDoc(key, fresh)).doc;
    } catch (err) {
      failedAt.coins = now;
      console.error('coin prices unavailable, using the last stored hour:', err);
    }
  }
  for (let i = 1; i <= 6; i += 1) {
    const prev = await d.store.getDoc<CoinPrices | null>(`fx/coins-${hour(now - i * 3_600_000)}`, null);
    if (prev) return { ...prev, stale: true };
  }
  return null;
}

/** The admin's margin on conversions, 0–5 % (Settings → Payments). */
export async function marginPct(): Promise<number> {
  const { getSetting } = await import('./settings');
  const n = Number((await getSetting('fx_margin_pct').catch(() => '')) || 0);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 5) : 0;
}

/** The coins a crypto destination accepts: its own currency, and BNB beside USDT on BNB Smart Chain (same address). */
export function coinsOf(dest: { currency: string; network: string | null }): Coin[] {
  const out: Coin[] = [];
  const cur = dest.currency.toUpperCase();
  if (isCoin(cur)) out.push(cur);
  if ((dest.network ?? '').toUpperCase() === 'BEP20' && !out.includes('BNB')) out.push('BNB');
  return out;
}

/**
 * Quote an invoice of `amountEur` in each of `assets` (fiat codes and coins) — see server/fx-quote.ts. Rates are
 * read only when a line has to be (re)computed.
 */
export async function quoteInvoice(invoice: string, amountEur: number, assets: string[], now = Date.now()): Promise<Record<string, QuoteLine>> {
  const d = await data();
  return buildQuote(d.store, {
    invoice, amountEur, assets, now,
    inputs: async (needCoins) => {
      const [fiat, coins, margin] = await Promise.all([fiatRates(now), needCoins ? coinPrices(now) : Promise.resolve(null), marginPct()]);
      return { fiat, coins, margin };
    },
  });
}

/** The one line a buyer says they paid with — recomputed on the server, never taken from the form. */
export async function expectedFor(invoice: string, amountEur: number, asset: string): Promise<QuoteLine | null> {
  const lines = await quoteInvoice(invoice, amountEur, [asset]);
  return lines[asset.toUpperCase()] ?? null;
}

/** For the admin's Payments page: today's rates and prices, and whether either is stale. */
export async function rateBoard(opts: { refresh?: boolean } = {}) {
  const now = Date.now();
  const [fiat, coins, margin] = await Promise.all([fiatRates(now, opts), coinPrices(now, opts), marginPct()]);
  return { fiat, coins, margin };
}
