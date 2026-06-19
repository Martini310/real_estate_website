"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "Oferty", href: "#properties" },
  { label: "O mnie", href: "#about" },
  { label: "Usługi", href: "#services" },
  { label: "Kontakt", href: "#contact" },
];

export default function Header() {
  const [visible, setVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastScrollYRef = useRef(0);
  const visibleRef = useRef(true);
  const rafRef = useRef<number | null>(null);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    e.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

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
        className="mx-4 mt-4 max-w-7xl md:mx-auto md:mt-6 rounded-2xl border border-white/10 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-2"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo on the left */}
          <a
            href="#"
            className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl font-light tracking-tight text-text-primary"
          >
            <Image
              src="/logo.png"
              alt="Logo"
              className="h-9 w-28 sm:h-10 sm:w-32 object-contain"
              width={100}
              height={40}
              priority
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  handleSmoothScroll(e);
                }}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                {item.label}
              </a>
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
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    handleSmoothScroll(e);
                    setIsMenuOpen(false);
                  }}
                  className="rounded-xl px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors duration-200"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
