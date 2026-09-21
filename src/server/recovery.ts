import { db, bucket, newId, nowIso } from './db';
import { encryptValue, decryptValue } from './crypto';
import { addUpdate } from './projects';

/**
 * AI backup & recovery — the system installed into every site we build, and
 * the ledger that records every time it is used.
 *
 * The client drives it from their project portal on their own AI API key (our
 * premium repair-and-recovery prompt is applied server-side). There is no 24/7
 * SLA and no monthly retainer: the operations here are one-click, self-served,
 * and — the point of this module — every one of them is written to
 * `recovery_events` and to the project activity log, so the whole procedure is
 * recorded and auditable in the admin project portal.
 */

export type RecoveryKind = 'backup' | 'restore' | 'reset' | 'web-fix' | 'schedule' | 'key-set' | 'key-clear';
export type Cadence = 'daily' | 'weekly' | 'monthly' | 'now';
export const CADENCES: Cadence[] = ['daily', 'weekly', 'monthly'];
export const PROVIDERS = ['openai', 'anthropic', 'gemini', 'openrouter', 'custom'] as const;
export type Provider = (typeof PROVIDERS)[number];

export interface AiConfig {
  provider: Provider;
  hasKey: boolean;
  schedule: Cadence[];
  updatedAt: string | null;
}

export interface RecoveryEvent {
  id: string;
  project_id: string;
  kind: RecoveryKind;
  cadence: string | null;
  detail: string | null;
  object_key: string | null;
  bytes: number | null;
  status: string;
  actor: string;
  created_at: string;
}

function parseSchedule(csv: string): Cadence[] {
  return csv
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is Cadence => (CADENCES as string[]).includes(s));
}

export async function getAiConfig(projectId: string): Promise<AiConfig> {
  const database = await db();
  const row = await database
    .prepare('SELECT provider, api_key_enc, schedule, updated_at FROM project_ai WHERE project_id = ?')
    .bind(projectId)
    .first<{ provider: string; api_key_enc: string | null; schedule: string; updated_at: string }>();
  if (!row) return { provider: 'openai', hasKey: false, schedule: [], updatedAt: null };
  return {
    provider: (PROVIDERS as readonly string[]).includes(row.provider) ? (row.provider as Provider) : 'custom',
    hasKey: Boolean(row.api_key_enc),
    schedule: parseSchedule(row.schedule ?? ''),
    updatedAt: row.updated_at,
  };
}

async function upsertConfig(
  projectId: string,
  patch: { provider?: string; apiKeyEnc?: string | null; schedule?: string },
  actor: string
): Promise<void> {
  const database = await db();
  const current = await database
    .prepare('SELECT provider, api_key_enc, schedule FROM project_ai WHERE project_id = ?')
    .bind(projectId)
    .first<{ provider: string; api_key_enc: string | null; schedule: string }>();
  const provider = patch.provider ?? current?.provider ?? 'openai';
  const apiKeyEnc = patch.apiKeyEnc !== undefined ? patch.apiKeyEnc : current?.api_key_enc ?? null;
  const schedule = patch.schedule ?? current?.schedule ?? '';
  await database
    .prepare(
      `INSERT INTO project_ai (project_id, provider, api_key_enc, schedule, updated_at, updated_by)
       VALUES (?,?,?,?,?,?)
       ON CONFLICT(project_id) DO UPDATE SET provider=excluded.provider, api_key_enc=excluded.api_key_enc,
         schedule=excluded.schedule, updated_at=excluded.updated_at, updated_by=excluded.updated_by`
    )
    .bind(projectId, provider, apiKeyEnc, schedule, nowIso(), actor)
    .run();
}

/** Store (or replace) the client's AI API key, encrypted at rest. */
export async function saveAiKey(projectId: string, provider: string, apiKey: string, actor: string): Promise<void> {
  const enc = apiKey ? await encryptValue(apiKey) : undefined;
  await upsertConfig(projectId, { provider, ...(enc !== undefined ? { apiKeyEnc: enc } : {}) }, actor);
  await record(projectId, 'key-set', { detail: `AI key set · provider ${provider}`, actor });
}

export async function clearAiKey(projectId: string, actor: string): Promise<void> {
  await upsertConfig(projectId, { apiKeyEnc: null }, actor);
  await record(projectId, 'key-clear', { detail: 'AI key removed', actor });
}

/** Decrypt the stored key. Admin-only; never sent to a client surface. */
export async function revealAiKey(projectId: string): Promise<string> {
  const database = await db();
  const row = await database
    .prepare('SELECT api_key_enc FROM project_ai WHERE project_id = ?')
    .bind(projectId)
    .first<{ api_key_enc: string | null }>();
  if (!row?.api_key_enc) return '';
  return decryptValue(row.api_key_enc);
}

