console.log('ServiceWorker ready');

self.addEventListener('installing', (event) => {
  console.log('Service Worker installing', event);
});

// Install event - used to cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installed', event);
  // Simulate caching some resources
  event.waitUntil(
    caches.open('v1').then((cache) => {
      console.log('Caching resources...');
      return cache.addAll([
        // '/',
        // '/index.html',
        // '/main.js'
      ]);
    })
  );
});

// Activate event - handles any tasks after installation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated', event);
  // Clear cache
  event.waitUntil(
      // Get all cache names
      caches.keys().then((cacheNames) => {
          return Promise.all(
              cacheNames.map((cacheName) => {
                  // Delete each cache
                  console.log('Deleting cache:', cacheName);
                  return caches.delete(cacheName);
              })
          );
      })
  );

});

// Fetch event - intercepts network requests and serves cached responses if available
self.addEventListener('fetch', (event) => {
  console.log('fetch', event);
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('Serving from cache:', event.request.url);
        return cachedResponse;
      }
      // If not cached, fetch from network
      return fetch(event.request);
    })
  );
});

self.addEventListener('message', (event) => {
  console.log(`Service Worker message in ${((Date.now() - event.data.start)).toFixed(0)}ms`, event);
});

self.addEventListener('push', (event) => {
  console.log('Service Worker push', event);
});

self.addEventListener('sync', (event) => {
  console.log('Service Worker sync', event);
});
