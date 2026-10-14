<?php
/**
 * Template Name: Destinations Directory
 *
 * @package Malunda_Explorers
 */
get_header();

$destinations = function_exists( 'malunda_get_destinations' ) ? malunda_get_destinations() : array();
?>

<section style="background: linear-gradient(rgba(15, 34, 21, 0.75), rgba(15, 34, 21, 0.85)), url('<?php echo esc_url( get_template_directory_uri() . '/assets/images/malunda-safari-003.jpg' ); ?>') center/cover; padding: 6rem 1.5rem 5rem; color: #fff; text-align: center;">
    <div class="container-narrow">
        <span class="badge" style="margin-bottom: 1rem;">ICONIC AFRICAN WILDERNESS</span>
        <h1 style="color: #fff; margin-bottom: 1rem;">Tanzania Safari Destinations</h1>
        <p style="font-size: 1.15rem; color: rgba(255, 255, 255, 0.9); line-height: 1.8;">
            Discover legendary national parks, untamed wildlife sanctuaries, ancient craters, and tropical Indian Ocean islands across Tanzania’s famed Northern Circuit and coastline.
        </p>
    </div>
</section>

<section class="section">
    <div class="container">
        <div style="display: flex; flex-direction: column; gap: 4rem;">
            <?php foreach ( $destinations as $index => $dest ) : 
                $isEven = ( $index % 2 === 0 );
            ?>
                <div id="<?php echo esc_attr( $dest['slug'] ); ?>" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 3rem; align-items: center; background: #fff; padding: 2.5rem; border-radius: 20px; border: 1px solid var(--color-border); box-shadow: var(--shadow-sm);">
                    <div style="<?php echo $isEven ? 'order: 1;' : 'order: 2;'; ?>">
                        <span class="section-subtitle" style="margin-bottom: 0.3rem;">DESTINATION GUIDE</span>
                        <h2 style="margin-bottom: 0.5rem;"><?php echo esc_html( $dest['name'] ); ?></h2>
                        <div style="font-family: var(--font-heading); font-style: italic; color: var(--color-accent); font-size: 1.1rem; margin-bottom: 1.2rem;">
                            <?php echo esc_html( $dest['subtitle'] ); ?>
                        </div>
                        <p style="font-size: 1rem; line-height: 1.8; margin-bottom: 1.5rem;">
                            <?php echo esc_html( $dest['description'] ); ?>
                        </p>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.8rem; background: var(--color-sand-light); padding: 1.2rem; border-radius: 10px;">
                            <div>
                                <span style="font-size: 0.75rem; text-transform:uppercase; color:#666; font-weight:700;">Best Time to Visit</span>
                                <div style="font-weight: 700; font-size: 0.92rem; color: var(--color-primary-dark);"><?php echo esc_html( $dest['best_time'] ); ?></div>
                            </div>
                            <div>
                                <span style="font-size: 0.75rem; text-transform:uppercase; color:#666; font-weight:700;">Recommended Duration</span>
                                <div style="font-weight: 700; font-size: 0.92rem; color: var(--color-primary-dark);"><?php echo esc_html( $dest['recommended_duration'] ); ?></div>
                            </div>
                        </div>

                        <div style="margin-bottom: 1.8rem;">
                            <span style="font-size: 0.8rem; text-transform:uppercase; color:#666; font-weight:700; display:block; margin-bottom: 0.5rem;">Key Wildlife Highlights:</span>
                            <div style="display:flex; flex-wrap:wrap; gap: 0.4rem;">
                                <?php foreach ( $dest['wildlife_highlights'] as $wh ) : ?>
                                    <span class="dest-tag"><?php echo esc_html( $wh ); ?></span>
                                <?php endforeach; ?>
                            </div>
                        </div>

                        <div style="display:flex; gap: 1rem; flex-wrap:wrap;">
                            <a href="<?php echo esc_url( home_url( '/booking/?dest=' . $dest['slug'] ) ); ?>" class="btn btn-primary">
                                Book a Safari Here
                            </a>
                            <a href="<?php echo esc_url( home_url( '/safaris/?dest=' . $dest['slug'] ) ); ?>" class="btn btn-outline-dark">
                                View Packages
                            </a>
                        </div>
                    </div>

                    <div style="<?php echo $isEven ? 'order: 2;' : 'order: 1;'; ?>">
                        <img src="<?php echo esc_url( $dest['hero_image'] ); ?>" alt="<?php echo esc_attr( $dest['name'] ); ?>" style="border-radius: 16px; height: 380px; width: 100%; object-fit: cover; box-shadow: var(--shadow-md);" loading="lazy">
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<?php
get_footer();
