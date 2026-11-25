# Wdrożenie — WordPress (TLD.pl) + Next.js (Vercel)

Architektura:

```
nieruchomosci-online.pl ─┬(import raz dziennie)──▶ WordPress  cms.peritus-nieruchomosci.pl  (TLD.pl)
Otodom (opcjonalnie) ─────┘  duplikaty łączone     │
                                                     │  wtyczka peritus-core
                                                     │  GET /wp-json/peritus/v1/offers
                                                     │  webhook po imporcie ──▶ /api/revalidate
                                                     ▼
                                   Next.js  peritus-nieruchomosci.pl  (Vercel)
```

Damian dodaje oferty **na portalach** (nieruchomosci-online.pl, część tylko na Otodom). WordPress pobiera je sam raz dziennie (albo na przycisk), łączy oferty wystawione na obu portalach, a strona odświeża się po każdej zmianie.

> Kolejność ma znaczenie: **najpierw poczta (krok 0)**, potem WordPress, na końcu przełączenie domeny na Vercel.

---

## 0. Poczta — zabezpieczyć PRZED zmianą DNS (TLD.pl → DNS)

Dziś rekord **MX wskazuje na samą domenę** (`10 peritus-nieruchomosci.pl.`). Po przełączeniu domeny na Vercel poczta `@peritus-nieruchomosci.pl` przestałaby działać.

1. Sprawdź, że `mail.peritus-nieruchomosci.pl` ma rekord A = `94.152.163.104` (dziś ma).
2. Zmień **MX** na: `10 mail.peritus-nieruchomosci.pl.`
3. Odczekaj, aż zmiana się rozejdzie (TTL, zwykle do kilku godzin), i wyślij testowego maila na `damian@…` z zewnętrznej skrzynki.

SPF (`v=spf1 a mx include:spf.tld.pl -all`) może zostać — `include:spf.tld.pl` obejmuje serwer TLD.pl.

## 1. Hosting TLD.pl — subdomena, PHP, SSL, baza

