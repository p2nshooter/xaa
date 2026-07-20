import type { Config } from 'tailwindcss';

// xaa.es — trust-premium finance theme: deep navy, ivory paper, warm gold.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#0a1428', 900: '#0f1e3d', 800: '#16294f', 700: '#213a68' },
        ivory: { 50: '#f9f7f2', 100: '#f1ede2', 200: '#e4dcc8' },
        gold: { 300: '#e6cd86', 400: '#d4b25a', 500: '#bf983c', 600: '#9c7a2c' }
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
