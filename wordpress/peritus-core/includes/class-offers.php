<?php
/**
 * Typ treści „Oferta” (peritus_offer) i jej pola.
 *
 * Pola importowane z portalu są tylko do odczytu w panelu — importer nadpisuje je
 * przy każdym uruchomieniu (źródłem prawdy jest nieruchomosci-online.pl).
 * Ręczne flagi „Wyróżniona” i „Ukryta” należą do właściciela i importer ich nie rusza.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Peritus_Offers
{
    const POST_TYPE = 'peritus_offer';

    /** Klucze meta (z podkreślnikiem — ukryte w natywnym panelu „Własne pola”). */
    const META = array(
        'source_id'  => '_peritus_source_id',
        'source_url' => '_peritus_source_url',
        'location'   => '_peritus_location',
        'price'      => '_peritus_price',
        'area'       => '_peritus_area',
        'type'       => '_peritus_type',
        'bedrooms'   => '_peritus_bedrooms',
        'bathrooms'  => '_peritus_bathrooms',
        'floors'     => '_peritus_floors',
        'year_built' => '_peritus_year_built',
        'gallery'    => '_peritus_gallery',
        'features'   => '_peritus_features',
        'hash'       => '_peritus_hash',
        'featured'   => '_peritus_featured',
        'hidden'     => '_peritus_hidden',
    );

    const TYPES = array(
        'apartment'  => 'Mieszkanie',
        'house'      => 'Dom',
        'plot'       => 'Działka',
        'commercial' => 'Lokal',
    );

    public static function init()
    {
        add_action('init', array(__CLASS__, 'register_post_type'));
        add_action('add_meta_boxes', array(__CLASS__, 'add_meta_boxes'));
        add_action('save_post_' . self::POST_TYPE, array(__CLASS__, 'save_flags'), 10, 2);
        add_filter('manage_' . self::POST_TYPE . '_posts_columns', array(__CLASS__, 'columns'));
        add_action('manage_' . self::POST_TYPE . '_posts_custom_column', array(__CLASS__, 'column_content'), 10, 2);
    }

    public static function register_post_type()
    {
        register_post_type(self::POST_TYPE, array(
            'labels' => array(
                'name'          => 'Oferty',
                'singular_name' => 'Oferta',
                'menu_name'     => 'Oferty',
                'all_items'     => 'Wszystkie oferty',
                'edit_item'     => 'Oferta',
                'search_items'  => 'Szukaj ofert',
                'not_found'     => 'Brak ofert — uruchom import (Oferty → Import z portalu).',
            ),
            // Strona publiczna to Next.js — WordPress nie renderuje ofert sam.
            'public'          => false,
            'show_ui'         => true,
            'show_in_menu'    => true,
            'show_in_rest'    => false,
            'menu_icon'       => 'dashicons-admin-home',
            'menu_position'   => 5,
            'supports'        => array('title'),
            'capability_type' => 'post',
            // Oferty tworzy wyłącznie importer.
            'capabilities'    => array('create_posts' => 'do_not_allow'),
            'map_meta_cap'    => true,
        ));
    }

    public static function get_meta($post_id, $key)
    {
        return get_post_meta($post_id, self::META[$key], true);
    }

    /** ID wpisu WP dla ID ogłoszenia z portalu (dowolny status), albo 0. */
    public static function find_by_source_id($source_id)
    {
        $posts = get_posts(array(
            'post_type'      => self::POST_TYPE,
            'post_status'    => 'any',
            'meta_key'       => self::META['source_id'],
            'meta_value'     => (string) $source_id,
            'fields'         => 'ids',
            'posts_per_page' => 1,
        ));
        return $posts ? (int) $posts[0] : 0;
    }

    // --- panel ---------------------------------------------------------------

    public static function add_meta_boxes()
    {
        add_meta_box('peritus_flags', 'Widoczność na stronie', array(__CLASS__, 'render_flags_box'), self::POST_TYPE, 'side', 'high');
        add_meta_box('peritus_details', 'Dane z portalu (tylko do odczytu)', array(__CLASS__, 'render_details_box'), self::POST_TYPE, 'normal', 'high');
    }

    public static function render_flags_box($post)
    {
        wp_nonce_field('peritus_flags', 'peritus_flags_nonce');
        $featured = (bool) self::get_meta($post->ID, 'featured');
        $hidden   = (bool) self::get_meta($post->ID, 'hidden');
        ?>
        <p>
            <label>
                <input type="checkbox" name="peritus_featured" value="1" <?php checked($featured); ?>>
                <strong>Wyróżniona</strong> — pokazywana na początku listy
            </label>
        </p>
        <p>
            <label>
                <input type="checkbox" name="peritus_hidden" value="1" <?php checked($hidden); ?>>
                <strong>Ukryta</strong> — nie pokazuj na stronie
            </label>
        </p>
        <p class="description">Te ustawienia zostają po kolejnych importach.</p>
        <?php
    }

    public static function render_details_box($post)
    {
        $url     = self::get_meta($post->ID, 'source_url');
        $type    = self::get_meta($post->ID, 'type');
        $gallery = json_decode((string) self::get_meta($post->ID, 'gallery'), true);
        $rows    = array(
            'Typ'          => isset(self::TYPES[$type]) ? self::TYPES[$type] : $type,
            'Lokalizacja'  => self::get_meta($post->ID, 'location'),
            'Cena'         => number_format((float) self::get_meta($post->ID, 'price'), 0, ',', ' ') . ' zł',
            'Powierzchnia' => rtrim(rtrim(number_format((float) self::get_meta($post->ID, 'area'), 2, ',', ' '), '0'), ',') . ' m²',
            'Pokoje'       => self::get_meta($post->ID, 'bedrooms'),
            'Zdjęcia'      => is_array($gallery) ? count($gallery) : 0,
        );
        echo '<p class="description">Treść oferty zmieniasz na nieruchomosci-online.pl — import nadpisuje te dane raz dziennie.</p>';
        echo '<table class="widefat striped"><tbody>';
        foreach ($rows as $label => $value) {
            printf('<tr><th style="width:140px">%s</th><td>%s</td></tr>', esc_html($label), esc_html((string) $value));
        }
        echo '</tbody></table>';
        if ($url) {
            printf('<p><a href="%s" target="_blank" rel="noopener">Zobacz ogłoszenie na portalu ↗</a></p>', esc_url($url));
        }
    }

    public static function save_flags($post_id, $post)
    {
        if (!isset($_POST['peritus_flags_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['peritus_flags_nonce'])), 'peritus_flags')) {
            return;
        }
        if ((defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || !current_user_can('edit_post', $post_id)) {
            return;
        }
        update_post_meta($post_id, self::META['featured'], empty($_POST['peritus_featured']) ? '' : '1');
        update_post_meta($post_id, self::META['hidden'], empty($_POST['peritus_hidden']) ? '' : '1');
        Peritus_Revalidate::request('zmiana flag oferty');
    }

    public static function columns($columns)
    {
        return array(
            'cb'               => $columns['cb'],
            'title'            => 'Oferta',
            'peritus_price'    => 'Cena',
            'peritus_location' => 'Lokalizacja',
            'peritus_flags'    => 'Na stronie',
            'date'             => $columns['date'],
        );
    }

    public static function column_content($column, $post_id)
    {
        if ($column === 'peritus_price') {
            echo esc_html(number_format((float) self::get_meta($post_id, 'price'), 0, ',', ' ') . ' zł');
        } elseif ($column === 'peritus_location') {
            echo esc_html((string) self::get_meta($post_id, 'location'));
        } elseif ($column === 'peritus_flags') {
            if (get_post_status($post_id) !== 'publish') {
                echo 'Zdjęta z portalu';
            } elseif (self::get_meta($post_id, 'hidden')) {
                echo 'Ukryta';
            } else {
                echo self::get_meta($post_id, 'featured') ? 'Tak, wyróżniona' : 'Tak';
            }
        }
    }
}
