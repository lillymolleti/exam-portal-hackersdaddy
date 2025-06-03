
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode using the 'dark' class
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        glacial: ['"Glacial Indifference"', 'sans-serif'],
      },
      colors: {
        darkbg: '#121212', // Default dark background
        primary: '#5cffc9', // Primary color
        secondary: '#00ac76', // Secondary color
        // Add light mode colors if needed
        'light-bg': '#ffffff',
        'light-text': '#000000',
      },
    },
  },
  plugins: [],
};