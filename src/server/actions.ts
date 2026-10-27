'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { NotConfiguredError, appEnv } from './db';
import { MaintenanceError } from './migrate';
import { createUser, currentUser, endSession, findUserByEmail, normaliseEmail, startSession, verifyPassword, isAdminEmail, verifyAdminPassword, adminSessionUser } from './auth';
import {
  addUpdate, cancelProject, createProject, getProject, listPayments, money, nextAction, recordPayment,
  setContract, setPaymentStatus, setProgress, type Milestone, type Project,
} from './projects';
import { storeFile, UploadError } from './uploads';
import { getCarePlan, getSetupPlan } from '@/content/packages';
import {
  createPaymentMethod, updatePaymentMethod, deletePaymentMethod, setPaymentMethodActive,
  saveSetting, clearSetting, seedMethodsFromEnv, importCompanyMethods, revealPaymentMethod, getSetting,
  bniTransferGuide, BNI_SWIFT, SETTING_DEFS, type MethodKind,
} from './settings';
import { addLead, setLeadStatus, deleteLead, type LeadStatus } from './leads';
import {
  saveAiKey, clearAiKey, revealAiKey, setSchedule, runBackup, runOperation,
  restoreFromBackup, resetDatabase, CADENCES, PROVIDERS, type Cadence, type Provider,
} from './recovery';
import { createOrder, getOrder, submitOrderPayment, confirmOrder, cancelOrder, saveBundle } from './store';
import { activePayPal, createPayPalOrder, ensureWebhook, insertCheckout, isPayPalEnv, newCheckoutId, paypalConfig, testPayPal, type PayPalEnv } from './paypal';
import { applyInvestor, getInvest, getInvestor, recordPayout, setInvestorStatus, verifyInvestor, usd } from './invest';
import { getTemplate } from '@/content/templates';
import { adminReply, getThread, markAdminOnline, setThreadStatus, createThread } from './support';
import { getSale, usdWhole } from './sale';
import { backupNow, recopyD1, restoreFrom } from './storage';

/**
 * Every mutation in the portal. Server actions rather than REST handlers:
 * the forms keep working without JavaScript, and authorisation is checked in
 * the same function that performs the write — there is no unauthenticated
 * path to any of this.
 */

export interface ActionState {
  error?: string;
  ok?: string;
  /** What the visitor typed, echoed back with an error so the form can keep it (React resets forms after an action). */
  values?: Record<string, string>;
}

/** Result of a reveal (show/hide) action: the plaintext, or an error. */
export interface RevealState {
  value?: string;
  memo?: string;
  error?: string;
}

function fail(err: unknown): ActionState {
  if (err instanceof NotConfiguredError || err instanceof MaintenanceError) return { error: err.message };
  if (err instanceof UploadError) return { error: err.message };
  if (err instanceof Error) {
    if (err.message === 'AUTH_REQUIRED') return { error: 'Please sign in again.' };
    // Never leak a raw storage error string to the browser.
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
    await startSession(user);
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
    const env = await appEnv();

    // The studio owner signs in WITHOUT reading any storage. The admin password
    // is verified against the ADMIN_PASSWORD secret or the committed hash, and
    // the session is a signed cookie (see startSession), so the owner gets in
    // whatever state the storage is in. The user record is built from source.
    if (isAdminEmail(email, env)) {
      if (!(await verifyAdminPassword(password, env))) {
        return { error: 'Email or password is incorrect.' };
      }
      await startSession(adminSessionUser(email));
      redirect(next.startsWith('/') ? next : '/portal');
    }

    // Client accounts are stored in R2, so their sign-in reads the account once;
    // the signed session cookie then carries them without further reads.
    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return { error: 'Email or password is incorrect.' };
    }
    const { password_hash: _omit, ...safe } = user;
    await startSession(safe);
  } catch (err) {
    if (isRedirect(err)) throw err;
    // Sign-in is the one action where the *real* reason matters more than a
    // tidy message: the studio owner cannot open /api/health if they cannot
    // sign in, and a bare "Something went wrong" told us nothing across many
    // deploys. Surface a short, secret-free diagnostic instead — the name of
    // the error and a trimmed message with any long hex token (hashes, keys,
    // ids) redacted — so a failure is legible from the screen itself.
    return { error: loginDiagnostic(err) };
  }
  redirect(next.startsWith('/') ? next : '/portal');
}

