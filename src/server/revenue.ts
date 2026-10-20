import { data } from './data';

/**
 * What counts as xaa.es revenue — one definition for the investor statements
 * (server/invest.ts) and anything else that reports money received.
 *
 * Counted: confirmed project payments (milestones) and paid template orders,
 * in euros, at the moment they were confirmed. Never counted: a PayPal sandbox
 * (test) payment, a PayPal payment that was refunded or reversed, anything
 * pending or rejected.
 *
 * Until 19 Oct 2026 this module also published that revenue to axto.io through
 * a token-locked GET /api/revenue, for a joint AXTO & XAA raise. The owner
 * separated the raises ("masing2 web nyari investornya, bukan gabungan"), so
 * the feed is gone: xaa.es revenue is read only inside xaa.es, for xaa.es
 * investors.
 */

export interface RevenueTx { at: string; amount: number; currency: 'EUR'; kind: 'milestone' | 'template' }

/** Confirmed revenue since a moment (ISO), oldest first. */
export async function revenueSince(sinceIso: string): Promise<RevenueTx[]> {
  const d = await data();
  // A PayPal payment counts unless it was taken in the sandbox or refunded / reversed afterwards.
  const [payments, orders, excluded] = await Promise.all([
    d.payments.listAllDocs('confirmed', 'all', 100_000),
    d.templateOrders.listAllDocs('paid', 'all', 100_000),
    d.checkouts.listAllDocs('excluded', 'all', 100_000),
  ]);
  const notPayments = new Set(excluded.flatMap((c) => (c.payment_id ? [c.payment_id] : [])));
  const notOrders = new Set(excluded.flatMap((c) => (c.template_order_id ? [c.template_order_id] : [])));
  const tx: { at: string; amount: number; kind: 'milestone' | 'template' }[] = [
    ...payments
      .filter((p) => p.status === 'confirmed' && p.confirmed_at && p.confirmed_at >= sinceIso && !notPayments.has(p.id))
      .map((p) => ({ at: p.confirmed_at!, amount: p.amount, kind: 'milestone' as const })),
    ...orders
      .filter((o) => o.status === 'paid' && o.confirmed_at && o.confirmed_at >= sinceIso && !notOrders.has(o.id))
      .map((o) => ({ at: o.confirmed_at!, amount: o.price, kind: 'template' as const })),
  ];
  return tx
    .filter((r) => Number(r.amount) > 0)
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((r) => ({ at: r.at, amount: Number(r.amount), currency: 'EUR' as const, kind: r.kind }));
}
