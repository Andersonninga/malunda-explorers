<?php
/**
 * Main Fallback Template
 *
 * @package Malunda_Explorers
 */
get_header();
?>

<div class="section">
    <div class="container">
        <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
            <article style="background: #fff; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--color-border); margin-bottom: 2rem;">
                <h1><?php the_title(); ?></h1>
                <div style="line-height: 1.8; margin-top: 1rem;">
                    <?php the_content(); ?>
                </div>
            </article>
        <?php endwhile; endif; ?>
    </div>
</div>

<?php
get_footer();
