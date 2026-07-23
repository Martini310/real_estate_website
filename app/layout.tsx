import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Font marki (logo/wordmark). latin-ext → poprawne polskie znaki (Ś, Ó, Ł).
const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Peritus Nieruchomości — ekspercka obsługa rynku premium",
    template: "%s | Peritus Nieruchomości",
  },
  description:
    "Peritus Nieruchomości — luksusowe domy, apartamenty i inwestycje w najlepszych lokalizacjach. Eksperckie doradztwo na każdym etapie.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={montserrat.variable}>
      <body>
        <Header />
        {children}
        {modal}
        <Footer />
      </body>
    </html>
  );
}
