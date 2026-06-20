import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "O mnie",
  description:
    "Poznaj agenta — wieloletnie doświadczenie na rynku nieruchomości premium, indywidualne podejście i pełne wsparcie na każdym etapie transakcji.",
};

// TODO: podmień zdjęcie, imię, bio i statystyki na prawdziwe dane agenta.
const STATS = [
  { value: "12+", label: "lat na rynku" },
  { value: "350+", label: "sfinalizowanych transakcji" },
  { value: "98%", label: "zadowolonych klientów" },
];

const VALUES = [
  {
    title: "Indywidualne podejście",
    text: "Każdą współpracę zaczynam od wysłuchania potrzeb. Dobieram nieruchomości, które naprawdę pasują do Twojego stylu życia i planów.",
  },
  {
    title: "Znajomość rynku premium",
    text: "Specjalizuję się w segmencie nieruchomości luksusowych — znam lokalizacje, deweloperów i realne wartości.",
  },
  {
    title: "Wsparcie od A do Z",
    text: "Prowadzę Cię przez cały proces: prezentacje, negocjacje, formalności i finalizację u notariusza.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background pt-28 md:pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        {/* Intro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center mb-20 md:mb-28">
          <div className="relative aspect-[4/5] w-full max-w-md mx-auto md:mx-0 overflow-hidden rounded-2xl border border-white/10">
            <Image
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=1000&fit=crop"
              alt="Zdjęcie agenta nieruchomości"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
            />
          </div>

          <div>
            <p className="text-accent text-xs uppercase tracking-[0.3em] mb-4">
              O mnie
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-text-primary mb-6">
              Magdalena Kowalska
            </h1>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                Od ponad dekady pomagam klientom znajdować nieruchomości, które
                stają się ich domem lub trafioną inwestycją. Wierzę, że dobry
                agent to przede wszystkim dobry doradca — uważny, dyskretny i
                dostępny.
              </p>
              <p>
                Działam na rynku premium w największych miastach w Polsce. Łączę
                znajomość lokalnych rynków z indywidualnym, spokojnym podejściem
                do każdej transakcji.
              </p>
            </div>

            <Link
              href="/kontakt"
              className="inline-block mt-8 px-8 py-3 border border-accent/50 text-accent text-sm uppercase tracking-widest hover:bg-accent/10 transition-colors"
            >
              Skontaktuj się
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-20 md:mb-28 border-y border-white/8 py-12">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl md:text-5xl font-light text-text-primary mb-2">
                {stat.value}
              </p>
              <p className="text-text-secondary text-sm uppercase tracking-wider">
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
              className="p-8 rounded-2xl border border-white/8 bg-white/[0.02]"
            >
              <h2 className="text-text-primary text-lg font-light mb-3">
                {value.title}
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                {value.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
