"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Oferty", href: "/oferty" },
  { label: "O mnie", href: "/o-mnie" },
  { label: "Kontakt", href: "/kontakt" },
];

export default function Header() {
  const [visible, setVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastScrollYRef = useRef(0);
  const visibleRef = useRef(true);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;

      let nextVisible = visibleRef.current;
      if (currentScrollY < 80) {
        nextVisible = true;
      } else if (currentScrollY > lastScrollY) {
        // scrolling down
        nextVisible = false;
      } else if (currentScrollY < lastScrollY) {
        // scrolling up
        nextVisible = true;
      }

      if (nextVisible !== visibleRef.current) {
        visibleRef.current = nextVisible;
        setVisible(nextVisible);
      }

      lastScrollYRef.current = currentScrollY;
      rafRef.current = null;
    };

    const onScroll = () => {
      // coalesce scroll events into a single rAF update
      if (rafRef.current == null) {
        rafRef.current = window.requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // initialize
    lastScrollYRef.current = window.scrollY;
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition duration-1000 ease-in-out ${
        visible ? "translate-y-0" : "-translate-y-[100px]"
      }`}
    >
      <div
        className="mx-4 mt-4 max-w-7xl md:mx-auto md:mt-6 rounded-2xl border border-beige/10 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-2"
        style={{
          background: "rgba(20, 16, 11, 0.55)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo on the left — ikona na beżowym kaflu (zgodnie z materiałami
              marki), obok wordmark złożony typografią serwisu */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 sm:gap-3"
            aria-label="Peritus Nieruchomości — strona główna"
          >
            <span className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-beige to-[#F0E5D4] ring-1 ring-black/10 shadow-[0_6px_18px_-6px_rgba(233,130,30,0.5)] transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo-pn.png"
                alt="Peritus Nieruchomości"
                width={44}
                height={44}
                className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
                priority
              />
            </span>
            <span
              className="flex flex-col leading-none"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              <span
                className="text-lg sm:text-xl font-semibold tracking-[0.16em] text-text-primary"
                style={{ lineHeight: "1.35em" }}
              >
                PERITUS
              </span>
              <span className="text-[9px] sm:text-[10px] font-medium tracking-[1.5px] text-accent-soft">
                NIERUCHOMOŚCI
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black/20 text-text-primary transition-colors duration-200"
            aria-label="Przełącz nawigację"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className="relative flex h-4 w-5 flex-col justify-between">
              <span
                className={`h-0.5 w-full rounded-full bg-current transition-transform duration-300 ${
                  isMenuOpen ? "translate-y-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`h-0.5 w-full rounded-full bg-current transition-opacity duration-300 ${
                  isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`h-0.5 w-full rounded-full bg-current transition-transform duration-300 ${
                  isMenuOpen ? "-translate-y-1.5 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>

        {/* Mobile dropdown menu with smooth expand/collapse */}
        <div
          className={`
            md:hidden overflow-hidden transition-all duration-500
            ${isMenuOpen ? "max-h-64 opacity-100 translate-y-0 mt-2" : "max-h-0 opacity-0 -translate-y-1"}
          `}
        >
          <nav className="pt-1">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
