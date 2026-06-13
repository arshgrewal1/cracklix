/**
 * @fileOverview Cracklix Service Worker v1.0.
 * Required for PWA installation criteria.
 */

const CACHE_NAME = 'cracklix-v1';
const urlsToCache = [
  '/',
  '/manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Functional fetch handler is required for Chrome PWA Installability
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
