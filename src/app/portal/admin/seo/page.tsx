import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { AdminNav } from '@/components/AdminNav';
import audit from '@/content/seo-audit.json';

/**
 * SEO tracker for every company domain.
 *
 * The data is written by .github/workflows/seo-audit.yml (weekly, and on demand)
 * — a GitHub runner fetches each site live and records every checklist item as
 * done, not done, partly done, manual, or not applicable. This page reads that
 * committed file, so it needs no database and keeps working even when D1 is
 * over its daily limit.
 */

export const metadata: Metadata = { title: 'SEO audit', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

type Status = 'pass' | 'fail' | 'warn' | 'manual' | 'na';
interface Check { section: string; id: string; label: string; status: Status; detail?: string }
interface Site { domain: string; repo: string | null; reachable: boolean; score: number; pass: number; fail: number; warn: number; manual: number; checks: Check[] }
interface Audit { generatedAt: string | null; sites: Site[] }

const SECTION: Record<string, string> = {
  '1': 'Foundation', '2': 'Technical SEO', '3': 'On-page SEO', '4': 'Content SEO', '5': 'Structured data', '6': 'Image SEO',
  '8': 'Multilingual SEO', '9': 'Internal linking', '10': 'Off-page SEO', '11': 'Local SEO', '13': 'E-E-A-T', '14': 'Security',
  '15': 'Crawl & indexing', '16': 'Sitemap', '17': 'Social / sharing', '18': 'AI / generative search', '19': 'Analytics & monitoring', '20': 'Periodic audit',
};
const MARK: Record<Status, { icon: string; cls: string; label: string }> = {
  pass: { icon: '✓', cls: 'badge-green', label: 'Done' },
  fail: { icon: '✕', cls: 'badge-red', label: 'Not done' },
  warn: { icon: '!', cls: 'badge-amber', label: 'Partly done' },
  manual: { icon: '✎', cls: 'badge-blue', label: 'Manual' },
  na: { icon: '—', cls: 'badge-grey', label: 'N/A' },
};

function bySection(checks: Check[]) {
  const groups = new Map<string, Check[]>();
  for (const c of [...checks].sort((a, b) => Number(a.section) - Number(b.section))) {
    groups.set(c.section, [...(groups.get(c.section) ?? []), c]);
  }
  return [...groups.entries()];
}

export default async function SeoAuditPage() {
  const user = await currentUser();
  if (!user) redirect('/login?next=/portal/admin/seo');
  if (user.role !== 'admin') redirect('/portal');

  const data = audit as unknown as Audit;
  const sites = [...data.sites].sort((a, b) => a.score - b.score);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="eyebrow">Studio desk</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">SEO audit</h1>
      <p className="mt-2 max-w-3xl text-sm text-steel-500">
        xaa.es checked live against the SEO checklist, weekly (Mondays 03:00 UTC) and on demand from GitHub
        Actions → “SEO audit”. Each item is marked done, not done, partly done, or manual (work
        no crawler can judge — backlinks, content quality, Business Profile).
        {data.generatedAt ? <> Last run: <strong>{new Date(data.generatedAt).toUTCString()}</strong>.</> : null}
      </p>

      <div className="mt-8">
        <AdminNav current="/portal/admin/seo" />
      </div>

      {sites.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="font-display text-xl font-extrabold">No audit recorded yet</p>
          <p className="mt-2 text-sm text-steel-500">Run “SEO audit” from the GitHub Actions tab; results appear here after it redeploys.</p>
        </div>
      ) : (
        <>
          <div className="panel overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[color:var(--line)] text-xs uppercase tracking-wide text-steel-500">
                  <th className="p-3">Domain</th><th className="p-3">Score</th><th className="p-3">Done</th><th className="p-3">Not done</th><th className="p-3">Partly</th><th className="p-3">Manual</th><th className="p-3">Repo</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((s) => (
                  <tr key={s.domain} className="border-b border-[color:var(--line)] last:border-0">
                    <td className="p-3 font-semibold"><a href={`#${s.domain}`} className="underline">{s.domain}</a></td>
                    <td className="p-3">
                      {s.reachable ? (
                        <span className="flex items-center gap-2">
                          <span className="progress-track w-20"><span className="progress-fill block" style={{ width: `${s.score}%` }} /></span>
                          <strong>{s.score}%</strong>
                        </span>
                      ) : <span className="badge badge-red">unreachable</span>}
                    </td>
                    <td className="p-3">{s.pass}</td>
                    <td className="p-3 font-bold text-red-600">{s.fail}</td>
                    <td className="p-3">{s.warn}</td>
                    <td className="p-3">{s.manual}</td>
                    <td className="p-3 font-mono text-xs">{s.repo ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sites.map((s) => {
            const todo = s.checks.filter((c) => c.status === 'fail' || c.status === 'warn');
            return (
              <section key={s.domain} id={s.domain} className="panel mt-8 scroll-mt-24 p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="font-display text-2xl font-extrabold">
                    <a href={`https://${s.domain}`} target="_blank" rel="noopener" className="hover:text-gold-500">{s.domain} ↗</a>
                  </h2>
                  <span className="text-sm text-steel-500">{s.reachable ? `${s.score}% · ${s.fail} not done · ${s.warn} partly` : 'unreachable'}</span>
                </div>
                {todo.length ? (
                  <div className="mt-4 rounded-md border-l-4 border-l-red-500 bg-[color:var(--surface)] p-4">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-red-600">Still to do on {s.domain} ({todo.length})</p>
                    <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                      {todo.map((c) => <li key={c.id}>{MARK[c.status].icon} {c.label}</li>)}
                    </ul>
                  </div>
                ) : null}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-gold-500">Full checklist ({s.checks.length} items)</summary>
                  {bySection(s.checks).map(([sec, checks]) => (
                    <div key={sec} className="mt-4">
                      <p className="text-xs font-extrabold uppercase tracking-wide text-steel-500">{sec}. {SECTION[sec] ?? ''}</p>
                      <ul className="mt-2 divide-y divide-[color:var(--line)] text-sm">
                        {checks.map((c) => (
                          <li key={c.id} className="grid grid-cols-[92px_1fr] gap-3 py-2 sm:grid-cols-[92px_minmax(0,1fr)_minmax(0,1.2fr)]">
                            <span className={`badge ${MARK[c.status].cls} justify-self-start`}>{MARK[c.status].label}</span>
                            <span className="font-medium">{c.label}</span>
                            <span className="col-span-2 break-words font-mono text-[11px] text-steel-500 sm:col-span-1">{c.detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </details>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
