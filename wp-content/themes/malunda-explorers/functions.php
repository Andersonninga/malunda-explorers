<?php
/**
 * Malunda Explorers Theme Functions & Definitions
 *
 * @package Malunda_Explorers
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

define( 'MALUNDA_VERSION', '1.0.0' );
define( 'MALUNDA_DIR', get_template_directory() );
define( 'MALUNDA_URI', get_template_directory_uri() );

/**
 * Sets up theme defaults and registers support for various WordPress features.
 */
function malunda_explorers_setup() {
    load_theme_textdomain( 'malunda-explorers', MALUNDA_DIR . '/languages' );

    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'automatic-feed-links' );
    add_theme_support( 'html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script'
    ) );
    add_theme_support( 'custom-logo', array(
        'height'      => 80,
        'width'       => 280,
        'flex-width'  => true,
        'flex-height' => true,
    ) );
    add_theme_support( 'responsive-embeds' );
    add_theme_support( 'align-wide' );

    // Register Nav Menus
    register_nav_menus( array(
        'primary'       => __( 'Primary Header Navigation', 'malunda-explorers' ),
        'footer_explore' => __( 'Footer Explore Links', 'malunda-explorers' ),
        'footer_travel'  => __( 'Footer Travel Links', 'malunda-explorers' ),
        'footer_legal'   => __( 'Footer Legal Links', 'malunda-explorers' ),
    ) );
}
add_action( 'after_setup_theme', 'malunda_explorers_setup' );

/**
 * Enqueue styles and scripts.
 */
function malunda_explorers_scripts() {
    // Google Fonts
    wp_enqueue_style( 'malunda-fonts', 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap', array(), null );

    // Main Theme CSS
    wp_enqueue_style( 'malunda-main', MALUNDA_URI . '/assets/css/main.css', array(), MALUNDA_VERSION );
    wp_enqueue_style( 'malunda-style', get_stylesheet_uri(), array( 'malunda-main' ), MALUNDA_VERSION );

    // Main Theme JS
    wp_enqueue_script( 'malunda-main', MALUNDA_URI . '/assets/js/main.js', array(), MALUNDA_VERSION, true );

    // Booking Engine Script on Booking Page
    if ( is_page_template( 'page-booking.php' ) || is_page( 'booking' ) || is_singular( 'safari_package' ) ) {
        wp_enqueue_script( 'malunda-booking', MALUNDA_URI . '/assets/js/booking-engine.js', array(), MALUNDA_VERSION, true );
        wp_localize_script( 'malunda-booking', 'malundaAjax', array(
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'rest_url' => get_rest_url( null, 'malunda/v1/' ),
            'nonce'    => wp_create_nonce( 'malunda_booking_nonce' )
        ) );
    }
}
add_action( 'wp_enqueue_scripts', 'malunda_explorers_scripts' );

/**
 * Helpers to fetch Centralized Safari Data
 */
function malunda_get_data() {
    static $data = null;
    if ( null === $data ) {
        $file = get_theme_file_path( '../../data/safari-data.json' );
        if ( ! file_exists( $file ) ) {
            $file = ABSPATH . 'data/safari-data.json';
        }
        if ( file_exists( $file ) ) {
            $json = file_get_contents( $file );
            $data = json_decode( $json, true );
        } else {
            $data = array();
        }
    }
    return $data;
}

function malunda_get_packages() {
    $data = malunda_get_data();
    return $data['packages'] ?? array();
}

function malunda_get_destinations() {
    $data = malunda_get_data();
    return $data['destinations'] ?? array();
}

function malunda_get_experiences() {
    $data = malunda_get_data();
    return $data['safari_experiences'] ?? array();
}

function malunda_get_extras() {
    $data = malunda_get_data();
    return $data['optional_extras'] ?? array();
}

function malunda_get_testimonials() {
    $data = malunda_get_data();
    return $data['testimonials'] ?? array();
}

function malunda_get_faqs() {
    $data = malunda_get_data();
    return $data['faqs'] ?? array();
}
