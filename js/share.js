/* ============================================================
   TASBEEH LANDING — SHARE SYSTEM
   Uses Web Share API when available (mobile).
   Falls back to platform deep-links and clipboard copy.
   Shows a beautiful share modal on desktop.
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     SHARE DATA
  ============================================================ */
  const SHARE_DATA = {
    ar: {
      title: 'تسبيح — تطبيق إسلامي للذكر والأذكار',
      text : 'جرّب تطبيق تسبيح! عداد تسبيح إلكتروني، أذكار الصباح والمساء، أوقات الصلاة — مجاناً وبدون إعلانات.',
    },
    en: {
      title: 'Tasbeeh — Islamic Dhikr & Azkar App',
      text : 'Try Tasbeeh! An elegant app with a dhikr counter, morning/evening azkar, prayer times — free and ad-free.',
    },
    url: 'https://play.google.com/store/apps/details?id=com.tasbeeh.tasbeeh_app',
    apk: 'https://github.com/clickapps75/Tasbeeh/releases/download/1.0.8/app-release.apk',
  };

  /* ============================================================
     STATE
  ============================================================ */
  const State = {
    modalOpen: false,
  };

  /* ============================================================
     ELEMENT REFS
  ============================================================ */
  const El = {
    modal      : null,
    backdrop   : null,
    closeBtn   : null,
    btnShare1  : null,  // Hero share button
    btnShare2  : null,  // CTA share button
    whatsapp   : null,
    telegram   : null,
    twitter    : null,
    copy       : null,
    copyLabel  : null,
    toast      : null,
    toastText  : null,
  };

  /* ============================================================
     INIT
  ============================================================ */
  function init() {
    El.modal     = document.getElementById('shareModal');
    El.backdrop  = document.getElementById('shareBackdrop');
    El.closeBtn  = document.getElementById('shareModalClose');
    El.btnShare1 = document.getElementById('shareBtn');
    El.btnShare2 = document.getElementById('shareBtn2');
    El.whatsapp  = document.getElementById('shareWhatsApp');
    El.telegram  = document.getElementById('shareTelegram');
    El.twitter   = document.getElementById('shareTwitter');
    El.copy      = document.getElementById('shareCopy');
    El.copyLabel = document.getElementById('copyLabel');
    El.toast     = document.getElementById('toast');
    El.toastText = document.getElementById('toastText');

    if (!El.modal) return;

    bindShareButtons();
    bindModalControls();
    bindPlatformButtons();
  }

  /* ============================================================
     BIND SHARE TRIGGER BUTTONS
  ============================================================ */
  function bindShareButtons() {
    [El.btnShare1, El.btnShare2].forEach(btn => {
      if (!btn) return;
      btn.addEventListener('click', () => handleShare());
    });
  }

  /* ============================================================
     HANDLE SHARE — Web Share API or Modal fallback
  ============================================================ */
  async function handleShare() {
    const lang   = window.TasbeehLang?.current || 'ar';
    const data   = buildShareData(lang);

    // Try native Web Share API first (works great on mobile)
    if (navigator.share && navigator.canShare && navigator.canShare(data)) {
      try {
        await navigator.share(data);
        return; // Success — no need to show modal
      } catch (err) {
        // User cancelled or error — fall through to modal
        if (err.name === 'AbortError') return; // User cancelled, don't show modal
      }
    }

    // Fall back to custom share modal
    openModal();
  }

  /* ============================================================
     BUILD SHARE DATA
  ============================================================ */
  function buildShareData(lang) {
    const strings = SHARE_DATA[lang] || SHARE_DATA.ar;
    return {
      title: strings.title,
      text : strings.text,
      url  : SHARE_DATA.url,
    };
  }

  /* ============================================================
     MODAL: Open / Close
  ============================================================ */
  function openModal() {
    if (!El.modal) return;
    State.modalOpen = true;

    El.modal.removeAttribute('hidden');
    El.modal.setAttribute('aria-hidden', 'false');

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    // Focus first interactive element
    requestAnimationFrame(() => {
      El.whatsapp?.focus();
    });

    // Trap focus
    FocusTrap.activate(El.modal);
  }

  function closeModal() {
    if (!El.modal) return;
    State.modalOpen = false;

    El.modal.setAttribute('hidden', '');
    El.modal.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = '';
    FocusTrap.deactivate();

    // Return focus to trigger button
    El.btnShare1?.focus();
  }

  /* ============================================================
     BIND MODAL CONTROLS
  ============================================================ */
  function bindModalControls() {
    // Close button
    El.closeBtn?.addEventListener('click', closeModal);

    // Backdrop click
    El.backdrop?.addEventListener('click', closeModal);

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && State.modalOpen) closeModal();
    });
  }

  /* ============================================================
     BIND PLATFORM BUTTONS
  ============================================================ */
  function bindPlatformButtons() {
    const lang = () => window.TasbeehLang?.current || 'ar';

    // WhatsApp
    El.whatsapp?.addEventListener('click', () => {
      const strings = SHARE_DATA[lang()] || SHARE_DATA.ar;
      const message = encodeURIComponent(`${strings.text}\n${SHARE_DATA.url}`);
      openLink(`https://wa.me/?text=${message}`);
      closeModal();
    });

    // Telegram
    El.telegram?.addEventListener('click', () => {
      const strings = SHARE_DATA[lang()] || SHARE_DATA.ar;
      const text    = encodeURIComponent(strings.text);
      const url     = encodeURIComponent(SHARE_DATA.url);
      openLink(`https://t.me/share/url?url=${url}&text=${text}`);
      closeModal();
    });

    // Twitter / X
    El.twitter?.addEventListener('click', () => {
      const strings = SHARE_DATA[lang()] || SHARE_DATA.ar;
      const text    = encodeURIComponent(`${strings.text} ${SHARE_DATA.url}`);
      openLink(`https://twitter.com/intent/tweet?text=${text}`);
      closeModal();
    });

    // Copy link
    El.copy?.addEventListener('click', () => {
      copyToClipboard(SHARE_DATA.url);
    });
  }

  /* ============================================================
     COPY TO CLIPBOARD
  ============================================================ */
  async function copyToClipboard(text) {
    let success = false;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      } else {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        success = document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch (err) {
      console.warn('Copy failed:', err);
    }

    if (success) {
      // Update copy button label temporarily
      const lang       = window.TasbeehLang?.current || 'ar';
      const copiedText = lang === 'ar' ? 'تم النسخ! ✓' : 'Copied! ✓';
      const origText   = lang === 'ar' ? 'نسخ الرابط' : 'Copy Link';

      if (El.copyLabel) {
        El.copyLabel.textContent = copiedText;
        setTimeout(() => { El.copyLabel.textContent = origText; }, 2500);
      }

      // Show toast
      const toastMsg = lang === 'ar' ? 'تم نسخ الرابط!' : 'Link copied!';
      showToast(toastMsg);

      closeModal();
    }
  }

  /* ============================================================
     OPEN EXTERNAL LINK (in new tab)
  ============================================================ */
  function openLink(url) {
    const a = document.createElement('a');
    a.href     = url;
    a.target   = '_blank';
    a.rel      = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* ============================================================
     TOAST NOTIFICATION
     Shows a brief success/info message at bottom of screen.
  ============================================================ */
  let toastTimeout = null;

  function showToast(message, duration) {
    if (!El.toast || !El.toastText) return;
    duration = duration || 2800;

    // Cancel existing toast
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      El.toast.setAttribute('hidden', '');
    }

    El.toastText.textContent = message;
    El.toast.removeAttribute('hidden');

    // Re-trigger animation
    El.toast.style.animation = 'none';
    El.toast.getBoundingClientRect(); // Force reflow
    El.toast.style.animation = '';

    toastTimeout = setTimeout(() => {
      // Fade out
      El.toast.style.animation = `toastOut 300ms var(--ease-out) forwards`;
      setTimeout(() => {
        El.toast.setAttribute('hidden', '');
        El.toast.style.animation = '';
      }, 300);
    }, duration);
  }

  /* ============================================================
     FOCUS TRAP (same pattern as gallery.js)
  ============================================================ */
  const FocusTrap = {
    handler: null,

    activate(container) {
      const focusable = Array.from(container.querySelectorAll(
        'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'
      ));
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      this.handler = (e) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
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
  window.TasbeehShare = { openModal, closeModal, showToast, copyToClipboard };

})();
