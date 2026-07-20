'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SITE } from '@/lib/site';

/**
 * Lightweight, cookieless pageview beacon. Fires one tiny POST per page to the
 * central ulyah.com traffic collector (api.ulyah.com/track) with the site id
 * and path, so every sibling site's traffic shows up in the one ulyah.com
 * admin analytics panel — no third-party tracker, no personal data, no cookie.
 */
export function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      const body = JSON.stringify({ site: SITE.id, path: pathname, ref: document.referrer || '' });
      const url = SITE.analyticsEndpoint;
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
      } else {
        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(
          () => {}
        );
      }
    } catch {
      /* analytics is best-effort — never affects the page */
    }
  }, [pathname]);
  return null;
}
