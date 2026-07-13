// LeadDm service worker — HTML her zaman ağdan (bayat panel yok), statikler önbellekli
var CACHE = "leaddm-v2";
self.addEventListener("install", function (e) { self.skipWaiting(); });
self.addEventListener("activate", function (e) {
  e.waitUntil((async function () {
    var keys = await caches.keys();
    await Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return; // Supabase vb. normal geçer
  // Sayfa (HTML) her zaman ağdan gelsin → asla bayat panel
  if (req.destination === "document" || req.mode === "navigate") {
    e.respondWith(fetch(req).catch(function () { return caches.match(req); }));
    return;
  }
  // Statikler (ikon/manifest) network-first
  e.respondWith(
    fetch(req).then(function (r) {
      var cp = r.clone();
      caches.open(CACHE).then(function (c) { c.put(req, cp); }).catch(function () {});
      return r;
    }).catch(function () { return caches.match(req); })
  );
});
