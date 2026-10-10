# Audyt UX/UI — Peritus Nieruchomości

**Data:** 2026-10-10 · **Gałąź:** `feat/real-offers` · **Zakres:** `/`, panel oferty (intercepting route), `/oferta/[slug]`, `/oferty`, `/o-mnie`, `/kontakt`, 404
**Metoda:** przegląd kodu (wszystkie komponenty + config) + test na żywo w przeglądarce (1440×900, 768×1024, 375×812), pomiary DOM i computed styles, kontrast wg WCAG 2.1, frameworki: *design critique*, *WCAG 2.1 AA accessibility review*, *UX copy review*.
**Poza zakresem:** treść opisów ofert (z portalu).

Zrzuty dowodowe: [`tasks/audyt/`](audyt/)

Waga: 🔴 krytyczne (psuje zaufanie / konwersję / dostępność) · 🟠 ważne (wyraźnie obniża jakość) · 🟡 drobne (szlif)

---

## 0. Podsumowanie dla decydenta

Strona ma dobry fundament: ciemna, ciepła paleta zgodna z logo, czysty routing, panel oferty z URL-em, sensowna warstwa danych pod WordPress. **Natomiast w obecnej formie nie sprzedaje** i ma kilka błędów, które od razu widać „na oko”:

1. **Hero obiecuje coś innego niż oferty.** Zdjęcie: śródziemnomorska willa z trawertynu nad morzem (render AI). Oferty: mieszkania 349–699 tys. zł w Koziegłowach, Luboniu, Środzie Wlkp. Do tego meta-tytuł „rynek premium”, w stopce „luksusowe domy, apartamenty i prestiżowe inwestycje”, w „O mnie” „rynek premium w największych miastach w Polsce”. Użytkownik przewija i widzi mieszkanie z meblościanką. Rozjazd obietnicy z rzeczywistością to najszybszy sposób na utratę zaufania. **To jest główny powód, dla którego hero „nie pasuje”.** Premium ma tu oznaczać jakość obsługi i prezentacji, a nie luksusowy segment.
2. **Hero jest wizualnie zamulony.** Wielostopniowy, brązowo-czarny gradient (15% → 35% → 80% → 97%) robi ze złotej godziny brudną sepię. Najlepszą część zdjęcia (basen i zachód słońca) zasłania pasek filtrów, a eyebrow i podtytuł wypadają na jasnym niebie przy kontraście ok. 1,3–1,6:1. Słowo „nieruchomości” pada w pierwszym ekranie **4 razy** (logo, eyebrow, H1, H2). Nie ma żadnego CTA.
3. **Karty ofert nie pokazują ceny ani lokalizacji.** To dwa najważniejsze kryteria wyboru. Do tego biały tytuł 48 px na jasnych zdjęciach wnętrz jest nieczytelny (ok. 1,4:1), a „Piętra: 1” przy mieszkaniu na 3. piętrze wprowadza w błąd.
4. **Błąd techniczny psuje spójność na podstronach:** klasy `border-white/8` i `bg-white/3` nie istnieją w skali Tailwind 3, więc **13 ramek** (formularze, karta agenta, separatory w ofercie, „O mnie”, „Kontakt”) renderuje się jasnoszarym `rgb(229,231,235)` zamiast subtelnej linii. Stąd „tani” wygląd formularza.
5. **Ścieżki kontaktu są słabe albo błędne:** telefon w stopce i na `/kontakt` to placeholder `+48 600 000 000`, choć w danych ofert jest prawdziwy `+48 732 432 920`. W nagłówku nie ma CTA, na mobile nie ma przyklejonego „Zadzwoń”, formularz nie ma pola telefonu, nie ma ścieżki dla sprzedających.
6. **Typografia nie jest tym, co zaprojektowano:** `font-family: 'Inter'` nie jest nigdzie ładowany, więc Mac pokazuje SF Pro, Windows Segoe UI, Android Roboto. Strona wygląda inaczej na każdym systemie.
7. **Dostępność:** brak widocznego focusu (selecty mają `focus:outline-none`, karty też go nie mają), modal bez focus-trapu, brak `prefers-reduced-motion`, cele dotykowe 30–36 px.

**Rekomendacja:** najpierw szybkie poprawki (błędy klas, font, telefon, cena na kartach), potem fundament systemu designu (tokeny + komponenty `Button`/`Container`/`Section`), a na nim przebudowa hero i strony głównej według sekcji 12. Ta kolejność unika robienia hero dwa razy, a WordPress wpina się potem w gotowe, spójne klocki. Plan z checklistą: `tasks/todo.md` → „Audyt UX/UI — plan poprawek”.

---

## 1. HERO — analiza szczegółowa

Zrzuty: [`01-hero-desktop.jpg`](audyt/01-hero-desktop.jpg), [`02-hero-przed-zaladowaniem.jpg`](audyt/02-hero-przed-zaladowaniem.jpg), [`05-hero-mobile.jpg`](audyt/05-hero-mobile.jpg)

### 1.1 Pierwsze wrażenie (2 sekundy)
- **Wzrok pada na:** pomarańczowy gradient „mają znaczenie”, potem na pasek filtrów. **Powinien paść na:** obietnicę (co, gdzie, dla kogo) i jeden przycisk.
- **Emocja:** „ciemno, mgliście, ładnie, ale nie wiem, co tu jest”. Nie wiadomo, że to biuro z **Poznania i okolic**, ani co mogę zrobić dalej.

### 1.2 Problemy

