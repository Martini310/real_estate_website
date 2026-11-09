// Warstwa dostępu do danych nieruchomości.
//
// To JEDYNE miejsce, które wie, skąd pochodzą oferty:
// - z WordPressa (wtyczka peritus-core, `GET /wp-json/peritus/v1/offers`), gdy
//   ustawiono `WORDPRESS_API_URL` — WP sam importuje oferty z portalu raz dziennie;
// - z lokalnego `data/properties.json` bez tej zmiennej (dev) albo awaryjnie przy buildzie.
// Komponenty UI dostają zawsze ten sam typ `Property`.

import propertiesData from "@/data/properties.json";
import type { Property, PropertyCardData } from "@/types/property";

/** Tag cache ofert — `app/api/revalidate` unieważnia go po imporcie w WP. */
export const OFFERS_TAG = "offers";

/** Odświeżanie „na wszelki wypadek”, gdy webhook z WP nie dotrze. */
const REVALIDATE_SECONDS = 3600;

const localProperties = propertiesData as unknown as Property[];

/** Minimalna kontrola kształtu — zła odpowiedź API nie może rozsypać strony. */
function isProperty(value: unknown): value is Property {
  const p = value as Property;
  return (
    typeof p === "object" &&
    p !== null &&
    typeof p.id === "number" &&
    typeof p.slug === "string" &&
    typeof p.title === "string" &&
    typeof p.price === "number" &&
    typeof p.area === "number" &&
    Array.isArray(p.gallery) &&
    Array.isArray(p.features)
  );
}

async function fetchFromWordPress(baseUrl: string): Promise<Property[]> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/wp-json/peritus/v1/offers`, {
    next: { revalidate: REVALIDATE_SECONDS, tags: [OFFERS_TAG] },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`WordPress odpowiedział ${response.status}`);

  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isProperty)) {
    throw new Error("WordPress zwrócił oferty w nieoczekiwanym formacie");
  }
  return data;
}

/** Wszystkie oferty (kolejność: wyróżnione, potem jak na portalu). */
export async function getProperties(): Promise<Property[]> {
  const baseUrl = process.env.WORDPRESS_API_URL;
  if (!baseUrl) return localProperties;

  try {
    return await fetchFromWordPress(baseUrl);
  } catch (error) {
    // Build: awaria WP nie może zablokować wdrożenia → dane z repozytorium.
    // Działająca strona: błąd idzie dalej, a Next serwuje ostatnią poprawnie
    // wygenerowaną wersję strony zamiast nieaktualnego pliku z repozytorium.
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.warn("[oferty] WordPress niedostępny przy buildzie — używam data/properties.json:", error);
      return localProperties;
    }
    throw error;
  }
}

/** Wszystkie oferty w wersji „kartowej” (listy, filtry) — bez opisów i galerii. */
export async function getPropertyCards(): Promise<PropertyCardData[]> {
  const properties = await getProperties();
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

/** Pojedyncza oferta po slug-u (URL). */
export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  const properties = await getProperties();
  return properties.find((property) => property.slug === slug);
}
