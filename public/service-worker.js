// ----------------------------
// Ahaar Amrita PWA Service Worker
// ----------------------------

// ⚙️ Versioned cache name
const CACHE_NAME = "ahaar-cache-v3"; // increase version when you redeploy
const OFFLINE_URL = "/offline.html";

// ✅ Precache core assets during install
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install event");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/", // homepage
        OFFLINE_URL, // offline fallback
        "/manifest.json", // manifest
        "/ahaarlogopng-180x180.png", // icons
        "/ahaarlogopng.png"
      ]);
    })
  );
  self.skipWaiting(); // activate immediately
});

// ✅ Clean up old caches during activate
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate event");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // take control of current clients immediately
});

// ✅ Fetch handler — network first, then cache, with offline fallback
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache the fetched response for next time
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clonedResponse);
        });
        return response;
      })
      .catch(() => {
        // Fallback: return cached version or offline page
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});

// ✅ Message listener to trigger skipWaiting (for auto-updates)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[ServiceWorker] Skip waiting message received");
    self.skipWaiting();
  }
});
