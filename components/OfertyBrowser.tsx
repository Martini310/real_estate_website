"use client";

import { useState } from "react";
import FilterBar, { Filters } from "./FilterBar";
import PropertyGrid from "./PropertyGrid";
import { Property } from "@/types/property";

/**
 * Przeglądarka ofert (filtry + siatka) dla podstrony `/oferty`. Stan filtrów
 * trzymany lokalnie; te same `FilterBar` i `PropertyGrid` co na stronie głównej.
 */
export default function OfertyBrowser({ properties }: { properties: Property[] }) {
  const [activeFilters, setActiveFilters] = useState<Filters>({
    type: "all",
    price: "all",
    area: "all",
    bedrooms: null,
    floors: null,
  });

  return (
    <div className="max-w-7xl mx-auto">
      <FilterBar activeFilters={activeFilters} onFiltersChange={setActiveFilters} />
      <PropertyGrid properties={properties} activeFilters={activeFilters} />
    </div>
  );
}
