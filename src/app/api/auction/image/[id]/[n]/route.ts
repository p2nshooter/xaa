import { bucket } from '@/server/db';
import { getLot } from '@/server/auction';

/** A lot's screenshot (public once the lot is live; drafts stay private). Cached a day at the edge. */
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string; n: string }> }) {
  const { id, n } = await ctx.params;
  const lot = await getLot(id).catch(() => null);
  const key = lot && lot.status !== 'draft' ? lot.images[Number(n)] : undefined;
  if (!key) return new Response('Not found', { status: 404 });
  const store = await bucket();
  const object = store ? await store.get(key) : null;
  if (!object) return new Response('Not found', { status: 404 });
  return new Response(object.body as unknown as ReadableStream, {
    headers: { 'content-type': object.httpMetadata?.contentType ?? 'image/png', 'cache-control': 'public, max-age=86400', 'x-content-type-options': 'nosniff' },
  });
}
