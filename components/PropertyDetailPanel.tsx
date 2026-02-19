"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { SplitText } from "gsap/all";
import AgentCard from "./AgentCard";
import ContactForm from "./ContactForm";

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

interface PropertyDetailPanelProps {
  property: PropertyDetail | null;
  onClose: () => void;
  sourceImageRef?: React.RefObject<HTMLDivElement>;
}

export default function PropertyDetailPanel({
  property,
  onClose,
  sourceImageRef,
}: PropertyDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const locationPriceRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageAnimatingRef = useRef(false);

  const animateIn = useCallback(async () => {
    if (!panelRef.current || isAnimatingRef.current) return;

    isAnimatingRef.current = true;

    const timeline = gsap.timeline();

    // Animate background dim
    timeline.fromTo(
      panelRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.1,
        ease: "power3.out",
      },
      0
    );

    // Blur and scale main grid
    timeline.fromTo(
      "#properties",
      { filter: "blur(0px)", transform: "scale(1)" },
      {
        filter: "blur(4px)",
        transform: "scale(0.98)",
        duration: 0.6,
        ease: "power3.inOut",
      },
      0
    );

    // Slide panel from right
    if (panelRef.current) {
      timeline.fromTo(
        panelRef.current,
        { x: "100%" },
        {
          x: 0,
          duration: 1.5,
          ease: "power3.out",
        },
        0
      );
    }

    // Animate title - letter by letter from left to right
    if (titleRef.current) {
      const titleText = titleRef.current.textContent || "";
        const split = new SplitText(titleRef.current, { type: "words" });
        gsap.from(split.words, {
            opacity: 0,
            duration: 3,
            ease: "sine.out",
            stagger: 0.2,
        });
    }

    // Animate location and price - slide from bottom
    if (locationPriceRef.current) {
        timeline.fromTo(
            locationPriceRef.current,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
            },
            1.5,
        );
    }

    isAnimatingRef.current = false;
  }, [sourceImageRef]);

  const animateOut = useCallback(async () => {
    if (!panelRef.current || isAnimatingRef.current) return;

    isAnimatingRef.current = true;

    const timeline = gsap.timeline();

    // Animate background undim
    timeline.to(
      panelRef.current,
      {
        opacity: 0,
        duration: 0.9,
        ease: "power3.in",
      },
      0
    );

    // Unblur and unscale main grid
    timeline.to(
      "#properties",
      {
        filter: "blur(0px)",
        transform: "scale(1)",
        duration: 0.6,
        ease: "power3.inOut",
      },
      0
    );

    // Slide panel to right
    if (panelRef.current) {
      timeline.to(
        panelRef.current,
        {
          x: "100%",
          duration: 0.7,
          ease: "power3.in",
        },
        0
      );
    }

    isAnimatingRef.current = false;

    // Call onClose after animation completes
    await new Promise((resolve) => setTimeout(resolve, 700));
    onClose();
  }, [sourceImageRef, onClose]);

  const handleBackClick = () => {
    animateOut();
  };

  const handlePrevImage = () => {
    if (imageAnimatingRef.current) return;
    imageAnimatingRef.current = true;

    if (imageContainerRef.current) {
      gsap.to(imageContainerRef.current, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => {
          setCurrentImageIndex((prev) =>
            prev === 0 ? property!.gallery.length - 1 : prev - 1
          );
          gsap.to(imageContainerRef.current, {
            opacity: 1,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: () => {
              imageAnimatingRef.current = false;
            },
          });
        },
      });
    }
  };

  const handleNextImage = () => {
    if (imageAnimatingRef.current) return;
    imageAnimatingRef.current = true;

    if (imageContainerRef.current) {
      gsap.to(imageContainerRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.inOut",
        onComplete: () => {
          setCurrentImageIndex((prev) =>
            prev === property!.gallery.length - 1 ? 0 : prev + 1
          );
          gsap.to(imageContainerRef.current, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
              imageAnimatingRef.current = false;
            },
          });
        },
      });
    }
  };

  useEffect(() => {
    if (property) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => animateIn(), 50);
      return () => clearTimeout(timer);
    }
  }, [property, animateIn]);

  if (!property) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === panelRef.current) {
      handleBackClick();
    }
  };

  return (
    <div
      ref={panelRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/40 z-50"
      style={{ opacity: 0 }}
    >
      <div className="fixed inset-0 w-full h-screen bg-panel-bg overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="absolute top-6 left-6 z-30 text-text-primary hover:text-accent transition-colors p-2"
          aria-label="Close detail panel"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Hero Image Gallery */}
        <div
          ref={heroImageRef}
          className="relative w-full h-[80vh] bg-gradient-to-b from-white/5 to-transparent overflow-hidden"
          style={{ willChange: "transform" }}
        >
          <div ref={imageContainerRef} className="relative w-full h-full" style={{ opacity: 1 }}>
            <Image
              src={property.gallery[currentImageIndex]}
              alt={`${property.title} - Gallery image ${currentImageIndex + 1}`}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-panel-bg via-panel-bg/20 to-transparent" />

          {/* Previous Image Button */}
          <button
            onClick={handlePrevImage}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/20 text-text-primary hover:border-white/50 hover:bg-white/5 transition-all flex items-center justify-center"
            aria-label="Previous image"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Next Image Button */}
          <button
            onClick={handleNextImage}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/20 text-text-primary hover:border-white/50 hover:bg-white/5 transition-all flex items-center justify-center"
            aria-label="Next image"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-6 right-6 z-20 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-text-primary text-sm font-light">
            {currentImageIndex + 1} / {property.gallery.length}
          </div>

          {/* Image Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {property.gallery.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (imageAnimatingRef.current || idx === currentImageIndex) return;
                  imageAnimatingRef.current = true;

                  gsap.to(imageContainerRef.current, {
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.inOut",
                    onComplete: () => {
                      setCurrentImageIndex(idx);
                      gsap.to(imageContainerRef.current, {
                        opacity: 1,
                        duration: 0.4,
                        ease: "power2.inOut",
                        onComplete: () => {
                          imageAnimatingRef.current = false;
                        },
                      });
                    },
                  });
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentImageIndex
                    ? "w-6 bg-accent"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="px-6 md:px-8 py-8 max-w-4xl mx-auto">
          {/* Title Section */}
          <h1 ref={titleRef} className="text-4xl md:text-5xl font-light text-text-primary mb-2 leading-tight">
            {property.title}
          </h1>
          <div ref={locationPriceRef} className="flex items-center justify-between mb-8 pb-6 border-b border-white/8">
            <div className="text-text-secondary text-sm">{property.location}</div>
            <div className="text-accent font-light text-lg">
              {formatPrice(property.price)}
            </div>
          </div>

          {/* Key Info Row */}
          <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-white/8">
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">
                Area
              </p>
              <p className="text-text-primary text-2xl font-light">
                {property.area} <span className="text-sm">m²</span>
              </p>
            </div>
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">
                Bedrooms
              </p>
              <p className="text-text-primary text-2xl font-light">
                {property.bedrooms}
              </p>
            </div>
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-widest mb-2">
                Bathrooms
              </p>
              <p className="text-text-primary text-2xl font-light">
                {property.bathrooms}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8 pb-8 border-b border-white/8">
            <h2 className="text-text-primary text-lg font-light mb-4">
              About This Property
            </h2>
            <div className="space-y-4">
              {property.description.split("\n").map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-text-secondary text-sm leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mb-8 pb-8 border-b border-white/8">
            <h2 className="text-text-primary text-lg font-light mb-4">
              Key Features
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {property.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <p className="text-text-secondary text-sm">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="mb-8 pb-8 border-b border-white/8">
            <h2 className="text-text-primary text-lg font-light mb-4">
              Your Agent
            </h2>
            <AgentCard agent={property.agent} />
          </div>

          {/* Contact Form */}
          <div className="mb-8">
            <h2 className="text-text-primary text-lg font-light mb-4">
              Schedule a Viewing
            </h2>
            <ContactForm propertyTitle={property.title} />
          </div>

          {/* Footer Spacer */}
          <div className="h-12" />
        </div>
      </div>
    </div>
  );
}
