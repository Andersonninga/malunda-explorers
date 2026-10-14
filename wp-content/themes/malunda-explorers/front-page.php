<?php
/**
 * Malunda Explorers - Front Page Template
 */
get_header();

$packages = function_exists( 'malunda_get_packages' ) ? malunda_get_packages() : array();
$destinations = function_exists( 'malunda_get_destinations' ) ? malunda_get_destinations() : array();
$experiences = function_exists( 'malunda_get_experiences' ) ? malunda_get_experiences() : array();
$testimonials = function_exists( 'malunda_get_testimonials' ) ? malunda_get_testimonials() : array();
?>

<!-- 1. HERO SECTION -->
<section class="hero-section">
    <div class="hero-overlay"></div>
    <div class="hero-content">
        <span class="hero-badge">TANZANIA SAFARI EXPERIENCES</span>
        <h1 class="hero-headline">Every Journey Tells a Story</h1>
        <p class="hero-subtitle">“Your journey into the wild begins here, where every encounter becomes a story worth telling.”</p>
        <p class="hero-description">
            From the endless savannahs of the Serengeti to the breathtaking Ngorongoro Crater, Malunda Explorers creates authentic Tanzanian safari experiences designed around the way you want to explore.
        </p>
        <div class="hero-actions">
            <a href="<?php echo esc_url( home_url( '/booking/' ) ); ?>" class="btn btn-primary btn-lg">
                PLAN YOUR SAFARI
            </a>
            <a href="<?php echo esc_url( home_url( '/safaris/' ) ); ?>" class="btn btn-secondary btn-lg">
                EXPLORE SAFARIS
            </a>
        </div>
    </div>
    <a href="#quick-search" class="scroll-indicator" aria-label="Scroll to Quick Safari Search">
        <span>Scroll to Explore</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
        </svg>
    </a>
</section>

