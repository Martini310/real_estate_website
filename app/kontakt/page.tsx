import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { siteConfig } from "@/lib/site";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Zadzwoń lub napisz — odpowiadam zwykle tego samego dnia roboczego. Umówię prezentację, wycenię nieruchomość i poprowadzę transakcję w Poznaniu i okolicach.",
};

const CONTACT = [
  { label: "Telefon", value: siteConfig.phone.display, href: siteConfig.phone.href },
  { label: "E-mail", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
  { label: "Adres", value: `${siteConfig.address.street}, ${siteConfig.address.city}` },
  { label: "Godziny", value: siteConfig.hours },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background pt-28 md:pt-32 pb-24">
      <Container>
        <p className="font-brand text-eyebrow uppercase text-beige mb-4">
          Kontakt
        </p>
        <h1 className="text-h1 font-light text-text-primary mb-12 md:mb-16">
          Porozmawiajmy o Twojej nieruchomości
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* Dane kontaktowe */}
          <div className="space-y-8">
            <p className="text-body text-text-secondary max-w-md">
              Masz pytanie o konkretną ofertę lub chcesz omówić sprzedaż swojej
              nieruchomości? Napisz lub zadzwoń — odpowiadam zwykle tego samego
              dnia roboczego.
            </p>

            <div className="space-y-6">
              {CONTACT.map((item) => (
                <div key={item.label}>
                  <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-text-primary text-lg hover:text-beige transition-colors"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-text-primary text-lg">
                      {item.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Formularz */}
          <div className="p-6 md:p-8 rounded-card border border-line bg-beige/[0.03]">
            <ContactForm />
          </div>
        </div>
      </Container>
    </main>
  );
}
