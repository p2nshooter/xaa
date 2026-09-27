/**
 * Page loaders that survive a database outage. When D1 refuses a read — most
 * often the free plan's daily row-read limit, which is shared by every Worker
 * on the Cloudflare account — the page still renders with empty data and a
 * notice instead of failing as a whole.
 */

export type Problems = string[];

export async function soft<T>(problems: Problems, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!problems.includes(msg)) problems.push(msg);
    return fallback;
  }
}

export function isQuota(problems: Problems): boolean {
  return problems.some((m) => /daily row read limit|exceeded .*limit|free tier/i.test(m));
}
