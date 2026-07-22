import type { Config } from 'tailwindcss';

// xaa.es — trust-premium finance theme: deep navy, ivory paper, warm gold.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#06210f', 900: '#0a2818', 800: '#0f3a22', 700: '#17512f' },
        ivory: { 50: '#f2faf3', 100: '#e3f3e6', 200: '#cbe8d1' },
        gold: { 300: '#4ade80', 400: '#22c55e', 500: '#16a34a', 600: '#15803d' }
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
