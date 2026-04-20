/* ============================================================
   KPM EXPO UNJ — script.js
   Handles: Navbar, AOS, Counter, Filter, Mobile Menu
   ============================================================ */

(function () {
  'use strict';

  /* ── UTILITY ─────────────────────────────────────────────── */

  /**
   * Shorthand querySelectorAll.
   * @param {string} selector
   * @param {Element} [scope=document]
   */
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  /**
   * Shorthand querySelector.
   * @param {string} selector
   * @param {Element} [scope=document]
   */
  const $ = (selector, scope = document) => scope.querySelector(selector);


/* ── 1. NAVBAR SCROLL EFFECT ─────────────────────────────── */
// Gunakan querySelector agar sinkron dengan perintah classList
const navbar = document.querySelector('.navbar'); 

function handleNavbarScroll() {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

// Tambahkan event listener untuk scroll
window.addEventListener('scroll', handleNavbarScroll, { passive: true });

// Jalankan sekali saat halaman pertama kali dibuka untuk cek posisi scroll
handleNavbarScroll();

  /* ── 2. ACTIVE NAV LINK ON SCROLL ───────────────────────── */

  const sections   = $$('section[id]');
  const navLinks   = $$('.nav-link');

  function updateActiveLink() {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });


  /* ── 3. MOBILE HAMBURGER MENU ────────────────────────────── */

  const hamburger = $('#hamburger');
  const navLinksEl = $('#navLinks');

  if (hamburger && navLinksEl) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinksEl.classList.toggle('open');
      // Prevent body scroll when menu is open
      document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu when a nav link is clicked
    $$('.nav-link', navLinksEl).forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinksEl.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }


  /* ── 4. ANIMATE ON SCROLL (custom, no lib) ───────────────── */

  function setupAOS() {
    const items = $$('[data-aos]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          observer.unobserve(entry.target); // animate once
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    });

    items.forEach(item => observer.observe(item));
  }

  setupAOS();


  /* ── 5. COUNTER ANIMATION ────────────────────────────────── */

  /**
   * Animate a number from 0 to `target` over `duration` ms.
   * @param {Element} el
   * @param {number}  target
   * @param {number}  duration
   */
  function animateCounter(el, target, duration = 2000) {
    const start     = performance.now();
    const suffix    = target >= 1000 ? '+' : '+';

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = Math.floor(eased * target);

      el.textContent = value >= 1000
        ? (value / 1000).toFixed(1) + 'k+'
        : value + suffix;

      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  function setupCounters() {
    const counterEls = $$('[data-count]');
    if (!counterEls.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.getAttribute('data-count'), 10);
          animateCounter(entry.target, target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterEls.forEach(el => observer.observe(el));
  }

  setupCounters();


  /* ── 6. SMOOTH SCROLL for anchor links ───────────────────── */

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });


  /* 7. HERO GALLERY SLIDER */

  function setupHeroGallery() {
    const gallery = $('.hero-gallery');
    if (!gallery) return;

    const slides = $$('.hero-gallery-slide', gallery);
    const dots = $$('.hero-gallery-dots button', gallery);
    const prevBtn = $('.hero-gallery-btn--prev', gallery);
    const nextBtn = $('.hero-gallery-btn--next', gallery);
    if (!slides.length) return;

    let current = 0;
    let timer = null;
    const interval = 4500;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === current);
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(() => showSlide(current + 1), interval);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    prevBtn?.addEventListener('click', () => {
      showSlide(current - 1);
      startAutoPlay();
    });

    nextBtn?.addEventListener('click', () => {
      showSlide(current + 1);
      startAutoPlay();
    });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showSlide(i);
        startAutoPlay();
      });
    });

    gallery.addEventListener('mouseenter', stopAutoPlay);
    gallery.addEventListener('mouseleave', startAutoPlay);
    gallery.addEventListener('focusin', stopAutoPlay);
    gallery.addEventListener('focusout', startAutoPlay);

    showSlide(0);
    startAutoPlay();
  }

  /* 8. HERO GALLERY SLIDER */

  function setupHeroGallery() {
    const gallery = $('.hero-gallery');
    if (!gallery) return;

    const slides = $$('.hero-gallery-slide', gallery);
    const dots = $$('.hero-gallery-dots button', gallery);
    const prevBtn = $('.hero-gallery-btn--prev', gallery);
    const nextBtn = $('.hero-gallery-btn--next', gallery);
    if (!slides.length) return;

    let current = 0;
    let timer = null;
    const interval = 4500;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === current);
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(() => showSlide(current + 1), interval);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    prevBtn?.addEventListener('click', () => {
      showSlide(current - 1);
      startAutoPlay();
    });

    nextBtn?.addEventListener('click', () => {
      showSlide(current + 1);
      startAutoPlay();
    });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showSlide(i);
        startAutoPlay();
      });
    });

    gallery.addEventListener('mouseenter', stopAutoPlay);
    gallery.addEventListener('mouseleave', startAutoPlay);
    gallery.addEventListener('focusin', stopAutoPlay);
    gallery.addEventListener('focusout', startAutoPlay);

    showSlide(0);
    startAutoPlay();
  }

  setupHeroGallery();


  /* 9. GALLERY CAROUSEL */

  function setupGalleryCarousel() {
    const carousel = $('#galleryCarousel');
    const slides = $$('.carousel-slide');
    const dots = $$('.carousel-dot');
    const prevBtn = $('.carousel-btn--prev');
    const nextBtn = $('.carousel-btn--next');

    let currentIndex = 0;
    let autoPlayInterval;

    // Show slide by index
    function showSlide(index) {
      // Ensure index wraps around (infinite loop)
      index = (index + slides.length) % slides.length;
      currentIndex = index;

      // Update slides
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });

      // Update dots
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    // Next slide
    function nextSlide() {
      showSlide(currentIndex + 1);
      resetAutoPlay();
    }

    // Previous slide
    function prevSlide() {
      showSlide(currentIndex - 1);
      resetAutoPlay();
    }

    // Auto-play carousel every 4 seconds
    function startAutoPlay() {
      autoPlayInterval = setInterval(() => {
        showSlide(currentIndex + 1);
      }, 4000);
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    // Event listeners
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Dot navigation
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showSlide(i);
        resetAutoPlay();
      });
    });

    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    // Keyboard navigation (arrow keys)
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    });

    // Initialize
    showSlide(0);
    startAutoPlay();
  }

  setupGalleryCarousel();


  /* ── 10. TIMELINE CARDS ─────────────────────────────────── */

  function setupTimelineCards() {
    const track = $('#timelineCardsTrack');
    if (!track) return;

    const cards = $$('.timeline-card', track);
    if (!cards.length) return;

    function setFocusedCard() {
      const trackRect = track.getBoundingClientRect();
      const centerX = trackRect.left + trackRect.width / 2;

      let closest = null;
      let minDistance = Infinity;

      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(centerX - cardCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closest = card;
        }
      });

      cards.forEach(card => card.classList.remove('is-focused'));
      closest?.classList.add('is-focused');
    }

    let isPointerDown = false;
    let startX = 0;
    let startScrollLeft = 0;

    track.addEventListener('pointerdown', e => {
      isPointerDown = true;
      startX = e.clientX;
      startScrollLeft = track.scrollLeft;
      track.setPointerCapture?.(e.pointerId);
    });

    track.addEventListener('pointermove', e => {
      if (!isPointerDown) return;
      const delta = e.clientX - startX;
      track.scrollLeft = startScrollLeft - delta;
    });

    function stopPointerDrag(e) {
      if (!isPointerDown) return;
      isPointerDown = false;
      track.releasePointerCapture?.(e.pointerId);
      setFocusedCard();
    }

    track.addEventListener('pointerup', stopPointerDrag);
    track.addEventListener('pointercancel', stopPointerDrag);
    track.addEventListener('pointerleave', stopPointerDrag);

    track.addEventListener('scroll', () => {
      window.requestAnimationFrame(setFocusedCard);
    }, { passive: true });

    window.addEventListener('resize', setFocusedCard);

    // Initial focus
    setFocusedCard();
  }

  setupTimelineCards();


  /* ── 10. PARALLAX (subtle hero blobs) ───────────────────── */

  function setupParallax() {
    const blobs = $$('.hero-blob');
    if (!blobs.length) return;

    window.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      blobs.forEach((blob, i) => {
        const factor = (i + 1) * 0.4;
        blob.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    }, { passive: true });
  }

  setupParallax();


  /* ── 11. KEYBOARD NAV (Escape to close menu) ─────────────── */

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      // Close mobile nav
      if (navLinksEl?.classList.contains('open')) {
        hamburger?.classList.remove('active');
        navLinksEl.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });


  /* ── END ─────────────────────────────────────────────────── */
  console.log('%c KPM EXPO UNJ 2025 ','background:#667eea;color:#fff;padding:4px 8px;border-radius:6px;font-weight:bold;', '— Frontend loaded ✓');

})();
