/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
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
