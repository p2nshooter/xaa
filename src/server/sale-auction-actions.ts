'use server';

import { revalidatePath } from 'next/cache';
import { currentUser } from './auth';
import { data } from './data';
import { getSale, usdWhole } from './sale';
import { saveSetting } from './settings';
import type { ActionState } from './actions';
import { cancelRound, decideBidder, latestRound, markRoundSold, passRound, placeSaleBid, registerBidder, startRound, type BidderProblem, type SaleBidError } from './sale-auction-store';
import { ladderPrice, nextMinBid } from './sale-auction-terms';
import { settleAndReport, tellOwner } from './sale-auction';

/**
 * The server actions of the xaa.es auction (docs/BLUEPRINT.md §14). Members register and bid; the admin runs the
 * rounds, approves bidders and marks a won round sold. Every action checks who is calling in the function that writes.
 */

const str = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === 'string' ? v.trim() : '';
};
const langOf = (form: FormData) => (['en', 'es', 'id'].includes(str(form, 'lang')) ? str(form, 'lang') : 'en') as 'en' | 'es' | 'id';
const T = (lang: string, en: string, es: string, id: string) => (lang === 'es' ? es : lang === 'id' ? id : en);
const refresh = () => { for (const p of ['/acquire', '/portal/admin/sale']) revalidatePath(p); };
const isRedirect = (err: unknown) => typeof err === 'object' && err !== null && 'digest' in err && String((err as { digest?: string }).digest).startsWith('NEXT_REDIRECT');
const fail = (err: unknown): ActionState => {
  if (isRedirect(err)) throw err;
  return { error: err instanceof Error && err.message.length < 200 ? err.message : 'Something went wrong. Please try again.' };
};

const REG_ERR: Record<BidderProblem, [string, string, string]> = {
  length: ['Choose a name of at least 2 characters.', 'Elige un nombre de al menos 2 caracteres.', 'Pilih nama minimal 2 karakter.'],
  chars: ['Use letters, digits, spaces and . , & \' ( ) - only in the name.', 'Usa solo letras, cifras, espacios y . , & \' ( ) - en el nombre.', 'Gunakan huruf, angka, spasi dan . , & \' ( ) - saja pada nama.'],
  contact: ['No e-mail addresses, links or phone numbers in the name.', 'Sin correos, enlaces ni teléfonos en el nombre.', 'Nama tidak boleh berisi e-mail, tautan atau nomor telepon.'],
  abuse: ['Please choose a different name.', 'Elige otro nombre, por favor.', 'Silakan pilih nama lain.'],
  brand: ['The name cannot be another company\'s brand.', 'El nombre no puede ser la marca de otra empresa.', 'Nama tidak boleh memakai merek perusahaan lain.'],
  phone: ['Enter a phone or WhatsApp number the owner can call.', 'Indica un teléfono o WhatsApp al que pueda llamar el propietario.', 'Masukkan nomor telepon atau WhatsApp yang bisa dihubungi pemilik.'],
  country: ['Enter your country.', 'Indica tu país.', 'Masukkan negara Anda.'],
};
const BID_ERR: Record<Exclude<SaleBidError, 'too_low'>, [string, string, string]> = {
  admin: ['Administrators run the sale and cannot bid.', 'Los administradores dirigen la venta y no pueden pujar.', 'Admin menjalankan penjualan dan tidak bisa menawar.'],
  sale_closed: ['The auction is not open at the moment.', 'La subasta no está abierta en este momento.', 'Lelang sedang tidak dibuka.'],
  not_registered: ['Register as a bidder first.', 'Primero regístrate como pujador.', 'Daftar sebagai penawar terlebih dahulu.'],
  pending: ['Your registration is waiting for the owner\'s approval.', 'Tu registro espera la aprobación del propietario.', 'Pendaftaran Anda menunggu persetujuan pemilik.'],
  rejected: ['Your registration was not approved — contact the owner.', 'Tu registro no fue aprobado: contacta con el propietario.', 'Pendaftaran Anda tidak disetujui — hubungi pemilik.'],
  not_found: ['No round is open yet.', 'Todavía no hay ninguna ronda abierta.', 'Belum ada putaran yang dibuka.'],
  closed: ['This round has closed.', 'Esta ronda está cerrada.', 'Putaran ini sudah ditutup.'],
  not_started: ['This round has not started yet.', 'Esta ronda aún no ha empezado.', 'Putaran ini belum dimulai.'],
  ended: ['This round has ended.', 'Esta ronda ha terminado.', 'Putaran ini sudah berakhir.'],
  bad_amount: ['Enter the bid in whole US dollars, digits only.', 'Indica la puja en dólares enteros, solo cifras.', 'Masukkan tawaran dalam dolar AS bulat, angka saja.'],
  already_highest: ['You already hold the highest bid.', 'Ya tienes la puja más alta.', 'Anda sudah memegang tawaran tertinggi.'],
  too_high: ['That bid is above the limit for one bid — check the zeros.', 'Esa puja supera el límite por puja: revisa los ceros.', 'Tawaran melebihi batas satu tawaran — periksa jumlah nolnya.'],
};

