import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm, AdminAccessLogin } from '@/components/forms/AuthForms';
import { currentUser } from '@/server/auth';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to the XAA client portal to see your project progress, milestones and invoices.',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await currentUser()) redirect('/portal');
  const { next } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-500">Client portal</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">Sign in</h1>
      <p className="mt-3 text-sm text-steel-500">Your projects, milestones, files and invoices.</p>
      <div className="mt-8">
        <LoginForm next={next && next.startsWith('/') ? next : '/portal'} />
      </div>
      <div className="panel mt-6 border-l-4 border-l-[color:var(--accent)] p-5">
        <p className="text-sm text-steel-500">
          We will never email you asking for your password or send you a payment address. Payment details appear only on
          your project page here. <Link href="/payments" className="text-gold-500 underline">More on payment security</Link>.
        </p>
      </div>

      {/* Studio access is not advertised: tap the mark five times, quickly, to
          reveal the admin sign-in. Nothing here grants admin — the account is
          seeded in the database and this is only how the owner reaches it. */}
      <AdminAccessLogin />
    </div>
  );
}
