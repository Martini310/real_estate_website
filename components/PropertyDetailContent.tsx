"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { SplitText } from "gsap/all";
import AgentCard from "./AgentCard";
import ContactForm from "./ContactForm";
import { Property } from "@/types/property";

interface PropertyDetailContentProps {
  property: Property;
  /** Gdy podane → renderuje przycisk powrotu w lewym górnym rogu (tryb panelu). */
  onBack?: () => void;
  /** Gdy podane → renderuje link powrotu nad tytułem (tryb pełnej podstrony). */
  backHref?: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Współdzielona treść szczegółów oferty — używana zarówno przez wysuwany panel
 * (`PropertyModal`, intercepting route), jak i przez pełną podstronę
 * `/oferta/[slug]`. Dzięki temu obie ścieżki wyglądają identycznie.
 */
export default function PropertyDetailContent({
  property,
  onBack,
  backHref,
}: PropertyDetailContentProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const locationPriceRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageAnimatingRef = useRef(false);

  // Reveal tytułu i ceny przy wejściu (niezależny od animacji wysuwania panelu)
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        try {
          const split = new SplitText(titleRef.current, { type: "words" });
          gsap.from(split.words, {
            opacity: 0,
            duration: 1.2,
            ease: "sine.out",
            stagger: 0.12,
          });
        } catch {
          // SplitText to plugin premium — gdyby był niedostępny, prosty fade
          gsap.from(titleRef.current, { opacity: 0, duration: 0.8 });
        }
      }
      if (locationPriceRef.current) {
        gsap.fromTo(
          locationPriceRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power3.out" }
        );
      }
    });
    return () => ctx.revert();
  }, [property.slug]);

  const crossfadeTo = (next: (prev: number) => number) => {
    if (imageAnimatingRef.current || !imageContainerRef.current) return;
    imageAnimatingRef.current = true;
    gsap.to(imageContainerRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.inOut",
      onComplete: () => {
        setCurrentImageIndex(next);
        gsap.to(imageContainerRef.current, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: () => {
            imageAnimatingRef.current = false;
          },
        });
      },
    });
  };

  const handlePrev = () =>
    crossfadeTo((p) => (p === 0 ? property.gallery.length - 1 : p - 1));
  const handleNext = () =>
    crossfadeTo((p) => (p === property.gallery.length - 1 ? 0 : p + 1));
  const goTo = (idx: number) => {
    if (idx !== currentImageIndex) crossfadeTo(() => idx);
  };

  return (
    <>
      {/* Hero Image Gallery */}
      <div
        className="relative w-full h-[80vh] bg-gradient-to-b from-white/5 to-transparent overflow-hidden"
        style={{ willChange: "transform" }}
      >
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-6 left-6 z-30 text-text-primary hover:text-accent transition-colors p-2"
            aria-label="Zamknij panel szczegółów"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div ref={imageContainerRef} className="relative w-full h-full" style={{ opacity: 1 }}>
          <Image
            src={property.gallery[currentImageIndex]}
            alt={`${property.title} – zdjęcie ${currentImageIndex + 1}`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-panel-bg via-panel-bg/20 to-transparent" />

        {/* Previous Image Button */}
        <button
          onClick={handlePrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/20 text-text-primary hover:border-white/50 hover:bg-white/5 transition-all flex items-center justify-center"
          aria-label="Poprzednie zdjęcie"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next Image Button */}
        <button
          onClick={handleNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/20 text-text-primary hover:border-white/50 hover:bg-white/5 transition-all flex items-center justify-center"
          aria-label="Następne zdjęcie"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-6 right-6 z-20 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-text-primary text-sm font-light">
          {currentImageIndex + 1} / {property.gallery.length}
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {property.gallery.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentImageIndex ? "w-6 bg-accent" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Przejdź do zdjęcia ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-8 py-8 max-w-4xl mx-auto">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Wróć do ofert
          </Link>
        )}

        {/* Title Section */}
        <h1 ref={titleRef} className="text-4xl md:text-5xl font-light text-text-primary mb-2 leading-tight">
          {property.title}
        </h1>
        <div ref={locationPriceRef} className="flex items-center justify-between mb-8 pb-6 border-b border-white/8">
          <div className="text-text-secondary text-sm">{property.location}</div>
          <div className="text-accent font-light text-lg">{formatPrice(property.price)}</div>
        </div>

        {/* Key Info Row */}
        <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-white/8">
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">Powierzchnia</p>
            <p className="text-text-primary text-2xl font-light">
              {property.area} <span className="text-sm">m²</span>
            </p>
          </div>
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">Sypialnie</p>
            <p className="text-text-primary text-2xl font-light">{property.bedrooms}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">Łazienki</p>
            <p className="text-text-primary text-2xl font-light">{property.bathrooms}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 pb-8 border-b border-white/8">
          <h2 className="text-text-primary text-lg font-light mb-4">O nieruchomości</h2>
          <div className="space-y-4">
            {property.description.split("\n").map((paragraph, idx) => (
              <p key={idx} className="text-text-secondary text-sm leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-8 pb-8 border-b border-white/8">
          <h2 className="text-text-primary text-lg font-light mb-4">Najważniejsze cechy</h2>
          <div className="grid grid-cols-2 gap-3">
            {property.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-accent mt-2 flex-shrink-0" />
                <p className="text-text-secondary text-sm">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Agent */}
        <div className="mb-8 pb-8 border-b border-white/8">
          <h2 className="text-text-primary text-lg font-light mb-4">Twój opiekun</h2>
          <AgentCard agent={property.agent} />
        </div>

        {/* Contact Form */}
        <div className="mb-8">
          <h2 className="text-text-primary text-lg font-light mb-4">Umów oglądanie</h2>
          <ContactForm propertyTitle={property.title} />
        </div>

        <div className="h-12" />
      </div>
    </>
  );
}
