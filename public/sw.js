const CACHE_NAME = 'cracklix-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch for now to satisfy PWA criteria
  event.respondWith(fetch(event.request));
});
