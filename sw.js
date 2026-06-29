/* ============================================================
   TASBEEH LANDING — SERVICE WORKER
   Strategy: Cache-first for assets, Network-first for HTML.
   Enables offline browsing of the landing page.
   ============================================================ */

const CACHE_NAME    = 'tasbeeh-v1.0.7';
const OFFLINE_PAGE  = '/tasbeeh/';

/* Assets to pre-cache on install */
const PRECACHE_ASSETS = [
  '/tasbeeh/',
  '/tasbeeh/index.html',
  '/tasbeeh/privacy.html',
  '/tasbeeh/terms.html',
  '/tasbeeh/css/style.css',
  '/tasbeeh/css/animations.css',
  '/tasbeeh/css/responsive.css',
  '/tasbeeh/js/app.js',
  '/tasbeeh/js/language.js',
  '/tasbeeh/js/gallery.js',
  '/tasbeeh/js/faq.js',
  '/tasbeeh/js/share.js',
  '/tasbeeh/assets/logo.png',
  '/tasbeeh/manifest.json',
];

/* ============================================================
   INSTALL — Pre-cache core assets
============================================================ */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ============================================================
   ACTIVATE — Clean up old caches
============================================================ */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ============================================================
   FETCH — Cache strategy per resource type
============================================================ */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin (e.g. Google Fonts)
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  // HTML pages: Network-first (stay up to date)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Everything else: Cache-first (fast repeated loads)
  event.respondWith(cacheFirst(request));
});

/* ============================================================
   STRATEGIES
============================================================ */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache    = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match(OFFLINE_PAGE);
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    const cache    = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}
