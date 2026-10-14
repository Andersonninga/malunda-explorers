<?php
/**
 * Register Destinations Custom Post Type & Taxonomies
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function malunda_register_destinations_cpt() {
    $labels = array(
        'name'               => _x( 'Destinations', 'post type general name', 'malunda-safari-core' ),
        'singular_name'      => _x( 'Destination', 'post type singular name', 'malunda-safari-core' ),
        'menu_name'          => _x( 'Destinations', 'admin menu', 'malunda-safari-core' ),
        'add_new'            => _x( 'Add New Destination', 'destination', 'malunda-safari-core' ),
        'add_new_item'       => __( 'Add New Destination', 'malunda-safari-core' ),
        'edit_item'          => __( 'Edit Destination', 'malunda-safari-core' ),
        'new_item'           => __( 'New Destination', 'malunda-safari-core' ),
        'view_item'          => __( 'View Destination', 'malunda-safari-core' ),
        'search_items'       => __( 'Search Destinations', 'malunda-safari-core' ),
        'not_found'          => __( 'No destinations found', 'malunda-safari-core' ),
        'not_found_in_trash' => __( 'No destinations found in Trash', 'malunda-safari-core' ),
    );

    $args = array(
        'labels'             => $labels,
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => array( 'slug' => 'destinations', 'with_front' => false ),
        'capability_type'    => 'post',
        'has_archive'        => 'destinations',
        'hierarchical'       => false,
        'menu_position'      => 6,
        'menu_icon'          => 'dashicons-palmtree',
        'supports'           => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
        'show_in_rest'       => true,
    );

    register_post_type( 'destination', $args );

    // Destination Region Taxonomy
    register_taxonomy( 'destination_region', array( 'destination' ), array(
        'hierarchical'      => true,
        'labels'            => array(
            'name'          => __( 'Circuit / Region', 'malunda-safari-core' ),
            'singular_name' => __( 'Region', 'malunda-safari-core' ),
        ),
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'region' ),
        'show_in_rest'      => true,
    ) );
}
add_action( 'init', 'malunda_register_destinations_cpt' );
