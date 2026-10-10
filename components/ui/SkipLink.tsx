"use client";

/**
 * „Przejdź do treści” (WCAG 2.4.1) — widoczny tylko po fokusie z klawiatury.
 * Przenosi fokus na #main (layout) bez kotwicy w adresie: zwykły <a href="#…"> tworzyłby
 * wpis historii bez stanu routera, a powrót „wstecz” na taki wpis psuł panel oferty.
 */
export default function SkipLink() {
  const skipToMain = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const main = document.getElementById("main");
    if (!main) return;
    e.preventDefault();
    main.focus();
  };

  return (
    <a
      href="#main"
      onClick={skipToMain}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-control focus:bg-background focus:px-4 focus:py-3 focus:text-small focus:text-text-primary focus:shadow-e2"
    >
      Przejdź do treści
    </a>
  );
}
