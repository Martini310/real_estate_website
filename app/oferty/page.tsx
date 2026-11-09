import type { Metadata } from "next";
import { getPropertyCards } from "@/lib/properties";
import OfertyBrowser from "@/components/OfertyBrowser";
import Container from "@/components/ui/Container";
import { formatOffers } from "@/lib/format";

export const metadata: Metadata = {
  title: "Oferty",
  description:
    "Aktualne oferty mieszkań, domów i działek w Poznaniu i okolicach — z ceną, metrażem i ceną za m². Filtruj i umów prezentację.",
};

export default async function OfertyPage() {
  const properties = await getPropertyCards();

  return (
    <main className="min-h-screen bg-background pt-28 md:pt-32 pb-24">
      <Container className="mb-8 md:mb-10">
        <h1 className="text-h1 font-light text-text-primary">Oferty</h1>
        <p className="text-body text-text-secondary mt-3 max-w-2xl">
          {formatOffers(properties.length)} w Poznaniu i okolicach.
        </p>
      </Container>
      {/* Kolejność nagłówków h1 → h2 → h3 (karty) dla czytników ekranu */}
      <h2 className="sr-only">Lista ofert</h2>
      <OfertyBrowser properties={properties} priorityCount={2} />
    </main>
  );
}
