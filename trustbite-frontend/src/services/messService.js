import api from './api';

const handleError = (err) => {
  throw new Error(
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    'Something went wrong'
  );
};

export const messService = {
  async getFeatured(limit = 6) {
    try {
      const res = await api.get('/api/messes/featured', {
        params: { limit },
      });

      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      handleError(err);
    }
  },

  async getAll(params = {}) {
    try {
      const res = await api.get('/api/messes/', { params });

      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      handleError(err);
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/api/messes/${id}`);

      if (!res.data) {
        throw new Error('Mess not found');
      }

      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  async getMenu(messId, mealType = null) {
    try {
      const params = mealType ? { meal_type: mealType } : {};

      const res = await api.get(`/api/messes/${messId}/menu`, {
        params,
      });

      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      handleError(err);
    }
  },

  async create(data) {
    try {
      const res = await api.post('/api/messes/', data);

      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  async update(id, data) {
    try {
      const res = await api.put(`/api/messes/${id}`, data);

      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  async delete(id) {
    try {
      const res = await api.delete(`/api/messes/${id}`);

      return res.data || { success: true };
    } catch (err) {
      handleError(err);
    }
  },

  async getOwnerMesses() {
    try {
      const res = await api.get('/api/messes/owner/mine');

      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      handleError(err);
    }
  },

  async addMenuItem(messId, data) {
    try {
      const res = await api.post(`/api/messes/${messId}/menu`, data);
      return res.data;
    } catch (err) { handleError(err); }
  },

  async updateMenuItem(messId, itemId, data) {
    try {
      const res = await api.put(`/api/messes/${messId}/menu/${itemId}`, data);
      return res.data;
    } catch (err) { handleError(err); }
  },

  async deleteMenuItem(messId, itemId) {
    try {
      await api.delete(`/api/messes/${messId}/menu/${itemId}`);
      return true;
    } catch (err) { handleError(err); }
  },

  async search(params = {}) {
    try {
      const res = await api.get('/api/search/', { params });
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) { handleError(err); }
  },
};