"use client";

import { useEffect, useState } from "react";

export type FilterType = "all" | "apartment" | "house" | "commercial";
export type PriceRange =
  | "all"
  | "0-2000000"
  | "2000000-3500000"
  | "3500000-5000000"
  | "5000000+";
export type AreaRange = "all" | "100-200" | "200-300" | "300-500" | "500+";

export interface Filters {
  type: FilterType;
  price: PriceRange;
  area: AreaRange;
  bedrooms: number | null;
  floors: number | null;
}

interface FilterBarProps {
  activeFilters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export default function FilterBar({ activeFilters, onFiltersChange }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOpen(window.innerWidth >= 768);
    }
  }, []);

  const handleTypeChange = (type: FilterType) => {
    onFiltersChange({ ...activeFilters, type });
  };

  const handlePriceChange = (price: PriceRange) => {
    onFiltersChange({ ...activeFilters, price });
  };

  const handleAreaChange = (area: AreaRange) => {
    onFiltersChange({ ...activeFilters, area });
  };

  const handleBedroomsChange = (bedrooms: number | null) => {
    onFiltersChange({ ...activeFilters, bedrooms });
  };

  const handleFloorsChange = (floors: number | null) => {
    onFiltersChange({ ...activeFilters, floors });
  };

  const handleResetFilters = () => {
    onFiltersChange({
      type: "all",
      price: "all",
      area: "all",
      bedrooms: null,
      floors: null,
    });
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: "Wszystkie", value: "all" },
    { label: "Domy", value: "house" },
    { label: "Mieszkania", value: "apartment" },
    { label: "Lokale", value: "commercial" },
  ];

  const priceOptions: { label: string; value: PriceRange }[] = [
    { label: "Każda cena", value: "all" },
    { label: "do 2 mln zł", value: "0-2000000" },
    { label: "2–3,5 mln zł", value: "2000000-3500000" },
    { label: "3,5–5 mln zł", value: "3500000-5000000" },
    { label: "powyżej 5 mln zł", value: "5000000+" },
  ];

  const areaOptions = [
    { label: "Każda powierzchnia", value: "all" },
    { label: "100 - 200 m²", value: "100-200" },
    { label: "200 - 300 m²", value: "200-300" },
    { label: "300 - 500 m²", value: "300-500" },
    { label: "500+ m²", value: "500+" },
  ];

  return (
    <div className="mb-10 md:mb-12">
      {/* Category Tabs - always visible */}
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-4 md:mb-6 text-xs md:text-sm">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleTypeChange(filter.value)}
            className={`uppercase tracking-wider transition-colors duration-300 pb-2 border-b-2 ${
              activeFilters.type === filter.value
                ? "text-accent-soft border-accent"
                : "text-text-secondary border-transparent hover:text-text-primary hover:border-beige/30"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Toggle button for advanced filters (mobile only) */}
      <div className="mb-4 flex items-center justify-between gap-3 md:hidden">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/15 bg-black/25 px-4 py-2 text-xs text-text-primary hover:bg-white/5 transition-colors"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
        >
          <span>{isOpen ? "Ukryj filtry zaawansowane" : "Pokaż filtry zaawansowane"}</span>
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-text-secondary transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 3L5 6L8 3"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>

      {/* Advanced Filter Bar - visible on desktop, collapsible with animation on mobile */}
      <div
        className={`
          relative overflow-hidden transition-all duration-1000
          ${isOpen ? "max-h-[700px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2"}
          md:max-h-none md:opacity-100 md:translate-y-0
        `}
      >
        {/* Glassmorphism Background */}
        <div
          className="absolute inset-0 rounded-2xl border border-white/15 shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(10,10,10,0), rgba(30,30,30,0))",
            backdropFilter: "blur(26px) saturate(115%)",
            WebkitBackdropFilter: "blur(26px) saturate(115%)",
            boxShadow:
              "0 18px 45px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        />

        {/* Content */}
        <div className="relative flex flex-col gap-4 p-4 md:flex-row md:flex-wrap md:items-center md:gap-6 md:p-6">
            {/* Style Dropdown */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
              <label className="text-text-secondary text-xs md:text-sm whitespace-nowrap">
                Cena:
              </label>
              <div className="relative w-full md:w-auto">
                <select
                  value={activeFilters.price}
                  onChange={(e) => handlePriceChange(e.target.value as PriceRange)}
                  className="appearance-none w-full md:w-auto px-4 py-2.5 pr-8 text-text-primary text-sm cursor-pointer transition-all duration-200 focus:outline-none rounded-lg min-w-[140px] md:min-w-[160px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(20px) saturate(115%)",
                    WebkitBackdropFilter: "blur(20px) saturate(115%)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                  }}
                >
                  {priceOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-card-bg">
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 3L5 6L8 3"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-text-secondary"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Area Dropdown */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
              <label className="text-text-secondary text-xs md:text-sm whitespace-nowrap">
                Powierzchnia:
              </label>
              <div className="relative w-full md:w-auto">
                <select
                  value={activeFilters.area}
                  onChange={(e) => handleAreaChange(e.target.value as AreaRange)}
                  className="appearance-none w-full md:w-auto px-4 py-2.5 pr-8 text-text-primary text-sm cursor-pointer transition-all duration-200 focus:outline-none rounded-lg min-w-[140px] md:min-w-[160px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(20px) saturate(115%)",
                    WebkitBackdropFilter: "blur(20px) saturate(115%)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                  }}
                >
                  {areaOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-card-bg">
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 3L5 6L8 3"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-text-secondary"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bedrooms Selector */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
              <label className="text-text-secondary text-xs md:text-sm whitespace-nowrap">
                Pokoje:
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((num) => {
                  const isActive = activeFilters.bedrooms === num;
                  return (
                    <button
                      key={num}
                      onClick={() =>
                        handleBedroomsChange(activeFilters.bedrooms === num ? null : num)
                      }
                      className={`w-9 h-9 text-xs md:text-sm font-medium transition-all duration-200 border rounded-lg ${
                        isActive ? "text-text-primary shadow-sm" : "text-text-secondary"
                      }`}
                      style={
                        isActive
                          ? {
                              background: "rgba(217, 196, 163, 0.14)",
                              backdropFilter: "blur(20px) saturate(115%)",
                              WebkitBackdropFilter: "blur(20px) saturate(115%)",
                              border: "1px solid rgba(217, 196, 163, 0.4)",
                            }
                          : {
                              background: "rgba(255, 255, 255, 0.05)",
                              backdropFilter: "blur(10px) saturate(115%)",
                              WebkitBackdropFilter: "blur(10px) saturate(115%)",
                              border: "1px solid rgba(255, 255, 255, 0.15)",
                            }
                      }
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Floors Selector */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
              <label className="text-text-secondary text-xs md:text-sm whitespace-nowrap">
                Piętra:
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {[1, 2, 3].map((num) => {
                  const isActive = activeFilters.floors === num;
                  return (
                    <button
                      key={num}
                      onClick={() => handleFloorsChange(activeFilters.floors === num ? null : num)}
                      className={`w-9 h-9 text-xs md:text-sm font-medium transition-all duration-200 border rounded-lg ${
                        isActive ? "text-text-primary shadow-sm" : "text-text-secondary"
                      }`}
                      style={
                        isActive
                          ? {
                              background: "rgba(217, 196, 163, 0.14)",
                              backdropFilter: "blur(20px) saturate(115%)",
                              WebkitBackdropFilter: "blur(20px) saturate(115%)",
                              border: "1px solid rgba(217, 196, 163, 0.4)",
                            }
                          : {
                              background: "rgba(255, 255, 255, 0.05)",
                              backdropFilter: "blur(10px) saturate(115%)",
                              WebkitBackdropFilter: "blur(10px) saturate(115%)",
                              border: "1px solid rgba(255, 255, 255, 0.15)",
                            }
                      }
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

          {/* Clear Filters Button */}
          <div className="flex w-full md:w-auto justify-end md:ml-auto">
            <button
              onClick={handleResetFilters}
              className="mt-2 md:mt-0 px-4 py-2 text-xs md:text-sm font-medium text-text-secondary hover:text-text-primary transition-all duration-200 border rounded-lg bg-white/5 border-white/15"
            >
              Wyczyść filtry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
