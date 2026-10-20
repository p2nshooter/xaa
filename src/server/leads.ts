import { newId, nowIso } from './db';
import { data } from './data';

/**
 * The enquiry inbox.
 *
 * Every brief a prospect sends (contact form, /acquire, /invest) is a lead;
 * the studio desk reads and works them here. Stored in R2 (c/enquiries/…),
 * listed newest first, filterable by status.
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
  const d = await data();
  const { docs } = status ? await d.enquiries.listDocs('status', status, { limit: 200 }) : await d.enquiries.listDocs('all', 'all', { limit: 200 });
  // Leads written before the status field existed have none.
  return docs.map((l) => ({ ...l, status: (l.status ?? 'new') as LeadStatus }));
}

export async function countNewLeads(): Promise<number> {
  return (await data()).enquiries.count('status', 'new');
}

/** Store a new lead (contact form, purchase request, offer, investor application). */
export async function addLead(input: {
  name: string;
  email: string;
  company?: string | null;
  budget?: string | null;
  packageSlug?: string | null;
  message: string;
}): Promise<string> {
  const id = newId();
  await (await data()).enquiries.create({
    id,
    name: input.name,
    email: input.email,
    company: input.company || null,
    budget: input.budget || null,
    package_slug: input.packageSlug || null,
    message: input.message,
    status: 'new',
    note: null,
    handled_at: null,
    handled_by: null,
    created_at: nowIso(),
  });
  return id;
}

export async function setLeadStatus(id: string, status: LeadStatus, note: string, by: string): Promise<void> {
  const d = await data();
  if (!(await d.enquiries.get(id))) return;
  await d.enquiries.update(id, (l) => ({ ...l, status, note: note.trim().slice(0, 2000) || null, handled_at: nowIso(), handled_by: by }));
}

export async function deleteLead(id: string): Promise<void> {
  await (await data()).enquiries.delete(id);
}
