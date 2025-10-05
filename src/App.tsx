import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Jokes from './pages/Jokes';

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Jokes />
    </QueryClientProvider>
  );
}

export default App;
