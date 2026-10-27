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
