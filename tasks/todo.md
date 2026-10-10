# Plan rozwoju — Portal nieruchomości (real-estate)

> Stan wyjściowy: jednostronicowy frontend (Next.js 16 / TS / Tailwind / GSAP) z placeholderami
> ofert w JSON. Treść ofert po polsku, UI po angielsku. Panel szczegółów jako overlay bez URL.
>
> Decyzje (ustalone z właścicielem):
> - **Backend:** WordPress headless (WPGraphQL/REST + ACF). Warstwa danych wymienialna.
> - **Język:** tylko polski (centralny słownik, gotowe na i18n w przyszłości).
> - **Oferty:** prawdziwe podstrony `/oferta/[slug]` (SEO + linkowanie), z zachowaniem animacji.

---

## Faza 0 — Fundament i porządki (refactor, zero zmian wizualnych) ✅ ZROBIONE
Cel: jedno źródło prawdy dla danych i typów, wspólny layout. Bez tego dalsze fazy będą bałaganem.

- [x] Wspólne typy w `types/property.ts` (`Property`, `Agent`) — usunięto 3× zduplikowane definicje (page.tsx, PropertyCard.tsx, PropertyDetailPanel.tsx)
- [x] Scalono `data/properties.json` + `data/propertyDetails.json` w jeden plik (programowo, bez przepisywania ręcznie); usunięto `propertyDetails.json`
- [x] Warstwa dostępu do danych `lib/properties.ts`: `getProperties()`, `getFeaturedProperties()`, `getPropertyBySlug()`, `getPropertyById()` — jedyne miejsce do podmiany na WP
- [x] Wyniesiono `Header` i `Footer` do `app/layout.tsx` (współdzielony layout)
- [x] **Bug naprawiony:** `PropertyCard` „Piętra” używa realnego `property.floors` (było `Math.ceil(area/150)`)
- [x] `app/layout.tsx`: `lang="pl"` + polskie metadane bazowe (title.template gotowy na podstrony)

## Faza 1 — Polonizacja UI ✅ ZROBIONE
Cel: cały interfejs po polsku, spójne formatowanie PL.

- [x] Polskie stałe per-komponent (świadomie bez warstwy i18n — PL-only, zgodnie z decyzją; ekstrakcja do słownika trywialna w razie potrzeby)
- [x] `Header` — nawigacja: Oferty / O mnie / Usługi / Kontakt
- [x] `Footer` — wszystkie sekcje + dane PL (placeholdery z `TODO` do podmiany na realne dane agenta)
- [x] `FilterBar` — etykiety i opcje (Styl, Powierzchnia, Sypialnie, Piętra, „Wyczyść filtry”, typy); usunięto martwy `activeSummaryParts`
- [x] `PropertyCard` — Sypialnie / Powierzchnia / Piętra / „Szczegóły”, typy (Dom / Apartament / Lokal komercyjny)
- [x] `PropertyDetailPanel` — O nieruchomości / Najważniejsze cechy / Twój opiekun / Umów oglądanie + etykiety aria PL
- [x] `ContactForm` + `AgentCard` + `BackToTop` — pełna polonizacja (etykiety, placeholdery, komunikaty, aria)
- [x] Metadane bazowe po polsku _(favicon i OG per-strona → Faza 2/4)_

## Faza 2 — Routing i podstrony ✅ ZROBIONE
Cel: realne adresy, działająca nawigacja, podstrony.

- [x] `/oferta/[slug]` — pełna podstrona (`generateStaticParams` = 8 ofert SSG, `generateMetadata` + OG); treść z panelu wydzielona do `PropertyDetailContent`
- [x] Klik w karcie → `/oferta/[slug]` przez **intercepting routes**: panel-overlay przy kliknięciu z listy (premium efekt zachowany), pełna strona przy bezpośrednim wejściu/odświeżeniu. Karta to teraz `<Link>`.
- [x] `/oferty` — pełna lista ofert z filtrami (`OfertyBrowser`); homepage zostaje wizytówką
- [x] `/o-mnie` — bio, zdjęcie, statystyki, wartości, CTA (placeholdery)
- [x] `/kontakt` — ogólny formularz + dane kontaktowe + godziny (placeholdery); _mapa/social → Faza 4_
- [x] `app/not-found.tsx` — 404 w stylu serwisu
- [x] Martwe linki (`#about`, `#services`) → realne trasy (Header + Footer na `next/link`); „Usługi" usunięte z nawigacji (brak strony)

