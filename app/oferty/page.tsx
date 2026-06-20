import type { Metadata } from "next";
import { getProperties } from "@/lib/properties";
import OfertyBrowser from "@/components/OfertyBrowser";

export const metadata: Metadata = {
  title: "Oferty",
  description:
    "Przeglądaj nasze luksusowe nieruchomości — domy, apartamenty i lokale komercyjne w najlepszych lokalizacjach w Polsce.",
};

export default function OfertyPage() {
  const properties = getProperties();

  return (
    <main className="min-h-screen bg-background pt-28 md:pt-32 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 mb-8 md:mb-10">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-text-primary">
          Oferty
        </h1>
        <p className="text-text-secondary mt-3 max-w-2xl">
          Przeglądaj dostępne nieruchomości i zawęź wyniki filtrami. Kliknij
          ofertę, aby zobaczyć szczegóły.
        </p>
      </div>
      <div className="px-4 md:px-8 lg:px-16">
        <OfertyBrowser properties={properties} />
      </div>
    </main>
  );
}