| ID | Problem | Waga | Uzasadnienie (UX/UI) |
|----|---------|------|----------------------|
| H1 | Zdjęcie (willa AI nad morzem) nie pasuje do portfela ofert ani do rynku lokalnego | 🔴 | Zasada *spełnionych oczekiwań*: hero to obietnica. Rozjazd z ofertami obniża wiarygodność („ściema”) i zwiększa współczynnik odrzuceń. Render AI rozpoznany przez klienta to dodatkowy minus dla zaufania do agenta. |
| H2 | Gradient zamienia złotą godzinę w szaro-brązową mgłę; przez górne 38% przyciemnia „na płasko” | 🟠 | Scrim powinien przyciemniać **tylko tam, gdzie jest tekst**. Teraz przyciemnia całe zdjęcie, a tekst i tak ląduje na jasnym niebie (stąd kontrast 1,3:1). Efekt „mokrej szyby” zamiast premium. |
| H3 | Eyebrow „PERITUS · NIERUCHOMOŚCI” powtarza logo; pomarańcz na jasnym niebie ≈1,3:1 | 🟠 | Redundancja zabiera miejsce na informację, a kontrast nie spełnia WCAG 1.4.3. Eyebrow powinien coś **dodawać**, np. lokalizację. |
| H4 | „Nieruchomości” 4× w pierwszym ekranie; H1 „Nieruchomości, które mają znaczenie” i H2 „Eksperckie doradztwo na rynku nieruchomości” są ogólnikowe | 🟠 | Nagłówek nie odpowiada na pytania „co tu znajdę / dlaczego wy”. Pasuje do każdego biura w Polsce, więc nie różnicuje marki i nic nie daje SEO lokalnemu (brak „Poznań”). |
| H5 | Brak CTA w hero (i w nagłówku) | 🔴 | Użytkownik bez wyraźnej następnej akcji przewija bez celu albo wychodzi. W nieruchomościach potrzebne są dwa CTA: dla **kupującego** („Zobacz oferty”) i dla **sprzedającego**/kontaktu („Bezpłatna wycena” / „Zadzwoń”). |
| H6 | Pasek filtrów w hero | 🟠 | Filtry działają na siatkę, której **nie widać** (jest pod linią zgięcia), więc zmiana filtra nie daje widocznego efektu. Przy 8 ofertach rozbudowany filtr to przerost formy. Pasek przykrywa też najładniejszą część zdjęcia i dociąża kompozycję. |
| H7 | Gradientowy tekst „mają znaczenie” | 🟡 | Gradient w tekście to modny, „technologiczny” efekt. Premium to powściągliwość: jeden kolor, ewentualnie zmiana grubości. Gradient słabo się też renderuje przy cienkim kroju (300). |
| H8 | Niespójne wyrównanie: mobile do lewej, desktop do środka; zakładki zawsze wyśrodkowane | 🟡 | Mieszane osie wyrównania w jednym widoku wyglądają przypadkowo. Wybieramy jedną oś (lewa: lepsza czytelność, bardziej „redakcyjnie”). |
| H9 | `min-h-screen` (100vh) na iOS chowa dół pod paskiem Safari; brak sygnału, że niżej jest treść | 🟡 | Lepiej `min-h-[88svh]`, żeby wystawała krawędź pierwszego rzędu ofert (naturalna zachęta do przewinięcia). |
| H10 | Źródło 1408×768 px rozciągane na 1440–2560 px (×1,3 przy DPR 1, ×2,6 na Retinie); mobile 768×1376 | 🟠 | Rozmycie zdjęcia hero od razu obniża postrzeganą jakość. Desktop wymaga ≥2560 px szerokości, mobile ≥1080×1920. |
| H11 | Przez ok. 1–2 s hero jest czarne, dopóki obraz się nie załaduje (zrzut 02) | 🟠 | Brak placeholdera (`placeholder="blur"` lub kolor tła sekcji). Do tego oba warianty (mobile i desktop) mają `priority`, więc **oba się preloadują**, a wyświetla się jeden (podwójny transfer na LCP). |
| H12 | `font-light` (300) w H1 przy systemowym kroju zastępczym | 🟡 | Cienki krój na zdjęciu traci czytelność. Na tle obrazu lepiej 400 z ciasnym trackingiem. |

### 1.3 Rekomendowany hero (prosto, elegancko, premium)

**Kompozycja**
- Wysokość `min-h-[88svh]`, treść wyrównana **do lewej** na wszystkich breakpointach, w dolnej lewej ćwiartce (desktop: kolumna max ~640 px).
- **Zdjęcie: wymienić.** Prawdziwe, wysokiej jakości ujęcie, które pasuje do rynku i oferty, np. jasne, dobrze ostylowane wnętrze w złotym świetle albo poznańska architektura o zmierzchu (Stary Browar, Malta, Jeżyce). Ewentualnie najlepsza sesja z własnej oferty. Warunki techniczne: 2560–3200 px szerokości dla desktopu, osobny kadr 9:16 dla mobile, spokojna strefa (niebo/ściana) tam, gdzie stoi tekst.
- **Scrim:** zamiast 5-stopniowego gradientu dwie warstwy:
  1. `linear-gradient(to top, #0F0B06 0%, rgba(15,11,6,.85) 18%, rgba(15,11,6,.0) 55%)`: płynne przejście w tło strony i podkład pod tekst,
  2. desktop: delikatny `linear-gradient(to right, rgba(15,11,6,.55), transparent 60%)` pod kolumną tekstu.
  Góra zdjęcia zostaje naturalna i jasna, a ciemno jest tylko tam, gdzie trzeba.
- **Bez paska filtrów.** Filtry przenosimy nad siatkę ofert (sekcja 12).

**Treść** (propozycje, do wyboru):

