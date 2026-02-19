"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "Properties", href: "#properties" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [visible, setVisible] = useState(true);
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
        className="mx-4 mt-4 md:mx-16 md:mt-6 rounded-2xl border border-white/10 px-6 py-4 md:px-8 md:py-2"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#" className="text-xl md:text-2xl font-light tracking-tight text-text-primary">
          <span className="flex items-center gap-2">
            <Image
              src="/logo.png"
                alt="Logo"
                className="h-10 w-32 object-contain"
                width={100}
                height={40}
                priority
            />
          </span>

          </a>
          <nav className="flex items-center gap-6 md:gap-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={handleSmoothScroll}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
