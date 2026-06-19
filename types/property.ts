// Wspólne typy nieruchomości — jedno źródło prawdy dla całej aplikacji.
// Docelowo dane będą mapowane z WordPressa (headless) do tych samych typów.

export type PropertyType = "apartment" | "house" | "commercial";
export type PropertyStyle = "modern" | "classic" | "log";

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
  style: PropertyStyle;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  yearBuilt: number;
  featured: boolean;
  /** Zdjęcie główne (okładka karty) */
  image: string;
  description: string;
  features: string[];
  agent: Agent;
  gallery: string[];
}
