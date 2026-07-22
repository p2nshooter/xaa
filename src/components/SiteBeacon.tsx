"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Cookieless pageview beacon → the ulyah.com admin "Trafik Situs di Luar
 * Ekosistem" panel. Same mechanism the ulyah.com ecosystem uses: POST
 * { site, path } to api.ulyah.com/track on every navigation so this site is
 * detected and counted in the central admin portal. text/plain body is a
 * CORS-safelisted type (no preflight); every failure is swallowed so
 * analytics can never break a page.
 */
const SITE = "xaa-es";
const TRACK_URL = "https://api.ulyah.com/track";

export function SiteBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      const body = JSON.stringify({ site: SITE, path: pathname || "/" });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(TRACK_URL, new Blob([body], { type: "text/plain" }));
      } else {
        fetch(TRACK_URL, {
          method: "POST",
          body,
          headers: { "Content-Type": "text/plain" },
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      /* never break the page for analytics */
    }
  }, [pathname]);
  return null;
}
