/**
 * Money for manual payments (docs/BLUEPRINT.md §12, request 61): the 13 wondr by BNI currency accounts and the
 * company wallets, the amount converted into the currency of the account the buyer chose, rounded up so the full
 * price always arrives, the unique IDR code that makes a transfer easy to match, and the 2 % bank-fee tolerance.
 *
 * Pure functions only — no storage, no network — so the unit tests run them directly. Prices on xaa.es are in EUR;
 * a rate is "units of the currency per 1 EUR" (the ECB convention).
 */

/** The currencies of the 13 wondr by BNI accounts, in the order the payment screen lists them. */
export const FIAT = ['IDR', 'USD', 'EUR', 'SGD', 'AUD', 'GBP', 'CNY', 'HKD', 'JPY', 'MYR', 'SAR', 'KRW', 'THB'] as const;
export type Fiat = (typeof FIAT)[number];

export const FIAT_INFO: Record<Fiat, { name: string; decimals: number; flag: string }> = {
  IDR: { name: 'Indonesian rupiah', decimals: 0, flag: '🇮🇩' },
  USD: { name: 'US dollar', decimals: 2, flag: '🇺🇸' },
  EUR: { name: 'Euro', decimals: 2, flag: '🇪🇺' },
  SGD: { name: 'Singapore dollar', decimals: 2, flag: '🇸🇬' },
  AUD: { name: 'Australian dollar', decimals: 2, flag: '🇦🇺' },
  GBP: { name: 'Pound sterling', decimals: 2, flag: '🇬🇧' },
  CNY: { name: 'Chinese yuan', decimals: 2, flag: '🇨🇳' },
  HKD: { name: 'Hong Kong dollar', decimals: 2, flag: '🇭🇰' },
  JPY: { name: 'Japanese yen', decimals: 0, flag: '🇯🇵' },
  MYR: { name: 'Malaysian ringgit', decimals: 2, flag: '🇲🇾' },
  SAR: { name: 'Saudi riyal', decimals: 2, flag: '🇸🇦' },
  KRW: { name: 'South Korean won', decimals: 0, flag: '🇰🇷' },
  THB: { name: 'Thai baht', decimals: 2, flag: '🇹🇭' },
};

/** The ECB publishes no SAR rate; the riyal has been pegged at 3.75 per US dollar since 1986. */
export const SAR_PER_USD = 3.75;

/** The coins of the company wallets. USDT is valued as US dollars; the others at their hourly market price. */
export const COINS = ['USDT', 'BTC', 'BNB', 'SOL', 'DOGE'] as const;
export type Coin = (typeof COINS)[number];

export const COIN_INFO: Record<Coin, { name: string; decimals: number; stable: boolean; gecko: string }> = {
  USDT: { name: 'Tether USD', decimals: 2, stable: true, gecko: 'tether' },
  BTC: { name: 'Bitcoin', decimals: 8, stable: false, gecko: 'bitcoin' },
  BNB: { name: 'BNB', decimals: 5, stable: false, gecko: 'binancecoin' },
  SOL: { name: 'Solana', decimals: 4, stable: false, gecko: 'solana' },
  DOGE: { name: 'Dogecoin', decimals: 2, stable: false, gecko: 'dogecoin' },
};

/** A bank-transfer or stablecoin amount stays the same for 72 hours on an invoice; a volatile coin for one hour. */
export const FIAT_LOCK_MS = 72 * 3600_000;
export const VOLATILE_LOCK_MS = 3600_000;
/** A transfer that arrives up to 2 % short (bank or network fees) is accepted and the difference recorded. */
export const FEE_TOLERANCE_PCT = 2;
/** The admin's margin on conversions is capped: a reference rate is a promise, not a profit centre. */
export const MAX_MARGIN_PCT = 5;

export const isFiat = (c: string): c is Fiat => (FIAT as readonly string[]).includes(c);
export const isCoin = (c: string): c is Coin => (COINS as readonly string[]).includes(c);

/** Round up to `decimals`, ignoring the float dust of a multiplication (1.1 × 3 must not become 3.31). */
export function ceilTo(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.ceil(Number((value * f).toFixed(4))) / f;
}

const marginOf = (pct: number) => 1 + Math.min(Math.max(Number.isFinite(pct) ? pct : 0, 0), MAX_MARGIN_PCT) / 100;

