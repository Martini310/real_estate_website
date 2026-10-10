"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Jeden nasłuch kliknięć na całą stronę: każdy link `tel:` / `mailto:` (header,
 * karta agenta, stopka, pasek na telefonie…) jest mierzony bez dopisywania
 * `onClick` w każdym miejscu — także w Server Components.
 */
export default function AnalyticsEvents() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='tel:'], a[href^='mailto:']");
      if (!link) return;
      const event = link.href.startsWith("tel:") ? "click_phone" : "click_email";
      track(event, { page: window.location.pathname });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
