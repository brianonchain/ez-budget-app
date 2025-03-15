/** @type {import('tailwindcss').Config} */
import plugin from "tailwindcss/plugin";

module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "light-bg1": "#F6F9FC",
        "light-bg2": "#EEF3F7", // slate-125
        "light-bg3": "#E2E8F0", // slate-200
        "light-text1": "#425466",
        "light-text2": "#94A3B8", // slate-400
        "light-text-link": "#4A4CCA", // logo color
        "light-text-error": "",

        "light-button1": "#4A4CCA",
        "light-button1-hover": "#6F71DE",
        "light-button1-text": "#FFFFFF",
        "light-button2": "#64748B", // slate-500
        "light-button2-hover": "#94A3B8", // slate-400
        "light-button2-text": "#000000",

        "dark-bg1": "#111114",
        "dark-bg2": "#222127",
        "dark-bg3": "#35343B",
        "dark-text1": "#E2E8F0",
        "dark-text2": "#00C2FF",
        "dark-text-link": "#6A6D73",
        "dark-text-error": "",

        "dark-button1": "#000000",
        "dark-button1-hover": "#334155",
        "dark-button1-text": "#000000",
        "dark-button2": "#000000",
        "dark-button2-hover": "#334155",
        "dark-button2-text": "#000000",
      },
    },
    screens: {
      xs: "480px",
      sm: "600px",
      md: "750px",
      lg: "940px",
      lgg: "1100px",
      xl: "1250px",
      xxl: "1440px",
    },
  },
  darkMode: "class",
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("desktop", ["@media (hover: hover)", "@media (pointer: fine)"]);
    }),
  ],
};
