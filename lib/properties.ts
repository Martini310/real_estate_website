// Warstwa dostępu do danych nieruchomości.
//
// To JEDYNE miejsce, które wie, skąd pochodzą oferty. Obecnie czytamy lokalny
// JSON (wersja testowa). Docelowo te same funkcje będą pobierać dane z
// WordPressa (headless, WPGraphQL/REST) i mapować je na typ `Property` — bez
// żadnych zmian w komponentach UI.

import propertiesData from "@/data/properties.json";
import type { Property, PropertyCardData } from "@/types/property";

const properties = propertiesData as unknown as Property[];

/** Wszystkie oferty. */
export function getProperties(): Property[] {
  return properties;
}

/** Wszystkie oferty w wersji „kartowej” (listy, filtry) — bez opisów i galerii. */
export function getPropertyCards(): PropertyCardData[] {
  return properties.map(({ id, slug, title, location, price, area, type, bedrooms, image }) => ({
    id,
    slug,
    title,
    location,
    price,
    area,
    type,
    bedrooms,
    image,
  }));
}

/** Oferty wyróżnione (np. na stronę główną). */
export function getFeaturedProperties(): Property[] {
  return properties.filter((property) => property.featured);
}

/** Pojedyncza oferta po slug-u (URL). */
export function getPropertyBySlug(slug: string): Property | undefined {
  return properties.find((property) => property.slug === slug);
}

/** Pojedyncza oferta po id. */
export function getPropertyById(id: number): Property | undefined {
  return properties.find((property) => property.id === id);
}
