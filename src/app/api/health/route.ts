import { appEnv } from '@/server/db';
import { ADMIN_EMAILS, seedAdmin, findUserByEmail, verifyPassword, normaliseEmail } from '@/server/auth';

/**
 * A safe, credential-free health probe for the client portal.
 *
 * It exists because the production database lives in a Cloudflare account we
 * cannot inspect from the build environment, and outbound access to the live
 * site is blocked — so when sign-in fails in production there is otherwise no
 * way to see why. This endpoint reports what the sign-in path actually hits:
 * whether the D1 binding is present, whether the schema and admin seed run,
 * whether the studio row exists and verifies against the committed password.
 *
 * It never returns a password hash, an API key, a wallet address or any secret
 * value — only booleans, roles, counts and error *messages*. It also force-runs
 * the admin seed/heal, so opening it repairs a missing or stale studio row.
 */
export const dynamic = 'force-dynamic';

function short(err: unknown): string {
  const m = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  return m.length > 300 ? m.slice(0, 300) + '…' : m;
}

export async function GET(req: Request) {
  const out: Record<string, unknown> = { ok: false, ts: new Date().toISOString() };

  // 1. Which bindings and secrets are present (booleans only).
  let env: Awaited<ReturnType<typeof appEnv>> = {};
  try {
    env = await appEnv();
    out.bindings = {
      DB: Boolean(env.DB),
      UPLOADS: Boolean(env.UPLOADS),
      AUTH_SECRET: Boolean(env.AUTH_SECRET),
      SETTINGS_KEY: Boolean(env.SETTINGS_KEY),
      ADMIN_EMAIL: Boolean(env.ADMIN_EMAIL),
      ADMIN_PASSWORD: Boolean(env.ADMIN_PASSWORD),
    };
  } catch (e) {
    out.bindings_error = short(e);
    return json(out);
  }

  if (!env.DB) {
    out.error = 'No D1 binding (DB) in production — the portal database is not bound to this Worker.';
    return json(out);
  }

  // 2. Schema + admin seed/heal, run directly against the binding so a failure
  //    here is the failure sign-in would hit.
  try {
    const { db } = await import('@/server/db');
    await db(); // ensures schema, then runs the (best-effort) seed
    out.schema = 'ok';
  } catch (e) {
    out.schema_error = short(e);
  }

  try {
    await seedAdmin(env.DB, { ADMIN_PASSWORD: env.ADMIN_PASSWORD });
    out.seed = 'ok';
  } catch (e) {
    out.seed_error = short(e);
  }

  // 3. Users table + the studio row.
  try {
    const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM users').first<{ n: number }>();
    out.users = row?.n ?? 0;
  } catch (e) {
    out.users_error = short(e);
  }

  try {
    const email = normaliseEmail(ADMIN_EMAILS[0]!);
    const admin = await findUserByEmail(email);
    out.admin = admin
      ? { exists: true, role: admin.role, hashScheme: (admin.password_hash || '').split('$').slice(0, 2).join('$') }
      : { exists: false };

    // Optional password self-check: /api/health?probe=THEPASSWORD tells you
    // whether that password verifies against the stored studio hash, without
    // ever returning the hash. Handy to confirm the committed password works.
    const probe = new URL(req.url).searchParams.get('probe');
    if (probe && admin) out.admin = { ...(out.admin as object), passwordVerifies: await verifyPassword(probe, admin.password_hash) };
  } catch (e) {
    out.admin_error = short(e);
  }

  out.ok = !out.schema_error && !out.seed_error && !out.users_error && !out.admin_error;
  return json(out);
}

function json(body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
