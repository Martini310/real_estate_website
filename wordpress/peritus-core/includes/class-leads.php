<?php
/**
 * Zgłoszenia z formularzy strony (kontakt, „Umów prezentację”, bezpłatna wycena).
 *
 * Przepływ: formularz → Next `/api/lead` (honeypot, IP) → POST /wp-json/peritus/v1/leads
 * (wspólny sekret) → zapis jako „Zgłoszenie” w panelu → e-mail do odbiorców z ustawień.
 * Zgłoszenie zapisuje się ZAWSZE przed wysyłką maila — nawet gdy poczta zawiedzie,
 * nic nie przepada (widać je w Zgłoszenia, z informacją, czy mail wyszedł).
 */

if (!defined('ABSPATH')) {
    exit;
}

class Peritus_Leads
{
    const POST_TYPE          = 'peritus_lead';
    const OPTION_RECIPIENTS  = 'peritus_lead_recipients';
    const DEFAULT_RECIPIENTS = 'martin@peritus-nieruchomosci.pl';
    const SETTINGS_PAGE      = 'peritus-lead-settings';
    /** Nadawca w domenie głównej (jej SPF obejmuje serwer poczty), nie wordpress@cms…. */
    const MAIL_FROM          = 'Peritus Nieruchomości <noreply@peritus-nieruchomosci.pl>';

    /** Limit zgłoszeń z jednego adresu IP (ochrona przed zalewem). */
    const RATE_LIMIT  = 5;
    const RATE_WINDOW = 600; // 10 min

    const SOURCES = array(
        'kontakt' => 'Formularz kontaktowy',
        'oferta'  => 'Umów prezentację',
        'wycena'  => 'Bezpłatna wycena',
    );

    /** Pola zgłoszenia → etykieta w panelu i mailu (kolejność wyświetlania). */
    const FIELDS = array(
        'source'   => 'Źródło',
        'name'     => 'Imię i nazwisko',
        'phone'    => 'Telefon',
        'email'    => 'E-mail',
        'property' => 'Oferta',
        'location' => 'Lokalizacja nieruchomości',
        'message'  => 'Wiadomość',
        'page'     => 'Wysłano ze strony',
    );

    public static function init()
    {
        add_action('init', array(__CLASS__, 'register_post_type'));
        add_action('rest_api_init', array(__CLASS__, 'register_routes'));
        add_action('admin_menu', array(__CLASS__, 'settings_menu'));
        add_action('admin_init', array(__CLASS__, 'register_settings'));
        add_action('add_meta_boxes', array(__CLASS__, 'add_meta_boxes'));
        add_filter('manage_' . self::POST_TYPE . '_posts_columns', array(__CLASS__, 'columns'));
        add_action('manage_' . self::POST_TYPE . '_posts_custom_column', array(__CLASS__, 'column_content'), 10, 2);
    }

    public static function register_post_type()
    {
        register_post_type(self::POST_TYPE, array(
            'labels'          => array(
                'name'          => 'Zgłoszenia',
                'singular_name' => 'Zgłoszenie',
                'menu_name'     => 'Zgłoszenia',
                'all_items'     => 'Wszystkie zgłoszenia',
                'edit_item'     => 'Zgłoszenie',
                'search_items'  => 'Szukaj zgłoszeń',
                'not_found'     => 'Brak zgłoszeń.',
            ),
            'public'          => false,
            'show_ui'         => true,
            'show_in_menu'    => true,
            'show_in_rest'    => false,
            'menu_icon'       => 'dashicons-email-alt',
            'menu_position'   => 6,
            'supports'        => array('title'),
            'capability_type' => 'post',
            // Zgłoszenia tworzy tylko formularz na stronie.
            'capabilities'    => array('create_posts' => 'do_not_allow'),
            'map_meta_cap'    => true,
        ));
    }

    // --- REST ------------------------------------------------------------------

