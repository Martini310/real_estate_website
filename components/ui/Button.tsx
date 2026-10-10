import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  // Główna akcja: pełny pomarańcz + ciemny tekst (kontrast 7,2:1). Jedna na widok.
  primary: "bg-accent text-background hover:bg-accent-soft",
  // Akcja drugorzędna: beżowy obrys, bez koloru akcji.
  secondary: "border border-line-strong text-text-primary hover:border-beige/50 hover:bg-beige/5",
  // Akcja tekstowa (np. „Wyczyść filtry”).
  ghost: "text-text-secondary hover:text-text-primary",
};

// Min. 44 px wysokości — cel dotykowy wg WCAG 2.5.5.
const SIZES: Record<Size, string> = {
  md: "h-12 px-6 text-small",
  sm: "h-11 px-4 text-small",
};

interface StyleProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

export function buttonClasses({ variant = "primary", size = "md", className = "" }: StyleProps = {}) {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`.trim();
}

type ButtonProps = StyleProps & ComponentPropsWithoutRef<"button">;

export default function Button({ variant, size, className, type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...rest} />;
}

type ButtonLinkProps = StyleProps & ComponentPropsWithoutRef<"a"> & { href: string };

/**
 * Link wyglądający jak przycisk. Trasy wewnętrzne i kotwice (`#oferty`) → next/link;
 * tel:/mailto:/http → zwykłe <a>. Kotwice MUSZĄ iść przez next/link: zwykły <a href="#…">
 * tworzy wpis historii bez stanu routera, a powrót „wstecz” na taki wpis zostawiał
 * otwarty panel oferty (slot @modal) i blokował scroll strony.
 */
export function ButtonLink({ variant, size, className, href, ...rest }: ButtonLinkProps) {
  const classes = buttonClasses({ variant, size, className });
  if (href.startsWith("/") || href.startsWith("#")) {
    return <Link href={href} className={classes} {...rest} />;
  }
  return <a href={href} className={classes} {...rest} />;
}
