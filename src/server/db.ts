import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

/**
 * Cloudflare bindings + the D1 schema for the client portal.
 *
 * The schema is applied lazily, once per isolate, with CREATE TABLE IF NOT
 * EXISTS. A portal that needed a separate migration step before it would work
 * is a portal that is broken on its first deploy, and D1 makes the idempotent
 * version cheap.
 */

export interface AppEnv {
  /** D1 database holding accounts, projects, payments and files metadata. */
  DB?: D1Database;
  /** R2 bucket holding client uploads (concept files, payment proofs). */
  UPLOADS?: R2Bucket;
  /** HMAC key for signed cookies. Set with `wrangler secret put AUTH_SECRET`. */
  AUTH_SECRET?: string;
  /** Dedicated key for encrypting admin-entered settings at rest. */
  SETTINGS_KEY?: string;
  /** Accounts registering with this email are made admins. */
  ADMIN_EMAIL?: string;
  /** When set, the seeded studio admin uses this password instead of the
   *  committed hash. Set with `wrangler secret put ADMIN_PASSWORD`. */
  ADMIN_PASSWORD?: string;
  /** Payment destinations shown on the checkout screens. */
  USDT_TRC20_ADDRESS?: string;
  USDT_ERC20_ADDRESS?: string;
  USDT_BEP20_ADDRESS?: string;
  PAYPAL_EMAIL?: string;
  PAYPAL_LINK?: string;
}

export async function appEnv(): Promise<AppEnv> {
  const ctx = await getCloudflareContext({ async: true });
  return (ctx?.env ?? {}) as unknown as AppEnv;
}

