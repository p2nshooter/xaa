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
import { RevenueFeed } from '@/components/forms/RevenueFeedForms';
import { revenueTokenCreatedAt } from '@/server/revenue';
import { soft, type Problems } from '@/server/soft';
import { DbNotice } from '@/components/DbNotice';

export const metadata: Metadata = { title: 'Settings', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  if (!(await portalReady())) redirect('/portal');
  const user = await currentUser();
  if (!user) redirect('/login?next=/portal/admin/settings');
  if (user.role !== 'admin') redirect('/portal');

  const problems: Problems = [];
  const [values, source, ok, newLeads, feedAt] = await Promise.all([
    soft(problems, () => listSettings(), [] as Awaited<ReturnType<typeof listSettings>>),
    soft<Awaited<ReturnType<typeof keySource>>>(problems, () => keySource(), 'database'),
    soft(problems, () => selfTest(), false),
    soft(problems, () => countNewLeads(), 0),
    soft(problems, () => revenueTokenCreatedAt(), ''),
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

      <div className="mt-8">
        <RevenueFeed createdAt={feedAt} />
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
