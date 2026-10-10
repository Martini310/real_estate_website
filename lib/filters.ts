// Filtrowanie i sortowanie listy ofert — czysta logika, bez UI.
import type { PropertyCardData, PropertyType } from "@/types/property";

export type FilterType = "all" | PropertyType;
// Zakresy w formacie "min-max" (max wyłącznie) lub "min+".
export type PriceRange = "all" | "0-400000" | "400000-550000" | "550000-700000" | "700000+";
export type AreaRange = "all" | "0-40" | "40-60" | "60-90" | "90+";
export type SortOrder = "default" | "price-asc" | "price-desc" | "area-desc";

export interface Filters {
  type: FilterType;
  price: PriceRange;
  area: AreaRange;
  bedrooms: number | null;
  sort: SortOrder;
}

export const DEFAULT_FILTERS: Filters = {
  type: "all",
  price: "all",
  area: "all",
  bedrooms: null,
  sort: "default",
};

function isInRange(value: number, range: string): boolean {
  const [min, max] = range.endsWith("+")
    ? [Number(range.slice(0, -1)), Infinity]
    : range.split("-").map(Number);
  return value >= min && value < max;
}

const SORTERS: Record<Exclude<SortOrder, "default">, (a: PropertyCardData, b: PropertyCardData) => number> = {
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "area-desc": (a, b) => b.area - a.area,
};

export function filterProperties(properties: PropertyCardData[], filters: Filters) {
  const result = properties.filter(
    (property) =>
      (filters.type === "all" || property.type === filters.type) &&
      (filters.price === "all" || isInRange(property.price, filters.price)) &&
      (filters.area === "all" || isInRange(property.area, filters.area)) &&
      (filters.bedrooms === null || property.bedrooms === filters.bedrooms)
  );
  return filters.sort === "default" ? result : [...result].sort(SORTERS[filters.sort]);
}

/** Liczba ofert w każdej kategorii (do etykiet zakładek i ukrywania pustych). */
export function countByType(properties: PropertyCardData[]): Record<FilterType, number> {
  const counts: Record<FilterType, number> = { all: properties.length, house: 0, apartment: 0, plot: 0, commercial: 0 };
  for (const property of properties) counts[property.type] += 1;
  return counts;
}

/** Liczba aktywnych zawężeń (bez sortowania) — do „Filtry (2)” i „Wyczyść filtry”. */
export function countActiveFilters(filters: Filters) {
  return [
    filters.type !== "all",
    filters.price !== "all",
    filters.area !== "all",
    filters.bedrooms !== null,
  ].filter(Boolean).length;
}
