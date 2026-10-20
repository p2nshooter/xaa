/* xaa.es service worker: the installable app, fast on phones, never stale.
 *   /_next/static/*, /brand/*, /pwa/*, fonts, images   cache-first (versioned files)
 *   page navigations                                   network-first → cached copy → /offline.html
 *   /api/*, /portal/*, non-GET, other origins          never cached (always live, never stored)
 * Client and admin pages are never kept on the device. */
const VERSION = 'xaa-v1';
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;
const OFFLINE = '/offline.html';
const PRECACHE = [OFFLINE, '/pwa/icon-192.png', '/brand/xaa-mark-64.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (!k.startsWith(VERSION)) await caches.delete(k);
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

const isStatic = (url) =>
  url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/brand/') || url.pathname.startsWith('/pwa/') ||
  /\.(?:png|svg|ico|jpg|jpeg|webp|avif|woff2?)$/.test(url.pathname);

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname === '/sw.js' || url.pathname.startsWith('/demos/')) return;

  if (isStatic(url)) {
    e.respondWith(caches.open(STATIC).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    }));
    return;
  }

  if (req.mode === 'navigate') {
    const privatePage = url.pathname.startsWith('/portal') || url.pathname.startsWith('/login') || url.pathname.startsWith('/register');
    e.respondWith((async () => {
      try {
        const preload = await e.preloadResponse;
        const res = preload || await fetch(req);
        if (!privatePage && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(PAGES).then((c) => c.put(url.pathname + url.search, copy));
        }
        return res;
      } catch {
        const cached = privatePage ? null : await caches.match(url.pathname + url.search, { cacheName: PAGES });
        return cached || (await caches.match(OFFLINE)) || new Response('Offline', { status: 503 });
      }
    })());
  }
});
