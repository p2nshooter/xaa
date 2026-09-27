'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supportReplyAction, supportStatusAction, supportPresenceAction, type ActionState } from '@/server/actions';
import { Submit, Notice } from './Submit';

/** Keeps the admin "online" (the AI stays quiet) and refreshes new messages. */
export function SupportLive() {
  const router = useRouter();
  useEffect(() => {
    void supportPresenceAction();
    const beat = setInterval(() => { if (document.visibilityState === 'visible') void supportPresenceAction(); }, 20_000);
    const refresh = setInterval(() => { if (document.visibilityState === 'visible') router.refresh(); }, 12_000);
    return () => { clearInterval(beat); clearInterval(refresh); };
  }, [router]);
  return null;
}

export function SupportReplyForm({ threadId }: { threadId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(supportReplyAction, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="mt-4">
      <Notice error={state.error} />
      <input type="hidden" name="threadId" value={threadId} />
      <textarea name="body" className="textarea w-full" rows={3} required maxLength={4000} placeholder="Reply as the studio…" />
      <div className="mt-2 flex justify-end">
        <Submit className="btn btn-primary btn-sm" pendingLabel="Sending…">Send reply</Submit>
      </div>
    </form>
  );
}

export function SupportStatusButton({ threadId, status }: { threadId: string; status: 'open' | 'closed' }) {
  const [, action] = useActionState<ActionState, FormData>(supportStatusAction, {});
  return (
    <form action={action}>
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="status" value={status === 'open' ? 'closed' : 'open'} />
      <Submit className="btn btn-ghost btn-sm" pendingLabel="…">{status === 'open' ? 'Close conversation' : 'Reopen'}</Submit>
    </form>
  );
}