## Faza 3 — Integracja z WordPress (headless)
Cel: oferty z WP zamiast JSON. Warstwa UI bez zmian.

- [ ] WP: custom post type „nieruchomosc” + pola ACF (cena, powierzchnia, pokoje, łazienki, piętra, lokalizacja/geo, galeria, agent, cechy, status)
- [ ] Wystawić WPGraphQL (rekomendacja) lub REST; ustalić kontrakt pól
- [ ] `lib/properties.ts` → `fetch` z WP z ISR (`revalidate`), zmienna `WORDPRESS_API_URL` w `.env`
- [ ] Mapowanie pól WP → `types/property.ts`
- [ ] `next.config.js` — dodać hostname mediów WP do `images.remotePatterns`
- [ ] Obsługa błędów/timeoutów + fallback, cache

## Faza 4 — Funkcje portalu i zgodność prawna (RODO)
- [ ] Działający formularz: API route (`/api/kontakt`) → e-mail (Resend/nodemailer) lub formularz WP; walidacja + honeypot/antyspam
- [ ] **Zgoda RODO** w formularzach + klauzula informacyjna (wymóg prawny w PL)
- [ ] Strona „Polityka prywatności” + informacja o cookies
- [ ] Baner cookie consent
- [ ] Rozszerzone filtry: zakres ceny, miasto/lokalizacja; sortowanie (cena ↑/↓, powierzchnia, najnowsze); paginacja/lazy-load
- [ ] Mapa lokalizacji oferty (Leaflet+OSM lub Google Maps)
- [ ] SEO: `sitemap.ts`, `robots.ts`, obrazy OG, JSON-LD schema.org (`RealEstateListing`/`Residence`)

## Faza 5 — Jakość, dostępność, wydajność, deploy
- [ ] A11y panelu/modali: zamykanie Escape, focus-trap, poprawne aria-*
- [ ] Weryfikacja `SplitText` (`gsap/all`) w produkcyjnym buildzie (plugin premium GSAP)
- [ ] Test responsywności (mobile/tablet/desktop) + przegląd kontrastu
- [ ] Lighthouse / Core Web Vitals; optymalizacja obrazów
- [ ] `prefers-reduced-motion` dla animacji GSAP
- [ ] Deploy (Vercel) + konfiguracja env produkcyjnych

---

## Rekomendowana kolejność
1. **Faza 0 + 1** razem (fundament + polski) — natychmiastowa, widoczna wartość, odblokowuje resztę.
2. **Faza 2** — podstrony i routing.
3. **Faza 3** — podpięcie WordPressa (gdy backend gotowy).
4. **Faza 4 + 5** — dopracowanie, zgodność prawna, produkcja.

## Sekcja review

### Faza 0 + 1 (zrealizowane)
**Zmiany w danych/architekturze**
- `data/properties.json` → jedno źródło prawdy (18 pól na ofertę, 8 ofert); `data/propertyDetails.json` usunięty.
- Nowe: `types/property.ts` (typy `Property`, `Agent`, uniony `PropertyType`/`PropertyStyle`), `lib/properties.ts` (warstwa dostępu — jedyne miejsce do podmiany na WordPress).
- `Header`/`Footer` przeniesione do `app/layout.tsx`; `page.tsx` uproszczony (oferta z karty niesie komplet danych → panel bez dodatkowego lookupu).

**Naprawione**
- Bug pięter w `PropertyCard` (`Math.ceil(area/150)` → `property.floors`).
- Usunięty martwy kod (`activeSummaryParts` w `FilterBar`, zbędny stan `sourceImageRef` w `page.tsx`).
- 3× zduplikowane definicje typów scalone do jednego.

**Polonizacja:** Header, Footer, FilterBar, PropertyCard, PropertyDetailPanel, ContactForm, AgentCard, BackToTop + `lang="pl"` + metadane.

