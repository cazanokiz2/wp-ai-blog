import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#4F46E5", dark: "#4338CA" },
        success: "#10B981",
        danger: "#EF4444",
        warning: "#F59E0B",
      },
    },
  },
  plugins: [],
};

export default config;
