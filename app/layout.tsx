import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Premium Real Estate",
  description: "Luxury properties and premium real estate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
