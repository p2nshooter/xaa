import type { Lang } from '@/lib/i18n';

/**
 * The seven stages of an XAA build, in order.
 *
 * Shared by the marketing pages and by the portal's stepper, so what we
 * promise on /process is literally the same list the client watches tick over
 * inside their project. English is canonical (keys + logic); localisedStages()
 * returns the same list with hand-written Spanish or Indonesian labels.
 */
export const STAGES = [
  { key: 'order', name: 'Order placed', blurb: 'Package selected and project opened.' },
  { key: 'deposit', name: '10% deposit', blurb: 'Booking deposit confirmed, slot reserved.' },
  { key: 'brief', name: 'Concept upload', blurb: 'You upload the concept, references and content.' },
  { key: 'schedule', name: 'Delivery date issued', blurb: 'We confirm scope and publish the completion estimate.' },
  { key: 'production', name: '40% — production', blurb: 'Cumulative 50% paid; the build runs to 80%.' },
  { key: 'settlement', name: '50% — settlement', blurb: 'At 75–80% progress the balance is settled.' },
  { key: 'delivery', name: 'Handover at 100%', blurb: 'Final build, deployment, training and source handover.' },
] as const;

export type StageKey = (typeof STAGES)[number]['key'];

type StageText = { name: string; blurb: string };

const STAGE_I18N: Record<Exclude<Lang, 'en'>, Record<StageKey, StageText>> = {
  es: {
    order: { name: 'Pedido realizado', blurb: 'Paquete elegido y proyecto abierto.' },
    deposit: { name: 'Depósito del 10%', blurb: 'Depósito de reserva confirmado, turno reservado.' },
    brief: { name: 'Subida del concepto', blurb: 'Subes el concepto, las referencias y el contenido.' },
    schedule: { name: 'Fecha de entrega emitida', blurb: 'Confirmamos el alcance y publicamos la fecha estimada.' },
    production: { name: '40% — producción', blurb: 'Acumulado del 50% pagado; el desarrollo avanza hasta el 80%.' },
    settlement: { name: '50% — liquidación', blurb: 'Al 75–80% de avance se liquida el saldo.' },
    delivery: { name: 'Entrega al 100%', blurb: 'Build final, despliegue, formación y entrega del código.' },
  },
  id: {
    order: { name: 'Pesanan dibuat', blurb: 'Paket dipilih dan proyek dibuka.' },
    deposit: { name: 'DP 10%', blurb: 'DP pemesanan dikonfirmasi, slot dipesan.' },
    brief: { name: 'Unggah konsep', blurb: 'Anda mengunggah konsep, referensi, dan konten.' },
    schedule: { name: 'Tanggal selesai terbit', blurb: 'Kami kunci ruang lingkup dan umumkan perkiraan selesai.' },
    production: { name: '40% — produksi', blurb: 'Total 50% dibayar; pengerjaan berjalan hingga 80%.' },
    settlement: { name: '50% — pelunasan', blurb: 'Pada progres 75–80% sisa dilunasi.' },
    delivery: { name: 'Serah terima 100%', blurb: 'Build final, deployment, pelatihan, dan serah terima kode.' },
  },
};

/** The seven stages with labels in the chosen language. */
export function localisedStages(lang: Lang): { key: StageKey; name: string; blurb: string }[] {
  return STAGES.map((s) => {
    const t = lang === 'en' ? undefined : STAGE_I18N[lang]?.[s.key];
    return { key: s.key, name: t?.name ?? s.name, blurb: t?.blurb ?? s.blurb };
  });
}
