const CACHE_VERSION = "v1";
const PRECACHE = `ez-budget-precache-${CACHE_VERSION}`;
const RUNTIME = `ez-budget-runtime-${CACHE_VERSION}`;
const PRECACHE_URLS = [
  "/offline",
  "/manifest.webmanifest", // or "/manifest.json" depending on your generated URL
  "/icon-192.png",
  "/icon-512.png",
  //   "/icon-maskable-192.png",
  //   "/icon-maskable-512.png",
];

// Install: cache important shell/public assets
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => ![PRECACHE, RUNTIME].includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// Fetch: use different strategies depending on request type
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Do not cache Next.js RSC/data/API calls blindly
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next/data") ||
    request.headers.get("accept")?.includes("text/x-component")
  ) {
    return;
  }

  // Cache-first for static assets
  if (
    url.pathname.startsWith("/_next/static") ||
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-only for pages; fall back to precached /offline when offline
  if (request.mode === "navigate") {
    event.respondWith(navigateWithOfflineFallback(request));
    return;
  }
});

// fires when /api/mutateItems sends web push
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    data = { title: "New update", body: "A workspace item changed." };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "New update", {
      body: data.body || "A workspace item changed.",
      icon: "/icon-192.png",
      badge: "/icon-192.png", // TODO: replace with smaller monochrome badge if you add one
      tag: data.itemId || "update",
      renotify: true,
      data: {},
    }),
  );
});

// fires when user clicks notification
self.addEventListener("notificationclick", (event) => {
  // 1. close notification
  event.notification.close();
  const targetUrl = `${self.location.origin}/app/items`;
  event.waitUntil(
    // 2. open app/items in existing window (.matchAll() selects clients with matching domains)
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("navigate" in client && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // 3. open app in new window
      return clients.openWindow(targetUrl);
    }),
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);

  if (response.ok) {
    const cache = await caches.open(RUNTIME);
    cache.put(request, response.clone());
  }

  return response;
}

async function navigateWithOfflineFallback(request) {
  try {
    return await fetch(request);
  } catch {
    return caches.match("/offline");
  }
}
