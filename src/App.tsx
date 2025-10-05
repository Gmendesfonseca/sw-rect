import './App.css';
import Jokes from './pages/Jokes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Jokes />
    </QueryClientProvider>
  );
}

export default App;
