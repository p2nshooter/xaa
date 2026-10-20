'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Portal error boundary.
 *
 * In production Next.js strips server error messages before they reach the
 * browser, so this boundary cannot read what went wrong. It asks /api/health
 * instead, which reports whether the R2 data storage is answering and whether
 * the one-time move of the old records into it is still running (a matter of
 * seconds after a deploy). Saying exactly that beats a blank crash page.
 */
interface Health {
  data?: { ok: boolean; migration?: string; error?: string };
  signInReady?: boolean;
}
interface Diagnosis {
  steps?: { step: string; ok: boolean; error?: string }[];
}

export default function PortalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [health, setHealth] = useState<Health | null>(null);
  const [diag, setDiag] = useState<Diagnosis | null>(null);

  useEffect(() => {
    console.error(error);
    fetch('/api/health', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({}));
    // Admins only (the route returns 403 to anyone else): which loader failed, and why.
    fetch('/api/portal/diagnose', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setDiag(d))
      .catch(() => setDiag(null));
  }, [error]);
  const failed = diag?.steps?.filter((s) => !s.ok) ?? [];

  const storeDown = health?.data && !health.data.ok;
  const moving = health?.data?.ok && health.data.migration === 'pending';

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="panel border-l-4 border-l-gold-500 p-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-500">Portal</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold">
          {moving ? 'Your records are moving to new storage' : storeDown ? 'The portal storage is not answering' : 'This page could not load'}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-steel-500">
          {moving ? (
            <>
              XAA is copying its records to new storage. It takes a few seconds and nothing is lost — press
              <strong> Try again</strong> in a moment.
            </>
          ) : storeDown ? (
            <>The storage reported an error, so this page cannot show its data right now. Your account and session are fine.</>
          ) : health ? (
            <>Something failed while building this page. Try again — if it keeps happening, tell us the reference below.</>
          ) : (
            <>Checking what went wrong…</>
          )}
        </p>
        {health?.data?.error ? (
          <p className="mt-3 break-words rounded-md bg-[color:var(--surface)] p-3 font-mono text-[11px] text-steel-500">{health.data.error}</p>
        ) : null}
        {failed.length ? (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-[12px]">
            <p className="font-bold text-red-700">Admin diagnosis — failing step{failed.length > 1 ? 's' : ''}:</p>
            <ul className="mt-1 space-y-1 font-mono text-[11px] text-red-800">
              {failed.map((s) => <li key={s.step}><b>{s.step}</b>: {s.error}</li>)}
            </ul>
          </div>
        ) : null}
        {error.digest ? <p className="mt-2 font-mono text-[11px] text-steel-400">Reference: {error.digest}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="btn btn-primary btn-sm">Try again</button>
          <Link href="/" className="btn btn-ghost btn-sm">Back to the site</Link>
        </div>
      </div>
    </div>
  );
}
