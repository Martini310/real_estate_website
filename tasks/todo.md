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

**Decyzje właściciela (2026-10-10):**
- Źródło ofert = **portal nieruchomosci-online.pl** (Damian dodaje tylko tam) → **WordPress sam importuje raz dziennie**; w WP: ukryj / wyróżnij ofertę (importer tych flag nie nadpisuje).
- Next.js na **Vercelu**; WordPress na **TLD.pl** pod **cms.peritus-nieruchomosci.pl**.
- Hosting TLD.pl: nginx + PHP, domena **bez własnego certyfikatu SSL** (zwraca `*.tld.pl`) → włączyć Let's Encrypt dla domeny i subdomeny `cms`.

**Plan**
- [x] Wtyczka `wordpress/peritus-core` (PHP ≥ 7.4, bez zależności od ACF/WPGraphQL):
  - [x] CPT `peritus_offer` (panel, bez publicznych stron WP) + pola meta (źródło, cena, metraż, pokoje, łazienki, kondygnacje, rok, typ, lokalizacja, galeria, cechy) + ręczne flagi „Wyróżniona” / „Ukryta”
  - [x] Importer = port `scripts/sync-nieruchomosci-online.mjs` do PHP: upsert po ID ogłoszenia; oferty zdjęte z portalu → szkic; błąd parsowania → przerwanie bez zmian
  - [x] Harmonogram: WP-Cron raz dziennie + przycisk „Importuj teraz” + log ostatniego importu w panelu
  - [x] REST `GET /wp-json/peritus/v1/offers` → dokładnie typ `Property` (jeden kontrakt, jedno zapytanie)
  - [x] Po zmianie ofert → webhook do Next (`/api/revalidate`) z sekretem
- [x] Next: `lib/properties.ts` asynchronicznie z WP (`WORDPRESS_API_URL`, cache + tag `offers`), walidacja odpowiedzi, **fallback na `data/properties.json`** przy braku/awarii WP; wszystkie wywołania `await`
- [x] Next: `app/api/revalidate/route.ts` (sekret `REVALIDATE_SECRET`), `.env.example`
- [x] Lokalnie: `wordpress/docker-compose.yml` (WordPress + MariaDB) → test importu i strony na danych z WP
- [x] Instrukcja wdrożenia `tasks/wdrozenie.md`: TLD.pl (subdomena, SSL, WP, wtyczka, stałe w `wp-config.php`, prawdziwy cron), Vercel (projekt, zmienne, domena, DNS)

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

---

## Audyt UX/UI — plan poprawek (2026-10-10)
Pełny raport z uzasadnieniami: [`tasks/audyt-ux-ui.md`](audyt-ux-ui.md) (ID w nawiasach → sekcje raportu). Zrzuty: `tasks/audyt/`.

### Decyzje właściciela (2026-10-10)
- [x] **Zdjęcie hero** — wymieniamy; generacja w Nano Banana (prompt: `tasks/hero-prompt.md`) (H1, H10)
- [x] **Głos marki** — „ja” (C4)
- [x] **Hasło hero** — wariant A: eyebrow „Poznań i okolice” / „Spokojna sprzedaż i zakup nieruchomości” (C3)
- [x] **Statystyki „O mnie”** — 10 lat doświadczenia, 150+ sprzedanych; „98% zadowolonych” → „1 opiekun przez całą transakcję” (C5) — wdrożone
- [x] **Parallax ZOSTAJE** (hero + karty) — dopracować, nie usuwać (zmienia A2, zob. Etap 4)
- [x] **Panel oferty na desktopie** — wariant B (arkusz z prawej), szerokość płynna `clamp(820px, 70vw, 1200px)` zamiast sztywnych 960 px — wdrożone w Etapie 1 (U11)
- [ ] Prawdziwy e-mail, realne usługi i profile social (U2, C14, C15)

### Etap 0 — Szybkie poprawki (bez zmian koncepcji, ~1 dzień)
- [x] Zamienić 13× `border-white/8` / `bg-white/3` na poprawny token (S1)
- [x] Załadować Inter przez `next/font` (latin-ext) + `fontFamily.sans` w Tailwind (T1)
- [x] Telefon/e-mail/adres → `lib/site.ts` (`siteConfig`), użyć w Footer, `/kontakt`, AgentCard (U2)
- [x] Cena + lokalizacja na karcie oferty (U1)
- [x] Formatowanie PL liczb (`69,2 m²`) — wspólny helper `lib/format.ts` (R5)
- [x] Usunąć „Piętra” z karty/filtra dla mieszkań do czasu pola `floor` (U8)
- [x] Ukryć martwe linki social, nieklikalny hover w „Usługi” (U14, C15)
- [x] `priority` tylko na hero (jeden wariant) + `gsap/SplitText` zamiast `gsap/all` (P1, P2, P3)

