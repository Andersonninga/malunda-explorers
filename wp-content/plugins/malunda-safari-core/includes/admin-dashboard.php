<?php
/**
 * Malunda Explorers - Admin Booking Management Dashboard
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register Top-Level Admin Menu
 */
function malunda_add_admin_menu() {
    add_menu_page(
        __( 'Safari Bookings', 'malunda-safari-core' ),
        __( 'Safari Bookings', 'malunda-safari-core' ),
        'manage_options',
        'malunda-bookings',
        'malunda_render_bookings_dashboard',
        'dashicons-tickets-alt',
        4
    );

    add_submenu_page(
        'malunda-bookings',
        __( 'All Bookings', 'malunda-safari-core' ),
        __( 'All Bookings', 'malunda-safari-core' ),
        'manage_options',
        'malunda-bookings',
        'malunda_render_bookings_dashboard'
    );

    add_submenu_page(
        'malunda-bookings',
        __( 'Booking Settings', 'malunda-safari-core' ),
        __( 'Settings', 'malunda-safari-core' ),
        'manage_options',
        'malunda-booking-settings',
        'malunda_render_booking_settings'
    );
}
add_action( 'admin_menu', 'malunda_add_admin_menu' );

/**
 * Render Admin Bookings Dashboard
 */
function malunda_render_bookings_dashboard() {
    $dataFile = dirname( dirname( dirname( __DIR__ ) ) ) . '/data/safari-data.json';
    $bookings = array();
    if ( file_exists( $dataFile ) ) {
        $json = file_get_contents( $dataFile );
        $data = json_decode( $json, true );
        $bookings = $data['bookings'] ?? array();
    }

    $totalBookings = count( $bookings );
    $confirmedCount = 0;
    $pendingCount = 0;
    $totalRevenue = 0;

    foreach ( $bookings as $b ) {
        if ( ( $b['booking_status'] ?? '' ) === 'Confirmed' || ( $b['booking_status'] ?? '' ) === 'Fully Paid' ) {
            $confirmedCount++;
        }
        if ( ( $b['booking_status'] ?? '' ) === 'Pending' ) {
            $pendingCount++;
        }
        $totalRevenue += floatval( $b['pricing']['total_price'] ?? 0 );
    }

    ?>
    <div class="wrap" style="max-width: 1400px; margin-top: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px;">
            <div>
                <h1 style="font-size: 28px; font-weight: 700; color: #183321; display:flex; align-items:center; gap: 10px;">
                    <span class="dashicons dashicons-tickets-alt" style="font-size: 32px; width:32px; height:32px;"></span>
                    Malunda Explorers — Safari Bookings Management
                </h1>
                <p style="color: #666; margin: 5px 0 0;">Manage reservations, customer itineraries, deposits, and automated communication.</p>
            </div>
            <div>
                <a href="<?php echo esc_url( admin_url( 'admin-post.php?action=malunda_export_bookings_csv' ) ); ?>" class="button button-primary" style="background:#c8933b; border-color:#c8933b; padding: 6px 16px; height:auto; font-weight:600;">
                    📥 Export Bookings (CSV)
                </a>
            </div>
        </div>

        <!-- Metric KPI Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div style="background:#fff; padding: 20px; border-radius: 8px; border: 1px solid #ccd0d4; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="font-size: 12px; text-transform: uppercase; color: #666; font-weight: 700;">Total Bookings</div>
                <div style="font-size: 30px; font-weight: 800; color: #183321; margin-top: 5px;"><?php echo esc_html( $totalBookings ); ?></div>
            </div>
            <div style="background:#fff; padding: 20px; border-radius: 8px; border: 1px solid #ccd0d4; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="font-size: 12px; text-transform: uppercase; color: #666; font-weight: 700;">Confirmed / Active</div>
                <div style="font-size: 30px; font-weight: 800; color: #137333; margin-top: 5px;"><?php echo esc_html( $confirmedCount ); ?></div>
            </div>
            <div style="background:#fff; padding: 20px; border-radius: 8px; border: 1px solid #ccd0d4; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="font-size: 12px; text-transform: uppercase; color: #666; font-weight: 700;">Pending Inquiries</div>
                <div style="font-size: 30px; font-weight: 800; color: #b06000; margin-top: 5px;"><?php echo esc_html( $pendingCount ); ?></div>
            </div>
            <div style="background:#fff; padding: 20px; border-radius: 8px; border: 1px solid #ccd0d4; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <div style="font-size: 12px; text-transform: uppercase; color: #666; font-weight: 700;">Total Pipeline Revenue</div>
                <div style="font-size: 30px; font-weight: 800; color: #c8933b; margin-top: 5px;">$<?php echo esc_html( number_format( $totalRevenue ) ); ?></div>
            </div>
        </div>

        <!-- Filters & Table -->
        <div style="background:#fff; border-radius: 8px; border: 1px solid #ccd0d4; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="padding: 15px 20px; background: #fafafa; border-bottom: 1px solid #eee; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                <input type="text" id="adminSearchInput" placeholder="Search by customer, ref code or email..." style="min-width: 300px; padding: 6px 12px; border-radius: 4px; border: 1px solid #ccc;">
                <select id="adminStatusFilter" style="padding: 6px 12px; border-radius: 4px; border: 1px solid #ccc;">
                    <option value="">All Booking Statuses</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Fully Paid">Fully Paid</option>
                    <option value="Deposit Paid">Deposit Paid</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <table class="wp-list-table widefat fixed striped" style="border: none;">
                <thead>
                    <tr>
                        <th style="width: 140px; font-weight:700;">Ref #</th>
                        <th style="font-weight:700;">Customer</th>
                        <th style="font-weight:700;">Safari Package</th>
                        <th style="width: 120px; font-weight:700;">Travel Date</th>
                        <th style="width: 100px; font-weight:700;">Travelers</th>
                        <th style="width: 120px; font-weight:700;">Total Price</th>
                        <th style="width: 130px; font-weight:700;">Payment Status</th>
                        <th style="width: 130px; font-weight:700;">Booking Status</th>
                        <th style="width: 120px; font-weight:700;">Actions</th>
                    </tr>
                </thead>
                <tbody id="bookingsTableBody">
                    <?php if ( empty( $bookings ) ) : ?>
                        <tr><td colspan="9" style="text-align:center; padding: 30px;">No bookings found.</td></tr>
                    <?php else : ?>
                        <?php foreach ( $bookings as $b ) : ?>
                            <tr>
                                <td><strong style="color:#183321;"><?php echo esc_html( $b['booking_ref'] ?? '' ); ?></strong></td>
                                <td>
                                    <strong><?php echo esc_html( $b['customer']['full_name'] ?? '' ); ?></strong><br>
                                    <small style="color:#666;"><?php echo esc_html( $b['customer']['email'] ?? '' ); ?> | <?php echo esc_html( $b['customer']['country'] ?? '' ); ?></small>
                                </td>
                                <td><?php echo esc_html( $b['safari_name'] ?? '' ); ?></td>
                                <td><?php echo esc_html( $b['travel_date'] ?? '' ); ?></td>
                                <td><?php echo esc_html( ( $b['travelers']['adults'] ?? 0 ) . ' Adults' ); ?></td>
                                <td><strong>$<?php echo esc_html( number_format( $b['pricing']['total_price'] ?? 0 ) ); ?></strong></td>
                                <td>
                                    <span style="display:inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background:#e8f0fe; color:#1a73e8;">
                                        <?php echo esc_html( $b['payment']['payment_status'] ?? 'Unpaid' ); ?>
                                    </span>
                                </td>
                                <td>
                                    <span style="display:inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background:#e6f4ea; color:#137333;">
                                        <?php echo esc_html( $b['booking_status'] ?? 'Pending' ); ?>
                                    </span>
                                </td>
                                <td>
                                    <button type="button" class="button button-small" onclick="alert('Viewing Booking Details for <?php echo esc_js( $b['booking_ref'] ); ?>\nCustomer: <?php echo esc_js( $b['customer']['full_name'] ); ?>\nPhone: <?php echo esc_js( $b['customer']['phone'] ); ?>\nNotes: <?php echo esc_js( $b['internal_notes'] ?? 'None' ); ?>')">
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
    <?php
}

