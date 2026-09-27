'use client';

import { useMemo, useState } from 'react';
import { act, nextSeq, nowIso, uid, useDemo } from '../store';
import { SLA_HOURS } from '../config';
import type { Priority, Ticket, TicketStatus } from '../types';
import { Avatar, Badge, Btn, Empty, Field, Modal, PageHead, Stat, Tabs, person, relTime } from '../ui';

const PRI_TONE: Record<Priority, 'grey' | 'blue' | 'amber' | 'red'> = { low: 'grey', normal: 'blue', high: 'amber', urgent: 'red' };
const CANNED = [
  { label: 'Acknowledge', text: 'Thanks for reaching out — we are looking into this now and will update you within the hour.' },
  { label: 'Need details', text: 'Could you share a screenshot and the exact time this happened? That helps us trace it in our logs.' },
  { label: 'Resolved', text: 'This is now fixed on our side. Could you confirm it works for you? We will close the ticket in 48 hours otherwise.' },
];
const INBOUND = [
  { subject: 'Invoice PDF shows the wrong VAT number', priority: 'normal' as Priority, text: 'Our new VAT ID is not on the latest invoice PDF.' },
  { subject: 'Dashboard is very slow this morning', priority: 'high' as Priority, text: 'Loading the dashboard takes over 20 seconds for everyone in our office.' },
  { subject: 'Cannot reset my password', priority: 'urgent' as Priority, text: 'The reset email never arrives and I am locked out.' },
  { subject: 'Question about annual billing', priority: 'low' as Priority, text: 'Is there a discount if we switch to annual billing?' },
];

/** SLA state for the first response. */
export function sla(t: Ticket): { label: string; tone: 'green' | 'amber' | 'red' | 'grey'; breached: boolean } {
  const target = new Date(t.createdAt).getTime() + SLA_HOURS[t.priority] * 3_600_000;
  if (t.firstResponseAt) {
    const met = new Date(t.firstResponseAt).getTime() <= target;
    return { label: met ? 'SLA met' : 'SLA missed', tone: met ? 'green' : 'red', breached: !met };
  }
  if (t.status === 'solved') return { label: 'Solved', tone: 'grey', breached: false };
  const left = target - Date.now();
  if (left < 0) return { label: `Breached ${relTime(new Date(target).toISOString()).replace(' ago', '')}`, tone: 'red', breached: true };
  const m = Math.round(left / 60_000);
  return { label: `Respond in ${m < 60 ? `${m} min` : `${Math.round(m / 60)} h`}`, tone: m < 60 ? 'amber' : 'green', breached: false };
}

