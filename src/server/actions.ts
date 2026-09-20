'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db, newId, nowIso, NotConfiguredError } from './db';
import { createUser, currentUser, endSession, findUserByEmail, normaliseEmail, startSession, verifyPassword } from './auth';
import {
  addUpdate, cancelProject, createProject, getProject, listPayments, money, recordPayment,
  setContract, setPaymentStatus, setProgress, type Milestone, type Project,
} from './projects';
import { storeFile, UploadError } from './uploads';
import { getCarePlan, getSetupPlan } from '@/content/packages';

/**
 * Every mutation in the portal. Server actions rather than REST handlers:
 * the forms keep working without JavaScript, and authorisation is checked in
 * the same function that performs the write — there is no unauthenticated
 * path to any of this.
 */

export interface ActionState {
  error?: string;
  ok?: string;
}

function fail(err: unknown): ActionState {
  if (err instanceof NotConfiguredError) return { error: err.message };
  if (err instanceof UploadError) return { error: err.message };
  if (err instanceof Error) {
    if (err.message === 'AUTH_REQUIRED') return { error: 'Please sign in again.' };
    // Never leak a raw D1 error string to the browser.
    return { error: err.message.length < 200 ? err.message : 'Something went wrong. Please try again.' };
  }
  return { error: 'Something went wrong. Please try again.' };
}

function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

/** Anything that already redirected must be rethrown, not swallowed by fail(). */
function isRedirect(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'digest' in err && String((err as { digest?: string }).digest).startsWith('NEXT_REDIRECT');
}

/* ───────────────────────── Accounts ───────────────────────── */

export async function registerAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const email = str(form, 'email');
    const password = str(form, 'password');
    const name = str(form, 'name');
    if (!name) return { error: 'Please tell us your name.' };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'That email address does not look right.' };
    if (password.length < 8) return { error: 'Use a password of at least 8 characters.' };
    if (password !== str(form, 'confirm')) return { error: 'The two passwords do not match.' };

    const user = await createUser({
      email,
      password,
      name,
      company: str(form, 'company'),
      country: str(form, 'country'),
      phone: str(form, 'phone'),
    });
    await startSession(user.id);
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
  redirect('/portal');
}

export async function loginAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const next = str(form, 'next') || '/portal';
  try {
    const email = str(form, 'email');
    const password = str(form, 'password');
    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return { error: 'Email or password is incorrect.' };
    }
    await startSession(user.id);
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
  redirect(next.startsWith('/') ? next : '/portal');
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect('/');
}

/* ───────────────────────── Ordering ───────────────────────── */

export async function createProjectAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  let target = '/portal';
  try {
    const user = await currentUser();
    if (!user) return { error: 'Please sign in first.' };
    const packageSlug = str(form, 'package');
    if (!packageSlug) return { error: 'Choose a package first.' };
    const title = str(form, 'title');
    if (!title) return { error: 'Give the project a name — your company or product is fine.' };
    if (!form.get('terms')) return { error: 'Please accept the terms of engagement.' };

    const addons = form.getAll('addons').filter((v): v is string => typeof v === 'string');
    const setupPlan = str(form, 'setup');
    const carePlan = str(form, 'care');

    const project = await createProject(user, {
      packageSlug,
      title,
      scopeNote: str(form, 'scope'),
      addons,
      setupPlan: setupPlan && getSetupPlan(setupPlan) ? setupPlan : undefined,
      carePlan: carePlan && getCarePlan(carePlan) ? carePlan : undefined,
    });
    target = `/portal/projects/${project.id}`;
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
  redirect(target);
}

/* ───────────────────────── Client actions ───────────────────────── */

async function ownedProject(projectId: string): Promise<{ project: Project; isAdmin: boolean; userId: string; name: string }> {
  const user = await currentUser();
  if (!user) throw new Error('AUTH_REQUIRED');
  const project = await getProject(projectId);
  if (!project) throw new Error('Project not found.');
  if (project.user_id !== user.id && user.role !== 'admin') throw new Error('Project not found.');
  return { project, isAdmin: user.role === 'admin', userId: user.id, name: user.name };
}

