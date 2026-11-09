<?php
/**
 * Plugin Name: Peritus Core
 * Description: Oferty Peritus Nieruchomości dla strony Next.js (headless): codzienny import z nieruchomosci-online.pl, REST API i odświeżanie strony.
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: Peritus Nieruchomości
 * Text Domain: peritus-core
 */

if (!defined('ABSPATH')) {
    exit;
}

define('PERITUS_CORE_VERSION', '1.0.0');
define('PERITUS_CORE_DIR', plugin_dir_path(__FILE__));

require_once PERITUS_CORE_DIR . 'includes/class-offers.php';
require_once PERITUS_CORE_DIR . 'includes/class-importer.php';
require_once PERITUS_CORE_DIR . 'includes/class-rest.php';
require_once PERITUS_CORE_DIR . 'includes/class-revalidate.php';
require_once PERITUS_CORE_DIR . 'includes/class-admin.php';

Peritus_Offers::init();
Peritus_Rest::init();
Peritus_Revalidate::init();
Peritus_Admin::init();

// Codzienny import z portalu (WP-Cron). Na hostingu warto podpiąć prawdziwy cron
// wywołujący wp-cron.php — patrz tasks/wdrozenie.md.
add_action(Peritus_Importer::CRON_HOOK, array('Peritus_Importer', 'run_scheduled'));

register_activation_hook(__FILE__, function () {
    Peritus_Offers::register_post_type();
    flush_rewrite_rules();
    if (!wp_next_scheduled(Peritus_Importer::CRON_HOOK)) {
        wp_schedule_event(time() + 300, 'daily', Peritus_Importer::CRON_HOOK);
    }
});

register_deactivation_hook(__FILE__, function () {
    wp_clear_scheduled_hook(Peritus_Importer::CRON_HOOK);
});
