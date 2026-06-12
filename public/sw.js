/**
 * @fileOverview Institutional PWA Service Worker v1.0.
 * Enables offline capability and native "Install App" prompt.
 */

const CACHE_NAME = 'cracklix-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  'https://i.ibb.co/5WjGyLhn/1000110132-removebg-preview.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
