import { useEffect, useState } from 'react';
import { useJokesStore } from '../../../store/jokes';

async function scheduleJokeFetch() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const reg = await navigator.serviceWorker.ready;
    try {
      await reg.sync.register('fetch-joke');
      return 'Joke fetch scheduled! Will be executed when back online.';
    } catch (err) {
      return 'Error scheduling joke fetch: ' + err;
    }
  } else {
    return 'Background Sync not supported in this browser.';
  }
}

async function fetchJokeDirectly() {
  try {
    const response = await fetch(
      'https://official-joke-api.appspot.com/random_joke',
    );
    const joke = await response.json();

    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg.active) {
        reg.active.postMessage({
          type: 'STORE_JOKE',
          joke: { setup: joke.setup, punchline: joke.punchline },
        });
      }
    }
    useJokesStore.getState().setIsLoading(false);

    return 'Joke fetched and stored successfully!';
  } catch (err) {
    console.error('Direct fetch failed:', err);
    return await scheduleJokeFetch();
  }
}

function triggerJokePush() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        if (registration.active) {
          registration.active.postMessage({
            type: 'SHOW_JOKE_NOTIFICATION',
          });
        }
      })
      .catch((err) => {
        alert('Error triggering push: ' + err);
      });
  } else {
    alert('Service Workers not supported in this browser.');
  }
}

export default function JokeFetch() {
  const [status, setStatus] = useState('Ready to fetch jokes');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { setIsLoading } = useJokesStore();

  const handleOnline = () => {
    setIsOnline(true);
    fetchJokeDirectly().then(setStatus);
  };

  const handleOffline = () => {
    setIsOnline(false);
    setStatus('Offline - will fetch when connection restored');
  };

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (isOnline) {
      fetchJokeDirectly().then(setStatus);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  const handleManualFetch = async () => {
    setStatus('Fetching...');
    setIsLoading(true);
    const result = isOnline
      ? await fetchJokeDirectly()
      : await scheduleJokeFetch();
    setStatus(result);
    setIsLoading(false);
  };

  return (
    <>
      <div
        className="card"
        style={{
          marginTop: 12,
          alignItems: 'center',
          gap: 12,
          justifyContent: 'space-evenly',
          display: 'flex',
        }}
      >
        <button onClick={triggerJokePush}> Show Answer</button>
        <button onClick={handleManualFetch}>
          {isOnline ? 'Fetch New Joke' : 'Schedule Fetch'}
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        <p
          style={{
            fontSize: '0.9em',
            color: isOnline ? '#22c55e' : '#ef4444',
            margin: '8px 0 0 0',
          }}
        >
          Status: {isOnline ? 'Online' : 'Offline'}
        </p>
        <p style={{ fontSize: '0.9em', color: '#666', margin: '4px 0 0 0' }}>
          {status}
        </p>
      </div>
    </>
  );
}
