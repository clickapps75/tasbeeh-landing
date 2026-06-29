/* ============================================================
   TASBEEH LANDING — MAIN APP SCRIPT
   Handles: Loader, Navigation, Scroll Reveal, Stats Counter,
            Button Ripple, Custom Cursor, Scroll Progress,
            Phone Mockup Carousel, Mobile Menu
   Vanilla JS only — no frameworks, no jQuery.
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. LOADER
     Hides the splash screen after page assets are ready.
  ============================================================ */
  const Loader = {
    el: null,

    init() {
      this.el = document.getElementById('loader');
      if (!this.el) return;

      // Hide after fonts + images settle, but cap at 2.5s
      const hide = () => this.hide();
      window.addEventListener('load', () => setTimeout(hide, 400));
      setTimeout(hide, 2500); // Fallback
    },

    hide() {
      if (!this.el || this.el.classList.contains('hidden')) return;
      this.el.classList.add('hidden');
      document.body.classList.add('page-ready');

      // Trigger hero entrance animations
      RevealObserver.triggerHero();
    }
  };

  /* ============================================================
     2. NAVIGATION
     - Scroll state (transparent → glass)
     - Mobile menu toggle
     - Active link highlighting
     - Smooth scroll for anchor links
  ============================================================ */
  const Navigation = {
    nav       : null,
    hamburger : null,
    mobileMenu: null,
    lastScroll: 0,

    init() {
      this.nav        = document.getElementById('nav');
      this.hamburger  = document.getElementById('menuToggle');
      this.mobileMenu = document.getElementById('mobileMenu');
      if (!this.nav) return;

      this.bindScroll();
      this.bindMobileMenu();
      this.bindSmoothScroll();
      this.bindActiveLinks();
    },

    bindScroll() {
      const onScroll = throttle(() => {
        const scrollY = window.scrollY;

        // Add glass effect once user scrolls past hero
        if (scrollY > 60) {
          this.nav.classList.add('scrolled');
        } else {
          this.nav.classList.remove('scrolled');
        }

        this.lastScroll = scrollY;
      }, 16); // ~60fps

      window.addEventListener('scroll', onScroll, { passive: true });

      // Run once immediately
      onScroll();
    },

    bindMobileMenu() {
      if (!this.hamburger || !this.mobileMenu) return;

      this.hamburger.addEventListener('click', () => {
        const isOpen = this.mobileMenu.classList.contains('open');
        this.toggleMenu(!isOpen);
      });

      // Close on mobile link click
      this.mobileMenu.querySelectorAll('.nav__mobile-link, .nav__mobile-cta').forEach(link => {
        link.addEventListener('click', () => this.toggleMenu(false));
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!this.nav.contains(e.target)) {
          this.toggleMenu(false);
        }
      });

      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.toggleMenu(false);
      });
    },

    toggleMenu(open) {
      this.mobileMenu.classList.toggle('open', open);
      this.hamburger.setAttribute('aria-expanded', open);
      this.mobileMenu.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
    },

    bindSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const target = document.querySelector(anchor.getAttribute('href'));
          if (!target) return;
          e.preventDefault();

          const navH   = parseInt(getComputedStyle(document.documentElement)
                          .getPropertyValue('--nav-h')) || 72;
          const top    = target.getBoundingClientRect().top + window.scrollY - navH - 16;

          window.scrollTo({ top, behavior: 'smooth' });

          // Close mobile menu if open
          this.toggleMenu(false);

          // Update URL without jumping
          history.pushState(null, '', anchor.getAttribute('href'));
        });
      });
    },

    bindActiveLinks() {
      const links    = document.querySelectorAll('.nav__link');
      const sections = document.querySelectorAll('section[id]');
      if (!sections.length || !links.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach(link => {
              const isActive = link.getAttribute('href') === '#' + id;
              link.classList.toggle('active', isActive);
            });
          }
        });
      }, { rootMargin: '-40% 0px -55% 0px' });

      sections.forEach(s => observer.observe(s));
    }
  };

  /* ============================================================
     3. SCROLL REVEAL
     Uses IntersectionObserver to animate elements as they
     enter the viewport. Respects prefers-reduced-motion.
  ============================================================ */
  const RevealObserver = {
    observer: null,
    prefersReduced: false,

    init() {
      this.prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const options = {
        root      : null,
        rootMargin: '0px 0px -60px 0px',
        threshold : 0.08,
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animate(entry.target);
            this.observer.unobserve(entry.target); // animate once
          }
        });
      }, options);

      // Observe all reveal elements
      const targets = document.querySelectorAll(
        '.reveal-up, .reveal-fade, .reveal-scale, ' +
        '.reveal-left, .reveal-right, .reveal-card'
      );

      // Skip hero elements — they're handled separately
      targets.forEach(el => {
        if (!el.closest('.hero')) {
          this.observer.observe(el);
        }
      });

      // Feature cards: stagger by grid position
      this.staggerGrid('.features__grid', '.feature-card');
      this.staggerGrid('.reviews__grid',  '.review-card');
      this.staggerGrid('.gallery__grid',  '.gallery__item');
    },

    animate(el) {
      if (this.prefersReduced) {
        // Just show it, no animation
        el.style.opacity  = '1';
        el.style.transform = 'none';
        return;
      }
      el.classList.add('animated');
    },

    // Trigger hero elements manually (after loader hides)
    triggerHero() {
      const heroEls = document.querySelectorAll('.hero .reveal-up, .hero .reveal-fade, .hero .reveal-scale');
      heroEls.forEach((el, i) => {
        setTimeout(() => this.animate(el), i * 80);
      });
    },

    // Apply incremental delay to a grid of cards
    staggerGrid(gridSel, itemSel) {
      const grid = document.querySelector(gridSel);
      if (!grid) return;

      grid.querySelectorAll(itemSel).forEach((item, i) => {
        const delay = Math.min(i * 65, 540); // cap at 540ms
        item.style.animationDelay = delay + 'ms';
      });
    }
  };

  /* ============================================================
     4. SCROLL PROGRESS BAR
     A thin line at the very top showing reading progress.
  ============================================================ */
  const ScrollProgress = {
    bar: null,

    init() {
      // Create element
      this.bar = document.createElement('div');
      this.bar.id = 'scrollProgress';
      this.bar.setAttribute('aria-hidden', 'true');
      document.body.prepend(this.bar);

      window.addEventListener('scroll', throttle(() => this.update(), 16), { passive: true });
    },

    update() {
      const scrollTop  = window.scrollY;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      this.bar.style.width = Math.min(progress, 100) + '%';
    }
  };

  /* ============================================================
     5. ANIMATED STATS COUNTER
     Numbers count up when section enters viewport.
  ============================================================ */
  const StatsCounter = {
    init() {
      const statsSection = document.querySelector('.stats');
      if (!statsSection) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.runAll();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      observer.observe(statsSection);
    },

    runAll() {
      document.querySelectorAll('.stat').forEach(stat => {
        const valueEl  = stat.querySelector('.stat__value');
        const numberEl = stat.querySelector('.stat__number');
        if (!valueEl || !numberEl) return;

        const target   = parseInt(valueEl.getAttribute('data-target'), 10);
        if (isNaN(target)) return;

        // Reduced motion: just show the number
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          numberEl.textContent = target;
          return;
        }

        this.count(numberEl, target);
      });
    },

    count(el, target) {
      const duration = 1800; // ms
      const start    = performance.now();
      const from     = 0;

      // Easing: ease-out cubic
      const easeOut = t => 1 - Math.pow(1 - t, 3);

      const step = (now) => {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = easeOut(progress);
        const value    = Math.round(from + (target - from) * eased);

        el.textContent = value;
        el.closest('.stat').classList.add('counting');

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
          el.closest('.stat').classList.remove('counting');
        }
      };

      requestAnimationFrame(step);
    }
  };

  /* ============================================================
     6. BUTTON RIPPLE EFFECT
     Injects a ripple span at click position inside every .btn
  ============================================================ */
  const ButtonRipple = {
    init() {
      // Use event delegation on the document
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn:not(:disabled)');
        if (!btn) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        this.createRipple(btn, e);
      });
    },

    createRipple(btn, event) {
      // Remove existing ripples
      btn.querySelectorAll('.ripple-effect').forEach(r => r.remove());

      const rect   = btn.getBoundingClientRect();
      const x      = event.clientX - rect.left;
      const y      = event.clientY - rect.top;
      const ripple = document.createElement('span');

      ripple.className = 'ripple-effect';
      ripple.style.cssText = `left:${x}px; top:${y}px;`;

      btn.appendChild(ripple);

      // Clean up after animation
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    }
  };

  /* ============================================================
     7. CUSTOM CURSOR DOT
     A subtle dot that follows the mouse on desktop.
  ============================================================ */
  const CursorDot = {
    dot   : null,
    mouseX: 0,
    mouseY: 0,
    dotX  : 0,
    dotY  : 0,
    active: false,

    init() {
      // Only on non-touch devices
      if (window.matchMedia('(pointer: coarse)').matches) return;

      this.dot = document.getElementById('cursorDot');
      if (!this.dot) {
        this.dot = document.createElement('div');
        this.dot.id = 'cursorDot';
        this.dot.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.dot);
      }

      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        if (!this.active) {
          this.active = true;
          this.dot.classList.add('visible');
          this.loop();
        }
      });

      // Expand on interactive elements
      const interactives = 'a, button, [role="button"], .gallery__item, .feature-card';
      document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactives)) {
          this.dot.classList.add('expanded');
        }
      });

      document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactives)) {
          this.dot.classList.remove('expanded');
        }
      });

      // Hide when cursor leaves window
      document.addEventListener('mouseleave', () => this.dot.classList.remove('visible'));
      document.addEventListener('mouseenter', () => this.dot.classList.add('visible'));
    },

    loop() {
      // Lerp for smooth trailing effect
      this.dotX += (this.mouseX - this.dotX) * 0.18;
      this.dotY += (this.mouseY - this.dotY) * 0.18;
      this.dot.style.left = this.dotX + 'px';
      this.dot.style.top  = this.dotY + 'px';
      requestAnimationFrame(() => this.loop());
    }
  };

  /* ============================================================
     8. PHONE MOCKUP CAROUSEL
     Auto-plays every 4s. Manual swipe support. Dot indicators.
     Dispatches 'slideChange' event for language.js to update info.
  ============================================================ */
  const PhoneCarousel = {
    slides      : null,
    dots        : null,
    current     : 0,
    total       : 0,
    autoInterval: null,
    startX      : 0,
    isDragging  : false,

    // Info labels for each slide (keys map to TasbeehLang.t())
    SLIDE_INFO: [
      { title: 'screen.counter', sub: 'screen.counter_sub' },
      { title: 'screen.morning', sub: 'screen.morning_sub' },
      { title: 'screen.evening', sub: 'screen.evening_sub' },
      { title: 'screen.prayer',  sub: 'screen.prayer_sub'  },
      { title: 'screen.stats',   sub: 'screen.stats_sub'   },
      { title: 'screen.counter', sub: 'screen.counter_sub' },
      { title: 'screen.counter', sub: 'screen.counter_sub' },
      { title: 'screen.counter', sub: 'screen.counter_sub' },
    ],

    init() {
      this.slides = document.getElementById('phoneSlides');
      this.dots   = document.querySelectorAll('.phone__dot');
      if (!this.slides) return;

      this.total = this.slides.children.length;

      // Dot clicks
      this.dots.forEach((dot, i) => {
        dot.addEventListener('click', () => this.goTo(i));
      });

      // Touch / mouse swipe on phone screen
      const screen = document.querySelector('.phone__screen');
      if (screen) {
        screen.addEventListener('touchstart',  e => this.onDragStart(e), { passive: true });
        screen.addEventListener('touchend',    e => this.onDragEnd(e),   { passive: true });
        screen.addEventListener('mousedown',   e => this.onDragStart(e));
        screen.addEventListener('mouseup',     e => this.onDragEnd(e));
      }

      this.startAuto();
    },

    goTo(index) {
      this.current = (index + this.total) % this.total;

      // Slide the strip
      this.slides.style.transform = `translateX(${this.current * -100 * (document.dir === 'rtl' ? -1 : 1)}%)`;

      // Update dots
      this.dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === this.current);
        dot.setAttribute('aria-selected', i === this.current);
      });

      // Notify language.js of slide change
      window.dispatchEvent(new CustomEvent('slideChange', {
        detail: { index: this.current }
      }));
    },

    next() { this.goTo(this.current + 1); },
    prev() { this.goTo(this.current - 1); },

    startAuto() {
      this.stopAuto();
      this.autoInterval = setInterval(() => this.next(), 4000);
    },

    stopAuto() {
      clearInterval(this.autoInterval);
    },

    onDragStart(e) {
      this.startX    = e.touches ? e.touches[0].clientX : e.clientX;
      this.isDragging = true;
      this.stopAuto();
    },

    onDragEnd(e) {
      if (!this.isDragging) return;
      const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const diff  = this.startX - endX;
      const isRTL = document.dir === 'rtl';

      if (Math.abs(diff) > 40) {
        // Swipe threshold: 40px
        if ((diff > 0 && !isRTL) || (diff < 0 && isRTL)) {
          this.next();
        } else {
          this.prev();
        }
      }

      this.isDragging = false;
      this.startAuto();
    }
  };

  /* ============================================================
     9. PARALLAX — Hero Background
     Subtle depth on the hero bg image as user scrolls.
  ============================================================ */
  const Parallax = {
    heroImg: null,

    init() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.heroImg = document.querySelector('.hero__bg-image');
      if (!this.heroImg) return;

      window.addEventListener('scroll', throttle(() => this.update(), 16), { passive: true });
    },

    update() {
      const scrollY = window.scrollY;
      const heroH   = document.querySelector('.hero')?.offsetHeight || 0;
      if (scrollY > heroH) return;

      const shift = scrollY * 0.25; // 25% parallax ratio
      this.heroImg.style.transform = `scale(1.08) translateY(${shift}px)`;
    }
  };

  /* ============================================================
     10. INTERSECTION OBSERVER — Section Entrance Classes
     Adds .in-view to sections for CSS targeting.
  ============================================================ */
  const SectionObserver = {
    init() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          entry.target.classList.toggle('in-view', entry.isIntersecting);
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.section').forEach(s => observer.observe(s));
    }
  };

  /* ============================================================
     11. IMAGE LAZY LOAD — Fallback placeholder
     Handles loading states for screenshots.
  ============================================================ */
  const LazyImages = {
    init() {
      // Add skeleton class while images load
      document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        if (!img.complete) {
          img.closest('.gallery__item, .phone__slide')
            ?.classList.add('skeleton');
        }

        img.addEventListener('load', () => {
          img.closest('.gallery__item, .phone__slide')
            ?.classList.remove('skeleton');
          img.style.opacity = '0';
          requestAnimationFrame(() => {
            img.style.transition = 'opacity 0.4s ease';
            img.style.opacity = '1';
          });
        });

        // If image already cached and loaded
        if (img.complete) {
          img.closest('.gallery__item, .phone__slide')
            ?.classList.remove('skeleton');
        }
      });
    }
  };

  /* ============================================================
     12. SCROLL TO TOP (appears after scrolling down)
  ============================================================ */
  const ScrollToTop = {
    btn: null,

    init() {
      this.btn = document.createElement('button');
      this.btn.id               = 'scrollTop';
      this.btn.className        = 'scroll-top-btn';
      this.btn.setAttribute('aria-label', 'Scroll to top');
      this.btn.innerHTML        = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>`;
      this.btn.style.cssText    = `
        position:fixed; bottom:24px; inset-inline-end:24px;
        width:48px; height:48px; border-radius:50%;
        background:var(--clr-primary); color:#fff;
        display:flex; align-items:center; justify-content:center;
        box-shadow:var(--shadow-primary); z-index:500;
        opacity:0; pointer-events:none;
        transition:opacity 0.3s, transform 0.3s var(--ease-spring);
        transform:translateY(8px);
        border:none; cursor:pointer;
      `;

      document.body.appendChild(this.btn);

      this.btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      window.addEventListener('scroll', throttle(() => {
        const show = window.scrollY > 600;
        this.btn.style.opacity       = show ? '1' : '0';
        this.btn.style.pointerEvents = show ? 'auto' : 'none';
        this.btn.style.transform     = show ? 'translateY(0)' : 'translateY(8px)';
      }, 100), { passive: true });
    }
  };

  /* ============================================================
     UTILITIES
  ============================================================ */

  // Throttle: limits function calls to once per `limit` ms
  function throttle(fn, limit) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= limit) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  /* ============================================================
     INIT — Bootstrap all modules after DOM is ready
  ============================================================ */
  function init() {
    Loader.init();
    Navigation.init();
    RevealObserver.init();
    ScrollProgress.init();
    StatsCounter.init();
    ButtonRipple.init();
    CursorDot.init();
    PhoneCarousel.init();
    Parallax.init();
    SectionObserver.init();
    LazyImages.init();
    ScrollToTop.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ============================================================
     PUBLIC API
  ============================================================ */
  window.TasbeehApp = {
    PhoneCarousel,
    RevealObserver,
    StatsCounter,
  };

})();
