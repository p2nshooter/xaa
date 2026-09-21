import { cookies } from 'next/headers';
import type { D1Database } from '@cloudflare/workers-types';
import { db, bucket, newId, nowIso, appEnv } from './db';

/**
 * Account and session handling for the client portal.
 *
 * Passwords are PBKDF2-SHA256 (210k iterations, per-user salt) through
 * WebCrypto, which exists identically in the Workers runtime and in Node, so
 * there is no native dependency to break the Cloudflare build. Sessions are
 * opaque random tokens stored in D1 — revocable server-side, which a
 * self-contained JWT would not be.
 */

const COOKIE = 'xaa_session';
const SESSION_DAYS = 30;
// PBKDF2 rounds for NEW hashes. Kept deliberately modest because this runs in
// a Cloudflare Worker, where a single 210k-round derivation (~100ms of CPU) can
// blow the per-request CPU budget and make sign-in throw. 100k is still a sound
// work factor, and verifyPassword reads each stored hash's own round count from
// the string, so hashes written at the old value keep verifying unchanged.
const ITERATIONS = 100_000;

/**
 * Emails that are always the studio admin, whatever the ADMIN_EMAIL secret
 * says. The studio owner's account is seeded straight into the database and
 * signs in directly — there is no "become admin by registering".
 */
export const ADMIN_EMAILS = ['alghoniy2026@gmail.com'];

/**
 * The seeded studio account.
 *
 * Only the PBKDF2 hash is stored here, never the plaintext — this repository
 * is public, and a reversible password in it would be a live credential. The
 * hash is 210k-iteration PBKDF2-SHA256, the same scheme verifyPassword uses,
 * so the owner signs in with the real password while the source reveals
 * nothing usable. Rotate it with `npx wrangler secret put ADMIN_PASSWORD` and
 * the seed defers to that instead (see seedAdmin).
 */
const SEED_ADMIN = {
  email: 'alghoniy2026@gmail.com',
  name: 'XAA Studio',
  passwordHash:
    'pbkdf2$100000$dec21423a7fadaa2b3d4bb3efd6c3a9f$8b82ea3510ae09b69e70829cf9a2d0114191e09fc20f02c0ee9c9d813c9a3149',
};

export interface User {
  id: string;
  email: string;
  name: string;
  company: string | null;
  country: string | null;
  phone: string | null;
  role: 'client' | 'admin';
  created_at: string;
}

