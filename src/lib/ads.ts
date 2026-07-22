// Adsterra direct-tag ad configuration for xaa.es.
// highperformanceformat.com = iframe display banners (isolated per slot);
// effectivecpmnetwork.com = native banner, social bar and smart link.
// Rendered by src/components/Ads.tsx.
export type BannerSlot = 'leaderboard' | 'rectangle' | 'banner468' | 'halfpage' | 'skyscraper' | 'mobile';
type Banner = { key: string; width: number; height: number };
interface AdsConfig {
  banners: Partial<Record<BannerSlot, Banner>>;
  native: { container: string; src: string } | null;
  socialBar: string | null;
  smartLink: string | null;
}

export const ADS: AdsConfig = {
  banners: {
    leaderboard: { key: '258ed9f0c1c6a3d2afef261e723d2564', width: 728, height: 90 },
    rectangle: { key: '8098e0116f57f3b2ed297caa803507a3', width: 300, height: 250 },
    banner468: { key: '6401add15d42a3d88ef9bbfffe7a5df4', width: 468, height: 60 },
    halfpage: { key: '2e68be5e549c9ad1fdcc6d383cc019c5', width: 160, height: 600 },
    skyscraper: { key: '20fbc833c5c510a82409b00f9c51e7f4', width: 160, height: 300 },
    mobile: { key: '9872be1f4793dfcceeb2dd9c196d98b8', width: 320, height: 50 },
  },
  native: {
    container: 'fe88fcb65928b1dd5aac1114656ccda9',
    src: 'https://pl30477810.effectivecpmnetwork.com/fe88fcb65928b1dd5aac1114656ccda9/invoke.js',
  },
  socialBar: 'https://pl30477811.effectivecpmnetwork.com/0a/0c/a6/0a0ca691ba061f502102603218ee1f67.js',
  smartLink: 'https://www.effectivecpmnetwork.com/v20eaeb6?key=dcef883c0744f1a923067612f0c72440',
};
