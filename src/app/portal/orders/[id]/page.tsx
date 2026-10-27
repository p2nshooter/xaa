import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { portalReady } from '@/server/db';
import { getOrder, getBundleMeta } from '@/server/store';
import { getTemplate } from '@/content/templates';
import { listPaymentMethods } from '@/server/settings';
import { eur } from '@/content/packages';
import { formatDate } from '@/server/projects';
import { OrderPaymentForm, ConfirmOrderControls } from '@/components/forms/StoreForms';
import { PayPalOutcome } from '@/components/forms/PayPalForms';
import { paypalOffer, refreshOpenCheckouts } from '@/server/paypal';

export const metadata: Metadata = { title: 'Order', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting payment', submitted: 'Payment submitted — awaiting confirmation', paid: 'Paid — download ready', cancelled: 'Cancelled',
};
const STATUS_BADGE: Record<string, string> = { pending: 'badge-amber', submitted: 'badge-blue', paid: 'badge-green', cancelled: 'badge-grey' };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paypal?: string; reason?: string }>;
}) {
  const { id } = await params;
  const { paypal: paypalOutcome, reason: paypalReason } = await searchParams;
  if (!(await portalReady())) redirect('/portal');
  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/portal/orders/${id}`)}`);

  let order = await getOrder(id);
  if (!order) notFound();
  if (order.user_id !== user.id && user.role !== 'admin') notFound();
  // See the project page: a held or tab-closed PayPal payment confirms here.
  if (order.status !== 'paid' && (await refreshOpenCheckouts({ templateOrderId: order.id }).catch(() => false))) {
    order = (await getOrder(id)) ?? order;
  }

  const [tpl, bundle, methods, paypal] = await Promise.all([
    Promise.resolve(getTemplate(order.slug)),
    getBundleMeta(order.slug),
    listPaymentMethods(true),
    paypalOffer(),
  ]);

  const destinations = methods
    .filter((m) => !m.unreadable && m.address)
    .map((m) => ({
      id: m.id, kind: m.kind, label: m.label, network: m.network, currency: m.currency,
      address: m.address, memo: m.memo, link: m.link, instructions: m.instructions,
      holder: m.holder, bankName: m.bankName, swift: m.swift, branch: m.branch, bankCountry: m.bankCountry,
    }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/portal" className="text-xs text-steel-500 hover:text-gold-500">← Portal</Link>
      <p className="mt-2 font-mono text-xs text-steel-500">{order.ref}</p>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="mt-1 font-display text-3xl font-extrabold">{order.name}</h1>
        <span className={`badge ${STATUS_BADGE[order.status]}`}>{STATUS_LABEL[order.status]}</span>
      </div>

      <PayPalOutcome outcome={paypalOutcome} reason={paypalReason} />

      <section className="panel mt-6 p-6">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">Price</dt>
            <dd className="mt-1 font-display text-xl font-extrabold">{eur(order.price)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">Ordered</dt>
            <dd className="mt-1 text-sm">{formatDate(order.created_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">{order.auction_lot_id ? 'Auction lot' : 'Template'}</dt>
            <dd className="mt-1 text-sm">
              {order.auction_lot_id
                ? <Link href={`/auction/${order.ref}`} className="text-gold-500 underline">{order.ref}</Link>
                : <Link href={`/templates/${order.slug}`} className="text-gold-500 underline">{order.slug}</Link>}
            </dd>
          </div>
        </dl>
      </section>

      {/* An auction win: what opens once it is paid (server/auction.ts). */}
      {order.auction_lot_id ? (
        <section className="panel mt-6 p-6" data-testid="auction-order">
          <h2 className="font-display text-lg font-extrabold">{order.status === 'paid' ? 'Your win is paid' : 'Pay for your win'}</h2>
          <p className="mt-1 text-sm text-steel-500">
            {order.status === 'paid'
              ? 'The files open in your auction page; a domain is pushed or transferred to you with the registrar\'s code — confirm there when it is in your account.'
              : 'PayPal confirms at once. A bank transfer or USDT needs the payment screenshot; the admin approves it, and the win opens by itself.'}
          </p>
          <Link href="/portal/auction" className="btn btn-dark btn-sm mt-3">Open my auction page</Link>
        </section>
      ) : null}

      {/* Paid → download */}
      {order.status === 'paid' && !order.auction_lot_id ? (
        <section className="panel mt-6 border-l-4 border-l-green-500 p-6">
          <h2 className="font-display text-lg font-extrabold">Your bundle is ready</h2>
          {bundle ? (
            <>
              <p className="mt-1 text-sm text-steel-500">Full source code, database and setup guide — one ZIP.</p>
              <a href={`/api/templates/${order.slug}/download`} className="btn btn-primary mt-4">Download bundle (.zip)</a>
              <p className="mt-2 text-xs text-steel-500">{bundle.filename} · {(bundle.size / (1024 * 1024)).toFixed(1)} MB</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-steel-500">Payment confirmed. Your bundle is being prepared and will appear here shortly — we will email you when it is ready.</p>
          )}
        </section>
      ) : null}

      {/* Pending / submitted → pay */}
      {order.status === 'pending' || order.status === 'submitted' ? (
        <div className="mt-6">
          {order.status === 'submitted' ? (
            <p className="mb-3 rounded-lg bg-[color:var(--surface)] p-3 text-sm text-steel-600">
              You submitted a payment ({order.reference}). We will confirm it within one business day and your download unlocks automatically. You can re-submit if you paid again.
            </p>
          ) : null}
          <OrderPaymentForm orderId={order.id} price={order.price} destinations={destinations} paypal={paypal} />
        </div>
      ) : null}

      {tpl ? (
        <p className="mt-6 text-sm text-steel-500">
          What you are buying: <Link href={`/templates/${tpl.slug}`} className="text-gold-500 underline">{tpl.name}</Link> — {tpl.tagline}
        </p>
      ) : null}

      {/* Admin */}
      {user.role === 'admin' ? (
        <div className="mt-6">
          {order.receipt_key ? <p className="mb-3 text-sm"><a href={`/api/orders/receipt/${order.id}`} className="font-semibold text-gold-500 underline" target="_blank" rel="noopener">View the payment screenshot</a> · {order.method} · {order.reference}</p> : order.status === 'submitted' ? <p className="mb-3 text-sm text-amber-700">No screenshot attached.</p> : null}
          <ConfirmOrderControls orderId={order.id} />
        </div>
      ) : null}
    </div>
  );
}
