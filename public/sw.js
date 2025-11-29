const CACHE_NAME = 'strassen-scanner-v1';
const urlsToCache = ['/', '/index.html', '/manifest.json'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(urlsToCache))));
self.addEventListener('fetch', (event) => event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request))));