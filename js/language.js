/* ============================================================
   TASBEEH LANDING — LANGUAGE SYSTEM
   Instant bilingual switching: Arabic ↔ English
   No page reload. RTL/LTR toggle. localStorage persistence.
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     CONFIGURATION
  ============================================================ */
  const CONFIG = {
    defaultLang : 'ar',
    storageKey  : 'tasbeeh_lang',
    transitionMs: 200,    // cross-fade duration in ms
    rtlLangs    : ['ar'], // languages that require RTL
  };

  /* ============================================================
     STATE
  ============================================================ */
  let currentLang = CONFIG.defaultLang;

  /* ============================================================
     CORE: Detect saved or browser preference
  ============================================================ */
  function detectInitialLanguage() {
    // 1. Check localStorage for user's explicit choice
    const saved = localStorage.getItem(CONFIG.storageKey);
    if (saved === 'ar' || saved === 'en') return saved;

    // 2. Check browser language preference
    const browser = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (browser.startsWith('ar')) return 'ar';

    // 3. Default
    return CONFIG.defaultLang;
  }

  /* ============================================================
     CORE: Apply language to the entire document
  ============================================================ */
  function applyLanguage(lang, animate) {
    const isRTL = CONFIG.rtlLangs.includes(lang);
    const body  = document.body;
    const html  = document.documentElement;

    // --- Document-level attributes ---
    html.setAttribute('lang', lang);
    html.setAttribute('dir',  isRTL ? 'rtl' : 'ltr');

    // --- Body classes ---
    body.classList.remove('lang-ar', 'lang-en');
    body.classList.add('lang-' + lang);

    // --- Cross-fade transition ---
    if (animate) {
      body.style.opacity = '0';
      body.style.transition = `opacity ${CONFIG.transitionMs}ms ease`;

      setTimeout(() => {
        translateAllElements(lang);
        body.style.opacity = '1';

        // Clean up inline transition after it plays
        setTimeout(() => {
          body.style.transition = '';
          body.style.opacity    = '';
        }, CONFIG.transitionMs + 50);

      }, CONFIG.transitionMs);

    } else {
      translateAllElements(lang);
    }

    // --- Update toggle button label ---
    updateToggleLabel(lang);

    // --- Update <title> ---
    updatePageTitle(lang);

    // --- Update <meta description> ---
    updateMetaDescription(lang);

    // --- Update page direction attribute on nav ---
    const nav = document.getElementById('nav');
    if (nav) nav.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

    // --- Persist choice ---
    localStorage.setItem(CONFIG.storageKey, lang);
    currentLang = lang;

    // --- Dispatch custom event for other scripts ---
    window.dispatchEvent(new CustomEvent('langChange', { detail: { lang, isRTL } }));
  }

  /* ============================================================
     CORE: Walk all [data-ar] / [data-en] elements and swap text
  ============================================================ */
  function translateAllElements(lang) {
    // Query all elements that have translation attributes
    const elements = document.querySelectorAll('[data-ar], [data-en]');

    elements.forEach(el => {
      const text = el.getAttribute('data-' + lang);
      if (text === null || text === undefined) return;

      // Determine node type and update correctly
      if (isInputOrButton(el)) {
        // For inputs: update placeholder or value
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else {
          // Button / anchor — update text content but preserve child elements (icons)
          setTextPreservingChildren(el, text);
        }
      } else if (el.tagName === 'META') {
        // Meta tags: update content attribute
        el.setAttribute('content', text);
      } else {
        // Generic elements: update text content, preserve child SVGs/images
        setTextPreservingChildren(el, text);
      }

      // Update aria-label if element has one (for screen readers)
      if (el.hasAttribute('aria-label') && el.hasAttribute('data-' + lang + '-aria')) {
        el.setAttribute('aria-label', el.getAttribute('data-' + lang + '-aria'));
      }
    });

    // Translate any elements using [data-i18n] key-based system (fallback)
    translateI18nKeys(lang);
  }

  /* ============================================================
     HELPER: Update text content while preserving child elements
     (e.g., SVG icons inside buttons must not be removed)
  ============================================================ */
  function setTextPreservingChildren(el, newText) {
    // Collect non-text child nodes (SVGs, imgs, spans with classes)
    const preserved = [];
    el.childNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        preserved.push({ node, nextSibling: node.nextSibling });
      }
    });

    // Clear and set text
    el.textContent = newText;

    // Re-insert preserved elements in their original relative positions
    // (simple strategy: prepend SVG icons, append everything else)
    preserved.forEach(({ node }) => {
      if (node.tagName === 'SVG' || node.classList?.contains('btn__icon')) {
        el.insertBefore(node, el.firstChild);
      }
    });
  }

  /* ============================================================
     HELPER: Check if element is a form control
  ============================================================ */
  function isInputOrButton(el) {
    return ['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(el.tagName);
  }

  /* ============================================================
     HELPER: Key-based translations (for dynamic content)
  ============================================================ */
  const TRANSLATIONS = {
    ar: {
      // Toast messages
      'toast.copied'         : 'تم نسخ الرابط!',
      'toast.share_success'  : 'تم الفتح في التطبيق',
      // Share modal
      'share.title'          : 'شارك تسبيح',
      'share.subtitle'       : 'شارك التطبيق مع من تحب',
      'share.copy_label'     : 'نسخ الرابط',
      'share.copied_label'   : 'تم النسخ! ✓',
      // Phone mockup info labels
      'screen.counter'       : 'عداد التسبيح',
      'screen.morning'       : 'أذكار الصباح',
      'screen.evening'       : 'أذكار المساء',
      'screen.prayer'        : 'أوقات الصلاة',
      'screen.stats'         : 'الإحصائيات',
      'screen.counter_sub'   : 'انقر لتعدّ — بسيط وأنيق',
      'screen.morning_sub'   : 'أذكار الصباح كاملةً',
      'screen.evening_sub'   : 'أذكار المساء كاملةً',
      'screen.prayer_sub'    : 'مواقيت دقيقة بموقعك',
      'screen.stats_sub'     : 'رحلتك الروحية يوماً بيوم',
    },
    en: {
      'toast.copied'         : 'Link copied!',
      'toast.share_success'  : 'Opened in app',
      'share.title'          : 'Share Tasbeeh',
      'share.subtitle'       : 'Share the app with someone you love',
      'share.copy_label'     : 'Copy Link',
      'share.copied_label'   : 'Copied! ✓',
      'screen.counter'       : 'Tasbeeh Counter',
      'screen.morning'       : 'Morning Azkar',
      'screen.evening'       : 'Evening Azkar',
      'screen.prayer'        : 'Prayer Times',
      'screen.stats'         : 'Statistics',
      'screen.counter_sub'   : 'Tap to count — simple and elegant',
      'screen.morning_sub'   : 'Complete morning supplications',
      'screen.evening_sub'   : 'Complete evening supplications',
      'screen.prayer_sub'    : 'Accurate times by your location',
      'screen.stats_sub'     : 'Your spiritual journey, day by day',
    }
  };

  function translateI18nKeys(lang) {
    const dict = TRANSLATIONS[lang] || {};
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });
  }

  /* ============================================================
     PUBLIC: Get a translation string by key
  ============================================================ */
  function t(key) {
    return (TRANSLATIONS[currentLang] || {})[key] || key;
  }

  /* ============================================================
     UI: Update the toggle button label
  ============================================================ */
  function updateToggleLabel(lang) {
    // The label shows the OTHER language (the one you'd switch TO)
    const labelEl = document.querySelector('.lang-toggle__label');
    if (!labelEl) return;
    labelEl.textContent = lang === 'ar' ? 'EN' : 'AR';
  }

  /* ============================================================
     SEO: Update <title> dynamically
  ============================================================ */
  function updatePageTitle(lang) {
    const titles = {
      ar: 'تسبيح | Tasbeeh — سبحتك وأذكارك معك في كل مكان',
      en: 'Tasbeeh | تسبيح — Your Tasbeeh & Azkar, Wherever You Are',
    };
    document.title = titles[lang] || document.title;
  }

  /* ============================================================
     SEO: Update meta description
  ============================================================ */
  function updateMetaDescription(lang) {
    const descs = {
      ar: 'تسبيح — تطبيق إسلامي أنيق لعداد التسبيح والأذكار وأوقات الصلاة. مجاني، بدون إعلانات، يعمل بدون إنترنت.',
      en: 'Tasbeeh — an elegant Islamic app for dhikr counter, morning/evening azkar, prayer times, and daily goals. Free, works offline.',
    };
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', descs[lang] || '');

    // Also update OG description
    const og = document.querySelector('meta[property="og:description"]');
    if (og) og.setAttribute('content', descs[lang] || '');
  }

  /* ============================================================
     PHONE MOCKUP: Screen info labels change with language
  ============================================================ */
  const SCREEN_INFO = {
    0: { title: 'screen.counter', sub: 'screen.counter_sub' },
    1: { title: 'screen.morning', sub: 'screen.morning_sub' },
    2: { title: 'screen.prayer',  sub: 'screen.prayer_sub'  },
    3: { title: 'screen.stats',   sub: 'screen.stats_sub'   },
    4: { title: 'screen.counter', sub: 'screen.counter_sub' },
  };

  function updateMockupInfo(slideIndex) {
    const info  = SCREEN_INFO[slideIndex] || SCREEN_INFO[0];
    const title = document.querySelector('.mockup__info-title');
    const text  = document.querySelector('.mockup__info-text');
    if (title) title.textContent = t(info.title);
    if (text)  text.textContent  = t(info.sub);
  }

  /* ============================================================
     EVENT: Toggle button click
  ============================================================ */
  function bindToggle() {
    const btn = document.getElementById('langToggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const next = currentLang === 'ar' ? 'en' : 'ar';
      applyLanguage(next, true);

      // Announce change to screen readers
      announceToScreenReader(next === 'ar' ? 'تم التحويل إلى العربية' : 'Switched to English');
    });

    // Keyboard accessibility
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  }

  /* ============================================================
     ACCESSIBILITY: Screen reader announcement
  ============================================================ */
  function announceToScreenReader(message) {
    let announcer = document.getElementById('sr-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    }
    announcer.textContent = '';
    requestAnimationFrame(() => {
      announcer.textContent = message;
    });
  }

  /* ============================================================
     INIT: Run on DOM ready
  ============================================================ */
  function init() {
    const lang = detectInitialLanguage();

    // Apply without animation on first load (no flash)
    applyLanguage(lang, false);

    // Bind the toggle button
    bindToggle();

    // Listen for slide changes to update mockup info text
    window.addEventListener('slideChange', e => {
      updateMockupInfo(e.detail?.index || 0);
    });

    // Initial mockup info text
    updateMockupInfo(0);
  }

  /* ============================================================
     DOM READY
  ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ============================================================
     PUBLIC API — exposed for other scripts
  ============================================================ */
  window.TasbeehLang = {
    get current()     { return currentLang; },
    t,
    apply             : (lang) => applyLanguage(lang, true),
    updateMockupInfo,
    announceToScreenReader,
  };

})();
