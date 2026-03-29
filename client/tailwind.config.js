/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#fdfbf7',
        ink: '#1a1a1a',
        accent: '#2b6cb0'
      }
    },
  },
  plugins: [],
}
