import type { ComponentPropsWithoutRef } from "react";

/**
 * Wspólna szerokość i marginesy boczne treści. Dzięki temu krawędzie headera,
 * nagłówków, siatki ofert i stopki leżą w jednej pionowej linii.
 */
export default function Container({ className = "", ...rest }: ComponentPropsWithoutRef<"div">) {
  return <div className={`mx-auto w-full max-w-7xl px-4 md:px-8 lg:px-16 ${className}`.trim()} {...rest} />;
}
