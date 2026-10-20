import { appEnv, nowIso } from './db';
import { CREATE_ONLY } from './r2/bucket';
import { copyAll, type D1Like, type TableReport } from './r2/migrate-d1';
import type { Data } from './r2/schema';

/**
 * The one-time move of the portal's records from D1 to R2 (owner, 20 Oct
 * 2026: "Database semuanya ke R2 ya, jgn ada yg ke d1").
 *
 * It runs by itself on the first request after the deploy that switched the
 * code to R2 — no button, no manual step:
 *   1. one caller takes a lease (k/meta/migration-lock, create-only; a lease
 *      older than a minute is taken over), so two requests never migrate at once;
 *   2. every D1 table is copied row by row with the SAME ids, using
 *      create-if-absent, so a re-run never duplicates or overwrites anything;
 *   3. each table is checked: every D1 row must now exist in R2. Only when all
 *      tables match is k/meta/migration written with status "done" and the
 *      per-table report (the admin Settings page and /api/health show it).
 * Until then data pages answer "moving to new storage, try again in a few
 * seconds" instead of showing half the records. PayPal re-sends a webhook that
 * got that answer, so no payment is lost in the window.
 *
 * D1 itself is only READ here. It stays bound, read-only, for seven days as a
 * fallback copy; the release after that removes the binding and this file.
 */

export class MaintenanceError extends Error {
  constructor() {
    super('XAA is moving its records to new storage. This takes a few seconds — please try again.');
    this.name = 'MaintenanceError';
  }
}

export type { TableReport };

export interface MigrationState {
  status: 'done';
  at: string;
  /** "fresh" when there was no D1 database to copy (a new install). */
  source: 'd1' | 'fresh';
  tables: Record<string, TableReport>;
}

const STATE = 'meta/migration';
const LOCK_KEY = 'k/meta/migration-lock';
const LEASE_MS = 60_000;

let done = false;

/* ── lease ──────────────────────────────────────────────────────────── */

async function takeLease(d: Data, owner: string): Promise<boolean> {
  const b = d.store.bucket;
  const body = JSON.stringify({ owner, at: Date.now() });
  if (await d.store.retry(() => b.put(LOCK_KEY, body, { onlyIf: CREATE_ONLY() }))) return true;
  const cur = await d.store.retry(() => b.get(LOCK_KEY));
  if (!cur) return takeLease(d, owner);
  const held = JSON.parse(await cur.text()) as { at: number };
  if (Date.now() - held.at < LEASE_MS) return false;
  return Boolean(await d.store.retry(() => b.put(LOCK_KEY, body, { onlyIf: { etagMatches: cur.etag } })));
}

async function dropLease(d: Data): Promise<void> {
  await d.store.retry(() => d.store.bucket.delete(LOCK_KEY)).catch(() => undefined);
}

/**
 * Prove, once, that this bucket honours conditional writes the way every
 * guard and compare-and-swap here relies on: a create-only write to a key
 * that exists, or a write against a stale etag, must change nothing. If it
 * did not, uniqueness and money transitions would silently break, so the
 * portal refuses to store anything instead.
 */
async function probeConditionalWrites(d: Data): Promise<void> {
  const b = d.store.bucket;
  const key = `k/meta/probe-${crypto.randomUUID()}`;
  const first = await d.store.retry(() => b.put(key, 'first', { onlyIf: CREATE_ONLY() }));
  const second = await d.store.retry(() => b.put(key, 'second', { onlyIf: CREATE_ONLY() }));
  const stale = await d.store.retry(() => b.put(key, 'third', { onlyIf: { etagMatches: '00000000000000000000000000000000' } }));
  const now = await d.store.retry(() => b.get(key));
  const body = now ? await now.text() : null;
  await d.store.retry(() => b.delete(key)).catch(() => undefined);
  if (!first || second || stale || body !== 'first') {
    throw new Error('R2 conditional writes are not honoured by this bucket; the portal will not store records until they are.');
  }
}

/* ── gate ───────────────────────────────────────────────────────────── */

export async function migrationState(d: Data): Promise<MigrationState | null> {
  return d.store.getDoc<MigrationState | null>(STATE, null);
}

/**
 * Make sure the move has happened before any record is read or written.
 * After the first success this costs nothing (an isolate flag); before it,
 * one caller migrates and everyone else gets MaintenanceError for a moment.
 */
export async function ensureMigrated(d: Data): Promise<void> {
  if (done) return;
  if (await migrationState(d)) {
    done = true;
    return;
  }
  const env = await appEnv();
  const owner = crypto.randomUUID();
  if (!(await takeLease(d, owner))) throw new MaintenanceError();
  try {
    if (await migrationState(d)) {
      done = true;
      return;
    }
    await probeConditionalWrites(d);
    let state: MigrationState;
    if (!env.DB) {
      state = { status: 'done', at: nowIso(), source: 'fresh', tables: {} };
    } else {
      const tables = await copyAll(env.DB as unknown as D1Like, d);
      const short = Object.entries(tables).filter(([, r]) => r.r2 < r.d1);
      if (short.length) {
        console.error('D1 → R2 migration incomplete:', JSON.stringify(Object.fromEntries(short)));
        throw new MaintenanceError();
      }
      state = { status: 'done', at: nowIso(), source: 'd1', tables };
    }
    await d.store.createDoc<MigrationState>(STATE, state);
    done = true;
  } finally {
    await dropLease(d);
  }
}

/**
 * Admin: copy again whatever D1 still holds that R2 does not (create-if-absent,
 * nothing in R2 is overwritten) and return the fresh report. Used during the
 * seven days D1 stays bound, in case a write reached D1 in the seconds of the
 * switch-over.
 */
export async function recopyFromD1(d: Data): Promise<Record<string, TableReport> | null> {
  const env = await appEnv();
  if (!env.DB) return null;
  return copyAll(env.DB as unknown as D1Like, d);
}
