// The till moved to /kasse/. This worker replaces the one that was
// scoped to /kasse-7a6466ec/, clears that cache, and leaves.
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await caches.delete('hiraya-kasse-v1')
    await self.clients.claim()
    const windows = await self.clients.matchAll({ type: 'window' })
    await Promise.all(windows.map((client) => {
      const path = new URL(client.url).pathname
      if (path === '/kasse-7a6466ec' || path.startsWith('/kasse-7a6466ec/')) return client.navigate('/kasse/')
    }))
    await self.registration.unregister()
  })())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  const path = url.pathname
  if (event.request.mode === 'navigate' && (path === '/kasse-7a6466ec' || path.startsWith('/kasse-7a6466ec/'))) {
    event.respondWith(Response.redirect('/kasse/', 302))
  }
})
