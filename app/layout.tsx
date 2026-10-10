import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SkipLink from "@/components/ui/SkipLink";
import AnalyticsEvents from "@/components/AnalyticsEvents";

// Font interfejsu i treści. latin-ext → polskie znaki.
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

// Font marki (logo/wordmark). latin-ext → poprawne polskie znaki (Ś, Ó, Ł).
const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600"],
  variable: "--font-montserrat",
  display: "swap",
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
