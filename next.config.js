/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Put <title>, description, canonical and Open Graph in <head> for EVERY
  // visitor. By default Next 15 streams metadata into <body> for clients not on
  // its bot list — and on this site that included Googlebot, GPTBot and
  // ClaudeBot — while social scrapers (WhatsApp, Facebook, X, LinkedIn) only
  // read <head>, so shared links came out with no title or image.
  htmlLimitedBots: /.*/,
  images: { unoptimized: true },
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
