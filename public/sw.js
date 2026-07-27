/*
 * Bangladesh Betar — offline app shell (Phase B PWA).
 *
 * Scope: only same-origin app-shell assets. The API (a different origin) and
 * downloaded audio (IndexedDB, handled by the app) are deliberately untouched.
 *
 * Strategy:
 *   - /_next/static, /icons, manifest → cache-first (content-hashed / stable).
 *   - navigations → network-first, falling back to the cached page, then the
 *     offline page, then the home shell — so the app opens without a network.
 *   - other same-origin GETs → stale-while-revalidate.
 *   - RSC / data payloads are never cached (avoids serving stale app data).
 */
const CACHE = "betar-shell-v1";
const PRECACHE = ["/", "/downloads", "/offline", "/manifest.webmanifest", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE).catch(() => undefined)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

function cachePut(request, response) {
  // Only cache complete, basic (same-origin) responses.
  if (response && response.ok && response.type === "basic") {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  // Never touch cross-origin (the API, external audio/CDN, etc.).
  if (url.origin !== self.location.origin) return;

  // Never cache React Server Component / data payloads.
  if (url.searchParams.has("_rsc") || url.pathname.startsWith("/_next/data")) return;

  // Immutable build assets + icons + manifest → cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => cachePut(req, res))));
    return;
  }

  // Page navigations → network-first, then cached page, then offline, then shell.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => cachePut(req, res))
        .catch(() =>
          caches
            .match(req)
            .then((hit) => hit || caches.match("/offline"))
            .then((hit) => hit || caches.match("/")),
        ),
    );
    return;
  }

  // Other same-origin GETs (fonts/images) → stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req)
        .then((res) => cachePut(req, res))
        .catch(() => hit);
      return hit || network;
    }),
  );
});
