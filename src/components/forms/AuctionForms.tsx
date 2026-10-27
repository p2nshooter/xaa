'use client';

import { useActionState } from 'react';
import type { ActionState, RevealState } from '@/server/actions';
import {
  adminCategoryAction, adminLotFileAction, adminLotSaveAction, adminLotStateAction, adminPayoutAction, adminProductAction, adminRelistAction, adminRevealPayoutAction,
  auctionBidAction, auctionBuyNowAction, auctionNameAction, domainClaimAction, domainVerifyAction, handoverAction, memberLotAction, payoutDetailsAction,
  relistAction, sellerPageAction,
} from '@/server/auction-actions';
import { pick, type Lang } from '@/lib/i18n';
import { Submit, Notice } from './Submit';

const euro = (n: number, lang: Lang) => `€${n.toLocaleString(lang === 'es' ? 'es-ES' : lang === 'id' ? 'id-ID' : 'en-GB')}`;

/* ---- members --------------------------------------------------------------------- */

export function AuctionNameForm({ current, lang }: { current: string; lang: Lang }) {
  const [state, act] = useActionState<ActionState, FormData>(auctionNameAction, {});
  const c = pick(lang, {
    en: { label: 'Name shown when you win or sell', hint: 'A company or personal name — no e-mail, links or phone numbers. Other bidders see only its first letter while bidding.', save: 'Save name' },
    es: { label: 'Nombre que se muestra si ganas o vendes', hint: 'Nombre de empresa o personal, sin correos, enlaces ni teléfonos. Durante la puja los demás solo ven su inicial.', save: 'Guardar nombre' },
    id: { label: 'Nama yang tampil saat Anda menang atau menjual', hint: 'Nama perusahaan atau pribadi — tanpa e-mail, tautan atau nomor telepon. Selama lelang penawar lain hanya melihat huruf pertamanya.', save: 'Simpan nama' },
  });
  return (
    <form action={act} className="flex flex-wrap items-end gap-3" data-testid="auction-name">
      <label className="field min-w-[240px] flex-1">
        <span>{c.label}</span>
        <input name="name" className="input" defaultValue={state.values?.name ?? current} maxLength={48} required />
        <small className="text-xs text-steel-500">{c.hint}</small>
      </label>
      <Submit className="btn btn-dark" pendingLabel="…">{c.save}</Submit>
      <div className="w-full"><Notice error={state.error} ok={state.ok} /></div>
    </form>
  );
}

