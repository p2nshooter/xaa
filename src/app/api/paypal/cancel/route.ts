import { NextResponse, type NextRequest } from 'next/server';
import { cancelCheckout, checkoutPage as destination } from '@/server/paypal';

/** The buyer backed out on paypal.com. Nothing was charged; say so plainly. */
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('c') ?? '';
  const checkout = id ? await cancelCheckout(id).catch(() => null) : null;
  // Relative, so the buyer stays on the host they came from.
  return new NextResponse(null, { status: 303, headers: { Location: `${destination(checkout)}?paypal=cancelled`, 'Cache-Control': 'no-store' } });
}
