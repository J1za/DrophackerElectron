const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        satoshi: ["Satoshi", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        "primary-orange": "#FF5722",
      },
      keyframes: {
        wiggle: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        gradientAnimate: {
          "0%, 100%": {
            filter: "hue-rotate(-45deg)",
          },
          "50%": {
            filter: "hue-rotate(45deg)",
          },
        },
      },
      animation: {
        wiggle: "wiggle 500ms ease-in-out",
        gradientAnimate: "gradientAnimate 3s linear infinite",
      },
    },
  },
  plugins: [
    "postcss-import",
    "postcss-nesting",
    "tailwindcss",
    "autoprefixer",
    require("@tailwindcss/typography"),
  ],
};
