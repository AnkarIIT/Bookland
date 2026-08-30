/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'dark-surface': 'var(--color-surface)',
        'dark-raised': 'var(--color-raised)',
        ink: 'var(--color-text-primary)',
        muted: 'var(--color-text-secondary)',
        'dark-muted': 'var(--color-text-secondary)',
        primary: {
          500: 'var(--color-primary)',
          600: 'var(--color-primary)',
          700: 'color-mix(in srgb, var(--color-primary) 90%, black)',
        },
        accent: 'var(--color-accent)',
        border: 'var(--color-border)',
        'dark-border': 'var(--color-border)',
      },
      fontFamily: {
        sans: ['var(--font-body)'],
        display: ['var(--font-display)'],
      },
      letterSpacing: {
        tighter: '-0.02em',
        tightest: '-0.04em',
      },
      borderRadius: {
        'design-sm': 'var(--radius-sm)',
        'design-md': 'var(--radius-md)',
        'design-lg': 'var(--radius-lg)',
        'design-xl': 'var(--radius-xl)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        lift: 'var(--shadow-lift)',
        card: 'var(--shadow-card)',
        'card-dark': 'var(--shadow-card)',
        button: 'var(--shadow-button)',
        glow: '0 0 80px -20px rgb(var(--color-primary) / 0.45)',
        'glow-purple': '0 0 80px -20px rgb(175 93 232 / 0.45)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-tilt': {
          '0%, 100%': { transform: 'translateY(0px) rotate(var(--tilt, 0deg))' },
          '50%': { transform: 'translateY(-12px) rotate(var(--tilt, 0deg))' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        float: 'float 6s ease-in-out infinite',
        'float-tilt': 'float-tilt 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}