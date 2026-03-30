/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper:    '#f4f0e6',
        ink:      '#0d0d0d',
        muted:    '#555555',
        faint:    '#888888',
        'hub-blue':   '#003399',
        'hub-border': '#d8d3c8',
        'hub-subtle': '#ece8e0',
        cat: {
          work:     '#1d4ed8',
          social:   '#15803d',
          sport:    '#dc2626',
          personal: '#7c3aed',
          other:    '#374151',
        },
      },
      fontFamily: {
        serif:   ['"Source Serif 4"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      gridTemplateColumns: {
        cal: 'repeat(7, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
}
