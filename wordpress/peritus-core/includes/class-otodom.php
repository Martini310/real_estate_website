<?php
/**
 * Oferty biura z Otodom (drugie, opcjonalne źródło — część ofert Damian wystawia tylko tam).
 *
 * Otodom nie ma publicznego API do odczytu, ale każda strona zawiera dane w JSON-ie
 * Next.js (`__NEXT_DATA__`): profil biura → lista ofert, strona oferty → komplet pól.
 * Profil pokazuje najwyżej 6 ofert i nie stronicuje przez adres URL, więc pełną listę
 * składamy z dwóch sortowań (najnowsze + najstarsze) — wystarcza do 12 ofert. Gdy ofert
 * jest więcej, import Otodom przerywa się z błędem zamiast po cichu pominąć resztę.
 *
 * Wynik: tablice w kształcie typu `Property` (jak Peritus_Importer::to_property) plus
 * pola do wykrywania duplikatów (`match`).
 */

if (!defined('ABSPATH')) {
    exit;
}

class Peritus_Otodom
{
    const AGENCY_URL = 'https://www.otodom.pl/pl/firmy/biura-nieruchomosci/peritus-ID11540480';
    const AD_URL     = 'https://www.otodom.pl/pl/oferta/';

    /** Sortowania profilu biura, których suma daje pełną listę (6 + 6 ofert). */
    const LIST_SORTS = array('', '?by=LATEST&direction=ASC');

    const TYPES = array(
        'FLAT'    => 'apartment',
        'HOUSE'   => 'house',
        'TERRAIN' => 'plot',
    );

    /**
     * Kody atrybutów Otodom → polskie nazwy (grupa → kod → nazwa). Nieznane kody
     * pomijamy, zamiast pokazywać na stronie surowe „heating::urban”.
     */
    const LABELS = array(
        'market'              => array('primary' => 'pierwotny', 'secondary' => 'wtórny'),
        'construction_status' => array('ready_to_use' => 'do zamieszkania', 'to_completion' => 'do wykończenia', 'to_renovation' => 'do remontu'),
        'building_ownership'  => array('full_ownership' => 'pełna własność', 'limited_ownership' => 'spółdzielcze własnościowe', 'share' => 'udział', 'usufruct' => 'użytkowanie wieczyste'),
        'building_type'       => array('block' => 'blok', 'tenement' => 'kamienica', 'apartment' => 'apartamentowiec', 'loft' => 'loft', 'detached' => 'wolnostojący', 'semi_detached' => 'bliźniak', 'ribbon' => 'szeregowiec', 'terraced' => 'szeregowiec', 'infill' => 'plomba', 'house' => 'dom'),
        'building_material'   => array('brick' => 'cegła', 'concrete_plate' => 'wielka płyta', 'concrete' => 'beton', 'reinforced_concrete' => 'żelbet', 'cellular_concrete' => 'beton komórkowy', 'silikat' => 'silikat', 'breezeblock' => 'pustak', 'hydroton' => 'keramzyt', 'wood' => 'drewno'),
        'heating'             => array('urban' => 'miejskie', 'gas' => 'gazowe', 'electrical' => 'elektryczne', 'boiler_room' => 'kotłownia', 'tiled_stove' => 'piece kaflowe', 'heat_pump' => 'pompa ciepła'),
        'windows_type'        => array('plastic' => 'plastikowe', 'wooden' => 'drewniane', 'aluminium' => 'aluminiowe'),
        'extras_types'        => array('balcony' => 'balkon', 'terrace' => 'taras', 'garden' => 'ogródek', 'basement' => 'piwnica', 'usable_room' => 'pomieszczenie użytkowe', 'garage' => 'garaż / miejsce parkingowe', 'lift' => 'winda', 'separate_kitchen' => 'oddzielna kuchnia', 'two_storey' => 'dwupoziomowe', 'air_conditioning' => 'klimatyzacja'),
        'equipment_types'     => array('furniture' => 'meble', 'dishwasher' => 'zmywarka', 'fridge' => 'lodówka', 'oven' => 'piekarnik', 'stove' => 'kuchenka', 'washing_machine' => 'pralka', 'tv' => 'telewizor'),
        'media_types'         => array('electricity' => 'prąd', 'water' => 'woda', 'gas' => 'gaz', 'sewage' => 'kanalizacja', 'cesspool' => 'szambo', 'internet' => 'internet', 'telephone' => 'telefon', 'cable-television' => 'telewizja kablowa'),
        'security_types'      => array('entryphone' => 'domofon/wideofon', 'anti_burglary_door' => 'drzwi antywłamaniowe', 'roller_shutters' => 'rolety antywłamaniowe', 'alarm' => 'system alarmowy', 'monitoring' => 'monitoring / ochrona', 'closed_area' => 'teren zamknięty'),
        'access_types'        => array('hard_surfaced' => 'droga utwardzona', 'asphalt' => 'droga asfaltowa', 'soft_surfaced' => 'droga nieutwardzona'),
        'fence'               => array('y' => 'ogrodzona', 'n' => 'nieogrodzona'),
        'vicinity_types'      => array('forest' => 'las', 'lake' => 'jezioro', 'park' => 'park', 'open_terrain' => 'otwarty teren', 'sea' => 'morze', 'mountains' => 'góry'),
        'type'                => array('building' => 'budowlana', 'agricultural' => 'rolna', 'recreational' => 'rekreacyjna', 'investment' => 'inwestycyjna', 'forest' => 'leśna'),
    );

