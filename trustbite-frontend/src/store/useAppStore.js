import { create } from 'zustand';

const useAppStore = create((set) => ({
  searchQuery: '',
  selectedFilters: { cuisine: [], hygiene: null, priceRange: null },
  messList: [],
  isLoading: false,
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilter: (key, val) => set((s) => ({
    selectedFilters: { ...s.selectedFilters, [key]: val }
  })),
  setMessList: (list) => set({ messList: list }),
  setLoading: (v) => set({ isLoading: v }),
}));

export default useAppStore;
