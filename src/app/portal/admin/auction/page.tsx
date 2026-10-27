import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { portalReady } from '@/server/db';
import { countNewLeads } from '@/server/leads';
import { AdminNav } from '@/components/AdminNav';
import { DbNotice } from '@/components/DbNotice';
import { soft, type Problems } from '@/server/soft';
import { autoProducts, deskLots, deskPayouts, listCategories, type AuctionLot, type AuctionPayout } from '@/server/auction';
import { cycleEndAfter, hasCode, hasDomain } from '@/server/auction-terms';
import {
  AdminCategoryForm, AdminLotFileForm, AdminLotForm, AdminLotStateButton, AdminPayoutForm, AdminProductToggle, AdminRelistButton, HandoverButton, RevealPayoutButton,
} from '@/components/forms/AuctionForms';

export const metadata: Metadata = { title: 'Auction desk', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const STATUS_BADGE: Record<string, string> = { draft: 'badge-grey', open: 'badge-blue', awaiting_payment: 'badge-amber', sold: 'badge-green', unsold: 'badge-grey', cancelled: 'badge-grey' };
const eur = (n: number) => `€${n.toLocaleString('en-GB')}`;
const when = (iso: string) => (iso ? iso.slice(0, 16).replace('T', ' ') : '—');

/**
 * Studio desk → Auction (docs/BLUEPRINT.md §10.12): xaa.es's automatic products, lots of every type (a website
 * with its domain is the admin's alone), members' lots (withdraw with a reason), unpaid wins (pass on), the
 * domain hand-over, and the members' payouts (70 % after the buyer confirms the domain; 30 % commission).
 */
export default async function AuctionDeskPage() {
  if (!(await portalReady())) redirect('/portal');
  const user = await currentUser();
  if (!user) redirect('/login?next=/portal/admin/auction');
  if (user.role !== 'admin') redirect('/portal');

  const problems: Problems = [];
  const [lots, payouts, products, categories, newLeads] = await Promise.all([
    soft(problems, () => deskLots(), [] as AuctionLot[]),
    soft(problems, () => deskPayouts(), [] as AuctionPayout[]),
    soft(problems, () => autoProducts(), [] as Awaited<ReturnType<typeof autoProducts>>),
    soft(problems, () => listCategories(undefined, true), []),
    soft(problems, () => countNewLeads(), 0),
  ]);
  const cats = categories.map((c) => ({ slug: c.slug, label: c.en }));
  const live = lots.filter((l) => l.status === 'open').length;
  const unpaid = lots.filter((l) => l.status === 'awaiting_payment').length;
  const commission = payouts.reduce((s, p) => s + p.commission_eur, 0);
  const due = payouts.filter((p) => p.status === 'due');

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="eyebrow">Studio desk</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">Auction</h1>
      <p className="mt-2 text-sm text-steel-500">
        {live} running · {unpaid} won and not paid yet · {due.length} payout(s) due · {eur(commission)} sales commission recorded. This round of xaa.es products ends {when(new Date(cycleEndAfter(Date.now())).toISOString())} UTC.{' '}
        <Link href="/auction" className="underline">Public page</Link>
      </p>
      <div className="mt-8"><AdminNav current="/portal/admin/auction" newLeads={newLeads} /></div>
      <DbNotice problems={problems} />

      <section className="panel p-5" data-testid="auto-products">
        <h2 className="font-display text-xl font-extrabold">xaa.es products — automatic every round</h2>
        <p className="mt-1 text-sm text-steel-500">Catalogue templates whose code bundle is uploaded go up by themselves from Friday 07:00 WIB to Friday 07:00 WIB, opening at 35 % of the catalogue price, each bid +5 % of the opening bid. A template without a bundle is never auctioned.</p>
        {products.length ? (
          <ul className="mt-4 divide-y divide-[color:var(--line)]">
            {products.map((p) => <li key={p.slug} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm"><span><b>{p.name}</b> · catalogue {eur(p.price)} · opens {eur(Math.ceil(p.price * 0.35))}</span><AdminProductToggle slug={p.slug} on={p.on} /></li>)}
          </ul>
        ) : <p className="mt-3 text-sm text-steel-500">No template has an uploaded bundle yet (Settings → template bundles).</p>}
      </section>

      <section className="panel mt-8 p-5">
        <h2 className="font-display text-xl font-extrabold">New lot</h2>
        <p className="mt-1 text-sm text-steel-500">A draft first; start it when the description, images and archive are ready — it then runs exactly 14 days.</p>
        <div className="mt-4"><AdminLotForm categories={cats} /></div>
      </section>

      <section className="mt-10" data-testid="desk-lots">
        <h2 className="font-display text-xl font-extrabold">Lots ({lots.length})</h2>
        <ul className="mt-4 space-y-3">
          {lots.map((l) => (
            <li key={l.id} className="panel p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className={`badge ${STATUS_BADGE[l.status]}`}>{l.status.replace('_', ' ')}</span>{' '}
                  <Link href={`/auction/${l.ref}`} className="font-semibold underline">{l.domain || l.title}</Link>
                  <span className="ml-2 font-mono text-xs text-steel-500">{l.ref} · {l.type} · {l.seller === 'member' ? `member: ${l.seller_name}` : l.seller}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {l.status === 'draft' ? <AdminLotStateButton id={l.id} op="start" label="Start (14 days)" /> : null}
                  {l.status === 'awaiting_payment' ? <AdminLotStateButton id={l.id} op="pass" label="Pass to the next bidder" confirm /> : null}
                  {l.status === 'unsold' && !l.relisted_to && l.seller !== 'xaa' ? <AdminRelistButton id={l.id} /> : null}
                  {l.status !== 'sold' && l.status !== 'cancelled' ? <AdminLotStateButton id={l.id} op="cancel" label="Withdraw" confirm /> : null}
                </div>
              </div>
              <p className="mt-2 text-xs text-steel-500">
                Price {eur(l.normal_eur)} · opens {eur(l.open_eur)} · +{eur(l.step_eur)}{l.reserve_eur ? ` · reserve ${eur(l.reserve_eur)}` : ''}{l.buy_now_eur ? ` · buy now ${eur(l.buy_now_eur)}` : ''} · {l.bids_count} bid(s){l.bids_count ? `, high ${eur(l.high_eur)} by ${l.high_name}` : ''} · {when(l.starts_at)} → {when(l.ends_at)} UTC
                {l.winner_user ? ` · winner ${l.winner_name} ${eur(l.winner_eur)}${l.order_id ? ` (order ${l.order_id})` : ''}` : ''}
                {l.cancel_reason ? ` · withdrawn: ${l.cancel_reason}` : ''}
              </p>
              {l.status === 'sold' && hasDomain(l.type) ? (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span>Hand-over: {l.epp_sent_at ? `code sent ${when(l.epp_sent_at)}` : 'code not sent'} · {l.domain_received_at ? `received ${when(l.domain_received_at)}` : 'not confirmed'}</span>
                  {!l.epp_sent_at ? <HandoverButton lotId={l.id} step="epp" label="Mark code sent" /> : null}
                  {!l.domain_received_at ? <HandoverButton lotId={l.id} step="received" label="Mark received" /> : null}
                </div>
              ) : null}
              {(l.status === 'draft' || (l.status === 'open' && l.seller !== 'member')) ? (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold">Edit, images{hasCode(l.type) ? ', archive' : ''}</summary>
                  <div className="mt-3 space-y-3">
                    <AdminLotForm lot={l} categories={cats} />
                    <AdminLotFileForm id={l.id} kind="image" />
                    {hasCode(l.type) ? <AdminLotFileForm id={l.id} kind="archive" /> : null}
                    {l.archive_name ? <p className="text-xs text-steel-500">Archive: {l.archive_name} ({Math.round(l.archive_size / 1024)} KB)</p> : null}
                  </div>
                </details>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" data-testid="desk-payouts">
        <h2 className="font-display text-xl font-extrabold">Members' payouts</h2>
        <p className="mt-1 text-sm text-steel-500">70 % of a member's sold domain, due once the buyer confirms the domain arrived (or you mark it received); the 30 % sales commission stays with xaa.es.</p>
        {payouts.length ? (
          <ul className="mt-4 space-y-3">
            {payouts.map((p) => (
              <li key={p.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <span><b>{p.domain}</b> · final {eur(p.final_eur)} · commission {eur(p.commission_eur)} · seller {eur(p.seller_eur)} · <span className="badge badge-grey">{p.status.replace('_', ' ')}</span>{p.paid_at ? ` ${when(p.paid_at)} ${p.method} ${p.reference}` : ''}</span>
                {p.status === 'due' ? <span className="flex flex-wrap items-center gap-2"><RevealPayoutButton userId={p.seller_user} /><AdminPayoutForm lotId={p.lot_id} /></span> : null}
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-steel-500">No payouts yet.</p>}
      </section>

      <section className="panel mt-10 p-5">
        <h2 className="font-display text-xl font-extrabold">Categories</h2>
        <div className="mt-4 space-y-2">
          {categories.map((c) => <AdminCategoryForm key={c.slug} cat={c} />)}
          <AdminCategoryForm />
        </div>
      </section>
    </div>
  );
}
