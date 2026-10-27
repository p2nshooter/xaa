import Link from 'next/link';
import type { Metadata } from 'next';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';
import { pageMetadata, absUrl } from '@/lib/seo';
import { SEO } from '@/content/seo-copy';
import { jsonLdHtml } from '@/lib/json-ld';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LotCardView, euroIn, TYPE_LABEL } from '@/components/AuctionCards';
import { auctionCards, listCategories } from '@/server/auction';
import { LOT_TYPES, filterLots, parseLotFilter, cardPrice } from '@/server/auction-terms';

/**
 * /auction — websites, scripts and domain names under the hammer (docs/BLUEPRINT.md §10). The list reads index
 * summaries only, closes any lot whose time is up and opens the round's automatic products as it loads. The
 * lots ending soonest are on top; the filters are the ones domain-auction sites use (request 59). A filtered
 * view is noindex: only the plain list is a page for search engines.
 */

export const dynamic = 'force-dynamic';

type SP = Promise<Record<string, string | string[] | undefined>>;
const toParams = (sp: Record<string, string | string[] | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (typeof v === 'string' && k !== 'lang') p.set(k, v);
  return p;
};

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const filtered = [...toParams(await searchParams).keys()].length > 0;
  return pageMetadata({ path: '/auction', copy: SEO.auction, noindex: filtered });
}

