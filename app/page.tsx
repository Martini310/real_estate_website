"use client";

import { useState, useRef } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PropertyGrid from "@/components/PropertyGrid";
import PropertyDetailPanel from "@/components/PropertyDetailPanel";
import BackToTop from "@/components/BackToTop";
import Footer from "@/components/Footer";
import propertiesData from "@/data/properties.json";
import propertyDetailsData from "@/data/propertyDetails.json";
import { Filters } from "@/components/FilterBar";
import { Property } from "@/components/PropertyCard";

interface PropertyDetail {
  id: number;
  slug: string;
  title: string;
  location: string;
  price: number;
  area: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  description: string;
  features: string[];
  agent: {
    name: string;
    phone: string;
    email: string;
    image: string;
  };
  gallery: string[];
}

export default function Home() {
  const [activeFilters, setActiveFilters] = useState<Filters>({
    type: "all",
    style: "all",
    area: "all",
    bedrooms: null,
    floors: null,
  });

  const [selectedProperty, setSelectedProperty] = useState<PropertyDetail | null>(
    null
  );
  const [sourceImageRef, setSourceImageRef] = useState<HTMLDivElement | null>(
    null
  );
  const sourceImageRefWrapper = useRef<HTMLDivElement | null>(null);

  const handlePropertyClick = (property: Property, imageRef: HTMLDivElement) => {
    const detailProperty = (propertyDetailsData as PropertyDetail[]).find(
      (p) => p.id === property.id
    );

    if (detailProperty) {
      setSourceImageRef(imageRef);
      sourceImageRefWrapper.current = imageRef;
      setSelectedProperty(detailProperty);
      // Prevent scrolling when panel is open
      document.body.style.overflow = "hidden";
    }
  };

  const handleClosePanel = () => {
    setSelectedProperty(null);
    setSourceImageRef(null);
    sourceImageRefWrapper.current = null;
    // Re-enable scrolling
    document.body.style.overflow = "auto";
  };

  return (
    <main className="min-h-screen">
      <Header />
      <Hero activeFilters={activeFilters} onFiltersChange={setActiveFilters} />
      <PropertyGrid
        properties={propertiesData}
        activeFilters={activeFilters}
        onPropertyClick={handlePropertyClick}
      />
      <BackToTop />
      <Footer />

      {/* Property Detail Panel */}
      <PropertyDetailPanel
        property={selectedProperty}
        onClose={handleClosePanel}
        sourceImageRef={sourceImageRefWrapper}
      />
    </main>
  );
}
