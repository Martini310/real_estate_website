<?php
/**
 * Import ofert agenta z nieruchomosci-online.pl do typu „Oferta”.
 *
 * Port 1:1 skryptu scripts/sync-nieruchomosci-online.mjs (te same reguły
 * parsowania i te same slugi → adresy ofert na stronie się nie zmieniają).
 * Portal nie ma publicznego API do odczytu, więc czytamy publiczne strony:
 * profil agenta (lista ofert) i każde ogłoszenie (JSON-LD, galeria `photos.x`,
 * tabela „Szczegóły ogłoszenia”, pełny opis).
 *
 * Bezpieczeństwo danych: najpierw pobieramy i parsujemy WSZYSTKIE ogłoszenia;
 * dopiero gdy całość się powiedzie, zapisujemy zmiany. Każdy błąd = przerwanie
 * bez dotykania istniejących ofert (np. po zmianie szablonu portalu).
 */

if (!defined('ABSPATH')) {
    exit;
}

class Peritus_Importer
{
    const CRON_HOOK  = 'peritus_import_offers';
    const LOG_OPTION = 'peritus_import_log';
    const AGENT_URL  = 'https://www.nieruchomosci-online.pl/agenci/damian-rozewski';
    const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';

    /** Wiersze tabeli szczegółów, których nie pokazujemy jako „cechy”. */
    const SKIPPED_DETAILS = array('Typ oferty', 'Cena', 'Źródło', 'Adres');

    public static function run_scheduled()
    {
        self::run('cron');
    }

    /**
     * Pełny import. Zwraca i zapisuje log: czas, wynik, liczniki, ewentualny błąd.
     *
     * @param string $trigger cron | ręcznie
     */
    public static function run($trigger)
    {
        if (function_exists('set_time_limit')) {
            @set_time_limit(300); // ~1 s przerwy na ogłoszenie, żeby nie obciążać portalu
        }

        $log = array('time' => time(), 'trigger' => $trigger, 'ok' => false, 'created' => 0, 'updated' => 0, 'removed' => 0, 'unchanged' => 0, 'error' => '');

        try {
            $offers = self::parse_agent_page(self::fetch(self::AGENT_URL));
            if (!$offers) {
                throw new RuntimeException('Nie znaleziono ofert na profilu agenta.');
            }

            $properties = array();
            foreach ($offers as $offer) {
                sleep(1);
                $properties[] = self::to_property($offer, self::fetch($offer['url']));
            }

            Peritus_Revalidate::$suspended = true;
            try {
                $counts = self::save($properties);
            } finally {
                Peritus_Revalidate::$suspended = false;
            }
            $log = array_merge($log, $counts, array('ok' => true));
            if ($log['created'] || $log['updated'] || $log['removed']) {
                Peritus_Revalidate::request('import ofert');
            }
        } catch (Exception $e) {
            $log['error'] = $e->getMessage();
        }

        update_option(self::LOG_OPTION, $log, false);
        return $log;
    }

    // --- zapis ------------------------------------------------------------------

