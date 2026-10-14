# MALUNDA EXPLORERS — Production Deployment & Operations Manual

> **“Explore the Wild. Experience More. Create Memories.”**  
> *“Every Journey Tells a Story”*

This document provides complete instructions for installation, deployment, administrator onboarding, security, backups, and maintenance for **Malunda Explorers**, an authentic safari and travel company based in Arusha, Tanzania.

---

## 1. System Architecture Overview

The system is engineered as a lightweight, zero-dependency, concurrency-safe full-stack web application with integrated WordPress theme styling:

- **Runtime**: Node.js (v18+) with native HTTP server.
- **Data Persistence**: Relational JSON datastore located at `data/safari-data.json`, supporting transactional updates, audit logging, departure capacity tracking, and blackout dates.
- **Public Frontend**: High-performance semantic HTML5, Vanilla CSS design system matching African luxury aesthetic, Google Fonts (*Playfair Display* & *Plus Jakarta Sans*), responsive mobile views, and interactive micro-animations.
- **Booking Engine**: 7-Step interactive reservation wizard with real-time pricing calculator, capacity constraints, blackout date filtering, and printable voucher generator.
- **Customer Portal**: Self-service booking management at `/booking-lookup/` with email authentication isolation, timeline tracker, printable vouchers, modification requests, and balance settlement.
- **Administration Portal**: Staff management suite at `/admin/bookings/` for bookings, package editing, departure capacity, payment ledger, contact inquiries, and site settings.

---

## 2. Installation & Quick Start

### Prerequisites
- Node.js (version 18 or later recommended).
- Git.

### Setup Steps
```bash
# 1. Clone or navigate to the workspace
cd /path/to/malunda-explorers

# 2. Configure environment variables (optional for local preview)
cp .env.example .env

# 3. Start the application
node server.js
# or
npm start
```

The application will be live at **http://localhost:3000**.

---

## 3. Running Automated Tests

A comprehensive 10-point test suite is included in `test/booking-system.test.js` validating:
1. Availability engine capacity tracking.
2. Blackout date enforcement.
3. Pricing calculations (adults, child 50% discount, tier multipliers, 30% deposit).
4. Concurrency & overbooking prevention.
5. Booking creation and reference generation (`ME-2026-XXXX`).
6. Customer dashboard email isolation.
7. Customer modification requests.
8. Payment webhooks & idempotency.
9. Contact inquiry persistence.
10. Admin offline payment recording.

Run the test suite at any time:
```bash
node test/booking-system.test.js
```

---

## 4. Key Website URLs

| Page / Component | URL | Description |
| :--- | :--- | :--- |
| **Home Page** | `/` | Hero section, quick search, featured destinations, packages, gallery, reviews, FAQs |
| **About Us** | `/about-us/` | Mission, Vision, 6 Core Values, Story, Responsible Tourism |
| **Destinations Directory** | `/destinations/` | Overview of Tanzania Northern Circuit & Coastline |
| **Serengeti National Park** | `/destinations/serengeti/` | Wildlife highlights, seasons, migration info, related safaris |
| **Ngorongoro Crater** | `/destinations/ngorongoro/` | Caldera highlights, Big Five, duration, booking CTA |
| **Tarangire National Park** | `/destinations/tarangire/` | Baobabs & Elephant herds guide |
| **Lake Manyara** | `/destinations/lake-manyara/` | Flamingos & tree-climbing lions |
| **Mount Kilimanjaro** | `/destinations/mount-kilimanjaro/` | Machame & Marangu trekking overview |
| **Zanzibar Beach** | `/destinations/zanzibar/` | Stone Town & Nungwi beach paradise |
| **Safari Packages Directory**| `/safaris/` | Category filters (Private, Luxury, Migration, Family, Honeymoon) |
| **Single Package Detail** | `/safaris/7-day-northern-circuit-signature/` | Day-by-day itinerary, inclusions, **Live Quotation Estimator** |
| **Interactive Booking Engine**| `/booking/` | 7-step customer booking wizard & instant voucher generator |
| **Customer Booking Portal** | `/booking-lookup/` | Access reservations with Ref + Email, print vouchers, pay balance |
| **Photo Gallery** | `/gallery/` | Categorized wildlife & landscape gallery with modal lightbox |
| **Contact & Custom Safari** | `/contact/` | 13-field custom safari proposal request form |
| **Staff Administration** | `/admin/bookings/` | Complete reservation manager, package editor, payments & calendar |

---

## 5. Administrator Setup & Operations

### Accessing the Dashboard
- Open **http://localhost:3000/admin/bookings/** in your browser.
- The dashboard is organized into 6 tabs:
  1. **All Bookings**: Live search, filter by status, manage modal to record offline payments and modify statuses.
  2. **Safari Packages**: Edit package details, pricing, itineraries, or add new packages.
  3. **Availability & Capacity**: Set maximum travelers per cruiser (default: 6) and add blackout dates (e.g. holidays or fully-booked departures).
  4. **Payment Transactions**: View card transactions, bank wire notices, and mobile money receipts.
  5. **Inquiries**: Review custom safari requests submitted from the contact form.
  6. **Site Settings**: Edit company phone, WhatsApp direct number, email, address, tagline, and deposit percentage.

### Exporting Bookings
- Click the **📥 Export All Bookings (CSV)** button on the top right of the admin dashboard to generate an instant CSV report of all registered clients, financial status, and travel dates.

---

## 6. Payment Integration Guide

The system supports 4 payment mechanisms:

1. **Credit / Debit Cards (Stripe / Pesapal)**:
   - Configured via sandbox during development.
   - Webhook endpoint: `POST /api/payments/webhook`.
   - Idempotency protection prevents duplicate transaction entries.
2. **Direct Bank Wire Transfer (CRDB Bank Arusha)**:
   - Proforma invoices are automatically generated with official SWIFT instructions (`CORUTZTZ`).
   - Staff records confirmed bank wire receipts in the Admin Dashboard to transition bookings to `Confirmed`.
3. **Mobile Money (East Africa)**:
   - Supports M-Pesa, Airtel Money, and Tigo Pesa for regional travelers and Tanzanian residents.
4. **Deposit Structure**:
   - Configured at 30% deposit to guarantee bookings.
   - The remaining 70% balance is tracked automatically and payable 30 days prior via `/booking-lookup/`.

---

## 7. Backup, Security & Maintenance

### Backup Procedure
- The persistent source of truth is located in `data/safari-data.json`.
- Create a daily backup job (e.g. cron):
  ```bash
  # Daily automated snapshot
  cp data/safari-data.json data/backups/safari-data-$(date +%Y%m%d).json
  ```

### Security Measures
- Customer isolation: `/api/bookings/lookup` enforces matching email address before revealing personal or itinerary data.
- Input validation: All dates, party sizes, and traveler counts are validated server-side.
- Zero raw card storage: Payment processing is completely decoupled from raw card credentials.

---

## 8. Business Owner Information Required for Launch

Before pointing the public domain `malundaexplorers.com` to production:
1. Provide verified CRDB Bank Account Number and Branch for SWIFT wire proforma invoices.
2. Provide live merchant keys for Pesapal or Stripe if online credit card payments are to be accepted live.
3. Verify official TALA (Tourism Agency License) number for inclusion in legal footers.
