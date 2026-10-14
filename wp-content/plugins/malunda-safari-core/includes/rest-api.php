<?php
/**
 * Malunda Explorers - WordPress REST API Routes
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'rest_api_init', function() {
    register_rest_route( 'malunda/v1', '/packages', array(
        'methods'  => 'GET',
        'callback' => 'malunda_rest_get_packages',
        'permission_callback' => '__return_true',
    ) );

    register_rest_route( 'malunda/v1', '/destinations', array(
        'methods'  => 'GET',
        'callback' => 'malunda_rest_get_destinations',
        'permission_callback' => '__return_true',
    ) );

    register_rest_route( 'malunda/v1', '/bookings', array(
        'methods'  => 'POST',
        'callback' => 'malunda_rest_create_booking',
        'permission_callback' => '__return_true',
    ) );
} );

function malunda_rest_get_packages() {
    $dataFile = dirname( dirname( dirname( __DIR__ ) ) ) . '/data/safari-data.json';
    if ( file_exists( $dataFile ) ) {
        $json = file_get_contents( $dataFile );
        $data = json_decode( $json, true );
        return rest_ensure_response( $data );
    }
    return new WP_Error( 'no_data', 'Safari data file not found', array( 'status' => 404 ) );
}

function malunda_rest_get_destinations() {
    $dataFile = dirname( dirname( dirname( __DIR__ ) ) ) . '/data/safari-data.json';
    if ( file_exists( $dataFile ) ) {
        $json = file_get_contents( $dataFile );
        $data = json_decode( $json, true );
        return rest_ensure_response( $data['destinations'] ?? array() );
    }
    return rest_ensure_response( array() );
}

function malunda_rest_create_booking( $request ) {
    $params = $request->get_json_params();

    $dataFile = dirname( dirname( dirname( __DIR__ ) ) ) . '/data/safari-data.json';
    $data = array();
    if ( file_exists( $dataFile ) ) {
        $json = file_get_contents( $dataFile );
        $data = json_decode( $json, true );
    }

    $ref = 'ME-' . date( 'Y' ) . '-' . str_pad( wp_rand( 10, 9999 ), 4, '0', STR_PAD_LEFT );

    $newBooking = array(
        'booking_ref'    => $ref,
        'created_at'     => date( 'c' ),
        'safari_id'      => sanitize_text_field( $params['safari_id'] ?? '' ),
        'safari_name'    => sanitize_text_field( $params['safari_name'] ?? 'Tanzania Safari' ),
        'travel_date'    => sanitize_text_field( $params['travel_date'] ?? '' ),
        'duration_days'  => intval( $params['duration_days'] ?? 7 ),
        'travelers'      => $params['travelers'] ?? array( 'adults' => 2, 'children' => 0 ),
        'accommodation_tier' => sanitize_text_field( $params['accommodation_tier'] ?? 'mid-range' ),
        'accommodation_name' => sanitize_text_field( $params['accommodation_name'] ?? 'Mid-Range Lodges' ),
        'extras'         => $params['extras'] ?? array(),
        'customer'       => $params['customer'] ?? array(),
        'pricing'        => $params['pricing'] ?? array(),
        'payment'        => array(
            'method'         => sanitize_text_field( $params['payment']['method'] ?? 'card' ),
            'payment_status' => ( ( $params['payment']['payment_type'] ?? '' ) === 'deposit' ) ? 'Deposit Paid' : 'Pending',
            'amount_paid'    => floatval( $params['payment']['amount_paid'] ?? 0 ),
            'transaction_id' => 'TXN-' . strtoupper( wp_generate_password( 8, false ) )
        ),
        'booking_status' => 'Confirmed',
        'internal_notes' => 'New booking received via online booking engine.'
    );

    if ( ! isset( $data['bookings'] ) ) {
        $data['bookings'] = array();
    }
    array_unshift( $data['bookings'], $newBooking );
    file_put_contents( $dataFile, json_encode( $data, JSON_PRETTY_PRINT ) );

    // Trigger customer confirmation and admin alert
    if ( function_exists( 'malunda_send_booking_emails' ) ) {
        malunda_send_booking_emails( $newBooking );
    }

    return rest_ensure_response( array(
        'success' => true,
        'message' => 'Booking reservation successfully created!',
        'booking' => $newBooking
    ) );
}
