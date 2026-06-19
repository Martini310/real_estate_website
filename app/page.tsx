"use client";

import { useState, useRef } from "react";
import Hero from "@/components/Hero";
import PropertyGrid from "@/components/PropertyGrid";
import PropertyDetailPanel from "@/components/PropertyDetailPanel";
import BackToTop from "@/components/BackToTop";
import { getProperties } from "@/lib/properties";
import { Filters } from "@/components/FilterBar";
import { Property } from "@/types/property";

const properties = getProperties();

export default function Home() {
  const [activeFilters, setActiveFilters] = useState<Filters>({
    type: "all",
    style: "all",
    area: "all",
    bedrooms: null,
    floors: null,
  });

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const sourceImageRefWrapper = useRef<HTMLDivElement | null>(null);

  const handlePropertyClick = (property: Property, imageRef: HTMLDivElement) => {
    // Oferta z karty zawiera już komplet danych (lista + szczegóły) — panel
    // wysuwa się natychmiast, bez dodatkowego dociągania.
    sourceImageRefWrapper.current = imageRef;
    setSelectedProperty(property);
    // Blokada przewijania, gdy panel jest otwarty
    document.body.style.overflow = "hidden";
  };

  const handleClosePanel = () => {
    setSelectedProperty(null);
    sourceImageRefWrapper.current = null;
    // Przywrócenie przewijania
    document.body.style.overflow = "auto";
  };

  return (
    <main className="min-h-screen">
      <Hero activeFilters={activeFilters} onFiltersChange={setActiveFilters} />
      <PropertyGrid
        properties={properties}
        activeFilters={activeFilters}
        onPropertyClick={handlePropertyClick}
      />
      <BackToTop />

      {/* Panel szczegółów oferty */}
      <PropertyDetailPanel
        property={selectedProperty}
        onClose={handleClosePanel}
        sourceImageRef={sourceImageRefWrapper}
      />
    </main>
  );
}
