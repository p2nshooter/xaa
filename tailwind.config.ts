import type { Config } from 'tailwindcss';

// xaa.es — bright studio identity: white paper, vivid blue from the mark,
// slate type. Deliberately light: the previous navy-on-navy treatment read as
// heavy rather than premium.
//
// `serif` maps to the display face (Plus Jakarta Sans), not an actual serif.
// The name is kept because ~120 call sites use `font-serif` for headings, and
// remapping the token is cleaner than churning every one of them. Use
// `font-display` in new code.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep shades, used sparingly — vivid blue panels and the CTA band.
        ink: { 950: '#0b1220', 900: '#0f172a', 800: '#1e293b', 700: '#334155' },
        // Light surfaces.
        ivory: { 50: '#ffffff', 100: '#f7f9fc', 200: '#eef3fa' },
        // The accent ramp, taken off the mark.
        gold: { 300: '#7cb0ff', 400: '#4d8bff', 500: '#2b6bff', 600: '#1d4ed8' },
        steel: { 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b' }
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      maxWidth: { prose2: '44rem' },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.12)',
        lift: '0 2px 4px rgba(15,23,42,.04), 0 20px 40px -16px rgba(15,23,42,.18)'
      }
    }
  },
  plugins: []
};
export default config;
