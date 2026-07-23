"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { initFadeIn } from "@/lib/animations";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (footerRef.current) {
      initFadeIn(footerRef.current);
    }
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={footerRef}
      id="contact"
      className="relative bg-background pt-24 pb-8"
    >
      {/* Top border gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(233, 130, 30, 0.4), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-beige to-[#F0E5D4] ring-1 ring-black/10 shadow-[0_6px_18px_-6px_rgba(233,130,30,0.5)]">
                <Image
                  src="/logo-pn.png"
                  alt="Peritus Nieruchomości"
                  width={44}
                  height={44}
                  className="h-8 w-8 object-contain"
                />
              </span>
              <span
                className="flex flex-col leading-none"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                <span
                  className="text-lg font-semibold tracking-[0.16em] text-text-primary"
                  style={{ lineHeight: "1.35em" }}
                >
                  PERITUS
                </span>
                <span className="text-[10px] font-medium tracking-[1.5px] text-accent-soft">
                  NIERUCHOMOŚCI
                </span>
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Luksusowe domy, apartamenty i prestiżowe inwestycje w najlepszych
              lokalizacjach. Eksperckie doradztwo na każdym etapie.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-text-primary mb-6 font-medium">
              Nawigacja
            </h4>
            <div className="space-y-3">
              {[
                { label: "Oferty", href: "/oferty" },
                { label: "O mnie", href: "/o-mnie" },
                { label: "Kontakt", href: "/kontakt" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 block"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-text-primary mb-6 font-medium">
              Usługi
            </h4>
            <div className="space-y-3">
              {[
                "Wyszukiwanie nieruchomości",
                "Doradztwo",
                "Planowanie inwestycji",
                "Zarządzanie nieruchomościami",
              ].map((service) => (
                <p
                  key={service}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 cursor-default"
                >
                  {service}
                </p>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-text-primary mb-6 font-medium">
              Kontakt
            </h4>
            {/* TODO: podmień dane kontaktowe na prawdziwe dane agenta */}
            <div className="space-y-3">
              <div className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200">
                <p className="font-medium text-text-primary mb-1">E-mail</p>
                <a href="mailto:damian@peritus-nieruchomosci.pl">
                  damian@peritus-nieruchomosci.pl
                </a>
              </div>
              <div className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200">
                <p className="font-medium text-text-primary mb-1">Telefon</p>
                <a href="tel:+48600000000">+48 600 000 000</a>
              </div>
              <div className="text-sm text-text-secondary">
                <p className="font-medium text-text-primary mb-1">Adres</p>
                <p>Bobrownicka 44D/2</p>
                <p>61-306 Poznań</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px mb-8"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)",
          }}
        />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary">
            © {currentYear} Peritus Nieruchomości. Wszelkie prawa zastrzeżone.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-6">
            {["LinkedIn", "Twitter", "Instagram", "Facebook"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                {social}
              </a>
            ))}
          </div>

          {/* Legal links */}
          <div className="flex items-center gap-6">
            {["Polityka prywatności", "Regulamin"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
