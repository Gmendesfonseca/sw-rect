import JokeShow from './components/JokeShow';
import JokeActions from './components/JokeFetch';
import { useEffect } from 'react';

export default function Jokes() {
  useEffect(() => {
    Notification.requestPermission();
  }, []);

  return (
    <>
      <h1>Jokes</h1>
      <JokeShow />
      <JokeActions />
    </>
  );
}