/** Thrown when the portal is deployed without its D1 binding. */
export class NotConfiguredError extends Error {
  constructor() {
    super('The client portal database is not configured yet. Please contact us directly.');
    this.name = 'NotConfiguredError';
  }
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,
     email TEXT NOT NULL UNIQUE,
     name TEXT NOT NULL,
     company TEXT,
     country TEXT,
     phone TEXT,
     password_hash TEXT NOT NULL,
     role TEXT NOT NULL DEFAULT 'client',
     created_at TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS sessions (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL,
     created_at TEXT NOT NULL,
     expires_at TEXT NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS projects (
     id TEXT PRIMARY KEY,
     ref TEXT NOT NULL UNIQUE,
     user_id TEXT NOT NULL,
     package_slug TEXT NOT NULL,
     package_name TEXT NOT NULL,
     title TEXT NOT NULL,
     scope_note TEXT,
     addons TEXT NOT NULL DEFAULT '[]',
     setup_plan TEXT,
     care_plan TEXT,
     quote_min INTEGER NOT NULL,
     quote_max INTEGER NOT NULL,
     contract_amount INTEGER NOT NULL,
     contract_locked INTEGER NOT NULL DEFAULT 0,
     est_days_min INTEGER NOT NULL,
     est_days_max INTEGER NOT NULL,
     status TEXT NOT NULL,
     progress INTEGER NOT NULL DEFAULT 0,
     started_at TEXT,
     due_at TEXT,
     delivered_at TEXT,
     created_at TEXT NOT NULL,
     updated_at TEXT NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id)`,
  `CREATE TABLE IF NOT EXISTS payments (
     id TEXT PRIMARY KEY,
     project_id TEXT NOT NULL,
     user_id TEXT NOT NULL,
     milestone TEXT NOT NULL,
     label TEXT NOT NULL,
     amount INTEGER NOT NULL,
     method TEXT NOT NULL,
     network TEXT,
     reference TEXT,
     note TEXT,
     proof_file_id TEXT,
     status TEXT NOT NULL,
     created_at TEXT NOT NULL,
     confirmed_at TEXT
   )`,
  `CREATE INDEX IF NOT EXISTS idx_payments_project ON payments(project_id)`,
  `CREATE TABLE IF NOT EXISTS files (
     id TEXT PRIMARY KEY,
     project_id TEXT NOT NULL,
     user_id TEXT NOT NULL,
     object_key TEXT NOT NULL,
     name TEXT NOT NULL,
     size INTEGER NOT NULL,
     content_type TEXT,
     kind TEXT NOT NULL,
     uploaded_by TEXT NOT NULL,
     created_at TEXT NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id)`,
  `CREATE TABLE IF NOT EXISTS updates (
     id TEXT PRIMARY KEY,
     project_id TEXT NOT NULL,
     progress INTEGER,
     status TEXT,
     title TEXT NOT NULL,
     body TEXT,
     author TEXT NOT NULL,
     created_at TEXT NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS idx_updates_project ON updates(project_id)`,
  `CREATE TABLE IF NOT EXISTS enquiries (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     company TEXT,
     budget TEXT,
     package_slug TEXT,
     message TEXT NOT NULL,
     created_at TEXT NOT NULL
   )`,
  // Encryption key and any other internal secret. Written by server/crypto.ts.
  `CREATE TABLE IF NOT EXISTS app_secrets (
     key TEXT PRIMARY KEY,
     value TEXT NOT NULL,
     updated_at TEXT NOT NULL
   )`,
  /**
   * Where clients send money. Maintained entirely from the admin UI — the
   * address and any tag/memo are encrypted at rest, which is why they are
   * TEXT blobs rather than plain columns.
   */
  `CREATE TABLE IF NOT EXISTS payment_methods (
     id TEXT PRIMARY KEY,
     kind TEXT NOT NULL,
     label TEXT NOT NULL,
     network TEXT,
     currency TEXT NOT NULL DEFAULT 'EUR',
     address_enc TEXT NOT NULL,
     memo_enc TEXT,
     link TEXT,
     instructions TEXT,
     active INTEGER NOT NULL DEFAULT 1,
     sort_order INTEGER NOT NULL DEFAULT 0,
     created_at TEXT NOT NULL,
     updated_at TEXT NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(active, sort_order)`,
  /** Studio configuration typed by an admin; secret values are encrypted. */
  `CREATE TABLE IF NOT EXISTS app_settings (
     key TEXT PRIMARY KEY,
     value TEXT NOT NULL DEFAULT '',
     is_secret INTEGER NOT NULL DEFAULT 0,
     updated_at TEXT NOT NULL,
     updated_by TEXT
   )`,
];

/**
 * Columns added after the first release.
 *
 * D1 has no migration state here by design — CREATE TABLE IF NOT EXISTS gets
 * a fresh database right, but it does nothing for a table that already
 * exists. ALTER TABLE ADD COLUMN is the missing half: it errors with
 * "duplicate column" once applied, which is exactly the signal that the work
 * is already done, so each one runs on its own and that error is swallowed.
 * Anything else is a real failure and is rethrown.
 */
const COLUMN_MIGRATIONS = [
  `ALTER TABLE enquiries ADD COLUMN status TEXT NOT NULL DEFAULT 'new'`,
  `ALTER TABLE enquiries ADD COLUMN handled_at TEXT`,
  `ALTER TABLE enquiries ADD COLUMN handled_by TEXT`,
  `ALTER TABLE enquiries ADD COLUMN note TEXT`,
  `ALTER TABLE payments ADD COLUMN invoice_no TEXT`,
  `ALTER TABLE payments ADD COLUMN method_id TEXT`,
  // Bank-transfer detail on a payment method. The account number lives in the
  // encrypted address column; these are the non-secret parts printed on the
  // transfer instructions (bank name, holder, SWIFT/BIC, branch, country).
  `ALTER TABLE payment_methods ADD COLUMN holder TEXT`,
  `ALTER TABLE payment_methods ADD COLUMN bank_name TEXT`,
  `ALTER TABLE payment_methods ADD COLUMN swift TEXT`,
  `ALTER TABLE payment_methods ADD COLUMN branch TEXT`,
  `ALTER TABLE payment_methods ADD COLUMN bank_country TEXT`,
];

let ready: Promise<void> | null = null;

/** "duplicate column name: x" — the column is already there, nothing to do. */
function isDuplicateColumn(err: unknown): boolean {
  return /duplicate column/i.test(err instanceof Error ? err.message : String(err));
}

async function ensureSchema(database: D1Database): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await database.batch(SCHEMA.map((sql) => database.prepare(sql)));
      // Not batched: a batch is one transaction, so the first already-applied
      // ALTER would roll the rest back on every single request.
      for (const sql of COLUMN_MIGRATIONS) {
        try {
          await database.prepare(sql).run();
        } catch (err) {
          if (!isDuplicateColumn(err)) throw err;
        }
      }
    })().catch((err) => {
      // Let the next request try again rather than poisoning the isolate.
      ready = null;
      throw err;
    });
  }
  return ready;
}

let seeded: Promise<void> | null = null;

/** The database, with its schema guaranteed to exist and the admin seeded. */
export async function db(): Promise<D1Database> {
  const env = await appEnv();
  const { DB } = env;
  if (!DB) throw new NotConfiguredError();
  await ensureSchema(DB);
  // Seed the studio admin once per isolate, after the schema is ready. The
  // dynamic import breaks the db ↔ auth import cycle, and passing DB in means
  // seedAdmin never re-enters db() (which would deadlock on this same call).
  if (!seeded) {
    seeded = import('./auth')
      .then((m) => m.seedAdmin(DB, { ADMIN_PASSWORD: env.ADMIN_PASSWORD }))
      .catch((err) => {
        seeded = null; // let a later request try again
        throw err;
      });
  }
  await seeded;
  return DB;
}

/** True when the portal has everything it needs to run. */
export async function portalReady(): Promise<boolean> {
  const { DB } = await appEnv();
  return Boolean(DB);
}

export async function bucket(): Promise<R2Bucket | null> {
  const { UPLOADS } = await appEnv();
  return UPLOADS ?? null;
}

export function newId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}
