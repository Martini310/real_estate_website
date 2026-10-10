import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-beige text-7xl md:text-8xl font-light mb-4">404</p>
        <h1 className="text-h2 text-text-primary mb-4">
          Nie znaleziono strony
        </h1>
        <p className="text-text-secondary mb-8">
          Strona lub oferta, której szukasz, nie istnieje lub została usunięta.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <ButtonLink href="/oferty">Przeglądaj oferty</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Strona główna
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