const COPY = {
  en: {
    chip: 'Live auction', h1a: 'Websites, scripts', h1b: 'and domain names', lead: 'Every lot runs 14 days. Bidding opens at 35 % of the price and every bid adds 5 % of the opening bid. The lots ending soonest are on top.',
    rules: ['14 days per lot', 'Opens at 35 %, +5 % per bid', 'Anti-snipe: last 5 minutes extend', 'Pay by PayPal, bank or USDT'],
    filters: 'Filter', type: 'Type', any: 'Any', category: 'Category', seller: 'Seller', sellerXaa: 'xaa.es', sellerMember: 'Members', tld: 'Extension (TLD)', q: 'Keyword', contains: 'contains', starts: 'starts with', ends: 'ends with',
    noHyphen: 'No hyphens', noDigits: 'No digits', len: 'Name length', min: 'Min €', max: 'Max €', bids: 'Min. bids', endsIn: 'Ends within', h1: '1 hour', h24: '24 hours', d7: '7 days',
    buyNow: 'Buy now only', noReserve: 'No reserve', lang: 'Language', sort: 'Sort', apply: 'Show lots', reset: 'Clear',
    sorts: { ending: 'Ending soonest', newest: 'Newest', price_asc: 'Price: low to high', price_desc: 'Price: high to low', bids: 'Most bids', az: 'A–Z', shortest: 'Shortest name' } as Record<string, string>,
    found: (n: number) => (n === 1 ? '1 lot' : `${n} lots`), none: 'No lot matches these filters right now.', winners: 'Recent winners', paid: 'paid', notPaid: 'not paid yet',
    sellTitle: 'Sell your domain here', sell: 'Members put up domain names after a DNS check proves the domain is theirs. Listing, the DNS check and relisting are free; xaa.es takes a 30 % sales commission only when a domain sells, and you receive 70 % once the buyer has it.', sellCta: 'Sell a domain', bidCta: 'Sign in to bid',
    faqTitle: 'Questions',
    faq: [
      ['How long does a lot run?', 'Every lot runs 14 days from the moment it starts. xaa.es’s own scripts go up automatically every two weeks, from Friday 07:00 WIB (00:00 UTC) to the next Friday but one. A bid in the last 5 minutes extends that lot by 5 minutes.'],
      ['How are prices set?', 'Bidding opens at 35 % of the lot’s price (the catalogue price, the studio’s valuation or the member’s asking price). Every bid is exactly the next price: the opening bid plus 5 % of it each time, never above the full price. A hidden reserve may apply; a lot that does not reach it ends unsold.'],
      ['What does a seller pay?', 'Nothing to list, verify or relist. When a member’s domain sells, xaa.es keeps a 30 % sales commission and pays the seller 70 % of the final price as soon as the buyer confirms the domain is in their account.'],
      ['How do I pay and receive what I won?', 'Pay from your portal by PayPal (confirmed at once), bank transfer or USDT (send the payment screenshot; the admin approves it). Code archives open to you once paid; a domain is pushed or transferred with the registrar’s code.'],
      ['How is a member’s domain verified?', 'The seller adds a TXT record (_xaa-verify.<domain>) with a token from their portal. Two independent DNS resolvers must see it before the lot starts, and it is checked again before a relist.'],
    ] as [string, string][],
  },
  es: {
    chip: 'Subasta en vivo', h1a: 'Webs, scripts', h1b: 'y nombres de dominio', lead: 'Cada lote dura 14 días. La puja abre al 35 % del precio y cada puja suma el 5 % de la puja inicial. Arriba, los lotes que terminan antes.',
    rules: ['14 días por lote', 'Abre al 35 %, +5 % por puja', 'Anti-snipe: los últimos 5 minutos amplían', 'Paga con PayPal, banco o USDT'],
    filters: 'Filtrar', type: 'Tipo', any: 'Todos', category: 'Categoría', seller: 'Vendedor', sellerXaa: 'xaa.es', sellerMember: 'Miembros', tld: 'Extensión (TLD)', q: 'Palabra', contains: 'contiene', starts: 'empieza por', ends: 'termina en',
    noHyphen: 'Sin guiones', noDigits: 'Sin cifras', len: 'Longitud', min: 'Mín. €', max: 'Máx. €', bids: 'Mín. pujas', endsIn: 'Termina en', h1: '1 hora', h24: '24 horas', d7: '7 días',
    buyNow: 'Solo compra ya', noReserve: 'Sin reserva', lang: 'Idioma', sort: 'Orden', apply: 'Ver lotes', reset: 'Limpiar',
    sorts: { ending: 'Terminan antes', newest: 'Más nuevos', price_asc: 'Precio: menor a mayor', price_desc: 'Precio: mayor a menor', bids: 'Más pujas', az: 'A–Z', shortest: 'Nombre más corto' } as Record<string, string>,
    found: (n: number) => (n === 1 ? '1 lote' : `${n} lotes`), none: 'Ningún lote coincide con estos filtros ahora mismo.', winners: 'Últimos ganadores', paid: 'pagado', notPaid: 'aún sin pagar',
    sellTitle: 'Vende aquí tu dominio', sell: 'Los miembros subastan dominios tras verificar en el DNS que son suyos. Publicar, verificar y volver a publicar es gratis; xaa.es cobra una comisión del 30 % solo si el dominio se vende y tú recibes el 70 % cuando el comprador lo tiene.', sellCta: 'Vender un dominio', bidCta: 'Entra para pujar',
    faqTitle: 'Preguntas',
    faq: [
      ['¿Cuánto dura un lote?', 'Cada lote dura 14 días desde que empieza. Los scripts propios de xaa.es salen solos cada dos semanas, de viernes 07:00 WIB (00:00 UTC) a viernes. Una puja en los últimos 5 minutos amplía ese lote 5 minutos.'],
      ['¿Cómo se fijan los precios?', 'La puja abre al 35 % del precio del lote (catálogo, valoración del estudio o precio pedido por el miembro). Cada puja es exactamente el siguiente precio: la inicial más un 5 % de ella cada vez, nunca por encima del precio completo. Puede haber una reserva oculta; si no se alcanza, el lote termina sin venderse.'],
      ['¿Qué paga un vendedor?', 'Nada por publicar, verificar o volver a publicar. Cuando se vende el dominio de un miembro, xaa.es se queda una comisión del 30 % y paga al vendedor el 70 % del precio final en cuanto el comprador confirma que lo tiene.'],
      ['¿Cómo pago y recibo lo que gané?', 'Paga desde tu portal con PayPal (confirmado al instante), transferencia o USDT (envía la captura del pago; el administrador lo aprueba). El código se abre al pagar; el dominio se transfiere con el código del registrador.'],
      ['¿Cómo se verifica el dominio de un miembro?', 'El vendedor añade un registro TXT (_xaa-verify.<dominio>) con un token de su portal. Dos resolvedores DNS independientes deben verlo antes de empezar, y se comprueba de nuevo antes de volver a publicar.'],
    ] as [string, string][],
  },
  id: {
    chip: 'Lelang berjalan', h1a: 'Website, script', h1b: 'dan nama domain', lead: 'Setiap lot berjalan 14 hari. Harga buka 35 % dari harga dan setiap tawaran menambah 5 % dari harga buka. Lot yang segera berakhir ada di atas.',
    rules: ['14 hari per lot', 'Buka 35 %, +5 % per tawaran', 'Anti-snipe: 5 menit terakhir memperpanjang', 'Bayar via PayPal, bank atau USDT'],
    filters: 'Filter', type: 'Jenis', any: 'Semua', category: 'Kategori', seller: 'Penjual', sellerXaa: 'xaa.es', sellerMember: 'Anggota', tld: 'Ekstensi (TLD)', q: 'Kata kunci', contains: 'memuat', starts: 'diawali', ends: 'diakhiri',
    noHyphen: 'Tanpa tanda hubung', noDigits: 'Tanpa angka', len: 'Panjang nama', min: 'Min €', max: 'Maks €', bids: 'Min. tawaran', endsIn: 'Berakhir dalam', h1: '1 jam', h24: '24 jam', d7: '7 hari',
    buyNow: 'Hanya beli langsung', noReserve: 'Tanpa cadangan', lang: 'Bahasa', sort: 'Urutan', apply: 'Tampilkan lot', reset: 'Hapus filter',
    sorts: { ending: 'Segera berakhir', newest: 'Terbaru', price_asc: 'Harga: rendah ke tinggi', price_desc: 'Harga: tinggi ke rendah', bids: 'Tawaran terbanyak', az: 'A–Z', shortest: 'Nama terpendek' } as Record<string, string>,
    found: (n: number) => `${n} lot`, none: 'Belum ada lot yang cocok dengan filter ini.', winners: 'Pemenang terbaru', paid: 'lunas', notPaid: 'belum membayar',
    sellTitle: 'Jual domain Anda di sini', sell: 'Anggota melelang nama domain setelah verifikasi DNS membuktikan domain itu miliknya. Memasang, verifikasi DNS dan lelang ulang gratis; xaa.es mengambil komisi penjualan 30 % hanya bila domain terjual, dan Anda menerima 70 % setelah pembeli menerimanya.', sellCta: 'Jual domain', bidCta: 'Masuk untuk menawar',
    faqTitle: 'Pertanyaan',
    faq: [
      ['Berapa lama satu lot berjalan?', 'Setiap lot berjalan 14 hari sejak dimulai. Script milik xaa.es naik otomatis setiap dua minggu, dari Jumat 07.00 WIB (00.00 UTC) sampai Jumat dua minggu berikutnya. Tawaran di 5 menit terakhir memperpanjang lot itu 5 menit.'],
      ['Bagaimana harga ditentukan?', 'Harga buka 35 % dari harga lot (harga katalog, valuasi studio, atau harga minta anggota). Setiap tawaran tepat di harga berikutnya: harga buka ditambah 5 %-nya setiap kali, tidak pernah melebihi harga penuh. Bisa ada harga cadangan tersembunyi; lot yang tidak mencapainya berakhir tidak terjual.'],
      ['Penjual membayar apa?', 'Tidak ada biaya memasang, verifikasi, atau lelang ulang. Bila domain anggota terjual, xaa.es mengambil komisi penjualan 30 % dan membayar penjual 70 % dari harga akhir begitu pembeli mengonfirmasi domain sudah masuk ke akunnya.'],
      ['Bagaimana membayar dan menerima kemenangan?', 'Bayar dari portal lewat PayPal (langsung terkonfirmasi), transfer bank, atau USDT (kirim bukti bayar; admin menyetujuinya). Arsip kode terbuka setelah lunas; domain dipindah dengan kode registrar.'],
      ['Bagaimana domain anggota diverifikasi?', 'Penjual menambahkan catatan TXT (_xaa-verify.<domain>) berisi token dari portalnya. Dua resolver DNS yang berbeda harus melihatnya sebelum lot dimulai, dan diperiksa lagi sebelum lelang ulang.'],
    ] as [string, string][],
  },
} satisfies Record<Lang, unknown>;

