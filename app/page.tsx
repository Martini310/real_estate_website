"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PropertyGrid from "@/components/PropertyGrid";
import BackToTop from "@/components/BackToTop";
import Footer from "@/components/Footer";
import propertiesData from "@/data/properties.json";
import { Filters } from "@/components/FilterBar";

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
      <Header />
      <Hero
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
      />
      <PropertyGrid
        properties={propertiesData}
        activeFilters={activeFilters}
      />
      <BackToTop />
      <Footer />
    </main>
  );
}
