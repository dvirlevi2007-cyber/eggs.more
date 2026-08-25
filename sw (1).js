const CACHE_NAME = 'eggs-app-v2'; // חשוב: להעלות את המספר הזה בכל פעם שמעדכנים כדי לבטל מטמון ישן
const CORE_ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// אסטרטגיית "רשת קודם" - תמיד מנסה להביא גרסה עדכנית מהשרת קודם,
// ורק אם אין אינטרנט בכלל נופלים לגרסה השמורה. ככה עדכונים בקוד
// מגיעים מיד, והמטמון משמש רק כגיבוי למצב בלי אינטרנט בשטח.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
