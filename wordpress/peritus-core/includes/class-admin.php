<?php
/**
 * Oferty → Import z portali: wynik ostatniego importu, przycisk „Importuj teraz”,
 * stan harmonogramu i ostatnie odświeżenie strony.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Peritus_Admin
{
    const PAGE = 'peritus-import';

    public static function init()
    {
        add_action('admin_menu', array(__CLASS__, 'menu'));
        add_action('admin_post_peritus_import_now', array(__CLASS__, 'handle_import'));
    }

    public static function menu()
    {
        add_submenu_page(
            'edit.php?post_type=' . Peritus_Offers::POST_TYPE,
            'Import z portali',
            'Import z portali',
            'manage_options',
            self::PAGE,
            array(__CLASS__, 'render')
        );
    }

    public static function handle_import()
    {
        if (!current_user_can('manage_options')) {
            wp_die('Brak uprawnień.');
        }
        check_admin_referer('peritus_import_now');
        Peritus_Importer::run('ręcznie');
        wp_safe_redirect(admin_url('edit.php?post_type=' . Peritus_Offers::POST_TYPE . '&page=' . self::PAGE . '&done=1'));
        exit;
    }

    private static function format_time($timestamp)
    {
        return $timestamp ? wp_date('j.m.Y, H:i', $timestamp) : '—';
    }

    /** Wiersze o Otodom: wynik, liczba ofert tylko z Otodom, połączone duplikaty (z różnicą ceny). */
    private static function render_otodom_rows($otodom)
    {
        if (!$otodom) {
            return;
        }
        if (!$otodom['ok']) {
            echo '<tr><th>Otodom</th><td><strong>Błąd:</strong> ' . esc_html($otodom['error']) . '<br>Oferty z nieruchomosci-online.pl zaimportowane, oferty z Otodom bez zmian.</td></tr>';
            return;
        }
        printf('<tr><th>Otodom</th><td>%d ofert, w tym %d tylko na Otodom</td></tr>', (int) $otodom['count'], (int) $otodom['only']);
        if (!$otodom['merged']) {
            return;
        }
        echo '<tr><th>Na obu portalach<br><span class="description">(pokazywane raz)</span></th><td><ul style="margin:0">';
        foreach ($otodom['merged'] as $pair) {
            $diff = '';
            if ((float) $pair['price'] !== (float) $pair['otodom_price']) {
                $diff = sprintf(' — <strong>inna cena na Otodom: %s zł</strong> (na stronie: %s zł)', number_format((float) $pair['otodom_price'], 0, ',', ' '), number_format((float) $pair['price'], 0, ',', ' '));
            }
            printf('<li><a href="%s" target="_blank" rel="noopener">%s ↗</a>%s</li>', esc_url($pair['otodom_url']), esc_html($pair['title']), $diff);
        }
        echo '</ul></td></tr>';
    }

    public static function render()
    {
        $log        = get_option(Peritus_Importer::LOG_OPTION);
        $revalidate = get_option(Peritus_Revalidate::LOG_OPTION);
        $next_run   = wp_next_scheduled(Peritus_Importer::CRON_HOOK);
        ?>
        <div class="wrap">
            <h1>Import ofert z nieruchomosci-online.pl i Otodom</h1>
            <p>Oferty dodajesz na portalach. Raz dziennie WordPress pobiera je stamtąd i aktualizuje stronę.
                Oferta wystawiona na obu portalach pojawia się na stronie raz (w wersji z nieruchomosci-online.pl).
                Oferty zdjęte z portali trafiają do szkiców; ustawienia „Wyróżniona” i „Ukryta” zostają.</p>

            <?php if (isset($_GET['done'])) : ?>
                <div class="notice <?php echo $log && $log['ok'] ? 'notice-success' : 'notice-error'; ?> is-dismissible">
                    <p><?php echo $log && $log['ok'] ? 'Import zakończony.' : 'Import nie powiódł się — szczegóły poniżej. Istniejące oferty nie zostały zmienione.'; ?></p>
                </div>
            <?php endif; ?>

            <h2>Ostatni import</h2>
            <?php if ($log) : ?>
                <table class="widefat striped" style="max-width:640px">
                    <tbody>
                    <tr><th style="width:200px">Kiedy</th><td><?php echo esc_html(self::format_time($log['time']) . ' (' . $log['trigger'] . ')'); ?></td></tr>
                    <tr><th>Wynik</th><td><?php echo $log['ok'] ? 'Udany' : '<strong>Błąd:</strong> ' . esc_html($log['error']); ?></td></tr>
                    <?php if ($log['ok']) : ?>
                        <tr><th>Nowe / zmienione</th><td><?php echo (int) $log['created'] . ' / ' . (int) $log['updated']; ?></td></tr>
                        <tr><th>Bez zmian</th><td><?php echo (int) $log['unchanged']; ?></td></tr>
                        <tr><th>Zdjęte z portali</th><td><?php echo (int) $log['removed']; ?></td></tr>
                        <?php self::render_otodom_rows(isset($log['otodom']) ? $log['otodom'] : null); ?>
                    <?php endif; ?>
                    </tbody>
                </table>
            <?php else : ?>
                <p>Import jeszcze się nie odbył.</p>
            <?php endif; ?>

            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="margin-top:16px">
                <input type="hidden" name="action" value="peritus_import_now">
                <?php wp_nonce_field('peritus_import_now'); ?>
                <?php submit_button('Importuj teraz', 'primary', 'submit', false); ?>
                <span class="description" style="margin-left:8px">Trwa ok. 1–2 s na ofertę.</span>
            </form>

            <h2 style="margin-top:32px">Harmonogram i strona</h2>
            <table class="widefat striped" style="max-width:640px">
                <tbody>
                <tr><th style="width:200px">Następny import</th><td><?php echo esc_html(self::format_time($next_run)); ?></td></tr>
                <tr>
                    <th>Odświeżanie strony</th>
                    <td>
                        <?php if (!Peritus_Revalidate::is_configured()) : ?>
                            Nieskonfigurowane — strona odświeży oferty sama w ciągu godziny.
                            Dodaj <code>PERITUS_REVALIDATE_URL</code> i <code>PERITUS_REVALIDATE_SECRET</code> w <code>wp-config.php</code>.
                        <?php elseif ($revalidate) : ?>
                            <?php echo esc_html(self::format_time($revalidate['time']) . ' — ' . $revalidate['reason'] . ' (odpowiedź: ' . $revalidate['status'] . ')'); ?>
                        <?php else : ?>
                            Skonfigurowane, jeszcze nie wywołane.
                        <?php endif; ?>
                    </td>
                </tr>
                <tr><th>API dla strony</th><td><code><?php echo esc_html(rest_url(Peritus_Rest::NAMESPACE_V1 . '/offers')); ?></code></td></tr>
                </tbody>
            </table>
        </div>
        <?php
    }
}
