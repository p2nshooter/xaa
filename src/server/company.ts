import { getSettings } from './settings';

/**
 * Whether the Company menu and the /company page are shown (owner, 27 Oct 2026, request 60: "Menu
 * company di xaa.es tolong di Hiden dan bisa di show dr portal admin"). Hidden by default: only the
 * value "yes", set from the Studio desk, shows it. While hidden there is no menu or footer link, no
 * sitemap or llms.txt entry, and /company is a 404 — the legal entity is still printed on invoices
 * and the legal pages.
 */
export async function companyVisible(): Promise<boolean> {
  try {
    return (await getSettings(['company_visible'])).company_visible === 'yes';
  } catch {
    return false;
  }
}
