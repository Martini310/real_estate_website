"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initHeroParallax } from "@/lib/animations";
import FilterBar, { Filters } from "./FilterBar";

gsap.registerPlugin(ScrollTrigger);

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop";

interface HeroProps {
  activeFilters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export default function Hero({ activeFilters, onFiltersChange }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !imageRef.current) return;

    const cleanup = initHeroParallax(sectionRef.current, imageRef.current);
    return () => cleanup?.();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full flex flex-col overflow-hidden"
    >
      {/* Background image with parallax - extends full section */}
      <div
        ref={imageRef}
        className="absolute inset-0 w-full h-[120%] -top-[10%] pointer-events-none"
      >
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {/* Gradient: subtle at top, strong at bottom so search bar + grid sit on it */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 40%, rgba(14,14,14,0.95) 70%, #0E0E0E 100%)",
          }}
        />
      </div>

      {/* Headline - centered in upper area */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pt-24">
        <div className="text-center max-w-6xl mx-auto">
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-light tracking-tight mb-6 text-text-primary">
            Premium
          </h1>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-text-secondary">
            Real Estate
          </h2>
        </div>
      </div>

      {/* Filter bar at bottom of hero - on gradient */}
      <div className="relative z-10 w-full px-4 md:px-8 lg:px-16 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto">
          <FilterBar activeFilters={activeFilters} onFiltersChange={onFiltersChange} />
        </div>
      </div>
    </section>
  );
}
