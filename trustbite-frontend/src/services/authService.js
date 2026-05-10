import api from './api';

export const authService = {

  // ─────────────────────────────
  // Register
  // ─────────────────────────────
  async register(data) {

    const payload = {
      full_name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,

      // Pass role directly as set in the UI (student or mess_owner)
      role: data.role,

      college_name: data.collegeName || null,
      phone: data.phone || null,
    };

    const res = await api.post(
      '/api/auth/register',
      payload
    );

    return res.data;
  },


  // ─────────────────────────────
  // Login
  // ─────────────────────────────
  async login(email, password) {

    // VIVA: OAuth2 Password Flow
    // Backend expects 'username' and 'password' in x-www-form-urlencoded format.
    // Returns a JWT access_token which is then stored in localStorage.
    const params = new URLSearchParams();

    params.append(
      'username',
      email.trim().toLowerCase()
    );

    params.append(
      'password',
      password
    );

    const res = await api.post(
      '/api/auth/login',
      params,
      {
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
        },
      }
    );

    return res.data;
  },


  // ─────────────────────────────
  // Current User
  // ─────────────────────────────
  async getMe() {

    const res = await api.get('/api/auth/me');

    return res.data;
  },


  // ─────────────────────────────
  // Admin Users
  // ─────────────────────────────
  async getUsers() {

    const res = await api.get('/api/auth/users');

    return res.data;
  },
};