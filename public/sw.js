// Basic Service Worker to satisfy PWA install requirements
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Let the browser handle standard fetching since we run dev server locally
});
