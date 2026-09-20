'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { registerAction, loginAction, type ActionState } from '@/server/actions';
import { Submit, Notice } from './Submit';

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
