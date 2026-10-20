/**
 * The one-time D1 → R2 copy and the backups, against a fake D1 (rows in
 * memory, answering SELECT * FROM <table>) and the exact in-memory R2.
 *
 *   node --test tests/unit/
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { BlobBucket } from '../../src/server/r2/backup.ts';
import { listBackups, readBackup, restoreBackup, snapshot, takeBackup } from '../../src/server/r2/backup.ts';
import { FakeR2, fakeClock } from '../../src/server/r2/fake.ts';
import { copyAll, type D1Like } from '../../src/server/r2/migrate-d1.ts';
import { dataFor, messageStream } from '../../src/server/r2/schema.ts';
import { Store } from '../../src/server/r2/store.ts';

type Row = Record<string, unknown>;

function fakeD1(tables: Record<string, Row[]>): D1Like {
  return {
    prepare(sql: string) {
      const table = /FROM\s+(\w+)/i.exec(sql)?.[1] ?? '';
      return {
        async all<T>() {
          if (!(table in tables)) throw new Error(`D1_ERROR: no such table: ${table}: SQLITE_ERROR`);
          return { results: structuredClone(tables[table]) as T[] };
        },
      };
    },
  };
}

/** A backup bucket in memory (binary bodies, metadata, sorted list). */
class FakeBlobs implements BlobBucket {
  readonly objects = new Map<string, { body: ArrayBuffer; meta: Record<string, string>; uploaded: Date }>();
  async put(key: string, value: ArrayBuffer | string, options: { customMetadata?: Record<string, string> } = {}) {
    const body = typeof value === 'string' ? new TextEncoder().encode(value).buffer : value.slice(0);
    this.objects.set(key, { body: body as ArrayBuffer, meta: { ...(options.customMetadata ?? {}) }, uploaded: new Date() });
    return {};
  }
  async get(key: string) {
    const o = this.objects.get(key);
    return o ? { arrayBuffer: async () => o.body.slice(0), customMetadata: o.meta } : null;
  }
  async list(options: { prefix?: string } = {}) {
    const objects = [...this.objects.entries()]
      .filter(([k]) => k.startsWith(options.prefix ?? ''))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, o]) => ({ key, size: o.body.byteLength, uploaded: o.uploaded, customMetadata: o.meta }));
    return { objects, truncated: false };
  }
}

function setup() {
  const clock = fakeClock();
  const r2 = new FakeR2({ now: clock.now });
  const store = new Store(r2, { sleep: clock.sleep, now: clock.now });
  return { clock, r2, d: dataFor(store) };
}

const LEGACY: Record<string, Row[]> = {
  users: [
    { id: 'u-1', email: 'client@example.com', name: 'Client', company: null, country: 'ES', phone: null, password_hash: 'pbkdf2$1$aa$bb', role: 'client', created_at: '2026-10-01T10:00:00.000Z' },
    { id: 'u-admin', email: 'studio@example.com', name: 'XAA Studio', company: null, country: null, phone: null, password_hash: 'pbkdf2$1$cc$dd', role: 'admin', created_at: '2026-09-20T05:00:00.000Z' },
  ],
  sessions: [{ id: 's-1', user_id: 'u-1', created_at: '2026-10-01T10:00:00.000Z', expires_at: '2026-11-01T10:00:00.000Z' }],
  projects: [],
  payments: [],
  files: [],
  updates: [],
  enquiries: [
    { id: 'e-1', name: 'Prospect', email: 'p@example.com', company: null, budget: '€5k', package_slug: 'mvp', message: 'Hello', created_at: '2026-10-05T09:00:00.000Z', status: null, handled_at: null, handled_by: null, note: null },
  ],
  app_secrets: [
    { key: '__master_key__', value: 'AAAAkeyBASE64AAAA', updated_at: '2026-09-20T05:00:00.000Z' },
    { key: '__company_methods_seeded__', value: 'done', updated_at: '2026-09-20T05:00:00.000Z' },
    { key: '__schema_version__', value: '2026-10-19.1', updated_at: '2026-10-19T00:00:00.000Z' },
  ],
  app_settings: [
    { key: 'paypal_mode', value: '', is_secret: 0, updated_at: '2026-10-14T00:00:00.000Z', updated_by: 'admin' },
    { key: 'paypal_client_secret', value: 'v1.iv.cipher', is_secret: 1, updated_at: '2026-10-14T00:00:00.000Z', updated_by: 'admin' },
    { key: 'support.admin_last_seen', value: '1760000000000', is_secret: 0, updated_at: '2026-10-19T00:00:00.000Z', updated_by: null },
  ],
  payment_methods: [
    { id: 'pm-1', kind: 'bank', label: 'BNI · EUR', network: null, currency: 'EUR', address_enc: 'v1.a.b', memo_enc: null, link: null, instructions: 'wire', active: 1, sort_order: 1, holder: 'XAA', bank_name: 'BNI', swift: 'BNINIDJA', branch: null, bank_country: 'ID', created_at: '2026-10-14T00:00:00.000Z', updated_at: '2026-10-14T00:00:00.000Z' },
  ],
  project_ai: [],
  recovery_events: [],
  template_orders: [],
  paypal_checkouts: [],
  investors: [],
  investor_payouts: [],
  // template_bundles missing on purpose: a very old install never created it.
  support_threads: [
    { id: 't-1', token: 'a'.repeat(48), name: 'Visitor', email: 'v@example.com', topic: 'quote', source: 'chat', lang: 'en', status: 'open', user_id: null, unread_admin: 1, ai_replies: 0, created_at: '2026-10-10T08:00:00.000Z', updated_at: '2026-10-10T08:01:00.000Z' },
  ],
  support_messages: [
    { id: 'm-2', thread_id: 't-1', sender: 'system', body: 'We are offline', created_at: '2026-10-10T08:01:00.000Z' },
    { id: 'm-1', thread_id: 't-1', sender: 'visitor', body: 'Hi', created_at: '2026-10-10T08:00:00.000Z' },
  ],
};

