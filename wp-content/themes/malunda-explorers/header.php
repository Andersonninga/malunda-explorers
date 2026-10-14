<?php
/**
 * Malunda Explorers - Header Template
 */
$data = function_exists( 'malunda_get_data' ) ? malunda_get_data() : array();
$phone = $data['site_settings']['phone'] ?? '+255 784 567 890';
$whatsapp = $data['site_settings']['whatsapp'] ?? '+255784567890';
$email = $data['site_settings']['email'] ?? 'info@malundaexplorers.com';
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php wp_title( '|', true, 'right' ); ?><?php bloginfo( 'name' ); ?> — Tanzania Safari Experts</title>
    <meta name="description" content="Malunda Explorers creates authentic, personalized and thoughtfully designed Tanzania safari experiences across Serengeti, Ngorongoro, Tarangire, and Zanzibar.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo esc_url( get_template_directory_uri() . '/assets/css/main.css' ); ?>">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<!-- Top Bar -->
<div class="site-topbar">
    <div class="container">
        <div class="topbar-info">
            <a href="tel:<?php echo esc_attr( str_replace(' ', '', $phone) ); ?>">
                <span>📞</span> <?php echo esc_html( $phone ); ?>
            </a>
            <a href="https://wa.me/<?php echo esc_attr( $whatsapp ); ?>" target="_blank" rel="noopener">
                <span>💬</span> WhatsApp Direct
            </a>
            <a href="mailto:<?php echo esc_attr( $email ); ?>">
                <span>✉️</span> <?php echo esc_html( $email ); ?>
            </a>
        </div>
        <div class="topbar-tagline">
            “Every journey tells a story.”
        </div>
    </div>
</div>

<!-- Main Sticky Header -->
<header class="site-header">
    <div class="container">
        <div class="header-inner">
            <!-- Brand Logo -->
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="site-logo">
                <img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/logo.png' ); ?>" alt="Malunda Explorers" class="brand-logo-img">
            </a>

            <!-- Navigation Links -->
            <nav class="site-nav" id="siteNav">
                <ul class="nav-links">
                    <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Home</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/destinations/' ) ); ?>">Destinations</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/safaris/' ) ); ?>">Safaris</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/safari-experiences/' ) ); ?>">Experiences</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/about-us/' ) ); ?>">About Us</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/gallery/' ) ); ?>">Gallery</a></li>
                    <li><a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>">Contact</a></li>
                </ul>
            </nav>

            <!-- Prominent BOOK NOW Button -->
            <div class="header-cta">
                <a href="<?php echo esc_url( home_url( '/booking/' ) ); ?>" class="btn btn-primary">
                    BOOK NOW
                </a>
                <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle Navigation">☰</button>
            </div>
        </div>
    </div>
</header>
