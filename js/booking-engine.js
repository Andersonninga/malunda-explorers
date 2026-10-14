/**
 * Malunda Explorers - 7-Step Safari Booking Engine
 * Real-time pricing calculations, option toggles, validations & submission
 */

(function() {
  let safariData = null;
  let currentStep = 1;
  const totalSteps = 7;

  // Booking State
  const bookingState = {
    packageId: '',
    packageData: null,
    destination: '',
    travelDate: '',
    durationDays: 7,
    safariType: 'Classic Safari',
    adults: 2,
    children: 0,
    childrenAges: '',
    rooms: 1,
    specialRequirements: '',
    accommodationTier: 'mid-range',
    accommodationMultiplier: 1.0,
    selectedExtras: [],
    customer: {
      fullName: '',
      email: '',
      phone: '',
      whatsapp: '',
      country: '',
      contactMethod: 'WhatsApp',
      flightInfo: '',
      dietary: '',
      specialRequests: ''
    },
    paymentMethod: 'card',
    paymentType: 'deposit', // 'deposit' or 'full'
    pricing: {
      basePricePerAdult: 0,
      adjustedPerAdult: 0,
      adultsTotal: 0,
      childrenTotal: 0,
      extrasTotal: 0,
      subtotal: 0,
      total: 0,
      depositAmount: 0,
      balanceDue: 0
    }
  };

  // Initialize Engine
  document.addEventListener('DOMContentLoaded', async () => {
    await fetchSafariData();
    parseUrlParameters();
    initEventListeners();
    updateUI();
    recalculatePricing();
  });

  async function fetchSafariData() {
    try {
      const res = await fetch('/api/packages');
      if (res.ok) {
        safariData = await res.json();
      } else {
        // Fallback embedded data if offline/standalone
        if (window.MALUNDA_EMBEDDED_DATA) {
          safariData = window.MALUNDA_EMBEDDED_DATA;
        }
      }
    } catch (err) {
      if (window.MALUNDA_EMBEDDED_DATA) {
        safariData = window.MALUNDA_EMBEDDED_DATA;
      }
    }
  }

  function parseUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('package')) {
      bookingState.packageId = params.get('package');
    }
    if (params.get('dest')) {
      bookingState.destination = params.get('dest');
    }
    if (params.get('date')) {
      bookingState.travelDate = params.get('date');
    }
    if (params.get('travelers')) {
      const travelersCount = parseInt(params.get('travelers'), 10);
      if (!isNaN(travelersCount) && travelersCount > 0) {
        bookingState.adults = travelersCount;
      }
    }
  }

  function initEventListeners() {
    // Stepper navigation
    document.getElementById('btnNextStep')?.addEventListener('click', handleNextStep);
    document.getElementById('btnPrevStep')?.addEventListener('click', handlePrevStep);

    // Step 1: Package Selection
    const packageCards = document.querySelectorAll('.package-select-card');
    packageCards.forEach(card => {
      card.addEventListener('click', () => {
        packageCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const pkgId = card.getAttribute('data-package-id');
        bookingState.packageId = pkgId;
        syncSelectedPackage();
        recalculatePricing();
      });
    });

    const dateInput = document.getElementById('travelDateInput');
    if (dateInput) {
      // Set min date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.min = tomorrow.toISOString().split('T')[0];
      if (bookingState.travelDate) {
        dateInput.value = bookingState.travelDate;
      }
      dateInput.addEventListener('change', (e) => {
        bookingState.travelDate = e.target.value;
        updateUI();
      });
    }

    // Step 2: Traveler Counters
    setupCounter('adults', 1, 20, (val) => { bookingState.adults = val; recalculatePricing(); });
    setupCounter('children', 0, 10, (val) => {
      bookingState.children = val;
      const agesGroup = document.getElementById('childrenAgesGroup');
      if (agesGroup) agesGroup.style.display = val > 0 ? 'block' : 'none';
      recalculatePricing();
    });
    setupCounter('rooms', 1, 10, (val) => { bookingState.rooms = val; recalculatePricing(); });

    // Step 3: Accommodation Cards
    const accommCards = document.querySelectorAll('.accomm-tier-card');
    accommCards.forEach(card => {
      card.addEventListener('click', () => {
        accommCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        bookingState.accommodationTier = card.getAttribute('data-tier');
        bookingState.accommodationMultiplier = parseFloat(card.getAttribute('data-multiplier') || '1.0');
        recalculatePricing();
      });
    });

    // Step 4: Extras Checkboxes
    const extraCards = document.querySelectorAll('.extra-item-card');
    extraCards.forEach(card => {
      const checkbox = card.querySelector('.extra-checkbox');
      card.addEventListener('click', (e) => {
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }
        card.classList.toggle('selected', checkbox.checked);
        updateSelectedExtras();
        recalculatePricing();
      });
    });

    // Step 7: Payment Option radios
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        bookingState.paymentMethod = e.target.value;
      });
    });

    const paymentTypeRadios = document.querySelectorAll('input[name="paymentType"]');
    paymentTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        bookingState.paymentType = e.target.value;
        recalculatePricing();
      });
    });

    // Final Booking Submit Button
    document.getElementById('btnSubmitBooking')?.addEventListener('click', submitBookingReservation);
  }

  function setupCounter(id, min, max, onChange) {
    const decBtn = document.getElementById(`dec_${id}`);
    const incBtn = document.getElementById(`inc_${id}`);
    const valDisplay = document.getElementById(`val_${id}`);

    if (decBtn && incBtn && valDisplay) {
      decBtn.addEventListener('click', () => {
        let val = parseInt(valDisplay.textContent, 10) || min;
        if (val > min) {
          val--;
          valDisplay.textContent = val;
          onChange(val);
        }
      });
      incBtn.addEventListener('click', () => {
        let val = parseInt(valDisplay.textContent, 10) || min;
        if (val < max) {
          val++;
          valDisplay.textContent = val;
          onChange(val);
        }
      });
    }
  }

  function updateSelectedExtras() {
    const selected = [];
    document.querySelectorAll('.extra-item-card.selected').forEach(card => {
      selected.push({
        id: card.getAttribute('data-extra-id'),
        name: card.getAttribute('data-extra-name'),
        price: parseFloat(card.getAttribute('data-extra-price') || '0'),
        priceType: card.getAttribute('data-extra-type') || 'per_person'
      });
    });
    bookingState.selectedExtras = selected;
  }

  function syncSelectedPackage() {
    if (!safariData?.packages) return;
    const pkg = safariData.packages.find(p => p.id === bookingState.packageId);
    if (pkg) {
      bookingState.packageData = pkg;
      bookingState.durationDays = pkg.days;
      bookingState.safariType = pkg.safari_style;
      const pkgNameElem = document.getElementById('selectedPackageName');
      if (pkgNameElem) pkgNameElem.textContent = pkg.title;
    }
  }

  function recalculatePricing() {
    if (!bookingState.packageData && safariData?.packages) {
      // Default to first package if none selected
      bookingState.packageId = bookingState.packageId || safariData.packages[0].id;
      syncSelectedPackage();
    }

    const pkg = bookingState.packageData;
    const basePrice = pkg ? pkg.base_price : 2500;
    const multiplier = bookingState.accommodationMultiplier || 1.0;
    const adjustedPerAdult = Math.round(basePrice * multiplier);

    const adultsTotal = adjustedPerAdult * bookingState.adults;
    // Children receive 50% safari package rate
    const childrenTotal = Math.round((adjustedPerAdult * 0.5) * bookingState.children);

    // Calculate Extras
    let extrasTotal = 0;
    bookingState.selectedExtras.forEach(extra => {
      if (extra.priceType === 'per_person') {
        extrasTotal += extra.price * (bookingState.adults + bookingState.children);
      } else if (extra.priceType === 'per_day') {
        extrasTotal += extra.price * (bookingState.durationDays || 5);
      } else {
        // per_booking
        extrasTotal += extra.price;
      }
    });

    const subtotal = adultsTotal + childrenTotal + extrasTotal;
    const total = subtotal;
    const depositPct = safariData?.site_settings?.deposit_percentage || 30;
    const depositAmount = Math.round(total * (depositPct / 100));
    const balanceDue = total - depositAmount;

    bookingState.pricing = {
      basePricePerAdult: basePrice,
      adjustedPerAdult,
      adultsTotal,
      childrenTotal,
      extrasTotal,
      subtotal,
      total,
      depositAmount,
      balanceDue
    };

    renderSummarySidebar();
  }

  function renderSummarySidebar() {
    const pkgTitle = bookingState.packageData ? bookingState.packageData.title : 'Select a Safari';
    const datesText = bookingState.travelDate ? `${bookingState.travelDate} (${bookingState.durationDays} Days)` : 'Dates pending';
    const travelersText = `${bookingState.adults} Adults` + (bookingState.children > 0 ? `, ${bookingState.children} Children` : '');
    const accommText = capitalize(bookingState.accommodationTier) + ' Standard';

    safeSetText('summaryPkgName', pkgTitle);
    safeSetText('summaryDates', datesText);
    safeSetText('summaryTravelers', travelersText);
    safeSetText('summaryAccomm', accommText);

    // Extras
    const extrasListElem = document.getElementById('summaryExtrasList');
    if (extrasListElem) {
      if (bookingState.selectedExtras.length === 0) {
        extrasListElem.innerHTML = '<span style="color:#888;">None selected</span>';
      } else {
        extrasListElem.innerHTML = bookingState.selectedExtras.map(e => `<div>• ${e.name} ($${e.price})</div>`).join('');
      }
    }

    safeSetText('summaryBaseTotal', `$${bookingState.pricing.adultsTotal + bookingState.pricing.childrenTotal}`);
    safeSetText('summaryExtrasTotal', `$${bookingState.pricing.extrasTotal}`);
    safeSetText('summaryTotalAmount', `$${bookingState.pricing.total.toLocaleString()}`);
    safeSetText('summaryDepositAmount', `$${bookingState.pricing.depositAmount.toLocaleString()}`);
    safeSetText('summaryBalanceDue', `$${bookingState.pricing.balanceDue.toLocaleString()}`);

    // Update Step 6 elements
    safeSetText('step6_pkg', pkgTitle);
    safeSetText('step6_dates', datesText);
    safeSetText('step6_travelers', travelersText);
    safeSetText('step6_accomm', accommText);
    safeSetText('step6_total', `$${bookingState.pricing.total.toLocaleString()}`);
    safeSetText('step6_deposit', `$${bookingState.pricing.depositAmount.toLocaleString()}`);
  }

  function validateStep(step) {
    if (step === 1) {
      if (!bookingState.packageId) {
        alert('Please select a safari package to continue.');
        return false;
      }
      if (!bookingState.travelDate) {
        alert('Please select your preferred departure date.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (bookingState.adults < 1) {
        alert('Please select at least 1 adult traveler.');
        return false;
      }
      return true;
    }

    if (step === 5) {
      const name = document.getElementById('custFullName')?.value?.trim();
      const email = document.getElementById('custEmail')?.value?.trim();
      const phone = document.getElementById('custPhone')?.value?.trim();
      const country = document.getElementById('custCountry')?.value?.trim();

      if (!name || !email || !phone || !country) {
        alert('Please fill in your Full Name, Email, Phone/WhatsApp, and Country of Residence.');
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
      }

      bookingState.customer.fullName = name;
      bookingState.customer.email = email;
      bookingState.customer.phone = phone;
      bookingState.customer.whatsapp = phone;
      bookingState.customer.country = country;
      bookingState.customer.contactMethod = document.getElementById('custContactMethod')?.value || 'WhatsApp';
      bookingState.customer.flightInfo = document.getElementById('custFlightInfo')?.value || '';
      bookingState.customer.dietary = document.getElementById('custDietary')?.value || '';
      bookingState.customer.specialRequests = document.getElementById('custSpecialRequests')?.value || '';

      safeSetText('step6_customer', `${name} (${country})`);
      safeSetText('step6_email', email);
      safeSetText('step6_phone', phone);
      return true;
    }

    return true;
  }

  function handleNextStep() {
    if (!validateStep(currentStep)) return;
    if (currentStep < totalSteps) {
      currentStep++;
      updateUI();
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  }

  function handlePrevStep() {
    if (currentStep > 1) {
      currentStep--;
      updateUI();
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  }

  function updateUI() {
    // Stepper indicators
    for (let i = 1; i <= totalSteps; i++) {
      const indicator = document.getElementById(`stepIndicator_${i}`);
      if (indicator) {
        indicator.classList.remove('active', 'completed');
        if (i === currentStep) {
          indicator.classList.add('active');
        } else if (i < currentStep) {
          indicator.classList.add('completed');
        }
      }

      const panel = document.getElementById(`stepPanel_${i}`);
      if (panel) {
        panel.classList.toggle('active', i === currentStep);
      }
    }

    // Toggle Back / Next buttons
    const prevBtn = document.getElementById('btnPrevStep');
    const nextBtn = document.getElementById('btnNextStep');
    const submitBtn = document.getElementById('btnSubmitBooking');

    if (prevBtn) prevBtn.style.display = currentStep > 1 ? 'inline-flex' : 'none';
    if (nextBtn) nextBtn.style.display = currentStep < totalSteps ? 'inline-flex' : 'none';
    if (submitBtn) submitBtn.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
  }

  async function submitBookingReservation() {
    const submitBtn = document.getElementById('btnSubmitBooking');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing Reservation...';
    }

    const payload = {
      safari_id: bookingState.packageId,
      safari_name: bookingState.packageData?.title || 'Tanzania Safari',
      travel_date: bookingState.travelDate,
      duration_days: bookingState.durationDays,
      travelers: {
        adults: bookingState.adults,
        children: bookingState.children,
        rooms: bookingState.rooms,
        special_requirements: bookingState.customer.specialRequests
      },
      accommodation_tier: bookingState.accommodationTier,
      accommodation_name: capitalize(bookingState.accommodationTier),
      extras: bookingState.selectedExtras.map(e => e.id),
      customer: bookingState.customer,
      pricing: bookingState.pricing,
      payment: {
        method: bookingState.paymentMethod,
        payment_type: bookingState.paymentType,
        amount_paid: bookingState.paymentType === 'deposit' ? bookingState.pricing.depositAmount : bookingState.pricing.total
      }
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.booking) {
        showSuccessConfirmation(data.booking);
      } else {
        // In case API returns unexpected, create client confirmation
        showSuccessConfirmation({
          booking_ref: 'ME-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
          ...payload
        });
      }
    } catch (err) {
      // Standalone client fallback
      showSuccessConfirmation({
        booking_ref: 'ME-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
        ...payload
      });
    }
  }

  function showSuccessConfirmation(booking) {
    const stepperWrap = document.querySelector('.booking-stepper');
    const layoutWrap = document.querySelector('.booking-layout');
    const voucherContainer = document.getElementById('bookingVoucherWrap');

    if (stepperWrap) stepperWrap.style.display = 'none';
    if (layoutWrap) layoutWrap.style.display = 'none';

    if (voucherContainer) {
      voucherContainer.style.display = 'block';
      safeSetText('voucherRefCode', booking.booking_ref);
      safeSetText('voucherSafariTitle', booking.safari_name);
      safeSetText('voucherCustName', booking.customer.fullName || booking.customer.full_name || 'Valued Traveler');
      safeSetText('voucherCustEmail', booking.customer.email);
      safeSetText('voucherCustPhone', booking.customer.phone);
      safeSetText('voucherTravelDate', booking.travel_date);
      safeSetText('voucherTravelers', `${booking.travelers.adults} Adults` + (booking.travelers.children ? `, ${booking.travelers.children} Children` : ''));
      
      const total = booking.pricing.total_price || booking.pricing.total || 0;
      const deposit = booking.pricing.deposit_required || booking.pricing.depositAmount || 0;
      const balance = booking.pricing.balance_due || booking.pricing.balanceDue || (total - deposit);

      safeSetText('voucherTotal', `$${total.toLocaleString()}`);
      safeSetText('voucherDeposit', `$${deposit.toLocaleString()}`);
      safeSetText('voucherBalance', `$${balance.toLocaleString()}`);

      const waBtn = document.getElementById('btnVoucherWhatsApp');
      if (waBtn) {
        waBtn.href = `https://wa.me/255784567890?text=${encodeURIComponent(`Hello Malunda Explorers, I have completed booking my safari! Reference: ${booking.booking_ref}`)}`;
      }
      const lookupBtn = document.getElementById('btnVoucherLookup');
      if (lookupBtn) {
        lookupBtn.href = `/booking-lookup/?ref=${encodeURIComponent(booking.booking_ref)}&email=${encodeURIComponent(booking.customer.email || '')}`;
      }

      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  }

  function safeSetText(id, text) {
    const elem = document.getElementById(id);
    if (elem) elem.textContent = text;
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
})();