/**
 * Render Booking Settings
 */
function malunda_render_booking_settings() {
    ?>
    <div class="wrap" style="max-width: 800px; margin-top: 20px;">
        <h1 style="color:#183321; font-weight:700;">Safari Booking Settings</h1>
        <p>Configure deposit percentage, default payment gateways, and automated customer emails.</p>

        <form method="post" action="options.php" style="background:#fff; padding:25px; border-radius:8px; border:1px solid #ccd0d4; margin-top:20px;">
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="malunda_deposit_pct">Deposit Percentage (%)</label></th>
                    <td>
                        <input name="malunda_deposit_pct" type="number" id="malunda_deposit_pct" value="30" class="small-text">
                        <p class="description">Percentage of the total safari cost required at checkout (Default: 30%).</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="malunda_admin_email">Booking Notifications Email</label></th>
                    <td>
                        <input name="malunda_admin_email" type="email" id="malunda_admin_email" value="reservations@malundaexplorers.com" class="regular-text">
                    </td>
                </tr>
                <tr>
                    <th scope="row">Payment Gateways</th>
                    <td>
                        <label><input type="checkbox" checked disabled> Credit / Debit Cards (Stripe / Authorized Gateway)</label><br>
                        <label><input type="checkbox" checked disabled> Direct Bank Wire Transfer (CRDB Bank Tanzania)</label><br>
                        <label><input type="checkbox" checked disabled> Mobile Money (M-Pesa / Airtel Money)</label>
                    </td>
                </tr>
            </table>
            <?php submit_button( __( 'Save Settings', 'malunda-safari-core' ) ); ?>
        </form>
    </div>
    <?php
}

