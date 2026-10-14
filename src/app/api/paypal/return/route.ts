import { NextResponse, type NextRequest } from 'next/server';
import { checkoutPage as destination, getCheckout, settleCheckout } from '@/server/paypal';

/**
 * The buyer is back from paypal.com: capture the order and book it, then send
 * them to the page they paid from with the outcome in the query string.
 *
 * No session is needed: capturing only completes a payment the buyer has
 * just approved, the checkout id and PayPal's token must match our own
 * record, and the amount was fixed when the checkout was created.
 */
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('c') ?? '';
  const token = url.searchParams.get('token') ?? '';
  // A relative Location keeps the buyer on the host they came from (xaa.es or
  // www.xaa.es), whatever the Worker believes its own origin to be.
  const back = (path: string, outcome: string, reason = '') => {
    const qs = new URLSearchParams({ paypal: outcome });
    if (reason) qs.set('reason', reason);
    return new NextResponse(null, { status: 303, headers: { Location: `${path}?${qs}`, 'Cache-Control': 'no-store' } });
  };

  const checkout = id ? await getCheckout(id).catch(() => null) : null;
  if (!checkout || !token || checkout.paypal_order_id !== token) return back(destination(checkout), 'failed', 'unknown');

  const r = await settleCheckout(checkout, { capture: true });
  if (r.state === 'completed') return back(destination(checkout), 'done');
  if (r.state === 'pending') return back(destination(checkout), 'pending');
  if (r.state === 'busy') return back(destination(checkout), 'processing');
  return back(destination(checkout), 'failed', r.reason ?? 'unknown');
}