export async function uploadConceptAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const projectId = str(form, 'projectId');
    const { project, name } = await ownedProject(projectId);
    const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
    const note = str(form, 'note');
    if (!files.length && !note) return { error: 'Attach at least one file, or write a note about your concept.' };

    for (const file of files.slice(0, 10)) {
      await storeFile({ projectId: project.id, userId: project.user_id, uploadedBy: name, kind: 'concept', file });
    }
    if (note) {
      await addUpdate(project.id, { title: 'Concept note added', body: note, author: name });
    }
    if (files.length) {
      await addUpdate(project.id, {
        title: `${files.length} concept file${files.length > 1 ? 's' : ''} uploaded`,
        body: files.map((f) => f.name).join(', '),
        author: name,
      });
    }
    const { reconcile } = await import('./projects');
    await reconcile(project.id);
    revalidatePath(`/portal/projects/${project.id}`);
    return { ok: files.length ? 'Concept received. Your completion estimate is now shown below.' : 'Note saved.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function submitPaymentAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const projectId = str(form, 'projectId');
    const { project, userId, name } = await ownedProject(projectId);
    const milestone = str(form, 'milestone') as Milestone;
    if (!['deposit', 'production', 'final', 'setup', 'care', 'extra'].includes(milestone)) {
      return { error: 'Unknown payment type.' };
    }
    const amount = Math.round(Number(str(form, 'amount')));
    if (!Number.isFinite(amount) || amount < 1) return { error: 'Enter the amount you sent, in euros.' };

    const method = str(form, 'method') === 'paypal' ? 'paypal' : 'usdt';
    const reference = str(form, 'reference');
    if (!reference) {
      return { error: method === 'usdt' ? 'Paste the transaction hash so we can verify it on-chain.' : 'Paste the PayPal transaction ID.' };
    }

    // A deposit below the 10% floor cannot open the build.
    const payments = await listPayments(project.id);
    const m = money(project, payments);
    if (milestone === 'deposit' && amount < m.depositDue) {
      return { error: `The booking deposit is €${m.depositDue.toLocaleString('en-GB')} (10% of the current contract value).` };
    }

    let proofFileId: string | null = null;
    const proof = form.get('proof');
    if (proof instanceof File && proof.size > 0) {
      const stored = await storeFile({ projectId: project.id, userId: project.user_id, uploadedBy: name, kind: 'proof', file: proof });
      proofFileId = stored.id;
    }

    await recordPayment({
      project,
      userId,
      milestone,
      label: str(form, 'label') || 'Payment',
      amount,
      method,
      network: method === 'usdt' ? str(form, 'network') || 'TRC20' : null,
      reference,
      note: str(form, 'note'),
      proofFileId,
    });
    revalidatePath(`/portal/projects/${project.id}`);
    return { ok: 'Payment submitted. We verify transfers within one business day and your status updates automatically.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/* ───────────────────────── Studio (admin) actions ───────────────────────── */

async function requireAdmin(): Promise<{ id: string; name: string }> {
  const user = await currentUser();
  if (!user || user.role !== 'admin') throw new Error('Not authorised.');
  return { id: user.id, name: user.name };
}

export async function confirmPaymentAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const id = str(form, 'paymentId');
    const decision = str(form, 'decision') === 'reject' ? 'rejected' : 'confirmed';
    await setPaymentStatus(id, decision, admin.name);
    revalidatePath('/portal/admin');
    return { ok: decision === 'confirmed' ? 'Payment confirmed.' : 'Payment rejected.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function setProgressAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const projectId = str(form, 'projectId');
    const progress = Number(str(form, 'progress'));
    if (!Number.isFinite(progress)) return { error: 'Progress must be a number.' };
    await setProgress(projectId, progress, str(form, 'note'), admin.name);
    revalidatePath('/portal/admin');
    revalidatePath(`/portal/projects/${projectId}`);
    return { ok: 'Progress updated.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function setContractAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const projectId = str(form, 'projectId');
    const amount = Number(str(form, 'amount'));
    if (!Number.isFinite(amount) || amount < 1) return { error: 'Enter the agreed contract value in euros.' };
    await setContract(projectId, amount, admin.name);
    revalidatePath('/portal/admin');
    revalidatePath(`/portal/projects/${projectId}`);
    return { ok: 'Contract value updated. Milestones recalculated.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function postUpdateAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const projectId = str(form, 'projectId');
    const title = str(form, 'title');
    if (!title) return { error: 'The update needs a title.' };
    await addUpdate(projectId, { title, body: str(form, 'body') || null, author: admin.name });
    revalidatePath(`/portal/projects/${projectId}`);
    return { ok: 'Update posted.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function uploadDeliverableAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const projectId = str(form, 'projectId');
    const project = await getProject(projectId);
    if (!project) return { error: 'Project not found.' };
    const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
    if (!files.length) return { error: 'Choose a file to deliver.' };
    for (const file of files.slice(0, 10)) {
      await storeFile({ projectId, userId: project.user_id, uploadedBy: admin.name, kind: 'deliverable', file });
    }
    await addUpdate(projectId, { title: 'Deliverables uploaded', body: files.map((f) => f.name).join(', '), author: admin.name });
    revalidatePath(`/portal/projects/${projectId}`);
    return { ok: 'Deliverables uploaded.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function cancelProjectAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    await cancelProject(str(form, 'projectId'), admin.name, str(form, 'reason'));
    revalidatePath('/portal/admin');
    return { ok: 'Project cancelled.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/* ───────────────────────── Enquiries ───────────────────────── */

export async function enquiryAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const name = str(form, 'name');
    const email = str(form, 'email');
    const message = str(form, 'message');
    if (!name || !email || !message) return { error: 'Name, email and a short brief, please.' };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'That email address does not look right.' };
    if (str(form, 'website')) return { ok: 'Thank you — we will reply within one business day.' }; // honeypot

    const database = await db();
    await database
      .prepare('INSERT INTO enquiries (id, name, email, company, budget, package_slug, message, created_at) VALUES (?,?,?,?,?,?,?,?)')
      .bind(newId(), name, normaliseEmail(email), str(form, 'company') || null, str(form, 'budget') || null, str(form, 'package') || null, message.slice(0, 5000), nowIso())
      .run();
    return { ok: 'Thank you — your brief is with us. We reply within one business day.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}
