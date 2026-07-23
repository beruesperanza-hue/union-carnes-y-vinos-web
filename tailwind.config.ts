import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brasa: {
          50: '#FBF6EC',
          100: '#F3E7CE',
          200: '#E8D4A8',
          300: '#D9BC7C',
          900: '#17130F',
          950: '#0F0C09',
        },
        ember: {
          400: '#E8703F',
          500: '#D9542A',
          600: '#BC3E11',
        },
        malbec: {
          500: '#8A3B44',
          600: '#722F37',
          700: '#57242E',
        },
        gold: {
          400: '#D9B876',
          500: '#C9A45C',
        },
      },
    },
  },
  plugins: [],
};
export default config;
