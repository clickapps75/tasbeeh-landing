# تسبيح | Tasbeeh — Landing Page

> Premium Islamic app landing page · Bilingual AR/EN · RTL/LTR · PWA · SEO 100

---

## 📋 Overview

Professional production landing page for **Tasbeeh** (تسبيح), an Islamic Android application by **Clicks Apps**. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no jQuery, no React.

| Metric | Target |
|---|---|
| Performance | 95+ |
| SEO | 100 |
| Accessibility | 100 |
| Best Practices | 100 |

---

## 🗂 Folder Structure

```
tasbeeh-landing/
│
├── index.html              # Main landing page
├── privacy.html            # Privacy Policy (bilingual)
├── terms.html              # Terms of Service (bilingual)
├── manifest.json           # PWA Web App Manifest
├── robots.txt              # Search engine crawl rules
├── sitemap.xml             # XML sitemap for SEO
├── sw.js                   # Service Worker (offline support)
├── README.md               # This file
│
├── css/
│   ├── style.css           # Main design system & all components
│   ├── animations.css      # Keyframes, reveal classes, motion
│   └── responsive.css      # Breakpoints, RTL/LTR, print, A11y
│
├── js/
│   ├── language.js         # Bilingual AR↔EN switching system
│   ├── app.js              # Core: loader, nav, reveal, counter,
│   │                       #   ripple, cursor, carousel, parallax
│   ├── gallery.js          # Lightbox: keyboard, swipe, focus trap
│   ├── faq.js              # Accordion: height animation, ARIA
│   └── share.js            # Web Share API, modal, clipboard, toast
│
└── assets/
    ├── logo.png            # App icon (512×512 recommended)
    ├── featured.jpg        # Hero background image (1920×1080+)
    ├── og-image.jpg        # Open Graph image (1200×630)
    ├── favicon-16.png      # Browser tab favicon 16×16
    ├── favicon-32.png      # Browser tab favicon 32×32
    ├── apple-touch-icon.png # iOS home screen icon (180×180)
    │
    ├── icons/              # PWA icons (all sizes)
    │   ├── icon-72.png
    │   ├── icon-96.png
    │   ├── icon-128.png
    │   ├── icon-144.png
    │   ├── icon-152.png
    │   ├── icon-192.png    # ← maskable
    │   ├── icon-384.png
    │   └── icon-512.png    # ← maskable
    │
    └── screenshots/        # App screenshots (1080×1920 each)
        ├── screen1.jpg     # Tasbeeh counter
        ├── screen2.jpg     # Morning Azkar
        ├── screen3.jpg     # Prayer Times
        ├── screen4.jpg     # Statistics
        └── screen5.jpg     # Dark Mode
```

---

## 🖼 Required Assets

You must place these files before deploying. The page will render without them but images will be blank.

