import type { PaySubmission } from './manual-pay';
import { bucket, newId, nowIso } from './db';
import { data } from './data';
import type { User } from './auth';
import { getTemplate } from '@/content/templates';

/**
 * The SaaS template store: orders and bundle delivery.
 *
 * An order is a single purchase of a single template. The buyer pays through
 * the same rails as everything else (the destinations shown on the checkout),
 * an admin confirms the payment, and the order flips to `paid` — at which point
 * the buyer can download that template's bundle (a zip of full source, database
 * and setup guide). The zip lives once per template in the uploads bucket;
 * buying grants access, it is not copied per order. Orders and bundle records
 * are R2 documents (server/r2/schema.ts: template_orders, template_bundles).
 */

export type OrderStatus = 'pending' | 'submitted' | 'paid' | 'cancelled';

export interface TemplateOrder {
  id: string;
  ref: string;
  slug: string;
  name: string;
  user_id: string;
  price: number;
  status: OrderStatus;
  method: string | null;
  reference: string | null;
  note: string | null;
  created_at: string;
  confirmed_at: string | null;
  /** Set when the order pays an auction win (server/auction.ts): the lot it pays for. */
  auction_lot_id?: string | null;
  /** The payment screenshot a bank or USDT payment needs before the admin approves it (uploads bucket). */
  receipt_key?: string | null;
  /** What the buyer paid with and the amount we expected in that currency (server/manual-pay.ts). */
  pay?: PaySubmission | null;
  /** Set when the admin sends the payment back with what to fix (amount short, unreadable screenshot …). */
  attention?: string | null;
  attention_at?: string | null;
}

export interface BundleMeta {
  slug: string;
  object_key: string;
  filename: string;
  size: number;
  updated_at: string;
}

function makeRef(): string {
  const y = new Date().getFullYear().toString().slice(-2);
  const n = Math.floor(Math.random() * 1_679_616).toString(36).toUpperCase().padStart(4, '0');
  return `TPL-${y}${n}`;
}

export async function createOrder(user: User, slug: string): Promise<TemplateOrder> {
  const tpl = getTemplate(slug);
  if (!tpl) throw new Error('Unknown template.');
  // Reuse an open order for the same template rather than piling up duplicates.
  const d = await data();
  const mine = await d.templateOrders.listAllDocs('user_slug', `${user.id}|${slug}`);
  const open = mine.find((o) => o.status === 'pending' || o.status === 'submitted');
  if (open) return open;

  const order: TemplateOrder = {
    id: newId(),
    ref: makeRef(),
    slug: tpl.slug,
    name: tpl.name,
    user_id: user.id,
    price: tpl.price,
    status: 'pending',
    method: null,
    reference: null,
    note: null,
    created_at: nowIso(),
    confirmed_at: null,
  };
  await d.templateOrders.create(order);
  return order;
}

export async function getOrder(id: string): Promise<TemplateOrder | null> {
  return (await data()).templateOrders.get(id);
}

export async function listUserOrders(userId: string): Promise<TemplateOrder[]> {
  return (await data()).templateOrders.listAllDocs('user', userId);
}

export async function listAllOrders(): Promise<(TemplateOrder & { client_email: string })[]> {
  const d = await data();
  const orders = await d.templateOrders.listAllDocs('all', 'all');
  const ids = [...new Set(orders.map((o) => o.user_id))];
  const users = new Map((await d.users.getMany(ids)).flatMap((u) => (u ? [[u.id, u.email] as const] : [])));
  // Orders of an account that no longer exists are left out, as the old inner join did.
  return orders.flatMap((o) => (users.has(o.user_id) ? [{ ...o, client_email: users.get(o.user_id)! }] : []));
}

/** The order changes only from pending/submitted — a paid or cancelled order is never reopened by a late form post. */
export async function submitOrderPayment(orderId: string, patch: { method: string; reference: string; note?: string; receiptKey?: string | null; pay?: PaySubmission | null }): Promise<void> {
  const d = await data();
  if (!(await d.templateOrders.get(orderId))) return;
  await d.templateOrders.update(orderId, (o) =>
    o.status === 'pending' || o.status === 'submitted'
      ? {
          ...o, status: 'submitted', method: patch.method, reference: patch.reference.slice(0, 200), note: patch.note?.slice(0, 1000) ?? null,
          receipt_key: patch.receiptKey ?? o.receipt_key ?? null, pay: patch.pay ?? o.pay ?? null, attention: null, attention_at: null,
        }
      : null,
  );
}

