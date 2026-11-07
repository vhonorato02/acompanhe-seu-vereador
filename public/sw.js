/*
 * Service worker of Acompanhe seu Vereador (ADR 0004).
 *
 * What it caches: only files whose content never changes under the same URL (hashed JS/CSS in
 * /_next/static), the icons and the offline page. Photos are left out: the Câmara may replace a
 * portrait under the same name, and pages load them through the image optimiser anyway.
 * What it never caches: pages and data (/dados, /api, HTML). Every page and every number comes
 * from the network, so the portal can never show an old collection as if it were current.
 * Without a connection, navigation shows /offline, which says so plainly.
 */
const VERSAO = "v1";
const CACHE = `acompanhe-${VERSAO}`;
const OFFLINE = "/offline";
const PRECACHE = [OFFLINE, "/icones/icone-192.png", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith("acompanhe-") && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

function estatico(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icones/") ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/apple-icon.png"
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    // Network only; the offline page is the single fallback, never a stale copy of a page.
    event.respondWith(fetch(req).catch(() => caches.match(OFFLINE).then((r) => r || Response.error())));
    return;
  }

  if (estatico(url)) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(req).then(
          (hit) =>
            hit ||
            fetch(req).then((res) => {
              if (res.ok) cache.put(req, res.clone());
              return res;
            }),
        ),
      ),
    );
  }
  // Everything else (data, API, images resized on demand) goes straight to the network.
});
