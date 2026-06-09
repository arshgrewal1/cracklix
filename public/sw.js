
/**
 * @fileOverview Production-Grade Service Worker for CRACKLIX.
 * Strategy: Stale-While-Revalidate for UI, Network-Only for Auth/Admin.
 */

const CACHE_NAME = 'cracklix-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/globals.css',
];

// 1. Install & Precache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate & Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // SECURITY GUARD: Never cache sensitive routes
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api') ||
    url.hostname.includes('firebase') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found, else fetch and update cache
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for offline mode if needed
        return response;
      });

      return response || fetchPromise;
    })
  );
});
