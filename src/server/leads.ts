import { db, nowIso } from './db';

/**
 * The enquiry inbox.
 *
 * The contact form has been writing to this table since it shipped, and
 * nothing ever read it back — every brief a prospect sent went into the
 * database and stayed there. This is the other half.
 */

export type LeadStatus = 'new' | 'replied' | 'won' | 'archived';

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  replied: 'Replied',
  won: 'Won',
  archived: 'Archived',
};

export const LEAD_STATUS_BADGE: Record<LeadStatus, string> = {
  new: 'badge-amber',
  replied: 'badge-blue',
  won: 'badge-green',
  archived: 'badge-grey',
};

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  budget: string | null;
  package_slug: string | null;
  message: string;
  status: LeadStatus;
  note: string | null;
  handled_at: string | null;
  handled_by: string | null;
  created_at: string;
}

export async function listLeads(status?: LeadStatus): Promise<Lead[]> {
  const database = await db();
  const sql = status
    ? 'SELECT * FROM enquiries WHERE status = ? ORDER BY created_at DESC LIMIT 200'
    : 'SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 200';
  const stmt = status ? database.prepare(sql).bind(status) : database.prepare(sql);
  const { results } = await stmt.all<Lead>();
  // Rows written before the status column existed come back null.
  return (results ?? []).map((l) => ({ ...l, status: (l.status ?? 'new') as LeadStatus }));
}

export async function countNewLeads(): Promise<number> {
  const database = await db();
  const row = await database
    .prepare("SELECT COUNT(*) AS n FROM enquiries WHERE status = 'new' OR status IS NULL")
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function setLeadStatus(id: string, status: LeadStatus, note: string, by: string): Promise<void> {
  const database = await db();
  await database
    .prepare('UPDATE enquiries SET status = ?, note = ?, handled_at = ?, handled_by = ? WHERE id = ?')
    .bind(status, note.trim().slice(0, 2000) || null, nowIso(), by, id)
    .run();
}

export async function deleteLead(id: string): Promise<void> {
  const database = await db();
  await database.prepare('DELETE FROM enquiries WHERE id = ?').bind(id).run();
}
