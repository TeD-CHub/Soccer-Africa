const CACHE_NAME = 'soccer-africa-v1';
const ASSETS = [
  './',
  './index.html',
  './about.html',
  './programs.html',
  './coaches.html',
  './players.html',
  './gallery.html',
  './contact.html',
  './admissions.html',
  './css/styles.css',
  './js/script.js',
  './manifest.json',
  './assets/images/logo.jpeg'
];

// Install Event - Pre-cache essential resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Pre-caching offline assets');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-while-revalidate strategy
self.addEventListener('fetch', event => {
  // Only handle local requests, ignore chrome-extension://, api, etc.
  if (event.request.url.startsWith(self.location.origin) && event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          // Serve from cache, then update cache in the background
          fetch(event.request)
            .then(networkResponse => {
              if (networkResponse.status === 200) {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, networkResponse);
                });
              }
            })
            .catch(() => {
              // Ignore network failures when updating in background
            });
          return cachedResponse;
        }

        // Fallback to network
        return fetch(event.request);
      })
    );
  }
});
