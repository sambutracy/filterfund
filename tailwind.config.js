/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class', // or 'media' for OS-level preference
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // primary red
          600: '#dc2626', // slightly darker
          700: '#b91c1c', // darker maroon
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Accent colors
        accent: {
          light: '#fecdd3', // rose-200
          DEFAULT: '#fb7185', // rose-400
          dark: '#e11d48', // rose-600
        },
        // Background colors
        background: {
          light: '#ffffff',
          DEFAULT: '#f9fafb', // gray-50
          dark: '#111827', // gray-900
        },
        // Text colors
        text: {
          light: '#f3f4f6', // gray-100
          DEFAULT: '#1f2937', // gray-800
          dark: '#030712', // gray-950
        },
      },
      // Custom gradient
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, var(--tw-gradient-stops))',
      },
      gradientColorStops: {
        'primary-start': '#b91c1c', // red-700
        'primary-end': '#f43f5e', // rose-500
      },
    },
  },
  plugins: [],
}
