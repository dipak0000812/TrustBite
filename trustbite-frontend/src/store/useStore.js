import { create } from 'zustand';
import { authService } from '../services/authService';

const storedUser = JSON.parse(
  localStorage.getItem('trustbite_user') || 'null'
);

const storedToken =
  localStorage.getItem('trustbite_token');


const useStore = create((set, get) => ({

  // ─────────────────────────────
  // Auth State
  // ─────────────────────────────

  user: storedUser,
  token: storedToken,

  isAuthenticated: !!storedToken,
  isInitializing: true,

  authLoading: false,
  authError: null,


  // ─────────────────────────────
  // Login
  // ─────────────────────────────

  login: async (email, password) => {

    set({
      authLoading: true,
      authError: null,
    });

    try {

      const response =
        await authService.login(email, password);

      // FIXED RESPONSE PARSING
      const {
        access_token,
        user,
      } = response.data;

      localStorage.setItem(
        'trustbite_token',
        access_token
      );

      localStorage.setItem(
        'trustbite_user',
        JSON.stringify(user)
      );

      set({
        user,
        token: access_token,
        isAuthenticated: true,
        authLoading: false,
      });

      return user;

    } catch (err) {

      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Login failed';

      set({
        authLoading: false,
        authError: msg,
      });

      throw err;
    }
  },


  // ─────────────────────────────
  // Register
  // ─────────────────────────────

  register: async (formData) => {

    set({
      authLoading: true,
      authError: null,
    });

    try {
      // 1. Create account
      await authService.register(formData);

      // 2. Auto Login
      const loginResponse = await authService.login(formData.email, formData.password);
      
      const { access_token, user } = loginResponse.data;

      // 3. Persist session
      localStorage.setItem('trustbite_token', access_token);
      localStorage.setItem('trustbite_user', JSON.stringify(user));

      // 4. Update store state
      set({
        user,
        token: access_token,
        isAuthenticated: true,
        authLoading: false,
      });

      return user;
    } catch (err) {

      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Registration failed';

      set({
        authLoading: false,
        authError: msg,
      });

      throw err;
    }
  },


  // ─────────────────────────────
  // Logout
  // ─────────────────────────────

  logout: () => {

    localStorage.removeItem(
      'trustbite_token'
    );

    localStorage.removeItem(
      'trustbite_user'
    );

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      favouriteIds: [],
    });
  },


  // ─────────────────────────────
  // Set User
  // ─────────────────────────────

  setUser: (user) => {

    if (user) {
      localStorage.setItem(
        'trustbite_user',
        JSON.stringify(user)
      );
    }

    set({
      user,
      isAuthenticated: !!user,
    });
  },


  // ─────────────────────────────
  // Update Profile
  // ─────────────────────────────

  updateProfile: async (data) => {
    set({ authLoading: true, authError: null });
    try {
      const updatedUser = await authService.updateProfile(data);
      localStorage.setItem('trustbite_user', JSON.stringify(updatedUser));
      set({ user: updatedUser, authLoading: false });
      return updatedUser;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Update failed';
      set({ authLoading: false, authError: msg });
      throw err;
    }
  },


  // ─────────────────────────────
  // Clear Auth Error
  // ─────────────────────────────

  clearAuthError: () => {

    set({
      authError: null
    });
  },


  // ─────────────────────────────
  // Validate Existing Token
  // ─────────────────────────────

  checkAuth: async () => {
    const token = localStorage.getItem('trustbite_token');

    if (!token) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitializing: false,
      });
      return;
    }

    try {
      const user = await authService.getMe();

      localStorage.setItem('trustbite_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isInitializing: false,
      });
    } catch {
      localStorage.removeItem('trustbite_token');
      localStorage.removeItem('trustbite_user');

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  },


  // ─────────────────────────────
  // Favourites
  // ─────────────────────────────

  favouriteIds: [],

  setFavouriteIds: (ids) =>
    set({
      favouriteIds: ids
    }),

  addFavouriteId: (id) =>
    set((state) => ({
      favouriteIds: [
        ...state.favouriteIds,
        id,
      ]
    })),

  removeFavouriteId: (id) =>
    set((state) => ({
      favouriteIds:
        state.favouriteIds.filter(
          (fid) => fid !== id
        )
    })),



  // ─────────────────────────────
  // Filters
  // ─────────────────────────────

  filters: {
    type: 'all',
    priceRange: [0, 5000],
    rating: 0,
  },

  setFilters: (newFilters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      }
    })),
}));


export default useStore;