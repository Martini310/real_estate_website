"use client";

import { useEffect, useRef } from "react";
import { getImageProps } from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initHeroParallax } from "@/lib/animations";
import Container from "./ui/Container";
import { ButtonLink } from "./ui/Button";
import heroDesktop from "@/public/hero.jpg";
import heroMobile from "@/public/hero-mobile.jpg";

gsap.registerPlugin(ScrollTrigger);

// Art direction przez <picture>: przeglądarka pobiera TYLKO kadr pasujący do
// ekranu (poziomy ≥640 px, pionowy 9:16 poniżej). Bez `preload` — przy <picture>
// wymusiłby pobranie obu; zamiast tego fetchPriority="high" + eager (element LCP).
// Statyczny import → wymiary i rozmyty placeholder generowane przy buildzie,
// więc zamiast czarnego ekranu przed załadowaniem widać miękki zarys zdjęcia.
const heroImageBase = { alt: "", fill: true, sizes: "100vw", quality: 80, placeholder: "blur" } as const;
const {
  props: { srcSet: heroMobileSrcSet },
} = getImageProps({ ...heroImageBase, src: heroMobile });
const {
  props: { srcSet: heroDesktopSrcSet, ...heroImgProps },
} = getImageProps({
  ...heroImageBase,
  src: heroDesktop,
  fetchPriority: "high",
  loading: "eager",
});

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !imageRef.current) return;

    return initHeroParallax(sectionRef.current, imageRef.current, contentRef.current);
  }, []);

  return (
    <section
      ref={sectionRef}
      // 88svh: na telefonie liczone bez paska przeglądarki, a pod hero wystaje
      // początek kolejnej sekcji — naturalna zachęta do przewinięcia.
      className="relative flex min-h-[88svh] w-full flex-col overflow-hidden"
    >
      {/* Zdjęcie tła z parallaxem — h-[120%] = zapas ≥ maks. przesunięciu (20% wysokości
          sekcji), więc ruch nigdy nie odsłania dolnej krawędzi obrazu (patrz initHeroParallax) */}
      <div ref={imageRef} className="absolute inset-x-0 top-0 h-[120%] pointer-events-none">
        <picture>
          <source media="(max-width: 639px)" srcSet={heroMobileSrcSet} />
          <source media="(min-width: 640px)" srcSet={heroDesktopSrcSet} />
          <img {...heroImgProps} className="object-cover" />
        </picture>
      </div>

      {/* Przyciemnienie STATYCZNE (poza parallaxem), tylko tam, gdzie stoi tekst:
          od dołu (płynne przejście w tło strony) + od lewej na desktopie.
          Góra i prawa strona zdjęcia zostają jasne i naturalne. */}
      {/* Mobile: tekst zajmuje większą część kadru → przyciemnienie sięga wyżej */}
      <div
        className="absolute inset-0 md:hidden pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, #0F0B06 0%, rgba(15,11,6,0.92) 25%, rgba(15,11,6,0.72) 50%, rgba(15,11,6,0.4) 70%, rgba(15,11,6,0) 88%)",
        }}
      />
      <div
        className="absolute inset-0 hidden md:block pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, #0F0B06 0%, rgba(15,11,6,0.9) 18%, rgba(15,11,6,0.55) 42%, rgba(15,11,6,0) 70%)",
        }}
      />
      <div
        className="absolute inset-0 hidden md:block pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(15,11,6,0.6) 0%, rgba(15,11,6,0.25) 38%, rgba(15,11,6,0) 62%)",
        }}
      />

      <Container className="relative z-10 flex flex-1 items-end pt-28 pb-16 md:pb-24">
        <div ref={contentRef} className="max-w-2xl">
          <p className="font-brand text-eyebrow uppercase text-beige mb-5">Poznań i okolice</p>
          <h1 className="text-display font-normal text-text-primary text-balance mb-5">
            Spokojna sprzedaż i&nbsp;zakup nieruchomości
          </h1>
          <p className="text-lg leading-relaxed text-text-primary/85 max-w-xl mb-8">
            Mieszkania, domy i działki w&nbsp;Poznaniu i&nbsp;okolicach. Prowadzę Cię
            od pierwszej prezentacji do aktu notarialnego.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#oferty">Zobacz oferty</ButtonLink>
            <ButtonLink
              href="#wycena"
              variant="secondary"
              className="bg-background/30 backdrop-blur-sm"
            >
              Bezpłatna wycena
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
