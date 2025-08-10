const CACHE_NAME = 'basaer-nahw-v1';
const urlsToCache = [
  '/',
  '/basayir-lnahw/index.html',
  '/basayir-lnahw/style.css',
  '/basayir-lnahw/script.js',
  '/basayir-lnahw/downloads/myfile.pdf',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@300;400;500;700&family=Amiri:wght@400;700&display=swap'
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('فتح التخزين المؤقت');
        return cache.addAll(urlsToCache);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف التخزين المؤقت القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// اعتراض الطلبات وتقديم المحتوى من التخزين المؤقت
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // إرجاع المحتوى من التخزين المؤقت إذا وُجد
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            // التحقق من صحة الاستجابة
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // نسخ الاستجابة
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

// التعامل مع رسائل من الصفحة الرئيسية
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// إشعار بالتحديثات
self.addEventListener('updatefound', function() {
  console.log('تم العثور على تحديث جديد');
});

// معالجة الأخطاء
self.addEventListener('error', function(event) {
  console.error('خطأ في Service Worker:', event.error);
});

// دعم المزامنة في الخلفية
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('تم تشغيل المزامنة في الخلفية');
  }
});

// دعم الإشعارات Push
self.addEventListener('push', function(event) {
  if (event.data) {
    const notificationData = event.data.json();
    
    const options = {
      body: notificationData.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: notificationData.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'استكشاف الدوسية',
          icon: '/icon-192.png'
        },
        {
          action: 'close',
          title: 'إغلاق',
          icon: '/icon-192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(notificationData.title, options)
    );
  }
});

// التعامل مع النقر على الإشعارات
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

