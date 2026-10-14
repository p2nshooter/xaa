import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { portalReady } from '@/server/db';
import { listPaymentMethods, maskedAddress } from '@/server/settings';
import { listRecentCheckouts, paypalStatus } from '@/server/paypal';
import { keySource, selfTest } from '@/server/crypto';
import { countNewLeads } from '@/server/leads';
import { AdminNav } from '@/components/AdminNav';
import { PaymentMethodForm, PaymentMethodRow, ImportEnvMethods, ImportCompanyMethods, type MethodView } from '@/components/forms/AdminForms';
import { soft, type Problems } from '@/server/soft';
import { DbNotice } from '@/components/DbNotice';

export const metadata: Metadata = { title: 'Payment destinations', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const KEY_NOTE: Record<Awaited<ReturnType<typeof keySource>>, { badge: string; text: string }> = {
  settings_key: {
    badge: 'badge-green',
    text: 'Encrypted with SETTINGS_KEY, a Worker secret. The key is never stored in the database — this is the strongest configuration.',
  },
  auth_secret: {
    badge: 'badge-green',
    text: 'Encrypted with AUTH_SECRET, a Worker secret. The key is never stored in the database.',
  },
  database: {
    badge: 'badge-amber',
    text: 'Encrypted with a key generated on first use and kept in the database. That protects a leaked database export or backup, but not someone holding both the database and the running Worker. To upgrade, run `npx wrangler secret put SETTINGS_KEY`, then re-enter each value once.',
  },
};

export default async function AdminPaymentsPage() {
  if (!(await portalReady())) redirect('/portal');
  const user = await currentUser();
  if (!user) redirect('/login?next=/portal/admin/payments');
  if (user.role !== 'admin') redirect('/portal');

  const problems: Problems = [];
  const [methods, source, ok, newLeads, pp, checkouts] = await Promise.all([
    soft(problems, () => listPaymentMethods(), [] as Awaited<ReturnType<typeof listPaymentMethods>>),
    soft<Awaited<ReturnType<typeof keySource>>>(problems, () => keySource(), 'database'),
    soft(problems, () => selfTest(), false),
    soft(problems, () => countNewLeads(), 0),
    soft(problems, () => paypalStatus(), { live: false, sandbox: false, mode: 'live' as const }),
    soft(problems, () => listRecentCheckouts(15), [] as Awaited<ReturnType<typeof listRecentCheckouts>>),
  ]);
  const ppReady = pp.mode === 'sandbox' ? pp.sandbox : pp.live;

  const views: MethodView[] = methods.map((m) => ({
    id: m.id,
    kind: m.kind,
    label: m.label,
    network: m.network,
    currency: m.currency,
    masked: maskedAddress(m),
    link: m.link,
    instructions: m.instructions,
    active: m.active,
    sortOrder: m.sortOrder,
    unreadable: m.unreadable,
    hasMemo: Boolean(m.memo),
    holder: m.holder,
    bankName: m.bankName,
    swift: m.swift,
    branch: m.branch,
    bankCountry: m.bankCountry,
  }));

  const active = views.filter((m) => m.active).length;
  const note = KEY_NOTE[source];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="eyebrow">Studio desk</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">Payment destinations</h1>
      <p className="mt-2 max-w-2xl text-sm text-steel-500">
        Where clients send money. Add, edit or hide them here — changes are live on the payment screen immediately, with
        no deploy. Addresses are encrypted before they are written and are shown in full only to a client who is paying.
      </p>

      <div className="mt-8">
        <AdminNav current="/portal/admin/payments" newLeads={newLeads} />
      </div>
      <DbNotice problems={problems} />

      {/* Encryption status — stated plainly rather than implied by a padlock. */}
      <div className="panel mb-8 border-l-4 border-l-[color:var(--accent)] p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`badge ${note.badge}`}>Encryption at rest</span>
          {ok ? (
            <span className="badge badge-green">Self-test passed</span>
          ) : (
            <span className="badge badge-red">Self-test failed — values cannot be sealed</span>
          )}
        </div>
        <p className="mt-2.5 text-sm leading-relaxed text-steel-500">{note.text}</p>
      </div>

      {/* PayPal Checkout — automatic, configured under Settings. */}
      <section className="panel mb-8 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-extrabold">PayPal Checkout</h2>
            <span className={`badge ${ppReady ? 'badge-green' : 'badge-amber'}`}>
              {ppReady ? `On · ${pp.mode === 'sandbox' ? 'Sandbox (test money)' : 'Live'}` : 'Off — credentials missing'}
            </span>
          </div>
          <Link href="/portal/admin/settings#settings-paypal" className="btn btn-ghost btn-sm">PayPal settings</Link>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-steel-500">
          Clients pay with their PayPal balance or a card through PayPal; each payment is captured and confirmed
          automatically, and the project or download unlocks at once. Manual PayPal destinations below are hidden from
          clients while this is on.
        </p>
        {checkouts.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="text-steel-400">
                <tr>
                  <th className="py-1.5 pr-3 font-semibold">When</th>
                  <th className="py-1.5 pr-3 font-semibold">For</th>
                  <th className="py-1.5 pr-3 font-semibold">Amount</th>
                  <th className="py-1.5 pr-3 font-semibold">Status</th>
                  <th className="py-1.5 font-semibold">PayPal capture</th>
                </tr>
              </thead>
              <tbody>
                {checkouts.map((c) => (
                  <tr key={c.id} className="border-t border-[color:var(--line)]">
                    <td className="py-1.5 pr-3 whitespace-nowrap">{c.created_at.slice(0, 16).replace('T', ' ')}</td>
                    <td className="py-1.5 pr-3">
                      {c.ref ?? '—'} <span className="text-steel-400">{c.label ?? ''}</span>
                      {c.env === 'sandbox' ? <span className="ml-1 badge badge-amber">test</span> : null}
                    </td>
                    <td className="py-1.5 pr-3">€{c.amount.toLocaleString('en-GB')}</td>
                    <td className="py-1.5 pr-3" title={c.detail ?? ''}>
                      <span className={`badge ${c.status === 'completed' ? 'badge-green' : c.status === 'failed' ? 'badge-red' : c.status === 'pending' ? 'badge-amber' : 'badge-grey'}`}>{c.status}</span>
                    </td>
                    <td className="py-1.5 font-mono">{c.capture_id ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-xs text-steel-400">No PayPal checkouts yet.</p>
        )}
      </section>

      {active === 0 && !ppReady ? (
        <div className="panel mb-8 border-l-4 border-l-amber-400 bg-amber-50/50 p-5">
          <p className="font-bold text-ink-900">No active destination — clients cannot pay</p>
          <p className="mt-1.5 text-sm text-steel-500">
            The payment screen tells them so honestly rather than showing an empty box, but no milestone can be settled
            until at least one destination is active. Add one below.
          </p>
          <div className="mt-3">
            <div className="flex flex-wrap justify-center gap-2"><ImportCompanyMethods /><ImportEnvMethods /></div>
          </div>
        </div>
      ) : null}

      <section className="mb-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold">
            {views.length} destination{views.length === 1 ? '' : 's'}
            <span className="ml-2 text-sm font-normal text-steel-400">{active} active</span>
          </h2>
          {views.length > 0 ? <div className="flex flex-wrap gap-2"><ImportCompanyMethods /><ImportEnvMethods /></div> : null}
        </div>
        <div className="space-y-4">
          {views.map((m) => (
            <PaymentMethodRow key={m.id} method={m} />
          ))}
          {views.length === 0 ? (
            <div className="panel p-6 text-sm text-steel-500">Nothing configured yet.</div>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-extrabold">Add a destination</h2>
        <PaymentMethodForm />
      </section>

      <p className="mt-8 text-xs leading-relaxed text-steel-400">
        Clients are told on <Link href="/payments" className="underline">the payments page</Link> that addresses appear
        only inside the signed-in portal and that we never send one by email. Keep that true: if a destination changes,
        change it here rather than messaging it to anyone.
      </p>
    </div>
  );
}
