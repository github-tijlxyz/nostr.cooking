const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config}*/
const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        primary: '#EC4700',
        danger: '#FF3535',
        input: '#F6F6F6',
        'accent-gray': '#DDDDDD',
        caption: '#716F6C'
      }
    }
  },

  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
};

module.exports = config;
