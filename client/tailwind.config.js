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
        canvas: '#f5f5f7',
        surface: '#ffffff',
        ink: '#1d1d1f',
        muted: '#6e6e73',
        primary: {
          50: '#f0f7ff',
          100: '#e1effe',
          200: '#b8daff',
          300: '#7fc1ff',
          400: '#3a9bff',
          500: '#0a84ff',
          600: '#0071e3',
          700: '#005fc4',
          800: '#0a4c8c',
          900: '#0a3a6b',
          950: '#072a4a',
        },
        dark: {
          canvas: '#000000',
          surface: '#1d1d1f',
          raised: '#2c2c2e',
          muted: '#86868b',
          border: '#2a2a2c',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.02em',
        tightest: '-0.04em',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(0, 0, 0, 0.05)',
        lift: '0 24px 60px -15px rgba(0, 0, 0, 0.18)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        button: '0 2px 8px rgba(0, 113, 227, 0.35)',
        glow: '0 0 80px -20px rgba(10, 132, 255, 0.45)',
        'glow-purple': '0 0 80px -20px rgba(124, 58, 237, 0.45)',
        card: '0 4px 20px rgba(0, 0, 0, 0.06), 0 40px 80px -40px rgba(0, 0, 0, 0.18)',
        'card-dark': '0 4px 20px rgba(0, 0, 0, 0.5), 0 40px 80px -40px rgba(0, 0, 0, 0.6)',
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