| | Eyebrow | H1 | Podtytuł |
|-|---------|----|----------|
| **A (rekomendowana)** | Poznań i okolice | Spokojna sprzedaż i zakup nieruchomości | Mieszkania, domy i działki w Poznaniu i okolicach. Prowadzę Cię od pierwszej prezentacji do aktu notarialnego. |
| B | Biuro nieruchomości · Poznań | Dom, który wybierasz z pewnością | Rzetelnie sprawdzone oferty i doradca, który zna lokalny rynek. |
| C | Poznań i Wielkopolska | Twoja nieruchomość w dobrych rękach | Sprzedaż, zakup i wycena. Osobiście, konkretnie, bez presji. |

Uzasadnienie A: łączy wartość emocjonalną („spokojna”, czyli to, czego klient naprawdę szuka w stresującej transakcji) z konkretem (co, gdzie). Pokrywa obie grupy (kupujący i sprzedający), zawiera frazę lokalną pod SEO i pasuje do nazwy *Peritus* (łac. „doświadczony, biegły”). Słowo „nieruchomości” pada raz.

**CTA**
- Główny (pełny, `bg-accent`, ciemny tekst): **„Zobacz oferty”**, przewija do `#oferty`.
- Drugorzędny (obrys beżowy): **„Bezpłatna wycena”** (ścieżka sprzedającego) albo **„Zadzwoń: 732 432 920”**.
- Pod przyciskami mikro-dowód zaufania (gdy będą dane): „★ 4,9 · 37 opinii Google” albo „Ubezpieczenie OC · umowa na piśmie”.

**Ruch:** parallax hero zostaje (subtelny, 0,15–0,2), ale **wyłączony przy `prefers-reduced-motion`**. Tekst wchodzi jednym miękkim fade-up (400 ms), bez rozbijania na słowa.

---

## 2. Czytelność

| ID | Problem | Waga | Rekomendacja i uzasadnienie |
|----|---------|------|-----------------------------|
| R1 | Tytuły kart: biały 30–48 px, wyśrodkowany, na zdjęciach jasnych wnętrz (~1,4:1); na mobile łamie się na 3–4 linie („Mieszkanie 3-” / „pokojowe…”), zrzut [`07`](audyt/07-karty-mobile.jpg) | 🔴 | Treść pod zdjęciem albo w dolnym pasku na mocnym scrimie (od dołu, do ~45% wysokości). Tytuł 20–24 px, wyrównany do lewej, max 2 linie (`line-clamp-2`). Czytelność treści jest ważniejsza niż efekt „plakatu”. |
| R2 | Meta kart 12 px (`text-xs`), etykieta i wartość w dwóch odcieniach | 🟠 | 14 px, ikony lub separator „·” zamiast etykiet: `3 pokoje · 63,6 m² · 1 piętro`. Szybsze skanowanie (wzorzec F). |
| R3 | Opisy ofert i treść drugorzędna 14 px / `#A99B84` na ciemnym tle | 🟡 | Kontrast jest OK (7,2:1), ale 14 px przy długim tekście męczy. Body 16 px, `leading-relaxed`, max 68 znaków na linię. |
| R4 | `font-light` w 26 miejscach, w tym w przyciskach i liczbach | 🟡 | 300 tylko dla display (≥40 px). UI i przyciski 400–500. Cienkie kroje na ciemnym tle „świecą” i się rozmywają (irradiacja). |
| R5 | Liczby w formacie EN: „69.2 m²”, „88.47 m²” | 🟠 | `Intl.NumberFormat('pl-PL')` → „69,2 m²”. Polski użytkownik odczytuje kropkę jako separator tysięcy, więc to realny błąd zrozumienia. |
| R6 | Mobile, szczegóły oferty: etykiety „POWIERZCHNIA” i „POKOJE” zlewają się w siatce 3-kolumnowej (zrzut [`06`](audyt/06-oferta-mobile-kolizja.jpg)) | 🟠 | Siatka 2-kolumnowa na mobile, mniejszy tracking etykiet (`tracking-wider` zamiast `widest`). |
| R7 | Strzałki galerii i przycisk „wstecz” (białe, bez tła) giną na jasnych zdjęciach; przycisk „wstecz” w panelu to ten sam chevron „‹”, co „poprzednie zdjęcie”, tuż nad nim | 🟠 | Przyciski na półprzezroczystym ciemnym kole (`bg-black/45 backdrop-blur`). Zamknięcie panelu jako „✕ Zamknij” w prawym górnym rogu: jednoznaczna ikona i konwencja modala. |

---

## 3. Spójność wizualna i kolorystyczna

