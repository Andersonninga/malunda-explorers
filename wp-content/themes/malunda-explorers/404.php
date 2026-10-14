<?php
/**
 * 404 Error Page Template
 *
 * @package Malunda_Explorers
 */
get_header();
?>

<div class="section" style="text-align: center; padding: 8rem 1.5rem;">
    <div class="container-narrow">
        <div style="font-size: 5rem; font-family: var(--font-heading); color: var(--color-accent); font-weight: 800;">404</div>
        <h1 style="margin-bottom: 1rem;">Lost in the Savannah?</h1>
        <p style="font-size: 1.15rem; max-width: 580px; margin: 0 auto 2.5rem; line-height: 1.8;">
            The page you are looking for has wandered off into the Serengeti. Let us guide you back to camp.
        </p>
        <div style="display:flex; justify-content:center; gap: 1rem;">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="btn btn-primary">
                Return to Home
            </a>
            <a href="<?php echo esc_url( home_url( '/safaris/' ) ); ?>" class="btn btn-outline-dark">
                Explore Safaris
            </a>
        </div>
    </div>
</div>

<?php
get_footer();
