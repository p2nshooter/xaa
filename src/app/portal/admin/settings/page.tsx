import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { portalReady } from '@/server/db';
import { listSettings, SETTING_DEFS, SETTING_GROUPS } from '@/server/settings';
import { keySource, selfTest } from '@/server/crypto';
import { countNewLeads } from '@/server/leads';
import { AdminNav } from '@/components/AdminNav';
import { SettingsGroupForm, type SettingView } from '@/components/forms/AdminForms';

export const metadata: Metadata = { title: 'Settings', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  if (!(await portalReady())) redirect('/portal');
  const user = await currentUser();
  if (!user) redirect('/login?next=/portal/admin/settings');
  if (user.role !== 'admin') redirect('/portal');

  const [values, source, ok, newLeads] = await Promise.all([
    listSettings(),
    keySource(),
    selfTest(),
    countNewLeads(),
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
      value: v?.value ?? '',
      present: v?.present ?? false,
      masked: v?.masked ?? '',
      unreadable: v?.unreadable ?? false,
    };
  });

  const secretsStored = views.filter((v) => v.secret && v.present).length;

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
            The encryption key lives in the database, which protects a leaked export or backup but not someone holding
            both the database and the Worker. Upgrade once with{' '}
            <code className="rounded bg-[color:var(--surface-2)] px-1.5 py-0.5 text-xs">npx wrangler secret put SETTINGS_KEY</code>
            , then re-enter each secret — old values will show as unreadable until you do, which is the expected
            behaviour, not a fault.
          </p>
        ) : (
          <p className="mt-2.5 text-sm leading-relaxed text-steel-500">
            The key is held as a Worker secret and never written to the database.
          </p>
        )}
      </div>

      <div className="space-y-8">
        {SETTING_GROUPS.map((g) => (
          <SettingsGroupForm
            key={g.id}
            group={g.id}
            title={g.title}
            blurb={g.blurb}
            fields={views.filter((v) => SETTING_DEFS.find((d) => d.key === v.key)?.group === g.id)}
          />
        ))}
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
