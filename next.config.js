/** @type {import('next').NextConfig} */
const REMOVED_WORLD_CUP_ARTICLES = {
  'world-cup-2026-host-venues': 'world-cup-2026',
  'world-cup-2026-fans-travel-guide': 'world-cup-2026',
  'understanding-world-cup-group-stage-format': 'world-cup-2026',
  'world-cup-2026-qualification-process': 'world-cup-2026',
  'world-cup-2026-host-cities-sustainability-efforts': 'world-cup-2026',
  'understanding-world-cup-2026-group-stage-draw': 'world-cup-2026',
  'world-cup-2026-host-cities-infrastructure': 'world-cup-2026',
  'world-cup-2026-host-cities-transportation': 'world-cup-2026',
  'world-cup-2026-host-city-profiles': 'world-cup-2026',
  'world-cup-2026-venue-selection-process': 'world-cup-2026',
  'world-cup-2026-venue-legacy': 'world-cup-2026',
  'world-cup-2026-venue-profiles': 'world-cup-2026',
  'world-cup-2026-venue-legacy-7wpl': 'world-cup-2026',
  'world-cup-2026-venue-impact': 'world-cup-2026',
  'world-cup-2026-tournament-format': 'world-cup-2026',
  'understanding-world-cup-2026-scheduling': 'world-cup-2026',
  'world-cup-2026-host-cities-transportation-zfl9': 'world-cup-2026',
  'world-cup-2026-venue-profiles-y5x5': 'world-cup-2026',
  'world-cup-2026-venue-operations': 'world-cup-2026',
  'the-evolution-of-world-cup-finals': 'world-cup-2026',
  'the-evolution-of-world-cup-finals-reir': 'history',
  'world-cup-2026-venue-sustainability': 'world-cup-2026',
  'understanding-world-cup-2026-scheduling-ofcb': 'world-cup-2026',
  'world-cup-2026-venue-selection-process-lxut': 'world-cup-2026',
  'the-evolution-of-world-cup-finals-2bmm': 'history',
  'understanding-world-cup-2026-qualification-rules': 'world-cup-2026',
  'world-cup-2026-host-city-profiles-gmwd': 'world-cup-2026',
  'the-world-cup-2026-venue-legacy': 'world-cup-2026',
  'world-cup-2026-host-city-profiles-uvh6': 'world-cup-2026',
  'world-cup-2026-venue-profiles-ts8s': 'world-cup-2026',
  'world-cup-2026-venue-characteristics': 'world-cup-2026',
  'the-evolution-of-world-cup-finals-qgef': 'history',
  'the-evolution-of-world-cup-finals-pk4j': 'history',
  'world-cup-2026-venue-selection-process-kgwv': 'world-cup-2026',
  'understanding-world-cup-venue-selection': 'world-cup-2026',
  'understanding-world-cup-2026-group-stage-seeding': 'world-cup-2026',
  'the-evolution-of-world-cup-finals-nunx': 'history',
  'world-cup-2026-venue-selection-process-2jfn': 'world-cup-2026',
  'understanding-world-cup-scheduling': 'world-cup-2026',
  'understanding-world-cup-venue-capacity': 'world-cup-2026',
  'mechanics-of-world-cup-venue-capacity': 'world-cup-2026',
  'mechanics-of-world-cup-venue-capacity-n2s2': 'world-cup-2026',
  'world-cup-2026-venue-capacity': 'world-cup-2026',
  'world-cup-2026-venue-capacity-kiyg': 'world-cup-2026',
  'understanding-world-cup-venue-capacity-i56j': 'world-cup-2026',
  'world-cup-2026-venue-capacity-wze8': 'world-cup-2026',
  'understanding-world-cup-venue-capacity-vk5w': 'world-cup-2026',
  'understanding-world-cup-venue-capacity-5mg6': 'world-cup-2026',
  'world-cup-2026-venue-capacity-21qm': 'world-cup-2026',
  'world-cup-venue-capacity': 'world-cup-2026',
  'world-cup-2026-venue-capacity-d7wj': 'world-cup-2026',
  'understanding-world-cup-venue-capacity-c88b': 'world-cup-2026',
  'understanding-world-cup-venue-capacity-aws8': 'world-cup-2026',
  'world-cup-2026-venue-capacity-jw8l': 'world-cup-2026',
  'world-cup-2026-venue-capacity-xykr': 'world-cup-2026',
  'world-cup-2026-venue-capacity-vezu': 'world-cup-2026',
  'world-cup-2026-venue-capacity-unlw': 'world-cup-2026',
  'world-cup-2026-venue-capacity-89u6': 'world-cup-2026',
  'understanding-world-cup-venue-capacity-5try': 'world-cup-2026',
  'world-cup-2026-stadium-capacity': 'world-cup-2026',
  'world-cup-2026-venue-capacity-uhjo': 'world-cup-2026',
  'world-cup-2026-venue-capacity-i4e9': 'world-cup-2026',
  'mechanics-of-world-cup-venue-capacity-x728': 'world-cup-2026',
  'world-cup-2026-venue-capacity-v88l': 'world-cup-2026',
  'understanding-world-cup-venue-capacity-7k8j': 'world-cup-2026',
  'world-cup-2026-venue-capacity-4hwi': 'world-cup-2026',
  'world-cup-venue-capacity-3yzv': 'world-cup-2026',
  'world-cup-2026-venue-capacity-0vuz': 'world-cup-2026',
  'world-cup-venue-capacity-09rr': 'world-cup-2026',
  'understanding-world-cup-venue-capacity-0nwt': 'world-cup-2026',
  'world-cup-venue-capacity-zdru': 'world-cup-2026',
  'world-cup-2026-venue-capacity-hj68': 'world-cup-2026',
  'world-cup-2026-venue-capacity-hd3m': 'world-cup-2026',
  'world-cup-venue-capacity-7fgh': 'world-cup-2026',
  'mechanics-of-world-cup-venue-capacity-kj03': 'world-cup-2026',
  'world-cup-2026-venue-capacity-jf9t': 'world-cup-2026',
};

const nextConfig = {
  reactStrictMode: true,
  // Put <title>, description, canonical and Open Graph in <head> for EVERY
  // visitor. By default Next 15 streams metadata into <body> for clients not on
  // its bot list — and on this site that included Googlebot, GPTBot and
  // ClaudeBot — while social scrapers (WhatsApp, Facebook, X, LinkedIn) only
  // read <head>, so shared links came out with no title or image.
  htmlLimitedBots: /.*/,
  images: { unoptimized: true },
  // 76 bot-written World Cup articles were removed (owner, 4 Oct 2026):
  // hand-written only — 37 of them shared one title and many were thin. Each
  // url goes to its football desk so no link or index entry dies.
  async redirects() {
    return Object.entries(REMOVED_WORLD_CUP_ARTICLES).map(([slug, cat]) => ({ source: `/articles/${slug}`, destination: `/category/${cat}`, permanent: true }));
  },
  // Security headers on every route. The CSP is deliberately structural only
  // (framing, base URI, plugins, upgrading stray http:// requests): it does not
  // restrict script sources, which AdSense and the inline JSON-LD need.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests" },
        ],
      },
    ];
  },
  experimental: {
    // Concept decks, brand archives and design files come in through server
    // actions, so the default 1 MB body limit is far too small. Matches
    // MAX_FILE_BYTES in src/server/uploads.ts, with headroom for a batch.
    serverActions: { bodySizeLimit: '30mb' },
  },
};
module.exports = nextConfig;
const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');
initOpenNextCloudflareForDev();
