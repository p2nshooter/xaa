import { appEnv, nowIso } from './db';
import { data } from './data';
import type { SecretDoc } from './r2/schema';

/**
 * Stateless, signed session tokens.
 *
 * A session is `<payload>.<signature>`, both base64url: the payload is a small
 * JSON snapshot of the signed-in user plus an expiry, and the signature is
 * HMAC-SHA256 over the payload. Verifying needs nothing but the key, so signing
 * in and reading the session touch NO storage at all (D1's daily read budget
 * once ran out and took a storage-backed sign-in down with it).
 *
 * KEY SOURCE, in order:
 *   1. SESSION_SECRET — a Worker secret the deploy workflow creates once.
 *   2. AUTH_SECRET    — if someone set it by hand.
 *   3. A key generated once and kept in R2 (k/secret/__session_key__), cached
 *      per isolate — only so a fresh deploy works before the secret exists.
 *
 * SESSION_SECRET is deliberately separate from AUTH_SECRET/SETTINGS_KEY: those
 * feed the at-rest encryption key in crypto.ts, and introducing one of them now
 * would silently change that key and make every stored secret unreadable.
 */

const SESSION_KEY_ROW = '__session_key__';

let cached: { secret: string; key: CryptoKey } | null = null;
/** The stored fallback secret, read once per isolate rather than per request. */
let dbSecret: string | null = null;

export type SessionKeySource = 'session_secret' | 'auth_secret' | 'database';

async function resolveSecret(): Promise<{ secret: string; source: SessionKeySource }> {
  const env = await appEnv();
  if (env.SESSION_SECRET) return { secret: env.SESSION_SECRET, source: 'session_secret' };
  if (env.AUTH_SECRET) return { secret: env.AUTH_SECRET, source: 'auth_secret' };

  if (dbSecret) return { secret: dbSecret, source: 'database' };
  if (!env.DATA) throw new Error('No SESSION_SECRET and no storage to hold a session key.');
  // Create-once: two isolates racing here agree on whichever key was written first.
  const fresh = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, '0')).join('');
  const d = await data();
  const { doc } = await d.store.createDoc<SecretDoc>(`secret/${SESSION_KEY_ROW}`, { value: fresh, updated_at: nowIso() });
  dbSecret = doc.value;
  return { secret: dbSecret, source: 'database' };
}

async function hmacKey(): Promise<CryptoKey> {
  const { secret } = await resolveSecret();
  if (cached && cached.secret === secret) return cached.key;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`xaa:session:${secret}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  cached = { secret, key };
  return key;
}

export async function sessionKeySource(): Promise<SessionKeySource> {
  return (await resolveSecret()).source;
}

function b64urlEncode(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(text: string): Uint8Array {
  const pad = text.length % 4 === 0 ? '' : '='.repeat(4 - (text.length % 4));
  const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

/** Sign `data` (any JSON-serialisable value) into a token valid until `expires`. */
export async function signToken<T>(data: T, expires: Date): Promise<string> {
  const payload = b64urlEncode(new TextEncoder().encode(JSON.stringify({ d: data, exp: expires.getTime() })));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(), new TextEncoder().encode(payload));
  return `${payload}.${b64urlEncode(new Uint8Array(sig))}`;
}

/** The data inside a token, or null if it is malformed, forged or expired. */
export async function verifyToken<T>(token: string | undefined | null): Promise<T | null> {
  if (!token || token.length > 4096) return null;
  const dot = token.indexOf('.');
  if (dot <= 0 || dot === token.length - 1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const ok = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(),
      b64urlDecode(sig) as unknown as BufferSource,
      new TextEncoder().encode(payload)
    );
    if (!ok) return null;
    const body = JSON.parse(new TextDecoder().decode(b64urlDecode(payload))) as { d: T; exp: number };
    if (!body || typeof body.exp !== 'number' || body.exp <= Date.now()) return null;
    return body.d;
  } catch {
    return null;
  }
}
