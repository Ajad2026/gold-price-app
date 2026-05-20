// sw.js - Service Worker for Gold Price App
const CACHE_NAME = 'gold-price-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// ইন্সটল ইভেন্ট
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// ফেচ ইভেন্ট - নেটওয়ার্ক ফার্সট, তারপর ক্যাশে
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // ভ্যালিড রেসপন্স ক্যাশে করুন
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // নেটওয়ার্ক ব্যর্থ হলে ক্যাশে থেকে দেখান
        return caches.match(event.request);
      })
  );
});

// অ্যাক্টিভেট ইভেন্ট - পুরাতন ক্যাশে ক্লিনআপ
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// পুশ নোটিফিকেশন
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body || 'নতুন আপডেট এসেছে!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'গোল্ড প্রাইস', options)
  );
});

// নোটিফিকেশন ক্লিক
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
