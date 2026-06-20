"use client";

import { useMemo, useEffect, useRef } from "react";
import PropertyCard from "./PropertyCard";
import { Filters } from "./FilterBar";
import { Property } from "@/types/property";
import { initFadeIn } from "@/lib/animations";
import { gsap } from "gsap";

interface PropertyGridProps {
  properties: Property[];
  activeFilters: Filters;
}

export default function PropertyGrid({
  properties,
  activeFilters,
}: PropertyGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (gridRef.current && isInitialMount.current) {
      initFadeIn(gridRef.current);
      isInitialMount.current = false;
    }
  }, []);

  const getAreaRange = (area: number): string => {
    if (area >= 500) return "500+";
    if (area >= 300) return "300-500";
    if (area >= 200) return "200-300";
    if (area >= 100) return "100-200";
    return "all";
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // Filter by type
      if (activeFilters.type !== "all" && property.type !== activeFilters.type) {
        return false;
      }

      // Filter by style
      if (activeFilters.style !== "all" && property.style !== activeFilters.style) {
        return false;
      }

      // Filter by area
      if (activeFilters.area !== "all") {
        const propertyAreaRange = getAreaRange(property.area);
        if (propertyAreaRange !== activeFilters.area) {
          return false;
        }
      }

      // Filter by bedrooms
      if (activeFilters.bedrooms !== null && property.bedrooms !== activeFilters.bedrooms) {
        return false;
      }

      // Filter by floors
      if (activeFilters.floors !== null && property.floors !== activeFilters.floors) {
        return false;
      }

      return true;
    });
  }, [properties, activeFilters]);

  useEffect(() => {
    if (isInitialMount.current) return;

    if (!gridRef.current) return;

    const cards = Array.from(gridRef.current.children);

    if (cards.length === 0) return;

    gsap.set(cards, { opacity: 0, y: 20 });

    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.05,
    });
  }, [filteredProperties]);

  return (
    <section id="properties" className="pt-0 px-4 md:px-8 lg:px-16 pb-24 bg-background">
      <div className="max-w-7xl mx-auto">

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
