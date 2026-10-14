import { appEnv, db, newId, nowIso } from './db';
import { getSettings, saveSetting } from './settings';

/**
 * PayPal Checkout (Orders v2), confirmed automatically.
 *
 * The client presses "Pay with PayPal", approves on paypal.com and comes
 * back; the server captures the order and records the payment as confirmed
 * in the same request. Nobody has to compare a pasted transaction ID with an
 * account statement, and the project or the download unlocks at once.
 *
 * Two credential sets live in the admin settings (encrypted at rest): Live,
 * which moves real money, and Sandbox, PayPal's test environment. The admin
 * switch `paypal_mode` decides which one checkout uses. Credentials are read
 * on the server only and never reach the browser, a log or an error message.
 *
 * Money rules, in order of importance:
 *   1. The amount always comes from our own record, never from the browser.
 *   2. A capture is only accepted when PayPal reports it COMPLETED for exactly
 *      that amount, in EUR, carrying our checkout id.
 *   3. Money PayPal has taken is always recorded, even if the milestone was
 *      settled some other way in the meantime, so nothing can go missing.
 *   4. Every step is idempotent: the buyer's return and PayPal's webhook may
 *      race, refresh or repeat, and the payment is still recorded once.
 */

export type PayPalEnv = 'live' | 'sandbox';

const API_BASE: Record<PayPalEnv, string> = {
  live: 'https://api-m.paypal.com',
  sandbox: 'https://api-m.sandbox.paypal.com',
};

/**
 * PayPal's API root for an environment. Live is fixed. Sandbox may be pointed
 * at a local stand-in with the PAYPAL_SANDBOX_API variable, which is how the
 * end-to-end tests run the whole flow offline; it can never redirect Live.
 */
async function apiBase(env: PayPalEnv): Promise<string> {
  if (env === 'live') return API_BASE.live;
  const override = (await appEnv()).PAYPAL_SANDBOX_API?.trim();
  return override ? override.replace(/\/+$/, '') : API_BASE.sandbox;
}

export interface PayPalConfig {
  env: PayPalEnv;
  clientId: string;
  secret: string;
  webhookId: string;
}

const KEYS: Record<PayPalEnv, { id: string; secret: string; webhook: string }> = {
  live: { id: 'paypal_client_id', secret: 'paypal_client_secret', webhook: 'paypal_webhook_id' },
  sandbox: { id: 'paypal_sandbox_client_id', secret: 'paypal_sandbox_client_secret', webhook: 'paypal_sandbox_webhook_id' },
};

export function isPayPalEnv(v: unknown): v is PayPalEnv {
  return v === 'live' || v === 'sandbox';
}

/** The environment checkout uses. Live unless an admin chose Sandbox. */
export function modeOf(raw: string): PayPalEnv {
  return raw.trim().toLowerCase() === 'sandbox' ? 'sandbox' : 'live';
}

/** Credentials of one environment, or null when that set is incomplete. */
export async function paypalConfig(env: PayPalEnv): Promise<PayPalConfig | null> {
  const k = KEYS[env];
  const s = await getSettings([k.id, k.secret, k.webhook]);
  const clientId = (s[k.id] ?? '').trim();
  const secret = (s[k.secret] ?? '').trim();
  if (!clientId || !secret) return null;
  return { env, clientId, secret, webhookId: (s[k.webhook] ?? '').trim() };
}

/** The credentials checkout should use right now, or null when PayPal is off. */
export async function activePayPal(): Promise<PayPalConfig | null> {
  const s = await getSettings(['paypal_mode']);
  return paypalConfig(modeOf(s.paypal_mode ?? ''));
}

/** What a payment screen needs to know: whether to offer PayPal, and in which mode. */
export async function paypalOffer(): Promise<{ env: PayPalEnv } | null> {
  try {
    const cfg = await activePayPal();
    return cfg ? { env: cfg.env } : null;
  } catch {
    return null; // a settings read must never take a payment page down
  }
}

