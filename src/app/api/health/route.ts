import { appEnv } from '@/server/db';
import { data, rawData } from '@/server/data';
import { migrationState } from '@/server/migrate';
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
 *   - whether the R2 data bucket answers, and the state of the one-time move
 *     of the old D1 records into it (per table: rows in D1 vs documents in R2).
 *
 * Calling it also lets that one-time move run (server/migrate.ts) — the deploy
 * workflow polls it until the move reports "done". It never returns a hash,
 * key, address, record or any secret value: only booleans, counts and states.
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
    DATA_R2: Boolean(env.DATA),
    LEGACY_D1: Boolean(env.DB),
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

  // R2 data: one read of the migration record, then the gate itself (which runs the
  // one-time D1 → R2 move if it has not happened yet).
  if (env.DATA) {
    try {
      const d = await rawData();
      const before = await migrationState(d);
      let gate = '';
      if (!before) await data().catch((e) => (gate = short(e)));
      const state = before ?? (await migrationState(d));
      out.data = state
        ? { ok: true, migration: state.status, source: state.source, at: state.at, tables: state.tables }
        : { ok: true, migration: 'pending', ...(gate ? { note: gate } : {}) };
    } catch (e) {
      out.data = { ok: false, error: short(e) };
    }
  } else {
    out.data = { ok: false, error: 'No DATA (R2) binding.' };
  }

  out.signInReady = sessionOk;
  return json(out, sessionOk);
}

function json(body: Record<string, unknown>, ok: boolean): Response {
  return new Response(JSON.stringify({ ok, ...body }, null, 2), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
