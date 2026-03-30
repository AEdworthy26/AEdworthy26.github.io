/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif:   ['"Source Serif 4"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        paper:      '#f4f0e6',
        ink:        '#0d0d0d',
        accent:     '#003399',
        curiosity:  '#6b3a00',
        gold:       '#96751e',
        rule:       '#1a1a1a',
        subtle:     '#ece8e0',
        border:     '#d8d3c8',
        muted:      '#555555',
        light:      '#888888',
      },
    },
  },
  plugins: [],
}