export default function Helpdesk() {
  const s = useDemo();
  const [tab, setTab] = useState<'inbox' | 'kb'>('inbox');
  const [filter, setFilter] = useState<TicketStatus | 'all'>('open');
  const [q, setQ] = useState('');
  const tickets = useMemo(() => s.tickets.filter((t) => t.orgId === s.orgId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [s.tickets, s.orgId]);
  const list = tickets.filter((t) => (filter === 'all' || t.status === filter) && `${t.subject} ${t.requester} #${t.number}`.toLowerCase().includes(q.toLowerCase()));
  const [sel, setSel] = useState<string | null>(null);
  const active = tickets.find((t) => t.id === sel) ?? list[0];
  const open = tickets.filter((t) => t.status !== 'solved');
  const breached = open.filter((t) => sla(t).breached).length;
  const responded = tickets.filter((t) => t.firstResponseAt);
  const avgFirst = responded.length ? responded.reduce((a, t) => a + (new Date(t.firstResponseAt!).getTime() - new Date(t.createdAt).getTime()), 0) / responded.length / 3_600_000 : 0;

  const simulate = () => {
    const pick = INBOUND[Math.floor(Math.random() * INBOUND.length)];
    act('write', 'ticket.inbound', pick.subject, (d) => {
      const n = nextSeq(d, `${d.orgId}:ticket`);
      d.tickets.unshift({ id: uid('t'), orgId: d.orgId, number: n, subject: pick.subject, requester: 'Jordan Blake', email: 'jordan@customer.example', status: 'open', priority: pick.priority, createdAt: nowIso(), tags: [], messages: [{ at: nowIso(), from: 'customer', by: 'Jordan Blake', text: pick.text }] });
    }, { creates: true });
  };

  return (
    <div>
      <PageHead title="Help Desk" sub="Shared inbox with first-response SLAs, macros and a knowledge base"
        actions={<Btn onClick={simulate} testId="hd-simulate">Simulate inbound email</Btn>} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open tickets" value={open.length} />
        <Stat label="SLA breached" value={breached} tone={breached ? 'red' : 'green'} />
        <Stat label="Avg first response" value={avgFirst ? `${avgFirst.toFixed(1)} h` : '—'} />
        <Stat label="Solved" value={tickets.filter((t) => t.status === 'solved').length} />
      </div>
      <Tabs tabs={[{ id: 'inbox', label: 'Inbox' }, { id: 'kb', label: 'Knowledge base' }]} value={tab} onChange={setTab} />
      <div className="mt-4">
        {tab === 'kb' ? <Knowledge /> : (
          <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
            <div>
              <div className="mb-2 flex flex-wrap gap-1">
                {(['open', 'pending', 'solved', 'all'] as const).map((f) => (
                  <Btn key={f} small variant={filter === f ? 'primary' : undefined} onClick={() => setFilter(f)}>{f}</Btn>
                ))}
              </div>
              <input className="xs-input mb-2" placeholder="Search tickets…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search tickets" />
              <ul className="xs-panel max-h-[60vh] divide-y overflow-y-auto" style={{ borderColor: 'var(--xs-line)' }}>
                {list.length === 0 ? <li className="p-4 text-sm xs-muted">No tickets here.</li> : list.map((t) => {
                  const st = sla(t);
                  return (
                    <li key={t.id}>
                      <button type="button" onClick={() => setSel(t.id)} className="block w-full p-3 text-left" style={active?.id === t.id ? { background: 'color-mix(in srgb, var(--xs-brand) 9%, transparent)' } : undefined} data-testid={`ticket-${t.number}`}>
                        <span className="flex items-center justify-between gap-2"><b className="truncate text-sm">{t.subject}</b><Badge tone={PRI_TONE[t.priority]}>{t.priority}</Badge></span>
                        <span className="mt-1 flex items-center justify-between gap-2 text-xs xs-muted"><span>#{t.number} · {t.requester}</span><Badge tone={st.tone}>{st.label}</Badge></span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            {active ? <TicketView t={active} /> : <Empty title="No ticket selected" />}
          </div>
        )}
      </div>
    </div>
  );
}

function TicketView({ t }: { t: Ticket }) {
  const s = useDemo();
  const [text, setText] = useState('');
  const agents = s.members.filter((m) => m.orgId === s.orgId && m.role !== 'viewer').map((m) => person(s, m.personId)!).filter(Boolean);
  const kb = s.kb.filter((k) => k.orgId === s.orgId);
  const words = t.subject.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const suggestions = kb.map((k) => ({ k, score: words.filter((w) => `${k.title} ${k.body}`.toLowerCase().includes(w)).length })).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 2);
  const upd = (patch: Partial<Ticket>, label: string) => act('write', 'ticket.update', `#${t.number} ${label}`, (d) => { const x = d.tickets.find((y) => y.id === t.id); if (x) Object.assign(x, patch); });
  const send = (from: 'agent' | 'note') => {
    if (!text.trim()) return;
    const ok = act('write', from === 'agent' ? 'ticket.reply' : 'ticket.note', `#${t.number}`, (d) => {
      const x = d.tickets.find((y) => y.id === t.id);
      if (!x) return;
      x.messages.push({ at: nowIso(), from, by: d.personId, text: text.trim() });
      if (from === 'agent') {
        if (!x.firstResponseAt) x.firstResponseAt = nowIso();
        if (x.status === 'open') x.status = 'pending';
        if (!x.assigneeId) x.assigneeId = d.personId;
      }
    });
    if (ok) setText('');
  };
  const st = sla(t);
  return (
    <section className="xs-panel p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--xs-line)' }}>
        <div>
          <p className="text-xs xs-muted">#{t.number} · {t.requester} &lt;{t.email}&gt;</p>
          <h2 className="xs-h2">{t.subject}</h2>
          <div className="mt-1"><Badge tone={st.tone}>{st.label}</Badge></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <select className="xs-select" aria-label="Status" value={t.status} onChange={(e) => upd({ status: e.target.value as TicketStatus }, `status ${e.target.value}`)}>
            {['open', 'pending', 'solved'].map((x) => <option key={x}>{x}</option>)}
          </select>
          <select className="xs-select" aria-label="Priority" value={t.priority} onChange={(e) => upd({ priority: e.target.value as Priority }, `priority ${e.target.value}`)}>
            {['low', 'normal', 'high', 'urgent'].map((x) => <option key={x}>{x}</option>)}
          </select>
          <select className="xs-select" aria-label="Assignee" value={t.assigneeId ?? ''} onChange={(e) => upd({ assigneeId: e.target.value || undefined }, 'assignee')}>
            <option value="">Unassigned</option>
            {agents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-3 grid max-h-[42vh] gap-2 overflow-y-auto">
        {t.messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'customer' ? 'justify-start' : 'justify-end'}`}>
            <div className="max-w-[85%] rounded-xl p-3 text-sm" style={m.from === 'customer' ? { background: 'var(--xs-surface-2)' } : m.from === 'note' ? { background: 'color-mix(in srgb, #f59e0b 18%, transparent)' } : { background: 'var(--xs-brand)', color: 'var(--xs-brand-ink)' }}>
              <p className="mb-1 text-[10px] font-bold uppercase opacity-75">{m.from === 'customer' ? m.by : `${person(s, m.by)?.name ?? m.by}${m.from === 'note' ? ' · internal note' : ''}`} · {relTime(m.at)}</p>
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
      </div>
      {suggestions.length ? (
        <div className="xs-sunk mt-3 p-3 text-xs">
          <b>Suggested articles:</b>{' '}
          {suggestions.map(({ k }) => (
            <button key={k.id} type="button" className="mr-2 underline" onClick={() => setText(`${text ? `${text}\n\n` : ''}This article should help: “${k.title}” — ${k.body}`)}>{k.title}</button>
          ))}
        </div>
      ) : null}
      <div className="mt-3">
        <div className="mb-2 flex flex-wrap gap-1">
          {CANNED.map((c) => <Btn key={c.label} small onClick={() => setText(c.text)}>{c.label}</Btn>)}
        </div>
        <textarea className="xs-textarea" rows={3} placeholder="Write a reply…" value={text} onChange={(e) => setText(e.target.value)} data-testid="hd-reply" />
        <div className="mt-2 flex justify-end gap-2">
          <Btn onClick={() => send('note')}>Internal note</Btn>
          <Btn variant="primary" onClick={() => send('agent')} testId="hd-send">Send reply</Btn>
        </div>
      </div>
    </section>
  );
}

function Knowledge() {
  const s = useDemo();
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ title: '', category: 'General', body: '' });
  const list = s.kb.filter((k) => k.orgId === s.orgId && `${k.title} ${k.body} ${k.category}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <input className="xs-input max-w-xs" placeholder="Search articles…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search articles" />
        <Btn onClick={() => setAdding(true)}>+ Article</Btn>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {list.map((k) => (
          <article key={k.id} className="xs-panel p-4">
            <Badge tone="violet">{k.category}</Badge>
            <h3 className="xs-h2 mt-2">{k.title}</h3>
            <p className="mt-1 text-sm xs-muted">{k.body}</p>
          </article>
        ))}
      </div>
      {adding ? (
        <Modal title="New article" onClose={() => setAdding(false)} footer={<><Btn onClick={() => setAdding(false)}>Cancel</Btn><Btn variant="primary" onClick={() => {
          if (!f.title.trim() || !f.body.trim()) return;
          if (act('write', 'kb.create', f.title, (d) => { d.kb.unshift({ id: uid('kb'), orgId: d.orgId, title: f.title.trim(), category: f.category.trim() || 'General', body: f.body.trim() }); }, { creates: true })) setAdding(false);
        }}>Publish</Btn></>}>
          <div className="grid gap-3">
            <Field label="Title"><input className="xs-input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
            <Field label="Category"><input className="xs-input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /></Field>
            <Field label="Body"><textarea className="xs-textarea" rows={5} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export { Avatar };