<!-- 2. QUICK BOOKING / SAFARI SEARCH SECTION -->
<div class="safari-search-bar" id="quick-search">
    <div class="container">
        <div class="search-box-card">
            <div class="search-bar-title">
                <span>🦁</span>
                <strong>Find Your Perfect Tanzanian Journey</strong> — Customise destinations, dates, and travelers
            </div>
            <form id="quickSafariSearchForm" class="search-form-grid">
                <div class="search-field">
                    <label for="searchDestination">Destination</label>
                    <select id="searchDestination" name="destination">
                        <option value="">All Destinations</option>
                        <option value="serengeti">Serengeti National Park</option>
                        <option value="ngorongoro">Ngorongoro Crater</option>
                        <option value="tarangire">Tarangire National Park</option>
                        <option value="lake-manyara">Lake Manyara</option>
                        <option value="mount-kilimanjaro">Mount Kilimanjaro</option>
                        <option value="zanzibar">Zanzibar Beach</option>
                    </select>
                </div>

                <div class="search-field">
                    <label for="searchStyle">Safari Type</label>
                    <select id="searchStyle" name="safari_type">
                        <option value="">All Safari Types</option>
                        <option value="classic">Classic Safari</option>
                        <option value="luxury">Luxury & Tented</option>
                        <option value="migration">Great Migration</option>
                        <option value="honeymoon">Honeymoon & Romantic</option>
                        <option value="family">Family Safari</option>
                        <option value="private">Private Tailor-Made</option>
                    </select>
                </div>

                <div class="search-field">
                    <label for="searchDate">Travel Date</label>
                    <input type="date" id="searchDate" name="travel_date">
                </div>

                <div class="search-field">
                    <label for="searchTravelers">Travelers</label>
                    <select id="searchTravelers" name="travelers">
                        <option value="2">2 Adults</option>
                        <option value="1">1 Solo Traveler</option>
                        <option value="3">3 Travelers</option>
                        <option value="4">4 Travelers</option>
                        <option value="5">5+ Family / Group</option>
                    </select>
                </div>

                <div class="search-field">
                    <label for="searchDuration">Trip Duration</label>
                    <select id="searchDuration" name="duration">
                        <option value="">Any Duration</option>
                        <option value="3-4">3 - 4 Days</option>
                        <option value="5-6">5 - 6 Days</option>
                        <option value="7-8">7 - 8 Days</option>
                        <option value="9+">9+ Days (Bush to Beach)</option>
                    </select>
                </div>

                <div class="search-field">
                    <button type="submit" class="btn btn-primary btn-block" style="height: 48px;">
                        FIND MY SAFARI
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- 3. FEATURED DESTINATIONS -->
<section class="section">
    <div class="container">
        <div class="section-header">
            <span class="section-subtitle">UNRIVALLED WILDERNESS</span>
            <h2>Explore the Wild Heart of Tanzania</h2>
            <p>Discover legendary landscapes, untamed wilderness, and extraordinary wildlife across Tanzania’s most remarkable safari destinations.</p>
        </div>

        <div class="destinations-grid">
            <!-- Serengeti -->
            <div class="destination-card">
                <div class="dest-img-wrap">
                    <img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/malunda-safari-010.jpg' ); ?>" alt="Serengeti National Park" loading="lazy">
                    <span class="dest-badge">Great Migration</span>
                </div>
                <div class="dest-content">
                    <h3>Serengeti National Park</h3>
                    <p>“Vast plains, extraordinary wildlife and some of Africa's most unforgettable natural spectacles.”</p>
                    <div class="dest-footer">
                        <a href="<?php echo esc_url( home_url( '/destinations/serengeti/' ) ); ?>" class="dest-link">
                            Explore Serengeti <span>→</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Ngorongoro -->
            <div class="destination-card">
                <div class="dest-img-wrap">
                    <img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/malunda-safari-011.jpg' ); ?>" alt="Ngorongoro Crater" loading="lazy">
                    <span class="dest-badge">World Heritage</span>
                </div>
                <div class="dest-content">
                    <h3>Ngorongoro Crater</h3>
                    <p>“Descend into one of Africa's most remarkable wildlife destinations, where dramatic landscapes surround an extraordinary concentration of wildlife.”</p>
                    <div class="dest-footer">
                        <a href="<?php echo esc_url( home_url( '/destinations/ngorongoro/' ) ); ?>" class="dest-link">
                            Explore Ngorongoro <span>→</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Tarangire -->
            <div class="destination-card">
                <div class="dest-img-wrap">
                    <img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/malunda-safari-012.jpg' ); ?>" alt="Tarangire National Park" loading="lazy">
                    <span class="dest-badge">Elephant Giants</span>
                </div>
                <div class="dest-content">
                    <h3>Tarangire National Park</h3>
                    <p>“Known for its magnificent elephants, ancient baobabs and distinctive landscapes, Tarangire offers a quieter and deeply rewarding safari experience.”</p>
                    <div class="dest-footer">
                        <a href="<?php echo esc_url( home_url( '/destinations/tarangire/' ) ); ?>" class="dest-link">
                            Explore Tarangire <span>→</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Lake Manyara -->
            <div class="destination-card">
                <div class="dest-img-wrap">
                    <img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/malunda-safari-013.jpg' ); ?>" alt="Lake Manyara National Park" loading="lazy">
                    <span class="dest-badge">Rift Valley</span>
                </div>
                <div class="dest-content">
                    <h3>Lake Manyara National Park</h3>
                    <p>“A compact and diverse ecosystem where forests, wetlands, open plains and wildlife come together beneath the dramatic Rift Valley landscape.”</p>
                    <div class="dest-footer">
                        <a href="<?php echo esc_url( home_url( '/destinations/lake-manyara/' ) ); ?>" class="dest-link">
                            Explore Lake Manyara <span>→</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Mount Kilimanjaro -->
            <div class="destination-card">
                <div class="dest-img-wrap">
                    <img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/malunda-safari-014.jpg' ); ?>" alt="Mount Kilimanjaro" loading="lazy">
                    <span class="dest-badge">Roof of Africa</span>
                </div>
                <div class="dest-content">
                    <h3>Mount Kilimanjaro</h3>
                    <p>“Experience the presence of Africa's highest mountain, whether as the centerpiece of your journey or as part of a wider Tanzanian adventure.”</p>
                    <div class="dest-footer">
                        <a href="<?php echo esc_url( home_url( '/destinations/mount-kilimanjaro/' ) ); ?>" class="dest-link">
                            Explore Kilimanjaro <span>→</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Zanzibar -->
            <div class="destination-card">
                <div class="dest-img-wrap">
                    <img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/malunda-safari-015.jpg' ); ?>" alt="Zanzibar Archipelago" loading="lazy">
                    <span class="dest-badge">Spice Island</span>
                </div>
                <div class="dest-content">
                    <h3>Zanzibar</h3>
                    <p>“Complete your African journey with warm Indian Ocean waters, rich history, beautiful beaches and the distinctive character of Zanzibar.”</p>
                    <div class="dest-footer">
                        <a href="<?php echo esc_url( home_url( '/destinations/zanzibar/' ) ); ?>" class="dest-link">
                            Explore Zanzibar <span>→</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- 4. WHY CHOOSE MALUNDA EXPLORERS (6 Feature Blocks) -->
