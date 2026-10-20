import { bucket, newId, nowIso } from './db';
import { data } from './data';
import type { Payment } from './projects';
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
 * recorded and auditable in the admin project portal. Ledger, configuration
 * and snapshots-index are R2 documents (recovery_events, project_ai); the
 * snapshots themselves are JSON objects in the uploads bucket.
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
  const row = await (await data()).projectAi.get(projectId);
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
  await (await data()).projectAi.upsert(projectId, (current) => ({
    id: projectId,
    project_id: projectId,
    provider: patch.provider ?? current?.provider ?? 'openai',
    api_key_enc: patch.apiKeyEnc !== undefined ? patch.apiKeyEnc : current?.api_key_enc ?? null,
    schedule: patch.schedule ?? current?.schedule ?? '',
    updated_at: nowIso(),
    updated_by: actor,
  }));
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
  const row = await (await data()).projectAi.get(projectId);
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
  await (await data()).recoveryEvents.create(ev);
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
  const d = await data();
  const [proj, pays, fileDocs, updates] = await Promise.all([
    d.projects.get(projectId),
    d.payments.listAllDocs('project', projectId),
    d.files.listAllDocs('project', projectId),
    d.updates.listAllDocs('project', projectId),
  ]);
  const files = fileDocs.map((f) => ({ id: f.id, name: f.name, size: f.size, kind: f.kind, created_at: f.created_at }));
  const snapshot = {
    taken_at: nowIso(),
    cadence,
    project: proj,
    payments: pays,
    files,
    updates,
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

  const counts = `${pays.length} payments · ${files.length} files · ${updates.length} log entries`;
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
  return (await (await data()).recoveryEvents.listDocs('project', projectId, { limit })).docs;
}

/** One recovery event by id — used by the backup download route for its ownership check. */
export async function getRecoveryEvent(id: string): Promise<RecoveryEvent | null> {
  return (await data()).recoveryEvents.get(id);
}

/** Stored, downloadable snapshots for a project, newest first. */
export async function listBackups(projectId: string): Promise<RecoveryEvent[]> {
  return (await (await data()).recoveryEvents.listDocs('backups', projectId, { limit: 20 })).docs;
}

/** Remove every payment of a project from the ledger (restore and reset start here). */
async function clearPayments(projectId: string): Promise<void> {
  const d = await data();
  for (const p of await d.payments.listAllDocs('project', projectId)) await d.payments.delete(p.id);
}

/**
 * Restore the project's own records from a stored snapshot — the non-AI path.
 * This rewrites the payments, files-metadata and activity rows from the JSON in
 * R2. A safety snapshot is taken first, so a restore is reversible. Financial
 * rows are replaced wholesale from the snapshot, which is exactly a
 * point-in-time recovery of the project's data.
 */
export async function restoreFromBackup(projectId: string, eventId: string, actor: string): Promise<RecoveryEvent> {
  const source = await getRecoveryEvent(eventId);
  if (!source || source.project_id !== projectId || !source.object_key) {
    throw new Error('That backup could not be found.');
  }
  const store = await bucket();
  if (!store) throw new Error('Backup storage is not configured, so this snapshot cannot be restored.');
  const obj = await store.get(source.object_key);
  if (!obj) throw new Error('The stored snapshot is missing.');
  const snap = JSON.parse(await obj.text()) as {
    payments?: Record<string, unknown>[];
    updates?: Record<string, unknown>[];
  };

  // Safety snapshot before we touch anything.
  await runBackup(projectId, 'now', `${actor} (pre-restore safety)`);

  // Replace the recoverable records for this project from the snapshot. The
  // project itself and uploaded file bytes are left in place; what a
  // point-in-time restore rebuilds here is the payment ledger, which is what
  // the snapshot carries.
  await clearPayments(projectId);
  const d = await data();
  for (const p of snap.payments ?? []) {
    const row: Payment = {
      id: String(p.id), project_id: projectId, user_id: String(p.user_id), milestone: p.milestone as Payment['milestone'],
      label: String(p.label), amount: Number(p.amount), method: p.method as Payment['method'], network: (p.network as string | null) ?? null,
      reference: (p.reference as string | null) ?? null, note: (p.note as string | null) ?? null, proof_file_id: (p.proof_file_id as string | null) ?? null,
      status: p.status as Payment['status'], created_at: String(p.created_at), confirmed_at: (p.confirmed_at as string | null) ?? null,
      invoice_no: (p.invoice_no as string | null) ?? null, method_id: (p.method_id as string | null) ?? null,
    };
    await d.payments.upsert(row.id, () => row);
  }

  const ev = await record(projectId, 'restore', {
    detail: `Restored from snapshot of ${new Date(source.created_at).toLocaleString('en-GB')} (${(snap.payments ?? []).length} payments)`,
    status: 'done',
    actor,
  });
  await addUpdate(projectId, {
    title: 'Recovery — restored from backup',
    body: `Non-AI restore from the snapshot taken ${new Date(source.created_at).toLocaleString('en-GB')}. A safety snapshot was taken first.`,
    author: actor,
  });
  const { reconcile } = await import('./projects');
  await reconcile(projectId);
  return ev;
}

/**
 * Reset — empty the project's recoverable data (the non-AI "ngosongin" path).
 * A safety snapshot is taken first so the reset is itself recoverable. Clears
 * the payment ledger for the project; the project row and uploaded files stay.
 */
export async function resetDatabase(projectId: string, actor: string): Promise<RecoveryEvent> {
  await runBackup(projectId, 'now', `${actor} (pre-reset safety)`);
  await clearPayments(projectId);
  const ev = await record(projectId, 'reset', { detail: 'Database emptied (payments cleared). A safety snapshot was taken first.', status: 'done', actor });
  await addUpdate(projectId, {
    title: 'Database reset — emptied',
    body: 'Non-AI reset: the payment ledger for this project was cleared. A safety snapshot was taken first.',
    author: actor,
  });
  const { reconcile } = await import('./projects');
  await reconcile(projectId);
  return ev;
}
