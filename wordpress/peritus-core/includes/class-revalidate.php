<?php
/**
 * Powiadomienie strony Next.js o zmianie ofert (on-demand revalidation).
 *
 * Konfiguracja w wp-config.php (poza repozytorium, sekret nie trafia do bazy):
 *   define('PERITUS_REVALIDATE_URL', 'https://peritus-nieruchomosci.pl/api/revalidate');
 *   define('PERITUS_REVALIDATE_SECRET', '…ten sam co REVALIDATE_SECRET na Vercelu…');
 *
 * Bez tych stałych nic się nie dzieje — strona i tak odświeża oferty co godzinę.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Peritus_Revalidate
{
    const LOG_OPTION = 'peritus_revalidate_log';

    /** Importer wstrzymuje pojedyncze powiadomienia i wysyła jedno na końcu. */
    public static $suspended = false;

    /** Najwyżej jedno powiadomienie na żądanie PHP (zapis w panelu wywołuje kilka hooków). */
    private static $sent = false;

    public static function init()
    {
        // Zmiana statusu oferty w panelu (np. przeniesienie do kosza) też odświeża stronę.
        add_action('transition_post_status', function ($new_status, $old_status, $post) {
            if ($post->post_type === Peritus_Offers::POST_TYPE && $new_status !== $old_status && !self::$suspended) {
                self::request('zmiana statusu oferty');
            }
        }, 10, 3);
    }

    public static function is_configured()
    {
        return defined('PERITUS_REVALIDATE_URL') && defined('PERITUS_REVALIDATE_SECRET') && PERITUS_REVALIDATE_URL && PERITUS_REVALIDATE_SECRET;
    }

    /** Wywołuje webhook strony; wynik zapisuje do logu widocznego w panelu. */
    public static function request($reason)
    {
        if (!self::is_configured() || self::$suspended || self::$sent) {
            return;
        }
        self::$sent = true;

        $response = wp_remote_post(PERITUS_REVALIDATE_URL, array(
            'timeout' => 10,
            'headers' => array(
                'Content-Type'        => 'application/json',
                'x-revalidate-secret' => PERITUS_REVALIDATE_SECRET,
            ),
            'body'    => wp_json_encode(array('tag' => 'offers', 'reason' => $reason)),
        ));

        update_option(self::LOG_OPTION, array(
            'time'   => time(),
            'reason' => $reason,
            'status' => is_wp_error($response) ? $response->get_error_message() : wp_remote_retrieve_response_code($response),
        ), false);
    }
}
