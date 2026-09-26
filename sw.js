/**
 * Service Worker para Soporte Offline y Caché (Network First)
 * Cuaderno Digital de Física III - Universidad Tecnológica de Pereira (UTP)
 * Autores: David Alejandro Ramirez Bolaños, Steven Vélez Garces, Edwin Santiago Pelaez Osorio
 */

const CACHE_NAME = 'fisica3-notebook-v6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/audio.js',
  './js/geogebra_canvas.js',
  './js/simulators.js',
  './js/mindmap.js',
  './js/exercises.js',
  './js/app.js',
  './imagenes/portada.webp',
  './imagenes/hoja_blanco2.png',
  './manifest.json'
];

// Instalación: Precarga de recursos
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: Limpieza agresiva de todas las cachés anteriores
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia Network-First: Siempre busca la versión más reciente en la red
self.addEventListener('fetch', (e) => {
  // Solo interceptar peticiones GET
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone);
          });
        }
        return networkRes;
      })
      .catch(() => {
        // Si no hay conexión o falla la red, recurrir a la caché
        return caches.match(e.request).then((cachedRes) => {
          return cachedRes || caches.match('./index.html');
        });
      })
  );
});
