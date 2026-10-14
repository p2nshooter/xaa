'use client';

import { useActionState, useState } from 'react';
import { rotateRevenueTokenAction, revokeRevenueTokenAction, type TokenState } from '@/server/actions';
import { Submit, Notice } from './Submit';

/**
 * Settings → Revenue feed. Creates the token axto.io uses to read this
 * site's revenue for the investor portal of the AXTO & XAA capital raise
 * (GET /api/revenue — amounts and times only). The token is shown once; only
 * its hash is kept, so a lost token is replaced, never recovered.
 */
export function RevenueFeed({ createdAt }: { createdAt: string }) {
  const [state, rotate] = useActionState<TokenState, FormData>(rotateRevenueTokenAction, {});
  const [offState, revoke] = useActionState<TokenState, FormData>(revokeRevenueTokenAction, {});
  const [copied, setCopied] = useState(false);
  const on = Boolean(createdAt) && !offState.ok;
  return (
    <div className="panel p-5" id="settings-revenue">
      <h2 className="font-display text-base font-extrabold">Revenue feed — AXTO &amp; XAA investor portal</h2>
      <p className="mt-2 text-sm leading-relaxed text-steel-500">
        Investors in the combined capital raise see the revenue of xaa.es next to axto.io&apos;s in their portal on axto.io. This feed gives
        axto.io the confirmed payments of this site — an amount in euros and a time per payment, nothing about clients or projects. Sandbox
        (test) payments and refunded PayPal payments are left out.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`badge ${on ? 'badge-green' : 'badge-grey'}`} data-testid="revenue-feed-state">
          {on ? `On · token from ${createdAt.slice(0, 10)}` : 'Off'}
        </span>
      </div>
      {state.token ? (
        <div className="mt-3 rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-2)] p-3">
          <code className="block break-all text-xs" data-testid="revenue-feed-token">{state.token}</code>
          <button
            type="button"
            className="btn btn-ghost btn-sm mt-2"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(state.token ?? '');
                setCopied(true);
              } catch {}
            }}
          >
            {copied ? 'Copied' : 'Copy token'}
          </button>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-3">
        <form action={rotate}>
          <Submit className="btn btn-primary btn-sm" pendingLabel="Creating…">{on ? 'Create a new token' : 'Turn on and create a token'}</Submit>
        </form>
        {on ? (
          <form action={revoke}>
            <Submit className="btn btn-ghost btn-sm" pendingLabel="Turning off…">Turn the feed off</Submit>
          </form>
        ) : null}
      </div>
      <Notice error={state.error ?? offState.error} ok={state.ok ?? offState.ok} />
    </div>
  );
}
