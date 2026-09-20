import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { portalReady } from '@/server/db';
import { listProjects, listPayments, money, nextAction, STATUS_LABEL, STATUS_BADGE, formatDate, type Project, type Payment } from '@/server/projects';
import { eur } from '@/content/packages';
import { STAGES } from '@/content/process';

export const metadata: Metadata = {
  title: 'Client portal',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function PortalPage() {
  if (!(await portalReady())) return <NotConfigured />;
  const user = await currentUser();
  if (!user) redirect('/login?next=/portal');

  const projects = await listProjects(user.id);
  const withMoney = await Promise.all(
    projects.map(async (p) => {
      const payments = await listPayments(p.id);
      return { project: p, payments };
    })
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gold-500">Welcome back</p>
          <h1 className="mt-1 font-serif text-3xl font-black">{user.name}</h1>
          {user.company ? <p className="text-sm text-steel-500">{user.company}</p> : null}
        </div>
        <Link href="/portal/new" className="btn btn-primary">Open a new project</Link>
      </div>

      {user.role === 'admin' ? (
        <div className="panel mt-6 border-l-4 border-l-ink-900 p-5">
          <p className="text-sm">
            You are signed in as a studio admin.{' '}
            <Link href="/portal/admin" className="font-bold text-gold-500 underline">Open the studio desk</Link> to
            confirm payments and update project progress.
          </p>
        </div>
      ) : null}

      {projects.length === 0 ? <EmptyState /> : (
        <div className="mt-10 space-y-5">
          {withMoney.map(({ project, payments }) => (
            <ProjectRow key={project.id} project={project} payments={payments} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectRow({ project, payments }: { project: Project; payments: Payment[] }) {
  const m = money(project, payments);
  const action = nextAction(project, payments);
  return (
    <Link href={`/portal/projects/${project.id}`} className="panel mk-lift block p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-steel-500">{project.ref}</p>
          <h2 className="mt-1 font-serif text-xl font-black">{project.title}</h2>
          <p className="text-sm text-ink-800/70">{project.package_name}</p>
        </div>
        <span className={`badge ${STATUS_BADGE[project.status]}`}>{STATUS_LABEL[project.status]}</span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="progress-track flex-1">
          <div className="progress-fill" style={{ width: `${project.progress}%` }} />
        </div>
        <span className="w-12 text-right font-serif font-black">{project.progress}%</span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">Contract</dt>
          <dd className="mt-0.5 font-semibold">{eur(m.contract)}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">Paid</dt>
          <dd className="mt-0.5 font-semibold">{eur(m.confirmed)} <span className="text-xs text-steel-500">({m.paidPct}%)</span></dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">Est. completion</dt>
          <dd className="mt-0.5 font-semibold">{formatDate(project.due_at)}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">Next step</dt>
          <dd className="mt-0.5 font-semibold">
            {action ? `${action.label} — ${eur(action.amount)}` : project.status === 'awaiting_brief' ? 'Upload your concept' : '—'}
          </dd>
        </div>
      </dl>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="panel mt-10 p-8 text-center">
      <p className="font-serif text-2xl font-black">No projects yet</p>
      <p className="mx-auto mt-2 max-w-lg text-sm text-ink-800/70">
        Open a project to see your exact milestone amounts, upload a concept and get a delivery date. Nothing is charged
        until you choose to pay the 10% deposit.
      </p>
      <ol className="mx-auto mt-8 grid max-w-3xl gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.slice(0, 4).map((s, i) => (
          <li key={s.key} className="rounded-lg border border-[color:var(--accent-soft)] p-4">
            <p className="text-xs font-black text-gold-500">STEP {i + 1}</p>
            <p className="mt-1 text-sm font-bold">{s.name}</p>
            <p className="mt-1 text-xs text-ink-800/65">{s.blurb}</p>
          </li>
        ))}
      </ol>
      <Link href="/portal/new" className="btn btn-primary mt-8">Open your first project</Link>
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-serif text-3xl font-black">The client portal is not switched on yet</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-800/70">
        This deployment has no database bound, so accounts and projects cannot be stored. If you are a client, please
        contact us directly and we will set your project up by hand.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/contact" className="btn btn-primary">Contact the studio</Link>
        <Link href="/services" className="btn btn-ghost">Browse packages</Link>
      </div>
    </div>
  );
}
