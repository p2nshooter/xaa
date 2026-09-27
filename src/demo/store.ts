'use client';

import { useSyncExternalStore } from 'react';
import { seed, SEED_VERSION } from './seed';
import { DEMO_LIMITS, RBAC } from './config';
import type { DemoState, Perm, Role } from './types';

/**
 * The demo keeps its whole state in the visitor's browser (localStorage), so a
 * demo costs the server nothing — no database reads, no writes — and every
 * visitor gets a private sandbox. Every mutation goes through `act`, which
 * enforces the role matrix, applies the demo limits and writes the audit log,
 * exactly as the server layer of the licensed product does.
 */

const KEY = 'xaa-suite-demo';
let state: DemoState | null = null;
const subs = new Set<() => void>();

function fresh(): DemoState {
  return seed();
}

function load(): DemoState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as DemoState;
      const age = Date.now() - new Date(s.startedAt).getTime();
      if (s.v === SEED_VERSION && age < DEMO_LIMITS.resetAfterHours * 3_600_000) return s;
    }
  } catch { /* private mode or corrupt — start clean */ }
  return fresh();
}

export function getState(): DemoState {
  if (!state) state = load();
  return state;
}

function commit(next: DemoState) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* quota or private mode — keep in memory */ }
  subs.forEach((f) => f());
}

export function subscribe(f: () => void) {
  subs.add(f);
  return () => { subs.delete(f); };
}

export function useDemo(): DemoState {
  return useSyncExternalStore(subscribe, getState, getState);
}

/* ───────── toasts & upsell ───────── */

export interface Toast { id: number; kind: 'ok' | 'err'; text: string }
let toasts: Toast[] = [];
const toastSubs = new Set<() => void>();
let toastSeq = 0;
export function toast(kind: Toast['kind'], text: string) {
  const id = ++toastSeq;
  toasts = [...toasts, { id, kind, text }].slice(-4);
  toastSubs.forEach((f) => f());
  setTimeout(() => { toasts = toasts.filter((t) => t.id !== id); toastSubs.forEach((f) => f()); }, 4200);
}
export function useToasts(): Toast[] {
  return useSyncExternalStore(
    (f) => { toastSubs.add(f); return () => { toastSubs.delete(f); }; },
    () => toasts,
    () => toasts,
  );
}

/** Raised when a demo limit is reached; the shell shows the purchase dialog. */
let upsell: string | null = null;
const upsellSubs = new Set<() => void>();
export function showUpsell(reason: string) { upsell = reason; upsellSubs.forEach((f) => f()); }
export function closeUpsell() { upsell = null; upsellSubs.forEach((f) => f()); }
export function useUpsell(): string | null {
  return useSyncExternalStore(
    (f) => { upsellSubs.add(f); return () => { upsellSubs.delete(f); }; },
    () => upsell,
    () => upsell,
  );
}

/* ───────── access ───────── */

export function roleOf(s: DemoState, orgId = s.orgId, personId = s.personId): Role | null {
  return s.members.find((m) => m.orgId === orgId && m.personId === personId)?.role ?? null;
}

export function can(s: DemoState, perm: Perm): boolean {
  const role = roleOf(s);
  return role ? RBAC[role].includes(perm) : false;
}

export const uid = (p: string) => `${p}_${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`;
export const nowIso = () => new Date().toISOString();

export function nextSeq(d: DemoState, key: string): number {
  d.seq[key] = (d.seq[key] ?? 0) + 1;
  return d.seq[key];
}

interface ActOpts {
  /** Counts toward the demo's record limit. */
  creates?: boolean;
}

/**
 * Run a mutation as the current person in the current organisation.
 * `fn` may return a string to refuse the change with that message.
 */
export function act(perm: Perm, action: string, target: string, fn: (d: DemoState) => void | string, opts: ActOpts = {}): boolean {
  const s = getState();
  const role = roleOf(s);
  const entry = { id: uid('au'), orgId: s.orgId, at: nowIso(), actorId: s.personId, action, target };
  if (!role || !RBAC[role].includes(perm)) {
    toast('err', `Permission denied: “${action}” needs the ${perm} permission — you are ${role ?? 'not a member'}.`);
    commit({ ...s, audit: [{ ...entry, ok: false }, ...s.audit].slice(0, 400) });
    return false;
  }
  if (opts.creates && s.created >= DEMO_LIMITS.records) {
    showUpsell(`You have created ${DEMO_LIMITS.records} records — the demo limit. The licensed product has no record limits.`);
    return false;
  }
  const d = structuredClone(s);
  const refused = fn(d);
  if (typeof refused === 'string') {
    toast('err', refused);
    return false;
  }
  if (opts.creates) d.created += 1;
  d.audit = [{ ...entry, ok: true }, ...d.audit].slice(0, 400);
  const u = d.usage.find((x) => x.orgId === d.orgId);
  if (u) u.apiCalls += 1;
  commit(d);
  return true;
}

/** Session-level changes (who you are, which tenant, theme) — not audited as data changes. */
export function setSession(patch: Partial<Pick<DemoState, 'orgId' | 'personId' | 'theme'>>) {
  const s = getState();
  const next = { ...s, ...patch };
  if (patch.orgId && !next.members.some((m) => m.orgId === next.orgId && m.personId === next.personId)) {
    next.personId = next.members.find((m) => m.orgId === next.orgId)?.personId ?? next.personId;
  }
  commit(next);
}

export function resetDemo() {
  const theme = getState().theme;
  commit({ ...fresh(), theme });
  toast('ok', 'Demo reset to its starting data.');
}

/* ───────── limited exports ───────── */

export function download(filename: string, content: string, type = 'text/csv') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(v: unknown): string {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Demo exports carry the first rows only; the licensed product exports everything. */
export function exportCsv(filename: string, header: string[], rows: unknown[][]) {
  const limited = rows.slice(0, DEMO_LIMITS.exportRows);
  const lines = [header.map(csvCell).join(','), ...limited.map((r) => r.map(csvCell).join(','))];
  if (rows.length > limited.length) lines.push(`# XAA demo export: first ${limited.length} of ${rows.length} rows. The licensed product exports everything.`);
  download(filename, lines.join('\n'));
  if (rows.length > limited.length) toast('ok', `Exported ${limited.length} of ${rows.length} rows (demo limit).`);
}

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
