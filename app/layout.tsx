import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Premium Real Estate — luksusowe nieruchomości",
    template: "%s | Premium Real Estate",
  },
  description:
    "Luksusowe nieruchomości i prestiżowe inwestycje dopasowane do Twojego stylu życia.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>
        <Header />
        {children}
        {modal}
        <Footer />
      </body>
    </html>
  );
}
