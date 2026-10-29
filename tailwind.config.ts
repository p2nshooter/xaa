import type { Config } from 'tailwindcss';

// xaa.es — a crystal palace over flowing water (owner, 28 Oct 2026, request 69, docs/BLUEPRINT.md §15): ivory
// marble, royal gold, emerald and night lapis, Playfair Display for headings.
//
// `gold` is real gold (it was the brand blue until request 69): 500/600 are deep enough for text on ivory (AA),
// 300/400 are for ornament and for dark lapis surfaces. `ink` is night lapis. `slate` is remapped to warm marble
// greys so the utility classes used across the pages follow the palace without touching every call site.
// `serif` and `display` both map to the display face (Playfair Display).
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Night lapis: headings, the dark halls (CTA band, footer).
        ink: { 950: '#070d22', 900: '#0b1533', 800: '#1c2a52', 700: '#33416b' },
        // Ivory marble surfaces.
        ivory: { 50: '#fffdf8', 100: '#fbf8f1', 200: '#f3ecdd' },
        // Royal gold.
        gold: { 300: '#f3d98b', 400: '#e0b44d', 500: '#8a6514', 600: '#6f500d' },
        // Emerald of the gardens.
        jade: { 300: '#9fd8c4', 400: '#3fae8e', 500: '#17725c', 600: '#0f5c4a' },
        // Warm marble greys for muted text.
        steel: { 300: '#ddd2bd', 400: '#8c7f68', 500: '#6b604f' },
        slate: {
          50: '#faf7f0', 100: '#f4efe4', 200: '#e8dfcc', 300: '#d6c9b0', 400: '#a99a7e',
          500: '#7c6f5a', 600: '#5f5444', 700: '#463d31', 800: '#2f2921', 900: '#1f1b15', 950: '#14110d'
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      maxWidth: { prose2: '44rem' },
      boxShadow: {
        soft: '0 1px 2px rgba(60,44,12,.05), 0 8px 24px -12px rgba(60,44,12,.16)',
        lift: '0 2px 4px rgba(60,44,12,.05), 0 20px 40px -16px rgba(60,44,12,.22)'
      }
    }
  },
  plugins: []
};
export default config;
