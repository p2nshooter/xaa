import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { portalReady } from '@/server/db';
import { listLeads, countNewLeads, LEAD_STATUS_LABEL, LEAD_STATUS_BADGE } from '@/server/leads';
import { getPackage } from '@/content/packages';
import { formatDate } from '@/server/projects';
import { AdminNav } from '@/components/AdminNav';
import { LeadActions } from '@/components/forms/AdminForms';

export const metadata: Metadata = { title: 'Enquiries', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  if (!(await portalReady())) redirect('/portal');
  const user = await currentUser();
  if (!user) redirect('/login?next=/portal/admin/leads');
  if (user.role !== 'admin') redirect('/portal');

  const [leads, newCount] = await Promise.all([listLeads(), countNewLeads()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="eyebrow">Studio desk</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">Enquiries</h1>
      <p className="mt-2 text-sm text-steel-500">
        Every brief sent through the contact form. {newCount} unread.
      </p>

      <div className="mt-8">
        <AdminNav current="/portal/admin/leads" newLeads={newCount} />
      </div>

      {leads.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="font-display text-xl font-extrabold">No enquiries yet</p>
          <p className="mt-2 text-sm text-steel-500">
            Briefs sent from the contact page land here the moment they are submitted.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((l) => {
            const pkg = l.package_slug ? getPackage(l.package_slug) : null;
            return (
              <article key={l.id} className="panel p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg font-extrabold">{l.name}</h2>
                      <span className={`badge ${LEAD_STATUS_BADGE[l.status]}`}>{LEAD_STATUS_LABEL[l.status]}</span>
                    </div>
                    <p className="mt-1 text-sm text-steel-500">
                      <a href={`mailto:${l.email}`} className="text-gold-500 underline">{l.email}</a>
                      {l.company ? ` · ${l.company}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-steel-400">
                      {formatDate(l.created_at)}
                      {l.budget ? ` · budget ${l.budget}` : ''}
                      {pkg ? ` · interested in ${pkg.name}` : ''}
                    </p>
                  </div>
                  <LeadActions id={l.id} status={l.status} note={l.note} />
                </div>

                <p className="mt-4 whitespace-pre-wrap rounded-xl bg-[color:var(--surface)] p-4 text-sm leading-relaxed text-ink-900">
                  {l.message}
                </p>

                {l.note ? (
                  <p className="mt-3 text-sm text-steel-500">
                    <strong className="text-ink-900">Internal note:</strong> {l.note}
                    {l.handled_by ? <span className="text-xs text-steel-400"> — {l.handled_by}</span> : null}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`mailto:${l.email}?subject=Your project enquiry — XAA`} className="btn btn-primary btn-sm">
                    Reply by email
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
