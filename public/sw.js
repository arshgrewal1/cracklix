/**
 * @fileOverview Production Service Worker for Cracklix PWA.
 * REQUIRED: A fetch handler is mandatory for Chrome 'Installable' criteria.
 */

const CACHE_NAME = 'cracklix-v2';

self.addEventListener('install', (event) => {
  console.log('[PWA_SW] Install Event');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[PWA_SW] Activate Event');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through fetch handler satisfies installation requirements
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