<section class="section section-bg-sand">
    <div class="container">
        <div class="section-header">
            <span class="section-subtitle">THE MALUNDA DIFFERENCE</span>
            <h2>Travel with Purpose. Explore with Confidence.</h2>
            <p>We believe travel should be deeply personal, flawlessly orchestrated, and grounded in respect for Tanzania’s wilderness and people.</p>
        </div>

        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">✨</div>
                <h3>Personal & Tailored</h3>
                <p>“We take time to understand your interests, expectations, and travel style, creating a safari that is genuinely designed around you.”</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">🗺️</div>
                <h3>Thoughtfully Planned</h3>
                <p>“From carefully selected accommodation and game drives to transfers and daily experiences, we manage the details so you can enjoy the adventure.”</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">🌿</div>
                <h3>Local Knowledge</h3>
                <p>“Our local perspective connects you with Tanzania’s wildlife, landscapes, culture, and the unique character of each destination.”</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">🤝</div>
                <h3>Caring & Reliable Service</h3>
                <p>“From your first inquiry to your journey home, we are committed to clear communication, honest guidance, and dependable support.”</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">🦁</div>
                <h3>Authentic Experiences</h3>
                <p>“We go beyond simply visiting Tanzania. We aim to create meaningful encounters, unforgettable moments, and a deeper connection with the wild.”</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">🌍</div>
                <h3>Responsible Travel</h3>
                <p>“Respect wildlife, nature, local communities and the places that make every journey possible.”</p>
            </div>
        </div>

        <div style="text-align: center; margin-top: 3.5rem;">
            <a href="<?php echo esc_url( home_url( '/booking/' ) ); ?>" class="btn btn-primary btn-lg">
                START PLANNING YOUR SAFARI
            </a>
        </div>
    </div>
</section>

<!-- 5. SAFARI EXPERIENCES -->
<section class="section">
    <div class="container">
        <div class="section-header">
            <span class="section-subtitle">CUSTOM JOURNEYS</span>
            <h2>Find The Journey That Feels Right for You</h2>
            <p>Whether you seek private luxury tented sanctuaries, authentic family adventures, or tracking the Great Migration, our safari styles are crafted to match your vision.</p>
        </div>

        <div class="experiences-grid">
            <?php foreach ( $experiences as $exp ) : ?>
                <div class="experience-card" onclick="window.location.href='<?php echo esc_url( home_url( '/booking/?style=' . urlencode( $exp['title'] ) ) ); ?>'">
                    <img src="<?php echo esc_url( $exp['image'] ); ?>" alt="<?php echo esc_attr( $exp['title'] ); ?>" class="exp-bg" loading="lazy">
                    <div class="exp-overlay">
                        <span class="exp-badge"><?php echo esc_html( $exp['badge'] ); ?></span>
                        <h3><?php echo esc_html( $exp['title'] ); ?></h3>
                        <p><?php echo esc_html( $exp['short_desc'] ); ?></p>
                        <div class="exp-actions">
                            <a href="<?php echo esc_url( home_url( '/safaris/' ) ); ?>" class="btn btn-secondary btn-sm" onclick="event.stopPropagation();">
                                View Details
                            </a>
                            <a href="<?php echo esc_url( home_url( '/booking/?style=' . urlencode( $exp['title'] ) ) ); ?>" class="btn btn-primary btn-sm" onclick="event.stopPropagation();">
                                Book Now
                            </a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- 6. FEATURED SAFARI PACKAGES -->