| ID | Problem | Waga | Rekomendacja i uzasadnienie |
|----|---------|------|-----------------------------|
| S1 | **13× nieistniejące klasy** `border-white/8`, `bg-white/3` → jasnoszare ramki `rgb(229,231,235)` (preflight Tailwind). Pliki: `PropertyDetailContent` (5), `ContactForm` (3), `AgentCard` (2), `o-mnie` (2), `kontakt` (1). Zrzut [`04`](audyt/04-panel-formularz-szare-ramki.jpg) | 🔴 | Token `line` (np. `rgba(217,196,163,.12)`) i jedna klasa `border-line`. Jedna z najbardziej widocznych przyczyn „taniego” wyglądu formularzy. |
| S2 | Promienie zaokrągleń: header/filtry `2xl` (16), selecty i pigułki `lg` (8), **karty, inputy i przyciski CTA 0**, karta agenta `lg`, wartości „O mnie” `2xl` | 🟠 | Skala dwustopniowa: **kontenery, karty i zdjęcia `rounded-xl` (12 px)**, **kontrolki (inputy, przyciski, pigułki) `rounded-lg` (8 px)**, ikony i avatary `full`. Spójne zaokrąglenia to jeden z najsilniejszych sygnałów „zaprojektowane, nie złożone”. |
| S3 | Dwa systemy neutrali: `white/5`, `white/15`, `rgba(255,255,255,…)` w stylach inline obok beżowych `beige/10`, `.glass` | 🟠 | Wszystkie neutrale z beżu (ciepłe), zero czystej bieli w tintach. Biel na ciepłej czerni daje zimne, sine krawędzie, które nie pasują do palety. |
| S4 | Rola pomarańczu niejasna: cena, eyebrow, aktywna zakładka, napis w logo, 6 obrysowych CTA, kropki galerii, scrollbar, statystyki (gradient) | 🟠 | **Pomarańcz = akcja + cena. Nic więcej.** Eyebrow i detale w beżu. Gdy akcent jest wszędzie, przestaje wskazywać, co jest najważniejsze (zasada *von Restorff*). |
| S5 | Brak pełnego przycisku głównego na całej stronie; 5 różnych stylów przycisków | 🔴 (konwersja) | Komponent `Button`: `primary` (pełny `accent`, tekst `#0F0B06`, 48 px), `secondary` (obrys beż), `ghost` (tekstowy). Obrysowe pomarańczowe CTA na ciemnym tle mają za słabą wagę jak na główną akcję. |
| S6 | Cienie ad hoc: 4 różne `box-shadow` inline + nieużywany token `glow` | 🟡 | Dwa tokeny elewacji: `shadow-e1` (kontrolki pływające), `shadow-e2` (header, panel). |
| S7 | Martwe tokeny i utility: `.glass`, `.glass-strong`, `shadow-glow`, `beige-muted`, `accent-strong`, `secondary-dark` nieużywane, a efekt szkła skopiowany inline 9× | 🟡 | Jedno utility `.surface-glass` użyte wszędzie albo usunięcie. Mniej kodu, jedno miejsce zmiany. |
| S8 | Karta oferty: ostre rogi, treść na środku, hover-only CTA; karty „O mnie”: zaokrąglone, treść do lewej. Dwa języki kart | 🟡 | Jeden wzorzec karty (zob. 12.1). |

---

## 4. Typografia, odstępy, cienie

| ID | Problem | Waga | Rekomendacja i uzasadnienie |
|----|---------|------|-----------------------------|
| T1 | **Inter nie jest ładowany** (brak `next/font`), więc na każdym OS inny krój | 🔴 | `next/font/google` Inter, `subsets: ['latin','latin-ext']`, zmienna `--font-sans` w Tailwind `fontFamily.sans`. Montserrat zostaje tylko dla logotypu i eyebrow. Dwa kroje to maksimum dla eleganckiej prostoty. |
| T2 | Skala typograficzna ad hoc: `text-[9px]`, `[10px]`, `xs`…`7xl`; tracking: `wider`, `widest`, `0.3em`, `0.35em`, `0.16em`, `1.5px` | 🟠 | Tokeny: `display` (56/64, 400, -0.02em), `h1` (40/48), `h2` (28/36), `h3` (20/28), `body` (16/26), `small` (14/22), `eyebrow` (12, 500, uppercase, **jeden** tracking 0.2em). |
| T3 | Hierarchia nagłówków: H2 jako podtytuł hero; `h4` w karcie agenta i w stopce bez `h3` po drodze | 🟡 | Podtytuł jako `<p>`. Kolejność h1 → h2 → h3. Ważne dla SEO i czytników ekranu. |
| T4 | Odstępy sekcji i kontenery niespójne: `pt-28 md:pt-32`, `pb-24`, `pb-8`; padding poziomy `px-4 sm:px-6 md:px-8 lg:px-16` w hero vs `px-4 md:px-8 lg:px-16` w siatce; header ma ramkę z własnym paddingiem, więc krawędzie logo i treści nie leżą w jednej linii | 🟠 | Komponent `Container` (max-w-7xl + jeden padding) i `Section` (rytm `py-20 md:py-28`). Skala odstępów 4/8/12/16/24/32/48/80/112. Wspólne krawędzie to „niewidzialna siatka”, która daje premium spokój. |
| T5 | Odstęp hero → siatka: filtr ma `mb-10/12`, siatka `pt-0`; brak nagłówka sekcji ofert | 🟠 | Nagłówek „Aktualne oferty” + licznik + filtry jako jedna sekcja z normalnym rytmem. |

---

## 5. Łatwość obsługi (UX) i konwersja

