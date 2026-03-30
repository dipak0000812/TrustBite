import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  favourites: [],
  filters: {
    type: 'all',
    priceRange: [0, 5000],
    rating: 0,
  },
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
  
  toggleFavourite: (messId) => set((state) => ({
    favourites: state.favourites.includes(messId)
      ? state.favourites.filter(id => id !== messId)
      : [...state.favourites, messId]
  })),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
}));

export default useStore;
