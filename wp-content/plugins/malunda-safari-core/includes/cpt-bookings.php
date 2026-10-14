<?php
/**
 * Register Safari Bookings Custom Post Type & Meta Storage
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function malunda_register_bookings_cpt() {
    $labels = array(
        'name'               => _x( 'Safari Bookings', 'post type general name', 'malunda-safari-core' ),
        'singular_name'      => _x( 'Safari Booking', 'post type singular name', 'malunda-safari-core' ),
        'menu_name'          => _x( 'Bookings', 'admin menu', 'malunda-safari-core' ),
        'add_new'            => _x( 'Add New Booking', 'booking', 'malunda-safari-core' ),
        'add_new_item'       => __( 'Add New Booking', 'malunda-safari-core' ),
        'edit_item'          => __( 'Edit Booking', 'malunda-safari-core' ),
        'view_item'          => __( 'View Booking', 'malunda-safari-core' ),
        'search_items'       => __( 'Search Bookings', 'malunda-safari-core' ),
        'not_found'          => __( 'No bookings found', 'malunda-safari-core' ),
        'not_found_in_trash' => __( 'No bookings found in Trash', 'malunda-safari-core' ),
    );

    $args = array(
        'labels'             => $labels,
        'public'             => false,
        'publicly_queryable' => false,
        'show_ui'            => true,
        'show_in_menu'       => false, // Managed via dedicated Safari Bookings Dashboard
        'query_var'          => false,
        'capability_type'    => 'post',
        'has_archive'        => false,
        'hierarchical'       => false,
        'supports'           => array( 'title', 'custom-fields' ),
        'show_in_rest'       => true,
    );

    register_post_type( 'safari_booking', $args );
}
add_action( 'init', 'malunda_register_bookings_cpt' );

/**
 * Generate unique Malunda reference number: ME-2026-XXXX
 */
function malunda_generate_booking_reference() {
    $year = date( 'Y' );
    $rand = str_pad( wp_rand( 1, 9999 ), 4, '0', STR_PAD_LEFT );
    return "ME-{$year}-{$rand}";
}
