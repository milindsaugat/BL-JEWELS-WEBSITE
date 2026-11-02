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
          500: '#B02828',
          600: '#9B2020',
          700: '#8B1A1A',
          800: '#7A0F0F',
          900: '#5C0A0A',
          950: '#3D0505',
        },
        gold: {
          50:  '#FFFBEE',
          100: '#FAF3DC',
          200: '#EDD98A',
          300: '#E0C478',
          400: '#D4B05A',
          500: '#C9A44A',
          600: '#B6923B',
          700: '#A07830',
          800: '#8C6724',
          900: '#7A5C00',
        },
        pearl: '#FAF7F2',
        ivory: '#F5F0E8',
        charcoal: '#1C1410',
      },
      fontFamily: {
        heading: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        accent:  ['"Inter"', 'system-ui', 'sans-serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        cinzel: '0.08em',
      },
      boxShadow: {
        'gold-sm': '0 2px 8px rgba(201, 164, 74, 0.15)',
        'gold':    '0 4px 20px rgba(201, 164, 74, 0.25)',
        'crimson': '0 4px 20px rgba(139, 26, 26, 0.25)',
      },
      borderRadius: {
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}

