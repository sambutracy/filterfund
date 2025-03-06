/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#fff0f5',
          600: '#ff69b4',
          700: '#e75480',
        },
      },
    },
  },
  plugins: [],
}
