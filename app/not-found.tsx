import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-accent text-7xl md:text-8xl font-light mb-4">404</p>
        <h1 className="text-2xl md:text-3xl font-light text-text-primary mb-4">
          Nie znaleziono strony
        </h1>
        <p className="text-text-secondary mb-8">
          Strona lub oferta, której szukasz, nie istnieje lub została usunięta.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="px-8 py-3 border border-accent/50 text-accent text-sm uppercase tracking-widest hover:bg-accent/10 transition-colors"
          >
            Strona główna
          </Link>
          <Link
            href="/oferty"
            className="px-8 py-3 border border-white/15 text-text-primary text-sm uppercase tracking-widest hover:bg-white/5 transition-colors"
          >
            Przeglądaj oferty
          </Link>
        </div>
      </div>
    </main>
  );
}
