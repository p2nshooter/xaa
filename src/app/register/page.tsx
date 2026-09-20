import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/forms/AuthForms';
import { currentUser } from '@/server/auth';
import { STAGES } from '@/content/process';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Register for the XAA client portal — free, and nothing is charged until you open a project and choose to pay the deposit.',
  alternates: { canonical: '/register' },
};

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  if (await currentUser()) redirect('/portal');

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="grid gap-10 lg:grid-cols-[1fr_.85fr] lg:items-start">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gold-500">Client portal</p>
          <h1 className="mt-2 font-serif text-3xl font-black sm:text-4xl">Create your account</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-800/75">
            One account gives you the order form, your milestone schedule, the concept upload, a live progress bar and
            every invoice in one place.
          </p>
          <div className="mt-8">
            <RegisterForm />
          </div>
          <p className="mt-4 text-sm text-ink-800/70">
            Already registered? <Link href="/login" className="text-gold-500 underline">Sign in</Link>.
          </p>
        </div>

        <aside className="panel-dark p-7">
          <h2 className="font-serif text-xl font-black">What happens next</h2>
          <ol className="mt-5 space-y-4">
            {STAGES.map((s, i) => (
              <li key={s.key} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-[11px] font-black">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-bold">{s.name}</p>
                  <p className="text-xs text-ivory-100/65">{s.blurb}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-white/15 pt-4 text-xs text-ivory-100/60">
            Registration is free. The first payment is the 10% booking deposit, and you choose when to make it.
          </p>
        </aside>
      </div>
    </div>
  );
}
