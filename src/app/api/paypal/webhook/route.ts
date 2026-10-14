import { NextResponse, type NextRequest } from 'next/server';
import { getCheckoutByOrder, handleWebhookEvent, paypalConfig, verifyWebhookSignature } from '@/server/paypal';

/**
 * PayPal webhook — set it on the PayPal app (Live and Sandbox) to
 *   https://xaa.es/api/paypal/webhook
 * with CHECKOUT.ORDER.APPROVED and PAYMENT.CAPTURE.* events.
 *
 * It covers the buyer who pays and closes the tab before coming back. The
 * payload is never trusted on its own: the order is read back from PayPal
 * with our credentials before anything is booked (server/paypal.ts). When the
 * admin has entered the webhook ID, PayPal's signature is checked as well and
 * an unsigned or forged event is refused outright.
 */
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const raw = await req.text();
  let event: { event_type?: string; resource?: Record<string, unknown> & { id?: string; supplementary_data?: { related_ids?: { order_id?: string } } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: 'bad json' }, { status: 400 });
  }

  const type = event.event_type ?? '';
  const orderId = type.startsWith('CHECKOUT.ORDER.') ? event.resource?.id : event.resource?.supplementary_data?.related_ids?.order_id;
  const checkout = orderId ? await getCheckoutByOrder(String(orderId)).catch(() => null) : null;
  if (!checkout) return NextResponse.json({ ok: true, note: 'not ours' });

  const cfg = await paypalConfig(checkout.env);
  if (cfg?.webhookId && !(await verifyWebhookSignature(cfg, req.headers, event))) {
    return NextResponse.json({ ok: false, error: 'signature' }, { status: 401 });
  }

  try {
    const note = await handleWebhookEvent(event);
    return NextResponse.json({ ok: true, note });
  } catch (err) {
    console.error('paypal webhook failed:', err instanceof Error ? err.message : err);
    // A 5xx makes PayPal retry later, which is exactly what we want.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
