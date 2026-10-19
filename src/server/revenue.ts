import { db } from './db';

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

// A PayPal payment counts unless it was taken in the sandbox or refunded / reversed afterwards.
const NOT_EXCLUDED = (col: string) => `NOT EXISTS (
  SELECT 1 FROM paypal_checkouts c
   WHERE c.${col}
     AND (c.env = 'sandbox' OR c.detail LIKE 'PayPal refunded%' OR c.detail LIKE 'PayPal reversed%'))`;

/** Confirmed revenue since a moment (ISO), oldest first. */
export async function revenueSince(sinceIso: string): Promise<RevenueTx[]> {
  const database = await db();
  const { results } = await database
    .prepare(
      `SELECT p.confirmed_at AS at, p.amount AS amount, 'milestone' AS kind FROM payments p
        WHERE p.status = 'confirmed' AND p.confirmed_at IS NOT NULL AND p.confirmed_at >= ?
          AND ${NOT_EXCLUDED('payment_id = p.id')}
       UNION ALL
       SELECT t.confirmed_at AS at, t.price AS amount, 'template' AS kind FROM template_orders t
        WHERE t.status = 'paid' AND t.confirmed_at IS NOT NULL AND t.confirmed_at >= ?
          AND ${NOT_EXCLUDED('template_order_id = t.id')}
       ORDER BY at`,
    )
    .bind(sinceIso, sinceIso)
    .all<{ at: string; amount: number; kind: 'milestone' | 'template' }>();
  return (results ?? [])
    .filter((r) => Number(r.amount) > 0)
    .map((r) => ({ at: r.at, amount: Number(r.amount), currency: 'EUR' as const, kind: r.kind }));
}
