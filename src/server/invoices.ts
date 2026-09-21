import { db, nowIso } from './db';
import { invoiceIdentity } from './settings';
import { listPayments, getProject, type Payment, type Project } from './projects';
import type { User } from './auth';

/**
 * Invoices and receipts.
 *
 * The public pages promise "every milestone produces a numbered invoice in
 * EUR" and the portal never produced one. This closes that: a document per
 * payment, numbered once and then fixed, rendered from the record rather than
 * typed by anyone.
 *
 * The number is allocated on first view and written back to the payment row,
 * because an invoice number that changes is not an invoice number. It is
 * derived from the project reference and the payment's position in that
 * project, so it is stable, readable and unique without a global counter —
 * which D1 would make racy anyway.
 */

export interface InvoiceLine {
  description: string;
  detail: string;
  amount: number;
}

export interface Invoice {
  number: string;
  issuedAt: string;
  status: Payment['status'];
  payment: Payment;
  project: Project;
  client: Pick<User, 'name' | 'email' | 'company' | 'country'>;
  from: Awaited<ReturnType<typeof invoiceIdentity>>;
  lines: InvoiceLine[];
  total: number;
  /** A confirmed payment is a receipt; a pending one is a request to pay. */
  isReceipt: boolean;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Allocate this payment's number if it has none yet, then return it.
 * Idempotent: the WHERE guard means two concurrent views cannot overwrite
 * each other, and whoever loses simply reads the winner's value back.
 */
async function ensureNumber(payment: Payment, project: Project, prefix: string): Promise<string> {
  if (payment.invoice_no) return payment.invoice_no;

  const payments = await listPayments(project.id);
  const ordered = [...payments].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const index = ordered.findIndex((p) => p.id === payment.id);
  const shortRef = project.ref.replace(/^XAA-/, '');
  const number = `${prefix}-${shortRef}-${pad(index + 1)}`;

  const database = await db();
  await database
    .prepare('UPDATE payments SET invoice_no = ? WHERE id = ? AND (invoice_no IS NULL OR invoice_no = ?)')
    .bind(number, payment.id, '')
    .run();

  const fresh = await database
    .prepare('SELECT invoice_no FROM payments WHERE id = ?')
    .bind(payment.id)
    .first<{ invoice_no: string | null }>();
  return fresh?.invoice_no || number;
}

export async function getPayment(id: string): Promise<Payment | null> {
  const database = await db();
  return (await database.prepare('SELECT * FROM payments WHERE id = ?').bind(id).first<Payment>()) ?? null;
}

export async function buildInvoice(paymentId: string): Promise<Invoice | null> {
  const payment = await getPayment(paymentId);
  if (!payment) return null;
  const project = await getProject(payment.project_id);
  if (!project) return null;

  const database = await db();
  const client = await database
    .prepare('SELECT name, email, company, country FROM users WHERE id = ?')
    .bind(project.user_id)
    .first<Pick<User, 'name' | 'email' | 'company' | 'country'>>();

  const from = await invoiceIdentity();
  const number = await ensureNumber(payment, project, from.prefix);

  return {
    number,
    issuedAt: payment.created_at,
    status: payment.status,
    payment,
    project,
    client: client ?? { name: '—', email: '—', company: null, country: null },
    from,
    lines: [
      {
        description: payment.label,
        detail: `${project.package_name} · project ${project.ref}`,
        amount: payment.amount,
      },
    ],
    total: payment.amount,
    isReceipt: payment.status === 'confirmed',
  };
}

/** Every invoice belonging to a project, for the client's document list. */
export async function projectInvoices(projectId: string): Promise<{ payment: Payment; number: string | null }[]> {
  const payments = await listPayments(projectId);
  return payments.map((p) => ({ payment: p, number: p.invoice_no }));
}

export function formatInvoiceDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

export { nowIso };
