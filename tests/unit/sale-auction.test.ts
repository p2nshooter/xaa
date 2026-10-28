/**
 * The auction of xaa.es itself (docs/BLUEPRINT.md §14, requests 66 and 67): the weekly ladder of the opening bid
 * (US$10M from 28 Oct 2026, +US$100,000 a week, through every round), the bid rules and settings, and — on the exact in-memory R2 — the first round opening once,
 * registration and approval, races between bids, anti-snipe, settling an ended round, passing an unpaid win on,
 * marking a round sold and the next round after an unsold one.
 *
 *   node --test tests/unit/
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FakeR2, fakeClock } from '../../src/server/r2/fake.ts';
import { Store } from '../../src/server/r2/store.ts';
import { collections } from '../../src/server/r2/schema.ts';
import {
  MAX_BID_USD, SALE_AUCTION_DEFAULTS, ladderPrice, ladderStart, nextMinBid, nextRiseAt, parseBid, parseSaleAuction, publicRound,
  saleBidProblem, type RoundState,
} from '../../src/server/sale-auction-terms.ts';
import {
  closeDueRound, decideBidder, latestRound, markRoundSold, myAuction, passRound, placeSaleBid, registerBidder, roundBids, settle, startRound,
  type SaleState,
} from '../../src/server/sale-auction-store.ts';

const db = () => {
  const clock = fakeClock();
  return collections(new Store(new FakeR2({ now: clock.now }), { sleep: clock.sleep, now: clock.now }));
};
const SALE = (o: Partial<typeof SALE_AUCTION_DEFAULTS> = {}): SaleState => ({ mode: 'auction', status: 'open', auction: { ...SALE_AUCTION_DEFAULTS, ...o } });
const A = { id: 'u_a', email: 'a@example.com' }, B = { id: 'u_b', email: 'b@example.com' }, C = { id: 'u_c', email: 'c@example.com' };
const ADMIN = { id: 'u_admin', email: 'owner@xaa.es', role: 'admin' };
const reg = (name: string) => ({ displayName: name, company: `${name} Holdings`, country: 'Spain', phone: '+34 600 123 456', funds: 'Bank letter available' });
const T0 = Date.parse('2026-11-01T00:00:00Z');
const WEEK = 7 * 86_400_000;
const L = SALE_AUCTION_DEFAULTS;

describe('rules', () => {
  it('starts the opening bid at US$10M on 28 Oct 2026 (00:00 WIB) and adds US$100,000 for every full week', () => {
    const day1 = ladderStart(L);
    assert.equal(new Date(day1).toISOString(), '2026-10-27T17:00:00.000Z', '00:00 in Jakarta');
    assert.equal(ladderPrice(L, day1 - 1), 10_000_000, 'never below the start');
    assert.equal(ladderPrice(L, day1), 10_000_000);
    assert.equal(ladderPrice(L, day1 + WEEK - 1), 10_000_000);
    assert.equal(ladderPrice(L, day1 + WEEK), 10_100_000, 'week one ends 4 Nov');
    assert.equal(ladderPrice(L, day1 + 10 * WEEK + 3), 11_000_000);
    assert.equal(nextRiseAt(L, day1 + 1), '2026-11-03T17:00:00.000Z');
    assert.equal(nextRiseAt({ ...L, weeklyUsd: 0 }, day1 + 1), '', 'a flat opening bid never rises');
    assert.equal(ladderPrice({ ...L, weeklyUsd: 0 }, day1 + 50 * WEEK), 10_000_000);
  });

  it('reads the settings strings; anything unusable falls back to the default', () => {
    const s = parseSaleAuction({ sale_auction_start_usd: '5000000', sale_auction_weekly_usd: '50,000', sale_auction_from: '28/10/2026', sale_auction_step_usd: '500,000', sale_auction_days: '400', sale_auction_approval: 'no' });
    assert.equal(s.startUsd, 10_000_000, 'never below the owner\'s US$10M');
    assert.equal(s.weeklyUsd, 50_000);
    assert.equal(s.from, '2026-10-28', 'not a date');
    assert.equal(parseSaleAuction({ sale_auction_start_usd: '12000000', sale_auction_from: '2026-11-02' }).startUsd, 12_000_000);
    assert.equal(parseSaleAuction({ sale_auction_from: '2026-11-02' }).from, '2026-11-02');
    assert.equal(s.stepUsd, 500_000);
    assert.equal(s.days, SALE_AUCTION_DEFAULTS.days);
    assert.equal(s.approval, false);
    assert.deepEqual(parseSaleAuction({}), SALE_AUCTION_DEFAULTS);
  });

  it('accepts the opening bid of the day, then the high bid plus a step; the weekly rise applies mid-round; jump bids; never against yourself', () => {
    const r = (o: Partial<RoundState> = {}): RoundState => ({ status: 'open', starts_at: '2026-11-01T00:00:00Z', ends_at: '2026-11-15T00:00:00Z', open_usd: 10_000_000, step_usd: 250_000, bids_count: 0, high_usd: 0, high_user: '', ...o });
    const mid = Date.parse('2026-11-02T00:00:00Z');
    const floor = ladderPrice(L, mid);
    assert.equal(floor, 10_000_000);
    assert.equal(saleBidProblem(r(), 9_999_999, 'a', mid, floor), 'too_low');
    assert.equal(saleBidProblem(r(), 10_000_000, 'a', mid, floor), null);
    const led = r({ bids_count: 1, high_usd: 10_000_000, high_user: 'a' });
    assert.equal(nextMinBid(led, floor), 10_250_000);
    assert.equal(saleBidProblem(led, 50_000_000, 'b', mid, floor), null);
    assert.equal(saleBidProblem(led, 60_000_000, 'a', mid, floor), 'already_highest');
    assert.equal(saleBidProblem(led, MAX_BID_USD + 1, 'b', mid, floor), 'too_high');
    assert.equal(saleBidProblem(r(), 10_000_000, 'a', Date.parse('2026-11-15T00:00:00Z'), floor), 'ended');
    // After the rise of 4 Nov the opening bid of the day is US$10.1M: a lower first bid is refused, even in a round that opened earlier.
    const later = Date.parse('2026-11-05T00:00:00Z');
    assert.equal(saleBidProblem(r(), 10_000_000, 'a', later, ladderPrice(L, later)), 'too_low');
    assert.equal(nextMinBid(r(), ladderPrice(L, later)), 10_100_000);
    // And it is the floor for a later bid too, when it is above the high bid plus a step.
    assert.equal(nextMinBid(r({ bids_count: 1, high_usd: 9_000_000 }), 10_100_000), 10_100_000);
    assert.equal(parseBid('42,250,000'), 42_250_000);
    assert.ok(Number.isNaN(parseBid('42.5M')));
  });
});

describe('the auction on R2', () => {
  it('opens the first round once, even when reads overlap; one round at a time', async () => {
    const d = db();
    const [x, y] = await Promise.all([settle(d, SALE(), T0), settle(d, SALE(), T0)]);
    assert.equal([x.opened, y.opened].filter(Boolean).length, 1);
    const r = (await latestRound(d))!;
    assert.equal(r.id, 'sr_0001');
    assert.equal(r.open_usd, 10_000_000, 'the ladder\'s opening bid on 1 Nov');
    assert.equal(r.ends_at, '2026-11-15T00:00:00.000Z');
    assert.equal(await startRound(d, SALE().auction, 'admin', T0), null);
    assert.deepEqual(await settle(d, { ...SALE(), mode: 'fixed' }, T0), {});
  });

  it('registers bidders for approval; admins, unknown and refused members cannot bid', async () => {
    const d = db();
    await settle(d, SALE(), T0);
    const r = (await latestRound(d))!;
    assert.deepEqual(await placeSaleBid(d, A, r.open_usd, SALE(), T0 + 1), { error: 'not_registered' });
    assert.deepEqual(await registerBidder(d, A, { ...reg('Ana'), displayName: 'Amazon Spain' }, true), { error: 'brand' });
    const ok = await registerBidder(d, A, reg('Ana'), true);
    assert.ok('ok' in ok && ok.bidder.status === 'pending' && ok.isNew);
    assert.deepEqual(await placeSaleBid(d, A, r.open_usd, SALE(), T0 + 1), { error: 'pending' });
    await decideBidder(d, A.id, true, 'owner');
    assert.deepEqual(await placeSaleBid(d, ADMIN, r.open_usd, SALE(), T0 + 1), { error: 'admin' });
    await registerBidder(d, C, reg('Carla'), true);
    await decideBidder(d, C.id, false, 'owner');
    assert.deepEqual(await placeSaleBid(d, C, r.open_usd, SALE(), T0 + 1), { error: 'rejected' });
    const again = await registerBidder(d, C, reg('Carla'), true);
    assert.ok('ok' in again && again.bidder.status === 'rejected');
    const auto = await registerBidder(db(), B, reg('Bruno'), false);
    assert.ok('ok' in auto && auto.bidder.status === 'approved');
  });

  it('runs a round: race, anti-snipe, close to the winner, sold', async () => {
    const d = db();
    const sale = SALE({ approval: false });
    await settle(d, sale, T0);
    const r = (await latestRound(d))!;
    for (const [u, n] of [[A, 'Ana'], [B, 'Bruno'], [C, 'Carla']] as const) await registerBidder(d, u, reg(n), false);
    assert.ok('ok' in (await placeSaleBid(d, A, String(r.open_usd), sale, T0 + 1000)));
    const amount = r.open_usd + 250_000;
    const [b1, b2] = await Promise.all([placeSaleBid(d, B, amount, sale, T0 + 2000), placeSaleBid(d, C, amount, sale, T0 + 2000)]);
    assert.equal([b1, b2].filter((x) => 'ok' in x).length, 1, 'two equal bids at the same moment: one wins');
    const other = 'ok' in b1 ? C : B;
    const end = Date.parse(r.ends_at);
    const late = await placeSaleBid(d, other, amount + 1_000_000, sale, end - 3 * 60_000);
    assert.ok('ok' in late && late.extended && late.outbid);
    assert.equal(late.round.ends_at, new Date(end + 7 * 60_000).toISOString());
    assert.equal(await closeDueRound(d, end), null, 'extended');
    assert.deepEqual((await roundBids(d, r.id)).map((b) => b.amount_usd), [amount + 1_000_000, amount, r.open_usd]);
    const pub = publicRound((await latestRound(d))!, await roundBids(d, r.id), sale.auction, end);
    assert.equal(pub.openUsd, ladderPrice(L, end));
    assert.equal(pub.nextMinUsd, amount + 1_000_000 + 250_000);
    assert.match(pub.leader, /^[A-Z]•+$/);
    assert.ok(!JSON.stringify(pub).includes('@example.com'));

    const out = await settle(d, sale, end + 7 * 60_000);
    assert.equal(out.closed?.status, 'awaiting_payment');
    assert.equal(out.closed?.winner_user, other.id);
    assert.equal(out.opened, undefined, 'a won round opens nothing new');
    const me = await myAuction(d, other, (await latestRound(d))!);
    assert.equal(me.winner, true);
    assert.equal(me.amountUsd, amount + 1_000_000);
    const sold = await markRoundSold(d, r.id, 'wire received', end + 86_400_000);
    assert.ok(!('error' in sold) && sold.status === 'sold');
    assert.ok('error' in (await markRoundSold(d, r.id, '')), 'once');
  });

  it('passes an unpaid win to the next bidder; an unsold round is followed by a new one', async () => {
    const d = db();
    const sale = SALE({ approval: false });
    await settle(d, sale, T0);
    const r = (await latestRound(d))!;
    await registerBidder(d, A, reg('Ana'), false);
    await registerBidder(d, B, reg('Bruno'), false);
    await placeSaleBid(d, A, r.open_usd, sale, T0 + 1000);
    await placeSaleBid(d, B, r.open_usd + 500_000, sale, T0 + 2000);
    await settle(d, sale, Date.parse(r.ends_at));
    const passed = await passRound(d, r.id, Date.parse(r.ends_at) + 1);
    assert.ok(!('error' in passed) && passed.winner_user === A.id && passed.winner_usd === r.open_usd);
    const none = await passRound(d, r.id);
    assert.ok(!('error' in none) && none.status === 'unsold');

    const d2 = db();
    await settle(d2, SALE(), T0);
    const r1 = (await latestRound(d2))!;
    const out = await settle(d2, SALE(), Date.parse(r1.ends_at));
    assert.equal(out.closed?.status, 'unsold');
    assert.equal(out.opened?.id, 'sr_0002');
    const d3 = db();
    await settle(d3, SALE({ autoRestart: false }), T0);
    const r3 = (await latestRound(d3))!;
    const out3 = await settle(d3, SALE({ autoRestart: false }), Date.parse(r3.ends_at));
    assert.equal(out3.closed?.status, 'unsold');
    assert.equal(out3.opened, undefined);
  });
});
