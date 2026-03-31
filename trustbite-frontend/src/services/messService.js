import api from './api';

export const messService = {
  async getFeatured(limit = 6) {
    const res = await api.get('/messes/featured', { params: { limit } });
    return res.data;
  },

  async getAll(params = {}) {
    const res = await api.get('/messes/', { params });
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/messes/${id}`);
    return res.data;
  },

  async getMenu(messId, mealType = null) {
    const params = mealType ? { meal_type: mealType } : {};
    const res = await api.get(`/messes/${messId}/menu`, { params });
    return res.data;
  },

  async create(data) {
    const res = await api.post('/messes/', data);
    return res.data;
  },

  async update(id, data) {
    const res = await api.put(`/messes/${id}`, data);
    return res.data;
  },

  async delete(id) {
    await api.delete(`/messes/${id}`);
  },

  async getOwnerMesses() {
    const res = await api.get('/messes/owner/mine');
    return res.data;
  },

  async search(params = {}) {
    const res = await api.get('/search/', { params });
    return res.data;
  },
};
