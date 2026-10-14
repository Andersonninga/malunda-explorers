<?php
/**
 * Template Name: Safari Booking Engine
 *
 * @package Malunda_Explorers
 */
get_header();

$packages = function_exists( 'malunda_get_packages' ) ? malunda_get_packages() : array();
$destinations = function_exists( 'malunda_get_destinations' ) ? malunda_get_destinations() : array();
$extras = function_exists( 'malunda_get_extras' ) ? malunda_get_extras() : array();
$data = function_exists( 'malunda_get_data' ) ? malunda_get_data() : array();
$tiers = $data['accommodation_tiers'] ?? array();
$depositPct = $data['site_settings']['deposit_percentage'] ?? 30;
?>

<div class="booking-page-wrap">
    <div class="container">
        <div class="booking-header">
            <span class="badge badge-green" style="margin-bottom: 0.8rem;">REAL-TIME SAFARI RESERVATIONS</span>
            <h1>Book Your Tanzania Safari</h1>
            <p>Complete our 7-step interactive reservation system to customize your safari package, accommodation standard, optional activities, and secure your departure dates.</p>
        </div>

        <!-- 7-Step Progress Indicator -->
        <div class="booking-stepper">
            <div class="step-indicator active" id="stepIndicator_1">
                <div class="step-num">1</div>
                <div class="step-title">Safari</div>
            </div>
            <div class="step-indicator" id="stepIndicator_2">
                <div class="step-num">2</div>
                <div class="step-title">Travelers</div>
            </div>
            <div class="step-indicator" id="stepIndicator_3">
                <div class="step-num">3</div>
                <div class="step-title">Lodging</div>
            </div>
            <div class="step-indicator" id="stepIndicator_4">
                <div class="step-num">4</div>
                <div class="step-title">Extras</div>
            </div>
            <div class="step-indicator" id="stepIndicator_5">
                <div class="step-num">5</div>
                <div class="step-title">Details</div>
            </div>
            <div class="step-indicator" id="stepIndicator_6">
                <div class="step-num">6</div>
                <div class="step-title">Summary</div>
            </div>
            <div class="step-indicator" id="stepIndicator_7">
                <div class="step-num">7</div>
                <div class="step-title">Payment</div>
            </div>
        </div>

        <!-- Main Booking Layout -->
        <div class="booking-layout">
            <!-- Left: Multi-Step Panels -->
            <div class="booking-main-forms">

                <!-- STEP 1: Select Safari -->
                <div class="booking-step-panel active" id="stepPanel_1">
                    <h2 class="step-panel-title"><span>1.</span> Select Your Safari Package</h2>
                    <p class="step-panel-desc">Choose a handcrafted Tanzanian itinerary and select your intended start date.</p>

                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label for="travelDateInput">Preferred Departure Date *</label>
                            <input type="date" id="travelDateInput" class="form-control" required>
                        </div>
                    </div>

                    <label style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.8rem; display: block;">Select Itinerary:</label>
                    <div class="options-grid">
                        <?php foreach ( $packages as $index => $pkg ) : ?>
                            <div class="option-radio-card package-select-card <?php echo $index === 0 ? 'selected' : ''; ?>" data-package-id="<?php echo esc_attr( $pkg['id'] ); ?>">
                                <input type="radio" name="safariPackageRadio" value="<?php echo esc_attr( $pkg['id'] ); ?>" <?php checked( $index, 0 ); ?>>
                                <div class="option-title"><?php echo esc_html( $pkg['title'] ); ?></div>
                                <div class="option-price">From $<?php echo esc_html( number_format( $pkg['base_price'] ) ); ?> / person</div>
                                <div class="option-desc">
                                    🕒 <?php echo esc_html( $pkg['days'] ); ?> Days • <?php echo esc_html( $pkg['nights'] ); ?> Nights<br>
                                    📍 <?php echo esc_html( implode( ' • ', $pkg['destinations'] ) ); ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- STEP 2: Travelers -->
                <div class="booking-step-panel" id="stepPanel_2">
                    <h2 class="step-panel-title"><span>2.</span> Party Size & Travelers</h2>
                    <p class="step-panel-desc">Tell us who is traveling with you. Children under 12 receive a 50% safari discount.</p>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Adults (12+ years)</label>
                            <div class="counter-widget">
                                <button type="button" class="counter-btn" id="dec_adults">-</button>
                                <span class="counter-val" id="val_adults">2</span>
                                <button type="button" class="counter-btn" id="inc_adults">+</button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Children (2 - 11 years)</label>
                            <div class="counter-widget">
                                <button type="button" class="counter-btn" id="dec_children">-</button>
                                <span class="counter-val" id="val_children">0</span>
                                <button type="button" class="counter-btn" id="inc_children">+</button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Number of Rooms / Tents</label>
                            <div class="counter-widget">
                                <button type="button" class="counter-btn" id="dec_rooms">-</button>
                                <span class="counter-val" id="val_rooms">1</span>
                                <button type="button" class="counter-btn" id="inc_rooms">+</button>
                            </div>
                        </div>
                    </div>

                    <div class="form-group" id="childrenAgesGroup" style="display: none;">
                        <label for="childrenAges">Ages of Children (comma-separated)</label>
                        <input type="text" id="childrenAges" class="form-control" placeholder="e.g. 6, 9">
                    </div>

                    <div class="form-group">
                        <label for="specialReqs">Special Party Requirements (Optional)</label>
                        <textarea id="specialReqs" class="form-control" placeholder="e.g. Twin beds, interconnected rooms, mobility considerations..."></textarea>
                    </div>
                </div>

                <!-- STEP 3: Accommodation -->
                <div class="booking-step-panel" id="stepPanel_3">
                    <h2 class="step-panel-title"><span>3.</span> Choose Accommodation Standard</h2>
                    <p class="step-panel-desc">Select your desired comfort level. All options are vetted for cleanliness, safety, and prime location.</p>

                    <div class="options-grid">
                        <?php foreach ( $tiers as $t ) : ?>
                            <div class="option-radio-card accomm-tier-card <?php echo $t['id'] === 'mid-range' ? 'selected' : ''; ?>" data-tier="<?php echo esc_attr( $t['id'] ); ?>" data-multiplier="<?php echo esc_attr( $t['multiplier'] ); ?>">
                                <input type="radio" name="accommodationTierRadio" value="<?php echo esc_attr( $t['id'] ); ?>" <?php checked( $t['id'], 'mid-range' ); ?>>
                                <div class="option-title"><?php echo esc_html( $t['name'] ); ?></div>
                                <div class="option-desc" style="margin-top: 0.5rem;"><?php echo esc_html( $t['description'] ); ?></div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- STEP 4: Optional Experiences -->
                <div class="booking-step-panel" id="stepPanel_4">
                    <h2 class="step-panel-title"><span>4.</span> Add Optional Safari Extras</h2>
                    <p class="step-panel-desc">Enrich your Tanzanian adventure with extraordinary optional activities.</p>

                    <div class="extras-list">
                        <?php foreach ( $extras as $extra ) : ?>
                            <div class="extra-item-card" data-extra-id="<?php echo esc_attr( $extra['id'] ); ?>" data-extra-name="<?php echo esc_attr( $extra['name'] ); ?>" data-extra-price="<?php echo esc_attr( $extra['price'] ); ?>" data-extra-type="<?php echo esc_attr( $extra['price_type'] ); ?>">
                                <input type="checkbox" class="extra-checkbox">
                                <div class="extra-info">
                                    <div class="extra-name"><?php echo esc_html( $extra['name'] ); ?></div>
                                    <div class="extra-desc"><?php echo esc_html( $extra['description'] ); ?></div>
                                </div>
                                <div class="extra-price-tag">
                                    +$<?php echo esc_html( $extra['price'] ); ?>
                                    <span style="font-size:0.75rem; color:#666; font-weight:normal; display:block;">
                                        <?php echo esc_html( str_replace('_', ' ', $extra['price_type']) ); ?>
                                    </span>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- STEP 5: Customer Details -->
                <div class="booking-step-panel" id="stepPanel_5">
                    <h2 class="step-panel-title"><span>5.</span> Primary Traveler Information</h2>
                    <p class="step-panel-desc">We need your contact information to send official booking documentation and coordinate logistics.</p>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="custFullName">Full Name *</label>
                            <input type="text" id="custFullName" class="form-control" placeholder="e.g. Sarah Jenkins" required>
                        </div>
                        <div class="form-group">
                            <label for="custEmail">Email Address *</label>
                            <input type="email" id="custEmail" class="form-control" placeholder="e.g. sarah@example.com" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="custPhone">WhatsApp / Mobile Number *</label>
                            <input type="tel" id="custPhone" class="form-control" placeholder="e.g. +44 7700 900123" required>
                        </div>
                        <div class="form-group">
                            <label for="custCountry">Country of Residence *</label>
                            <input type="text" id="custCountry" class="form-control" placeholder="e.g. United Kingdom" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="custContactMethod">Preferred Contact Channel</label>
                            <select id="custContactMethod" class="form-control">
                                <option value="WhatsApp">WhatsApp (Fastest response)</option>
                                <option value="Email">Email</option>
                                <option value="Phone Call">Phone Call</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="custFlightInfo">Arrival Flight Info (If booked)</label>
                            <input type="text" id="custFlightInfo" class="form-control" placeholder="e.g. KLM Flight 569 arriving JRO 20:30">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="custDietary">Dietary Requirements</label>
                        <input type="text" id="custDietary" class="form-control" placeholder="e.g. Vegetarian, Gluten-Free, Halal, Nut Allergies...">
                    </div>

                    <div class="form-group">
                        <label for="custSpecialRequests">Additional Special Requests</label>
                        <textarea id="custSpecialRequests" class="form-control" placeholder="Tell us anything else that will help us craft your perfect journey..."></textarea>
                    </div>
                </div>

                <!-- STEP 6: Summary -->
                <div class="booking-step-panel" id="stepPanel_6">
                    <h2 class="step-panel-title"><span>6.</span> Review Booking Summary</h2>
                    <p class="step-panel-desc">Review your safari details and pricing calculation before proceeding to payment confirmation.</p>

                    <div style="background: var(--color-sand-light); border: 1px solid var(--color-border); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
                            <div>
                                <span style="font-size: 0.8rem; text-transform:uppercase; color:#666; font-weight:700;">Selected Safari</span>
                                <div id="step6_pkg" style="font-weight: 700; font-size: 1.1rem; color: var(--color-primary-dark);">-</div>
                            </div>
                            <div>
                                <span style="font-size: 0.8rem; text-transform:uppercase; color:#666; font-weight:700;">Travel Dates</span>
                                <div id="step6_dates" style="font-weight: 700; font-size: 1.1rem; color: var(--color-primary-dark);">-</div>
                            </div>
                            <div>
                                <span style="font-size: 0.8rem; text-transform:uppercase; color:#666; font-weight:700;">Travelers</span>
                                <div id="step6_travelers" style="font-weight: 700; font-size: 1.1rem; color: var(--color-primary-dark);">-</div>
                            </div>
                            <div>
                                <span style="font-size: 0.8rem; text-transform:uppercase; color:#666; font-weight:700;">Accommodation</span>
                                <div id="step6_accomm" style="font-weight: 700; font-size: 1.1rem; color: var(--color-primary-dark);">-</div>
                            </div>
                        </div>

                        <div style="border-top: 1px solid #e0dbce; padding-top: 1.2rem; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <div style="font-size: 0.85rem; color:#666;">Lead Traveler</div>
                                <div id="step6_customer" style="font-weight: 700;">-</div>
                                <div id="step6_email" style="font-size: 0.85rem; color:#666;">-</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.85rem; color:#666;">Total Package Investment</div>
                                <div id="step6_total" style="font-size: 1.8rem; font-weight: 800; color: var(--color-accent); font-family: var(--font-heading);">-</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- STEP 7: Payment -->
                <div class="booking-step-panel" id="stepPanel_7">
                    <h2 class="step-panel-title"><span>7.</span> Payment & Confirmation</h2>
                    <p class="step-panel-desc">Select how you would like to guarantee your reservation today.</p>

                    <div style="margin-bottom: 2rem;">
                        <label style="font-weight: 700; margin-bottom: 0.8rem; display:block;">Payment Structure:</label>
                        <div class="options-grid">
                            <label class="option-radio-card selected">
                                <input type="radio" name="paymentType" value="deposit" checked>
                                <div class="option-title">Pay 30% Deposit Now</div>
                                <div class="option-desc">Secure lodge permits and vehicle today. The remaining 70% balance is due 30 days before departure.</div>
                            </label>
                            <label class="option-radio-card">
                                <input type="radio" name="paymentType" value="full">
                                <div class="option-title">Pay 100% In Full</div>
                                <div class="option-desc">Complete full payment now with zero remaining balances.</div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label style="font-weight: 700; margin-bottom: 0.8rem; display:block;">Select Payment Gateway / Method:</label>
                        <div class="options-grid">
                            <label class="option-radio-card selected">
                                <input type="radio" name="paymentMethod" value="card" checked>
                                <div class="option-title">💳 Credit / Debit Card</div>
                                <div class="option-desc">Visa, MasterCard, Amex processed securely via PCI-DSS 256-bit SSL gateway.</div>
                            </label>
                            <label class="option-radio-card">
                                <input type="radio" name="paymentMethod" value="bank_transfer">
                                <div class="option-title">🏦 Direct Bank Wire</div>
                                <div class="option-desc">Official commercial invoice with CRDB Bank Tanzania SWIFT wire instructions.</div>
                            </label>
                            <label class="option-radio-card">
                                <input type="radio" name="paymentMethod" value="mobile_money">
                                <div class="option-title">📱 Mobile Money (East Africa)</div>
                                <div class="option-desc">M-Pesa, Airtel Money, or Tigo Pesa for regional travelers.</div>
                            </label>
                        </div>
                    </div>

                    <div style="background: #eef7ed; padding: 1.2rem; border-radius: 8px; border-left: 4px solid #137333; margin-top: 2rem; font-size: 0.9rem;">
                        🔒 <strong>Secure Reservation Guarantee:</strong> Your booking is instantly issued with an authentic reference code (e.g. ME-2026-0001). Our Arusha headquarters holds lodge allocations upon booking submission.
                    </div>
                </div>

                <!-- Navigation Action Buttons -->
                <div class="step-navigation-actions">
                    <button type="button" class="btn btn-outline-dark" id="btnPrevStep" style="display: none;">
                        ← Previous Step
                    </button>
                    <div style="flex-grow: 1;"></div>
                    <button type="button" class="btn btn-primary" id="btnNextStep">
                        Continue to Next Step →
                    </button>
                    <button type="button" class="btn btn-primary btn-lg" id="btnSubmitBooking" style="display: none;">
                        Confirm & Reserve My Safari 🦁
                    </button>
                </div>
            </div>

            <!-- Right: Sticky Live Price Calculation Sidebar -->
            <aside class="booking-summary-sidebar">
                <div class="summary-header">
                    <h3>Booking Summary</h3>
                    <p>Live itinerary breakdown & pricing</p>
                </div>
                <div class="summary-body">
                    <div class="summary-item-row">
                        <span class="summary-item-label">Package:</span>
                        <span class="summary-item-value" id="summaryPkgName">Loading...</span>
                    </div>
                    <div class="summary-item-row">
                        <span class="summary-item-label">Dates:</span>
                        <span class="summary-item-value" id="summaryDates">Select Date</span>
                    </div>
                    <div class="summary-item-row">
                        <span class="summary-item-label">Party:</span>
                        <span class="summary-item-value" id="summaryTravelers">2 Adults</span>
                    </div>
                    <div class="summary-item-row">
                        <span class="summary-item-label">Standard:</span>
                        <span class="summary-item-value" id="summaryAccomm">Mid-Range</span>
                    </div>

                    <div class="summary-divider"></div>

                    <div style="font-size: 0.82rem; font-weight: 700; text-transform:uppercase; color:#666; margin-bottom: 0.5rem;">
                        Selected Optional Extras:
                    </div>
                    <div id="summaryExtrasList" style="font-size: 0.85rem; margin-bottom: 1rem;">
                        <span style="color:#888;">None selected</span>
                    </div>

                    <div class="summary-divider"></div>

                    <div class="summary-item-row">
                        <span class="summary-item-label">Base Safari Total:</span>
                        <span class="summary-item-value" id="summaryBaseTotal">$0</span>
                    </div>
                    <div class="summary-item-row">
                        <span class="summary-item-label">Extras Total:</span>
                        <span class="summary-item-value" id="summaryExtrasTotal">$0</span>
                    </div>

                    <div class="summary-total-row">
                        <span class="summary-total-label">Total Price:</span>
                        <span class="summary-total-value" id="summaryTotalAmount">$0</span>
                    </div>

                    <div class="deposit-box">
                        <div class="deposit-title">30% Deposit to Confirm:</div>
                        <div class="deposit-val" id="summaryDepositAmount">$0</div>
                        <div style="font-size: 0.78rem; color:#666; margin-top: 0.2rem;">
                            Balance Due (<span id="summaryBalanceDue">$0</span>) payable 30 days prior.
                        </div>
                    </div>
                </div>
            </aside>
        </div>

        <!-- Success Confirmation Voucher (Revealed upon submission) -->
        <div id="bookingVoucherWrap" style="display: none; padding: 2rem 0;">
            <div class="booking-voucher-card">
                <div class="success-icon-wrap">✓</div>
                <h2 style="font-size: 2.2rem; color: var(--color-primary-dark); margin-bottom: 0.5rem;">Safari Reservation Confirmed!</h2>
                <p style="font-size: 1.1rem; color: var(--color-dark-muted);">
                    Karibu sana! Your Tanzanian journey with Malunda Explorers has been successfully registered.
                </p>

                <div>
                    <span style="font-size:0.85rem; font-weight:700; text-transform:uppercase; color:#666; display:block;">Your Booking Reference Number:</span>
                    <div class="voucher-ref-code" id="voucherRefCode">ME-2026-0001</div>
                </div>

                <div class="voucher-details-grid">
                    <div><strong>Safari Itinerary:</strong> <span id="voucherSafariTitle">-</span></div>
                    <div><strong>Travel Date:</strong> <span id="voucherTravelDate">-</span></div>
                    <div><strong>Lead Traveler:</strong> <span id="voucherCustName">-</span></div>
                    <div><strong>Party Size:</strong> <span id="voucherTravelers">-</span></div>
                    <div><strong>Email:</strong> <span id="voucherCustEmail">-</span></div>
                    <div><strong>Phone/WhatsApp:</strong> <span id="voucherCustPhone">-</span></div>
                    <div><strong>Total Investment:</strong> <span id="voucherTotal">-</span></div>
                    <div><strong>Deposit Registered:</strong> <span id="voucherDeposit">-</span></div>
                </div>

                <p style="font-size: 0.95rem; margin-bottom: 2rem;">
                    A formal booking confirmation email has been dispatched to your email address. Our Arusha safari operations team will contact you via WhatsApp shortly with your personalized preparation packet.
                </p>

                <div style="display:flex; justify-content:center; gap: 1rem; flex-wrap:wrap;">
                    <button type="button" class="btn btn-outline-dark" onclick="window.print();">
                        🖨️ Print Booking Voucher
                    </button>
                    <a href="https://wa.me/255784567890?text=Hello%20Malunda%20Explorers,%20I%20have%20completed%20booking%20my%20safari!" target="_blank" rel="noopener" class="btn btn-primary">
                        💬 Chat with Safari Director on WhatsApp
                    </a>
                </div>
            </div>
        </div>

    </div>
</div>

<!-- Embedded Safari Data for instant client-side fallback -->
<script>
window.MALUNDA_EMBEDDED_DATA = <?php echo json_encode( $data ); ?>;
</script>
<script src="<?php echo esc_url( get_template_directory_uri() . '/assets/js/booking-engine.js' ); ?>"></script>

<?php
get_footer();