<section class="section section-bg-sand">
    <div class="container">
        <div class="section-header">
            <span class="section-subtitle">CURATED ITINERARIES</span>
            <h2>Featured Tanzania Safari Packages</h2>
            <p>Handcrafted journeys showcasing the premier wildlife encounters, dramatic topography, and authentic camps of Northern Tanzania.</p>
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

        <div style="text-align: center; margin-top: 3.5rem;">
            <a href="<?php echo esc_url( home_url( '/safaris/' ) ); ?>" class="btn btn-outline-dark btn-lg">
                View All Safari Packages (9 Itineraries)
            </a>
        </div>
    </div>
</section>

<!-- 7. GUEST REVIEWS / TESTIMONIALS -->
<section class="section">
    <div class="container">
        <div class="section-header">
            <span class="section-subtitle">STORIES FROM THE WILD</span>
            <h2>Traveler Experiences with Malunda Explorers</h2>
            <p>Every journey tells a story. Here is what travelers from around the world share about exploring Tanzania with our team.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
            <?php foreach ( $testimonials as $t ) : ?>
                <div style="background: #ffffff; padding: 2.2rem; border-radius: 12px; border: 1px solid var(--color-border); box-shadow: var(--shadow-sm); display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="color: var(--color-accent); font-size: 1.2rem; margin-bottom: 1rem;">★★★★★</div>
                        <p style="font-style: italic; font-size: 0.96rem; line-height: 1.7; color: var(--color-dark);">
                            “<?php echo esc_html( $t['quote'] ); ?>”
                        </p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--color-border-subtle);">
                        <img src="<?php echo esc_url( $t['photo'] ); ?>" alt="<?php echo esc_attr( $t['author'] ); ?>" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
                        <div>
                            <div style="font-weight: 700; color: var(--color-primary-dark); font-size: 0.95rem;"><?php echo esc_html( $t['author'] ); ?></div>
                            <div style="font-size: 0.8rem; color: var(--color-dark-muted);"><?php echo esc_html( $t['country'] ); ?> • <em><?php echo esc_html( $t['safari'] ); ?></em></div>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- 8. BRAND STORY CALLOUT BANNER -->
<section class="section section-bg-dark" style="position:relative; text-align:center; padding: 7rem 1.5rem;">
    <div class="container-narrow">
        <span class="hero-badge">ARUSHA • TANZANIA</span>
        <h2 style="font-size: clamp(2rem, 4vw, 3.2rem); margin-bottom: 1.5rem;">
            Ready to Begin Your Tanzanian Story?
        </h2>
        <p style="font-size: 1.15rem; max-width: 680px; margin: 0 auto 2.5rem; line-height: 1.8;">
            Connect with our local safari directors in Arusha to design a custom itinerary tailored specifically around your travel dates, wildlife goals, and preferred pace.
        </p>
        <div style="display:flex; justify-content:center; gap: 1.2rem; flex-wrap:wrap;">
            <a href="<?php echo esc_url( home_url( '/booking/' ) ); ?>" class="btn btn-primary btn-lg">
                BOOK YOUR SAFARI NOW
            </a>
            <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="btn btn-secondary btn-lg">
                REQUEST CUSTOM ITINERARY
            </a>
        </div>
    </div>
</section>

<?php
get_footer();
