import { HONEYPOT_FIELD } from "@/lib/useLeadSubmit";

/**
 * Pułapka na boty: pole niewidoczne dla ludzi i czytników ekranu, poza kolejnością
 * Tab. Boty wypełniają wszystkie pola — /api/lead takie zgłoszenie po cichu odrzuca.
 * Prostsze i bez tarcia w porównaniu z CAPTCHA.
 */
export default function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Strona internetowa
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