    /** Wszystkie oferty biura z Otodom. Każdy problem = wyjątek (importer traktuje Otodom jako opcjonalny). */
    public static function fetch_all()
    {
        $items = array();
        $total = 0;
        foreach (self::LIST_SORTS as $query) {
            $search = self::next_data(Peritus_Importer::fetch(self::AGENCY_URL . $query));
            if (!isset($search['searchAds']['items']) || !is_array($search['searchAds']['items'])) {
                throw new RuntimeException('Otodom: brak listy ofert na profilu biura.');
            }
            $total = (int) $search['searchAds']['pagination']['totalItems'];
            foreach ($search['searchAds']['items'] as $item) {
                $items[$item['id']] = $item;
            }
            sleep(1);
        }
        if (count($items) < $total) {
            throw new RuntimeException(sprintf('Otodom: profil ma %d ofert, odczytano %d (obsługiwane do 12) — import Otodom wymaga rozbudowy.', $total, count($items)));
        }

        $properties = array();
        foreach ($items as $item) {
            sleep(1);
            $page = self::next_data(Peritus_Importer::fetch(self::AD_URL . $item['slug']));
            if (empty($page['ad']['id'])) {
                throw new RuntimeException('Otodom: brak danych ogłoszenia ' . $item['slug']);
            }
            $properties[] = self::to_property($item, $page['ad']);
        }
        return $properties;
    }

    /** `props.pageProps` z JSON-a Next.js na stronie Otodom. */
    private static function next_data($html)
    {
        if (!preg_match('/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/', $html, $match)) {
            throw new RuntimeException('Otodom: brak danych strony (__NEXT_DATA__) — możliwa blokada lub zmiana serwisu.');
        }
        $data = json_decode($match[1], true);
        if (!isset($data['props']['pageProps'])) {
            throw new RuntimeException('Otodom: nieoczekiwany format danych strony.');
        }
        return $data['props']['pageProps'];
    }

    /** Atrybuty ogłoszenia: etykieta → lista wartości (np. 'extras_types' → ['extras_types::balcony']). */
    private static function attributes(array $ad)
    {
        $attributes = array();
        foreach (array('topInformation', 'additionalInformation') as $block) {
            foreach (isset($ad[$block]) ? $ad[$block] : array() as $row) {
                $attributes[$row['label']] = $row['values'];
            }
        }
        return $attributes;
    }

