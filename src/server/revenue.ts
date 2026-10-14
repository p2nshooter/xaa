import { db, nowIso } from './db';

/**
 * Revenue feed for the AXTO & XAA capital raise.
 *
 * Investors in the combined raise share a pool of every revenue transaction of
 * axto.io and xaa.es; their portal lives on axto.io, which runs on another
 * Cloudflare account and cannot read this database. So xaa.es publishes its
 * revenue — and only that — through GET /api/revenue, to a caller holding the
 * feed token generated in the Studio desk (Settings → Revenue feed).
 *
 * What counts: confirmed project payments (milestones) and paid template
 * orders, in euros, at the moment they were confirmed. What never counts: a
 * PayPal sandbox (test) payment, a PayPal payment that was refunded or
 * reversed, anything pending or rejected. Each row is an amount and a time —
 * no client, project, order or reference ever leaves the database.
 *
 * Only the SHA-256 of the token is stored (app_secrets), so the token cannot be
 * read back from here — generating a new one replaces the old.
 */

const TOKEN_ROW = 'revenue_feed_token_sha256';
const AT_ROW = 'revenue_feed_token_at';

export interface RevenueTx { at: string; amount: number; currency: 'EUR'; kind: 'milestone' | 'template' }

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time comparison of two hex digests of equal length. */
function sameHex(a: string, b: string): boolean {
  if (a.length !== b.length || !a.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Creates a new feed token, stores its hash and returns it — shown once to the admin. */
export async function rotateRevenueToken(): Promise<string> {
  const raw = crypto.getRandomValues(new Uint8Array(32));
  const token = `xrf_${[...raw].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
  const database = await db();
  const stamp = nowIso();
  await database.batch([
    database.prepare('INSERT OR REPLACE INTO app_secrets (key, value, updated_at) VALUES (?, ?, ?)').bind(TOKEN_ROW, await sha256Hex(token), stamp),
    database.prepare('INSERT OR REPLACE INTO app_secrets (key, value, updated_at) VALUES (?, ?, ?)').bind(AT_ROW, stamp, stamp),
  ]);
  return token;
}

/** Turns the feed off: no token opens it any more. */
export async function revokeRevenueToken(): Promise<void> {
  const database = await db();
  await database.prepare('DELETE FROM app_secrets WHERE key IN (?, ?)').bind(TOKEN_ROW, AT_ROW).run();
}

/** When the current token was made ('' = the feed is off). */
export async function revenueTokenCreatedAt(): Promise<string> {
  const database = await db();
  const row = await database.prepare('SELECT value FROM app_secrets WHERE key = ?').bind(AT_ROW).first<{ value: string }>();
  return row?.value ?? '';
}

export async function checkRevenueToken(header: string | null): Promise<boolean> {
  const token = (header ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!/^xrf_[0-9a-f]{64}$/.test(token)) return false;
  const database = await db();
  const row = await database.prepare('SELECT value FROM app_secrets WHERE key = ?').bind(TOKEN_ROW).first<{ value: string }>();
  if (!row?.value) return false;
  return sameHex(await sha256Hex(token), row.value);
}

// A PayPal payment counts unless it was taken in the sandbox or refunded / reversed afterwards.
const NOT_EXCLUDED = (col: string) => `NOT EXISTS (
  SELECT 1 FROM paypal_checkouts c
   WHERE c.${col}
     AND (c.env = 'sandbox' OR c.detail LIKE 'PayPal refunded%' OR c.detail LIKE 'PayPal reversed%'))`;

/** Confirmed revenue since a moment (ISO), oldest first. */
export async function revenueSince(sinceIso: string): Promise<RevenueTx[]> {
  const database = await db();
  const { results } = await database
    .prepare(
      `SELECT p.confirmed_at AS at, p.amount AS amount, 'milestone' AS kind FROM payments p
        WHERE p.status = 'confirmed' AND p.confirmed_at IS NOT NULL AND p.confirmed_at >= ?
          AND ${NOT_EXCLUDED('payment_id = p.id')}
       UNION ALL
       SELECT t.confirmed_at AS at, t.price AS amount, 'template' AS kind FROM template_orders t
        WHERE t.status = 'paid' AND t.confirmed_at IS NOT NULL AND t.confirmed_at >= ?
          AND ${NOT_EXCLUDED('template_order_id = t.id')}
       ORDER BY at`,
    )
    .bind(sinceIso, sinceIso)
    .all<{ at: string; amount: number; kind: 'milestone' | 'template' }>();
  return (results ?? [])
    .filter((r) => Number(r.amount) > 0)
    .map((r) => ({ at: r.at, amount: Number(r.amount), currency: 'EUR' as const, kind: r.kind }));
}
