import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Skontaktuj się z nami — odpowiemy na pytania, umówimy prezentację i pomożemy znaleźć idealną nieruchomość.",
};

// TODO: podmień dane kontaktowe na prawdziwe dane agenta.
const CONTACT = [
  { label: "E-mail", value: "damian@peritus-nieruchomosci.pl", href: "mailto:damian@peritus-nieruchomosci.pl" },
  { label: "Telefon", value: "+48 600 000 000", href: "tel:+48600000000" },
  { label: "Adres", value: "Bobrownicka 44D/2, 61-306 Poznań" },
  { label: "Godziny", value: "Pon.–Pt. 9:00–18:00" },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background pt-28 md:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <p className="text-accent text-xs uppercase tracking-[0.3em] mb-4">
          Kontakt
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-text-primary mb-12 md:mb-16">
          Porozmawiajmy o Twojej nieruchomości
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* Dane kontaktowe */}
          <div className="space-y-8">
            <p className="text-text-secondary leading-relaxed max-w-md">
              Masz pytanie o konkretną ofertę lub chcesz omówić sprzedaż swojej
              nieruchomości? Napisz lub zadzwoń — odpowiadam zwykle tego samego
              dnia roboczego.
            </p>

            <div className="space-y-6">
              {CONTACT.map((item) => (
                <div key={item.label}>
                  <p className="text-text-secondary text-xs uppercase tracking-widest mb-1">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-text-primary text-lg font-light hover:text-accent transition-colors"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-text-primary text-lg font-light">
                      {item.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Formularz */}
          <div className="p-6 md:p-8 rounded-2xl border border-white/8 bg-white/[0.02]">
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
