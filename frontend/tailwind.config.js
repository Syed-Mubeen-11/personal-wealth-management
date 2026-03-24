/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          base:    '#0d1117',
          surface: '#161b27',
          card:    '#1a2035',
          hover:   '#1f2844',
          border:  '#252f47',
        },
        purple: {
          DEFAULT: '#a855f7',
          dim:     '#7c3aed',
          glow:    'rgba(168,85,247,0.3)',
        },
        pink: {
          DEFAULT: '#ec4899',
        },
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderWidth: { 3: '3px' },
    },
  },
  plugins: [],
}
