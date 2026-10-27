import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LotCardView } from '@/components/AuctionCards';
import { sellerPage } from '@/server/auction';
import { filterLots, parseLotFilter } from '@/server/auction-terms';

/**
 * A member's seller page (blueprint §10.7, the "template like sedo.com" of request 59): the domains they have in
 * the auction right now, ending soonest first, under xaa.es's own design. Members switch it on or off in the portal.
 */

export const dynamic = 'force-dynamic';
type P = Promise<{ handle: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const { handle } = await params;
  const page = await sellerPage(handle).catch(() => null);
  if (!page) return { title: 'Seller', robots: { index: false } };
  const t = (l: Lang) => pick(l, { en: `Domains for sale by ${page.name}`, es: `Dominios en venta de ${page.name}`, id: `Domain dijual oleh ${page.name}` }).slice(0, 52);
  const d = (l: Lang) => pick(l, {
    en: `${page.live.length} domain names by ${page.name} in the xaa.es auction, ending soonest first. Every lot runs 14 days; the domain is verified in DNS.`,
    es: `${page.live.length} dominios de ${page.name} en la subasta de xaa.es, primero los que terminan antes. Cada lote dura 14 días; el dominio está verificado en DNS.`,
    id: `${page.live.length} nama domain dari ${page.name} di lelang xaa.es, yang segera berakhir di atas. Setiap lot 14 hari; domain terverifikasi di DNS.`,
  }).slice(0, 160);
  return pageMetadata({ path: `/auction/seller/${handle}`, copy: { en: { title: t('en'), description: d('en') }, es: { title: t('es'), description: d('es') }, id: { title: t('id'), description: d('id') } }, noindex: page.live.length === 0 });
}

export default async function SellerPage({ params }: { params: P }) {
  const { handle } = await params;
  const page = await sellerPage(handle).catch(() => null);
  if (!page) notFound();
  const lang = await getLang();
  const nowMs = Date.now();
  const live = filterLots(page.live, parseLotFilter(new URLSearchParams()), nowMs);
  const c = pick(lang, {
    en: { eyebrow: 'Seller', title: `Domains by ${page.name}`, since: `Selling on xaa.es since ${page.since.slice(0, 10)} · ${page.sold} sold`, none: 'No domain from this seller is in the auction right now.', note: 'Every domain here was verified in DNS by its seller. You pay xaa.es; the seller is paid once the domain is in your account.' },
    es: { eyebrow: 'Vendedor', title: `Dominios de ${page.name}`, since: `Vende en xaa.es desde ${page.since.slice(0, 10)} · ${page.sold} vendidos`, none: 'Ahora mismo no hay dominios de este vendedor en subasta.', note: 'Cada dominio aquí fue verificado en DNS por su vendedor. Pagas a xaa.es; el vendedor cobra cuando el dominio está en tu cuenta.' },
    id: { eyebrow: 'Penjual', title: `Domain dari ${page.name}`, since: `Menjual di xaa.es sejak ${page.since.slice(0, 10)} · ${page.sold} terjual`, none: 'Saat ini tidak ada domain dari penjual ini yang dilelang.', note: 'Setiap domain di sini diverifikasi di DNS oleh penjualnya. Anda membayar ke xaa.es; penjual dibayar setelah domain masuk ke akun Anda.' },
  });
  return (
    <>
      <Breadcrumbs trail={[{ k: 'nav.auction', href: '/auction' }, { label: page.name }]} />
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <p className="eyebrow">{c.eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight" data-testid="seller-title">{c.title}</h1>
        <p className="mt-2 text-sm text-steel-500">{c.since}</p>
        <p className="mt-4 max-w-3xl text-steel-600">{c.note}</p>
        {live.length ? (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{live.map((card) => <LotCardView key={card.id} card={card} lang={lang} nowMs={nowMs} />)}</ul>
        ) : <p className="panel mt-8 p-6 text-steel-500">{c.none}</p>}
      </section>
    </>
  );
}