    /** ['heating::urban', 'security_types-101::alarm'] → ['miejskie', 'system alarmowy'] */
    private static function translate(array $values)
    {
        $names = array();
        foreach ($values as $value) {
            $parts = explode('::', (string) $value, 2);
            if (count($parts) !== 2) {
                continue;
            }
            $group = preg_replace('/-\d+$/', '', $parts[0]);
            if (isset(self::LABELS[$group][$parts[1]])) {
                $names[] = self::LABELS[$group][$parts[1]];
            }
        }
        return $names;
    }

    /** 'floor_no::floor_2' → 2, parter → 0, suterena → -1, nieznane → null */
    private static function parse_floor($value)
    {
        $code = preg_replace('/^.*::/', '', (string) $value);
        if ($code === 'ground_floor') {
            return 0;
        }
        if ($code === 'cellar') {
            return -1;
        }
        if (preg_match('/^floor_(\d+)$/', $code, $m)) {
            return (int) $m[1];
        }
        return null;
    }

    /**
     * Opis HTML (akapity, listy) → tekst z akapitami w osobnych liniach, jak z nieruchomosci-online.
     * Pozycje list dostają „- ”, żeby strona (lib/description.ts) rozpoznała listę po znaczniku.
     */
    private static function description_text($html)
    {
        $text  = preg_replace('/<li\b[^>]*>/i', "\n- ", (string) $html);
        $text  = preg_replace('/<\s*(br|\/p|\/li|\/h\d|\/div)\s*\/?>/i', "\n", $text);
        $text  = html_entity_decode(strip_tags($text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $lines = array_filter(array_map(function ($line) {
            return trim(preg_replace('/\s+/u', ' ', $line));
        }, explode("\n", $text)), 'strlen');
        return implode("\n", $lines);
    }

    /** Krótki tytuł w stylu nieruchomosci-online zamiast marketingowego „2 pokoje | … | 0% PCC”. */
    private static function title($type, $rooms, $plot_kind, $place)
    {
        if ($type === 'apartment') {
            $name = $rooms === 1 ? 'Kawalerka' : ($rooms > 1 ? 'Mieszkanie ' . $rooms . '-pokojowe' : 'Mieszkanie');
        } elseif ($type === 'house') {
            $name = 'Dom';
        } elseif ($type === 'plot') {
            $name = $plot_kind ? 'Działka ' . $plot_kind : 'Działka';
        } else {
            $name = 'Lokal użytkowy';
        }
        return $place ? $name . ', ' . $place : $name;
    }

    /** Ogłoszenie Otodom → tablica w kształcie `Property` + `match` do wykrywania duplikatów. */
    private static function to_property(array $item, array $ad)
    {
        $attributes = self::attributes($ad);
        $first      = function ($label) use ($attributes) {
            return isset($attributes[$label][0]) ? (string) $attributes[$label][0] : '';
        };
        $names      = function ($label) use ($attributes) {
            return isset($attributes[$label]) ? self::translate($attributes[$label]) : array();
        };

        $type = isset(self::TYPES[$item['estate']]) ? self::TYPES[$item['estate']] : 'commercial';

        // Miejscowość i osiedle z geokodowania Otodom (adres w ogłoszeniu bywa pusty).
        $city  = '';
        $place = '';
        foreach ($ad['location']['reverseGeocoding']['locations'] as $location) {
            if ($location['locationLevel'] === 'city_or_village') {
                $city = $location['name'];
            } elseif (in_array($location['locationLevel'], array('district', 'residential'), true)) {
                $place = $location['name']; // „residential” jest po „district” → wygrywa dokładniejsze
            }
        }
        $street = isset($ad['location']['address']['street']['name']) ? trim($ad['location']['address']['street']['name']) : '';

        $rooms   = (int) $first('rooms_num');
        $plot    = self::translate(isset($attributes['terrain_type']) ? $attributes['terrain_type'] : array());
        $title   = self::title($type, $rooms, $plot ? $plot[0] : '', $street ? $street : ($place ? $place : $city));
        $floor   = self::parse_floor($first('floor'));
        $gallery = array_values(array_filter(array_map(function ($image) {
            return isset($image['url']) ? $image['url'] : '';
        }, $ad['images'])));
        if (!$gallery) {
            throw new RuntimeException('Otodom: oferta bez zdjęć ' . $item['slug']);
        }

        // Cechy w formacie „Etykieta: wartość”, jak tabela szczegółów z nieruchomosci-online.
        $features = $ad['exclusiveOffer'] ? array('Oferta na wyłączność') : array();
        $add      = function ($label, $values) use (&$features) {
            $values = array_filter((array) $values, 'strlen');
            if ($values) {
                $features[] = $label . ': ' . implode(', ', $values);
            }
        };
        $add('Rynek', $names('market'));
        $add('Stan', $names('construction_status'));
        $add('Forma własności', $names('building_ownership'));
        if ($first('free_from')) {
            $add('Dostępne od', wp_date('d.m.Y', strtotime($first('free_from'))));
        }
        $building = $names('building_type');
        if ($first('build_year')) {
            $building[] = 'rok budowy: ' . $first('build_year');
        }
        if ($names('building_material')) {
            $building[] = 'materiał: ' . implode(', ', $names('building_material'));
        }
        $add('Budynek', implode('; ', $building));
        if ($floor !== null) {
            $add('Piętro', ($floor === 0 ? 'parter' : ($floor < 0 ? 'suterena' : (string) $floor)) . ($first('floors_num') ? ' / ' . $first('floors_num') : ''));
        }
        $add('Czynsz', $first('rent'));
        $extras = $names('extras_types');
        if (isset($attributes['lift']) && in_array('::y', $attributes['lift'], true)) {
            $extras[] = 'winda';
        }
        $add('Dodatkowo', array_unique($extras));
        $add('Wyposażenie', $names('equipment_types'));
        $add('Ogrzewanie', $names('heating'));
        $add('Okna', $names('windows_type'));
        $add('Media', $names('media_types'));
        $add('Bezpieczeństwo', $names('security_types'));
        if ($type === 'plot') {
            $add('Wymiary działki', $first('dimensions'));
            $add('Dojazd', $names('access_types'));
            $add('Ogrodzenie', $names('fence'));
        }
        $add('Okolica', $names('vicinity_types'));

        return array(
            'id'          => (int) $ad['id'],
            'slug'        => Peritus_Importer::slugify($title . ' ' . (strpos($title, $city) !== false ? '' : $city)) . '-' . (int) $ad['id'],
            'title'       => $title,
            'location'    => $street ? $city . ', ' . $street : ($place && $place !== $city ? $city . ', ' . $place : $city),
            'price'       => isset($item['totalPrice']['value']) ? (float) $item['totalPrice']['value'] : 0,
            'area'        => (float) $item['areaInSquareMeters'],
            'type'        => $type,
            'bedrooms'    => $rooms,
            'bathrooms'   => 0, // Otodom nie podaje — UI ukrywa
            'floors'      => in_array('dwupoziomowe', $extras, true) ? 2 : 0,
            'yearBuilt'   => (int) $first('build_year'),
            'description' => self::description_text($ad['description']),
            'features'    => $features,
            'gallery'     => $gallery,
            'sourceUrl'   => $ad['url'],
            'source'      => 'otodom',
            'otodomUrl'   => '',
            'match'       => array(
                'lat'   => isset($ad['location']['coordinates']['latitude']) ? (float) $ad['location']['coordinates']['latitude'] : null,
                'lon'   => isset($ad['location']['coordinates']['longitude']) ? (float) $ad['location']['coordinates']['longitude'] : null,
                'floor' => $floor,
            ),
        );
    }
}
