import Image from "next/image";
import Container from "./ui/Container";
import SectionHeading from "./ui/SectionHeading";
import { ButtonLink } from "./ui/Button";
import { siteConfig } from "@/lib/site";
import damianPhoto from "@/public/damian-4k.jpg";

/**
 * Skrót „O mnie” na stronie głównej — w usługach lokalnych klient wybiera
 * najpierw osobę, potem ofertę. Twarz + konkretne liczby budują zaufanie.
 */
export default function AboutTeaser() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-card border border-line">
            <Image
              src={damianPhoto}
              alt={`${siteConfig.agent} — ${siteConfig.name}`}
              fill
              placeholder="blur"
              className="object-cover object-[55%_50%]"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>

          <div>
            <SectionHeading eyebrow="O mnie" title={siteConfig.agent}>
              <p>
                Prowadzę każdą transakcję osobiście — od pierwszej rozmowy, przez
                prezentacje i negocjacje, aż po akt notarialny. Znam Poznań i
                okolice, więc wiem, ile naprawdę warta jest Twoja nieruchomość.
              </p>
              {/* Licencja — weryfikowalny dowód kwalifikacji; zwykły tekst, bez ozdobników */}
              <p className="mt-3 text-small">
                {siteConfig.role}, licencja zawodowa nr {siteConfig.licenseNumber}.
              </p>
            </SectionHeading>

            <dl className="mt-8 grid grid-cols-3 gap-6 max-w-xl">
              {siteConfig.stats.map((stat) => (
                // flex-col-reverse: w DOM etykieta (dt) przed wartością (dd), wizualnie liczba na górze
                <div key={stat.label} className="flex flex-col-reverse">
                  <dt className="mt-1 text-small text-text-secondary">{stat.label}</dt>
                  <dd className="text-h2 font-light text-beige">{stat.value}</dd>
                </div>
              ))}
            </dl>

            <ButtonLink href="/o-mnie" variant="secondary" className="mt-8">
              Poznaj mnie bliżej
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
