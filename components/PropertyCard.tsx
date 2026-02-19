"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { initParallaxCard, initCardHover } from "@/lib/animations";

export interface Property {
  id: number;
  slug: string;
  title: string;
  location: string;
  price: number;
  area: number;
  type: string;
  style: string;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  image: string;
  featured: boolean;
}

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current || !imageRef.current) return;

    const cleanupParallax = initParallaxCard(cardRef.current, imageRef.current);
    const cleanupHover = initCardHover(cardRef.current, imageRef.current);

    return () => {
      cleanupParallax?.();
      cleanupHover?.();
    };
  }, []);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      apartment: "Apartment",
      house: "Residential House",
      commercial: "Commercial Space",
    };
    return labels[type] || type;
  };

  return (
    <div
      ref={cardRef}
      className="group relative h-[450px] md:h-[500px] lg:h-[calc(100vh/2)] min-h-[300px] w-full overflow-hidden bg-card-bg cursor-pointer"
    >
      {/* Image layer 120% height so parallax never reveals card background */}
      <div
        ref={imageRef}
        className="absolute left-0 w-full overflow-hidden"
        style={{
          top: "-10%",
          height: "120%",
          willChange: "transform",
          backfaceVisibility: "hidden" as const,
        }}
      >
        <Image
          src={property.image}
          alt={property.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
          priority={property.featured}
        />
      </div>

      {/* Gradient Overlay - stronger at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Hover overlay - darker on hover */}
      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/40 z-[1]" />

      {/* Content - centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-end p-6 md:p-8 pb-6 md:pb-2 z-10 text-center">
        {/* Title - always visible */}
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-light text-text-primary leading-tight mb-4">
          {property.title}
        </h3>


        {/* Type description - visible on hover */}
        <p className="text-text-secondary text-sm md:text-base mb-4 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          {getTypeLabel(property.type)}
        </p>

        {/* Details button - visible on hover */}
        <button className="px-6 py-2.5 mb-4 border border-white/20 text-text-primary text-xs uppercase tracking-widest opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:border-white/40 hover:bg-white/5">
          Details
        </button>

        {/* Property details - always visible, centered */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs text-text-secondary mb-2">
          {property.bedrooms > 0 && (
            <div>
              <span className="text-text-primary">Bedrooms: </span>
              {property.bedrooms}
            </div>
          )}
          <div>
            <span className="text-text-primary">Area: </span>
            {property.area} m²
          </div>
          <div>
            <span className="text-text-primary">Floors: </span>
            {Math.ceil(property.area / 150)}
          </div>
        </div>
      </div>
    </div>
  );
}
