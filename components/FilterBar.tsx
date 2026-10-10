"use client";

import { useId, useState } from "react";
import { buttonClasses } from "./ui/Button";
import {
  AreaRange,
  DEFAULT_FILTERS,
  Filters,
  FilterType,
  PriceRange,
  SortOrder,
  countActiveFilters,
} from "@/lib/filters";

interface FilterBarProps {
  activeFilters: Filters;
  onFiltersChange: (filters: Filters) => void;
  /** Liczba ofert w każdej kategorii — puste kategorie są ukrywane. */
  counts: Record<FilterType, number>;
}

const TYPE_TABS: { label: string; value: FilterType }[] = [
  { label: "Wszystkie", value: "all" },
  { label: "Mieszkania", value: "apartment" },
  { label: "Domy", value: "house" },
  { label: "Działki", value: "plot" },
  { label: "Lokale", value: "commercial" },
];

const PRICE_OPTIONS: { label: string; value: PriceRange }[] = [
  { label: "Każda cena", value: "all" },
  { label: "do 400 tys. zł", value: "0-400000" },
  { label: "400–550 tys. zł", value: "400000-550000" },
  { label: "550–700 tys. zł", value: "550000-700000" },
  { label: "powyżej 700 tys. zł", value: "700000+" },
];

const AREA_OPTIONS: { label: string; value: AreaRange }[] = [
  { label: "Każda powierzchnia", value: "all" },
  { label: "do 40 m²", value: "0-40" },
  { label: "40–60 m²", value: "40-60" },
  { label: "60–90 m²", value: "60-90" },
  { label: "powyżej 90 m²", value: "90+" },
];

export const SORT_OPTIONS: { label: string; value: SortOrder }[] = [
  { label: "Polecane", value: "default" },
  { label: "Cena: od najniższej", value: "price-asc" },
  { label: "Cena: od najwyższej", value: "price-desc" },
  { label: "Największa powierzchnia", value: "area-desc" },
];

export default function FilterBar({ activeFilters, onFiltersChange, counts }: FilterBarProps) {
  // Startowo zwinięte: na desktopie panel i tak jest widoczny (md:max-h-none w CSS),
  // a na telefonie nie ma zwijania po starcie JS — wcześniej SSR renderował panel
  // otwarty, efekt go zwijał i układ „skakał” (CLS 0,12 na /oferty).
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const activeCount = countActiveFilters(activeFilters);


  const update = (patch: Partial<Filters>) => onFiltersChange({ ...activeFilters, ...patch });

  // Puste kategorie (np. „Lokale” bez ofert) to ślepe uliczki — nie pokazujemy ich.
  const tabs = TYPE_TABS.filter((tab) => tab.value === "all" || counts[tab.value] > 0);

  return (
    <div className="mb-8 md:mb-10">
      {/* Kategorie — poziomy scroll na wąskich ekranach zamiast łamania w osobną linię */}
      <div className="no-scrollbar -mx-4 mb-4 overflow-x-auto px-4 md:mx-0 md:mb-6 md:px-0">
        <div className="flex min-w-max items-center gap-6 md:gap-8 text-xs md:text-small">
          {tabs.map((tab) => {
            const isActive = activeFilters.type === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => update({ type: tab.value })}
                aria-pressed={isActive}
                className={`uppercase tracking-wider transition-colors duration-300 pt-3 pb-2.5 border-b-2 ${
                  isActive
                    ? "text-accent-soft border-accent"
                    : "text-text-secondary border-transparent hover:text-text-primary hover:border-line-strong"
                }`}
              >
                {tab.label} <span className="text-text-secondary">({counts[tab.value]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Przełącznik filtrów (mobile) */}
      <div className="mb-4 md:hidden">
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between gap-2 rounded-control border border-line bg-beige/[0.04] px-4 text-small text-text-primary hover:border-line-strong transition-colors"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls={`${id}-panel`}
        >
          <span>Filtry{activeCount > 0 && ` (${activeCount})`}</span>
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full bg-beige/5 text-text-secondary transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <ChevronIcon />
          </span>
        </button>
      </div>

      {/* Filtry szczegółowe — zawsze widoczne na desktopie, zwijane na mobile */}
      <div
        id={`${id}-panel`}
        className={`
          overflow-hidden rounded-card border border-line bg-beige/[0.03] transition-all duration-700
          ${isOpen ? "max-h-[700px] opacity-100 translate-y-0" : "invisible max-h-0 opacity-0 -translate-y-2 border-transparent md:visible"}
          md:max-h-none md:opacity-100 md:translate-y-0 md:border-line
        `}
      >
        <div className="flex flex-col gap-4 p-4 md:flex-row md:flex-wrap md:items-center md:gap-6 md:p-5">
          <SelectFilter
            id={`${id}-price`}
            label="Cena:"
            value={activeFilters.price}
            options={PRICE_OPTIONS}
            onChange={(value) => update({ price: value as PriceRange })}
          />

          <SelectFilter
            id={`${id}-area`}
            label="Powierzchnia:"
            value={activeFilters.area}
            options={AREA_OPTIONS}
            onChange={(value) => update({ area: value as AreaRange })}
          />

          <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
            <span id={`${id}-rooms`} className="text-text-secondary text-xs md:text-small whitespace-nowrap">
              Pokoje:
            </span>
            <div role="group" aria-labelledby={`${id}-rooms`} className="flex flex-wrap items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((num) => {
                const isActive = activeFilters.bedrooms === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => update({ bedrooms: isActive ? null : num })}
                    aria-pressed={isActive}
                    className={`w-11 h-11 text-xs md:text-small font-medium rounded-control border transition-colors duration-200 ${
                      isActive
                        ? "border-beige/40 bg-beige/15 text-text-primary"
                        : "border-line bg-beige/[0.04] text-text-secondary hover:border-line-strong hover:text-text-primary"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => onFiltersChange({ ...DEFAULT_FILTERS, sort: activeFilters.sort })}
              className={buttonClasses({ variant: "ghost", size: "sm", className: "self-end md:ml-auto md:self-auto" })}
            >
              Wyczyść filtry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SelectFilter({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
      <label htmlFor={id} className="text-text-secondary text-xs md:text-small whitespace-nowrap">
        {label}
      </label>
      <div className="relative w-full md:w-auto">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none w-full md:w-auto h-11 px-4 pr-9 rounded-control border border-line-strong bg-beige/[0.04] text-text-primary text-small cursor-pointer transition-colors duration-200 hover:border-beige/40 min-w-[140px] md:min-w-[160px]"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-card-bg">
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
          <ChevronIcon />
        </span>
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 3L5 6L8 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
