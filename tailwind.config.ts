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
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        inkReveal: {
          from: { opacity: "0", filter: "blur(8px)", transform: "scale(0.9)" },
          to:   { opacity: "1", filter: "blur(0px)", transform: "scale(1)" },
        },
        popIn: {
          "0%":   { opacity: "0", transform: "scale(0.6)" },
          "70%":  { opacity: "1", transform: "scale(1.08)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        headerGlow: {
          "0%, 100%": { opacity: "0.35" },
          "50%":      { opacity: "1" },
        },
      },
      animation: {
        "fade-up":     "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
        "ink-reveal":  "inkReveal 0.75s cubic-bezier(0.22,1,0.36,1) forwards",
        "pop-in":      "popIn 0.4s cubic-bezier(0.22,1,0.36,1) forwards",
        "header-glow": "headerGlow 5s ease-in-out infinite",
      },
    }
  },
  plugins: []
};

export default config;