    public static function register_routes()
    {
        register_rest_route(Peritus_Rest::NAMESPACE_V1, '/leads', array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array(__CLASS__, 'create_lead'),
            'permission_callback' => array(__CLASS__, 'check_secret'),
        ));
    }

    /**
     * Przyjmujemy zgłoszenia wyłącznie od serwera strony (Next `/api/lead`) — ten sam
     * wspólny sekret co webhook odświeżania (PERITUS_REVALIDATE_SECRET w wp-config.php).
     */
    public static function check_secret(WP_REST_Request $request)
    {
        $secret = defined('PERITUS_REVALIDATE_SECRET') ? (string) PERITUS_REVALIDATE_SECRET : '';
        return $secret !== '' && hash_equals($secret, (string) $request->get_header('x-peritus-secret'));
    }

    public static function create_lead(WP_REST_Request $request)
    {
        $lead = self::sanitize($request->get_json_params());

        if (!isset(self::SOURCES[$lead['source']])) {
            return new WP_Error('peritus_invalid', 'Nieznane źródło zgłoszenia.', array('status' => 400));
        }
        if (strlen(preg_replace('/\D/', '', $lead['phone'])) < 9) {
            return new WP_Error('peritus_invalid', 'Podaj poprawny numer telefonu.', array('status' => 400));
        }
        if ($lead['email'] !== '' && !is_email($lead['email'])) {
            return new WP_Error('peritus_invalid', 'Podaj poprawny adres e-mail.', array('status' => 400));
        }

        $ip = isset($request->get_json_params()['clientIp']) ? substr(sanitize_text_field($request->get_json_params()['clientIp']), 0, 64) : '';
        if ($ip !== '' && self::rate_limited($ip)) {
            return new WP_Error('peritus_rate_limited', 'Zbyt wiele zgłoszeń. Spróbuj za kilka minut.', array('status' => 429));
        }

        $post_id = wp_insert_post(wp_slash(array(
            'post_type'   => self::POST_TYPE,
            'post_status' => 'publish',
            'post_title'  => self::title($lead),
        )), true);
        if (is_wp_error($post_id)) {
            return new WP_Error('peritus_save_failed', 'Nie udało się zapisać zgłoszenia.', array('status' => 500));
        }
        foreach ($lead as $key => $value) {
            update_post_meta($post_id, '_peritus_' . $key, wp_slash($value));
        }

        $sent = self::send_mail($lead);
        update_post_meta($post_id, '_peritus_mail_sent', $sent ? '1' : '0');

        return rest_ensure_response(array('ok' => true));
    }

    private static function sanitize($params)
    {
        $params = is_array($params) ? $params : array();
        $lead   = array();
        foreach (array_keys(self::FIELDS) as $key) {
            $value = isset($params[$key]) && is_scalar($params[$key]) ? (string) $params[$key] : '';
            // Wiadomość zachowuje podziały linii; reszta to pojedyncze linie. Twarde limity długości.
            $lead[$key] = $key === 'message'
                ? mb_substr(sanitize_textarea_field($value), 0, 5000)
                : mb_substr(sanitize_text_field($value), 0, 300);
        }
        $lead['email'] = sanitize_email($lead['email']);
        return $lead;
    }

    private static function rate_limited($ip)
    {
        $key   = 'peritus_lead_rate_' . md5($ip);
        $count = (int) get_transient($key);
        if ($count >= self::RATE_LIMIT) {
            return true;
        }
        set_transient($key, $count + 1, self::RATE_WINDOW);
        return false;
    }

    private static function title(array $lead)
    {
        $who = $lead['name'] !== '' ? $lead['name'] : $lead['phone'];
        return self::SOURCES[$lead['source']] . ' — ' . $who;
    }

    // --- e-mail -----------------------------------------------------------------

    /** Lista poprawnych adresów odbiorców z ustawień (przecinki / nowe linie). */
    public static function recipients()
    {
        $raw = (string) get_option(self::OPTION_RECIPIENTS, self::DEFAULT_RECIPIENTS);
        return array_values(array_filter(array_map('trim', preg_split('/[\s,;]+/', $raw)), 'is_email'));
    }

    private static function send_mail(array $lead)
    {
        $to = self::recipients();
        if (!$to) {
            return false;
        }

        $subject = 'Nowe zgłoszenie: ' . self::SOURCES[$lead['source']]
            . ($lead['property'] !== '' ? ' — ' . $lead['property'] : '');

        $lines = array();
        foreach (self::FIELDS as $key => $label) {
            $value = $key === 'source' ? self::SOURCES[$lead['source']] : $lead[$key];
            if ($value !== '') {
                $lines[] = $label . ': ' . ($key === 'message' ? "\n" . $value : $value);
            }
        }
        $lines[] = '';
        $lines[] = 'Wszystkie zgłoszenia: ' . admin_url('edit.php?post_type=' . self::POST_TYPE);

        $headers = array('Content-Type: text/plain; charset=UTF-8', 'From: ' . self::MAIL_FROM);
        // „Odpowiedz” w programie pocztowym trafia od razu do klienta.
        if ($lead['email'] !== '') {
            $reply_name = $lead['name'] !== '' ? str_replace(array("\r", "\n", '"'), '', $lead['name']) : '';
            $headers[]  = 'Reply-To: ' . ($reply_name !== '' ? '"' . $reply_name . '" <' . $lead['email'] . '>' : $lead['email']);
        }

        return wp_mail($to, $subject, implode("\n", $lines), $headers);
    }

    // --- ustawienia ---------------------------------------------------------------

    public static function settings_menu()
    {
        add_submenu_page(
            'edit.php?post_type=' . self::POST_TYPE,
            'Ustawienia zgłoszeń',
            'Ustawienia',
            'manage_options',
            self::SETTINGS_PAGE,
            array(__CLASS__, 'render_settings')
        );
    }

    public static function register_settings()
    {
        register_setting(self::SETTINGS_PAGE, self::OPTION_RECIPIENTS, array(
            'type'              => 'string',
            'default'           => self::DEFAULT_RECIPIENTS,
            'sanitize_callback' => array(__CLASS__, 'sanitize_recipients'),
        ));
    }

    public static function sanitize_recipients($value)
    {
        $emails  = array_filter(array_map('trim', preg_split('/[\s,;]+/', (string) $value)));
        $valid   = array_values(array_filter($emails, 'is_email'));
        $invalid = array_diff($emails, $valid);
        if ($invalid) {
            add_settings_error(self::OPTION_RECIPIENTS, 'peritus_invalid_email', 'Pominięto niepoprawne adresy: ' . esc_html(implode(', ', $invalid)));
        }
        if (!$valid) {
            add_settings_error(self::OPTION_RECIPIENTS, 'peritus_no_email', 'Podaj co najmniej jeden poprawny adres — zostawiono poprzednią wartość.');
            return get_option(self::OPTION_RECIPIENTS, self::DEFAULT_RECIPIENTS);
        }
        return implode(', ', $valid);
    }

    public static function render_settings()
    {
        ?>
        <div class="wrap">
            <h1>Ustawienia zgłoszeń</h1>
            <?php settings_errors(); // poza menu „Ustawienia” WP nie pokazuje komunikatów sam ?>
            <form method="post" action="options.php">
                <?php settings_fields(self::SETTINGS_PAGE); ?>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row"><label for="peritus_recipients">Wysyłaj zgłoszenia na</label></th>
                        <td>
                            <input type="text" class="regular-text" id="peritus_recipients" name="<?php echo esc_attr(self::OPTION_RECIPIENTS); ?>"
                                   value="<?php echo esc_attr(get_option(self::OPTION_RECIPIENTS, self::DEFAULT_RECIPIENTS)); ?>">
                            <p class="description">Jeden lub kilka adresów oddzielonych przecinkami. Zmiana działa od razu — bez zmian na stronie.</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button('Zapisz'); ?>
            </form>
            <p class="description">Każde zgłoszenie zapisuje się też w <a href="<?php echo esc_url(admin_url('edit.php?post_type=' . self::POST_TYPE)); ?>">Zgłoszenia</a> — nawet gdy e-mail nie dotrze.</p>
        </div>
        <?php
    }

    // --- panel: lista i podgląd ---------------------------------------------------------

    private static function meta($post_id, $key)
    {
        return (string) get_post_meta($post_id, '_peritus_' . $key, true);
    }

    public static function add_meta_boxes()
    {
        add_meta_box('peritus_lead', 'Treść zgłoszenia', array(__CLASS__, 'render_lead_box'), self::POST_TYPE, 'normal', 'high');
    }

    public static function render_lead_box($post)
    {
        echo '<table class="widefat striped"><tbody>';
        foreach (self::FIELDS as $key => $label) {
            $value = self::meta($post->ID, $key);
            if ($key === 'source') {
                $value = isset(self::SOURCES[$value]) ? self::SOURCES[$value] : $value;
            }
            if ($value === '') {
                continue;
            }
            if ($key === 'phone') {
                $value = sprintf('<a href="tel:%s">%s</a>', esc_attr(preg_replace('/[^\d+]/', '', $value)), esc_html($value));
            } elseif ($key === 'email') {
                $value = sprintf('<a href="mailto:%1$s">%1$s</a>', esc_attr($value));
            } else {
                $value = nl2br(esc_html($value));
            }
            printf('<tr><th style="width:200px">%s</th><td>%s</td></tr>', esc_html($label), $value);
        }
        printf(
            '<tr><th>E-mail do biura</th><td>%s</td></tr>',
            self::meta($post->ID, 'mail_sent') === '1' ? 'Wysłany' : '<strong>Nie wysłany</strong> — sprawdź ustawienia poczty na serwerze'
        );
        echo '</tbody></table>';
    }

    public static function columns($columns)
    {
        return array(
            'cb'             => $columns['cb'],
            'title'          => 'Zgłoszenie',
            'peritus_phone'  => 'Telefon',
            'peritus_detail' => 'Oferta / lokalizacja',
            'peritus_mail'   => 'E-mail do biura',
            'date'           => $columns['date'],
        );
    }

    public static function column_content($column, $post_id)
    {
        if ($column === 'peritus_phone') {
            echo esc_html(self::meta($post_id, 'phone'));
        } elseif ($column === 'peritus_detail') {
            echo esc_html(self::meta($post_id, 'property') ?: self::meta($post_id, 'location'));
        } elseif ($column === 'peritus_mail') {
            echo self::meta($post_id, 'mail_sent') === '1' ? 'Wysłany' : '<strong>Nie wysłany</strong>';
        }
    }
}
