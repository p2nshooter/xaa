import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { portalReady } from '@/server/db';
import { NewProjectForm } from '@/components/forms/NewProjectForm';

export const metadata: Metadata = {
  title: 'Open a project',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string; setup?: string; care?: string }>;
}) {
  const { package: pkg, setup, care } = await searchParams;

  if (!(await portalReady())) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-black">The order form is not switched on yet</h1>
        <p className="mt-4 text-sm text-ink-800/70">
          This deployment has no database bound. Send us your brief and we will open the project by hand.
        </p>
        <Link href="/contact" className="btn btn-primary mt-8">Contact the studio</Link>
      </div>
    );
  }

  const user = await currentUser();
  if (!user) {
    const query = new URLSearchParams();
    if (pkg) query.set('package', pkg);
    if (setup) query.set('setup', setup);
    if (care) query.set('care', care);
    const next = `/portal/new${query.size ? `?${query}` : ''}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gold-500">New project</p>
      <h1 className="mt-1 font-serif text-3xl font-black sm:text-4xl">Open a project</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-800/75">
        Pick your package and tell us what you are building. You will see the exact milestone amounts before anything is
        due — the deposit is paid afterwards, from your project page.
      </p>

      <div className="mt-10">
        <NewProjectForm defaultPackage={pkg} defaultSetup={setup} defaultCare={care} />
      </div>
    </div>
  );
}
