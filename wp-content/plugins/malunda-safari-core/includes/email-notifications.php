<?php
/**
 * Malunda Explorers - Automated Email Notifications System
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Dispatch automated customer & admin emails upon booking creation
 */
function malunda_send_booking_emails( $booking ) {
    $custEmail = $booking['customer']['email'] ?? '';
    $custName  = $booking['customer']['full_name'] ?? 'Safari Traveler';
    $ref       = $booking['booking_ref'] ?? 'ME-2026-0001';
    $safari    = $booking['safari_name'] ?? 'Tanzania Safari';
    $total     = number_format( $booking['pricing']['total_price'] ?? 0 );
    $deposit   = number_format( $booking['pricing']['deposit_required'] ?? 0 );

    $headers = array('Content-Type: text/html; charset=UTF-8', 'From: Malunda Explorers <reservations@malundaexplorers.com>');

    // 1. Customer Email
    $customerSubject = "Your Malunda Explorers Safari is Confirmed [{$ref}]";
    $customerBody = "
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #191c1a; border: 1px solid #e0dbce; border-radius: 8px; overflow: hidden;'>
        <div style='background: #183321; color: #fff; padding: 25px; text-align: center;'>
            <h1 style='margin: 0; font-size: 24px; color: #c8933b;'>MALUNDA EXPLORERS</h1>
            <p style='margin: 5px 0 0; font-style: italic; font-size: 14px;'>Every journey tells a story.</p>
        </div>
        <div style='padding: 30px;'>
            <p>Dear {$custName},</p>
            <p>We are thrilled to welcome you to the Malunda Explorers family! Your Tanzanian safari journey is officially registered under reference code: <strong>{$ref}</strong>.</p>
            
            <div style='background: #fbf9f4; padding: 20px; border-radius: 6px; margin: 20px 0;'>
                <h3 style='margin-top:0; color: #183321;'>Reservation Summary</h3>
                <p><strong>Safari:</strong> {$safari}</p>
                <p><strong>Travel Date:</strong> {$booking['travel_date']}</p>
                <p><strong>Travelers:</strong> {$booking['travelers']['adults']} Adults</p>
                <p><strong>Total Package Price:</strong> \${$total} USD</p>
                <p><strong>Deposit Required:</strong> \${$deposit} USD</p>
            </div>

            <p>Our senior safari coordinator in Arusha is preparing your detailed welcome pack, including personalized packing guidelines, visa instructions, and direct WhatsApp contact.</p>
            
            <p>Karibu Tanzania (Welcome to Tanzania)!</p>
            <p style='margin-top: 25px;'>Warm regards,<br><strong>Malunda Explorers Safari Operations</strong><br>Arusha, Tanzania</p>
        </div>
    </div>";

    // 2. Admin Alert Email
    $adminSubject = "NEW SAFARI BOOKING: {$ref} - {$custName} (\${$total})";
    $adminBody = "
    <h2>New Safari Booking Received</h2>
    <p><strong>Reference:</strong> {$ref}</p>
    <p><strong>Customer:</strong> {$custName} ({$custEmail})</p>
    <p><strong>Safari:</strong> {$safari}</p>
    <p><strong>Date:</strong> {$booking['travel_date']}</p>
    <p><strong>Total:</strong> \${$total}</p>";

    if ( ! empty( $custEmail ) ) {
        wp_mail( $custEmail, $customerSubject, $customerBody, $headers );
    }

    $adminEmail = get_option( 'admin_email' );
    wp_mail( $adminEmail, $adminSubject, $adminBody, $headers );
}