/** A member registers to bid for xaa.es. */
export async function registerSaleBidderAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const lang = langOf(form);
  try {
    const user = await currentUser();
    if (!user) return { error: T(lang, 'Please sign in first.', 'Inicia sesión primero.', 'Silakan masuk terlebih dahulu.') };
    if (user.role === 'admin') return { error: BID_ERR.admin[lang === 'es' ? 1 : lang === 'id' ? 2 : 0] };
    const sale = await getSale();
    if (sale.mode !== 'auction' || sale.status !== 'open') return { error: BID_ERR.sale_closed[lang === 'es' ? 1 : lang === 'id' ? 2 : 0] };
    const input = { displayName: str(form, 'displayName'), company: str(form, 'company'), country: str(form, 'country'), phone: str(form, 'phone'), funds: str(form, 'funds'), message: str(form, 'message') };
    const r = await registerBidder(await data(), { id: user.id, email: user.email }, input, sale.auction.approval);
    if ('error' in r) return { error: REG_ERR[r.error][lang === 'es' ? 1 : lang === 'id' ? 2 : 0], values: input };
    if (r.isNew) {
      await tellOwner({
        name: r.bidder.display_name, email: user.email, company: r.bidder.company, packageSlug: 'site-auction-bidder', thread: true, lang,
        message: `[xaa.es auction] New bidder${r.bidder.status === 'pending' ? ' to approve in Studio desk → Site auction' : ' (approved automatically)'}: ` +
          `${r.bidder.display_name} · ${user.email} · ${r.bidder.company || '—'} · ${r.bidder.country} · ${r.bidder.phone}` +
          `${r.bidder.funds ? `\nProof of funds / financing: ${r.bidder.funds}` : ''}${r.bidder.message ? `\nMessage: ${r.bidder.message}` : ''}`,
      });
    }
    refresh();
    return { ok: r.bidder.status === 'approved'
      ? T(lang, 'You are registered — you can bid now.', 'Registrado: ya puedes pujar.', 'Anda terdaftar — sekarang bisa menawar.')
      : T(lang, 'Thank you — your registration is waiting for the owner\'s approval.', 'Gracias: tu registro espera la aprobación del propietario.', 'Terima kasih — pendaftaran Anda menunggu persetujuan pemilik.') };
  } catch (err) {
    return fail(err);
  }
}

