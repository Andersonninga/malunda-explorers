# MALUNDA EXPLORERS — Full-Stack Tanzania Safari & Booking System

> **“Every journey tells a story.”**  
> *“Explore the Wild. Experience More. Create Memories.”*

Malunda Explorers is a premium Tanzania safari travel brand based in **Arusha, Tanzania**.  
This project is built with a high-performance **Node.js REST API Backend** and a clean, responsive **HTML5/CSS3/Vanilla JS Frontend** (zero WordPress, zero PHP dependencies).

---

## 🌟 Live Interactive Server

The server runs on native Node.js (zero external npm dependencies required):

```bash
npm start
# or
node server.js
```

The application runs locally at **[http://localhost:3000](http://localhost:3000)**.

### Key Application Routes:
* **Home Page**: [http://localhost:3000/](http://localhost:3000/)
* **7-Step Interactive Booking Engine**: [http://localhost:3000/booking](http://localhost:3000/booking)
* **Customer Reservation Portal**: [http://localhost:3000/customer](http://localhost:3000/customer)
* **Staff Administration Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
* **Safari Packages Directory**: [http://localhost:3000/safaris](http://localhost:3000/safaris)
* **Destinations Guide**: [http://localhost:3000/destinations](http://localhost:3000/destinations)
* **Safari Experiences**: [http://localhost:3000/experiences](http://localhost:3000/experiences)
* **Photo Gallery**: [http://localhost:3000/gallery](http://localhost:3000/gallery)
* **Custom Safari Inquiry**: [http://localhost:3000/contact](http://localhost:3000/contact)
* **FAQ Guide**: [http://localhost:3000/faq](http://localhost:3000/faq)

---

## 🏗️ Architecture

```
maltoure/
├── data/
│   └── safari-data.json      # JSON Database: packages, bookings, availability, inquiries
├── public/                    # Frontend Client
│   ├── css/
│   │   ├── style.css          # Premium Safari design system (Serengeti Green, Sunset Gold)
│   │   └── main.css
│   ├── js/
│   │   ├── booking-engine.js  # 7-step booking wizard with live price calculator
│   │   └── main.js            # Sticky navigation, mobile drawer, gallery lightbox
│   ├── images/                # 97 high-resolution wildlife & safari photos + brand logo
│   ├── index.html             # Homepage
│   ├── safaris.html           # Handcrafted safari packages
│   ├── destinations.html      # Serengeti, Ngorongoro, Tarangire, Manyara, Kilimanjaro, Zanzibar
│   ├── booking.html           # Full online booking flow
│   ├── customer.html          # Self-service booking lookup, modification, balance payment
│   ├── admin.html             # Staff portal: bookings management, payments, CSV export
│   ├── about.html             # Malunda Explorers story, team, 4x4 fleet, ethos
│   ├── experiences.html       # Safari travel styles
│   ├── gallery.html           # Wildlife photo gallery
│   ├── contact.html           # Contact form & WhatsApp integration
│   ├── faq.html               # Frequently asked questions & travel advice
│   ├── terms.html             # Terms & Conditions
│   ├── privacy.html           # Privacy Policy
│   └── booking-terms.html     # Booking & Cancellation Terms
├── test/
│   └── booking-system.test.js # Automated test suite (10/10 passing tests)
├── server.js                  # Native Node.js HTTP server & REST API
├── package.json               # Project manifest
└── render.yaml                # Render.com cloud deployment blueprint
```

---

## ⚡ REST API Endpoints

### Public Endpoints:
- `GET /api/packages` — List all safari packages
- `GET /api/destinations` — List all destinations
- `GET /api/availability/check?safari_id=...&travel_date=...&party_size=...` — Live capacity check
- `GET /api/pricing/calculate?safari_id=...&adults=...&children=...&tier=...&extras=...` — Dynamic pricing calculator
- `POST /api/bookings` — Create a new booking (concurrency-safe capacity validation)
- `POST /api/contact` — Submit custom tailor-made safari inquiry

### Customer Self-Service Endpoints:
- `POST /api/bookings/lookup` — Lookup booking by booking reference and customer email
- `POST /api/bookings/modify` — Request date modification
- `POST /api/bookings/cancel` — Request booking cancellation
- `POST /api/bookings/balance-payment` — Pay remaining reservation balance

### Staff Admin Endpoints:
- `POST /api/admin/update-status` — Update booking and payment statuses
- `POST /api/admin/record-payment` — Record manual or offline bank wire payments
- `POST /api/admin/packages` — Create, update, or delete safari packages
- `POST /api/admin/availability` — Configure blackout dates and maximum vehicle capacity
- `POST /api/admin/settings` — Update company contact info and site settings
- `GET /admin/export-csv` — Export all bookings to CSV spreadsheet

---

## 🧪 Automated Testing

Run the test suite against the running server:
```bash
node test/booking-system.test.js
```
All 10 comprehensive tests test pricing rules, capacity constraints, concurrency, customer isolation, and webhook processing.
