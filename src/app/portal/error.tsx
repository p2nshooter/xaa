'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Portal error boundary.
 *
 * In production Next.js strips server error messages before they reach the
 * browser, so this boundary cannot read what went wrong. It asks /api/health
 * instead, which reports whether the database is answering. The common real
 * cause is Cloudflare D1's free-tier daily read limit: sign-in keeps working
 * (sessions need no database), but project and payment data cannot load until
 * the limit resets at 00:00 UTC. Saying exactly that beats a blank crash page.
 */
interface Health {
  d1?: { ok: boolean; error?: string };
  signInReady?: boolean;
}

export default function PortalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    console.error(error);
    fetch('/api/health', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({}));
  }, [error]);

  const d1Down = health?.d1 && !health.d1.ok;
  const quota = d1Down && /limit|quota|exceeded/i.test(health?.d1?.error ?? '');

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="panel border-l-4 border-l-gold-500 p-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-500">Portal</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold">
          {quota ? 'Project data is paused until the daily database limit resets' : d1Down ? 'The portal database is not answering' : 'This page could not load'}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-steel-500">
          {quota ? (
            <>
              The hosting database has used its free daily read allowance. You are still signed in and nothing is lost —
              projects, payments and files come back automatically after <strong>00:00 UTC</strong>. Upgrading the
              Cloudflare account to Workers Paid removes this limit.
            </>
          ) : d1Down ? (
            <>The database reported an error, so this page cannot show its data right now. Your account and session are fine.</>
          ) : health ? (
            <>Something failed while building this page. Try again — if it keeps happening, tell us the reference below.</>
          ) : (
            <>Checking what went wrong…</>
          )}
        </p>
        {health?.d1?.error ? (
          <p className="mt-3 break-words rounded-md bg-[color:var(--surface)] p-3 font-mono text-[11px] text-steel-500">{health.d1.error}</p>
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
