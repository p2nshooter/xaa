'use client';

import { useActionState, useState } from 'react';
import {
  saveAiKeyAction, clearAiKeyAction, setScheduleAction, runBackupAction, runRecoveryOpAction,
  revealAiKeyAction, type ActionState, type RevealState,
} from '@/server/actions';
import { pick, type Lang } from '@/lib/i18n';
import { Submit, Notice } from './Submit';

export type RecoveryConfig = { provider: string; hasKey: boolean; schedule: string[]; updatedAt: string | null };
export type RecoveryEventView = {
  id: string; kind: string; cadence: string | null; detail: string | null;
  status: string; actor: string; created_at: string; bytes: number | null;
};

type Copy = {
  title: string; intro: string;
  keyTitle: string; provider: string; apiKey: string; keyHint: string; save: string; saving: string;
  keyStored: string; noKey: string; remove: string; removing: string; show: string; hide: string;
  schedTitle: string; schedHint: string; daily: string; weekly: string; monthly: string; armed: string; saveSched: string;
  opsTitle: string; backupNow: string; backupDaily: string; backupWeekly: string; backupMonthly: string;
  restore: string; reset: string; webfix: string; running: string;
  confirmReset: string; confirmRestore: string; noteLabel: string;
  logTitle: string; logEmpty: string;
  procTitle: string; procIntro: string; procSteps: string[]; procNote: string;
  kinds: Record<string, string>;
};

