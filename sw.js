const CACHE_NAME = 'omanovar-v1.0.0';
const STATIC_CACHE_NAME = 'omanovar-static-v1.0.0';

// Ресурсы для кэширования
const STATIC_FILES = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/js/app.min.js',
  '/js/modules/navigation.js',
  '/js/modules/gallery.js',
  '/js/modules/lightbox.js',
  '/js/modules/image-optimization.js',
  '/js/modules/seo-enhancement.js',
  '/src/img/hero-image.jpg',
  '/src/img/logo.png',
  '/src/img/favicon.ico'
];

// Изображения галереи
const GALLERY_IMAGES = [
  '/src/img/optimized/gallery/аист1.webp',
  '/src/img/optimized/gallery/аист1.jpg',
  '/src/img/optimized/gallery/аист2.webp',
  '/src/img/optimized/gallery/аист2.jpg',
  '/src/img/optimized/gallery/Ванька-встанька 1.webp',
  '/src/img/optimized/gallery/Ванька-встанька 1.jpg',
  '/src/img/optimized/gallery/голова.webp',
  '/src/img/optimized/gallery/голова.jpg',
  '/src/img/optimized/gallery/девяткино.webp',
  '/src/img/optimized/gallery/девяткино.jpg',
  '/src/img/optimized/gallery/любовь.webp',
  '/src/img/optimized/gallery/любовь.jpg',
  '/src/img/optimized/gallery/мухи.webp',
  '/src/img/optimized/gallery/мухи.jpg',
  '/src/img/optimized/gallery/парень.webp',
  '/src/img/optimized/gallery/парень.jpg',
  '/src/img/optimized/gallery/пироги.webp',
  '/src/img/optimized/gallery/пироги.jpg',
  '/src/img/optimized/gallery/тверь.webp',
  '/src/img/optimized/gallery/тверь.jpg'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Кэшируем основные файлы
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      }),
      // Кэшируем изображения галереи
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching gallery images');
        return cache.addAll(GALLERY_IMAGES);
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Пропускаем запросы к внешним ресурсам
  if (url.origin !== location.origin) {
    return;
  }
  
  // Стратегия для разных типов ресурсов
  if (request.destination === 'image') {
    // Изображения: Cache First
    event.respondWith(cacheFirst(request));
  } else if (request.destination === 'style' || request.destination === 'script') {
    // CSS/JS: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // HTML: Network First
    event.respondWith(networkFirst(request));
  }
});

// Cache First стратегия
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    return new Response('Network error', { status: 408 });
  }
}

// Network First стратегия
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline content not available', { 
      status: 503,
      statusText: 'Service Unavailable' 
    });
  }
}

// Stale While Revalidate стратегия
async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Обработка сообщений от основного потока
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Уведомление об обновлении
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
}); 