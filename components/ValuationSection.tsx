"use client";

import { useId, useState } from "react";
import Container from "./ui/Container";
import SectionHeading from "./ui/SectionHeading";
import Field from "./ui/Field";
import Button from "./ui/Button";
import { useLeadSubmit } from "@/lib/useLeadSubmit";
import { siteConfig } from "@/lib/site";

// Bezpłatna wycena i zakres usługi potwierdzone przez właściciela (2026-10-10).
const BENEFITS = [
  "Wycena oparta na realnych cenach transakcyjnych w okolicy",
  "Przygotowanie i prezentacja oferty, która przyciąga kupujących",
  "Prowadzenie sprzedaży aż do aktu notarialnego",
];

/**
 * Ścieżka sprzedającego — dla pośrednika zwykle główne źródło zleceń (audyt U6).
 * Formularz celowo krótki (2 pola): każde dodatkowe pole obniża liczbę zgłoszeń.
 */
export default function ValuationSection() {
  const id = useId();
  const [form, setForm] = useState({ location: "", phone: "" });
  const { status, isSubmitting, submit } = useLeadSubmit("wycena");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await submit(form)) setForm({ location: "", phone: "" });
  };

  return (
    <section id="wycena" className="scroll-mt-24 pb-20 md:pb-28">
      <Container>
        <div className="grid grid-cols-1 gap-10 rounded-card border border-line bg-card-bg p-6 md:grid-cols-2 md:gap-16 md:p-12">
          <div>
            <SectionHeading eyebrow="Sprzedaż" title="Sprzedajesz nieruchomość?">
              <p>
                Bezpłatnie wycenię Twoje mieszkanie, dom lub działkę i podpowiem,
                jak sprzedać je sprawnie i w dobrej cenie.
              </p>
            </SectionHeading>

            <ul className="mt-8 space-y-3">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-body text-text-secondary">
                  <span aria-hidden="true" className="mt-2.5 h-1 w-1 flex-shrink-0 rounded-full bg-beige" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:self-center">
            <Field
              id={`${id}-location`}
              label="Gdzie jest nieruchomość?"
              name="location"
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              required
              placeholder="np. Poznań, Jeżyce"
            />
            <Field
              id={`${id}-phone`}
              label="Telefon"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              required
              autoComplete="tel"
              placeholder="np. 600 100 200"
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Wysyłanie..." : "Zamów bezpłatną wycenę"}
            </Button>

            <div aria-live="polite" className="text-small text-center">
              {status === "success" && (
                <p className="text-beige">Dziękuję! Oddzwonię, żeby umówić termin wyceny.</p>
              )}
              {status === "error" && (
                <p className="text-red-400">
                  Nie udało się wysłać. Spróbuj ponownie albo zadzwoń: {siteConfig.phone.display}.
                </p>
              )}
              {status === "idle" && (
                <p className="text-text-secondary">
                  Wolisz od razu porozmawiać?{" "}
                  <a href={siteConfig.phone.href} className="text-text-primary underline decoration-line-strong underline-offset-4 hover:decoration-beige">
                    {siteConfig.phone.display}
                  </a>
                </p>
              )}
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}
