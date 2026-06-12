
/**
 * @fileOverview Hardened Institutional PWA Service Worker v4.0.
 * Strategy: Cache-First for static assets, Network-First for core API nodes.
 */

const CACHE_NAME = 'cracklix-hub-v4';
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  'https://i.ibb.co/5WjGyLhn/1000110132-removebg-preview.png',
  'https://i.ibb.co/VW2MK9ww/file-00000000deec7206abdeca16860cdec1.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Strategy: Cache-First for internal static images and manifest
  if (url.origin === self.location.origin || url.hostname === 'i.ibb.co') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  } else {
    // Strategy: Network-First with fallback to cache for everything else
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});
