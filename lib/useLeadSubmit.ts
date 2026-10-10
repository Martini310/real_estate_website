"use client";

import { useState } from "react";
import { track } from "./analytics";

export type LeadStatus = "idle" | "submitting" | "success" | "error";

/** Źródło zapytania — do analityki konwersji i treści maila (U15). */
export type LeadSource = "kontakt" | "oferta" | "wycena";

/**
 * Wspólna wysyłka zapytań ze wszystkich formularzy.
 * TODO (Faza 4): podłączyć realną wysyłkę (API route / e-mail / WP) — tylko tutaj.
 */
export function useLeadSubmit(source: LeadSource) {
  const [status, setStatus] = useState<LeadStatus>("idle");

  const submit = async (payload: Record<string, string>) => {
    setStatus("submitting");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Lead submitted:", { source, ...payload });
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
