/**
 * Page loaders that survive a storage outage. When a read fails — or the
 * one-time move of the old records into R2 is still running in the seconds
 * after a deploy — the page still renders with empty data and a notice
 * instead of failing as a whole.
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

/** True when the only trouble is the short move to new storage (server/migrate.ts). */
export function isMoving(problems: Problems): boolean {
  return problems.some((m) => /moving its records to new storage/i.test(m));
}
