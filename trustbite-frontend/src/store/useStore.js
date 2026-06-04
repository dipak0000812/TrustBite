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
      // Step 1: Create account
      // authService.register() returns res.data which is:
      // { success: true, message: '...', data: UserOut }
      await authService.register(formData);

      // Step 2: Auto-login after successful registration
      // authService.login() returns res.data which is the full JSON body:
      // { success: true, message: '...', data: { access_token, token_type, user } }
      // So loginResponse IS the full body — access_token lives at loginResponse.data
      const loginResponse = await authService.login(formData.email, formData.password);

      const { access_token, user } = loginResponse.data;

      if (!access_token || !user) {
        throw new Error('Auto-login after registration returned an incomplete response.');
      }

      // Step 3: Persist session immediately
      localStorage.setItem('trustbite_token', access_token);
      localStorage.setItem('trustbite_user', JSON.stringify(user));

      // Step 4: Update Zustand store
      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isInitializing: false,
        authLoading: false,
      });

      return user;

    } catch (err) {
      // Extract the most useful error message available
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map(e => e.message).join(', ')
        : detail || err.response?.data?.message || err.message || 'Registration failed';

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
      // authService.updateProfile() returns res.data.
      // PUT /api/auth/profile returns UserOut directly (no success wrapper).
      const updatedUser = await authService.updateProfile(data);

      // Persist updated user to localStorage so it survives page refresh
      localStorage.setItem('trustbite_user', JSON.stringify(updatedUser));

      set({ user: updatedUser, authLoading: false });
      return updatedUser;
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map(e => e.message).join(', ')
        : detail || err.response?.data?.message || 'Update failed';
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
      // authService.getMe() returns res.data.
      // GET /api/auth/me returns UserOut directly (no success wrapper).
      const user = await authService.getMe();

      if (!user || !user.id) {
        throw new Error('Invalid user object returned from /me');
      }

      localStorage.setItem('trustbite_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isInitializing: false,
      });
    } catch {
      // Token is invalid or expired — clear everything
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