/* ───────────────────────── PayPal REST ───────────────────────── */

export class PayPalError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly issue: string = ''
  ) {
    super(message);
    this.name = 'PayPalError';
  }
}

/** Access tokens are cached per isolate until a minute before they expire. */
const tokens = new Map<string, { token: string; expires: number }>();

async function accessToken(cfg: PayPalConfig): Promise<string> {
  const cacheKey = `${cfg.env}:${cfg.clientId}`;
  const hit = tokens.get(cacheKey);
  if (hit && hit.expires > Date.now()) return hit.token;

  const res = await fetch(`${await apiBase(cfg.env)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${cfg.clientId}:${cfg.secret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
  });
  const data = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: string };
  if (!res.ok || !data.access_token) {
    // Never echo the response body: on a bad key it is harmless, but nothing
    // about a credential exchange belongs in a log line or a client message.
    throw new PayPalError(
      res.status === 401
        ? `PayPal rejected the ${cfg.env === 'live' ? 'Live' : 'Sandbox'} client ID or secret.`
        : `PayPal sign-in failed (HTTP ${res.status}).`,
      res.status,
      data.error ?? ''
    );
  }
  tokens.set(cacheKey, { token: data.access_token, expires: Date.now() + Math.max(60, (data.expires_in ?? 3600) - 60) * 1000 });
  return data.access_token;
}

async function call<T>(cfg: PayPalConfig, method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown, requestId?: string): Promise<T> {
  const res = await fetch(`${await apiBase(cfg.env)}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await accessToken(cfg)}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Prefer: 'return=representation',
      ...(requestId ? { 'PayPal-Request-Id': requestId } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { name?: string; message?: string; details?: { issue?: string; description?: string }[] };
  if (!res.ok) {
    const issue = data.details?.[0]?.issue ?? data.name ?? '';
    const detail = data.details?.[0]?.description ?? data.message ?? '';
    throw new PayPalError(`PayPal ${method} ${path.split('/').slice(0, 4).join('/')} failed (HTTP ${res.status}${issue ? `, ${issue}` : ''})${detail ? `: ${detail}` : ''}`, res.status, issue);
  }
  return data;
}

export interface PayPalAmount {
  currency_code: string;
  value: string;
}

export interface PayPalCapture {
  id: string;
  status: string; // COMPLETED | PENDING | DECLINED | FAILED | REFUNDED | PARTIALLY_REFUNDED
  amount?: PayPalAmount;
  custom_id?: string;
  status_details?: { reason?: string };
}

export interface PayPalOrder {
  id: string;
  status: string; // CREATED | SAVED | APPROVED | VOIDED | COMPLETED | PAYER_ACTION_REQUIRED
  links?: { href: string; rel: string; method?: string }[];
  purchase_units?: {
    reference_id?: string;
    custom_id?: string;
    amount?: PayPalAmount;
    payments?: { captures?: PayPalCapture[] };
  }[];
}

/** "1234" → "1234.00". Amounts are whole euros throughout the portal. */
export function toValue(amountEur: number): string {
  return `${Math.round(amountEur)}.00`;
}

export async function createPayPalOrder(
  cfg: PayPalConfig,
  input: { checkoutId: string; amountEur: number; description: string; returnUrl: string; cancelUrl: string }
): Promise<{ id: string; approveUrl: string }> {
  const order = await call<PayPalOrder>(
    cfg,
    'POST',
    '/v2/checkout/orders',
    {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: input.checkoutId,
          custom_id: input.checkoutId,
          description: input.description.slice(0, 127),
          amount: { currency_code: 'EUR', value: toValue(input.amountEur) },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: 'XAA',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
            landing_page: 'NO_PREFERENCE',
            return_url: input.returnUrl,
            cancel_url: input.cancelUrl,
          },
        },
      },
    },
    `xaa-create-${input.checkoutId}`
  );
  const approveUrl = order.links?.find((l) => l.rel === 'payer-action' || l.rel === 'approve')?.href ?? '';
  if (!order.id || !approveUrl) throw new PayPalError('PayPal did not return an approval link.', 502);
  return { id: order.id, approveUrl };
}

