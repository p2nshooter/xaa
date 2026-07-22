"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Cookieless pageview beacon + live-presence heartbeat → the ulyah.com admin.
 * On every navigation it POSTs { site, path } to api.ulyah.com/track (counted
 * in "Trafik Situs di Luar Ekosistem"); while the tab is open it also pings
 * /track/ping every 3s with an anonymous device token so the admin's "online
 * sekarang" shows REAL devices within ~5s — identical to the ecosystem sites.
 * All text/plain (no CORS preflight); every failure is swallowed so analytics
 * can never break a page.
 */
const SITE = "xaa-es";
const API = "https://api.ulyah.com";

function deviceId(): string {
  try {
    const k = "ulyah_site_device";
    let id = localStorage.getItem(k);
    if (!id) {
      id = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)).replace(/-/g, "");
      localStorage.setItem(k, id);
    }
    return id;
  } catch {
    return "";
  }
}

export function SiteBeacon() {
  const pathname = usePathname();

  // Pageview on every navigation.
  useEffect(() => {
    try {
      const body = JSON.stringify({ site: SITE, path: pathname || "/" });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(`${API}/track`, new Blob([body], { type: "text/plain" }));
      } else {
        fetch(`${API}/track`, { method: "POST", body, headers: { "Content-Type": "text/plain" }, keepalive: true }).catch(() => {});
      }
    } catch {
      /* never break the page for analytics */
    }
  }, [pathname]);

  // Presence heartbeat while the tab is visible → real-time "online now" (≤5s).
  useEffect(() => {
    const device = deviceId();
    if (!device) return;
    const body = JSON.stringify({ site: SITE, device });
    const ping = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      fetch(`${API}/track/ping`, { method: "POST", headers: { "Content-Type": "text/plain" }, body, keepalive: true }).catch(() => {});
    };
    const leave = () => {
      const blob = new Blob([body], { type: "text/plain" });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) navigator.sendBeacon(`${API}/track/leave`, blob);
    };
    ping();
    const t = setInterval(ping, 3000);
    const onVis = () => (document.visibilityState === "visible" ? ping() : leave());
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", leave);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", leave);
    };
  }, []);

  return null;
}
