/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#080808',
        surface: '#111111',
        card: '#161616',
        border: 'rgba(255,255,255,0.08)',
        'accent-lime': '#C8FF00',
        'accent-cyan': '#00FFE0',
        'accent-hot': '#FF2D6B',
        'accent-gold': '#FFB800',
        'text-primary': '#F5F5F0',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        heading: ['Bebas Neue', 'sans-serif'],
        data: ['Space Mono', 'monospace'],
        body: ['Rajdhani', 'sans-serif'],
      },
      borderRadius: {
        card: '6px',
      },
    },
  },
  plugins: [],
}
