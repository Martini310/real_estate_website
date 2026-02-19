"use client";

import { useEffect, useRef } from "react";
import { initFadeIn } from "@/lib/animations";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (footerRef.current) {
      initFadeIn(footerRef.current);
    }
  }, []);

  const currentYear = new Date().getFullYear();

  const handleSmoothScroll = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer
      ref={footerRef}
      id="contact"
      className="relative bg-background pt-24 pb-8"
    >
      {/* Top border gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(198, 161, 91, 0.3), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand section */}
          <div>
            <h3 className="text-xl font-light tracking-tight text-text-primary mb-6">
              Premium
              <br />
              Real Estate
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Discover luxury properties and premium real estate investments
              tailored to your lifestyle.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-text-primary mb-6 font-medium">
              Navigation
            </h4>
            <div className="space-y-3">
              {[
                { label: "Properties", id: "properties" },
                { label: "About", id: "about" },
                { label: "Services", id: "services" },
                { label: "Contact", id: "contact" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSmoothScroll(item.id)}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 block"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-text-primary mb-6 font-medium">
              Services
            </h4>
            <div className="space-y-3">
              {[
                "Property Search",
                "Consultation",
                "Investment Planning",
                "Property Management",
              ].map((service) => (
                <p
                  key={service}
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 cursor-default"
                >
                  {service}
                </p>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-text-primary mb-6 font-medium">
              Contact
            </h4>
            <div className="space-y-3">
              <div className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200">
                <p className="font-medium text-text-primary mb-1">Email</p>
                <a href="mailto:info@premiumrealestate.com">
                  info@premiumrealestate.com
                </a>
              </div>
              <div className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200">
                <p className="font-medium text-text-primary mb-1">Phone</p>
                <a href="tel:+1234567890">+1 (234) 567-890</a>
              </div>
              <div className="text-sm text-text-secondary">
                <p className="font-medium text-text-primary mb-1">Address</p>
                <p>123 Luxury Avenue, Suite 100</p>
                <p>Premium City, PC 12345</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px mb-8"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)",
          }}
        />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary">
            © {currentYear} Premium Real Estate. All rights reserved.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-6">
            {["LinkedIn", "Twitter", "Instagram", "Facebook"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                {social}
              </a>
            ))}
          </div>

          {/* Legal links */}
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
