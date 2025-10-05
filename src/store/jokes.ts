import { create } from 'zustand';

interface JokesState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useJokesStore = create<JokesState>((set) => ({
  isLoading: true,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
}));
