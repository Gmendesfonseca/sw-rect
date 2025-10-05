const CACHE_NAME = 'app-cache-v1';
const URLS_TO_PRECACHE = ['/', 'vite.svg'];

// ---------- SW INIT
self.addEventListener('install', (event) => {
  console.log('🔧 [SW] install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_PRECACHE)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🔧 [SW] activate');
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)),
        ),
      ),
  );
  self.clients.claim();
});

// ---------- SW USAGE 1 - Caching app for offline usage
self.addEventListener('fetch', (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cachedResp) => {
      if (cachedResp) return cachedResp;
      return fetch(req)
        .then((networkResp) => {
          if (
            req.method === 'GET' &&
            networkResp &&
            networkResp.status === 200 &&
            // NOTE: For testing porpouses, comment this condition, and check:
            //       - 1.) It will cache the api call (make app offline and reload to check it)
            //             Turn the network back online.
            //       - 2.) Click on "refresh", a new fetch will occur with a new quote.
            //       - 3.) Refresh the page: you will see the first cached quote.
            //             This is how our service works, by trying to get cached data first.
            //             This is entire up to the developer, you could have a rule in which
            //             only self data is cached, foregin data would need the user to be offline
            //             before it hits cache.
            //             Exercise: try to do it here.
            req.url.startsWith(self.location.origin)
          ) {
            const copy = networkResp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkResp;
        })
        .catch(() => {
          if (
            req.headers.get('accept') &&
            req.headers.get('accept').includes('text/html')
          ) {
            return caches.match('/index.html');
          }
          return new Response("You're offline, this resouce is not cached!", {
            status: 503,
          });
        });
    }),
  );
});

// ---------- SW USAGE 2 - Background Sync Handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'send-form') {
    event.waitUntil(sendPendingData());
  }
  if (event.tag === 'fetch-joke') {
    event.waitUntil(fetchAndStoreJoke());
  }
});

function sendPendingData() {
  return fetch('/api/save', {
    method: 'POST',
    body: JSON.stringify({ msg: 'Example data!!!!' }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(() => {
      console.log('[SW] Data sent on background!');
    })
    .catch((err) => {
      console.log('[SW] Failed to send data on background: ', err);
    });
}

// Helper functions for IndexedDB
function openJokeDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('JokeDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('jokes')) {
        db.createObjectStore('jokes', { keyPath: 'id' });
      }
    };
  });
}

function saveJoke(joke) {
  return openJokeDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['jokes'], 'readwrite');
      const store = transaction.objectStore('jokes');
      const request = store.put({ id: 'latest', joke });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  });
}

function getJoke() {
  return openJokeDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['jokes'], 'readonly');
      const store = transaction.objectStore('jokes');
      const request = store.get('latest');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.joke);
    });
  });
}

function fetchAndStoreJoke() {
  console.log('[SW] Fetching joke via Background Sync...');
  return fetch('https://official-joke-api.appspot.com/random_joke')
    .then((response) => response.json())
    .then((joke) => {
      const jokeObject = {
        setup: joke.setup,
        punchline: joke.punchline,
      };
      console.log('[SW] Joke fetched:', jokeObject);
      return saveJoke(jokeObject);
    })
    .then(() => {
      console.log('[SW] Joke saved successfully!');
    })
    .catch((err) => {
      console.log('[SW] Failed to fetch joke:', err);
      throw err;
    });
}

// ---------- SW USAGE 3 - Push Handler
self.addEventListener('push', (event) => {
  console.log('🔔 [SW] Push event received:', event);

  const showJokeNotification = async () => {
    let title = 'Joke Time! 😄';
    let body = "Here's your joke...";

    if (event.data) {
      try {
        const parsed = JSON.parse(event.data.text());
        title = parsed.title || title;
        body = parsed.body || body;
      } catch {
        body = event.data.text();
      }
    } else {
      try {
        const storedJoke = await getJoke();
        if (storedJoke) {
          body = storedJoke;
        } else {
          body = 'No joke available. Try fetching one first!';
        }
      } catch (err) {
        console.log('[SW] Error retrieving joke:', err);
        body = 'Error retrieving joke. Please try again.';
      }
    }

    const options = {
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      actions: [
        { action: 'close', title: 'Close' },
        // { action: 'fetch-new', title: 'Get New Joke' },
      ],
      data: { jokeNotification: true },
    };

    return self.registration.showNotification(title, options);
  };

  event.waitUntil(showJokeNotification());
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'fetch-new') {
    event.waitUntil(
      self.registration.sync.register('fetch-joke').catch((err) => {
        console.log('[SW] Failed to register sync:', err);
      }),
    );
  }
});

self.addEventListener('message', async (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'GET_JOKE') {
    try {
      const storedJoke = await getJoke();
      const setup =
        storedJoke?.setup || 'No joke available. Try fetching one first!';

      // Send response back to the client
      event.ports[0]?.postMessage({ setup });
    } catch (err) {
      console.log('[SW] Error retrieving joke:', err);
      event.ports[0]?.postMessage({
        setup: 'Failed to retrieve joke. Please try again.',
      });
    }
  }

  if (event.data.type === 'STORE_JOKE') {
    try {
      await saveJoke(event.data.joke);
      console.log(
        '[SW] Joke stored successfully via message:',
        event.data.joke,
      );
    } catch (err) {
      console.log('[SW] Error storing joke:', err);
    }
  }

  if (event.data.type === 'SHOW_JOKE_NOTIFICATION') {
    try {
      const storedJoke = await getJoke();
      const title = 'Your Joke Answer is Ready! 😄';
      const body =
        storedJoke?.punchline || 'No joke available. Try fetching one first!';

      const options = {
        body,
        icon: '/vite.svg',
        badge: '/vite.svg',
        actions: [
          { action: 'close', title: 'Close' },
          // { action: 'fetch-new', title: 'Get New Joke' },
        ],
        data: { jokeNotification: true },
      };

      await self.registration.showNotification(title, options);
    } catch (err) {
      console.log('[SW] Error showing joke notification:', err);
      await self.registration.showNotification('Error', {
        body: 'Failed to retrieve joke. Please try again.',
        icon: '/vite.svg',
      });
    }
  }
});