/**
 * The amount of `ccy` that settles `amountEur`. IDR is rounded up to whole thousands (the unique code then fills
 * the last three digits); JPY and KRW to whole units; everything else to the cent.
 */
export function fiatAmount(amountEur: number, ratePerEur: number, ccy: Fiat, marginPct = 0): number {
  if (ccy === 'EUR') return ceilTo(amountEur, 2);
  const raw = amountEur * ratePerEur * marginOf(marginPct);
  if (ccy === 'IDR') return Math.ceil(Number((raw / 1000).toFixed(4))) * 1000;
  return ceilTo(raw, FIAT_INFO[ccy].decimals);
}

/** The amount of a coin that settles `amountEur` at `priceEur` (EUR per coin), rounded up to the coin's precision. */
export function coinAmount(amountEur: number, priceEur: number, coin: Coin, marginPct = 0): number {
  if (!(priceEur > 0)) throw new Error(`No price for ${coin}.`);
  return ceilTo((amountEur / priceEur) * marginOf(marginPct), COIN_INFO[coin].decimals);
}

/** A stable 32-bit FNV-1a hash — the seed of an invoice's IDR code, so the same invoice keeps the same code. */
export function fnv1a(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** The first IDR code tried for an invoice: 1–999, never 000. */
export const idrCodeSeed = (invoiceKey: string) => (fnv1a(invoiceKey) % 999) + 1;
/** The next code to try when another open invoice already holds this total. */
export const nextIdrCode = (code: number) => (code % 999) + 1;

/** Did a transfer settle the invoice? Up to FEE_TOLERANCE_PCT short is accepted; the shortfall is reported either way. */
export function settles(paid: number, expected: number, decimals = 2): { ok: boolean; short: number; over: number } {
  const f = 10 ** decimals;
  const p = Math.round(paid * f);
  const e = Math.round(expected * f);
  return {
    ok: p * 100 >= e * (100 - FEE_TOLERANCE_PCT),
    short: Math.max(0, e - p) / f,
    over: Math.max(0, p - e) / f,
  };
}

/** "Rp 6.125.437", "€ 1,250.00", "¥ 182,400", "0.00183421 BTC" — the way the buyer's banking app shows it. */
export function formatAmount(amount: number, code: string, locale = 'en-GB'): string {
  const decimals = isFiat(code) ? FIAT_INFO[code].decimals : isCoin(code) ? COIN_INFO[code].decimals : 2;
  const n = amount.toLocaleString(code === 'IDR' ? 'id-ID' : locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return code === 'IDR' ? `Rp ${n}` : `${n} ${code}`;
}

/** The plain number a buyer types into a banking app: no grouping, a dot for decimals. */
export function plainAmount(amount: number, code: string): string {
  const decimals = isFiat(code) ? FIAT_INFO[code].decimals : isCoin(code) ? COIN_INFO[code].decimals : 2;
  return amount.toFixed(decimals);
}

/** Parse what a buyer typed as the amount they sent: "6.125.437", "6,125,437", "1 250,50", "0.0018". */
export function parseAmount(raw: string, code: string): number | null {
  const s = raw.replace(/[^\d.,]/g, '');
  if (!s) return null;
  const decimals = isFiat(code) ? FIAT_INFO[code].decimals : isCoin(code) ? COIN_INFO[code].decimals : 2;
  const last = Math.max(s.lastIndexOf('.'), s.lastIndexOf(','));
  const separators = (s.match(/[.,]/g) ?? []).length;
  const bothKinds = s.includes('.') && s.includes(',');
  // The last separator is the decimal point when both kinds appear ("1.250,50"); a lone separator followed by
  // exactly three digits is grouping for a currency with cents ("1,250" = 1250, "6.125.437" = 6125437).
  const decimalPoint =
    decimals > 0 && last >= 0 && (bothKinds || (separators === 1 && !(s.length - last - 1 === 3 && decimals <= 2)));
  const normal = decimalPoint ? `${s.slice(0, last).replace(/[.,]/g, '')}.${s.slice(last + 1)}` : s.replace(/[.,]/g, '');
  const n = Number(normal);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Bank codes the payment screen prints beside a SWIFT/BIC (Indonesian domestic transfers ask for the 3-digit code). */
export const BANK_CODES: Record<string, string> = { BNINIDJA: '009' };
