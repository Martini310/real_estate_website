import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProperties, getPropertyBySlug } from "@/lib/properties";
import PropertyDetailContent from "@/components/PropertyDetailContent";

// Prerender wszystkich ofert przy buildzie (SSG). Oferty dodane później w WP
// renderują się przy pierwszym wejściu (dynamicParams) i trafiają do cache.
export async function generateStaticParams() {
  const properties = await getProperties();
  return properties.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

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
  const property = await getPropertyBySlug(slug);

  if (!property) notFound();

  return (
    <main className="min-h-screen bg-panel-bg">
      <PropertyDetailContent property={property} backHref="/oferty" />
    </main>
  );
}
