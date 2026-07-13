// LeadDm service worker — network-first (bayat içerik yok), çevrimdışı yedek
var CACHE = "leaddm-v1";
self.addEventListener("install", function (e) { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return; // sadece uygulama dosyaları (Supabase istekleri normal geçer)
  e.respondWith(
    fetch(req).then(function (r) {
      var cp = r.clone();
      caches.open(CACHE).then(function (c) { c.put(req, cp); }).catch(function () {});
      return r;
    }).catch(function () { return caches.match(req); })
  );
});
