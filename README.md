# MALUNDA EXPLORERS — Tanzania Safari & Travel WordPress Website

> **“Every journey tells a story.”**  
> *“Your journey into the wild begins here, where every encounter becomes a story worth telling.”*

A modern, responsive, and luxury WordPress theme and companion core plugin created for **Malunda Explorers**, an authentic safari and adventure travel brand based in **Arusha, Tanzania**.

---

## 🌟 Live Interactive Server (Already Running)

The website is running locally at **[http://localhost:3000](http://localhost:3000)**.

To launch or restart at any time:
```bash
npm start
# or
node server.js
```

### Key Interactive Links to Test:
* **Home Page**: [http://localhost:3000/](http://localhost:3000/)
* **7-Step Interactive Booking Engine**: [http://localhost:3000/booking/](http://localhost:3000/booking/)
* **WordPress Admin Booking Dashboard**: [http://localhost:3000/admin/bookings/](http://localhost:3000/admin/bookings/)
* **Safari Packages Directory**: [http://localhost:3000/safaris/](http://localhost:3000/safaris/)
* **Featured Itinerary (7-Day Signature)**: [http://localhost:3000/safaris/7-day-northern-circuit-signature/](http://localhost:3000/safaris/7-day-northern-circuit-signature/)
* **Destinations Guide**: [http://localhost:3000/destinations/](http://localhost:3000/destinations/)
* **Serengeti National Park**: [http://localhost:3000/destinations/serengeti/](http://localhost:3000/destinations/serengeti/)
* **Safari Experiences**: [http://localhost:3000/safari-experiences/](http://localhost:3000/safari-experiences/)
* **Photo Gallery & Lightbox**: [http://localhost:3000/gallery/](http://localhost:3000/gallery/)
* **Contact & Tailor-Made Requests**: [http://localhost:3000/contact/](http://localhost:3000/contact/)
* **FAQs (Schema.org JSON-LD)**: [http://localhost:3000/faq/](http://localhost:3000/faq/)
* **Booking Terms & Cancellation**: [http://localhost:3000/booking-terms/](http://localhost:3000/booking-terms/)

---

## 📁 WordPress Architecture

The project is structured according to professional WordPress development standards:

### 1. WordPress Theme: `wp-content/themes/malunda-explorers/`
* [`style.css`](file:///d:/malunda/wp-content/themes/malunda-explorers/style.css): Official WordPress theme header, version, metadata.
* [`functions.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/functions.php): Enqueues assets, registers menus, supports HTML5, post thumbnails, and helper routines.
* [`header.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/header.php): Brand emblem, direct contact banner (WhatsApp, Phone, Email), luxury navigation, and prominent **BOOK NOW** button.
* [`footer.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/footer.php): 4-column footer (Explore, Travel, Connect, Legal) and sticky mobile booking bar.
* [`front-page.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/front-page.php): Cinematic Hero section, interactive search widget, featured destinations, 6 feature blocks ("Why Choose Malunda Explorers"), experiences showcase, packages grid, testimonials, and brand callout.
* [`page-booking.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/page-booking.php): 7-step booking engine with real-time dynamic pricing calculation, accommodation tier multiplier, optional extras, customer details, and instant voucher generation.
* [`page-about-us.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/page-about-us.php): Brand story, mission, vision, and core values (Authenticity, Integrity, Excellence, Personalization, Responsibility, Curiosity).
* [`page-destinations.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/page-destinations.php): Comprehensive directory of Serengeti, Ngorongoro, Tarangire, Lake Manyara, Mount Kilimanjaro, and Zanzibar.
* [`single-destination.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/single-destination.php): Single destination showcase with wildlife highlights and seasons.
* [`page-safari-packages.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/page-safari-packages.php): Filterable packages catalog.
* [`single-safari_package.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/single-safari_package.php): Single package page with day-by-day accordion itinerary, inclusions/exclusions, accommodation, transport, meals, and sticky **BOOK THIS SAFARI** widget.
* [`page-safari-experiences.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/page-safari-experiences.php): Cards for Private, Tailor-Made, Luxury, Classic, Honeymoon, Family, Great Migration, Cultural, and Day Trips.
* [`page-gallery.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/page-gallery.php): Masonry grid with category filter tabs and interactive lightbox modal.
* [`page-contact.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/page-contact.php): Full custom safari questionnaire, WhatsApp direct link, and Arusha headquarters map.
* [`page-faq.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/page-faq.php): Categorized interactive accordion FAQs with Schema.org JSON-LD FAQPage markup.
* [`page-privacy-policy.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/page-privacy-policy.php), [`page-terms-conditions.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/page-terms-conditions.php), [`page-booking-terms.php`](file:///d:/malunda/wp-content/themes/malunda-explorers/page-booking-terms.php).
* [`assets/css/main.css`](file:///d:/malunda/wp-content/themes/malunda-explorers/assets/css/main.css): Modern safari aesthetic (Serengeti Green, Sunset Gold, African Terracotta, Morning Mist Cream, Playfair Display serif headings).
* [`assets/js/main.js`](file:///d:/malunda/wp-content/themes/malunda-explorers/assets/js/main.js): Navigation, lightbox, FAQ accordion, quick search.
* [`assets/js/booking-engine.js`](file:///d:/malunda/wp-content/themes/malunda-explorers/assets/js/booking-engine.js): Complete 7-step booking system logic.

---

### 2. WordPress Plugin: `wp-content/plugins/malunda-safari-core/`
* [`malunda-safari-core.php`](file:///d:/malunda/wp-content/plugins/malunda-safari-core/malunda-safari-core.php): Main plugin bootstrap file.
* [`includes/cpt-packages.php`](file:///d:/malunda/wp-content/plugins/malunda-safari-core/includes/cpt-packages.php): Registers `safari_package` custom post type with `safari_style` taxonomy.
* [`includes/cpt-destinations.php`](file:///d:/malunda/wp-content/plugins/malunda-safari-core/includes/cpt-destinations.php): Registers `destination` custom post type with `destination_region` taxonomy.
* [`includes/cpt-bookings.php`](file:///d:/malunda/wp-content/plugins/malunda-safari-core/includes/cpt-bookings.php): Registers `safari_booking` custom post type and `ME-2026-XXXX` reference code generator.
* [`includes/admin-dashboard.php`](file:///d:/malunda/wp-content/plugins/malunda-safari-core/includes/admin-dashboard.php): WordPress Admin menu ("Safari Bookings"), pipeline revenue counters, status update modal, and CSV exporter.
* [`includes/rest-api.php`](file:///d:/malunda/wp-content/plugins/malunda-safari-core/includes/rest-api.php): Endpoints for packages, destinations, price calculation, and booking submission.
* [`includes/email-notifications.php`](file:///d:/malunda/wp-content/plugins/malunda-safari-core/includes/email-notifications.php): Automated customer confirmation and admin alert emails.

---

## 🦁 7-Step Safari Booking System

The reservation system allows travelers to complete their safari planning:

1. **Step 1 — Select Safari**: Choose itinerary (e.g. 7-Day Northern Circuit, Great Migration, Bush to Beach), destinations, and departure date.
2. **Step 2 — Travelers**: Adults, children (under 12 receive 50% discount), number of rooms, and special requests.
3. **Step 3 — Accommodation**: Budget (0.85x), Mid-Range (1.0x), Luxury (1.45x), or Premium/Ultra-Luxury (2.10x).
4. **Step 4 — Optional Extras**: Hot Air Balloon Safari ($599/person), Maasai Boma Visit ($65/person), Olduvai Gorge ($45/person), Zanzibar Extension ($850/person), Private 4x4 Upgrade ($250/day), VIP Airport Transfers ($60), Bush Dinner ($120/person), Celebration Pack ($180).
5. **Step 5 — Customer Details**: Name, email, WhatsApp/phone, country, flight info, and dietary needs.
6. **Step 6 — Live Booking Summary**: Real-time breakdown of base price, tier adjustments, extras, total, and 30% deposit calculation.
7. **Step 7 — Payment & Instant Confirmation**: Credit/debit card, bank transfer, or mobile money (M-Pesa/Airtel Money), generating a unique reference number (e.g., `ME-2026-3759`), printable booking voucher, and automated email confirmation.

---

## ⚙️ How to Deploy to a Live WordPress Host

1. Copy the theme folder [`wp-content/themes/malunda-explorers`](file:///d:/malunda/wp-content/themes/malunda-explorers) to your live WordPress `wp-content/themes/` directory.
2. Copy the plugin folder [`wp-content/plugins/malunda-safari-core`](file:///d:/malunda/wp-content/plugins/malunda-safari-core) to your live WordPress `wp-content/plugins/` directory.
3. In the WordPress Admin:
   * Navigate to **Plugins** → Activate **Malunda Safari Core & Booking Management System**.
   * Navigate to **Appearance** → **Themes** → Activate **Malunda Explorers**.
4. Go to **Settings** → **Permalinks** → Select **Post name** and click **Save Changes**.
