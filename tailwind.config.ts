import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17201d",
        moss: "#526a5b",
        ember: "#b75b38",
        paper: "#faf7f0",
        jade: "#2f7d6d"
      }
    }
  },
  plugins: []
};

export default config;
