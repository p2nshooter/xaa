import { currentUser } from '@/server/auth';
import { getProject } from '@/server/projects';
import { getRecoveryEvent } from '@/server/recovery';
import { bucket } from '@/server/db';

/**
 * Download a stored backup snapshot — the non-AI recovery path. Like every
 * file the portal serves, the session is re-checked and only the project owner
 * or a studio admin gets bytes back.
 */
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await currentUser();
  if (!user) return new Response('Sign in required.', { status: 401 });

  const ev = await getRecoveryEvent(id);
  if (!ev || !ev.object_key) return new Response('Not found.', { status: 404 });

  const project = await getProject(ev.project_id);
  if (!project) return new Response('Not found.', { status: 404 });
  if (project.user_id !== user.id && user.role !== 'admin') return new Response('Not found.', { status: 404 });

  const store = await bucket();
  if (!store) return new Response('Backup storage is not configured.', { status: 503 });

  const object = await store.get(ev.object_key);
  if (!object) return new Response('The stored snapshot is missing.', { status: 404 });

  const name = `${project.ref}-backup-${ev.created_at.replace(/[:.]/g, '-')}.json`;
  return new Response(object.body as unknown as ReadableStream, {
    headers: {
      'content-type': 'application/json',
      'content-disposition': `attachment; filename="${name}"`,
      'cache-control': 'private, no-store',
    },
  });
}
