import { appEnv, NotConfiguredError } from './db';
import { ensureMigrated } from './migrate';
import type { R2Like } from './r2/bucket';
import { dataFor, type Data } from './r2/schema';
import { Store } from './r2/store';

/**
 * The portal's records, in R2 (owner, 20 Oct 2026: "Database semuanya ke R2").
 *
 * `data()` is what every module calls. It returns the collections of
 * server/r2/schema.ts on the DATA bucket, after making sure the one-time copy
 * from D1 has happened (server/migrate.ts) and the studio account exists.
 */

let cached: { binding: unknown; data: Data } | null = null;
let seeded = false;

/** The collections without the migration gate — for the migrator and the health probe. */
export async function rawData(): Promise<Data> {
  const env = await appEnv();
  if (!env.DATA) throw new NotConfiguredError();
  if (cached?.binding === env.DATA) return cached.data;
  const d = dataFor(new Store(env.DATA as unknown as R2Like));
  cached = { binding: env.DATA, data: d };
  return d;
}

export async function data(): Promise<Data> {
  const d = await rawData();
  await ensureMigrated(d);
  if (!seeded) {
    try {
      const { seedAdmin } = await import('./auth');
      await seedAdmin(d, { ADMIN_PASSWORD: (await appEnv()).ADMIN_PASSWORD });
      seeded = true;
    } catch (err) {
      console.error('seedAdmin failed (non-fatal):', err);
    }
  }
  return d;
}

export type { Data };
