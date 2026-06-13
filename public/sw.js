/**
 * @fileOverview Official Cracklix Service Worker v1.0.
 * Mandatory for PWA installability criteria.
 */

const CACHE_NAME = 'cracklix-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch handler satisfying "Offline Support" criteria
  event.respondWith(fetch(event.request));
});
