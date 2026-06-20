"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import PropertyGrid from "@/components/PropertyGrid";
import BackToTop from "@/components/BackToTop";
import { getProperties } from "@/lib/properties";
import { Filters } from "@/components/FilterBar";

const properties = getProperties();

export default function Home() {
  const [activeFilters, setActiveFilters] = useState<Filters>({
    type: "all",
    style: "all",
    area: "all",
    bedrooms: null,
    floors: null,
  });

  return (
    <main className="min-h-screen">
      <Hero activeFilters={activeFilters} onFiltersChange={setActiveFilters} />
      <PropertyGrid properties={properties} activeFilters={activeFilters} />
      <BackToTop />
    </main>
  );
}
