<?php
/**
 * Single Safari Package Detail Template
 *
 * @package Malunda_Explorers
 */
get_header();

// Fetch default package or package by slug/id
$packages = function_exists( 'malunda_get_packages' ) ? malunda_get_packages() : array();
$pkg = $packages[0]; // fallback default 7-Day Signature

// If slug exists in URL query or requested
$requestedSlug = get_query_var( 'safari_slug' ) ?? '';
if ( ! empty( $requestedSlug ) ) {
    foreach ( $packages as $p ) {
        if ( $p['slug'] === $requestedSlug || $p['id'] === $requestedSlug ) {
            $pkg = $p;
            break;
        }
    }
}
?>

<!-- Large Hero Banner -->
<section style="position: relative; min-height: 65vh; display: flex; align-items: flex-end; background: linear-gradient(180deg, rgba(15, 34, 21, 0.4) 0%, rgba(15, 34, 21, 0.9) 100%), url('<?php echo esc_url( $pkg['image'] ); ?>') center/cover no-repeat; padding: 5rem 1.5rem; color: #fff;">
    <div class="container">
        <div style="max-width: 860px;">
            <div style="display:flex; gap: 0.6rem; flex-wrap:wrap; margin-bottom: 1rem;">
                <span class="badge" style="background: var(--color-accent); color: #fff;"><?php echo esc_html( $pkg['safari_style'] ); ?></span>
                <span class="badge" style="background: rgba(255,255,255,0.2); color: #fff;">🕒 <?php echo esc_html( $pkg['days'] ); ?> Days / <?php echo esc_html( $pkg['nights'] ); ?> Nights</span>
                <span class="badge" style="background: rgba(255,255,255,0.2); color: #fff;">📍 <?php echo esc_html( implode( ' • ', $pkg['destinations'] ) ); ?></span>
            </div>
            <h1 style="color: #fff; font-size: clamp(2.4rem, 5vw, 3.8rem); margin-bottom: 0.5rem; line-height: 1.15;">
                <?php echo esc_html( $pkg['title'] ); ?>
            </h1>
            <p style="font-size: 1.25rem; font-family: var(--font-heading); font-style: italic; color: var(--color-sand); margin-bottom: 0;">
                <?php echo esc_html( $pkg['subtitle'] ); ?>
            </p>
        </div>
    </div>
</section>

