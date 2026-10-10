// Wspólne typy nieruchomości — jedno źródło prawdy dla całej aplikacji.
// Docelowo dane będą mapowane z WordPressa (headless) do tych samych typów.

export type PropertyType = "apartment" | "house" | "plot" | "commercial";

export interface Agent {
  name: string;
  phone: string;
  email: string;
  image: string;
}

export interface Property {
  id: number;
  slug: string;
  title: string;
  location: string;
  price: number;
  area: number;
  type: PropertyType;
  /** Liczba pokoi (0 = nie dotyczy, np. działka) */
  bedrooms: number;
  /** 0 = nie dotyczy / brak danych — UI ukrywa */
  bathrooms: number;
  /** Liczba poziomów lokalu; 0 = brak danych — UI ukrywa */
  floors: number;
  /** 0 = brak danych */
  yearBuilt: number;
  featured: boolean;
  /** Zdjęcie główne (okładka karty) */
  image: string;
  description: string;
  features: string[];
  agent: Agent;
  gallery: string[];
  /** Oryginalne ogłoszenie (np. nieruchomosci-online.pl), z którego zaimportowano ofertę */
  sourceUrl?: string;
}

/**
 * Dane potrzebne karcie i filtrom — tylko to trafia do przeglądarki na listach
 * (bez opisów i galerii), żeby payload nie rósł z liczbą ofert z WordPressa.
 */
export type PropertyCardData = Pick<
  Property,
  "id" | "slug" | "title" | "location" | "price" | "area" | "type" | "bedrooms" | "image"
>;

