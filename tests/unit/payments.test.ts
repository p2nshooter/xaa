/**
 * Manual payments (docs/BLUEPRINT.md §12, request 61): the conversion into the BNI account's currency, rounding,
 * the unique IDR code, the 2 % fee tolerance, what a buyer types as the amount, the QR drawing, and the invoice
 * quote on the in-memory R2 — locked 72 hours (coins one hour), recomputed after, IDR codes never shared.
 *
 *   node --test tests/unit/
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ceilTo, coinAmount, fiatAmount, formatAmount, idrCodeSeed, nextIdrCode, parseAmount, plainAmount, settles, FIAT, FIAT_INFO,
} from '../../src/lib/pay-money.ts';
import { buildQuote, claimIdr, type CoinPrices, type FiatRates } from '../../src/server/fx-quote.ts';
import { FakeR2, fakeClock } from '../../src/server/r2/fake.ts';
import { Store } from '../../src/server/r2/store.ts';

const FIAT_RATES: FiatRates = {
  date: '2026-10-27', source: 'test', fetched_at: '2026-10-27T00:00:00Z',
  rates: { EUR: 1, USD: 1.0812, IDR: 17512.35, SGD: 1.4421, AUD: 1.6533, GBP: 0.8457, CNY: 7.7621, HKD: 8.4102, JPY: 164.92, MYR: 4.8803, SAR: 4.0545, KRW: 1489.7, THB: 36.88 },
};
const COIN_PRICES: CoinPrices = { hour: '2026-10-27T10', source: 'test', fetched_at: '2026-10-27T10:00:00Z', eur: { BTC: 61234.5, BNB: 543.21, SOL: 151.7, DOGE: 0.1432 } };

describe('conversion into the account currency', () => {
  it('rounds up, never down, without float dust', () => {
    assert.equal(ceilTo(3.3, 2), 3.3);
    assert.equal(ceilTo(1.1 * 3, 2), 3.3);
    assert.equal(ceilTo(10.001, 2), 10.01);
    assert.equal(fiatAmount(1250, 1.0812, 'USD'), 1351.5);
    assert.equal(fiatAmount(999, 1.0812, 'USD'), 1080.12); // 1080.1188 → up
    assert.equal(fiatAmount(1250, 1, 'EUR'), 1250);
  });
  it('IDR to whole thousands (the code fills the rest); JPY and KRW to whole units', () => {
    assert.equal(fiatAmount(350, 17512.35, 'IDR'), 6_130_000); // 6,129,322.5 → 6,130,000
    assert.equal(fiatAmount(350, 164.92, 'JPY'), 57_722);
    assert.equal(fiatAmount(350, 1489.7, 'KRW'), 521_395);
    for (const c of FIAT) assert.ok(FIAT_INFO[c].decimals === 0 || FIAT_INFO[c].decimals === 2);
  });
  it('a margin is applied and capped at 5 %', () => {
    assert.equal(fiatAmount(1000, 1.08, 'USD', 2), 1101.6);
    assert.equal(fiatAmount(1000, 1.08, 'USD', 50), fiatAmount(1000, 1.08, 'USD', 5));
    assert.equal(fiatAmount(1000, 1.08, 'USD', -3), 1080);
  });
  it('coins at their precision', () => {
    assert.equal(coinAmount(350, 61234.5, 'BTC'), 0.00571574);
    assert.equal(coinAmount(350, 0.1432, 'DOGE'), 2444.14);
    assert.throws(() => coinAmount(350, 0, 'SOL'));
  });
});

describe('IDR code, tolerance, typed amounts', () => {
  it('the code is 1–999, stable per invoice, and cycles without 000', () => {
    for (const k of ['order-a', 'order-b', 'ms-x-deposit', '']) {
      const c = idrCodeSeed(k);
      assert.ok(c >= 1 && c <= 999);
      assert.equal(idrCodeSeed(k), c);
    }
    assert.equal(nextIdrCode(999), 1);
    assert.equal(nextIdrCode(41), 42);
  });
  it('up to 2 % short is accepted, the shortfall reported either way', () => {
    assert.deepEqual(settles(98, 100), { ok: true, short: 2, over: 0 });
    assert.equal(settles(97.99, 100).ok, false);
    assert.deepEqual(settles(6_125_437, 6_125_437, 0), { ok: true, short: 0, over: 0 });
    assert.equal(settles(101, 100).over, 1);
  });
  it('reads what buyers type in any locale', () => {
    assert.equal(parseAmount('6.125.437', 'IDR'), 6125437);
    assert.equal(parseAmount('Rp 6,125,437', 'IDR'), 6125437);
    assert.equal(parseAmount('1,250', 'USD'), 1250);
    assert.equal(parseAmount('1.250,50', 'EUR'), 1250.5);
    assert.equal(parseAmount('1,250.50', 'EUR'), 1250.5);
    assert.equal(parseAmount('1351.5', 'USD'), 1351.5);
    assert.equal(parseAmount('0.00571574', 'BTC'), 0.00571574);
    assert.equal(parseAmount('0,005', 'BTC'), 0.005);
    assert.equal(parseAmount('', 'USD'), null);
    assert.equal(parseAmount('abc', 'USD'), null);
  });
  it('formats like a banking app and copies as a plain number', () => {
    assert.equal(formatAmount(6125437, 'IDR'), 'Rp 6.125.437');
    assert.equal(formatAmount(1351.5, 'USD'), '1,351.50 USD');
    assert.equal(formatAmount(0.00571574, 'BTC'), '0.00571574 BTC');
    assert.equal(plainAmount(1351.5, 'USD'), '1351.50');
    assert.equal(plainAmount(6125437, 'IDR'), '6125437');
  });
});

describe('QR drawing', async () => {
  const { qrSvg, qrMatrix } = await import('../../src/lib/qr.ts');
  it('the SVG path draws exactly the matrix', () => {
    const text = 'TQ5x9ExampleTronAddressOnly4Test00';
    const m = qrMatrix(text);
    const svg = qrSvg(text, { border: 2 });
    const size = m.length;
    const drawn = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
    for (const [, x, y, w] of svg.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)) {
      for (let i = 0; i < Number(w); i += 1) drawn[Number(y) - 2][Number(x) - 2 + i] = true;
    }
    assert.deepEqual(drawn, m);
    assert.match(svg, /viewBox="0 0 (\d+) \1"/);
    assert.ok(svg.length < 6000);
    // finder patterns in three corners
    for (const [r, c] of [[0, 0], [0, size - 7], [size - 7, 0]]) assert.ok(m[r][c] && m[r + 6][c + 6] && !m[r + 1][c + 1] && m[r + 3][c + 3]);
  });
});

function setup() {
  const clock = fakeClock(Date.parse('2026-10-27T10:00:00Z'));
  const store = new Store(new FakeR2({ now: clock.now }), { now: clock.now, sleep: async (ms) => clock.advance(ms) });
  let reads = 0;
  const inputs = async (needCoins: boolean) => { reads += 1; return { fiat: FIAT_RATES, coins: needCoins ? COIN_PRICES : null, margin: 0 }; };
  return { clock, store, inputs, reads: () => reads };
}

describe('invoice quotes on R2', () => {
  it('quotes every account and wallet, IDR with its code, and holds them', async () => {
    const { clock, store, inputs, reads } = setup();
    const q = await buildQuote(store, { invoice: 'order-1', amountEur: 350, assets: [...FIAT, 'USDT', 'BTC', 'BNB', 'SOL', 'DOGE'], now: clock.now(), inputs });
    assert.equal(Object.keys(q).length, 18);
    assert.equal(q.EUR.amount, 350);
    assert.equal(q.USD.amount, 378.42);
    assert.equal(q.SAR.amount, ceilTo(350 * 4.0545, 2));
    assert.equal(q.IDR.amount, 6_130_000 + idrCodeSeed('order-1'));
    assert.equal(q.USDT.amount, ceilTo(350 / (1 / 1.0812), 2));
    assert.equal(q.BTC.amount, 0.00571574);
    assert.equal(Date.parse(q.USD.until) - clock.now(), 72 * 3600_000);
    assert.equal(Date.parse(q.BTC.until) - clock.now(), 3600_000);
    // A second view changes nothing and reads no rates.
    const again = await buildQuote(store, { invoice: 'order-1', amountEur: 350, assets: ['IDR', 'USD', 'BTC'], now: clock.now(), inputs });
    assert.deepEqual(again.IDR, q.IDR);
    assert.equal(reads(), 1);
  });

  it('a coin is re-priced after its hour, a bank amount after 72 hours', async () => {
    const { clock, store, inputs } = setup();
    const first = await buildQuote(store, { invoice: 'order-2', amountEur: 500, assets: ['USD', 'BTC'], now: clock.now(), inputs });
    clock.advance(2 * 3600_000);
    const later = await buildQuote(store, { invoice: 'order-2', amountEur: 500, assets: ['USD', 'BTC'], now: clock.now(), inputs });
    assert.deepEqual(later.USD, first.USD);
    assert.notEqual(later.BTC.until, first.BTC.until);
    clock.advance(71 * 3600_000);
    const expired = await buildQuote(store, { invoice: 'order-2', amountEur: 500, assets: ['USD'], now: clock.now(), inputs });
    assert.notEqual(expired.USD.until, first.USD.until);
  });

  it('a changed invoice amount is quoted again', async () => {
    const { clock, store, inputs } = setup();
    const a = await buildQuote(store, { invoice: 'ms-p-deposit', amountEur: 100, assets: ['USD'], now: clock.now(), inputs });
    const b = await buildQuote(store, { invoice: 'ms-p-deposit', amountEur: 120, assets: ['USD'], now: clock.now(), inputs });
    assert.equal(a.USD.amount, 108.12);
    assert.equal(b.USD.amount, 129.75);
  });

  it('two open invoices never share an IDR total; an expired one frees its code', async () => {
    const { clock, store } = setup();
    const until = new Date(clock.now() + 72 * 3600_000).toISOString();
    const base = 6_130_000;
    const [a, b, c] = await Promise.all([
      claimIdr(store, 'inv-a', base, 17, until, clock.now()),
      claimIdr(store, 'inv-b', base, 17, until, clock.now()),
      claimIdr(store, 'inv-c', base, 17, until, clock.now()),
    ]);
    assert.equal(new Set([a, b, c]).size, 3);
    assert.equal(await claimIdr(store, 'inv-a', base, a, until, clock.now()), a); // ours stays ours
    clock.advance(73 * 3600_000);
    const later = new Date(clock.now() + 72 * 3600_000).toISOString();
    assert.equal(await claimIdr(store, 'inv-d', base, 17, later, clock.now()), 17); // the expired holder lost it
  });

  it('without a rate a currency is not quoted rather than guessed', async () => {
    const { clock, store } = setup();
    const none = async () => ({ fiat: null, coins: null, margin: 0 });
    const q = await buildQuote(store, { invoice: 'order-3', amountEur: 350, assets: ['EUR', 'USD', 'IDR', 'BTC', 'USDT'], now: clock.now(), inputs: none });
    assert.deepEqual(Object.keys(q), ['EUR']);
  });
});
