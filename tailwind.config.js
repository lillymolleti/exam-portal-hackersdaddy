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
        primary: '#5cffc9', // Primary color (light cyan/teal)
        secondary: '#00ac76', // Secondary color (darker green/teal)
        'light-bg': '#ffffff', // Light mode background
        'light-text': '#000000', // Light mode text
        'dark-text': '#ffffff', // Dark mode text
        // 'light-secondary-bg': '#f0f0f0', // Light mode secondary background (for buttons, etc.)
        'dark-secondary-bg': '#1f1f1f', // Dark mode secondary background
        'light-secondary-bg': '#f0f0f0',
        'dark-error': '#ef5350',
        'light-error': '#d32f2f',
        'light-neutral': '#e6f7f2', // A light tint of secondary for light mode, replaces gray-300
        'dark-neutral': '#1a3a2e', // A dark tint of secondary for dark mode, replaces gray-700
     
      },
    },
  },
  plugins: [],
};
