import { currentUser } from '@/server/auth';
import { bucket } from '@/server/db';
import { getLot } from '@/server/auction';
import { getBundleMeta } from '@/server/store';

/**
 * What a paid win includes: the lot's code archive, or — for one of xaa.es's own products — that template's
 * bundle. Only the winner of a sold lot (or a studio admin) gets bytes back.
 */
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await currentUser();
  if (!user) return new Response('Sign in required.', { status: 401 });
  const lot = await getLot(id).catch(() => null);
  if (!lot) return new Response('Not found', { status: 404 });
  const allowed = user.role === 'admin' || (lot.status === 'sold' && lot.winner_user === user.id);
  if (!allowed) return new Response('The files open once the win is paid.', { status: 403 });

  let key = lot.archive_key;
  let filename = lot.archive_name;
  if (!key && lot.product_slug) {
    const meta = await getBundleMeta(lot.product_slug);
    if (meta) { key = meta.object_key; filename = meta.filename; }
  }
  if (!key) return new Response('The files are being prepared — the studio will add them shortly.', { status: 404 });
  const store = await bucket();
  const object = store ? await store.get(key) : null;
  if (!object) return new Response('The stored file is missing.', { status: 404 });
  return new Response(object.body as unknown as ReadableStream, {
    headers: {
      'content-type': object.httpMetadata?.contentType ?? 'application/octet-stream',
      'content-disposition': `attachment; filename="${(filename || 'lot.zip').replace(/"/g, '')}"`,
      'cache-control': 'private, no-store',
    },
  });
}
