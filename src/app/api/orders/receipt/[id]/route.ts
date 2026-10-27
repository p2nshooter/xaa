import { currentUser } from '@/server/auth';
import { bucket } from '@/server/db';
import { getOrder } from '@/server/store';

/** The payment screenshot of an order — the buyer and the studio admin only. */
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await currentUser();
  if (!user) return new Response('Sign in required.', { status: 401 });
  const order = await getOrder(id);
  if (!order || (order.user_id !== user.id && user.role !== 'admin')) return new Response('Not found', { status: 404 });
  if (!order.receipt_key) return new Response('No screenshot on this order.', { status: 404 });
  const store = await bucket();
  const object = store ? await store.get(order.receipt_key) : null;
  if (!object) return new Response('Not found', { status: 404 });
  return new Response(object.body as unknown as ReadableStream, { headers: { 'content-type': object.httpMetadata?.contentType ?? 'application/octet-stream', 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff' } });
}
