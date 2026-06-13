/**
 * @fileOverview Hardened Institutional PWA Service Worker v5.0.
 * REQUIRED: Must exist in the root public directory for installability.
 */

const CACHE_NAME = 'cracklix-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
];

// 1. Installation Phase: Cache essential nodes
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching platform shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activation Phase: Purge legacy caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Purging legacy cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch Phase: Mandatory fetch handler for Installability
self.addEventListener('fetch', (event) => {
  // Required by Chrome to fire 'beforeinstallprompt'
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