| ID | Problem | Waga | Rekomendacja i uzasadnienie |
|----|---------|------|-----------------------------|
| U1 | **Brak ceny i lokalizacji na kartach** | 🔴 | Cena (akcent) + miasto/dzielnica na każdej karcie. Ukrywanie ceny to konwencja rynku luksusowego „na zapytanie”. Tu tylko zmusza do klikania i frustruje. |
| U2 | **Telefon placeholder** `+48 600 000 000` w stopce i `/kontakt`, prawdziwy w danych ofert | 🔴 | Jedno źródło prawdy: `lib/site.ts` (`siteConfig`: telefon, e-mail, adres, godziny, social), a docelowo opcje ACF w WordPressie. Dziś każdy telefon ze stopki to utracony lead. |
| U3 | Brak CTA w nagłówku; telefon niewidoczny nad linią zgięcia | 🔴 | W headerze przycisk „Zadzwoń” (mobile: ikona słuchawki) lub numer na desktopie. W lokalnych usługach telefon to główny kanał konwersji. |
| U4 | Szczegóły oferty: cena 18 px; brak ceny za m², piętra/kondygnacji, rynku, stanu; brak przyklejonego kontaktu na mobile | 🔴 | Cena 28–32 px + „9 418 zł/m²”. Kluczowe parametry w jednym pasku. **Mobile: sticky bar „Zadzwoń” | „Umów prezentację”**. Desktop: przyklejona prawa kolumna z ceną, agentem i CTA (wzorzec Otodom/Zillow, znany użytkownikom). |
| U5 | Formularz: brak pola **telefon**, brak zgody RODO, sukces znika po 3 s, komunikat nie jest w `aria-live` | 🔴 | Pola: imię, telefon (wymagany), e-mail (opcjonalny), wiadomość z sensownym domyślnym tekstem („Dzień dobry, proszę o kontakt w sprawie oferty X”). Zgoda + link do polityki. Trwały stan sukcesu z następnym krokiem („Oddzwonię zwykle w ciągu 2 h w dni robocze”). |
| U6 | Brak ścieżki **sprzedającego** (pozyskanie zleceń) | 🔴 | Dla pośrednika to zwykle główne źródło przychodu. Sekcja „Sprzedajesz nieruchomość?” + CTA „Bezpłatna wycena” (krótki formularz: adres, metraż, telefon). |
| U7 | Pusty wynik filtrowania pokazuje pustkę; zakładka „Lokale” ma 0 ofert | 🟠 | Stan pusty: „Brak ofert dla tych kryteriów. [Wyczyść filtry] albo [Zostaw kontakt, dam znać o nowej ofercie]” (lead!). Zakładki bez ofert ukrywać, a liczba przy zakładce: „Mieszkania (6)”. |
| U8 | Filtr „Piętra” = liczba kondygnacji; dla mieszkań zawsze 1, użytkownik rozumie „piętro” | 🟠 | Dla mieszkań „Piętro: 3/4” (pole `floor`/`floorsTotal`), dla domów „Kondygnacje”. Filtr pięter usunąć z UI do czasu realnych danych. |
| U9 | „Szczegóły” na karcie widoczne tylko po hoverze, więc na dotyku niewidoczne | 🟡 | Cała karta jest linkiem (OK), ale affordance musi być stała: strzałka lub „Zobacz ofertę →” zawsze widoczne, hover tylko wzmacnia. |
| U10 | „Wyczyść filtry” zawsze widoczne; mobile „Pokaż filtry zaawansowane” | 🟡 | „Wyczyść” tylko gdy coś jest aktywne. Mobile: przycisk „Filtry (2)” otwierający bottom-sheet. |
| U11 | Panel oferty na desktopie zajmuje 100% ekranu, więc rozmycie listy (`blur(4px) scale(.98)`) jest **niewidoczne**, a efekt „panelu” znika | 🟠 | Desktop: **arkusz z prawej, `max-w-[960px]`**, lista rozmyta po lewej (kontekst + sens animacji). Mobile: pełny ekran. Zgodne z ustaleniem „klik musi wysuwać overlay-panel”. |
| U12 | Galeria: brak swipe na mobile, brak strzałek klawiatury, 16 kropek, brak pełnego ekranu, crossfade przez czerń | 🟠 | Swipe (CSS scroll-snap), ←/→, licznik zamiast kropek przy >8 zdjęciach, miniatury na desktopie, lightbox. Zdjęcia to główny produkt w ogłoszeniu. |
| U13 | Strona główna = hero + siatka + stopka; brak „O mnie”, opinii, procesu | 🟠 | Zob. architektura w sekcji 12. Zaufanie do osoby jest kluczowe w usługach lokalnych. |
| U14 | Stopka: „Usługi” to nieklikalny tekst z efektem hover; social to `#` (w tym Twitter); „Polityka prywatności”, „Regulamin” → `#` | 🟠 | Bez hovera na nieklikalnych elementach (fałszywa affordance). Ukryć social do czasu realnych kont. Strony prawne są wymagane (RODO). |
| U15 | Brak plan pomiaru konwersji | 🟠 | Przed startem: zdarzenia `click_phone`, `click_email`, `submit_lead` (z `source`: hero/oferta/kontakt/wycena) w GA4 lub Plausible, za zgodą cookie. Bez tego nie da się ocenić, czy zmiany działają. |

---

## 6. Efekty wizualne: scroll, parallax, animacje

