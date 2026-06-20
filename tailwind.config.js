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
        sm: '10px',
        md: '16px',
        lg: '22px',
        xl: '28px',
      },
      boxShadow: {
        e1: '0 1px 2px #00000040',
        e2: '0 4px 16px #00000055',
        e3: '0 12px 40px #00000066',
        glow: '0 8px 32px rgb(var(--ember) / 0.40)',
        gold: '0 8px 32px rgb(var(--gold) / 0.25)',
      },
      backgroundImage: {
        'grad-ember': 'linear-gradient(135deg, #FF7A5C 0%, #F4593B 50%, #D8421F 100%)',
        'grad-dusk': 'linear-gradient(160deg, #181C25 0%, #0B0D12 100%)',
        'grad-gold': 'linear-gradient(135deg, #F2C879 0%, #E0A938 100%)',
        'grad-aurora':
          'radial-gradient(120% 120% at 0% 0%, rgb(var(--ember) / 0.20), transparent 50%), radial-gradient(120% 120% at 100% 0%, rgb(var(--cat-travel) / 0.13), transparent 50%)',
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
