'use client';

import { useEffect, type ReactNode } from 'react';
import type { Currency, DemoState, Person } from './types';

export function money(n: number, cur: Currency | string = 'EUR'): string {
  const digits = cur === 'IDR' ? 0 : n % 1 === 0 ? 0 : 2;
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: cur, maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
  } catch {
    return `${cur} ${n.toLocaleString('en-GB')}`;
  }
}
export const num = (n: number) => n.toLocaleString('en-GB');
export function compact(n: number): string {
  return new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}
export function fmtDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const m = Math.round(abs / 60_000);
  const txt = m < 1 ? 'just now' : m < 60 ? `${m} min` : m < 1440 ? `${Math.round(m / 60)} h` : `${Math.round(m / 1440)} d`;
  if (txt === 'just now') return txt;
  return diff >= 0 ? `${txt} ago` : `in ${txt}`;
}
export const today = () => new Date().toISOString().slice(0, 10);
export const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export function Avatar({ person, size = 26 }: { person?: Person; size?: number }) {
  if (!person) return <span className="xs-avatar xs-b-grey" style={{ width: size, height: size, fontSize: size * 0.38 }} title="Unassigned">–</span>;
  return (
    <span className="xs-avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: person.color }} title={person.name}>
      {initials(person.name)}
    </span>
  );
}

export function person(s: DemoState, id?: string): Person | undefined {
  return id ? s.people.find((p) => p.id === id) : undefined;
}

type Tone = 'grey' | 'blue' | 'green' | 'amber' | 'red' | 'violet';
export function Badge({ tone = 'grey', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`xs-badge xs-b-${tone}`}>{children}</span>;
}

export function Btn({ children, onClick, variant, small, disabled, title, type = 'button', testId }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'danger'; small?: boolean; disabled?: boolean; title?: string;
  type?: 'button' | 'submit'; testId?: string;
}) {
  const cls = ['xs-btn', variant === 'primary' ? 'xs-btn-primary' : '', variant === 'danger' ? 'xs-btn-danger' : '', small ? 'xs-btn-sm' : ''].join(' ');
  return <button type={type} className={cls} onClick={onClick} disabled={disabled} title={title} data-testid={testId}>{children}</button>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="xs-label">{label}</span>{children}</label>;
}

export function Modal({ title, onClose, children, footer, wide }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="xs-modal-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="xs-modal" role="dialog" aria-modal="true" aria-label={title} style={wide ? { maxWidth: '60rem' } : undefined}>
        <div className="flex items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: 'var(--xs-line)' }}>
          <h2 className="xs-h2">{title}</h2>
          <button type="button" className="xs-btn xs-btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? <div className="flex flex-wrap justify-end gap-2 border-t px-5 py-3" style={{ borderColor: 'var(--xs-line)' }}>{footer}</div> : null}
      </div>
    </div>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: 'red' | 'green' }) {
  return (
    <div className="xs-panel p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider xs-muted">{label}</p>
      <p className="mt-1 xs-h1" style={tone ? { color: tone === 'red' ? '#dc2626' : '#16a34a' } : undefined}>{value}</p>
      {hint ? <p className="mt-1 text-xs xs-muted">{hint}</p> : null}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="xs-tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={value === t.id} className={`xs-tab ${value === t.id ? 'active' : ''}`} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ title, text }: { title: string; text?: string }) {
  return (
    <div className="xs-sunk p-8 text-center">
      <p className="xs-h2">{title}</p>
      {text ? <p className="mt-1 text-sm xs-muted">{text}</p> : null}
    </div>
  );
}

export function Bar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return <div className="xs-bar" aria-label={`${pct}%`}><span style={{ width: `${pct}%` }} /></div>;
}

export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="xs-h1">{title}</h1>
        {sub ? <p className="mt-1 text-sm xs-muted">{sub}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