| ID | Problem | Waga | Rekomendacja i uzasadnienie |
|----|---------|------|-----------------------------|
| A1 | Brak `prefers-reduced-motion` w całym projekcie | 🔴 | `gsap.matchMedia()` z gałęzią `(prefers-reduced-motion: reduce)` wyłączającą parallax i ruch; w CSS globalny reset `transition/animation`. Wymóg WCAG 2.3.3 / dobra praktyka; parallax wywołuje dyskomfort u osób z zaburzeniami błędnika. |
| A2 | Parallax na **każdej karcie** (±40 px) + GSAP `scale 1.02` całej karty + `scale 1.1` zdjęcia na hover | 🟠 | **Decyzja właściciela: parallax zostaje (hero + karty) i jest dopracowywany**: `scrub: 0.6`, `yPercent` zamiast px, `ScrollTrigger.refresh()` po filtrowaniu, warstwowa głębia w hero, zoom tylko zdjęcia na hover, mniejsza amplituda na dotyku, statycznie przy reduced-motion. Szczegóły: `tasks/todo.md` → Etap 4. |
| A3 | Wjazd panelu 1,2 s; zamknięcie 0,6 s | 🟠 | Wejście 450–500 ms (`power3.out`), wyjście 300 ms. Powyżej ~500 ms animacja zaczyna „blokować” użytkownika, a premium to płynność, nie powolność. |
| A4 | Header chowa się/pokazuje z `duration-1000` | 🟡 | 300 ms. Sekunda opóźnienia przy przewijaniu w górę wygląda jak lag. |
| A5 | Fade-in siatki (`initFadeIn`) i stopki: SSR renderuje widoczne, potem GSAP ustawia `opacity:0`, więc treść mignie i zniknie; na `/oferty` karty nad zgięciem startują przezroczyste (opóźnienie LCP) | 🟠 | Elementy nad linią zgięcia bez animacji wejścia. Poniżej: klasa startowa w CSS (`.reveal{opacity:0}` tylko gdy JS aktywny, `html.js`) i IntersectionObserver lub ScrollTrigger `once`. |
| A6 | Crossfade galerii: 0,3 s do czerni → zmiana → 0,4 s z czerni | 🟡 | Prawdziwy crossfade dwóch warstw (nowe zdjęcie nad starym) albo slide ze scroll-snap. „Mrugnięcie” do czerni jest tanie w odbiorze. |
| A7 | SplitText na tytule oferty (słowa, 1,2 s + stagger) | 🟡 | Zostawić prosty fade (400 ms). Rozbijanie tytułu w ofercie to „udziwnienie”: opóźnia odczyt najważniejszej informacji. |
| A8 | Hero parallax: OK technicznie (statyczny gradient, zapas 110%) | ✅ | Zostaje. Dodać wyłączenie dla reduced-motion i rozważyć wyłączenie na `pointer: coarse` (iOS potrafi szarpać). |

---

## 7. Wydajność

> Uwaga: pomiary w trybie dev (serwer na :3000 należy do innej sesji, więc nie budowałem produkcyjnie, żeby nie nadpisać mu `.next`). Liczby orientacyjne. Po wdrożeniu: Lighthouse/PageSpeed na buildzie produkcyjnym.

| ID | Problem | Waga | Rekomendacja i uzasadnienie |
|----|---------|------|-----------------------------|
| P1 | Oba obrazy hero (mobile + desktop) z `priority`, więc **oba preloadowane**, wyświetlany jeden | 🟠 | Art direction przez `getImageProps()` + `<picture>` (jeden preload na breakpoint) albo jeden obraz z `object-position` per breakpoint. |
| P2 | 2 karty `featured` z `priority` pod linią zgięcia konkurują z LCP (hero) | 🟡 | `priority` tylko dla hero. Karty `loading="lazy"` (domyślne). |
| P3 | `import { SplitText } from "gsap/all"` | 🟡 | **Korekta po pomiarze (etap 0):** build produkcyjny przed i po zmianie waży tyle samo (816 KB JS łącznie), bo Turbopack wycina nieużywane pluginy. Import zmieniony na `gsap/SplitText` dla czytelności i odporności na zmianę bundlera; realnego zysku brak. |
| P4 | Cała strona główna to `"use client"`, więc `properties.json` (38 KB, pełne opisy wszystkich ofert) trafia do bundla JS | 🟠 | `page.tsx` jako Server Component; do klienta tylko pola karty (`id, slug, title, price, area, rooms, location, image`). Krytyczne przy WP z dziesiątkami ofert. |
| P5 | `backdrop-filter` w ~9 warstwach, w tym **na każdym przycisku pokoi/pięter** wewnątrz już rozmytego panelu | 🟠 | Blur tylko na headerze (i ewentualnie bottom-sheet). Przyciski na zwykłym półprzezroczystym tle, bo wizualnie różnicy nie ma, a GPU na telefonie to odczuwa. |
| P6 | Rozmycie `filter: blur(4px)` całej sekcji `#properties` pod nieprzezroczystym panelem | 🟡 | Albo uwidocznić (U11), albo usunąć. Teraz to koszt bez efektu. |
| P7 | ~~Zdjęcia ofert mają 720 px~~ | ✅ | **Korekta (etap 3):** wariant `x` z portalu ma **2048×1365 px** (sprawdzone bezpośrednio na CDN; warianty: `x` 2048, `l` 960, `c` 376). Wcześniejszy odczyt 720 px wynikał ze skalowania panelu przeglądarki. Jakość wystarcza na duże karty i galerię. |
| P8 | `next.config.js` bez `formats: ['image/avif','image/webp']`; hero `quality={90}` z PNG 1,9 MB | 🟡 | AVIF + `quality` 75–80. Źródło hero jako JPEG/WebP wysokiej jakości. |
| P9 | `background-attachment: fixed` na `body` | 🟡 | Repaint przy scrollu (iOS i tak ignoruje). Zamiast tego `body::before { position: fixed }` z gradientem. |
| P10 | Każda karta = osobny ScrollTrigger z `onUpdate → gsap.set` | 🟡 | Rozwiązane przez A2. |

---

## 8. Responsywność

