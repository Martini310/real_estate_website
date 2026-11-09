import { revalidateTag } from "next/cache";
import { OFFERS_TAG } from "@/lib/properties";

/**
 * Webhook z WordPressa (wtyczka peritus-core): po imporcie ofert albo zmianie
 * flag „Wyróżniona/Ukryta” oznacza cache ofert jako nieaktualny. Autoryzacja
 * wspólnym sekretem w nagłówku `x-revalidate-secret`.
 *
 * Profil "max" (stale-while-revalidate), nie `{ expire: 0 }`: pierwsza wizyta po
 * webhooku dostaje jeszcze poprzednią wersję i w tle odświeża dane. Gdyby WP był
 * akurat niedostępny, zostaje ostatnia dobra wersja strony — przy `expire: 0`
 * cache byłby pusty i strona zwracała błąd 500 (sprawdzone na buildzie prod).
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ ok: false }, { status: 401 });
  }

  revalidateTag(OFFERS_TAG, "max");
  return Response.json({ ok: true, revalidated: OFFERS_TAG });
}
