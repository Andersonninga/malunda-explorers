<?php
/**
 * Template Name: Photo Gallery
 *
 * @package Malunda_Explorers
 */
get_header();

$data = function_exists( 'malunda_get_data' ) ? malunda_get_data() : array();
$galleryItems = $data['gallery_items'] ?? array();
?>

<section style="background: linear-gradient(rgba(15, 34, 21, 0.75), rgba(15, 34, 21, 0.85)), url('<?php echo esc_url( get_template_directory_uri() . '/assets/images/malunda-safari-006.jpg' ); ?>') center/cover; padding: 6rem 1.5rem 5rem; color: #fff; text-align: center;">
    <div class="container-narrow">
        <span class="badge" style="margin-bottom: 1rem;">VISUAL CHRONICLES</span>
        <h1 style="color: #fff; margin-bottom: 1rem;">The Malunda Gallery</h1>
        <p style="font-size: 1.15rem; color: rgba(255, 255, 255, 0.9); line-height: 1.8;">
            A glimpse into the extraordinary wildlife, ancient landscapes, luxury camps, and cultural heritage of Tanzania captured on safari.
        </p>
    </div>
</section>

<section class="section">
    <div class="container">
        <!-- Gallery Filter Tabs -->
        <div class="gallery-filter-tabs">
            <button type="button" class="filter-tab active" data-filter="all">All Photos</button>
            <button type="button" class="filter-tab" data-filter="wildlife">Wildlife</button>
            <button type="button" class="filter-tab" data-filter="landscapes">Landscapes</button>
            <button type="button" class="filter-tab" data-filter="safari-vehicles">Safari Vehicles</button>
            <button type="button" class="filter-tab" data-filter="camps-lodges">Camps & Lodges</button>
            <button type="button" class="filter-tab" data-filter="people-culture">People & Culture</button>
            <button type="button" class="filter-tab" data-filter="tanzania">Tanzania</button>
            <button type="button" class="filter-tab" data-filter="zanzibar">Zanzibar</button>
            <button type="button" class="filter-tab" data-filter="kilimanjaro">Kilimanjaro</button>
        </div>

        <!-- Gallery Grid -->
        <div class="gallery-grid">
            <?php foreach ( $galleryItems as $item ) : ?>
                <div class="gallery-item" data-category="<?php echo esc_attr( $item['category'] ); ?>" data-title="<?php echo esc_attr( $item['title'] ); ?>">
                    <img src="<?php echo esc_url( $item['image'] ); ?>" alt="<?php echo esc_attr( $item['title'] ); ?>" loading="lazy">
                    <div class="gallery-item-overlay">
                        <span class="badge" style="align-self: flex-start; margin-bottom: 0.5rem; background: var(--color-accent); color: #fff;">
                            <?php echo esc_html( ucfirst( str_replace('-', ' ', $item['category']) ) ); ?>
                        </span>
                        <h4 style="color: #fff; margin-bottom: 0.3rem;"><?php echo esc_html( $item['title'] ); ?></h4>
                        <p style="color: rgba(255,255,255,0.85); font-size: 0.85rem; margin: 0;"><?php echo esc_html( $item['caption'] ); ?></p>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Interactive Lightbox Modal -->
<div class="lightbox-modal" id="lightboxModal" role="dialog" aria-modal="true" aria-label="Image Lightbox">
    <button type="button" class="lightbox-close" id="lightboxClose" aria-label="Close Lightbox">✕</button>
    <div class="lightbox-content">
        <img src="" id="lightboxImg" alt="Enlarged Safari Photo">
        <div class="lightbox-caption" id="lightboxCaption"></div>
    </div>
</div>

<?php
get_footer();
