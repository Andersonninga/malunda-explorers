<?php
/**
 * Register Safari Packages Custom Post Type & Taxonomies
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function malunda_register_packages_cpt() {
    $labels = array(
        'name'               => _x( 'Safari Packages', 'post type general name', 'malunda-safari-core' ),
        'singular_name'      => _x( 'Safari Package', 'post type singular name', 'malunda-safari-core' ),
        'menu_name'          => _x( 'Safari Packages', 'admin menu', 'malunda-safari-core' ),
        'add_new'            => _x( 'Add New Package', 'package', 'malunda-safari-core' ),
        'add_new_item'       => __( 'Add New Safari Package', 'malunda-safari-core' ),
        'edit_item'          => __( 'Edit Safari Package', 'malunda-safari-core' ),
        'new_item'           => __( 'New Safari Package', 'malunda-safari-core' ),
        'view_item'          => __( 'View Safari Package', 'malunda-safari-core' ),
        'search_items'       => __( 'Search Safari Packages', 'malunda-safari-core' ),
        'not_found'          => __( 'No safari packages found', 'malunda-safari-core' ),
        'not_found_in_trash' => __( 'No safari packages found in Trash', 'malunda-safari-core' ),
    );

    $args = array(
        'labels'             => $labels,
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => array( 'slug' => 'safaris', 'with_front' => false ),
        'capability_type'    => 'post',
        'has_archive'        => 'safaris',
        'hierarchical'       => false,
        'menu_position'      => 5,
        'menu_icon'          => 'dashicons-location-alt',
        'supports'           => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
        'show_in_rest'       => true,
    );

    register_post_type( 'safari_package', $args );

    // Safari Style Taxonomy
    register_taxonomy( 'safari_style', array( 'safari_package' ), array(
        'hierarchical'      => true,
        'labels'            => array(
            'name'          => __( 'Safari Styles', 'malunda-safari-core' ),
            'singular_name' => __( 'Safari Style', 'malunda-safari-core' ),
        ),
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'safari-style' ),
        'show_in_rest'      => true,
    ) );
}
add_action( 'init', 'malunda_register_packages_cpt' );