export default async function AuctionPage({ searchParams }: { searchParams: SP }) {
  const lang = await getLang();
  const c = pick(lang, COPY);
  const params = toParams(await searchParams);
  const filter = parseLotFilter(params);
  const nowMs = Date.now();
  const [{ live, winners }, categories] = await Promise.all([auctionCards(nowMs).catch(() => ({ live: [], winners: [], roundEndsAt: '' })), listCategories().catch(() => [])]);
  const shown = filterLots(live, filter, nowMs);
  const tlds = [...new Set(live.filter((l) => l.dom).map((l) => l.dom.slice(l.dom.indexOf('.') + 1)))].sort();
  const langs = [...new Set(live.map((l) => l.lang).filter(Boolean))].sort();
  const sel = (k: string) => params.get(k) ?? '';

  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: c.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
    {
      '@context': 'https://schema.org', '@type': 'ItemList', name: c.h1a + ' ' + c.h1b,
      itemListElement: shown.slice(0, 50).map((l, i) => ({
        '@type': 'ListItem', position: i + 1, url: absUrl(`/auction/${l.ref}`),
        item: { '@type': 'Product', name: l.dom || l.title, offers: { '@type': 'Offer', priceCurrency: 'EUR', price: cardPrice(l), availability: 'https://schema.org/InStock', priceValidUntil: l.ends.slice(0, 10), url: absUrl(`/auction/${l.ref}`) } },
      })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(ld) }} />
      <Breadcrumbs trail={[{ k: 'nav.auction' }]} />
      <section className="mx-auto max-w-6xl px-4 pb-6 pt-8">
        <p className="eyebrow">{c.chip}</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{c.h1a} <span className="accent-text">{c.h1b}</span></h1>
        <p className="mt-4 max-w-3xl text-lg text-steel-600">{c.lead}</p>
        <ul className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">{c.rules.map((r) => <li key={r} className="badge badge-grey">{r}</li>)}</ul>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 lg:grid-cols-[280px_minmax(0,1fr)]">
        <form method="get" action="/auction" className="panel h-fit space-y-3 p-4 text-sm lg:sticky lg:top-28" data-testid="auction-filters" aria-label={c.filters}>
          <p className="font-display text-base font-extrabold">{c.filters}</p>
          <label className="field"><span>{c.sort}</span>
            <select name="sort" className="input" defaultValue={sel('sort') || 'ending'}>{Object.entries(c.sorts).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </label>
          <label className="field"><span>{c.type}</span>
            <select name="type" className="input" defaultValue={sel('type')}><option value="">{c.any}</option>{LOT_TYPES.map((t) => <option key={t} value={t}>{pick(lang, TYPE_LABEL[t]!)}</option>)}</select>
          </label>
          <label className="field"><span>{c.category}</span>
            <select name="cat" className="input" defaultValue={sel('cat')}><option value="">{c.any}</option>{categories.map((k) => <option key={k.slug} value={k.slug}>{pick(lang, k)}</option>)}</select>
          </label>
          <label className="field"><span>{c.seller}</span>
            <select name="seller" className="input" defaultValue={sel('seller')}><option value="">{c.any}</option><option value="xaa">{c.sellerXaa}</option><option value="member">{c.sellerMember}</option></select>
          </label>
          <label className="field"><span>{c.tld}</span>
            <select name="tld" className="input" defaultValue={sel('tld')}><option value="">{c.any}</option>{tlds.map((t) => <option key={t} value={t}>.{t}</option>)}</select>
          </label>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <label className="field"><span>{c.q}</span><input name="q" className="input" defaultValue={sel('q')} autoComplete="off" /></label>
            <label className="field"><span>&nbsp;</span>
              <select name="qmode" className="input" defaultValue={sel('qmode') || 'contains'}><option value="contains">{c.contains}</option><option value="starts">{c.starts}</option><option value="ends">{c.ends}</option></select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="field"><span>{c.len} ≥</span><input name="minlen" className="input" inputMode="numeric" defaultValue={sel('minlen')} /></label>
            <label className="field"><span>{c.len} ≤</span><input name="maxlen" className="input" inputMode="numeric" defaultValue={sel('maxlen')} /></label>
            <label className="field"><span>{c.min}</span><input name="min" className="input" inputMode="numeric" defaultValue={sel('min')} /></label>
            <label className="field"><span>{c.max}</span><input name="max" className="input" inputMode="numeric" defaultValue={sel('max')} /></label>
          </div>
          <label className="field"><span>{c.bids}</span><input name="bids" className="input" inputMode="numeric" defaultValue={sel('bids')} /></label>
          <label className="field"><span>{c.endsIn}</span>
            <select name="ends" className="input" defaultValue={sel('ends')}><option value="">{c.any}</option><option value="1h">{c.h1}</option><option value="24h">{c.h24}</option><option value="7d">{c.d7}</option></select>
          </label>
          {langs.length ? (
            <label className="field"><span>{c.lang}</span>
              <select name="lang_site" className="input" defaultValue={sel('lang_site')}><option value="">{c.any}</option>{langs.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}</select>
            </label>
          ) : null}
          {[['nohyphen', c.noHyphen], ['nodigits', c.noDigits], ['buynow', c.buyNow], ['noreserve', c.noReserve]].map(([k, label]) => (
            <label key={k} className="flex items-center gap-2"><input type="checkbox" name={k} value="1" defaultChecked={sel(k) === '1'} /> {label}</label>
          ))}
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn btn-primary btn-sm">{c.apply}</button>
            <Link href="/auction" className="btn btn-ghost btn-sm">{c.reset}</Link>
          </div>
        </form>

        <div>
          <p className="mb-3 text-sm text-steel-500" data-testid="lot-count">{c.found(shown.length)}</p>
          {shown.length ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{shown.map((card) => <LotCardView key={card.id} card={card} lang={lang} nowMs={nowMs} />)}</ul>
          ) : (
            <p className="panel p-6 text-steel-500">{c.none}</p>
          )}

          <div className="panel mt-8 flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="max-w-2xl"><p className="font-display text-lg font-extrabold">{c.sellTitle}</p><p className="mt-1 text-sm text-steel-600">{c.sell}</p></div>
            <div className="flex gap-2"><Link href="/portal/auction#sell" className="btn btn-dark">{c.sellCta}</Link><Link href="/portal/auction" className="btn btn-ghost">{c.bidCta}</Link></div>
          </div>

          {winners.length ? (
            <section className="mt-10" data-testid="auction-winners">
              <h2 className="font-display text-2xl font-extrabold">{c.winners}</h2>
              <ul className="mt-4 divide-y divide-[color:var(--line)] rounded-xl border border-[color:var(--line)]">
                {winners.slice(0, 12).map((w) => (
                  <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                    <span className="font-semibold">{w.dom || w.title}</span>
                    <span className="text-steel-500">{w.winner} · {euroIn(w.win, lang)} · <span className={w.paid ? 'text-emerald-700' : 'text-amber-700'}>{w.paid ? c.paid : c.notPaid}</span></span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-12">
            <h2 className="font-display text-2xl font-extrabold">{c.faqTitle}</h2>
            <div className="mt-4 space-y-3">
              {c.faq.map(([q, a]) => (
                <details key={q} className="panel p-4"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 text-sm text-steel-600">{a}</p></details>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
