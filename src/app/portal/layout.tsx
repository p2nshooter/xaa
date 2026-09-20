import Link from 'next/link';
import { currentUser } from '@/server/auth';
import { logoutAction } from '@/server/actions';

export const dynamic = 'force-dynamic';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (
    <div>
      <div className="border-b border-[color:var(--accent-soft)] bg-ivory-100/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-5">
            <Link href="/portal" className="font-bold">Client portal</Link>
            {user ? (
              <>
                <Link href="/portal/new" className="text-steel-500 transition hover:text-gold-500">New project</Link>
                {user.role === 'admin' ? (
                  <Link href="/portal/admin" className="text-steel-500 transition hover:text-gold-500">Studio desk</Link>
                ) : null}
              </>
            ) : null}
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-steel-500">
                {user.name}
                {user.role === 'admin' ? <span className="ml-2 badge badge-blue">Admin</span> : null}
              </span>
              <form action={logoutAction}>
                <button type="submit" className="text-xs font-semibold text-steel-500 underline hover:text-ink-900">
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
