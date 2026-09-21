'use client';

import Link from 'next/link';
import { useActionState, useRef, useState } from 'react';
import { registerAction, loginAction, type ActionState } from '@/server/actions';
import { pick, type Lang } from '@/lib/i18n';
import { Submit, Notice } from './Submit';

type AuthCopy = {
  studioAccess: string; adminSignIn: string; adminRestricted: string;
  email: string; password: string; adminEnter: string; signingIn: string;
  fullName: string; workEmail: string; company: string; country: string; phone: string;
  passwordReg: string; passwordHint: string; confirm: string; createAccount: string; creating: string;
  freeReg0: string; termsLink: string; freeRegAnd: string; privacyLink: string; freeReg1: string;
  signIn: string; noAccount: string; registerHere: string;
};

const AUTH: Record<Lang, AuthCopy> = {
  en: {
    studioAccess: 'Studio access', adminSignIn: 'Admin sign-in', adminRestricted: 'Restricted to the studio account.',
    email: 'Email', password: 'Password', adminEnter: 'Enter studio desk', signingIn: 'Signing in…',
    fullName: 'Full name *', workEmail: 'Work email *', company: 'Company', country: 'Country', phone: 'Phone / WhatsApp',
    passwordReg: 'Password *', passwordHint: 'At least 8 characters.', confirm: 'Confirm password *',
    createAccount: 'Create account', creating: 'Creating account…',
    freeReg0: 'Free to register. Nothing is charged until you open a project and choose to pay the deposit. By registering you accept our ',
    termsLink: 'terms', freeRegAnd: ' and ', privacyLink: 'privacy policy', freeReg1: '.',
    signIn: 'Sign in', noAccount: 'No account yet? ', registerHere: 'Register here',
  },
  es: {
    studioAccess: 'Acceso del estudio', adminSignIn: 'Acceso de administración', adminRestricted: 'Restringido a la cuenta del estudio.',
    email: 'Email', password: 'Contraseña', adminEnter: 'Entrar al escritorio', signingIn: 'Accediendo…',
    fullName: 'Nombre completo *', workEmail: 'Email de trabajo *', company: 'Empresa', country: 'País', phone: 'Teléfono / WhatsApp',
    passwordReg: 'Contraseña *', passwordHint: 'Al menos 8 caracteres.', confirm: 'Confirmar contraseña *',
    createAccount: 'Crear cuenta', creating: 'Creando cuenta…',
    freeReg0: 'Registro gratuito. No se cobra nada hasta que abras un proyecto y elijas pagar el depósito. Al registrarte aceptas nuestros ',
    termsLink: 'términos', freeRegAnd: ' y la ', privacyLink: 'política de privacidad', freeReg1: '.',
    signIn: 'Iniciar sesión', noAccount: '¿Aún sin cuenta? ', registerHere: 'Regístrate aquí',
  },
  id: {
    studioAccess: 'Akses studio', adminSignIn: 'Masuk admin', adminRestricted: 'Terbatas untuk akun studio.',
    email: 'Email', password: 'Kata sandi', adminEnter: 'Masuk meja studio', signingIn: 'Masuk…',
    fullName: 'Nama lengkap *', workEmail: 'Email kerja *', company: 'Perusahaan', country: 'Negara', phone: 'Telepon / WhatsApp',
    passwordReg: 'Kata sandi *', passwordHint: 'Minimal 8 karakter.', confirm: 'Konfirmasi kata sandi *',
    createAccount: 'Buat akun', creating: 'Membuat akun…',
    freeReg0: 'Gratis mendaftar. Tak ada tagihan sampai Anda membuka proyek dan memilih membayar DP. Dengan mendaftar Anda menyetujui ',
    termsLink: 'ketentuan', freeRegAnd: ' dan ', privacyLink: 'kebijakan privasi', freeReg1: ' kami.',
    signIn: 'Masuk', noAccount: 'Belum punya akun? ', registerHere: 'Daftar di sini',
  },
};