/** A short, secret-free description of a sign-in failure, safe to show. */
function loginDiagnostic(err: unknown): string {
  if (err instanceof NotConfiguredError) return err.message;
  const name = err instanceof Error ? err.name : 'Error';
  let msg = err instanceof Error ? err.message : String(err);
  // Redact anything that looks like a secret: 24+ char hex runs (hashes/keys),
  // and our pbkdf2$… hash strings.
  msg = msg.replace(/pbkdf2\$[^\s]+/gi, '[redacted]').replace(/[0-9a-f]{24,}/gi, '[redacted]');
  msg = msg.replace(/\s+/g, ' ').trim();
  if (msg.length > 160) msg = msg.slice(0, 160) + '…';
  return `Sign-in failed (${name}): ${msg || 'no detail'}. Please try again.`;
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

/* ─────────────────── SaaS template store ─────────────────── */

export async function buyTemplateAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const slug = str(form, 'slug');
  try {
    const user = await currentUser();
    if (!user) redirect(`/login?next=${encodeURIComponent(`/templates/${slug}`)}`);
    const tpl = getTemplate(slug);
    if (!tpl) return { error: 'Unknown template.' };
    const order = await createOrder(user, slug);
    redirect(`/portal/orders/${order.id}`);
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
  return {};
}

async function ownedOrder(orderId: string) {
  const user = await currentUser();
  if (!user) throw new Error('AUTH_REQUIRED');
  const order = await getOrder(orderId);
  if (!order) throw new Error('Order not found.');
  if (order.user_id !== user.id && user.role !== 'admin') throw new Error('Order not found.');
  return { order, user };
}

export async function submitOrderPaymentAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const { order } = await ownedOrder(str(form, 'orderId'));
    const rawMethod = str(form, 'method');
    const method = rawMethod === 'paypal' ? 'paypal' : rawMethod === 'bank' ? 'bank' : 'usdt';
    const reference = str(form, 'reference');
    if (!reference) return { error: 'Paste the transaction reference from your payment.' };
    await submitOrderPayment(order.id, { method, reference, note: str(form, 'note') });
    revalidatePath(`/portal/orders/${order.id}`);
    return { ok: 'Payment submitted. We will confirm it and unlock your download.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/* ─────────────────── PayPal Checkout (automatic) ─────────────────── */

/**
 * Where PayPal sends the buyer back. The canonical origin in production; the
 * request's own origin only for a local build, so a test run never bounces a
 * buyer to the live site (and a forged Host header can never pick the URL).
 */
async function returnOrigin(): Promise<string> {
  const h = await headers();
  // A server action is a POST, so the browser states its own origin.
  const origin = (h.get('origin') || '').trim();
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
  const host = (h.get('x-forwarded-host') || h.get('host') || '').split(',')[0].trim();
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return `http://${host}`;
  const env = await appEnv();
  return (env.APP_URL || 'https://xaa.es').replace(/\/+$/, '');
}

/** Start PayPal for the milestone that is due now. The amount is ours, never the form's. */
export async function startPaypalMilestoneAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  let approveUrl = '';
  try {
    const { project, userId } = await ownedProject(str(form, 'projectId'));
    const cfg = await activePayPal();
    if (!cfg) return { error: 'PayPal is not available right now. Please choose another way to pay.' };
    const due = nextAction(project, await listPayments(project.id));
    if (!due || due.amount < 1) return { error: 'Nothing is due on this project right now.' };
    if (str(form, 'milestone') && str(form, 'milestone') !== due.milestone) {
      return { error: 'This payment step has changed — please reload the page.' };
    }

    const checkoutId = newCheckoutId();
    const origin = await returnOrigin();
    const order = await createPayPalOrder(cfg, {
      checkoutId,
      amountEur: due.amount,
      description: `${project.ref} · ${due.label}`,
      returnUrl: `${origin}/api/paypal/return?c=${checkoutId}`,
      cancelUrl: `${origin}/api/paypal/cancel?c=${checkoutId}`,
    });
    await insertCheckout({
      id: checkoutId, paypal_order_id: order.id, env: cfg.env, kind: 'milestone', user_id: userId,
      project_id: project.id, milestone: due.milestone, label: due.label, template_order_id: null, amount: due.amount,
    });
    approveUrl = order.approveUrl;
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
  redirect(approveUrl);
}

/** Start PayPal for a template order, at the order's own price. */
export async function startPaypalOrderAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  let approveUrl = '';
  try {
    const { order, user } = await ownedOrder(str(form, 'orderId'));
    if (order.status === 'paid') return { ok: 'This order is already paid.' };
    if (order.status === 'cancelled') return { error: 'This order was cancelled.' };
    const cfg = await activePayPal();
    if (!cfg) return { error: 'PayPal is not available right now. Please choose another way to pay.' };

    const checkoutId = newCheckoutId();
    const origin = await returnOrigin();
    const pp = await createPayPalOrder(cfg, {
      checkoutId,
      amountEur: order.price,
      description: `${order.ref} · ${order.name}`,
      returnUrl: `${origin}/api/paypal/return?c=${checkoutId}`,
      cancelUrl: `${origin}/api/paypal/cancel?c=${checkoutId}`,
    });
    await insertCheckout({
      id: checkoutId, paypal_order_id: pp.id, env: cfg.env, kind: 'template', user_id: order.user_id || user.id,
      project_id: null, milestone: null, label: order.name, template_order_id: order.id, amount: order.price,
    });
    approveUrl = pp.approveUrl;
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
  redirect(approveUrl);
}

/**
 * Sign in to PayPal with one environment's keys and, when PayPal accepts
 * them, make sure that app has this site's webhook (created on the spot —
 * nothing to set up by hand in the PayPal dashboard).
 */
async function setupPayPal(env: PayPalEnv): Promise<{ ok: boolean; message: string }> {
  const signIn = await testPayPal(env);
  if (!signIn.ok) return signIn;
  const hook = await ensureWebhook(env, `${await returnOrigin()}/api/paypal/webhook`);
  return { ok: hook.ok, message: `${signIn.message} ${hook.message}` };
}

/** Admin: test the stored Live or Sandbox credentials (and set up the webhook). */
export async function testPaypalAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const env = str(form, 'env');
    if (!isPayPalEnv(env)) return { error: 'Choose Live or Sandbox.' };
    const r = await setupPayPal(env);
    revalidatePath('/portal/admin/settings');
    return r.ok ? { ok: r.message } : { error: r.message };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/* ─────────────────── AI backup & recovery (project owner) ─────────────────── */

export async function saveAiKeyAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const projectId = str(form, 'projectId');
    const { project, name } = await ownedProject(projectId);
    const rawProvider = str(form, 'provider');
    const provider: Provider = (PROVIDERS as readonly string[]).includes(rawProvider) ? (rawProvider as Provider) : 'openai';
    const apiKey = str(form, 'apiKey');
    if (!apiKey) return { error: 'Paste your AI API key.' };
    if (apiKey.length < 12) return { error: 'That does not look like a full API key.' };
    await saveAiKey(project.id, provider, apiKey, name);
    revalidatePath(`/portal/projects/${project.id}`);
    return { ok: 'AI key saved and encrypted. Backup & recovery is armed.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function clearAiKeyAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const projectId = str(form, 'projectId');
    const { project, name } = await ownedProject(projectId);
    await clearAiKey(project.id, name);
    revalidatePath(`/portal/projects/${project.id}`);
    return { ok: 'AI key removed.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function setScheduleAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const projectId = str(form, 'projectId');
    const { project, name } = await ownedProject(projectId);
    const schedule = form.getAll('cadence').filter((c): c is string => typeof c === 'string') as Cadence[];
    await setSchedule(project.id, schedule.filter((c) => CADENCES.includes(c)), name);
    revalidatePath(`/portal/projects/${project.id}`);
    return { ok: 'Backup schedule updated.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function runBackupAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const projectId = str(form, 'projectId');
    const { project, name } = await ownedProject(projectId);
    const rawCadence = str(form, 'cadence');
    const cadence: Cadence = (['daily', 'weekly', 'monthly', 'now'] as string[]).includes(rawCadence) ? (rawCadence as Cadence) : 'now';
    await runBackup(project.id, cadence, name);
    revalidatePath(`/portal/projects/${project.id}`);
    return { ok: `Backup taken (${cadence === 'now' ? 'on demand' : cadence}) and recorded.` };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function runRecoveryOpAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const projectId = str(form, 'projectId');
    const { project, name } = await ownedProject(projectId);
    const rawKind = str(form, 'kind');
    if (!['restore', 'reset', 'web-fix'].includes(rawKind)) return { error: 'Unknown operation.' };

    // Backup, restore and reset are the NON-AI path: they act directly on the
    // stored snapshots and the database and need no AI key. Only web-fix uses
    // the AI. Restore requires a chosen snapshot; without one it is recorded as
    // an intent so the studio can run it against a specific point.
    if (rawKind === 'restore') {
      const backupId = str(form, 'backupId');
      if (backupId) {
        await restoreFromBackup(project.id, backupId, name);
      } else {
        await runOperation(project.id, 'restore', name, str(form, 'note'));
      }
      revalidatePath(`/portal/projects/${project.id}`);
      return { ok: backupId ? 'Recovery done — restored from the chosen snapshot.' : 'Recovery request recorded.' };
    }
    if (rawKind === 'reset') {
      await resetDatabase(project.id, name);
      revalidatePath(`/portal/projects/${project.id}`);
      return { ok: 'Database reset — emptied. A safety snapshot was taken first.' };
    }
    // web-fix (AI)
    await runOperation(project.id, 'web-fix', name, str(form, 'note'));
    revalidatePath(`/portal/projects/${project.id}`);
    return { ok: 'AI web-fix requested and recorded on the project log.' };
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

export async function revealAiKeyAction(_prev: RevealState, form: FormData): Promise<RevealState> {
  try {
    await requireAdmin();
    const value = await revealAiKey(str(form, 'projectId'));
    return value ? { value } : { error: 'No key stored.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return { error: err instanceof Error ? err.message : 'Could not reveal.' };
  }
}

export async function confirmOrderAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const orderId = str(form, 'orderId');
    if (str(form, 'decision') === 'cancel') {
      await cancelOrder(orderId);
    } else {
      await confirmOrder(orderId);
    }
    revalidatePath(`/portal/orders/${orderId}`);
    revalidatePath('/portal/admin');
    return { ok: 'Order updated.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function uploadBundleAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const slug = str(form, 'slug');
    if (!getTemplate(slug)) return { error: 'Unknown template.' };
    const file = form.get('bundle');
    if (!(file instanceof File) || file.size === 0) return { error: 'Choose a .zip bundle to upload.' };
    if (file.size > 500 * 1024 * 1024) return { error: 'Bundle is larger than 500 MB.' };
    await saveBundle(slug, file, admin.name);
    revalidatePath(`/templates/${slug}`);
    revalidatePath('/portal/admin');
    return { ok: `Bundle uploaded for ${slug}.` };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
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

    await addLead({ name, email: normaliseEmail(email), company: str(form, 'company'), budget: str(form, 'budget'), packageSlug: str(form, 'package'), message: message.slice(0, 5000) });
    // Every brief also lands in the Support inbox as a conversation, so the
    // studio answers contact-form messages and chats from one place.
    try {
      await createThread({
        name, email: normaliseEmail(email), topic: 'quote', lang: 'en', source: 'contact',
        firstMessage: [message, str(form, 'company') && `Company: ${str(form, 'company')}`, str(form, 'budget') && `Budget: ${str(form, 'budget')}`, str(form, 'package') && `Package: ${str(form, 'package')}`].filter(Boolean).join('\n'),
      });
    } catch (e) {
      console.error('support thread for enquiry failed (enquiry still saved):', e);
    }
    return { ok: 'Thank you — your brief is with us. We reply within one business day.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/**
 * An offer for xaa.es, or a request to buy it at the asking price (/acquire).
 *
 * Saved in the enquiries inbox (Admin → Leads, package "site-acquisition") and
 * opened as a Support conversation (topic "negotiate"), so the owner sees it
 * where every other lead arrives. No payment is taken here: a sale of this size
 * closes by agreement, proof of funds and a SWIFT wire or escrow.
 */
export async function acquireAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const kind = str(form, 'kind') === 'buy' ? 'buy' : 'offer';
    const name = str(form, 'name');
    const email = str(form, 'email');
    const company = str(form, 'company');
    const country = str(form, 'country');
    const funds = str(form, 'funds');
    const message = str(form, 'message');
    const lang = ['en', 'es', 'id'].includes(str(form, 'lang')) ? str(form, 'lang') : 'en';
    if (str(form, 'website')) return { ok: 'Thank you.' }; // honeypot
    if (!name || !email) return { error: 'Your name and email, please.' };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: 'That email address does not look right.' };

    const sale = await getSale();
    if (sale.status === 'sold') return { error: 'xaa.es has been sold. Thank you for your interest.' };
    if (sale.status === 'paused') return { error: 'The sale is paused at the moment. Please write to hello@xaa.es.' };

    const amount = kind === 'buy' ? sale.priceUsd : Number(str(form, 'amount').replace(/[^\d]/g, ''));
    if (!Number.isFinite(amount) || amount < 100_000) return { error: 'Please enter your offer in US dollars (at least $100,000).' };
    if (amount > sale.priceUsd * 2) return { error: 'Please check the amount of your offer.' };

    const label = kind === 'buy' ? `Purchase at asking price ${usdWhole(amount)}` : `Offer ${usdWhole(amount)} (asking ${usdWhole(sale.priceUsd)})`;
    const brief = [
      label,
      company && `Company: ${company}`,
      country && `Country: ${country}`,
      funds && `Proof of funds / financing: ${funds}`,
      message && `Message: ${message}`,
    ].filter(Boolean).join('\n');

    await addLead({ name: name.slice(0, 120), email: normaliseEmail(email), company: company.slice(0, 160), budget: usdWhole(amount), packageSlug: 'site-acquisition', message: brief.slice(0, 5000) });
    try {
      await createThread({ name, email: normaliseEmail(email), topic: 'negotiate', lang, source: 'contact', firstMessage: `[xaa.es acquisition] ${brief}` });
    } catch (e) {
      console.error('support thread for acquisition failed (enquiry still saved):', e);
    }
    const ok: Record<string, string> = {
      en: `Thank you — your ${kind === 'buy' ? 'purchase request' : 'offer'} of ${usdWhole(amount)} is with the owner. You will receive a reply and an NDA within one business day. To speed things up, send proof of funds on WhatsApp ${sale.whatsapp}.`,
      es: `Gracias — tu ${kind === 'buy' ? 'solicitud de compra' : 'oferta'} de ${usdWhole(amount)} ya la tiene el propietario. Recibirás respuesta y un NDA en un día hábil. Para agilizar, envía la prueba de fondos por WhatsApp al ${sale.whatsapp}.`,
      id: `Terima kasih — ${kind === 'buy' ? 'permintaan pembelian' : 'penawaran'} Anda sebesar ${usdWhole(amount)} sudah diterima pemilik. Balasan dan NDA dikirim dalam satu hari kerja. Agar lebih cepat, kirim bukti dana lewat WhatsApp ${sale.whatsapp}.`,
    };
    return { ok: ok[lang] };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/* ───────────────── Investors in xaa.es (/invest) ───────────────── */

/**
 * Public: an application to invest in xaa.es — xaa.es alone (owner, 19 Oct
 * 2026: "masing2 web nyari investornya, bukan gabungan"). It lands in Studio
 * desk → Investors, in Leads and in Support, so it is never missed. Nothing is
 * paid here: capital moves only after the agreement is signed, and the studio
 * verifies it when it arrives.
 */
export async function investApplyAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const lang = ['en', 'es', 'id'].includes(str(form, 'lang')) ? str(form, 'lang') : 'en';
    const name = str(form, 'name');
    const email = str(form, 'email');
    const company = str(form, 'company');
    const country = str(form, 'country');
    const method = ['wire', 'paypal'].includes(str(form, 'method')) ? str(form, 'method') : 'wire';
    const message = str(form, 'message');
    const T = (en: string, es: string, id: string) => (lang === 'es' ? es : lang === 'id' ? id : en);
    const values = { name, email, company, country, method, message, amount: str(form, 'amount') };
    const bad = (error: string): ActionState => ({ error, values });
    if (str(form, 'website')) return { ok: 'Thank you.' }; // honeypot
    if (!name || !email) return bad(T('Your name and email, please.', 'Tu nombre y tu email, por favor.', 'Nama dan email Anda, mohon.'));
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return bad(T('That email address does not look right.', 'Ese email no parece correcto.', 'Alamat email tampaknya tidak benar.'));
    if (form.get('ack') === null) {
      return bad(T('Please confirm you have read the risk notice.', 'Confirma que has leído el aviso de riesgos.', 'Mohon konfirmasi bahwa Anda telah membaca pemberitahuan risiko.'));
    }

    const offer = await getInvest();
    if (!offer.visible) return bad(T('The investor offering is not open.', 'La oferta para inversores no está abierta.', 'Penawaran investor tidak dibuka.'));
    if (offer.status === 'closed') return bad(T('The xaa.es raise is complete. Thank you for your interest.', 'La ronda de xaa.es está completa. Gracias por tu interés.', 'Penghimpunan modal xaa.es sudah selesai. Terima kasih atas minat Anda.'));
    if (offer.status === 'paused') return bad(T('Applications are paused at the moment. Please write to hello@xaa.es.', 'Las solicitudes están en pausa. Escribe a hello@xaa.es.', 'Pengajuan sedang dijeda. Silakan tulis ke hello@xaa.es.'));

    const pledge = Number(str(form, 'amount').replace(/[^\d]/g, ''));
    if (!Number.isFinite(pledge) || pledge < offer.minUsd) {
      return bad(T(`The minimum ticket is ${usd(offer.minUsd)}.`, `La inversión mínima es de ${usd(offer.minUsd)}.`, `Investasi minimum ${usd(offer.minUsd)}.`));
    }
    if (pledge > offer.targetUsd) {
      return bad(T(`The whole raise is ${usd(offer.targetUsd)}; please enter an amount up to that.`, `La ronda completa es de ${usd(offer.targetUsd)}; indica un importe hasta esa cifra.`, `Total penghimpunan ${usd(offer.targetUsd)}; masukkan jumlah sampai angka itu.`));
    }

    const cleanEmail = normaliseEmail(email);
    await applyInvestor({ name, email: cleanEmail, company, country, pledgeUsd: pledge, method, lang, message });
    const brief = [
      `Investment application ${usd(pledge)} (${method === 'paypal' ? 'PayPal' : 'bank wire'})`,
      company && `Company: ${company}`,
      country && `Country: ${country}`,
      message && `Message: ${message}`,
    ].filter(Boolean).join('\n');
    await addLead({ name: name.slice(0, 120), email: cleanEmail, company: company.slice(0, 160), budget: usd(pledge), packageSlug: 'investor', message: brief.slice(0, 5000) });
    try {
      await createThread({ name, email: cleanEmail, topic: 'negotiate', lang, source: 'contact', firstMessage: `[xaa.es investor] ${brief}` });
    } catch (e) {
      console.error('support thread for investor application failed (application still saved):', e);
    }
    return {
      ok: T(
        `Thank you — your application for ${usd(pledge)} is with the owner. You will receive the investor memorandum and the draft agreement within one business day; capital is sent only after both are signed.`,
        `Gracias — tu solicitud por ${usd(pledge)} ya la tiene el propietario. Recibirás el memorando para inversores y el borrador del contrato en un día hábil; el capital se envía solo después de firmar ambos.`,
        `Terima kasih — pengajuan Anda sebesar ${usd(pledge)} sudah diterima pemilik. Memorandum pemodal dan draf perjanjian dikirim dalam satu hari kerja; modal baru dikirim setelah keduanya ditandatangani.`,
      ),
    };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/** Admin: show or hide the whole investor offering (§26.4; shown by default). Kept in the settings audit log. */
export async function investVisibilityAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const show = str(form, 'visible') === 'yes';
    await saveSetting('invest_visible', show ? 'yes' : 'no', admin.name);
    revalidatePath('/portal/admin/investors');
    revalidatePath('/invest');
    return { ok: show ? 'The investor offering is now shown on xaa.es.' : 'The investor offering is now hidden on xaa.es.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/** Admin: the capital has arrived — verify the stake. From now on its share of xaa.es revenue is computed. */
export async function verifyInvestorAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const investor = await getInvestor(str(form, 'id'));
    if (!investor) return { error: 'Investor not found.' };
    if (investor.status === 'declined' || investor.status === 'returned') return { error: 'This application is closed.' };
    const capital = Number(str(form, 'capital').replace(/[^\d]/g, ''));
    if (!Number.isFinite(capital) || capital <= 0) return { error: 'Enter the capital actually received, in whole US dollars.' };
    const offer = await getInvest();
    if (capital > offer.targetUsd) return { error: `That is more than the whole raise (${usd(offer.targetUsd)}).` };
    const method = ['wire', 'paypal'].includes(str(form, 'method')) ? str(form, 'method') : 'wire';
    await verifyInvestor(investor.id, capital, method, admin.name);
    revalidatePath('/portal/admin/investors');
    return { ok: `Verified: ${usd(capital)} from ${investor.name}. Their statement starts today.` };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/** Admin: decline an application, or mark a stake as repaid (capital returned at the acquisition). */
export async function investorStatusAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const status = str(form, 'status');
    if (status !== 'declined' && status !== 'returned') return { error: 'Unknown status.' };
    const investor = await getInvestor(str(form, 'id'));
    if (!investor) return { error: 'Investor not found.' };
    if (status === 'returned' && investor.status !== 'verified') return { error: 'Only a verified stake can be repaid.' };
    if (status === 'declined' && investor.status !== 'applied') return { error: 'Only an open application can be declined.' };
    await setInvestorStatus(investor.id, status, str(form, 'note'), admin.name);
    revalidatePath('/portal/admin/investors');
    return { ok: status === 'returned' ? 'Marked as repaid: the revenue share stops today.' : 'Application declined.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/** Admin: record a monthly revenue-share payment to a verified investor. */
export async function recordPayoutAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const investor = await getInvestor(str(form, 'id'));
    if (!investor || (investor.status !== 'verified' && investor.status !== 'returned')) return { error: 'Payouts are for verified investors.' };
    const period = str(form, 'period');
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) return { error: 'Choose the month this payment covers.' };
    const amount = Number(str(form, 'amount').replace(',', '.').replace(/[^\d.]/g, ''));
    if (!Number.isFinite(amount) || amount <= 0) return { error: 'Enter the amount paid, in euros.' };
    await recordPayout(investor.id, period, amount, str(form, 'reference'), admin.name);
    revalidatePath('/portal/admin/investors');
    return { ok: `Recorded €${amount.toFixed(2)} for ${period}.` };
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
      : { error: 'Nothing to import — those destinations are already here, or no payment secrets are set on the Worker.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function importCompanyMethodsAction(_prev: ActionState, _form: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const n = await importCompanyMethods();
    revalidatePath('/portal/admin/payments');
    return n > 0
      ? { ok: `Imported ${n} company destination${n > 1 ? 's' : ''} (crypto wallets and BNI accounts), stored encrypted.` }
      : { ok: 'All company destinations are already here — nothing to import.' };
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
    const done = `Saved ${saved} field${saved === 1 ? '' : 's'}.`;
    if (group === 'paypal') {
      // Saving the keys is the whole job: each complete set is checked with
      // PayPal and its webhook is created or confirmed right away.
      const results: { ok: boolean; message: string }[] = [];
      for (const env of ['live', 'sandbox'] as const) {
        if (await paypalConfig(env)) results.push(await setupPayPal(env));
      }
      const text = [done, ...results.map((r) => r.message)].join(' ');
      return results.every((r) => r.ok) ? { ok: text } : { error: text };
    }
    return { ok: done };
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

/* ───────────────── Studio: support chat ───────────────── */

export async function supportReplyAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const threadId = str(form, 'threadId');
    const body = str(form, 'body');
    if (!threadId || !body) return { error: 'Write a reply first.' };
    if (!(await getThread(threadId))) return { error: 'Conversation not found.' };
    await adminReply(threadId, body.slice(0, 4000));
    await markAdminOnline();
    revalidatePath('/portal/admin/support');
    return { ok: 'Sent.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

export async function supportStatusAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const threadId = str(form, 'threadId');
    const status = str(form, 'status') === 'closed' ? 'closed' : 'open';
    await setThreadStatus(threadId, status);
    revalidatePath('/portal/admin/support');
    return { ok: status === 'closed' ? 'Conversation closed.' : 'Conversation reopened.' };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/** Heartbeat from the open Support desk: while it runs, the AI stays quiet. */
export async function supportPresenceAction(): Promise<void> {
  try {
    await requireAdmin();
    await markAdminOnline();
  } catch {
    /* not an admin, or storage unavailable — nothing to record */
  }
}

/* ───────────────── Data storage (R2) ───────────────── */

/** Admin: take a full backup of the data bucket now. */
export async function backupNowAction(_prev: ActionState, _form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const b = await backupNow(admin.name);
    revalidatePath('/portal/admin/settings');
    return { ok: `Backup saved: ${b.objects} objects, ${(b.bytes / 1024).toFixed(1)} KB (${b.key}).` };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/** Admin: put the data back as a backup holds it. Takes a safety backup first; needs the word RESTORE typed. */
export async function restoreBackupAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    if (str(form, 'confirm') !== 'RESTORE') return { error: 'Type RESTORE (in capitals) to confirm.' };
    const r = await restoreFrom(str(form, 'key'), admin.name);
    revalidatePath('/portal/admin', 'layout');
    return { ok: `Restored: ${r.written} objects written, ${r.removed} removed. The state before the restore is saved as ${r.safety.key}.` };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

/** Admin: copy again anything the legacy D1 still holds that R2 does not (nothing in R2 is overwritten). */
export async function recopyD1Action(_prev: ActionState, _form: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const report = await recopyD1();
    if (!report) return { error: 'The legacy D1 database is no longer bound — there is nothing to copy.' };
    const short = Object.entries(report).filter(([, r]) => r.r2 < r.d1);
    revalidatePath('/portal/admin/settings');
    return short.length
      ? { error: `Some rows did not copy: ${short.map(([t, r]) => `${t} ${r.r2}/${r.d1}`).join(', ')}.` }
      : { ok: `Every D1 row is in R2 (${Object.values(report).reduce((n, r) => n + r.d1, 0)} rows checked).` };
  } catch (err) {
    if (isRedirect(err)) throw err;
    return fail(err);
  }
}