**Zachowane:** premium efekt wysuwanego panelu (overlay) przy kliknięciu oferty — bez zmian w logice animacji GSAP.

**Weryfikacja:** `npx tsc --noEmit` → 0 błędów; `npm run build` → OK (`/` prerenderuje się statycznie).

**Do podmiany (placeholdery):** dane kontaktowe w `Footer` (oznaczone `TODO`), marka „Premium Real Estate", nagłówek Hero.

### Faza 2 (zrealizowane)
**Routing / architektura**
- Intercepting routes: `app/@modal/(.)oferta/[slug]` (panel-overlay) + `app/oferta/[slug]` (pełna strona SSG). Slot równoległy `@modal` w `layout.tsx` + `@modal/default.tsx`.
- Treść oferty wydzielona do `PropertyDetailContent` (wspólna dla panelu i strony). Panel-overlay = `PropertyModal` (animacja wjazdu/blur, zamykanie przez `router.back()`, Escape, klik w tło).
- Nowe podstrony: `/oferty` (+`OfertyBrowser`), `/o-mnie`, `/kontakt`, `not-found.tsx`.
- `PropertyCard` → `<Link>`; usunięto `onPropertyClick` z całego łańcucha; usunięto stary `PropertyDetailPanel`.
- Nawigacja Header/Footer na `next/link` (realne trasy). `ContactForm` z opcjonalnym `propertyTitle` (działa też jako ogólny formularz). `next.config.js`: `images.qualities=[75,90]`.

**Weryfikacja (dev + build)**
- `npm run build` → OK: 8 ofert prerenderowanych (SSG), `/oferty` `/o-mnie` `/kontakt` statyczne, intercept jako route dynamiczny.
- Runtime (preview): klik z listy → panel-overlay nad homepage, URL `/oferta/[slug]`, scroll zablokowany, lista pod spodem (✓ intercepting). Bezpośrednie wejście na `/oferta/[slug]` → pełna strona (nie modal) z tytułem w `<title>` i meta-description (✓ SEO). `/oferty`, `/o-mnie`, `/kontakt`, 404 — wszystkie renderują poprawnie.
- ⚠️ Animacji GSAP nie dało się potwierdzić wizualnie w preview: karta jest ukryta (`document.hidden=true`) → `requestAnimationFrame` wstrzymany → GSAP zamrożony. To artefakt środowiska, nie błąd; w realnej przeglądarce działa. Do potwierdzenia „na oko" w zwykłym oknie.

### Uwagi / dług na później
- Nawigacja `O mnie`/`Usługi` wskazuje na `#about`/`#services`, które jeszcze nie istnieją (no-op) → realne trasy w **Fazie 2**.
- `SplitText` (`gsap/all`) — zweryfikować licencję/działanie w produkcji (**Faza 5**).
- Formularz nadal symuluje wysyłkę (**Faza 4**).

---

## Rebranding — Peritus Nieruchomości (identyfikacja wizualna) ✅ ZROBIONE
Cel: dopasować szablon do marki **PERITUS NIERUCHOMOŚCI** (logo `logo-pn`, `logo-pn2`).
Paleta firmy: **beż + pomarańcz**. Strona zostaje ciemna, ale ocieplona.

**Kierunek designu**
- Baza: ciepła głęboka czerń (espresso `#14100B`) zamiast zimnej `#0E0E0E`.
- Akcent akcji (przyciski, ceny, aktywne stany, linie): **pomarańcz** `#E9821E` z logo.
- Neutralne ciepłe (tekst drugorzędny, subtelne tła/bordery): **beż/taupe**.
- Tekst główny: kremowa biel `#F4ECDE` zamiast zimnej `#F5F5F5`.

**Nowe tokeny (`tailwind.config.ts`)**
- `background #14100B`, `secondary-dark #1A1610`, `card-bg #1F1912`, `panel-bg #1A1510`
- `text-primary #F4ECDE`, `text-secondary #A99B84`
- `accent #E9821E`, `accent-soft #F3A24E`, `accent-strong #D06E12`
- `beige #D9C4A3`, `beige-muted #8A7C64`, `shadow-glow` (poświata pomarańczu)

