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

  const navbar = $('#navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // run once on load


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


  /* ── 6. EVENT CATEGORY FILTER ────────────────────────────── */

  const filterBtns = $$('.filter-btn');
  const eventCards = $$('.event-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter cards with fade effect
      eventCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const show = filter === 'all' || category === filter;

        if (show) {
          card.style.opacity   = '0';
          card.style.transform = 'translateY(16px)';
          card.classList.remove('hidden');

          // Small timeout for smooth reveal after unhiding
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
              card.style.opacity    = '1';
              card.style.transform  = 'translateY(0)';
            });
          });
        } else {
          card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          card.style.opacity    = '0';
          card.style.transform  = 'translateY(8px)';

          setTimeout(() => card.classList.add('hidden'), 250);
        }
      });
    });
  });


  /* ── 7. SMOOTH SCROLL for anchor links ───────────────────── */

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



  /* 9. GALLERY LIGHTBOX (simple) */
  function setupGalleryLightbox() {
    const galleryItems = $$('.gallery-item');

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'galleryOverlay';
    Object.assign(overlay.style, {
      display:        'none',
      position:       'fixed',
      inset:          '0',
      background:     'rgba(0,0,0,0.88)',
      zIndex:         '9999',
      alignItems:     'center',
      justifyContent: 'center',
      cursor:         'pointer',
      backdropFilter: 'blur(8px)',
    });

    const overlayContent = document.createElement('div');
    Object.assign(overlayContent.style, {
      background:   'var(--clr-bg-card)',
      borderRadius: '16px',
      border:       '1px solid rgba(255,255,255,0.1)',
      padding:      '2rem',
      maxWidth:     '600px',
      width:        '90%',
      textAlign:    'center',
    });

    const overlayEmoji = document.createElement('div');
    overlayEmoji.style.fontSize = '80px';
    overlayEmoji.style.marginBottom = '1rem';

    const overlayLabel = document.createElement('p');
    overlayLabel.style.color     = 'var(--clr-text-secondary)';
    overlayLabel.style.fontSize  = '1rem';

    const closeHint = document.createElement('p');
    closeHint.textContent        = 'Klik mana saja untuk menutup';
    closeHint.style.color        = 'var(--clr-text-muted)';
    closeHint.style.fontSize     = '0.75rem';
    closeHint.style.marginTop    = '1rem';

    overlayContent.append(overlayEmoji, overlayLabel, closeHint);
    overlay.appendChild(overlayContent);
    document.body.appendChild(overlay);

    // Open lightbox
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const emoji    = item.querySelector('.gallery-placeholder')?.textContent.trim() || '🖼️';
        const label    = item.querySelector('.gallery-label')?.textContent.trim() || '';
        overlayEmoji.textContent = emoji;
        overlayLabel.textContent = label;
        overlay.style.display   = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });

    // Close lightbox
    overlay.addEventListener('click', () => {
      overlay.style.display        = 'none';
      document.body.style.overflow = '';
    });
  }

  setupGalleryLightbox();


  /* ── 9. CTA EMAIL FORM ────────────────────────────────────── */

  function setupCTAForm() {
    const input  = $('.cta-input');
    const btnCTA = input?.closest('div')?.querySelector('.btn-primary');
    if (!input || !btnCTA) return;

    btnCTA.addEventListener('click', () => {
      const email = input.value.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        // Shake animation
        input.style.borderColor = 'rgba(250, 112, 154, 0.7)';
        input.style.animation   = 'none';

        setTimeout(() => {
          input.style.borderColor = '';
        }, 2000);

        showToast('Masukkan email yang valid!', 'error');
        return;
      }

      showToast(`✅ Berhasil! Cek inbox ${email}`, 'success');
      input.value = '';
    });
  }

  setupCTAForm();


  /* ── 10. TOAST NOTIFICATION ──────────────────────────────── */

  function showToast(message, type = 'success') {
    // Remove existing toast
    const existing = $('#kpm-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'kpm-toast';
    toast.textContent = message;

    const colors = {
      success: { bg: 'rgba(67, 233, 123, 0.12)', border: 'rgba(67, 233, 123, 0.3)', color: '#43e97b' },
      error:   { bg: 'rgba(250, 112, 154, 0.12)', border: 'rgba(250, 112, 154, 0.3)', color: '#fa709a' },
    };

    const c = colors[type] || colors.success;

    Object.assign(toast.style, {
      position:     'fixed',
      bottom:       '2rem',
      right:        '2rem',
      padding:      '0.85rem 1.5rem',
      borderRadius: '12px',
      background:   c.bg,
      border:       `1px solid ${c.border}`,
      color:        c.color,
      fontWeight:   '600',
      fontSize:     '0.875rem',
      zIndex:       '10000',
      backdropFilter: 'blur(12px)',
      transition:   'all 0.3s ease',
      transform:    'translateY(16px)',
      opacity:      '0',
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity   = '1';
      });
    });

    setTimeout(() => {
      toast.style.transform = 'translateY(16px)';
      toast.style.opacity   = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }


  /* ── 11. PARALLAX (subtle hero blobs) ───────────────────── */

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


  /* ── 12. PAGE LOAD ANIMATION ─────────────────────────────── */

  function setupPageLoad() {
    document.body.style.opacity   = '0';
    document.body.style.transform = 'translateY(8px)';
    document.body.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

    window.addEventListener('load', () => {
      document.body.style.opacity   = '1';
      document.body.style.transform = 'translateY(0)';
    });
  }

  setupPageLoad();


  /* ── 13. KEYBOARD NAV (Escape to close menu) ─────────────── */

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      // Close mobile nav
      if (navLinksEl?.classList.contains('open')) {
        hamburger?.classList.remove('active');
        navLinksEl.classList.remove('open');
        document.body.style.overflow = '';
      }
      // Close gallery overlay
      const overlay = $('#galleryOverlay');
      if (overlay?.style.display === 'flex') {
        overlay.style.display        = 'none';
        document.body.style.overflow = '';
      }
    }
  });


  /* ── END ─────────────────────────────────────────────────── */
  console.log('%c KPM EXPO UNJ 2025 ','background:#667eea;color:#fff;padding:4px 8px;border-radius:6px;font-weight:bold;', '— Frontend loaded ✓');

})();
