// Service worker: simpan semua file game agar bisa dimainkan offline.
// Naikkan VERSI setiap rilis besar agar cache lama dibuang.
const VERSI = 'lumina-v16';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(['./', 'index.html', 'styles.css', 'manifest.webmanifest'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Ambil dari jaringan dulu (agar update cepat terlihat), simpan ke cache; kalau offline pakai cache.
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || !/^https?:/.test(r.url)) return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(VERSI).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('index.html'))));
});