const COPY: Record<Lang, Copy> = {
  en: {
    title: 'AI Backup & Recovery', intro: 'Back up, restore, reset the database and run an AI web-fix — one click, on your own AI key. Every action is recorded below.',
    keyTitle: 'Your AI API key', provider: 'Provider', apiKey: 'API key', keyHint: 'Stored encrypted. Our premium repair-and-recovery prompt is applied server-side; your key is never shown back to you.',
    save: 'Save key', saving: 'Saving…', keyStored: 'Key stored — recovery is armed', noKey: 'No key yet — add one to arm recovery', remove: 'Remove key', removing: 'Removing…', show: 'Show (admin)', hide: 'Hide',
    schedTitle: 'Automatic backups', schedHint: 'On top of the one-click buttons. Choose the cadences to run automatically.', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', armed: 'Armed', saveSched: 'Save schedule',
    opsTitle: 'Run now', backupNow: 'Back up now', backupDaily: 'Daily backup', backupWeekly: 'Weekly backup', backupMonthly: 'Monthly backup',
    restore: 'Restore (recovery)', reset: 'Reset — empty database', webfix: 'AI web-fix', running: 'Working…',
    confirmReset: 'I understand this empties the database', confirmRestore: 'Restore from the latest saved point', noteLabel: 'Note (optional)',
    logTitle: 'Backup & recovery log', logEmpty: 'Nothing run yet.',
    procTitle: 'Operating procedure (recorded)', procIntro: 'The documented procedure this project follows. Every step writes to the log above and to the activity log.',
    procSteps: [
      '1. At setup, the AI backup-and-recovery system is installed into the site, wired to its database and hosting.',
      '2. The client pastes their AI API key here. It is encrypted at rest; the premium repair prompt is applied server-side.',
      '3. Backups run one-click (daily / weekly / monthly / on demand) or on the armed schedule. A JSON snapshot is stored and logged.',
      '4. Restore rolls back to a saved point; a safety snapshot is taken first.',
      '5. Reset empties the database when a clean slate is wanted.',
      '6. AI web-fix repairs the live site on the client key, guided by the premium prompt.',
      '7. Every backup, restore, reset, web-fix, key change and schedule change is written to the ledger — who, what, when, and the result.',
    ],
    procNote: 'There is no 24/7 SLA and no monthly retainer: the system is installed once and self-served, and this log is the record.',
    kinds: { backup: 'Backup', restore: 'Recovery', reset: 'Database reset', 'web-fix': 'AI web-fix', schedule: 'Schedule', 'key-set': 'AI key set', 'key-clear': 'AI key removed' },
  },
  es: {
    title: 'Backup y Recuperación IA', intro: 'Respalda, restaura, resetea la base de datos y ejecuta un web-fix IA — un clic, sobre tu propia API key. Cada acción queda registrada abajo.',
    keyTitle: 'Tu API key de IA', provider: 'Proveedor', apiKey: 'API key', keyHint: 'Guardada cifrada. Nuestro prompt premium de reparación se aplica en el servidor; tu key nunca se te muestra de vuelta.',
    save: 'Guardar key', saving: 'Guardando…', keyStored: 'Key guardada — recuperación armada', noKey: 'Aún sin key — añade una para armar la recuperación', remove: 'Quitar key', removing: 'Quitando…', show: 'Mostrar (admin)', hide: 'Ocultar',
    schedTitle: 'Backups automáticos', schedHint: 'Además de los botones. Elige las cadencias que se ejecutan solas.', daily: 'Diario', weekly: 'Semanal', monthly: 'Mensual', armed: 'Armado', saveSched: 'Guardar horario',
    opsTitle: 'Ejecutar ahora', backupNow: 'Respaldar ahora', backupDaily: 'Backup diario', backupWeekly: 'Backup semanal', backupMonthly: 'Backup mensual',
    restore: 'Restaurar (recuperación)', reset: 'Resetear — vaciar base de datos', webfix: 'Web-fix IA', running: 'Trabajando…',
    confirmReset: 'Entiendo que esto vacía la base de datos', confirmRestore: 'Restaurar desde el último punto guardado', noteLabel: 'Nota (opcional)',
    logTitle: 'Registro de backup y recuperación', logEmpty: 'Nada ejecutado aún.',
    procTitle: 'Procedimiento operativo (registrado)', procIntro: 'El procedimiento documentado que sigue este proyecto. Cada paso se escribe en el registro de arriba y en el de actividad.',
    procSteps: [
      '1. En la puesta en marcha se instala el sistema de backup y recuperación IA en el sitio, conectado a su base de datos y hosting.',
      '2. El cliente pega aquí su API key de IA. Se cifra en reposo; el prompt premium se aplica en el servidor.',
      '3. Los backups se ejecutan con un clic (diario / semanal / mensual / a demanda) o por el horario armado. Se guarda y registra un snapshot JSON.',
      '4. Restaurar vuelve a un punto guardado; primero se toma una copia de seguridad.',
      '5. Resetear vacía la base de datos cuando se quiere empezar de cero.',
      '6. El web-fix IA repara el sitio en vivo con la key del cliente, guiado por el prompt premium.',
      '7. Cada backup, restauración, reseteo, web-fix, cambio de key y de horario se escribe en el registro — quién, qué, cuándo y el resultado.',
    ],
    procNote: 'No hay SLA 24/7 ni retención mensual: el sistema se instala una vez y se autogestiona, y este registro es la constancia.',
    kinds: { backup: 'Backup', restore: 'Recuperación', reset: 'Reseteo de base de datos', 'web-fix': 'Web-fix IA', schedule: 'Horario', 'key-set': 'Key IA guardada', 'key-clear': 'Key IA quitada' },
  },
  id: {
    title: 'Backup & Recovery AI', intro: 'Backup, restore, reset database, dan jalankan web-fix AI — satu klik, di atas API key AI Anda. Tiap aksi tercatat di bawah.',
    keyTitle: 'API key AI Anda', provider: 'Penyedia', apiKey: 'API key', keyHint: 'Disimpan terenkripsi. Prompt perbaikan premium kami diterapkan di server; key Anda tak pernah ditampilkan kembali.',
    save: 'Simpan key', saving: 'Menyimpan…', keyStored: 'Key tersimpan — recovery aktif', noKey: 'Belum ada key — tambahkan untuk mengaktifkan recovery', remove: 'Hapus key', removing: 'Menghapus…', show: 'Tampilkan (admin)', hide: 'Sembunyikan',
    schedTitle: 'Backup otomatis', schedHint: 'Di samping tombol. Pilih irama yang berjalan otomatis.', daily: 'Harian', weekly: 'Mingguan', monthly: 'Bulanan', armed: 'Aktif', saveSched: 'Simpan jadwal',
    opsTitle: 'Jalankan sekarang', backupNow: 'Backup sekarang', backupDaily: 'Backup harian', backupWeekly: 'Backup mingguan', backupMonthly: 'Backup bulanan',
    restore: 'Restore (recovery)', reset: 'Reset — kosongkan database', webfix: 'Web-fix AI', running: 'Memproses…',
    confirmReset: 'Saya paham ini mengosongkan database', confirmRestore: 'Pulihkan dari titik tersimpan terakhir', noteLabel: 'Catatan (opsional)',
    logTitle: 'Log backup & recovery', logEmpty: 'Belum ada yang dijalankan.',
    procTitle: 'Prosedur operasi (tercatat)', procIntro: 'Prosedur terdokumentasi yang diikuti proyek ini. Tiap langkah ditulis ke log di atas dan ke log aktivitas.',
    procSteps: [
      '1. Saat setup, sistem backup dan recovery AI dipasang ke situs, terhubung ke database dan hosting-nya.',
      '2. Klien menempel API key AI mereka di sini. Terenkripsi saat disimpan; prompt perbaikan premium diterapkan di server.',
      '3. Backup berjalan satu klik (harian / mingguan / bulanan / sesuai permintaan) atau lewat jadwal aktif. Snapshot JSON disimpan dan dicatat.',
      '4. Restore mengembalikan ke titik tersimpan; snapshot pengaman diambil dulu.',
      '5. Reset mengosongkan database saat ingin memulai bersih.',
      '6. Web-fix AI memperbaiki situs langsung di atas key klien, dipandu prompt premium.',
      '7. Tiap backup, restore, reset, web-fix, perubahan key, dan jadwal ditulis ke ledger — siapa, apa, kapan, dan hasilnya.',
    ],
    procNote: 'Tidak ada SLA 24/7 dan tidak ada biaya bulanan: sistem dipasang sekali dan dijalankan sendiri, dan log ini adalah catatannya.',
    kinds: { backup: 'Backup', restore: 'Recovery', reset: 'Reset database', 'web-fix': 'Web-fix AI', schedule: 'Jadwal', 'key-set': 'Key AI disimpan', 'key-clear': 'Key AI dihapus' },
  },
};

