/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', './docs/index.html'],
  theme: {
    extend: {
      colors: {
        canopy: '#14634f',
        moss: '#657a47',
        soil: '#6d4d38',
        clay: '#a9542f',
        skywash: '#e8f0f4',
        paper: '#f8f5ec',
        ink: '#17211b',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(23, 33, 27, 0.10)',
      },
    },
  },
  plugins: [],
};
