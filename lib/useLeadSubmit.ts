"use client";

import { useState } from "react";
import { track } from "./analytics";

export type LeadStatus = "idle" | "submitting" | "success" | "error";

/** Źródło zapytania — do analityki konwersji i treści maila (U15). */
export type LeadSource = "kontakt" | "oferta" | "wycena";

/** Nazwa ukrytego pola-pułapki na boty (components/ui/Honeypot.tsx, sprawdzane w /api/lead). */
export const HONEYPOT_FIELD = "website";

/**
 * Wspólna wysyłka zapytań ze wszystkich formularzy: /api/lead → WordPress
 * (zapis w panelu „Zgłoszenia” + e-mail na adresy z ustawień).
 */
export function useLeadSubmit(source: LeadSource) {
  const [status, setStatus] = useState<LeadStatus>("idle");

  const submit = async (payload: Record<string, string>, form: HTMLFormElement) => {
    setStatus("submitting");
    try {
      const honeypot = form.elements.namedItem(HONEYPOT_FIELD);
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...payload,
          source,
          page: window.location.pathname,
          [HONEYPOT_FIELD]: honeypot instanceof HTMLInputElement ? honeypot.value : "",
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      track("submit_lead", { source });
      setStatus("success");
      return true;
    } catch {
      setStatus("error");
      return false;
    }
  };

  return { status, isSubmitting: status === "submitting", submit };
}
