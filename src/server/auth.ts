import { cookies } from 'next/headers';
import type { D1Database } from '@cloudflare/workers-types';
import { db, newId, nowIso, appEnv } from './db';

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
const ITERATIONS = 210_000;

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
    'pbkdf2$210000$7a9fead4a7fa0b4da5e44eb895d32e98$54b0f4fca5deffd8f029abc82ebcb3079b28f372c19ffe6199776dab48e5bd0f',
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

export async function startSession(userId: string): Promise<void> {
  const database = await db();
  const id = `${newId()}${newId()}`.replace(/-/g, '');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await database
    .prepare('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .bind(id, userId, nowIso(), expires.toISOString())
    .run();
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
    const database = await db();
    await database.prepare('DELETE FROM sessions WHERE id = ?').bind(id).run();
  } catch {
    /* the cookie is gone either way */
  }
}

/** The signed-in user, or null. Safe to call on any page. */
export async function currentUser(): Promise<User | null> {
  let id: string | undefined;
  try {
    const jar = await cookies();
    id = jar.get(COOKIE)?.value;
  } catch {
    return null;
  }
  if (!id) return null;
  try {
    const database = await db();
    const row = await database
      .prepare(
        `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.id = ? AND s.expires_at > ?`
      )
      .bind(id, nowIso())
      .first<User>();
    return row ?? null;
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
    .prepare('SELECT id, role FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: string; role: string }>();

  if (existing) {
    if (existing.role !== 'admin') {
      await database.prepare('UPDATE users SET role = ? WHERE id = ?').bind('admin', existing.id).run();
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
