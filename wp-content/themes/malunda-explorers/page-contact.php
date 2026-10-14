<?php
/**
 * Template Name: Contact & Custom Safari Planning
 *
 * @package Malunda_Explorers
 */
get_header();

$data = function_exists( 'malunda_get_data' ) ? malunda_get_data() : array();
$phone = $data['site_settings']['phone'] ?? '+255 784 567 890';
$whatsapp = $data['site_settings']['whatsapp'] ?? '+255784567890';
$email = $data['site_settings']['email'] ?? 'info@malundaexplorers.com';
$address = $data['site_settings']['address'] ?? 'Safari Way, Plot 42, Arusha, Tanzania';
?>

<section style="background: linear-gradient(rgba(15, 34, 21, 0.75), rgba(15, 34, 21, 0.85)), url('<?php echo esc_url( get_template_directory_uri() . '/assets/images/malunda-safari-007.jpg' ); ?>') center/cover; padding: 6rem 1.5rem 5rem; color: #fff; text-align: center;">
    <div class="container-narrow">
        <span class="badge" style="margin-bottom: 1rem;">GET IN TOUCH</span>
        <h1 style="color: #fff; margin-bottom: 1rem;">Let's Start Planning Your Journey</h1>
        <p style="font-size: 1.15rem; color: rgba(255, 255, 255, 0.9); line-height: 1.8;">
            You have imagined the destination. Now let's turn the idea into a journey.<br>
            Tell us what you are looking for, and our team will work with you to develop an experience that matches your interests, schedule and expectations.
        </p>
    </div>
</section>

