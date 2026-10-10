import Hero from "@/components/Hero";
import OfertyBrowser from "@/components/OfertyBrowser";
import AboutTeaser from "@/components/AboutTeaser";
import ValuationSection from "@/components/ValuationSection";
import BackToTop from "@/components/BackToTop";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { getPropertyCards } from "@/lib/properties";
import { formatOffers } from "@/lib/format";

// Server Component: dane ofert czytane na serwerze; do przeglądarki trafiają
// tylko pola kart (bez opisów i galerii) — patrz `getPropertyCards`.
export default function Home() {
  const properties = getPropertyCards();

  return (
    <main className="min-h-screen">
      <Hero />

      <section id="oferty" className="scroll-mt-24 pt-20 md:pt-28">
        <Container className="mb-10">
          <SectionHeading eyebrow="Oferty" title="Aktualne oferty">
            <p>{formatOffers(properties.length)} w Poznaniu i okolicach.</p>
          </SectionHeading>
        </Container>
        <OfertyBrowser properties={properties} />
      </section>

      <AboutTeaser />
      <ValuationSection />
      <BackToTop />
    </main>
  );
}
