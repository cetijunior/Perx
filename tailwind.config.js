/** @type {import('tailwindcss').Config} */
const ch = (v) => `rgb(var(${v}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: ch('--bg'),
        'bg-elevated': ch('--bg-elevated'),
        'bg-elevated-2': ch('--bg-elevated-2'),
        line: ch('--surface-line'),
        'line-soft': ch('--surface-line-soft'),
        text: ch('--text'),
        muted: ch('--text-muted'),
        faint: ch('--text-faint'),
        'on-accent': ch('--text-on-accent'),
        ember: { DEFAULT: ch('--ember'), 400: ch('--ember-400'), 600: ch('--ember-600') },
        gold: { DEFAULT: ch('--gold'), 400: ch('--gold-400'), 600: ch('--gold-600') },
        success: ch('--success'),
        warning: ch('--warning'),
        danger: ch('--danger'),
        info: ch('--info'),
        wellness: ch('--cat-wellness'),
        food: ch('--cat-food'),
        sport: ch('--cat-sport'),
        travel: ch('--cat-travel'),
        learning: ch('--cat-learning'),
        selfcare: ch('--cat-selfcare'),
        health: ch('--cat-health'),
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Clash Display"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        e1: '0 1px 2px rgb(15 14 30 / 0.04)',
        e2: '0 1px 2px rgb(15 14 30 / 0.05)',
        e3: '0 6px 18px rgb(15 14 30 / 0.08)',
        glow: '0 4px 16px rgb(var(--ember) / 0.22)',
        gold: '0 4px 16px rgb(var(--gold) / 0.16)',
      },
      backgroundImage: {
        'grad-ember': 'var(--grad-ember)',
        'grad-dusk': 'var(--grad-dusk)',
        'grad-gold': 'var(--grad-gold)',
        'grad-aurora': 'var(--grad-aurora)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        breathe: { '0%,100%': { opacity: '0.85', transform: 'scale(1)' }, '50%': { opacity: '1', transform: 'scale(1.06)' } },
        pulsedot: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        sweep: { '0%': { transform: 'translateX(-120%)' }, '100%': { transform: 'translateX(220%)' } },
      },
      animation: {
        shimmer: 'shimmer 1.4s infinite',
        breathe: 'breathe 3.2s ease-in-out infinite',
        pulsedot: 'pulsedot 1.6s ease-in-out infinite',
        floaty: 'floaty 5s ease-in-out infinite',
        sweep: 'sweep 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
