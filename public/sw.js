/* TeklifPro service worker — offline shell + basic caching */
const CACHE_VERSION = 'teklifpro-v1'
const OFFLINE_URL = '/offline'
const PRECACHE = [
  '/offline',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      cache.addAll(PRECACHE).catch(() => {})
    )
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Network-first for navigations; fallback to offline page.
self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  // Never handle API / auth requests
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next/data') || url.pathname.includes('/auth/')) return

  // Navigation requests — network-first with offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(async () => (await caches.match(OFFLINE_URL)) || new Response('Offline', { status: 503 }))
    )
    return
  }

  // Static assets — cache-first (opaque OK)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icon') ||
    url.pathname.startsWith('/apple-touch-icon') ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/manifest.webmanifest'
  ) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((res) => {
          const clone = res.clone()
          caches.open(CACHE_VERSION).then((c) => c.put(req, clone)).catch(() => {})
          return res
        }).catch(() => cached)
      )
    )
  }
})
