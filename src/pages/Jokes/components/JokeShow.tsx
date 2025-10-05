import { useCallback, useEffect, useState } from 'react';
import { useJokesStore } from '../../../store/jokes';

function triggerGetJoke(): Promise<string> {
  return new Promise((resolve) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          if (registration.active) {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
              resolve(event.data.setup);
            };

            registration.active.postMessage(
              {
                type: 'GET_JOKE',
              },
              [messageChannel.port2],
            );
          } else {
            resolve('Service worker not active.');
          }
        })
        .catch(() => {
          resolve('Error accessing service worker.');
        });
    } else {
      resolve('Service Workers not supported in this browser.');
    }
  });
}

export default function JokeShow() {
  const [message, setMessage] = useState('Loading...');
  const { isLoading, setIsLoading } = useJokesStore();

  const handleJoke = useCallback(async () => {
    const setup = await triggerGetJoke();
    setMessage(setup);
    setIsLoading(false);
  }, [setIsLoading]);

  useEffect(() => {
    if (isLoading) return;
    handleJoke();
  }, [handleJoke, isLoading]);

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h2
        style={{
          color: 'white',
          margin: '8px 0 0 0',
          fontWeight: '500',
          width: '500px',
          textWrap: 'wrap',
        }}
      >
        {message}
      </h2>
    </div>
  );
}