/** A bid. Every bid is binding. */
export async function placeSaleBidAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const lang = langOf(form);
  const L = lang === 'es' ? 1 : lang === 'id' ? 2 : 0;
  try {
    const user = await currentUser();
    if (!user) return { error: T(lang, 'Please sign in first.', 'Inicia sesión primero.', 'Silakan masuk terlebih dahulu.') };
    const sale = await getSale();
    await settleAndReport(sale);
    const d = await data();
    const r = await placeSaleBid(d, { id: user.id, email: user.email, role: user.role }, str(form, 'amount'), sale);
    if ('error' in r) {
      if (r.error === 'too_low') {
        const cur = await latestRound(d);
        const min = usdWhole(cur ? nextMinBid(cur, ladderPrice(sale.auction)) : ladderPrice(sale.auction));
        return { error: T(lang, `The lowest bid accepted now is ${min}.`, `La puja mínima aceptada ahora es ${min}.`, `Tawaran terendah yang diterima sekarang ${min}.`) };
      }
      return { error: BID_ERR[r.error][L] };
    }
    await tellOwner({
      name: r.bid.display_name, email: user.email, company: r.bid.company, budget: usdWhole(r.bid.amount_usd), packageSlug: 'site-auction-bid',
      message: `[xaa.es auction] Bid ${usdWhole(r.bid.amount_usd)} by ${r.bid.display_name} (${user.email}) in round ${r.round.no}. Bids: ${r.round.bids_count}. Ends ${r.round.ends_at.slice(0, 16).replace('T', ' ')} UTC${r.extended ? ' (extended by a late bid)' : ''}.`,
    });
    refresh();
    return { ok: T(lang, 'Your bid is placed — you hold the highest bid.', 'Puja registrada: tienes la puja más alta.', 'Tawaran Anda masuk — Anda memegang tawaran tertinggi.') + (r.extended ? T(lang, ' Your late bid extended the round.', ' Tu puja tardía amplió la ronda.', ' Tawaran akhir Anda memperpanjang putaran.') : '') };
  } catch (err) {
    return fail(err);
  }
}

/* ---- the admin ---------------------------------------------------------------------------- */

async function admin() {
  const user = await currentUser();
  if (!user || user.role !== 'admin') throw new Error('Not authorised.');
  return user;
}

export async function saleAuctionAdminAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    const me = await admin();
    const d = await data();
    const action = str(form, 'action');
    const id = str(form, 'id');
    if (action === 'start') {
      const sale = await getSale();
      if (sale.mode !== 'auction' || sale.status !== 'open') return { error: 'Set the sale to auction and open first (Settings → Sale of xaa.es).' };
      const r = await startRound(d, sale.auction, me.email, Date.now());
      if (!r) return { error: 'A round is already running or awaiting the winner — cancel or finish it first.' };
      refresh();
      return { ok: `Round ${r.no} is open with an opening bid of ${usdWhole(r.open_usd)}.` };
    }
    if (action === 'cancel') {
      const r = await cancelRound(d, id, str(form, 'note'));
      if ('error' in r) return { error: r.error };
      refresh();
      return { ok: 'Round cancelled.' };
    }
    if (action === 'pass') {
      const r = await passRound(d, id);
      if ('error' in r) return { error: r.error };
      if (r.status === 'awaiting_payment') {
        await tellOwner({ name: r.winner_name, email: r.winner_email, budget: usdWhole(r.winner_usd), packageSlug: 'site-auction-won', thread: true,
          message: `[xaa.es auction] Round ${r.no} passed to the next bidder: ${r.winner_name} (${r.winner_email}) at ${usdWhole(r.winner_usd)}, to close by ${r.pay_by.slice(0, 10)}.` });
      }
      refresh();
      return { ok: r.status === 'awaiting_payment' ? `Passed to ${r.winner_name} at ${usdWhole(r.winner_usd)}.` : 'No other bidder — the round ended unsold.' };
    }
    if (action === 'sold') {
      const r = await markRoundSold(d, id, str(form, 'note'));
      if ('error' in r) return { error: r.error };
      await saveSetting('sale_status', 'sold', me.email);
      refresh();
      revalidatePath('/');
      return { ok: `Round ${r.no} sold to ${r.winner_name} at ${usdWhole(r.winner_usd)}; the sale is marked sold.` };
    }
    if (action === 'approve' || action === 'reject') {
      const r = await decideBidder(d, id, action === 'approve', me.email);
      if ('error' in r) return { error: r.error };
      refresh();
      return { ok: `${r.display_name}: ${r.status}.` };
    }
    return { error: 'Unknown action.' };
  } catch (err) {
    return fail(err);
  }
}