describe('D1 → R2 copy', () => {
  it('copies every row with the same ids and reports a full match', async () => {
    const { d } = setup();
    const report = await copyAll(fakeD1(LEGACY), d);
    for (const [table, r] of Object.entries(report)) assert.equal(r.r2, r.d1, `${table}: ${r.r2}/${r.d1}`);
    assert.deepEqual(report.users, { d1: 2, r2: 2 });
    assert.deepEqual(report.app_secrets, { d1: 2, r2: 2 }, 'the schema marker is not copied');
    assert.deepEqual(report.app_settings, { d1: 2, r2: 2 }, 'the admin last-seen ping is not copied');
    assert.deepEqual(report.template_bundles, { d1: 0, r2: 0 });
    assert.equal(report.sessions, undefined, 'signed cookies replaced the sessions table');

    assert.equal((await d.users.find('email', 'CLIENT@example.com'))?.id, 'u-1');
    assert.equal((await d.store.getDoc<{ value: string } | null>('secret/__master_key__', null))?.value, 'AAAAkeyBASE64AAAA');
    assert.equal((await d.store.getDoc<{ value: string } | null>('setting/paypal_client_secret', null))?.value, 'v1.iv.cipher');
    assert.equal(await d.enquiries.count('status', 'new'), 1, 'a lead without status counts as new');
    assert.equal((await d.threads.find('token', 'a'.repeat(48)))?.id, 't-1');
    assert.equal(await d.threads.count('unread', 'all'), 1);
    const messages = await d.store.readLog<{ id: string }>(messageStream('t-1'));
    assert.deepEqual(messages.map((m) => m.value.id), ['m-1', 'm-2'], 'messages read back in time order');
  });

  it('is idempotent and never overwrites what R2 already holds', async () => {
    const { r2, d } = setup();
    await copyAll(fakeD1(LEGACY), d);
    await d.users.update('u-1', (u) => ({ ...u, name: 'Changed in R2' }));
    const keys = [...r2.objects.keys()].sort();
    const report = await copyAll(fakeD1(LEGACY), d);
    assert.deepEqual([...r2.objects.keys()].sort(), keys);
    assert.equal((await d.users.get('u-1'))?.name, 'Changed in R2');
    for (const r of Object.values(report)) assert.equal(r.r2, r.d1);
  });
});

describe('backups', () => {
  it('backs up everything and restores it exactly, after taking a safety backup', async () => {
    const { clock, r2, d } = setup();
    const blobs = new FakeBlobs();
    await copyAll(fakeD1(LEGACY), d);
    await d.store.createDoc('meta/migration', { status: 'done' });
    const before = await snapshot(r2);
    const first = await takeBackup(r2, blobs, 'daily', new Date('2026-10-20T03:17:00Z'), clock.sleep);
    assert.equal(first.key, 'backups/2026-10-20/031700-daily.json.gz');
    assert.equal(first.objects, before.length);

    // Damage: a new account, a deleted lead, an edited setting.
    await d.users.create({ id: 'u-new', email: 'new@example.com', name: 'New', company: null, country: null, phone: null, password_hash: 'x', role: 'client', created_at: '2026-10-20T04:00:00.000Z' });
    await d.enquiries.delete('e-1');
    await d.store.updateDoc('setting/paypal_mode', null, () => ({ value: 'sandbox', is_secret: 0, updated_at: 'x', updated_by: 'y' }));

    const result = await restoreBackup(r2, blobs, first.key, 'tester', clock.sleep);
    assert.ok(result.removed > 0);
    const after = await snapshot(r2);
    const norm = (objs: typeof before) => objs.filter((o) => !o.key.startsWith('k/meta/')).map((o) => JSON.stringify(o)).sort();
    assert.deepEqual(norm(after), norm(before));
    assert.equal(await d.users.find('email', 'new@example.com'), null);
    assert.equal((await d.enquiries.get('e-1'))?.name, 'Prospect');
    assert.ok(r2.objects.has('k/meta/migration'), 'the migration record is kept');

    const all = await listBackups(blobs);
    assert.equal(all.length, 2);
    assert.match(all[0]!.reason, /before-restore by tester/);
    assert.equal(all[0]!.key, result.safety.key);
  });

  it('refuses a damaged backup and a key outside the backup layout', async () => {
    const { r2 } = setup();
    const blobs = new FakeBlobs();
    const b = await takeBackup(r2, blobs, 'manual', new Date('2026-10-20T10:00:00Z'));
    blobs.objects.get(b.key)!.meta.sha256 = '0'.repeat(64);
    await assert.rejects(readBackup(blobs, b.key), /checksum/);
    await assert.rejects(readBackup(blobs, '../../etc/passwd'), /Not a backup/);
    await assert.rejects(readBackup(blobs, 'backups/2026-10-20/missing.json.gz'), /no longer exists/);
  });
});
