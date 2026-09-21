import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { portalReady } from '@/server/db';
import { buildInvoice, formatInvoiceDate } from '@/server/invoices';
import { eur, usd } from '@/content/packages';
import { SITE } from '@/lib/site';
import { PrintButton } from '@/components/forms/PrintButton';

export const metadata: Metadata = { title: 'Invoice', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

/**
 * A numbered invoice — or a receipt once the payment is confirmed — rendered
 * from the payment record. Print styles strip the site chrome so Ctrl+P or
 * "Save as PDF" produces a clean document without a PDF library on the server.
 */
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await portalReady())) redirect('/portal');

  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/portal/invoices/${id}`)}`);

  const invoice = await buildInvoice(id);
  if (!invoice) notFound();
  if (invoice.project.user_id !== user.id && user.role !== 'admin') notFound();

  const { payment, project, client, from } = invoice;
  const statusBadge =
    payment.status === 'confirmed' ? 'badge-green' : payment.status === 'rejected' ? 'badge-red' : 'badge-amber';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/portal/projects/${project.id}`} className="text-sm text-steel-500 hover:text-gold-500">
          ← Back to project
        </Link>
        <PrintButton />
      </div>

      <article className="panel p-8 print:border-0 print:shadow-none sm:p-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-[color:var(--line)] pb-6">
          <div>
            <p className="font-display text-2xl font-extrabold tracking-tight">
              XAA<span className="accent-text">.es</span>
            </p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-steel-400">
              {SITE.expansion}
            </p>
            <div className="mt-3 text-xs leading-relaxed text-steel-500">
              <p className="font-semibold text-ink-900">{from.name}</p>
              {from.address ? <p className="whitespace-pre-line">{from.address}</p> : null}
              {from.taxId ? <p>VAT / tax: {from.taxId}</p> : null}
              {from.regNo ? <p>Reg. no: {from.regNo}</p> : null}
              <p>{from.billingEmail}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-display text-xl font-extrabold">{invoice.isReceipt ? 'Receipt' : 'Invoice'}</p>
            <p className="mt-1 font-mono text-sm font-bold">{invoice.number}</p>
            <p className="mt-2 text-xs text-steel-500">Issued {formatInvoiceDate(invoice.issuedAt)}</p>
            {payment.confirmed_at ? (
              <p className="text-xs text-steel-500">Paid {formatInvoiceDate(payment.confirmed_at)}</p>
            ) : null}
            <span className={`badge ${statusBadge} mt-3`}>{payment.status}</span>
          </div>
        </div>

        {/* Parties */}
        <div className="grid gap-6 border-b border-[color:var(--line)] py-6 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-steel-400">Billed to</p>
            <p className="mt-1.5 font-semibold">{client.company || client.name}</p>
            {client.company ? <p className="text-sm text-steel-500">{client.name}</p> : null}
            <p className="text-sm text-steel-500">{client.email}</p>
            {client.country ? <p className="text-sm text-steel-500">{client.country}</p> : null}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-steel-400">Project</p>
            <p className="mt-1.5 font-semibold">{project.title}</p>
            <p className="text-sm text-steel-500">{project.package_name}</p>
            <p className="font-mono text-xs text-steel-400">{project.ref}</p>
          </div>
        </div>

        {/* Lines */}
        <table className="data-table mt-6">
          <thead>
            <tr>
              <th>Description</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((l) => (
              <tr key={l.description}>
                <td>
                  <p className="font-semibold text-ink-900">{l.description}</p>
                  <p className="text-xs text-steel-500">{l.detail}</p>
                </td>
                <td className="whitespace-nowrap text-right font-semibold">{eur(l.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs">
            <div className="flex justify-between border-t-2 border-ink-900 pt-3">
              <span className="font-display text-base font-extrabold">Total</span>
              <span className="font-display text-base font-extrabold">{eur(invoice.total)}</span>
            </div>
            <p className="mt-1 text-right text-xs text-steel-400">≈ {usd(invoice.total)} in USDT</p>
          </div>
        </div>

        {/* Payment detail */}
        <div className="mt-8 rounded-xl bg-[color:var(--surface)] p-5 text-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-steel-400">Payment</p>
          <dl className="mt-2 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
            <div className="flex justify-between gap-4">
              <dt className="text-steel-500">Method</dt>
              <dd className="font-medium">
                {payment.method === 'usdt' ? `USDT ${payment.network ?? ''}`.trim() : payment.method === 'bank' ? 'Bank transfer' : 'PayPal'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-steel-500">Milestone</dt>
              <dd className="font-medium">{payment.label}</dd>
            </div>
            {payment.reference ? (
              <div className="flex justify-between gap-4 sm:col-span-2">
                <dt className="shrink-0 text-steel-500">Transaction</dt>
                <dd className="break-all text-right font-mono text-xs">{payment.reference}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="mt-6 space-y-2 border-t border-[color:var(--line)] pt-5 text-xs leading-relaxed text-steel-500">
          <p>{from.vatNote}</p>
          {from.footer ? <p>{from.footer}</p> : null}
          <p>
            {invoice.isReceipt
              ? 'This document confirms a payment received and verified against the transaction reference above.'
              : 'This document records a milestone falling due. It is marked paid once the transfer is verified.'}
          </p>
        </div>
      </article>

      <p className="mt-4 text-center text-xs text-steel-400 print:hidden">
        Use your browser&apos;s print dialog to save this as a PDF — the page is styled for it.
      </p>
    </div>
  );
}

