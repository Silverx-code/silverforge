import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { forge: { DEFAULT: "#c23805", dark: "#a32f05", light: "#f7c9ba" }, slate: { ...colors.slate, DEFAULT: "#272d37" }, canvas: "#f7f9fb", silver: "#94a3b8" },
      fontFamily: { display: ["Geist", "sans-serif"], body: ["Inter", "sans-serif"] },
      boxShadow: { forge: "0 1px 3px rgb(0 0 0 / 0.12)", "forge-raised": "0 10px 20px rgb(0 0 0 / 0.08)" },
    },
  },
  plugins: [],
};
export default config;
