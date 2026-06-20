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
