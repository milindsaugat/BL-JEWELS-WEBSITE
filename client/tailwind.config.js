/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          50:  '#FFF5F5',
          100: '#FDF0F0',
          200: '#F9D8D8',
          500: '#B02828',
          600: '#9B2020',
          700: '#930303',   // Primary brand Royal Crimson
          800: '#7A0303',
          900: '#5C0202',
          950: '#5C0202',
        },
        gold: {
          50:  '#FFFBEE',
          100: '#FAF3DC',
          200: '#EDD98A',
          300: '#E0C478',
          400: '#D4B05A',
          500: '#C9A44A',   // Primary gold
          600: '#B6923B',
          700: '#A07830',
          800: '#8C6724',
          900: '#7A5C00',
          950: '#4A3300',
        },
        pearl:     '#FFFFFF',
        ivory:     '#FFFFFF',
        parchment: '#F8F6F2',
        charcoal:  '#1C1410',
        royalCrimson: '#930303',
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'Georgia', 'serif'],
        heading: ['"Bodoni Moda"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        accent:  ['Cinzel', 'serif'],
        script:  ['"Alex Brush"', '"Great Vibes"', 'cursive'],
      },
      letterSpacing: {
        cinzel:  '0.08em',
        display: '-0.01em',
        wide:    '0.12em',
      },
      boxShadow: {
        'gold-sm': '0 2px 8px rgba(201, 164, 74, 0.15)',
        'gold':    '0 4px 20px rgba(201, 164, 74, 0.25)',
        'gold-lg': '0 8px 40px rgba(201, 164, 74, 0.35)',
        'crimson': '0 4px 20px rgba(139, 26, 26, 0.25)',
        'premium': '0 20px 60px rgba(28, 20, 16, 0.12)',
      },
      borderRadius: {
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}

