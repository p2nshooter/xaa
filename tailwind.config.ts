import type { Config } from 'tailwindcss';

// xaa.es — studio identity taken from the mark: deep midnight navy, electric
// blue, brushed silver. `ink` = surfaces, `ivory` = light text/paper,
// `gold` = the accent ramp (kept under the old names so shared template code
// and the editorial archive keep working unchanged).
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#04091b', 900: '#070f2b', 800: '#0c1740', 700: '#142158' },
        ivory: { 50: '#f5f8ff', 100: '#e6edfb', 200: '#cbd8f2' },
        gold: { 300: '#60c8ff', 400: '#2f9dff', 500: '#0b6fe8', 600: '#0a52bd' },
        steel: { 300: '#c9d4e6', 400: '#9fb0c9', 500: '#6f81a0' }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif']
      },
      maxWidth: { prose2: '44rem' }
    }
  },
  plugins: []
};
export default config;
