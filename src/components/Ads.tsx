'use client';

import { useEffect, useRef } from 'react';
import { ADS, type BannerSlot } from '@/lib/ads';

/**
 * Adsterra ad units — the LIVE, direct-tag placements for this site.
 *
 * Kept separate from AdSlot.tsx (the dormant, network-controlled AdSense
 * primitive). These carry per-site keys from @/lib/ads and render immediately:
 *   • BannerAd   — highperformanceformat.com iframe banners (728x90, 300x250,
 *                  468x60, 160x600, 160x300, 320x50). Each runs inside its OWN
 *                  about:srcdoc frame so the global `atOptions` that invoke.js
 *                  reads can never be clobbered by a second banner on the same
 *                  page — the classic multi-unit Adsterra collision.
 *   • NativeAd   — effectivecpmnetwork.com native banner (container + invoke.js).
 *   • GlobalAds  — the social bar (auto-floating; injected ONCE), dropped in the
 *                  root layout.
 *   • SponsoredCard — one tasteful, clearly-labeled smart-link card.
 *
 * Every unit is centered, capped to the viewport width and carries a small
 * "Advertisement" label, so placement stays reader-first ("biar pantes").
 */

export function BannerAd({ slot, className = '' }: { slot: BannerSlot; className?: string }) {
  const cfg = ADS.banners[slot];
  if (!cfg) return null;
  const doc =
    '<!doctype html><html><head><meta charset="utf-8">' +
    '<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head>' +
    '<body><script type="text/javascript">atOptions=' +
    JSON.stringify({ key: cfg.key, format: 'iframe', height: cfg.height, width: cfg.width, params: {} }) +
    ';</scr' +
    'ipt><script type="text/javascript" src="//www.highperformanceformat.com/' +
    cfg.key +
    '/invoke.js"></scr' +
    'ipt></body></html>';
  return (
    <div className={`ad-wrap ${className}`}>
      <span className="ad-label">Advertisement</span>
      <iframe
        title="advertisement"
        width={cfg.width}
        height={cfg.height}
        srcDoc={doc}
        scrolling="no"
        loading="lazy"
        className="ad-frame"
        style={{ width: cfg.width, height: cfg.height, maxWidth: '100%' }}
      />
    </div>
  );
}

export function NativeAd({ className = '' }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !ADS.native || !host.current) return;
    done.current = true;
    const s = document.createElement('script');
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    s.src = ADS.native.src;
    host.current.appendChild(s);
  }, []);
  if (!ADS.native) return null;
  return (
    <div className={`ad-wrap ${className}`}>
      <span className="ad-label">Advertisement</span>
      <div id={`container-${ADS.native.container}`} ref={host} />
    </div>
  );
}

export function SponsoredCard({ className = '' }: { className?: string }) {
  if (!ADS.smartLink) return null;
  return (
    <div className={`ad-wrap ${className}`}>
      <span className="ad-label">Sponsored</span>
      <a
        href={ADS.smartLink}
        target="_blank"
        rel="sponsored noopener nofollow"
        className="ad-sponsored"
      >
        Our partners&rsquo; picks &mdash; offers &amp; deals worth a look
        <span aria-hidden> &rarr;</span>
      </a>
    </div>
  );
}

/**
 * Page-global units. Drop <GlobalAds/> ONCE in the root layout: it injects the
 * social bar exactly one time per page load.
 */
export function GlobalAds() {
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !ADS.socialBar) return;
    done.current = true;
    const s = document.createElement('script');
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    s.src = ADS.socialBar;
    document.body.appendChild(s);
  }, []);
  return null;
}
