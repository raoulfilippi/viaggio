const CACHE = 'indonesia-2026-v1';

const PRECACHE = [
  '/viaggio/',
  '/viaggio/index.html',
  '/viaggio/manifest.json',
  '/viaggio/viaggi.png'
];

// Installazione: pre-carica le risorse essenziali
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(PRECACHE);
    })
  );
  self.skipWaiting();
});

// Attivazione: rimuove cache vecchie
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first per Firebase, cache-first per assets statici
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Firebase e risorse esterne: sempre network, nessuna cache
  if (url.includes('firestore') || url.includes('googleapis') ||
      url.includes('gstatic') || url.includes('unpkg') ||
      url.includes('cdnjs') || url.includes('leaflet')) {
    return;
  }

  // Assets locali: cache-first con fallback network
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (!response || response.status !== 200) return response;
        var clone = response.clone();
        caches.open(CACHE).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      });
    })
  );
});
