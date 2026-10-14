<?php
/**
 * Template Name: Safari Experiences
 *
 * @package Malunda_Explorers
 */
get_header();

$experiences = function_exists( 'malunda_get_experiences' ) ? malunda_get_experiences() : array();
?>

<section style="background: linear-gradient(rgba(15, 34, 21, 0.75), rgba(15, 34, 21, 0.85)), url('<?php echo esc_url( get_template_directory_uri() . '/assets/images/malunda-safari-005.jpg' ); ?>') center/cover; padding: 6rem 1.5rem 5rem; color: #fff; text-align: center;">
    <div class="container-narrow">
        <span class="badge" style="margin-bottom: 1rem;">TAILORED ADVENTURES</span>
        <h1 style="color: #fff; margin-bottom: 1rem;">Safari Experiences</h1>
        <p style="font-size: 1.15rem; color: rgba(255, 255, 255, 0.9); line-height: 1.8;">
            Find the journey that feels right for you. From private exclusive wildlife tracking to romantic honeymoon escapes and authentic Maasai cultural encounters.
        </p>
    </div>
</section>

<section class="section">
    <div class="container">
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

<?php
get_footer();
