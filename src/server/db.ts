import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

/**
 * Cloudflare bindings of the client portal.
 *
 * Every record — accounts, projects, payments, orders, settings, support —
 * lives in the private R2 bucket bound as DATA (server/data.ts, key layout in
 * server/r2/schema.ts). Uploaded files live in UPLOADS. D1 is no longer
 * written by anything: DB stays bound, read-only, only so server/migrate.ts
 * can copy the old records over once, and the release after that drops it.
 */

export interface AppEnv {
  /** R2 bucket holding every portal record (server/data.ts). */
  DATA?: R2Bucket;
  /** Legacy D1 database: read once by server/migrate.ts, never written. */
  DB?: D1Database;
  /** R2 bucket holding client uploads (concept files, payment proofs) and template bundles. */
  UPLOADS?: R2Bucket;
  /** R2 bucket holding the daily full backups of DATA (server/r2/backup.ts), kept 35 days. */
  BACKUPS?: R2Bucket;
  /** HMAC key for signed cookies. Set with `wrangler secret put AUTH_SECRET`. */
  AUTH_SECRET?: string;
  /** Dedicated key for encrypting admin-entered settings at rest. */
  SETTINGS_KEY?: string;
  /** HMAC key for the signed session cookie (server/session.ts). Created once
   *  by the deploy workflow; separate from the encryption keys on purpose. */
  SESSION_SECRET?: string;
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
  /** Canonical origin (wrangler vars), used for links handed to PayPal. */
  APP_URL?: string;
  /** Local tests only: a stand-in for PayPal's Sandbox API (server/paypal.ts). */
  PAYPAL_SANDBOX_API?: string;
  /** Local tests only: DNS-over-HTTPS resolvers (comma-separated) that replace Cloudflare and Google for the domain check (server/auction.ts). */
  DOH_ENDPOINTS?: string;
  /** Local test runs only: a stand-in for the rate sources on localhost (server/fx.ts). */
  FX_ORIGIN?: string;
}

export async function appEnv(): Promise<AppEnv> {
  const ctx = await getCloudflareContext({ async: true });
  return (ctx?.env ?? {}) as unknown as AppEnv;
}

/** Thrown when the portal is deployed without its data bucket. */
export class NotConfiguredError extends Error {
  constructor() {
    super('The client portal storage is not configured yet. Please contact us directly.');
    this.name = 'NotConfiguredError';
  }
}

/** True when the portal has everything it needs to run. */
export async function portalReady(): Promise<boolean> {
  const { DATA } = await appEnv();
  return Boolean(DATA);
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
