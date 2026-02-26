"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initHeroParallax } from "@/lib/animations";
import FilterBar, { Filters } from "./FilterBar";

gsap.registerPlugin(ScrollTrigger);

const HERO_IMAGE_DESKTOP =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2800&q=90";

const HERO_IMAGE_MOBILE =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&h=1800&q=90";

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
        className="absolute inset-0 w-full h-full top-0 pointer-events-none"
      >
        {/* Mobile-optimized hero image */}
        <Image
          src={HERO_IMAGE_MOBILE}
          alt=""
          fill
          className="object-cover sm:hidden"
          sizes="100vw"
          priority
          quality={90}
        />
        {/* Desktop / tablet hero image */}
        <Image
          src={HERO_IMAGE_DESKTOP}
          alt=""
          fill
          className="object-cover hidden sm:block"
          sizes="100vw"
          priority
          quality={90}
        />
        {/* Gradient: subtle at top, strong at bottom so search bar + grid sit on it */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.35) 40%, rgba(14,14,14,0.9) 75%, #0E0E0E 100%)",
          }}
        />
      </div>

      {/* Headline */}
      <div className="relative z-10 flex-1 flex items-end md:items-center justify-start md:justify-center px-4 pt-28 pb-10 sm:px-6 md:px-8 lg:px-16 min-h-[60vh]">
        <div className="text-left md:text-center max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-3 sm:mb-4 text-text-primary">
            Premium
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-text-secondary">
            Real Estate
          </h2>
        </div>
      </div>

      {/* Filter bar at bottom of hero - on gradient */}
      <div className="relative z-10 w-full px-4 md:px-8 lg:px-16 pb-6 md:pb-10">
        <div className="max-w-7xl mx-auto">
          <FilterBar activeFilters={activeFilters} onFiltersChange={onFiltersChange} />
        </div>
      </div>
    </section>
  );
}
