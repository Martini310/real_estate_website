"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { initParallaxCard } from "@/lib/animations";
import { PropertyCardData } from "@/types/property";
import { formatArea, formatPrice, formatPricePerM2, formatPropertyType, formatRooms } from "@/lib/format";

interface PropertyCardProps {
  property: PropertyCardData;
  /** Karta nad linią zgięcia → zdjęcie bez lazy-load, z preloadem (to element LCP). */
  priority?: boolean;
}

/**
 * Karta oferty (audyt §12.1): zdjęcie 3:2 z parallaxem, treść POD zdjęciem —
 * czytelna niezależnie od jasności zdjęcia, skanowana wzorcem F (lokalizacja →
 * tytuł → parametry → cena), porównywalna z innymi kartami jak na portalach.
 */
export default function PropertyCard({ property, priority = false }: PropertyCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current || !imageRef.current) return;
    return initParallaxCard(cardRef.current, imageRef.current);
  }, []);

  const details = [
    property.bedrooms > 0 ? formatRooms(property.bedrooms) : null,
    formatArea(property.area),
    formatPricePerM2(property.price, property.area),
  ].filter(Boolean);

  return (
    <Link
      ref={cardRef}
      href={`/oferta/${property.slug}`}
      // scroll={false}: panel to intercepting route (slot @modal jest w DOM po
      // treści strony). Bez tego Next przewinąłby okno na sam dół do nowego
      // segmentu, a strona główna „uciekłaby" za panelem. Pozycja ma zostać.
      scroll={false}
      className="group block rounded-card"
    >
      {/* `isolate`: Safari inaczej nie przycina zaokrągleń, gdy obraz w środku ma transform (parallax) */}
      <div className="relative isolate aspect-[3/2] overflow-hidden rounded-card bg-card-bg">
        {/* Warstwa parallax: 120% wysokości ramki (zapas na ruch — patrz initParallaxCard) */}
        <div
          ref={imageRef}
          className="absolute left-0 w-full"
          style={{ top: "-10%", height: "120%", willChange: "transform" }}
        >
          {/* Osobna warstwa na hover — zoom nie koliduje z transformacją parallaxu */}
          <div className="relative h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]">
            <Image
              src={property.image}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
              preload={priority}
              fetchPriority={priority ? "high" : undefined}
            />
          </div>
        </div>

        <span className="absolute left-4 top-4 rounded-control bg-background/75 px-2.5 py-1 text-xs text-text-primary">
          {formatPropertyType(property.type)}
        </span>
      </div>

      <div className="pt-5">
        <p className="text-small text-text-secondary">{property.location}</p>
        <h3 className="mt-1 line-clamp-2 text-h3 text-text-primary transition-colors duration-200 group-hover:text-beige">
          {property.title}
        </h3>
        <p className="mt-2 text-small text-text-secondary">{details.join(" · ")}</p>

        <div className="mt-4 flex items-baseline justify-between gap-4">
          <p className="text-xl text-accent-soft">{formatPrice(property.price)}</p>
          {/* Stała wskazówka „to jest klikalne” — widoczna też na dotyku (bez hovera) */}
          <span className="inline-flex items-center gap-1.5 text-small text-text-secondary transition-colors group-hover:text-text-primary">
            Zobacz ofertę
            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
