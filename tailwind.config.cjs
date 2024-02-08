const defaultTheme = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config}*/
const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", ...defaultTheme.fontFamily.sans]
      }
    }
  },

  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
};

module.exports = config;