/** The admin sends a submitted payment back with what to fix; the buyer sees it in the tracker and submits again. */
export async function orderNeedsAttention(orderId: string, reason: string): Promise<void> {
  const d = await data();
  if (!(await d.templateOrders.get(orderId))) return;
  await d.templateOrders.update(orderId, (o) =>
    o.status === 'submitted' || o.status === 'pending' ? { ...o, status: 'pending', attention: reason.slice(0, 500), attention_at: nowIso() } : null,
  );
}

const RECEIPT_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']);
/** The payment screenshot of a manual payment (bank transfer needs one — owner, 27 Oct 2026). Private: the buyer and the admin only. */
export async function storeReceipt(orderId: string, file: File): Promise<string> {
  if (!RECEIPT_TYPES.has(file.type)) throw new Error('Upload the payment screenshot as PNG, JPG, WebP or PDF.');
  if (file.size > 8 * 1024 * 1024) throw new Error('The screenshot can be at most 8 MB.');
  const store = await bucket();
  if (!store) throw new Error('File storage is not configured on this deployment yet.');
  const key = `receipts/${orderId}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, '_').slice(0, 80)}`;
  await store.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  return key;
}

/** pending/submitted → paid, once: a second confirmation (admin + PayPal) keeps the first confirmation time. */
export async function confirmOrder(orderId: string): Promise<void> {
  const d = await data();
  if (!(await d.templateOrders.get(orderId))) return;
  const paid = await d.templateOrders.update(orderId, (o) => (o.status === 'paid' ? null : { ...o, status: 'paid', confirmed_at: nowIso() }));
  // An auction win: the lot is sold and its assets open (server/auction.ts). Idempotent, like the confirmation.
  if (paid.auction_lot_id && paid.status === 'paid') await (await import('./auction')).auctionOrderPaid(paid);
}

export async function cancelOrder(orderId: string): Promise<void> {
  const d = await data();
  if (!(await d.templateOrders.get(orderId))) return;
  await d.templateOrders.update(orderId, (o) => (o.status === 'cancelled' ? null : { ...o, status: 'cancelled' }));
}

/** True when this user has a paid order for the template — the download gate. */
export async function hasPaidOrder(userId: string, slug: string): Promise<boolean> {
  const mine = await (await data()).templateOrders.listAllDocs('user_slug', `${userId}|${slug}`);
  return mine.some((o) => o.status === 'paid');
}

/* ───────────────────────── Bundles ───────────────────────── */

export async function getBundleMeta(slug: string): Promise<BundleMeta | null> {
  const doc = await (await data()).bundles.get(slug);
  if (!doc) return null;
  const { id: _id, updated_by: _by, ...meta } = doc;
  return meta;
}

/**
 * The templates whose bundle is uploaded. Only these can be bought (a template still in
 * development is shown as such, never sold as ready — the auction lots the same set).
 */
export async function readyTemplateSlugs(): Promise<Set<string>> {
  return new Set((await (await data()).bundles.all(500)).map((b) => b.slug));
}

export async function saveBundle(slug: string, file: File, actor: string): Promise<void> {
  if (!getTemplate(slug)) throw new Error('Unknown template.');
  const store = await bucket();
  if (!store) throw new Error('File storage is not configured, so the bundle cannot be stored.');
  const filename = (file.name || `${slug}.zip`).replace(/[^\w.\-]/g, '_').slice(0, 120);
  const key = `templates/${slug}/${filename}`;
  const bytes = await file.arrayBuffer();
  await store.put(key, bytes, { httpMetadata: { contentType: file.type || 'application/zip' } });
  const doc = { id: slug, slug, object_key: key, filename, size: file.size, updated_at: nowIso(), updated_by: actor };
  await (await data()).bundles.upsert(slug, () => doc);
}
