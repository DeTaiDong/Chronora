import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        "zh-title": ["var(--font-ma-shan-zheng)", "serif"],
        "zh-reading": ["var(--font-noto-serif-sc)", "serif"]
      },
      colors: {
        ink: "#2b261f",
        moss: "#6f6658",
        ember: "#9b4a3f",
        paper: "#f6f1e7",
        jade: "#6f7f4f",
        gold: {
          DEFAULT: "#8a6a35",
          light: "#c9a86a",
          dark: "#4a3820"
        }
      }
    }
  },
  plugins: []
};

export default config;
