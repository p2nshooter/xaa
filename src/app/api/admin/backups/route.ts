import { currentUser } from '@/server/auth';
import { backupFile } from '@/server/storage';

/**
 * Admin-only download of one data backup (gzip'd JSON). GET ?key=backups/…
 * Anyone else gets 403; the key is validated against the backup layout.
 */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== 'admin') return new Response('admins only', { status: 403 });
  const key = new URL(req.url).searchParams.get('key') ?? '';
  try {
    const file = await backupFile(key);
    if (!file) return new Response('not found', { status: 404 });
    return new Response(file.body, {
      headers: {
        'content-type': 'application/gzip',
        'content-disposition': `attachment; filename="${file.name}"`,
        'cache-control': 'no-store',
      },
    });
  } catch (err) {
    return new Response(err instanceof Error ? err.message : 'could not read the backup', { status: 400 });
  }
}