| ID | Problem | Waga | Rekomendacja |
|----|---------|------|--------------|
| M1 | Zakładki kategorii na 375 px: „LOKALE” spada do osobnej linii (sierota) | 🟡 | Poziomy scroll zakładek (`overflow-x-auto`, `snap-x`) albo ukrycie pustych kategorii (U7). |
| M2 | Karty 450 px wysokości × 8 = ~3800 px przewijania na mobile; tytuły na 3–4 linie | 🟠 | Karta mobile: zdjęcie 4:3 + treść pod spodem (~380 px łącznie), tytuł 2 linie. |
| M3 | Szczegóły: siatka 3-kolumnowa parametrów koliduje (R6); galeria 80vh na mobile | 🟠 | 2 kolumny; galeria 4:3 lub 60svh. |
| M4 | Brak sticky CTA na mobile (U4) | 🔴 | Dolny pasek „Zadzwoń / Umów prezentację” w ofercie. |
| M5 | BackToTop (48 px, prawy dół) zasłania treść kart i kolidowałby ze sticky CTA | 🟡 | Na mobile ukryć (natywny gest „tap na pasek statusu” istnieje) albo pokazywać dopiero po 2 ekranach. |
| M6 | Menu mobilne: brak `aria-expanded`, nie zamyka się Escape ani tapnięciem poza nim; header na mobile zajmuje ~80 px | 🟡 | Dodać obsługę + mniejszy padding. Rozważyć ikonę telefonu obok hamburgera (U3). |
| M7 | Tablet (768): karty 2 kolumny × 500 px, tytuły w 4 liniach | 🟡 | Rozwiązuje nowy wzorzec karty (12.1). |
| M8 | Cele dotykowe: przyciski pokoi 36 px, „Zadzwoń/Napisz” 30 px, kropki galerii 8 px | 🟠 | Min. 44×44 px (WCAG 2.5.5 / Apple HIG). |

---

## 9. Dostępność (WCAG 2.1 AA): podsumowanie

**Wykryte:** 14 · 🔴 4 · 🟠 6 · 🟡 4

| # | Problem | Kryterium | Waga |
|---|---------|-----------|------|
| 1 | Brak widocznego focusu (selecty `focus:outline-none`, karty, przyciski) | 2.4.7 | 🔴 |
| 2 | Modal: brak focus-trapu, fokus nie przechodzi do panelu, tło nie `inert` | 2.4.3, 2.1.2 | 🔴 |
| 3 | Kontrast tekstu na zdjęciach: eyebrow/podtytuł hero ≈1,3–1,6:1, tytuły kart na jasnych wnętrzach ≈1,4:1 | 1.4.3 | 🔴 |
| 4 | Brak `prefers-reduced-motion` | 2.3.3 (AAA) / dobra praktyka | 🔴 |
| 5 | `<label>` w filtrach niepowiązane z `<select>` (brak `htmlFor`/`id`) | 1.3.1, 4.1.2 | 🟠 |
| 6 | Zakładki kategorii i przyciski pokoi bez `aria-pressed` | 4.1.2 | 🟠 |
| 7 | Hamburger bez `aria-expanded`/`aria-controls` | 4.1.2 | 🟠 |
| 8 | Cele dotykowe < 44 px | 2.5.5 | 🟠 |
| 9 | Komunikat sukcesu/błędu formularza bez `aria-live`, znika po 3 s | 4.1.3, 2.2.1 | 🟠 |
| 10 | Placeholder formularza ≈2,4:1 | 1.4.3 | 🟠 |
| 11 | Karta: `alt` zdjęcia = tytuł, więc nazwa linku czytana podwójnie | 1.1.1 | 🟡 |
| 12 | Hierarchia nagłówków (H2 jako podtytuł, h4 bez h3) | 1.3.1 | 🟡 |
| 13 | Modal `aria-label` ogólny zamiast `aria-labelledby` → tytuł oferty | 4.1.2 | 🟡 |
| 14 | Brak „Przejdź do treści” (skip link) | 2.4.1 | 🟡 |

**Kontrast palety (na `#0F0B06`):** text-primary 16,7:1 ✅ · text-secondary 7,2:1 ✅ · accent 7,2:1 ✅ · accent-soft 9,4:1 ✅ · beige-muted 4,8:1 ✅ (tylko ≥14 px). **Paleta jest dobra, problem leży w tekście na zdjęciach.**

---

## 10. Teksty i nagłówki (UX copy)

| ID | Gdzie | Jest | Problem | Proponowane |
|----|-------|------|---------|-------------|
| C1 | Meta title | „…ekspercka obsługa rynku premium” | Nie odpowiada ofertom; brak lokalizacji (SEO) | „Peritus Nieruchomości — mieszkania, domy i działki w Poznaniu i okolicach” |
| C2 | Meta description, stopka | „Luksusowe domy, apartamenty i prestiżowe inwestycje…” | j.w. | „Sprzedaż i zakup nieruchomości w Poznaniu i okolicach. Sprawdzone oferty, bezpłatna wycena, wsparcie aż do aktu notarialnego.” |
| C3 | Hero | eyebrow, H1, H2 | 1.2 / H3–H4 | 1.3, wariant A |
| C4 | Głos marki | „O mnie”, „Kontakt”: „ja”; formularz: „Dziękujemy… odezwiemy”; meta `/kontakt`: „Skontaktuj się z nami — odpowiemy” | Mieszanie „ja” i „my” | **Jedna forma.** Rekomendacja: „ja” (Damian), bo osobista marka agenta lepiej buduje zaufanie lokalnie. „Peritus” jako marka, Damian jako twarz. |
| C5 | `/o-mnie` | „12+ lat”, „350+ transakcji”, „98% zadowolonych”, „rynek premium w największych miastach w Polsce” | Placeholdery wyglądają na fakty; nieprawdziwe liczby to ryzyko wprowadzania w błąd (UOKiK) | Tylko weryfikowalne liczby od Damiana albo usunąć pasek statystyk do czasu ich zebrania |
| C6 | Karta oferty | „Pokoje: 3 Powierzchnia: 63.6 m² Piętra: 1” | Etykiety rozwlekłe, kropka, „Piętra” mylące | „3 pokoje · 63,6 m² · 1 piętro” + cena + lokalizacja |
| C7 | Oferta | „Umów oglądanie” → przycisk „Wyślij zapytanie” | Nagłówek i akcja mówią o różnych rzeczach | Nagłówek „Umów prezentację”, przycisk „Umów prezentację” |
| C8 | Formularz | placeholder „Napisz, czym jesteś zainteresowany/a…” | Ukośnik płciowy jest niezgrabny | „W czym mogę pomóc? Np. dogodny termin prezentacji” |
| C9 | Formularz – sukces | „Dziękujemy! Wkrótce się odezwiemy.” | Brak konkretu, znika | „Dziękuję, wiadomość dotarła. Oddzwonię w ciągu 2 godzin w dni robocze.” |
| C10 | Formularz – błąd | „Coś poszło nie tak. Spróbuj ponownie.” | Brak alternatywy | „Nie udało się wysłać wiadomości. Spróbuj ponownie albo zadzwoń: 732 432 920.” |
| C11 | `/oferty` intro | „…Kliknij ofertę, aby zobaczyć szczegóły.” | Instrukcja oczywistej czynności | „8 aktualnych ofert w Poznaniu i okolicach” (licznik dynamiczny) |
| C12 | Filtry mobile | „Pokaż filtry zaawansowane” | Rozwlekłe | „Filtry” / „Filtry (2)” |
| C13 | Karta agenta | „Doradca ds. nieruchomości” + „Zadzwoń”, „Napisz” | Numer niewidoczny (na desktopie `tel:` nic nie robi) | Pokazać numer jako tekst i link: „732 432 920” |
| C14 | Stopka | „Usługi”: Zarządzanie nieruchomościami, Planowanie inwestycji | Czy te usługi realnie są świadczone? | Zweryfikować z Damianem; zostawić tylko prawdziwe i podlinkować (docelowo podstrona „Usługi” / „Sprzedaż z Peritus”) |
| C15 | Stopka | „LinkedIn, Twitter, Instagram, Facebook” → `#` | Martwe linki | Ukryć do czasu realnych profili |

