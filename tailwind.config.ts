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
        // Ciemna, ciepła baza (espresso) — zamiast zimnej czerni,
        // żeby beż i pomarańcz z logo Peritus miały spójne, ciepłe podłoże.
        background: "#0F0B06",
        "secondary-dark": "#151009",
        "card-bg": "#1A140D",
        "panel-bg": "#15100A",
        // Tekst — kremowa biel i ciepły taupe zamiast neutralnych szarości.
        "text-primary": "#F4ECDE",
        "text-secondary": "#A99B84",
        // Pomarańcz z logo — kolor akcji (przyciski, ceny, aktywne stany).
        accent: "#E9821E",
        "accent-soft": "#F3A24E",
        "accent-strong": "#D06E12",
        // Beż firmowy — ciepły neutralny akcent (detale, subtelne tła).
        beige: "#D9C4A3",
        "beige-muted": "#8A7C64",
      },
      boxShadow: {
        // Ciepła poświata pomarańczu dla kluczowych akcentów.
        glow: "0 0 40px -12px rgba(233, 130, 30, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
