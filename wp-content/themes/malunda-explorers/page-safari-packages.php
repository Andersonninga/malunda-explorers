<?php
/**
 * Template Name: Safari Packages Directory
 *
 * @package Malunda_Explorers
 */
get_header();

$packages = function_exists( 'malunda_get_packages' ) ? malunda_get_packages() : array();
?>

<section style="background: linear-gradient(rgba(15, 34, 21, 0.75), rgba(15, 34, 21, 0.85)), url('<?php echo esc_url( get_template_directory_uri() . '/assets/images/malunda-safari-004.jpg' ); ?>') center/cover; padding: 6rem 1.5rem 5rem; color: #fff; text-align: center;">
    <div class="container-narrow">
        <span class="badge" style="margin-bottom: 1rem;">CURATED ITINERARIES</span>
        <h1 style="color: #fff; margin-bottom: 1rem;">Tanzania Safari Packages</h1>
        <p style="font-size: 1.15rem; color: rgba(255, 255, 255, 0.9); line-height: 1.8;">
            Thoughtfully planned safari itineraries designed around the way you want to explore. Fully customizable with private 4x4 vehicles, certified naturalists, and flexible departure dates.
        </p>
    </div>
</section>

<section class="section">
    <div class="container">
        <!-- Filter bar -->
        <div style="background: #fff; padding: 1.5rem 2rem; border-radius: 12px; border: 1px solid var(--color-border); box-shadow: var(--shadow-sm); margin-bottom: 3rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: 1rem;">
            <div>
                <span style="font-weight: 700; color: var(--color-primary-dark);">Showing 9 Handcrafted Safaris</span>
                <span style="color: #666; font-size: 0.9rem;"> • Guaranteed Departures Daily</span>
            </div>
            <div style="display:flex; gap: 0.8rem; align-items:center;">
                <label for="packageSort" style="font-size: 0.85rem; font-weight:700; text-transform:uppercase; color:#666;">Sort By:</label>
                <select id="packageSort" class="form-control" style="width: auto; padding: 0.5rem 1rem;">
                    <option value="featured">Featured First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="duration">Duration (Days)</option>
                </select>
            </div>
        </div>

        <div class="packages-grid">
            <?php foreach ( $packages as $pkg ) : ?>
                <div class="package-card">
                    <div class="package-image-wrap">
                        <img src="<?php echo esc_url( $pkg['image'] ); ?>" alt="<?php echo esc_attr( $pkg['title'] ); ?>" loading="lazy">
                        <div class="package-duration-pill">
                            <span>🕒</span>
                            <span><?php echo esc_html( $pkg['days'] ); ?> Days / <?php echo esc_html( $pkg['nights'] ); ?> Nights</span>
                        </div>
                    </div>
                    <div class="package-body">
                        <div class="package-destinations-tags">
                            <?php foreach ( $pkg['destinations'] as $d ) : ?>
                                <span class="dest-tag"><?php echo esc_html( $d ); ?></span>
                            <?php endforeach; ?>
                        </div>
                        <h3 class="package-title"><?php echo esc_html( $pkg['title'] ); ?></h3>
                        <div class="package-meta">
                            <span>Style: <strong><?php echo esc_html( $pkg['safari_style'] ); ?></strong></span>
                        </div>
                        <ul class="package-highlights">
                            <?php foreach ( array_slice( $pkg['highlights'], 0, 3 ) as $hl ) : ?>
                                <li><?php echo esc_html( $hl ); ?></li>
                            <?php endforeach; ?>
                        </ul>
                        <div class="package-footer">
                            <div class="price-box">
                                <span class="price-from-label">From</span>
                                <span class="price-amount">$<?php echo esc_html( number_format( $pkg['base_price'] ) ); ?></span>
                            </div>
                            <div class="package-btns">
                                <a href="<?php echo esc_url( home_url( '/safaris/' . $pkg['slug'] . '/' ) ); ?>" class="btn btn-outline-dark btn-sm">
                                    Itinerary
                                </a>
                                <a href="<?php echo esc_url( home_url( '/booking/?package=' . $pkg['id'] ) ); ?>" class="btn btn-primary btn-sm">
                                    Book Now
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<?php
get_footer();
