// Formatowanie liczb i etykiet po polsku (przecinek dziesiętny, spacja tysięcy).
import type { PropertyType } from "@/types/property";

// useGrouping "always": pl-PL domyślnie nie grupuje liczb 4-cyfrowych („7900 zł/m²”),
// co obok „698 913 zł” wygląda jak błąd. Portale nieruchomości piszą „7 900 zł/m²”.
const priceFormatter = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
  useGrouping: "always",
});

const numberFormatter = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 2,
});

/** 599000 → „599 000 zł” */
export function formatPrice(price: number) {
  return priceFormatter.format(price);
}

/** 599000 zł / 63,6 m² → „9 418 zł/m²” */
export function formatPricePerM2(price: number, area: number) {
  return `${priceFormatter.format(Math.round(price / area))}/m²`;
}

/** 69.2 → „69,2” */
export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

/** 69.2 → „69,2 m²” */
export function formatArea(area: number) {
  return `${formatNumber(area)} m²`;
}

/**
 * Polska odmiana rzeczownika po liczebniku.
 * plural(1, ["oferta", "oferty", "ofert"]) → „oferta”; 3 → „oferty”; 5 → „ofert”; 22 → „oferty”.
 */
export function plural(count: number, [one, few, many]: [string, string, string]) {
  if (count === 1) return one;
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return few;
  return many;
}

/** 1 → „1 pokój”, 3 → „3 pokoje”, 5 → „5 pokoi” */
export function formatRooms(rooms: number) {
  return `${rooms} ${plural(rooms, ["pokój", "pokoje", "pokoi"])}`;
}

/** 1 → „1 oferta”, 3 → „3 oferty”, 8 → „8 ofert” */
export function formatOffers(count: number) {
  return `${count} ${plural(count, ["oferta", "oferty", "ofert"])}`;
}

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: "Mieszkanie",
  house: "Dom",
  plot: "Działka",
  commercial: "Lokal",
};

/** „apartment” → „Mieszkanie” */
export function formatPropertyType(type: PropertyType) {
  return PROPERTY_TYPE_LABELS[type];
}

