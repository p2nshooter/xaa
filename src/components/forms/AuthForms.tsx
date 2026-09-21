'use client';

import Link from 'next/link';
import { useActionState, useRef, useState } from 'react';
import { registerAction, loginAction, type ActionState } from '@/server/actions';
import { Submit, Notice } from './Submit';

/**
 * Hidden studio sign-in. The mark below the client login is quiet on the page;
 * five quick taps on it (inside two seconds) reveal the admin panel. This is
 * obscurity, not security — the studio account is seeded in the database and
 * only that account is an admin, so a revealed form helps nobody without the
 * password. It just keeps the admin entrance out of a client's way.
 */
export function AdminAccessLogin() {
  const [open, setOpen] = useState(false);
  const taps = useRef<number[]>([]);

  const onTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 2000), now];
    if (taps.current.length >= 5) {
      taps.current = [];
      setOpen(true);
    }
  };

  return (
    <div className="mt-10 flex flex-col items-center">
      <button
        type="button"
        onClick={onTap}
        aria-label="XAA"
        className="opacity-40 transition hover:opacity-70 focus:outline-none"
        title=""
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/xaa-mark-64.png" alt="" width={32} height={32} style={{ width: 32, height: 32 }} />
      </button>

      {open ? (
        <div className="panel-dark mt-6 w-full max-w-md p-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/60">Studio access</p>
          <h2 className="mt-1 font-display text-xl font-extrabold text-white">Admin sign-in</h2>
          <p className="mt-1 text-xs text-white/60">Restricted to the studio account.</p>
          <div className="mt-4">
            <AdminLoginForm />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AdminLoginForm() {
  const [state, action] = useActionState<ActionState, FormData>(loginAction, {});
  return (
    <form action={action}>
      <Notice error={state.error} ok={state.ok} />
      <input type="hidden" name="next" value="/portal/admin" />
      <label className="field">
        <span className="text-white/80">Email</span>
        <input name="email" type="email" className="input" required autoComplete="username" />
      </label>
      <label className="field">
        <span className="text-white/80">Password</span>
        <input name="password" type="password" className="input" required autoComplete="current-password" />
      </label>
      <Submit pendingLabel="Signing in…">Enter studio desk</Submit>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState<ActionState, FormData>(registerAction, {});
  return (
    <form action={action} className="panel p-6">
      <Notice error={state.error} ok={state.ok} />
      <div className="grid gap-x-5 sm:grid-cols-2">
        <label className="field">
          <span>Full name *</span>
          <input name="name" className="input" required autoComplete="name" />
        </label>
        <label className="field">
          <span>Work email *</span>
          <input name="email" type="email" className="input" required autoComplete="email" />
        </label>
        <label className="field">
          <span>Company</span>
          <input name="company" className="input" autoComplete="organization" />
        </label>
        <label className="field">
          <span>Country</span>
          <input name="country" className="input" autoComplete="country-name" />
        </label>
        <label className="field">
          <span>Phone / WhatsApp</span>
          <input name="phone" className="input" autoComplete="tel" />
        </label>
        <div />
        <label className="field">
          <span>Password *</span>
          <input name="password" type="password" className="input" required minLength={8} autoComplete="new-password" />
          <span className="hint">At least 8 characters.</span>
        </label>
        <label className="field">
          <span>Confirm password *</span>
          <input name="confirm" type="password" className="input" required minLength={8} autoComplete="new-password" />
        </label>
      </div>
      <Submit pendingLabel="Creating account…">Create account</Submit>
      <p className="hint mt-3">
        Free to register. Nothing is charged until you open a project and choose to pay the deposit. By registering you
        accept our <Link href="/terms" className="underline">terms</Link> and{' '}
        <Link href="/privacy" className="underline">privacy policy</Link>.
      </p>
    </form>
  );
}

export function LoginForm({ next = '/portal' }: { next?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(loginAction, {});
  return (
    <form action={action} className="panel p-6">
      <Notice error={state.error} ok={state.ok} />
      <input type="hidden" name="next" value={next} />
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" className="input" required autoComplete="email" />
      </label>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" className="input" required autoComplete="current-password" />
      </label>
      <Submit pendingLabel="Signing in…">Sign in</Submit>
      <p className="hint mt-3">
        No account yet? <Link href="/register" className="underline">Register here</Link>.
      </p>
    </form>
  );
}
