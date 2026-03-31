import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', {
      full_name: data.name,
      email: data.email,
      password: data.password,
      role: data.role === 'owner' ? 'mess_owner' : 'student',
      college_name: data.collegeName || null,
      phone: data.phone || null,
    });
    return res.data;
  },

  async login(email, password) {
    // Backend uses OAuth2PasswordRequestForm (x-www-form-urlencoded)
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    const res = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.data; // { access_token, token_type, user }
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async getUsers() {
    const res = await api.get('/auth/users');
    return res.data;
  },
};
