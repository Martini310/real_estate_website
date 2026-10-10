"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "./ui/Container";
import { ButtonLink } from "./ui/Button";
import { siteConfig } from "@/lib/site";
import PhoneIcon from "./ui/PhoneIcon";

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
      className={`fixed top-0 left-0 right-0 z-50 transition duration-300 ease-out ${
        visible ? "translate-y-0" : "-translate-y-[120px]"
      }`}
    >
      {/* Container = te same krawędzie co treść strony; ramka headera leży
          dokładnie na linii nagłówków, siatki ofert i stopki */}
      <Container className="pt-4 md:pt-6">
        <div className="rounded-card border border-line bg-background/60 px-4 py-3 shadow-e2 backdrop-blur-xl backdrop-saturate-150 sm:px-6 md:py-2">
          <div className="flex items-center justify-between">
            {/* Logo on the left — ikona na beżowym kaflu (zgodnie z materiałami
                marki), obok wordmark złożony typografią serwisu */}
            <Link
              href="/"
              className="group flex items-center gap-2.5 sm:gap-3"
              aria-label="Peritus Nieruchomości — strona główna"
            >
              <span className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-control bg-gradient-to-br from-beige to-[#F0E5D4] shadow-e1 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo-pn.png"
                  // Dekoracyjne — nazwę linku daje aria-label i wordmark obok
                  alt=""
                  width={44}
                  height={44}
                  className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
                  priority
                />
              </span>
              <span className="flex flex-col font-brand leading-none">
                <span
                  className="text-lg sm:text-xl font-semibold tracking-[0.16em] text-text-primary"
                  style={{ lineHeight: "1.35em" }}
                >
                  PERITUS
                </span>
                {/* Spacja między liniami wordmarku (niewidoczna w układzie kolumnowym) —
                    inaczej nazwa linku czytana jest jako „PERITUSNIERUCHOMOŚCI” */}{" "}
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
                  className="text-small text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
              {/* Telefon jako CTA — w usługach lokalnych to główny kanał kontaktu */}
              <ButtonLink href={siteConfig.phone.href} variant="secondary" size="sm" className="ml-2">
                <PhoneIcon />
                <span className="hidden lg:inline">{siteConfig.phone.display}</span>
                <span className="lg:hidden">Zadzwoń</span>
              </ButtonLink>
            </nav>

            {/* Mobile: telefon + hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <a
                href={siteConfig.phone.href}
                className="inline-flex h-11 w-11 items-center justify-center rounded-control border border-line bg-beige/5 text-text-primary transition-colors duration-200 hover:border-line-strong"
                aria-label={`Zadzwoń: ${siteConfig.phone.display}`}
              >
                <PhoneIcon />
              </a>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-control border border-line bg-beige/5 text-text-primary transition-colors duration-200 hover:border-line-strong"
                aria-label={isMenuOpen ? "Zamknij menu" : "Otwórz menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
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
          </div>

          {/* Mobile dropdown menu with smooth expand/collapse */}
          <div
            id="mobile-menu"
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
                    className="rounded-control px-3 py-3 text-small text-text-secondary hover:text-text-primary hover:bg-beige/5 transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </Container>
    </header>
  );
}
