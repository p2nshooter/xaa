/**
 * The copy itself of the one-time D1 → R2 move (server/migrate.ts runs it).
 * Pure: it only needs something that answers `SELECT * FROM <table>` and the
 * R2 collections, so the tests run it against a fake D1 and the fake R2.
 */
import type { Data, SecretDoc, SettingDoc } from './schema.ts';
import { messageId, messageStream } from './schema.ts';
import type { Collection, Doc } from './store.ts';

/** The part of a D1 database the copy reads. */
export interface D1Like {
  prepare(sql: string): { all<T = Record<string, unknown>>(): Promise<{ results?: T[] }> };
}

export interface TableReport {
  d1: number;
  r2: number;
}

const nowIso = () => new Date().toISOString();

/* ── row → document ─────────────────────────────────────────────────── */

type Row = Record<string, unknown>;

/** D1 tables that become a collection, with the same id. */
const TABLES: { table: string; pick: (d: Data) => Collection<Doc>; id?: string }[] = [
  { table: 'users', pick: (d) => d.users as unknown as Collection<Doc> },
  { table: 'projects', pick: (d) => d.projects as unknown as Collection<Doc> },
  { table: 'payments', pick: (d) => d.payments as unknown as Collection<Doc> },
  { table: 'files', pick: (d) => d.files as unknown as Collection<Doc> },
  { table: 'updates', pick: (d) => d.updates as unknown as Collection<Doc> },
  { table: 'enquiries', pick: (d) => d.enquiries as unknown as Collection<Doc> },
  { table: 'payment_methods', pick: (d) => d.paymentMethods as unknown as Collection<Doc> },
  { table: 'project_ai', pick: (d) => d.projectAi as unknown as Collection<Doc>, id: 'project_id' },
  { table: 'recovery_events', pick: (d) => d.recoveryEvents as unknown as Collection<Doc> },
  { table: 'template_orders', pick: (d) => d.templateOrders as unknown as Collection<Doc> },
  { table: 'paypal_checkouts', pick: (d) => d.checkouts as unknown as Collection<Doc> },
  { table: 'investors', pick: (d) => d.investors as unknown as Collection<Doc> },
  { table: 'investor_payouts', pick: (d) => d.payouts as unknown as Collection<Doc> },
  { table: 'template_bundles', pick: (d) => d.bundles as unknown as Collection<Doc>, id: 'slug' },
  { table: 'support_threads', pick: (d) => d.threads as unknown as Collection<Doc> },
];

/** Rows D1 kept that have no meaning in R2: the schema marker and the admin's last-seen ping. */
const SKIP_SECRETS = new Set(['__schema_version__']);
const SKIP_SETTINGS = new Set(['support.admin_last_seen']);

async function rows(db: D1Like, table: string): Promise<Row[]> {
  try {
    const { results } = await db.prepare(`SELECT * FROM ${table}`).all<Row>();
    return results ?? [];
  } catch (err) {
    // A table the old schema never created (a very old install) has nothing to copy.
    if (/no such table/i.test(err instanceof Error ? err.message : String(err))) return [];
    throw err;
  }
}

/** Copy every row of every table; idempotent. Returns the per-table report. */
export async function copyAll(db: D1Like, d: Data): Promise<Record<string, TableReport>> {
  const report: Record<string, TableReport> = {};

  // Secrets first: the at-rest encryption key lives here when no SETTINGS_KEY is set,
  // and every encrypted setting and payment destination depends on it.
  const secrets = (await rows(db, 'app_secrets')).filter((r) => !SKIP_SECRETS.has(String(r.key)));
  let present = 0;
  for (const r of secrets) {
    const { doc } = await d.store.createDoc<SecretDoc>(`secret/${String(r.key)}`, { value: String(r.value ?? ''), updated_at: String(r.updated_at ?? nowIso()) });
    if (doc.value === String(r.value ?? '')) present += 1;
  }
  report.app_secrets = { d1: secrets.length, r2: present };

  const settings = (await rows(db, 'app_settings')).filter((r) => !SKIP_SETTINGS.has(String(r.key)));
  present = 0;
  for (const r of settings) {
    const { doc } = await d.store.createDoc<SettingDoc>(`setting/${String(r.key)}`, {
      value: String(r.value ?? ''),
      is_secret: Number(r.is_secret ?? 0),
      updated_at: String(r.updated_at ?? nowIso()),
      updated_by: (r.updated_by as string | null) ?? null,
    });
    if (doc) present += 1;
  }
  report.app_settings = { d1: settings.length, r2: present };

  for (const t of TABLES) {
    const list = await rows(db, t.table);
    const col = t.pick(d);
    let ok = 0;
    for (const r of list) {
      const id = String(r[t.id ?? 'id'] ?? '');
      if (!id) continue;
      const doc = { ...r, id } as Doc;
      await col.createIfAbsent(doc);
      if (await col.get(id)) ok += 1;
    }
    report[t.table] = { d1: list.length, r2: ok };
  }

  const messages = await rows(db, 'support_messages');
  let copied = 0;
  for (const m of messages) {
    const threadId = String(m.thread_id ?? '');
    const createdAt = String(m.created_at ?? '');
    if (!threadId || !createdAt) continue;
    await d.store.append(messageStream(threadId), messageId(createdAt, String(m.id)), {
      id: String(m.id),
      thread_id: threadId,
      sender: m.sender,
      body: m.body,
      created_at: createdAt,
    });
    copied += 1;
  }
  report.support_messages = { d1: messages.length, r2: copied };
  return report;
}
