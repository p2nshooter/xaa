import { db, newId, nowIso } from './db';
import type { User } from './auth';
import { getPackage, getSetupPlan, getCarePlan, ADDONS } from '@/content/packages';
import { STAGES, type StageKey } from '@/content/process';

export { STAGES };
export type { StageKey };

/**
 * Project lifecycle, milestone payments and progress gating.
 *
 * The commercial rules of the studio live HERE, not in the UI, so a client
 * cannot reach a stage by navigating to it and an admin cannot accidentally
 * push a build past a milestone that has not been paid for.
 *
 * Money flow (all percentages are of the agreed contract amount):
 *
 *   10%  booking deposit   → we reserve the slot, client uploads the concept
 *   40%  production start  → cumulative 50%, the build begins
 *   50%  settlement        → cumulative 100%, taken when progress reaches 75–80%
 *
 * Build progress is capped at 80% until the settlement clears. That cap is the
 * whole point of the schedule: the client never pays for work they cannot see,
 * and we never hand over work that has not been paid for.
 */

export const DEPOSIT_PCT = 10;
export const PRODUCTION_PCT = 50; // cumulative after the second payment
export const FINAL_PCT = 100;
/** Progress at which the settlement invoice is raised. */
export const SETTLEMENT_TRIGGER = 75;
/** Hard ceiling on progress until the project is paid in full. */
export const UNPAID_PROGRESS_CAP = 80;

export type ProjectStatus =
  | 'awaiting_deposit'
  | 'awaiting_brief'
  | 'scheduled'
  | 'in_production'
  | 'awaiting_final'
  | 'finalising'
  | 'delivered'
  | 'cancelled';

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  awaiting_deposit: 'Awaiting 10% deposit',
  awaiting_brief: 'Awaiting your concept files',
  scheduled: 'Scheduled — 40% due to start',
  in_production: 'In production',
  awaiting_final: 'Awaiting final settlement',
  finalising: 'Finalising',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_BADGE: Record<ProjectStatus, string> = {
  awaiting_deposit: 'badge-amber',
  awaiting_brief: 'badge-amber',
  scheduled: 'badge-amber',
  in_production: 'badge-blue',
  awaiting_final: 'badge-amber',
  finalising: 'badge-blue',
  delivered: 'badge-green',
  cancelled: 'badge-grey',
};

export interface Project {
  id: string;
  ref: string;
  user_id: string;
  package_slug: string;
  package_name: string;
  title: string;
  scope_note: string | null;
  addons: string; // JSON array
  setup_plan: string | null;
  care_plan: string | null;
  quote_min: number;
  quote_max: number;
  contract_amount: number;
  contract_locked: number;
  est_days_min: number;
  est_days_max: number;
  status: ProjectStatus;
  progress: number;
  started_at: string | null;
  due_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export type Milestone = 'deposit' | 'production' | 'final' | 'setup' | 'care' | 'extra';
export type PaymentStatus = 'pending' | 'confirmed' | 'rejected';

export interface Payment {
  id: string;
  project_id: string;
  user_id: string;
  milestone: Milestone;
  label: string;
  amount: number;
  method: 'usdt' | 'paypal' | 'bank';
  network: string | null;
  reference: string | null;
  note: string | null;
  proof_file_id: string | null;
  status: PaymentStatus;
  created_at: string;
  confirmed_at: string | null;
  /** Allocated on first invoice view, then fixed. See server/invoices.ts. */
  invoice_no: string | null;
  /** Which stored payment destination the client said they sent to. */
  method_id: string | null;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  user_id: string;
  object_key: string;
  name: string;
  size: number;
  content_type: string | null;
  kind: 'concept' | 'proof' | 'deliverable' | 'business-data';
  uploaded_by: string;
  created_at: string;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  progress: number | null;
  status: string | null;
  title: string;
  body: string | null;
  author: string;
  created_at: string;
}

/* ───────────────────────── Creation ───────────────────────── */

function makeRef(): string {
  const y = new Date().getFullYear().toString().slice(-2);
  const n = Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, '0');
  const m = Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, '0');
  return `XAA-${y}${n}${m}`;
}

