import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/lib/properties";
import PropertyModal from "@/components/PropertyModal";

// Intercepting route: gdy użytkownik klika ofertę z listy, zamiast pełnej
// podstrony renderuje się wysuwany panel (overlay) — bez utraty kontekstu listy.
// Bezpośrednie wejście / odświeżenie URL-a trafia do `app/oferta/[slug]/page.tsx`.
export default async function InterceptedPropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) notFound();

  return <PropertyModal property={property} />;
}
