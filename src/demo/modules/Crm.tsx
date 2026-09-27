'use client';

import { useMemo, useState } from 'react';
import { act, exportCsv, nowIso, uid, useDemo } from '../store';
import type { Contact, Deal, DealStage } from '../types';
import { Avatar, Badge, Bar, Btn, Empty, Field, Modal, PageHead, Stat, Tabs, fmtDate, money, person } from '../ui';

const STAGES: { id: DealStage; label: string; prob: number }[] = [
  { id: 'lead', label: 'Lead', prob: 0.1 },
  { id: 'qualified', label: 'Qualified', prob: 0.25 },
  { id: 'proposal', label: 'Proposal', prob: 0.5 },
  { id: 'negotiation', label: 'Negotiation', prob: 0.75 },
  { id: 'won', label: 'Won', prob: 1 },
  { id: 'lost', label: 'Lost', prob: 0 },
];
const PROB = Object.fromEntries(STAGES.map((s) => [s.id, s.prob])) as Record<DealStage, number>;

export default function Crm() {
  const s = useDemo();
  const [tab, setTab] = useState<'pipeline' | 'contacts' | 'reports'>('pipeline');
  const [open, setOpen] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [dragOver, setDragOver] = useState<DealStage | null>(null);
  const deals = useMemo(() => s.deals.filter((d) => d.orgId === s.orgId), [s.deals, s.orgId]);
  const contacts = useMemo(() => s.contacts.filter((c) => c.orgId === s.orgId), [s.contacts, s.orgId]);
  const openDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost');
  const weighted = openDeals.reduce((t, d) => t + d.value * PROB[d.stage], 0);
  const won = deals.filter((d) => d.stage === 'won');
  const closed = deals.filter((d) => d.stage === 'won' || d.stage === 'lost').length;

  const move = (id: string, stage: DealStage) => {
    const d = deals.find((x) => x.id === id);
    if (!d || d.stage === stage) return;
    act('write', 'deal.move', `${d.title} → ${stage}`, (x) => { const t = x.deals.find((y) => y.id === id); if (t) t.stage = stage; });
  };

  return (
    <div>
      <PageHead
        title="CRM & Pipeline"
        sub={`${openDeals.length} open deals · ${contacts.length} contacts`}
        actions={<><Btn onClick={() => setCreating(true)} variant="primary" testId="crm-new-deal">+ New deal</Btn></>}
      />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open pipeline" value={money(openDeals.reduce((t, d) => t + d.value, 0))} />
        <Stat label="Weighted forecast" value={money(Math.round(weighted))} hint="Value × stage probability" />
        <Stat label="Won" value={money(won.reduce((t, d) => t + d.value, 0))} hint={`${won.length} deals`} tone="green" />
        <Stat label="Win rate" value={closed ? `${Math.round((won.length / closed) * 100)}%` : '—'} hint="Won ÷ closed" />
      </div>
      <Tabs tabs={[{ id: 'pipeline', label: 'Pipeline' }, { id: 'contacts', label: 'Contacts' }, { id: 'reports', label: 'Reports' }]} value={tab} onChange={setTab} />
      <div className="mt-4">
        {tab === 'pipeline' ? (
          <div className="xs-scroll flex gap-3 pb-2">
            {STAGES.map((st) => {
              const col = deals.filter((d) => d.stage === st.id);
              return (
                <div
                  key={st.id}
                  className={`xs-col flex-1 p-2 ${dragOver === st.id ? 'drop' : ''}`}
                  data-testid={`crm-col-${st.id}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(st.id); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(null); move(e.dataTransfer.getData('text/plain'), st.id); }}
                >
                  <div className="mb-2 flex items-center justify-between px-1">
                    <b className="text-sm">{st.label} <span className="xs-muted">({col.length})</span></b>
                    <span className="text-xs xs-muted">{money(col.reduce((t, d) => t + d.value, 0))}</span>
                  </div>
                  <div className="grid gap-2">
                    {col.map((d) => {
                      const ct = contacts.find((c) => c.id === d.contactId);
                      return (
                        <div
                          key={d.id}
                          className="xs-card cursor-grab p-3"
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', d.id)}
                          onClick={() => setOpen(d.id)}
                          data-testid={`deal-${d.id}`}
                        >
                          <p className="font-bold leading-snug">{d.title}</p>
                          <p className="mt-0.5 text-xs xs-muted">{ct?.company ?? '—'}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <b>{money(d.value)}</b>
                            <Avatar person={person(s, d.ownerId)} size={22} />
                          </div>
                          <select
                            className="xs-select mt-2 !py-1 text-xs"
                            value={d.stage}
                            aria-label="Move to stage"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => move(d.id, e.target.value as DealStage)}
                          >
                            {STAGES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                          </select>
                        </div>
                      );
                    })}
                    {col.length === 0 ? <p className="px-1 py-4 text-center text-xs xs-muted">Drop deals here</p> : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : tab === 'contacts' ? <Contacts contacts={contacts} /> : <Reports deals={deals} />}
      </div>
      {open ? <DealModal id={open} onClose={() => setOpen(null)} /> : null}
      {creating ? <DealForm onClose={() => setCreating(false)} /> : null}
    </div>
  );
}

function Contacts({ contacts }: { contacts: Contact[] }) {
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '' });
  const list = contacts.filter((c) => `${c.name} ${c.email} ${c.company} ${c.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase()));
  const save = () => {
    if (!form.name.trim() || !/.+@.+\..+/.test(form.email)) return;
    const ok = act('write', 'contact.create', form.name, (d) => {
      d.contacts.unshift({ id: uid('c'), orgId: d.orgId, name: form.name.trim(), email: form.email.trim(), company: form.company.trim(), phone: form.phone.trim(), tags: [], createdAt: nowIso() });
    }, { creates: true });
    if (ok) { setAdding(false); setForm({ name: '', email: '', company: '', phone: '' }); }
  };
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <input className="xs-input max-w-xs" placeholder="Search contacts…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search contacts" />
        <Btn onClick={() => setAdding(true)} testId="contact-add">+ Contact</Btn>
        <Btn onClick={() => exportCsv('contacts.csv', ['Name', 'Email', 'Company', 'Phone', 'Tags'], list.map((c) => [c.name, c.email, c.company, c.phone, c.tags.join(' ')]))}>Export CSV</Btn>
      </div>
      {list.length === 0 ? <Empty title="No contacts match" /> : (
        <div className="xs-panel xs-scroll">
          <table className="xs-table">
            <thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Tags</th><th /></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold">{c.name}</td><td>{c.company}</td><td className="xs-muted">{c.email}</td><td className="xs-muted whitespace-nowrap">{c.phone}</td>
                  <td>{c.tags.map((t) => <Badge key={t} tone="blue">{t}</Badge>)}</td>
                  <td className="text-right">
                    <Btn small variant="danger" onClick={() => act('delete', 'contact.delete', c.name, (d) => {
                      if (d.deals.some((x) => x.contactId === c.id && x.orgId === d.orgId)) return 'This contact still has deals — reassign or delete them first.';
                      d.contacts = d.contacts.filter((x) => x.id !== c.id);
                    })}>Delete</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {adding ? (
        <Modal title="New contact" onClose={() => setAdding(false)} footer={<><Btn onClick={() => setAdding(false)}>Cancel</Btn><Btn variant="primary" onClick={save} testId="contact-save">Save contact</Btn></>}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name"><input className="xs-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Email"><input className="xs-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Company"><input className="xs-input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
            <Field label="Phone"><input className="xs-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function Reports({ deals }: { deals: Deal[] }) {
  const s = useDemo();
  const max = Math.max(1, ...STAGES.map((st) => deals.filter((d) => d.stage === st.id).reduce((t, d) => t + d.value, 0)));
  const owners = s.members.filter((m) => m.orgId === s.orgId).map((m) => person(s, m.personId)!).filter(Boolean);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="xs-panel p-4">
        <h2 className="xs-h2 mb-3">Value by stage</h2>
        <div className="grid gap-3">
          {STAGES.map((st) => {
            const v = deals.filter((d) => d.stage === st.id).reduce((t, d) => t + d.value, 0);
            return (
              <div key={st.id}>
                <div className="mb-1 flex justify-between text-sm"><span>{st.label}</span><b>{money(v)}</b></div>
                <Bar value={v} max={max} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="xs-panel p-4">
        <h2 className="xs-h2 mb-3">By owner</h2>
        <table className="xs-table">
          <thead><tr><th>Owner</th><th className="xs-num">Open</th><th className="xs-num">Weighted</th><th className="xs-num">Won</th></tr></thead>
          <tbody>
            {owners.map((p) => {
              const mine = deals.filter((d) => d.ownerId === p.id);
              const open = mine.filter((d) => d.stage !== 'won' && d.stage !== 'lost');
              return (
                <tr key={p.id}>
                  <td><span className="inline-flex items-center gap-2"><Avatar person={p} size={22} />{p.name}</span></td>
                  <td className="xs-num">{open.length}</td>
                  <td className="xs-num">{money(Math.round(open.reduce((t, d) => t + d.value * PROB[d.stage], 0)))}</td>
                  <td className="xs-num">{money(mine.filter((d) => d.stage === 'won').reduce((t, d) => t + d.value, 0))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DealForm({ onClose }: { onClose: () => void }) {
  const s = useDemo();
  const contacts = s.contacts.filter((c) => c.orgId === s.orgId);
  const [f, setF] = useState({ title: '', value: '10000', contactId: contacts[0]?.id ?? '', stage: 'lead' as DealStage, closeDate: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10) });
  const save = () => {
    const value = Number(f.value);
    if (!f.title.trim() || !(value > 0) || !f.contactId) return;
    const ok = act('write', 'deal.create', f.title, (d) => {
      d.deals.unshift({ id: uid('d'), orgId: d.orgId, title: f.title.trim(), value, stage: f.stage, contactId: f.contactId, ownerId: d.personId, closeDate: f.closeDate, createdAt: nowIso(), notes: [] });
    }, { creates: true });
    if (ok) onClose();
  };
  return (
    <Modal title="New deal" onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={save} testId="deal-save">Create deal</Btn></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title"><input className="xs-input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} data-testid="deal-title" /></Field>
        <Field label="Value (EUR)"><input className="xs-input" inputMode="numeric" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value.replace(/[^\d.]/g, '') })} /></Field>
        <Field label="Contact">
          <select className="xs-select" value={f.contactId} onChange={(e) => setF({ ...f, contactId: e.target.value })}>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.company}</option>)}
          </select>
        </Field>
        <Field label="Stage">
          <select className="xs-select" value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value as DealStage })}>
            {STAGES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
          </select>
        </Field>
        <Field label="Expected close"><input className="xs-input" type="date" value={f.closeDate} onChange={(e) => setF({ ...f, closeDate: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

function DealModal({ id, onClose }: { id: string; onClose: () => void }) {
  const s = useDemo();
  const d = s.deals.find((x) => x.id === id);
  const [note, setNote] = useState('');
  if (!d) return null;
  const ct = s.contacts.find((c) => c.id === d.contactId);
  const owners = s.members.filter((m) => m.orgId === s.orgId).map((m) => person(s, m.personId)!).filter(Boolean);
  const set = (patch: Partial<Deal>, label: string) => act('write', 'deal.update', `${d.title}: ${label}`, (x) => { const t = x.deals.find((y) => y.id === id); if (t) Object.assign(t, patch); });
  return (
    <Modal title={d.title} onClose={onClose} footer={<><Btn variant="danger" onClick={() => { if (act('delete', 'deal.delete', d.title, (x) => { x.deals = x.deals.filter((y) => y.id !== id); })) onClose(); }}>Delete deal</Btn><Btn onClick={onClose}>Close</Btn></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Value (EUR)"><input className="xs-input" defaultValue={d.value} inputMode="numeric" onBlur={(e) => { const v = Number(e.target.value); if (v > 0 && v !== d.value) set({ value: v }, `value ${v}`); }} /></Field>
        <Field label="Stage">
          <select className="xs-select" value={d.stage} onChange={(e) => set({ stage: e.target.value as DealStage }, e.target.value)}>
            {STAGES.map((x) => <option key={x.id} value={x.id}>{x.label} ({Math.round(x.prob * 100)}%)</option>)}
          </select>
        </Field>
        <Field label="Owner">
          <select className="xs-select" value={d.ownerId} onChange={(e) => set({ ownerId: e.target.value }, 'owner')}>
            {owners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Expected close"><input className="xs-input" type="date" value={d.closeDate} onChange={(e) => set({ closeDate: e.target.value }, 'close date')} /></Field>
      </div>
      <div className="xs-sunk mt-4 p-3 text-sm">
        <b>{ct?.name}</b> · {ct?.company} · <span className="xs-muted">{ct?.email}</span>
      </div>
      <h3 className="xs-h2 mt-5">Activity</h3>
      <div className="mt-2 flex gap-2">
        <input className="xs-input" placeholder="Add a note…" value={note} onChange={(e) => setNote(e.target.value)} data-testid="deal-note" />
        <Btn onClick={() => { if (note.trim() && act('write', 'deal.note', d.title, (x) => { x.deals.find((y) => y.id === id)?.notes.unshift({ at: nowIso(), by: x.personId, text: note.trim() }); })) setNote(''); }}>Add</Btn>
      </div>
      <ul className="mt-3 grid gap-2">
        {d.notes.map((n, i) => (
          <li key={i} className="xs-sunk p-3 text-sm">
            <p>{n.text}</p>
            <p className="mt-1 text-xs xs-muted">{person(s, n.by)?.name} · {fmtDate(n.at)}</p>
          </li>
        ))}
        <li className="text-xs xs-muted">Created {fmtDate(d.createdAt)}</li>
      </ul>
    </Modal>
  );
}