const PROVIDERS = ['openai', 'anthropic', 'gemini', 'openrouter', 'custom'];

function OpButton({ action, hidden, label, running, projectId, extra }: {
  action: (p: ActionState, f: FormData) => Promise<ActionState>; hidden: Record<string, string>;
  label: string; running: string; projectId: string; extra?: React.ReactNode;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  return (
    <form action={formAction} className="contents">
      <input type="hidden" name="projectId" value={projectId} />
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {extra}
      <Submit pendingLabel={running} className="btn btn-ghost btn-sm">{label}</Submit>
      {state.error ? <span className="w-full text-xs text-red-600">{state.error}</span> : null}
      {state.ok ? <span className="w-full text-xs text-green-700">{state.ok}</span> : null}
    </form>
  );
}

export function RecoveryPanel({ projectId, config, events, isAdmin, lang = 'en' }: {
  projectId: string; config: RecoveryConfig; events: RecoveryEventView[]; isAdmin: boolean; lang?: Lang;
}) {
  const c = pick(lang, COPY);
  const [keyState, keyAction] = useActionState<ActionState, FormData>(saveAiKeyAction, {});
  const [schedState, schedAction] = useActionState<ActionState, FormData>(setScheduleAction, {});
  const [clearState, clearAction] = useActionState<ActionState, FormData>(clearAiKeyAction, {});

  return (
    <section className="panel p-6">
      <h2 className="font-display text-lg font-extrabold">{c.title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-steel-500">{c.intro}</p>

      {/* Key */}
      <div className="mt-5 rounded-lg bg-[color:var(--surface)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-extrabold uppercase tracking-wide text-steel-500">{c.keyTitle}</p>
          <span className={`badge ${config.hasKey ? 'badge-green' : 'badge-amber'}`}>{config.hasKey ? c.keyStored : c.noKey}</span>
        </div>
        <form action={keyAction} className="mt-3">
          <Notice error={keyState.error} ok={keyState.ok} />
          <input type="hidden" name="projectId" value={projectId} />
          <div className="grid gap-x-4 sm:grid-cols-[160px_1fr]">
            <label className="field">
              <span>{c.provider}</span>
              <select name="provider" className="select" defaultValue={config.provider}>
                {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label className="field">
              <span>{c.apiKey}</span>
              <input name="apiKey" type="password" className="input" autoComplete="off" placeholder="sk-…" />
            </label>
          </div>
          <p className="hint">{c.keyHint}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Submit pendingLabel={c.saving} className="btn btn-primary btn-sm">{c.save}</Submit>
            {isAdmin && config.hasKey ? <RevealKey projectId={projectId} show={c.show} hide={c.hide} /> : null}
          </div>
        </form>
        {config.hasKey ? (
          <form action={clearAction} className="mt-2">
            <input type="hidden" name="projectId" value={projectId} />
            <Submit pendingLabel={c.removing} className="btn btn-ghost btn-sm">{c.remove}</Submit>
            {clearState.ok ? <span className="ml-2 text-xs text-green-700">{clearState.ok}</span> : null}
          </form>
        ) : null}
      </div>

      {/* Schedule */}
      <div className="mt-4 rounded-lg bg-[color:var(--surface)] p-4">
        <p className="text-xs font-extrabold uppercase tracking-wide text-steel-500">{c.schedTitle}</p>
        <p className="mt-1 text-xs text-steel-500">{c.schedHint}</p>
        <form action={schedAction} className="mt-2 flex flex-wrap items-center gap-4">
          <input type="hidden" name="projectId" value={projectId} />
          {(['daily', 'weekly', 'monthly'] as const).map((cad) => (
            <label key={cad} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="cadence" value={cad} defaultChecked={config.schedule.includes(cad)} />
              {cad === 'daily' ? c.daily : cad === 'weekly' ? c.weekly : c.monthly}
            </label>
          ))}
          <Submit pendingLabel={c.saving} className="btn btn-ghost btn-sm">{c.saveSched}</Submit>
          {schedState.ok ? <span className="text-xs text-green-700">{schedState.ok}</span> : null}
        </form>
      </div>

      {/* Operations */}
      <div className="mt-4">
        <p className="text-xs font-extrabold uppercase tracking-wide text-steel-500">{c.opsTitle}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <OpButton action={runBackupAction} hidden={{ cadence: 'now' }} label={c.backupNow} running={c.running} projectId={projectId} />
          <OpButton action={runBackupAction} hidden={{ cadence: 'daily' }} label={c.backupDaily} running={c.running} projectId={projectId} />
          <OpButton action={runBackupAction} hidden={{ cadence: 'weekly' }} label={c.backupWeekly} running={c.running} projectId={projectId} />
          <OpButton action={runBackupAction} hidden={{ cadence: 'monthly' }} label={c.backupMonthly} running={c.running} projectId={projectId} />
          <OpButton action={runRecoveryOpAction} hidden={{ kind: 'web-fix' }} label={c.webfix} running={c.running} projectId={projectId} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <ConfirmOp action={runRecoveryOpAction} kind="restore" label={c.restore} confirm={c.confirmRestore} running={c.running} projectId={projectId} noteLabel={c.noteLabel} />
          <ConfirmOp action={runRecoveryOpAction} kind="reset" label={c.reset} confirm={c.confirmReset} running={c.running} projectId={projectId} danger noteLabel={c.noteLabel} />
        </div>
      </div>

      {/* Ledger */}
      <div className="mt-6">
        <p className="text-xs font-extrabold uppercase tracking-wide text-steel-500">{c.logTitle}</p>
        {events.length === 0 ? (
          <p className="mt-2 text-sm text-steel-500">{c.logEmpty}</p>
        ) : (
          <ol className="mt-2 space-y-2">
            {events.map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[color:var(--accent-soft)] pb-2 text-sm last:border-0">
                <span className="font-semibold">
                  {c.kinds[e.kind] ?? e.kind}{e.cadence ? ` · ${e.cadence}` : ''}
                </span>
                <span className="text-xs text-steel-500">
                  {e.actor} · {new Date(e.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                {e.detail ? <span className="w-full text-xs text-steel-500">{e.detail}</span> : null}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Documented procedure — always available in the project portal */}
      <details className="mt-6 rounded-lg border border-[color:var(--accent-soft)] p-4" open={isAdmin}>
        <summary className="cursor-pointer text-sm font-bold">{c.procTitle}</summary>
        <p className="mt-2 text-xs text-steel-500">{c.procIntro}</p>
        <ol className="mt-3 space-y-1.5 text-sm text-steel-500">
          {c.procSteps.map((s) => <li key={s}>{s}</li>)}
        </ol>
        <p className="mt-3 text-xs font-medium text-ink-900">{c.procNote}</p>
      </details>
    </section>
  );
}

function ConfirmOp({ action, kind, label, confirm, running, projectId, danger, noteLabel }: {
  action: (p: ActionState, f: FormData) => Promise<ActionState>; kind: string; label: string;
  confirm: string; running: string; projectId: string; danger?: boolean; noteLabel: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});
  const [ok, setOk] = useState(false);
  return (
    <form action={formAction} className={`rounded-lg border p-3 ${danger ? 'border-red-200 bg-red-50/40' : 'border-[color:var(--accent-soft)]'}`}>
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="kind" value={kind} />
      <label className="flex items-start gap-2 text-xs text-steel-600">
        <input type="checkbox" className="mt-0.5" checked={ok} onChange={(e) => setOk(e.target.checked)} />
        <span>{confirm}</span>
      </label>
      <input name="note" className="input mt-2 text-sm" placeholder={noteLabel} />
      <Submit pendingLabel={running} className="btn btn-ghost btn-sm mt-2" disabled={!ok}>{label}</Submit>
      {state.error ? <p className="mt-1 text-xs text-red-600">{state.error}</p> : null}
      {state.ok ? <p className="mt-1 text-xs text-green-700">{state.ok}</p> : null}
    </form>
  );
}

function RevealKey({ projectId, show, hide }: { projectId: string; show: string; hide: string }) {
  const [state, formAction] = useActionState<RevealState, FormData>(revealAiKeyAction, {});
  const [open, setOpen] = useState(false);
  return (
    <span className="inline-flex items-center gap-2">
      <form action={formAction} onSubmit={() => setOpen(true)} className="inline">
        <input type="hidden" name="projectId" value={projectId} />
        <button type="submit" className="btn btn-ghost btn-sm">{open && state.value ? hide : show}</button>
      </form>
      {open && state.value ? <code className="break-all rounded bg-ivory-100 px-2 py-0.5 text-xs">{state.value}</code> : null}
      {state.error ? <span className="text-xs text-red-600">{state.error}</span> : null}
    </span>
  );
}
