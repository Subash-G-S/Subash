self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
});

self.addEventListener('fetch', (event) => {
  // You can later add caching logic here
});
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('ahaar-cache').then((cache) => {
      return cache.addAll(['/', '/offline.html']);
    })
  );
  console.log('Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match('/offline.html'))
  );
});
