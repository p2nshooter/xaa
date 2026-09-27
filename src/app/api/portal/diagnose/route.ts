import { currentUser } from '@/server/auth';
import { db } from '@/server/db';
import { listProjects, listAllProjects, listPendingPayments, listPayments } from '@/server/projects';
import { listUserOrders, listAllOrders } from '@/server/store';
import { countNewLeads, listLeads } from '@/server/leads';
import { listPaymentMethods, listSettings } from '@/server/settings';
import { keySource, selfTest } from '@/server/crypto';

/**
 * Admin-only: run every loader the portal and studio-desk pages use and report
 * which one fails, with the real error message.
 *
 * In production Next.js hides server error messages from the browser, so a
 * crashing page only ever says "could not load". The portal error boundary
 * calls this for signed-in admins and shows the failing step on screen — the
 * same approach that finally made the sign-in fault diagnosable. Clients get
 * 403; the response never contains data, only step names and error messages.
 */
export const dynamic = 'force-dynamic';

function short(err: unknown): string {
  const m = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  return m.replace(/[0-9a-f]{24,}/gi, '[redacted]').slice(0, 300);
}

export async function GET() {
  const user = await currentUser();
  if (!user || user.role !== 'admin') return Response.json({ error: 'admins only' }, { status: 403 });

  const steps: { step: string; ok: boolean; error?: string; ms: number }[] = [];
  const run = async (step: string, fn: () => Promise<unknown>) => {
    const t = Date.now();
    try {
      await fn();
      steps.push({ step, ok: true, ms: Date.now() - t });
    } catch (e) {
      steps.push({ step, ok: false, error: short(e), ms: Date.now() - t });
    }
  };

  await run('database + schema', () => db());
  await run('my projects', () => listProjects(user.id));
  await run('all projects (desk)', () => listAllProjects());
  await run('pending payments', () => listPendingPayments());
  await run('payments of first project', async () => {
    const [p] = await listAllProjects();
    if (p) await listPayments(p.id);
  });
  await run('my template orders', () => listUserOrders(user.id));
  await run('all template orders', () => listAllOrders());
  await run('enquiries', () => listLeads());
  await run('new enquiry count', () => countNewLeads());
  await run('payment methods', () => listPaymentMethods(true));
  await run('settings', () => listSettings());
  await run('encryption key source', () => keySource());
  await run('encryption self-test', () => selfTest());

  return Response.json({ ok: steps.every((s) => s.ok), steps }, { headers: { 'cache-control': 'no-store' } });
}
