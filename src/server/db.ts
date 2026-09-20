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
  /** Accounts registering with this email are made admins. */
  ADMIN_EMAIL?: string;
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
];

let ready: Promise<void> | null = null;

async function ensureSchema(database: D1Database): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await database.batch(SCHEMA.map((sql) => database.prepare(sql)));
    })().catch((err) => {
      // Let the next request try again rather than poisoning the isolate.
      ready = null;
      throw err;
    });
  }
  return ready;
}

/** The database, with its schema guaranteed to exist. */
export async function db(): Promise<D1Database> {
  const { DB } = await appEnv();
  if (!DB) throw new NotConfiguredError();
  await ensureSchema(DB);
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