### Etap 1 — Fundament systemu designu
- [x] Tokeny w `tailwind.config.ts`: `line`, `surface`, typografia (`display/h1/h2/h3/body/small/eyebrow`), promienie (`xl` kontenery/karty, `lg` kontrolki), cienie `e1/e2`; usunąć martwe tokeny/utility (S2–S7, T2)
- [x] Komponenty: `Button` (primary/secondary/ghost, 48 px), `Container`, `Field` (S5, T4) — `Section` celowo przy Etapie 2 (dopiero tam powstają sekcje strony głównej)
- [x] Neutrale wyłącznie z beżu (bez `white/x`), pomarańcz = akcja + cena (S3, S4)
- [x] Globalny focus-visible (pierścień beżowy 2 px + offset) (a11y #1)

### Etap 2 — Hero i strona główna
- [x] Hero wg §1.3: 88svh, wyrównanie do lewej, nowy scrim (2 warstwy), eyebrow lokalizacji, H1 + `<p>`, 2 CTA, bez filtrów, placeholder blur, art direction `getImageProps` (H2–H12)
- [x] Header: CTA „Zadzwoń” (desktop numer, mobile ikona) (U3)
- [x] Sekcja „Aktualne oferty”: nagłówek + licznik, zakładki z liczbami (ukryte puste), cena/metraż + sortowanie, stan pusty z CTA leadowym (U7, U10, T5, M1) — „Zobacz wszystkie” pominięte: przy 8 ofertach strona główna pokazuje wszystkie; limit dodać, gdy WP przyniesie więcej
- [x] Sekcja „O mnie” (skrót) (U13) — zdjęcie nadal 276 px (pokazane maks. 240 px); **potrzebne zdjęcie ≥800 px**
- [x] Pas „Sprzedajesz? Bezpłatna wycena” + krótki formularz (U6)
- [x] `page.tsx` jako Server Component; do klienta tylko dane kart (P4)

### Etap 3 — Karta i strona oferty
- [x] Nowy wzorzec karty §12.1 (treść pod zdjęciem, 4:3, `line-clamp-2`, stała affordance, `alt=""`) (R1, R2, U9, M2, a11y #11)
- [x] Oferta: cena 28–32 px + zł/m², pasek parametrów (2 kol. mobile), sticky prawa kolumna (desktop) / sticky bar „Zadzwoń | Umów prezentację” (mobile) (U4, R6, M3, M4)
- [x] Galeria: swipe (scroll-snap), ←/→, licznik zamiast kropek >8, przyciski na ciemnym kole, „✕ Zamknij” w prawym górnym rogu, prawdziwy crossfade (U12, R7, A6)
- [x] Formularz: + telefon, domyślna treść, trwały sukces w `aria-live`, copy C7–C10 (U5) — **zgoda RODO → Faza 4** (wymaga strony polityki i treści prawnej)

### Etap 4 — Ruch i dostępność
- [x] `gsap.matchMedia` + CSS dla `prefers-reduced-motion` (A1)
- [x] **Dopracowanie parallaxu (zostaje — decyzja właściciela):**
  - [x] `scrub: 0.6` zamiast `true` (miękkie „dociąganie” zamiast sztywnego 1:1 — płynniej, bardziej premium)
  - [x] Ruch przez `yPercent` (±7% warstwy) zamiast stałych ±40 px → ta sama głębia na każdym breakpoincie (Etap 3, przy nowej karcie)
  - [x] `ScrollTrigger.refresh()` po zmianie filtrów (Etap 2); refresh po załadowaniu obrazów **niepotrzebny** — karty mają stałą proporcję (`aspect-[3/2]`), hero `min-h`, więc ładowanie zdjęć nie przesuwa układu
  - [x] Hero: zapas obrazu (`h-[110%]`) mniejszy niż przesunięcie (22% wysokości) → pod koniec sekcji dół zdjęcia odsłania się pod scrimem (dziś niewidoczne, bo scrim ~0,93). Zgrać: `h-[125%]` albo współczynnik 0,1
  - [x] Hero: warstwowa głębia — tekst przesuwa się i wygasza szybciej niż zdjęcie (2 prędkości = efekt 3D)
  - [x] Hover karty: zoom tylko zdjęcia (1.04), bez skalowania całej karty (Etap 3; `initCardHover` usunięte)
  - [x] `gsap.matchMedia`: pełny efekt desktop, mniejsza amplituda na dotyku, statycznie przy reduced-motion
- [x] Panel: wejście 550 ms / wyjście 350 ms; header 300 ms; bez SplitText (A3, A4, A7)
- [x] Reveal bez migotania (nad zgięciem bez animacji, poniżej — wejście przy przewinięciu) (A5)
- [x] Modal: fokus do panelu, tło `inert` (zamiast ręcznego focus-trapu — jak natywny `<dialog>`), `aria-labelledby` = tytuł, fokus wraca na kartę (a11y #2, #13)
- [x] `htmlFor` w filtrach, `aria-pressed`, `aria-expanded` w menu, cele ≥44 px (pokoje 44 px, zakładki ~40 px wysokości), skip link (a11y #5–8, #14)

### Etap 5 — Wydajność i weryfikacja
- [x] `backdrop-filter` usunięty z powtarzalnych elementów (przyciski filtrów, plakietki kart, przyciski galerii); zostaje na 4 pojedynczych (header, CTA w hero, pasek na telefonie, „do góry”). Blur `#properties` zostaje — od wariantu B panelu jest widoczny (P5, P6)
- [x] `images.formats` AVIF/WebP, quality 80 (hero) / 75; hero JPEG 3840 px; zdjęcia ofert 2048 px (P7, P8)
- [x] Bez `background-attachment: fixed` — poświata ograniczona do 100vh (Etap 2) (P9)
- [x] Lighthouse (prod build): mobile Performance 94–100 (pomiar rzeczywisty), A11y 100, BP 100, SEO 100 na 5 stronach; testy 375/1024/1440/1920; klawiatura — **VoiceOver do sprawdzenia ręcznie**
- [x] Zdarzenia konwersji (`click_phone`, `click_email`, `submit_lead` + `source`) → `window.dataLayer`; GTM/GA4 + zgoda cookie → Faza 4 (U15)

### Etap 6 — Treści
- [x] Meta title/description i teksty stopki zgodne z realną ofertą + lokalne SEO (C1, C2)
- [x] Ujednolicony głos, copy formularzy, `/oferty` z licznikiem, „Filtry (n)” (C4, C8–C13)

### Review — Etap 0 (2026-10-10)
**Zmiany**
- `tailwind.config.ts`: token `line` (ciepła linia z beżu) + `fontFamily.sans` → Inter. `globals.css`: `font-sans` zamiast nieładowanego `'Inter'`.
- `app/layout.tsx`: Inter przez `next/font` (latin-ext), obok Montserrat (logo).
- 13× `border-white/8`/`bg-white/3` → `border-line`/`bg-beige/[0.03]` (formularze, karta agenta, separatory oferty, `/o-mnie`, `/kontakt`).
- Nowe: `lib/site.ts` (`siteConfig`: telefon +48 732 432 920, e-mail, adres, godziny) — użyte w Footer i `/kontakt`; `lib/format.ts` (`formatPrice`, `formatNumber`, `formatArea`, `formatRooms` z polską odmianą).
- `PropertyCard`: cena (accent-soft) + lokalizacja + „3 pokoje · 63,6 m²”; usunięte mylące „Piętra” i `priority` pod linią zgięcia.
- Filtr „Piętra” usunięty z `FilterBar`/`Filters`/`PropertyGrid`/stanów początkowych.
- Hero: `<picture>` + `getImageProps` — pobierany tylko kadr pasujący do ekranu, `fetchPriority="high"`.
- `PropertyDetailContent`: wspólny `formatPrice`, „69,2 m²”, import `gsap/SplitText`.
- Footer: bez martwych linków social, bez fałszywego hovera w „Usługach”. `/o-mnie`: statystyki i bio wg danych właściciela (bez „rynku premium w największych miastach”).

**Weryfikacja**
- `tsc --noEmit` 0 błędów; `next build` (kopia w scratchpad, bez dotykania `.next` serwera dev) OK — 8 ofert SSG.
- Przeglądarka: ramki = `rgba(217,196,163,.12)`; Inter załadowany; karty pokazują cenę/lokalizację/„69,2 m²”; preload obrazów = tylko logo; mobile 375 px pobiera wyłącznie `hero-mobile`; stopka/kontakt z prawdziwym telefonem; brak błędów w konsoli.
- **Korekta audytu P3:** bundle produkcyjny przed/po identyczny (816 KB) — Turbopack i tak tree-shake'ował `gsap/all`.

### Review — Etap 1 + panel B (2026-10-10)
**System designu (`tailwind.config.ts`)**
- Kolory: usunięte martwe `secondary-dark`, `accent-strong`, `beige-muted`, `shadow-glow`; nowe `line` / `line-strong` (linie z beżu).
- Typografia: `display`, `h1` (płynne `clamp`), `h2`, `h3`, `body`, `small`, `eyebrow` (0,2em) + `font-brand` (Montserrat: logotyp, eyebrow, nagłówki stopki).
- Promienie: `card` 12 px (header, panel filtrów, karty ofert, karty „O mnie”/„Kontakt”, zdjęcie agenta), `control` 8 px (przyciski, pola, pigułki, kafel logo). Cienie: `e1`, `e2`.
- `globals.css`: globalny `:focus-visible` (beż 2 px, kontrast 11,6:1), `scrollbar-gutter: stable` (lista nie skacze przy otwartym panelu), usunięte nieużywane `.glass*`.

**Komponenty (`components/ui/`)**
- `Button` / `ButtonLink` / `buttonClasses` — primary (pełny pomarańcz, tekst espresso 7,2:1), secondary (beżowy obrys), ghost; 48/44 px. Użyte: formularz, karta agenta (prawdziwe linki `tel:`/`mailto:` zamiast `window.location`), „O mnie”, 404 (primary = „Przeglądaj oferty”), „Wyczyść filtry”.
- `Container` — jedna szerokość i margines: header, stopka, siatka, filtry, podstrony. Header i siatka mają teraz identyczne krawędzie (144–1296 px przy 1440); naprawiony podwójny margines siatki na `/oferty`.
- `Field` — etykieta powiązana przez `useId` (unikalne id — formularz może wystąpić w panelu i na podstronie), placeholder 4,65:1 (było 2,4:1), ramka `line-strong`.

**Porządki**
- 0 tintów `white/x` na powierzchniach; style inline (header, stopka, filtry, back-to-top) → tokeny. FilterBar: rozmycie tylko na panelu (wcześniej osobny `backdrop-filter` na każdym przycisku), `<label htmlFor>` przy selectach, `aria-pressed` na zakładkach i pokojach, przyciski pokoi 40 px.
- Pomarańcz ograniczony do akcji + ceny (+ aktywna zakładka, logo): eyebrow, statystyki „O mnie”, 404, kropki galerii i cech → beż; górna linia stopki → `line-strong`.
- Hierarchia nagłówków: stopka `h4` → `h2`, karta agenta `h4` → `h3`. Menu mobilne: `aria-expanded`/`aria-controls`, cel 44 px.

**Panel B (`PropertyModal`)**
- Osobno: tło (fade 0,4 s, klik zamyka) i arkusz (wjazd z prawej). Desktop ≥1024: `clamp(820px, 70vw, 1200px)` → 820 px przy 1024, 1008 przy 1440, 1200 przy 1920; po lewej widoczna rozmyta lista. Mobile/tablet: pełny ekran.
- „✕ Zamknij” w prawym górnym rogu (zamiast chevronu mylonego z „poprzednie zdjęcie”), przyciski galerii na ciemnym półprzezroczystym kole, galeria 62vh w panelu (80vh na podstronie), `sizes` dopasowane do szerokości panelu.

**Weryfikacja**
- `tsc` 0 błędów; `next build` (kopia) OK — 812 KB JS, 36 KB CSS.
- Przeglądarka: panel 820/1008/1200/375 px przy 1024/1440/1920/375; zamykanie klikiem w tło, „Zamknij” i Escape → powrót na `/`, pozycja scrolla zachowana (700 → 700), blur listy zdjęty; focus z klawiatury widoczny (outline beż 2 px); etykiety ↔ pola powiązane; brak błędów w konsoli (poza celowym 404).
- ⚠️ Świadome odstępstwo: ramki pól 1,9:1 (WCAG 1.4.11 zaleca 3:1). Pola są rozpoznawalne po etykiecie, wypełnieniu i focusie; pełne 3:1 wymagałoby beżu ~45% (jasne, „ciężkie” ramki). Do decyzji, jeśli celujemy w ścisłe AA.
- Hero celowo bez zmian wizualnych (poza `Container`) — przebudowa w Etapie 2.

### Review — Etap 2: hero i strona główna (2026-10-10)
**Struktura strony głównej** (`app/page.tsx` → Server Component): Hero → Aktualne oferty (`#oferty`) → O mnie (skrót) → Sprzedajesz? (`#wycena`) → stopka.

**Hero (`components/Hero.tsx`)**
- Nowe zdjęcia właściciela: `public/hero.jpg` (2000×1125) i `public/hero-mobile.jpg` (1125×2000); stare PNG usunięte. Statyczny import → wymiary + rozmyty placeholder z builda (zweryfikowane: przed załadowaniem widać ciepły zarys zamiast czerni).
- Wariant A: eyebrow „Poznań i okolice” (Montserrat, beż), H1 „Spokojna sprzedaż i zakup nieruchomości” (`text-display`, 400), podtytuł w głosie „ja”, CTA „Zobacz oferty” (primary → `#oferty`) + „Bezpłatna wycena” (secondary → `#wycena`). Wyrównanie do lewej na wszystkich ekranach, 88svh, bez filtrów, bez gradientowego tekstu (utility `.text-gradient-brand` usunięte).
- Scrim tylko pod tekstem: od dołu (mobile wyżej, bo tekst zajmuje więcej kadru) + od lewej (desktop). Parallax bez zmian (decyzja właściciela).

**Header:** telefon jako CTA — desktop „+48 732 432 920” (md: „Zadzwoń”), mobile ikona 44 px obok menu.

**Oferty (`OfertyBrowser` — wspólny dla `/` i `/oferty`)**
- Logika w `lib/filters.ts` (filtr + sortowanie + liczniki), `PropertyGrid` tylko renderuje/animuje + `ScrollTrigger.refresh()` po zmianie listy.
- Zakładki z liczbami („Mieszkania (6)”), puste ukryte („Lokale”), kolejność wg liczności, poziomy scroll bez paska na mobile. Panel filtrów bez rozmycia (stoi na ciemnym tle). Mobile: „Filtry (n)”. „Wyczyść filtry” tylko gdy coś aktywne.
- Pasek wyników: „Pasujące oferty: 1 z 8” (aria-live) + „Sortuj” (polecane / cena ↑ / cena ↓ / powierzchnia).
- Stan pusty: komunikat + „Wyczyść filtry” + „Powiadom mnie o ofercie” (→ `/kontakt`).
- Do przeglądarki tylko `PropertyCardData` (`getPropertyCards`).

**Nowe sekcje:** `AboutTeaser` (zdjęcie, 3 statystyki z `siteConfig.stats` — jedno źródło z `/o-mnie`, „Poznaj mnie bliżej”), `ValuationSection` (2 pola: lokalizacja + telefon, „Zamów bezpłatną wycenę”, numer telefonu jako alternatywa). Wspólne: `SectionHeading`, `useLeadSubmit` (jedno miejsce na podpięcie API w Fazie 4; `source`: kontakt/oferta/wycena), `formatOffers`/`plural`.

**Naprawione błędy wykryte w trakcie**
- 🔴 Kotwice `#oferty`/`#wycena` jako zwykłe `<a>` tworzyły wpis historii bez stanu routera Next → „wstecz” z oferty zostawiał zamontowany panel (niewidoczny) i **blokował scroll strony**. Fix: `ButtonLink` kieruje kotwice przez `next/link`; martwe `href="#"` w stopce zamienione na tekst. Zweryfikowane: `/` → „Zobacz oferty” → oferta → wstecz = panel zamknięty, scroll odblokowany.
- Panel przywraca pozycję listy po zamknięciu (wcześniej powrót na `/#oferty` przewijał do kotwicy: 1330 → 3737 px; teraz 1396 → 1396).
- Pozioma „szwa” pod hero: poświata `body` z `background-attachment: fixed` → ograniczona do 100vh i bez `fixed` (przy okazji P9).
- „Wyświetlono 1 oferta” (zły przypadek) → „Pasujące oferty: 1 z 8”.

**Weryfikacja**
- `tsc` 0 błędów; `next build` OK. Strona główna: **opisy ofert nie trafiają już do JS** (wcześniej osobny chunk 50 KB z pełnym `properties.json`); JS łącznie 816 → 788 KB.
- Przeglądarka 1440 / 375: hero (pobierany tylko właściwy kadr), filtry/sortowanie/stan pusty/reset, kotwice z `scroll-mt` (sekcja 96 px od góry), formularz wyceny (symulacja, `source: wycena`), panel oferty z nowej sekcji (otwarcie, blur, Escape, „Zamknij”, wstecz), krawędzie `/oferty` (h1 = zakładki = siatka = 144 px), brak błędów w konsoli po przeładowaniu.

**Do potwierdzenia / otwarte**
- Czy wycena jest faktycznie bezpłatna i czy 3 punkty w sekcji „Sprzedajesz?” opisują realny zakres usługi (`ValuationSection` → `BENEFITS`, TODO).
- Zdjęcia hero mają 2000 px (cel ≥2560) — jeśli są większe oryginały, podmienić pliki w `public/` (kod bez zmian). Zdjęcie Damiana ≥800 px.
- Meta title/description i tekst w stopce nadal o „rynku premium/luksusowych” → Etap 6.

### Review — Etap 3: karta i strona oferty (2026-10-10)
**Karta oferty (`PropertyCard`)** — wzorzec §12.1: zdjęcie 3:2 (proporcja zdjęć z portalu) z **parallaxem** (zachowany, teraz w `yPercent` ±7% warstwy 120% → nigdy nie odsłania krawędzi), plakietka typu, pod zdjęciem: lokalizacja → tytuł (`line-clamp-2`) → „3 pokoje · 63,6 m² · 9 418 zł/m²” → cena + stała wskazówka „Zobacz ofertę →” (działa też na dotyku). Hover: zoom samego zdjęcia (osobna warstwa, nie koliduje z parallaxem) + beżowy tytuł. `alt=""` (nazwa linku z tekstu). Siatka 2 kolumny z większymi odstępami.

**Strona/panel oferty (`PropertyDetailContent`)**
- Eyebrow typu („Dom”), H1, lokalizacja; **blok ceny**: 32 px + zł/m²; ≥1280 px przyklejona prawa kolumna z „Umów prezentację” (przewija do formularza bez kotwicy w adresie + fokus w pierwszym polu) i numerem telefonu; <768 px **przyklejony pasek „Zadzwoń | Umów prezentację”** (`sticky`, bo `fixed` w przekształconym panelu przewijałby się z treścią).
- Parametry jako `<dl>` 2/4 kolumny (+ „Rok budowy”, gdy jest), cechy jako `<ul>`, sekcje `<section>`.
- **Galeria (`PropertyGallery`)**: pas scroll-snap (natywny swipe), strzałki ukrywane na krańcach, ←/→ z klawiatury (poza polami formularza), licznik „3 / 16” (aria-live), kropki tylko ≤8 zdjęć (cel dotykowy 24 px), lazy-load poza pierwszym zdjęciem. Usunięty crossfade „przez czerń”.
- **Formularz**: imię, **telefon (wymagany)**, e-mail (opcjonalny), wiadomość wstępnie wypełniona nazwą oferty; przycisk „Umów prezentację” (na `/kontakt`: „Wyślij wiadomość”); komunikaty w głosie „ja” z alternatywą telefoniczną przy błędzie.
- `AgentCard`: numer telefonu widoczny na przycisku (na komputerze `tel:` często nic nie otwiera); wspólna `PhoneIcon`.
- Ceny zawsze z grupowaniem tysięcy („7 900 zł/m²” zamiast „7900”), etykiety typów w jednym miejscu (`formatPropertyType`).

**Zdjęcia**: hero 3840×2160 / 2160×3840 (od właściciela); `damian-4k.jpg` (3840²) z rozmytym placeholderem — sekcja „O mnie” na stronie głównej pokazuje teraz duży portret 4:5, `/o-mnie` ostre zdjęcie.

**Korekta audytu P7**: zdjęcia ofert z portalu mają 2048×1365 (wariant `x`), nie 720 px.

**Weryfikacja**: `tsc` 0; `next build` OK (JS 796 KB, +8 KB za galerię); przeglądarka 1440 / 375: karta, sticky kolumna ceny w panelu, „Umów prezentację” → formularz z fokusem i gotową treścią (adres bez zmian), galeria (klik, 3× → = „4 / 16”, ←), pasek na dole telefonu (44 px, bez łamania tekstu) w panelu i na podstronie, zdjęcia Damiana ostre; brak błędów serwera/konsoli.

**Otwarte**: zgoda RODO (Faza 4); lightbox / pełny ekran galerii (opcjonalnie); w opisach z portalu jest „Licencja zawodowa nr 23975” — do rozważenia jako element zaufania na stronie (decyzja właściciela).

### Review — Etap 4: ruch i dostępność (2026-10-10) + licencja
**Licencja / treści:** `siteConfig.role` + `siteConfig.license` („Licencja zawodowa nr 23975” — sformułowanie z ogłoszeń Damiana) w „O mnie” (strona główna: plakietka pod opisem; `/o-mnie`: pod imieniem) i w stopce; karta agenta: „Pośrednik w obrocie nieruchomościami”. Punkty sekcji „Sprzedajesz?” i bezpłatna wycena — potwierdzone, TODO usunięte.

**Animacje (`lib/animations.ts`)** — wszystkie przez `gsap.matchMedia` z warunkami `reduce` / `touch` / pełny:
- **Parallax hero** (zostaje, dopracowany): `scrub: 0.6` (płynne dociąganie zamiast schodków przy kółku), zdjęcie −20% wysokości sekcji (dotyk −12%), zapas warstwy podniesiony 110% → **120%** → dolna krawędź nigdy się nie odsłania (zmierzone: szczelina od −158 px do 0, nigdy dodatnia). **Warstwowa głębia**: treść hero porusza się wolniej niż strona i wygasa do 80% wysokości sekcji (trzy prędkości: strona · treść · zdjęcie).
- **Parallax kart**: tween `yPercent` −7 → +7 (dotyk ±4) ze `scrub: 0.6`.
- **Ogranicz ruch**: GSAP nic nie animuje (zweryfikowane podmianą `matchMedia`: hero, treść i karty bez transformacji), CSS wyłącza przejścia/animacje i płynny scroll globalnie; panel oferty przy reduce: bez wjazdu i skalowania, tylko krótkie przenikanie.
- **Reveal bez migotania** (`initReveal`): element widoczny przy starcie nie jest animowany (na `/oferty` siatka nad zgięciem bez stylów inline), poniżej — wejście przy przewinięciu, z cleanupem (wcześniej `initFadeIn` bez sprzątania).
- `PropertyGrid`: naprawiona animacja kart odpalana też przy pierwszym renderze (flaga przestawiana przez pierwszy efekt) — teraz porównanie z poprzednią listą.
- Tytuł oferty: zamiast SplitText (słowo po słowie, 1,2 s) jedno wejście 0,5 s; JS 796 → **784 KB**.
- Header: chowanie/pokazywanie 1000 → 300 ms.

**Panel oferty — dostępność:** fokus przechodzi do panelu (`tabIndex=-1`, strzałki/spacja przewijają treść), nazwa dialogu = tytuł oferty (`aria-labelledby`), reszta strony `inert` (bez `<script>` i ogłaszacza tras), po zamknięciu fokus wraca na kartę. Zweryfikowane: Enter na karcie → panel; 30× Tab zostaje w panelu; Escape → `/`, fokus na tej samej karcie, `inert` zdjęte.

**Skip link** „Przejdź do treści” (`components/ui/SkipLink.tsx`): pierwszy Tab, przenosi fokus na `<main>` bez kotwicy w adresie (kotwica psułaby „wstecz” w panelu).

**Błąd złapany w weryfikacji:** `gsap.matchMedia` z obiektem warunków odpala funkcję tylko, gdy pasuje któryś z nich — bez warunku `all` parallax na zwykłym desktopie w ogóle by nie ruszył. Dodany `all: "all"` (+ wpis w `tasks/lessons.md`).

**Weryfikacja:** `tsc` 0; `next build` OK; przeglądarka (panel w tle → zegar GSAP pchany ręcznie `ticker.tick()`, bo ukryty panel wstrzymuje `requestAnimationFrame`): pozycje parallaxu hero/kart w 7 punktach scrolla, reduce-motion, klawiatura w panelu, skip link, brak migotania na `/oferty`, licencja w 3 miejscach. **Do sprawdzenia „na oko” w zwykłej przeglądarce:** płynność `scrub` i tempo wygaszania treści hero.

### Review — Etap 5 (wydajność) + Etap 6 (treści) + poprawki właściciela (2026-10-10)
**Uwagi właściciela**
- Licencja bez „pigułki” z ramką i ozdobnej kropki → zwykły tekst w hierarchii typograficznej („Pośrednik w obrocie nieruchomościami, licencja zawodowa nr 23975.”) w „O mnie”, `/o-mnie`, stopce; w zdaniu pod ceną oferty usunięte ozdobne „·”. Plakietka typu na karcie też wyciszona (bez ramki-pigułki i rozmycia). Reguła zapisana w `tasks/lessons.md` + pamięci.
- Panel oferty szerszy: `clamp(880px, 78vw, 1320px)` → 1123 px przy 1440 (było 1008), 1320 px przy 1920; `sizes` galerii dopasowane.

**Etap 5 — wydajność**
- `next.config.js`: AVIF + WebP; jakość hero 90 → 80 (mobile hero = 70 KB AVIF).
- `/oferty`: 2 pierwsze karty z `preload` (były lazy, a są elementem LCP) — LCP 3,2 → 2,0 s.
- `FilterBar` startuje zwinięty (desktop i tak widzi panel przez CSS) — koniec „skoku” po starcie JS: CLS na `/oferty` 0,119 → 0,001; zwinięte filtry na telefonie wyjęte z kolejności Tab (`invisible`).
- `backdrop-filter` tylko na 4 pojedynczych elementach.
- Zdarzenia konwersji: `lib/analytics.ts` (`track`) + `AnalyticsEvents` (jeden nasłuch na `tel:`/`mailto:`) + `submit_lead` w `useLeadSubmit`.

**Lighthouse (build produkcyjny, `next start`, Chrome headless)**

| Strona (mobile) | Perf. symulacja | Perf. pomiar (devtools) | LCP (pomiar) | CLS | A11y | BP | SEO |
|---|---|---|---|---|---|---|---|
| `/` | 85 | 94 | 2,9 s | 0 | 100 | 100 | 100 |
| `/oferty` | 86 | 99 | 2,0 s | 0,001 | 100 | 100 | 100 |
| `/oferta/…` | 88 | 98 | 2,3 s | 0 | 100 | 100 | 100 |
| `/o-mnie` | 91 | 99 | 1,6 s | 0 | 100 | 100 | 100 |
| `/kontakt` | 90 | 100 | 1,5 s | 0 | 100 | 100 | 100 |
| `/` desktop | 99 | — | — | 0 | 100 | 100 | 100 |

Uwaga: tryb symulacji Lighthouse przypisuje 69–91% LCP do „render delay” (szacunek przy 4× CPU); rzeczywisty pomiar pokazuje render delay 5–14 ms — wąskim gardłem jest transfer obrazów na wolnym 4G. Naprawione w trakcie: brak celu skip-linka (→ `#main` w layoucie), alt logo ≠ nazwa linku, liczniki zakładek 4,0:1 (→ pełny `text-secondary`), brak h2 na `/oferty` (sr-only „Lista ofert”), link telefonu w tekście tylko kolorem (→ podkreślenie), wordmark czytany jako „PERITUSNIERUCHOMOŚCI”.

Pozostałe sugestie Lighthouse (świadomie nie ruszane): ~47 KB „unused JS” (framework/GSAP — strona i tak TBT 0–10 ms), ~13 KB „legacy JS” (polyfille Next).

**Etap 6 — treści**
- Meta: „Peritus Nieruchomości — mieszkania, domy i działki w Poznaniu i okolicach” + opis o sprzedaży/zakupie, bezpłatnej wycenie i akcie notarialnym; Open Graph (`pl_PL`, nazwa serwisu). Opisy `/oferty`, `/kontakt` (głos „ja”), `/o-mnie` (licencja, 10 lat, 150+).
- Stopka: opis bez „luksusowych/prestiżowych”; usługi = tylko potwierdzone i **klikalne**: Zakup → `/oferty`, Sprzedaż i Bezpłatna wycena → `/#wycena`, Prowadzenie transakcji → `/o-mnie` (usunięte niepotwierdzone „Planowanie inwestycji”, „Zarządzanie nieruchomościami”).
- `/oferty`: „8 ofert w Poznaniu i okolicach.” zamiast instrukcji „kliknij ofertę”.
- 0 wystąpień „luksus/prestiż/nasz/nami/odpowiemy/dziękujemy” w kodzie UI.

**Zostaje na Fazę 3–4:** WordPress (dane), RODO (zgoda + polityka + strony prawne → podlinkować w stopce), baner cookie + GTM/GA4, obraz OG + `metadataBase` (gdy będzie domena), sitemap/robots/JSON-LD, VoiceOver — test ręczny.

### Review — Faza 3: WordPress headless (2026-10-10)
**Architektura:** portal → (import 1×/dzień) → WordPress `cms.peritus-nieruchomosci.pl` (TLD.pl, wtyczka `peritus-core`) → `GET /wp-json/peritus/v1/offers` → Next.js na Vercelu (ISR, tag `offers`) ← webhook `/api/revalidate` po zmianach.

**Wtyczka `wordpress/peritus-core`** (bez ACF/WPGraphQL; PHP ≥ 7.4):
- Typ „Oferta” (tylko panel; dodaje wyłącznie importer), dane z portalu tylko do odczytu, przełączniki **Wyróżniona / Ukryta** (import ich nie rusza), kolumny listy.
- Importer = port 1:1 skryptu Node (te same reguły i slugi). Najpierw parsuje wszystko, potem zapisuje (błąd → zero zmian); zdjęte z portalu → szkic; zmiany wykrywane hashem; ~1 s przerwy na ogłoszenie.
- REST w kształcie `Property`: wyróżnione pierwsze, potem kolejność z profilu agenta; ukryte i szkice pominięte.
- Webhook do Next ze wspólnym sekretem (stałe w `wp-config.php`), wstrzymany na czas importu, maks. 1 na żądanie.
- Panel: Oferty → Import z portalu (wynik, „Importuj teraz”, następny import, ostatnie odświeżenie strony, adres API).

**Next.js:** `lib/properties.ts` asynchronicznie z WP (`WORDPRESS_API_URL`), walidacja kształtu, przy buildzie awaria WP → `data/properties.json`; w działaniu błąd → Next serwuje ostatnią dobrą wersję. `app/api/revalidate` (sekret, `revalidateTag("offers", "max")`), `app/error.tsx` (strona błędu w stylu serwisu z telefonem), `.env.example`.

**Weryfikacja (lokalny WP w Dockerze + build produkcyjny Next)**
- Import realnych ofert: 8 utworzonych w 14 s; **API identyczne z `data/properties.json` pole po polu** (id, slugi, ceny, opisy, cechy, galerie, kolejność) — jedyna różnica `featured` (teraz ręczny przełącznik zamiast „2 najnowsze”).
- Ponowny import: 8 „bez zmian”, bez zbędnego webhooka. Symulacja zdjęcia 2 ofert z portalu → szkice (API 5), pełny import → przywrócone; flaga „Ukryta” przetrwała.
- Przełączniki w WP → webhook 200 → strona: ukryta oferta znika z listy i jej adres daje 404, odkryta wraca (200); wyróżniona wskakuje na pierwsze miejsce. Zły sekret → 401.
- **Błąd złapany testem:** `revalidateTag(..., { expire: 0 })` przy niedostępnym WP dawał 500 (pusty cache) → zmienione na `"max"` (stale-while-revalidate): przy wyłączonym WP strona i oferty dalej HTTP 200 na ostatniej dobrej wersji; po powrocie WP zmiany docierają.
- Build z wyłączonym WP (czysty cache): sukces, ostrzeżenie w logu, 8 ofert z JSON.
- Panel WP 7.1.3 / PHP 8.3: lista ofert, edycja (przełączniki + dane tylko do odczytu), strona importu i przycisk „Importuj teraz”; składnia wtyczki sprawdzona pod PHP 7.4.

**Ważne przy wdrożeniu (szczegóły: `tasks/wdrozenie.md`)**
- 🔴 **MX domeny wskazuje na samą domenę** → przed przełączeniem domeny na Vercel zmienić MX na `mail.peritus-nieruchomosci.pl`, inaczej przestanie działać poczta `@peritus-nieruchomosci.pl`.
- Domena bez własnego SSL (zwraca `*.tld.pl`) → Let's Encrypt dla `cms`; domenie głównej certyfikat wystawi Vercel.
- WP-Cron → prawdziwy cron w panelu TLD.pl (`DISABLE_WP_CRON` + wywołanie `wp-cron.php` co 15 min).
- Vercel Pro (użytek komercyjny); zmienne `WORDPRESS_API_URL`, `REVALIDATE_SECRET`.

**Lokalnie:** `wordpress/docker-compose.yml` (WP 7.1 / PHP 8.3 + MariaDB, port 8088, usługa `wpcli`), dane logowania admina w `wordpress/.wp-admin.local` (poza repo), instrukcja `wordpress/README.md`.