### Hero Background — `assets/featured.jpg`
- **Size:** 1920 × 1080 px minimum (wider is better)
- **Content:** A beautiful mosque, Islamic architecture, or nature scene
- **Style:** Should look good with a dark green overlay on top
- **File size:** Compress to under 300 KB with [Squoosh](https://squoosh.app)

### App Icon — `assets/logo.png`
- **Size:** 512 × 512 px
- **Format:** PNG with transparency
- **Shape:** Rounded square (Android adaptive icon style)
- This same file is used in the nav, hero, CTA, and footer

### Screenshots — `assets/screenshots/screen1–5.jpg`
- **Size:** 1080 × 1920 px (portrait, 9:16)
- **Count:** 5 screenshots minimum
- **Content:** Real app screens — counter, azkar, prayer times, stats, dark mode
- **Format:** JPG, compressed to under 150 KB each

### PWA Icons — `assets/icons/icon-*.png`
Generate all sizes from your 512×512 logo using:
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [Favicon.io](https://favicon.io)
- [RealFaviconGenerator](https://realfavicongenerator.net)

The two **maskable** icons (192 and 512) need a safe zone:
- Content must be within the **inner 80%** (safe zone circle)
- Background should fill the entire square

### Open Graph Image — `assets/og-image.jpg`
- **Size:** 1200 × 630 px
- **Content:** App icon + name "تسبيح" + tagline on a green background
- Used when sharing links on WhatsApp, Twitter, Telegram, etc.

---

## 🚀 Deployment — GitHub Pages

The project is configured for **GitHub Pages** hosting.

### Step 1: Create the repository
```bash
# Create a new repo named: Tasbeeh (must match sitemap/canonical URLs)
# Go to: https://github.com/new
# Repository name: Tasbeeh
# Visibility: Public
```

### Step 2: Upload files
```bash
git clone https://github.com/clickapps75/Tasbeeh.git
cd Tasbeeh

# Copy all landing page files into the root OR a /docs folder
# Then commit and push
git add .
git commit -m "Add landing page"
git push origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / `(root)` → **Save**
4. Your site will be live at: `https://clickapps75.github.io/Tasbeeh/`

### Step 4: Update URLs
After confirming your live URL, update these placeholders in the code:

| File | Line | Replace with your live URL |
|---|---|---|
| `index.html` | `<link rel="canonical">` | Your GitHub Pages URL |
| `index.html` | `og:url` meta | Your GitHub Pages URL |
| `manifest.json` | `start_url`, `scope` | Your path (e.g. `/Tasbeeh/`) |
| `sitemap.xml` | All `<loc>` tags | Your GitHub Pages URL |
| `robots.txt` | `Sitemap:` line | Your sitemap URL |
| `sw.js` | `PRECACHE_ASSETS` paths | Your base path |

---

## 🎨 Design System

### Color Palette
| Token | Hex | Use |
|---|---|---|
| `--clr-primary` | `#146C43` | Buttons, icons, accents |
| `--clr-secondary` | `#198754` | Hover states |
| `--clr-gold` | `#D4AF37` | Stars, premium accents |
| `--clr-bg` | `#FAFBF8` | Page background |
| `--clr-card` | `#FFFFFF` | Card backgrounds |
| `--clr-text` | `#1F2937` | Body text |

### Typography
| Use | Font | Weight |
|---|---|---|
| Arabic headings | Cairo | 800 |
| Arabic body | Cairo | 400 |
| English headings | Inter | 700 |
| English body | Inter | 400 |

### Breakpoints
| Name | Width | Layout change |
|---|---|---|
| Mobile | < 480px | Single column |
| Large phone | ≥ 480px | 2-col features, row CTA |
| Tablet | ≥ 768px | Full nav, mockup side-by-side |
| Laptop | ≥ 1024px | 3-col features, 5-col gallery |
| Desktop | ≥ 1280px | Max container, generous spacing |

---

## ⚙️ JavaScript Modules

All scripts are IIFEs (Immediately Invoked Function Expressions) — no global pollution, no dependencies.

| File | Exports | Key Features |
|---|---|---|
| `language.js` | `window.TasbeehLang` | `.t(key)`, `.apply(lang)`, auto-detects browser lang |
| `app.js` | `window.TasbeehApp` | 12 sub-modules, all self-contained |
| `gallery.js` | `window.TasbeehGallery` | `.open(index)`, `.close()`, `.goTo(index)` |
| `faq.js` | `window.TasbeehFAQ` | `.openByIndex(n)`, `.closeAll()` |
| `share.js` | `window.TasbeehShare` | `.openModal()`, `.showToast(msg)` |

### Inter-module communication
Scripts communicate via **custom DOM events** — no direct coupling:

```
app.js PhoneCarousel  →  dispatchEvent('slideChange', { index })
                               ↓
language.js           ←  listens, updates info panel text

language.js           →  dispatchEvent('langChange', { lang, isRTL })
                               ↓
faq.js                ←  listens, recalculates accordion heights
```

---

## 🌐 Bilingual System

Every text element uses `data-ar` and `data-en` attributes:

```html
<!-- Simple element -->
<h2 data-ar="المميزات" data-en="Features">المميزات</h2>

<!-- Button with icon (icon is preserved) -->
<button data-ar="تحميل" data-en="Download">
  <svg>...</svg>
  تحميل
</button>

<!-- Dynamic key-based translation -->
<span data-i18n="toast.copied"></span>
```

`language.js` walks all `[data-ar]`/`[data-en]` elements on toggle, swaps text content while preserving child SVG icons, updates `<html lang>`, `dir`, `<title>`, and meta description simultaneously.

---

## ♿ Accessibility

- All interactive elements have `aria-label` or visible text
- Lightbox and Share Modal have `role="dialog"` + `aria-modal="true"` + **focus trap**
- FAQ accordion uses `aria-expanded`, `aria-controls`, `role="region"`
- Gallery uses `role="list"` + `role="listitem"`
- Phone mockup dots use `role="tablist"` + `role="tab"` + `aria-selected`
- Screen reader announcements via `aria-live="polite"` region
- Full keyboard navigation: Tab, Enter, Space, Arrows, Escape, Home, End
- `prefers-reduced-motion` disables all animations safely
- `forced-colors` (Windows High Contrast) has explicit overrides
- Color contrast ratios meet WCAG AA throughout

---

## 🔧 Customization

### Change the APK download link
Search for the APK URL in `index.html` and update both occurrences:
```
https://github.com/clickapps75/Tasbeeh/releases/download/v1.0.7/app-release.apk
```

### Add a real Google Play link
When your app is published, find all `disabled` buttons with "Google Play" text and:
1. Remove the `disabled` attribute
2. Change the `<button>` to `<a href="YOUR_PLAY_STORE_URL">`
3. Update the button text (remove "— قريباً" / "— Coming Soon")

### Change the accent gold color
In `css/style.css`, update these three tokens:
```css
--clr-gold:       #D4AF37;
--clr-gold-light: #e8c84a;
--clr-gold-dark:  #b8952e;
```

### Add more screenshots
1. Add `screen6.jpg` (etc.) to `assets/screenshots/`
2. In `index.html`, add a new `.phone__slide` and `.gallery__item`
3. In `app.js`, add a new dot button and update `SLIDE_INFO` array
4. In `gallery.js`, `buildImageIndex()` reads the DOM automatically — no change needed

---

## 📧 Support

**Developer:** Clicks Apps  
**Email:** clickapps75@gmail.com  
**APK:** [Download v1.0.7](https://github.com/clickapps75/Tasbeeh/releases/download/v1.0.7/app-release.apk)

---

## 📄 License

© 2025 Clicks Apps. All rights reserved.  
This landing page code is proprietary. Do not redistribute without permission.

---

*صُنع بـ ♥ لكل مسلم في العالم — Made with ♥ for every Muslim in the world*