<section class="section">
    <div class="container">
        <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 3.5rem; align-items: flex-start;">
            
            <!-- Contact / Tailor-Made Inquiry Form -->
            <div style="background: #fff; padding: 3rem; border-radius: 20px; border: 1px solid var(--color-border); box-shadow: var(--shadow-md);">
                <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem;">Custom Safari Request</h2>
                <p style="font-size: 0.95rem; margin-bottom: 2rem;">Fill out this comprehensive questionnaire and a senior Tanzanian safari specialist will respond within 12 hours with a bespoke proposal.</p>

                <form id="contactSafariForm" onsubmit="event.preventDefault(); alert('Asante sana! Your safari request has been submitted. A Malunda Explorers specialist will reply via WhatsApp and email within 12 hours.'); this.reset();">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="contactFullName">Full Name *</label>
                            <input type="text" id="contactFullName" class="form-control" required placeholder="e.g. David & Sarah Miller">
                        </div>
                        <div class="form-group">
                            <label for="contactEmail">Email Address *</label>
                            <input type="email" id="contactEmail" class="form-control" required placeholder="e.g. david@example.com">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="contactPhone">WhatsApp / Phone *</label>
                            <input type="tel" id="contactPhone" class="form-control" required placeholder="e.g. +1 555 123 4567">
                        </div>
                        <div class="form-group">
                            <label for="contactCountry">Country of Residence *</label>
                            <input type="text" id="contactCountry" class="form-control" required placeholder="e.g. United States">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="contactDates">Preferred Travel Dates</label>
                            <input type="text" id="contactDates" class="form-control" placeholder="e.g. Mid-October 2026 or Flexible">
                        </div>
                        <div class="form-group">
                            <label for="contactTravelers">Number of Travelers</label>
                            <input type="text" id="contactTravelers" class="form-control" placeholder="e.g. 2 Adults, 1 Child (Age 10)">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="contactDuration">Trip Duration</label>
                            <select id="contactDuration" class="form-control">
                                <option value="">Select Estimated Duration</option>
                                <option value="3-4 days">3 - 4 Days</option>
                                <option value="5-7 days">5 - 7 Days</option>
                                <option value="8-10 days">8 - 10 Days</option>
                                <option value="11+ days">11+ Days (Safari & Zanzibar)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="contactBudget">Estimated Budget (USD per person)</label>
                            <select id="contactBudget" class="form-control">
                                <option value="">Select Range</option>
                                <option value="$1,500 - $3,000">$1,500 - $3,000</option>
                                <option value="$3,000 - $5,000">$3,000 - $5,000</option>
                                <option value="$5,000 - $8,000">$5,000 - $8,000</option>
                                <option value="$8,000+ Luxury">$8,000+ (Ultra Luxury)</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="contactDestinations">Destinations of Interest</label>
                            <input type="text" id="contactDestinations" class="form-control" placeholder="e.g. Serengeti, Ngorongoro, Zanzibar...">
                        </div>
                        <div class="form-group">
                            <label for="contactStyle">Preferred Safari Style</label>
                            <select id="contactStyle" class="form-control">
                                <option value="Classic Safari">Classic Safari</option>
                                <option value="Luxury Tented Safari">Luxury Tented Safari</option>
                                <option value="Honeymoon & Romantic">Honeymoon & Romantic</option>
                                <option value="Family Safari">Family Safari</option>
                                <option value="Great Migration Focus">Great Migration Focus</option>
                                <option value="Kilimanjaro Trek & Safari">Kilimanjaro Trek & Safari</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="contactAccommodation">Accommodation Preference</label>
                        <select id="contactAccommodation" class="form-control">
                            <option value="Mid-Range Lodges & Permanent Tented Camps">Mid-Range Lodges & Permanent Tented Camps</option>
                            <option value="Luxury Boutique Camps">Luxury Boutique Camps</option>
                            <option value="Ultra-Luxury 5-Star Sanctuaries">Ultra-Luxury 5-Star Sanctuaries</option>
                            <option value="Adventurous Safari Camping">Adventurous Safari Camping</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="contactMessage">Tell Us About Your Trip / Special Requests *</label>
                        <textarea id="contactMessage" class="form-control" style="min-height: 120px;" required placeholder="Share your expectations, special occasions, wildlife dreams, or specific questions..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary btn-lg btn-block">
                        SEND MY SAFARI REQUEST
                    </button>
                </form>
            </div>

            <!-- Arusha Headquarters & Direct Contact Info -->
            <div>
                <div style="background: var(--color-sand-light); padding: 2.5rem; border-radius: 20px; border: 1px solid var(--color-border); margin-bottom: 2rem;">
                    <h3 style="font-size: 1.4rem; margin-bottom: 1.2rem; color: var(--color-primary-dark);">Arusha Operations Office</h3>
                    <div style="display:flex; flex-direction:column; gap: 1.2rem; font-size: 0.95rem;">
                        <div>
                            <strong>Headquarters:</strong><br>
                            <?php echo esc_html( $address ); ?>
                        </div>
                        <div>
                            <strong>Direct Telephone:</strong><br>
                            <a href="tel:<?php echo esc_attr( str_replace(' ', '', $phone) ); ?>"><?php echo esc_html( $phone ); ?></a>
                        </div>
                        <div>
                            <strong>WhatsApp (24/7 Safari Support):</strong><br>
                            <a href="https://wa.me/<?php echo esc_attr( $whatsapp ); ?>" target="_blank" rel="noopener" style="color: #137333; font-weight:700;">
                                💬 +255 784 567 890 (Instant Chat)
                            </a>
                        </div>
                        <div>
                            <strong>Email Inquiries:</strong><br>
                            <a href="mailto:<?php echo esc_attr( $email ); ?>"><?php echo esc_html( $email ); ?></a>
                        </div>
                        <div>
                            <strong>Operating Hours:</strong><br>
                            Monday - Saturday: 08:00 - 19:00 EAT<br>
                            Sunday: 09:00 - 16:00 EAT<br>
                            <em>(24/7 emergency dispatch for travelers on active safaris)</em>
                        </div>
                    </div>

                    <div style="margin-top: 2rem;">
                        <a href="https://wa.me/<?php echo esc_attr( $whatsapp ); ?>?text=Hello%20Malunda%20Explorers,%20I%20would%20like%20to%20plan%20a%20safari." target="_blank" rel="noopener" class="btn btn-primary btn-block">
                            Chat on WhatsApp Now
                        </a>
                    </div>
                </div>

                <!-- Google Map Preview Frame -->
                <div style="border-radius: 16px; overflow: hidden; border: 1px solid var(--color-border); height: 260px; box-shadow: var(--shadow-sm);">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127438.30752178972!2d36.61118679462529!3d-3.3732155890733075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18371c6767fa6c87%3A0x6b6c0adcf53a290a!2sArusha%2C%20Tanzania!5e0!3m2!1sen!2stz!4v1696000000000!5m2!1sen!2stz" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
            </div>

        </div>
    </div>
</section>

<?php
get_footer();
