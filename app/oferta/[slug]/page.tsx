import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProperties, getPropertyBySlug } from "@/lib/properties";
import PropertyDetailContent from "@/components/PropertyDetailContent";

// Prerender wszystkich ofert (SSG). Po wpięciu WordPressa wystarczy, że
// `getProperties()` zacznie zwracać dane z API — reszta bez zmian.
export function generateStaticParams() {
  return getProperties().map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    return { title: "Nie znaleziono oferty" };
  }

  const description = property.description.replace(/\n/g, " ").slice(0, 160);

  return {
    title: property.title,
    description,
    openGraph: {
      title: property.title,
      description,
      type: "website",
      images: [{ url: property.image }],
    },
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) notFound();

  return (
    <main className="min-h-screen bg-panel-bg">
      <PropertyDetailContent property={property} backHref="/oferty" />
    </main>
  );
}
