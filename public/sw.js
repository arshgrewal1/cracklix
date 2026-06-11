/**
 * @fileOverview Institutional Service Worker v2.0.
 * Mandatory for PWA Installability Criteria.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Browsers require a fetch listener to trigger the "Add to Home Screen" prompt
self.addEventListener('fetch', (event) => {
  // Priority: Network-First to prevent ChunkLoadErrors in Next.js
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
