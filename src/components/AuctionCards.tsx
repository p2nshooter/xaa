import Link from 'next/link';
import { Countdown } from './Countdown';
import { leftText } from '@/lib/time-left';
import { pick, type Lang } from '@/lib/i18n';
import { cardPrice, domainParts, type LotCard } from '@/server/auction-terms';

/** One lot in a list: name, current price, bids, a live countdown and its badges (shared by /auction and the seller pages). */

export const euroIn = (n: number, lang: Lang) => `€${n.toLocaleString(lang === 'es' ? 'es-ES' : lang === 'id' ? 'id-ID' : 'en-GB')}`;

export const TYPE_LABEL: Record<string, { en: string; es: string; id: string }> = {
  website: { en: 'Finished website', es: 'Web terminada', id: 'Website jadi' },
  script: { en: 'Web / script', es: 'Web / script', id: 'Web / script' },
  website_domain: { en: 'Website + domain', es: 'Web + dominio', id: 'Website + domain' },
  domain: { en: 'Domain name', es: 'Nombre de dominio', id: 'Nama domain' },
};

export function LotCardView({ card, lang, nowMs }: { card: LotCard; lang: Lang; nowMs: number }) {
  const c = pick(lang, {
    en: { bids: (n: number) => (n === 1 ? '1 bid' : `${n} bids`), opening: 'Opening bid', current: 'Current bid', left: 'Left', ended: 'Ended', xaa: 'xaa.es', dns: 'DNS verified', bn: 'Buy now', reserveMet: 'Reserve met', noReserve: 'No reserve' },
    es: { bids: (n: number) => (n === 1 ? '1 puja' : `${n} pujas`), opening: 'Puja inicial', current: 'Puja actual', left: 'Quedan', ended: 'Terminado', xaa: 'xaa.es', dns: 'DNS verificado', bn: 'Compra ya', reserveMet: 'Reserva alcanzada', noReserve: 'Sin reserva' },
    id: { bids: (n: number) => `${n} tawaran`, opening: 'Harga buka', current: 'Tawaran saat ini', left: 'Sisa', ended: 'Berakhir', xaa: 'xaa.es', dns: 'DNS terverifikasi', bn: 'Beli langsung', reserveMet: 'Cadangan tercapai', noReserve: 'Tanpa cadangan' },
  });
  const name = card.dom || card.title;
  const { name: label, tld } = domainParts(card.dom || '');
  return (
    <li className="panel flex flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none" data-testid="lot-card">
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="badge badge-grey">{pick(lang, TYPE_LABEL[card.type] ?? TYPE_LABEL.domain)}</span>
        {card.seller === 'member' ? <span className="badge badge-blue">{c.dns}</span> : <span className="badge badge-amber">{c.xaa}</span>}
        {card.bn ? <span className="badge badge-green">{c.bn}</span> : null}
        {card.rs ? (card.rm ? <span className="badge badge-green">{c.reserveMet}</span> : null) : <span className="badge badge-grey">{c.noReserve}</span>}
      </div>
      <Link href={`/auction/${card.ref}`} className="font-display text-lg font-extrabold leading-tight hover:text-gold-500">
        {card.dom ? (<><span>{label}</span><span className="text-steel-400">.{tld}</span></>) : name}
      </Link>
      {card.dom && card.title !== card.dom ? <p className="text-xs text-steel-500">{card.title}</p> : null}
      <div className="mt-auto grid grid-cols-3 gap-2 text-sm">
        <div><p className="text-[10px] font-bold uppercase tracking-wide text-steel-400">{card.bids ? c.current : c.opening}</p><p className="font-semibold">{euroIn(cardPrice(card), lang)}</p></div>
        <div><p className="text-[10px] font-bold uppercase tracking-wide text-steel-400">&nbsp;</p><p>{c.bids(card.bids)}</p></div>
        <div><p className="text-[10px] font-bold uppercase tracking-wide text-steel-400">{c.left}</p><p><Countdown to={card.ends} ended={c.ended} initial={Date.parse(card.ends) > nowMs ? leftText(Date.parse(card.ends) - nowMs) : c.ended} /></p></div>
      </div>
    </li>
  );
}
