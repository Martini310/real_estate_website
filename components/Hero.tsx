"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initHeroParallax } from "@/lib/animations";
import FilterBar, { Filters } from "./FilterBar";

gsap.registerPlugin(ScrollTrigger);

// Hero: własny render marki Peritus (willa z trawertynu w złotej godzinie).
// Na razie ten sam kadr na desktop i mobile; MOBILE do podmiany, gdy powstanie
// wersja pionowa (9:16). Next/Image sam optymalizuje format i rozmiary.
const HERO_IMAGE_DESKTOP = "/hero.png";
const HERO_IMAGE_MOBILE = "/hero-mobile.png";

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
      {/* Zdjęcie tła z parallaxem — h-[110%] daje zapas u dołu, żeby ruch
          parallax nigdy nie odsłonił dolnej krawędzi obrazu (patrz initHeroParallax) */}
      <div
        ref={imageRef}
        className="absolute inset-x-0 top-0 h-[110%] pointer-events-none"
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
      </div>

      {/* Gradient STATYCZNY (poza parallaxem) — zawsze zakrywa dolną część sekcji,
          dając bezszwowe zanikanie zdjęcia w tło strony, bez widocznego „odcięcia" */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(15,11,6,0.15) 0%, rgba(15,11,6,0.35) 38%, rgba(15,11,6,0.8) 68%, rgba(15,11,6,0.97) 88%, #0F0B06 100%)",
        }}
      />

      {/* Headline */}
      <div className="relative z-10 flex-1 flex items-end md:items-center justify-start md:justify-center px-4 pt-28 pb-10 sm:px-6 md:px-8 lg:px-16 min-h-[60vh]">
        <div className="text-left md:text-center max-w-5xl mx-auto [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
          <p className="mb-4 sm:mb-5 text-xs sm:text-sm font-medium uppercase tracking-[0.35em] text-accent-soft">
            Peritus&nbsp;·&nbsp;Nieruchomości
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-4 sm:mb-5 text-text-primary text-balance">
            Nieruchomości, które{" "}
            <span className="text-gradient-brand font-normal">mają znaczenie</span>
          </h1>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light tracking-tight text-text-secondary text-balance">
            Eksperckie doradztwo na rynku nieruchomości
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
