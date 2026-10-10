import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

/**
 * System designu Peritus — jedyne źródło kolorów, typografii, promieni i cieni.
 * Zasady (uzasadnienia: tasks/audyt-ux-ui.md §3–4):
 * - neutrale (linie, tła kontrolek) wyłącznie z beżu, nigdy `white/x`;
 * - pomarańcz (`accent`) = akcja + cena (+ aktywna zakładka, logo); detale w beżu;
 * - dwa promienie: `card` (kontenery, karty, zdjęcia) i `control` (przyciski, pola);
 * - dwa cienie: `e1` (drobne elementy pływające), `e2` (header, panele).
 */
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
        "card-bg": "#1A140D",
        "panel-bg": "#15100A",
        // Tekst — kremowa biel i ciepły taupe zamiast neutralnych szarości.
        "text-primary": "#F4ECDE",
        "text-secondary": "#A99B84",
        // Pomarańcz z logo — kolor akcji (przyciski, ceny, aktywne stany).
        accent: "#E9821E",
        "accent-soft": "#F3A24E",
        // Beż firmowy — ciepły neutralny akcent (detale, subtelne tła).
        beige: "#D9C4A3",
        // Linie (ramki, separatory) — ciepłe, z beżu. `line-strong` = hover/aktywne.
        line: "rgba(217, 196, 163, 0.12)",
        "line-strong": "rgba(217, 196, 163, 0.28)",
      },
      fontFamily: {
        // Inter (next/font, app/layout.tsx) — interfejs i treść.
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        // Montserrat — font marki: logotyp i eyebrow.
        brand: ["var(--font-montserrat)", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        // Skala typograficzna. Display/h1 płynne (clamp) — bez skoków między breakpointami.
        display: ["clamp(2.5rem, 2rem + 3vw, 4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        h1: ["clamp(2.25rem, 1.75rem + 2vw, 3.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        h2: ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "-0.01em" }],
        h3: ["1.25rem", { lineHeight: "1.75rem" }],
        body: ["1rem", { lineHeight: "1.625rem" }],
        small: ["0.875rem", { lineHeight: "1.375rem" }],
        eyebrow: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.2em", fontWeight: "500" }],
      },
      borderRadius: {
        card: "0.75rem",
        control: "0.5rem",
      },
      boxShadow: {
        e1: "0 4px 24px rgba(0, 0, 0, 0.25)",
        e2: "0 18px 48px rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
