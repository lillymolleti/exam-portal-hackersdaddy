/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Added to enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        glacial: ['"Glacial Indifference"', 'sans-serif'],
      },
      colors: {
        primary: '#5cffc9',
        secondary: '#00ac76',
        darkbg: '#121212',
      },
    },
  },
  plugins: [],
};