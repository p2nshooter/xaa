import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { portalReady } from '@/server/db';
import { listAllProjects, listPendingPayments, STATUS_LABEL, STATUS_BADGE, formatDate } from '@/server/projects';
import { PaymentDecision } from '@/components/forms/ProjectForms';
import { eur } from '@/content/packages';

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

  const [pending, projects] = await Promise.all([listPendingPayments(), listAllProjects()]);
  const active = projects.filter((p) => p.status !== 'delivered' && p.status !== 'cancelled');

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-500">Studio desk</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">Delivery overview</h1>
      <p className="mt-2 text-sm text-steel-500">
        {active.length} active project{active.length === 1 ? '' : 's'} · {pending.length} payment
        {pending.length === 1 ? '' : 's'} awaiting verification
      </p>

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
                    <td className="text-xs">{p.method === 'usdt' ? `USDT ${p.network ?? ''}` : 'PayPal'}</td>
                    <td className="max-w-[200px] break-all font-mono text-[11px]">
                      {p.reference}
                      {p.proof_file_id ? (
                        <a href={`/api/files/${p.proof_file_id}`} className="ml-2 text-gold-500 underline">receipt</a>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap text-xs">{formatDate(p.created_at)}</td>
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