<!-- Package Content & Sticky Booking Widget Grid -->
<div class="section">
    <div class="container">
        <div style="display: grid; grid-template-columns: 1fr 380px; gap: 3rem; align-items: flex-start;">
            
            <!-- Left Main Content Area -->
            <div class="package-main-details">
                <!-- Overview -->
                <div style="background: #fff; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--color-border); margin-bottom: 2.5rem;">
                    <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">Safari Overview</h2>
                    <p style="font-size: 1.05rem; line-height: 1.8;">
                        <?php echo esc_html( $pkg['overview'] ); ?>
                    </p>

                    <h3 style="font-size: 1.3rem; margin-top: 2rem; margin-bottom: 1rem;">Main Wildlife & Safari Highlights</h3>
                    <ul style="list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.8rem;">
                        <?php foreach ( $pkg['highlights'] as $hl ) : ?>
                            <li style="display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.95rem;">
                                <span style="color: var(--color-accent); font-weight: 800; font-size: 1.1rem;">✓</span>
                                <span><?php echo esc_html( $hl ); ?></span>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </div>

                <!-- Day-by-Day Itinerary -->
                <div style="background: #fff; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--color-border); margin-bottom: 2.5rem;">
                    <h2 style="font-size: 1.8rem; margin-bottom: 1.5rem;">Day-by-Day Safari Itinerary</h2>
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <?php foreach ( $pkg['itinerary'] as $itin ) : ?>
                            <div style="border-left: 3px solid var(--color-accent); padding-left: 1.5rem; position: relative;">
                                <div style="display:flex; align-items:center; gap: 0.8rem; margin-bottom: 0.4rem;">
                                    <span style="background: var(--color-primary); color: #fff; font-weight: 700; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 4px; text-transform:uppercase;">Day <?php echo esc_html( $itin['day'] ); ?></span>
                                    <h3 style="font-size: 1.25rem; margin: 0;"><?php echo esc_html( $itin['title'] ); ?></h3>
                                </div>
                                <p style="font-size: 0.96rem; line-height: 1.7; color: var(--color-dark-muted); margin: 0;">
                                    <?php echo esc_html( $itin['desc'] ); ?>
                                </p>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Inclusions & Exclusions -->
                <div style="background: #fff; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--color-border); margin-bottom: 2.5rem;">
                    <h2 style="font-size: 1.8rem; margin-bottom: 1.5rem;">What is Included & Not Included</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
                        <div>
                            <h3 style="color: #137333; font-size: 1.2rem; display:flex; align-items:center; gap: 0.5rem; margin-bottom: 1rem;">
                                <span>✓</span> Included in Safari
                            </h3>
                            <ul style="list-style: none; padding: 0; margin: 0; display:flex; flex-direction:column; gap: 0.6rem;">
                                <?php foreach ( $pkg['included'] as $inc ) : ?>
                                    <li style="font-size: 0.92rem; color: var(--color-dark); display:flex; gap: 0.5rem;">
                                        <span style="color: #137333;">✔</span> <?php echo esc_html( $inc ); ?>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                        <div>
                            <h3 style="color: #c5221f; font-size: 1.2rem; display:flex; align-items:center; gap: 0.5rem; margin-bottom: 1rem;">
                                <span>✕</span> Not Included
                            </h3>
                            <ul style="list-style: none; padding: 0; margin: 0; display:flex; flex-direction:column; gap: 0.6rem;">
                                <?php foreach ( $pkg['not_included'] as $ninc ) : ?>
                                    <li style="font-size: 0.92rem; color: var(--color-dark-muted); display:flex; gap: 0.5rem;">
                                        <span style="color: #c5221f;">✖</span> <?php echo esc_html( $ninc ); ?>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Accommodation, Transport & Meals -->
                <div style="background: #fff; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--color-border); margin-bottom: 2.5rem;">
                    <h2 style="font-size: 1.8rem; margin-bottom: 1.5rem;">Comfort, Transport & Dining</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem;">
                        <div style="background: var(--color-sand-light); padding: 1.5rem; border-radius: 12px;">
                            <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">🏨</div>
                            <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem;">Handpicked Lodges</h3>
                            <p style="font-size: 0.88rem; margin: 0;">Comfortable en-suite tented suites with hot showers, charging facilities, and stunning savannah vistas.</p>
                        </div>
                        <div style="background: var(--color-sand-light); padding: 1.5rem; border-radius: 12px;">
                            <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">🚙</div>
                            <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem;">Custom 4x4 Land Cruiser</h3>
                            <p style="font-size: 0.88rem; margin: 0;">Extended Land Cruiser with pop-up photography roof hatch, high-frequency radio, mini-fridge, and charging ports.</p>
                        </div>
                        <div style="background: var(--color-sand-light); padding: 1.5rem; border-radius: 12px;">
                            <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">🍽️</div>
                            <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem;">Full Board Dining</h3>
                            <p style="font-size: 0.88rem; margin: 0;">Hearty breakfasts, hot cooked lodge dinners, gourmet bush picnic lunches, and unlimited chilled bottled water.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Sticky Booking CTA Widget -->
            <aside style="position: sticky; top: 100px;">
                <div style="background: #fff; border-radius: 16px; border: 2px solid var(--color-accent); box-shadow: var(--shadow-lg); overflow: hidden;">
                    <div style="background: var(--color-primary-dark); color: #fff; padding: 1.8rem;">
                        <span style="font-size: 0.8rem; text-transform:uppercase; letter-spacing:0.08em; color: var(--color-accent); font-weight:700;">GUARANTEED DEPARTURES</span>
                        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top: 0.5rem;">
                            <span style="font-size: 0.9rem; color: rgba(255,255,255,0.8);">Starting from:</span>
                            <span style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; color: var(--color-accent);">$<?php echo esc_html( number_format( $pkg['base_price'] ) ); ?></span>
                        </div>
                        <div style="font-size: 0.78rem; color: rgba(255,255,255,0.65); text-align:right;">per person (all-inclusive ground tour)</div>
                    </div>

                    <div style="padding: 1.8rem;">
                        <div style="display:flex; flex-direction:column; gap: 0.8rem; font-size: 0.92rem; margin-bottom: 1.5rem;">
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:#666;">Duration:</span>
                                <strong><?php echo esc_html( $pkg['days'] ); ?> Days / <?php echo esc_html( $pkg['nights'] ); ?> Nights</strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:#666;">Tour Style:</span>
                                <strong><?php echo esc_html( $pkg['safari_style'] ); ?></strong>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:#666;">Availability:</span>
                                <span style="color:#137333; font-weight:700;">Daily Year-Round</span>
                            </div>
                            <div style="display:flex; justify-content:space-between;">
                                <span style="color:#666;">Deposit Required:</span>
                                <strong>30% at booking</strong>
                            </div>
                        </div>

                        <a href="<?php echo esc_url( home_url( '/booking/?package=' . $pkg['id'] ) ); ?>" class="btn btn-primary btn-block btn-lg" style="margin-bottom: 0.8rem;">
                            BOOK THIS SAFARI NOW
                        </a>

                        <a href="https://wa.me/255784567890?text=Hello%20Malunda%20Explorers,%20I%20am%20interested%20in%20<?php echo urlencode( $pkg['title'] ); ?>" target="_blank" rel="noopener" class="btn btn-outline-dark btn-block">
                            💬 Inquire on WhatsApp
                        </a>

                        <div style="text-align: center; margin-top: 1.2rem; font-size: 0.8rem; color: #666;">
                            🔒 Free cancellation up to 60 days before trip.<br>
                            AMREF Flying Doctors rescue cover included.
                        </div>
                    </div>
                </div>
            </aside>

        </div>
    </div>
</div>

<?php
get_footer();
