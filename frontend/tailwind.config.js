/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0B0B0C',
          900: '#111113',
          850: '#16171A',
          800: '#1A1A1D',
          750: '#202024',
          700: '#27272C',
          600: '#34343A',
          500: '#4A4A52',
          400: '#6B6B75',
          300: '#9A9AA3',
          200: '#C8C8CE',
          100: '#E6E6EA',
        },
        signal: {
          red: '#EB001B',
          orange: '#FF5F00',
          amber: '#FFB020',
          green: '#1FCB7A',
          blue: '#3B82F6',
        },
      },
      boxShadow: {
        'card': '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
