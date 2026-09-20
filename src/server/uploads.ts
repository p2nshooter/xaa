import { bucket, db, newId, nowIso } from './db';
import type { ProjectFile } from './projects';

/**
 * Client uploads (concept decks, references, payment proofs) go to R2, with
 * only the metadata in D1. Files are never public: they are served back
 * through /api/files/[id], which re-checks the session on every request.
 */

export const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB per file
export const MAX_FILES_PER_UPLOAD = 10;

/** Extensions we accept for a concept brief. Anything executable is refused. */
const ALLOWED = new Set([
  'pdf', 'doc', 'docx', 'odt', 'rtf', 'txt', 'md',
  'ppt', 'pptx', 'key', 'odp',
  'xls', 'xlsx', 'csv', 'ods',
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'heic',
  'psd', 'ai', 'xd', 'fig', 'sketch',
  'zip', 'rar', '7z', 'tar', 'gz',
  'mp4', 'mov', 'webm',
]);

export class UploadError extends Error {}

function extensionOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i < 0 ? '' : name.slice(i + 1).toLowerCase();
}

function safeName(name: string): string {
  return name.replace(/[^\w.\- ]+/g, '_').slice(0, 120) || 'file';
}

export async function storeFile(input: {
  projectId: string;
  userId: string;
  uploadedBy: string;
  kind: ProjectFile['kind'];
  file: File;
}): Promise<ProjectFile> {
  const { file } = input;
  if (!file || file.size === 0) throw new UploadError('That file is empty.');
  if (file.size > MAX_FILE_BYTES) throw new UploadError(`${file.name} is larger than 25 MB. Send a link for very large files.`);
  const ext = extensionOf(file.name);
  if (!ALLOWED.has(ext)) throw new UploadError(`We cannot accept .${ext || 'unknown'} files. Use PDF, an image, an office document or a ZIP.`);

  const store = await bucket();
  if (!store) throw new UploadError('File storage is not configured on this deployment yet.');

  const id = newId();
  const key = `projects/${input.projectId}/${input.kind}/${id}.${ext}`;
  await store.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' },
  });

  const row: ProjectFile = {
    id,
    project_id: input.projectId,
    user_id: input.userId,
    object_key: key,
    name: safeName(file.name),
    size: file.size,
    content_type: file.type || null,
    kind: input.kind,
    uploaded_by: input.uploadedBy,
    created_at: nowIso(),
  };
  const database = await db();
  await database
    .prepare(
      `INSERT INTO files (id, project_id, user_id, object_key, name, size, content_type, kind, uploaded_by, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    )
    .bind(row.id, row.project_id, row.user_id, row.object_key, row.name, row.size, row.content_type, row.kind, row.uploaded_by, row.created_at)
    .run();
  return row;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
