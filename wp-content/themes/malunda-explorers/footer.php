<?php
/**
 * Malunda Explorers - Footer Template
 */
$data = function_exists( 'malunda_get_data' ) ? malunda_get_data() : array();
$phone = $data['site_settings']['phone'] ?? '+255 784 567 890';
$whatsapp = $data['site_settings']['whatsapp'] ?? '+255784567890';
$email = $data['site_settings']['email'] ?? 'info@malundaexplorers.com';
$address = $data['site_settings']['address'] ?? 'Safari Way, Plot 42, Arusha, Tanzania';
?>
<footer class="site-footer">
    <div class="container">
        <div class="footer-top">
            <!-- Brand Column -->
            <div class="footer-brand">
                <img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/logo.png' ); ?>" alt="Malunda Explorers Logo" style="height: 64px; width: auto; object-fit: contain; margin-bottom: 1rem; filter: brightness(0) invert(1);">
                <h3>MALUNDA EXPLORERS</h3>
                <div class="footer-tagline">Explore the Wild. Experience More. Create Memories.</div>
                <p class="footer-desc">
                    “Thoughtfully designed safari and travel experiences for travelers seeking authentic encounters, extraordinary landscapes and unforgettable moments.”
                </p>
                <div class="footer-contact-info">
                    <div>📍 <?php echo esc_html( $address ); ?></div>
                    <div>📞 <a href="tel:<?php echo esc_attr( str_replace(' ', '', $phone) ); ?>"><?php echo esc_html( $phone ); ?></a></div>
                    <div>✉️ <a href="mailto:<?php echo esc_attr( $email ); ?>"><?php echo esc_html( $email ); ?></a></div>
                </div>
            </div>

            <!-- Explore Column -->
            <div class="footer-col">
                <h4>Explore</h4>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Home</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/about-us/' ) ); ?>">About Us</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/destinations/' ) ); ?>">Destinations</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/safaris/' ) ); ?>">Safaris</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/safari-experiences/' ) ); ?>">Services & Experiences</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/gallery/' ) ); ?>">Gallery</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>">Contact</a></li>
                </ul>
            </div>

            <!-- Travel Destinations Column -->
            <div class="footer-col">
                <h4>Travel</h4>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/destinations/serengeti/' ) ); ?>">Serengeti</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/destinations/ngorongoro/' ) ); ?>">Ngorongoro</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/destinations/tarangire/' ) ); ?>">Tarangire</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/destinations/lake-manyara/' ) ); ?>">Lake Manyara</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/destinations/mount-kilimanjaro/' ) ); ?>">Kilimanjaro</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/destinations/zanzibar/' ) ); ?>">Zanzibar</a></li>
                </ul>
            </div>

            <!-- Connect & Legal Column -->
            <div class="footer-col">
                <h4>Connect</h4>
                <ul>
                    <li><a href="https://wa.me/<?php echo esc_attr( $whatsapp ); ?>" target="_blank" rel="noopener">WhatsApp Direct</a></li>
                    <li><a href="mailto:<?php echo esc_attr( $email ); ?>">Email Inquiry</a></li>
                    <li><a href="https://instagram.com" target="_blank" rel="noopener">Instagram (@malundaexplorers)</a></li>
                    <li><a href="https://facebook.com" target="_blank" rel="noopener">Facebook</a></li>
                </ul>

                <h4 style="margin-top: 2rem;">Legal</h4>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/privacy-policy/' ) ); ?>">Privacy Policy</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/terms-conditions/' ) ); ?>">Terms & Conditions</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/booking-terms/' ) ); ?>">Booking Terms</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/faq/' ) ); ?>">FAQs</a></li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom">
            <div>
                © 2026 Malunda Explorers. All Rights Reserved. TALA Tourism Licensed & AMREF Covered.
            </div>
            <div>
                Arusha, Tanzania • East Africa
            </div>
        </div>
    </div>
</footer>

<!-- Sticky Mobile Booking Button -->
<div class="mobile-sticky-bar">
    <div style="display:flex; justify-content:space-between; align-items:center; gap: 1rem;">
        <div>
            <div style="color:var(--color-accent); font-size:0.75rem; font-weight:700; text-transform:uppercase;">Every Journey Tells a Story</div>
            <div style="color:#ffffff; font-size:0.9rem; font-weight:800;">Book Your Tanzania Safari</div>
        </div>
        <a href="<?php echo esc_url( home_url( '/booking/' ) ); ?>" class="btn btn-primary btn-sm">
            BOOK NOW
        </a>
    </div>
</div>

<script src="<?php echo esc_url( get_template_directory_uri() . '/assets/js/main.js' ); ?>"></script>
<?php wp_footer(); ?>
</body>
</html>
