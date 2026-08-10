'use client';

import { useEffect, useRef } from 'react';
import { ADS, type BannerSlot } from '@/lib/ads';
import { useAdsterraOn } from '@/lib/ad-master';

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
  const on = useAdsterraOn();
  const cfg = ADS.banners[slot];
  if (!cfg || !on) return null;
  // A REAL same-origin frame, not srcdoc. Both give the banner its own
  // document (which invoke.js needs, since it reads one global `atOptions`),
  // but srcdoc costs the document its identity: inside about:srcdoc the
  // hostname is empty, the origin is "null" and the referrer is empty, so
  // Adsterra cannot match the request to a registered site and returns no ad.
  // See public/ads/frame.html.
  const src = `/ads/frame.html?key=${encodeURIComponent(cfg.key)}&w=${cfg.width}&h=${cfg.height}`;
  return (
    <div className={`ad-wrap ${className}`}>
      <span className="ad-label">Advertisement</span>
      <iframe
        title="advertisement"
        width={cfg.width}
        height={cfg.height}
        src={src}
        scrolling="no"
        loading="lazy"
        className="ad-frame"
        style={{ width: cfg.width, height: cfg.height, maxWidth: '100%' }}
      />
    </div>
  );
}

export function NativeAd({ className = '' }: { className?: string }) {
  const on = useAdsterraOn();
  const host = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  useEffect(() => {
    if (!on || done.current || !ADS.native || !host.current) return;
    done.current = true;
    const s = document.createElement('script');
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    s.src = ADS.native.src;
    host.current.appendChild(s);
  }, [on]);
  if (!ADS.native || !on) return null;
  return (
    <div className={`ad-wrap ${className}`}>
      <span className="ad-label">Advertisement</span>
      <div id={`container-${ADS.native.container}`} ref={host} />
    </div>
  );
}

export function SponsoredCard({ className = '' }: { className?: string }) {
  const on = useAdsterraOn();
  if (!ADS.smartLink || !on) return null;
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
  const on = useAdsterraOn();
  const done = useRef(false);
  useEffect(() => {
    if (!on || done.current || !ADS.socialBar) return;
    done.current = true;
    const s = document.createElement('script');
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    s.src = ADS.socialBar;
    document.body.appendChild(s);
  }, [on]);
  return null;
}
