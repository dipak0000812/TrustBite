import { create } from 'zustand';
import { authService } from '../services/authService';

const useStore = create((set, get) => ({
  // ── Auth State ──────────────────────────────────────────
  user: JSON.parse(localStorage.getItem('trustbite_user') || 'null'),
  token: localStorage.getItem('trustbite_token') || null,
  isAuthenticated: !!localStorage.getItem('trustbite_token'),
  authLoading: false,
  authError: null,

  // ── Auth Actions ────────────────────────────────────────
  login: async (email, password) => {
    set({ authLoading: true, authError: null });
    try {
      const data = await authService.login(email, password);
      const { access_token, user } = data;
      localStorage.setItem('trustbite_token', access_token);
      localStorage.setItem('trustbite_user', JSON.stringify(user));
      set({ user, token: access_token, isAuthenticated: true, authLoading: false });
      return user;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed';
      set({ authLoading: false, authError: msg });
      throw err;
    }
  },

  register: async (formData) => {
    set({ authLoading: true, authError: null });
    try {
      const user = await authService.register(formData);
      set({ authLoading: false });
      return user;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed';
      set({ authLoading: false, authError: msg });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('trustbite_token');
    localStorage.removeItem('trustbite_user');
    set({ user: null, token: null, isAuthenticated: false, favouriteIds: [] });
  },

  setUser: (user) => {
    if (user) localStorage.setItem('trustbite_user', JSON.stringify(user));
    set({ user, isAuthenticated: !!user });
  },

  clearAuthError: () => set({ authError: null }),

  // ── Validate token on app mount ─────────────────────────
  checkAuth: async () => {
    const token = localStorage.getItem('trustbite_token');
    if (!token) return;
    try {
      const user = await authService.getMe();
      localStorage.setItem('trustbite_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('trustbite_token');
      localStorage.removeItem('trustbite_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  // ── Favourites State (client-side cache) ────────────────
  favouriteIds: [],
  setFavouriteIds: (ids) => set({ favouriteIds: ids }),
  addFavouriteId: (id) => set((s) => ({ favouriteIds: [...s.favouriteIds, id] })),
  removeFavouriteId: (id) => set((s) => ({ favouriteIds: s.favouriteIds.filter(fid => fid !== id) })),

  // ── Filter State ────────────────────────────────────────
  filters: { type: 'all', priceRange: [0, 5000], rating: 0 },
  setFilters: (newFilters) => set((s) => ({ filters: { ...s.filters, ...newFilters } })),
}));

export default useStore;