    private static function save(array $properties)
    {
        $counts = array('created' => 0, 'updated' => 0, 'removed' => 0, 'unchanged' => 0);
        $seen   = array();

        foreach ($properties as $position => $property) {
            $post_id = Peritus_Offers::find_by_source_id($property['id']);
            $hash    = md5(wp_json_encode($property) . $position);
            $seen[]  = $post_id;

            if ($post_id && get_post_status($post_id) === 'publish' && Peritus_Offers::get_meta($post_id, 'hash') === $hash) {
                $counts['unchanged']++;
                continue;
            }

            $postarr = array(
                'post_type'    => Peritus_Offers::POST_TYPE,
                'post_status'  => 'publish',
                'post_title'   => $property['title'],
                'post_name'    => $property['slug'],
                'post_content' => $property['description'],
                // Kolejność jak na profilu agenta (portal pokazuje najnowsze na górze).
                'menu_order'   => $position,
            );

            if ($post_id) {
                $postarr['ID'] = $post_id;
                $result        = wp_update_post(wp_slash($postarr), true);
                $counts['updated']++;
            } else {
                $result = wp_insert_post(wp_slash($postarr), true);
                $counts['created']++;
            }
            if (is_wp_error($result)) {
                throw new RuntimeException('Zapis oferty ' . $property['id'] . ': ' . $result->get_error_message());
            }
            $post_id = (int) $result;
            $seen[]  = $post_id;

            $m = Peritus_Offers::META;
            update_post_meta($post_id, $m['source_id'], (string) $property['id']);
            update_post_meta($post_id, $m['source_url'], $property['sourceUrl']);
            update_post_meta($post_id, $m['location'], $property['location']);
            update_post_meta($post_id, $m['price'], $property['price']);
            update_post_meta($post_id, $m['area'], $property['area']);
            update_post_meta($post_id, $m['type'], $property['type']);
            update_post_meta($post_id, $m['bedrooms'], $property['bedrooms']);
            update_post_meta($post_id, $m['bathrooms'], $property['bathrooms']);
            update_post_meta($post_id, $m['floors'], $property['floors']);
            update_post_meta($post_id, $m['year_built'], $property['yearBuilt']);
            update_post_meta($post_id, $m['gallery'], wp_slash(wp_json_encode($property['gallery'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)));
            update_post_meta($post_id, $m['features'], wp_slash(wp_json_encode($property['features'], JSON_UNESCAPED_UNICODE)));
            update_post_meta($post_id, $m['hash'], $hash);
        }

        // Oferty zdjęte z portalu → szkic (nie usuwamy: historia + flagi zostają).
        $published = get_posts(array(
            'post_type'      => Peritus_Offers::POST_TYPE,
            'post_status'    => 'publish',
            'fields'         => 'ids',
            'posts_per_page' => -1,
        ));
        foreach (array_diff($published, $seen) as $post_id) {
            wp_update_post(array('ID' => $post_id, 'post_status' => 'draft'));
            $counts['removed']++;
        }

        return $counts;
    }

    // --- pobieranie i parsowanie (port skryptu Node) ----------------------------------

    private static function fetch($url)
    {
        $response = wp_remote_get($url, array('timeout' => 20, 'headers' => array('User-Agent' => self::USER_AGENT)));
        if (is_wp_error($response)) {
            throw new RuntimeException($response->get_error_message() . ': ' . $url);
        }
        $code = wp_remote_retrieve_response_code($response);
        if ($code !== 200) {
            throw new RuntimeException($code . ': ' . $url);
        }
        return wp_remote_retrieve_body($response);
    }

    private static function decode_entities($text)
    {
        return html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    /** HTML → czysty tekst w jednej linii. */
    private static function to_text($html)
    {
        $text = self::decode_entities(preg_replace('/<[^>]+>/', ' ', $html));
        $text = preg_replace('/\s+/u', ' ', $text);
        $text = preg_replace('/\s+([,;)])/u', '$1', $text);
        $text = preg_replace('/\(\s+/u', '(', $text);
        return trim($text);
    }

    private static function slugify($text)
    {
        $text = mb_strtolower($text, 'UTF-8');
        $text = str_replace('ł', 'l', $text);
        $text = remove_accents($text);
        $text = preg_replace('/[^a-z0-9]+/', '-', $text);
        return trim($text, '-');
    }

    /** „63.60 m²” / „386,00m²” → 63.6 */
    private static function parse_number($value)
    {
        if (preg_match('/\d+(\.\d+)?/', str_replace(',', '.', (string) $value), $match)) {
            return 0 + $match[0];
        }
        return 0;
    }

    private static function starts_with($haystack, $needle)
    {
        return strpos((string) $haystack, $needle) === 0;
    }

    /** Profil agenta → [{ id, url, title }] */
    private static function parse_agent_page($html)
    {
        $offers = array();
        preg_match_all('/<a[^>]+href="(https:\/\/[a-z-]+\.nieruchomosci-online\.pl\/[^"]+\/(\d+)\.html)"[^>]*>([\s\S]*?)<\/a>/', $html, $matches, PREG_SET_ORDER);
        foreach ($matches as $match) {
            $title = self::to_text($match[3]);
            $id    = (int) $match[2];
            if ($title && !isset($offers[$id])) {
                $offers[$id] = array('id' => $id, 'url' => $match[1], 'title' => $title);
            }
        }
        return array_values($offers);
    }

    private static function parse_json_ld($html)
    {
        preg_match_all('/<script type="application\/ld\+json">([\s\S]*?)<\/script>/', $html, $matches);
        foreach ($matches[1] as $json) {
            $data = json_decode($json, true);
            if (is_array($data) && isset($data['offers']) && is_array($data['offers']) && isset($data['address'])) {
                return $data;
            }
        }
        throw new RuntimeException('Brak JSON-LD ogłoszenia');
    }

    private static function parse_photos($html)
    {
        if (!preg_match('/photos:\s*(\{[\s\S]*?\}),\s*\n/', $html, $match)) {
            throw new RuntimeException('Brak galerii (photos)');
        }
        $data   = json_decode($match[1], true);
        $photos = isset($data['x']) && is_array($data['x']) ? $data['x'] : array();
        if (!$photos) {
            throw new RuntimeException('Pusta galeria');
        }
        return $photos;
    }

    /** Tabela „Szczegóły ogłoszenia” → [{ label, value }]; wiersze-kontynuacje doklejane do poprzednich. */
    private static function parse_details($html)
    {
        $start = strpos($html, 'id="detailsTable"');
        $end   = $start === false ? false : strpos($html, 'Opis nieruchomości', $start);
        if ($start === false || $end === false) {
            throw new RuntimeException('Brak tabeli szczegółów');
        }

        $rows = array();
        preg_match_all('/<li[^>]*>\s*<strong>([\s\S]*?)<\/strong>([\s\S]*?)<\/li>/', substr($html, $start, $end - $start), $matches, PREG_SET_ORDER);
        foreach ($matches as $match) {
            $label = preg_replace('/:$/', '', self::to_text($match[1]));
            $value = preg_replace('/\s*\(zobacz inne.*$/u', '', self::to_text($match[2]));
            if ($value === '') {
                continue;
            }
            if ($label !== '') {
                $rows[] = array('label' => $label, 'value' => $value);
            } elseif ($rows) {
                $rows[count($rows) - 1]['value'] .= '; ' . $value;
            }
        }
        return $rows;
    }

    private static function parse_description($html)
    {
        if (!preg_match('/<div class="estate-desc-more"[^>]*>([\s\S]*?)<\/div>/', $html, $match)) {
            throw new RuntimeException('Brak opisu');
        }
        $text  = self::decode_entities(preg_replace('/<[^>]+>/', '', preg_replace('/<br\s*\/?>/i', "\n", $match[1])));
        $lines = array_filter(array_map(function ($line) {
            return trim(preg_replace('/\s+/u', ' ', $line));
        }, explode("\n", $text)), 'strlen');
        return implode("\n", $lines);
    }

    /** Oznaczenia typu „Kupujący nie płaci prowizji”, „Oferta na wyłączność”. */
    private static function parse_highlights($html)
    {
        return array_values(array_filter(array('Oferta na wyłączność', 'Kupujący nie płaci prowizji'), function ($text) use ($html) {
            return strpos($html, $text) !== false;
        }));
    }

    private static function detail(array $details, $label)
    {
        foreach ($details as $row) {
            if (self::starts_with($row['label'], $label)) {
                return $row['value'];
            }
        }
        return '';
    }

    private static function map_type(array $ld, array $details)
    {
        $offer_type = '';
        foreach ($details as $row) {
            if ($row['label'] === 'Typ oferty') {
                $offer_type = $row['value'];
                break;
            }
        }
        if ((isset($ld['@type']) && $ld['@type'] === 'House') || self::starts_with($offer_type, 'dom')) {
            return 'house';
        }
        if (self::starts_with($offer_type, 'działka')) {
            return 'plot';
        }
        if (self::starts_with($offer_type, 'lokal') || self::starts_with($offer_type, 'budynek')) {
            return 'commercial';
        }
        return 'apartment';
    }

    /** Ogłoszenie → tablica w kształcie typu `Property` (types/property.ts). */
    private static function to_property(array $offer, $html)
    {
        $ld      = self::parse_json_ld($html);
        $details = self::parse_details($html);
        $photos  = self::parse_photos($html);

        $props = array();
        foreach (isset($ld['additionalProperty']) ? $ld['additionalProperty'] : array() as $prop) {
            if (isset($prop['name'])) {
                $props[$prop['name']] = isset($prop['value']) ? $prop['value'] : '';
            }
        }
        $prop = function ($name) use ($props) {
            return isset($props[$name]) ? $props[$name] : null;
        };

        $title  = $offer['title'];
        $city   = isset($ld['address']['addressLocality']) ? $ld['address']['addressLocality'] : '';
        $street = isset($ld['address']['streetAddress']) ? $ld['address']['streetAddress'] : '';
        // Bez ulicy w JSON-LD bierzemy pierwszą część adresu (zwykle osiedle/dzielnica).
        $parts           = explode(',', self::detail($details, 'Adres'));
        $district        = trim($parts[0]);
        $charakterystyka = self::detail($details, 'Charakterystyka');

        // Liczba poziomów lokalu: tylko gdy portal ją podaje (0 = brak danych, UI ukrywa).
        $layout = self::detail($details, 'Rozkład');
        $floors = preg_match('/dwupoziomowe/u', $layout) ? 2 : (preg_match('/jednopoziomowe/u', $layout) ? 1 : 0);

        $rooms = (int) $prop('Number of rooms');
        if (!$rooms && preg_match('/(\d+) pok/u', $charakterystyka, $m)) {
            $rooms = (int) $m[1];
        }
        $bathrooms = (int) $prop('Number of bathrooms');
        if (!$bathrooms && preg_match('/(\d+) łazien/u', $charakterystyka, $m)) {
            $bathrooms = (int) $m[1];
        }

        $area = $prop('Floor size');
        if ($area === null) {
            $area = $prop('House area');
        }
        if ($area === null) {
            $area = $prop('Land area');
        }

        if ($street) {
            $location = $city . ', ul. ' . $street;
        } elseif ($district && $district !== $city) {
            $location = $city . ', ' . $district;
        } else {
            $location = $city;
        }

        $features = self::parse_highlights($html);
        foreach ($details as $row) {
            if (!in_array($row['label'], self::SKIPPED_DETAILS, true)) {
                $features[] = $row['label'] . ': ' . $row['value'];
            }
        }

        return array(
            'id'          => $offer['id'],
            'slug'        => self::slugify($title . ' ' . (strpos($title, $city) !== false ? '' : $city)) . '-' . $offer['id'],
            'title'       => $title,
            'location'    => $location,
            'price'       => (float) $ld['offers'][0]['price'],
            'area'        => self::parse_number($area),
            'type'        => self::map_type($ld, $details),
            'bedrooms'    => $rooms,
            'bathrooms'   => $bathrooms,
            'floors'      => $floors,
            'yearBuilt'   => (int) $prop('Year built'),
            'description' => self::parse_description($html),
            'features'    => $features,
            'gallery'     => $photos,
            'sourceUrl'   => $offer['url'],
        );
    }
}
