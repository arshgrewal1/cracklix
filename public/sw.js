
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.3/workbox-sw.js');

workbox.setConfig({
  debug: false,
});

const { core, precaching, routing, strategies, expiration, backgroundSync } = workbox;

core.skipWaiting();
core.clientsClaim();

// Precache the app shell
precaching.precacheAndRoute([
  { url: '/offline.html', revision: null },
]);

// Runtime caching strategies
routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

routing.registerRoute(
  ({ request }) => request.destination === 'font',
  new strategies.StaleWhileRevalidate({
    cacheName: 'fonts',
  })
);

routing.registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new strategies.NetworkFirst({
    cacheName: 'api',
    plugins: [
      new expiration.ExpirationPlugin({
        maxEntries: 16,
        maxAgeSeconds: 24 * 60 * 60, // 1 Day
      }),
    ],
  })
);

// Offline fallback
const offlineFallback = '/offline.html';
routing.setCatchHandler(({ event }) => {
  switch (event.request.destination) {
    case 'document':
      return caches.match(offlineFallback);
    default:
      return Response.error();
  }
});


// Background Sync for failed requests
const bgSyncPlugin = new backgroundSync.BackgroundSyncPlugin('background-sync-queue', {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours
});

routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new strategies.NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);

// Periodic Background Sync
const periodicSync = 'periodic-sync-tag';

self.addEventListener('periodicsync', (event) => {
  if (event.tag === periodicSync) {
    event.waitUntil(
      // Add your periodic sync logic here
    );
  }
});