1. **Subdomena** `cms.peritus-nieruchomosci.pl` z osobnym katalogiem (np. `/cms`).
2. **PHP**: najnowsza dostępna wersja (zalecane 8.3; wtyczka działa od 7.4).
3. **SSL (Let's Encrypt)** dla `cms.peritus-nieruchomosci.pl`. Dziś domena zwraca certyfikat `*.tld.pl` — przeglądarki pokazują ostrzeżenie. (Dla domeny głównej SSL wystawi Vercel po kroku 4.)
4. **Baza MySQL/MariaDB**: nowa baza + użytkownik (zapisz dane — będą potrzebne przy instalacji WP).

## 2. WordPress na `cms.peritus-nieruchomosci.pl`

1. Zainstaluj WordPress (autoinstalator w panelu TLD.pl albo ręcznie: paczka z pl.wordpress.org wgrana przez FTP do katalogu subdomeny). Język: polski.
2. Konto administratora: **silne, unikalne hasło** (menedżer haseł).
3. **Ustawienia → Bezpośrednie odnośniki → „Nazwa wpisu”** (bez tego nie działa adres `/wp-json/…`).
4. **Ustawienia → Czytanie → „Proś wyszukiwarki o nieindeksowanie tej witryny”** — panel CMS nie powinien być w Google (stroną publiczną jest Next.js).
5. **Wtyczka**: spakuj katalog `wordpress/peritus-core` do ZIP:
   ```bash
   cd wordpress && zip -r peritus-core.zip peritus-core
   ```
   WordPress → Wtyczki → Dodaj → Wyślij wtyczkę na serwer → wybierz ZIP → **Włącz**.
6. **`wp-config.php`** (przez FTP, nad linią `/* That's all, stop editing! */`):
   ```php
   // Webhook do strony (ten sam sekret co REVALIDATE_SECRET na Vercelu)
   define('PERITUS_REVALIDATE_URL', 'https://peritus-nieruchomosci.pl/api/revalidate');
   define('PERITUS_REVALIDATE_SECRET', 'WKLEJ-TUTAJ-SEKRET');

   // Prawdziwy cron zamiast WP-Cron (WP-Cron odpala się tylko przy wizytach w panelu)
   define('DISABLE_WP_CRON', true);
   ```
   Sekret wygeneruj np. `openssl rand -hex 32` i zapisz w menedżerze haseł.
7. **Cron w panelu TLD.pl**: co 15 minut wywołanie
   `https://cms.peritus-nieruchomosci.pl/wp-cron.php?doing_wp_cron`
   (np. `wget -q -O /dev/null "https://cms.peritus-nieruchomosci.pl/wp-cron.php?doing_wp_cron"`). WordPress sam pilnuje, żeby import szedł raz dziennie.
8. **Zgłoszenia → Ustawienia** — adres(y), na które idą zgłoszenia z formularzy (domyślnie `martin@peritus-nieruchomosci.pl`, kilka adresów po przecinku). Zmiana działa od razu, bez wdrażania strony. Formularze wymagają `PERITUS_REVALIDATE_SECRET` z punktu 6 — bez niego WordPress odrzuca zgłoszenia (strona pokazuje komunikat błędu z numerem telefonu).
9. **Oferty → Import z portali → Importuj teraz**. Wynik „Udany”, potem otwórz w przeglądarce
   `https://cms.peritus-nieruchomosci.pl/wp-json/peritus/v1/offers` — powinna być lista ofert.
   Sprawdź też wiersz **Otodom**: „N ofert, w tym X tylko na Otodom”. Jeśli jest **Błąd** (np. 403) —
   Otodom blokuje serwer TLD.pl; oferty z nieruchomosci-online.pl i tak działają, ale tych tylko z Otodom nie będzie.

## 3. Vercel — projekt Next.js

1. Konto na vercel.com. Strona firmowa = użytek komercyjny → plan **Pro** (Hobby jest tylko do użytku niekomercyjnego).
2. **Add New → Project → Import** repozytorium `Martini310/real_estate_website` (gałąź `main`). Framework: Next.js (wykryje sam).
3. **Environment Variables** (Production i Preview):
   | Nazwa | Wartość |
   |---|---|
   | `WORDPRESS_API_URL` | `https://cms.peritus-nieruchomosci.pl` |
   | `REVALIDATE_SECRET` | ten sam sekret co w `wp-config.php` |
4. **Deploy**. Sprawdź adres testowy `*.vercel.app`: oferty z WP, panel oferty, formularze.

## 4. Domena → Vercel (TLD.pl → DNS)

Dopiero po kroku 0 (poczta) i 3 (działający deploy).

1. Vercel → Project → **Settings → Domains**: dodaj `peritus-nieruchomosci.pl` i `www.peritus-nieruchomosci.pl` (przekierowanie www → bez www).
2. Vercel pokaże rekordy do ustawienia — wpisz **dokładnie te, które pokaże** (zwykle: `A @ → 76.76.21.21` i `CNAME www → cname.vercel-dns.com`).
3. **Nie zmieniaj** rekordów `cms` i `mail` (zostają na `94.152.163.104`) ani MX.
4. Po propagacji Vercel sam wystawi certyfikat SSL dla domeny.
5. Strona „w budowie” (`index.php` na TLD.pl) przestanie być widoczna — można ją potem usunąć.

## 5. Test po wdrożeniu

- [ ] `https://peritus-nieruchomosci.pl` — oferty jak w WP, kłódka SSL.
- [ ] WP → Oferta → zaznacz **Ukryta** → Aktualizuj → po chwili oferta znika ze strony (Oferty → Import z portali → „Odświeżanie strony … odpowiedź: 200”).
- [ ] Odznacz **Ukryta** → oferta wraca.
- [ ] Mail testowy na `damian@peritus-nieruchomosci.pl` dochodzi.
- [ ] Formularz wyceny na stronie → komunikat „Dziękuję!”, zgłoszenie widać w WP → **Zgłoszenia** (kolumna „E-mail do biura: Wysłany”), mail dochodzi na adres z ustawień (sprawdź też SPAM).
- [ ] Następnego dnia: Oferty → Import z portali → „Ostatni import (cron)” z dzisiejszą datą.

## Jak to działa w razie problemów

- **Mail ze zgłoszeniem nie dochodzi** → zgłoszenie i tak jest w WP → Zgłoszenia (zapis idzie przed wysyłką). Nadawca to `noreply@peritus-nieruchomosci.pl`; jeśli serwer gubi pocztę z PHP albo ląduje w SPAM, zainstaluj wtyczkę **WP Mail SMTP** i skonfiguruj wysyłkę przez skrzynkę na `mail.peritus-nieruchomosci.pl` (SMTP, port 465/SSL).
- **Formularz pokazuje błąd** → sprawdź, czy `PERITUS_REVALIDATE_SECRET` w `wp-config.php` = `REVALIDATE_SECRET` na Vercelu (Vercel → Logs: wpis `[lead]`).
- **Webhook nie dotrze** → strona i tak odświeża oferty co godzinę.
- **WordPress chwilowo nie działa** → strona dalej pokazuje ostatnią poprawną wersję ofert (sprawdzone na buildzie produkcyjnym); nowy deploy w tym czasie użyje `data/properties.json` z repozytorium.
- **Portal zmieni szablon** → import przerywa się bez zmian w ofertach, błąd widać w Oferty → Import z portali. Wtedy trzeba poprawić parser w `wordpress/peritus-core/includes/class-importer.php`.
