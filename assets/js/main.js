/* ============================================================
   KPM EXPO UNJ — script.js
   Handles: Navbar, mobile menu, smooth scroll, hero slider, timeline, AOS
   ============================================================ */

(function () {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  /* ── 0. LANGUAGE TOGGLE (ID <-> EN) ─────────────────────── */
  function setupLanguageToggle() {
    const langToggle = $('#lang-toggle');
    if (!langToggle) return;

    const translatableElements = $$('[data-id][data-en]');

    function applyLanguage(lang) {
      const safeLang = lang === 'en' ? 'en' : 'id';

      translatableElements.forEach((element) => {
        const translatedText = element.dataset[safeLang];
        if (typeof translatedText !== 'string') return;

        if (element.tagName === 'META') {
          element.setAttribute('content', translatedText);
          return;
        }

        element.textContent = translatedText;
      });

      document.documentElement.lang = safeLang;
      langToggle.textContent = safeLang === 'id' ? 'EN' : 'ID';
      langToggle.setAttribute(
        'aria-label',
        safeLang === 'id' ? 'Switch language to English' : 'Ganti bahasa ke Indonesia'
      );

      try {
        localStorage.setItem('lang', safeLang);
      } catch (_) {
        // Ignore localStorage write failures (private mode/restricted environments).
      }
    }

    let currentLang = 'id';
    try {
      const savedLang = localStorage.getItem('lang');
      if (savedLang === 'id' || savedLang === 'en') {
        currentLang = savedLang;
      }
    } catch (_) {
      currentLang = 'id';
    }

    applyLanguage(currentLang);

    langToggle.addEventListener('click', () => {
      currentLang = currentLang === 'id' ? 'en' : 'id';
      applyLanguage(currentLang);
    });
  }

  setupLanguageToggle();

  /* ── 1. NAVBAR SCROLL EFFECT ─────────────────────────────── */
  const navbar = $('.navbar');

  function handleNavbarScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 36);
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  /* ── 2. ACTIVE NAV LINK ON SCROLL ───────────────────────── */
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');

  function updateActiveLink() {
    if (!sections.length || !navLinks.length) return;

    const scrollPos = window.scrollY + 120;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  /* ── 3. MOBILE HAMBURGER MENU ───────────────────────────── */
  const hamburger = $('#hamburger');
  const navLinksEl = $('#navLinks');

  if (hamburger && navLinksEl) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinksEl.classList.toggle('open');
      document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
    });

    $$('.nav-link', navLinksEl).forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinksEl.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinksEl?.classList.contains('open')) {
      hamburger?.classList.remove('active');
      navLinksEl.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* ── 4. AOS (LIGHTWEIGHT) ───────────────────────────────── */
  function setupAOS() {
    const items = $$('[data-aos]');
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('aos-animate');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    items.forEach((item) => observer.observe(item));
  }

  setupAOS();

  /* ── 5. SMOOTH SCROLL FOR ANCHOR LINKS ──────────────────── */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = $(targetId);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ── 6. HERO GALLERY SLIDER ─────────────────────────────── */
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
    const interval = 4800;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === current);
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }

    function stopAutoPlay() {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(() => showSlide(current + 1), interval);
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

  /* ── 7. TIMELINE CARDS SCROLL FOCUS ─────────────────────── */
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

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(centerX - cardCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closest = card;
        }
      });

      cards.forEach((card) => card.classList.remove('is-focused'));
      closest?.classList.add('is-focused');
    }

    let isPointerDown = false;
    let startX = 0;
    let startScrollLeft = 0;

    track.addEventListener('pointerdown', (e) => {
      isPointerDown = true;
      startX = e.clientX;
      startScrollLeft = track.scrollLeft;
      track.setPointerCapture?.(e.pointerId);
    });

    track.addEventListener('pointermove', (e) => {
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

    track.addEventListener(
      'scroll',
      () => {
        window.requestAnimationFrame(setFocusedCard);
      },
      { passive: true }
    );

    window.addEventListener('resize', setFocusedCard);
    setFocusedCard();
  }

  // setupTimelineCards(); // Timeline is temporarily hidden

  /* ── 8. PARALLAX (SUBTLE HERO BLOBS) ────────────────────── */
  function setupParallax() {
    const blobs = $$('.hero-blob');
    if (!blobs.length) return;

    window.addEventListener(
      'mousemove',
      (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 16;
        const y = (e.clientY / window.innerHeight - 0.5) * 16;

        blobs.forEach((blob, i) => {
          const factor = (i + 1) * 0.35;
          blob.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
      },
      { passive: true }
    );
  }

  setupParallax();
})();
