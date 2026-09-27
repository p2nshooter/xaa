import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/server/auth';
import { AdminNav } from '@/components/AdminNav';
import { listThreads, getThread, listMessages, markThreadRead, markAdminOnline, TOPIC_LABEL } from '@/server/support';
import { SupportLive, SupportReplyForm, SupportStatusButton } from '@/components/forms/SupportForms';
import { soft, type Problems } from '@/server/soft';
import { DbNotice } from '@/components/DbNotice';

/**
 * Support inbox: live chats and contact-form briefs in one place. While this
 * page is open the studio counts as online and the AI assistant stays quiet;
 * close it and the AI answers new messages from public site information.
 */

export const metadata: Metadata = { title: 'Support chat', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const SENDER: Record<string, string> = { visitor: 'Visitor', admin: 'Studio', ai: 'AI assistant', system: 'Auto-reply' };

function when(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });
}

export default async function SupportDesk({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const user = await currentUser();
  if (!user) redirect('/login?next=/portal/admin/support');
  if (user.role !== 'admin') redirect('/portal');

  await markAdminOnline().catch(() => {});
  const { t } = await searchParams;
  const problems: Problems = [];
  const threads = await soft(problems, () => listThreads(), [] as Awaited<ReturnType<typeof listThreads>>);
  const active = t ? await soft(problems, () => getThread(t), null) : threads[0] ?? null;
  const messages = active ? await soft(problems, () => listMessages(active.id), [] as Awaited<ReturnType<typeof listMessages>>) : [];
  if (active && active.unread_admin > 0) await markThreadRead(active.id).catch(() => {});
  const unread = threads.filter((x) => x.unread_admin > 0 && x.status === 'open').length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SupportLive />
      <p className="eyebrow">Studio desk</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">Support chat</h1>
      <p className="mt-2 max-w-3xl text-sm text-steel-500">
        Live chats from the site and briefs from the contact form. <b>You are shown as online while this page is open</b> — the
        AI assistant only answers when nobody is here, using public site information only. {unread} conversation{unread === 1 ? '' : 's'} waiting.
      </p>
      <div className="mt-8"><AdminNav current="/portal/admin/support" /></div>
      <DbNotice problems={problems} />

      {threads.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="font-display text-xl font-extrabold">No conversations yet</p>
          <p className="mt-2 text-sm text-steel-500">Chats started from the site&apos;s chat button and contact-form briefs appear here.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <ul className="panel max-h-[70vh] divide-y divide-[color:var(--line)] overflow-y-auto">
            {threads.map((x) => (
              <li key={x.id}>
                <Link href={`/portal/admin/support?t=${x.id}`} className={`block p-3 text-sm hover:bg-[color:var(--surface)] ${active?.id === x.id ? 'bg-[color:var(--surface)]' : ''}`}>
                  <span className="flex items-center justify-between gap-2">
                    <b className="truncate">{x.name}</b>
                    {x.unread_admin > 0 && x.status === 'open' ? <span className="badge badge-amber">{x.unread_admin}</span> : x.status === 'closed' ? <span className="badge badge-grey">closed</span> : null}
                  </span>
                  <span className="block truncate text-xs text-steel-500">{TOPIC_LABEL[x.topic] ?? x.topic} · {x.source === 'contact' ? 'contact form' : 'chat'} · {when(x.updated_at)}</span>
                </Link>
              </li>
            ))}
          </ul>

          {active ? (
            <section className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[color:var(--line)] pb-3">
                <div>
                  <p className="font-display text-lg font-extrabold">{active.name}</p>
                  <p className="text-xs text-steel-500">
                    <a href={`mailto:${active.email}`} className="underline">{active.email}</a> · {TOPIC_LABEL[active.topic] ?? active.topic} · {active.lang.toUpperCase()} · started {when(active.created_at)}
                  </p>
                </div>
                <SupportStatusButton threadId={active.id} status={active.status} />
              </div>
              <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === 'visitor' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.sender === 'visitor' ? 'bg-[color:var(--surface)]' : m.sender === 'admin' ? 'bg-[color:var(--accent-ink)] text-white' : 'bg-amber-50 text-amber-900'}`}>
                      <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">{SENDER[m.sender] ?? m.sender} · {when(m.created_at)}</p>
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <SupportReplyForm threadId={active.id} />
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