---

## 11. Gotowość pod WordPress (headless)

1. **`siteConfig` jako jedno źródło danych firmy** (telefon, e-mail, adres, godziny, social, teksty hero i CTA), docelowo z ACF Options Page. Dziś telefon występuje w 3 miejscach z 2 różnymi wartościami.
2. **Typ `Property` do rozszerzenia** o pola potrzebne do konwersji: `floor`, `floorsTotal`, `pricePerM2` (lub liczone), `market` (pierwotny/wtórny), `status` (dostępna/rezerwacja/sprzedana: badge na karcie), `yearBuilt`, `city` + `district` osobno (filtry lokalizacji).
3. **Opis jako HTML z WP:** zamiast `split("\n")` sanityzowany HTML (np. `sanitize-html`) + style `.prose` zgodne z tokenami.
4. **Server Components + ISR** (`revalidate`) i do klienta tylko dane kart (P4).
5. **Obrazy z WP:** `remotePatterns` dla domeny mediów, rozmiary ≥1600 px, `alt` z WP.
6. **Komponenty i tokeny przed WP:** `Button`, `Container`, `Section`, `PropertyCard`, `Field`, tokeny koloru, typografii, promieni i cieni. WP dostarcza dane, a wygląd jest już zamknięty w systemie.

---

## 12. Docelowa architektura strony głównej (prosto, 6 bloków)

1. **Header:** logo · Oferty · O mnie · Kontakt · **[Zadzwoń]** (mobile: ikona telefonu + hamburger)
2. **Hero** (88svh): eyebrow lokalizacji, H1, podtytuł, 2 CTA, mikro-zaufanie
3. **Aktualne oferty** (`#oferty`): nagłówek + licznik, zakładki z liczbami, 2 selecty (cena, metraż) + sortowanie, siatka 3 kol. desktop / 2 tablet / 1 mobile, „Zobacz wszystkie oferty” → `/oferty`
4. **O mnie (skrót):** zdjęcie Damiana (min. 800 px; obecne ma 276 px i jest rozmyte), 2–3 zdania, 3 filary pracy, link „Poznaj mnie”
5. **Sprzedajesz?:** pas CTA „Bezpłatna wycena nieruchomości” z krótkim formularzem
6. **Opinie** (gdy będą realne, Google) → **Stopka**

### 12.1 Wzorzec karty oferty (rekomendowany)
```
┌──────────────────────────────┐
│  [zdjęcie 4:3, rounded-xl]   │  ← hover: scale 1.04 (CSS), badge statusu w rogu
│                         ♡ ?  │
└──────────────────────────────┘
  Poznań · Tysiąclecia          ← small, text-secondary
  Mieszkanie 3-pokojowe         ← h3 20–22 px, 2 linie max
  3 pokoje · 69,2 m² · 3/4 p.   ← small
  599 000 zł   8 656 zł/m²      ← cena accent 20 px + m² secondary
```
Uzasadnienie: treść pod zdjęciem daje zawsze czytelny tekst (bez zależności od jasności zdjęcia), skanowanie wzorcem F i porównywalność ofert. To wzorzec znany z portali, więc nie trzeba się go uczyć (prawo Jakoba).

---

## 13. Co działa dobrze (zachować)
- Ciepła, ciemna paleta i kontrast tekstów na tle: spójne z logo, zdrowe proporcje.
- Statyczny gradient hero poza warstwą parallax: dobre, przemyślane rozwiązanie „odcięcia”.
- Intercepting routes: panel z prawdziwym URL-em (udostępnianie, SEO) + pełna podstrona.
- Header chowający się przy scrollu w dół i wracający w górę, scalony w rAF.
- Warstwa `lib/properties.ts` i skrypt synchronizacji: czysta granica pod WordPress.
- `lang="pl"`, `title.template`, SSG ofert, `next/image` wszędzie.
