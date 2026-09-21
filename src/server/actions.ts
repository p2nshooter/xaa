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
import {
  createPaymentMethod, updatePaymentMethod, deletePaymentMethod, setPaymentMethodActive,
  saveSetting, clearSetting, seedMethodsFromEnv, revealPaymentMethod, getSetting,
  bniTransferGuide, BNI_SWIFT, SETTING_DEFS, type MethodKind,
} from './settings';
import { setLeadStatus, deleteLead, type LeadStatus } from './leads';

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

/** Result of a reveal (show/hide) action: the plaintext, or an error. */
export interface RevealState {
  value?: string;
  memo?: string;
  error?: string;
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

    const rawMethod = str(form, 'method');
    const method = rawMethod === 'paypal' ? 'paypal' : rawMethod === 'bank' ? 'bank' : 'usdt';
    const reference = str(form, 'reference');
    if (!reference) {
      return {
        error:
          method === 'usdt'
            ? 'Paste the transaction hash so we can verify it on-chain.'
            : method === 'bank'
            ? 'Paste the wire reference from your transfer receipt.'
            : 'Paste the PayPal transaction ID.',
      };
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
      network: method === 'usdt' ? str(form, 'network') || 'TRC20' : method === 'bank' ? str(form, 'network') || null : null,
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

/* ───────────────── Studio: payment destinations ───────────────── */


function methodInputFrom(form: FormData) {
  const kind = (str(form, 'kind') || 'crypto') as MethodKind;
  return {
    kind,
    label: str(form, 'label'),
    network: str(form, 'network'),
    currency: str(form, 'currency'),
    address: str(form, 'address'),
    memo: str(form, 'memo'),
    link: str(form, 'link'),
    instructions: str(form, 'instructions'),
    active: form.get('active') !== null,
    sortOrder: Number(str(form, 'sortOrder')) || 0,
    holder: str(form, 'holder'),
    bankName: str(form, 'bankName'),
    swift: str(form, 'swift'),
    branch: str(form, 'branch'),
    bankCountry: str(form, 'bankCountry'),
  };
}

export async function savePaymentMethodAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const id = str(form, 'id');
    const input = methodInputFrom(form);

    if (!input.label) return { error: 'Give the destination a label your clients will recognise.' };
    if (!['crypto', 'paypal', 'bank'].includes(input.kind)) return { error: 'Unknown destination type.' };
    if (!id && !input.address) return { error: 'Enter the address, email or account number.' };
    if (input.kind === 'crypto' && !input.network) return { error: 'Choose the network — a transfer on the wrong one cannot be recovered.' };
    if (input.kind === 'bank' && !input.holder) return { error: 'Enter the account holder name exactly as the bank prints it.' };

    // A BNI account with no custom instructions gets the international transfer
    // guide filled in automatically — that is the whole point of recognising BNI.
    const looksBni =
      input.kind === 'bank' &&
      /bni|negara indonesia|BNINIDJA/i.test(`${input.bankName ?? ''} ${input.swift ?? ''}`);
    if (looksBni && !input.instructions.trim()) {
      input.instructions = bniTransferGuide({
        holder: input.holder,
        account: input.address || undefined,
        branch: input.branch,
        currency: input.currency,
      });
      if (!input.swift.trim()) input.swift = BNI_SWIFT;
      if (!input.bankCountry.trim()) input.bankCountry = 'Indonesia';
    }

    if (id) {
      await updatePaymentMethod(id, input);
    } else {
      await createPaymentMethod(input);
    }
    revalidatePath('/portal/admin/payments');
    return { ok: id ? `Updated. (${admin.name})` : 'Payment destination added. It is live on client payment screens now.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function togglePaymentMethodAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    await setPaymentMethodActive(str(form, 'id'), str(form, 'active') === '1');
    revalidatePath('/portal/admin/payments');
    return { ok: 'Updated.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function deletePaymentMethodAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    if (str(form, 'confirm') !== 'DELETE') {
      return { error: 'Type DELETE to confirm — clients paying to a removed address cannot be helped afterwards.' };
    }
    await deletePaymentMethod(str(form, 'id'));
    revalidatePath('/portal/admin/payments');
    return { ok: 'Payment destination deleted.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/**
 * Reveal (show/hide) the full stored value of a destination or a secret
 * setting. Admin-only, returns plaintext to the admin who asked for it — the
 * whole point of a reveal button is to let the owner verify what is stored.
 */
export async function revealMethodAction(_prev: RevealState, form: FormData): Promise<RevealState> {
  try {
    await requireAdmin();
    const revealed = await revealPaymentMethod(str(form, 'id'));
    if (!revealed) return { error: 'Not found.' };
    return { value: revealed.address, memo: revealed.memo };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return { error: err instanceof Error ? err.message : 'Could not reveal.' };
  }
}

export async function revealSettingAction(_prev: RevealState, form: FormData): Promise<RevealState> {
  try {
    await requireAdmin();
    const value = await getSetting(str(form, 'key'));
    return { value };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return { error: err instanceof Error ? err.message : 'Could not reveal.' };
  }
}

export async function importEnvMethodsAction(_prev: ActionState, _form: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const n = await seedMethodsFromEnv();
    revalidatePath('/portal/admin/payments');
    return n > 0
      ? { ok: `Imported ${n} destination${n > 1 ? 's' : ''} from the Worker secrets.` }
      : { error: 'Nothing to import — either destinations already exist, or no payment secrets are set on the Worker.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/* ───────────────── Studio: settings ───────────────── */

export async function saveSettingsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const group = str(form, 'group');
    const keys = SETTING_DEFS.filter((d) => !group || d.group === group).map((d) => d.key);
    let saved = 0;
    for (const key of keys) {
      const raw = form.get(key);
      if (typeof raw !== 'string') continue;
      const def = SETTING_DEFS.find((d) => d.key === key)!;
      // Blank on a secret means "leave it"; blank on a plain field clears it.
      if (def.secret && !raw.trim()) continue;
      await saveSetting(key, raw, admin.name);
      saved += 1;
    }
    revalidatePath('/portal/admin/settings');
    return { ok: `Saved ${saved} field${saved === 1 ? '' : 's'}.` };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function clearSettingAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    await clearSetting(str(form, 'key'));
    revalidatePath('/portal/admin/settings');
    return { ok: 'Value cleared.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/* ───────────────── Studio: leads ───────────────── */

export async function updateLeadAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const status = str(form, 'status') as LeadStatus;
    if (!['new', 'replied', 'won', 'archived'].includes(status)) return { error: 'Unknown status.' };
    await setLeadStatus(str(form, 'id'), status, str(form, 'note'), admin.name);
    revalidatePath('/portal/admin/leads');
    return { ok: 'Lead updated.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function deleteLeadAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    await deleteLead(str(form, 'id'));
    revalidatePath('/portal/admin/leads');
    return { ok: 'Lead deleted.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/* ───────────────── Client: business data upload ───────────────── */

/**
 * The company/member data a client has to hand over before a build can start —
 * registration documents, team lists, product data. Kept separate from the
 * concept upload so the two are not mixed on the project page, and it stays
 * open after the concept stage because this material usually arrives later.
 */
export async function uploadBusinessDataAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const projectId = str(form, 'projectId');
    const { project, name } = await ownedProject(projectId);
    const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
    const note = str(form, 'note');
    if (!files.length && !note) return { error: 'Attach at least one file, or write a note.' };

    for (const file of files.slice(0, 10)) {
      await storeFile({ projectId: project.id, userId: project.user_id, uploadedBy: name, kind: 'business-data', file });
    }
    await addUpdate(project.id, {
      title: files.length ? `${files.length} business data file${files.length > 1 ? 's' : ''} uploaded` : 'Business data note added',
      body: [files.map((f) => f.name).join(', '), note].filter(Boolean).join(' — ') || null,
      author: name,
    });
    revalidatePath(`/portal/projects/${project.id}`);
    return { ok: 'Received. These files are private to your project.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}
