/**
 * Zdarzenia konwersji (audyt U15). Wysyłane do `window.dataLayer` — standardowe
 * wejście Google Tag Managera / GA4. Dopóki GTM nie jest wczytany (Faza 4: po
 * zgodzie w banerze cookie), zdarzenia tylko trafiają do tablicy i nigdzie nie
 * wychodzą — kod jest gotowy, a prywatność zachowana.
 *
 * Słownik zdarzeń (nazwy jak w GA4: snake_case):
 * - click_phone  — klik w link `tel:`   (page: ścieżka strony)
 * - click_email  — klik w link `mailto:` (page)
 * - submit_lead  — wysłany formularz      (source: kontakt | oferta | wycena)
 */
export type AnalyticsEvent = "click_phone" | "click_email" | "submit_lead";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: AnalyticsEvent, params: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}
