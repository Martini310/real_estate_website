"use client";

import { useState } from "react";

export type FilterType = "all" | "apartment" | "house" | "commercial";
export type StyleType = "all" | "log" | "modern" | "classic";
export type AreaRange = "all" | "100-200" | "200-300" | "300-500" | "500+";

export interface Filters {
  type: FilterType;
  style: StyleType;
  area: AreaRange;
  bedrooms: number | null;
  floors: number | null;
}

interface FilterBarProps {
  activeFilters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export default function FilterBar({ activeFilters, onFiltersChange }: FilterBarProps) {
  const handleTypeChange = (type: FilterType) => {
    onFiltersChange({ ...activeFilters, type });
  };

  const handleStyleChange = (style: StyleType) => {
    onFiltersChange({ ...activeFilters, style });
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
      style: "all",
      area: "all",
      bedrooms: null,
      floors: null,
    });
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Apartment", value: "apartment" },
    { label: "House", value: "house" },
    { label: "Commercial", value: "commercial" },
  ];

  const styleOptions = [
    { label: "All Styles", value: "all" },
    { label: "Log", value: "log" },
    { label: "Modern", value: "modern" },
    { label: "Classic", value: "classic" },
  ];

  const areaOptions = [
    { label: "All Areas", value: "all" },
    { label: "100 - 200 m²", value: "100-200" },
    { label: "200 - 300 m²", value: "200-300" },
    { label: "300 - 500 m²", value: "300-500" },
    { label: "500+ m²", value: "500+" },
  ];

  return (
    <div className="mb-12">
      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-8 mb-8">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleTypeChange(filter.value)}
            className={`text-sm uppercase tracking-wider transition-colors duration-300 pb-2 border-b-2 ${
              activeFilters.type === filter.value
                ? "text-text-primary border-text-primary"
                : "text-text-secondary border-transparent hover:text-text-primary hover:border-white/20"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Advanced Filter Bar - Glassmorphism */}
      <div className="relative">
        {/* Glassmorphism Background */}
        <div 
          className="absolute inset-0 rounded-2xl border border-white/10 shadow-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          }}
        />
        
        {/* Content */}
        <div className="relative flex flex-wrap items-center gap-6 p-6">
          {/* Style Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-text-secondary text-sm whitespace-nowrap">Style:</label>
            <div className="relative">
              <select
                value={activeFilters.style}
                onChange={(e) => handleStyleChange(e.target.value as StyleType)}
                className="appearance-none px-4 py-2.5 pr-8 text-text-primary text-sm cursor-pointer transition-all duration-200 focus:outline-none rounded-lg min-w-[160px]"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                {styleOptions.map((option) => (
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
          <div className="flex items-center gap-2">
            <label className="text-text-secondary text-sm whitespace-nowrap">Area:</label>
            <div className="relative">
              <select
                value={activeFilters.area}
                onChange={(e) => handleAreaChange(e.target.value as AreaRange)}
                className="appearance-none px-4 py-2.5 pr-8 text-text-primary text-sm cursor-pointer transition-all duration-200 focus:outline-none rounded-lg min-w-[160px]"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
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
          <div className="flex items-center gap-2">
            <label className="text-text-secondary text-sm whitespace-nowrap">Bedrooms:</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => handleBedroomsChange(activeFilters.bedrooms === num ? null : num)}
                  className={`w-9 h-9 text-sm font-medium transition-all duration-200 border rounded-lg ${
                    activeFilters.bedrooms === num
                      ? "text-text-primary shadow-sm"
                      : "text-text-secondary"
                  }`}
                  style={
                    activeFilters.bedrooms === num
                      ? {
                          background: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(20px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                        }
                      : {
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (activeFilters.bedrooms !== num) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeFilters.bedrooms !== num) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Floors Selector */}
          <div className="flex items-center gap-2">
            <label className="text-text-secondary text-sm whitespace-nowrap">Floors:</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => handleFloorsChange(activeFilters.floors === num ? null : num)}
                  className={`w-9 h-9 text-sm font-medium transition-all duration-200 border rounded-lg ${
                    activeFilters.floors === num
                      ? "text-text-primary shadow-sm"
                      : "text-text-secondary"
                  }`}
                  style={
                    activeFilters.floors === num
                      ? {
                          background: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(20px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                        }
                      : {
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (activeFilters.floors !== num) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeFilters.floors !== num) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={handleResetFilters}
          className="absolute right-6 top-1/2 -translate-y-1/2 px-4 pt-2 pb-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-all duration-200 border rounded-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
