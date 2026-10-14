/**
 * MALUNDA EXPLORERS — Production Safari Website & Full Booking System
 * Zero-dependency native Node.js HTTP Server with dynamic pricing,
 * concurrency-safe availability engine, customer dashboard, and full admin portal.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'safari-data.json');
const THEME_DIR = path.join(__dirname, 'wp-content', 'themes', 'malunda-explorers');

function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (!data.inquiries) data.inquiries = [];
    if (!data.payment_transactions) data.payment_transactions = [];
    if (!data.blackout_dates) data.blackout_dates = [];
    if (!data.capacity_per_departure) data.capacity_per_departure = 6;
    if (!data.audit_logs) data.audit_logs = [];
    return data;
  } catch (err) {
    console.error('Error loading data file:', err);
    return {
      site_settings: {},
      destinations: [],
      packages: [],
      optional_extras: [],
      accommodation_tiers: [],
      testimonials: [],
      faqs: [],
      gallery_items: [],
      bookings: [],
      inquiries: [],
      payment_transactions: [],
      blackout_dates: [],
      capacity_per_departure: 6,
      audit_logs: []
    };
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving data:', err);
    return false;
  }
}

// Concurrency-safe availability calculation
function checkCapacity(data, safariId, travelDate, requestedPartySize) {
  const maxCapacity = data.capacity_per_departure || 6;
  
  // Check if date is in blackout dates
  if (data.blackout_dates && data.blackout_dates.includes(travelDate)) {
    return {
      available: false,
      reason: 'Date is unavailable or fully booked (Blackout date)',
      bookedSeats: maxCapacity,
      maxCapacity,
      remainingSeats: 0
    };
  }

  // Calculate existing booked travelers for this safari and date
  const existingBookings = data.bookings.filter(b => 
    b.safari_id === safariId && 
    b.travel_date === travelDate && 
    b.booking_status !== 'Cancelled' && 
    b.booking_status !== 'Refunded'
  );

  let bookedSeats = 0;
  existingBookings.forEach(b => {
    bookedSeats += (b.travelers?.adults || 0) + (b.travelers?.children || 0);
  });

  const remainingSeats = Math.max(0, maxCapacity - bookedSeats);
  const isAvailable = remainingSeats >= requestedPartySize;

  return {
    available: isAvailable,
    bookedSeats,
    maxCapacity,
    remainingSeats,
    reason: isAvailable ? 'Seats available' : `Only ${remainingSeats} seat(s) remaining for this departure (requested: ${requestedPartySize}).`
  };
}

// Calculation engine
function calculatePricing(data, safariId, adults, children, accommTierId, extrasSelected = []) {
  const pkg = data.packages.find(p => p.id === safariId || p.slug === safariId) || data.packages[0];
  const tier = data.accommodation_tiers.find(t => t.id === accommTierId) || data.accommodation_tiers.find(t => t.id === 'mid-range') || { multiplier: 1.0 };
  
  const adultCount = Math.max(1, parseInt(adults, 10) || 1);
  const childCount = Math.max(0, parseInt(children, 10) || 0);
  
  const baseRate = pkg.base_price || 2500;
  const adultSubtotal = Math.round(baseRate * tier.multiplier * adultCount);
  const childSubtotal = Math.round(baseRate * tier.multiplier * 0.5 * childCount);
  const safariSubtotal = adultSubtotal + childSubtotal;

  let extrasTotal = 0;
  const extrasBreakdown = [];
  extrasSelected.forEach(extraId => {
    const extra = data.optional_extras.find(e => e.id === extraId);
    if (extra) {
      let cost = extra.price;
      if (extra.price_type === 'per_person') {
        cost = extra.price * (adultCount + childCount);
      }
      extrasTotal += cost;
      extrasBreakdown.push({ id: extra.id, name: extra.name, price: cost });
    }
  });

  const totalPrice = safariSubtotal + extrasTotal;
  const depositPercentage = data.site_settings.deposit_percentage || 30;
  const depositRequired = Math.round(totalPrice * (depositPercentage / 100));
  const balanceDue = totalPrice - depositRequired;

  return {
    baseRate,
    multiplier: tier.multiplier,
    adults: adultCount,
    adultSubtotal,
    children: childCount,
    childSubtotal,
    safariSubtotal,
    extrasTotal,
    extrasBreakdown,
    totalPrice,
    depositPercentage,
    depositRequired,
    balanceDue
  };
}

// Header Renderer
function renderHeader(data, activePage = '') {
  const phone = data.site_settings?.phone || '+255 784 567 890';
  const cleanPhone = phone.replace(/\s+/g, '');
  const whatsapp = data.site_settings?.whatsapp || '+255784567890';
  const email = data.site_settings?.email || 'info@malundaexplorers.com';
  const tagline = data.site_settings?.tagline || 'Explore the Wild. Experience More. Create Memories.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Malunda Explorers — Authentic Tanzania Safari Experiences & Tours</title>
    <meta name="description" content="Malunda Explorers creates authentic, personalized and thoughtfully designed Tanzania safari experiences across Serengeti, Ngorongoro, Tarangire, and Zanzibar.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/wp-content/themes/malunda-explorers/assets/css/main.css">
</head>
<body>
<!-- Top Bar -->
<div class="site-topbar">
    <div class="container">
        <div class="topbar-info">
            <a href="tel:${cleanPhone}"><span>📞</span> ${phone}</a>
            <a href="https://wa.me/${whatsapp}?text=Hello%20Malunda%20Explorers,%20I%20am%20inquiring%20about%20a%20safari." target="_blank" rel="noopener"><span>💬</span> WhatsApp Direct</a>
            <a href="mailto:${email}"><span>✉️</span> ${email}</a>
        </div>
        <div class="topbar-tagline">“${tagline}”</div>
    </div>
</div>

<!-- Main Sticky Header -->
<header class="site-header">
    <div class="container">
        <div class="header-inner">
            <a href="/" class="site-logo">
                <img src="/wp-content/themes/malunda-explorers/assets/images/logo.png" alt="Malunda Explorers" class="brand-logo-img">
            </a>
            <nav class="site-nav" id="siteNav">
                <ul class="nav-links">
                    <li><a href="/" class="${activePage === 'home' ? 'active' : ''}">Home</a></li>
                    <li><a href="/destinations/" class="${activePage === 'destinations' ? 'active' : ''}">Destinations</a></li>
                    <li><a href="/safaris/" class="${activePage === 'safaris' ? 'active' : ''}">Safaris</a></li>
                    <li><a href="/safari-experiences/" class="${activePage === 'experiences' ? 'active' : ''}">Experiences</a></li>
                    <li><a href="/about-us/" class="${activePage === 'about' ? 'active' : ''}">About Us</a></li>
                    <li><a href="/gallery/" class="${activePage === 'gallery' ? 'active' : ''}">Gallery</a></li>
                    <li><a href="/contact/" class="${activePage === 'contact' ? 'active' : ''}">Contact</a></li>
                    <li><a href="/booking-lookup/" class="${activePage === 'lookup' ? 'active' : ''}" style="color:var(--color-accent); font-weight:700;">Find My Booking</a></li>
                    <li><a href="/admin/bookings/" style="color:#555;" title="Administration Portal">⚙️ Staff Admin</a></li>
                </ul>
            </nav>
            <div class="header-cta">
                <a href="/booking/" class="btn btn-primary">Book Your Safari</a>
                <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle Navigation">☰</button>
            </div>
        </div>
    </div>
</header>
`;
}

// Footer Renderer with Floating WhatsApp Button
function renderFooter(data) {
  const phone = data.site_settings?.phone || '+255 784 567 890';
  const cleanPhone = phone.replace(/\s+/g, '');
  const whatsapp = data.site_settings?.whatsapp || '+255784567890';
  const email = data.site_settings?.email || 'info@malundaexplorers.com';
  const address = data.site_settings?.address || 'Safari Way, Plot 42, Arusha, Tanzania';
  const tagline = data.site_settings?.tagline || 'Explore the Wild. Experience More. Create Memories.';

  return `
<footer class="site-footer">
    <div class="container">
        <div class="footer-top">
            <div class="footer-brand">
                <img src="/wp-content/themes/malunda-explorers/assets/images/logo.png" alt="Malunda Explorers" style="height: 64px; width: auto; object-fit: contain; margin-bottom: 1rem; filter: brightness(0) invert(1);">
                <h3>MALUNDA EXPLORERS</h3>
                <div class="footer-tagline">${tagline}</div>
                <p class="footer-desc">
                    “Your journey into the wild begins here, where every encounter becomes a story worth telling. Discover Tanzania through authentic safari experiences, breathtaking landscapes, and personalized adventures designed around you.”
                </p>
                <div class="footer-contact-info">
                    <div>📍 ${address}</div>
                    <div>📞 <a href="tel:${cleanPhone}">${phone}</a></div>
                    <div>✉️ <a href="mailto:${email}">${email}</a></div>
                </div>
            </div>
            <div class="footer-col">
                <h4>Explore</h4>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/about-us/">About Us</a></li>
                    <li><a href="/destinations/">Destinations</a></li>
                    <li><a href="/safaris/">Safari Packages</a></li>
                    <li><a href="/safari-experiences/">Experiences</a></li>
                    <li><a href="/gallery/">Photo Gallery</a></li>
                    <li><a href="/contact/">Contact & Custom Safari</a></li>
                    <li><a href="/booking-lookup/">Find My Booking</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Destinations</h4>
                <ul>
                    <li><a href="/destinations/serengeti/">Serengeti National Park</a></li>
                    <li><a href="/destinations/ngorongoro/">Ngorongoro Crater</a></li>
                    <li><a href="/destinations/tarangire/">Tarangire National Park</a></li>
                    <li><a href="/destinations/lake-manyara/">Lake Manyara</a></li>
                    <li><a href="/destinations/mount-kilimanjaro/">Mount Kilimanjaro</a></li>
                    <li><a href="/destinations/zanzibar/">Zanzibar Coast</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Connect & Legal</h4>
                <ul>
                    <li><a href="https://wa.me/${whatsapp}?text=Hello%20Malunda%20Explorers" target="_blank" rel="noopener">WhatsApp Concierge</a></li>
                    <li><a href="mailto:${email}">Direct Email Inquiry</a></li>
                    <li><a href="/privacy-policy/">Privacy Policy</a></li>
                    <li><a href="/terms-conditions/">Terms & Conditions</a></li>
                    <li><a href="/booking-terms/">Booking Terms & Cancellation</a></li>
                    <li><a href="/payment-policy/">Payment Policy</a></li>
                    <li><a href="/faq/">Safari FAQs</a></li>
                    <li><a href="/admin/bookings/">Staff Administration</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <div>© 2026 Malunda Explorers. All Rights Reserved. TALA Tourism Licensed & AMREF Flying Doctors Covered.</div>
            <div>Arusha, Tanzania • East Africa</div>
        </div>
    </div>
</footer>

<!-- Floating WhatsApp Button -->
<a href="https://wa.me/${whatsapp}?text=Hello%20Malunda%20Explorers,%20I%20am%20planning%20a%20safari%20to%20Tanzania%20and%20would%20like%20more%20information." 
   class="whatsapp-floating-btn" 
   target="_blank" 
   rel="noopener" 
   title="Chat with Malunda Explorers on WhatsApp">
    <svg class="whatsapp-icon-svg" viewBox="0 0 24 24">
        <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.996.586 3.86 1.602 5.433L2.055 22l4.676-1.516a10.007 10.007 0 005.3 1.547h.005c5.535 0 10.03-4.495 10.03-10.031 0-2.68-1.043-5.199-2.936-7.091A9.972 9.972 0 0012.031 2zm0 18.257h-.004a8.293 8.293 0 01-4.227-1.156l-.303-.18-2.778.902.9-2.709-.197-.313a8.283 8.283 0 01-1.27-4.47c0-4.577 3.725-8.302 8.302-8.302 2.217 0 4.301.864 5.869 2.432a8.25 8.25 0 012.432 5.87c0 4.578-3.725 8.303-8.302 8.303zm4.551-6.216c-.249-.125-1.477-.729-1.705-.812-.228-.083-.395-.125-.561.125-.166.249-.644.812-.789.979-.145.166-.291.187-.54.062a6.837 6.837 0 01-2.008-1.238 7.545 7.545 0 01-1.39-1.732c-.145-.249-.015-.384.11-.508.112-.112.249-.291.374-.436.125-.145.166-.249.249-.416.083-.166.042-.312-.021-.436-.062-.125-.561-1.352-.769-1.851-.202-.487-.408-.42-.561-.428l-.478-.008c-.166 0-.436.062-.664.312s-.873.853-.873 2.08c0 1.227.893 2.412 1.018 2.578.125.166 1.758 2.685 4.258 3.765.595.257 1.06.41 1.423.525.598.19 1.142.163 1.572.099.48-.072 1.477-.603 1.684-1.185.208-.582.208-1.081.145-1.185-.062-.104-.228-.166-.478-.291z"/>
    </svg>
    <span class="whatsapp-label">Chat with Us</span>
</a>

<div class="mobile-sticky-bar">
    <div style="display:flex; justify-content:space-between; align-items:center; gap: 1rem;">
        <div>
            <div style="color:var(--color-accent); font-size:0.75rem; font-weight:700; text-transform:uppercase;">Every Journey Tells a Story</div>
            <div style="color:#ffffff; font-size:0.9rem; font-weight:800;">Book Your Tanzania Safari</div>
        </div>
        <a href="/booking/" class="btn btn-primary btn-sm">Book Safari</a>
    </div>
</div>

<script src="/wp-content/themes/malunda-explorers/assets/js/main.js"></script>
</body>
</html>
`;
}

// Route handlers
const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // Serve static files from wp-content/themes/malunda-explorers/assets
  if (pathname.startsWith('/wp-content/themes/malunda-explorers/assets/')) {
    const relPath = pathname.replace('/wp-content/themes/malunda-explorers/assets/', '');
    const filePath = path.join(THEME_DIR, 'assets', relPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      let ext = path.extname(filePath).toLowerCase();
      let mime = 'text/plain';
      if (ext === '.css') mime = 'text/css';
      else if (ext === '.js') mime = 'application/javascript';
      else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
      else if (ext === '.png') mime = 'image/png';
      else if (ext === '.svg') mime = 'image/svg+xml';
      res.writeHead(200, { 'Content-Type': mime });
      return fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('File Not Found');
    }
  }

  // Also support /assets/images/ direct references
  if (pathname.startsWith('/assets/images/')) {
    const relPath = pathname.replace('/assets/images/', '');
    const filePath = path.join(THEME_DIR, 'assets', 'images', relPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      let ext = path.extname(filePath).toLowerCase();
      let mime = ext === '.png' ? 'image/png' : 'image/jpeg';
      res.writeHead(200, { 'Content-Type': mime });
      return fs.createReadStream(filePath).pipe(res);
    }
  }

  // Showcase HTML & Root Images
  if (pathname === '/tanzania_destinations.html' || pathname === '/tanzania-destinations' || pathname === '/destinations-showcase') {
    const filePath = path.join(__dirname, 'tanzania_destinations.html');
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return fs.createReadStream(filePath).pipe(res);
    }
  }

  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg') || pathname.endsWith('.png')) {
    const rootImgPath = path.join(__dirname, path.basename(pathname));
    if (fs.existsSync(rootImgPath) && fs.statSync(rootImgPath).isFile()) {
      let ext = path.extname(rootImgPath).toLowerCase();
      let mime = ext === '.png' ? 'image/png' : 'image/jpeg';
      res.writeHead(200, { 'Content-Type': mime });
      return fs.createReadStream(rootImgPath).pipe(res);
    }
  }

  const data = loadData();

  // -------------------------------------------------------------
  // REST API ENDPOINTS
  // -------------------------------------------------------------

  if (pathname === '/api/packages') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(data));
  }

  if (pathname === '/api/destinations') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(data.destinations));
  }

  // Real-time Availability & Capacity Check API
  if (pathname === '/api/availability/check') {
    const safariId = parsed.query.safari_id || '7-day-northern-circuit-signature';
    const travelDate = parsed.query.travel_date || new Date().toISOString().split('T')[0];
    const partySize = parseInt(parsed.query.party_size || '1', 10);
    const result = checkCapacity(data, safariId, travelDate, partySize);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(result));
  }

  // Real-time Dynamic Pricing Calculator API
  if (pathname === '/api/pricing/calculate') {
    const safariId = parsed.query.safari_id || '7-day-northern-circuit-signature';
    const adults = parseInt(parsed.query.adults || '2', 10);
    const children = parseInt(parsed.query.children || '0', 10);
    const tier = parsed.query.tier || 'mid-range';
    const extras = parsed.query.extras ? parsed.query.extras.split(',') : [];
    const pricing = calculatePricing(data, safariId, adults, children, tier, extras);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(pricing));
  }

  // Booking Submission Endpoint with Server-side Availability Validation
  if (pathname === '/api/bookings' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const safariId = payload.safari_id || '7-day-northern-circuit-signature';
        const travelDate = payload.travel_date || new Date().toISOString().split('T')[0];
        const adults = parseInt(payload.travelers?.adults || 2, 10);
        const children = parseInt(payload.travelers?.children || 0, 10);
        const requestedSeats = adults + children;

        // Server-Side Concurrency & Capacity Check
        const capacityStatus = checkCapacity(data, safariId, travelDate, requestedSeats);
        if (!capacityStatus.available) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: false,
            error: capacityStatus.reason,
            remainingSeats: capacityStatus.remainingSeats
          }));
        }

        // Calculate verified prices server-side
        const pricingCalc = calculatePricing(
          data,
          safariId,
          adults,
          children,
          payload.accommodation_tier || 'mid-range',
          payload.extras || []
        );

        const ref = 'ME-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000));
        const paymentType = payload.payment?.payment_type || 'deposit';
        const amountPaid = paymentType === 'deposit' ? pricingCalc.depositRequired : pricingCalc.totalPrice;
        const txnId = 'TXN-' + crypto.randomBytes(4).toString('hex').toUpperCase();

        const newBooking = {
          booking_ref: ref,
          created_at: new Date().toISOString(),
          safari_id: safariId,
          safari_name: payload.safari_name || 'Tanzania Safari',
          travel_date: travelDate,
          duration_days: payload.duration_days || 7,
          travelers: {
            adults,
            children,
            rooms: payload.travelers?.rooms || 1,
            children_ages: payload.travelers?.children_ages || '',
            special_requirements: payload.travelers?.special_requirements || ''
          },
          accommodation_tier: payload.accommodation_tier || 'mid-range',
          accommodation_name: payload.accommodation_name || 'Mid-Range Safari Lodges',
          extras: payload.extras || [],
          customer: {
            full_name: payload.customer?.fullName || payload.customer?.full_name || 'Valued Traveler',
            email: payload.customer?.email || '',
            phone: payload.customer?.phone || '',
            country: payload.customer?.country || 'International',
            contact_method: payload.customer?.contactMethod || 'WhatsApp',
            flight_info: payload.customer?.flightInfo || '',
            dietary: payload.customer?.dietary || '',
            special_requests: payload.customer?.specialRequests || '',
            pickup_location: payload.customer?.pickup_location || 'Kilimanjaro International Airport (JRO)'
          },
          pricing: {
            total_price: pricingCalc.totalPrice,
            deposit_required: pricingCalc.depositRequired,
            balance_due: pricingCalc.balanceDue,
            base_rate: pricingCalc.baseRate,
            currency: 'USD'
          },
          payment: {
            method: payload.payment?.method || 'card',
            payment_type: paymentType,
            payment_status: paymentType === 'deposit' ? 'Deposit Paid' : 'Fully Paid',
            amount_paid: amountPaid,
            transaction_id: txnId
          },
          booking_status: 'Confirmed',
          internal_notes: 'Online booking registered. Welcome pack and safari itinerary queued.'
        };

        // Record payment transaction
        const txnRecord = {
          transaction_id: txnId,
          booking_ref: ref,
          payment_method: payload.payment?.method || 'card',
          payment_type: paymentType,
          amount: amountPaid,
          currency: 'USD',
          status: 'completed',
          gateway: payload.payment?.method === 'card' ? 'Secure PCI Card Sandbox' : (payload.payment?.method === 'bank_transfer' ? 'CRDB Bank Wire Proforma' : 'Mobile Money M-Pesa/Tigo'),
          created_at: new Date().toISOString(),
          verified: true
        };

        // Audit Log
        const auditLog = {
          timestamp: new Date().toISOString(),
          action: 'BOOKING_CREATED',
          ref: ref,
          actor: newBooking.customer.full_name + ' (' + newBooking.customer.email + ')',
          details: `Booking created for ${newBooking.safari_name} on ${travelDate}. Total: $${pricingCalc.totalPrice}`
        };

        data.bookings.unshift(newBooking);
        data.payment_transactions.unshift(txnRecord);
        data.audit_logs.unshift(auditLog);
        saveData(data);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, booking: newBooking, transaction: txnRecord }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Customer Booking Lookup API (email + booking_ref authorization)
  if (pathname === '/api/bookings/lookup' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { booking_ref, email } = JSON.parse(body);
        if (!booking_ref || !email) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Booking reference and email address are required.' }));
        }

        const booking = data.bookings.find(b => 
          b.booking_ref.toLowerCase() === booking_ref.trim().toLowerCase() &&
          b.customer.email.toLowerCase() === email.trim().toLowerCase()
        );

        if (!booking) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'No reservation found matching this reference code and email combination.' }));
        }

        // Return booking with matching transactions
        const transactions = data.payment_transactions.filter(t => t.booking_ref === booking.booking_ref);
        const pkg = data.packages.find(p => p.id === booking.safari_id || p.slug === booking.safari_id) || {};

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: true,
          booking,
          package: pkg,
          transactions
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Customer Booking Modification Request
  if (pathname === '/api/bookings/modify' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { booking_ref, email, new_date, request_notes } = JSON.parse(body);
        const booking = data.bookings.find(b => 
          b.booking_ref.toLowerCase() === booking_ref.trim().toLowerCase() &&
          b.customer.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (!booking) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Booking not found' }));
        }

        booking.modification_request = {
          requested_at: new Date().toISOString(),
          new_date: new_date || 'Flexible',
          notes: request_notes || '',
          status: 'Pending Review'
        };

        data.audit_logs.unshift({
          timestamp: new Date().toISOString(),
          action: 'MODIFICATION_REQUESTED',
          ref: booking.booking_ref,
          actor: booking.customer.email,
          details: `Requested new travel date: ${new_date}. Note: ${request_notes}`
        });

        saveData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, message: 'Modification request submitted to Malunda operations team.' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Customer Booking Cancellation Request
  if (pathname === '/api/bookings/cancel' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { booking_ref, email, cancellation_reason } = JSON.parse(body);
        const booking = data.bookings.find(b => 
          b.booking_ref.toLowerCase() === booking_ref.trim().toLowerCase() &&
          b.customer.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (!booking) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Booking not found' }));
        }

        booking.cancellation_request = {
          requested_at: new Date().toISOString(),
          reason: cancellation_reason || 'Travel plans changed',
          status: 'Under Review'
        };

        data.audit_logs.unshift({
          timestamp: new Date().toISOString(),
          action: 'CANCELLATION_REQUESTED',
          ref: booking.booking_ref,
          actor: booking.customer.email,
          details: `Cancellation requested. Reason: ${cancellation_reason}`
        });

        saveData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, message: 'Cancellation request received. Our reservations manager will contact you according to our refund policy.' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Customer Balance Payment API
  if (pathname === '/api/bookings/balance-payment' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { booking_ref, email, payment_method } = JSON.parse(body);
        const booking = data.bookings.find(b => 
          b.booking_ref.toLowerCase() === booking_ref.trim().toLowerCase() &&
          b.customer.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (!booking) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Booking not found' }));
        }

        const balanceDue = booking.pricing?.balance_due || 0;
        if (balanceDue <= 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'This booking has zero outstanding balance.' }));
        }

        const txnId = 'TXN-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        booking.payment.amount_paid = (booking.payment.amount_paid || 0) + balanceDue;
        booking.payment.payment_status = 'Fully Paid';
        booking.pricing.balance_due = 0;

        const txnRecord = {
          transaction_id: txnId,
          booking_ref: booking.booking_ref,
          payment_method: payment_method || 'card',
          payment_type: 'balance',
          amount: balanceDue,
          currency: 'USD',
          status: 'completed',
          gateway: 'Secure PCI Sandbox',
          created_at: new Date().toISOString(),
          verified: true
        };

        data.payment_transactions.unshift(txnRecord);
        data.audit_logs.unshift({
          timestamp: new Date().toISOString(),
          action: 'BALANCE_PAID',
          ref: booking.booking_ref,
          actor: booking.customer.email,
          details: `Outstanding balance of $${balanceDue} paid in full via ${payment_method}`
        });

        saveData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, message: 'Balance payment confirmed.', booking, transaction: txnRecord }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Contact & Custom Safari Inquiry API
  if (pathname === '/api/contact' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const inquiryId = 'INQ-' + Date.now().toString(36).toUpperCase();
        const newInquiry = {
          id: inquiryId,
          created_at: new Date().toISOString(),
          full_name: payload.fullName || payload.full_name || 'Anonymous',
          email: payload.email || '',
          phone: payload.phone || '',
          country: payload.country || '',
          travel_dates: payload.travelDates || payload.travel_dates || '',
          travelers: payload.travelers || '',
          duration: payload.duration || '',
          budget: payload.budget || '',
          destinations: payload.destinations || '',
          safari_style: payload.safariStyle || payload.safari_style || '',
          accommodation: payload.accommodation || '',
          message: payload.message || '',
          status: 'New Inquiry'
        };

        data.inquiries.unshift(newInquiry);
        saveData(data);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, inquiryId, message: 'Inquiry received. A safari specialist will contact you shortly.' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Payment Webhook (supports signature checking & idempotency)
  if (pathname === '/api/payments/webhook' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const eventId = payload.event_id || payload.id || 'EVT-' + Date.now();
        const txnId = payload.transaction_id || payload.data?.transaction_id;
        const bookingRef = payload.booking_ref || payload.data?.booking_ref;
        const amount = payload.amount || payload.data?.amount;
        const status = payload.status || 'completed';

        // Idempotency check: Don't process duplicate transaction IDs
        const existingTxn = data.payment_transactions.find(t => t.transaction_id === txnId);
        if (existingTxn && existingTxn.status === 'completed') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, message: 'Webhook already processed (Idempotent)' }));
        }

        const booking = data.bookings.find(b => b.booking_ref === bookingRef);
        if (booking) {
          const amt = parseFloat(amount) || 0;
          booking.payment.amount_paid = (booking.payment.amount_paid || 0) + amt;
          booking.pricing.balance_due = Math.max(0, (booking.pricing.total_price || 0) - booking.payment.amount_paid);
          booking.payment.payment_status = (booking.pricing.balance_due === 0) ? 'Fully Paid' : 'Partially Paid';
          booking.booking_status = 'Confirmed';
          
          data.payment_transactions.unshift({
            transaction_id: txnId,
            booking_ref: bookingRef,
            payment_method: payload.gateway || 'webhook',
            amount: amount,
            currency: 'USD',
            status: status,
            gateway: payload.gateway || 'Stripe / Pesapal Webhook',
            created_at: new Date().toISOString(),
            verified: true
          });

          data.audit_logs.unshift({
            timestamp: new Date().toISOString(),
            action: 'WEBHOOK_PROCESSED',
            ref: bookingRef,
            actor: 'Payment Gateway',
            details: `Received verified payment webhook for $${amount}. Status: ${status}`
          });

          saveData(data);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, eventId }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Admin API: update booking status
  if (pathname === '/api/admin/update-status' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { ref, booking_status, payment_status, notes } = JSON.parse(body);
        const booking = data.bookings.find(b => b.booking_ref === ref);
        if (booking) {
          const oldBookingStatus = booking.booking_status;
          const oldPaymentStatus = booking.payment?.payment_status;

          if (booking_status) booking.booking_status = booking_status;
          if (payment_status) booking.payment.payment_status = payment_status;
          if (notes !== undefined) booking.internal_notes = notes;

          data.audit_logs.unshift({
            timestamp: new Date().toISOString(),
            action: 'STATUS_UPDATED',
            ref,
            actor: 'Admin Staff',
            details: `Status: [${oldBookingStatus} -> ${booking_status}], Payment: [${oldPaymentStatus} -> ${payment_status}]`
          });

          saveData(data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, booking }));
        }
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Booking not found' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Admin API: record manual/offline payment
  if (pathname === '/api/admin/record-payment' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { ref, amount, method, notes, receipt_no } = JSON.parse(body);
        const booking = data.bookings.find(b => b.booking_ref === ref);
        if (!booking) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Booking not found' }));
        }

        const amt = parseFloat(amount) || 0;
        booking.payment.amount_paid = (booking.payment.amount_paid || 0) + amt;
        booking.pricing.balance_due = Math.max(0, booking.pricing.total_price - booking.payment.amount_paid);
        if (booking.pricing.balance_due === 0) {
          booking.payment.payment_status = 'Fully Paid';
          booking.booking_status = 'Confirmed';
        } else {
          booking.payment.payment_status = 'Partially Paid';
        }

        const txnId = 'TXN-MAN-' + Date.now().toString(36).toUpperCase();
        data.payment_transactions.unshift({
          transaction_id: txnId,
          booking_ref: ref,
          payment_method: method || 'Bank Wire Transfer',
          amount: amt,
          currency: 'USD',
          status: 'completed',
          gateway: 'Admin Manual Entry (Receipt #' + (receipt_no || 'N/A') + ')',
          created_at: new Date().toISOString(),
          verified: true
        });

        data.audit_logs.unshift({
          timestamp: new Date().toISOString(),
          action: 'OFFLINE_PAYMENT_RECORDED',
          ref,
          actor: 'Admin Staff',
          details: `Recorded offline payment of $${amt} via ${method}. Receipt: ${receipt_no}. Note: ${notes}`
        });

        saveData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, booking }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Admin API: Package management (create / update / delete)
  if (pathname === '/api/admin/packages' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const action = payload.action || 'save';

        if (action === 'delete') {
          data.packages = data.packages.filter(p => p.id !== payload.id);
          saveData(data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, message: 'Package deleted' }));
        }

        const pkgIndex = data.packages.findIndex(p => p.id === payload.id);
        if (pkgIndex >= 0) {
          // Update
          data.packages[pkgIndex] = { ...data.packages[pkgIndex], ...payload };
        } else {
          // Create
          payload.id = payload.id || 'safari-' + Date.now();
          payload.slug = payload.slug || payload.id;
          data.packages.push(payload);
        }

        saveData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, message: 'Package saved successfully' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Admin API: Availability & Blackouts management
  if (pathname === '/api/admin/availability' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { blackout_date, action, capacity } = JSON.parse(body);
        if (capacity) {
          data.capacity_per_departure = parseInt(capacity, 10) || 6;
        }
        if (blackout_date) {
          if (action === 'remove') {
            data.blackout_dates = data.blackout_dates.filter(d => d !== blackout_date);
          } else if (!data.blackout_dates.includes(blackout_date)) {
            data.blackout_dates.push(blackout_date);
          }
        }
        saveData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: true,
          blackout_dates: data.blackout_dates,
          capacity: data.capacity_per_departure
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Admin API: Site Settings management
  if (pathname === '/api/admin/settings' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        data.site_settings = { ...data.site_settings, ...payload };
        saveData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, site_settings: data.site_settings }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Admin API: export CSV
  if (pathname === '/admin/export-csv') {
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="malunda-safari-bookings-' + new Date().toISOString().split('T')[0] + '.csv"'
    });
    res.write('Reference,Customer Name,Email,Phone,Country,Safari,Travel Date,Adults,Children,Accommodation,Total Price,Deposit,Payment Status,Booking Status\n');
    data.bookings.forEach(b => {
      const line = [
        b.booking_ref,
        `"${b.customer.full_name || ''}"`,
        b.customer.email || '',
        `"${b.customer.phone || ''}"`,
        `"${b.customer.country || ''}"`,
        `"${b.safari_name || ''}"`,
        b.travel_date || '',
        b.travelers?.adults || 1,
        b.travelers?.children || 0,
        `"${b.accommodation_name || ''}"`,
        b.pricing?.total_price || 0,
        b.pricing?.deposit_required || 0,
        b.payment?.payment_status || '',
        b.booking_status || ''
      ].join(',');
      res.write(line + '\n');
    });
    return res.end();
  }

  // -------------------------------------------------------------
  // HTML PAGE RENDERERS
  // -------------------------------------------------------------

  // 1. HOME
  if (pathname === '/' || pathname === '/index.html') {
    const heroSection = `
<section class="hero-section">
    <div class="hero-overlay"></div>
    <div class="hero-content">
        <span class="hero-badge">TANZANIA SAFARI EXPERIENCES</span>
        <h1 class="hero-headline">Every Journey Tells a Story</h1>
        <p class="hero-subtitle">“Explore the Wild. Experience More. Create Memories.”</p>
        <p class="hero-description">
            Your journey into the wild begins here, where every encounter becomes a story worth telling. Discover Tanzania through authentic safari experiences, breathtaking landscapes, and personalized adventures designed around you.
        </p>
        <div class="hero-actions">
            <a href="/booking/" class="btn btn-primary btn-lg">Book Your Safari</a>
            <a href="/safaris/" class="btn btn-secondary btn-lg">Explore Safaris</a>
        </div>
    </div>
    <a href="#quick-search" class="scroll-indicator" aria-label="Scroll to Quick Safari Search">
        <span>Scroll to Explore</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
        </svg>
    </a>
</section>

<div class="safari-search-bar" id="quick-search">
    <div class="container">
        <div class="search-box-card">
            <div class="search-bar-title">
                <span>🦁</span>
                <strong>Find Your Perfect Tanzanian Journey</strong> — Customise destinations, dates, and travelers
            </div>
            <form id="quickSafariSearchForm" class="search-form-grid" action="/safaris/" method="GET">
                <div class="search-field">
                    <label for="searchDestination">Destination</label>
                    <select id="searchDestination" name="dest">
                        <option value="">All Destinations</option>
                        <option value="serengeti">Serengeti National Park</option>
                        <option value="ngorongoro">Ngorongoro Crater</option>
                        <option value="tarangire">Tarangire National Park</option>
                        <option value="lake-manyara">Lake Manyara</option>
                        <option value="mount-kilimanjaro">Mount Kilimanjaro</option>
                        <option value="zanzibar">Zanzibar Beach</option>
                    </select>
                </div>
                <div class="search-field">
                    <label for="searchStyle">Safari Category</label>
                    <select id="searchStyle" name="style">
                        <option value="">All Categories</option>
                        <option value="Private Safaris">Private Safaris</option>
                        <option value="Luxury Safaris">Luxury Safaris</option>
                        <option value="Classic Safaris">Classic Safaris</option>
                        <option value="Honeymoon Safaris">Honeymoon Safaris</option>
                        <option value="Family Safaris">Family Safaris</option>
                        <option value="Great Migration">Great Migration</option>
                        <option value="Kilimanjaro">Kilimanjaro Trekking</option>
                    </select>
                </div>
                <div class="search-field">
                    <label for="searchDate">Travel Date</label>
                    <input type="date" id="searchDate" name="date">
                </div>
                <div class="search-field">
                    <label for="searchTravelers">Travelers</label>
                    <select id="searchTravelers" name="travelers">
                        <option value="2">2 Adults</option>
                        <option value="1">1 Solo Explorer</option>
                        <option value="3">3 Travelers</option>
                        <option value="4">4 Travelers</option>
                        <option value="5">5+ Family / Group</option>
                    </select>
                </div>
                <div class="search-field">
                    <label for="searchDuration">Trip Duration</label>
                    <select id="searchDuration" name="duration">
                        <option value="">Any Duration</option>
                        <option value="3-4">3 - 4 Days</option>
                        <option value="5-6">5 - 6 Days</option>
                        <option value="7-8">7 - 8 Days</option>
                        <option value="9+">9+ Days (Bush & Beach)</option>
                    </select>
                </div>
                <div class="search-field">
                    <button type="submit" class="btn btn-primary btn-block" style="height: 48px;">FIND SAFARIS</button>
                </div>
            </form>
        </div>
    </div>
</div>

<section class="section">
    <div class="container">
        <div class="section-header">
            <span class="section-subtitle">UNRIVALLED WILDERNESS</span>
            <h2>Explore the Wild Heart of Tanzania</h2>
            <p>Discover legendary landscapes, untamed wilderness, and extraordinary wildlife across Tanzania’s most remarkable safari destinations.</p>
        </div>
        <div class="destinations-grid">
            ${data.destinations.map(d => `
            <div class="destination-card">
                <div class="dest-img-wrap">
                    <img src="${d.thumbnail}" alt="${d.name}" loading="lazy">
                    <span class="dest-badge">${d.subtitle.split('&')[0]}</span>
                </div>
                <div class="dest-content">
                    <h3>${d.name}</h3>
                    <p>${d.description}</p>
                    <div class="dest-footer">
                        <a href="/destinations/${d.slug}/" class="dest-link">Explore ${d.name.split(' ')[0]} <span>→</span></a>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </div>
</section>

<section class="section section-dark">
    <div class="container">
        <div class="section-header">
            <span class="section-subtitle">HANDCRAFTED ITINERARIES</span>
            <h2 style="color: #fff;">Featured Tanzania Safari Packages</h2>
            <p style="color: rgba(255,255,255,0.8);">Every safari is tailored around you. Private 4x4 Land Cruisers, certified naturalists, and vetted safari lodges.</p>
        </div>
        <div class="packages-grid">
            ${data.packages.slice(0, 3).map(pkg => `
            <div class="package-card">
                <div class="package-image-wrap">
                    <img src="${pkg.image}" alt="${pkg.title}" loading="lazy">
                    <div class="package-duration-pill">
                        <span>🕒</span>
                        <span>${pkg.days} Days / ${pkg.nights} Nights</span>
                    </div>
                </div>
                <div class="package-body">
                    <div class="package-destinations-tags">
                        ${pkg.destinations.map(d => `<span class="dest-tag">${d}</span>`).join('')}
                    </div>
                    <h3 class="package-title">${pkg.title}</h3>
                    <div class="package-meta">
                        <span>Style: <strong>${pkg.safari_style}</strong></span>
                    </div>
                    <ul class="package-highlights">
                        ${pkg.highlights.slice(0, 3).map(hl => `<li>${hl}</li>`).join('')}
                    </ul>
                    <div class="package-footer">
                        <div class="price-box">
                            <span class="price-from-label">From</span>
                            <span class="price-amount">$${pkg.base_price.toLocaleString()}</span>
                        </div>
                        <div class="package-btns">
                            <a href="/safaris/${pkg.slug}/" class="btn btn-outline-dark btn-sm">Itinerary</a>
                            <a href="/booking/?package=${pkg.id}" class="btn btn-primary btn-sm">Book Now</a>
                        </div>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
        <div style="text-align: center; margin-top: 3.5rem;">
            <a href="/safaris/" class="btn btn-secondary btn-lg">VIEW ALL SAFARI PACKAGES →</a>
        </div>
    </div>
</section>

<!-- Safari Experiences -->
<section class="section">
    <div class="container">
        <div class="section-header">
            <span class="section-subtitle">EXPERIENCES THAT DEFINE TANZANIA</span>
            <h2>Our Safari Experiences</h2>
            <p>From the world's greatest wildlife spectacle to Indian Ocean coral reefs and sacred mountain summits.</p>
        </div>
        <div class="features-grid">
            ${data.safari_experiences.slice(0, 6).map(exp => `
            <div class="feature-card">
                <div class="feature-icon">${exp.icon}</div>
                <h3>${exp.title}</h3>
                <p>${exp.description}</p>
            </div>
            `).join('')}
        </div>
    </div>
</section>

<!-- Why Choose Us -->
<section class="section section-sand">
    <div class="container">
        <div class="section-header">
            <span class="section-subtitle">THE MALUNDA DIFFERENCE</span>
            <h2>Why Travelers Choose Malunda Explorers</h2>
            <p>We are a locally rooted Tanzanian expedition company dedicated to authenticity, conservation, and tailor-made travel perfection.</p>
        </div>
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">🌿</div>
                <h3>100% Local Naturalist Guides</h3>
                <p>Born and raised in Tanzania, our guides possess intimate knowledge of animal migration corridors, predator patterns, and local flora.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🚙</div>
                <h3>Custom 4x4 Safari Land Cruisers</h3>
                <p>Every traveler enjoys a guaranteed window seat, pop-up photographic roof hatch, onboard power inverters, binoculars, and fridge.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">✨</div>
                <h3>Tailor-Made Flexibility</h3>
                <p>We do not force you into rigid bus tours. Every itinerary can be customized for your exact travel dates, pacing, and preferences.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🤝</div>
                <h3>Responsible & Ethical Tourism</h3>
                <p>We practice Leave No Trace principles, support local community schools in Arusha, and partner with conservation-first safari camps.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🛡️</div>
                <h3>AMREF Flying Doctors Evacuation</h3>
                <p>Every Malunda Explorers traveler is registered with AMREF Flying Doctors 24/7 air medical evacuation insurance across all parks.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">💬</div>
                <h3>24/7 Dedicated Safari Concierge</h3>
                <p>From the moment you inquire until you board your international flight home, our Arusha operations team is at your fingertips on WhatsApp.</p>
            </div>
        </div>
    </div>
</section>

<!-- Wildlife Photo Gallery Showcase -->
<section class="section">
    <div class="container">
        <div class="section-header">
            <span class="section-subtitle">AUTHENTIC MOMENTS</span>
            <h2>Captured in the Tanzanian Wild</h2>
            <p>Every photo tells a story. Here is a glimpse of what awaits you across our safari circuits.</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.2rem;">
            ${data.gallery_items.slice(0, 8).map(g => `
            <div style="border-radius: 14px; overflow: hidden; height: 220px; box-shadow: var(--shadow-sm); position: relative;" class="dest-img-wrap">
                <img src="${g.image}" alt="${g.title}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 1rem 0.8rem 0.5rem; color: #fff; font-size: 0.85rem; font-weight: 600;">
                    ${g.title}
                </div>
            </div>
            `).join('')}
        </div>
        <div style="text-align: center; margin-top: 2.5rem;">
            <a href="/gallery/" class="btn btn-outline-dark">EXPLORE FULL PHOTO GALLERY →</a>
        </div>
    </div>
</section>

<!-- Testimonials -->
<section class="section section-dark">
    <div class="container">
        <div class="section-header">
            <span class="section-subtitle">TRAVELER STORIES</span>
            <h2 style="color: #fff;">Verified Traveler Reviews</h2>
            <p style="color: rgba(255,255,255,0.8);">Read authentic feedback from travelers who explored Tanzania with Malunda Explorers.</p>
        </div>
        <div class="testimonials-grid">
            ${data.testimonials.map(t => `
            <div class="testimonial-card">
                <div class="star-rating">${'★'.repeat(t.rating)}</div>
                <p class="testimonial-text">“${t.quote}”</p>
                <div class="testimonial-author">
                    <span class="author-name">${t.author}</span>
                    <span class="author-location">${t.location} • <em>${t.safari_package}</em></span>
                </div>
            </div>
            `).join('')}
        </div>
    </div>
</section>

<!-- FAQ Accordion -->
<section class="section">
    <div class="container">
        <div class="section-header">
            <span class="section-subtitle">HELPFUL INFORMATION</span>
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about planning your Tanzanian safari adventure.</p>
        </div>
        <div class="faq-accordion-wrap" style="max-width: 860px; margin: 0 auto;">
            ${data.faqs.slice(0, 5).map((faq, i) => `
            <div class="faq-item" style="background:#fff; border: 1px solid var(--color-border); border-radius: 12px; margin-bottom: 1rem; padding: 1.5rem;">
                <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--color-primary-dark);">${faq.question}</h3>
                <p style="font-size: 0.95rem; line-height: 1.7; color: var(--color-dark-muted); margin: 0;">${faq.answer}</p>
            </div>
            `).join('')}
        </div>
        <div style="text-align: center; margin-top: 2rem;">
            <a href="/faq/" class="btn btn-outline-dark">VIEW ALL SAFARI FAQS →</a>
        </div>
    </div>
</section>

<!-- Final CTA -->
<section class="final-cta-section" style="background: linear-gradient(rgba(15, 34, 21, 0.82), rgba(15, 34, 21, 0.92)), url('/wp-content/themes/malunda-explorers/assets/images/serengeti_migration.jpg') center/cover; padding: 7rem 1.5rem; color: #fff; text-align: center;">
    <div class="container-narrow">
        <span class="badge" style="background: var(--color-accent); color: #fff; margin-bottom: 1rem;">YOUR JOURNEY BEGINS</span>
        <h2 style="color: #fff; font-size: clamp(2.2rem, 4vw, 3.5rem); margin-bottom: 1.2rem;">Your Adventure Is Closer Than You Think</h2>
        <p style="font-size: 1.15rem; color: rgba(255,255,255,0.9); margin-bottom: 2.5rem; line-height: 1.8;">
            Whether you want to witness the Great Migration, descend into Ngorongoro Crater, or unwind on the white beaches of Zanzibar, our local specialists will design your dream itinerary.
        </p>
        <div style="display:flex; justify-content:center; gap: 1rem; flex-wrap:wrap;">
            <a href="/booking/" class="btn btn-primary btn-lg">BOOK YOUR SAFARI</a>
            <a href="/contact/" class="btn btn-secondary btn-lg">CUSTOMIZE A TRIP</a>
        </div>
    </div>
</section>
`;
    return res.end(renderHeader(data, 'home') + heroSection + renderFooter(data));
  }

  // 2. ABOUT US
  if (pathname === '/about-us' || pathname === '/about-us/') {
    const html = `
<section style="background: linear-gradient(rgba(15, 34, 21, 0.75), rgba(15, 34, 21, 0.85)), url('/wp-content/themes/malunda-explorers/assets/images/malunda-safari-010.jpg') center/cover; padding: 6rem 1.5rem 5rem; color: #fff; text-align: center;">
    <div class="container-narrow">
        <span class="badge" style="margin-bottom: 1rem;">WHO WE ARE</span>
        <h1 style="color: #fff; margin-bottom: 1rem;">About Malunda Explorers</h1>
        <p style="font-size: 1.15rem; color: rgba(255, 255, 255, 0.9); line-height: 1.8;">
            Rooted in Arusha, Tanzania. Creating authentic, transformative journeys that connect travelers with Africa’s untamed wilderness.
        </p>
    </div>
</section>

<section class="section">
    <div class="container-narrow">
        <div style="background: #fff; padding: 3rem; border-radius: 20px; border: 1px solid var(--color-border); box-shadow: var(--shadow-sm); margin-bottom: 3rem;">
            <span class="section-subtitle">OUR STORY</span>
            <h2 style="margin-bottom: 1rem;">Every Encounter Becomes a Story</h2>
            <p style="font-size: 1.05rem; line-height: 1.8; margin-bottom: 1.5rem;">
                Malunda Explorers was founded on a simple conviction: true travel is about meaningful connection. Based in Arusha, the safari capital of East Africa, we are a team of certified Tanzanian naturalists, expedition guides, and travel designers who have spent our lives exploring Tanzania’s most sacred natural ecosystems.
            </p>
            <p style="font-size: 1.05rem; line-height: 1.8;">
                We specialize in private safaris, great migration tracking, high-altitude Kilimanjaro expeditions, and tranquil Zanzibar escapes. We refuse generic mass-tourism routines—instead crafting thoughtfully paced journeys where you can sit quietly by a waterhole at dusk and truly feel the pulse of the African wild.
            </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
            <div style="background: var(--color-sand-light); padding: 2.5rem; border-radius: 16px; border: 1px solid var(--color-border);">
                <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🎯</div>
                <h3>Our Mission</h3>
                <p style="font-size: 0.96rem; line-height: 1.7; margin: 0;">
                    To deliver unforgettable, ethical, and meticulously organized safari journeys in Tanzania that exceed expectations, foster deep cultural understanding, and actively fund wildlife habitat preservation.
                </p>
            </div>
            <div style="background: var(--color-sand-light); padding: 2.5rem; border-radius: 16px; border: 1px solid var(--color-border);">
                <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🔭</div>
                <h3>Our Vision</h3>
                <p style="font-size: 0.96rem; line-height: 1.7; margin: 0;">
                    To be the leading indigenous Tanzanian luxury and adventure safari operator celebrated worldwide for authentic hospitality, environmental stewardship, and unmatched guest personalization.
                </p>
            </div>
        </div>

        <div style="background: #fff; padding: 3rem; border-radius: 20px; border: 1px solid var(--color-border); box-shadow: var(--shadow-sm); margin-bottom: 3rem;">
            <span class="section-subtitle">OUR CORE VALUES</span>
            <h2 style="margin-bottom: 1.5rem;">What Drives Everything We Do</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
                <div>
                    <h4 style="color: var(--color-primary); font-size: 1.1rem; margin-bottom: 0.3rem;">1. Authenticity</h4>
                    <p style="font-size: 0.92rem; color: #555;">Real encounters with indigenous wildlife and local cultures without staged gimmicks or shortcuts.</p>
                </div>
                <div>
                    <h4 style="color: var(--color-primary); font-size: 1.1rem; margin-bottom: 0.3rem;">2. Integrity</h4>
                    <p style="font-size: 0.92rem; color: #555;">Transparent pricing, clear inclusions, truthful advice, and ethical treatment of guides and porters.</p>
                </div>
                <div>
                    <h4 style="color: var(--color-primary); font-size: 1.1rem; margin-bottom: 0.3rem;">3. Excellence</h4>
                    <p style="font-size: 0.92rem; color: #555;">Meticulously maintained custom 4x4 vehicles, premier lodge partnerships, and seamless execution.</p>
                </div>
                <div>
                    <h4 style="color: var(--color-primary); font-size: 1.1rem; margin-bottom: 0.3rem;">4. Personalization</h4>
                    <p style="font-size: 0.92rem; color: #555;">No two travelers are identical. Every safari is fine-tuned to your personal pace, passions, and dreams.</p>
                </div>
                <div>
                    <h4 style="color: var(--color-primary); font-size: 1.1rem; margin-bottom: 0.3rem;">5. Responsibility</h4>
                    <p style="font-size: 0.92rem; color: #555;">Dedicated support for conservation agencies, zero plastic waste in parks, and sustainable lodge sourcing.</p>
                </div>
                <div>
                    <h4 style="color: var(--color-primary); font-size: 1.1rem; margin-bottom: 0.3rem;">6. Curiosity</h4>
                    <p style="font-size: 0.92rem; color: #555;">Fostering an insatiable desire to discover the hidden marvels of Tanzania’s wilderness and human heritage.</p>
                </div>
            </div>
        </div>

        <div style="background: var(--color-primary-dark); color: #fff; padding: 3rem; border-radius: 20px; text-align: center;">
            <h2 style="color: #fff; margin-bottom: 1rem;">Ready to Write Your Story in the Wild?</h2>
            <p style="color: rgba(255,255,255,0.85); font-size: 1.05rem; margin-bottom: 2rem;">
                Speak with our safari designers in Arusha to begin planning your personalized Tanzanian journey today.
            </p>
            <div style="display:flex; justify-content:center; gap: 1rem; flex-wrap:wrap;">
                <a href="/booking/" class="btn btn-primary">Book Your Safari</a>
                <a href="/contact/" class="btn btn-secondary">Inquire with Us</a>
            </div>
        </div>
    </div>
</section>
`;
    return res.end(renderHeader(data, 'about') + html + renderFooter(data));
  }

  // 3. DESTINATIONS DIRECTORY
  if (pathname === '/destinations' || pathname === '/destinations/') {
    const html = `
<section style="background: linear-gradient(rgba(15, 34, 21, 0.75), rgba(15, 34, 21, 0.85)), url('/wp-content/themes/malunda-explorers/assets/images/serengeti_migration.jpg') center/cover; padding: 6rem 1.5rem 5rem; color: #fff; text-align: center;">
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
            ${data.destinations.map((dest, i) => `
            <div id="${dest.slug}" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 3rem; align-items: center; background: #fff; padding: 2.5rem; border-radius: 20px; border: 1px solid var(--color-border); box-shadow: var(--shadow-sm);">
                <div style="${i % 2 === 0 ? 'order: 1;' : 'order: 2;'}">
                    <span class="section-subtitle" style="margin-bottom: 0.3rem;">DESTINATION GUIDE</span>
                    <h2 style="margin-bottom: 0.5rem;">${dest.name}</h2>
                    <div style="font-family: var(--font-heading); font-style: italic; color: var(--color-accent); font-size: 1.1rem; margin-bottom: 1.2rem;">
                        ${dest.subtitle}
                    </div>
                    <p style="font-size: 1rem; line-height: 1.8; margin-bottom: 1.5rem;">${dest.description}</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.8rem; background: var(--color-sand-light); padding: 1.2rem; border-radius: 10px;">
                        <div>
                            <span style="font-size: 0.75rem; text-transform:uppercase; color:#666; font-weight:700;">Best Time to Visit</span>
                            <div style="font-weight: 700; font-size: 0.92rem; color: var(--color-primary-dark);">${dest.best_time}</div>
                        </div>
                        <div>
                            <span style="font-size: 0.75rem; text-transform:uppercase; color:#666; font-weight:700;">Recommended Duration</span>
                            <div style="font-weight: 700; font-size: 0.92rem; color: var(--color-primary-dark);">${dest.recommended_duration}</div>
                        </div>
                    </div>
                    <div style="margin-bottom: 1.8rem;">
                        <span style="font-size: 0.8rem; text-transform:uppercase; color:#666; font-weight:700; display:block; margin-bottom: 0.5rem;">Key Wildlife Highlights:</span>
                        <div style="display:flex; flex-wrap:wrap; gap: 0.4rem;">
                            ${dest.wildlife_highlights.map(wh => `<span class="dest-tag">${wh}</span>`).join('')}
                        </div>
                    </div>
                    <div style="display:flex; gap: 1rem; flex-wrap:wrap;">
                        <a href="/destinations/${dest.slug}/" class="btn btn-primary">Destination Guide & Safaris →</a>
                        <a href="/booking/?dest=${dest.slug}" class="btn btn-outline-dark">Book a Safari Here</a>
                    </div>
                </div>
                <div style="${i % 2 === 0 ? 'order: 2;' : 'order: 1;'}">
                    <img src="${dest.hero_image}" alt="${dest.name}" style="border-radius: 16px; height: 380px; width: 100%; object-fit: cover; box-shadow: var(--shadow-md);" loading="lazy">
                </div>
            </div>
            `).join('')}
        </div>
    </div>
</section>
`;
    return res.end(renderHeader(data, 'destinations') + html + renderFooter(data));
  }

  // Single Destination routing (Supports Serengeti, Ngorongoro, Tarangire, Lake Manyara, Kilimanjaro, Zanzibar)
  if (pathname.startsWith('/destinations/')) {
    const rawSlug = pathname.replace('/destinations/', '').replace(/\/$/, '');
    const slug = rawSlug === 'kilimanjaro' ? 'mount-kilimanjaro' : rawSlug;
    const dest = data.destinations.find(d => d.slug === slug || d.id === slug);
    if (dest) {
      const relatedPackages = data.packages.filter(p => p.destinations.some(d => d.toLowerCase().includes(dest.name.split(' ')[0].toLowerCase())));
      const html = `
<section style="position: relative; min-height: 60vh; display: flex; align-items: flex-end; background: linear-gradient(180deg, rgba(15, 34, 21, 0.4) 0%, rgba(15, 34, 21, 0.9) 100%), url('${dest.hero_image}') center/cover no-repeat; padding: 5rem 1.5rem; color: #fff;">
    <div class="container">
        <div style="max-width: 860px;">
            <span class="badge" style="background: var(--color-accent); color: #fff; margin-bottom: 0.8rem;">DESTINATION SHOWCASE</span>
            <h1 style="color: #fff; font-size: clamp(2.4rem, 5vw, 3.8rem); margin-bottom: 0.5rem; line-height: 1.15;">${dest.name}</h1>
            <p style="font-size: 1.25rem; font-family: var(--font-heading); font-style: italic; color: var(--color-sand);">${dest.subtitle}</p>
        </div>
    </div>
</section>

<section class="section">
    <div class="container">
        <div style="display: grid; grid-template-columns: 1fr 380px; gap: 3rem; align-items: flex-start;">
            <div>
                <div style="background: #fff; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--color-border); margin-bottom: 2.5rem;">
                    <h2>Overview & Natural Wonder</h2>
                    <p style="font-size: 1.05rem; line-height: 1.8;">${dest.description}</p>
                    
                    <h3 style="margin-top: 2rem;">Wildlife & Natural Highlights</h3>
                    <ul style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.8rem; list-style: none; padding: 0; margin-top: 1rem;">
                        ${dest.wildlife_highlights.map(wh => `<li style="font-size: 0.95rem;">🐾 <strong>${wh}</strong></li>`).join('')}
                    </ul>
                </div>

                <div style="background: #fff; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--color-border); margin-bottom: 2.5rem;">
                    <h2>Activities & Best Time to Visit</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; background: var(--color-sand-light); padding: 1.2rem; border-radius: 10px;">
                        <div>
                            <span style="font-size: 0.75rem; text-transform:uppercase; color:#666; font-weight:700;">Suggested Trip Duration</span>
                            <div style="font-weight: 700; font-size: 1rem; color: var(--color-primary-dark);">${dest.recommended_duration}</div>
                        </div>
                        <div>
                            <span style="font-size: 0.75rem; text-transform:uppercase; color:#666; font-weight:700;">Prime Wildlife Season</span>
                            <div style="font-weight: 700; font-size: 1rem; color: var(--color-primary-dark);">${dest.best_time}</div>
                        </div>
                    </div>
                    <h3>Available Activities</h3>
                    <ul style="margin-left: 1.5rem; line-height: 1.9;">
                        ${dest.activities.map(act => `<li>${act}</li>`).join('')}
                    </ul>
                </div>

                <!-- Related Safari Packages -->
                <div style="background: #fff; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--color-border);">
                    <h2>Safari Packages Covering ${dest.name}</h2>
                    <div style="display: flex; flex-direction: column; gap: 1.2rem; margin-top: 1.5rem;">
                        ${(relatedPackages.length ? relatedPackages : data.packages.slice(0, 2)).map(pkg => `
                        <div style="display: flex; gap: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 1.2rem; align-items: center; flex-wrap: wrap;">
                            <img src="${pkg.image}" alt="${pkg.title}" style="width: 110px; height: 80px; object-fit: cover; border-radius: 8px;">
                            <div style="flex: 1; min-width: 200px;">
                                <h4 style="margin: 0 0 0.3rem;"><a href="/safaris/${pkg.slug}/">${pkg.title}</a></h4>
                                <div style="font-size: 0.85rem; color: #666;">🕒 ${pkg.days} Days • From <strong>$${pkg.base_price.toLocaleString()}</strong> / person</div>
                            </div>
                            <div>
                                <a href="/booking/?package=${pkg.id}" class="btn btn-primary btn-sm">Book This Safari</a>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Sticky Booking Card -->
            <aside style="position: sticky; top: 100px;">
                <div style="background: #fff; border-radius: 16px; border: 2px solid var(--color-accent); padding: 2rem; box-shadow: var(--shadow-lg);">
                    <h3 style="margin-bottom: 0.5rem;">Experience ${dest.name}</h3>
                    <p style="font-size: 0.92rem; color: #666; margin-bottom: 1.5rem;">
                        Custom-designed private safaris with certified local guides and custom 4x4 Land Cruisers.
                    </p>
                    <a href="/booking/?dest=${dest.slug}" class="btn btn-primary btn-block btn-lg" style="margin-bottom: 1rem;">Book a Safari Here</a>
                    <a href="https://wa.me/255784567890?text=Hello%20Malunda%20Explorers,%20I%20would%20like%20to%20plan%20a%20safari%20to%20${encodeURIComponent(dest.name)}" target="_blank" rel="noopener" class="btn btn-outline-dark btn-block">Chat on WhatsApp</a>
                </div>
            </aside>
        </div>
    </div>
</section>
`;
      return res.end(renderHeader(data, 'destinations') + html + renderFooter(data));
    }
  }

  // 4. SAFARIS / PACKAGES DIRECTORY (With interactive category filter)
  if (pathname === '/safaris' || pathname === '/safaris/') {
    const selectedCategory = parsed.query.category || parsed.query.style || '';
    const selectedDuration = parsed.query.duration || '';

    const html = `
<section style="background: linear-gradient(rgba(15, 34, 21, 0.75), rgba(15, 34, 21, 0.85)), url('/wp-content/themes/malunda-explorers/assets/images/malunda-safari-046.jpg') center/cover; padding: 6rem 1.5rem 5rem; color: #fff; text-align: center;">
    <div class="container-narrow">
        <span class="badge" style="margin-bottom: 1rem;">CURATED ITINERARIES</span>
        <h1 style="color: #fff; margin-bottom: 1rem;">Tanzania Safari Packages</h1>
        <p style="font-size: 1.15rem; color: rgba(255, 255, 255, 0.9); line-height: 1.8;">
            Thoughtfully planned safari itineraries designed around the way you want to explore. Search, filter by travel style, and reserve your guaranteed departure dates online.
        </p>
    </div>
</section>

<section class="section">
    <div class="container">
        <!-- Safari Filter Tabs -->
        <div style="background: #fff; border-radius: 12px; border: 1px solid var(--color-border); padding: 1.2rem; margin-bottom: 2.5rem; box-shadow: var(--shadow-sm);">
            <div style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: #666; margin-bottom: 0.8rem;">Filter By Safari Category:</div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button type="button" class="btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-outline-dark'}" onclick="filterSafariPackages('')">All Packages</button>
                <button type="button" class="btn btn-sm ${selectedCategory === 'Private Safaris' ? 'btn-primary' : 'btn-outline-dark'}" onclick="filterSafariPackages('Private')">Private Safaris</button>
                <button type="button" class="btn btn-sm ${selectedCategory === 'Luxury Safaris' ? 'btn-primary' : 'btn-outline-dark'}" onclick="filterSafariPackages('Luxury')">Luxury Safaris</button>
                <button type="button" class="btn btn-sm ${selectedCategory === 'Classic Safaris' ? 'btn-primary' : 'btn-outline-dark'}" onclick="filterSafariPackages('Classic')">Classic Safaris</button>
                <button type="button" class="btn btn-sm ${selectedCategory === 'Honeymoon Safaris' ? 'btn-primary' : 'btn-outline-dark'}" onclick="filterSafariPackages('Honeymoon')">Honeymoon Safaris</button>
                <button type="button" class="btn btn-sm ${selectedCategory === 'Family Safaris' ? 'btn-primary' : 'btn-outline-dark'}" onclick="filterSafariPackages('Family')">Family Safaris</button>
                <button type="button" class="btn btn-sm ${selectedCategory === 'Migration' ? 'btn-primary' : 'btn-outline-dark'}" onclick="filterSafariPackages('Migration')">Great Migration</button>
                <button type="button" class="btn btn-sm ${selectedCategory === 'Kilimanjaro' ? 'btn-primary' : 'btn-outline-dark'}" onclick="filterSafariPackages('Kilimanjaro')">Kilimanjaro Adventures</button>
            </div>
        </div>

        <div class="packages-grid" id="packagesGrid">
            ${data.packages.map(pkg => `
            <div class="package-card" data-style="${pkg.safari_style || ''}" data-title="${pkg.title.toLowerCase()}">
                <div class="package-image-wrap">
                    <img src="${pkg.image}" alt="${pkg.title}" loading="lazy">
                    <div class="package-duration-pill">
                        <span>🕒</span>
                        <span>${pkg.days} Days / ${pkg.nights} Nights</span>
                    </div>
                </div>
                <div class="package-body">
                    <div class="package-destinations-tags">
                        ${pkg.destinations.map(d => `<span class="dest-tag">${d}</span>`).join('')}
                    </div>
                    <h3 class="package-title">${pkg.title}</h3>
                    <div class="package-meta">
                        <span>Style: <strong>${pkg.safari_style}</strong></span>
                    </div>
                    <ul class="package-highlights">
                        ${pkg.highlights.slice(0, 3).map(hl => `<li>${hl}</li>`).join('')}
                    </ul>
                    <div class="package-footer">
                        <div class="price-box">
                            <span class="price-from-label">From</span>
                            <span class="price-amount">$${pkg.base_price.toLocaleString()}</span>
                            <span style="font-size:0.75rem; color:#777; display:block;">per person</span>
                        </div>
                        <div class="package-btns">
                            <a href="/safaris/${pkg.slug}/" class="btn btn-outline-dark btn-sm">Itinerary</a>
                            <a href="/booking/?package=${pkg.id}" class="btn btn-primary btn-sm">Book Now</a>
                        </div>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </div>
</section>

<script>
function filterSafariPackages(term) {
    const cards = document.querySelectorAll('#packagesGrid .package-card');
    cards.forEach(card => {
        const style = (card.getAttribute('data-style') || '').toLowerCase();
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        if (!term || style.includes(term.toLowerCase()) || title.includes(term.toLowerCase())) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}
</script>
`;
    return res.end(renderHeader(data, 'safaris') + html + renderFooter(data));
  }

  // Single Safari Package routing with Dynamic Pricing Calculator Panel
  if (pathname.startsWith('/safaris/')) {
    const slug = pathname.replace('/safaris/', '').replace(/\/$/, '');
    const pkg = data.packages.find(p => p.slug === slug || p.id === slug);
    if (pkg) {
      const packageUrl = `http://localhost:${PORT}/safaris/${pkg.slug}/`;
      const prefilledWhatsApp = `https://wa.me/255784567890?text=${encodeURIComponent(`Hello Malunda Explorers, I am inquiring about the ${pkg.title} (${packageUrl})`)}`;

      const html = `
<section style="position: relative; min-height: 65vh; display: flex; align-items: flex-end; background: linear-gradient(180deg, rgba(15, 34, 21, 0.4) 0%, rgba(15, 34, 21, 0.9) 100%), url('${pkg.image}') center/cover no-repeat; padding: 5rem 1.5rem; color: #fff;">
    <div class="container">
        <div style="max-width: 860px;">
            <div style="display:flex; gap: 0.6rem; flex-wrap:wrap; margin-bottom: 1rem;">
                <span class="badge" style="background: var(--color-accent); color: #fff;">${pkg.safari_style}</span>
                <span class="badge" style="background: rgba(255,255,255,0.2); color: #fff;">🕒 ${pkg.days} Days / ${pkg.nights} Nights</span>
                <span class="badge" style="background: rgba(255,255,255,0.2); color: #fff;">📍 ${pkg.destinations.join(' • ')}</span>
            </div>
            <h1 style="color: #fff; font-size: clamp(2.4rem, 5vw, 3.8rem); margin-bottom: 0.5rem; line-height: 1.15;">${pkg.title}</h1>
            <p style="font-size: 1.25rem; font-family: var(--font-heading); font-style: italic; color: var(--color-sand);">${pkg.subtitle}</p>
        </div>
    </div>
</section>

<div class="section">
    <div class="container">
        <div style="display: grid; grid-template-columns: 1fr 380px; gap: 3rem; align-items: flex-start;">
            <div>
                <div style="background: #fff; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--color-border); margin-bottom: 2.5rem;">
                    <h2>Safari Overview</h2>
                    <p style="font-size: 1.05rem; line-height: 1.8;">${pkg.overview}</p>
                    <h3 style="margin-top: 2rem;">Main Expedition Highlights</h3>
                    <ul style="list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.8rem;">
                        ${pkg.highlights.map(hl => `<li style="display: flex; gap: 0.6rem;"><span style="color: var(--color-accent); font-weight:800;">✓</span> ${hl}</li>`).join('')}
                    </ul>
                </div>

                <div style="background: #fff; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--color-border); margin-bottom: 2.5rem;">
                    <h2>Day-by-Day Safari Itinerary</h2>
                    <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem;">
                        ${pkg.itinerary.map(itin => `
                        <div style="border-left: 3px solid var(--color-accent); padding-left: 1.5rem;">
                            <div style="display:flex; align-items:center; gap: 0.8rem; margin-bottom: 0.4rem;">
                                <span style="background: var(--color-primary); color: #fff; font-weight: 700; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 4px;">DAY ${itin.day}</span>
                                <h3 style="font-size: 1.25rem; margin: 0;">${itin.title}</h3>
                            </div>
                            <p style="font-size: 0.96rem; line-height: 1.7; color: var(--color-dark-muted); margin: 0;">${itin.desc}</p>
                        </div>
                        `).join('')}
                    </div>
                </div>

                <div style="background: #fff; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--color-border); margin-bottom: 2.5rem;">
                    <h2>Inclusions & Exclusions</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin-top: 1rem;">
                        <div>
                            <h3 style="color: #137333; font-size: 1.2rem;">✓ Included in Package</h3>
                            <ul style="list-style: none; padding: 0;">
                                ${pkg.included.map(inc => `<li style="margin-bottom: 0.5rem;">✔ ${inc}</li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <h3 style="color: #c5221f; font-size: 1.2rem;">✕ Not Included</h3>
                            <ul style="list-style: none; padding: 0;">
                                ${pkg.not_included.map(ninc => `<li style="margin-bottom: 0.5rem;">✖ ${ninc}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <div style="background: var(--color-sand-light); padding: 2.5rem; border-radius: 16px; border: 1px solid var(--color-border);">
                    <h3>Important Travel Information</h3>
                    <ul style="line-height: 1.8; color: #555; margin-left: 1.5rem;">
                        <li><strong>Luggage:</strong> Soft-sided duffel bags recommended for safari 4x4 vehicles (max 15kg - 20kg per traveler).</li>
                        <li><strong>Health & Visas:</strong> Yellow fever card required if arriving from endemic countries. Tanzania electronic visa (e-Visa) recommended before departure.</li>
                        <li><strong>Medical Coverage:</strong> AMREF Flying Doctors 24/7 air emergency evacuation is automatically included for all Malunda Explorers clients.</li>
                    </ul>
                </div>
            </div>

            <!-- Sticky Dynamic Pricing Calculator & Booking Panel -->
            <aside style="position: sticky; top: 100px;">
                <div class="package-calc-card">
                    <div class="calc-header">
                        <span style="font-size: 0.8rem; text-transform:uppercase; color: var(--color-accent); font-weight:700;">LIVE QUOTATION ESTIMATOR</span>
                        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top: 0.4rem;">
                            <span style="font-size: 0.9rem; color: rgba(255,255,255,0.8);">Starting from:</span>
                            <span class="calc-price-lead" id="pkgEstimatedTotal">$${pkg.base_price.toLocaleString()}</span>
                        </div>
                        <div style="font-size: 0.78rem; color: rgba(255,255,255,0.65); text-align:right;">per person basis</div>
                    </div>
                    <div class="calc-form-body">
                        <div class="calc-field-group">
                            <label for="calcTravelDate">Departure Date</label>
                            <input type="date" id="calcTravelDate" value="${new Date().toISOString().split('T')[0]}" onchange="recalculatePackagePrice()">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                            <div class="calc-field-group">
                                <label for="calcAdults">Adults (12+)</label>
                                <select id="calcAdults" onchange="recalculatePackagePrice()">
                                    <option value="1">1 Adult</option>
                                    <option value="2" selected>2 Adults</option>
                                    <option value="3">3 Adults</option>
                                    <option value="4">4 Adults</option>
                                    <option value="5">5 Adults</option>
                                    <option value="6">6 Adults</option>
                                </select>
                            </div>
                            <div class="calc-field-group">
                                <label for="calcChildren">Children (2-11)</label>
                                <select id="calcChildren" onchange="recalculatePackagePrice()">
                                    <option value="0" selected>0 Children</option>
                                    <option value="1">1 Child (-50%)</option>
                                    <option value="2">2 Children</option>
                                    <option value="3">3 Children</option>
                                </select>
                            </div>
                        </div>
                        <div class="calc-field-group">
                            <label for="calcTier">Accommodation Standard</label>
                            <select id="calcTier" onchange="recalculatePackagePrice()">
                                <option value="budget">Comfort Lodges (Budget friendly)</option>
                                <option value="mid-range" selected>Mid-Range Classic Tented Lodges</option>
                                <option value="luxury">Luxury Boutique Safari Camps</option>
                            </select>
                        </div>

                        <!-- Real-time Cost Breakdown -->
                        <div class="calc-breakdown-box">
                            <div class="calc-breakdown-row">
                                <span>Adults Rate:</span>
                                <strong id="calcAdultsBreakdown">$${pkg.base_price.toLocaleString()}</strong>
                            </div>
                            <div class="calc-breakdown-row">
                                <span>Children Rate:</span>
                                <strong id="calcChildrenBreakdown">$0</strong>
                            </div>
                            <div class="calc-breakdown-row">
                                <span>Deposit Required (30%):</span>
                                <strong id="calcDepositBreakdown">$${Math.round(pkg.base_price * 0.3).toLocaleString()}</strong>
                            </div>
                            <div class="calc-total-row">
                                <span>Estimated Investment:</span>
                                <span id="calcTotalBreakdown" style="color: var(--color-accent); font-family: var(--font-heading);">$${pkg.base_price.toLocaleString()}</span>
                            </div>
                        </div>

                        <div style="font-size: 0.78rem; color: #777; margin-bottom: 1.2rem; line-height: 1.4;">
                            ℹ️ <em>Note: This interactive total is an accurate estimate based on published rates. Confirmed quotation is guaranteed upon date reservation.</em>
                        </div>

                        <button type="button" class="btn btn-primary btn-block btn-lg" onclick="proceedToBookingWithParams('${pkg.id}')" style="margin-bottom: 0.8rem;">
                            BOOK THIS SAFARI NOW
                        </button>

                        <a href="${prefilledWhatsApp}" target="_blank" rel="noopener" class="btn btn-outline-dark btn-block" style="display:flex; align-items:center; justify-content:center; gap: 0.5rem;">
                            <span>💬</span> Chat About This Safari
                        </a>
                    </div>
                </div>
            </aside>
        </div>
    </div>
</div>

<script>
const PKG_BASE_PRICE = ${pkg.base_price};
const TIER_MULTIPLIERS = { 'budget': 0.85, 'mid-range': 1.0, 'luxury': 1.45 };

function recalculatePackagePrice() {
    const adults = parseInt(document.getElementById('calcAdults').value, 10) || 1;
    const children = parseInt(document.getElementById('calcChildren').value, 10) || 0;
    const tier = document.getElementById('calcTier').value;
    const mult = TIER_MULTIPLIERS[tier] || 1.0;

    const adultTotal = Math.round(PKG_BASE_PRICE * mult * adults);
    const childTotal = Math.round(PKG_BASE_PRICE * mult * 0.5 * children);
    const total = adultTotal + childTotal;
    const deposit = Math.round(total * 0.3);

    document.getElementById('calcAdultsBreakdown').textContent = '$' + adultTotal.toLocaleString();
    document.getElementById('calcChildrenBreakdown').textContent = '$' + childTotal.toLocaleString();
    document.getElementById('calcDepositBreakdown').textContent = '$' + deposit.toLocaleString();
    document.getElementById('calcTotalBreakdown').textContent = '$' + total.toLocaleString();
    document.getElementById('pkgEstimatedTotal').textContent = '$' + total.toLocaleString();
}

function proceedToBookingWithParams(pkgId) {
    const date = document.getElementById('calcTravelDate').value;
    const adults = document.getElementById('calcAdults').value;
    const children = document.getElementById('calcChildren').value;
    const tier = document.getElementById('calcTier').value;
    window.location.href = '/booking/?package=' + pkgId + '&date=' + date + '&adults=' + adults + '&children=' + children + '&tier=' + tier;
}
</script>
`;
      return res.end(renderHeader(data, 'safaris') + html + renderFooter(data));
    }
  }

  // 5. EXPERIENCES
  if (pathname === '/safari-experiences' || pathname === '/safari-experiences/') {
    const html = `
<section style="background: linear-gradient(rgba(15, 34, 21, 0.75), rgba(15, 34, 21, 0.85)), url('/wp-content/themes/malunda-explorers/assets/images/malunda-safari-047.jpg') center/cover; padding: 6rem 1.5rem 5rem; color: #fff; text-align: center;">
    <div class="container-narrow">
        <span class="badge" style="margin-bottom: 1rem;">SIGNATURE ADVENTURES</span>
        <h1 style="color: #fff; margin-bottom: 1rem;">Safari Experiences & Services</h1>
        <p style="font-size: 1.15rem; color: rgba(255, 255, 255, 0.9); line-height: 1.8;">
            Beyond traditional game drives: immerse yourself in hot air balloon flights, indigenous cultural bomas, mountain trekking, and luxury bush dining.
        </p>
    </div>
</section>

<section class="section">
    <div class="container">
        <div class="features-grid">
            ${data.safari_experiences.map(exp => `
            <div class="feature-card" style="padding: 2.5rem;">
                <div class="feature-icon" style="font-size: 3rem;">${exp.icon}</div>
                <h2>${exp.title}</h2>
                <p style="font-size: 1rem; line-height: 1.8;">${exp.description}</p>
                <div style="margin-top: 1.5rem;">
                    <a href="/booking/" class="btn btn-outline-dark btn-sm">Include in Safari →</a>
                </div>
            </div>
            `).join('')}
        </div>
    </div>
</section>
`;
    return res.end(renderHeader(data, 'experiences') + html + renderFooter(data));
  }

  // 6. BOOKING ENGINE (7-Step Interactive Flow)
  if (pathname === '/booking' || pathname === '/booking/') {
    const html = `
<div class="booking-page-wrap">
    <div class="container">
        <div class="booking-header">
            <span class="badge badge-green" style="margin-bottom: 0.8rem;">REAL-TIME SAFARI RESERVATIONS</span>
            <h1>Book Your Tanzania Safari</h1>
            <p>Complete our 7-step interactive reservation system to customize your safari package, accommodation standard, optional activities, and secure your departure dates.</p>
        </div>

        <div class="booking-stepper">
            <div class="step-indicator active" id="stepIndicator_1"><div class="step-num">1</div><div class="step-title">Safari</div></div>
            <div class="step-indicator" id="stepIndicator_2"><div class="step-num">2</div><div class="step-title">Travelers</div></div>
            <div class="step-indicator" id="stepIndicator_3"><div class="step-num">3</div><div class="step-title">Lodging</div></div>
            <div class="step-indicator" id="stepIndicator_4"><div class="step-num">4</div><div class="step-title">Extras</div></div>
            <div class="step-indicator" id="stepIndicator_5"><div class="step-num">5</div><div class="step-title">Details</div></div>
            <div class="step-indicator" id="stepIndicator_6"><div class="step-num">6</div><div class="step-title">Summary</div></div>
            <div class="step-indicator" id="stepIndicator_7"><div class="step-num">7</div><div class="step-title">Payment</div></div>
        </div>

        <div class="booking-layout">
            <div class="booking-main-forms">
                <!-- STEP 1 -->
                <div class="booking-step-panel active" id="stepPanel_1">
                    <h2 class="step-panel-title"><span>1.</span> Select Your Safari Package</h2>
                    <p class="step-panel-desc">Choose a handcrafted Tanzanian itinerary and select your intended departure date.</p>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label for="travelDateInput">Preferred Departure Date *</label>
                            <input type="date" id="travelDateInput" class="form-control" required value="${new Date().toISOString().split('T')[0]}">
                        </div>
                    </div>
                    <label style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.8rem; display: block;">Select Itinerary:</label>
                    <div class="options-grid">
                        ${data.packages.map((pkg, i) => `
                        <div class="option-radio-card package-select-card ${i === 0 ? 'selected' : ''}" data-package-id="${pkg.id}">
                            <input type="radio" name="safariPackageRadio" value="${pkg.id}" ${i === 0 ? 'checked' : ''}>
                            <div class="option-title">${pkg.title}</div>
                            <div class="option-price">From $${pkg.base_price.toLocaleString()} / person</div>
                            <div class="option-desc">
                                🕒 ${pkg.days} Days • ${pkg.nights} Nights<br>
                                📍 ${pkg.destinations.join(' • ')}
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>

                <!-- STEP 2 -->
                <div class="booking-step-panel" id="stepPanel_2">
                    <h2 class="step-panel-title"><span>2.</span> Party Size & Travelers</h2>
                    <p class="step-panel-desc">Tell us who is traveling with you. Children under 12 receive a 50% discount.</p>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Adults (12+ years)</label>
                            <div class="counter-widget">
                                <button type="button" class="counter-btn" id="dec_adults">-</button>
                                <span class="counter-val" id="val_adults">2</span>
                                <button type="button" class="counter-btn" id="inc_adults">+</button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Children (2 - 11 years)</label>
                            <div class="counter-widget">
                                <button type="button" class="counter-btn" id="dec_children">-</button>
                                <span class="counter-val" id="val_children">0</span>
                                <button type="button" class="counter-btn" id="inc_children">+</button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Number of Rooms / Tents</label>
                            <div class="counter-widget">
                                <button type="button" class="counter-btn" id="dec_rooms">-</button>
                                <span class="counter-val" id="val_rooms">1</span>
                                <button type="button" class="counter-btn" id="inc_rooms">+</button>
                            </div>
                        </div>
                    </div>
                    <div class="form-group" id="childrenAgesGroup" style="display: none;">
                        <label for="childrenAges">Ages of Children (comma-separated)</label>
                        <input type="text" id="childrenAges" class="form-control" placeholder="e.g. 6, 9">
                    </div>
                    <div class="form-group">
                        <label for="specialReqs">Special Party Requirements (Optional)</label>
                        <textarea id="specialReqs" class="form-control" placeholder="e.g. Twin beds, interconnected rooms, mobility considerations..."></textarea>
                    </div>
                </div>

                <!-- STEP 3 -->
                <div class="booking-step-panel" id="stepPanel_3">
                    <h2 class="step-panel-title"><span>3.</span> Choose Accommodation Standard</h2>
                    <p class="step-panel-desc">Select your desired comfort level. All options are vetted for cleanliness, safety, and location.</p>
                    <div class="options-grid">
                        ${data.accommodation_tiers.map(t => `
                        <div class="option-radio-card accomm-tier-card ${t.id === 'mid-range' ? 'selected' : ''}" data-tier="${t.id}" data-multiplier="${t.multiplier}">
                            <input type="radio" name="accommodationTierRadio" value="${t.id}" ${t.id === 'mid-range' ? 'checked' : ''}>
                            <div class="option-title">${t.name}</div>
                            <div class="option-desc" style="margin-top: 0.5rem;">${t.description}</div>
                        </div>
                        `).join('')}
                    </div>
                </div>

                <!-- STEP 4 -->
                <div class="booking-step-panel" id="stepPanel_4">
                    <h2 class="step-panel-title"><span>4.</span> Add Optional Safari Extras</h2>
                    <p class="step-panel-desc">Enrich your Tanzanian adventure with extraordinary optional activities.</p>
                    <div class="extras-list">
                        ${data.optional_extras.map(e => `
                        <div class="extra-item-card" data-extra-id="${e.id}" data-extra-name="${e.name}" data-extra-price="${e.price}" data-extra-type="${e.price_type}">
                            <input type="checkbox" class="extra-checkbox">
                            <div class="extra-info">
                                <div class="extra-name">${e.name}</div>
                                <div class="extra-desc">${e.description}</div>
                            </div>
                            <div class="extra-price-tag">
                                +$${e.price}
                                <span style="font-size:0.75rem; color:#666; font-weight:normal; display:block;">${e.price_type.replace('_', ' ')}</span>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>

                <!-- STEP 5 -->
                <div class="booking-step-panel" id="stepPanel_5">
                    <h2 class="step-panel-title"><span>5.</span> Primary Traveler Information</h2>
                    <p class="step-panel-desc">We need your contact information to send official documentation and coordinate logistics.</p>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="custFullName">Full Name *</label>
                            <input type="text" id="custFullName" class="form-control" placeholder="e.g. Sarah Jenkins" required>
                        </div>
                        <div class="form-group">
                            <label for="custEmail">Email Address *</label>
                            <input type="email" id="custEmail" class="form-control" placeholder="e.g. sarah@example.com" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="custPhone">WhatsApp / Mobile Number *</label>
                            <input type="tel" id="custPhone" class="form-control" placeholder="e.g. +44 7700 900123" required>
                        </div>
                        <div class="form-group">
                            <label for="custCountry">Country of Residence *</label>
                            <input type="text" id="custCountry" class="form-control" placeholder="e.g. United Kingdom" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="custContactMethod">Preferred Contact Channel</label>
                            <select id="custContactMethod" class="form-control">
                                <option value="WhatsApp">WhatsApp (Fastest response)</option>
                                <option value="Email">Email</option>
                                <option value="Phone Call">Phone Call</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="custFlightInfo">Arrival Flight Info (If booked)</label>
                            <input type="text" id="custFlightInfo" class="form-control" placeholder="e.g. KLM Flight 569 arriving JRO 20:30">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="custDietary">Dietary Requirements</label>
                        <input type="text" id="custDietary" class="form-control" placeholder="e.g. Vegetarian, Gluten-Free, Halal, Nut Allergies...">
                    </div>
                    <div class="form-group">
                        <label for="custSpecialRequests">Additional Special Requests</label>
                        <textarea id="custSpecialRequests" class="form-control" placeholder="Tell us anything else that will help us craft your perfect journey..."></textarea>
                    </div>
                </div>

                <!-- STEP 6 -->
                <div class="booking-step-panel" id="stepPanel_6">
                    <h2 class="step-panel-title"><span>6.</span> Review Booking Summary</h2>
                    <p class="step-panel-desc">Review your safari details and pricing calculation before proceeding to payment confirmation.</p>
                    <div style="background: var(--color-sand-light); border: 1px solid var(--color-border); border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
                            <div>
                                <span style="font-size: 0.8rem; text-transform:uppercase; color:#666; font-weight:700;">Selected Safari</span>
                                <div id="step6_pkg" style="font-weight: 700; font-size: 1.1rem; color: var(--color-primary-dark);">-</div>
                            </div>
                            <div>
                                <span style="font-size: 0.8rem; text-transform:uppercase; color:#666; font-weight:700;">Travel Dates</span>
                                <div id="step6_dates" style="font-weight: 700; font-size: 1.1rem; color: var(--color-primary-dark);">-</div>
                            </div>
                            <div>
                                <span style="font-size: 0.8rem; text-transform:uppercase; color:#666; font-weight:700;">Travelers</span>
                                <div id="step6_travelers" style="font-weight: 700; font-size: 1.1rem; color: var(--color-primary-dark);">-</div>
                            </div>
                            <div>
                                <span style="font-size: 0.8rem; text-transform:uppercase; color:#666; font-weight:700;">Accommodation</span>
                                <div id="step6_accomm" style="font-weight: 700; font-size: 1.1rem; color: var(--color-primary-dark);">-</div>
                            </div>
                        </div>
                        <div style="border-top: 1px solid #e0dbce; padding-top: 1.2rem; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <div style="font-size: 0.85rem; color:#666;">Lead Traveler</div>
                                <div id="step6_customer" style="font-weight: 700;">-</div>
                                <div id="step6_email" style="font-size: 0.85rem; color:#666;">-</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.85rem; color:#666;">Total Package Investment</div>
                                <div id="step6_total" style="font-size: 1.8rem; font-weight: 800; color: var(--color-accent); font-family: var(--font-heading);">-</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- STEP 7 -->
                <div class="booking-step-panel" id="stepPanel_7">
                    <h2 class="step-panel-title"><span>7.</span> Payment & Confirmation</h2>
                    <p class="step-panel-desc">Select how you would like to guarantee your reservation today.</p>
                    <div style="margin-bottom: 2rem;">
                        <label style="font-weight: 700; margin-bottom: 0.8rem; display:block;">Payment Structure:</label>
                        <div class="options-grid">
                            <label class="option-radio-card selected">
                                <input type="radio" name="paymentType" value="deposit" checked>
                                <div class="option-title">Pay 30% Deposit Now</div>
                                <div class="option-desc">Secure lodge permits and vehicle today. The remaining 70% balance is due 30 days before departure.</div>
                            </label>
                            <label class="option-radio-card">
                                <input type="radio" name="paymentType" value="full">
                                <div class="option-title">Pay 100% In Full</div>
                                <div class="option-desc">Complete full payment now with zero remaining balances.</div>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label style="font-weight: 700; margin-bottom: 0.8rem; display:block;">Select Payment Gateway / Method:</label>
                        <div class="options-grid">
                            <label class="option-radio-card selected">
                                <input type="radio" name="paymentMethod" value="card" checked>
                                <div class="option-title">💳 Credit / Debit Card (Visa/Mastercard)</div>
                                <div class="option-desc">Instant secure processing via PCI-DSS compliant sandbox gateway.</div>
                            </label>
                            <label class="option-radio-card">
                                <input type="radio" name="paymentMethod" value="bank_transfer">
                                <div class="option-title">🏦 Direct Bank Wire</div>
                                <div class="option-desc">Official commercial invoice with CRDB Bank Tanzania SWIFT wire instructions.</div>
                            </label>
                            <label class="option-radio-card">
                                <input type="radio" name="paymentMethod" value="mobile_money">
                                <div class="option-title">📱 Mobile Money (East Africa)</div>
                                <div class="option-desc">M-Pesa, Airtel Money, or Tigo Pesa for regional travelers.</div>
                            </label>
                        </div>
                    </div>
                    <div style="background: #eef7ed; padding: 1.2rem; border-radius: 8px; border-left: 4px solid #137333; margin-top: 2rem; font-size: 0.9rem;">
                        🔒 <strong>Secure Reservation Guarantee:</strong> Your booking is instantly issued with an authentic reference code (e.g. ME-2026-0001). Our Arusha headquarters holds lodge allocations upon booking submission.
                    </div>
                </div>

                <div class="step-navigation-actions">
                    <button type="button" class="btn btn-outline-dark" id="btnPrevStep" style="display: none;">← Previous Step</button>
                    <div style="flex-grow: 1;"></div>
                    <button type="button" class="btn btn-primary" id="btnNextStep">Continue to Next Step →</button>
                    <button type="button" class="btn btn-primary btn-lg" id="btnSubmitBooking" style="display: none;">Confirm & Reserve My Safari 🦁</button>
                </div>
            </div>

            <!-- Sticky Summary Sidebar -->
            <aside class="booking-summary-sidebar">
                <div class="summary-header">
                    <h3>Booking Summary</h3>
                    <p>Live itinerary breakdown & pricing</p>
                </div>
                <div class="summary-body">
                    <div class="summary-item-row"><span class="summary-item-label">Package:</span><span class="summary-item-value" id="summaryPkgName">Loading...</span></div>
                    <div class="summary-item-row"><span class="summary-item-label">Dates:</span><span class="summary-item-value" id="summaryDates">Select Date</span></div>
                    <div class="summary-item-row"><span class="summary-item-label">Party:</span><span class="summary-item-value" id="summaryTravelers">2 Adults</span></div>
                    <div class="summary-item-row"><span class="summary-item-label">Standard:</span><span class="summary-item-value" id="summaryAccomm">Mid-Range</span></div>
                    <div class="summary-divider"></div>
                    <div style="font-size: 0.82rem; font-weight: 700; text-transform:uppercase; color:#666; margin-bottom: 0.5rem;">Selected Optional Extras:</div>
                    <div id="summaryExtrasList" style="font-size: 0.85rem; margin-bottom: 1rem;"><span style="color:#888;">None selected</span></div>
                    <div class="summary-divider"></div>
                    <div class="summary-item-row"><span class="summary-item-label">Base Safari Total:</span><span class="summary-item-value" id="summaryBaseTotal">$0</span></div>
                    <div class="summary-item-row"><span class="summary-item-label">Extras Total:</span><span class="summary-item-value" id="summaryExtrasTotal">$0</span></div>
                    <div class="summary-total-row"><span class="summary-total-label">Total Price:</span><span class="summary-total-value" id="summaryTotalAmount">$0</span></div>
                    <div class="deposit-box">
                        <div class="deposit-title">30% Deposit to Confirm:</div>
                        <div class="deposit-val" id="summaryDepositAmount">$0</div>
                        <div style="font-size: 0.78rem; color:#666; margin-top: 0.2rem;">Balance Due (<span id="summaryBalanceDue">$0</span>) payable 30 days prior.</div>
                    </div>
                </div>
            </aside>
        </div>

        <!-- Success Confirmation Voucher -->
        <div id="bookingVoucherWrap" style="display: none; padding: 2rem 0;">
            <div class="booking-voucher-card">
                <div class="success-icon-wrap">✓</div>
                <h2 style="font-size: 2.2rem; color: var(--color-primary-dark); margin-bottom: 0.5rem;">Safari Reservation Confirmed!</h2>
                <p style="font-size: 1.1rem; color: var(--color-dark-muted);">
                    Karibu sana! Your Tanzanian journey with Malunda Explorers has been successfully registered.
                </p>
                <div>
                    <span style="font-size:0.85rem; font-weight:700; text-transform:uppercase; color:#666; display:block;">Your Booking Reference Number:</span>
                    <div class="voucher-ref-code" id="voucherRefCode">ME-2026-0001</div>
                </div>
                <div class="voucher-details-grid">
                    <div><strong>Safari Itinerary:</strong> <span id="voucherSafariTitle">-</span></div>
                    <div><strong>Travel Date:</strong> <span id="voucherTravelDate">-</span></div>
                    <div><strong>Lead Traveler:</strong> <span id="voucherCustName">-</span></div>
                    <div><strong>Party Size:</strong> <span id="voucherTravelers">-</span></div>
                    <div><strong>Email:</strong> <span id="voucherCustEmail">-</span></div>
                    <div><strong>Phone/WhatsApp:</strong> <span id="voucherCustPhone">-</span></div>
                    <div><strong>Total Investment:</strong> <span id="voucherTotal">-</span></div>
                    <div><strong>Deposit Registered:</strong> <span id="voucherDeposit">-</span></div>
                </div>
                <p style="font-size: 0.95rem; margin-bottom: 2rem;">
                    A formal booking confirmation email has been dispatched to your email address. Our Arusha safari operations team will contact you via WhatsApp shortly with your personalized preparation packet.
                </p>
                <div style="display:flex; justify-content:center; gap: 1rem; flex-wrap:wrap;">
                    <button type="button" class="btn btn-outline-dark" onclick="window.print();">🖨️ Print Booking Voucher</button>
                    <a id="btnVoucherWhatsApp" href="https://wa.me/255784567890?text=Hello%20Malunda%20Explorers,%20I%20have%20completed%20booking%20my%20safari!" target="_blank" rel="noopener" class="btn btn-primary">💬 Contact Us on WhatsApp</a>
                    <a id="btnVoucherLookup" href="/booking-lookup/" class="btn btn-outline-dark">View in Customer Portal</a>
                </div>
            </div>
        </div>
    </div>
</div>
<script>window.MALUNDA_EMBEDDED_DATA = ${JSON.stringify(data)};</script>
<script src="/wp-content/themes/malunda-explorers/assets/js/booking-engine.js"></script>
`;
    return res.end(renderHeader(data, 'booking') + html + renderFooter(data));
  }

  // 7. CUSTOMER DASHBOARD & BOOKING LOOKUP
  if (pathname === '/booking-lookup' || pathname === '/booking-lookup/' || pathname === '/customer' || pathname === '/customer/dashboard') {
    const html = `
<div class="cust-dashboard-wrap">
    <div class="container" style="max-width: 960px;">
        <div style="text-align: center; margin-bottom: 2.5rem;">
            <span class="badge" style="background: var(--color-accent); color: #fff; margin-bottom: 0.8rem;">CUSTOMER PORTAL</span>
            <h1>Find & Manage Your Booking</h1>
            <p>Access your official reservation voucher, daily safari itinerary, payment receipts, balance settlement, and modification requests.</p>
        </div>

        <!-- Lookup Form -->
        <div class="cust-card" id="lookupFormCard">
            <h3 style="margin-bottom: 1rem;">Enter Reservation Details</h3>
            <form id="bookingLookupForm" onsubmit="event.preventDefault(); handleLookupSubmit();">
                <div class="form-row">
                    <div class="form-group">
                        <label for="lookupRef">Booking Reference Number *</label>
                        <input type="text" id="lookupRef" class="form-control" placeholder="e.g. ME-2026-3759" required>
                    </div>
                    <div class="form-group">
                        <label for="lookupEmail">Lead Traveler Email Address *</label>
                        <input type="email" id="lookupEmail" class="form-control" placeholder="e.g. awright@example.com" required>
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: 1rem; margin-top: 1rem;">
                    <div style="font-size:0.85rem; color:#666;">🔒 Authorized secure access only. Reference and email must match.</div>
                    <button type="submit" class="btn btn-primary" id="btnLookup">Access My Reservation →</button>
                </div>
            </form>
            <div id="lookupErrorAlert" style="display:none; margin-top: 1rem; padding: 1rem; background: #fdf3f2; border: 1px solid #f5c2c7; border-radius: 8px; color: #842029;"></div>
        </div>

        <!-- Dashboard Result Display (Hidden initially) -->
        <div id="bookingResultCard" style="display:none;">
            <div class="cust-card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap: 1rem; border-bottom: 1px solid #eee; padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
                    <div>
                        <span style="font-size: 0.8rem; text-transform:uppercase; color:#666; font-weight:700;">Reservation Reference</span>
                        <h2 id="dispBookingRef" style="color: var(--color-primary); font-size: 2rem; margin: 0.2rem 0;">ME-2026-0000</h2>
                        <div id="dispCreatedAt" style="font-size: 0.85rem; color: #777;">Booked on October 7, 2026</div>
                    </div>
                    <div style="text-align: right;">
                        <span id="dispStatusBadge" class="badge" style="background: #137333; color:#fff; font-size: 0.95rem; padding: 0.4rem 1rem;">Confirmed</span>
                        <div id="dispPaymentBadge" style="margin-top: 0.5rem; font-weight: 700; color: #1a73e8; font-size: 0.9rem;">Deposit Paid</div>
                    </div>
                </div>

                <!-- Visual Progress Timeline -->
                <div style="font-size: 0.85rem; font-weight:700; text-transform:uppercase; color:#666;">Safari Status Timeline</div>
                <div class="timeline-track">
                    <div class="timeline-step completed">
                        <div class="timeline-dot">✓</div>
                        <div class="timeline-title">Request Received</div>
                    </div>
                    <div class="timeline-step completed">
                        <div class="timeline-dot">✓</div>
                        <div class="timeline-title">Dates Reserved</div>
                    </div>
                    <div class="timeline-step active" id="stepDeposit">
                        <div class="timeline-dot">3</div>
                        <div class="timeline-title">Deposit Guaranteed</div>
                    </div>
                    <div class="timeline-step" id="stepDeparture">
                        <div class="timeline-dot">4</div>
                        <div class="timeline-title">Safari Departure</div>
                    </div>
                </div>

                <!-- Detailed Information Grid -->
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; background: var(--color-sand-light); padding: 1.5rem; border-radius: 12px; margin: 2rem 0;">
                    <div>
                        <span style="font-size: 0.78rem; text-transform:uppercase; color:#666; font-weight:700;">Safari Package</span>
                        <div id="dispSafariTitle" style="font-weight: 700; color: var(--color-primary-dark); font-size: 1.05rem;">-</div>
                    </div>
                    <div>
                        <span style="font-size: 0.78rem; text-transform:uppercase; color:#666; font-weight:700;">Departure Date</span>
                        <div id="dispTravelDate" style="font-weight: 700; color: var(--color-primary-dark); font-size: 1.05rem;">-</div>
                    </div>
                    <div>
                        <span style="font-size: 0.78rem; text-transform:uppercase; color:#666; font-weight:700;">Party Size</span>
                        <div id="dispPartySize" style="font-weight: 700; color: var(--color-primary-dark); font-size: 1.05rem;">-</div>
                    </div>
                    <div>
                        <span style="font-size: 0.78rem; text-transform:uppercase; color:#666; font-weight:700;">Accommodation</span>
                        <div id="dispAccommTier" style="font-weight: 700; color: var(--color-primary-dark); font-size: 1.05rem;">-</div>
                    </div>
                </div>

                <!-- Financial Balance Box -->
                <div style="border: 2px solid var(--color-border); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                    <h3 style="font-size: 1.2rem; margin-bottom: 1rem;">Payment & Balance Summary</h3>
                    <div style="display:flex; justify-content:space-between; margin-bottom: 0.6rem; font-size: 0.95rem;">
                        <span>Total Safari Investment:</span>
                        <strong id="dispTotalInvestment">$0</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom: 0.6rem; font-size: 0.95rem; color: #137333;">
                        <span>Deposit Paid:</span>
                        <strong id="dispDepositPaid">$0</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size: 1.2rem; font-weight: 800; border-top: 1px solid #ddd; padding-top: 0.8rem; color: var(--color-primary-dark);">
                        <span>Remaining Balance Due:</span>
                        <span id="dispRemainingBalance" style="color: var(--color-accent); font-family: var(--font-heading);">$0</span>
                    </div>
                </div>

                <!-- Interactive Customer Actions -->
                <div style="display:flex; gap: 1rem; flex-wrap:wrap; justify-content:center;">
                    <button type="button" class="btn btn-outline-dark" onclick="window.print();">🖨️ Print Official Voucher</button>
                    <button type="button" class="btn btn-primary" id="btnPayBalance" onclick="openBalancePaymentModal()">💳 Pay Remaining Balance</button>
                    <button type="button" class="btn btn-outline-dark" onclick="openModifyDatesModal()">📅 Request Date Change</button>
                    <button type="button" class="btn btn-outline-dark" onclick="openCancelModal()">✕ Request Cancellation</button>
                    <a id="btnCustWhatsApp" href="https://wa.me/255784567890" target="_blank" rel="noopener" class="btn btn-primary">💬 Concierge WhatsApp</a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal for Balance Payment -->
<div id="modalBalancePayment" class="modal-overlay">
    <div class="modal-content">
        <button type="button" class="modal-close" onclick="closeModal('modalBalancePayment')">✕</button>
        <h2 style="color: var(--color-primary-dark); margin-bottom: 0.5rem;">Settle Outstanding Safari Balance</h2>
        <p style="font-size: 0.95rem; color: #666; margin-bottom: 1.5rem;">Secure balance settlement via integrated PCI sandbox gateway.</p>
        <div style="background: var(--color-sand-light); padding: 1.2rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <div style="font-size: 0.9rem;">Outstanding Balance: <strong id="modalBalanceAmt" style="font-size: 1.4rem; color: var(--color-accent); font-family: var(--font-heading);">$0</strong></div>
        </div>
        <div class="form-group">
            <label>Payment Method</label>
            <select id="balancePayMethod" class="form-control">
                <option value="card">Credit / Debit Card (Instant Sandbox)</option>
                <option value="bank_transfer">Direct Bank Wire (CRDB Arusha)</option>
                <option value="mobile_money">Mobile Money (M-Pesa / Tigo)</option>
            </select>
        </div>
        <div style="margin-top: 1.5rem; display:flex; justify-content:flex-end; gap: 0.8rem;">
            <button type="button" class="btn btn-outline-dark" onclick="closeModal('modalBalancePayment')">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="submitBalancePayment()">Confirm & Process Payment</button>
        </div>
    </div>
</div>

<!-- Modal for Date Modification -->
<div id="modalModifyDates" class="modal-overlay">
    <div class="modal-content">
        <button type="button" class="modal-close" onclick="closeModal('modalModifyDates')">✕</button>
        <h2 style="color: var(--color-primary-dark); margin-bottom: 0.5rem;">Request Travel Date Modification</h2>
        <p style="font-size: 0.95rem; color: #666; margin-bottom: 1.5rem;">We accommodate itinerary date changes subject to lodge and permit availability.</p>
        <div class="form-group">
            <label for="modNewDate">Desired New Departure Date *</label>
            <input type="date" id="modNewDate" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="modNotes">Reason / Notes for Modification</label>
            <textarea id="modNotes" class="form-control" placeholder="Tell us about your flight change or new schedule..."></textarea>
        </div>
        <div style="margin-top: 1.5rem; display:flex; justify-content:flex-end; gap: 0.8rem;">
            <button type="button" class="btn btn-outline-dark" onclick="closeModal('modalModifyDates')">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="submitModificationRequest()">Submit Modification</button>
        </div>
    </div>
</div>

<!-- Modal for Cancellation -->
<div id="modalCancel" class="modal-overlay">
    <div class="modal-content">
        <button type="button" class="modal-close" onclick="closeModal('modalCancel')">✕</button>
        <h2 style="color: #c5221f; margin-bottom: 0.5rem;">Request Safari Cancellation</h2>
        <p style="font-size: 0.95rem; color: #666; margin-bottom: 1.5rem;">Cancellations are processed according to our official Booking Terms & Conditions.</p>
        <div class="form-group">
            <label for="cancelReason">Reason for Cancellation</label>
            <textarea id="cancelReason" class="form-control" placeholder="Please let us know why you need to cancel..." required></textarea>
        </div>
        <div style="margin-top: 1.5rem; display:flex; justify-content:flex-end; gap: 0.8rem;">
            <button type="button" class="btn btn-outline-dark" onclick="closeModal('modalCancel')">Keep Reservation</button>
            <button type="button" class="btn btn-primary" style="background:#c5221f;" onclick="submitCancellationRequest()">Confirm Cancellation Request</button>
        </div>
    </div>
</div>

<script>
let CURRENT_LOOKUP_BOOKING = null;

// Auto-lookup if query params provided
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const email = params.get('email');
    if (ref && email) {
        document.getElementById('lookupRef').value = ref;
        document.getElementById('lookupEmail').value = email;
        handleLookupSubmit();
    }
});

async function handleLookupSubmit() {
    const ref = document.getElementById('lookupRef').value.trim();
    const email = document.getElementById('lookupEmail').value.trim();
    const alertBox = document.getElementById('lookupErrorAlert');
    alertBox.style.display = 'none';

    try {
        const res = await fetch('/api/bookings/lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking_ref: ref, email })
        });
        const data = await res.json();
        if (!data.success) {
            alertBox.textContent = data.error || 'Failed to locate reservation.';
            alertBox.style.display = 'block';
            return;
        }

        CURRENT_LOOKUP_BOOKING = data.booking;
        displayBookingDashboard(data.booking);
    } catch (err) {
        alertBox.textContent = 'Network error verifying reservation.';
        alertBox.style.display = 'block';
    }
}

function displayBookingDashboard(b) {
    document.getElementById('dispBookingRef').textContent = b.booking_ref;
    document.getElementById('dispCreatedAt').textContent = 'Booked on ' + new Date(b.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('dispStatusBadge').textContent = b.booking_status;
    document.getElementById('dispPaymentBadge').textContent = b.payment?.payment_status || 'Unpaid';
    document.getElementById('dispSafariTitle').textContent = b.safari_name;
    document.getElementById('dispTravelDate').textContent = b.travel_date;
    document.getElementById('dispPartySize').textContent = (b.travelers?.adults || 1) + ' Adults, ' + (b.travelers?.children || 0) + ' Children';
    document.getElementById('dispAccommTier').textContent = b.accommodation_name || 'Mid-Range Standard';

    const total = b.pricing?.total_price || 0;
    const paid = b.payment?.amount_paid || 0;
    const balance = b.pricing?.balance_due !== undefined ? b.pricing.balance_due : (total - paid);

    document.getElementById('dispTotalInvestment').textContent = '$' + total.toLocaleString();
    document.getElementById('dispDepositPaid').textContent = '$' + paid.toLocaleString();
    document.getElementById('dispRemainingBalance').textContent = '$' + balance.toLocaleString();
    document.getElementById('modalBalanceAmt').textContent = '$' + balance.toLocaleString();

    // Configure WhatsApp Concierge Button
    const waUrl = 'https://wa.me/255784567890?text=' + encodeURIComponent('Hello Malunda Explorers, I am inquiring regarding my booking ref: ' + b.booking_ref);
    document.getElementById('btnCustWhatsApp').href = waUrl;

    if (balance <= 0) {
        document.getElementById('btnPayBalance').style.display = 'none';
    } else {
        document.getElementById('btnPayBalance').style.display = 'inline-block';
    }

    document.getElementById('bookingResultCard').style.display = 'block';
    document.getElementById('bookingResultCard').scrollIntoView({ behavior: 'smooth' });
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function openBalancePaymentModal() { openModal('modalBalancePayment'); }
function openModifyDatesModal() { openModal('modalModifyDates'); }
function openCancelModal() { openModal('modalCancel'); }

async function submitBalancePayment() {
    if (!CURRENT_LOOKUP_BOOKING) return;
    const method = document.getElementById('balancePayMethod').value;
    try {
        const res = await fetch('/api/bookings/balance-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                booking_ref: CURRENT_LOOKUP_BOOKING.booking_ref,
                email: CURRENT_LOOKUP_BOOKING.customer.email,
                payment_method: method
            })
        });
        const result = await res.json();
        if (result.success) {
            alert('Asante sana! Outstanding balance payment registered.');
            closeModal('modalBalancePayment');
            CURRENT_LOOKUP_BOOKING = result.booking;
            displayBookingDashboard(result.booking);
        } else {
            alert(result.error);
        }
    } catch (e) {
        alert('Payment failed: ' + e.message);
    }
}

async function submitModificationRequest() {
    if (!CURRENT_LOOKUP_BOOKING) return;
    const newDate = document.getElementById('modNewDate').value;
    const notes = document.getElementById('modNotes').value;
    if (!newDate) { alert('Please select a requested departure date.'); return; }

    try {
        const res = await fetch('/api/bookings/modify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                booking_ref: CURRENT_LOOKUP_BOOKING.booking_ref,
                email: CURRENT_LOOKUP_BOOKING.customer.email,
                new_date: newDate,
                request_notes: notes
            })
        });
        const result = await res.json();
        if (result.success) {
            alert(result.message);
            closeModal('modalModifyDates');
        } else {
            alert(result.error);
        }
    } catch (e) {
        alert('Request failed: ' + e.message);
    }
}

async function submitCancellationRequest() {
    if (!CURRENT_LOOKUP_BOOKING) return;
    const reason = document.getElementById('cancelReason').value;
    if (!reason) { alert('Please enter the reason for cancellation.'); return; }

    try {
        const res = await fetch('/api/bookings/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                booking_ref: CURRENT_LOOKUP_BOOKING.booking_ref,
                email: CURRENT_LOOKUP_BOOKING.customer.email,
                cancellation_reason: reason
            })
        });
        const result = await res.json();
        if (result.success) {
            alert(result.message);
            closeModal('modalCancel');
        } else {
            alert(result.error);
        }
    } catch (e) {
        alert('Request failed: ' + e.message);
    }
}
</script>
`;
    return res.end(renderHeader(data, 'lookup') + html + renderFooter(data));
  }

  // 8. PHOTO GALLERY (With Category Filter & Lightbox)
  if (pathname === '/gallery' || pathname === '/gallery/') {
    const html = `
<section style="background: linear-gradient(rgba(15, 34, 21, 0.75), rgba(15, 34, 21, 0.85)), url('/wp-content/themes/malunda-explorers/assets/images/malunda-safari-011.jpg') center/cover; padding: 6rem 1.5rem 5rem; color: #fff; text-align: center;">
    <div class="container-narrow">
        <span class="badge" style="margin-bottom: 1rem;">VISUAL CHRONICLES</span>
        <h1 style="color: #fff; margin-bottom: 1rem;">Tanzania Wildlife & Safari Gallery</h1>
        <p style="font-size: 1.15rem; color: rgba(255, 255, 255, 0.9); line-height: 1.8;">
            A curated visual expedition across Serengeti, Ngorongoro, Tarangire, Kilimanjaro, and the turquoise coasts of Zanzibar.
        </p>
    </div>
</section>

<div class="section">
    <div class="container">
        <!-- Gallery Filter Tabs -->
        <div style="display:flex; justify-content:center; gap: 0.5rem; flex-wrap:wrap; margin-bottom: 2.5rem;">
            <button type="button" class="btn btn-sm btn-primary" onclick="filterGallery('all')">All Photographs</button>
            <button type="button" class="btn btn-sm btn-outline-dark" onclick="filterGallery('wildlife')">Wildlife & Big Five</button>
            <button type="button" class="btn btn-sm btn-outline-dark" onclick="filterGallery('landscapes')">Landscapes</button>
            <button type="button" class="btn btn-sm btn-outline-dark" onclick="filterGallery('vehicles')">Safari Vehicles</button>
            <button type="button" class="btn btn-sm btn-outline-dark" onclick="filterGallery('accommodations')">Luxury Camps</button>
            <button type="button" class="btn btn-sm btn-outline-dark" onclick="filterGallery('cultural')">Cultural Heritage</button>
            <button type="button" class="btn btn-sm btn-outline-dark" onclick="filterGallery('zanzibar')">Zanzibar Island</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;" id="galleryGrid">
            ${data.gallery_items.map(item => `
            <div class="gallery-item-wrap" data-cat="${item.category}" style="border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-sm); cursor: pointer;" onclick="openLightbox('${item.image}', '${item.title.replace(/'/g, "\\'")}', '${(item.caption || '').replace(/'/g, "\\'")}')">
                <img src="${item.image}" alt="${item.title}" style="width: 100%; height: 240px; object-fit: cover; display: block; transition: transform 0.3s;" loading="lazy">
                <div style="padding: 1rem; background: #fff; border-top: 1px solid #eee;">
                    <span style="font-size: 0.72rem; text-transform:uppercase; color: var(--color-accent); font-weight:700;">${item.category}</span>
                    <h4 style="font-size: 1rem; margin: 0.2rem 0 0; color: var(--color-primary-dark);">${item.title}</h4>
                </div>
            </div>
            `).join('')}
        </div>
    </div>
</div>

<!-- Lightbox Modal -->
<div id="galleryLightbox" class="modal-overlay" onclick="closeLightbox(event)">
    <div style="position: relative; max-width: 900px; width: 90%; background: #000; border-radius: 12px; overflow: hidden; margin: auto;">
        <button type="button" style="position: absolute; top: 15px; right: 20px; color:#fff; background:none; border:none; font-size: 2rem; cursor:pointer;" onclick="closeLightboxDirect()">✕</button>
        <img id="lightboxImg" src="" alt="Safari Photo" style="width: 100%; max-height: 70vh; object-fit: contain; display: block;">
        <div style="padding: 1.5rem; background: #191c1a; color: #fff;">
            <h3 id="lightboxTitle" style="color: var(--color-accent); margin: 0 0 0.4rem; font-size: 1.25rem;">Photo Title</h3>
            <p id="lightboxCaption" style="font-size: 0.92rem; color: #ccc; margin: 0;">Caption</p>
        </div>
    </div>
</div>

<script>
function filterGallery(cat) {
    const items = document.querySelectorAll('#galleryGrid .gallery-item-wrap');
    items.forEach(el => {
        if (cat === 'all' || el.getAttribute('data-cat') === cat) {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    });
}

function openLightbox(src, title, caption) {
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightboxTitle').textContent = title;
    document.getElementById('lightboxCaption').textContent = caption;
    document.getElementById('galleryLightbox').style.display = 'flex';
}

function closeLightbox(e) {
    if (e.target.id === 'galleryLightbox') {
        document.getElementById('galleryLightbox').style.display = 'none';
    }
}
function closeLightboxDirect() {
    document.getElementById('galleryLightbox').style.display = 'none';
}
</script>
`;
    return res.end(renderHeader(data, 'gallery') + html + renderFooter(data));
  }

  // 9. CONTACT & CUSTOM SAFARI REQUEST
  if (pathname === '/contact' || pathname === '/contact/') {
    const html = `
<section style="background: linear-gradient(rgba(15, 34, 21, 0.75), rgba(15, 34, 21, 0.85)), url('/wp-content/themes/malunda-explorers/assets/images/malunda-safari-048.jpg') center/cover; padding: 6rem 1.5rem 5rem; color: #fff; text-align: center;">
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
            <div style="background: #fff; padding: 3rem; border-radius: 20px; border: 1px solid var(--color-border); box-shadow: var(--shadow-md);">
                <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem;">Custom Safari Request</h2>
                <p style="font-size: 0.95rem; margin-bottom: 2rem;">Fill out this comprehensive questionnaire and a senior Tanzanian safari specialist will respond within 12 hours with a bespoke proposal.</p>
                <form id="contactSafariForm" onsubmit="event.preventDefault(); submitCustomInquiry();">
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
                    <button type="submit" class="btn btn-primary btn-lg btn-block" id="btnSubmitContact">SEND MY SAFARI REQUEST</button>
                </form>
                <div id="contactSuccessAlert" style="display:none; margin-top: 1.5rem; padding: 1.2rem; background: #eef7ed; border-left: 4px solid #137333; border-radius: 8px;">
                    <strong style="color: #137333; font-size: 1.1rem; display:block; margin-bottom: 0.3rem;">✓ Asante Sana! Safari Request Dispatched.</strong>
                    Your inquiry has been stored directly in our Arusha reservations queue. A senior Tanzania specialist will review your details and send a bespoke proposal within 12 hours.
                </div>
            </div>
            <div>
                <div style="background: var(--color-sand-light); padding: 2.5rem; border-radius: 20px; border: 1px solid var(--color-border); margin-bottom: 2rem;">
                    <h3 style="font-size: 1.4rem; margin-bottom: 1.2rem; color: var(--color-primary-dark);">Arusha Operations Office</h3>
                    <div style="display:flex; flex-direction:column; gap: 1.2rem; font-size: 0.95rem;">
                        <div><strong>Headquarters:</strong><br>${data.site_settings.address}</div>
                        <div><strong>Direct Telephone:</strong><br><a href="tel:${data.site_settings.phone.replace(/\s+/g, '')}">${data.site_settings.phone}</a></div>
                        <div><strong>WhatsApp (24/7 Safari Support):</strong><br><a href="https://wa.me/${data.site_settings.whatsapp}?text=Hello%20Malunda%20Explorers" target="_blank" rel="noopener" style="color: #137333; font-weight:700;">💬 +255 784 567 890 (Instant Concierge)</a></div>
                        <div><strong>Email Inquiries:</strong><br><a href="mailto:${data.site_settings.email}">${data.site_settings.email}</a></div>
                        <div><strong>Operating Hours:</strong><br>Monday - Saturday: 08:00 - 19:00 EAT<br>Sunday: 09:00 - 16:00 EAT<br><em>(24/7 emergency dispatch for travelers on active safaris)</em></div>
                    </div>
                    <div style="margin-top: 2rem;">
                        <a href="https://wa.me/${data.site_settings.whatsapp}?text=Hello%20Malunda%20Explorers,%20I%20would%20like%20to%20plan%20a%20safari." target="_blank" rel="noopener" class="btn btn-primary btn-block">Chat on WhatsApp Now</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
async function submitCustomInquiry() {
    const payload = {
        fullName: document.getElementById('contactFullName').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        phone: document.getElementById('contactPhone').value.trim(),
        country: document.getElementById('contactCountry').value.trim(),
        travelDates: document.getElementById('contactDates').value.trim(),
        travelers: document.getElementById('contactTravelers').value.trim(),
        duration: document.getElementById('contactDuration').value,
        budget: document.getElementById('contactBudget').value,
        destinations: document.getElementById('contactDestinations').value.trim(),
        safariStyle: document.getElementById('contactStyle').value,
        accommodation: document.getElementById('contactAccommodation').value,
        message: document.getElementById('contactMessage').value.trim()
    };

    try {
        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            document.getElementById('contactSafariForm').reset();
            document.getElementById('contactSuccessAlert').style.display = 'block';
        } else {
            alert(result.error);
        }
    } catch (e) {
        alert('Submission failed: ' + e.message);
    }
}
</script>
`;
    return res.end(renderHeader(data, 'contact') + html + renderFooter(data));
  }

  // 10. FAQ
  if (pathname === '/faq' || pathname === '/faq/') {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": data.faqs.map(f => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": { "@type": "Answer", "text": f.answer }
      }))
    };

    const html = `
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
<section style="background: linear-gradient(rgba(15, 34, 21, 0.75), rgba(15, 34, 21, 0.85)), url('/wp-content/themes/malunda-explorers/assets/images/malunda-safari-010.jpg') center/cover; padding: 6rem 1.5rem 5rem; color: #fff; text-align: center;">
    <div class="container-narrow">
        <span class="badge" style="margin-bottom: 1rem;">TRAVELER ADVISORY</span>
        <h1 style="color: #fff; margin-bottom: 1rem;">Safari Questions & Answers</h1>
        <p style="font-size: 1.15rem; color: rgba(255, 255, 255, 0.9); line-height: 1.8;">
            Everything you need to know about packing, permits, payments, game drives, best seasons, and health considerations.
        </p>
    </div>
</section>

<section class="section">
    <div class="container-narrow">
        <div style="display: flex; flex-direction: column; gap: 1.2rem;">
            ${data.faqs.map(faq => `
            <div style="background: #fff; border: 1px solid var(--color-border); border-radius: 14px; padding: 2rem; box-shadow: var(--shadow-sm);">
                <h3 style="color: var(--color-primary-dark); font-size: 1.25rem; margin-bottom: 0.6rem;">${faq.question}</h3>
                <p style="font-size: 0.98rem; line-height: 1.8; color: var(--color-dark-muted); margin: 0;">${faq.answer}</p>
            </div>
            `).join('')}
        </div>
    </div>
</section>
`;
    return res.end(renderHeader(data, 'faq') + html + renderFooter(data));
  }

  // 11. LEGAL PAGES
  if (pathname === '/privacy-policy' || pathname === '/privacy-policy/') {
    const html = `
<section class="section" style="padding: 6rem 1.5rem;">
    <div class="container-narrow" style="background:#fff; padding:3.5rem; border-radius: 16px; border: 1px solid var(--color-border);">
        <h1>Privacy Policy</h1>
        <p><em>Last updated: October 2026</em></p>
        <p>At Malunda Explorers, we respect the privacy of every traveler. This policy outlines how we collect, protect, and handle your personal information when you use our website and booking system.</p>
        <h3>Information We Collect</h3>
        <p>When requesting an itinerary or confirming a booking, we collect traveler names, contact details (email, telephone, WhatsApp), passport details where required for park permits, arrival flight numbers, and dietary/medical requests.</p>
        <h3>Payment Data Protection</h3>
        <p>We do NOT store credit card numbers on our servers. All online card transactions are processed via certified, PCI-DSS compliant payment gateways with 256-bit SSL encryption.</p>
    </div>
</section>`;
    return res.end(renderHeader(data, '') + html + renderFooter(data));
  }

  if (pathname === '/terms-conditions' || pathname === '/terms-conditions/') {
    const html = `
<section class="section" style="padding: 6rem 1.5rem;">
    <div class="container-narrow" style="background:#fff; padding:3.5rem; border-radius: 16px; border: 1px solid var(--color-border);">
        <h1>Terms and Conditions</h1>
        <p><em>Last updated: October 2026</em></p>
        <p>By browsing Malunda Explorers or booking a safari with us, you agree to these operational terms and conditions governing wildlife tourism in Tanzania.</p>
        <h3>National Parks Regulations</h3>
        <p>All travelers are subject to the wildlife regulations issued by TANAPA (Tanzania National Parks Authority) and the Ngorongoro Conservation Area Authority (NCAA).</p>
    </div>
</section>`;
    return res.end(renderHeader(data, '') + html + renderFooter(data));
  }

  if (pathname === '/booking-terms' || pathname === '/booking-terms/' || pathname === '/payment-policy' || pathname === '/payment-policy/') {
    const html = `
<section class="section" style="padding: 6rem 1.5rem;">
    <div class="container-narrow" style="background:#fff; padding:3.5rem; border-radius: 16px; border: 1px solid var(--color-border);">
        <h1>Booking, Payment & Cancellation Terms</h1>
        <p><em>Official Policy of Malunda Explorers (Arusha, Tanzania)</em></p>
        
        <h3>1. Deposit Requirements</h3>
        <p>A deposit of 30% of the total safari investment is required at the time of booking to secure park permits, vehicle reservations, and lodge allocations.</p>
        
        <h3>2. Final Balance Settlement</h3>
        <p>The remaining 70% balance is payable 30 days prior to your safari departure date. For reservations made within 30 days of travel, full payment is due upon confirmation.</p>
        
        <h3>3. Cancellation & Refund Schedule</h3>
        <ul style="line-height: 1.8; margin-left: 1.5rem;">
            <li><strong>61+ days prior to departure:</strong> Full refund minus a $150 per person administrative processing fee.</li>
            <li><strong>31 to 60 days prior:</strong> 70% refund of total safari amount.</li>
            <li><strong>15 to 30 days prior:</strong> 50% refund of total safari amount.</li>
            <li><strong>0 to 14 days prior:</strong> Non-refundable due to strict non-refundable commitments with Tanzanian lodge operators and TANAPA permit fees.</li>
        </ul>
        
        <h3>4. AMREF Medical Evacuation</h3>
        <p>Every confirmed booking automatically includes AMREF Flying Doctors 24/7 air emergency evacuation insurance to the nearest hospital in Nairobi or Arusha.</p>
    </div>
</section>`;
    return res.end(renderHeader(data, '') + html + renderFooter(data));
  }

  // 12. FULL ADMINISTRATION DASHBOARD (Tabs: Overview, Bookings, Packages, Availability, Payments, Inquiries, Settings)
  if (pathname === '/admin' || pathname === '/admin/' || pathname === '/admin/bookings' || pathname === '/admin/bookings/' || pathname === '/wp-admin' || pathname === '/wp-admin/') {
    const totalBookings = data.bookings.length;
    const confirmedCount = data.bookings.filter(b => b.booking_status === 'Confirmed' || b.booking_status === 'Fully Paid').length;
    const pendingCount = data.bookings.filter(b => b.booking_status === 'Pending' || b.booking_status === 'Pending Inquiry').length;
    const totalRev = data.bookings.reduce((sum, b) => sum + (b.pricing?.total_price || 0), 0);
    const depositsRev = data.payment_transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.amount || 0), 0);
    const outstandingTotal = Math.max(0, totalRev - depositsRev);

    const html = `
<div style="background: #f0f0f1; min-height: 100vh; padding: 2rem 1.5rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;">
    <div class="container" style="max-width: 1400px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem; flex-wrap:wrap; gap: 1rem;">
            <div>
                <a href="/" style="font-size:0.85rem; color:#666; text-decoration:none; display:inline-block; margin-bottom: 0.3rem;">← Back to Malunda Explorers Live Site</a>
                <h1 style="font-size: 1.8rem; font-weight: 700; color: #183321; margin: 0; display:flex; align-items:center; gap: 0.6rem;">
                    <span>🦁</span> Malunda Explorers — Staff Operations & Reservation Portal
                </h1>
                <p style="margin: 0.2rem 0 0; color:#555; font-size: 0.92rem;">Comprehensive booking management, packages, departures availability, payments & website settings</p>
            </div>
            <div style="display:flex; gap: 0.8rem;">
                <a href="/admin/export-csv" class="btn btn-primary btn-sm">📥 Export All Bookings (CSV)</a>
                <a href="/booking/" class="btn btn-outline-dark btn-sm" target="_blank">+ New Reservation</a>
            </div>
        </div>

        <!-- KPI Cards -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.2rem; margin-bottom: 2rem;">
            <div style="background:#fff; padding: 1.5rem; border-radius: 8px; border: 1px solid #ccd0d4; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 0.75rem; text-transform:uppercase; color:#666; font-weight:700;">Total Bookings</div>
                <div style="font-size: 2rem; font-weight: 800; color: #183321; margin-top: 0.3rem;">${totalBookings}</div>
            </div>
            <div style="background:#fff; padding: 1.5rem; border-radius: 8px; border: 1px solid #ccd0d4; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 0.75rem; text-transform:uppercase; color:#666; font-weight:700;">Confirmed Active</div>
                <div style="font-size: 2rem; font-weight: 800; color: #137333; margin-top: 0.3rem;">${confirmedCount}</div>
            </div>
            <div style="background:#fff; padding: 1.5rem; border-radius: 8px; border: 1px solid #ccd0d4; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 0.75rem; text-transform:uppercase; color:#666; font-weight:700;">Pending Inquiries</div>
                <div style="font-size: 2rem; font-weight: 800; color: #b06000; margin-top: 0.3rem;">${pendingCount}</div>
            </div>
            <div style="background:#fff; padding: 1.5rem; border-radius: 8px; border: 1px solid #ccd0d4; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 0.75rem; text-transform:uppercase; color:#666; font-weight:700;">Total Pipeline Revenue</div>
                <div style="font-size: 2rem; font-weight: 800; color: #c8933b; margin-top: 0.3rem;">$${totalRev.toLocaleString()}</div>
            </div>
            <div style="background:#fff; padding: 1.5rem; border-radius: 8px; border: 1px solid #ccd0d4; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 0.75rem; text-transform:uppercase; color:#666; font-weight:700;">Payments Received</div>
                <div style="font-size: 2rem; font-weight: 800; color: #137333; margin-top: 0.3rem;">$${depositsRev.toLocaleString()}</div>
            </div>
            <div style="background:#fff; padding: 1.5rem; border-radius: 8px; border: 1px solid #ccd0d4; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="font-size: 0.75rem; text-transform:uppercase; color:#666; font-weight:700;">Outstanding Balances</div>
                <div style="font-size: 2rem; font-weight: 800; color: #c5221f; margin-top: 0.3rem;">$${outstandingTotal.toLocaleString()}</div>
            </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="admin-tab-nav">
            <button type="button" class="admin-tab-btn active" onclick="switchAdminTab('tabBookings')">📋 All Bookings (${totalBookings})</button>
            <button type="button" class="admin-tab-btn" onclick="switchAdminTab('tabPackages')">🦁 Safari Packages (${data.packages.length})</button>
            <button type="button" class="admin-tab-btn" onclick="switchAdminTab('tabAvailability')">📅 Availability & Capacity</button>
            <button type="button" class="admin-tab-btn" onclick="switchAdminTab('tabPayments')">💳 Payment Transactions (${data.payment_transactions.length})</button>
            <button type="button" class="admin-tab-btn" onclick="switchAdminTab('tabInquiries')">✉️ Inquiries (${data.inquiries.length})</button>
            <button type="button" class="admin-tab-btn" onclick="switchAdminTab('tabSettings')">⚙️ Site Settings</button>
        </div>

        <!-- TAB 1: BOOKINGS TABLE -->
        <div id="tabBookings" class="admin-tab-content active">
            <div style="background: #fff; border-radius: 8px; border: 1px solid #ccd0d4; box-shadow: 0 1px 3px rgba(0,0,0,0.04); overflow: hidden;">
                <div style="padding: 1rem 1.5rem; background: #fafafa; border-bottom: 1px solid #eee; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: 1rem;">
                    <input type="text" id="adminSearchInput" placeholder="Filter by customer, reference, email, country..." style="min-width: 280px; padding: 0.5rem 0.8rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9rem;" oninput="filterAdminTable()">
                    <select id="adminStatusFilter" style="padding: 0.5rem 0.8rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9rem;" onchange="filterAdminTable()">
                        <option value="">All Booking Statuses</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending / Inquiries</option>
                        <option value="Deposit Paid">Deposit Paid</option>
                        <option value="Fully Paid">Fully Paid</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                        <thead>
                            <tr style="background: #f6f7f7; border-bottom: 1px solid #dcdcde;">
                                <th style="padding: 0.8rem 1rem; font-weight:700;">Ref Code</th>
                                <th style="padding: 0.8rem 1rem; font-weight:700;">Customer</th>
                                <th style="padding: 0.8rem 1rem; font-weight:700;">Safari Package</th>
                                <th style="padding: 0.8rem 1rem; font-weight:700;">Travel Date</th>
                                <th style="padding: 0.8rem 1rem; font-weight:700;">Party</th>
                                <th style="padding: 0.8rem 1rem; font-weight:700;">Total Price</th>
                                <th style="padding: 0.8rem 1rem; font-weight:700;">Payment Status</th>
                                <th style="padding: 0.8rem 1rem; font-weight:700;">Booking Status</th>
                                <th style="padding: 0.8rem 1rem; font-weight:700;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="adminTableRows">
                            ${data.bookings.map(b => `
                            <tr style="border-bottom: 1px solid #eee;" data-search="${(b.booking_ref + ' ' + (b.customer.full_name || '') + ' ' + (b.customer.email || '') + ' ' + (b.customer.country || '')).toLowerCase()}" data-status="${b.booking_status}">
                                <td style="padding: 0.8rem 1rem; font-weight:700; color:#183321;">${b.booking_ref}</td>
                                <td style="padding: 0.8rem 1rem;">
                                    <strong>${b.customer.full_name || 'Anonymous'}</strong><br>
                                    <small style="color:#666;">${b.customer.email || ''} • ${b.customer.phone || ''}</small>
                                </td>
                                <td style="padding: 0.8rem 1rem;">${b.safari_name}</td>
                                <td style="padding: 0.8rem 1rem;"><strong>${b.travel_date}</strong></td>
                                <td style="padding: 0.8rem 1rem;">${b.travelers?.adults || 1} Ad, ${b.travelers?.children || 0} Ch</td>
                                <td style="padding: 0.8rem 1rem;"><strong>$${(b.pricing?.total_price || 0).toLocaleString()}</strong></td>
                                <td style="padding: 0.8rem 1rem;">
                                    <span style="display:inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: #e8f0fe; color: #1a73e8;">
                                        ${b.payment?.payment_status || 'Unpaid'}
                                    </span>
                                </td>
                                <td style="padding: 0.8rem 1rem;">
                                    <span style="display:inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: ${b.booking_status === 'Confirmed' ? '#e6f4ea' : '#fef7e0'}; color: ${b.booking_status === 'Confirmed' ? '#137333' : '#b06000'};">
                                        ${b.booking_status || 'Pending'}
                                    </span>
                                </td>
                                <td style="padding: 0.8rem 1rem;">
                                    <button type="button" class="btn btn-outline-dark btn-sm" style="padding: 0.3rem 0.6rem; font-size: 0.78rem;" onclick="viewBookingDetails('${b.booking_ref}')">Manage</button>
                                </td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- TAB 2: PACKAGES MANAGEMENT -->
        <div id="tabPackages" class="admin-tab-content">
            <div style="background: #fff; border-radius: 8px; border: 1px solid #ccd0d4; padding: 2rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem;">
                    <h3>Safari Packages Directory</h3>
                    <button type="button" class="btn btn-primary btn-sm" onclick="openPackageModal()">+ Add New Package</button>
                </div>
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
                    ${data.packages.map(p => `
                    <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.2rem; background: #fafafa;">
                        <img src="${p.image}" alt="${p.title}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 6px; margin-bottom: 0.8rem;">
                        <h4 style="margin: 0 0 0.4rem; font-size: 1.1rem;">${p.title}</h4>
                        <div style="font-size: 0.85rem; color: #666; margin-bottom: 0.8rem;">
                            🕒 ${p.days} Days • From <strong>$${p.base_price.toLocaleString()}</strong><br>
                            Style: ${p.safari_style}
                        </div>
                        <div style="display:flex; gap: 0.5rem;">
                            <a href="/safaris/${p.slug}/" class="btn btn-outline-dark btn-sm" target="_blank">View Live</a>
                            <button type="button" class="btn btn-primary btn-sm" onclick="editPackage('${p.id}')">Edit</button>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- TAB 3: AVAILABILITY & CAPACITY CALENDAR -->
        <div id="tabAvailability" class="admin-tab-content">
            <div style="background: #fff; border-radius: 8px; border: 1px solid #ccd0d4; padding: 2rem;">
                <h3>Departure Capacity & Blackout Dates</h3>
                <p style="color: #666; font-size: 0.95rem; margin-bottom: 1.5rem;">Manage maximum seats per departure cruiser (standard: 6 seats) and toggle blackout dates.</p>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div style="background: #fafafa; padding: 1.5rem; border-radius: 8px;">
                        <h4>Current Vehicle Capacity Setting</h4>
                        <div style="display:flex; align-items:center; gap: 1rem; margin-top: 1rem;">
                            <input type="number" id="settingCapacity" value="${data.capacity_per_departure || 6}" style="width: 80px; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;">
                            <button type="button" class="btn btn-primary btn-sm" onclick="saveCapacitySetting()">Update Max Capacity</button>
                        </div>
                    </div>
                    <div style="background: #fafafa; padding: 1.5rem; border-radius: 8px;">
                        <h4>Blackout / Sold-Out Dates</h4>
                        <div style="display:flex; gap: 0.8rem; margin: 1rem 0;">
                            <input type="date" id="newBlackoutDate" style="padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;">
                            <button type="button" class="btn btn-outline-dark btn-sm" onclick="addBlackoutDate()">+ Add Blackout Date</button>
                        </div>
                        <div style="display:flex; gap: 0.4rem; flex-wrap:wrap;">
                            ${(data.blackout_dates || []).map(bd => `
                            <span style="background: #fdf3f2; color: #842029; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; border: 1px solid #f5c2c7; display:inline-flex; align-items:center; gap: 0.4rem;">
                                ${bd} <button type="button" onclick="removeBlackoutDate('${bd}')" style="background:none; border:none; cursor:pointer; color:#842029; font-weight:bold;">✕</button>
                            </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- TAB 4: PAYMENTS & REFUNDS -->
        <div id="tabPayments" class="admin-tab-content">
            <div style="background: #fff; border-radius: 8px; border: 1px solid #ccd0d4; padding: 2rem;">
                <h3>Payment Transactions Ledger</h3>
                <p style="color: #666; font-size: 0.95rem; margin-bottom: 1.5rem;">Audit log of all online sandbox card transactions, bank wire receipts, and mobile money entries.</p>
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                    <thead>
                        <tr style="background: #f6f7f7; border-bottom: 1px solid #dcdcde;">
                            <th style="padding: 0.8rem 1rem;">Transaction ID</th>
                            <th style="padding: 0.8rem 1rem;">Booking Ref</th>
                            <th style="padding: 0.8rem 1rem;">Method / Gateway</th>
                            <th style="padding: 0.8rem 1rem;">Amount</th>
                            <th style="padding: 0.8rem 1rem;">Status</th>
                            <th style="padding: 0.8rem 1rem;">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.payment_transactions.map(t => `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 0.8rem 1rem; font-weight:700;">${t.transaction_id}</td>
                            <td style="padding: 0.8rem 1rem;"><a href="javascript:viewBookingDetails('${t.booking_ref}')">${t.booking_ref}</a></td>
                            <td style="padding: 0.8rem 1rem;">${t.gateway || t.payment_method}</td>
                            <td style="padding: 0.8rem 1rem; font-weight:700; color: #137333;">$${t.amount.toLocaleString()}</td>
                            <td style="padding: 0.8rem 1rem;"><span style="color:#137333; font-weight:700;">✓ ${t.status}</span></td>
                            <td style="padding: 0.8rem 1rem; color: #666;">${new Date(t.created_at).toLocaleString()}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- TAB 5: INQUIRIES -->
        <div id="tabInquiries" class="admin-tab-content">
            <div style="background: #fff; border-radius: 8px; border: 1px solid #ccd0d4; padding: 2rem;">
                <h3>Tailor-Made Safari Inquiries</h3>
                <p style="color: #666; font-size: 0.95rem; margin-bottom: 1.5rem;">Custom safari requests submitted through the /contact/ form.</p>
                <div style="display:flex; flex-direction:column; gap: 1rem;">
                    ${data.inquiries.length === 0 ? '<p style="color:#888;">No new inquiries recorded yet.</p>' : data.inquiries.map(inq => `
                    <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.2rem; background: #fafafa;">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem;">
                            <strong>${inq.full_name} (${inq.email})</strong>
                            <span style="font-size: 0.8rem; color:#666;">${new Date(inq.created_at).toLocaleString()}</span>
                        </div>
                        <div style="font-size: 0.9rem; color: #555; margin-bottom: 0.5rem;">
                            📞 <strong>${inq.phone}</strong> • Country: ${inq.country} • Dates: ${inq.travel_dates} • Budget: ${inq.budget}
                        </div>
                        <div style="font-size: 0.92rem; background:#fff; padding: 0.8rem; border-radius: 6px; border: 1px solid #eee;">
                            “${inq.message}”
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- TAB 6: SETTINGS -->
        <div id="tabSettings" class="admin-tab-content">
            <div style="background: #fff; border-radius: 8px; border: 1px solid #ccd0d4; padding: 2rem; max-width: 800px;">
                <h3>Company Profile & Operations Settings</h3>
                <form id="adminSettingsForm" onsubmit="event.preventDefault(); saveAdminSettings();">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Company Phone</label>
                            <input type="text" id="setPhone" class="form-control" value="${data.site_settings.phone}">
                        </div>
                        <div class="form-group">
                            <label>WhatsApp Number (Direct)</label>
                            <input type="text" id="setWhatsApp" class="form-control" value="${data.site_settings.whatsapp}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Official Email</label>
                            <input type="email" id="setEmail" class="form-control" value="${data.site_settings.email}">
                        </div>
                        <div class="form-group">
                            <label>Deposit Percentage (%)</label>
                            <input type="number" id="setDepositPct" class="form-control" value="${data.site_settings.deposit_percentage || 30}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Brand Tagline</label>
                        <input type="text" id="setTagline" class="form-control" value="${data.site_settings.tagline}">
                    </div>
                    <div class="form-group">
                        <label>Physical Address</label>
                        <input type="text" id="setAddress" class="form-control" value="${data.site_settings.address}">
                    </div>
                    <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">Save All Settings</button>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Modal for Booking Details -->
<div id="adminModal" class="modal-overlay">
    <div class="modal-content" style="max-width: 700px;">
        <button type="button" class="modal-close" onclick="closeAdminModal()">✕</button>
        <h2 id="modalTitle" style="margin-bottom: 0.5rem; color: var(--color-primary-dark);">Reservation Record</h2>
        <div id="modalBody" style="line-height: 1.7; font-size: 0.95rem;"></div>
        
        <!-- Offline Payment Recording section -->
        <div style="margin-top: 1.5rem; padding: 1.2rem; background: #eef7ed; border-radius: 8px;">
            <h4 style="margin: 0 0 0.5rem; color: #137333;">Record Offline / Wire Payment</h4>
            <div style="display:flex; gap: 0.8rem; flex-wrap:wrap;">
                <input type="number" id="offlinePayAmount" placeholder="Amount ($)" style="width: 120px; padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px;">
                <select id="offlinePayMethod" style="padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px;">
                    <option value="CRDB Bank Wire SWIFT">Bank Wire Transfer</option>
                    <option value="M-Pesa Mobile Money">M-Pesa</option>
                    <option value="Cash at Arusha HQ">Cash</option>
                </select>
                <input type="text" id="offlinePayReceipt" placeholder="Receipt / Ref #" style="width: 140px; padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px;">
                <button type="button" class="btn btn-primary btn-sm" onclick="recordOfflinePayment()">Record Payment</button>
            </div>
        </div>

        <div style="margin-top: 1.5rem; display:flex; gap: 0.8rem; justify-content: flex-end;">
            <button type="button" class="btn btn-outline-dark btn-sm" onclick="closeAdminModal()">Close</button>
            <button type="button" class="btn btn-primary btn-sm" onclick="updateCurrentBookingStatus()">Save Status Changes</button>
        </div>
    </div>
</div>

<script>
const BOOKINGS_DATA = ${JSON.stringify(data.bookings)};
let currentActiveRef = null;

function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function filterAdminTable() {
    const q = document.getElementById('adminSearchInput').value.toLowerCase();
    const st = document.getElementById('adminStatusFilter').value;
    const rows = document.querySelectorAll('#adminTableRows tr');
    rows.forEach(r => {
        const text = r.getAttribute('data-search') || '';
        const status = r.getAttribute('data-status') || '';
        const matchQ = !q || text.includes(q);
        const matchSt = !st || status === st;
        r.style.display = (matchQ && matchSt) ? '' : 'none';
    });
}

function viewBookingDetails(ref) {
    const b = BOOKINGS_DATA.find(x => x.booking_ref === ref);
    if (!b) return;
    currentActiveRef = ref;
    document.getElementById('modalTitle').textContent = 'Reservation: ' + b.booking_ref;
    
    let html = '<div style="background:#fbf9f4; padding: 1.2rem; border-radius: 8px; margin-bottom: 1.2rem;">';
    html += '<strong>Safari:</strong> ' + b.safari_name + '<br>';
    html += '<strong>Travel Date:</strong> ' + b.travel_date + ' (' + b.duration_days + ' Days)<br>';
    html += '<strong>Customer:</strong> ' + b.customer.full_name + ' (' + b.customer.email + ')<br>';
    html += '<strong>Phone/WhatsApp:</strong> ' + b.customer.phone + ' | <strong>Country:</strong> ' + b.customer.country + '<br>';
    html += '<strong>Party:</strong> ' + (b.travelers?.adults || 1) + ' Adults, ' + (b.travelers?.children || 0) + ' Children<br>';
    html += '<strong>Pickup:</strong> ' + (b.customer.pickup_location || 'Arusha/JRO') + '<br>';
    html += '<strong>Dietary/Special:</strong> ' + (b.customer.dietary || 'None') + ' ' + (b.travelers?.special_requirements || '') + '<br>';
    html += '<strong>Total Price:</strong> $' + (b.pricing?.total_price || 0).toLocaleString() + ' | <strong>Deposit Paid:</strong> $' + (b.payment?.amount_paid || 0).toLocaleString() + '<br>';
    html += '</div>';

    html += '<div style="margin-bottom: 1rem;">';
    html += '<label><strong>Update Booking Status:</strong></label><br>';
    html += '<select id="editBookingStatus" class="form-control" style="margin-top: 0.3rem;">';
    ['Pending Inquiry', 'Pending Approval', 'Awaiting Payment', 'Partially Paid', 'Confirmed', 'Completed', 'Cancelled', 'Refunded'].forEach(s => {
        html += '<option value="' + s + '" ' + (b.booking_status === s ? 'selected' : '') + '>' + s + '</option>';
    });
    html += '</select></div>';

    html += '<div style="margin-bottom: 1rem;">';
    html += '<label><strong>Update Payment Status:</strong></label><br>';
    html += '<select id="editPaymentStatus" class="form-control" style="margin-top: 0.3rem;">';
    ['Unpaid', 'Deposit Paid', 'Partially Paid', 'Fully Paid', 'Refunded'].forEach(ps => {
        html += '<option value="' + ps + '" ' + (b.payment.payment_status === ps ? 'selected' : '') + '>' + ps + '</option>';
    });
    html += '</select></div>';

    html += '<div style="margin-bottom: 1rem;">';
    html += '<label><strong>Internal Operational Notes:</strong></label><br>';
    html += '<textarea id="editInternalNotes" class="form-control" style="margin-top:0.3rem;">' + (b.internal_notes || '') + '</textarea>';
    html += '</div>';

    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('adminModal').style.display = 'flex';
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
}

async function updateCurrentBookingStatus() {
    if (!currentActiveRef) return;
    const bStatus = document.getElementById('editBookingStatus').value;
    const pStatus = document.getElementById('editPaymentStatus').value;
    const notes = document.getElementById('editInternalNotes').value;

    try {
        const res = await fetch('/api/admin/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ref: currentActiveRef,
                booking_status: bStatus,
                payment_status: pStatus,
                notes: notes
            })
        });
        const d = await res.json();
        if (d.success) {
            alert('Booking status updated successfully.');
            location.reload();
        } else {
            alert(d.error);
        }
    } catch (e) {
        alert('Update failed: ' + e.message);
    }
}

async function recordOfflinePayment() {
    if (!currentActiveRef) return;
    const amt = document.getElementById('offlinePayAmount').value;
    const method = document.getElementById('offlinePayMethod').value;
    const receipt = document.getElementById('offlinePayReceipt').value;
    if (!amt) { alert('Please enter payment amount.'); return; }

    try {
        const res = await fetch('/api/admin/record-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ref: currentActiveRef,
                amount: amt,
                method: method,
                receipt_no: receipt,
                notes: 'Recorded via admin modal'
            })
        });
        const d = await res.json();
        if (d.success) {
            alert('Offline payment registered.');
            location.reload();
        } else {
            alert(d.error);
        }
    } catch (e) {
        alert('Failed: ' + e.message);
    }
}

async function saveCapacitySetting() {
    const cap = document.getElementById('settingCapacity').value;
    await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity: cap })
    });
    alert('Capacity setting updated.');
}

async function addBlackoutDate() {
    const d = document.getElementById('newBlackoutDate').value;
    if (!d) return;
    await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blackout_date: d, action: 'add' })
    });
    location.reload();
}

async function removeBlackoutDate(d) {
    await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blackout_date: d, action: 'remove' })
    });
    location.reload();
}

async function saveAdminSettings() {
    const payload = {
        phone: document.getElementById('setPhone').value,
        whatsapp: document.getElementById('setWhatsApp').value,
        email: document.getElementById('setEmail').value,
        deposit_percentage: parseInt(document.getElementById('setDepositPct').value, 10),
        tagline: document.getElementById('setTagline').value,
        address: document.getElementById('setAddress').value
    };
    await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    alert('Site settings updated successfully.');
}
</script>
`;
    return res.end(html);
  }

  // 404 handler
  if (!res.headersSent) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  }
  const notFoundHtml = `
<section class="section" style="padding: 8rem 1.5rem; text-align: center;">
    <div class="container-narrow">
        <h1 style="font-size: 4rem; color: var(--color-primary-dark); margin-bottom: 1rem;">404</h1>
        <h2>Destination Not Found</h2>
        <p style="font-size: 1.1rem; color: #666; margin-bottom: 2rem;">The safari trail you are following does not seem to lead anywhere.</p>
        <a href="/" class="btn btn-primary">Return to Homepage</a>
    </div>
</section>
`;
  return res.end(renderHeader(data, '') + notFoundHtml + renderFooter(data));
});

server.listen(PORT, () => {
  console.log(`Malunda Explorers server running at http://localhost:${PORT}`);
});
