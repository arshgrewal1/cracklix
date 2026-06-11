/**
 * Cracklix Institutional Service Worker v1.0
 * Provides mandatory fetch listener for PWA installability.
 */

const CACHE_NAME = 'cracklix-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Browsers require a fetch listener to enable "Add to Home Screen"
  // We use a network-first strategy for dynamic Next.js chunks
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
