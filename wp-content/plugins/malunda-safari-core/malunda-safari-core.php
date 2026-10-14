<?php
/**
 * Plugin Name: Malunda Safari Core & Booking Management System
 * Plugin URI: https://malundaexplorers.com
 * Description: Core booking management engine, custom post types (Safari Packages, Destinations, Bookings, Extras), dynamic pricing calculations, admin dashboard, and REST API for Malunda Explorers Tanzania.
 * Version: 1.0.0
 * Author: Malunda Explorers
 * Author URI: https://malundaexplorers.com
 * Text Domain: malunda-safari-core
 * License: GPLv2 or later
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'MALUNDA_CORE_PATH', plugin_dir_path( __FILE__ ) );
define( 'MALUNDA_CORE_URL', plugin_dir_url( __FILE__ ) );

require_once MALUNDA_CORE_PATH . 'includes/cpt-packages.php';
require_once MALUNDA_CORE_PATH . 'includes/cpt-destinations.php';
require_once MALUNDA_CORE_PATH . 'includes/cpt-bookings.php';
require_once MALUNDA_CORE_PATH . 'includes/admin-dashboard.php';
require_once MALUNDA_CORE_PATH . 'includes/rest-api.php';
require_once MALUNDA_CORE_PATH . 'includes/email-notifications.php';

/**
 * Plugin activation hook: flush rewrites & initialize defaults
 */
register_activation_hook( __FILE__, function() {
    malunda_register_cpts();
    flush_rewrite_rules();
} );
