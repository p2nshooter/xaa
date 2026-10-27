import type { Store } from './r2/store.ts';
import {
  COIN_INFO, FIAT_LOCK_MS, VOLATILE_LOCK_MS, coinAmount, fiatAmount, idrCodeSeed, isCoin, isFiat, nextIdrCode,
  type Coin, type Fiat,
} from '../lib/pay-money.ts';

/**
 * The quote of one invoice (docs/BLUEPRINT.md §12.2), on the R2 Store — relative imports only, so the unit tests
 * run it against the in-memory R2.
 *
 * `payquote/<invoice>`: each currency's amount, its rate and when it expires (bank and USDT 72 hours, BTC/BNB/SOL/
 * DOGE one hour). A line is kept while it is unexpired and the invoice amount is unchanged. The IDR amount carries
 * a 3-digit code no other open invoice holds: `payidr/<amount>` is created once and taken over only when expired.
 */

export interface FiatRates { date: string; rates: Partial<Record<Fiat, number>>; source: string; fetched_at: string; stale?: boolean }
export interface CoinPrices { hour: string; eur: Partial<Record<Coin, number>>; source: string; fetched_at: string; stale?: boolean }
export interface QuoteLine { asset: string; amount: number; rate: number; rate_date: string; until: string; stale?: boolean }
interface QuoteDoc { invoice: string; amount_eur: number; idr_code: number | null; lines: Record<string, QuoteLine>; updated_at: string }
interface IdrGuard { invoice: string; until: string }

const day = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Claim the IDR total `base + code`: free, ours already, or held by an expired quote. Returns the code claimed. */
export async function claimIdr(store: Store, invoice: string, base: number, first: number, until: string, now: number): Promise<number> {
  let code = first;
  for (let tries = 0; tries < 999; tries += 1) {
    const key = `payidr/${base + code}`;
    const mine: IdrGuard = { invoice, until };
    const { doc, created } = await store.createDoc<IdrGuard>(key, mine);
    if (created) return code;
    if (doc.invoice === invoice || Date.parse(doc.until) < now) {
      const taken = await store.updateDoc<IdrGuard>(key, mine, (cur) => (cur.invoice === invoice || Date.parse(cur.until) < now ? mine : null));
      if (taken.invoice === invoice) return code;
    }
    code = nextIdrCode(code);
  }
  throw new Error('No free IDR code — every code of this amount is held by an open invoice.');
}

export async function buildQuote(
  store: Store,
  q: {
    invoice: string; amountEur: number; assets: string[]; now: number;
    inputs: (needCoins: boolean) => Promise<{ fiat: FiatRates | null; coins: CoinPrices | null; margin: number }>;
  },
): Promise<Record<string, QuoteLine>> {
  const { invoice, amountEur, now } = q;
  const key = `payquote/${invoice}`;
  const blank: QuoteDoc = { invoice, amount_eur: amountEur, idr_code: null, lines: {}, updated_at: new Date(now).toISOString() };
  const cur = await store.getDoc<QuoteDoc>(key, blank);
  const sameAmount = cur.amount_eur === amountEur;
  const want = [...new Set(q.assets.map((a) => a.toUpperCase()))].filter((a) => isFiat(a) || isCoin(a));
  const live = (a: string) => Boolean(sameAmount && cur.lines[a] && Date.parse(cur.lines[a].until) > now);
  const missing = want.filter((a) => !live(a));
  if (!missing.length) return Object.fromEntries(want.map((a) => [a, cur.lines[a]]));

  const { fiat, coins, margin } = await q.inputs(missing.some((a) => isCoin(a) && !COIN_INFO[a as Coin].stable));
  const fresh: Record<string, QuoteLine> = {};
  let idrCode = sameAmount ? cur.idr_code : null;
  for (const a of missing) {
    if (isFiat(a)) {
      const rate = a === 'EUR' ? 1 : fiat?.rates[a];
      if (!rate) continue;
      const until = new Date(now + FIAT_LOCK_MS).toISOString();
      let amount = fiatAmount(amountEur, rate, a, a === 'EUR' ? 0 : margin);
      if (a === 'IDR') {
        idrCode = await claimIdr(store, invoice, amount, idrCode ?? idrCodeSeed(invoice), until, now);
        amount += idrCode;
      }
      fresh[a] = { asset: a, amount, rate, rate_date: a === 'EUR' ? day(now) : fiat!.date, until, ...(a !== 'EUR' && fiat?.stale ? { stale: true } : {}) };
    } else if (isCoin(a)) {
      const stable = COIN_INFO[a].stable;
      // USDT is a dollar: quoted at the EUR→USD reference rate and held like a bank transfer.
      const priceEur = stable ? (fiat?.rates.USD ? 1 / fiat.rates.USD : 0) : coins?.eur[a] ?? 0;
      if (!(priceEur > 0)) continue;
      const until = new Date(now + (stable ? FIAT_LOCK_MS : VOLATILE_LOCK_MS)).toISOString();
      const stale = stable ? fiat?.stale : coins?.stale;
      fresh[a] = {
        asset: a, amount: coinAmount(amountEur, priceEur, a, margin), rate: Number((1 / priceEur).toPrecision(8)),
        rate_date: stable ? fiat!.date : `${coins!.hour}:00Z`, until, ...(stale ? { stale: true } : {}),
      };
    }
  }

  const saved = await store.updateDoc<QuoteDoc>(key, blank, (doc) => {
    const keep = doc.amount_eur === amountEur ? doc.lines : {};
    const lines = { ...keep };
    let changed = doc.amount_eur !== amountEur;
    for (const [a, line] of Object.entries(fresh)) {
      // Another view of the same invoice locked this line a moment ago: theirs stands.
      if (keep[a] && Date.parse(keep[a].until) > now) continue;
      lines[a] = line;
      changed = true;
    }
    const idr = fresh.IDR && lines.IDR === fresh.IDR ? idrCode : doc.amount_eur === amountEur ? doc.idr_code : null;
    return changed ? { invoice, amount_eur: amountEur, idr_code: idr, lines, updated_at: new Date(now).toISOString() } : null;
  });
  return Object.fromEntries(want.flatMap((a) => (saved.lines[a] ? [[a, saved.lines[a]]] : [])));
}
