import { db, appEnv, nowIso } from './db';
import type { D1Database } from '@cloudflare/workers-types';

/**
 * Encryption at rest for the values an admin types into the portal —
 * wallet addresses, PayPal details, API keys, anything marked secret.
 *
 * AES-256-GCM through WebCrypto, which the Workers runtime and Node both
 * provide natively. Every value gets its own random 96-bit IV, stored with
 * the ciphertext, so identical plaintexts never produce identical rows.
 *
 * KEY SOURCE, and what it does and does not buy you:
 *
 *   1. SETTINGS_KEY (Worker secret)  — best. The key never touches D1.
 *   2. AUTH_SECRET (Worker secret)   — fine, reuses the existing secret.
 *   3. A key generated on first use and kept in D1 — the fallback, so the
 *      portal works the moment it is deployed with nothing else configured.
 *
 * Be straight about option 3: a key stored beside the ciphertext protects
 * against a leaked database export, a stray backup or a support engineer
 * reading rows — it does NOT protect against someone who has both the
 * database and the running Worker. The admin settings page says exactly
 * that and tells you how to upgrade to option 1, which is one command.
 */

const KEY_ROW = '__master_key__';

let cachedKey: CryptoKey | null = null;

async function importKey(raw: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

/** A 256-bit key derived from a passphrase, so any secret length works. */
async function keyFromPassphrase(secret: string): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`xaa:settings:${secret}`));
  return importKey(digest);
}

function b64encode(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function b64decode(text: string): Uint8Array {
  const bin = atob(text);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

/** Where the key came from, so the UI can tell the truth about it. */
export type KeySource = 'settings_key' | 'auth_secret' | 'database';

export async function keySource(): Promise<KeySource> {
  const env = await appEnv();
  if (env.SETTINGS_KEY) return 'settings_key';
  if (env.AUTH_SECRET) return 'auth_secret';
  return 'database';
}

async function masterKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const env = await appEnv();

  const passphrase = env.SETTINGS_KEY || env.AUTH_SECRET;
  if (passphrase) {
    cachedKey = await keyFromPassphrase(passphrase);
    return cachedKey;
  }

  // Fallback: a key of our own, created once and kept in the database.
  const database = await db();
  const row = await database
    .prepare('SELECT value FROM app_secrets WHERE key = ?')
    .bind(KEY_ROW)
    .first<{ value: string }>();

  if (row?.value) {
    cachedKey = await importKey(b64decode(row.value).buffer as ArrayBuffer);
    return cachedKey;
  }

  const raw = crypto.getRandomValues(new Uint8Array(32));
  await database
    .prepare('INSERT OR REPLACE INTO app_secrets (key, value, updated_at) VALUES (?, ?, ?)')
    .bind(KEY_ROW, b64encode(raw), nowIso())
    .run();
  cachedKey = await importKey(raw.buffer as ArrayBuffer);
  return cachedKey;
}

/** Encrypt a value for storage. Returns `v1.<iv>.<ciphertext>`, base64. */
export async function encryptValue(plaintext: string): Promise<string> {
  if (!plaintext) return '';
  const key = await masterKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(plaintext);
  const sealed = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    data as unknown as BufferSource
  );
  return `v1.${b64encode(iv)}.${b64encode(new Uint8Array(sealed))}`;
}

/**
 * Decrypt a stored value.
 *
 * Returns '' rather than throwing when a value cannot be opened — which
 * happens legitimately when the master key changes (someone sets
 * SETTINGS_KEY after values were written under the database key). One
 * unreadable wallet address must not take the whole admin page down; the
 * UI shows the field as unreadable and invites the admin to re-enter it.
 */
export async function decryptValue(stored: string): Promise<string> {
  if (!stored) return '';
  if (!stored.startsWith('v1.')) return stored; // written before encryption existed
  const [, ivB64, dataB64] = stored.split('.');
  if (!ivB64 || !dataB64) return '';
  try {
    const key = await masterKey();
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: b64decode(ivB64) as unknown as BufferSource },
      key,
      b64decode(dataB64) as unknown as BufferSource
    );
    return new TextDecoder().decode(plain);
  } catch {
    return '';
  }
}

/** True when a stored value exists but cannot be opened with the current key. */
export async function isUnreadable(stored: string): Promise<boolean> {
  if (!stored) return false;
  return (await decryptValue(stored)) === '';
}

/**
 * Show enough of a secret to recognise it, never enough to use it.
 * A wallet address keeps its head and tail, which is how people actually
 * verify one; everything else gets a short head only.
 */
export function maskSecret(value: string, kind: 'address' | 'token' = 'token'): string {
  if (!value) return '';
  if (kind === 'address' && value.length > 14) {
    return `${value.slice(0, 6)}…${value.slice(-6)}`;
  }
  if (value.includes('@')) {
    const [user, domain] = value.split('@');
    return `${(user ?? '').slice(0, 2)}…@${domain ?? ''}`;
  }
  return value.length > 8 ? `${value.slice(0, 4)}…${value.slice(-2)}` : '••••';
}

/** Used by the settings page to prove the round trip works on this deploy. */
export async function selfTest(): Promise<boolean> {
  try {
    const probe = `probe-${crypto.randomUUID()}`;
    return (await decryptValue(await encryptValue(probe))) === probe;
  } catch {
    return false;
  }
}

/** Exposed for db.ts so the secrets table exists before the key is written. */
export async function ensureSecretsTable(database: D1Database): Promise<void> {
  await database
    .prepare(
      `CREATE TABLE IF NOT EXISTS app_secrets (
         key TEXT PRIMARY KEY,
         value TEXT NOT NULL,
         updated_at TEXT NOT NULL
       )`
    )
    .run();
}
