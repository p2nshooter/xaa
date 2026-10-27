import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';
import { pageMetadata, absUrl } from '@/lib/seo';
import { jsonLdHtml } from '@/lib/json-ld';
import { leftText } from '@/lib/time-left';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Countdown } from '@/components/Countdown';
import { euroIn, TYPE_LABEL } from '@/components/AuctionCards';
import { BidForm } from '@/components/forms/AuctionForms';
import { currentUser } from '@/server/auth';
import { getBidder, getLotByRef, lotBids, settleDue } from '@/server/auction';
import { maskName, nextBid } from '@/server/auction-terms';

/** One lot: what the winner receives, the price and bid history (names masked), and the bid form for signed-in members. */

export const dynamic = 'force-dynamic';
type P = Promise<{ ref: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const { ref } = await params;
  const lot = await getLotByRef(ref).catch(() => null);
  if (!lot || lot.status === 'draft') return { title: 'Lot', robots: { index: false } };
  const name = lot.domain || lot.title;
  const what = { en: 'Auction', es: 'Subasta', id: 'Lelang' };
  const title = (l: 'en' | 'es' | 'id') => `${name} — ${what[l]}`.slice(0, 52); // room for the " · XAA" template
  const desc = (l: 'en' | 'es' | 'id') =>
    (lot.summary || pick(l, { en: `${name} in the xaa.es auction: 14 days, opening at €${lot.open_eur}, every bid +€${lot.step_eur}.`, es: `${name} en la subasta de xaa.es: 14 días, desde ${lot.open_eur} €, cada puja +${lot.step_eur} €.`, id: `${name} di lelang xaa.es: 14 hari, buka €${lot.open_eur}, setiap tawaran +€${lot.step_eur}.` })).slice(0, 160);
  return pageMetadata({
    path: `/auction/${lot.ref}`,
    copy: { en: { title: title('en'), description: desc('en') }, es: { title: title('es'), description: desc('es') }, id: { title: title('id'), description: desc('id') } },
    absoluteTitle: false,
    noindex: lot.status !== 'open',
  });
}

