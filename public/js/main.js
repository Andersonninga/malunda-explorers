/**
 * Malunda Explorers - Main Frontend JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const siteNav = document.getElementById('siteNav');

  if (mobileToggle && siteNav) {
    mobileToggle.addEventListener('click', () => {
      siteNav.classList.toggle('open');
      const isOpen = siteNav.classList.contains('open');
      mobileToggle.innerHTML = isOpen ? '✕' : '☰';
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // 2. Sticky Header Scroll Effect
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    });
  }

  // 3. FAQ Accordion Toggle
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.faq-item');
      if (parent) {
        const isOpen = parent.classList.contains('open');
        // Close other FAQs in the same group if desired, or keep toggleable
        parent.classList.toggle('open', !isOpen);
      }
    });
  });

  // 4. Gallery Filter & Lightbox
  const filterTabs = document.querySelectorAll('.filter-tab');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  if (filterTabs.length > 0 && galleryItems.length > 0) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const category = tab.getAttribute('data-filter');

        galleryItems.forEach(item => {
          const itemCat = item.getAttribute('data-category');
          if (category === 'all' || itemCat === category) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    // Lightbox Open
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const caption = item.getAttribute('data-title') || img?.alt || 'Tanzania Safari';
        if (lightboxModal && lightboxImg) {
          lightboxImg.src = img.src;
          if (lightboxCaption) lightboxCaption.textContent = caption;
          lightboxModal.classList.add('active');
        }
      });
    });

    // Lightbox Close
    if (lightboxClose && lightboxModal) {
      lightboxClose.addEventListener('click', () => {
        lightboxModal.classList.remove('active');
      });
      lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
          lightboxModal.classList.remove('active');
        }
      });
    }
  }

  // 5. Quick Search Widget Handler
  const quickSearchForm = document.getElementById('quickSafariSearchForm');
  if (quickSearchForm) {
    quickSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const dest = document.getElementById('searchDestination')?.value || '';
      const style = document.getElementById('searchStyle')?.value || '';
      const duration = document.getElementById('searchDuration')?.value || '';
      const travelers = document.getElementById('searchTravelers')?.value || '2';
      const date = document.getElementById('searchDate')?.value || '';

      const params = new URLSearchParams();
      if (dest) params.set('dest', dest);
      if (style) params.set('style', style);
      if (duration) params.set('duration', duration);
      if (travelers) params.set('travelers', travelers);
      if (date) params.set('date', date);

      window.location.href = `/booking/?${params.toString()}`;
    });
  }
});
