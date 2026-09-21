var CACHE_NAME =
  "invoice-app-cache-v4";

var FILES_TO_CACHE = [
  "index.html",
  "manifest.webmanifest"
];

self.addEventListener(
  "install",
  function (event) {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(function (cache) {
          return cache.addAll(
            FILES_TO_CACHE
          );
        })
    );

    self.skipWaiting();
  }
);

self.addEventListener(
  "activate",
  function (event) {
    event.waitUntil(
      caches.keys()
        .then(function (cacheNames) {
          return Promise.all(
            cacheNames.map(function (cacheName) {
              if (
                cacheName !== CACHE_NAME
              ) {
                return caches.delete(
                  cacheName
                );
              }

              return null;
            })
          );
        })
    );

    self.clients.claim();
  }
);

self.addEventListener(
  "fetch",
  function (event) {
    event.respondWith(
      caches.match(event.request)
        .then(function (cachedResponse) {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request)
            .then(function (networkResponse) {
              if (
                !networkResponse ||
                networkResponse.status !== 200
              ) {
                return networkResponse;
              }

              return caches.open(CACHE_NAME)
                .then(function (cache) {
                  cache.put(
                    event.request,
                    networkResponse.clone()
                  );

                  return networkResponse;
                });
            })
            .catch(function () {
              return caches.match(
                "index.html"
              );
            });
        })
    );
  }
);
