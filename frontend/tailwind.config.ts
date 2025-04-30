/** @type {import('tailwindcss').Config} */
import plugin from "tailwindcss/plugin";

module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "selector",
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("desktop", ["@media (hover: hover)", "@media (pointer: fine)"]);
    }),
  ],
};
