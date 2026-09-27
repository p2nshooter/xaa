import { appEnv } from '@/server/db';
import { signToken, verifyToken, sessionKeySource } from '@/server/session';

/**
 * A safe, credential-free health probe for the portal.
 *
 * The production database lives in a Cloudflare account this build environment
 * cannot inspect, and outbound access to the live site is blocked from here, so
 * the deploy workflow calls this after every deploy and prints the result in the
 * Actions log. It reports what sign-in and the portal actually depend on:
 *
 *   - which bindings/secrets exist (booleans only, never values);
 *   - whether a session token can be signed and verified (what sign-in needs);
 *   - whether D1 answers a one-row read (it will not when the account's daily
 *     read budget is exhausted — the failure that took sign-in down before).
 *
 * It never returns a hash, key, address or any secret value. It deliberately
 * does NOT run the schema or the admin seed any more: those read many rows, and
 * a health check must not spend the very D1 budget it is there to watch.
 */
export const dynamic = 'force-dynamic';

function short(err: unknown): string {
  const m = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  return m.length > 300 ? m.slice(0, 300) + '…' : m;
}

export async function GET() {
  const out: Record<string, unknown> = { ts: new Date().toISOString() };

  let env: Awaited<ReturnType<typeof appEnv>> = {};
  try {
    env = await appEnv();
  } catch (e) {
    out.bindings_error = short(e);
    return json(out, false);
  }
  out.bindings = {
    DB: Boolean(env.DB),
    UPLOADS_R2: Boolean(env.UPLOADS),
    SESSION_SECRET: Boolean(env.SESSION_SECRET),
    AUTH_SECRET: Boolean(env.AUTH_SECRET),
    SETTINGS_KEY: Boolean(env.SETTINGS_KEY),
    ADMIN_PASSWORD: Boolean(env.ADMIN_PASSWORD),
  };

  // Sign-in readiness: a session must round-trip through sign → verify.
  let sessionOk = false;
  try {
    const token = await signToken({ probe: true }, new Date(Date.now() + 60_000));
    const back = await verifyToken<{ probe: boolean }>(token);
    const forged = await verifyToken<{ probe: boolean }>(token.slice(0, -2) + (token.endsWith('AA') ? 'BB' : 'AA'));
    sessionOk = Boolean(back?.probe) && forged === null;
    out.session = { ok: sessionOk, keySource: await sessionKeySource() };
  } catch (e) {
    out.session = { ok: false, error: short(e) };
  }

  // D1 reachability: one tiny read. Its failure does not block sign-in any more,
  // but it does block project/payment data, so it is reported plainly.
  if (env.DB) {
    try {
      await env.DB.prepare('SELECT 1 AS one').first();
      out.d1 = { ok: true };
    } catch (e) {
      out.d1 = { ok: false, error: short(e) };
    }
  } else {
    out.d1 = { ok: false, error: 'No D1 binding.' };
  }

  out.signInReady = sessionOk;
  return json(out, sessionOk);
}

function json(body: Record<string, unknown>, ok: boolean): Response {
  return new Response(JSON.stringify({ ok, ...body }, null, 2), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
