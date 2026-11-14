# WordPress (headless) — wtyczka `peritus-core`

WordPress jest wyłącznie zapleczem: importuje oferty z nieruchomosci-online.pl,
udostępnia je stronie Next.js i przyjmuje zgłoszenia z formularzy. Publiczną stroną jest aplikacja Next.js.

## Co robi wtyczka

| Plik | Odpowiedzialność |
|---|---|
| `peritus-core.php` | rejestracja, harmonogram (WP-Cron raz dziennie) |
| `includes/class-offers.php` | typ treści „Oferta”, pola, przełączniki „Wyróżniona” / „Ukryta”, kolumny listy |
| `includes/class-importer.php` | import z portalu (port `scripts/sync-nieruchomosci-online.mjs`, te same slugi) |
| `includes/class-rest.php` | `GET /wp-json/peritus/v1/offers` w kształcie `types/property.ts` |
| `includes/class-revalidate.php` | webhook do Next (`/api/revalidate`) po zmianach |
| `includes/class-admin.php` | Oferty → Import z portalu (wynik, „Importuj teraz”, harmonogram) |
| `includes/class-leads.php` | `POST /wp-json/peritus/v1/leads` (formularze ze strony): zapis w „Zgłoszenia”, e-mail na adresy z Zgłoszenia → Ustawienia, limit 5 zgłoszeń / 10 min z jednego IP |

Zasady: importer najpierw pobiera i parsuje **wszystkie** ogłoszenia, dopiero potem
zapisuje (błąd = brak zmian). Oferty zdjęte z portalu trafiają do szkiców.
Przełączniki „Wyróżniona” i „Ukryta” należą do właściciela — import ich nie zmienia.

Formularze: przeglądarka → Next `/api/lead` (walidacja, honeypot) → WP z nagłówkiem
`x-peritus-secret` = `PERITUS_REVALIDATE_SECRET` (ten sam wspólny sekret co webhook).
Zgłoszenie zapisuje się przed wysyłką maila, więc awaria poczty niczego nie gubi.
Wymagania: WordPress ≥ 6.0, PHP ≥ 7.4 (testowane na WP 7.1.3 / PHP 8.3, składnia sprawdzona pod PHP 7.4).

## Lokalnie (Docker)

```bash
cd wordpress
docker compose up -d                                  # WordPress: http://localhost:8088
docker compose run --rm wpcli wp core install \
  --url=http://localhost:8088 --title="Peritus CMS (lokalnie)" \
  --admin_user=admin --admin_password=TWOJE-HASLO --admin_email=admin@peritus.test --skip-email
docker compose run --rm wpcli wp language core install pl_PL --activate
docker compose run --rm wpcli wp rewrite structure '/%postname%/'
docker compose run --rm wpcli wp plugin activate peritus-core
docker compose run --rm wpcli wp eval 'print_r(Peritus_Importer::run("ręcznie"));'
```

Next.js na danych z lokalnego WP — w `.env.local` (repo główne):

```
WORDPRESS_API_URL=http://localhost:8088
REVALIDATE_SECRET=local-dev-secret
```

Wtyczka jest montowana z repozytorium (zmiany w PHP widać od razu). Reset bazy: `docker compose down -v`.
Lokalnie kontener nie ma serwera poczty — `wp_mail` zwróci błąd (zgłoszenie i tak się zapisze,
z „Nie wysłany”). Do podglądu maili wystarczy mu-plugin z filtrem `pre_wp_mail` zapisującym `$atts` do pliku.
Uwaga: lokalnie WP-Cron nie odpala się sam (kontener nie widzi sam siebie pod `localhost:8088`) — import uruchamiaj przyciskiem albo przez `wp eval`.

Wdrożenie na serwer: `tasks/wdrozenie.md`.
