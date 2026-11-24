// Scoped to /kasse/ because this file lives in that directory.
// It does not control the public website or the old /kasse-7a6466ec/ address.
const CACHE = 'hiraya-kasse-v2'
const SHELL = ['./', './index.html', './manifest.webmanifest']

function inTill(pathname) {
  return pathname === '/kasse' || pathname.startsWith('/kasse/')
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k.startsWith('hiraya-kasse-') && k !== CACHE).map((k) => caches.delete(k))
    ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return
  if (!inTill(url.pathname)) return
  event.respondWith(
    fetch(event.request).then((res) => {
      if (res.ok) {
        const copy = res.clone()
        caches.open(CACHE).then((cache) => cache.put(event.request, copy))
      }
      return res
    }).catch(async () => {
      const hit = await caches.match(event.request)
      return hit || caches.match('./index.html')
    })
  )
})
