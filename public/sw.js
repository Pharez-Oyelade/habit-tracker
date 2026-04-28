const CACHE_NAME = "habit-tracker-v1";
const APP_SHELL = ["/", "/login", "/signup", "/dashboard"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches
//       .match(event.request)
//       .then((cached) => cached || fetch(event.request)),
//   );
// });

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Handle page navigation
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/")));
    return;
  }

  // Let Next.js handle its own assets properly
  if (request.url.includes("/_next/")) {
    return;
  }

  // Basic cache fallback for other assets
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)),
  );
});
