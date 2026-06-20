"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import PropertyDetailContent from "./PropertyDetailContent";
import { Property } from "@/types/property";

/**
 * Wysuwany panel szczegółów (overlay) renderowany jako intercepting route.
 * Klik w ofertę z listy → panel natychmiast wjeżdża z prawej, a tło (lista) jest
 * rozmywane. To celowy, „premium" efekt — patrz pamięć `keep-instant-detail-panel`.
 * URL zmienia się na `/oferta/[slug]`, więc ofertę da się udostępnić i zindeksować.
 */
export default function PropertyModal({ property }: { property: Property }) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const isClosingRef = useRef(false);

  // Wejście: blokada scrolla + rozmycie listy pod spodem + wjazd panelu z prawej
  useEffect(() => {
    const panel = panelRef.current;
    document.body.style.overflow = "hidden";

    // Ubij ewentualne zaległe tweeny (podwójny montaż efektu w React Strict Mode
    // w dev potrafi nałożyć dwie animacje i zamrozić panel w połowie wjazdu).
    gsap.killTweensOf(panel);
    gsap.killTweensOf("#properties");

    const tl = gsap.timeline();
    if (panel) {
      tl.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: "power3.out" }, 0);
      tl.fromTo(panel, { x: "100%" }, { x: 0, duration: 1.2, ease: "power3.out" }, 0);
    }
    tl.fromTo(
      "#properties",
      { filter: "blur(0px)", scale: 1 },
      { filter: "blur(4px)", scale: 0.98, duration: 0.6, ease: "power3.inOut" },
      0
    );

    return () => {
      tl.kill();
      gsap.killTweensOf(panel);
      gsap.killTweensOf("#properties");
      document.body.style.overflow = "auto";
      // Natychmiastowy reset tła (np. gdy zamknięcie nastąpi „wstecz" przeglądarki)
      gsap.set("#properties", { filter: "blur(0px)", scale: 1 });
    };
  }, []);

  const close = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    const panel = panelRef.current;
    gsap.killTweensOf(panel);
    gsap.killTweensOf("#properties");
    const tl = gsap.timeline({ onComplete: () => router.back() });
    tl.to(panel, { opacity: 0, duration: 0.6, ease: "power3.in" }, 0);
    tl.to("#properties", { filter: "blur(0px)", scale: 1, duration: 0.5, ease: "power3.inOut" }, 0);
    tl.to(panel, { x: "100%", duration: 0.6, ease: "power3.in" }, 0);
  }, [router]);

  // Zamknięcie klawiszem Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === panelRef.current) close();
  };

  return (
    <div
      ref={panelRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/40 z-50"
      style={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Szczegóły oferty"
    >
      <div className="fixed inset-0 w-full h-screen bg-panel-bg overflow-y-auto">
        <PropertyDetailContent property={property} onBack={close} />
      </div>
    </div>
  );
}
