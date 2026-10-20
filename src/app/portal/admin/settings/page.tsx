import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { portalReady } from '@/server/db';
import { listSettings, SETTING_DEFS, SETTING_GROUPS } from '@/server/settings';
import { keySource, selfTest } from '@/server/crypto';
import { countNewLeads } from '@/server/leads';
import { AdminNav } from '@/components/AdminNav';
import { SettingsGroupForm, type SettingView } from '@/components/forms/AdminForms';
import { TestPayPal } from '@/components/forms/PayPalForms';
import Link from 'next/link';
import { soft, type Problems } from '@/server/soft';
import { DbNotice } from '@/components/DbNotice';
import { storageReport, type StorageReport } from '@/server/storage';
import { BackupNow, RecopyD1, RestoreBackup } from '@/components/forms/StorageForms';

export const metadata: Metadata = { title: 'Settings', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  if (!(await portalReady())) redirect('/portal');
  const user = await currentUser();
  if (!user) redirect('/login?next=/portal/admin/settings');
  if (user.role !== 'admin') redirect('/portal');

  const problems: Problems = [];
  const [values, source, ok, newLeads, storage] = await Promise.all([
    soft(problems, () => listSettings(), [] as Awaited<ReturnType<typeof listSettings>>),
    soft<Awaited<ReturnType<typeof keySource>>>(problems, () => keySource(), 'database'),
    soft(problems, () => selfTest(), false),
    soft(problems, () => countNewLeads(), 0),
    soft<StorageReport | null>(problems, () => storageReport(), null),
  ]);
  const byKey = new Map(values.map((v) => [v.key, v]));

  const views: SettingView[] = SETTING_DEFS.map((def) => {
    const v = byKey.get(def.key);
    return {
      key: def.key,
      label: def.label,
      hint: def.hint,
      secret: def.secret,
      placeholder: def.placeholder,
      options: def.options,
      value: v?.value ?? '',
      present: v?.present ?? false,
      masked: v?.masked ?? '',
      unreadable: v?.unreadable ?? false,
    };
  });

  const secretsStored = views.filter((v) => v.secret && v.present).length;
  const has = (key: string) => Boolean(byKey.get(key)?.present && !byKey.get(key)?.unreadable);
  const paypalLive = has('paypal_client_id') && has('paypal_client_secret');
  const paypalSandbox = has('paypal_sandbox_client_id') && has('paypal_sandbox_client_secret');
  const paypalMode = byKey.get('paypal_mode')?.value === 'sandbox' ? 'sandbox' : 'live';

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="eyebrow">Studio desk</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">Settings</h1>
      <p className="mt-2 max-w-2xl text-sm text-steel-500">
        Everything the running business needs that is not code. Values marked <em>Encrypted</em> are sealed before they
        are written and are never sent back to this screen — a blank field always means &ldquo;keep what is
        stored&rdquo;, so saving a form can never wipe a key by accident.
      </p>

      <div className="mt-8">
        <AdminNav current="/portal/admin/settings" newLeads={newLeads} />
      </div>
      <DbNotice problems={problems} />

      <div className="panel mb-8 border-l-4 border-l-[color:var(--accent)] p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`badge ${source === 'database' ? 'badge-amber' : 'badge-green'}`}>
            Key source: {source === 'settings_key' ? 'SETTINGS_KEY' : source === 'auth_secret' ? 'AUTH_SECRET' : 'database'}
          </span>
          <span className={`badge ${ok ? 'badge-green' : 'badge-red'}`}>
            {ok ? 'Encryption self-test passed' : 'Encryption self-test FAILED'}
          </span>
          <span className="badge badge-grey">{secretsStored} secret{secretsStored === 1 ? '' : 's'} stored</span>
        </div>
        {source === 'database' ? (
          <p className="mt-2.5 text-sm leading-relaxed text-steel-500">
            The encryption key lives in the private data bucket, which protects a leaked export or backup but not someone
            holding both the bucket and the Worker. Upgrade once with{' '}
            <code className="rounded bg-[color:var(--surface-2)] px-1.5 py-0.5 text-xs">npx wrangler secret put SETTINGS_KEY</code>
            , then re-enter each secret — old values will show as unreadable until you do, which is the expected
            behaviour, not a fault.
          </p>
        ) : (
          <p className="mt-2.5 text-sm leading-relaxed text-steel-500">
            The key is held as a Worker secret and never written to storage.
          </p>
        )}
      </div>

      <div className="space-y-8">
        {SETTING_GROUPS.map((g) => (
          <div key={g.id} id={`settings-${g.id}`} className="space-y-3">
            <SettingsGroupForm
              group={g.id}
              title={g.title}
              blurb={g.blurb}
              fields={views.filter((v) => SETTING_DEFS.find((d) => d.key === v.key)?.group === g.id)}
            />
            {g.id === 'paypal' ? (
              <div className="panel p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`badge ${paypalLive ? 'badge-green' : 'badge-grey'}`}>Live {paypalLive ? 'ready' : 'not set'}</span>
                  <span className={`badge ${paypalSandbox ? 'badge-green' : 'badge-grey'}`}>Sandbox {paypalSandbox ? 'ready' : 'not set'}</span>
                  <span className={`badge ${paypalMode === 'sandbox' ? 'badge-amber' : 'badge-blue'}`}>
                    Checkout uses {paypalMode === 'sandbox' ? 'Sandbox' : 'Live'}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <TestPayPal env="live" />
                  <TestPayPal env="sandbox" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-steel-500">
                  The webhook is set up by the portal itself: saving (or testing) a set of keys creates{' '}
                  <code className="rounded bg-[color:var(--surface-2)] px-1.5 py-0.5 text-xs">https://xaa.es/api/paypal/webhook</code> on that
                  PayPal app with the checkout and payment-capture events, and fills in its ID above. Nothing to do in the PayPal dashboard.
                </p>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <section id="settings-storage" className="panel mt-8 p-5" aria-labelledby="storage-title">
        <h2 id="storage-title" className="font-display text-base font-extrabold">Data storage (R2)</h2>
        <p className="mt-2 text-sm leading-relaxed text-steel-500">
          Every record — accounts, projects, payments, orders, settings, investors, support — is kept in the private R2
          bucket <code className="rounded bg-[color:var(--surface-2)] px-1.5 py-0.5 text-xs">xaa-data</code>; files are in{' '}
          <code className="rounded bg-[color:var(--surface-2)] px-1.5 py-0.5 text-xs">xaa-uploads</code>. Nothing is written to D1.
          A full backup is taken every day at 03:17 UTC and kept 35 days.
        </p>
        {storage ? (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {storage.migration ? (
                <span className="badge badge-green">
                  Move from D1: done {new Date(storage.migration.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC
                  {storage.migration.source === 'fresh' ? ' (fresh start)' : ''}
                </span>
              ) : (
                <span className="badge badge-amber">Move from D1: running</span>
              )}
              <span className={`badge ${storage.legacyD1 ? 'badge-grey' : 'badge-green'}`}>
                {storage.legacyD1 ? 'Old D1 still bound (read-only copy)' : 'D1 removed'}
              </span>
            </div>

            {storage.migration && Object.keys(storage.migration.tables).length ? (
              <div className="mt-4 overflow-x-auto" role="region" aria-label="Rows moved from D1" tabIndex={0}>
                <table className="w-full text-left text-xs">
                  <caption className="sr-only">Rows in D1 and documents in R2, per table, at the move</caption>
                  <thead>
                    <tr className="text-steel-400">
                      <th scope="col" className="py-1 pr-4 font-semibold">D1 table</th>
                      <th scope="col" className="py-1 pr-4 font-semibold">Rows in D1</th>
                      <th scope="col" className="py-1 font-semibold">In R2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(storage.migration.tables).map(([t, r]) => (
                      <tr key={t} className="border-t border-[color:var(--line)]">
                        <td className="py-1 pr-4 font-mono">{t}</td>
                        <td className="py-1 pr-4">{r.d1}</td>
                        <td className={`py-1 font-semibold ${r.r2 >= r.d1 ? 'text-green-700' : 'text-red-700'}`}>{r.r2}{r.r2 >= r.d1 ? ' ✓' : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-steel-400">Documents now</p>
            <ul className="mt-1 flex flex-wrap gap-2 text-xs">
              {storage.counts.map((c) => (
                <li key={c.name} className="rounded-md bg-[color:var(--surface)] px-2 py-1">
                  <span className="font-mono">{c.name}</span> <strong>{c.docs}</strong>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap items-start gap-3">
              <BackupNow />
              {storage.legacyD1 ? <RecopyD1 /> : null}
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-steel-400">Backups (newest first)</p>
            {storage.backups === null ? (
              <p className="mt-1 text-sm text-steel-500">No backup bucket is bound to this deployment.</p>
            ) : storage.backups.length === 0 ? (
              <p className="mt-1 text-sm text-steel-500">No backup yet — the first daily one runs tonight, or press “Back up now”.</p>
            ) : (
              <ul className="mt-2 space-y-3">
                {storage.backups.map((b) => {
                  const when = new Date(b.takenAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });
                  return (
                    <li key={b.key} data-backup-key={b.key} className="rounded-md border border-[color:var(--line)] p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong>{when} UTC</strong>
                        <span className="badge badge-grey">{b.reason || 'backup'}</span>
                        <span className="text-xs text-steel-500">{b.objects} objects · {(b.bytes / 1024).toFixed(1)} KB</span>
                        <a className="text-xs font-semibold underline" href={`/api/admin/backups?key=${encodeURIComponent(b.key)}`}>Download</a>
                      </div>
                      <RestoreBackup backupKey={b.key} label={`${when} UTC`} />
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : (
          <p className="mt-3 text-sm text-steel-500">The storage report could not be read right now.</p>
        )}
      </section>

      <div className="panel mt-8 p-5">
        <h2 className="font-display text-base font-extrabold">Investors</h2>
        <p className="mt-2 text-sm leading-relaxed text-steel-500">
          xaa.es raises from its own investors, on its own revenue — nothing is shared with axto.io any more. Applications,
          verification of the capital received, monthly payouts and each investor&rsquo;s statement live in{' '}
          <Link href="/portal/admin/investors" className="font-semibold underline">Studio desk → Investors</Link>; the terms are in the
          “Investor offering” group above.
        </p>
      </div>

      <div className="panel mt-8 p-5">
        <h2 className="font-display text-base font-extrabold">What is deliberately not here</h2>
        <p className="mt-2 text-sm leading-relaxed text-steel-500">
          Package prices, timelines and page copy stay in the repository, where every change is reviewed and versioned.
          A settings screen is the wrong place to edit the terms of a contract — and a price that can be changed from a
          browser is a price nobody can audit later.
        </p>
      </div>
    </div>
  );
}