export function BidForm({ lotId, next, buyNow, lang }: { lotId: string; next: number; buyNow: number; lang: Lang }) {
  const [state, act] = useActionState<ActionState, FormData>(auctionBidAction, {});
  const [bnState, bn] = useActionState<ActionState, FormData>(auctionBuyNowAction, {});
  const c = pick(lang, {
    en: { bid: (n: string) => `Bid ${n}`, buy: (n: string) => `Buy now for ${n}`, note: 'Every bid is the next price exactly. A bid in the last 5 minutes extends the lot by 5 minutes.' },
    es: { bid: (n: string) => `Pujar ${n}`, buy: (n: string) => `Comprar ya por ${n}`, note: 'Cada puja es exactamente el siguiente precio. Una puja en los últimos 5 minutos amplía el lote 5 minutos.' },
    id: { bid: (n: string) => `Tawar ${n}`, buy: (n: string) => `Beli langsung ${n}`, note: 'Setiap tawaran tepat di harga berikutnya. Tawaran di 5 menit terakhir memperpanjang lot 5 menit.' },
  });
  return (
    <div data-testid="bid-box">
      <div className="flex flex-wrap gap-3">
        <form action={act}>
          <input type="hidden" name="lot" value={lotId} />
          <input type="hidden" name="amount" value={next} />
          <Submit className="btn btn-primary" pendingLabel="…">{c.bid(euro(next, lang))}</Submit>
        </form>
        {buyNow ? (
          <form action={bn}>
            <input type="hidden" name="lot" value={lotId} />
            <Submit className="btn btn-ghost" pendingLabel="…">{c.buy(euro(buyNow, lang))}</Submit>
          </form>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-steel-500">{c.note}</p>
      <Notice error={state.error ?? bnState.error} ok={state.ok ?? bnState.ok} />
    </div>
  );
}

export function DomainClaimForm({ lang }: { lang: Lang }) {
  const [state, act] = useActionState<ActionState, FormData>(domainClaimAction, {});
  const c = pick(lang, {
    en: { label: 'Domain you want to sell', add: 'Get my DNS record' },
    es: { label: 'Dominio que quieres vender', add: 'Obtener mi registro DNS' },
    id: { label: 'Domain yang ingin Anda jual', add: 'Dapatkan catatan DNS saya' },
  });
  return (
    <form action={act} className="flex flex-wrap items-end gap-3" data-testid="domain-claim">
      <label className="field min-w-[240px] flex-1">
        <span>{c.label}</span>
        <input name="domain" className="input" placeholder="example.com" defaultValue={state.values?.domain} required autoComplete="off" />
      </label>
      <Submit className="btn btn-dark" pendingLabel="…">{c.add}</Submit>
      <div className="w-full"><Notice error={state.error} ok={state.ok} /></div>
    </form>
  );
}

export function DomainVerifyButton({ domain, lang }: { domain: string; lang: Lang }) {
  const [state, act] = useActionState<ActionState, FormData>(domainVerifyAction, {});
  return (
    <form action={act} className="inline-flex flex-col gap-1" data-testid="domain-verify">
      <input type="hidden" name="domain" value={domain} />
      <Submit className="btn btn-ghost btn-sm" pendingLabel="…">{pick(lang, { en: 'Check now', es: 'Comprobar', id: 'Periksa sekarang' })}</Submit>
      <Notice error={state.error} ok={state.ok} />
    </form>
  );
}

export function MemberLotForm({ domains, categories, lang }: { domains: string[]; categories: { slug: string; label: string }[]; lang: Lang }) {
  const [state, act] = useActionState<ActionState, FormData>(memberLotAction, {});
  const v = state.values ?? {};
  const c = pick(lang, {
    en: {
      domain: 'Verified domain', category: 'Category', asking: 'Asking price (€)', askingHint: 'Bids stop here; also the buy-now price if you offer it.',
      open: 'Opening bid (% of the asking price)', openHint: 'Default 35 %. Every bid adds 5 % of the opening bid.', reserve: 'Reserve (€, optional, never shown)',
      buyNow: 'Offer buy-now at the asking price', registrar: 'Registrar', expires: 'Domain expires on', age: 'Registered since (optional)', lang: 'Site language (optional, 2 letters)',
      summary: 'One-line summary', description: 'Description (traffic only if you can prove it)',
      declare: 'The domain is mine, unlocked for transfer and not in a dispute. I hand it over by EPP code or registrar push once the buyer has paid.',
      commission: 'Free to list and to relist. xaa.es takes a 30 % sales commission only if the domain sells — you receive 70 % of the final price once the buyer has the domain.',
      go: 'Start the 14-day auction',
    },
    es: {
      domain: 'Dominio verificado', category: 'Categoría', asking: 'Precio pedido (€)', askingHint: 'Las pujas se detienen aquí; también es el precio de compra inmediata si lo ofreces.',
      open: 'Puja inicial (% del precio pedido)', openHint: 'Por defecto 35 %. Cada puja suma el 5 % de la puja inicial.', reserve: 'Reserva (€, opcional, nunca se muestra)',
      buyNow: 'Ofrecer compra inmediata al precio pedido', registrar: 'Registrador', expires: 'El dominio caduca el', age: 'Registrado desde (opcional)', lang: 'Idioma del sitio (opcional, 2 letras)',
      summary: 'Resumen en una línea', description: 'Descripción (tráfico solo si puedes demostrarlo)',
      declare: 'El dominio es mío, está desbloqueado y sin disputa. Lo entrego por código EPP o push del registrador cuando el comprador haya pagado.',
      commission: 'Publicar y volver a publicar es gratis. xaa.es cobra una comisión del 30 % solo si el dominio se vende: recibes el 70 % del precio final cuando el comprador tenga el dominio.',
      go: 'Iniciar la subasta de 14 días',
    },
    id: {
      domain: 'Domain terverifikasi', category: 'Kategori', asking: 'Harga minta (€)', askingHint: 'Tawaran berhenti di sini; juga harga beli langsung bila Anda tawarkan.',
      open: 'Harga buka (% dari harga minta)', openHint: 'Bawaan 35 %. Setiap tawaran menambah 5 % dari harga buka.', reserve: 'Harga cadangan (€, opsional, tidak diumumkan)',
      buyNow: 'Tawarkan beli langsung di harga minta', registrar: 'Registrar', expires: 'Domain kedaluwarsa pada', age: 'Terdaftar sejak (opsional)', lang: 'Bahasa situs (opsional, 2 huruf)',
      summary: 'Ringkasan satu baris', description: 'Deskripsi (trafik hanya bila bisa dibuktikan)',
      declare: 'Domain ini milik saya, tidak terkunci, dan tidak dalam sengketa. Saya serahkan lewat kode EPP atau push registrar setelah pembeli membayar.',
      commission: 'Gratis memasang dan melelang ulang. xaa.es mengambil komisi penjualan 30 % hanya bila domain terjual — Anda menerima 70 % harga akhir setelah pembeli menerima domain.',
      go: 'Mulai lelang 14 hari',
    },
  });
  if (!domains.length) return null;
  return (
    <form action={act} className="grid gap-4 sm:grid-cols-2" data-testid="member-lot">
      <label className="field"><span>{c.domain}</span>
        <select name="domain" className="input" defaultValue={v.domain}>{domains.map((d) => <option key={d}>{d}</option>)}</select>
      </label>
      <label className="field"><span>{c.category}</span>
        <select name="category" className="input" defaultValue={v.category ?? 'domains'}>{categories.map((k) => <option key={k.slug} value={k.slug}>{k.label}</option>)}</select>
      </label>
      <label className="field"><span>{c.asking}</span><input name="asking" className="input" inputMode="numeric" defaultValue={v.asking} required /><small className="text-xs text-steel-500">{c.askingHint}</small></label>
      <label className="field"><span>{c.open}</span><input name="open_pct" className="input" inputMode="numeric" defaultValue={v.open_pct ?? '35'} /><small className="text-xs text-steel-500">{c.openHint}</small></label>
      <label className="field"><span>{c.reserve}</span><input name="reserve" className="input" inputMode="numeric" defaultValue={v.reserve} /></label>
      <label className="flex items-center gap-2 text-sm sm:mt-7"><input type="checkbox" name="buy_now" defaultChecked={v.buy_now === 'on'} /> {c.buyNow}</label>
      <label className="field"><span>{c.registrar}</span><input name="registrar" className="input" defaultValue={v.registrar} required /></label>
      <label className="field"><span>{c.expires}</span><input type="date" name="expires_on" className="input" defaultValue={v.expires_on} required /></label>
      <label className="field"><span>{c.age}</span><input name="age_note" className="input" defaultValue={v.age_note} /></label>
      <label className="field"><span>{c.lang}</span><input name="site_lang" className="input" maxLength={2} defaultValue={v.site_lang} /></label>
      <label className="field sm:col-span-2"><span>{c.summary}</span><input name="summary" className="input" maxLength={300} defaultValue={v.summary} /></label>
      <label className="field sm:col-span-2"><span>{c.description}</span><textarea name="description" className="input min-h-28" maxLength={5000} defaultValue={v.description} /></label>
      <p className="rounded-lg bg-[color:var(--surface)] p-3 text-sm text-steel-600 sm:col-span-2" data-testid="commission-note">{c.commission}</p>
      <label className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" name="declare" required defaultChecked={v.declare === 'on'} className="mt-1" /> {c.declare}</label>
      <div className="sm:col-span-2"><Submit className="btn btn-primary" pendingLabel="…">{c.go}</Submit></div>
      <div className="sm:col-span-2"><Notice error={state.error} ok={state.ok} /></div>
    </form>
  );
}

export function RelistForm({ lotId, asking, lang }: { lotId: string; asking: number; lang: Lang }) {
  const [state, act] = useActionState<ActionState, FormData>(relistAction, {});
  const c = pick(lang, {
    en: { price: 'Asking price (keep or lower)', go: 'Relist for 14 more days' },
    es: { price: 'Precio pedido (igual o menor)', go: 'Volver a subastar 14 días' },
    id: { price: 'Harga minta (tetap atau turun)', go: 'Lelang ulang 14 hari' },
  });
  return (
    <form action={act} className="flex flex-wrap items-end gap-2" data-testid="relist">
      <input type="hidden" name="lot" value={lotId} />
      <label className="field"><span className="text-xs">{c.price}</span><input name="asking" className="input input-sm w-32" inputMode="numeric" defaultValue={asking} /></label>
      <Submit className="btn btn-dark btn-sm" pendingLabel="…">{c.go}</Submit>
      <Notice error={state.error} ok={state.ok} />
    </form>
  );
}

export function PayoutDetailsForm({ method, lang }: { method: string; lang: Lang }) {
  const [state, act] = useActionState<ActionState, FormData>(payoutDetailsAction, {});
  const c = pick(lang, {
    en: { how: 'How you are paid your 70 %', bank: 'Bank transfer', details: 'Account details (bank, IBAN/account, SWIFT, name — or PayPal e-mail — or USDT address and network)', save: 'Save (encrypted)', saved: 'Saved method' },
    es: { how: 'Cómo recibes tu 70 %', bank: 'Transferencia bancaria', details: 'Datos (banco, IBAN/cuenta, SWIFT, titular — o correo PayPal — o dirección USDT y red)', save: 'Guardar (cifrado)', saved: 'Método guardado' },
    id: { how: 'Cara Anda menerima 70 %', bank: 'Transfer bank', details: 'Data rekening (bank, nomor rekening/IBAN, SWIFT, nama — atau e-mail PayPal — atau alamat USDT dan jaringannya)', save: 'Simpan (terenkripsi)', saved: 'Metode tersimpan' },
  });
  return (
    <form action={act} className="grid gap-3" data-testid="payout-details">
      <label className="field"><span>{c.how}</span>
        <select name="method" className="input" defaultValue={method || 'bank'}>
          <option value="bank">{c.bank}</option><option value="paypal">PayPal</option><option value="usdt">USDT</option>
        </select>
      </label>
      <label className="field"><span>{c.details}</span><textarea name="details" className="input min-h-20" required autoComplete="off" /></label>
      {method ? <p className="text-xs text-steel-500">{c.saved}: {method}</p> : null}
      <div><Submit className="btn btn-dark btn-sm" pendingLabel="…">{c.save}</Submit></div>
      <Notice error={state.error} ok={state.ok} />
    </form>
  );
}

export function SellerPageToggle({ on, lang }: { on: boolean; lang: Lang }) {
  const [state, act] = useActionState<ActionState, FormData>(sellerPageAction, {});
  return (
    <form action={act} className="inline-flex items-center gap-2">
      <input type="hidden" name="on" value={on ? 'no' : 'yes'} />
      <Submit className="btn btn-ghost btn-sm" pendingLabel="…">
        {on ? pick(lang, { en: 'Hide my seller page', es: 'Ocultar mi página de vendedor', id: 'Sembunyikan halaman penjual saya' }) : pick(lang, { en: 'Show my seller page', es: 'Mostrar mi página de vendedor', id: 'Tampilkan halaman penjual saya' })}
      </Submit>
      <Notice error={state.error} />
    </form>
  );
}

export function HandoverButton({ lotId, step, label }: { lotId: string; step: 'epp' | 'received'; label: string }) {
  const [state, act] = useActionState<ActionState, FormData>(handoverAction, {});
  return (
    <form action={act} className="inline-flex flex-col gap-1" data-testid={`handover-${step}`}>
      <input type="hidden" name="lot" value={lotId} />
      <input type="hidden" name="step" value={step} />
      <Submit className="btn btn-dark btn-sm" pendingLabel="…">{label}</Submit>
      <Notice error={state.error} ok={state.ok} />
    </form>
  );
}

/* ---- the Studio desk ---------------------------------------------------------------- */

export interface AdminLotFields {
  id?: string; type?: string; category?: string; title?: string; summary?: string; description?: string; demo_url?: string; stack?: string; size_note?: string;
  age_note?: string; site_lang?: string; domain?: string; domain_note?: string; traffic?: string; traffic_verified?: boolean; handover?: string[];
  normal_eur?: number; open_eur?: number; step_eur?: number; reserve_eur?: number; buy_now_eur?: number;
}

export function AdminLotForm({ lot, categories }: { lot?: AdminLotFields; categories: { slug: string; label: string }[] }) {
  const [state, act] = useActionState<ActionState, FormData>(adminLotSaveAction, {});
  const l = lot ?? {};
  return (
    <form action={act} className="grid gap-3 sm:grid-cols-2" data-testid="admin-lot-form">
      {l.id ? <input type="hidden" name="id" value={l.id} /> : null}
      <label className="field"><span>Type</span>
        <select name="type" className="input" defaultValue={l.type ?? 'website'}>
          <option value="website">Finished website</option><option value="script">Web / script only</option>
          <option value="website_domain">Website + domain (admin only)</option><option value="domain">Domain only</option>
        </select>
      </label>
      <label className="field"><span>Category</span>
        <select name="category" className="input" defaultValue={l.category ?? 'article-sites'}>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}</select>
      </label>
      <label className="field sm:col-span-2"><span>Title</span><input name="title" className="input" defaultValue={l.title} required /></label>
      <label className="field sm:col-span-2"><span>Summary</span><input name="summary" className="input" defaultValue={l.summary} /></label>
      <label className="field sm:col-span-2"><span>Description</span><textarea name="description" className="input min-h-28" defaultValue={l.description} /></label>
      <label className="field"><span>Demo URL</span><input name="demo_url" className="input" defaultValue={l.demo_url} /></label>
      <label className="field"><span>Stack</span><input name="stack" className="input" defaultValue={l.stack} /></label>
      <label className="field"><span>Size (pages / articles / products)</span><input name="size_note" className="input" defaultValue={l.size_note} /></label>
      <label className="field"><span>Age</span><input name="age_note" className="input" defaultValue={l.age_note} /></label>
      <label className="field"><span>Language (2 letters)</span><input name="site_lang" className="input" maxLength={2} defaultValue={l.site_lang} /></label>
      <label className="field"><span>Domain (website + domain, domain only)</span><input name="domain" className="input" defaultValue={l.domain} /></label>
      <label className="field sm:col-span-2"><span>Domain note (registrar, age, renewal)</span><input name="domain_note" className="input" defaultValue={l.domain_note} /></label>
      <label className="field sm:col-span-2"><span>Traffic / revenue (only verified figures)</span><input name="traffic" className="input" defaultValue={l.traffic} /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="traffic_verified" defaultChecked={l.traffic_verified} /> Verified by the admin (screenshots kept)</label>
      <label className="field sm:col-span-2"><span>Handover checklist (one per line)</span><textarea name="handover" className="input min-h-20" defaultValue={(l.handover ?? []).join('\n')} /></label>
      <label className="field"><span>Normal price / valuation (€)</span><input name="normal" className="input" inputMode="numeric" defaultValue={l.normal_eur} required /></label>
      <label className="field"><span>Opening bid (€, empty = 35 %)</span><input name="open" className="input" inputMode="numeric" defaultValue={l.open_eur || ''} /></label>
      <label className="field"><span>Raise per bid (€, empty = 5 % of the opening)</span><input name="step" className="input" inputMode="numeric" defaultValue={l.step_eur || ''} /></label>
      <label className="field"><span>Reserve (€, optional, hidden)</span><input name="reserve" className="input" inputMode="numeric" defaultValue={l.reserve_eur || ''} /></label>
      <label className="field"><span>Buy-now (€, optional)</span><input name="buy_now" className="input" inputMode="numeric" defaultValue={l.buy_now_eur || ''} /></label>
      <div className="sm:col-span-2"><Submit className="btn btn-primary" pendingLabel="Saving…">{l.id ? 'Save lot' : 'Create draft'}</Submit></div>
      <div className="sm:col-span-2"><Notice error={state.error} ok={state.ok} /></div>
    </form>
  );
}

export function AdminLotStateButton({ id, op, label, confirm }: { id: string; op: 'start' | 'cancel' | 'pass'; label: string; confirm?: boolean }) {
  const [state, act] = useActionState<ActionState, FormData>(adminLotStateAction, {});
  return (
    <form action={act} className="inline-flex flex-col gap-1" onSubmit={(e) => { if (confirm && !window.confirm(`${label}?`)) e.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="op" value={op} />
      <Submit className={op === 'start' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'} pendingLabel="…">{label}</Submit>
      <Notice error={state.error} ok={state.ok} />
    </form>
  );
}

export function AdminRelistButton({ id }: { id: string }) {
  const [state, act] = useActionState<ActionState, FormData>(adminRelistAction, {});
  return (
    <form action={act} className="inline-flex flex-col gap-1">
      <input type="hidden" name="id" value={id} />
      <Submit className="btn btn-dark btn-sm" pendingLabel="…">Relist 14 days</Submit>
      <Notice error={state.error} ok={state.ok} />
    </form>
  );
}

export function AdminProductToggle({ slug, on }: { slug: string; on: boolean }) {
  const [state, act] = useActionState<ActionState, FormData>(adminProductAction, {});
  return (
    <form action={act} className="inline-flex items-center gap-2" data-testid={`product-${slug}`}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="on" value={on ? 'no' : 'yes'} />
      <span className={on ? 'badge badge-green' : 'badge badge-grey'}>{on ? 'Automatic' : 'Off'}</span>
      <Submit className="btn btn-ghost btn-sm" pendingLabel="…">{on ? 'Switch off' : 'Switch on'}</Submit>
      <Notice error={state.error} />
    </form>
  );
}

export function AdminPayoutForm({ lotId }: { lotId: string }) {
  const [state, act] = useActionState<ActionState, FormData>(adminPayoutAction, {});
  return (
    <form action={act} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="lot" value={lotId} />
      <select name="method" className="input input-sm"><option value="bank">Bank</option><option value="paypal">PayPal</option><option value="usdt">USDT</option></select>
      <input name="reference" className="input input-sm" placeholder="Transfer reference" required />
      <Submit className="btn btn-dark btn-sm" pendingLabel="…">Mark paid</Submit>
      <Notice error={state.error} ok={state.ok} />
    </form>
  );
}

export function RevealPayoutButton({ userId }: { userId: string }) {
  const [state, act] = useActionState<RevealState, FormData>(adminRevealPayoutAction, {});
  return (
    <form action={act} className="inline-flex flex-col gap-1">
      <input type="hidden" name="user" value={userId} />
      <Submit className="btn btn-ghost btn-sm" pendingLabel="…">Reveal payout details</Submit>
      {state.value ? <pre className="whitespace-pre-wrap rounded bg-[color:var(--surface)] p-2 text-xs">{state.value}</pre> : null}
      <Notice error={state.error} />
    </form>
  );
}

export function AdminLotFileForm({ id, kind }: { id: string; kind: 'image' | 'archive' }) {
  const [state, act] = useActionState<ActionState, FormData>(adminLotFileAction, {});
  return (
    <form action={act} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="kind" value={kind} />
      <input type="file" name="file" accept={kind === 'image' ? 'image/*' : '.zip,.tar.gz,.tgz,.7z'} className="text-xs" required />
      <Submit className="btn btn-ghost btn-sm" pendingLabel="Uploading…">{kind === 'image' ? 'Add image' : 'Upload archive'}</Submit>
      <Notice error={state.error} ok={state.ok} />
    </form>
  );
}

export function AdminCategoryForm({ cat }: { cat?: { slug: string; group: string; en: string; es: string; id: string; hidden: boolean; order: number } }) {
  const [state, act] = useActionState<ActionState, FormData>(adminCategoryAction, {});
  return (
    <form action={act} className="grid gap-2 text-sm sm:grid-cols-[repeat(7,minmax(0,1fr))]">
      <input name="slug" className="input input-sm" placeholder="slug" defaultValue={cat?.slug} readOnly={!!cat} required />
      <select name="group" className="input input-sm" defaultValue={cat?.group ?? 'other'}><option value="articles">articles</option><option value="saas">saas</option><option value="ecommerce">ecommerce</option><option value="other">other</option></select>
      <input name="en" className="input input-sm" placeholder="English" defaultValue={cat?.en} required />
      <input name="es" className="input input-sm" placeholder="Español" defaultValue={cat?.es} />
      <input name="id" className="input input-sm" placeholder="Indonesia" defaultValue={cat?.id} />
      <label className="flex items-center gap-1 text-xs"><input type="checkbox" name="hidden" defaultChecked={cat?.hidden} /> hidden <input name="order" className="input input-sm ml-1 w-14" defaultValue={cat?.order ?? 99} /></label>
      <Submit className="btn btn-ghost btn-sm" pendingLabel="…">{cat ? 'Save' : 'Add category'}</Submit>
      <div className="sm:col-span-7"><Notice error={state.error} ok={state.ok} /></div>
    </form>
  );
}

