"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PropertyCard from "./PropertyCard";
import { PropertyCardData } from "@/types/property";
import { initReveal, prefersReducedMotion } from "@/lib/animations";
import Container from "./ui/Container";

interface PropertyGridProps {
  /** Lista już przefiltrowana i posortowana (lib/filters.ts). */
  properties: PropertyCardData[];
  /** Ile pierwszych kart ładować priorytetowo (LCP), patrz OfertyBrowser. */
  priorityCount?: number;
}

export default function PropertyGrid({ properties, priorityCount = 0 }: PropertyGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const previousRef = useRef(properties);

  useEffect(() => {
    if (gridRef.current) return initReveal(gridRef.current);
  }, []);

  // Po zmianie filtrów (nie przy pierwszym renderze): przeliczenie pozycji
  // ScrollTriggerów — inaczej parallax kart liczy się od starych pozycji i obraz
  // „skacze” — oraz miękkie wejście kart.
  useEffect(() => {
    if (previousRef.current === properties || !gridRef.current) return;
    previousRef.current = properties;

    ScrollTrigger.refresh();
    const cards = Array.from(gridRef.current.children);
    if (cards.length === 0 || prefersReducedMotion()) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.05 }
    );
  }, [properties]);

  return (
    // id="properties" — cel rozmycia tła przy otwartym panelu oferty (PropertyModal)
    <section id="properties">
      <Container>
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-12 lg:gap-x-8 lg:gap-y-14">
          {properties.map((property, idx) => (
            <PropertyCard key={property.id} property={property} priority={idx < priorityCount} />
          ))}
        </div>
      </Container>
    </section>
  );
}
