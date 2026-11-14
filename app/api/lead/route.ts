/**
 * Zgłoszenia z formularzy (kontakt, „Umów prezentację”, wycena) → WordPress.
 *
 * Przeglądarka nie zna sekretu ani adresu WP: ta trasa sprawdza dane, odsiewa boty
 * (honeypot) i przekazuje zgłoszenie do `POST /wp-json/peritus/v1/leads` z tym samym
 * wspólnym sekretem co webhook odświeżania (REVALIDATE_SECRET). WordPress zapisuje
 * zgłoszenie w panelu i wysyła e-mail na adresy z Zgłoszenia → Ustawienia.
 */

const SOURCES = ["kontakt", "oferta", "wycena"] as const;
const FIELDS = ["name", "phone", "email", "message", "property", "location", "page"] as const;

type Lead = { source: string } & Partial<Record<(typeof FIELDS)[number], string>>;

function parse(body: unknown): Lead | null {
  if (!body || typeof body !== "object") return null;
  const data = body as Record<string, unknown>;
  const source = String(data.source ?? "");
  if (!SOURCES.includes(source as (typeof SOURCES)[number])) return null;

  const lead: Lead = { source };
  for (const key of FIELDS) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) lead[key] = value.trim().slice(0, key === "message" ? 5000 : 300);
  }

  if ((lead.phone ?? "").replace(/\D/g, "").length < 9) return null;
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return null;
  return lead;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  // Honeypot: ukryte pole „website” wypełniają tylko boty. Udajemy sukces, żeby
  // bot nie próbował dalej — zgłoszenie nigdzie nie trafia.
  if (body && typeof body === "object" && (body as Record<string, unknown>).website) {
    return Response.json({ ok: true });
  }

  const lead = parse(body);
  if (!lead) return Response.json({ ok: false, error: "invalid" }, { status: 400 });

  const apiUrl = process.env.WORDPRESS_API_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!apiUrl || !secret) {
    console.error("[lead] Brak WORDPRESS_API_URL lub REVALIDATE_SECRET — zgłoszenie nie zostało wysłane.");
    return Response.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  // Vercel: pierwszy adres z x-forwarded-for to klient (limit zgłoszeń z jednego IP w WP).
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "";

  try {
    const response = await fetch(`${apiUrl}/wp-json/peritus/v1/leads`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-peritus-secret": secret },
      body: JSON.stringify({ ...lead, clientIp }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 429) return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    if (!response.ok) {
      console.error("[lead] WordPress odpowiedział", response.status, await response.text().catch(() => ""));
      return Response.json({ ok: false, error: "upstream" }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[lead] Brak połączenia z WordPressem:", error);
    return Response.json({ ok: false, error: "upstream" }, { status: 502 });
  }
}