function bytesToHex(b: ArrayBuffer): string {
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function derive(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
  return bytesToHex(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt);
  return `pbkdf2$${ITERATIONS}$${bytesToHex(salt.buffer as ArrayBuffer)}$${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iter, saltHex, hash] = stored.split('$');
  if (scheme !== 'pbkdf2' || !iter || !saltHex || !hash) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(saltHex) as unknown as BufferSource, iterations: Number(iter), hash: 'SHA-256' },
    key,
    256
  );
  const got = bytesToHex(bits);
  // Constant-time-ish comparison; both strings are the same fixed length.
  if (got.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i += 1) diff |= got.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const database = await db();
  const row = await database
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(normaliseEmail(email))
    .first<User & { password_hash: string }>();
  return row ?? null;
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
  company?: string;
  country?: string;
  phone?: string;
}): Promise<User> {
  const database = await db();
  const env = await appEnv();
  const email = normaliseEmail(input.email);
  const existing = await database.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) throw new Error('An account with that email already exists.');

  // Admin is NEVER granted by being first to register — that is an open door.
  // The studio account is seeded directly into the database (see seedAdmin),
  // and only an email on the built-in list, or the configured ADMIN_EMAIL, is
  // ever an admin. Everyone who registers through the public form is a client.
  const role =
    ADMIN_EMAILS.includes(email) || (env.ADMIN_EMAIL && normaliseEmail(env.ADMIN_EMAIL) === email)
      ? 'admin'
      : 'client';

  const user: User = {
    id: newId(),
    email,
    name: input.name.trim(),
    company: input.company?.trim() || null,
    country: input.country?.trim() || null,
    phone: input.phone?.trim() || null,
    role,
    created_at: nowIso(),
  };
  await database
    .prepare(
      `INSERT INTO users (id, email, name, company, country, phone, password_hash, role, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(user.id, user.email, user.name, user.company, user.country, user.phone, await hashPassword(input.password), user.role, user.created_at)
    .run();
  return user;
}

/**
 * Sessions live in R2, not D1.
 *
 * D1's free tier caps daily row *reads*, and currentUser() runs on every single
 * portal page load — one JOIN per request is the busiest read in the whole app.
 * When the account's shared D1 read budget is exhausted (the election databases
 * on the same account are large), that one read starts failing and the studio
 * owner cannot even sign in. R2 has a separate, far larger budget and stores
 * the whole session as one small object, so authentication no longer depends on
 * D1 being under quota. The object carries a snapshot of the user, so reading a
 * session returns the signed-in user with no database round-trip at all.
 */
const SESSION_PREFIX = 'sess/';

interface SessionBlob {
  user: User;
  expires_at: string;
}

export async function startSession(user: User): Promise<void> {
  const id = `${newId()}${newId()}`.replace(/-/g, '');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  const b = await bucket();
  if (!b) throw new Error('Session storage (R2) is not configured.');
  const blob: SessionBlob = { user, expires_at: expires.toISOString() };
  await b.put(`${SESSION_PREFIX}${id}`, JSON.stringify(blob), {
    httpMetadata: { contentType: 'application/json' },
  });
  const jar = await cookies();
  jar.set(COOKIE, id, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    expires,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  jar.delete(COOKIE);
  if (!id) return;
  try {
    const b = await bucket();
    if (b) await b.delete(`${SESSION_PREFIX}${id}`);
  } catch {
    /* the cookie is gone either way */
  }
}

/** The signed-in user, or null. Safe to call on any page. Reads R2, not D1. */
export async function currentUser(): Promise<User | null> {
  let id: string | undefined;
  try {
    const jar = await cookies();
    id = jar.get(COOKIE)?.value;
  } catch {
    return null;
  }
  if (!id || !/^[a-f0-9]{32,}$/i.test(id)) return null;
  try {
    const b = await bucket();
    if (!b) return null;
    const obj = await b.get(`${SESSION_PREFIX}${id}`);
    if (!obj) return null;
    const blob = JSON.parse(await obj.text()) as SessionBlob;
    if (!blob.expires_at || new Date(blob.expires_at) <= new Date()) {
      // Expired: best-effort tidy so it does not linger in the bucket.
      try { await b.delete(`${SESSION_PREFIX}${id}`); } catch { /* ignore */ }
      return null;
    }
    return blob.user ?? null;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) throw new Error('AUTH_REQUIRED');
  return user;
}

/**
 * Create the studio admin account if it does not exist, so the owner can sign
 * in the moment the portal is deployed — no registration, no first-comer race.
 *
 * Idempotent, and safe to call on every schema init:
 *  - if the account exists, it is left alone;
 *  - the password comes from the ADMIN_PASSWORD Worker secret when set,
 *    otherwise from the committed hash (which is not reversible);
 *  - an existing account whose email is on the admin list but which somehow
 *    has role 'client' is promoted, so a mistaken earlier registration cannot
 *    lock the owner out.
 */
export async function seedAdmin(database: D1Database, env: { ADMIN_PASSWORD?: string }): Promise<void> {
  const email = normaliseEmail(SEED_ADMIN.email);

  const existing = await database
    .prepare('SELECT id, role, password_hash FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: string; role: string; password_hash: string }>();

  if (existing) {
    // Keep the studio account correct even if an earlier deploy left it wrong.
    if (existing.role !== 'admin') {
      await database.prepare('UPDATE users SET role = ? WHERE id = ?').bind('admin', existing.id).run();
    }
    // Heal the password too. When no ADMIN_PASSWORD secret is set the intended
    // password is the committed one, so a row carrying a stale or higher-cost
    // hash (e.g. seeded by an earlier build) is refreshed to the current hash.
    // This is what lets the owner sign in after the work factor changed, and it
    // corrects a row that was seeded with the wrong hash. It never runs when a
    // secret governs the password.
    if (!env.ADMIN_PASSWORD && existing.password_hash !== SEED_ADMIN.passwordHash) {
      await database.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(SEED_ADMIN.passwordHash, existing.id).run();
    }
    return;
  }

  const passwordHash = env.ADMIN_PASSWORD ? await hashPassword(env.ADMIN_PASSWORD) : SEED_ADMIN.passwordHash;
  await database
    .prepare(
      `INSERT INTO users (id, email, name, company, country, phone, password_hash, role, created_at)
       VALUES (?, ?, ?, NULL, NULL, NULL, ?, 'admin', ?)`
    )
    .bind(newId(), email, SEED_ADMIN.name, passwordHash, nowIso())
    .run();
}

/** True when `email` is the studio account (built-in list or ADMIN_EMAIL). */
export function isAdminEmail(email: string, env: { ADMIN_EMAIL?: string }): boolean {
  const e = normaliseEmail(email);
  return ADMIN_EMAILS.includes(e) || Boolean(env.ADMIN_EMAIL && normaliseEmail(env.ADMIN_EMAIL) === e);
}

/** Length-independent-ish constant-time string comparison. */
function slowEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i += 1) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

/**
 * Verify the studio password WITHOUT touching D1.
 *
 * This is the whole point of the R2 pivot: the owner must be able to sign in
 * even when the account's D1 read budget is exhausted. When an ADMIN_PASSWORD
 * secret is set, the secret *is* the plaintext, so we compare directly; with no
 * secret, the intended password is the committed hash, verified with the same
 * PBKDF2 scheme as every other account. Either way, no database is read.
 */
export async function verifyAdminPassword(password: string, env: { ADMIN_PASSWORD?: string }): Promise<boolean> {
  if (env.ADMIN_PASSWORD) return slowEqual(password, env.ADMIN_PASSWORD);
  return verifyPassword(password, SEED_ADMIN.passwordHash);
}

/**
 * The studio admin as a session user, built from source — no D1 row required.
 * A stable synthetic id keeps the session valid across deploys; the admin desk
 * lists every client's work rather than its own, so this id needs no projects.
 */
export function adminSessionUser(email: string): User {
  return {
    id: `studio:${normaliseEmail(email)}`,
    email: normaliseEmail(email),
    name: SEED_ADMIN.name,
    company: null,
    country: null,
    phone: null,
    role: 'admin',
    created_at: nowIso(),
  };
}
