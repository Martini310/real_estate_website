import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  /** Krótki tekst pod nagłówkiem. */
  children?: ReactNode;
  className?: string;
}

/** Nagłówek sekcji: eyebrow (font marki) + h2 + opcjonalny lead. */
export default function SectionHeading({ eyebrow, title, children, className = "" }: SectionHeadingProps) {
  return (
    <div className={className}>
      <p className="font-brand text-eyebrow uppercase text-beige mb-4">{eyebrow}</p>
      <h2 className="text-h1 font-light text-text-primary text-balance">{title}</h2>
      {children && <div className="mt-4 max-w-2xl text-body text-text-secondary">{children}</div>}
    </div>
  );
}
