import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { portalReady } from '@/server/db';
import { formatDate } from '@/server/projects';
import { getInvest, investorsByEmail, statementFor, pct, usd, eurAmount, INVEST_DEFAULTS, type Investor, type Statement } from '@/server/invest';
import { soft, type Problems } from '@/server/soft';
import { DbNotice } from '@/components/DbNotice';

export const metadata: Metadata = { title: 'Your investment in xaa.es', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

/**
 * The investor's own view: each verified stake in xaa.es, its share of xaa.es
 * revenue and the month-by-month statement — revenue, what is due, what has
 * been paid. Revenue is shown as monthly totals only; no client, project or
 * order ever appears here. A stake is matched to the signed-in account by the
 * email it was applied with.
 */
export default async function InvestorPortalPage() {
  if (!(await portalReady())) redirect('/portal');
  const user = await currentUser();
  if (!user) redirect('/login?next=/portal/investor');

  const problems: Problems = [];
  const [offer, stakes] = await Promise.all([
    soft(problems, () => getInvest(), { ...INVEST_DEFAULTS }),
    soft(problems, () => investorsByEmail(user.email), [] as Investor[]),
  ]);
  const rows = await Promise.all(
    stakes.map(async (s) => ({ stake: s, st: await soft<Statement | null>(problems, () => statementFor(s, offer), null) })),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="eyebrow">Investor portal</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">Your investment in xaa.es</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-steel-500">
        Your share of {offer.poolPct} % of every confirmed xaa.es revenue transaction, pro rata to your capital against the{' '}
        {usd(offer.targetUsd)} raise. Revenue counts from the day your capital was verified; PayPal test payments and refunded
        or reversed payments never count. Payouts are made monthly until a full acquisition of xaa.es, when your capital is
        returned in full.
      </p>
      <DbNotice problems={problems} />

      {rows.length === 0 ? (
        <div className="panel mt-8 p-8 text-center" data-testid="investor-none">
          <p className="font-display text-xl font-extrabold">No verified investment on this account</p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-steel-500">
            A stake appears here once the studio has verified the capital it received, under the email you applied with
            ({user.email}). Not applied yet? The offering, its terms and the risk notice are on{' '}
            <Link href="/invest" className="font-semibold underline">xaa.es/invest</Link>.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {rows.map(({ stake, st }) => (
            <article key={stake.id} className="panel p-6" data-testid="investor-statement">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-xl font-extrabold">{usd(stake.capital_usd)} in xaa.es</h2>
                <p className="text-xs text-steel-500">
                  Verified {stake.verified_at ? formatDate(stake.verified_at) : '—'}
                  {stake.returned_at ? ` · capital returned ${formatDate(stake.returned_at)}` : ''}
                </p>
              </div>
              {st ? (
                <>
                  <dl className="mt-5 grid gap-4 sm:grid-cols-4">
                    <div className="rounded-xl bg-[color:var(--surface)] p-4"><dt className="text-xs text-steel-400">Your share</dt><dd className="mt-1 font-display text-xl font-extrabold" data-testid="statement-share">{pct(st.share)}</dd></div>
                    <div className="rounded-xl bg-[color:var(--surface)] p-4"><dt className="text-xs text-steel-400">xaa.es revenue</dt><dd className="mt-1 font-display text-xl font-extrabold">{eurAmount(st.totalRevenueEur)}</dd></div>
                    <div className="rounded-xl bg-[color:var(--surface)] p-4"><dt className="text-xs text-steel-400">Earned / paid</dt><dd className="mt-1 font-display text-xl font-extrabold">{eurAmount(st.totalDueEur)} / {eurAmount(st.totalPaidEur)}</dd></div>
                    <div className="rounded-xl bg-[color:var(--surface)] p-4"><dt className="text-xs text-steel-400">Still to be paid</dt><dd className="mt-1 font-display text-xl font-extrabold" data-testid="statement-balance">{eurAmount(st.balanceEur)}</dd></div>
                  </dl>
                  {st.months.length ? (
                    <div className="mt-5 overflow-x-auto">
                      <table className="w-full min-w-[460px] text-left text-sm">
                        <thead className="text-xs uppercase tracking-wider text-steel-400">
                          <tr><th className="py-2">Month</th><th>xaa.es revenue</th><th>Your share</th><th>Paid</th></tr>
                        </thead>
                        <tbody>
                          {st.months.map((m) => (
                            <tr key={m.period} className="border-t border-[color:var(--line)]">
                              <td className="py-2 font-semibold">{m.period}</td>
                              <td>{eurAmount(m.revenueEur)}</td>
                              <td>{eurAmount(m.dueEur)}</td>
                              <td>{eurAmount(m.paidEur)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="mt-5 text-sm text-steel-500">No confirmed revenue since your capital was verified yet — your first month appears here as soon as there is.</p>
                  )}
                </>
              ) : null}
            </article>
          ))}
        </div>
      )}

      <p className="mt-10 text-xs leading-relaxed text-steel-500">
        Figures are computed from the studio&rsquo;s confirmed payments and are not audited accounts. Your written agreement
        governs; questions to hello@xaa.es.
      </p>
    </div>
  );
}
