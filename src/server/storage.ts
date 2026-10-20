import { appEnv } from './db';
import { data, rawData } from './data';
import { migrationState, recopyFromD1, type MigrationState, type TableReport } from './migrate';
import { listBackups, readBackup, restoreBackup, takeBackup, type BackupInfo, type BlobBucket } from './r2/backup';

/**
 * Admin → Settings → Data storage: what is in R2, how the move from D1 went,
 * and the backups (take one now, download one, restore one).
 */

export interface StorageReport {
  migration: MigrationState | null;
  legacyD1: boolean;
  /** Documents per collection, counted live from the bucket. */
  counts: { name: string; docs: number }[];
  /** Null when the deployment has no backup bucket bound. */
  backups: BackupInfo[] | null;
}

async function backupBucket(): Promise<BlobBucket | null> {
  const env = await appEnv();
  return (env.BACKUPS as unknown as BlobBucket | undefined) ?? null;
}

export async function storageReport(): Promise<StorageReport> {
  const d = await data();
  const env = await appEnv();
  const cols = [
    d.users, d.projects, d.payments, d.files, d.updates, d.enquiries, d.paymentMethods, d.projectAi, d.recoveryEvents,
    d.templateOrders, d.checkouts, d.investors, d.payouts, d.bundles, d.threads,
  ];
  const counts = await Promise.all(cols.map(async (c) => ({ name: c.def.name, docs: await c.countDocs() })));
  const bb = await backupBucket();
  return {
    migration: await migrationState(d),
    legacyD1: Boolean(env.DB),
    counts,
    backups: bb ? await listBackups(bb, 15) : null,
  };
}

export async function backupNow(actor: string): Promise<BackupInfo> {
  const bb = await backupBucket();
  if (!bb) throw new Error('No backup bucket is bound to this deployment.');
  const d = await data();
  return takeBackup(d.store.bucket, bb, `manual by ${actor}`);
}

export async function restoreFrom(key: string, actor: string): Promise<{ written: number; removed: number; safety: BackupInfo }> {
  const bb = await backupBucket();
  if (!bb) throw new Error('No backup bucket is bound to this deployment.');
  const d = await rawData();
  return restoreBackup(d.store.bucket, bb, key, actor);
}

/** The gzip of one backup, for the admin download. */
export async function backupFile(key: string): Promise<{ body: ArrayBuffer; name: string } | null> {
  const bb = await backupBucket();
  if (!bb) return null;
  await readBackup(bb, key); // validates the key, the checksum and the format
  const obj = await bb.get(key);
  if (!obj) return null;
  return { body: await obj.arrayBuffer(), name: `xaa-data-${key.replace(/^backups\//, '').replace(/\//g, '_')}` };
}

export async function recopyD1(): Promise<Record<string, TableReport> | null> {
  return recopyFromD1(await data());
}