/**
 * Hidden studio sign-in. The mark below the client login is quiet on the page;
 * five quick taps on it (inside two seconds) reveal the admin panel. This is
 * obscurity, not security — the studio account is seeded in the database and
 * only that account is an admin, so a revealed form helps nobody without the
 * password. It just keeps the admin entrance out of a client's way.
 */
export function AdminAccessLogin({ lang = 'en' }: { lang?: Lang }) {
  const [open, setOpen] = useState(false);
  const taps = useRef<number[]>([]);
  const c = pick(lang, AUTH);

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
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/60">{c.studioAccess}</p>
          <h2 className="mt-1 font-display text-xl font-extrabold text-white">{c.adminSignIn}</h2>
          <p className="mt-1 text-xs text-white/60">{c.adminRestricted}</p>
          <div className="mt-4">
            <AdminLoginForm c={c} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AdminLoginForm({ c }: { c: AuthCopy }) {
  const [state, action] = useActionState<ActionState, FormData>(loginAction, {});
  return (
    <form action={action}>
      <Notice error={state.error} ok={state.ok} />
      <input type="hidden" name="next" value="/portal/admin" />
      <label className="field">
        <span className="text-white/80">{c.email}</span>
        <input name="email" type="email" className="input" required autoComplete="username" />
      </label>
      <label className="field">
        <span className="text-white/80">{c.password}</span>
        <input name="password" type="password" className="input" required autoComplete="current-password" />
      </label>
      <Submit pendingLabel={c.signingIn}>{c.adminEnter}</Submit>
    </form>
  );
}

export function RegisterForm({ lang = 'en' }: { lang?: Lang }) {
  const [state, action] = useActionState<ActionState, FormData>(registerAction, {});
  const c = pick(lang, AUTH);
  return (
    <form action={action} className="panel p-6">
      <Notice error={state.error} ok={state.ok} />
      <div className="grid gap-x-5 sm:grid-cols-2">
        <label className="field">
          <span>{c.fullName}</span>
          <input name="name" className="input" required autoComplete="name" />
        </label>
        <label className="field">
          <span>{c.workEmail}</span>
          <input name="email" type="email" className="input" required autoComplete="email" />
        </label>
        <label className="field">
          <span>{c.company}</span>
          <input name="company" className="input" autoComplete="organization" />
        </label>
        <label className="field">
          <span>{c.country}</span>
          <input name="country" className="input" autoComplete="country-name" />
        </label>
        <label className="field">
          <span>{c.phone}</span>
          <input name="phone" className="input" autoComplete="tel" />
        </label>
        <div />
        <label className="field">
          <span>{c.passwordReg}</span>
          <input name="password" type="password" className="input" required minLength={8} autoComplete="new-password" />
          <span className="hint">{c.passwordHint}</span>
        </label>
        <label className="field">
          <span>{c.confirm}</span>
          <input name="confirm" type="password" className="input" required minLength={8} autoComplete="new-password" />
        </label>
      </div>
      <Submit pendingLabel={c.creating}>{c.createAccount}</Submit>
      <p className="hint mt-3">
        {c.freeReg0}<Link href="/terms" className="underline">{c.termsLink}</Link>{c.freeRegAnd}
        <Link href="/privacy" className="underline">{c.privacyLink}</Link>{c.freeReg1}
      </p>
    </form>
  );
}

export function LoginForm({ next = '/portal', lang = 'en' }: { next?: string; lang?: Lang }) {
  const [state, action] = useActionState<ActionState, FormData>(loginAction, {});
  const c = pick(lang, AUTH);
  return (
    <form action={action} className="panel p-6">
      <Notice error={state.error} ok={state.ok} />
      <input type="hidden" name="next" value={next} />
      <label className="field">
        <span>{c.email}</span>
        <input name="email" type="email" className="input" required autoComplete="email" />
      </label>
      <label className="field">
        <span>{c.password}</span>
        <input name="password" type="password" className="input" required autoComplete="current-password" />
      </label>
      <Submit pendingLabel={c.signingIn}>{c.signIn}</Submit>
      <p className="hint mt-3">
        {c.noAccount}<Link href="/register" className="underline">{c.registerHere}</Link>.
      </p>
    </form>
  );
}
