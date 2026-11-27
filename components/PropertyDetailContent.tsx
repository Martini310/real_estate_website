"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import AgentCard from "./AgentCard";
import ContactForm from "./ContactForm";
import PropertyDescription from "./PropertyDescription";
import PropertyGallery, { GALLERY_CONTROL } from "./PropertyGallery";
import Button, { ButtonLink } from "./ui/Button";
import PhoneIcon from "./ui/PhoneIcon";
import { Property } from "@/types/property";
import { formatNumber, formatPrice, formatPricePerM2, formatPropertyType } from "@/lib/format";
import { prefersReducedMotion } from "@/lib/animations";

interface PropertyDetailContentProps {
  property: Property;
  /** Gdy podane → tryb panelu: przycisk „Zamknij” na galerii. */
  onBack?: () => void;
  /** Gdy podane → tryb pełnej podstrony: link powrotu nad tytułem. */
  backHref?: string;
  /** Id nagłówka — panel wskazuje go w `aria-labelledby` (nazwa dialogu = tytuł oferty). */
  titleId?: string;
}

/**
 * Współdzielona treść szczegółów oferty — używana zarówno przez wysuwany panel
 * (`PropertyModal`, intercepting route), jak i przez pełną podstronę
 * `/oferta/[slug]`. Dzięki temu obie ścieżki wyglądają identycznie.
 *
 * Układ (audyt U4): cena i akcje zawsze pod ręką — na szerokim ekranie w
 * przyklejonej prawej kolumnie, na telefonie w przyklejonym pasku na dole.
 */