**Zmiany**
- `globals.css`: ciepły radial-gradient tła, pomarańczowe `::selection`, ciepły scrollbar, ocieplone `.glass`, util `.text-gradient-brand` (pomarańcz→beż).
- **Logo:** w Header i Footer ikona `logo-pn` na beżowym kaflu (zgodnie z materiałami marki — ciemny napis pełnego logo byłby niewidoczny na ciemnym tle) + wordmark „PERITUS" (kremowy) / „NIERUCHOMOŚCI" (pomarańcz) złożony typografią serwisu. Favicon: `app/icon.png` z ikony.
- **Hero:** eyebrow „Peritus · Nieruchomości" (pomarańcz) + hasło „Nieruchomości, które **mają znaczenie**" (gradient marki) + podtytuł; gradient tła zaktualizowany do nowego `#14100B`; drop-shadow nagłówka dla czytelności na jasnym zdjęciu. **Zdjęcie tła** → własny render marki `public/hero.png` (willa z trawertynu, złota godzina, morze) zamiast stocku Unsplash — spójne z paletą beż/pomarańcz. Jeden poziomy kadr na desktop i mobile (mobile do podmiany na 9:16, gdy powstanie).
- **Header:** tło zmienione z jasnego szkła (`rgba(255,255,255,0.05)`) na ciemne ciepłe (`rgba(20,16,11,0.55)` + blur) — nawigacja i logo są teraz czytelne także na jasnym niebie zdjęcia hero; border → `beige/10`.
- **Marka:** metadata (`layout.tsx`), Footer, copyright → „Peritus Nieruchomości"; domena e-mail → `peritus.pl` (Footer, `/kontakt`, 8 agentów w `properties.json`).
- **Akcenty:** aktywne filtry i selektory (FilterBar) → pomarańcz; hover „Szczegóły" na karcie → pomarańcz; statystyki `/o-mnie` → gradient marki. Cena, kropki cech, wskaźnik galerii → pomarańcz (przez token `accent`).
- Ostatni angielski placeholder (`your@email.com` → `twoj@email.pl`).

**Weryfikacja**
- `npx tsc --noEmit` → 0 błędów.
- Preview (dev): strona główna, `/o-mnie`, `/kontakt`, `/oferty`, `/oferta/[slug]` renderują poprawnie po polsku; `bodyBg = rgb(20,16,11)`; cena `4 850 000 zł` i kropki cech = `rgb(233,130,30)` (pomarańcz); Footer = „Peritus Nieruchomości" + `kontakt@peritus.pl`; brak błędów w konsoli.
- ⚠️ Sekcje z animacją GSAP (fade-in Footer, SplitText tytułu oferty) bywają niewidoczne na screenshotach w headless-preview (`document.hidden` wstrzymuje rAF) — artefakt środowiska, nie błąd; potwierdzone przez odczyt DOM/computed styles.

**Do podmiany (placeholdery, bez zmian brandingu):** telefon/adres w Footer i `/kontakt`, „Jan Kowalski", zdjęcie i bio agenta, linki społecznościowe — realne dane w **Fazie 4**.