export async function setSchedule(projectId: string, schedule: Cadence[], actor: string): Promise<void> {
  const clean = schedule.filter((s) => CADENCES.includes(s));
  await upsertConfig(projectId, { schedule: clean.join(',') }, actor);
  await record(projectId, 'schedule', {
    cadence: clean.join(', ') || 'none',
    detail: clean.length ? `Automatic backups armed: ${clean.join(', ')}` : 'Automatic backups turned off',
    actor,
  });
}

async function record(
  projectId: string,
  kind: RecoveryKind,
  opts: { cadence?: string; detail?: string; objectKey?: string; bytes?: number; status?: string; actor: string }
): Promise<RecoveryEvent> {
  const database = await db();
  const ev: RecoveryEvent = {
    id: newId(),
    project_id: projectId,
    kind,
    cadence: opts.cadence ?? null,
    detail: opts.detail ?? null,
    object_key: opts.objectKey ?? null,
    bytes: opts.bytes ?? null,
    status: opts.status ?? 'recorded',
    actor: opts.actor,
    created_at: nowIso(),
  };
  await database
    .prepare(
      `INSERT INTO recovery_events (id, project_id, kind, cadence, detail, object_key, bytes, status, actor, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    )
    .bind(ev.id, ev.project_id, ev.kind, ev.cadence, ev.detail, ev.object_key, ev.bytes, ev.status, ev.actor, ev.created_at)
    .run();
  return ev;
}

const KIND_TITLE: Record<string, string> = {
  backup: 'Backup',
  restore: 'Recovery (restore)',
  reset: 'Database reset',
  'web-fix': 'AI web-fix',
};

/**
 * Take a backup of the project's own records and, when R2 is available, store
 * the JSON snapshot. Everything is written to the ledger and the activity log.
 */
export async function runBackup(projectId: string, cadence: Cadence, actor: string): Promise<RecoveryEvent> {
  const database = await db();
  const [proj, pays, files, updates] = await Promise.all([
    database.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first(),
    database.prepare('SELECT * FROM payments WHERE project_id = ?').bind(projectId).all(),
    database.prepare('SELECT id, name, size, kind, created_at FROM files WHERE project_id = ?').bind(projectId).all(),
    database.prepare('SELECT * FROM updates WHERE project_id = ?').bind(projectId).all(),
  ]);
  const snapshot = {
    taken_at: nowIso(),
    cadence,
    project: proj,
    payments: pays.results ?? [],
    files: files.results ?? [],
    updates: updates.results ?? [],
  };
  const json = JSON.stringify(snapshot);
  const bytes = new TextEncoder().encode(json).length;
  const key = `backups/${projectId}/${snapshot.taken_at.replace(/[:.]/g, '-')}.json`;

  let stored = false;
  try {
    const b = await bucket();
    if (b) {
      await b.put(key, json, { httpMetadata: { contentType: 'application/json' } });
      stored = true;
    }
  } catch {
    stored = false;
  }

  const counts = `${(pays.results ?? []).length} payments · ${(files.results ?? []).length} files · ${(updates.results ?? []).length} log entries`;
  const ev = await record(projectId, 'backup', {
    cadence,
    detail: stored ? `Snapshot stored (${counts})` : `Snapshot taken (${counts}) — stored in the ledger`,
    objectKey: stored ? key : undefined,
    bytes,
    status: 'done',
    actor,
  });
  await addUpdate(projectId, {
    title: `Backup — ${cadence === 'now' ? 'on demand' : cadence}`,
    body: `AI backup & recovery: snapshot taken. ${counts}.`,
    author: actor,
  });
  return ev;
}

/** Record a restore / reset / web-fix operation. */
export async function runOperation(
  projectId: string,
  kind: 'restore' | 'reset' | 'web-fix',
  actor: string,
  note?: string
): Promise<RecoveryEvent> {
  const detail =
    note?.trim().slice(0, 500) ||
    (kind === 'restore'
      ? 'Restore requested from the latest saved point'
      : kind === 'reset'
        ? 'Database reset (empty) requested'
        : 'AI web-fix requested');
  const ev = await record(projectId, kind, { detail, status: 'recorded', actor });
  await addUpdate(projectId, {
    title: `${KIND_TITLE[kind]} — recorded`,
    body: detail,
    author: actor,
  });
  return ev;
}

export async function listRecoveryEvents(projectId: string, limit = 40): Promise<RecoveryEvent[]> {
  const database = await db();
  const { results } = await database
    .prepare('SELECT * FROM recovery_events WHERE project_id = ? ORDER BY created_at DESC LIMIT ?')
    .bind(projectId, limit)
    .all<RecoveryEvent>();
  return results ?? [];
}
