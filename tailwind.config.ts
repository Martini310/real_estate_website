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
        background: "#0E0E0E",
        "secondary-dark": "#151515",
        "card-bg": "#1C1C1C",
        "panel-bg": "#151515",
        "text-primary": "#F5F5F5",
        "text-secondary": "#A3A3A3",
        accent: "#C6A15B",
      },
    },
  },
  plugins: [],
};
export default config;
