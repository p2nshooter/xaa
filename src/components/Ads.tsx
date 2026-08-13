'use client';

import { useEffect, useRef, useState } from 'react';
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

/** The <title> of public/ads/frame.html. Load-bearing.
 *
 *  If frame.html stops being served the iframe does not error — it loads THIS
 *  SITE'S OWN 404 page, which is same-origin and full of content. Anything that
 *  judges a fill by looking for content would read that 404 as an ad. Checking
 *  the title first is what tells our frame apart from whatever else the server
 *  returned. */
const FRAME_TITLE = 'Advertisement';

/** How long a unit may take to paint before it is treated as a no-fill. */
const FILL_GRACE_MS = 25_000;

export function BannerAd({ slot, className = '' }: { slot: BannerSlot; className?: string }) {
  const on = useAdsterraOn();
  const cfg = ADS.banners[slot];
  const frame = useRef<HTMLIFrameElement>(null);
  // null = still waiting, so keep the space reserved and stay quiet;
  // true = something painted; false = confirmed no-fill, collapse entirely.
  const [filled, setFilled] = useState<boolean | null>(null);

  useEffect(() => {
    if (!on || !cfg) return;
    let stopped = false;
    const startedAt = Date.now();
    const tick = () => {
      if (stopped) return;
      let has = false;
      try {
        const doc = frame.current?.contentDocument;
        // Our frame, or nothing. An empty title is the frame still loading.
        if (doc && doc.title === FRAME_TITLE) {
          const body = doc.body;
          // invoke.js paints by injecting an element; its presence is the
          // direct signal, with height as a backstop.
          has = !!body && (!!body.querySelector('iframe, img, ins, a') || body.scrollHeight > 12);
        }
      } catch {
        // Unreadable means nothing can be confirmed. Fails CLOSED: collapsing
        // an ad that did arrive costs one impression, while reserving a hole
        // that never fills costs the reader on every page.
        has = false;
      }
      if (has) return setFilled(true);
      if (Date.now() - startedAt > FILL_GRACE_MS) return setFilled(false);
      window.setTimeout(tick, 900);
    };
    const id = window.setTimeout(tick, 1200);
    return () => {
      stopped = true;
      window.clearTimeout(id);
    };
  }, [on, cfg]);

  if (!cfg || !on) return null;
  if (filled === false) return null; // confirmed empty — no label, no gap

  // A REAL same-origin frame, not srcdoc. Both give the banner its own
  // document (which invoke.js needs, since it reads one global `atOptions`),
  // but srcdoc costs the document its identity: inside about:srcdoc the
  // hostname is empty, the origin is "null" and the referrer is empty, so
  // Adsterra cannot match the request to a registered site and returns no ad.
  // See public/ads/frame.html.
  const src = `/ads/frame.html?key=${encodeURIComponent(cfg.key)}&w=${cfg.width}&h=${cfg.height}`;
  return (
    <div className={`ad-wrap ${className}`}>
      {/* The label appears only once there is something to label. */}
      {filled && <span className="ad-label">Advertisement</span>}
      <iframe
        ref={frame}
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
