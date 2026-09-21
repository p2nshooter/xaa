import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { portalReady } from '@/server/db';
import { listPaymentMethods } from '@/server/settings';
import {
  getProject, listPayments, listFiles, listUpdates, money, nextAction, stageState,
  addonNames, formatDate, STATUS_LABEL, STATUS_BADGE, SETTLEMENT_TRIGGER, UNPAID_PROGRESS_CAP, FINAL_PCT,
} from '@/server/projects';
import { STAGES } from '@/content/process';
import { getPackage, getSetupPlan, getCarePlan, eur, usd } from '@/content/packages';
import { formatBytes } from '@/server/uploads';
import { ConceptUploadForm, PaymentForm, AdminProjectControls, BusinessDataForm } from '@/components/forms/ProjectForms';
import { RecoveryPanel } from '@/components/forms/RecoveryForms';
import { getAiConfig, listRecoveryEvents, listBackups } from '@/server/recovery';
import { getLang } from '@/lib/i18n.server';

export const metadata: Metadata = { title: 'Project', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await portalReady())) redirect('/portal');

  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/portal/projects/${id}`)}`);

  const project = await getProject(id);
  if (!project) notFound();
  if (project.user_id !== user.id && user.role !== 'admin') notFound();

  const [payments, files, updates, methods, aiConfig, recoveryEvents, backups, lang] = await Promise.all([
    listPayments(project.id),
    listFiles(project.id),
    listUpdates(project.id),
    listPaymentMethods(true),
    getAiConfig(project.id),
    listRecoveryEvents(project.id),
    listBackups(project.id),
    getLang(),
  ]);

  const m = money(project, payments);
  const action = nextAction(project, payments);
  const stages = stageState(project, payments, files);
  const pkg = getPackage(project.package_slug);
  const setup = project.setup_plan ? getSetupPlan(project.setup_plan) : null;
  const care = project.care_plan ? getCarePlan(project.care_plan) : null;
  const addons = addonNames(project);
  const conceptFiles = files.filter((f) => f.kind === 'concept');
  const deliverables = files.filter((f) => f.kind === 'deliverable');
  const businessData = files.filter((f) => f.kind === 'business-data');

  // Only destinations that open with the current key are offered; a wallet
  // address we cannot decrypt must never reach a client as a blank box.
  const destinations = methods
    .filter((m) => !m.unreadable && m.address)
    .map((m) => ({
      id: m.id,
      kind: m.kind,
      label: m.label,
      network: m.network,
      currency: m.currency,
      address: m.address,
      memo: m.memo,
      link: m.link,
      instructions: m.instructions,
      holder: m.holder,
      bankName: m.bankName,
      swift: m.swift,
      branch: m.branch,
      bankCountry: m.bankCountry,
    }));

  const capped = m.paidPct < FINAL_PCT;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/portal" className="text-xs text-steel-500 hover:text-gold-500">← All projects</Link>
          <p className="mt-2 font-mono text-xs text-steel-500">{project.ref}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">{project.title}</h1>
          <p className="mt-1 text-sm text-steel-500">
            {project.package_name}
            {pkg ? <> · {pkg.timeline} · {pkg.pages}</> : null}
            {addons.length ? <> · add-ons: {addons.join(', ')}</> : null}
          </p>
        </div>
        <span className={`badge ${STATUS_BADGE[project.status]}`}>{STATUS_LABEL[project.status]}</span>
      </div>

      {/* Progress + money */}
      <section className="panel mt-8 p-6">
        <div className="flex items-center gap-4">
          <div className="progress-track flex-1">
            <div className="progress-fill" style={{ width: `${project.progress}%` }} />
          </div>
          <span className="font-display text-2xl font-extrabold">{project.progress}%</span>
        </div>
        {capped && project.progress >= UNPAID_PROGRESS_CAP ? (
          <p className="mt-3 text-sm text-steel-500">
            Progress is held at {UNPAID_PROGRESS_CAP}% until the final settlement clears. The remaining 20% — deployment,
            content loading, final QA and handover — is released the moment the payment is confirmed.
          </p>
        ) : null}

        <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">Contract value</dt>
            <dd className="mt-1 font-display text-xl font-extrabold">{eur(m.contract)}</dd>
            <dd className="text-xs text-steel-500">
              {project.contract_locked ? 'Agreed after scope review' : `Indicative — quoted ${eur(project.quote_min)} – ${eur(project.quote_max)}`}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">Confirmed paid</dt>
            <dd className="mt-1 font-display text-xl font-extrabold accent-text">{eur(m.confirmed)}</dd>
            <dd className="text-xs text-steel-500">{m.paidPct}% of contract{m.pending ? ` · ${eur(m.pending)} pending` : ''}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">Outstanding</dt>
            <dd className="mt-1 font-display text-xl font-extrabold">{eur(m.outstanding)}</dd>
            <dd className="text-xs text-steel-500">≈ {usd(m.outstanding)} in USDT</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-steel-500">Estimated completion</dt>
            <dd className="mt-1 font-display text-xl font-extrabold">{formatDate(project.due_at)}</dd>
            <dd className="text-xs text-steel-500">
              {project.due_at ? `Started ${formatDate(project.started_at)}` : 'Fixed when your concept arrives'}
            </dd>
          </div>
        </dl>
      </section>

      {/* Stage rail */}
      <section className="mt-8">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((s, i) => {
            const done = stages[s.key];
            return (
              <li key={s.key} className={`rounded-lg border p-4 ${done ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)]/15' : 'border-[color:var(--accent-soft)] bg-white'}`}>
                <div className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold ${done ? 'bg-[color:var(--accent)] text-white' : 'bg-ivory-200 text-steel-500'}`}>
                    {done ? '✓' : i + 1}
                  </span>
                  <p className="text-sm font-bold">{s.name}</p>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-steel-500">{s.blurb}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_.65fr] lg:items-start">
        <div className="space-y-8">
          {/* Next action */}
          {action ? (
            <PaymentForm
              projectId={project.id}
              milestone={action.milestone}
              label={action.label}
              amount={action.amount}
              destinations={destinations}
            />
          ) : null}

          {action ? <p className="-mt-4 text-sm text-steel-500">{action.reason}</p> : null}

          {/* Concept upload */}
          {project.status !== 'delivered' && project.status !== 'cancelled' ? (
            <ConceptUploadForm projectId={project.id} locked={m.paidPct < 10} />
          ) : null}

          {project.status !== 'delivered' && project.status !== 'cancelled' ? (
            <BusinessDataForm projectId={project.id} />
          ) : null}

          {/* Admin */}
          {user.role === 'admin' ? (
            <AdminProjectControls
              projectId={project.id}
              progress={project.progress}
              contract={project.contract_amount}
              capped={capped}
            />
          ) : null}

          {/* AI Backup & Recovery — self-served by the client, procedure recorded */}
          {project.status !== 'cancelled' ? (
            <RecoveryPanel
              projectId={project.id}
              config={aiConfig}
              events={recoveryEvents}
              backups={backups.map((b) => ({ id: b.id, created_at: b.created_at, bytes: b.bytes }))}
              isAdmin={user.role === 'admin'}
              lang={lang}
            />
          ) : null}

          {/* Activity */}
          <section className="panel p-6">
            <h2 className="font-display text-lg font-extrabold">Activity log</h2>
            <p className="mt-1 text-xs text-steel-500">Every payment, upload and progress change, dated.</p>
            <ol className="mt-5 space-y-4">
              {updates.map((u) => (
                <li key={u.id} className="flex gap-3 border-b border-[color:var(--accent-soft)] pb-4 last:border-0">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--accent)]" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-bold">{u.title}</p>
                      <p className="text-xs text-steel-500">
                        {new Date(u.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {u.body ? <p className="mt-1 text-sm leading-relaxed text-steel-500">{u.body}</p> : null}
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-steel-500">{u.author}</p>
                  </div>
                </li>
              ))}
              {updates.length === 0 ? <li className="text-sm text-steel-500">Nothing logged yet.</li> : null}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          {/* Milestones */}
          <section className="panel p-5">
            <h2 className="font-display text-lg font-extrabold">Milestone schedule</h2>
            <table className="data-table mt-3">
              <tbody>
                <tr>
                  <td>1. Deposit (10%)</td>
                  <td className="text-right">{m.paidPct >= 10 ? <span className="badge badge-green">Paid</span> : <strong>{eur(m.depositDue)}</strong>}</td>
                </tr>
                <tr>
                  <td>2. Production (to 50%)</td>
                  <td className="text-right">{m.paidPct >= 50 ? <span className="badge badge-green">Paid</span> : <strong>{eur(m.productionDue)}</strong>}</td>
                </tr>
                <tr>
                  <td>3. Settlement (to 100%)</td>
                  <td className="text-right">{m.paidPct >= 100 ? <span className="badge badge-green">Paid</span> : <strong>{eur(m.finalDue)}</strong>}</td>
                </tr>
              </tbody>
            </table>
            <p className="hint mt-3">
              The settlement is raised when progress reaches {SETTLEMENT_TRIGGER}%. Build progress is capped at{' '}
              {UNPAID_PROGRESS_CAP}% until it clears.
            </p>
          </section>

          {/* Payments */}
          <section className="panel p-5">
            <h2 className="font-display text-lg font-extrabold">Payments</h2>
            {payments.length === 0 ? (
              <p className="mt-2 text-sm text-steel-500">No payments recorded yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {payments.map((p) => (
                  <li key={p.id} className="border-b border-[color:var(--accent-soft)] pb-3 last:border-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold">{p.label}</span>
                      <span className="font-serif font-extrabold">{eur(p.amount)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-steel-500">
                      <span className={`badge ${p.status === 'confirmed' ? 'badge-green' : p.status === 'rejected' ? 'badge-red' : 'badge-amber'}`}>
                        {p.status}
                      </span>
                      <span>{p.method === 'usdt' ? `USDT ${p.network ?? ''}` : p.method === 'bank' ? 'Bank transfer' : 'PayPal'}</span>
                      <span>{formatDate(p.created_at)}</span>
                    </div>
                    {p.reference ? <p className="mt-1 break-all font-mono text-[11px] text-steel-500">{p.reference}</p> : null}
                    <Link href={`/portal/invoices/${p.id}`} className="mt-1 inline-block text-xs text-gold-500 underline">
                      {p.status === 'confirmed' ? 'Receipt' : 'Invoice'} →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Files */}
          <section className="panel p-5">
            <h2 className="font-display text-lg font-extrabold">Files</h2>
            <p className="mt-1 text-xs text-steel-500">Private — visible only to you and the delivery team.</p>
            <FileList title="Your concept" files={conceptFiles} />
            <FileList title="Business data" files={businessData} />
            <FileList title="Deliverables" files={deliverables} />
          </section>

          {/* Separate services */}
          {setup || care ? (
            <section className="panel p-5">
              <h2 className="font-display text-lg font-extrabold">Separate services</h2>
              <p className="mt-1 text-xs text-steel-500">Invoiced apart from the build.</p>
              <ul className="mt-3 space-y-2 text-sm">
                {setup ? (
                  <li className="flex justify-between gap-3">
                    <span>{setup.name} <span className="text-xs text-steel-500">one-time</span></span>
                    <strong>{eur(setup.price)}{setup.priceMax ? `–${eur(setup.priceMax)}` : '+'}</strong>
                  </li>
                ) : null}
                {care ? (
                  <li className="flex justify-between gap-3">
                    <span>{care.name} <span className="text-xs text-steel-500">one-time install</span></span>
                    <strong>{eur(care.price)}{care.priceMax ? `–${eur(care.priceMax)}` : ''}</strong>
                  </li>
                ) : null}
              </ul>
              <p className="hint mt-3">Billed from handover, not from today.</p>
            </section>
          ) : null}

          {project.scope_note ? (
            <section className="panel p-5">
              <h2 className="font-display text-lg font-extrabold">Your brief</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-steel-500">{project.scope_note}</p>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function FileList({ title, files }: { title: string; files: { id: string; name: string; size: number; created_at: string }[] }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-steel-500">{title}</p>
      {files.length === 0 ? (
        <p className="mt-1 text-sm text-steel-500">None yet.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {files.map((f) => (
            <li key={f.id} className="flex items-baseline justify-between gap-2 text-sm">
              <a href={`/api/files/${f.id}`} className="truncate text-gold-500 underline">{f.name}</a>
              <span className="shrink-0 text-xs text-steel-500">{formatBytes(f.size)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
