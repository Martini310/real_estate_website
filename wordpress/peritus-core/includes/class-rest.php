<?php
/**
 * GET /wp-json/peritus/v1/offers — lista ofert dokładnie w kształcie typu
 * `Property` z repozytorium Next.js (types/property.ts). Jeden kontrakt, jedno
 * zapytanie: strona nie musi znać pól WordPressa.
 *
 * Zwraca opublikowane, nieukryte oferty: najpierw wyróżnione, potem w kolejności
 * z profilu agenta na portalu.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Peritus_Rest
{
    const NAMESPACE_V1 = 'peritus/v1';

    /** Opiekun ofert — jeden agent. Zdjęcie to ścieżka w aplikacji Next (public/). */
    const AGENT = array(
        'name'  => 'Damian Rożewski',
        'phone' => '+48 732 432 920',
        'email' => 'damian@peritus-nieruchomosci.pl',
        'image' => '/damian.webp',
    );

    public static function init()
    {
        add_action('rest_api_init', array(__CLASS__, 'register_routes'));
    }

    public static function register_routes()
    {
        register_rest_route(self::NAMESPACE_V1, '/offers', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array(__CLASS__, 'get_offers'),
            'permission_callback' => '__return_true', // dane publiczne (te same co na portalu)
        ));
    }

    public static function get_offers()
    {
        $posts = get_posts(array(
            'post_type'      => Peritus_Offers::POST_TYPE,
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'orderby'        => 'menu_order',
            'order'          => 'ASC',
            'meta_query'     => array(
                'relation' => 'OR',
                array('key' => Peritus_Offers::META['hidden'], 'compare' => 'NOT EXISTS'),
                array('key' => Peritus_Offers::META['hidden'], 'value' => '1', 'compare' => '!='),
            ),
        ));

        $offers = array_map(array(__CLASS__, 'to_property'), $posts);

        // Wyróżnione na początku; poza tym kolejność z portalu (stabilnie).
        $featured = array_values(array_filter($offers, function ($offer) {
            return $offer['featured'];
        }));
        $rest = array_values(array_filter($offers, function ($offer) {
            return !$offer['featured'];
        }));

        $response = rest_ensure_response(array_merge($featured, $rest));
        // Krótki cache po stronie przeglądarki/CDN; właściwe odświeżanie robi Next (tag „offers”).
        $response->header('Cache-Control', 'public, max-age=60');
        return $response;
    }

    private static function to_property(WP_Post $post)
    {
        $meta = function ($key) use ($post) {
            return Peritus_Offers::get_meta($post->ID, $key);
        };
        $gallery  = json_decode((string) $meta('gallery'), true);
        $features = json_decode((string) $meta('features'), true);
        $gallery  = is_array($gallery) ? array_values($gallery) : array();

        return array(
            'id'          => (int) $meta('source_id'),
            'slug'        => $post->post_name,
            'title'       => get_the_title($post),
            'location'    => (string) $meta('location'),
            'price'       => (float) $meta('price'),
            'area'        => (float) $meta('area'),
            'type'        => (string) $meta('type'),
            'bedrooms'    => (int) $meta('bedrooms'),
            'bathrooms'   => (int) $meta('bathrooms'),
            'floors'      => (int) $meta('floors'),
            'yearBuilt'   => (int) $meta('year_built'),
            'featured'    => (bool) $meta('featured'),
            'image'       => $gallery ? $gallery[0] : '',
            'description' => $post->post_content,
            'features'    => is_array($features) ? array_values($features) : array(),
            'agent'       => self::AGENT,
            'gallery'     => $gallery,
            'sourceUrl'   => (string) $meta('source_url'),
        );
    }
}
