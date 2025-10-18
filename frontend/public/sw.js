const CACHE_NAME = 'cnc-task-management-v1'
const OFFLINE_URL = '/offline.html'

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/static/media/logo.png'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached')
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Old caches cleaned up')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip external requests
  if (!request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached response if available
        if (response) {
          return response
        }

        // Clone the request since it can only be used once
        const fetchRequest = request.clone()

        return fetch(fetchRequest)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response since it can only be used once
            const responseToCache = response.clone()

            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache)
              })

            return response
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match(OFFLINE_URL)
            }

            // Return a generic offline response for other requests
            return new Response(
              JSON.stringify({ error: 'You are offline' }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            )
          })
      })
  )
})

// Background sync for queued requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered')
    event.waitUntil(syncOfflineQueue())
  }
})

// Sync offline queue
async function syncOfflineQueue() {
  try {
    const queue = await getOfflineQueue()

    for (const item of queue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: item.data ? JSON.stringify(item.data) : undefined,
        })

        if (response.ok) {
          await removeFromQueue(item.id)
        } else {
          item.retryCount += 1
          if (item.retryCount >= 3) {
            await removeFromQueue(item.id)
          } else {
            await updateQueueItem(item)
          }
        }
      } catch (error) {
        console.error('Failed to sync queued item:', error)
        item.retryCount += 1
        if (item.retryCount >= 3) {
          await removeFromQueue(item.id)
        } else {
          await updateQueueItem(item)
        }
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Queue management functions
async function getOfflineQueue() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['offlineQueue'], (result) => {
      resolve(result.offlineQueue || [])
    })
  })
}

async function removeFromQueue(id) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['offlineQueue'], (result) => {
      const queue = result.offlineQueue || []
      const updatedQueue = queue.filter(item => item.id !== id)
      chrome.storage.local.set({ offlineQueue: updatedQueue }, resolve)
    })
  })
}

async function updateQueueItem(updatedItem) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['offlineQueue'], (result) => {
      const queue = result.offlineQueue || []
      const updatedQueue = queue.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
      chrome.storage.local.set({ offlineQueue: updatedQueue }, resolve)
    })
  })
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/static/media/logo.png',
    badge: '/static/media/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore this new world',
        icon: '/static/media/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close notification',
        icon: '/static/media/xmark.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('CNC Task Management', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})