/**
 * Handle CSV Export
 */
function malunda_export_bookings_csv() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'Unauthorized' );
    }

    $dataFile = dirname( dirname( dirname( __DIR__ ) ) ) . '/data/safari-data.json';
    $bookings = array();
    if ( file_exists( $dataFile ) ) {
        $json = file_get_contents( $dataFile );
        $data = json_decode( $json, true );
        $bookings = $data['bookings'] ?? array();
    }

    header( 'Content-Type: text/csv; charset=utf-8' );
    header( 'Content-Disposition: attachment; filename=malunda-safari-bookings-' . date( 'Y-m-d' ) . '.csv' );

    $output = fopen( 'php://output', 'w' );
    fputcsv( $output, array( 'Reference', 'Customer Name', 'Email', 'Phone', 'Country', 'Safari', 'Travel Date', 'Adults', 'Children', 'Accommodation', 'Total Price', 'Deposit', 'Payment Status', 'Booking Status' ) );

    foreach ( $bookings as $b ) {
        fputcsv( $output, array(
            $b['booking_ref'] ?? '',
            $b['customer']['full_name'] ?? '',
            $b['customer']['email'] ?? '',
            $b['customer']['phone'] ?? '',
            $b['customer']['country'] ?? '',
            $b['safari_name'] ?? '',
            $b['travel_date'] ?? '',
            $b['travelers']['adults'] ?? 1,
            $b['travelers']['children'] ?? 0,
            $b['accommodation_name'] ?? '',
            $b['pricing']['total_price'] ?? 0,
            $b['pricing']['deposit_required'] ?? 0,
            $b['payment']['payment_status'] ?? '',
            $b['booking_status'] ?? '',
        ) );
    }

    fclose( $output );
    exit;
}
add_action( 'admin_post_malunda_export_bookings_csv', 'malunda_export_bookings_csv' );
