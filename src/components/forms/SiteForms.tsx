'use client';

import { useActionState } from 'react';
import { companyVisibilityAction, type ActionState } from '@/server/actions';
import { Submit, Notice } from './Submit';

/** Studio desk: the show / hide switch of the Company menu and /company (hidden by default). */
export function CompanyVisibility({ visible }: { visible: boolean }) {
  const [state, act] = useActionState<ActionState, FormData>(companyVisibilityAction, {});
  return (
    <form action={act} className="flex flex-wrap items-center gap-3" data-testid="company-visibility">
      <span className={visible ? 'badge badge-green' : 'badge badge-grey'}>{visible ? 'Shown' : 'Hidden'}</span>
      <input type="hidden" name="visible" value={visible ? 'no' : 'yes'} />
      <Submit className={visible ? 'btn btn-ghost btn-sm' : 'btn btn-dark btn-sm'} pendingLabel="Saving…">{visible ? 'Hide the Company menu' : 'Show the Company menu'}</Submit>
      <Notice error={state.error} ok={state.ok} />
    </form>
  );
}