export async function getPayPalOrder(cfg: PayPalConfig, orderId: string): Promise<PayPalOrder> {
  return call<PayPalOrder>(cfg, 'GET', `/v2/checkout/orders/${encodeURIComponent(orderId)}`);
}

/**
 * Capture an approved order. Repeating the call is safe: the request id makes
 * PayPal answer a retry with the first result, and an order that is already
 * captured is read back instead of failing.
 */
export async function capturePayPalOrder(cfg: PayPalConfig, orderId: string, checkoutId: string): Promise<PayPalOrder> {
  try {
    return await call<PayPalOrder>(cfg, 'POST', `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {}, `xaa-capture-${checkoutId}`);
  } catch (err) {
    if (err instanceof PayPalError && err.issue === 'ORDER_ALREADY_CAPTURED') return getPayPalOrder(cfg, orderId);
    throw err;
  }
}

/** The capture on an order, if there is one. */
export function captureOf(order: PayPalOrder): PayPalCapture | null {
  return order.purchase_units?.[0]?.payments?.captures?.[0] ?? null;
}

export type CaptureVerdict =
  | { ok: true; state: 'completed' | 'pending'; captureId: string; reason: string }
  | { ok: false; reason: string };

/**
 * Accept a capture only when it is exactly what we asked for. A capture for a
 * different amount, currency or checkout is never booked against a project.
 */
export function judgeCapture(capture: PayPalCapture | null, expected: { checkoutId: string; amountEur: number }): CaptureVerdict {
  if (!capture) return { ok: false, reason: 'PayPal has no capture for this order yet.' };
  const value = capture.amount?.value ?? '';
  const currency = capture.amount?.currency_code ?? '';
  if (currency !== 'EUR' || Number(value) !== Math.round(expected.amountEur)) {
    return { ok: false, reason: `PayPal captured ${value || '?'} ${currency || '?'}, expected ${toValue(expected.amountEur)} EUR.` };
  }
  if (capture.custom_id && capture.custom_id !== expected.checkoutId) {
    return { ok: false, reason: 'The PayPal capture belongs to another checkout.' };
  }
  if (capture.status === 'COMPLETED') return { ok: true, state: 'completed', captureId: capture.id, reason: '' };
  if (capture.status === 'PENDING') {
    return { ok: true, state: 'pending', captureId: capture.id, reason: capture.status_details?.reason ?? 'PENDING_REVIEW' };
  }
  return { ok: false, reason: `PayPal reports the capture as ${capture.status}.` };
}

/* ───────────────────────── Webhook, set up by the site itself ───────────────────────── */

/** What the webhook listens to — exactly what handleWebhookEvent acts on. */
export const WEBHOOK_EVENTS = [
  'CHECKOUT.ORDER.APPROVED',
  'PAYMENT.CAPTURE.COMPLETED',
  'PAYMENT.CAPTURE.PENDING',
  'PAYMENT.CAPTURE.DENIED',
  'PAYMENT.CAPTURE.REFUNDED',
  'PAYMENT.CAPTURE.REVERSED',
];

interface PayPalWebhook {
  id: string;
  url: string;
  event_types?: { name: string }[];
}

/**
 * Make sure the PayPal app has a webhook pointing at this site, with the
 * events above, and remember its id — so nobody has to create one by hand in
 * the PayPal dashboard. Finds an existing webhook for the same URL first
 * (PayPal refuses duplicates), updates its events when some are missing,
 * otherwise creates it. Safe to run any number of times.
 */
export async function ensureWebhook(env: PayPalEnv, url: string): Promise<{ ok: boolean; message: string }> {
  const cfg = await paypalConfig(env);
  const name = env === 'live' ? 'Live' : 'Sandbox';
  if (!cfg) return { ok: false, message: `${name}: enter the client ID and secret first.` };
  const target = url.replace(/\/+$/, '');
  try {
    const list = await call<{ webhooks?: PayPalWebhook[] }>(cfg, 'GET', '/v1/notifications/webhooks');
    const mine = (list.webhooks ?? []).find((w) => w.url.replace(/\/+$/, '') === target);
    let id = mine?.id ?? '';
    let what = 'ready';
    if (mine) {
      const have = new Set((mine.event_types ?? []).map((e) => e.name));
      if (!have.has('*') && WEBHOOK_EVENTS.some((e) => !have.has(e))) {
        await call(cfg, 'PATCH', `/v1/notifications/webhooks/${encodeURIComponent(mine.id)}`, [
          { op: 'replace', path: '/event_types', value: WEBHOOK_EVENTS.map((n) => ({ name: n })) },
        ]);
        what = 'updated';
      }
    } else {
      const created = await call<PayPalWebhook>(cfg, 'POST', '/v1/notifications/webhooks', {
        url: target,
        event_types: WEBHOOK_EVENTS.map((n) => ({ name: n })),
      });
      id = created.id;
      what = 'created';
    }
    if (!id) return { ok: false, message: `${name}: PayPal did not return a webhook id.` };
    if (id !== cfg.webhookId) await saveSetting(KEYS[env].webhook, id, 'PayPal setup');
    return { ok: true, message: `${name} webhook ${what} on PayPal (${target}).` };
  } catch (err) {
    const issue = err instanceof PayPalError ? err.issue : '';
    if (issue === 'WEBHOOK_NUMBER_LIMIT_EXCEEDED') {
      return { ok: false, message: `${name}: this PayPal app already has 10 webhooks — delete an unused one in the PayPal dashboard, then save again.` };
    }
    return { ok: false, message: `${name} webhook: ${err instanceof Error ? err.message : 'PayPal could not be reached.'}` };
  }
}

/** Check a set of credentials by signing in with them. */
export async function testPayPal(env: PayPalEnv): Promise<{ ok: boolean; message: string }> {
  const cfg = await paypalConfig(env);
  const name = env === 'live' ? 'Live' : 'Sandbox';
  if (!cfg) return { ok: false, message: `${name}: enter the client ID and secret first.` };
  try {
    tokens.delete(`${cfg.env}:${cfg.clientId}`);
    await accessToken(cfg);
    return { ok: true, message: `${name}: PayPal accepted these credentials.` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : `${name}: PayPal check failed.` };
  }
}

/* ───────────────────────── Checkout ledger ───────────────────────── */

export type CheckoutKind = 'milestone' | 'template';
export type CheckoutStatus = 'created' | 'capturing' | 'pending' | 'completed' | 'cancelled' | 'failed';

export interface PayPalCheckout {
  id: string;
  paypal_order_id: string | null;
  env: PayPalEnv;
  kind: CheckoutKind;
  user_id: string;
  project_id: string | null;
  milestone: string | null;
  label: string | null;
  template_order_id: string | null;
  amount: number;
  status: CheckoutStatus;
  capture_id: string | null;
  payment_id: string | null;
  detail: string | null;
  created_at: string;
  updated_at: string;
}

export async function insertCheckout(row: Omit<PayPalCheckout, 'created_at' | 'updated_at' | 'capture_id' | 'payment_id' | 'detail' | 'status'>): Promise<void> {
  const database = await db();
  const now = nowIso();
  await database
    .prepare(
      `INSERT INTO paypal_checkouts (id, paypal_order_id, env, kind, user_id, project_id, milestone, label,
        template_order_id, amount, status, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?, 'created', ?, ?)`
    )
    .bind(
      row.id, row.paypal_order_id, row.env, row.kind, row.user_id, row.project_id, row.milestone, row.label,
      row.template_order_id, row.amount, now, now
    )
    .run();
}

export async function getCheckout(id: string): Promise<PayPalCheckout | null> {
  const database = await db();
  return (await database.prepare('SELECT * FROM paypal_checkouts WHERE id = ?').bind(id).first<PayPalCheckout>()) ?? null;
}

export async function getCheckoutByOrder(paypalOrderId: string): Promise<PayPalCheckout | null> {
  const database = await db();
  return (
    (await database.prepare('SELECT * FROM paypal_checkouts WHERE paypal_order_id = ?').bind(paypalOrderId).first<PayPalCheckout>()) ?? null
  );
}

async function setCheckout(id: string, patch: Partial<Pick<PayPalCheckout, 'status' | 'capture_id' | 'payment_id' | 'detail'>>): Promise<void> {
  const database = await db();
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const [k, v] of Object.entries(patch)) {
    sets.push(`${k} = ?`);
    values.push(v ?? null);
  }
  sets.push('updated_at = ?');
  values.push(nowIso(), id);
  await database.prepare(`UPDATE paypal_checkouts SET ${sets.join(', ')} WHERE id = ?`).bind(...values).run();
}

/**
 * Claim a checkout for capturing. Only one caller wins; the rest step aside.
 * A claim left behind by a request that died mid-way goes stale after two
 * minutes, so a checkout can never be stuck in `capturing` for good.
 */
async function claim(id: string, from: CheckoutStatus[]): Promise<boolean> {
  const database = await db();
  const placeholders = from.map(() => '?').join(',');
  const stale = new Date(Date.now() - 120_000).toISOString();
  const res = await database
    .prepare(
      `UPDATE paypal_checkouts SET status = 'capturing', updated_at = ?
       WHERE id = ? AND (status IN (${placeholders}) OR (status = 'capturing' AND updated_at < ?))`
    )
    .bind(nowIso(), id, ...from, stale)
    .run();
  return (res.meta?.changes ?? 0) > 0;
}

/**
 * Self-healing without a webhook: when a client opens the page a checkout
 * pays for, ask PayPal again about any checkout of theirs that is still open —
 * a capture PayPal held for review (up to 30 days), or an order approved on
 * paypal.com whose buyer closed the tab before coming back (PayPal keeps an
 * approval for about three hours). At most three, each at most once a minute.
 */
export async function refreshOpenCheckouts(where: { projectId?: string; templateOrderId?: string }): Promise<boolean> {
  const column = where.projectId ? 'project_id' : where.templateOrderId ? 'template_order_id' : '';
  const value = where.projectId ?? where.templateOrderId;
  if (!column || !value) return false;
  const now = Date.now();
  const database = await db();
  const { results } = await database
    .prepare(
      `SELECT * FROM paypal_checkouts WHERE ${column} = ? AND updated_at < ? AND (
         (status = 'pending' AND created_at > ?) OR (status = 'created' AND created_at > ? AND created_at < ?)
       ) ORDER BY created_at DESC LIMIT 3`
    )
    .bind(
      value,
      new Date(now - 60_000).toISOString(),
      new Date(now - 30 * 86_400_000).toISOString(),
      new Date(now - 3 * 3_600_000).toISOString(),
      new Date(now - 60_000).toISOString()
    )
    .all<PayPalCheckout>();
  let settled = false;
  for (const c of results ?? []) {
    try {
      const r = await settleCheckout(c, { capture: true });
      if (r.state === 'completed') settled = true;
    } catch {
      // A page view must never fail because PayPal was slow to answer.
    }
  }
  return settled;
}

/** Recent checkouts for the admin desk, with the reference each one pays. */
export async function listRecentCheckouts(limit = 15): Promise<(PayPalCheckout & { ref: string | null })[]> {
  const database = await db();
  const { results } = await database
    .prepare(
      `SELECT c.*, COALESCE(p.ref, o.ref) AS ref FROM paypal_checkouts c
       LEFT JOIN projects p ON p.id = c.project_id
       LEFT JOIN template_orders o ON o.id = c.template_order_id
       ORDER BY c.created_at DESC LIMIT ?`
    )
    .bind(limit)
    .all<PayPalCheckout & { ref: string | null }>();
  return results ?? [];
}

/** Whether each credential set is complete, and which one checkout uses. */
export async function paypalStatus(): Promise<{ live: boolean; sandbox: boolean; mode: PayPalEnv }> {
  const s = await getSettings(['paypal_mode', ...Object.values(KEYS.live), ...Object.values(KEYS.sandbox)]);
  const full = (env: PayPalEnv) => Boolean(s[KEYS[env].id]?.trim() && s[KEYS[env].secret]?.trim());
  return { live: full('live'), sandbox: full('sandbox'), mode: modeOf(s.paypal_mode ?? '') };
}

/** A buyer who backs out on paypal.com: nothing was charged. */
export async function cancelCheckout(id: string): Promise<PayPalCheckout | null> {
  const c = await getCheckout(id);
  if (c && c.status === 'created') await setCheckout(id, { status: 'cancelled', detail: 'Buyer cancelled on PayPal.' });
  return c;
}

export function newCheckoutId(): string {
  return newId();
}

/** The portal page a checkout was paid from — where the buyer lands afterwards. */
export function checkoutPage(c: PayPalCheckout | null): string {
  if (c?.kind === 'template' && c.template_order_id) return `/portal/orders/${c.template_order_id}`;
  if (c?.project_id) return `/portal/projects/${c.project_id}`;
  return '/portal';
}

/**
 * Why a settle did not complete, as a fixed code: the buyer's page shows a
 * fixed sentence for each, so no free text ever travels through a URL (a
 * crafted link must not be able to print its own words on a payment page).
 */
export type FailReason = 'not_approved' | 'declined' | 'mismatch' | 'unavailable' | 'unknown';

export type SettleResult = { state: 'completed' | 'pending' | 'failed' | 'busy'; message: string; reason?: FailReason; checkout: PayPalCheckout };

/**
 * Capture (when needed) and book a checkout. Safe to call from the buyer's
 * return, from a webhook and from a page refresh, in any order.
 */
export async function settleCheckout(checkout: PayPalCheckout, opts: { capture: boolean }): Promise<SettleResult> {
  if (checkout.status === 'completed') return { state: 'completed', message: 'Already confirmed.', checkout };
  if (!checkout.paypal_order_id) return { state: 'failed', message: 'This checkout never reached PayPal.', reason: 'unknown', checkout };

  const cfg = await paypalConfig(checkout.env);
  if (!cfg) return { state: 'failed', message: 'PayPal is not configured for this checkout’s environment.', reason: 'unavailable', checkout };

  // `pending` is re-claimable so a later webhook can complete a held capture.
  if (!(await claim(checkout.id, ['created', 'pending', 'failed']))) {
    const now = await getCheckout(checkout.id);
    return { state: now?.status === 'completed' ? 'completed' : 'busy', message: 'Already being processed.', checkout: now ?? checkout };
  }

  try {
    let order = await getPayPalOrder(cfg, checkout.paypal_order_id);
    if (order.status === 'APPROVED' && opts.capture) order = await capturePayPalOrder(cfg, checkout.paypal_order_id, checkout.id);

    if (order.status !== 'COMPLETED' && !captureOf(order)) {
      const waiting = order.status === 'CREATED' || order.status === 'PAYER_ACTION_REQUIRED' || order.status === 'APPROVED';
      await setCheckout(checkout.id, { status: waiting ? 'created' : 'failed', detail: `PayPal order status ${order.status}.` });
      return {
        state: 'failed',
        message: waiting ? 'The payment was not approved on PayPal, so nothing was charged.' : `PayPal reports the order as ${order.status}.`,
        reason: waiting ? 'not_approved' : 'unknown',
        checkout,
      };
    }

    const verdict = judgeCapture(captureOf(order), { checkoutId: checkout.id, amountEur: checkout.amount });
    if (!verdict.ok) {
      await setCheckout(checkout.id, { status: 'failed', detail: verdict.reason });
      return { state: 'failed', message: verdict.reason, reason: 'mismatch', checkout };
    }

    const paymentId = await book(checkout, verdict.captureId, verdict.state);
    await setCheckout(checkout.id, {
      status: verdict.state === 'completed' ? 'completed' : 'pending',
      capture_id: verdict.captureId,
      payment_id: paymentId,
      detail: verdict.state === 'pending' ? `PayPal is holding the capture: ${verdict.reason}` : null,
    });
    const fresh = (await getCheckout(checkout.id)) ?? checkout;
    return verdict.state === 'completed'
      ? { state: 'completed', message: 'Payment received and confirmed.', checkout: fresh }
      : { state: 'pending', message: 'PayPal is holding this payment for review. It confirms here automatically when PayPal releases it.', checkout: fresh };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PayPal could not be reached.';
    const declined = err instanceof PayPalError && (err.issue === 'INSTRUMENT_DECLINED' || err.issue === 'PAYER_ACTION_REQUIRED');
    // Back to `created` so the buyer (or the webhook) can try the same order again.
    await setCheckout(checkout.id, { status: 'created', detail: message.slice(0, 500) });
    return {
      state: 'failed',
      message: declined ? 'PayPal declined that card or balance. Please try again and choose another way to pay inside PayPal.' : message,
      reason: declined ? 'declined' : 'unavailable',
      checkout,
    };
  }
}

/**
 * Write the money into the record it belongs to. Idempotent per capture: a
 * capture id that is already booked is never booked twice.
 */
async function book(checkout: PayPalCheckout, captureId: string, state: 'completed' | 'pending'): Promise<string | null> {
  const database = await db();

  if (checkout.kind === 'template' && checkout.template_order_id) {
    if (state === 'completed') {
      await database
        .prepare("UPDATE template_orders SET status = 'paid', method = 'paypal', reference = ?, confirmed_at = ? WHERE id = ? AND status != 'paid'")
        .bind(captureId, nowIso(), checkout.template_order_id)
        .run();
    } else {
      await database
        .prepare("UPDATE template_orders SET status = 'submitted', method = 'paypal', reference = ?, note = ? WHERE id = ? AND status IN ('pending','submitted')")
        .bind(captureId, 'PayPal is holding this payment for review; it confirms automatically.', checkout.template_order_id)
        .run();
    }
    return null;
  }

  if (checkout.kind === 'milestone' && checkout.project_id) {
    const { getProject, recordPayment, setPaymentStatus, reconcile } = await import('./projects');
    const existing = await database
      .prepare("SELECT id, status FROM payments WHERE method = 'paypal' AND reference = ? AND project_id = ?")
      .bind(captureId, checkout.project_id)
      .first<{ id: string; status: string }>();
    if (existing) {
      if (state === 'completed' && existing.status !== 'confirmed') await setPaymentStatus(existing.id, 'confirmed', 'PayPal');
      return existing.id;
    }
    const project = await getProject(checkout.project_id);
    if (!project) return null;
    const payment = await recordPayment({
      project,
      userId: checkout.user_id,
      milestone: (checkout.milestone ?? 'extra') as Parameters<typeof recordPayment>[0]['milestone'],
      label: checkout.label ?? 'Payment',
      amount: checkout.amount,
      method: 'paypal',
      reference: captureId,
      note: checkout.env === 'sandbox' ? 'PayPal SANDBOX (test money)' : 'PayPal — confirmed automatically',
      status: state === 'completed' ? 'confirmed' : 'pending',
      author: 'PayPal',
    });
    if (state === 'completed') await reconcile(project.id);
    return payment.id;
  }
  return null;
}

/**
 * PayPal's own notifications. The payload is only a hint: whatever it says,
 * the order is read back from PayPal with our credentials before anything is
 * booked, so a forged notification can at most make us ask PayPal a question.
 */
export async function handleWebhookEvent(event: {
  event_type?: string;
  resource?: { id?: string; status?: string; supplementary_data?: { related_ids?: { order_id?: string } } };
}): Promise<string> {
  const type = event.event_type ?? '';
  const orderId =
    type.startsWith('CHECKOUT.ORDER.') ? event.resource?.id ?? '' : event.resource?.supplementary_data?.related_ids?.order_id ?? '';
  if (!orderId) return `ignored ${type || 'event'}: no order id`;

  const checkout = await getCheckoutByOrder(orderId);
  if (!checkout) return `ignored ${type}: unknown order`;

  if (type === 'CHECKOUT.ORDER.APPROVED' || type === 'PAYMENT.CAPTURE.COMPLETED' || type === 'PAYMENT.CAPTURE.PENDING') {
    const r = await settleCheckout(checkout, { capture: type === 'CHECKOUT.ORDER.APPROVED' });
    return `${type}: ${r.state}`;
  }
  if (type === 'PAYMENT.CAPTURE.DENIED' || type === 'PAYMENT.CAPTURE.REFUNDED' || type === 'PAYMENT.CAPTURE.REVERSED') {
    await flagReversal(checkout, type);
    return `${type}: flagged`;
  }
  return `ignored ${type}`;
}

/** A capture that was denied, refunded or reversed after the fact. */
async function flagReversal(checkout: PayPalCheckout, type: string): Promise<void> {
  const what = type === 'PAYMENT.CAPTURE.DENIED' ? 'denied' : type === 'PAYMENT.CAPTURE.REFUNDED' ? 'refunded' : 'reversed';
  await setCheckout(checkout.id, { detail: `PayPal ${what} this payment.` });
  if (checkout.kind === 'template' && checkout.template_order_id && what === 'denied') {
    const database = await db();
    await database
      .prepare("UPDATE template_orders SET status = 'pending', note = ? WHERE id = ? AND status = 'submitted'")
      .bind('PayPal denied the payment. Please pay again.', checkout.template_order_id)
      .run();
  }
  if (checkout.kind === 'milestone' && checkout.project_id) {
    const { addUpdate, setPaymentStatus } = await import('./projects');
    // A denied capture never arrived: take it off the record. A refund or a
    // reversal is the studio's call (it may be partial), so it is flagged.
    if (what === 'denied' && checkout.payment_id) await setPaymentStatus(checkout.payment_id, 'rejected', 'PayPal');
    else await addUpdate(checkout.project_id, { title: `PayPal ${what} a payment`, body: `€${checkout.amount.toLocaleString('en-GB')} · ${checkout.label ?? ''}`.trim(), author: 'PayPal' });
  }
}

/**
 * Ask PayPal whether a webhook really came from PayPal. Used when the admin
 * has entered the webhook ID; without it the event is still safe (see above).
 */
export async function verifyWebhookSignature(cfg: PayPalConfig, headers: Headers, event: unknown): Promise<boolean> {
  if (!cfg.webhookId) return false;
  try {
    const r = await call<{ verification_status?: string }>(cfg, 'POST', '/v1/notifications/verify-webhook-signature', {
      auth_algo: headers.get('paypal-auth-algo'),
      cert_url: headers.get('paypal-cert-url'),
      transmission_id: headers.get('paypal-transmission-id'),
      transmission_sig: headers.get('paypal-transmission-sig'),
      transmission_time: headers.get('paypal-transmission-time'),
      webhook_id: cfg.webhookId,
      webhook_event: event,
    });
    return r.verification_status === 'SUCCESS';
  } catch {
    return false;
  }
}
