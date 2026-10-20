'use client';

import { useActionState } from 'react';
import { backupNowAction, recopyD1Action, restoreBackupAction, type ActionState } from '@/server/actions';
import { Submit, Notice } from './Submit';

/** Admin → Settings → Data storage: take a full backup of the R2 data bucket now. */
export function BackupNow() {
  const [state, action] = useActionState<ActionState, FormData>(backupNowAction, {});
  return (
    <form action={action}>
      <Notice error={state.error} ok={state.ok} />
      <Submit className="btn btn-primary btn-sm" pendingLabel="Backing up…">Back up now</Submit>
    </form>
  );
}

/** Copy again whatever the legacy D1 still holds that R2 does not; nothing in R2 is overwritten. */
export function RecopyD1() {
  const [state, action] = useActionState<ActionState, FormData>(recopyD1Action, {});
  return (
    <form action={action}>
      <Notice error={state.error} ok={state.ok} />
      <Submit className="btn btn-ghost btn-sm" pendingLabel="Checking every row…">Check D1 again and copy anything missing</Submit>
    </form>
  );
}

/**
 * Restore the data bucket from one backup. Deliberately slow to trigger: the
 * admin types RESTORE, and the current state is saved as a backup first, so a
 * restore can itself be undone.
 */
export function RestoreBackup({ backupKey, label }: { backupKey: string; label: string }) {
  const [state, action] = useActionState<ActionState, FormData>(restoreBackupAction, {});
  return (
    <div className="mt-1">
      {/* Outside the disclosure, so the outcome stays visible when the list re-renders. */}
      <Notice error={state.error} ok={state.ok} />
      <details>
        <summary className="cursor-pointer text-xs font-semibold text-steel-500 underline">Restore this backup…</summary>
        <form action={action} className="mt-2 space-y-2 rounded-md border border-red-200 bg-red-50 p-3">
          <input type="hidden" name="key" value={backupKey} />
          <p className="text-xs text-red-800">
            Every record goes back to how it was at {label}. Anything written after that is removed — it is kept in a safety
            backup taken first, so this can be undone. Type <strong>RESTORE</strong> to confirm.
          </p>
          <label className="sr-only" htmlFor={`confirm-${backupKey}`}>Type RESTORE to confirm</label>
          <input id={`confirm-${backupKey}`} name="confirm" autoComplete="off" className="input" style={{ maxWidth: '10rem' }} placeholder="RESTORE" />
          <Submit className="btn btn-sm bg-red-700 text-white hover:bg-red-800" pendingLabel="Restoring…">Restore</Submit>
        </form>
      </details>
    </div>
  );
}