export default async function LotPage({ params }: { params: P }) {
  const { ref } = await params;
  await settleDue().catch(() => 0);
  const lot = await getLotByRef(ref).catch(() => null);
  if (!lot || lot.status === 'draft') notFound();
  const lang = await getLang();
  const user = await currentUser().catch(() => null);
  const [bids, bidder] = await Promise.all([lotBids(lot.id), user ? getBidder(user.id) : Promise.resolve(null)]);
  const nowMs = Date.now();
  const live = lot.status === 'open' && Date.parse(lot.starts_at) <= nowMs && Date.parse(lot.ends_at) > nowMs;
  const name = lot.domain || lot.title;
  const c = pick(lang, COPY);
  const next = nextBid(lot);
  const buyNow = lot.buy_now_eur && lot.high_eur < lot.buy_now_eur ? lot.buy_now_eur : 0;

  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name, description: lot.summary || lot.description.slice(0, 300) || name,
    ...(lot.images[0] ? { image: absUrl(`/api/auction/image/${lot.id}/0`) } : {}), brand: { '@type': 'Organization', name: lot.seller === 'member' ? lot.seller_name : 'XAA.es' },
    offers: {
      '@type': 'Offer', priceCurrency: 'EUR', price: lot.bids_count ? lot.high_eur : lot.open_eur, url: absUrl(`/auction/${lot.ref}`), priceValidUntil: lot.ends_at.slice(0, 10),
      availability: live ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut', seller: { '@type': 'Organization', name: 'XAA.es' },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(ld) }} />
      <Breadcrumbs trail={[{ k: 'nav.auction', href: '/auction' }, { label: name }]} />
      <article className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 pt-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <p className="font-mono text-xs text-steel-500">{lot.ref} · {pick(lang, TYPE_LABEL[lot.type]!)}</p>
          <h1 className="mt-1 break-words font-display text-4xl font-extrabold tracking-tight" data-testid="lot-title">{name}</h1>
          {lot.domain && lot.title !== lot.domain ? <p className="mt-1 text-lg text-steel-600">{lot.title}</p> : null}
          {lot.summary ? <p className="mt-4 text-lg text-steel-600">{lot.summary}</p> : null}

          {lot.images.length ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {lot.images.map((_, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={`/api/auction/image/${lot.id}/${i}`} alt={`${name} — ${i + 1}`} className="w-full rounded-xl border border-[color:var(--line)]" loading={i ? 'lazy' : 'eager'} />
              ))}
            </div>
          ) : null}

          <dl className="panel mt-6 grid gap-4 p-5 text-sm sm:grid-cols-2">
            <Row k={c.seller} v={lot.seller === 'member' ? <>{lot.seller_name} · <span className="text-steel-500">{c.dnsVerified}</span></> : 'XAA.es'} />
            {lot.demo_url ? <Row k={c.demo} v={<a href={lot.demo_url} className="underline" rel="noopener nofollow" target="_blank">{lot.demo_url.replace(/^https?:\/\//, '')}</a>} /> : null}
            {lot.stack ? <Row k={c.stack} v={lot.stack} /> : null}
            {lot.size_note ? <Row k={c.size} v={lot.size_note} /> : null}
            {lot.age_note ? <Row k={c.age} v={lot.age_note} /> : null}
            {lot.site_lang ? <Row k={c.lang} v={lot.site_lang.toUpperCase()} /> : null}
            {lot.registrar ? <Row k={c.registrar} v={lot.registrar} /> : null}
            {lot.expires_on ? <Row k={c.expires} v={lot.expires_on} /> : null}
            {lot.domain_note ? <Row k={c.domainNote} v={lot.domain_note} /> : null}
            <Row k={c.traffic} v={lot.traffic && lot.traffic_verified ? <>{lot.traffic} <span className="badge badge-green ml-1">{c.verified}</span></> : c.noData} />
          </dl>

          {lot.description ? <div className="prose mt-6 max-w-none whitespace-pre-line text-steel-700">{lot.description}</div> : null}

          {lot.handover.length ? (
            <section className="mt-6"><h2 className="font-display text-xl font-extrabold">{c.receive}</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{lot.handover.map((h) => <li key={h}>{h}</li>)}</ul>
            </section>
          ) : null}

          <section className="mt-8" data-testid="bid-history">
            <h2 className="font-display text-xl font-extrabold">{c.history} ({bids.length})</h2>
            {bids.length ? (
              <ol className="mt-3 divide-y divide-[color:var(--line)] rounded-xl border border-[color:var(--line)] text-sm">
                {bids.slice(0, 50).map((b) => (
                  <li key={b.id} className="flex justify-between gap-3 px-4 py-2"><span>{maskName(b.name)}{b.buy_now ? ` · ${c.bought}` : ''}</span><span className="tabular-nums">{euroIn(b.amount_eur, lang)} · {b.created_at.slice(0, 16).replace('T', ' ')} UTC</span></li>
                ))}
              </ol>
            ) : <p className="mt-2 text-sm text-steel-500">{c.noBids}</p>}
          </section>
        </div>

        {/* On a phone the price and the bid form come first; on a wide screen they sit beside the details. */}
        <aside className="order-first lg:order-none lg:sticky lg:top-28 lg:h-fit">
          <div className="panel p-5" data-testid="lot-price">
            <p className="text-xs font-bold uppercase tracking-wider text-steel-400">{lot.bids_count ? c.current : c.opening}</p>
            <p className="mt-1 font-display text-4xl font-extrabold">{euroIn(lot.bids_count ? lot.high_eur : lot.open_eur, lang)}</p>
            <p className="mt-1 text-sm text-steel-500">{c.step(euroIn(lot.step_eur, lang))} · {c.full(euroIn(lot.normal_eur, lang))}</p>
            {lot.reserve_eur ? <p className="mt-1 text-xs text-steel-500">{lot.high_eur >= lot.reserve_eur ? c.reserveMet : c.reserveNot}</p> : <p className="mt-1 text-xs text-steel-500">{c.noReserve}</p>}
            <p className="mt-4 text-sm">{live ? c.endsIn : c.ended}{live ? <> <Countdown to={lot.ends_at} ended={c.ended} initial={leftText(Date.parse(lot.ends_at) - nowMs)} /></> : null}</p>
            <p className="text-xs text-steel-500">{lot.ends_at.slice(0, 16).replace('T', ' ')} UTC</p>

            <div className="mt-5 border-t border-[color:var(--line)] pt-5">
              {!live ? (
                <p className="text-sm" data-testid="lot-outcome">
                  {lot.status === 'sold' ? c.soldTo(lot.winner_name, euroIn(lot.winner_eur, lang)) : lot.status === 'awaiting_payment' ? c.wonBy(lot.winner_name, euroIn(lot.winner_eur, lang)) : lot.status === 'unsold' ? c.unsold : lot.status === 'cancelled' ? c.cancelled : c.notStarted}
                </p>
              ) : !user ? (
                <Link href={`/login?next=${encodeURIComponent(`/auction/${lot.ref}`)}`} className="btn btn-primary w-full">{c.signIn}</Link>
              ) : user.role === 'admin' ? (
                <p className="text-sm text-steel-500">{c.admin}</p>
              ) : lot.seller_user === user.id ? (
                <p className="text-sm text-steel-500">{c.own}</p>
              ) : !bidder?.display_name ? (
                <Link href="/portal/auction" className="btn btn-dark w-full">{c.chooseName}</Link>
              ) : lot.high_user === user.id ? (
                <p className="text-sm font-semibold text-emerald-700" data-testid="you-lead">{c.youLead}</p>
              ) : (
                <BidForm lotId={lot.id} next={next} buyNow={buyNow} lang={lang} />
              )}
            </div>
          </div>
          <p className="mt-3 text-xs text-steel-500">{c.payNote}</p>
          {lot.seller === 'member' ? <p className="mt-2 text-xs text-steel-500">{c.escrow}</p> : null}
        </aside>
      </article>
    </>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div><dt className="text-xs font-bold uppercase tracking-wide text-steel-400">{k}</dt><dd className="mt-0.5">{v}</dd></div>;
}

const COPY = {
  en: {
    seller: 'Seller', dnsVerified: 'domain verified in DNS', demo: 'Demo', stack: 'Stack', size: 'Size', age: 'Age', lang: 'Language', registrar: 'Registrar', expires: 'Registered until', domainNote: 'Domain',
    traffic: 'Traffic / revenue', verified: 'verified', noData: 'No verified data yet', receive: 'What the winner receives', history: 'Bids', bought: 'buy now', noBids: 'No bids yet — the opening bid takes the lead.',
    current: 'Current bid', opening: 'Opening bid', step: (s: string) => `Each bid +${s}`, full: (s: string) => `bids stop at ${s}`, reserveMet: 'Reserve met', reserveNot: 'Reserve not met yet', noReserve: 'No reserve',
    endsIn: 'Ends in', ended: 'Ended', soldTo: (n: string, p: string) => `Sold to ${n} for ${p}.`, wonBy: (n: string, p: string) => `Won by ${n} at ${p} — not paid yet.`, unsold: 'Ended unsold. The seller may relist it.',
    cancelled: 'This lot was withdrawn.', notStarted: 'Not started yet.', signIn: 'Sign in to bid', admin: 'Admin accounts run the auction and do not bid.', own: 'This is your lot — follow it in your portal.',
    chooseName: 'Choose your bidder name', youLead: 'You have the highest bid.', payNote: 'The winner pays from the portal: PayPal confirms at once; a bank transfer or USDT needs the payment screenshot and the admin’s approval. What you won opens once it is paid.',
    escrow: 'A member’s domain: you pay xaa.es, the seller transfers the domain to you, and the seller is paid once you confirm it is in your account.',
  },
  es: {
    seller: 'Vendedor', dnsVerified: 'dominio verificado en DNS', demo: 'Demo', stack: 'Tecnología', size: 'Tamaño', age: 'Antigüedad', lang: 'Idioma', registrar: 'Registrador', expires: 'Registrado hasta', domainNote: 'Dominio',
    traffic: 'Tráfico / ingresos', verified: 'verificado', noData: 'Aún sin datos verificados', receive: 'Qué recibe el ganador', history: 'Pujas', bought: 'compra ya', noBids: 'Aún sin pujas: la puja inicial toma la delantera.',
    current: 'Puja actual', opening: 'Puja inicial', step: (s: string) => `Cada puja +${s}`, full: (s: string) => `las pujas se detienen en ${s}`, reserveMet: 'Reserva alcanzada', reserveNot: 'Reserva aún no alcanzada', noReserve: 'Sin reserva',
    endsIn: 'Termina en', ended: 'Terminado', soldTo: (n: string, p: string) => `Vendido a ${n} por ${p}.`, wonBy: (n: string, p: string) => `Ganado por ${n} a ${p}: aún sin pagar.`, unsold: 'Terminó sin venderse. El vendedor puede volver a subastarlo.',
    cancelled: 'Este lote se retiró.', notStarted: 'Aún no ha empezado.', signIn: 'Entra para pujar', admin: 'Las cuentas de administrador gestionan la subasta y no pujan.', own: 'Es tu lote: síguelo desde tu portal.',
    chooseName: 'Elige tu nombre de pujador', youLead: 'Tienes la puja más alta.', payNote: 'El ganador paga desde el portal: PayPal se confirma al instante; una transferencia o USDT necesita la captura del pago y la aprobación del administrador. Lo ganado se abre al pagar.',
    escrow: 'Dominio de un miembro: pagas a xaa.es, el vendedor te transfiere el dominio y cobra cuando confirmas que está en tu cuenta.',
  },
  id: {
    seller: 'Penjual', dnsVerified: 'domain terverifikasi di DNS', demo: 'Demo', stack: 'Teknologi', size: 'Ukuran', age: 'Usia', lang: 'Bahasa', registrar: 'Registrar', expires: 'Terdaftar sampai', domainNote: 'Domain',
    traffic: 'Trafik / pendapatan', verified: 'terverifikasi', noData: 'Belum ada data terverifikasi', receive: 'Yang diterima pemenang', history: 'Tawaran', bought: 'beli langsung', noBids: 'Belum ada tawaran — harga buka langsung memimpin.',
    current: 'Tawaran saat ini', opening: 'Harga buka', step: (s: string) => `Setiap tawaran +${s}`, full: (s: string) => `tawaran berhenti di ${s}`, reserveMet: 'Harga cadangan tercapai', reserveNot: 'Harga cadangan belum tercapai', noReserve: 'Tanpa harga cadangan',
    endsIn: 'Berakhir dalam', ended: 'Berakhir', soldTo: (n: string, p: string) => `Terjual ke ${n} seharga ${p}.`, wonBy: (n: string, p: string) => `Dimenangkan ${n} di ${p} — belum membayar.`, unsold: 'Berakhir tidak terjual. Penjual bisa melelang ulang.',
    cancelled: 'Lot ini ditarik.', notStarted: 'Belum dimulai.', signIn: 'Masuk untuk menawar', admin: 'Akun admin menjalankan lelang dan tidak ikut menawar.', own: 'Ini lot Anda — pantau dari portal.',
    chooseName: 'Pilih nama penawar Anda', youLead: 'Anda penawar tertinggi.', payNote: 'Pemenang membayar dari portal: PayPal langsung terkonfirmasi; transfer bank atau USDT perlu bukti bayar dan persetujuan admin. Kemenangan terbuka setelah lunas.',
    escrow: 'Domain anggota: Anda membayar ke xaa.es, penjual memindahkan domain ke Anda, dan penjual dibayar setelah Anda mengonfirmasi domain sudah masuk ke akun Anda.',
  },
} satisfies Record<Lang, unknown>;
