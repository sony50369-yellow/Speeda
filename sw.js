self.addEventListener('install', e => {
  e.waitUntil(caches.open('speeda-pwa-v1').then(cache => cache.addAll(['./','./index.html','./manifest.json'])));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(resp => resp || fetch(e.request)));
});