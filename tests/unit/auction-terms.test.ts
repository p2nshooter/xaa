/**
 * The auction rules that money depends on (docs/BLUEPRINT.md §10.3, §10.6).
 *
 *   node --test tests/unit/
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEFAULT_OPEN_PCT, DEFAULT_STEP_PCT, MEMBER_COMMISSION_PCT, defaultOpening, defaultStep, nextBid, saleSplit } from '../../src/server/auction-terms.ts';

describe('auction prices (request 59)', () => {
  it('opens at 35 % of the normal price and raises by 5 % of the opening bid', () => {
    assert.equal(DEFAULT_OPEN_PCT, 35);
    assert.equal(DEFAULT_STEP_PCT, 5);
    assert.equal(defaultOpening(1000), 350);
    assert.equal(defaultStep(350), 18); // 17.50, rounded up to whole euros
  });

  it('walks up one step at a time and stops at the normal price', () => {
    const lot = { bids_count: 0, high_eur: 0, open_eur: 350, step_eur: 18, normal_eur: 1000 };
    assert.equal(nextBid(lot), 350);
    assert.equal(nextBid({ ...lot, bids_count: 1, high_eur: 350 }), 368);
    assert.equal(nextBid({ ...lot, bids_count: 30, high_eur: 990 }), 1000);
  });
});

describe('sales commission on member domains (requests 59, 63)', () => {
  it('is 30 % of the final price, the seller keeps 70 %', () => {
    assert.equal(MEMBER_COMMISSION_PCT, 30);
    assert.deepEqual(saleSplit(1000), { commission: 300, seller: 700 });
  });

  it('is exact to the cent and always adds up to the final price', () => {
    for (const price of [1, 7, 33, 99.99, 1234.56, 250_000]) {
      const { commission, seller } = saleSplit(price);
      assert.equal(Math.round((commission + seller) * 100), Math.round(price * 100), `price ${price}`);
      assert.ok(commission >= 0 && seller >= 0);
    }
    assert.deepEqual(saleSplit(33), { commission: 9.9, seller: 23.1 });
  });
});

import {
  AUCTION_ANCHOR_MS, CYCLE_MS, LOT_DAYS, cleanDomain, domainParts, domainProblem, dnsRecordName, dnsRecordValue, filterLots, lotEndFor,
  lotSummary, parseLotFilter, sellerMaySell, txtHasToken, type LotCard,
} from '../../src/server/auction-terms.ts';

describe('who sells what (request 59)', () => {
  it('members sell domains only, xaa.es its scripts, the admin everything — website + domain is the admin\'s alone', () => {
    assert.equal(sellerMaySell('member', 'domain'), true);
    for (const t of ['website', 'script', 'website_domain'] as const) assert.equal(sellerMaySell('member', t), false, t);
    assert.equal(sellerMaySell('xaa', 'script'), true);
    assert.equal(sellerMaySell('xaa', 'domain'), false);
    for (const t of ['website', 'script', 'website_domain', 'domain'] as const) assert.equal(sellerMaySell('admin', t), true, t);
  });
});

describe('how long a lot runs', () => {
  it('runs exactly 14 days from its start', () => {
    const start = Date.UTC(2026, 9, 28, 10, 17);
    assert.equal(lotEndFor('member', start) - start, LOT_DAYS * 86_400_000);
    assert.equal(lotEndFor('admin', start) - start, 14 * 86_400_000);
  });
  it('xaa.es products end on the Friday 07:00 WIB grid (00:00 UTC)', () => {
    const end = lotEndFor('xaa', Date.UTC(2026, 9, 28, 10, 17));
    assert.equal(end, AUCTION_ANCHOR_MS);
    assert.equal(new Date(end).getUTCDay(), 5);
    assert.equal(new Date(end).getUTCHours(), 0);
    assert.equal(lotEndFor('xaa', AUCTION_ANCHOR_MS), AUCTION_ANCHOR_MS + CYCLE_MS);
  });
});

describe('a member\'s domain', () => {
  it('is cleaned the way people type it', () => {
    assert.equal(cleanDomain(' https://WWW.Shop-Kita.COM/path?x=1 '), 'shop-kita.com');
    assert.equal(cleanDomain('kopi.co.id.'), 'kopi.co.id');
    assert.equal(cleanDomain('xn--mnchen-3ya.de'), 'xn--mnchen-3ya.de');
    assert.equal(cleanDomain('not a domain'), null);
    assert.deepEqual(domainParts('shop.co.uk'), { name: 'shop', tld: 'co.uk' });
  });
  it('refuses the owner\'s own sites and other people\'s brands', () => {
    assert.equal(domainProblem('xaa.es'), 'ours');
    assert.equal(domainProblem('shop.axto.io'), 'ours');
    assert.equal(domainProblem('ulyah.com'), 'ours');
    assert.equal(domainProblem('cheap-g00gle-ads.com'), 'brand');
    assert.equal(domainProblem('paypal-help.net'), 'brand');
    assert.equal(domainProblem('kopikenangan.id'), null);
    assert.equal(domainProblem('??'), 'shape');
  });
  it('is proven by a TXT record both resolvers see, quoted or split', () => {
    assert.equal(dnsRecordName('kopi.id'), '_xaa-verify.kopi.id');
    assert.equal(dnsRecordValue('ab12'), 'xaa-verify=ab12');
    assert.equal(txtHasToken(['"xaa-verify=ab12"'], 'ab12'), true);
    assert.equal(txtHasToken(['"xaa-veri" "fy=ab12"'], 'ab12'), true);
    assert.equal(txtHasToken(['"google-site-verification=x"', '"xaa-verify=zz"'], 'ab12'), false);
    assert.equal(txtHasToken([], 'ab12'), false);
  });
});

describe('the public list: ending soonest first, domain filters', () => {
  const now = Date.UTC(2026, 10, 1, 12);
  const base = {
    ref: 'AUC-X', type: 'domain' as const, category: 'domains', title: '', status: 'open' as const, seller: 'member' as const, seller_name: 'Seller',
    normal_eur: 1000, open_eur: 350, step_eur: 18, high_eur: 0, bids_count: 0, reserve_eur: 0, buy_now_eur: 0, starts_at: new Date(now - 3_600_000).toISOString(),
    ends_at: '', domain: '', site_lang: '', images: [], winner_name: '', winner_eur: 0, paid_at: '', closed_at: '', created_at: '',
  };
  const card = (o: Partial<typeof base>, id: string): LotCard => ({ ...lotSummary({ ...base, ...o }), id });
  const hours = (h: number) => new Date(now + h * 3_600_000).toISOString();
  const cards = [
    card({ domain: 'kopi.com', title: 'kopi.com', ends_at: hours(30), bids_count: 3, high_eur: 386 }, 'a'),
    card({ domain: 'teh-hijau.id', title: 'teh-hijau.id', ends_at: hours(2), reserve_eur: 500 }, 'b'),
    card({ domain: 'shop24.com', title: 'shop24.com', ends_at: hours(200), buy_now_eur: 1000 }, 'c'),
    card({ type: 'script', domain: '', title: 'Waitlist — full source code', seller: 'xaa', ends_at: hours(100) }, 'd'),
    card({ domain: 'old.com', title: 'old.com', ends_at: hours(-1) }, 'gone'),
  ];
  const list = (qs: string) => filterLots(cards, parseLotFilter(new URLSearchParams(qs)), now).map((c) => c.id);

  it('shows only running lots, the one ending soonest on top', () => {
    assert.deepEqual(list(''), ['b', 'a', 'd', 'c']);
  });
  it('filters like a domain auction site', () => {
    assert.deepEqual(list('tld=com'), ['a', 'c']);
    assert.deepEqual(list('q=kop&qmode=starts'), ['a']);
    assert.deepEqual(list('q=com&qmode=ends'), []);
    assert.deepEqual(list('nohyphen=1&nodigits=1&type=domain'), ['a']);
    assert.deepEqual(list('maxlen=4'), ['a']);
    assert.deepEqual(list('ends=24h'), ['b']);
    assert.deepEqual(list('buynow=1'), ['c']);
    assert.deepEqual(list('noreserve=1&type=domain'), ['a', 'c']);
    assert.deepEqual(list('seller=xaa'), ['d']);
    assert.deepEqual(list('min=380'), ['a']);
  });
  it('sorts by price, bids, name and length too', () => {
    assert.deepEqual(list('sort=price_desc&type=domain'), ['a', 'b', 'c']);
    assert.deepEqual(list('sort=bids&type=domain'), ['a', 'b', 'c']);
    assert.deepEqual(list('sort=az&type=domain'), ['a', 'c', 'b']);
    assert.deepEqual(list('sort=shortest&type=domain'), ['a', 'c', 'b']);
  });
  it('ignores anything it does not know', () => {
    const f = parseLotFilter(new URLSearchParams('sort=evil&type=car&tld=<script>&min=abc'));
    assert.equal(f.sort, 'ending');
    assert.equal(f.type, undefined);
    assert.equal(f.tld, 'script');
    assert.equal(f.minPrice, undefined);
  });
});
