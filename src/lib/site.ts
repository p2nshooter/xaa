// Per-site brand config. This is the ONE file (plus tailwind colors, the CSS
// variables in globals.css, and content/articles.ts) that changes between the
// sibling article sites — everything else is shared template code.
//
// xaa.es is the network's WORLD CUP 2026 football magazine: original,
// independent writing about the tournament, its teams, players, tactics and
// history. Pitch-green + trophy-gold identity, football ornaments.
export const SITE = {
  id: 'xaa-es', // central ad-control + analytics key (matches ulyah admin)
  name: 'Xaa',
  domain: 'xaa.es',
  url: 'https://xaa.es',
  tagline: 'World Cup 2026 — every match, every story',
  description:
    'Independent, original football writing for World Cup 2026 — the teams, the players, the tactics, the host cities and the history, explained with no hype and no clickbait.',
  locale: 'en',
  // Home hero headline: `lead` in ink, `accent` in green gradient.
  heroLead: 'The road to',
  heroAccent: 'World Cup 2026',
  adClient: 'ca-pub-6371903555702163',
  // Analytics beacon endpoint (central, on the ulyah worker-api).
  analyticsEndpoint: 'https://api.ulyah.com/track',
  adConfigEndpoint: 'https://api.ulyah.com/content/ad-config',
} as const;
