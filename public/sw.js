// Service Worker para Martin Gala PWA
const CACHE_NAME = 'martingala-pwa-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Instalación - Cache recursos críticos
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('🚀 Todos los recursos cacheados');
        return self.skipWaiting();
      })
  );
});

// Activar - Limpiar caches viejos
self.addEventListener('activate', (event) => {
  console.log('🔥 Service Worker activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker listo para controlar la app');
      return self.clients.claim();
    })
  );
});

// Estrategia: Cache First, luego Network
self.addEventListener('fetch', (event) => {
  // Ignorar solicitudes que no son GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Si está en cache, devolverlo
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si no está en cache, buscar en network
        return fetch(event.request)
          .then((networkResponse) => {
            // Si la respuesta es válida, guardar en cache
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // Si falla network y es HTML, devolver página offline
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            // Para otros recursos, devolver respuesta genérica
            return new Response('🔌 Modo offline - App funciona localmente', {
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Manejar mensajes desde la app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});