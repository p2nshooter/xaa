import { NextResponse, type NextRequest } from 'next/server';
import { checkRevenueToken, revenueSince } from '@/server/revenue';

/**
 * GET /api/revenue?since=YYYY-MM-DD — the revenue of xaa.es for the investor
 * portal of the AXTO & XAA capital raise (axto.io). Bearer token generated in
 * the Studio desk → Settings → Revenue feed; without it, nothing. Each row is
 * an amount in euros, a time and a kind — never a client, project or order.
 * See server/revenue.ts.
 */
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET(req: NextRequest) {
  if (!(await checkRevenueToken(req.headers.get('authorization')))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401, headers: NO_STORE });
  }
  const since = new URL(req.url).searchParams.get('since') ?? '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(since) || Number.isNaN(Date.parse(since))) {
    return NextResponse.json({ error: 'since must be YYYY-MM-DD' }, { status: 400, headers: NO_STORE });
  }
  const transactions = await revenueSince(`${since}T00:00:00.000Z`);
  return NextResponse.json({ site: 'xaa.es', currency: 'EUR', since, transactions }, { headers: NO_STORE });
}
