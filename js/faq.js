/* ============================================================
   TASBEEH LANDING — FAQ ACCORDION
   Smooth height-based animation (not display:none toggle).
   Full keyboard accessibility. ARIA expanded states.
   Only one item open at a time (configurable).
   ============================================================ */

(function () {
  'use strict';

  /* ============================================================
     CONFIGURATION
  ============================================================ */
  const CONFIG = {
    allowMultiple: false,   // false = close others when one opens
    animationMs  : 380,     // transition duration in ms
    easing       : 'cubic-bezier(0.16, 1, 0.3, 1)',
  };

  /* ============================================================
     STATE
  ============================================================ */
  let items = [];

  /* ============================================================
     INIT
  ============================================================ */
  function init() {
    const list = document.getElementById('faqList');
    if (!list) return;

    items = Array.from(list.querySelectorAll('.faq__item'));
    if (!items.length) return;

    items.forEach((item, index) => setupItem(item, index));
  }

  /* ============================================================
     SETUP ITEM
     Restructures each FAQ item for animation:
     .faq__answer (hidden) wraps .faq__answer-inner (animated)
  ============================================================ */
  function setupItem(item, index) {
    const question = item.querySelector('.faq__question');
    const answer   = item.querySelector('.faq__answer');
    if (!question || !answer) return;

    // Generate unique IDs
    const questionId = `faq-q-${index}`;
    const answerId   = `faq-a-${index}`;

    question.id                  = questionId;
    answer.id                    = answerId;
    question.setAttribute('aria-controls',     answerId);
    question.setAttribute('aria-expanded',     'false');
    answer.setAttribute('aria-labelledby',     questionId);
    answer.setAttribute('role',                'region');

    // Wrap answer content in .faq__answer-inner for height animation
    // (only if not already wrapped by prior init)
    if (!answer.querySelector('.faq__answer-inner')) {
      const inner = document.createElement('div');
      inner.className = 'faq__answer-inner';
      // Move all children into inner
      while (answer.firstChild) inner.appendChild(answer.firstChild);
      answer.appendChild(inner);
    }

    const inner = answer.querySelector('.faq__answer-inner');

    // Initial state: closed
    answer.style.overflow  = 'hidden';
    answer.style.maxHeight = '0';
    answer.style.transition = `max-height ${CONFIG.animationMs}ms ${CONFIG.easing}`;
    answer.removeAttribute('hidden'); // We control visibility via max-height instead

    // Bind click
    question.addEventListener('click', () => toggle(item, question, answer, inner));

    // Keyboard: Enter / Space
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(item, question, answer, inner);
      }
    });

    // Arrow key navigation between questions
    question.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusAdjacentItem(index, 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusAdjacentItem(index, -1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        focusItem(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        focusItem(items.length - 1);
      }
    });
  }

  /* ============================================================
     TOGGLE
  ============================================================ */
  function toggle(item, question, answer, inner) {
    const isOpen = question.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      closeItem(item, question, answer);
    } else {
      // Close others if allowMultiple is false
      if (!CONFIG.allowMultiple) {
        items.forEach(otherItem => {
          if (otherItem !== item) {
            const q = otherItem.querySelector('.faq__question');
            const a = otherItem.querySelector('.faq__answer');
            if (q?.getAttribute('aria-expanded') === 'true') {
              closeItem(otherItem, q, a);
            }
          }
        });
      }

      openItem(item, question, answer, inner);
    }
  }

  /* ============================================================
     OPEN
  ============================================================ */
  function openItem(item, question, answer, inner) {
    // Read natural height before animating
    const targetHeight = inner.scrollHeight;

    question.setAttribute('aria-expanded', 'true');
    item.classList.add('open');

    // Animate to full height
    answer.style.maxHeight = targetHeight + 'px';

    // After animation completes, set to 'auto' so it handles
    // content changes (e.g., dynamic text on language switch)
    const tid = setTimeout(() => {
      answer.style.maxHeight = 'none';
    }, CONFIG.animationMs + 20);

    // Store timeout id to cancel if toggled quickly
    item._openTimeout = tid;
  }

  /* ============================================================
     CLOSE
  ============================================================ */
  function closeItem(item, question, answer) {
    // Cancel pending 'set to none' timeout
    if (item._openTimeout) {
      clearTimeout(item._openTimeout);
      item._openTimeout = null;
    }

    // Lock current height first (needed if max-height was 'none')
    const currentHeight = answer.scrollHeight;
    answer.style.maxHeight = currentHeight + 'px';

    // Force reflow so transition fires
    answer.getBoundingClientRect();

    // Animate to 0
    answer.style.maxHeight = '0';

    question.setAttribute('aria-expanded', 'false');
    item.classList.remove('open');
  }

  /* ============================================================
     KEYBOARD: Focus adjacent FAQ item
  ============================================================ */
  function focusAdjacentItem(currentIndex, direction) {
    const next = currentIndex + direction;
    if (next >= 0 && next < items.length) {
      focusItem(next);
    }
  }

  function focusItem(index) {
    const question = items[index]?.querySelector('.faq__question');
    question?.focus();
  }

  /* ============================================================
     HANDLE LANGUAGE CHANGE
     When language switches, open items may need height recalc
     because text length changes.
  ============================================================ */
  window.addEventListener('langChange', () => {
    // Recalculate max-height for any currently open items
    items.forEach(item => {
      const question = item.querySelector('.faq__question');
      const answer   = item.querySelector('.faq__answer');
      const inner    = answer?.querySelector('.faq__answer-inner');
      if (!question || !answer || !inner) return;

      const isOpen = question.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        // Temporarily set to auto to read new natural height
        answer.style.transition = 'none';
        answer.style.maxHeight  = inner.scrollHeight + 'px';
        // Re-enable transition after frame
        requestAnimationFrame(() => {
          answer.style.transition = `max-height ${CONFIG.animationMs}ms ${CONFIG.easing}`;
        });
      }
    });
  });

  /* ============================================================
     PUBLIC API
  ============================================================ */
  function openByIndex(index) {
    const item     = items[index];
    const question = item?.querySelector('.faq__question');
    const answer   = item?.querySelector('.faq__answer');
    const inner    = answer?.querySelector('.faq__answer-inner');
    if (item && question && answer && inner) {
      openItem(item, question, answer, inner);
    }
  }

  function closeAll() {
    items.forEach(item => {
      const q = item.querySelector('.faq__question');
      const a = item.querySelector('.faq__answer');
      if (q?.getAttribute('aria-expanded') === 'true') closeItem(item, q, a);
    });
  }

  /* ============================================================
     DOM READY
  ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TasbeehFAQ = { openByIndex, closeAll };

})();
