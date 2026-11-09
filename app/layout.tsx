import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SkipLink from "@/components/ui/SkipLink";
import AnalyticsEvents from "@/components/AnalyticsEvents";

// Czcionki hostowane lokalnie i przycięte do potrzebnych znaków (scripts/subset-fonts.mjs):
// 64 KB zamiast 236 KB z pełnych podzbiorów latin + latin-ext — mniej bajtów
// konkuruje na telefonie ze zdjęciem hero (LCP).

// Inter — interfejs i treść: ASCII, Latin-1, polskie litery, typografia; grubości 300–500.
const inter = localFont({
  src: "./fonts/inter-pl.woff2",
  weight: "300 500",
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: "Arial",
});

// Montserrat — font marki, wyłącznie wersalikami (logo, eyebrow); grubości 500–600.
const montserrat = localFont({
  src: "./fonts/montserrat-caps.woff2",
  weight: "500 600",
  variable: "--font-montserrat",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  title: {
    default: "Peritus Nieruchomości — mieszkania, domy i działki w Poznaniu i okolicach",
    template: "%s | Peritus Nieruchomości",
  },
  description:
    "Sprzedaż i zakup nieruchomości w Poznaniu i okolicach. Sprawdzone oferty, bezpłatna wycena i wsparcie aż do aktu notarialnego.",
  // Podgląd linku w komunikatorach i social media (obraz OG → Faza 4, gdy będzie domena)
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: "Peritus Nieruchomości",
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    // data-scroll-behavior: Next wyłącza płynny scroll na czas zmiany trasy
    // (płynny scroll zostaje dla kotwic #oferty / #wycena).
    <html lang="pl" className={`${inter.variable} ${montserrat.variable}`} data-scroll-behavior="smooth">
      <body>
        <SkipLink />
        <Header />
        {/* Cel „Przejdź do treści” — jeden dla wszystkich podstron */}
        <div id="main" tabIndex={-1}>
          {children}
        </div>
        {modal}
        <Footer />
        <AnalyticsEvents />
      </body>
    </html>
  );
}
