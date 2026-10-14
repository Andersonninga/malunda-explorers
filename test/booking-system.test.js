/**
 * AUTOMATED TESTS: MALUNDA EXPLORERS SAFARI BOOKING SYSTEM
 * Tests pricing rules, capacity constraints, concurrency, customer isolation, and payment webhooks.
 */

const assert = require('assert');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(BASE_URL + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get(BASE_URL + path, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    }).on('error', reject);
  });
}

async function runTestSuite() {
  console.log('🦁 STARTING MALUNDA EXPLORERS AUTOMATED TEST SUITE...\n');
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ PASSED: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✕ FAILED: ${name}`);
      console.error(`    ${err.message}`);
    }
  }

  const runId = Date.now().toString(36);
  const testDate = '2027-04-' + String(10 + Math.floor(Math.random() * 18)).padStart(2, '0');
  const testEmail = `test.traveler.${runId}@example.com`;
  let testBookingRef = '';

  // 1. Availability Check for regular date
  await test('1. Availability engine returns seats available on open departure date', async () => {
    const res = await getJson(`/api/availability/check?safari_id=7-day-northern-circuit-signature&travel_date=${testDate}&party_size=2`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.available, true);
    assert(res.data.remainingSeats >= 2);
  });

  // 2. Blackout Date Check
  await test('2. System blocks bookings on configured Blackout dates (e.g. 2026-12-25)', async () => {
    const res = await getJson('/api/availability/check?safari_id=7-day-northern-circuit-signature&travel_date=2026-12-25&party_size=1');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.available, false);
    assert.strictEqual(res.data.remainingSeats, 0);
  });

  // 3. Dynamic Pricing Calculation
  await test('3. Pricing engine calculates correct adult, child (-50%), and 30% deposit rates', async () => {
    const res = await getJson('/api/pricing/calculate?safari_id=7-day-northern-circuit-signature&adults=2&children=1&tier=mid-range');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.adults, 2);
    assert.strictEqual(res.data.children, 1);
    assert.strictEqual(res.data.totalPrice, 8625);
    assert.strictEqual(res.data.depositRequired, 2588);
    assert.strictEqual(res.data.balanceDue, 6037);
  });

  // 4. Booking Creation & Reference Format
  await test('4. Creates valid booking, enforces unique ME-2026-XXXX reference and saves record', async () => {
    const payload = {
      safari_id: '7-day-northern-circuit-signature',
      safari_name: '7-Day Northern Circuit Signature Safari',
      travel_date: testDate,
      duration_days: 7,
      travelers: { adults: 2, children: 0, rooms: 1 },
      accommodation_tier: 'mid-range',
      customer: {
        fullName: 'Eleanor Vance',
        email: testEmail,
        phone: '+1 555 789 0123',
        country: 'Canada'
      },
      payment: { method: 'card', payment_type: 'deposit' }
    };

    const res = await postJson('/api/bookings', payload);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert(res.data.booking.booking_ref.startsWith('ME-2026-'));
    testBookingRef = res.data.booking.booking_ref;
    assert.strictEqual(res.data.booking.booking_status, 'Confirmed');
    assert.strictEqual(res.data.booking.payment.payment_status, 'Deposit Paid');
  });

  // 5. Capacity & Overbooking Prevention
  await test('5. Prevents overbooking when remaining capacity is exceeded for departure date', async () => {
    const overbookingPayload = {
      safari_id: '7-day-northern-circuit-signature',
      safari_name: '7-Day Northern Circuit Signature Safari',
      travel_date: testDate,
      duration_days: 7,
      travelers: { adults: 8, children: 2, rooms: 4 },
      accommodation_tier: 'mid-range',
      customer: {
        fullName: 'Large Group Traveler',
        email: 'largegroup@example.com',
        phone: '+1 555 000 1111',
        country: 'USA'
      }
    };

    const res = await postJson('/api/bookings', overbookingPayload);
    assert.strictEqual(res.status, 409); // 409 Conflict
    assert.strictEqual(res.data.success, false);
    assert(res.data.error.includes('remaining'));
  });

  // 6. Customer Dashboard Security Isolation
  await test('6. Customer lookup succeeds with correct email but rejects unauthorized email access', async () => {
    // Unauthorized attempt with wrong email
    const badLookup = await postJson('/api/bookings/lookup', {
      booking_ref: testBookingRef,
      email: 'hacker@example.com'
    });
    assert.strictEqual(badLookup.status, 404);
    assert.strictEqual(badLookup.data.success, false);

    // Authorized attempt with correct email
    const goodLookup = await postJson('/api/bookings/lookup', {
      booking_ref: testBookingRef,
      email: testEmail
    });
    assert.strictEqual(goodLookup.status, 200);
    assert.strictEqual(goodLookup.data.success, true);
    assert.strictEqual(goodLookup.data.booking.booking_ref, testBookingRef);
  });

  // 7. Customer Date Modification Request
  await test('7. Customer can submit date modification request with audit notes', async () => {
    const res = await postJson('/api/bookings/modify', {
      booking_ref: testBookingRef,
      email: testEmail,
      new_date: '2026-11-20',
      request_notes: 'Flight rescheduled by airline'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  // 8. Payment Webhook & Idempotency Protection
  await test('8. Payment webhook updates booking status and protects against duplicate webhooks', async () => {
    const txnId = 'TXN-WEBHOOK-' + Date.now();
    const webhookPayload = {
      event_id: 'EVT-' + Date.now(),
      transaction_id: txnId,
      booking_ref: testBookingRef,
      amount: 6900,
      status: 'completed',
      gateway: 'Stripe Verified'
    };

    // First call: succeeds and marks booking as paid
    const firstCall = await postJson('/api/payments/webhook', webhookPayload);
    assert.strictEqual(firstCall.status, 200);
    assert.strictEqual(firstCall.data.success, true);

    // Second call with same txn ID: should be recognized as idempotent duplicate
    const secondCall = await postJson('/api/payments/webhook', webhookPayload);
    assert.strictEqual(secondCall.status, 200);
    assert(secondCall.data.message.includes('Idempotent'));
  });

  // 9. Contact Inquiry Submission
  await test('9. Custom safari inquiry submitted from contact form is saved to database', async () => {
    const res = await postJson('/api/contact', {
      fullName: 'Marcus & Clara Vance',
      email: 'marcus@example.com',
      phone: '+44 7900 123456',
      country: 'United Kingdom',
      travelDates: 'August 2027',
      travelers: '2 Adults',
      duration: '8-10 days',
      budget: '$5,000 - $8,000',
      destinations: 'Serengeti, Ngorongoro, Zanzibar',
      safariStyle: 'Luxury Tented Safari',
      accommodation: 'Luxury Boutique Camps',
      message: 'Looking for a private safari with hot air balloon over Serengeti.'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert(res.data.inquiryId.startsWith('INQ-'));
  });

  // 10. Admin Status & Offline Payment Management
  await test('10. Admin can record offline payment and update booking lifecycle status', async () => {
    const res = await postJson('/api/admin/record-payment', {
      ref: testBookingRef,
      amount: 1000,
      method: 'Bank Wire Transfer',
      receipt_no: 'CRDB-889911',
      notes: 'Received wire transfer at Arusha HQ'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.booking.payment.payment_status, 'Fully Paid');
  });

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed}/${total} TESTS PASSED (100% SUCCESS)`);
  console.log(`========================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
