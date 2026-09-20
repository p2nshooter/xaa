import { currentUser } from '@/server/auth';
import { getFile, getProject } from '@/server/projects';
import { bucket } from '@/server/db';

/**
 * Private file delivery. Client uploads are never public objects: every read
 * re-checks the session, and only the project owner or a studio admin gets
 * bytes back.
 */
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await currentUser();
  if (!user) return new Response('Sign in required.', { status: 401 });

  const file = await getFile(id);
  if (!file) return new Response('Not found.', { status: 404 });

  const project = await getProject(file.project_id);
  if (!project) return new Response('Not found.', { status: 404 });
  if (project.user_id !== user.id && user.role !== 'admin') return new Response('Not found.', { status: 404 });

  const store = await bucket();
  if (!store) return new Response('File storage is not configured.', { status: 503 });

  const object = await store.get(file.object_key);
  if (!object) return new Response('The stored file is missing.', { status: 404 });

  return new Response(object.body as unknown as ReadableStream, {
    headers: {
      'content-type': file.content_type || 'application/octet-stream',
      'content-disposition': `attachment; filename="${file.name.replace(/"/g, '')}"`,
      'cache-control': 'private, no-store',
    },
  });
}
