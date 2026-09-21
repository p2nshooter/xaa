import { currentUser } from '@/server/auth';
import { getBundleMeta, hasPaidOrder } from '@/server/store';
import { bucket } from '@/server/db';

/**
 * Deliver a template's bundle zip. Gated: only a signed-in buyer with a paid
 * order for this template — or a studio admin — gets bytes back.
 */
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const user = await currentUser();
  if (!user) return new Response('Sign in required.', { status: 401 });

  const allowed = user.role === 'admin' || (await hasPaidOrder(user.id, slug));
  if (!allowed) return new Response('This bundle is available after purchase.', { status: 403 });

  const meta = await getBundleMeta(slug);
  if (!meta) return new Response('The bundle is being prepared. Please check back shortly.', { status: 404 });

  const store = await bucket();
  if (!store) return new Response('File storage is not configured.', { status: 503 });

  const object = await store.get(meta.object_key);
  if (!object) return new Response('The stored bundle is missing.', { status: 404 });

  return new Response(object.body as unknown as ReadableStream, {
    headers: {
      'content-type': 'application/zip',
      'content-disposition': `attachment; filename="${meta.filename.replace(/"/g, '')}"`,
      'cache-control': 'private, no-store',
    },
  });
}
