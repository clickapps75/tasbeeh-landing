/* ============================================================
   TASBEEH LANDING — GALLERY & LIGHTBOX
   Features: click-to-open, keyboard nav (arrows + Escape),
   touch swipe, lazy loading, smooth transitions,
   focus trap, scroll lock.
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     STATE
  ============================================================ */
  const State = {
    images     : [],   // Array of { src, alt } from gallery items
    current    : 0,    // Currently displayed index
    isOpen     : false,
    touchStartX: 0,
    touchStartY: 0,
  };

  /* ============================================================
     ELEMENT REFS
  ============================================================ */
  const El = {
    lightbox    : null,
    img         : null,
    closeBtn    : null,
    prevBtn     : null,
    nextBtn     : null,
    counterCur  : null,
    counterTotal: null,
    grid        : null,
  };

  /* ============================================================
     INIT
  ============================================================ */
  function init() {
    El.lightbox     = document.getElementById('lightbox');
    El.img          = document.getElementById('lightboxImg');
    El.closeBtn     = document.getElementById('lightboxClose');
    El.prevBtn      = document.getElementById('lightboxPrev');
    El.nextBtn      = document.getElementById('lightboxNext');
    El.counterCur   = document.getElementById('lightboxCurrent');
    El.counterTotal = document.getElementById('lightboxTotal');
    El.grid         = document.getElementById('galleryGrid');

    if (!El.lightbox || !El.grid) return;

    // Build image index from gallery items
    buildImageIndex();

    // Bind gallery item clicks
    bindGalleryItems();

    // Bind lightbox controls
    bindLightboxControls();

    // Bind keyboard navigation
    bindKeyboard();

    // Bind touch swipe
    bindTouchSwipe();

    // Initialize lazy loading for gallery images
    initLazyLoad();
  }

  /* ============================================================
     BUILD IMAGE INDEX
  ============================================================ */
  function buildImageIndex() {
    const items = El.grid.querySelectorAll('.gallery__item');
    State.images = Array.from(items).map(item => ({
      src: item.getAttribute('data-src') || item.querySelector('img')?.src || '',
      alt: item.querySelector('img')?.getAttribute('alt') || 'Screenshot',
    }));

    // Update counter total
    if (El.counterTotal) El.counterTotal.textContent = State.images.length;
  }

  /* ============================================================
     BIND GALLERY ITEM CLICKS
  ============================================================ */
  function bindGalleryItems() {
    El.grid.querySelectorAll('.gallery__item').forEach((item, index) => {
      item.addEventListener('click', () => open(index));

      // Keyboard: Enter / Space opens lightbox
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(index);
        }
      });
    });
  }

  /* ============================================================
     OPEN LIGHTBOX
  ============================================================ */
  function open(index) {
    State.current = index;
    State.isOpen  = true;

    // Show lightbox
    El.lightbox.removeAttribute('hidden');
    El.lightbox.setAttribute('aria-hidden', 'false');

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    // Load image
    loadImage(index);

    // Update counter
    updateCounter();

    // Trap focus inside lightbox
    FocusTrap.activate(El.lightbox);

    // Focus close button
    El.closeBtn?.focus();

    // Announce to screen readers
    announceImage(index);
  }

  /* ============================================================
     CLOSE LIGHTBOX
  ============================================================ */
  function close() {
    State.isOpen = false;

    El.lightbox.setAttribute('hidden', '');
    El.lightbox.setAttribute('aria-hidden', 'true');

    // Restore body scroll
    document.body.style.overflow = '';

    // Release focus trap
    FocusTrap.deactivate();

    // Return focus to the gallery item that was clicked
    const item = El.grid.querySelectorAll('.gallery__item')[State.current];
    item?.focus();
  }

  /* ============================================================
     NAVIGATE
  ============================================================ */
  function goTo(index) {
    // Wrap around
    State.current = (index + State.images.length) % State.images.length;
    loadImage(State.current, true);
    updateCounter();
    announceImage(State.current);
  }

  function goNext() { goTo(State.current + 1); }
  function goPrev() { goTo(State.current - 1); }

  /* ============================================================
     LOAD IMAGE — with transition
  ============================================================ */
  function loadImage(index, animate) {
    if (!El.img || !State.images[index]) return;

    const { src, alt } = State.images[index];

    if (animate) {
      // Fade out → swap → fade in
      El.img.style.opacity    = '0';
      El.img.style.transform  = 'scale(0.96)';
      El.img.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

      setTimeout(() => {
        El.img.src = src;
        El.img.alt = alt;
        El.img.style.opacity   = '1';
        El.img.style.transform = 'scale(1)';
      }, 200);

    } else {
      El.img.src = src;
      El.img.alt = alt;
      El.img.style.opacity   = '1';
      El.img.style.transform = 'scale(1)';
    }
  }

  /* ============================================================
     UPDATE COUNTER
  ============================================================ */
  function updateCounter() {
    if (El.counterCur) El.counterCur.textContent = State.current + 1;
  }

  /* ============================================================
     SCREEN READER ANNOUNCEMENT
  ============================================================ */
  function announceImage(index) {
    const { alt } = State.images[index] || {};
    const lang    = document.documentElement.lang || 'ar';
    const msg     = lang === 'ar'
      ? `صورة ${index + 1} من ${State.images.length}: ${alt}`
      : `Image ${index + 1} of ${State.images.length}: ${alt}`;

    if (window.TasbeehLang) {
      window.TasbeehLang.announceToScreenReader(msg);
    }
  }

  /* ============================================================
     BIND LIGHTBOX CONTROLS
  ============================================================ */
  function bindLightboxControls() {
    // Close button
    El.closeBtn?.addEventListener('click', close);

    // Prev / Next buttons
    El.prevBtn?.addEventListener('click', () => {
      const isRTL = document.dir === 'rtl';
      isRTL ? goNext() : goPrev();
    });

    El.nextBtn?.addEventListener('click', () => {
      const isRTL = document.dir === 'rtl';
      isRTL ? goPrev() : goNext();
    });

    // Click on backdrop to close
    El.lightbox.addEventListener('click', (e) => {
      if (e.target === El.lightbox) close();
    });
  }

  /* ============================================================
     KEYBOARD NAVIGATION
  ============================================================ */
  function bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (!State.isOpen) return;

      const isRTL = document.dir === 'rtl';

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          close();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          isRTL ? goNext() : goPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          isRTL ? goPrev() : goNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          goPrev();
          break;
        case 'ArrowDown':
          e.preventDefault();
          goNext();
          break;
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(State.images.length - 1);
          break;
      }
    });
  }

  /* ============================================================
     TOUCH SWIPE
  ============================================================ */
  function bindTouchSwipe() {
    El.lightbox.addEventListener('touchstart', (e) => {
      State.touchStartX = e.touches[0].clientX;
      State.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    El.lightbox.addEventListener('touchend', (e) => {
      const dx     = State.touchStartX - e.changedTouches[0].clientX;
      const dy     = State.touchStartY - e.changedTouches[0].clientY;
      const isRTL  = document.dir === 'rtl';

      // Only handle horizontal swipes (dy < dx to avoid scroll conflicts)
      if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;

      if ((dx > 0 && !isRTL) || (dx < 0 && isRTL)) {
        goNext();
      } else {
        goPrev();
      }
    }, { passive: true });
  }

  /* ============================================================
     LAZY LOADING — Native + Intersection Observer fallback
  ============================================================ */
  function initLazyLoad() {
    const imgs = El.grid.querySelectorAll('img[loading="lazy"]');

    // Modern browsers handle [loading="lazy"] natively.
    // Observer is a polyfill / enhancement for older ones.
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-lazy-src');
            if (src) {
              img.src = src;
              img.removeAttribute('data-lazy-src');
            }
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '200px' });

      imgs.forEach(img => observer.observe(img));
    }
  }

  /* ============================================================
     FOCUS TRAP — Accessibility
     Keeps keyboard focus inside lightbox while it's open.
  ============================================================ */
  const FocusTrap = {
    element     : null,
    firstFocusable: null,
    lastFocusable : null,
    handler     : null,

    activate(container) {
      this.element = container;
      const focusable = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      this.firstFocusable = focusable[0];
      this.lastFocusable  = focusable[focusable.length - 1];

      this.handler = (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === this.firstFocusable) {
            e.preventDefault();
            this.lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === this.lastFocusable) {
            e.preventDefault();
            this.firstFocusable?.focus();
          }
        }
      };

      document.addEventListener('keydown', this.handler);
    },

    deactivate() {
      if (this.handler) {
        document.removeEventListener('keydown', this.handler);
        this.handler = null;
      }
      this.element = null;
    }
  };

  /* ============================================================
     DOM READY
  ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ============================================================
     PUBLIC API
  ============================================================ */
  window.TasbeehGallery = { open, close, goTo, goNext, goPrev };

})();