### Iteracja po feedbacku właściciela (design)
- **„Za pomarańczowo"** → pomarańcz zredukowany do akcentu: aktywne przyciski filtrów (sypialnie/piętra) i ich stany z pomarańczu na **beż**; `saturate` w szkle FilterBar 180–190% → **115%** (ciepłe tło zdjęcia nie przebija już pomarańczem przez glass); radialny blask tła stonowany (0.08→0.05). Pomarańcz zostaje tylko na: cenie, haśle hero, eyebrow, aktywnym tabie kategorii.
- **Ciemniejsze tło:** `background #14100B → #0F0B06` (+ secondary/card/panel proporcjonalnie), `body` i gradient hero zaktualizowane.
- **Zanikanie hero (naprawa „odcięcia" przy scrollu):** kluczowa zmiana — gradient wyjęty z warstwy parallax → **statyczny** (zawsze pokrywa dół sekcji aż do koloru tła, niezależnie od pozycji obrazu). Obraz dostał zapas wysokości + łagodniejszy parallax `0.4 → 0.22`. (Scroll w headless-preview zawodny przez GSAP ScrollTrigger — stąd weryfikacja geometryczna zamiast wideo.) _(Właściciel dostroił potem: osobny kadr mobilny `hero-mobile.png` 9:16 + `h-[110%]`.)_

### Zmiany funkcjonalne + brand (2. iteracja właściciela)
- **Kategorie filtrów** → docelowe: Wszystkie / **Domy** / **Mieszkania** / **Lokale** (wartości `house`/`apartment`/`commercial` bez zmian). Etykiety typu na kartach/szczegółach ujednolicone (Mieszkanie / Lokal).
- **Filtr „Styl" → „Cena":** nowy typ `PriceRange` (5 progów: każda / do 2 mln / 2–3,5 / 3,5–5 / powyżej 5 mln zł), logika zakresu w `PropertyGrid`; `Filters.style`/`StyleType` usunięte. „Sypialnie" → **„Pokoje"** (etykieta UI; pole danych `bedrooms` bez zmian — minimal impact).
- **Jeden agent — Damian Rożewski** we wszystkich 8 ofertach (`data/properties.json`: name / `damian@peritus-nieruchomosci.pl` / `/damian.webp`); `/o-mnie` (imię + zdjęcie), Footer i `/kontakt` (e-mail + adres **Bobrownicka 44D/2, 61-306 Poznań**). Telefon = placeholder `+48 600 000 000` (do podania).
- **Logo (Montserrat):** wordmark w `next/font` Montserrat (600 „PERITUS" / 500 „NIERUCHOMOŚCI"), obie linie zrównane do tej samej szerokości (zmierzone 117 px = 117 px), mniejszy odstęp (`mt-0.5`). Kolory bez zmian.
- **Weryfikacja:** `tsc` 0 błędów; preview — kategorie/cena/pokoje działają, logika ceny pokrywa 8 ofert bez luk (3+2+3+0), Damian na `/o-mnie` i `/kontakt`, logo Montserrat równe.

**Nadal placeholder (do podania):** telefon Damiana, godziny otwarcia, „Jan Kowalski" (podpowiedź w polu formularza), linki social. `property.style` zostaje w danych/typie (nieużywane po zmianie filtra na cenę).

## Prawdziwe oferty z nieruchomosci-online.pl ✅ ZROBIONE
Cel: zastąpić 8 wymyślonych ofert realnymi ofertami agenta (profil: nieruchomosci-online.pl/agenci/damian-rozewski).

- [x] `scripts/sync-nieruchomosci-online.mjs` (`npm run sync:oferty`) — czyta profil agenta + każde ogłoszenie (JSON-LD, galeria `photos.x`, tabela szczegółów, pełny opis) → `data/properties.json`. Idempotentny; przy błędzie parsowania przerywa bez nadpisywania danych.
- [x] `types/property.ts`: nowy typ `plot` (działka), opcjonalne `sourceUrl`; usunięte nieużywane `style`
- [x] Filtry przestawione na realne widełki (cena do 400 tys. – 700 tys.+, metraż do 40 – 90+ m²), zakładka „Działki”; zakresy parsowane jedną funkcją `isInRange`
- [x] Karta/szczegóły ukrywają pola 0 (pokoje/łazienki działki, piętra domu bez danych)
- [x] Zdjęcia hotlinkowane z `i.st-nieruchomosci-online.pl` przez `next/image` (remotePatterns) — bez wrzucania ~50 MB do repo
- [x] Telefon agenta z portalu (+48 732 432 920); e-mail nadal placeholder

Review: `tsc` OK, `next build` OK (8 stron SSG), w przeglądarce: 8 kart, filtry typ/cena/metraż zwracają poprawne oferty, 0 zepsutych zdjęć, panel działki pokazuje tylko „Powierzchnia”, brak błędów w konsoli.

Synchronizacja (decyzja do podjęcia): portal nie ma publicznego API do odczytu — przyjmuje tylko importy z programów CRM. Opcje: (A) CRM jako źródło → eksport na portal + na stronę, (B) cykliczne uruchamianie skryptu (cron/GitHub Action + rebuild), (C) WordPress jako źródło → eksport XML na portal.
