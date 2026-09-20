'use client';

import { useFormStatus } from 'react-dom';

/** A submit button that disables and relabels itself while the action runs. */
export function Submit({
  children,
  pendingLabel = 'Working…',
  className = 'btn btn-primary',
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}

export function Notice({ error, ok }: { error?: string; ok?: string }) {
  if (error) return <p className="form-error" role="alert">{error}</p>;
  if (ok) return <p className="form-ok" role="status">{ok}</p>;
  return null;
}
