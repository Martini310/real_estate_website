"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

// Przyciski na zdjęciach: ciemne półprzezroczyste koło — czytelne także na
// jasnych zdjęciach wnętrz (biała ikona bez tła ginęła na białej ścianie).
// Bez backdrop-filter: przy kilku przyciskach nad dużym zdjęciem to koszt GPU
// bez widocznej różnicy (P5) — wystarcza gęstsze tło.
export const GALLERY_CONTROL =
  "flex items-center justify-center rounded-full border border-line-strong bg-background/65 text-text-primary transition-colors hover:bg-background/85";

// Powyżej tylu zdjęć kropki przestają być czytelne (16 kropek to szum) — wtedy sam licznik.
const MAX_DOTS = 8;

interface PropertyGalleryProps {
  images: string[];
  title: string;
  /** Szerokość galerii względem ekranu — do `sizes` (panel jest węższy niż ekran). */
  sizes: string;
}

/**
 * Galeria jako poziomy pas ze scroll-snap: natywny swipe na telefonie, płynne
 * przesuwanie strzałkami i klawiszami ← →. Zdjęcia poza pierwszym ładują się
 * leniwie, dopiero gdy zbliżą się do kadru.
 */
export default function PropertyGallery({ images, title, sizes }: PropertyGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  // Zdjęcie DOCELOWE (nie aktualnie widoczne) — szybkie kolejne kliknięcia/klawisze
  // w trakcie płynnego przewijania przesuwają dalej, zamiast „gubić” wciśnięcia.
  const targetRef = useRef(0);
  const settleTimerRef = useRef<number | undefined>(undefined);
  const last = images.length - 1;

  const goTo = useCallback((target: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(target, images.length - 1));
    targetRef.current = clamped;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: clamped * track.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
  }, [images.length]);

  // Aktualny indeks liczony z pozycji przewinięcia — działa tak samo dla swipe, strzałek i klawiatury.
  // Gdy przewijanie ucichnie (np. po swipe), cel = zdjęcie, na którym się zatrzymało.
  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const current = Math.round(track.scrollLeft / track.clientWidth);
    setIndex(current);
    window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(() => {
      targetRef.current = current;
    }, 150);
  };

  // ← → przełączają zdjęcia, chyba że użytkownik pisze w formularzu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowLeft") goTo(targetRef.current - 1);
      if (e.key === "ArrowRight") goTo(targetRef.current + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(settleTimerRef.current);
    };
  }, [goTo]);

  return (
    <div className="relative h-full w-full" role="region" aria-roledescription="galeria" aria-label={`Zdjęcia: ${title}`}>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {images.map((src, idx) => (
          <div
            key={src}
            className="relative h-full w-full flex-none snap-center"
            aria-hidden={idx !== index}
          >
            <Image
              src={src}
              alt={`${title} – zdjęcie ${idx + 1} z ${images.length}`}
              fill
              className="object-cover"
              sizes={sizes}
              priority={idx === 0}
            />
          </div>
        ))}
      </div>

      {/* Przejście zdjęcia w tło treści pod galerią */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-panel-bg via-panel-bg/20 to-transparent" />

      {index > 0 && (
        <button
          type="button"
          onClick={() => goTo(targetRef.current - 1)}
          className={`absolute left-5 top-1/2 z-20 h-12 w-12 -translate-y-1/2 ${GALLERY_CONTROL}`}
          aria-label="Poprzednie zdjęcie"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {index < last && (
        <button
          type="button"
          onClick={() => goTo(targetRef.current + 1)}
          className={`absolute right-5 top-1/2 z-20 h-12 w-12 -translate-y-1/2 ${GALLERY_CONTROL}`}
          aria-label="Następne zdjęcie"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div
        className="absolute bottom-6 right-5 z-20 rounded-full border border-line bg-background/60 px-3 py-1 text-small text-text-primary"
        aria-live="polite"
      >
        {index + 1} / {images.length}
      </div>

      {images.length <= MAX_DOTS && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-1">
          {images.map((src, idx) => (
            // Cel dotykowy 24×24 px wokół małej kropki
            <button
              key={src}
              type="button"
              onClick={() => goTo(idx)}
              className="flex h-6 w-6 items-center justify-center"
              aria-label={`Przejdź do zdjęcia ${idx + 1}`}
              aria-current={idx === index}
            >
              <span
                className={`block h-2 rounded-full transition-all ${
                  idx === index ? "w-6 bg-text-primary" : "w-2 bg-beige/40 hover:bg-beige/70"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
