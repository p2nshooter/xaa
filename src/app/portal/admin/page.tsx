import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { portalReady } from '@/server/db';
import { listAllProjects, listPendingPayments, STATUS_LABEL, STATUS_BADGE, formatDate } from '@/server/projects';
import { PaymentDecision } from '@/components/forms/ProjectForms';
import { submissionLine } from '@/server/manual-pay';
import { eur } from '@/content/packages';
import { AdminNav } from '@/components/AdminNav';
import { countNewLeads } from '@/server/leads';
import { listPaymentMethods, settingAudit, type SettingAuditEntry } from '@/server/settings';
import { companyVisible } from '@/server/company';
import { CompanyVisibility } from '@/components/forms/SiteForms';
import { soft, type Problems } from '@/server/soft';
import { DbNotice } from '@/components/DbNotice';

export const metadata: Metadata = { title: 'Studio desk', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

/**
 * The studio side. Payments are verified by a human — on-chain for USDT, in
 * the PayPal account otherwise — so confirmation lives here rather than in a
 * webhook that could be spoofed. Confirming a payment is what moves a project
 * forward; nothing else does.
 */
export default async function AdminPage() {
  if (!(await portalReady())) redirect('/portal');
  const user = await currentUser();
  if (!user) redirect('/login?next=/portal/admin');
  if (user.role !== 'admin') redirect('/portal');

  const problems: Problems = [];
  const [pending, projects, newLeads, methods, company, companyLog] = await Promise.all([
    soft(problems, () => listPendingPayments(), [] as Awaited<ReturnType<typeof listPendingPayments>>),
    soft(problems, () => listAllProjects(), [] as Awaited<ReturnType<typeof listAllProjects>>),
    soft(problems, () => countNewLeads(), 0),
    soft(problems, () => listPaymentMethods(true), [] as Awaited<ReturnType<typeof listPaymentMethods>>),
    soft(problems, () => companyVisible(), false),
    soft<SettingAuditEntry[]>(problems, () => settingAudit(['company_visible'], 5), []),
  ]);
  const payable = methods.filter((m) => !m.unreadable && m.address).length;
  const active = projects.filter((p) => p.status !== 'delivered' && p.status !== 'cancelled');

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-500">Studio desk</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">Delivery overview</h1>
      <p className="mt-2 text-sm text-steel-500">
        {active.length} active project{active.length === 1 ? '' : 's'} · {pending.length} payment
        {pending.length === 1 ? '' : 's'} awaiting verification · {newLeads} unread enquir{newLeads === 1 ? 'y' : 'ies'}
      </p>

      <div className="mt-8">
        <AdminNav current="/portal/admin" newLeads={newLeads} />
      </div>
      <DbNotice problems={problems} />

      {payable === 0 ? (
        <div className="panel mb-8 border-l-4 border-l-amber-400 bg-amber-50/50 p-5">
          <p className="font-bold text-ink-900">No usable payment destination — clients cannot pay</p>
          <p className="mt-1.5 text-sm text-steel-500">
            Every milestone will stall until at least one destination is active and readable.
          </p>
          <Link href="/portal/admin/payments" className="btn btn-primary btn-sm mt-3">Set one up</Link>
        </div>
      ) : null}

      {/* Site menu: the Company page is hidden until the owner shows it (request 60). */}
      <section className="panel mb-8 p-5" data-testid="company-visibility-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-steel-400">Company menu</p>
            <p className="mt-1 text-sm text-steel-500">Hidden by default (owner, 27 Oct 2026). While hidden there is no Company link in the menu or footer, /company is a 404 and it is left out of the sitemap and llms.txt. The legal entity stays on invoices and the legal pages.</p>
          </div>
          <CompanyVisibility visible={company} />
        </div>
        {companyLog.length ? (
          <ul className="mt-4 space-y-1 text-xs text-steel-500" data-testid="company-visibility-log">
            {companyLog.map((e, i) => <li key={i}>{e.at.slice(0, 16).replace('T', ' ')} UTC · {e.by || 'admin'} · {e.to === 'yes' ? 'shown' : 'hidden'}</li>)}
          </ul>
        ) : null}
      </section>

      {/* Payments to verify */}
      <section className="panel mt-8 p-6">
        <h2 className="font-display text-xl font-extrabold">Payments to verify</h2>
        <p className="mt-1 text-xs text-steel-500">
          Check the hash on-chain or the transaction in PayPal before confirming. Confirming updates the client&apos;s
          status, milestone ledger and progress cap automatically.
        </p>
        {pending.length === 0 ? (
          <p className="mt-4 text-sm text-steel-500">Nothing waiting.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="data-table min-w-[820px]">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Milestone</th>
                  <th className="text-right">Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Submitted</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p.id}>
                    <td className="font-mono text-xs">
                      <Link href={`/portal/projects/${p.project_id}`} className="text-gold-500 underline">{p.ref}</Link>
                    </td>
                    <td className="text-xs">{p.client_email}</td>
                    <td className="text-xs">{p.label}</td>
                    <td className="whitespace-nowrap text-right font-bold">{eur(p.amount)}</td>
                    <td className="text-xs">
                      {p.pay ? p.pay.label : p.method === 'usdt' ? `USDT ${p.network ?? ''}` : p.method === 'bank' ? 'Bank' : 'PayPal'}
                      {p.pay ? <span className={`mt-0.5 block text-[11px] ${p.pay.ok === false ? 'font-semibold text-amber-700' : 'text-steel-500'}`}>{submissionLine(p.pay)}</span> : null}
                    </td>
                    <td className="max-w-[200px] break-all font-mono text-[11px]">
                      {p.reference}
                      {p.proof_file_id ? (
                        <a href={`/api/files/${p.proof_file_id}`} className="ml-2 text-gold-500 underline">receipt</a>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap text-xs">
                      {formatDate(p.created_at)}
                      <br />
                      <Link href={`/portal/invoices/${p.id}`} className="text-gold-500 underline">invoice</Link>
                    </td>
                    <td><PaymentDecision paymentId={p.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* All projects */}
      <section className="panel mt-8 p-6">
        <h2 className="font-display text-xl font-extrabold">All projects</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="data-table min-w-[900px]">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Project</th>
                <th>Client</th>
                <th>Package</th>
                <th>Status</th>
                <th className="text-right">Contract</th>
                <th className="text-right">Progress</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="font-mono text-xs">
                    <Link href={`/portal/projects/${p.id}`} className="text-gold-500 underline">{p.ref}</Link>
                  </td>
                  <td className="max-w-[200px] truncate font-semibold">{p.title}</td>
                  <td className="text-xs">{p.client_name}<br /><span className="text-steel-500">{p.client_email}</span></td>
                  <td className="text-xs">{p.package_name}</td>
                  <td><span className={`badge ${STATUS_BADGE[p.status]}`}>{STATUS_LABEL[p.status]}</span></td>
                  <td className="whitespace-nowrap text-right">{eur(p.contract_amount)}</td>
                  <td className="text-right">
                    <div className="flex items-center gap-2">
                      <div className="progress-track w-16"><div className="progress-fill" style={{ width: `${p.progress}%` }} /></div>
                      <span className="w-8 text-right text-xs font-bold">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-xs">{formatDate(p.due_at)}</td>
                </tr>
              ))}
              {projects.length === 0 ? (
                <tr><td colSpan={8} className="text-sm text-steel-500">No projects yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
