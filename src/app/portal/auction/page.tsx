import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { portalReady } from '@/server/db';
import { getLang } from '@/lib/i18n.server';
import { pick, type Lang } from '@/lib/i18n';
import { euroIn } from '@/components/AuctionCards';
import {
  AuctionNameForm, DomainClaimForm, DomainVerifyButton, HandoverButton, MemberLotForm, PayoutDetailsForm, RelistForm, SellerPageToggle,
} from '@/components/forms/AuctionForms';
import { listCategories, memberAuction } from '@/server/auction';
import { DNS_PROOF_DAYS, DNS_TOKEN_DAYS, MEMBER_COMMISSION_PCT, dnsRecordName, dnsRecordValue, hasCode } from '@/server/auction-terms';
import { soft, type Problems } from '@/server/soft';
import { DbNotice } from '@/components/DbNotice';

export const metadata: Metadata = { title: 'Auction', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

/** The member's auction desk: the name they bid under, their bids and wins, and selling their own domains (request 59). */
export default async function PortalAuctionPage() {
  if (!(await portalReady())) redirect('/portal');
  const user = await currentUser();
  if (!user) redirect('/login?next=/portal/auction');
  const lang = await getLang();
  const c = pick(lang, COPY);
  const problems: Problems = [];
  const [me, categories] = await Promise.all([
    soft(problems, () => memberAuction(user.id), null),
    soft(problems, () => listCategories(), []),
  ]);
  const nowMs = Date.now();
  const verified = (me?.domains ?? []).filter((d) => d.status === 'verified' && nowMs - Date.parse(d.verified_at) <= DNS_PROOF_DAYS * 86_400_000).map((d) => d.domain);
  const cats = categories.map((k) => ({ slug: k.slug, label: pick(lang, k) }));
  const when = (iso: string) => (iso ? iso.slice(0, 16).replace('T', ' ') + ' UTC' : '—');

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/portal" className="text-xs text-steel-500 hover:text-gold-500">← Portal</Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold">{c.title}</h1>
        <Link href="/auction" className="btn btn-ghost btn-sm">{c.browse}</Link>
      </div>
      <DbNotice problems={problems} />

      {user.role === 'admin' ? (
        <p className="panel mt-6 p-5 text-sm">{c.admin} <Link href="/portal/admin/auction" className="font-bold text-gold-500 underline">{c.desk}</Link></p>
      ) : (
        <section className="panel mt-6 p-5"><AuctionNameForm current={me?.displayName ?? ''} lang={lang} /></section>
      )}

      {/* Bids */}
      <section className="mt-10" data-testid="my-bids">
        <h2 className="font-display text-xl font-extrabold">{c.bids}</h2>
        {me?.bids.length ? (
          <div className="mt-3 overflow-x-auto rounded-xl border border-[color:var(--line)]">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-[color:var(--surface)] text-left text-xs uppercase tracking-wide text-steel-500"><tr><th className="p-3">{c.lot}</th><th className="p-3">{c.mine}</th><th className="p-3">{c.now}</th><th className="p-3">{c.state}</th><th className="p-3">{c.ends}</th></tr></thead>
              <tbody>
                {me.bids.map(({ lot, mine, leading }) => (
                  <tr key={lot.id} className="border-t border-[color:var(--line)]">
                    <td className="p-3"><Link href={`/auction/${lot.ref}`} className="font-semibold underline">{lot.domain || lot.title}</Link></td>
                    <td className="p-3 tabular-nums">{euroIn(mine, lang)}</td>
                    <td className="p-3 tabular-nums">{euroIn(lot.high_eur, lang)}</td>
                    <td className="p-3">{lot.status === 'open' ? (leading ? <span className="badge badge-green">{c.leading}</span> : <span className="badge badge-amber">{c.outbid}</span>) : <span className="badge badge-grey">{c.closed}</span>}</td>
                    <td className="p-3 text-xs">{when(lot.ends_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="mt-2 text-sm text-steel-500">{c.noBids}</p>}
      </section>

      {/* Wins */}
      <section className="mt-10" data-testid="my-wins">
        <h2 className="font-display text-xl font-extrabold">{c.wins}</h2>
        {me?.wins.length ? (
          <ul className="mt-3 space-y-3">
            {me.wins.map((l) => (
              <li key={l.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{l.domain || l.title} · {euroIn(l.winner_eur, lang)}</p>
                  <p className="text-xs text-steel-500">{l.status === 'sold' ? c.paid : c.payBy(when(l.pay_by))}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {l.status === 'awaiting_payment' && l.order_id ? <Link href={`/portal/orders/${l.order_id}`} className="btn btn-primary btn-sm" data-testid="pay-win">{c.pay}</Link> : null}
                  {l.status === 'sold' && hasCode(l.type) ? <a href={`/api/auction/archive/${l.id}`} className="btn btn-dark btn-sm">{c.download}</a> : null}
                  {l.status === 'sold' && l.domain ? (
                    l.domain_received_at ? <span className="badge badge-green">{c.received}</span>
                      : <><span className="text-xs text-steel-500">{l.epp_sent_at ? c.eppSent : c.eppWaiting}</span><HandoverButton lotId={l.id} step="received" label={c.markReceived} /></>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-steel-500">{c.noWins}</p>}
      </section>

      {/* Selling a domain */}
      {user.role !== 'admin' ? (
        <section id="sell" className="mt-12 scroll-mt-28" data-testid="sell-domain">
          <h2 className="font-display text-2xl font-extrabold">{c.sellTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm text-steel-600">{c.sellLead(MEMBER_COMMISSION_PCT)}</p>
          {!me?.displayName ? <p className="mt-3 text-sm font-semibold text-amber-700">{c.nameFirst}</p> : null}

          <ol className="mt-6 space-y-6">
            <li className="panel p-5">
              <p className="font-display text-lg font-extrabold">1. {c.step1}</p>
              <div className="mt-3"><DomainClaimForm lang={lang} /></div>
              {me?.domains.length ? (
                <ul className="mt-5 space-y-3" data-testid="claims">
                  {me.domains.map((d) => (
                    <li key={d.id} className="rounded-lg border border-[color:var(--line)] p-4 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{d.domain} {d.status === 'verified' ? <span className="badge badge-green ml-1">{c.verified}</span> : <span className="badge badge-amber ml-1">{c.pending}</span>}</p>
                        <DomainVerifyButton domain={d.domain} lang={lang} />
                      </div>
                      <dl className="mt-3 grid gap-2 sm:grid-cols-[110px_minmax(0,1fr)]">
                        <dt className="text-xs font-bold uppercase text-steel-400">{c.recType}</dt><dd><code>TXT</code></dd>
                        <dt className="text-xs font-bold uppercase text-steel-400">{c.recName}</dt><dd className="break-all"><code data-testid="txt-name">{dnsRecordName(d.domain)}</code> <span className="text-xs text-steel-500">({c.orJust} <code>_xaa-verify</code>)</span></dd>
                        <dt className="text-xs font-bold uppercase text-steel-400">{c.recValue}</dt><dd className="break-all"><code data-testid="txt-value">{dnsRecordValue(d.token)}</code></dd>
                      </dl>
                      <p className="mt-2 text-xs text-steel-500">{c.tokenNote(DNS_TOKEN_DAYS)} {d.checked_at ? c.lastCheck(when(d.checked_at)) : ''}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
              <details className="mt-4 text-sm"><summary className="cursor-pointer font-semibold">{c.howTo}</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-steel-600">{c.registrars.map((r) => <li key={r}>{r}</li>)}</ul>
              </details>
            </li>

            <li className="panel p-5">
              <p className="font-display text-lg font-extrabold">2. {c.step2}</p>
              {verified.length && me?.displayName ? <div className="mt-4"><MemberLotForm domains={verified} categories={cats} lang={lang} /></div> : <p className="mt-2 text-sm text-steel-500">{c.step2Wait}</p>}
            </li>
          </ol>

          <h3 className="mt-10 font-display text-xl font-extrabold">{c.myLots}</h3>
          {me?.selling.length ? (
            <ul className="mt-3 space-y-3" data-testid="my-lots">
              {me.selling.map((l) => {
                const payout = me.payouts.find((p) => p.lot_id === l.id);
                return (
                  <li key={l.id} className="panel p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link href={`/auction/${l.ref}`} className="font-semibold underline">{l.domain}</Link>
                      <span className="badge badge-grey">{c.status[l.status] ?? l.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-steel-500">{c.lotLine(euroIn(l.bids_count ? l.high_eur : l.open_eur, lang), l.bids_count, when(l.ends_at))}</p>
                    {l.status === 'unsold' && !l.relisted_to ? <div className="mt-3"><RelistForm lotId={l.id} asking={l.normal_eur} lang={lang} /></div> : null}
                    {l.status === 'sold' && !l.epp_sent_at ? <div className="mt-3"><p className="mb-2 text-xs">{c.sendEpp}</p><HandoverButton lotId={l.id} step="epp" label={c.markEpp} /></div> : null}
                    {payout ? <p className="mt-2 text-xs" data-testid="payout-line">{c.payout(euroIn(payout.final_eur, lang), euroIn(payout.commission_eur, lang), euroIn(payout.seller_eur, lang), c.payoutStatus[payout.status])}</p> : null}
                  </li>
                );
              })}
            </ul>
          ) : <p className="mt-2 text-sm text-steel-500">{c.noLots}</p>}

          {me?.displayName ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <section className="panel p-5"><h3 className="font-display text-lg font-extrabold">{c.payoutTitle}</h3><div className="mt-3"><PayoutDetailsForm method={me.payoutMethod} lang={lang} /></div></section>
              <section className="panel p-5">
                <h3 className="font-display text-lg font-extrabold">{c.pageTitle}</h3>
                <p className="mt-2 text-sm text-steel-600">{c.pageLead}</p>
                {me.handle ? <p className="mt-2 text-sm"><Link href={`/auction/seller/${me.handle}`} className="underline">xaa.es/auction/seller/{me.handle}</Link></p> : null}
                <div className="mt-3"><SellerPageToggle on={me.sellerPage} lang={lang} /></div>
              </section>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

const COPY = {
  en: {
    title: 'Auction', browse: 'Browse the auction', admin: 'Admin accounts run the auction and do not bid.', desk: 'Open the auction desk',
    bids: 'My bids', lot: 'Lot', mine: 'My bid', now: 'Current', state: 'State', ends: 'Ends', leading: 'Leading', outbid: 'Outbid', closed: 'Closed', noBids: 'No bids yet.',
    wins: 'My wins', paid: 'Paid — thank you.', payBy: (d: string) => `Not paid yet — please pay by ${d}.`, pay: 'Pay now', download: 'Download files', received: 'Domain received',
    eppSent: 'The seller sent the transfer code.', eppWaiting: 'Waiting for the transfer code.', markReceived: 'The domain is in my account', noWins: 'No wins yet.',
    sellTitle: 'Sell a domain', sellLead: (p: number) => `Members sell domain names only. Prove the domain is yours with a DNS record, set your asking price and the auction runs 14 days. Listing, DNS verification and relisting are free; xaa.es takes a ${p} % sales commission only if it sells, and you receive ${100 - p} % once the buyer has the domain.`,
    nameFirst: 'Choose the name you sell under (above) first.', step1: 'Prove the domain is yours', verified: 'verified', pending: 'waiting for DNS',
    recType: 'Type', recName: 'Name / host', orJust: 'some registrars want just', recValue: 'Value', tokenNote: (d: number) => `The token stays valid for ${d} days.`, lastCheck: (w: string) => `Last check: ${w}.`,
    howTo: 'Where to add the record (registrars)',
    registrars: [
      'Cloudflare: DNS → Records → Add record → TXT, Name _xaa-verify, Content the value above.',
      'Namecheap: Domain List → Manage → Advanced DNS → Add new record → TXT Record, Host _xaa-verify.',
      'GoDaddy: My Products → DNS → Add → TXT, Name _xaa-verify.',
      'Spaceship, Porkbun, Hostinger, Niagahoster, Rumahweb, IONOS, OVH: DNS / zone editor → new TXT record with the same name and value.',
      'DNS changes usually show within minutes; some registrars take up to an hour.',
    ],
    step2: 'Put it up for 14 days', step2Wait: 'A verified domain appears here (the proof counts for 7 days; check again when it has expired).',
    myLots: 'My lots', noLots: 'Nothing listed yet.', lotLine: (p: string, n: number, e: string) => `${p} · ${n} bid(s) · ends ${e}`,
    status: { open: 'Running', awaiting_payment: 'Won — awaiting payment', sold: 'Sold', unsold: 'Ended unsold', cancelled: 'Withdrawn', draft: 'Draft' } as Record<string, string>,
    sendEpp: 'Sold and paid: send the buyer the transfer (EPP) code or push the domain to their registrar account, then mark it here.', markEpp: 'Transfer code sent',
    payout: (f: string, cm: string, s: string, st: string) => `Final ${f} · commission ${cm} · you receive ${s} — ${st}`,
    payoutStatus: { awaiting_handover: 'released when the buyer confirms the domain', due: 'being paid to you', paid: 'paid' } as Record<string, string>,
    payoutTitle: 'Payout details', pageTitle: 'Your seller page', pageLead: 'A page on xaa.es with every domain you have in the auction, like a Sedo shop. Share the link anywhere.',
  },
  es: {
    title: 'Subasta', browse: 'Ver la subasta', admin: 'Las cuentas de administrador gestionan la subasta y no pujan.', desk: 'Abrir el escritorio de subastas',
    bids: 'Mis pujas', lot: 'Lote', mine: 'Mi puja', now: 'Actual', state: 'Estado', ends: 'Termina', leading: 'Voy primero', outbid: 'Superada', closed: 'Cerrado', noBids: 'Aún sin pujas.',
    wins: 'Mis victorias', paid: 'Pagado, gracias.', payBy: (d: string) => `Aún sin pagar: paga antes del ${d}.`, pay: 'Pagar ahora', download: 'Descargar archivos', received: 'Dominio recibido',
    eppSent: 'El vendedor envió el código de transferencia.', eppWaiting: 'Esperando el código de transferencia.', markReceived: 'El dominio está en mi cuenta', noWins: 'Aún sin victorias.',
    sellTitle: 'Vender un dominio', sellLead: (p: number) => `Los miembros venden solo nombres de dominio. Demuestra con un registro DNS que el dominio es tuyo, fija tu precio y la subasta dura 14 días. Publicar, verificar y volver a publicar es gratis; xaa.es cobra una comisión del ${p} % solo si se vende y recibes el ${100 - p} % cuando el comprador lo tiene.`,
    nameFirst: 'Primero elige (arriba) el nombre con el que vendes.', step1: 'Demuestra que el dominio es tuyo', verified: 'verificado', pending: 'esperando al DNS',
    recType: 'Tipo', recName: 'Nombre / host', orJust: 'algunos registradores piden solo', recValue: 'Valor', tokenNote: (d: number) => `El token vale ${d} días.`, lastCheck: (w: string) => `Última comprobación: ${w}.`,
    howTo: 'Dónde añadir el registro (registradores)',
    registrars: [
      'Cloudflare: DNS → Registros → Añadir → TXT, Nombre _xaa-verify, Contenido el valor de arriba.',
      'Namecheap: Domain List → Manage → Advanced DNS → Add new record → TXT Record, Host _xaa-verify.',
      'GoDaddy: Mis productos → DNS → Añadir → TXT, Nombre _xaa-verify.',
      'Spaceship, Porkbun, Hostinger, IONOS, OVH, Dinahosting: editor de zona DNS → nuevo registro TXT con el mismo nombre y valor.',
      'Los cambios de DNS suelen verse en minutos; algunos registradores tardan hasta una hora.',
    ],
    step2: 'Súbelo 14 días a subasta', step2Wait: 'Aquí aparece un dominio verificado (la prueba vale 7 días; vuelve a comprobar si caducó).',
    myLots: 'Mis lotes', noLots: 'Aún no has publicado nada.', lotLine: (p: string, n: number, e: string) => `${p} · ${n} puja(s) · termina ${e}`,
    status: { open: 'En curso', awaiting_payment: 'Ganado: esperando el pago', sold: 'Vendido', unsold: 'Terminó sin venderse', cancelled: 'Retirado', draft: 'Borrador' } as Record<string, string>,
    sendEpp: 'Vendido y pagado: envía al comprador el código de transferencia (EPP) o haz el push a su cuenta y márcalo aquí.', markEpp: 'Código enviado',
    payout: (f: string, cm: string, s: string, st: string) => `Final ${f} · comisión ${cm} · recibes ${s} — ${st}`,
    payoutStatus: { awaiting_handover: 'se libera cuando el comprador confirma el dominio', due: 'en pago', paid: 'pagado' } as Record<string, string>,
    payoutTitle: 'Datos de cobro', pageTitle: 'Tu página de vendedor', pageLead: 'Una página en xaa.es con todos tus dominios en subasta, como una tienda de Sedo. Comparte el enlace donde quieras.',
  },
  id: {
    title: 'Lelang', browse: 'Lihat lelang', admin: 'Akun admin menjalankan lelang dan tidak ikut menawar.', desk: 'Buka meja lelang',
    bids: 'Tawaran saya', lot: 'Lot', mine: 'Tawaran saya', now: 'Saat ini', state: 'Status', ends: 'Berakhir', leading: 'Memimpin', outbid: 'Terlampaui', closed: 'Ditutup', noBids: 'Belum ada tawaran.',
    wins: 'Kemenangan saya', paid: 'Lunas — terima kasih.', payBy: (d: string) => `Belum membayar — mohon bayar sebelum ${d}.`, pay: 'Bayar sekarang', download: 'Unduh berkas', received: 'Domain diterima',
    eppSent: 'Penjual sudah mengirim kode transfer.', eppWaiting: 'Menunggu kode transfer.', markReceived: 'Domain sudah ada di akun saya', noWins: 'Belum ada kemenangan.',
    sellTitle: 'Jual domain', sellLead: (p: number) => `Anggota hanya menjual nama domain. Buktikan domain milik Anda dengan catatan DNS, tentukan harga minta, dan lelang berjalan 14 hari. Memasang, verifikasi DNS dan lelang ulang gratis; xaa.es mengambil komisi penjualan ${p} % hanya bila terjual, dan Anda menerima ${100 - p} % setelah pembeli menerima domain.`,
    nameFirst: 'Pilih dulu nama penjual Anda (di atas).', step1: 'Buktikan domain milik Anda', verified: 'terverifikasi', pending: 'menunggu DNS',
    recType: 'Jenis', recName: 'Nama / host', orJust: 'sebagian registrar hanya meminta', recValue: 'Nilai', tokenNote: (d: number) => `Token berlaku ${d} hari.`, lastCheck: (w: string) => `Pemeriksaan terakhir: ${w}.`,
    howTo: 'Di mana menambahkan catatan (registrar)',
    registrars: [
      'Cloudflare: DNS → Records → Add record → TXT, Name _xaa-verify, Content nilai di atas.',
      'Namecheap: Domain List → Manage → Advanced DNS → Add new record → TXT Record, Host _xaa-verify.',
      'GoDaddy: My Products → DNS → Add → TXT, Name _xaa-verify.',
      'Niagahoster, Rumahweb, Domainesia, Hostinger, Spaceship, Porkbun: DNS / zone editor → catatan TXT baru dengan nama dan nilai yang sama.',
      'Perubahan DNS biasanya terlihat dalam beberapa menit; sebagian registrar butuh sampai satu jam.',
    ],
    step2: 'Lelang selama 14 hari', step2Wait: 'Domain terverifikasi muncul di sini (bukti berlaku 7 hari; periksa lagi bila sudah lewat).',
    myLots: 'Lot saya', noLots: 'Belum ada yang dipasang.', lotLine: (p: string, n: number, e: string) => `${p} · ${n} tawaran · berakhir ${e}`,
    status: { open: 'Berjalan', awaiting_payment: 'Dimenangkan — menunggu pembayaran', sold: 'Terjual', unsold: 'Berakhir tidak terjual', cancelled: 'Ditarik', draft: 'Draf' } as Record<string, string>,
    sendEpp: 'Terjual dan lunas: kirim kode transfer (EPP) ke pembeli atau push domain ke akun registrarnya, lalu tandai di sini.', markEpp: 'Kode transfer terkirim',
    payout: (f: string, cm: string, s: string, st: string) => `Harga akhir ${f} · komisi ${cm} · Anda menerima ${s} — ${st}`,
    payoutStatus: { awaiting_handover: 'dibayar setelah pembeli mengonfirmasi domain', due: 'sedang dibayarkan', paid: 'sudah dibayar' } as Record<string, string>,
    payoutTitle: 'Data pembayaran', pageTitle: 'Halaman penjual Anda', pageLead: 'Halaman di xaa.es berisi semua domain Anda yang sedang dilelang, seperti toko di Sedo. Bagikan tautannya di mana saja.',
  },
} satisfies Record<Lang, unknown>;
