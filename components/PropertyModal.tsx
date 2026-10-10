"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import PropertyDetailContent from "./PropertyDetailContent";
import { Property } from "@/types/property";
import { prefersReducedMotion } from "@/lib/animations";

/**
 * Wysuwany panel szczegółów (overlay) renderowany jako intercepting route.
 * Klik w ofertę z listy → panel natychmiast wjeżdża z prawej, a tło (lista) jest
 * rozmywane. To celowy, „premium" efekt — patrz pamięć `keep-instant-detail-panel`.
 * URL zmienia się na `/oferta/[slug]`, więc ofertę da się udostępnić i zindeksować.
 *
 * Desktop (≥1024 px): arkusz z prawej o płynnej szerokości clamp(880px, 78vw, 1320px)
 * — po lewej widać rozmytą listę (kontekst), galeria ma dość miejsca na dużych
 * ekranach. Mobile/tablet: pełny ekran.
 *
 * Dostępność: fokus przechodzi do panelu (nazwa dialogu = tytuł oferty), tło jest
 * `inert` (klawiatura i czytnik nie „wychodzą” za panel), po zamknięciu fokus
 * wraca na kartę, z której otwarto ofertę.
 */
export default function PropertyModal({ property }: { property: Property }) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);
  const titleId = useId();

  // Wejście: blokada scrolla + rozmycie listy pod spodem + wjazd panelu z prawej
  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    // Pozycja listy w chwili otwarcia — przywracana po zamknięciu. Bez tego powrót
    // do adresu z kotwicą (np. „/#oferty” po kliknięciu CTA w hero) przewijał
    // stronę do tej kotwicy zamiast zostawić użytkownika przy ofercie.
    const scrollY = window.scrollY;
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    // Tło niedostępne dla klawiatury i czytników: `inert` na wszystkich dzieciach
    // <body> poza tym, w którym siedzi panel.
    const panelRoot = [...document.body.children].find((child) => overlay && child.contains(overlay));
    // (bez <script> i ogłaszacza tras Next — to nie treść do nawigacji).
    const inertSiblings = [...document.body.children].filter(
      (child): child is HTMLElement =>
        child !== panelRoot &&
        child instanceof HTMLElement &&
        !child.inert &&
        !["SCRIPT", "NEXT-ROUTE-ANNOUNCER"].includes(child.tagName)
    );
    inertSiblings.forEach((child) => (child.inert = true));
    panel?.focus({ preventScroll: true });

    // Ubij ewentualne zaległe tweeny (podwójny montaż efektu w React Strict Mode
    // w dev potrafi nałożyć dwie animacje i zamrozić panel w połowie wjazdu).
    gsap.killTweensOf([overlay, panel]);
    gsap.killTweensOf("#properties");

    // Wjazd ~0,55 s: wyraźny, „premium”, ale nie każe czekać (wcześniej 1,2 s).
    // Przy „ogranicz ruch” — bez przesuwania i skalowania, tylko krótkie przenikanie.
    const reduce = prefersReducedMotion();
    const tl = gsap.timeline();
    if (overlay) tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: reduce ? 0.15 : 0.3, ease: "power2.out" }, 0);
    if (panel) {
      if (reduce) tl.set(panel, { x: 0 }, 0);
      else tl.fromTo(panel, { x: "100%" }, { x: 0, duration: 0.55, ease: "power3.out" }, 0);
    }
    tl.fromTo(
      "#properties",
      { filter: "blur(0px)", scale: 1 },
      { filter: "blur(4px)", scale: reduce ? 1 : 0.98, duration: reduce ? 0.15 : 0.5, ease: "power3.inOut" },
      0
    );

    return () => {
      tl.kill();
      gsap.killTweensOf([overlay, panel]);
      gsap.killTweensOf("#properties");
      document.body.style.overflow = "auto";
      inertSiblings.forEach((child) => (child.inert = false));
      if (opener?.isConnected) opener.focus({ preventScroll: true });
      // Natychmiastowy reset tła (np. gdy zamknięcie nastąpi „wstecz" przeglądarki)
      gsap.set("#properties", { filter: "blur(0px)", scale: 1 });
      // Po klatce — już po ewentualnym przewinięciu routera do kotwicy z adresu.
      requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: "instant" }));
    };
  }, []);

  const close = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    gsap.killTweensOf([overlay, panel]);
    gsap.killTweensOf("#properties");
    // Wyjście szybsze niż wejście (~0,35 s) — zamykanie ma być natychmiastowe w odczuciu.
    const reduce = prefersReducedMotion();
    const tl = gsap.timeline({ onComplete: () => router.back() });
    if (!reduce) tl.to(panel, { x: "100%", duration: 0.35, ease: "power3.in" }, 0);
    tl.to(overlay, { opacity: 0, duration: reduce ? 0.15 : 0.35, ease: "power2.in" }, 0);
    tl.to("#properties", { filter: "blur(0px)", scale: 1, duration: reduce ? 0.15 : 0.35, ease: "power3.inOut" }, 0);
  }, [router]);

  // Zamknięcie klawiszem Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  // Klik w przyciemnione tło (po lewej od arkusza) zamyka panel
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) close();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-background/40"
      style={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={panelRef}
        // tabIndex -1: panel przyjmuje fokus przy otwarciu (strzałki/spacja przewijają treść)
        tabIndex={-1}
        className="absolute inset-y-0 right-0 focus:outline-none w-full lg:w-[clamp(880px,78vw,1320px)] overflow-y-auto overscroll-contain bg-panel-bg lg:border-l lg:border-line lg:shadow-e2"
        style={{ transform: "translateX(100%)" }}
      >
        <PropertyDetailContent property={property} onBack={close} titleId={titleId} />
      </div>
    </div>
  );
}
