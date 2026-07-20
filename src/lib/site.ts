// Per-site brand config. This is the ONE file (plus tailwind colors, the CSS
// variables in globals.css, and content/articles.ts) that changes between the
// sibling article sites — everything else is shared template code.
export const SITE = {
  id: 'xaa-es', // central ad-control + analytics key (matches ulyah admin)
  name: 'Xaa',
  domain: 'xaa.es',
  url: 'https://xaa.es',
  tagline: 'Insurance & money, made clear',
  description:
    'Clear, independent guides to insurance, saving, borrowing and building wealth — plain-English explainers with no jargon and no sales pitch.',
  locale: 'en',
  // Home hero headline: `lead` in ink, `accent` in gold gradient.
  heroLead: 'Insurance & money,',
  heroAccent: 'made clear',
  adClient: 'ca-pub-6371903555702163',
  // Analytics beacon endpoint (central, on the ulyah worker-api).
  analyticsEndpoint: 'https://api.ulyah.com/track',
  adConfigEndpoint: 'https://api.ulyah.com/content/ad-config',
} as const;
