"use client";

import { useId, useMemo, useState } from "react";
import FilterBar, { SORT_OPTIONS, SelectFilter } from "./FilterBar";
import PropertyGrid from "./PropertyGrid";
import Container from "./ui/Container";
import Button, { ButtonLink } from "./ui/Button";
import { PropertyCardData } from "@/types/property";
import { DEFAULT_FILTERS, Filters, SortOrder, countActiveFilters, countByType, filterProperties } from "@/lib/filters";

/**
 * Przeglądarka ofert (filtry + siatka) — wspólna dla strony głównej i `/oferty`.
 */
interface OfertyBrowserProps {
  properties: PropertyCardData[];
  /** Ile pierwszych kart ładować priorytetowo — tylko gdy siatka jest nad linią zgięcia (`/oferty`). */
  priorityCount?: number;
}

export default function OfertyBrowser({ properties, priorityCount = 0 }: OfertyBrowserProps) {
  const [activeFilters, setActiveFilters] = useState<Filters>(DEFAULT_FILTERS);
  const id = useId();

  const counts = useMemo(() => countByType(properties), [properties]);
  const results = useMemo(() => filterProperties(properties, activeFilters), [properties, activeFilters]);
  const isFiltered = countActiveFilters(activeFilters) > 0;

  return (
    <>
      <Container>
        <FilterBar activeFilters={activeFilters} onFiltersChange={setActiveFilters} counts={counts} />

        {/* Pasek wyników: licznik (ogłaszany czytnikom ekranu) + sortowanie */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite" className="text-small text-text-secondary">
            {isFiltered
              ? `Pasujące oferty: ${results.length} z ${properties.length}`
              : `Wszystkie oferty: ${properties.length}`}
          </p>
          <SelectFilter
            id={`${id}-sort`}
            label="Sortuj:"
            value={activeFilters.sort}
            options={SORT_OPTIONS}
            onChange={(value) => setActiveFilters((prev) => ({ ...prev, sort: value as SortOrder }))}
          />
        </div>

        {results.length === 0 && (
          <div className="rounded-card border border-line bg-beige/[0.03] px-6 py-12 text-center">
            <h3 className="text-h3 text-text-primary mb-2">Brak ofert dla wybranych kryteriów</h3>
            <p className="text-body text-text-secondary mb-6 max-w-md mx-auto">
              Zmień filtry albo napisz, czego szukasz — dam znać, gdy pojawi się pasująca nieruchomość.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="secondary" onClick={() => setActiveFilters((prev) => ({ ...DEFAULT_FILTERS, sort: prev.sort }))}>
                Wyczyść filtry
              </Button>
              <ButtonLink href="/kontakt">Powiadom mnie o ofercie</ButtonLink>
            </div>
          </div>
        )}
      </Container>

      <PropertyGrid properties={results} priorityCount={priorityCount} />
    </>
  );
}
