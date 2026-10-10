"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { initReveal } from "@/lib/animations";
import { siteConfig } from "@/lib/site";
import Container from "./ui/Container";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (footerRef.current) return initReveal(footerRef.current);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={footerRef}
      id="contact"
      className="relative bg-background pt-24 pb-8"
    >
      {/* Górna linia — wygaszana na końcach, w kolorze linii (bez pomarańczu: akcent = akcja) */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" />

      <Container>
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-control bg-gradient-to-br from-beige to-[#F0E5D4] shadow-e1">
                <Image
                  src="/logo-pn.png"
                  alt="Peritus Nieruchomości"
                  width={44}
                  height={44}
                  className="h-8 w-8 object-contain"
                />
              </span>
              <span className="flex flex-col font-brand leading-none">
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
              Mieszkania, domy i działki w Poznaniu i okolicach. Prowadzę
              sprzedaż i zakup od pierwszej rozmowy do aktu notarialnego.
            </p>
            <p className="mt-4 text-xs text-text-secondary">
              {siteConfig.agent}, licencja zawodowa nr {siteConfig.licenseNumber}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h2 className="font-brand text-eyebrow uppercase text-text-primary mb-6">
              Nawigacja
            </h2>
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
            <h2 className="font-brand text-eyebrow uppercase text-text-primary mb-6">
              Usługi
            </h2>
            {/* Tylko usługi potwierdzone przez właściciela — każda prowadzi tam, gdzie można z niej skorzystać */}
            <div className="space-y-3">
              {[
                { label: "Zakup nieruchomości", href: "/oferty" },
                { label: "Sprzedaż nieruchomości", href: "/#wycena" },
                { label: "Bezpłatna wycena", href: "/#wycena" },
                { label: "Prowadzenie transakcji", href: "/o-mnie" },
              ].map((service) => (
                <Link
                  key={service.label}
                  href={service.href}
                  className="block text-sm text-text-secondary transition-colors duration-200 hover:text-text-primary"
                >
                  {service.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="font-brand text-eyebrow uppercase text-text-primary mb-6">
              Kontakt
            </h2>
            <div className="space-y-3">
              <div className="text-sm text-text-secondary">
                <p className="font-medium text-text-primary mb-1">Telefon</p>
                <a
                  href={siteConfig.phone.href}
                  className="hover:text-text-primary transition-colors duration-200"
                >
                  {siteConfig.phone.display}
                </a>
              </div>
              <div className="text-sm text-text-secondary">
                <p className="font-medium text-text-primary mb-1">E-mail</p>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-text-primary transition-colors duration-200"
                >
                  {siteConfig.email}
                </a>
              </div>
              <div className="text-sm text-text-secondary">
                <p className="font-medium text-text-primary mb-1">Adres</p>
                <p>{siteConfig.address.street}</p>
                <p>{siteConfig.address.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mb-8 bg-gradient-to-r from-transparent via-line to-transparent" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary">
            © {currentYear} {siteConfig.name}. Wszelkie prawa zastrzeżone.
          </p>

          {/* Social: dodać, gdy powstaną realne profile (linki „#” to martwe ślepe uliczki) */}

          {/* TODO (Faza 4): podlinkować, gdy powstaną strony prawne. Do tego czasu tekst —
              `href="#"` był martwym linkiem i psuł historię (panel oferty po „wstecz”). */}
          <div className="flex items-center gap-6">
            {["Polityka prywatności", "Regulamin"].map((label) => (
              <span key={label} className="text-xs text-text-secondary">
                {label}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
