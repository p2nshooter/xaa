'use client';

import { useEffect, useState } from 'react';

/**
 * The central Adsterra ON/OFF switch — owned by the ulyah.com admin portal.
 *
 * The owner's rule is "seluruh kontrol ada di ulyah.com": one panel decides
 * whether a site shows network ads, and a site must obey it without a redeploy.
 * api.ulyah.com/content/ad-config?site=<id> returns an `adsterra` flag that is
 * already the AND of the network-wide master switch and this site's own
 * per-site toggle, so reading that single boolean is enough.
 *
 * Behaviour, in order of importance:
 *   - OFF means OFF everywhere on the site, with no exception;
 *   - the last known answer is kept in localStorage and applied before the
 *     fetch resolves, so a site the owner has switched off never flashes an ad
 *     on the next page load;
 *   - if the config cannot be read at all and we have never read it on this
 *     device, fail OPEN (show), because a network blip should not silently cost
 *     the owner a day of revenue;
 *   - the fetch is module-level and shared, so a page with eight ad units still
 *     makes exactly one request.
 */
const SITE_ID = 'xaa-es';
const ENDPOINT = 'https://api.ulyah.com/content/ad-config';
const LS_KEY = `adsterra:${SITE_ID}`;

function readLS(): boolean | null {
  try {
    const v = localStorage.getItem(LS_KEY);
    return v === null ? null : v === '1';
  } catch {
    return null;
  }
}

let cached: boolean | null = null;
let inflight: Promise<boolean> | null = null;

function fetchAdsterraOn(): Promise<boolean> {
  if (cached !== null) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch(`${ENDPOINT}?site=${SITE_ID}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { adsterra?: boolean }) => {
        const on = d?.adsterra !== false;
        cached = on;
        try {
          localStorage.setItem(LS_KEY, on ? '1' : '0');
        } catch {
          /* private mode — we just lose the sticky hint */
        }
        return on;
      })
      .catch(() => (cached = readLS() ?? true));
  }
  return inflight;
}

/** Whether this site may render Adsterra right now. */
export function useAdsterraOn(): boolean {
  const [on, setOn] = useState<boolean>(cached ?? true);
  useEffect(() => {
    let alive = true;
    const ls = readLS();
    if (ls !== null) setOn(ls);
    fetchAdsterraOn().then((v) => alive && setOn(v));
    return () => {
      alive = false;
    };
  }, []);
  return on;
}
