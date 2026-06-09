const CACHE_NAME = 'cracklix-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/globals.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // SECURITY: Never cache sensitive nodes
  if (
    url.pathname.startsWith('/admin') || 
    url.pathname.startsWith('/api') ||
    url.href.includes('google.com') ||
    url.href.includes('firebase')
  ) {
    return;
  }

  // STRATEGY: Network First (ensures students see latest recruitment alerts)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // STRATEGY: Cache First for assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});