<?php
/**
 * Template Name: About Us
 *
 * @package Malunda_Explorers
 */
get_header();
?>

<!-- Hero Banner -->
<section style="background: linear-gradient(rgba(15, 34, 21, 0.7), rgba(15, 34, 21, 0.8)), url('<?php echo esc_url( get_template_directory_uri() . '/assets/images/malunda-safari-002.jpg' ); ?>') center/cover; padding: 6rem 1.5rem 5rem; color: #fff; text-align: center;">
    <div class="container-narrow">
        <span class="badge" style="margin-bottom: 1rem;">AUTHENTIC TANZANIAN SAFARIS</span>
        <h1 style="color: #fff; margin-bottom: 1rem;">We Are Malunda Explorers</h1>
        <p style="font-size: 1.25rem; font-family: var(--font-heading); font-style: italic; color: var(--color-sand);">
            “Every journey tells a story.”
        </p>
    </div>
</section>

<!-- Company Story Section -->
<section class="section">
    <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 3.5rem; align-items: center;">
            <div>
                <span class="section-subtitle">OUR STORY</span>
                <h2 style="margin-bottom: 1.5rem;">Born from the Wild Heart of Tanzania</h2>
                <p>
                    Malunda Explorers is a premier Tanzania-based safari and travel brand dedicated to authentic, thoughtfully designed journeys into the wild. Founded in Arusha—the safari capital of East Africa—our company was built on an enduring reverence for Tanzania's untamed landscapes, world-renowned wildlife reserves, and rich cultural heritage.
                </p>
                <p>
                    We reject the one-size-fits-all model of mass tourism. Instead, we craft authentic, personalized and thoughtfully designed safari experiences that communicate trust, adventure, and professionalism. Whether tracking the great wildebeest migration through northern Serengeti, descending into the prehistoric caldera of Ngorongoro, or sailing the azure waters of Zanzibar, we take the time to understand your rhythm and travel style.
                </p>
                <p>
                    From carefully vetted boutique tented camps to senior Tanzanian naturalist guides with decades in the bush, every detail of your journey is managed with genuine care and unwavering reliability.
                </p>
            </div>
            <div>
                <div style="position: relative;">
                    <img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/malunda-safari-009.jpg' ); ?>" alt="Malunda Explorers Safari Land Cruiser" style="border-radius: 16px; box-shadow: var(--shadow-lg);" loading="lazy">
                    <div style="position: absolute; bottom: -20px; right: -20px; background: var(--color-primary-dark); color: #fff; padding: 1.5rem 2rem; border-radius: 12px; border: 2px solid var(--color-accent); max-width: 260px;">
                        <div style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 700; color: var(--color-accent);">100%</div>
                        <div style="font-size: 0.82rem; text-transform:uppercase; letter-spacing:0.05em;">Locally Owned & Guided in Tanzania</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Mission & Vision -->
<section class="section section-bg-sand">
    <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2.5rem;">
            <!-- Mission -->
            <div style="background: #fff; padding: 3rem 2.5rem; border-radius: 16px; border: 1px solid var(--color-border); box-shadow: var(--shadow-sm);">
                <div style="font-size: 2.5rem; margin-bottom: 1rem;">🎯</div>
                <h3 style="font-size: 1.6rem; color: var(--color-primary-dark); margin-bottom: 1rem;">Our Mission</h3>
                <p style="font-size: 1.05rem; line-height: 1.8; color: var(--color-dark);">
                    “To create authentic, personalized and responsible travel experiences that connect travelers with Tanzania's wildlife, landscapes and communities while delivering thoughtful service and lasting memories.”
                </p>
            </div>

            <!-- Vision -->
            <div style="background: #fff; padding: 3rem 2.5rem; border-radius: 16px; border: 1px solid var(--color-border); box-shadow: var(--shadow-sm);">
                <div style="font-size: 2.5rem; margin-bottom: 1rem;">🔭</div>
                <h3 style="font-size: 1.6rem; color: var(--color-primary-dark); margin-bottom: 1rem;">Our Vision</h3>
                <p style="font-size: 1.05rem; line-height: 1.8; color: var(--color-dark);">
                    “To become a trusted Tanzania travelling brand recognized for exceptional safari experiences, personalized service, responsible exploration and the memories we help travelers create.”
                </p>
            </div>
        </div>
    </div>
</section>

<!-- Core Values -->
<section class="section">
    <div class="container">
        <div class="section-header">
            <span class="section-subtitle">GUIDING PRINCIPLES</span>
            <h2>Our Core Values</h2>
            <p>Six foundational pillars that guide every itinerary we plan and every game drive we lead.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem;">
            <div class="feature-card">
                <div class="feature-icon">🦁</div>
                <h3>Authenticity</h3>
                <p>Genuine encounters, raw wilderness, and honest guidance without superficial commercial shortcuts.</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">🛡️</div>
                <h3>Integrity</h3>
                <p>Transparent pricing, transparent communication, and dependability from initial consultation to the final airport farewell.</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">⭐</div>
                <h3>Excellence</h3>
                <p>Meticulously maintained customized 4x4 vehicles, certified senior naturalist guides, and carefully chosen lodges.</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">🧭</div>
                <h3>Personalization</h3>
                <p>Every journey is crafted around the way you want to explore. Your pace, your wildlife priorities, your dreams.</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">🌱</div>
                <h3>Responsibility</h3>
                <p>Respect for park regulations, ethical wildlife distance, conservation fund contributions, and fair local employment.</p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">🔍</div>
                <h3>Curiosity</h3>
                <p>Fostering wonder and discovery in travelers of all ages through storytelling, animal behavior tracking, and cultural immersion.</p>
            </div>
        </div>

        <div style="text-align: center; margin-top: 3.5rem;">
            <a href="<?php echo esc_url( home_url( '/booking/' ) ); ?>" class="btn btn-primary btn-lg">
                PLAN YOUR SAFARI WITH US
            </a>
        </div>
    </div>
</section>

<?php
get_footer();
