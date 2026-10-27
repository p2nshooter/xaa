import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { portalReady } from '@/server/db';
import { countNewLeads } from '@/server/leads';
import { formatDate } from '@/server/projects';
import { AdminNav } from '@/components/AdminNav';
import { InvestorDecision, InvestVisibility, PayoutForm } from '@/components/forms/InvestForms';
import { settingAudit, type SettingAuditEntry } from '@/server/settings';
import { getInvest, listInvestors, raisedUsd, statementFor, shareOf, pct, usd, eurAmount, INVEST_DEFAULTS, type Investor, type Statement } from '@/server/invest';
import { soft, type Problems } from '@/server/soft';
import { DbNotice } from '@/components/DbNotice';

export const metadata: Metadata = { title: 'Investors', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const STATUS: Record<string, { label: string; badge: string }> = {
  applied: { label: 'Applied', badge: 'badge-amber' },
  verified: { label: 'Verified', badge: 'badge-green' },
  declined: { label: 'Declined', badge: 'badge-grey' },
  returned: { label: 'Capital returned', badge: 'badge-blue' },
};

/**
 * Studio desk → Investors: the xaa.es raise, and only the xaa.es raise
 * (server/invest.ts). Applications from /invest, verification of the capital
 * received, each stake's computed statement and the monthly payouts.
 */
export default async function InvestorsPage() {
  if (!(await portalReady())) redirect('/portal');
  const user = await currentUser();
  if (!user) redirect('/login?next=/portal/admin/investors');
  if (user.role !== 'admin') redirect('/portal');

  const problems: Problems = [];
  const [offer, investors, raised, newLeads] = await Promise.all([
    soft(problems, () => getInvest(), { ...INVEST_DEFAULTS }),
    soft(problems, () => listInvestors(), [] as Investor[]),
    soft(problems, () => raisedUsd(), 0),
    soft(problems, () => countNewLeads(), 0),
  ]);
  const visibilityLog = await soft<SettingAuditEntry[]>(problems, () => settingAudit(['invest_visible'], 10), []);
  const running = investors.filter((i) => i.status === 'verified' || i.status === 'returned');
  const statements = new Map<string, Statement>();
  await Promise.all(
    running.map(async (i) => {
      const st = await soft<Statement | null>(problems, () => statementFor(i, offer), null);
      if (st) statements.set(i.id, st);
    }),
  );
  const open = investors.filter((i) => i.status === 'applied');
  const pctRaised = Math.min(100, (raised / offer.targetUsd) * 100);
  const totalBalance = [...statements.values()].reduce((s, st) => s + st.balanceEur, 0);
  const lastMonth = (() => {
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - 1);
    return d.toISOString().slice(0, 7);
  })();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="eyebrow">Studio desk</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">Investors in xaa.es</h1>
      <p className="mt-2 text-sm text-steel-500">
        The xaa.es raise only — axto.io raises separately on its own site. Terms are in{' '}
        <Link href="/portal/admin/settings#settings-invest" className="underline">Settings → Investor offering</Link>; the public page is{' '}
        <Link href="/invest" className="underline">/invest</Link>.
      </p>

      <div className="mt-8">
        <AdminNav current="/portal/admin/investors" newLeads={newLeads} />
      </div>
      <DbNotice problems={problems} />

      <section className="panel mb-6 p-5" data-testid="invest-visibility-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-steel-400">Visibility on xaa.es</p>
            <p className="mt-1 text-sm text-steel-500">Shown by default (owner, 27 Oct 2026). While hidden there is no footer link and no sitemap entry, /invest is a 404 and applications are refused; verified investors keep their statement in the portal.</p>
          </div>
          <InvestVisibility visible={offer.visible} />
        </div>
        {visibilityLog.length ? (
          <ul className="mt-4 space-y-1 text-xs text-steel-500" data-testid="invest-visibility-log">
            {visibilityLog.map((e, i) => <li key={i}>{e.at.slice(0, 16).replace('T', ' ')} UTC · {e.by || 'admin'} · {e.to === 'no' ? 'hidden' : 'shown'}</li>)}
          </ul>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="invest-summary">
        <div className="panel p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-steel-400">Status</p>
          <p className="mt-1 font-display text-xl font-extrabold capitalize">{offer.status}</p>
          <p className="mt-1 text-xs text-steel-500">{offer.indexed ? 'Indexed by search engines' : 'Link only (not indexed)'}</p>
        </div>
        <div className="panel p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-steel-400">Raised</p>
          <p className="mt-1 font-display text-xl font-extrabold" data-testid="invest-raised">{usd(raised)}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color:var(--surface-2)]">
            <div className="h-full rounded-full bg-[color:var(--accent)]" style={{ width: `${pctRaised}%` }} />
          </div>
          <p className="mt-1 text-xs text-steel-500">of {usd(offer.targetUsd)} · {pctRaised.toFixed(1)} %</p>
        </div>
        <div className="panel p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-steel-400">Revenue pool</p>
          <p className="mt-1 font-display text-xl font-extrabold">{offer.poolPct} %</p>
          <p className="mt-1 text-xs text-steel-500">of every confirmed xaa.es revenue transaction · min. ticket {usd(offer.minUsd)}</p>
        </div>
        <div className="panel p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-steel-400">Open balance</p>
          <p className="mt-1 font-display text-xl font-extrabold" data-testid="invest-balance">{eurAmount(totalBalance)}</p>
          <p className="mt-1 text-xs text-steel-500">due to investors and not yet paid</p>
        </div>
      </section>

      <h2 className="mt-12 font-display text-xl font-extrabold">Applications ({open.length})</h2>
      {open.length === 0 ? (
        <p className="mt-3 text-sm text-steel-500">No open applications. They arrive here, in Enquiries and in Support the moment someone applies on /invest.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {open.map((i) => (
            <article key={i.id} className="panel p-6" data-testid="investor-application">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-extrabold">{i.name}</h3>
                    <span className={`badge ${STATUS[i.status].badge}`}>{STATUS[i.status].label}</span>
                  </div>
                  <p className="mt-1 text-sm text-steel-500">
                    <a href={`mailto:${i.email}`} className="text-gold-500 underline">{i.email}</a>
                    {i.company ? ` · ${i.company}` : ''}{i.country ? ` · ${i.country}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-steel-400">
                    {formatDate(i.created_at)} · intends {usd(i.pledge_usd)} by {i.method === 'paypal' ? 'PayPal' : 'bank wire'} · would hold{' '}
                    {pct(shareOf(i.pledge_usd, offer))} of xaa.es revenue
                  </p>
                </div>
                <InvestorDecision id={i.id} status={i.status} pledge={i.pledge_usd} />
              </div>
              {i.message ? <p className="mt-4 whitespace-pre-wrap rounded-xl bg-[color:var(--surface)] p-4 text-sm">{i.message}</p> : null}
            </article>
          ))}
        </div>
      )}

      <h2 className="mt-12 font-display text-xl font-extrabold">Verified investors ({running.length})</h2>
      {running.length === 0 ? (
        <p className="mt-3 text-sm text-steel-500">None yet. Verify an application once the signed agreement and the capital are both in.</p>
      ) : (
        <div className="mt-4 space-y-6">
          {running.map((i) => {
            const st = statements.get(i.id);
            const owing = st?.months.filter((m) => m.dueEur > m.paidEur) ?? [];
            const next = owing[0];
            return (
              <article key={i.id} className="panel p-6" data-testid="investor-verified">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-extrabold">{i.name}</h3>
                      <span className={`badge ${STATUS[i.status].badge}`}>{STATUS[i.status].label}</span>
                    </div>
                    <p className="mt-1 text-sm text-steel-500">
                      <a href={`mailto:${i.email}`} className="text-gold-500 underline">{i.email}</a>
                      {i.company ? ` · ${i.company}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-steel-400">
                      {usd(i.capital_usd)} verified {i.verified_at ? formatDate(i.verified_at) : ''} by {i.verified_by ?? '—'}
                      {i.returned_at ? ` · capital returned ${formatDate(i.returned_at)}` : ''}
                    </p>
                  </div>
                  <InvestorDecision id={i.id} status={i.status} pledge={i.capital_usd} />
                </div>
                {st ? (
                  <>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                      <div><dt className="text-xs text-steel-400">Share of revenue</dt><dd className="font-bold" data-testid="investor-share">{pct(st.share)}</dd></div>
                      <div><dt className="text-xs text-steel-400">Revenue since verification</dt><dd className="font-bold">{eurAmount(st.totalRevenueEur)}</dd></div>
                      <div><dt className="text-xs text-steel-400">Due / paid</dt><dd className="font-bold">{eurAmount(st.totalDueEur)} / {eurAmount(st.totalPaidEur)}</dd></div>
                      <div><dt className="text-xs text-steel-400">Open balance</dt><dd className="font-bold" data-testid="investor-balance">{eurAmount(st.balanceEur)}</dd></div>
                    </dl>
                    {st.months.length ? (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full min-w-[480px] text-left text-sm">
                          <thead className="text-xs uppercase tracking-wider text-steel-400">
                            <tr><th className="py-2">Month</th><th>Revenue</th><th>Due</th><th>Paid</th></tr>
                          </thead>
                          <tbody>
                            {st.months.map((m) => (
                              <tr key={m.period} className="border-t border-[color:var(--line)]">
                                <td className="py-2 font-semibold">{m.period}</td>
                                <td>{eurAmount(m.revenueEur)}</td>
                                <td>{eurAmount(m.dueEur)}</td>
                                <td className={m.paidEur >= m.dueEur ? 'text-emerald-700' : ''}>{eurAmount(m.paidEur)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-steel-500">No confirmed revenue since verification yet.</p>
                    )}
                    <div className="mt-4 rounded-xl bg-[color:var(--surface)] p-4">
                      <PayoutForm
                        id={i.id}
                        period={next?.period ?? lastMonth}
                        due={next ? (next.dueEur - next.paidEur).toFixed(2) : '0.00'}
                      />
                    </div>
                  </>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {investors.some((i) => i.status === 'declined') ? (
        <details className="panel mt-10 p-5">
          <summary className="cursor-pointer font-display font-extrabold">Declined applications</summary>
          <ul className="mt-3 space-y-1 text-sm text-steel-500">
            {investors.filter((i) => i.status === 'declined').map((i) => (
              <li key={i.id}>{i.name} · {i.email} · {usd(i.pledge_usd)} · {formatDate(i.created_at)}{i.note ? ` — ${i.note}` : ''}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