export interface NewProjectInput {
  packageSlug: string;
  title: string;
  scopeNote?: string;
  addons?: string[];
  setupPlan?: string;
  carePlan?: string;
}

export async function createProject(user: User, input: NewProjectInput): Promise<Project> {
  const pkg = getPackage(input.packageSlug);
  if (!pkg) throw new Error('Unknown package.');

  const addons = (input.addons ?? []).filter((slug) => ADDONS.some((a) => a.slug === slug));
  const addonMin = addons.reduce((sum, slug) => sum + (ADDONS.find((a) => a.slug === slug)?.priceMin ?? 0), 0);
  const addonMax = addons.reduce((sum, slug) => sum + (ADDONS.find((a) => a.slug === slug)?.priceMax ?? 0), 0);

  const setupPlan = input.setupPlan && getSetupPlan(input.setupPlan) ? input.setupPlan : null;
  const carePlan = input.carePlan && getCarePlan(input.carePlan) ? input.carePlan : null;

  const project: Project = {
    id: newId(),
    ref: makeRef(),
    user_id: user.id,
    package_slug: pkg.slug,
    package_name: pkg.name,
    title: input.title.trim().slice(0, 140) || pkg.name,
    scope_note: input.scopeNote?.trim().slice(0, 4000) || null,
    addons: JSON.stringify(addons),
    setup_plan: setupPlan,
    care_plan: carePlan,
    quote_min: pkg.priceMin + addonMin,
    quote_max: pkg.priceMax + addonMax,
    // Until scope is agreed the contract sits at the bottom of the range, so
    // the deposit we ask for is the smallest honest number.
    contract_amount: pkg.priceMin + addonMin,
    contract_locked: 0,
    est_days_min: pkg.daysMin,
    est_days_max: pkg.daysMax,
    status: 'awaiting_deposit',
    progress: 0,
    started_at: null,
    due_at: null,
    delivered_at: null,
    created_at: nowIso(),
    updated_at: nowIso(),
  };

  const database = await db();
  await database
    .prepare(
      `INSERT INTO projects (id, ref, user_id, package_slug, package_name, title, scope_note, addons,
        setup_plan, care_plan, quote_min, quote_max, contract_amount, contract_locked,
        est_days_min, est_days_max, status, progress, started_at, due_at, delivered_at, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .bind(
      project.id, project.ref, project.user_id, project.package_slug, project.package_name, project.title,
      project.scope_note, project.addons, project.setup_plan, project.care_plan, project.quote_min,
      project.quote_max, project.contract_amount, project.contract_locked, project.est_days_min,
      project.est_days_max, project.status, project.progress, project.started_at, project.due_at,
      project.delivered_at, project.created_at, project.updated_at
    )
    .run();

  await addUpdate(project.id, {
    title: 'Project opened',
    body: `${pkg.name} requested. The 10% booking deposit is now due.`,
    author: 'XAA',
    status: 'awaiting_deposit',
    progress: 0,
  });

  return project;
}

/* ───────────────────────── Reads ───────────────────────── */

export async function listProjects(userId: string): Promise<Project[]> {
  const database = await db();
  const { results } = await database
    .prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC')
    .bind(userId)
    .all<Project>();
  return results ?? [];
}

export async function listAllProjects(): Promise<(Project & { client_name: string; client_email: string })[]> {
  const database = await db();
  const { results } = await database
    .prepare(
      `SELECT p.*, u.name AS client_name, u.email AS client_email
       FROM projects p JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC`
    )
    .all<Project & { client_name: string; client_email: string }>();
  return results ?? [];
}

export async function getProject(id: string): Promise<Project | null> {
  const database = await db();
  return (await database.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first<Project>()) ?? null;
}

export async function listPayments(projectId: string): Promise<Payment[]> {
  const database = await db();
  const { results } = await database
    .prepare('SELECT * FROM payments WHERE project_id = ? ORDER BY created_at DESC')
    .bind(projectId)
    .all<Payment>();
  return results ?? [];
}

export async function listPendingPayments(): Promise<(Payment & { ref: string; client_email: string })[]> {
  const database = await db();
  const { results } = await database
    .prepare(
      `SELECT pay.*, p.ref AS ref, u.email AS client_email
       FROM payments pay JOIN projects p ON p.id = pay.project_id JOIN users u ON u.id = pay.user_id
       WHERE pay.status = 'pending' ORDER BY pay.created_at ASC`
    )
    .all<Payment & { ref: string; client_email: string }>();
  return results ?? [];
}

export async function listFiles(projectId: string): Promise<ProjectFile[]> {
  const database = await db();
  const { results } = await database
    .prepare('SELECT * FROM files WHERE project_id = ? ORDER BY created_at DESC')
    .bind(projectId)
    .all<ProjectFile>();
  return results ?? [];
}

export async function getFile(id: string): Promise<ProjectFile | null> {
  const database = await db();
  return (await database.prepare('SELECT * FROM files WHERE id = ?').bind(id).first<ProjectFile>()) ?? null;
}

export async function listUpdates(projectId: string): Promise<ProjectUpdate[]> {
  const database = await db();
  const { results } = await database
    .prepare('SELECT * FROM updates WHERE project_id = ? ORDER BY created_at DESC')
    .bind(projectId)
    .all<ProjectUpdate>();
  return results ?? [];
}

export async function addUpdate(
  projectId: string,
  u: { title: string; body?: string | null; author: string; status?: string | null; progress?: number | null }
): Promise<void> {
  const database = await db();
  await database
    .prepare('INSERT INTO updates (id, project_id, progress, status, title, body, author, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .bind(newId(), projectId, u.progress ?? null, u.status ?? null, u.title, u.body ?? null, u.author, nowIso())
    .run();
}

/* ───────────────────── Derived financial state ───────────────────── */

export interface Money {
  contract: number;
  confirmed: number;
  pending: number;
  outstanding: number;
  paidPct: number;
  depositDue: number;
  productionDue: number;
  finalDue: number;
}

export interface NextAction {
  milestone: Milestone;
  label: string;
  amount: number;
  reason: string;
}

/** Only build-contract milestones count towards the schedule. */
const CONTRACT_MILESTONES: Milestone[] = ['deposit', 'production', 'final', 'extra'];

export function money(project: Project, payments: Payment[]): Money {
  const contract = project.contract_amount;
  const counts = payments.filter((p) => CONTRACT_MILESTONES.includes(p.milestone));
  const confirmed = counts.filter((p) => p.status === 'confirmed').reduce((s, p) => s + p.amount, 0);
  const pending = counts.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const paidPct = contract > 0 ? Math.round((confirmed / contract) * 100) : 0;
  const target = (pct: number) => Math.max(0, Math.round((contract * pct) / 100) - confirmed);
  return {
    contract,
    confirmed,
    pending,
    outstanding: Math.max(0, contract - confirmed),
    paidPct,
    depositDue: target(DEPOSIT_PCT),
    productionDue: target(PRODUCTION_PCT),
    finalDue: target(FINAL_PCT),
  };
}

/** What the client has to do next, if anything. */
export function nextAction(project: Project, payments: Payment[]): NextAction | null {
  const m = money(project, payments);
  if (project.status === 'cancelled' || project.status === 'delivered') return null;
  if (m.paidPct < DEPOSIT_PCT) {
    return {
      milestone: 'deposit',
      label: `Booking deposit (${DEPOSIT_PCT}%)`,
      amount: m.depositDue,
      reason: 'Reserves your production slot and opens the concept upload.',
    };
  }
  if (project.status === 'awaiting_brief') return null; // upload comes first
  if (m.paidPct < PRODUCTION_PCT) {
    return {
      milestone: 'production',
      label: `Production payment (to ${PRODUCTION_PCT}%)`,
      amount: m.productionDue,
      reason: 'Starts the build. Progress runs to 80% under this payment.',
    };
  }
  if (project.progress >= SETTLEMENT_TRIGGER && m.paidPct < FINAL_PCT) {
    return {
      milestone: 'final',
      label: 'Final settlement (to 100%)',
      amount: m.finalDue,
      reason: 'Releases the last 20% of the build, deployment and handover.',
    };
  }
  return null;
}

/** Which of STAGES are done, given the record. */
export function stageState(project: Project, payments: Payment[], files: ProjectFile[]) {
  const m = money(project, payments);
  const hasConcept = files.some((f) => f.kind === 'concept');
  return {
    order: true,
    deposit: m.paidPct >= DEPOSIT_PCT,
    brief: hasConcept,
    schedule: Boolean(project.due_at),
    production: m.paidPct >= PRODUCTION_PCT,
    settlement: m.paidPct >= FINAL_PCT,
    delivery: project.progress >= 100,
  } as Record<StageKey, boolean>;
}

/* ───────────────────── Transitions ───────────────────── */

async function save(project: Project): Promise<void> {
  const database = await db();
  await database
    .prepare(
      `UPDATE projects SET status = ?, progress = ?, started_at = ?, due_at = ?, delivered_at = ?,
       contract_amount = ?, contract_locked = ?, updated_at = ? WHERE id = ?`
    )
    .bind(
      project.status, project.progress, project.started_at, project.due_at, project.delivered_at,
      project.contract_amount, project.contract_locked, nowIso(), project.id
    )
    .run();
}

function addDays(from: Date, days: number): string {
  return new Date(from.getTime() + days * 864e5).toISOString();
}

/**
 * Recompute status from the facts on record. Called after every payment
 * confirmation, upload and progress change, so status can never drift away
 * from what was actually paid and delivered.
 */
export async function reconcile(projectId: string): Promise<Project | null> {
  const project = await getProject(projectId);
  if (!project || project.status === 'cancelled') return project;
  const payments = await listPayments(projectId);
  const files = await listFiles(projectId);
  const m = money(project, payments);
  const hasConcept = files.some((f) => f.kind === 'concept');
  const before = { status: project.status, progress: project.progress, due: project.due_at };

  // Progress may never pass the cap while money is outstanding.
  if (m.paidPct < FINAL_PCT && project.progress > UNPAID_PROGRESS_CAP) project.progress = UNPAID_PROGRESS_CAP;

  if (m.paidPct < DEPOSIT_PCT) {
    project.status = 'awaiting_deposit';
  } else if (!hasConcept) {
    project.status = 'awaiting_brief';
  } else {
    // The concept is in: fix the delivery estimate once, from that moment.
    if (!project.started_at) project.started_at = nowIso();
    if (!project.due_at) project.due_at = addDays(new Date(project.started_at), project.est_days_max);

    if (m.paidPct < PRODUCTION_PCT) project.status = 'scheduled';
    else if (project.progress >= 100 && m.paidPct >= FINAL_PCT) project.status = 'delivered';
    else if (m.paidPct >= FINAL_PCT) project.status = 'finalising';
    else if (project.progress >= SETTLEMENT_TRIGGER) project.status = 'awaiting_final';
    else project.status = 'in_production';
  }

  if (project.status === 'delivered' && !project.delivered_at) project.delivered_at = nowIso();
  if (project.status !== 'delivered') project.delivered_at = null;

  if (before.status !== project.status || before.progress !== project.progress || before.due !== project.due_at) {
    await save(project);
    if (before.status !== project.status) {
      await addUpdate(project.id, {
        title: STATUS_LABEL[project.status],
        body:
          project.status === 'scheduled' && project.due_at
            ? `Concept received. Estimated completion: ${new Date(project.due_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`
            : null,
        author: 'XAA',
        status: project.status,
        progress: project.progress,
      });
    }
  }
  return project;
}

export async function recordPayment(input: {
  project: Project;
  userId: string;
  milestone: Milestone;
  label: string;
  amount: number;
  method: 'usdt' | 'paypal' | 'bank';
  network?: string | null;
  reference?: string | null;
  note?: string | null;
  proofFileId?: string | null;
  methodId?: string | null;
}): Promise<Payment> {
  const database = await db();
  const payment: Payment = {
    id: newId(),
    project_id: input.project.id,
    user_id: input.userId,
    milestone: input.milestone,
    label: input.label,
    amount: Math.max(1, Math.round(input.amount)),
    method: input.method,
    network: input.network ?? null,
    reference: input.reference?.trim().slice(0, 200) ?? null,
    note: input.note?.trim().slice(0, 1000) ?? null,
    proof_file_id: input.proofFileId ?? null,
    status: 'pending',
    created_at: nowIso(),
    confirmed_at: null,
    invoice_no: null,
    method_id: input.methodId ?? null,
  };
  await database
    .prepare(
      `INSERT INTO payments (id, project_id, user_id, milestone, label, amount, method, network,
        reference, note, proof_file_id, status, created_at, confirmed_at, method_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .bind(
      payment.id, payment.project_id, payment.user_id, payment.milestone, payment.label, payment.amount,
      payment.method, payment.network, payment.reference, payment.note, payment.proof_file_id,
      payment.status, payment.created_at, payment.confirmed_at, payment.method_id
    )
    .run();
  await addUpdate(input.project.id, {
    title: `Payment submitted — €${payment.amount.toLocaleString('en-GB')}`,
    body: `${payment.label} via ${payment.method === 'usdt' ? `USDT ${payment.network ?? ''}`.trim() : payment.method === 'bank' ? 'bank transfer' : 'PayPal'}. Awaiting confirmation.`,
    author: 'Client',
  });
  return payment;
}

export async function setPaymentStatus(paymentId: string, status: PaymentStatus, adminName: string): Promise<void> {
  const database = await db();
  const payment = await database.prepare('SELECT * FROM payments WHERE id = ?').bind(paymentId).first<Payment>();
  if (!payment) throw new Error('Payment not found.');
  await database
    .prepare('UPDATE payments SET status = ?, confirmed_at = ? WHERE id = ?')
    .bind(status, status === 'confirmed' ? nowIso() : null, paymentId)
    .run();
  await addUpdate(payment.project_id, {
    title: status === 'confirmed' ? `Payment confirmed — €${payment.amount.toLocaleString('en-GB')}` : `Payment ${status}`,
    body: payment.label,
    author: adminName,
  });
  await reconcile(payment.project_id);
}

export async function setProgress(projectId: string, progress: number, note: string, adminName: string): Promise<void> {
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found.');
  const payments = await listPayments(projectId);
  const m = money(project, payments);
  let value = Math.max(0, Math.min(100, Math.round(progress)));
  if (m.paidPct < FINAL_PCT && value > UNPAID_PROGRESS_CAP) value = UNPAID_PROGRESS_CAP;
  project.progress = value;
  await save(project);
  await addUpdate(projectId, {
    title: `Progress ${value}%`,
    body: note || null,
    author: adminName,
    progress: value,
  });
  await reconcile(projectId);
}

export async function setContract(projectId: string, amount: number, adminName: string): Promise<void> {
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found.');
  project.contract_amount = Math.max(1, Math.round(amount));
  project.contract_locked = 1;
  await save(project);
  await addUpdate(projectId, {
    title: `Contract value set — €${project.contract_amount.toLocaleString('en-GB')}`,
    body: 'Scope agreed. The milestone amounts below are calculated from this figure.',
    author: adminName,
  });
  await reconcile(projectId);
}

export async function cancelProject(projectId: string, adminName: string, reason: string): Promise<void> {
  const project = await getProject(projectId);
  if (!project) return;
  project.status = 'cancelled';
  await save(project);
  await addUpdate(projectId, { title: 'Project cancelled', body: reason || null, author: adminName, status: 'cancelled' });
}

export function addonNames(project: Project): string[] {
  try {
    const slugs = JSON.parse(project.addons) as string[];
    return slugs.map((s) => ADDONS.find((a) => a.slug === s)?.name ?? s);
  } catch {
    return [];
  }
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
