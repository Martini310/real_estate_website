import type { Metadata } from "next";
import Image from "next/image";
import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";
import damianPhoto from "@/public/damian-4k.jpg";

export const metadata: Metadata = {
  title: "O mnie",
  description:
    "Damian Rożewski — pośrednik w obrocie nieruchomościami, licencja zawodowa nr 23975. 10 lat doświadczenia i ponad 150 sprzedanych nieruchomości w Poznaniu i okolicach.",
};

const VALUES = [
  {
    title: "Indywidualne podejście",
    text: "Każdą współpracę zaczynam od wysłuchania potrzeb. Dobieram nieruchomości, które naprawdę pasują do Twojego stylu życia i planów.",
  },
  {
    title: "Znajomość lokalnego rynku",
    text: "Znam Poznań i okolice — lokalizacje, deweloperów i realne ceny transakcyjne.",
  },
  {
    title: "Wsparcie od A do Z",
    text: "Prowadzę Cię przez cały proces: prezentacje, negocjacje, formalności i finalizację u notariusza.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background pt-28 md:pt-32 pb-24">
      <Container>
        {/* Intro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center mb-20 md:mb-28">
          <div className="relative aspect-[4/5] w-full max-w-md mx-auto md:mx-0 overflow-hidden rounded-card border border-line">
            <Image
              src={damianPhoto}
              alt={`${siteConfig.agent} — ${siteConfig.name}`}
              fill
              placeholder="blur"
              className="object-cover object-[55%_50%]"
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
            />
          </div>

          <div>
            <p className="font-brand text-eyebrow uppercase text-beige mb-4">
              O mnie
            </p>
            <h1 className="text-h1 font-light text-text-primary mb-3">
              {siteConfig.agent}
            </h1>
            <p className="mb-6 text-small text-text-secondary">
              {siteConfig.role}, licencja zawodowa nr {siteConfig.licenseNumber}
            </p>
            <div className="space-y-4 text-body text-text-secondary">
              <p>
                Od 10 lat pomagam klientom znajdować nieruchomości, które
                stają się ich domem lub trafioną inwestycją. Wierzę, że dobry
                agent to przede wszystkim dobry doradca — uważny, dyskretny i
                dostępny.
              </p>
              <p>
                Działam w Poznaniu i okolicach. Łączę znajomość lokalnego rynku
                z indywidualnym, spokojnym podejściem do każdej transakcji.
              </p>
            </div>

            <ButtonLink href="/kontakt" className="mt-8">
              Skontaktuj się
            </ButtonLink>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-20 md:mb-28 border-y border-line py-12">
          {siteConfig.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl md:text-5xl font-light text-beige mb-2">
                {stat.value}
              </p>
              <p className="text-text-secondary text-small uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="p-8 rounded-card border border-line bg-beige/[0.03]"
            >
              <h2 className="text-text-primary text-h3 mb-3">
                {value.title}
              </h2>
              <p className="text-text-secondary text-small">
                {value.text}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
