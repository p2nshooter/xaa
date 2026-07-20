'use client';

import { useEffect, useRef, useState } from 'react';
import { SITE } from '@/lib/site';

/**
 * Network-controlled ad slot — the ONE ad primitive, shared by every article
 * site. It reads the central config from the ulyah.com admin
 * (api.ulyah.com/content/ad-config?site=<id>) so the owner controls every
 * site's ads from a single panel:
 *
 *   enabled   — master show/hide for this site (default OFF everywhere).
 *   approved  — the admin's per-site "this one is AdSense-approved" checkbox.
 *   clientId  — the real ca-pub-… id (per site; falls back to the shared one).
 *   slots     — real ad-unit ids per placement (in_article_1/2, sidebar, footer).
 *
 * States: hidden (enabled off) → dashed PREVIEW box (enabled, but not approved
 * or no unit id yet, so the owner can preview placement/spacing) → REAL ad
 * (enabled + approved + unit id present). Ticking "approved" and saving a real
 * id in the admin flips every slot on this site to live at once — no redeploy.
 */
interface AdView {
  enabled: boolean;
  approved: boolean;
  clientId: string;
  slots: Record<string, string>;
}

let cached: Promise<AdView> | null = null;
function fetchAdView(): Promise<AdView> {
  if (cached) return cached;
  cached = fetch(`${SITE.adConfigEndpoint}?site=${SITE.id}`)
    .then((r) => r.json() as Promise<Partial<AdView>>)
    .then((v) => ({
      enabled: !!v.enabled,
      approved: !!v.approved,
      clientId: v.clientId || SITE.adClient,
      slots: v.slots ?? {},
    }))
    .catch(() => ({ enabled: false, approved: false, clientId: SITE.adClient, slots: {} }));
  return cached;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({ placement = 'in_article_1', className = '' }: { placement?: string; className?: string }) {
  const [view, setView] = useState<AdView | null>(null);
  const pushed = useRef(false);

  useEffect(() => {
    let alive = true;
    fetchAdView().then((v) => alive && setView(v));
    return () => {
      alive = false;
    };
  }, []);

  const slotId = view?.slots?.[placement] || '';
  const live = !!view?.enabled && !!view?.approved && !!slotId;

  useEffect(() => {
    if (!live || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* blocked — the empty <ins> collapses quietly */
    }
  }, [live]);

  if (!view?.enabled) return null;

  if (!live) {
    return (
      <div
        className={`my-6 rounded-lg border-2 border-dashed border-[color:var(--accent-soft)] bg-[color:var(--accent-soft)]/10 py-6 text-center text-xs text-[color:var(--accent)] ${className}`}
      >
        Advertisement · {placement}
      </div>
    );
  }

  return (
    <div className={`my-6 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={view.clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
