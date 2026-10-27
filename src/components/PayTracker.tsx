import type { Lang } from '@/lib/i18n';
import { pick } from '@/lib/i18n';

/**
 * Where a manual payment stands (docs/BLUEPRINT.md §12.3 step 5): ordered → sent → checked → unlocked, or sent
 * back with what to fix. Server-rendered; the page reloads it after every submission and every admin decision.
 */
export type PayStage = 'due' | 'sent' | 'approved' | 'attention';

export function PayTracker({ lang, stage, note, sentLine, unlocked }: { lang: Lang; stage: PayStage; note?: string | null; sentLine?: string | null; unlocked: string }) {
  const L = pick(lang, {
    en: { title: 'Payment status', s: ['Invoice ready', 'Payment sent', 'Checked by xaa.es', unlocked], attention: 'Needs your attention', due: 'Choose a way to pay below and send the exact amount.', sent: 'We are checking your payment — usually within a few hours, at most one business day. Nothing else to do.', ok: 'Payment approved. Thank you!', fix: 'Fix it and submit again below:' },
    es: { title: 'Estado del pago', s: ['Factura lista', 'Pago enviado', 'Revisado por xaa.es', unlocked], attention: 'Requiere tu atención', due: 'Elige abajo cómo pagar y envía el importe exacto.', sent: 'Estamos revisando tu pago: normalmente en pocas horas, como mucho un día hábil. No tienes que hacer nada más.', ok: 'Pago aprobado. ¡Gracias!', fix: 'Corrígelo y vuelve a enviarlo abajo:' },
    id: { title: 'Status pembayaran', s: ['Tagihan siap', 'Pembayaran dikirim', 'Dicek oleh xaa.es', unlocked], attention: 'Perlu perhatian Anda', due: 'Pilih cara bayar di bawah dan kirim jumlah persisnya.', sent: 'Kami sedang mengecek pembayaran Anda — biasanya beberapa jam, paling lama satu hari kerja. Tidak ada lagi yang perlu dilakukan.', ok: 'Pembayaran disetujui. Terima kasih!', fix: 'Perbaiki lalu kirim ulang di bawah:' },
  });
  const reached = stage === 'approved' ? 4 : stage === 'sent' ? 2 : stage === 'attention' ? 2 : 1;
  return (
    <section className="panel mt-6 p-5" data-testid="pay-tracker" data-stage={stage} aria-label={L.title}>
      <h2 className="text-xs font-extrabold uppercase tracking-wide text-steel-500">{L.title}</h2>
      <ol className="mt-3 grid grid-cols-4 gap-2">
        {L.s.map((label, i) => {
          const done = i < reached;
          const warn = stage === 'attention' && i === 1;
          return (
            <li key={label} className="text-center">
              <span
                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold transition motion-reduce:transition-none ${warn ? 'bg-amber-500 text-white' : done ? 'bg-[color:var(--accent)] text-white' : 'bg-[color:var(--surface)] text-steel-500'}`}
                aria-current={i === reached - 1 ? 'step' : undefined}
              >
                {warn ? '!' : done ? '✓' : i + 1}
              </span>
              <span className={`mt-1 block text-[11px] leading-tight ${done ? 'font-bold' : 'text-steel-500'}`}>{warn ? L.attention : label}</span>
            </li>
          );
        })}
      </ol>
      <p className={`mt-3 text-sm ${stage === 'attention' ? 'font-semibold text-amber-800' : 'text-steel-600'}`}>
        {stage === 'due' ? L.due : stage === 'sent' ? L.sent : stage === 'approved' ? L.ok : L.fix}
      </p>
      {stage === 'attention' && note ? <p className="mt-1 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-100" data-testid="pay-attention">{note}</p> : null}
      {sentLine && stage !== 'due' ? <p className="mt-2 font-mono text-xs text-steel-500">{sentLine}</p> : null}
    </section>
  );
}
