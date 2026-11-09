"use client";

import Button, { ButtonLink } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";

/**
 * Strona błędu (np. chwilowa niedostępność WordPressa przy stronie, której nie
 * ma jeszcze w cache). Zamiast surowego błędu — spokojny komunikat i telefon.
 */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-h2 text-text-primary mb-4">Nie udało się wczytać strony</h1>
        <p className="text-body text-text-secondary mb-8">
          To chwilowy problem z serwisem. Spróbuj ponownie za moment albo zadzwoń: {siteConfig.phone.display}.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button onClick={reset}>Spróbuj ponownie</Button>
          <ButtonLink href={siteConfig.phone.href} variant="secondary">
            Zadzwoń
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
