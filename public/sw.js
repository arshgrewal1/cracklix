/**
 * @fileOverview Institutional Service Worker v1.0.
 * Strategy: Cache static assets, Network-first for dynamic content.
 * SECURITY: Explicitly bypasses caching for admin and auth routes.
 */

const CACHE_NAME = 'cracklix-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

// 1. Install Event: Cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Intelligent Routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // SECURITY GUARD: Never cache sensitive routes
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('firestore') ||
    url.pathname.includes('identitytoolkit') ||
    request.method !== 'GET'
  ) {
    return;
  }

  // STRATEGY: Network First for pages, Cache First for static assets
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/');
      })
    );
  } else {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((networkResponse) => {
          // Cache fonts, scripts and styles
          if (
            url.origin === self.location.origin &&
            (url.pathname.endsWith('.js') || 
             url.pathname.endsWith('.css') || 
             url.pathname.includes('/fonts/'))
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});
