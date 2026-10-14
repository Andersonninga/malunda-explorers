<?php
/**
 * Template Name: Frequently Asked Questions
 *
 * @package Malunda_Explorers
 */
get_header();

$data = function_exists( 'malunda_get_data' ) ? malunda_get_data() : array();
$faqs = $data['faqs'] ?? array();
?>

<!-- Schema.org JSON-LD FAQPage Markup -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    <?php 
    $faqSchema = array();
    foreach ( $faqs as $f ) {
        $faqSchema[] = json_encode( array(
            "@type" => "Question",
            "name" => $f['question'],
            "acceptedAnswer" => array(
                "@type" => "Answer",
                "text" => $f['answer']
            )
        ) );
    }
    echo implode( ',', $faqSchema );
    ?>
  ]
}
</script>

<section style="background: linear-gradient(rgba(15, 34, 21, 0.75), rgba(15, 34, 21, 0.85)), url('<?php echo esc_url( get_template_directory_uri() . '/assets/images/malunda-safari-008.jpg' ); ?>') center/cover; padding: 6rem 1.5rem 5rem; color: #fff; text-align: center;">
    <div class="container-narrow">
        <span class="badge" style="margin-bottom: 1rem;">TRAVELER GUIDANCE</span>
        <h1 style="color: #fff; margin-bottom: 1rem;">Frequently Asked Questions</h1>
        <p style="font-size: 1.15rem; color: rgba(255, 255, 255, 0.9); line-height: 1.8;">
            Everything you need to know about booking, preparing for, and experiencing an unforgettable safari with Malunda Explorers in Tanzania.
        </p>
    </div>
</section>

<section class="section">
    <div class="container">
        <div class="faq-accordion-group">
            <?php foreach ( $faqs as $index => $faq ) : ?>
                <div class="faq-item <?php echo $index === 0 ? 'open' : ''; ?>">
                    <button type="button" class="faq-question">
                        <span><?php echo esc_html( $faq['question'] ); ?></span>
                        <span class="faq-toggle-icon">+</span>
                    </button>
                    <div class="faq-answer">
                        <p><?php echo esc_html( $faq['answer'] ); ?></p>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <div style="text-align: center; margin-top: 4rem; background: var(--color-sand-light); padding: 3rem; border-radius: 16px; border: 1px solid var(--color-border); max-width: 860px; margin-left: auto; margin-right: auto;">
            <h3 style="margin-bottom: 0.5rem;">Have a Specific Question Not Answered Here?</h3>
            <p style="margin-bottom: 1.5rem;">Our safari directors in Arusha are ready to help guide your preparations.</p>
            <div style="display:flex; justify-content:center; gap: 1rem; flex-wrap:wrap;">
                <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="btn btn-primary">
                    Send Us an Inquiry
                </a>
                <a href="https://wa.me/255784567890" target="_blank" rel="noopener" class="btn btn-outline-dark">
                    Chat on WhatsApp
                </a>
            </div>
        </div>
    </div>
</section>

<?php
get_footer();