export default function PropertyDetailContent({ property, onBack, backHref, titleId }: PropertyDetailContentProps) {
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLElement>(null);
  const tel = `tel:${property.agent.phone.replace(/\s/g, "")}`;

  // Spokojne wejście tytułu i lokalizacji (jedno, krótkie — tytuł to najważniejsza
  // informacja, nie może czekać na animację słowo po słowie).
  useEffect(() => {
    if (!headingRef.current || prefersReducedMotion()) return;
    const tween = gsap.fromTo(
      headingRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, delay: 0.15, ease: "power2.out" }
    );
    return () => {
      tween.kill();
    };
  }, [property.slug]);

  // Przewinięcie do formularza bez kotwicy w adresie (kotwica tworzyłaby wpis
  // historii psujący „wstecz” w panelu) + fokus na pierwsze pole.
  const scrollToForm = () => {
    const form = formRef.current;
    if (!form) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    form.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    form.querySelector("input")?.focus({ preventScroll: true });
  };

  const params = [
    { label: "Powierzchnia", value: formatNumber(property.area), unit: "m²" },
    property.bedrooms > 0 && { label: "Pokoje", value: String(property.bedrooms) },
    property.bathrooms > 0 && { label: "Łazienki", value: String(property.bathrooms) },
    property.yearBuilt > 0 && { label: "Rok budowy", value: String(property.yearBuilt) },
  ].filter((param): param is { label: string; value: string; unit?: string } => Boolean(param));

  return (
    <>
      {/* Galeria */}
      <div className={`relative w-full overflow-hidden bg-card-bg ${onBack ? "h-[62vh]" : "h-[80vh]"}`}>
        {/* Zamknięcie panelu: „✕” w prawym górnym rogu (konwencja modala) — nie
            chevron „‹”, który mylił się z „poprzednie zdjęcie” tuż pod nim */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={`absolute top-5 right-5 z-30 h-11 gap-1.5 pl-3 pr-4 ${GALLERY_CONTROL}`}
            aria-label="Zamknij szczegóły oferty"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6l12 12M18 6L6 18" />
            </svg>
            <span className="text-small">Zamknij</span>
          </button>
        )}

        <PropertyGallery
          images={property.gallery}
          title={property.title}
          sizes={onBack ? "(min-width: 1024px) 78vw, 100vw" : "100vw"}
        />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 md:px-8 md:py-10">
        {backHref && (
          <Link
            href={backHref}
            className="mb-6 inline-flex items-center gap-2 text-small text-text-secondary transition-colors hover:text-text-primary"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Wróć do ofert
          </Link>
        )}

        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-12">
          {/* Tytuł */}
          <div ref={headingRef} className="xl:col-start-1">
            <p className="mb-3 font-brand text-eyebrow uppercase text-beige">
              {formatPropertyType(property.type)}
            </p>
            <h1 id={titleId} className="text-h1 font-light text-text-primary">
              {property.title}
            </h1>
            <p className="mt-3 text-body text-text-secondary">
              {property.location}
            </p>
          </div>

          {/* Cena + akcje: pod tytułem na węższych ekranach, przyklejona kolumna na ≥1280 px */}
          <aside className="mt-6 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:mt-0">
            <div
              className={`rounded-card border border-line bg-beige/[0.03] p-6 xl:sticky ${onBack ? "xl:top-8" : "xl:top-28"}`}
            >
              <p className="text-small text-text-secondary">Cena</p>
              <p className="mt-1 text-[2rem] leading-tight text-accent-soft">{formatPrice(property.price)}</p>
              <p className="mt-1 text-small text-text-secondary">
                {formatPricePerM2(property.price, property.area)}
              </p>

              {/* Na telefonie te akcje są w przyklejonym pasku na dole */}
              <div className="mt-6 hidden gap-3 md:grid">
                <Button onClick={scrollToForm} className="w-full">
                  Umów prezentację
                </Button>
                <ButtonLink href={tel} variant="secondary" className="w-full">
                  <PhoneIcon />
                  {property.agent.phone}
                </ButtonLink>
              </div>
              <p className="mt-4 hidden text-small text-text-secondary md:block">
                Odpowiadam zwykle tego samego dnia roboczego.
              </p>
            </div>
          </aside>

          <div className="xl:col-start-1">
            {/* Parametry */}
            <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-line py-8 sm:grid-cols-4">
              {params.map((param) => (
                <div key={param.label}>
                  <dt className="mb-2 text-xs uppercase tracking-wider text-text-secondary">{param.label}</dt>
                  <dd className="text-2xl font-light text-text-primary">
                    {param.value} {param.unit && <span className="text-small">{param.unit}</span>}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Opis */}
            <section className="border-b border-line py-8">
              <h2 className="mb-4 text-h3 text-text-primary">O nieruchomości</h2>
              <PropertyDescription text={property.description} />
            </section>

            {/* Cechy */}
            <section className="border-b border-line py-8">
              <h2 className="mb-4 text-h3 text-text-primary">Najważniejsze cechy</h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {property.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-small text-text-secondary">
                    <span aria-hidden="true" className="mt-2.5 h-1 w-1 flex-shrink-0 rounded-full bg-beige" />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>

            {/* Opiekun */}
            <section className="border-b border-line py-8">
              <h2 className="mb-4 text-h3 text-text-primary">Twój opiekun</h2>
              <AgentCard agent={property.agent} />
            </section>

            {/* Formularz */}
            <section ref={formRef} className="scroll-mt-6 py-8">
              <h2 className="mb-2 text-h3 text-text-primary">Umów prezentację</h2>
              <p className="mb-6 text-small text-text-secondary">
                Zostaw numer — oddzwonię i ustalimy dogodny termin.
              </p>
              <ContactForm propertyTitle={property.title} />
            </section>
          </div>
        </div>
      </div>

      {/* Przyklejony pasek akcji (telefon). `sticky`, nie `fixed`: w panelu przodek ma
          transform (animacja wjazdu), przy którym `fixed` przewijałby się razem z treścią. */}
      <div className="sticky bottom-0 z-30 grid grid-cols-2 gap-3 border-t border-line bg-background/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
        <ButtonLink href={tel} variant="secondary" size="sm" className="whitespace-nowrap">
          <PhoneIcon />
          Zadzwoń
        </ButtonLink>
        <Button onClick={scrollToForm} size="sm" className="whitespace-nowrap">
          Umów prezentację
        </Button>
      </div>
    </>
  );
}
